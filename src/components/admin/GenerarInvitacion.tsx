"use client";

import { useState } from "react";

export default function GenerarInvitacion() {
  const [enlace, setEnlace] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function generarEnlace() {
    setLoading(true);
    setEnlace(null);
    const res = await fetch("/api/admin/invitar", { method: "POST" });
    const data = await res.json();
    setEnlace(data.url);
    setLoading(false);
  }

  async function copiar() {
    if (!enlace) return;
    await navigator.clipboard.writeText(enlace);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-indigo-900">Invitar nuevo estudio</h2>
          <p className="text-xs text-indigo-600 mt-1">
            Genera un enlace de un solo uso. Compártelo con el cliente después de que pague.
            El enlace expira en cuanto se usa — no puede reutilizarse.
          </p>
        </div>
        <button
          onClick={generarEnlace}
          disabled={loading}
          className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Generando..." : "Generar enlace"}
        </button>
      </div>

      {enlace && (
        <div className="mt-4 flex items-center gap-2">
          <input
            readOnly
            value={enlace}
            className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs text-gray-700 font-mono"
          />
          <button
            onClick={copiar}
            className="shrink-0 px-3 py-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg transition-colors"
          >
            {copiado ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
      )}
    </div>
  );
}
