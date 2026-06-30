import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { formatDate } from "@/lib/utils";
import { emailConfirmacion } from "../../../../emails/confirmacion";
import { emailNotificacionArtista } from "../../../../emails/notificacionArtista";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, dateTime, nombre, telefono, email, fechaNacimiento, descripcion, serviceId } = body;

  if (!slug || !dateTime || !nombre || !telefono) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const studio = await prisma.studio.findUnique({
    where: { slug },
    include: { artists: { where: { isActive: true }, take: 1 } },
  });

  if (!studio) return NextResponse.json({ error: "Estudio no encontrado" }, { status: 404 });
  if (!studio.artists[0]) return NextResponse.json({ error: "Sin artistas disponibles" }, { status: 400 });

  const artist = studio.artists[0];

  let estimatedDuration = 120;
  let depositAmount = studio.depositDefaultAmount;
  let requiresDeposit = studio.depositRequired;
  let serviceName: string | null = null;

  if (serviceId) {
    const servicio = await prisma.service.findFirst({ where: { id: serviceId, studioId: studio.id, isActive: true } });
    if (servicio) {
      estimatedDuration = servicio.duration;
      depositAmount = servicio.depositAmount ?? studio.depositDefaultAmount;
      requiresDeposit = servicio.depositRequired;
      serviceName = servicio.name;
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const fechaHora = formatDate(new Date(dateTime));

  // Crear o actualizar cliente
  const cliente = await prisma.client.upsert({
    where: { studioId_phone: { studioId: studio.id, phone: telefono } },
    create: {
      studioId: studio.id,
      name: nombre,
      phone: telefono,
      email: email || null,
      birthDate: fechaNacimiento ? new Date(fechaNacimiento) : null,
    },
    update: {
      name: nombre,
      email: email || null,
      birthDate: fechaNacimiento ? new Date(fechaNacimiento) : null,
    },
  });

  // ─── FLUJO SIN SEÑAL ───────────────────────────────────────────────────────
  if (!requiresDeposit) {
    const cita = await prisma.appointment.create({
      data: {
        studioId: studio.id,
        clientId: cliente.id,
        artistId: artist.id,
        serviceId: serviceId || null,
        dateTime: new Date(dateTime),
        estimatedDuration,
        status: "CONFIRMED",
        tattooDescription: descripcion || null,
      },
    });

    // Recordatorio 24h antes
    const fechaRecordatorio = new Date(new Date(dateTime).getTime() - 24 * 60 * 60 * 1000);
    if (fechaRecordatorio > new Date()) {
      await prisma.reminder.create({
        data: {
          appointmentId: cita.id,
          type: "EMAIL",
          status: "PENDING",
          scheduledFor: fechaRecordatorio,
        },
      });
    }

    if (process.env.RESEND_API_KEY) {
      const citaConsentUrl = `${appUrl}/consentimiento/${cita.publicToken}`;

      // Email al cliente
      if (email) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: email,
            subject: `Cita confirmada — ${studio.name}`,
            html: emailConfirmacion({
              clienteName: nombre,
              studioName: studio.name,
              studioPhone: studio.phone ?? "",
              fechaHora,
              artistName: artist.name,
              tattooDescription: descripcion ?? "",
              depositAmount: "Sin señal",
              consentUrl: citaConsentUrl,
            }),
          });
        } catch { /* silencioso */ }
      }

      // Email al artista
      if (artist.email) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: artist.email,
            subject: `Nueva cita — ${nombre} · ${fechaHora}`,
            html: emailNotificacionArtista({
              artistName: artist.name,
              clienteName: nombre,
              clientePhone: telefono,
              studioName: studio.name,
              fechaHora,
              tattooDescription: descripcion ?? "",
              depositAmount: "Sin señal",
            }),
          });
        } catch { /* silencioso */ }
      }
    }

    return NextResponse.json({ confirmed: true, appointmentId: cita.id });
  }

  // ─── FLUJO CON SEÑAL (Stripe) ─────────────────────────────────────────────
  const cita = await prisma.appointment.create({
    data: {
      studioId: studio.id,
      clientId: cliente.id,
      artistId: artist.id,
      serviceId: serviceId || null,
      dateTime: new Date(dateTime),
      estimatedDuration,
      status: "PENDING",
      tattooDescription: descripcion || null,
      deposit: {
        create: {
          amount: depositAmount,
          status: "PENDING",
        },
      },
    },
    include: { deposit: true },
  });

  // Recordatorio 24h antes
  const fechaRecordatorio = new Date(new Date(dateTime).getTime() - 24 * 60 * 60 * 1000);
  if (fechaRecordatorio > new Date()) {
    await prisma.reminder.create({
      data: {
        appointmentId: cita.id,
        type: "EMAIL",
        status: "PENDING",
        scheduledFor: fechaRecordatorio,
      },
    });
  }

  const productName = serviceName
    ? `${serviceName} — ${studio.name}`
    : `Depósito — ${studio.name}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: depositAmount,
          product_data: {
            name: productName,
            description: `Reserva para ${fechaHora}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: cita.id,
      depositId: cita.deposit!.id,
      clientEmail: email || "",
      studioName: studio.name,
      studioPhone: studio.phone || "",
      studioAddress: studio.address || "",
      clienteName: nombre,
      artistName: artist.name,
      artistEmail: artist.email || "",
      tattooDescription: descripcion || "",
      consentUrl: `${appUrl}/consentimiento/${cita.publicToken}`,
      fechaHora,
      clientPhone: telefono,
    },
    success_url: `${appUrl}/reservar/${slug}/confirmacion?session_id={CHECKOUT_SESSION_ID}&cita=${cita.id}`,
    cancel_url: `${appUrl}/reservar/${slug}`,
    customer_email: email || undefined,
    locale: "es",
  });

  await prisma.deposit.update({
    where: { id: cita.deposit!.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
