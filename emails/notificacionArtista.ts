export function emailNotificacionArtista({
  artistName,
  clienteName,
  clientePhone,
  studioName,
  fechaHora,
  tattooDescription,
  depositAmount,
}: {
  artistName: string;
  clienteName: string;
  clientePhone: string;
  studioName: string;
  fechaHora: string;
  tattooDescription: string;
  depositAmount: string;
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#111827;padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${studioName}</h1>
      <p style="margin:8px 0 0;color:#9ca3af;font-size:14px;">Nueva cita reservada y pagada</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="margin:0 0 24px;color:#374151;font-size:16px;">Hola <strong>${artistName}</strong>,</p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Tienes una nueva cita confirmada. El cliente ya ha pagado el depósito de reserva:</p>

      <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;width:40%;">Cliente</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${clienteName}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Teléfono</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;">${clientePhone}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Fecha y hora</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${fechaHora}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Descripción</td>
              <td style="padding:6px 0;color:#111827;font-size:14px;">${tattooDescription || "Sin especificar"}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af;font-size:13px;">Depósito pagado</td>
              <td style="padding:6px 0;color:#059669;font-size:14px;font-weight:600;">${depositAmount}</td></tr>
        </table>
      </div>

      <p style="margin:0;color:#9ca3af;font-size:13px;">
        Revisa el resto de detalles en tu calendario de TattooManager.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#d1d5db;font-size:12px;">© ${new Date().getFullYear()} ${studioName}</p>
    </div>
  </div>
</body>
</html>`;
}
