import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Sin estudio" }, { status: 404 });

  const body = await request.json();
  const { name, phone, address, instagram, depositDefaultAmount, consentFormTemplate, disponibilidad } = body;

  const studio = await prisma.studio.update({
    where: { id: dbUser.studioId },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(instagram !== undefined && { instagram: instagram?.trim() || null }),
      ...(depositDefaultAmount !== undefined && { depositDefaultAmount: Number(depositDefaultAmount) * 100 }),
      ...(consentFormTemplate !== undefined && { consentFormTemplate }),
    },
  });

  if (disponibilidad) {
    await prisma.availability.deleteMany({ where: { studioId: dbUser.studioId } });
    await prisma.availability.createMany({
      data: disponibilidad.map((d: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }) => ({
        studioId: dbUser.studioId,
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
        isActive: d.isActive,
      })),
    });
  }

  return NextResponse.json(studio);
}
