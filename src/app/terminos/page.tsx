import Link from "next/link";

export const metadata = { title: "Términos de uso — TattooManager" };

const CONTACTO = "oscarlopez.digital@gmail.com";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">TattooManager</Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Acceder</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Términos de uso</h1>
        <p className="text-sm text-gray-400 mt-1">Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-8 space-y-8 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Objeto</h2>
            <p>
              Estos términos regulan el acceso y uso de TattooManager (en adelante, &quot;la Plataforma&quot;),
              un servicio de gestión de reservas, clientes y consentimientos informados dirigido a estudios
              de tatuajes. El acceso a la Plataforma implica la aceptación íntegra de estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Descripción del servicio</h2>
            <p>
              La Plataforma ofrece a cada estudio registrado (el &quot;Estudio&quot;) un panel de gestión con
              calendario de citas, página pública de reservas con cobro de depósito mediante Stripe, fichas
              de clientes, formularios de consentimiento informado digital y avisos automáticos por email y
              WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Acceso al servicio</h2>
            <p>
              El alta de un nuevo Estudio se realiza mediante invitación, tras el correspondiente acuerdo
              comercial. El enlace de invitación es de un solo uso y personal; el Estudio es responsable de
              la confidencialidad de sus credenciales de acceso y de toda actividad realizada con su cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Obligaciones del Estudio</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Proporcionar datos veraces sobre su negocio y sus clientes.</li>
              <li>
                Cumplir, como responsable del tratamiento de los datos de sus clientes finales, con la
                normativa de protección de datos aplicable (RGPD y LOPDGDD), incluyendo informar
                adecuadamente a sus clientes y obtener su consentimiento cuando corresponda.
              </li>
              <li>No utilizar la Plataforma para fines ilícitos o contrarios a estos términos.</li>
              <li>Mantener actualizada la información de contacto y configuración de su estudio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Pagos</h2>
            <p>
              Los depósitos cobrados a los clientes finales del Estudio se procesan a través de Stripe y se
              liquidan según la configuración de cobro acordada con cada Estudio. El acceso del Estudio a la
              Plataforma se rige por el acuerdo comercial establecido directamente entre el Estudio y
              TattooManager en el momento del alta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Disponibilidad y soporte</h2>
            <p>
              Se procurará mantener la Plataforma disponible de forma continua, si bien pueden producirse
              interrupciones puntuales por mantenimiento o causas ajenas a nuestro control. El soporte se
              presta por email a <a href={`mailto:${CONTACTO}`} className="text-indigo-600 hover:underline">{CONTACTO}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Propiedad intelectual</h2>
            <p>
              El software, diseño y marca de TattooManager son propiedad de su titular. El Estudio conserva
              la propiedad de los datos que introduce en la Plataforma (clientes, citas, contenido propio).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Limitación de responsabilidad</h2>
            <p>
              La Plataforma se ofrece como una herramienta de gestión. TattooManager no es responsable de
              las decisiones comerciales, sanitarias o profesionales del Estudio, ni de la veracidad de los
              datos introducidos por el Estudio o sus clientes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Baja del servicio</h2>
            <p>
              El Estudio puede solicitar la baja de su cuenta en cualquier momento escribiendo a{" "}
              <a href={`mailto:${CONTACTO}`} className="text-indigo-600 hover:underline">{CONTACTO}</a>.
              Tras la baja, los datos se conservarán únicamente durante el plazo legalmente exigido antes de
              su eliminación definitiva.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Modificaciones</h2>
            <p>
              Estos términos pueden actualizarse para reflejar cambios en el servicio o en la normativa
              aplicable. Los cambios relevantes se comunicarán al Estudio por email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Legislación aplicable</h2>
            <p>
              Estos términos se rigen por la legislación española. Para cualquier controversia, las partes
              se someten a los juzgados y tribunales competentes según la normativa de consumo aplicable.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
