"use client";

import { useState } from "react";

const COLORES = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#8b5cf6","#14b8a6"];

type Artista = { id: string; name: string; isActive: boolean; color: string };

export default function GestionArtistas({ artistas: inicial }: { artistas: Artista[] }) {
  const [artistas, setArtistas] = useState(inicial);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [nuevo, setNuevo] = useState({ nombre: "", color: "#6366f1" });
  const [añadiendo, setAñadiendo] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleActivo(artista: Artista) {
    setLoading(artista.id);
    const res = await fetch(`/api/artistas/${artista.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !artista.isActive }),
    });
    const updated = await res.json();
    setArtistas(prev => prev.map(a => a.id === artista.id ? updated : a));
    setLoading(null);
  }

  async function guardarNombre(id: string) {
    if (!editNombre.trim()) return;
    setLoading(id);
    const res = await fetch(`/api/artistas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editNombre }),
    });
    const updated = await res.json();
    setArtistas(prev => prev.map(a => a.id === id ? updated : a));
    setEditandoId(null);
    setLoading(null);
  }

  async function añadirArtista() {
    if (!nuevo.nombre.trim()) return;
    setLoading("nuevo");
    const res = await fetch("/api/artistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nuevo.nombre, color: nuevo.color }),
    });
    const artista = await res.json();
    setArtistas(prev => [...prev, artista]);
    setNuevo({ nombre: "", color: "#6366f1" });
    setAñadiendo(false);
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Artistas</h2>
        <button
          type="button"
          onClick={() => setAñadiendo(true)}
          className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          + Añadir artista
        </button>
      </div>

      <div className="space-y-2">
        {artistas.map(a => (
          <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.color }} />

            {editandoId === a.id ? (
              <input
                autoFocus
                value={editNombre}
                onChange={e => setEditNombre(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") guardarNombre(a.id); if (e.key === "Escape") setEditandoId(null); }}
                className="flex-1 px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <span className={`flex-1 text-sm ${a.isActive ? "text-gray-800" : "text-gray-400 line-through"}`}>
                {a.name}
              </span>
            )}

            <div className="flex items-center gap-2 shrink-0">
              {editandoId === a.id ? (
                <>
                  <button type="button" onClick={() => guardarNombre(a.id)} disabled={loading === a.id}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Guardar</button>
                  <button type="button" onClick={() => setEditandoId(null)}
                    className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                </>
              ) : (
                <>
                  <button type="button"
                    onClick={() => { setEditandoId(a.id); setEditNombre(a.name); }}
                    className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">Editar</button>
                  <button type="button" onClick={() => toggleActivo(a)} disabled={loading === a.id}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      a.isActive ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                                 : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                    }`}>
                    {a.isActive ? "Activo" : "Inactivo"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {añadiendo && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <input
            autoFocus
            placeholder="Nombre del artista"
            value={nuevo.nombre}
            onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter") añadirArtista(); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div>
            <p className="text-xs text-gray-500 mb-2">Color</p>
            <div className="flex gap-2">
              {COLORES.map(c => (
                <button key={c} type="button" onClick={() => setNuevo(p => ({ ...p, color: c }))}
                  className={`w-6 h-6 rounded-full transition-transform ${nuevo.color === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={añadirArtista} disabled={loading === "nuevo" || !nuevo.nombre.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
              {loading === "nuevo" ? "Añadiendo..." : "Añadir"}
            </button>
            <button type="button" onClick={() => setAñadiendo(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
