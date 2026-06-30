import { prisma } from "@/lib/prisma";
import GenerarInvitacion from "@/components/admin/GenerarInvitacion";

export default async function AdminPage() {
  const [estudios, tokensPendientes] = await Promise.all([
    prisma.studio.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        createdAt: true,
        subscriptionPlan: true,
        _count: { select: { appointments: true, clients: true } },
      },
    }),
    prisma.inviteToken.count({ where: { usedAt: null } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona todos los estudios de la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Estudios activos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{estudios.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Invitaciones pendientes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{tokensPendientes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total citas</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {estudios.reduce((sum, e) => sum + e._count.appointments, 0)}
          </p>
        </div>
      </div>

      {/* Generar invitación */}
      <GenerarInvitacion />

      {/* Lista de estudios */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Estudios registrados</h2>
        </div>
        {estudios.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            Aún no hay estudios registrados
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Estudio</th>
                <th className="px-6 py-3 text-left">URL</th>
                <th className="px-6 py-3 text-left">Citas</th>
                <th className="px-6 py-3 text-left">Clientes</th>
                <th className="px-6 py-3 text-left">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estudios.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{e.name}</p>
                    <p className="text-gray-400 text-xs">{e.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-mono">/reservar/{e.slug}</td>
                  <td className="px-6 py-4 text-gray-700">{e._count.appointments}</td>
                  <td className="px-6 py-4 text-gray-700">{e._count.clients}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(e.createdAt).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
