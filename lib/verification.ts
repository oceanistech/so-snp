import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

const TOKEN_BYTES = 32; // 64 hex chars
const TOKEN_TTL_HOURS = 24;

/**
 * Generate a random hex token and persist it in the VerificationToken table.
 * The same table is shared with Auth.js's EmailProvider (magic links); both
 * coexist because tokens are unique and we look up by token explicitly.
 */
export async function createVerificationToken(email: string): Promise<string> {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
}

/**
 * Send a "verify your email" message containing a link to /verify-email?token=...
 */
export async function sendVerificationEmail(opts: {
  to: string;
  name?: string;
  token: string;
}) {
  const baseUrl =
    process.env.AUTH_URL ??
    process.env.APP_BASE_URL ??
    "http://localhost:3000";

  const url = `${baseUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(
    opts.token,
  )}`;
  const name = opts.name ?? "there";

  await sendMail({
    to: opts.to,
    subject: "Verify your email — Signal S&P",
    text:
      `Hi ${name},\n\n` +
      `Click the link below to verify your email and finish signing up:\n\n` +
      `${url}\n\n` +
      `This link expires in 24 hours.\n\n` +
      `If you didn't sign up, ignore this email.`,
    html:
      `<p>Hi ${escapeHtml(name)},</p>` +
      `<p>Click the link below to verify your email and finish signing up:</p>` +
      `<p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` +
      `<p>This link expires in 24 hours.</p>` +
      `<p>If you didn't sign up, ignore this email.</p>`,
  });
}

/**
 * Validate a token: look it up, check expiry, mark the user as verified,
 * delete the token (single-use). Returns the email on success, null otherwise.
 */
export async function verifyToken(
  token: string,
): Promise<{ email: string } | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return null;

  if (record.expires < new Date()) {
    // Stale token — clean up opportunistically.
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return null;
  }

  const email = record.identifier;

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { email };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
