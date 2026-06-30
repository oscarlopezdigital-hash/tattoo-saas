import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import BuscadorClientes from "@/components/dashboard/BuscadorClientes";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const { q } = await searchParams;

  const clientes = await prisma.client.findMany({
    where: {
      studioId: dbUser.studioId,
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      _count: { select: { appointments: true } },
      appointments: {
        orderBy: { dateTime: "desc" },
        take: 1,
        select: { dateTime: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <span className="text-sm text-gray-500">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}</span>
      </div>

      <BuscadorClientes valorInicial={q ?? ""} />

      <div className="mt-4 bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {clientes.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            {q ? `Sin resultados para "${q}"` : "Aún no hay clientes"}
          </div>
        ) : (
          clientes.map(cliente => (
            <Link
              key={cliente.id}
              href={`/clientes/${cliente.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{cliente.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cliente.phone}
                  {cliente.email && <> · {cliente.email}</>}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {cliente._count.appointments} cita{cliente._count.appointments !== 1 ? "s" : ""}
                </p>
                {cliente.appointments[0] && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Última: {new Date(cliente.appointments[0].dateTime).toLocaleDateString("es-ES", {
                      day: "numeric", month: "short"
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
