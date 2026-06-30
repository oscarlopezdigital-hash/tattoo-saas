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
        diasDisponibles: studio.availability.map(a => a.dayOfWeek),
      }}
    />
  );
}
