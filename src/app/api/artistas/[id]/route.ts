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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studioId = await getStudioId();
  if (!studioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const artista = await prisma.artist.findFirst({ where: { id, studioId } });
  if (!artista) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.artist.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.color !== undefined && { color: body.color }),
    },
  });

  return NextResponse.json(updated);
}
