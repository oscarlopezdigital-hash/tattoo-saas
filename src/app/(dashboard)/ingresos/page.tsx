import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default async function IngresosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const depositos = await prisma.deposit.findMany({
    where: {
      status: "PAID",
      appointment: { studioId: dbUser.studioId },
    },
    include: {
      appointment: {
        include: {
          client: { select: { name: true, phone: true } },
          artist: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalCobrado = depositos.reduce((sum, d) => sum + d.amount, 0);

  // Agrupar por mes
  const porMes: Record<string, number> = {};
  for (const d of depositos) {
    const mes = new Date(d.updatedAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    porMes[mes] = (porMes[mes] ?? 0) + d.amount;
  }

  const fmt = (cents: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ingresos</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total cobrado</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{fmt(totalCobrado)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Depósitos cobrados</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{depositos.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Media por depósito</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {depositos.length ? fmt(Math.round(totalCobrado / depositos.length)) : "—"}
          </p>
        </div>
      </div>

      {/* Por mes */}
      {Object.keys(porMes).length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Por mes</h2>
          <div className="space-y-2">
            {Object.entries(porMes).map(([mes, total]) => (
              <div key={mes} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600 capitalize">{mes}</span>
                <span className="text-sm font-medium text-gray-900">{fmt(total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de depósitos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Historial de cobros</h2>
        </div>
        {depositos.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            Aún no hay depósitos cobrados
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-6 py-3 text-left">Artista</th>
                <th className="px-6 py-3 text-left">Cita</th>
                <th className="px-6 py-3 text-left">Fecha cobro</th>
                <th className="px-6 py-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {depositos.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{d.appointment.client.name}</p>
                    <p className="text-xs text-gray-400">{d.appointment.client.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.appointment.artist.name}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(new Date(d.appointment.dateTime))}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(d.updatedAt).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-green-700">{fmt(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
