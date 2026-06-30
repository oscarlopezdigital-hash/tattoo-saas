import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { studio: true },
  });

  if (!dbUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">
          Tu cuenta aún no está vinculada a ningún estudio. Contacta con soporte.
        </p>
      </div>
    );
  }

  const hoy = new Date();
  const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const finDia = new Date(inicioDia);
  finDia.setDate(finDia.getDate() + 1);

  const iniciSemana = new Date(inicioDia);
  iniciSemana.setDate(iniciSemana.getDate() - iniciSemana.getDay() + 1);
  const finSemana = new Date(iniciSemana);
  finSemana.setDate(finSemana.getDate() + 7);

  const [citasHoy, citasSemana, depositosPendientes] = await Promise.all([
    prisma.appointment.count({
      where: {
        studioId: dbUser.studioId,
        dateTime: { gte: inicioDia, lt: finDia },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.appointment.findMany({
      where: {
        studioId: dbUser.studioId,
        dateTime: { gte: iniciSemana, lt: finSemana },
        status: { not: "CANCELLED" },
      },
      include: { client: true, artist: true, deposit: true },
      orderBy: { dateTime: "asc" },
    }),
    prisma.deposit.count({
      where: {
        appointment: { studioId: dbUser.studioId },
        status: "PENDING",
      },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Hola, {dbUser.name}
      </h1>
      <p className="text-sm text-gray-500 mb-8">{dbUser.studio.name}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Citas hoy</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{citasHoy}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Esta semana</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{citasSemana.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Depósitos pendientes</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{depositosPendientes}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Citas esta semana</h2>
        </div>
        {citasSemana.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            Sin citas esta semana
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {citasSemana.map((cita) => (
              <li key={cita.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{cita.client.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(cita.dateTime).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {cita.artist.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={cita.status} />
                  {cita.deposit?.status === "PENDING" && (
                    <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-2 py-0.5">
                      Depósito pendiente
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    PENDING:   { label: "Pendiente",   classes: "bg-gray-50 text-gray-600 border-gray-200" },
    CONFIRMED: { label: "Confirmada",  classes: "bg-green-50 text-green-700 border-green-200" },
    COMPLETED: { label: "Completada",  classes: "bg-blue-50 text-blue-700 border-blue-200" },
    CANCELLED: { label: "Cancelada",   classes: "bg-red-50 text-red-600 border-red-200" },
    NO_SHOW:   { label: "No presentó", classes: "bg-orange-50 text-orange-700 border-orange-200" },
  };
  const { label, classes } = map[status] ?? map.PENDING;
  return (
    <span className={`text-xs border rounded-full px-2 py-0.5 ${classes}`}>
      {label}
    </span>
  );
}
