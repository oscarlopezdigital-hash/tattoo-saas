import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

const ESTADO_LABEL: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmada",
  COMPLETED: "Completada", CANCELLED: "Cancelada", NO_SHOW: "No se presentó",
};
const ESTADO_COLOR: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600", CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700", CANCELLED: "bg-red-100 text-red-600",
  NO_SHOW: "bg-orange-100 text-orange-700",
};

export default async function FichaClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const cliente = await prisma.client.findFirst({
    where: { id, studioId: dbUser.studioId },
    include: {
      appointments: {
        include: {
          artist: { select: { name: true } },
          deposit: { select: { status: true, amount: true } },
          consentForm: { select: { id: true, signedAt: true } },
        },
        orderBy: { dateTime: "desc" },
      },
    },
  });

  if (!cliente) notFound();

  const edad = cliente.birthDate
    ? Math.floor((Date.now() - new Date(cliente.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const totalDepositosPagados = cliente.appointments
    .filter(a => a.deposit?.status === "PAID")
    .reduce((sum, a) => sum + (a.deposit?.amount ?? 0), 0);

  return (
    <div>
      <div className="mb-6">
        <Link href="/clientes" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← Volver a clientes
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Ficha */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold mb-3">
                {cliente.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{cliente.name}</h1>
              {edad && <p className="text-sm text-gray-500">{edad} años</p>}
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Teléfono</p>
                <p className="text-gray-800 font-medium">{cliente.phone}</p>
              </div>
              {cliente.email && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-gray-800">{cliente.email}</p>
                </div>
              )}
              {cliente.birthDate && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha de nacimiento</p>
                  <p className="text-gray-800">
                    {new Date(cliente.birthDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total citas</span>
                <span className="font-medium">{cliente.appointments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completadas</span>
                <span className="font-medium text-blue-600">
                  {cliente.appointments.filter(a => a.status === "COMPLETED").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Depósitos cobrados</span>
                <span className="font-medium text-green-600">{formatPrice(totalDepositosPagados)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {cliente.notes && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Notas</p>
              <p className="text-sm text-amber-900">{cliente.notes}</p>
            </div>
          )}
        </div>

        {/* Historial de citas */}
        <div className="col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de citas</h2>
          {cliente.appointments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
              Sin citas registradas
            </div>
          ) : (
            <div className="space-y-3">
              {cliente.appointments.map(cita => (
                <div key={cita.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(cita.dateTime).toLocaleDateString("es-ES", {
                          weekday: "long", day: "numeric", month: "long", year: "numeric"
                        })}
                        {" · "}
                        {new Date(cita.dateTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{cita.artist.name} · {cita.estimatedDuration} min</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADO_COLOR[cita.status]}`}>
                      {ESTADO_LABEL[cita.status]}
                    </span>
                  </div>

                  {cita.tattooDescription && (
                    <p className="text-sm text-gray-600 mb-2">{cita.tattooDescription}</p>
                  )}

                  <div className="flex gap-4 text-xs text-gray-500">
                    {cita.deposit && (
                      <span className={cita.deposit.status === "PAID" ? "text-green-600" : "text-yellow-600"}>
                        Depósito: {formatPrice(cita.deposit.amount)} ({cita.deposit.status === "PAID" ? "pagado" : "pendiente"})
                      </span>
                    )}
                    {cita.consentForm && (
                      <span className="text-blue-600">Consentimiento firmado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
