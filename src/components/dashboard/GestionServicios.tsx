"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

type Servicio = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  depositRequired: boolean;
  depositAmount: number | null;
  isActive: boolean;
};

function formatDuration(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

type EditForm = {
  name: string; description: string; duration: string;
  depositRequired: boolean; price: string; depositAmount: string;
};

function servicioToForm(s: Servicio): EditForm {
  return {
    name: s.name,
    description: s.description ?? "",
    duration: String(s.duration),
    depositRequired: s.depositRequired,
    price: s.price !== null ? (s.price / 100).toFixed(2) : "",
    depositAmount: s.depositAmount !== null ? (s.depositAmount / 100).toFixed(2) : "",
  };
}

const emptyForm: EditForm = { name: "", description: "", duration: "", depositRequired: true, price: "", depositAmount: "" };

export default function GestionServicios({ serviciosIniciales }: { serviciosIniciales: Servicio[] }) {
  const [servicios, setServicios] = useState<Servicio[]>(serviciosIniciales);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoForm, setNuevoForm] = useState<EditForm>(emptyForm);
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyForm);
  const [guardando, setGuardando] = useState(false);

  async function crearServicio() {
    if (!nuevoForm.name.trim() || !nuevoForm.duration) return;
    setCreando(true);
    const res = await fetch("/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoForm),
    });
    if (res.ok) {
      const s: Servicio = await res.json();
      setServicios(prev => [s, ...prev]);
      setNuevoForm(emptyForm);
      setMostrarForm(false);
    }
    setCreando(false);
  }

  function iniciarEdicion(s: Servicio) {
    setEditandoId(s.id);
    setEditForm(servicioToForm(s));
  }

  async function guardarEdicion(id: string) {
    setGuardando(true);
    const res = await fetch(`/api/servicios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated: Servicio = await res.json();
      setServicios(prev => prev.map(s => s.id === id ? updated : s));
      setEditandoId(null);
    }
    setGuardando(false);
  }

  async function toggleActivo(s: Servicio) {
    const res = await fetch(`/api/servicios/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    if (res.ok) {
      const updated: Servicio = await res.json();
      setServicios(prev => prev.map(x => x.id === s.id ? updated : x));
    }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este servicio?")) return;
    const res = await fetch(`/api/servicios/${id}`, { method: "DELETE" });
    if (res.ok) setServicios(prev => prev.filter(s => s.id !== id));
  }

  const activos = servicios.filter(s => s.isActive);
  const inactivos = servicios.filter(s => !s.isActive);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Servicios</h2>
          <p className="text-xs text-gray-500 mt-0.5">Los clientes elegirán el servicio al reservar online</p>
        </div>
        <button type="button" onClick={() => { setMostrarForm(v => !v); setNuevoForm(emptyForm); }}
          className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
          {mostrarForm ? "Cancelar" : "+ Añadir"}
        </button>
      </div>

      {/* Formulario añadir */}
      {mostrarForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del servicio *</label>
              <input value={nuevoForm.name}
                onChange={e => setNuevoForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Corte de pelo, Tatuaje sesión, Color..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duración (minutos) *</label>
              <input type="number" min="15" step="15" value={nuevoForm.duration}
                onChange={e => setNuevoForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Precio desde (€, opcional)</label>
              <input type="number" min="0" step="0.01" value={nuevoForm.price}
                onChange={e => setNuevoForm(f => ({ ...f, price: e.target.value }))}
                placeholder="30.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción (opcional)</label>
              <input value={nuevoForm.description}
                onChange={e => setNuevoForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Breve descripción del servicio"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* Sección señal */}
            <div className="col-span-2 border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">Requerir señal para reservar</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {nuevoForm.depositRequired
                      ? "El cliente paga la señal antes de confirmar la cita"
                      : "El cliente reserva gratis, sin pago previo"}
                  </p>
                </div>
                <button type="button"
                  onClick={() => setNuevoForm(f => ({ ...f, depositRequired: !f.depositRequired, depositAmount: "" }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${nuevoForm.depositRequired ? "bg-indigo-600" : "bg-gray-200"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${nuevoForm.depositRequired ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              {nuevoForm.depositRequired && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Importe de señal (€, vacío = señal por defecto del estudio)</label>
                  <input type="number" min="0" step="0.01" value={nuevoForm.depositAmount}
                    onChange={e => setNuevoForm(f => ({ ...f, depositAmount: e.target.value }))}
                    placeholder="Vacío = señal por defecto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
            </div>
          </div>

          <button type="button" onClick={crearServicio} disabled={creando || !nuevoForm.name.trim() || !nuevoForm.duration}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
            {creando ? "Guardando..." : "Guardar servicio"}
          </button>
        </div>
      )}

      {/* Lista de servicios */}
      {servicios.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          Sin servicios aún. Añade el primero para que aparezca en tu página de reserva.
        </p>
      ) : (
        <div className="space-y-2">
          {[...activos, ...inactivos].map(s => (
            <div key={s.id} className={`rounded-lg border p-3 ${s.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}>
              {editandoId === s.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Nombre del servicio"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <input type="number" min="15" step="15" value={editForm.duration}
                      onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))}
                      placeholder="Duración (min)"
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" min="0" step="0.01" value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="Precio desde (€)"
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <div className="col-span-2 flex items-center justify-between py-1 border-t border-gray-100">
                      <span className="text-xs text-gray-600 font-medium">
                        {editForm.depositRequired ? "Requiere señal" : "Sin señal — reserva gratuita"}
                      </span>
                      <button type="button"
                        onClick={() => setEditForm(f => ({ ...f, depositRequired: !f.depositRequired, depositAmount: "" }))}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${editForm.depositRequired ? "bg-indigo-600" : "bg-gray-200"}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${editForm.depositRequired ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    {editForm.depositRequired && (
                      <input type="number" min="0" step="0.01" value={editForm.depositAmount}
                        onChange={e => setEditForm(f => ({ ...f, depositAmount: e.target.value }))}
                        placeholder="Señal (vacío=defecto estudio)"
                        className="col-span-2 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => guardarEdicion(s.id)} disabled={guardando}
                      className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg">
                      {guardando ? "..." : "Guardar"}
                    </button>
                    <button type="button" onClick={() => setEditandoId(null)}
                      className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 truncate">{s.name}</span>
                      <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {formatDuration(s.duration)}
                      </span>
                      {s.depositRequired ? (
                        <span className="shrink-0 text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Señal: {s.depositAmount !== null ? formatPrice(s.depositAmount) : "por defecto"}
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          Sin señal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      {s.price !== null && <span>Desde {formatPrice(s.price)}</span>}
                      {s.description && <span className="truncate">{s.description}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => toggleActivo(s)}
                      className={`text-xs px-2 py-1 rounded-lg border ${s.isActive
                        ? "border-green-200 text-green-600 hover:bg-green-50"
                        : "border-gray-200 text-gray-400 hover:bg-gray-100"}`}>
                      {s.isActive ? "Activo" : "Inactivo"}
                    </button>
                    <button type="button" onClick={() => iniciarEdicion(s)}
                      className="text-xs px-2 py-1 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg">
                      Editar
                    </button>
                    <button type="button" onClick={() => eliminar(s.id)}
                      className="text-xs px-2 py-1 border border-red-200 text-red-400 hover:bg-red-50 rounded-lg">
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
