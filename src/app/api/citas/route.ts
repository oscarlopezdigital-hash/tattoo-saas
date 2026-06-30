import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const { searchParams } = request.nextUrl;
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const citas = await prisma.appointment.findMany({
    where: {
      studioId: dbUser.studioId,
      ...(desde && hasta ? {
        dateTime: { gte: new Date(desde), lte: new Date(hasta) },
      } : {}),
    },
    include: {
      client: { select: { id: true, name: true, phone: true, email: true } },
      artist: { select: { id: true, name: true, color: true } },
      deposit: { select: { status: true, amount: true } },
      consentForm: { select: { id: true, signedAt: true } },
    },
    orderBy: { dateTime: "asc" },
  });

  return NextResponse.json(citas);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const body = await request.json();
  const { clientId, artistId, dateTime, estimatedDuration, tattooDescription, estimatedPrice } = body;

  if (!clientId || !artistId || !dateTime || !estimatedDuration) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const studio = await prisma.studio.findUnique({ where: { id: dbUser.studioId } });

  const cita = await prisma.appointment.create({
    data: {
      studioId: dbUser.studioId,
      clientId,
      artistId,
      dateTime: new Date(dateTime),
      estimatedDuration: Number(estimatedDuration),
      tattooDescription,
      estimatedPrice: estimatedPrice ? Number(estimatedPrice) : null,
      deposit: {
        create: {
          amount: studio?.depositDefaultAmount ?? 5000,
          status: "PENDING",
        },
      },
    },
    include: {
      client: true,
      artist: true,
      deposit: true,
    },
  });

  return NextResponse.json(cita, { status: 201 });
}
