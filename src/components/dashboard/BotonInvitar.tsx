"use client";

import { useState } from "react";

export default function BotonInvitar() {
  const [enlace, setEnlace] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function generarEnlace() {
    setLoading(true);
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
    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-indigo-900">Invitar nuevo estudio</p>
          <p className="text-xs text-indigo-600">Genera un enlace de un solo uso para un cliente que haya pagado</p>
        </div>
        <button
          onClick={generarEnlace}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Generando..." : "Generar enlace"}
        </button>
      </div>

      {enlace && (
        <div className="mt-3 flex items-center gap-2">
          <input
            readOnly
            value={enlace}
            className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs text-gray-700 font-mono"
          />
          <button
            onClick={copiar}
            className="px-3 py-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg transition-colors"
          >
            {copiado ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
      )}
    </div>
  );
}
