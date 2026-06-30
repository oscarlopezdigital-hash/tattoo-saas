"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigoAcceso: "",
    email: "",
    password: "",
    studioName: "",
    slug: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "studioName") updated.slug = slugify(value);
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al registrarse.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email: form.email, password: form.password });

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Crea tu estudio</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configura tu página de reservas en 2 minutos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de acceso *
            </label>
            <input
              name="codigoAcceso"
              type="text"
              required
              value={form.codigoAcceso}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Código que te hemos enviado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del estudio *
            </label>
            <input
              name="studioName"
              type="text"
              required
              value={form.studioName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ink Masters Madrid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de tu página de reservas *
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <span className="px-3 py-2 bg-gray-50 text-gray-400 text-xs border-r border-gray-300 whitespace-nowrap">
                /reservar/
              </span>
              <input
                name="slug"
                type="text"
                required
                value={form.slug}
                onChange={handleChange}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                placeholder="ink-masters-madrid"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Tus clientes reservarán en esta URL
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="612 345 678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Calle Mayor 10, Madrid"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Datos de acceso
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="tu@estudio.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? "Creando tu estudio..." : "Crear mi estudio →"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Acceder
          </Link>
        </p>
      </div>
    </div>
  );
}
