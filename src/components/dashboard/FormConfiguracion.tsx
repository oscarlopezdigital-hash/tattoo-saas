"use client";

import { useState } from "react";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type Studio = {
  id: string; name: string; slug: string; email: string;
  phone: string | null; address: string | null;
  depositDefaultAmount: number; consentFormTemplate: string | null;
};
type Artista = { id: string; name: string; isActive: boolean; color: string };
type Disponibilidad = { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean };

export default function FormConfiguracion({
  studio, artistas, disponibilidad, enlacePublico,
}: {
  studio: Studio; artistas: Artista[]; disponibilidad: Disponibilidad[]; enlacePublico: string;
}) {
  const [datos, setDatos] = useState({
    name: studio.name,
    phone: studio.phone ?? "",
    address: studio.address ?? "",
    depositDefaultAmount: (studio.depositDefaultAmount / 100).toString(),
    consentFormTemplate: studio.consentFormTemplate ?? "",
  });
  const [horarios, setHorarios] = useState<Disponibilidad[]>(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const existente = disponibilidad.find(d => d.dayOfWeek === i);
      return existente ?? { dayOfWeek: i, startTime: "10:00", endTime: "20:00", isActive: false };
    });
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiado, setCopiado] = useState(false);

  function actualizarHorario(dia: number, campo: keyof Disponibilidad, valor: string | boolean) {
    setHorarios(prev => prev.map(h => h.dayOfWeek === dia ? { ...h, [campo]: valor } : h));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...datos, disponibilidad: horarios }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function copiarEnlace() {
    await navigator.clipboard.writeText(enlacePublico);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <form onSubmit={guardar} className="space-y-6 max-w-2xl">

      {/* Enlace público */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-sm font-medium text-indigo-900 mb-1">Enlace público de reserva</p>
        <p className="text-xs text-indigo-600 mb-3">Comparte este enlace con tus clientes para que reserven directamente</p>
        <div className="flex gap-2">
          <input
            readOnly value={enlacePublico}
            className="flex-1 px-3 py-2 text-sm bg-white border border-indigo-200 rounded-lg text-gray-700 select-all"
          />
          <button type="button" onClick={copiarEnlace}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg whitespace-nowrap">
            {copiado ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Datos del estudio */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Datos del estudio</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del estudio</label>
            <input value={datos.name} onChange={e => setDatos(d => ({ ...d, name: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input value={datos.phone} onChange={e => setDatos(d => ({ ...d, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depósito por defecto (€)</label>
              <input type="number" min="0" value={datos.depositDefaultAmount}
                onChange={e => setDatos(d => ({ ...d, depositDefaultAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input value={datos.address} onChange={e => setDatos(d => ({ ...d, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Horario de disponibilidad</h2>
        <div className="space-y-2">
          {horarios.map(h => (
            <div key={h.dayOfWeek} className="flex items-center gap-3">
              <input type="checkbox" id={`dia-${h.dayOfWeek}`} checked={h.isActive}
                onChange={e => actualizarHorario(h.dayOfWeek, "isActive", e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded" />
              <label htmlFor={`dia-${h.dayOfWeek}`} className="text-sm font-medium text-gray-700 w-8">
                {DIAS_SEMANA[h.dayOfWeek]}
              </label>
              <input type="time" value={h.startTime} disabled={!h.isActive}
                onChange={e => actualizarHorario(h.dayOfWeek, "startTime", e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <span className="text-gray-400 text-sm">—</span>
              <input type="time" value={h.endTime} disabled={!h.isActive}
                onChange={e => actualizarHorario(h.dayOfWeek, "endTime", e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Artistas */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Artistas</h2>
        <p className="text-xs text-gray-500 mb-4">Gestión completa de artistas disponible próximamente</p>
        <div className="space-y-2">
          {artistas.map(a => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
              <span className="text-sm text-gray-800">{a.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${a.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {a.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Consentimiento */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Plantilla de consentimiento</h2>
        <p className="text-xs text-gray-500 mb-3">Este texto aparecerá en el formulario que firma el cliente antes de su cita</p>
        <textarea rows={6} value={datos.consentFormTemplate}
          onChange={e => setDatos(d => ({ ...d, consentFormTemplate: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Escribe el texto del consentimiento informado..." />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {saved && <span className="text-sm text-green-600">Guardado correctamente</span>}
      </div>
    </form>
  );
}
