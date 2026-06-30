import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cita?: string; session_id?: string }>;
}) {
  const { cita: citaId } = await searchParams;
  const { slug } = await params;

  const studio = await prisma.studio.findUnique({ where: { slug } });

  const cita = citaId
    ? await prisma.appointment.findUnique({
        where: { id: citaId },
        include: {
          client: true,
          artist: { select: { name: true } },
          deposit: true,
        },
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-green-500 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-white">¡Cita confirmada!</h1>
          <p className="text-green-100 mt-1 text-sm">Tu depósito ha sido procesado correctamente</p>
        </div>

        <div className="p-6 space-y-4">
          {cita ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estudio</span>
                  <span className="font-medium text-gray-900">{studio?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fecha y hora</span>
                  <span className="font-medium text-gray-900 text-right">
                    {formatDate(new Date(cita.dateTime))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Artista</span>
                  <span className="font-medium text-gray-900">{cita.artist.name}</span>
                </div>
                {cita.deposit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Depósito pagado</span>
                    <span className="font-medium text-green-600">{formatPrice(cita.deposit.amount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Antes de tu cita necesitas firmar el formulario de consentimiento informado:
                </p>
                <Link href={`/consentimiento/${cita.publicToken}`}
                  className="block w-full py-3 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm">
                  Firmar formulario de consentimiento →
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              Tu reserva ha sido registrada. Recibirás un email de confirmación.
            </p>
          )}

          <p className="text-xs text-gray-400 text-center pt-2">
            ¿Necesitas cambiar tu cita? Contacta con {studio?.name ?? "el estudio"}
            {studio?.phone && <> en <strong>{studio.phone}</strong></>}.
          </p>
        </div>
      </div>
    </div>
  );
}
