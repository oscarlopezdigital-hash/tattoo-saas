"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type StudioPublico = {
  slug: string; name: string; phone: string; address: string; instagram: string;
  depositDefaultAmount: number; depositRequired: boolean; diasDisponibles: number[];
};
type ServicioPublico = {
  id: string; name: string; description: string | null;
  duration: number; price: number | null; depositRequired: boolean; depositAmount: number | null;
};

type Paso = "servicio" | "fecha" | "hora" | "datos" | "procesando" | "exito";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_CORTO = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

function formatDuration(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function PaginaReserva({
  studio, servicios = [],
}: {
  studio: StudioPublico; servicios?: ServicioPublico[];
}) {
  const tieneServicios = servicios.length > 0;
  const pasoInicial: Paso = tieneServicios ? "servicio" : "fecha";

  const [paso, setPaso] = useState<Paso>(pasoInicial);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioPublico | null>(null);
  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date(); hoy.setDate(1); hoy.setHours(0,0,0,0); return hoy;
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre:"", telefono:"", email:"", fechaNacimiento:"", descripcion:"" });

  // Determina si esta reserva requiere señal
  const requiresDeposit = servicioSeleccionado
    ? servicioSeleccionado.depositRequired
    : studio.depositRequired;

  const depositoActivo = servicioSeleccionado?.depositAmount ?? studio.depositDefaultAmount;

  // Construir cuadrícula del mes
  const primerDia = new Date(mesActual);
  const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
  const offsetInicio = (primerDia.getDay() + 6) % 7;
  const totalCeldas = Math.ceil((offsetInicio + ultimoDia.getDate()) / 7) * 7;
  const hoy = new Date(); hoy.setHours(0,0,0,0);

  async function seleccionarFecha(fecha: Date) {
    const str = fecha.toISOString().split("T")[0];
    setFechaSeleccionada(str);
    setHoraSeleccionada("");
    setLoadingSlots(true);
    setError(null);
    const res = await fetch(`/api/reservas/disponibilidad?slug=${studio.slug}&fecha=${str}`);
    const data = await res.json();
    setSlots(data.slots ?? []);
    setLoadingSlots(false);
    setPaso("hora");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPaso("procesando");

    const dateTime = `${fechaSeleccionada}T${horaSeleccionada}:00`;
    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: studio.slug,
        dateTime,
        serviceId: servicioSeleccionado?.id ?? null,
        ...form,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al crear la reserva");
      setPaso("datos");
      return;
    }

    const data = await res.json();

    if (data.confirmed) {
      setPaso("exito");
    } else {
      window.location.href = data.checkoutUrl;
    }
  }

  // Pasos de progreso visibles
  const pasosFlujo = tieneServicios
    ? (["servicio","fecha","hora","datos"] as const)
    : (["fecha","hora","datos"] as const);
  const pasoIdx = pasosFlujo.indexOf(paso as never);
  const pasosVisibles = tieneServicios
    ? ["Servicio","Fecha","Hora","Datos"]
    : ["Fecha","Hora","Datos"];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{studio.name}</h1>
          {studio.address && <p className="text-sm text-gray-500 mt-1">{studio.address}</p>}
          {studio.phone && <p className="text-sm text-gray-500">{studio.phone}</p>}
          {studio.instagram && (
            <a href={`https://instagram.com/${studio.instagram}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-sm text-pink-600 hover:text-pink-700 font-medium">
              📷 @{studio.instagram}
            </a>
          )}
          {paso !== "exito" && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left max-w-sm mx-auto">
              <p className="text-xs font-semibold text-amber-800">¿Cómo funciona?</p>
              <p className="text-xs text-amber-700 mt-1">
                {requiresDeposit
                  ? "Elige una fecha tentativa y cuéntanos tu idea. Pagas la señal para reservar el hueco y el artista te contactará para confirmar los detalles."
                  : "Elige una fecha y cuéntanos tu idea. La reserva se confirma al instante sin pago previo."}
              </p>
            </div>
          )}
        </div>

        {/* Progreso */}
        {paso !== "exito" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {pasosVisibles.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  pasoIdx === i ? "bg-indigo-600 text-white" :
                  pasoIdx > i || paso === "procesando" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-400"
                }`}>{i+1}</div>
                {i < pasosVisibles.length - 1 && <div className="w-8 h-px bg-gray-300" />}
              </div>
            ))}
          </div>
        )}

        {/* PASO 0: Servicio */}
        {paso === "servicio" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h3 className="font-semibold text-gray-800 mb-4">¿Qué servicio necesitas?</h3>
            <div className="space-y-2">
              {servicios.map(s => (
                <button key={s.id} type="button"
                  onClick={() => { setServicioSeleccionado(s); setPaso("fecha"); }}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="font-medium text-gray-900 group-hover:text-indigo-700">{s.name}</span>
                      {s.description && <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>}
                      {!s.depositRequired && (
                        <span className="inline-block mt-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Sin señal</span>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {formatDuration(s.duration)}
                      </span>
                      {s.price !== null && (
                        <p className="text-xs text-gray-400 mt-1">Desde {formatPrice(s.price)}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 1: Fecha */}
        {(paso === "fecha" || paso === "hora") && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            {servicioSeleccionado && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Servicio</p>
                  <p className="text-sm font-medium text-gray-800">{servicioSeleccionado.name}</p>
                </div>
                <button type="button" onClick={() => { setPaso("servicio"); setFechaSeleccionada(""); setHoraSeleccionada(""); }}
                  className="text-xs text-indigo-500 hover:text-indigo-700">
                  Cambiar
                </button>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { const n=new Date(mesActual); n.setMonth(n.getMonth()-1); setMesActual(n); }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">←</button>
              <span className="font-semibold text-gray-800">{MESES[mesActual.getMonth()]} {mesActual.getFullYear()}</span>
              <button onClick={() => { const n=new Date(mesActual); n.setMonth(n.getMonth()+1); setMesActual(n); }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">→</button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_CORTO.map(d => <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalCeldas }, (_, i) => {
                const numDia = i - offsetInicio + 1;
                if (numDia < 1 || numDia > ultimoDia.getDate()) return <div key={i} />;
                const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), numDia);
                const diaSemana = fecha.getDay();
                const disponible = studio.diasDisponibles.includes(diaSemana);
                const pasado = fecha < hoy;
                const seleccionado = fecha.toISOString().split("T")[0] === fechaSeleccionada;

                return (
                  <button key={i} disabled={!disponible || pasado}
                    onClick={() => seleccionarFecha(fecha)}
                    className={`h-9 w-full rounded-lg text-sm font-medium transition-all ${
                      seleccionado ? "bg-indigo-600 text-white" :
                      !disponible || pasado ? "text-gray-300 cursor-not-allowed" :
                      "hover:bg-indigo-50 text-gray-700"
                    }`}
                  >{numDia}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 2: Hora */}
        {paso === "hora" && fechaSeleccionada && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Elige hora para el {new Date(fechaSeleccionada + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            {loadingSlots ? (
              <p className="text-sm text-gray-400 text-center py-4">Cargando disponibilidad...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hay horas disponibles este día</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map(slot => (
                  <button key={slot} onClick={() => { setHoraSeleccionada(slot); setPaso("datos"); }}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      horaSeleccionada === slot
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 3: Datos */}
        {paso === "datos" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">Tus datos</h3>
              <button onClick={() => setPaso("hora")} className="text-xs text-indigo-600 hover:text-indigo-800">
                ← Cambiar hora
              </button>
            </div>

            <div className="bg-indigo-50 rounded-lg p-3 mb-5 text-sm text-indigo-700">
              {servicioSeleccionado && <span className="font-medium">{servicioSeleccionado.name} · </span>}
              {new Date(fechaSeleccionada + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} · {horaSeleccionada}h
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input required value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input required value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento *</label>
                  <input required type="date" value={form.fechaNacimiento}
                    onChange={e => setForm(f => ({...f, fechaNacimiento: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (para recibir confirmación)</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del tatuaje</label>
                  <textarea rows={3} value={form.descripcion}
                    onChange={e => setForm(f => ({...f, descripcion: e.target.value}))}
                    placeholder="Describe brevemente el diseño, zona del cuerpo, estilo..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {requiresDeposit ? (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  Pagarás una señal de <strong className="text-gray-900">{formatPrice(depositoActivo)}</strong> para reservar el hueco.
                  El artista te contactará para confirmar el diseño. El importe se descuenta del precio final.
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                  <strong>Reserva gratuita</strong> — tu cita se confirma al instante sin ningún pago previo.
                </div>
              )}

              <button type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                {requiresDeposit
                  ? `Reservar y pagar señal ${formatPrice(depositoActivo)} →`
                  : "Confirmar reserva →"}
              </button>

              <p className="text-center text-xs text-gray-400">
                Al reservar aceptas nuestra{" "}
                <Link href="/privacidad" target="_blank" className="text-indigo-500 hover:underline">
                  Política de privacidad
                </Link>.
              </p>
            </form>
          </div>
        )}

        {/* Procesando */}
        {paso === "procesando" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 text-sm">
              {requiresDeposit ? "Redirigiendo al pago seguro..." : "Confirmando tu reserva..."}
            </p>
          </div>
        )}

        {/* Éxito sin señal */}
        {paso === "exito" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Cita confirmada!</h2>
            <p className="text-gray-500 text-sm mb-1">
              {servicioSeleccionado && <><strong>{servicioSeleccionado.name}</strong> · </>}
              {new Date(fechaSeleccionada + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} · {horaSeleccionada}h
            </p>
            {form.email && (
              <p className="text-xs text-gray-400 mt-2">
                Recibirás la confirmación en <strong>{form.email}</strong>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-4">
              ¿Necesitas cambiar algo? Llama a {studio.phone || studio.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
