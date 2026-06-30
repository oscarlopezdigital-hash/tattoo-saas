import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getStudioId(userId: string) {
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  return dbUser?.studioId ?? null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const studioId = await getStudioId(user.id);
  if (!studioId) return NextResponse.json({ error: "Sin estudio" }, { status: 404 });

  const cita = await prisma.appointment.findFirst({
    where: { id, studioId },
    include: {
      client: true,
      artist: true,
      deposit: true,
      consentForm: true,
      reminders: true,
    },
  });

  if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  return NextResponse.json(cita);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const studioId = await getStudioId(user.id);
  if (!studioId) return NextResponse.json({ error: "Sin estudio" }, { status: 404 });

  const body = await request.json();
  const { status, tattooDescription, estimatedPrice, estimatedDuration, dateTime } = body;

  const cita = await prisma.appointment.updateMany({
    where: { id, studioId },
    data: {
      ...(status && { status }),
      ...(tattooDescription !== undefined && { tattooDescription }),
      ...(estimatedPrice !== undefined && { estimatedPrice: Number(estimatedPrice) }),
      ...(estimatedDuration && { estimatedDuration: Number(estimatedDuration) }),
      ...(dateTime && { dateTime: new Date(dateTime) }),
    },
  });

  return NextResponse.json(cita);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const studioId = await getStudioId(user.id);
  if (!studioId) return NextResponse.json({ error: "Sin estudio" }, { status: 404 });

  await prisma.appointment.updateMany({
    where: { id, studioId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
