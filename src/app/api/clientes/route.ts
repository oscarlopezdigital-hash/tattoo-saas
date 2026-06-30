import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Sin estudio" }, { status: 404 });

  const q = request.nextUrl.searchParams.get("q") ?? "";

  const clientes = await prisma.client.findMany({
    where: {
      studioId: dbUser.studioId,
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      _count: { select: { appointments: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clientes);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Sin estudio" }, { status: 404 });

  const body = await request.json();
  const { name, phone, email, birthDate, notes } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
  }

  const cliente = await prisma.client.upsert({
    where: { studioId_phone: { studioId: dbUser.studioId, phone } },
    create: { studioId: dbUser.studioId, name, phone, email, birthDate: birthDate ? new Date(birthDate) : null, notes },
    update: { name, email, birthDate: birthDate ? new Date(birthDate) : null, notes },
  });

  return NextResponse.json(cliente, { status: 201 });
}
