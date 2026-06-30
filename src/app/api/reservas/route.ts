import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatDate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, dateTime, nombre, telefono, email, fechaNacimiento, descripcion } = body;

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

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

  // Crear cita con depósito pendiente
  const cita = await prisma.appointment.create({
    data: {
      studioId: studio.id,
      clientId: cliente.id,
      artistId: artist.id,
      dateTime: new Date(dateTime),
      estimatedDuration: 120,
      status: "PENDING",
      tattooDescription: descripcion || null,
      deposit: {
        create: {
          amount: studio.depositDefaultAmount,
          status: "PENDING",
        },
      },
    },
    include: { deposit: true },
  });

  // Crear recordatorio 24h antes
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

  // Crear Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: studio.depositDefaultAmount,
          product_data: {
            name: `Depósito — ${studio.name}`,
            description: `Reserva para ${formatDate(new Date(dateTime))}`,
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
      fechaHora: formatDate(new Date(dateTime)),
      clientPhone: telefono,
    },
    success_url: `${appUrl}/reservar/${slug}/confirmacion?session_id={CHECKOUT_SESSION_ID}&cita=${cita.id}`,
    cancel_url: `${appUrl}/reservar/${slug}`,
    customer_email: email || undefined,
    locale: "es",
  });

  // Guardar stripeSessionId en el depósito
  await prisma.deposit.update({
    where: { id: cita.deposit!.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
