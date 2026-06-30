import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const WHATSAPP_FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

export function formatPhoneWA(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length === 11) return `whatsapp:+${digits}`;
  return `whatsapp:+34${digits}`;
}

export async function sendWhatsApp(to: string, body: string) {
  return twilioClient.messages.create({
    from: WHATSAPP_FROM,
    to: formatPhoneWA(to),
    body,
  });
}
