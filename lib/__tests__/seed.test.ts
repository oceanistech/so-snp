/**
 * Seed idempotency + count test.
 *
 * Runs against the local Postgres in `so-snp-db`. Uses the live PrismaClient
 * because the seed functions are designed to be idempotent (upsert-based)
 * and don't need transaction isolation.
 *
 * Skipped when DATABASE_URL is missing or not reachable, so unit-only test
 * runs (e.g. `pnpm test` on a workstation without the DB up) still pass.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { seedReferenceData } from "@/prisma/seed/reference";
import { seedDemoFleetsAndVessels } from "@/prisma/seed/demo";

const prisma = new PrismaClient();
let dbReachable = false;

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbReachable = true;
  } catch {
    dbReachable = false;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("seedReferenceData", () => {
  it.runIf(dbReachable)("is idempotent — second run produces the same counts", async () => {
    const first = await seedReferenceData(prisma);
    const second = await seedReferenceData(prisma);
    expect(second).toEqual(first);
  });

  it.runIf(dbReachable)("produces at least the documented minimum row counts", async () => {
    const counts = await seedReferenceData(prisma);
    expect(counts.countries).toBeGreaterThanOrEqual(30);
    expect(counts.ports).toBeGreaterThanOrEqual(20);
    expect(counts.vesselTypes).toBeGreaterThanOrEqual(40);
    expect(counts.shipyards).toBeGreaterThanOrEqual(15);
    expect(counts.classSocieties).toBeGreaterThanOrEqual(11);
    expect(counts.counterparties).toBeGreaterThanOrEqual(15);
  });
});

describe("seedDemoFleetsAndVessels", () => {
  it.runIf(dbReachable)("produces 12 fleets and 40+ vessels", async () => {
    // Need the dev org and a user to attach the fleets to.
    await seedReferenceData(prisma); // ensure reference data exists first
    const org = await prisma.org.upsert({
      where: { slug: "signal-sp-dev" },
      update: {},
      create: { slug: "signal-sp-dev", name: "Signal S&P (dev)" },
    });
    const user = await prisma.user.upsert({
      where: { email: "engineroom@oceanis.io" },
      update: {},
      create: { email: "engineroom@oceanis.io", name: "Engine Room" },
    });

    const counts = await seedDemoFleetsAndVessels(prisma, org.id, user.id);
    expect(counts.fleets).toBe(12);
    expect(counts.vessels).toBeGreaterThanOrEqual(40);
    expect(counts.assignedToFleet).toBeGreaterThan(counts.unassigned);
    expect(counts.unassigned).toBeGreaterThan(0); // Unassigned pseudo-fleet has rows
  });

  it.runIf(dbReachable)("is idempotent — re-running doesn't duplicate", async () => {
    await seedReferenceData(prisma);
    const org = await prisma.org.findUniqueOrThrow({ where: { slug: "signal-sp-dev" } });
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "engineroom@oceanis.io" } });

    await seedDemoFleetsAndVessels(prisma, org.id, user.id);
    const fleetsAfter1 = await prisma.fleet.count({ where: { orgId: org.id } });
    const vesselsAfter1 = await prisma.vessel.count({ where: { orgId: org.id } });

    await seedDemoFleetsAndVessels(prisma, org.id, user.id);
    const fleetsAfter2 = await prisma.fleet.count({ where: { orgId: org.id } });
    const vesselsAfter2 = await prisma.vessel.count({ where: { orgId: org.id } });

    expect(fleetsAfter2).toBe(fleetsAfter1);
    expect(vesselsAfter2).toBe(vesselsAfter1);
  });
});
