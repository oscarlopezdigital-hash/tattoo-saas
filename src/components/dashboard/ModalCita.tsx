"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

type Deposit = { status: string; amount: number } | null;
type ConsentForm = { id: string; signedAt: string } | null;
type Cita = {
  id: string;
  dateTime: string;
  estimatedDuration: number;
  status: string;
  tattooDescription: string | null;
  estimatedPrice: number | null;
  client: { id: string; name: string; phone: string; email: string | null };
  artist: { name: string; color: string };
  deposit: Deposit;
  consentForm: ConsentForm;
};

const ESTADOS: Record<string, { label: string; bg: string; text: string }> = {
  PENDING:   { label: "Pendiente",    bg: "bg-gray-100",   text: "text-gray-700" },
  CONFIRMED: { label: "Confirmada",   bg: "bg-green-100",  text: "text-green-700" },
  COMPLETED: { label: "Completada",   bg: "bg-blue-100",   text: "text-blue-700" },
  CANCELLED: { label: "Cancelada",    bg: "bg-red-100",    text: "text-red-600" },
  NO_SHOW:   { label: "No se presentó", bg: "bg-orange-100", text: "text-orange-700" },
};

const DEPOSITO_ESTADO: Record<string, { label: string; color: string }> = {
  PENDING:  { label: "Pendiente de cobro", color: "text-yellow-600" },
  PAID:     { label: "Pagado",             color: "text-green-600" },
  REFUNDED: { label: "Reembolsado",        color: "text-gray-500" },
};

export default function ModalCita({
  cita,
  onClose,
  onStatusChange,
}: {
  cita: Cita;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const estado = ESTADOS[cita.status] ?? ESTADOS.PENDING;
  const fechaHora = new Date(cita.dateTime);

  async function cambiarEstado(nuevoEstado: string) {
    setSaving(true);
    await fetch(`/api/citas/${cita.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nuevoEstado }),
    });
    onStatusChange(cita.id, nuevoEstado);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{cita.client.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {fechaHora.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              {" · "}
              {fechaHora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              {" · "}
              {cita.estimatedDuration} min
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Estado actual + selector */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Estado</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ESTADOS).map(([key, val]) => (
                <button
                  key={key}
                  disabled={saving || cita.status === key}
                  onClick={() => cambiarEstado(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    cita.status === key
                      ? `${val.bg} ${val.text} border-transparent ring-2 ring-indigo-400`
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  } disabled:opacity-50`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Artista */}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cita.artist.color }}
            />
            <span className="text-sm text-gray-700">{cita.artist.name}</span>
          </div>

          {/* Descripción */}
          {cita.tattooDescription && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-gray-700">{cita.tattooDescription}</p>
            </div>
          )}

          {/* Precio y depósito */}
          <div className="grid grid-cols-2 gap-4">
            {cita.estimatedPrice && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Precio estimado</p>
                <p className="text-sm font-semibold text-gray-900">{formatPrice(cita.estimatedPrice)}</p>
              </div>
            )}
            {cita.deposit && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Depósito</p>
                <p className={`text-sm font-semibold ${DEPOSITO_ESTADO[cita.deposit.status]?.color}`}>
                  {formatPrice(cita.deposit.amount)} — {DEPOSITO_ESTADO[cita.deposit.status]?.label}
                </p>
              </div>
            )}
          </div>

          {/* Contacto */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contacto</p>
            <p className="text-sm text-gray-700">{cita.client.phone}</p>
            {cita.client.email && <p className="text-sm text-gray-500">{cita.client.email}</p>}
          </div>

          {/* Consentimiento */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Consentimiento</p>
            {cita.consentForm ? (
              <p className="text-sm text-green-600">
                Firmado el {new Date(cita.consentForm.signedAt).toLocaleDateString("es-ES")}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Sin firmar</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
