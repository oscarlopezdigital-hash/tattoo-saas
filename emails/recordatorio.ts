export function emailRecordatorio({
  clienteName,
  studioName,
  studioPhone,
  studioAddress,
  fechaHora,
  artistName,
  consentUrl,
  consentFirmado,
}: {
  clienteName: string;
  studioName: string;
  studioPhone: string;
  studioAddress: string;
  fechaHora: string;
  artistName: string;
  consentUrl: string;
  consentFirmado: boolean;
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#f59e0b;padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${studioName}</h1>
      <p style="margin:8px 0 0;color:#fef3c7;font-size:14px;">Recordatorio — tu cita es mañana</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="margin:0 0 24px;color:#374151;font-size:16px;">Hola <strong>${clienteName}</strong>,</p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
        Te recordamos que mañana tienes una cita en <strong>${studioName}</strong>.
      </p>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#92400e;font-size:13px;width:40%;">Fecha y hora</td>
              <td style="padding:6px 0;color:#78350f;font-size:14px;font-weight:700;">${fechaHora}</td></tr>
          <tr><td style="padding:6px 0;color:#92400e;font-size:13px;">Artista</td>
              <td style="padding:6px 0;color:#78350f;font-size:14px;">${artistName}</td></tr>
          <tr><td style="padding:6px 0;color:#92400e;font-size:13px;">Dirección</td>
              <td style="padding:6px 0;color:#78350f;font-size:14px;">${studioAddress}</td></tr>
        </table>
      </div>

      ${!consentFirmado ? `
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 12px;color:#991b1b;font-size:14px;font-weight:600;">⚠️ Formulario de consentimiento pendiente</p>
        <p style="margin:0 0 12px;color:#7f1d1d;font-size:13px;">Aún no has firmado el formulario de consentimiento. Por favor, hazlo antes de tu cita.</p>
        <a href="${consentUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;">
          Firmar ahora →
        </a>
      </div>
      ` : `
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#166534;font-size:14px;">✅ Consentimiento ya firmado. ¡Todo listo para mañana!</p>
      </div>
      `}

      <p style="margin:0;color:#9ca3af;font-size:13px;">
        ¿Necesitas cancelar o cambiar la hora? Llámanos:<br>
        <a href="tel:${studioPhone}" style="color:#6366f1;">${studioPhone}</a>
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#d1d5db;font-size:12px;">© ${new Date().getFullYear()} ${studioName}</p>
    </div>
  </div>
</body>
</html>`;
}
