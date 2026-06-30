import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { sendWhatsApp } from "@/lib/twilio";
import { emailConfirmacion } from "../../../../../emails/confirmacion";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) return NextResponse.json({ error: "Sin firma" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { appointmentId, depositId, clientEmail, studioName, studioPhone, studioAddress,
            clienteName, artistName, tattooDescription, consentUrl, fechaHora } = session.metadata ?? {};

    if (!appointmentId || !depositId) {
      return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
    }

    // Actualizar depósito y cita
    await Promise.all([
      prisma.deposit.update({
        where: { id: depositId },
        data: { status: "PAID", stripePaymentId: session.payment_intent as string },
      }),
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED" },
      }),
    ]);

    // Enviar email de confirmación si hay email
    if (clientEmail && process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_...")) {
      const depositAmount = session.amount_total
        ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(session.amount_total / 100)
        : "";

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: clientEmail,
        subject: `Cita confirmada — ${studioName}`,
        html: emailConfirmacion({
          clienteName: clienteName ?? "",
          studioName: studioName ?? "",
          studioPhone: studioPhone ?? "",
          fechaHora: fechaHora ?? "",
          artistName: artistName ?? "",
          tattooDescription: tattooDescription ?? "",
          depositAmount,
          consentUrl: consentUrl ?? "",
        }),
      });
    }
  }

    // Enviar WhatsApp de confirmación si hay teléfono y Twilio configurado
    const clientPhone = session.metadata?.clientPhone;
    if (clientPhone && process.env.TWILIO_ACCOUNT_SID) {
      try {
        await sendWhatsApp(
          clientPhone,
          `✅ *Cita confirmada* en ${studioName}\n\n📅 ${fechaHora}\n👨‍🎨 Artista: ${artistName}\n\nFirma tu consentimiento aquí:\n${consentUrl}\n\n¿Necesitas cambiar algo? Llámanos: ${studioPhone}`
        );
      } catch { /* silencioso si Twilio no está configurado */ }
    }
  }

  return NextResponse.json({ received: true });
}

// Stripe necesita el body sin parsear
export const runtime = "nodejs";
