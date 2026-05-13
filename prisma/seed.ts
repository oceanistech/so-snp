/**
 * Seed script for Signal S&P.
 *
 * Order of operations:
 *   1. Dev organisation + OWNER user (so /sign-in works out of the box).
 *   2. Platform-global reference data (countries, ports, vessel types,
 *      shipyards, class societies, engine makers/models, counterparties).
 *      See ADR-0003.
 *   3. Demo fleets and vessels under the dev org.
 *
 * Idempotent — safe to run repeatedly. Re-running won't duplicate rows.
 *
 * Run with:  pnpm db:seed
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { seedReferenceData } from "./seed/reference";
import { seedDemoFleetsAndVessels } from "./seed/demo";

const prisma = new PrismaClient();

const DEV_EMAIL = process.env.SEED_USER_EMAIL ?? "engineroom@oceanis.io";
const DEV_PASSWORD = process.env.SEED_USER_PASSWORD ?? "engineroom";
const DEV_ORG_SLUG = "signal-sp-dev";

async function main() {
  console.log("[seed] connecting…");

  // 1. Dev org + OWNER user
  const passwordHash = await hash(DEV_PASSWORD, 10);

  const org = await prisma.org.upsert({
    where: { slug: DEV_ORG_SLUG },
    update: { name: "Signal S&P (dev)" },
    create: { slug: DEV_ORG_SLUG, name: "Signal S&P (dev)" },
  });
  console.log(`[seed] org   ${org.slug} (${org.id})`);

  const user = await prisma.user.upsert({
    where: { email: DEV_EMAIL },
    update: { passwordHash, name: "Engine Room" },
    create: {
      email: DEV_EMAIL,
      name: "Engine Room",
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

  // 2. Reference data
  const refCounts = await seedReferenceData(prisma);
  console.log(
    `[seed] reference ${refCounts.countries} countries · ${refCounts.ports} ports · ` +
      `${refCounts.vesselTypes} vessel types · ${refCounts.shipyards} shipyards · ` +
      `${refCounts.classSocieties} class societies · ${refCounts.engineMakers} engine makers / ${refCounts.engineModels} models · ` +
      `${refCounts.counterparties} counterparties`,
  );

  // 3. Demo fleets + vessels
  const demoCounts = await seedDemoFleetsAndVessels(prisma, org.id, user.id);
  console.log(
    `[seed] demo      ${demoCounts.fleets} fleets · ${demoCounts.vessels} vessels ` +
      `(${demoCounts.assignedToFleet} in fleets, ${demoCounts.unassigned} unassigned)`,
  );

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
