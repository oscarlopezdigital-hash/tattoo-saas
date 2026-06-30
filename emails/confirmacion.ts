export function emailConfirmacion({
  clienteName,
  studioName,
  studioPhone,
  fechaHora,
  artistName,
  tattooDescription,
  depositAmount,
  consentUrl,
}: {
  clienteName: string;
  studioName: string;
  studioPhone: string;
  fechaHora: string;
  artistName: string;
  tattooDescription: string;
  depositAmount: string;
  consentUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#6366f1;padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${studioName}</h1>
      <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px;">Confirmación de cita</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="margin:0 0 24px;color:#374151;font-size:16px;">Hola <strong>${clienteName}</strong>,</p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Tu cita ha sido confirmada. Aquí tienes todos los detalles:</p>

      <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;width:40%;">Fecha y hora</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${fechaHora}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Artista</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;">${artistName}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Descripción</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;">${tattooDescription || "Sin especificar"}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Depósito pagado</td>
              <td style="padding:6px 0;color:#059669;font-size:14px;font-weight:600;">${depositAmount}</td></tr>
        </table>
      </div>

      <p style="margin:0 0 16px;color:#374151;font-size:14px;">
        <strong>Importante:</strong> antes de tu cita necesitas firmar el formulario de consentimiento informado.
      </p>
      <a href="${consentUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
        Firmar formulario de consentimiento →
      </a>

      <p style="margin:32px 0 0;color:#9ca3af;font-size:13px;">
        ¿Necesitas cambiar o cancelar tu cita? Contacta con nosotros:<br>
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
