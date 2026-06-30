import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const fecha = searchParams.get("fecha"); // "2026-07-01"

  if (!slug || !fecha) {
    return NextResponse.json({ error: "slug y fecha son obligatorios" }, { status: 400 });
  }

  const studio = await prisma.studio.findUnique({ where: { slug } });
  if (!studio) return NextResponse.json({ error: "Estudio no encontrado" }, { status: 404 });

  const dia = new Date(fecha + "T00:00:00");
  const diaSemana = dia.getDay(); // 0=dom … 6=sáb

  const disponibilidad = await prisma.availability.findFirst({
    where: { studioId: studio.id, dayOfWeek: diaSemana, isActive: true },
  });

  if (!disponibilidad) return NextResponse.json({ slots: [] });

  // Citas existentes ese día
  const inicioDia = new Date(fecha + "T00:00:00");
  const finDia = new Date(fecha + "T23:59:59");

  const citasExistentes = await prisma.appointment.findMany({
    where: {
      studioId: studio.id,
      dateTime: { gte: inicioDia, lte: finDia },
      status: { notIn: ["CANCELLED"] },
    },
    select: { dateTime: true, estimatedDuration: true },
  });

  // Generar slots cada 60 min dentro del horario disponible
  const [hIni, mIni] = disponibilidad.startTime.split(":").map(Number);
  const [hFin, mFin] = disponibilidad.endTime.split(":").map(Number);
  const inicioMin = hIni * 60 + mIni;
  const finMin = hFin * 60 + mFin;

  const slots: string[] = [];
  const ahora = new Date();

  for (let min = inicioMin; min < finMin - 60; min += 60) {
    const h = Math.floor(min / 60).toString().padStart(2, "0");
    const m = (min % 60).toString().padStart(2, "0");
    const slotDateTime = new Date(`${fecha}T${h}:${m}:00`);

    // Descartar slots pasados
    if (slotDateTime <= ahora) continue;

    // Descartar slots ocupados (solapamiento simple)
    const ocupado = citasExistentes.some(c => {
      const citaIni = new Date(c.dateTime).getTime();
      const citaFin = citaIni + c.estimatedDuration * 60 * 1000;
      const slotIni = slotDateTime.getTime();
      const slotFin = slotIni + 120 * 60 * 1000; // duración estimada reserva 2h
      return slotIni < citaFin && slotFin > citaIni;
    });

    if (!ocupado) slots.push(`${h}:${m}`);
  }

  return NextResponse.json({ slots, startTime: disponibilidad.startTime, endTime: disponibilidad.endTime });
}
