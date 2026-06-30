import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { sendWhatsApp } from "@/lib/twilio";
import { emailRecordatorio } from "../../../../../emails/recordatorio";
import { formatDate } from "@/lib/utils";

// Endpoint para el cron job de Vercel — ejecuta diariamente
// También acepta GET para facilitar el test manual
export async function GET(request: NextRequest) {
  // Protección mínima: cron secret
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ahora = new Date();
  const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
  const en25h = new Date(ahora.getTime() + 25 * 60 * 60 * 1000);

  // Recordatorios pendientes cuya hora programada ya pasó
  const recordatoriosPendientes = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      scheduledFor: { gte: ahora, lte: en25h },
    },
    include: {
      appointment: {
        include: {
          client: true,
          studio: true,
          artist: { select: { name: true } },
          consentForm: { select: { id: true } },
        },
      },
    },
  });

  let enviados = 0;
  let errores = 0;

  for (const recordatorio of recordatoriosPendientes) {
    const { appointment: cita } = recordatorio;
    if (!cita.client.email) {
      await prisma.reminder.update({ where: { id: recordatorio.id }, data: { status: "SENT", sentAt: new Date() } });
      continue;
    }

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: cita.client.email,
        subject: `Recordatorio: tu cita es mañana — ${cita.studio.name}`,
        html: emailRecordatorio({
          clienteName: cita.client.name,
          studioName: cita.studio.name,
          studioPhone: cita.studio.phone ?? "",
          studioAddress: cita.studio.address ?? "",
          fechaHora: formatDate(new Date(cita.dateTime)),
          artistName: cita.artist.name,
          consentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/consentimiento/${cita.publicToken}`,
          consentFirmado: !!cita.consentForm,
        }),
      });

      // WhatsApp si tiene teléfono y Twilio configurado
      if (cita.client.phone && process.env.TWILIO_ACCOUNT_SID) {
        try {
          const consentFirmado = !!cita.consentForm;
          await sendWhatsApp(
            cita.client.phone,
            `⏰ *Recordatorio de cita* — ${cita.studio.name}\n\n📅 Mañana a las ${new Date(cita.dateTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}h\n👨‍🎨 ${cita.artist.name}\n📍 ${cita.studio.address ?? ""}\n${!consentFirmado ? `\n⚠️ Recuerda firmar el consentimiento:\n${process.env.NEXT_PUBLIC_APP_URL}/consentimiento/${cita.publicToken}\n` : ""}\n¿Necesitas cambiar algo? ${cita.studio.phone ?? ""}`
          );
        } catch { /* silencioso */ }
      }

      await prisma.reminder.update({
        where: { id: recordatorio.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      enviados++;
    } catch {
      await prisma.reminder.update({
        where: { id: recordatorio.id },
        data: { status: "FAILED" },
      });
      errores++;
    }
  }

  return NextResponse.json({ enviados, errores, total: recordatoriosPendientes.length });
}
