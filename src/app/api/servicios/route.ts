import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getStudioId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  return dbUser?.studioId ?? null;
}

export async function GET() {
  const studioId = await getStudioId();
  if (!studioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const servicios = await prisma.service.findMany({
    where: { studioId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(servicios);
}

export async function POST(request: NextRequest) {
  const studioId = await getStudioId();
  if (!studioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { name, description, duration, price, depositRequired, depositAmount } = await request.json();
  if (!name?.trim() || !duration) {
    return NextResponse.json({ error: "Nombre y duración son obligatorios" }, { status: 400 });
  }

  const toMoney = (val: unknown) =>
    val !== "" && val !== null && val !== undefined ? Math.round(parseFloat(String(val)) * 100) : null;

  const servicio = await prisma.service.create({
    data: {
      studioId,
      name: name.trim(),
      description: description?.trim() || null,
      duration: parseInt(duration),
      depositRequired: depositRequired !== undefined ? Boolean(depositRequired) : true,
      price: toMoney(price),
      depositAmount: toMoney(depositAmount),
    },
  });
  return NextResponse.json(servicio, { status: 201 });
}
