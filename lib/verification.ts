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
