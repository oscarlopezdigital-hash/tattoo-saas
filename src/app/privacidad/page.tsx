import Link from "next/link";

export const metadata = { title: "Política de privacidad — TattooManager" };

const CONTACTO = "oscarlopez.digital@gmail.com";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">TattooManager</Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Acceder</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Política de privacidad</h1>
        <p className="text-sm text-gray-400 mt-1">Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-8 space-y-8 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Responsable del tratamiento</h2>
            <p>
              TattooManager es una plataforma que permite a estudios de tatuajes (en adelante, &quot;el Estudio&quot;)
              gestionar reservas, clientes y consentimientos informados. Según el dato de que se trate,
              el responsable del tratamiento varía:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Datos del Estudio y de su personal</strong> (cuenta, email, configuración):
                responsable es TattooManager, contacto <a href={`mailto:${CONTACTO}`} className="text-indigo-600 hover:underline">{CONTACTO}</a>.
              </li>
              <li>
                <strong>Datos de los clientes finales del Estudio</strong> (quienes reservan cita, firman
                consentimientos, etc.): el responsable del tratamiento es el propio Estudio, que utiliza
                TattooManager como encargado del tratamiento para prestar el servicio.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Datos de contacto: nombre, teléfono, email, dirección.</li>
              <li>Fecha de nacimiento (necesaria para el consentimiento informado del tatuaje).</li>
              <li>Datos de la cita: fecha, hora, artista, descripción del tatuaje.</li>
              <li>Contenido del consentimiento informado firmado y la IP desde la que se firma.</li>
              <li>Datos de pago del depósito: gestionados directamente por Stripe; no almacenamos datos de tarjeta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Finalidad del tratamiento</h2>
            <p>
              Los datos se utilizan exclusivamente para gestionar la reserva, el cobro del depósito, el
              cumplimiento del consentimiento informado exigido para la realización de tatuajes, y el envío
              de confirmaciones y recordatorios de la cita por email y WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Base legal</h2>
            <p>
              La ejecución de la reserva y el cobro del depósito se basan en la ejecución de un contrato
              (art. 6.1.b RGPD). El consentimiento informado del tatuaje se basa en el consentimiento
              explícito del interesado (art. 6.1.a y art. 9.2.a RGPD, al tratarse de datos relacionados con
              la salud de la piel).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Conservación de los datos</h2>
            <p>
              Los datos se conservan mientras exista una relación activa entre el cliente y el Estudio, y
              posteriormente durante los plazos exigidos por la normativa aplicable (a efectos fiscales y de
              responsabilidad sanitaria). El Estudio puede solicitar la eliminación de datos de un cliente
              salvo obligación legal de conservación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Encargados del tratamiento</h2>
            <p>Para prestar el servicio utilizamos los siguientes proveedores, que actúan como encargados del tratamiento:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Supabase</strong> — base de datos y autenticación.</li>
              <li><strong>Stripe</strong> — procesamiento de pagos del depósito.</li>
              <li><strong>Resend</strong> — envío de emails de confirmación y recordatorio.</li>
              <li><strong>Twilio</strong> — envío de mensajes de WhatsApp.</li>
              <li><strong>Vercel</strong> — alojamiento de la aplicación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Derechos de las personas interesadas</h2>
            <p>
              Cualquier persona puede ejercer sus derechos de acceso, rectificación, supresión, oposición,
              limitación del tratamiento y portabilidad de sus datos. Para datos tratados directamente por un
              Estudio, la solicitud debe dirigirse a dicho Estudio. Para datos tratados por TattooManager
              como responsable, puede escribir a <a href={`mailto:${CONTACTO}`} className="text-indigo-600 hover:underline">{CONTACTO}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas razonables para proteger los datos frente a accesos
              no autorizados, pérdida o alteración, incluyendo cifrado en tránsito, autenticación segura y
              acceso restringido por estudio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Cookies</h2>
            <p>
              Utilizamos únicamente cookies técnicas necesarias para mantener la sesión iniciada. No
              utilizamos cookies de publicidad ni de seguimiento con fines analíticos de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contacto</h2>
            <p>
              Para cualquier consulta sobre esta política, escríbenos a{" "}
              <a href={`mailto:${CONTACTO}`} className="text-indigo-600 hover:underline">{CONTACTO}</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
