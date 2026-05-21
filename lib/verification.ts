import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

const TOKEN_BYTES = 32; // 64 hex chars
const TOKEN_TTL_HOURS = 24;
const PASSWORD_RESET_TTL_HOURS = 1;

/**
 * Identifier prefix used to distinguish password-reset tokens from
 * email-verification tokens in the shared `VerificationToken` table.
 * Reset tokens store `pwreset:<email>` in the `identifier` column;
 * verification tokens store the bare email. Lookups use this to refuse
 * cross-flow token reuse (an email-verification token can't reset a
 * password, and vice versa).
 */
const PASSWORD_RESET_PREFIX = "pwreset:";

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
 * delete the token (single-use). On first verification we also create a
 * personal Org + OWNER Membership so the user can immediately access
 * `(app)/` routes — without it `requireSession()` throws
 * `NoMembershipError` and every authenticated page 500s.
 *
 * Returns the email on success, null otherwise.
 *
 * NOTE on scope: this is a deliberately minimal onboarding flow suited
 * to dev / staging where there's no real invite system yet. In a
 * production multi-tenant setup the typical pattern is admin-issued
 * invites that pre-create the Membership; on accepting the invite the
 * user only gets bound to an existing Org. When that flow ships, the
 * auto-org-creation block below should be gated behind a feature flag
 * (e.g. `ALLOW_SELF_SERVE_ORG=true`) or removed.
 */
export async function verifyToken(
  token: string,
): Promise<{ email: string } | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return null;

  // Cross-flow safety: a password-reset token in the same table must
  // never satisfy an email-verification request. Identifier prefix
  // gates the type.
  if (record.identifier.startsWith(PASSWORD_RESET_PREFIX)) return null;

  if (record.expires < new Date()) {
    // Stale token — clean up opportunistically.
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return null;
  }

  const email = record.identifier;

  await prisma.$transaction(async (tx) => {
    // Mark verified + consume the (single-use) token atomically.
    const user = await tx.user.update({
      where: { email },
      data: { emailVerified: new Date() },
      select: {
        id: true,
        name: true,
        memberships: { select: { id: true }, take: 1 },
      },
    });
    await tx.verificationToken.delete({ where: { token } });

    // If this user already belongs to an org (e.g. they were attached
    // manually via SQL, or were invited in a future flow), skip
    // auto-creation so we don't end up with a dangling second org.
    if (user.memberships.length > 0) return;

    // Derive a unique-ish slug from the email local part with a short
    // random suffix. The Org table has @@unique on `slug` so a
    // collision would throw — the random suffix makes that vanishingly
    // unlikely for the volumes we expect on dev/staging.
    const localPart = email.split("@")[0] ?? "workspace";
    const baseSlug = localPart
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30) || "workspace";
    const slug = `${baseSlug}-${randomBytes(3).toString("hex")}`;

    const orgName = user.name ? `${user.name}'s workspace` : `${localPart}'s workspace`;

    const org = await tx.org.create({
      data: { slug, name: orgName },
      select: { id: true },
    });

    await tx.membership.create({
      data: {
        orgId: org.id,
        userId: user.id,
        role: "OWNER",
      },
    });
  });

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

/* --------------------------------------------------------------------------
 * Password reset — same table, prefixed identifier, 1-hour TTL.
 * -------------------------------------------------------------------------- */

/**
 * Generate a random hex token for a password reset and persist it. The
 * identifier column is prefixed with `pwreset:` so `verifyToken` (the
 * email-verification path) can't accidentally consume it. Returns the
 * raw token to be embedded in the reset email.
 *
 * If a previous reset token already exists for the same email (user
 * clicked "Forgot password" twice), the older one is left alone — both
 * are independently consumable until expiry. We keep this loose because
 * tokens are single-use anyway and the volume is low; if abuse becomes
 * an issue, delete older tokens for the same identifier here.
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const expires = new Date(Date.now() + PASSWORD_RESET_TTL_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      identifier: `${PASSWORD_RESET_PREFIX}${email}`,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Send a "reset your password" email containing a link to
 * /reset-password?token=...
 */
export async function sendPasswordResetEmail(opts: {
  to: string;
  name?: string;
  token: string;
}) {
  const baseUrl =
    process.env.AUTH_URL ??
    process.env.APP_BASE_URL ??
    "http://localhost:3000";

  const url = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(
    opts.token,
  )}`;
  const name = opts.name ?? "there";

  await sendMail({
    to: opts.to,
    subject: "Reset your password — Signal S&P",
    text:
      `Hi ${name},\n\n` +
      `Someone requested a password reset for this account. If it was you, ` +
      `click the link below to choose a new password:\n\n` +
      `${url}\n\n` +
      `This link expires in 1 hour. If you didn't request a reset, you can ` +
      `safely ignore this email — your current password stays unchanged.`,
    html:
      `<p>Hi ${escapeHtml(name)},</p>` +
      `<p>Someone requested a password reset for this account. If it was you, ` +
      `click the link below to choose a new password:</p>` +
      `<p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` +
      `<p>This link expires in 1 hour. If you didn't request a reset, you can ` +
      `safely ignore this email — your current password stays unchanged.</p>`,
  });
}

/**
 * Validate a password-reset token and (on success) update the user's
 * password hash. The token, the password change, and the user row
 * update all happen in a single transaction so a partial failure
 * leaves the user record untouched. Returns the email on success,
 * `null` on any failure path (missing/expired token, wrong-type token,
 * user vanished mid-flow).
 */
export async function consumePasswordResetToken(
  token: string,
  newPassword: string,
): Promise<{ email: string } | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return null;

  // Cross-flow safety: this must be a password-reset token, not an
  // email-verification one. Reject the latter so a leaked verification
  // link can't be repurposed to overwrite a password.
  if (!record.identifier.startsWith(PASSWORD_RESET_PREFIX)) return null;

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return null;
  }

  const email = record.identifier.slice(PASSWORD_RESET_PREFIX.length);
  const passwordHash = await hash(newPassword, 10);

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { passwordHash },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);
  } catch {
    // Most likely: the user was deleted between issuing the token and
    // claiming it. Treat the same as an invalid token to avoid leaking
    // account state to callers.
    return null;
  }

  return { email };
}
