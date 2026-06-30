"use client";

import { useEffect, useState } from "react";
import { use } from "react";

type DatosCita = {
  clienteName: string;
  studioName: string;
  consentFormTemplate: string | null;
  dateTime: string;
  yaFirmado: boolean;
  signedAt: string | null;
};

export default function ConsentimientoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [datos, setDatos] = useState<DatosCita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firmado, setFirmado] = useState(false);
  const [aceptado, setAceptado] = useState(false);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetch(`/api/consentimiento/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject("no encontrado"))
      .then(data => { setDatos(data); setFirmado(data.yaFirmado); setCargando(false); })
      .catch(() => { setError("Formulario no encontrado o enlace inválido."); setCargando(false); });
  }, [token]);

  async function handleFirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!aceptado || !nombre.trim()) return;
    setGuardando(true);

    const res = await fetch(`/api/consentimiento/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signerName: nombre }),
    });

    if (res.ok) {
      setFirmado(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al guardar la firma");
    }
    setGuardando(false);
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">Enlace inválido</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (firmado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Consentimiento firmado</h2>
          <p className="text-gray-500 text-sm">
            Gracias, <strong>{datos.clienteName}</strong>. Tu formulario de consentimiento ha sido registrado correctamente.
          </p>
          {datos.signedAt && (
            <p className="text-xs text-gray-400 mt-3">
              Firmado el {new Date(datos.signedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">{datos.studioName}</h1>
          <p className="text-sm text-gray-500 mt-1">Formulario de consentimiento informado</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <p className="text-sm text-gray-600 mb-1">
            Cita del{" "}
            <strong>
              {new Date(datos.dateTime).toLocaleDateString("es-ES", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </strong>
          </p>
          <p className="text-sm text-gray-500">Cliente: <strong>{datos.clienteName}</strong></p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Términos y condiciones</h3>
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto border border-gray-100 rounded-lg p-4 bg-gray-50">
            {datos.consentFormTemplate ?? "Este establecimiento realiza tatuajes permanentes. Al firmar este documento confirmas que has sido informado de los riesgos y cuidados posteriores del tatuaje, que eres mayor de 18 años y que no presentas ninguna contraindicación médica conocida."}
          </div>
        </div>

        <form onSubmit={handleFirmar} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre completo (firma)</label>
            <input
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Escribe tu nombre completo para firmar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" required checked={aceptado} onChange={e => setAceptado(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded" />
            <span className="text-sm text-gray-600">
              He leído y acepto los términos del consentimiento informado. Confirmo que la información proporcionada es correcta y que soy mayor de 18 años.
            </span>
          </label>

          <button type="submit" disabled={!aceptado || !nombre.trim() || guardando}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm">
            {guardando ? "Guardando firma..." : "Firmar y confirmar"}
          </button>
        </form>
      </div>
    </div>
  );
}
