import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const cita = await prisma.appointment.findUnique({
    where: { publicToken: token },
    include: {
      client: { select: { name: true, email: true } },
      studio: { select: { name: true, consentFormTemplate: true } },
      consentForm: true,
    },
  });

  if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

  return NextResponse.json({
    clienteName: cita.client.name,
    studioName: cita.studio.name,
    consentFormTemplate: cita.studio.consentFormTemplate,
    dateTime: cita.dateTime,
    yaFirmado: !!cita.consentForm,
    signedAt: cita.consentForm?.signedAt ?? null,
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await request.json();
  const { signerName } = body;

  if (!signerName) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const cita = await prisma.appointment.findUnique({
    where: { publicToken: token },
    include: { studio: true, consentForm: true },
  });

  if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  if (cita.consentForm) return NextResponse.json({ error: "Ya firmado" }, { status: 409 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? null;

  const consentForm = await prisma.consentForm.create({
    data: {
      clientId: cita.clientId,
      appointmentId: cita.id,
      signedContent: cita.studio.consentFormTemplate ?? "",
      signedAt: new Date(),
      signerName,
      signatureIp: ip,
    },
  });

  return NextResponse.json(consentForm, { status: 201 });
}
