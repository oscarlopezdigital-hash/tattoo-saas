import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CONTACTO = "oscarlopez.digital@gmail.com";

const FEATURES = [
  {
    icon: "📅",
    title: "Reservas online 24/7",
    desc: "Tus clientes reservan cita ellos solos desde un enlace propio, sin llamadas ni mensajes idas y vueltas.",
  },
  {
    icon: "💳",
    title: "Depósito automático",
    desc: "Cobra la señal de la reserva con Stripe en el momento de reservar. Sin citas fantasma.",
  },
  {
    icon: "🗓️",
    title: "Calendario semanal",
    desc: "Toda tu agenda de un vistazo, con el estado de cada cita: pendiente, confirmada, completada.",
  },
  {
    icon: "📋",
    title: "Fichas de clientes",
    desc: "Historial, datos de contacto y citas anteriores de cada cliente, siempre a mano.",
  },
  {
    icon: "✍️",
    title: "Consentimiento informado digital",
    desc: "El cliente firma el consentimiento antes de la cita desde el móvil. Sin papeles que se pierden.",
  },
  {
    icon: "💬",
    title: "Avisos automáticos",
    desc: "Confirmaciones y recordatorios por WhatsApp y email, sin que tengas que escribir nada.",
  },
];

const PASOS = [
  { n: "1", title: "Contacta con nosotros", desc: "Te activamos tu estudio y te damos acceso." },
  { n: "2", title: "Configura tu estudio", desc: "Horarios, depósito, artistas y tu enlace de reservas." },
  { n: "3", title: "Comparte tu enlace", desc: "Tus clientes reservan solos, tú gestionas todo desde el panel." },
];

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const isSuperAdmin = user.email === process.env.SUPERADMIN_EMAIL;
    redirect(isSuperAdmin ? "/admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">TattooManager</span>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Acceder
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          El sistema de reservas<br />para tu estudio de tatuajes
        </h1>
        <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto">
          Reservas online, cobro de depósito, calendario, fichas de clientes y consentimiento
          informado digital — todo en un solo sitio.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href={`mailto:${CONTACTO}?subject=Quiero%20activar%20mi%20estudio%20en%20TattooManager`}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Solicita acceso →
          </a>
          <Link
            href="/login"
            className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-gray-200">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Cómo funciona</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {PASOS.map((p) => (
            <div key={p.n} className="text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                {p.n}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{p.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-gray-900">¿Listo para dejar el cuaderno y el WhatsApp suelto?</h2>
        <p className="mt-3 text-gray-500">Contáctanos y activamos tu estudio en menos de 24 horas.</p>
        <a
          href={`mailto:${CONTACTO}?subject=Quiero%20activar%20mi%20estudio%20en%20TattooManager`}
          className="mt-6 inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Contactar por email
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} TattooManager</p>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link href="/privacidad" className="hover:text-gray-600">Política de privacidad</Link>
            <Link href="/terminos" className="hover:text-gray-600">Términos de uso</Link>
            <a href={`mailto:${CONTACTO}`} className="hover:text-gray-600">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
