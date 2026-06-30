import { Resend } from "resend";

let _client: Resend | null = null;

export function getResend(): Resend {
  if (!_client) {
    _client = new Resend(process.env.RESEND_API_KEY!);
  }
  return _client;
}

export const resend = { emails: { send: (...args: Parameters<Resend["emails"]["send"]>) => getResend().emails.send(...args) } };
