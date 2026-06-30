import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

const DESTINO = "oscarlopez.digital@gmail.com";

export async function POST(request: NextRequest) {
  const { nombre, email, telefono, mensaje } = await request.json();

  if (!nombre?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: DESTINO,
      replyTo: email,
      subject: `Nueva solicitud de acceso — ${nombre}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
          <h2 style="color:#111827;">Nueva solicitud de acceso a TattooManager</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:35%;">Nombre</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${nombre}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td>
                <td style="padding:8px 0;font-size:14px;"><a href="mailto:${email}" style="color:#6366f1;">${email}</a></td></tr>
            ${telefono ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Teléfono</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;">${telefono}</td></tr>` : ""}
            ${mensaje ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top;">Mensaje</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;">${mensaje}</td></tr>` : ""}
          </table>
          <p style="margin-top:24px;font-size:13px;color:#9ca3af;">
            Responde a este email o llama directamente al número de teléfono.
          </p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
