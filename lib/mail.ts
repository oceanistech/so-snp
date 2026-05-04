import nodemailer, { type Transporter } from "nodemailer";

/**
 * Mail abstraction.
 *
 * In dev, SMTP points at Mailpit (no auth, port 1025). In prod, set
 * MAIL_HOST/PORT/USER/PASS to your provider (e.g. Mailgun on smtp.mailgun.org).
 *
 * The transporter is lazy-singletoned so we don't open a connection on
 * import — important for routes that never send mail.
 */

type MailEnv = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};

function readEnv(): MailEnv {
  const host = process.env.MAIL_HOST ?? "localhost";
  const port = Number(process.env.MAIL_PORT ?? 1025);
  const secure = process.env.MAIL_SECURE === "true";
  const user = process.env.MAIL_USER || undefined;
  const pass = process.env.MAIL_PASS || undefined;
  const from =
    process.env.MAIL_FROM ?? "Signal S&P <no-reply@signalsp.local>";
  return { host, port, secure, user, pass, from };
}

let cached: Transporter | undefined;

export function mailer(): Transporter {
  if (cached) return cached;
  const env = readEnv();
  const auth = env.user && env.pass ? { user: env.user, pass: env.pass } : undefined;
  cached = nodemailer.createTransport({
    host: env.host,
    port: env.port,
    secure: env.secure,
    auth,
  });
  return cached;
}

export type SendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

export async function sendMail(input: SendMailInput) {
  const env = readEnv();
  const transporter = mailer();
  return transporter.sendMail({
    from: input.from ?? env.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
