/**
 * Seed script for Signal S&P.
 *
 * Creates one demo organisation and one OWNER user with a known dev password
 * so the credentials provider on /sign-in works out of the box.
 *
 * Run with:  pnpm db:seed
 *
 * Idempotent — safe to run repeatedly.
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEV_EMAIL = "dev@signalsp.local";
const DEV_PASSWORD = "password";
const DEV_ORG_SLUG = "signal-sp-dev";

async function main() {
  console.log("[seed] connecting…");

  const passwordHash = await hash(DEV_PASSWORD, 10);

  const org = await prisma.org.upsert({
    where: { slug: DEV_ORG_SLUG },
    update: { name: "Signal S&P (dev)" },
    create: { slug: DEV_ORG_SLUG, name: "Signal S&P (dev)" },
  });
  console.log(`[seed] org   ${org.slug} (${org.id})`);

  const user = await prisma.user.upsert({
    where: { email: DEV_EMAIL },
    update: { passwordHash, name: "Dev User" },
    create: {
      email: DEV_EMAIL,
      name: "Dev User",
      passwordHash,
      emailVerified: new Date(),
    },
  });
  console.log(`[seed] user  ${user.email} (${user.id})`);

  await prisma.membership.upsert({
    where: { orgId_userId: { orgId: org.id, userId: user.id } },
    update: { role: "OWNER" },
    create: { orgId: org.id, userId: user.id, role: "OWNER" },
  });
  console.log(`[seed] membership ${user.email} -> OWNER of ${org.slug}`);

  console.log("[seed] done.");
  console.log(`[seed] sign in at /sign-in with ${DEV_EMAIL} / ${DEV_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
