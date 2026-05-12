import FormData from "form-data";
import Mailgun from "mailgun.js";
import type { IMailgunClient } from "mailgun.js/Interfaces";

/**
 * Mail transport — Mailgun HTTP API.
 *
 * Configure with:
 *   MAILGUN_DOMAIN   — your verified sending domain (e.g. "oceanis.io")
 *   MAILGUN_SECRET   — API key from Mailgun dashboard
 *                      (alias: MAILGUN_API_KEY)
 *   MAILGUN_REGION   — "us" (default) or "eu"
 *   MAIL_FROM        — From address, e.g. 'Signal S&P <no-reply@oceanis.io>'
 *
 * Why HTTP API instead of SMTP?
 *   - Cleaner error responses (HTTP status + JSON body) vs SMTP codes
 *   - Avoids port-blocking / TLS quirks on hosts that restrict 25/465/587
 *   - Mailgun-native rate limits + retries
 */

type MailEnv = {
  apiKey: string;
  domain: string;
  from: string;
  euRegion: boolean;
};

function readEnv(): MailEnv {
  const apiKey =
    process.env.MAILGUN_SECRET ?? process.env.MAILGUN_API_KEY ?? "";
  const domain = process.env.MAILGUN_DOMAIN ?? "";
  const from =
    process.env.MAIL_FROM ??
    `Signal S&P <no-reply@${domain || "example.com"}>`;
  const euRegion =
    (process.env.MAILGUN_REGION ?? "").toLowerCase() === "eu";

  return { apiKey, domain, from, euRegion };
}

let cached: IMailgunClient | undefined;

function getClient(env: MailEnv): IMailgunClient {
  if (cached) return cached;

  if (!env.apiKey || !env.domain) {
    throw new Error(
      "Mailgun not configured. Set MAILGUN_DOMAIN and MAILGUN_SECRET (or MAILGUN_API_KEY) in env.",
    );
  }

  const mailgun = new Mailgun(FormData);
  cached = mailgun.client({
    username: "api",
    key: env.apiKey,
    ...(env.euRegion ? { url: "https://api.eu.mailgun.net" } : {}),
  });
  return cached;
}

/**
 * Console fallback transport for local dev when Mailgun creds aren't set.
 * Logs the email contents to stdout and pretends the send succeeded so the
 * sign-up flow can complete without real delivery. NEVER used in production
 * (production always has MAILGUN_DOMAIN + MAILGUN_SECRET).
 */
function isDevConsoleFallback(env: MailEnv): boolean {
  return (
    process.env.NODE_ENV !== "production" && (!env.apiKey || !env.domain)
  );
}

function logEmailToConsole(input: SendMailInput, from: string) {
  const sep = "─".repeat(72);
  console.log(`\n${sep}\n[mail] (console fallback — set MAILGUN_DOMAIN + MAILGUN_SECRET to actually send)`);
  console.log(`[mail] From:    ${from}`);
  console.log(`[mail] To:      ${input.to}`);
  console.log(`[mail] Subject: ${input.subject}`);
  if (input.text) {
    console.log(`[mail] Body:\n${input.text}`);
  } else if (input.html) {
    console.log(`[mail] (HTML body — ${input.html.length} chars)`);
  }
  console.log(`${sep}\n`);
}

export type SendMailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

/**
 * Send an email via Mailgun. The interface mirrors the previous nodemailer
 * wrapper so call sites (verification.ts, dev/mail-test) don't change.
 *
 * Returns an object with `messageId` you can search for in Mailgun's Logs
 * page when debugging delivery.
 */
export async function sendMail(input: SendMailInput) {
  const env = readEnv();
  const from = input.from ?? env.from;

  if (isDevConsoleFallback(env)) {
    logEmailToConsole(input, from);
    return {
      messageId: `dev-console-${Date.now()}`,
      response: "logged to console (Mailgun not configured)",
      raw: null,
    };
  }

  const client = getClient(env);

  // mailgun.js's MailgunMessageData is a strict discriminated union — TS
  // can't narrow it when `text`/`html` are `string | undefined`. Build the
  // payload with only defined fields, then cast to the parameter type.
  const messageData: Parameters<IMailgunClient["messages"]["create"]>[1] = {
    from,
    to: [input.to],
    subject: input.subject,
    ...(input.text ? { text: input.text } : {}),
    ...(input.html ? { html: input.html } : {}),
  } as Parameters<IMailgunClient["messages"]["create"]>[1];

  const response = await client.messages.create(env.domain, messageData);

  return {
    messageId: response.id,
    response: response.message ?? "",
    raw: response,
  };
}

/**
 * Health-check: verify Mailgun is reachable and the API key is valid.
 * Fetches the configured domain's metadata — read-only, no mail sent.
 * In the dev console-fallback mode this is a no-op success.
 */
export async function verifyMailer(): Promise<void> {
  const env = readEnv();
  if (isDevConsoleFallback(env)) return;
  const client = getClient(env);
  await client.domains.get(env.domain);
}
