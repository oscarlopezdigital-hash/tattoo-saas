import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Sin estudio" }, { status: 404 });

  const cliente = await prisma.client.findFirst({
    where: { id, studioId: dbUser.studioId },
    include: {
      appointments: {
        include: {
          artist: { select: { name: true } },
          deposit: { select: { status: true, amount: true } },
          consentForm: { select: { id: true, signedAt: true } },
        },
        orderBy: { dateTime: "desc" },
      },
    },
  });

  if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Sin estudio" }, { status: 404 });

  const body = await request.json();
  const { name, phone, email, birthDate, notes } = body;

  const cliente = await prisma.client.updateMany({
    where: { id, studioId: dbUser.studioId },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(email !== undefined && { email }),
      ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(cliente);
}
