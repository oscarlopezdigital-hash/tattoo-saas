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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studioId = await getStudioId();
  if (!studioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const servicio = await prisma.service.findFirst({ where: { id, studioId } });
  if (!servicio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await request.json();

  const toMoney = (val: unknown) => {
    if (val === "" || val === null || val === undefined) return null;
    return Math.round(parseFloat(String(val)) * 100);
  };

  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.duration !== undefined && { duration: parseInt(body.duration) }),
      ...(body.depositRequired !== undefined && { depositRequired: Boolean(body.depositRequired) }),
      ...(body.price !== undefined && { price: toMoney(body.price) }),
      ...(body.depositAmount !== undefined && { depositAmount: toMoney(body.depositAmount) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studioId = await getStudioId();
  if (!studioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const servicio = await prisma.service.findFirst({ where: { id, studioId } });
  if (!servicio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
