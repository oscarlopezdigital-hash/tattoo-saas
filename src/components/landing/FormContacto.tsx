"use client";

import { useState } from "react";

export default function FormContacto() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEstado("loading");
    const res = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEstado(res.ok ? "ok" : "error");
  }

  if (estado === "ok") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <p className="text-2xl">✅</p>
        <p className="mt-3 font-semibold text-gray-900">¡Mensaje recibido!</p>
        <p className="mt-1 text-sm text-gray-500">Te contactamos en menos de 24 horas.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      {estado === "error" && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          Error al enviar. Escríbenos directamente a{" "}
          <a href="mailto:oscarlopez.digital@gmail.com" className="underline">
            oscarlopez.digital@gmail.com
          </a>.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder="Tu nombre o el del estudio"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input type="tel" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
            placeholder="612 345 678"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="tu@estudio.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuéntanos sobre tu estudio</label>
          <textarea rows={3} value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
            placeholder="Ciudad, número de artistas, cuántas citas gestionas al mes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <button type="submit" disabled={estado === "loading"}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
        {estado === "loading" ? "Enviando..." : "Solicitar acceso →"}
      </button>
      <p className="text-xs text-center text-gray-400">
        Te respondemos en menos de 24 horas. Sin compromiso.
      </p>
    </form>
  );
}
