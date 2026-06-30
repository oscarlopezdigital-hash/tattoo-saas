import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import CalendarioSemanal from "@/components/dashboard/CalendarioSemanal";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const ahora = new Date();
  const lunes = new Date(ahora);
  const dia = lunes.getDay();
  lunes.setDate(lunes.getDate() - (dia === 0 ? 6 : dia - 1));
  lunes.setHours(0, 0, 0, 0);
  const domingo = new Date(lunes);
  domingo.setDate(domingo.getDate() + 7);

  const [citasSemana, clientes, artistas] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        studioId: dbUser.studioId,
        dateTime: { gte: lunes, lte: domingo },
      },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true } },
        artist: { select: { id: true, name: true, color: true } },
        deposit: { select: { status: true, amount: true } },
        consentForm: { select: { id: true, signedAt: true } },
      },
      orderBy: { dateTime: "asc" },
    }),
    prisma.client.findMany({
      where: { studioId: dbUser.studioId },
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    }),
    prisma.artist.findMany({
      where: { studioId: dbUser.studioId, isActive: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendario</h1>
      <CalendarioSemanal
        citasIniciales={JSON.parse(JSON.stringify(citasSemana))}
        clientes={clientes}
        artistas={artistas}
      />
    </div>
  );
}
