import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getStudioId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  return dbUser?.studioId ?? null;
}

export async function POST(request: NextRequest) {
  const studioId = await getStudioId();
  if (!studioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { name, color, email } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const artista = await prisma.artist.create({
    data: { studioId, name: name.trim(), color: color || "#6366f1", email: email?.trim() || null, isActive: true },
  });

  return NextResponse.json(artista);
}
