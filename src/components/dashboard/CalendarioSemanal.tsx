"use client";

import { useState, useCallback } from "react";
import ModalCita from "./ModalCita";
import FormNuevaCita from "./FormNuevaCita";

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
  artist: { id: string; name: string; color: string };
  deposit: Deposit;
  consentForm: ConsentForm;
};
type Cliente = { id: string; name: string; phone: string };
type Artista = { id: string; name: string };

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HORAS = Array.from({ length: 12 }, (_, i) => i + 9); // 9:00 a 20:00

const ESTADO_COLOR: Record<string, string> = {
  PENDING:   "bg-gray-100 border-gray-300 text-gray-700",
  CONFIRMED: "bg-green-50 border-green-300 text-green-800",
  COMPLETED: "bg-blue-50 border-blue-300 text-blue-800",
  CANCELLED: "bg-red-50 border-red-300 text-red-700 opacity-60",
  NO_SHOW:   "bg-orange-50 border-orange-300 text-orange-700 opacity-70",
};

function getLunesDeHoy(fecha: Date) {
  const d = new Date(fecha);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function CalendarioSemanal({
  citasIniciales,
  clientes,
  artistas,
}: {
  citasIniciales: Cita[];
  clientes: Cliente[];
  artistas: Artista[];
}) {
  const [lunes, setLunes] = useState(() => getLunesDeHoy(new Date()));
  const [citas, setCitas] = useState<Cita[]>(citasIniciales);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [mostrarFormNueva, setMostrarFormNueva] = useState(false);

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(d.getDate() + i);
    return d;
  });

  function navegar(delta: number) {
    const nuevo = new Date(lunes);
    nuevo.setDate(nuevo.getDate() + delta * 7);
    setLunes(nuevo);
    cargarCitas(nuevo);
  }

  async function cargarCitas(desdeLunes: Date) {
    const desde = desdeLunes.toISOString();
    const hasta = new Date(desdeLunes);
    hasta.setDate(hasta.getDate() + 7);
    const res = await fetch(`/api/citas?desde=${desde}&hasta=${hasta.toISOString()}`);
    if (res.ok) setCitas(await res.json());
  }

  const recargar = useCallback(() => cargarCitas(lunes), [lunes]);

  function handleStatusChange(id: string, status: string) {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (citaSeleccionada?.id === id) {
      setCitaSeleccionada(prev => prev ? { ...prev, status } : null);
    }
  }

  function citasDelDia(dia: Date) {
    return citas.filter(c => {
      const d = new Date(c.dateTime);
      return (
        d.getFullYear() === dia.getFullYear() &&
        d.getMonth() === dia.getMonth() &&
        d.getDate() === dia.getDate()
      );
    });
  }

  const hoy = new Date();
  const tituloSemana = `${diasSemana[0].getDate()} ${diasSemana[0].toLocaleDateString("es-ES", { month: "short" })} — ${diasSemana[6].getDate()} ${diasSemana[6].toLocaleDateString("es-ES", { month: "short", year: "numeric" })}`;

  return (
    <div>
      {/* Controles */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navegar(-1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
            ←
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[220px] text-center">
            {tituloSemana}
          </span>
          <button onClick={() => navegar(1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
            →
          </button>
          <button
            onClick={() => { const l = getLunesDeHoy(new Date()); setLunes(l); cargarCitas(l); }}
            className="px-3 py-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
            Hoy
          </button>
        </div>
        <button
          onClick={() => setMostrarFormNueva(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          + Nueva cita
        </button>
      </div>

      {/* Cuadrícula */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Cabecera días */}
        <div className="grid grid-cols-8 border-b border-gray-100">
          <div className="p-3" />
          {diasSemana.map((dia, i) => {
            const esHoy = dia.toDateString() === hoy.toDateString();
            return (
              <div key={i} className={`p-3 text-center border-l border-gray-100 ${esHoy ? "bg-indigo-50" : ""}`}>
                <p className={`text-xs font-medium ${esHoy ? "text-indigo-600" : "text-gray-400"}`}>
                  {DIAS[i]}
                </p>
                <p className={`text-lg font-semibold mt-0.5 ${esHoy ? "text-indigo-700" : "text-gray-800"}`}>
                  {dia.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filas de horas */}
        <div>
          {HORAS.map(hora => (
            <div key={hora} className="grid grid-cols-8 border-b border-gray-50 min-h-[64px]">
              <div className="p-2 text-right pr-3">
                <span className="text-xs text-gray-400">{hora}:00</span>
              </div>
              {diasSemana.map((dia, i) => {
                const citasHora = citasDelDia(dia).filter(c => {
                  const h = new Date(c.dateTime).getHours();
                  return h === hora;
                });
                return (
                  <div key={i} className="border-l border-gray-100 p-1 space-y-1">
                    {citasHora.map(cita => (
                      <button
                        key={cita.id}
                        onClick={() => setCitaSeleccionada(cita)}
                        className={`w-full text-left p-1.5 rounded border text-xs font-medium truncate transition-opacity hover:opacity-80 ${ESTADO_COLOR[cita.status]}`}
                      >
                        <span className="block truncate">{cita.client.name}</span>
                        <span className="block text-[10px] opacity-70">
                          {new Date(cita.dateTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          {" · "}{cita.estimatedDuration}min
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mt-3">
        {Object.entries({
          PENDING: "Pendiente", CONFIRMED: "Confirmada",
          COMPLETED: "Completada", CANCELLED: "Cancelada", NO_SHOW: "No se presentó"
        }).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded border ${ESTADO_COLOR[key]}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Modales */}
      {citaSeleccionada && (
        <ModalCita
          cita={citaSeleccionada}
          onClose={() => setCitaSeleccionada(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      {mostrarFormNueva && (
        <FormNuevaCita
          clientes={clientes}
          artistas={artistas}
          onCreada={recargar}
          onClose={() => setMostrarFormNueva(false)}
        />
      )}
    </div>
  );
}
