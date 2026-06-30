"use client";

import { useState } from "react";

type Cliente = { id: string; name: string; phone: string };
type Artista = { id: string; name: string };

export default function FormNuevaCita({
  clientes,
  artistas,
  onCreada,
  onClose,
}: {
  clientes: Cliente[];
  artistas: Artista[];
  onCreada: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    clientId: "",
    artistId: artistas[0]?.id ?? "",
    dateTime: "",
    estimatedDuration: "120",
    tattooDescription: "",
    estimatedPrice: "",
  });
  const [nuevoCliente, setNuevoCliente] = useState({ name: "", phone: "", email: "" });
  const [modoNuevoCliente, setModoNuevoCliente] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let clientId = form.clientId;

    if (modoNuevoCliente) {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoCliente),
      });
      if (!res.ok) { setError("Error creando cliente"); setSaving(false); return; }
      const cliente = await res.json();
      clientId = cliente.id;
    }

    if (!clientId) { setError("Selecciona o crea un cliente"); setSaving(false); return; }

    const res = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        clientId,
        estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) * 100 : null,
      }),
    });

    if (!res.ok) { setError("Error creando la cita"); setSaving(false); return; }
    onCreada();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nueva cita</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            {!modoNuevoCliente ? (
              <div className="space-y-2">
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecciona cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setModoNuevoCliente(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  + Crear nuevo cliente
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-3 bg-indigo-50 rounded-lg">
                <input placeholder="Nombre *" required value={nuevoCliente.name}
                  onChange={e => setNuevoCliente(n => ({ ...n, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input placeholder="Teléfono *" required value={nuevoCliente.phone}
                  onChange={e => setNuevoCliente(n => ({ ...n, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input placeholder="Email (opcional)" type="email" value={nuevoCliente.email}
                  onChange={e => setNuevoCliente(n => ({ ...n, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="button" onClick={() => setModoNuevoCliente(false)}
                  className="text-xs text-gray-500 hover:text-gray-700">
                  ← Usar cliente existente
                </button>
              </div>
            )}
          </div>

          {/* Artista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Artista</label>
            <select value={form.artistId} onChange={e => setForm(f => ({ ...f, artistId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {artistas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Fecha y hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora *</label>
            <input type="datetime-local" required value={form.dateTime}
              onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Duración y precio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
              <input type="number" min="30" step="30" value={form.estimatedDuration}
                onChange={e => setForm(f => ({ ...f, estimatedDuration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio estimado (€)</label>
              <input type="number" min="0" placeholder="0" value={form.estimatedPrice}
                onChange={e => setForm(f => ({ ...f, estimatedPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del tatuaje</label>
            <textarea rows={3} value={form.tattooDescription}
              onChange={e => setForm(f => ({ ...f, tattooDescription: e.target.value }))}
              placeholder="Describe el diseño, zona del cuerpo, estilo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {saving ? "Guardando..." : "Crear cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
