import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import FormConfiguracion from "@/components/dashboard/FormConfiguracion";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const [studio, artistas, disponibilidad, servicios] = await Promise.all([
    prisma.studio.findUnique({ where: { id: dbUser.studioId } }),
    prisma.artist.findMany({
      where: { studioId: dbUser.studioId },
      orderBy: { name: "asc" },
    }),
    prisma.availability.findMany({
      where: { studioId: dbUser.studioId },
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.service.findMany({
      where: { studioId: dbUser.studioId },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
  ]);

  if (!studio) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
      <FormConfiguracion
        studio={JSON.parse(JSON.stringify(studio))}
        artistas={JSON.parse(JSON.stringify(artistas))}
        disponibilidad={JSON.parse(JSON.stringify(disponibilidad))}
        servicios={JSON.parse(JSON.stringify(servicios))}
        enlacePublico={`${process.env.NEXT_PUBLIC_APP_URL}/reservar/${studio.slug}`}
      />
    </div>
  );
}
