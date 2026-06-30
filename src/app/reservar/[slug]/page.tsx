import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaginaReserva from "@/components/reserva/PaginaReserva";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const studio = await prisma.studio.findUnique({ where: { slug } });
  return { title: studio ? `Reservar cita — ${studio.name}` : "Estudio no encontrado" };
}

export default async function ReservarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const studio = await prisma.studio.findUnique({
    where: { slug },
    include: {
      availability: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } },
      artists: { where: { isActive: true }, take: 1 },
      services: { where: { isActive: true }, orderBy: { name: "asc" } },
    },
  });

  if (!studio) notFound();

  return (
    <PaginaReserva
      studio={{
        slug: studio.slug,
        name: studio.name,
        phone: studio.phone ?? "",
        address: studio.address ?? "",
        depositDefaultAmount: studio.depositDefaultAmount,
        depositRequired: studio.depositRequired,
        instagram: studio.instagram ?? "",
        diasDisponibles: studio.availability.map(a => a.dayOfWeek),
      }}
      servicios={studio.services.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
        depositRequired: s.depositRequired,
        depositAmount: s.depositAmount,
      }))}
    />
  );
}
