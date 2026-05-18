/**
 * Unit tests for FleetService.
 *
 * The repository is hand-mocked so the tests run pure-in-memory and don't
 * need a live database. We cover:
 *   - happy path (defaults applied, slug generated)
 *   - duplicate-name (case-insensitive) rejection
 *   - slug collision resolution (-2, -3, …)
 *   - vessel attachment side-effect
 *   - listForOrg KPI computation (DWT, FMV, age, type mix)
 *   - slugify edge cases
 */
import { describe, expect, it, vi } from "vitest";
import {
  FleetNameConflictError,
  FleetService,
  slugify,
} from "../fleet.service";
import type { FleetRepository } from "@/lib/db/repositories/fleet.repository";

/* --------------------------------------------------------------------------
 * Repository test double
 * -------------------------------------------------------------------------- */

function makeRepoMock(initial?: {
  fleetsByName?: Set<string>;
  slugs?: Set<string>;
  listRows?: unknown[];
}) {
  const fleetsByName = new Set(
    [...(initial?.fleetsByName ?? [])].map((n) => n.toLowerCase()),
  );
  const slugs = new Set(initial?.slugs ?? []);
  const attachCalls: { fleetId: string; vesselIds: string[] }[] = [];
  const createCalls: Parameters<FleetRepository["create"]>[0][] = [];

  const repo = {
    findByNameCaseInsensitive: vi.fn(
      async (_orgId: string, name: string) =>
        fleetsByName.has(name.toLowerCase())
          ? { id: "existing", name }
          : null,
    ),
    slugsStartingWith: vi.fn(async (_orgId: string, prefix: string) => {
      const matching = new Set<string>();
      for (const s of slugs) if (s.startsWith(prefix)) matching.add(s);
      return matching;
    }),
    create: vi.fn(async (data) => {
      createCalls.push(data);
      slugs.add(data.slug);
      fleetsByName.add(String(data.name).toLowerCase());
      return {
        id: "fleet-" + data.slug,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
    }),
    attachVessels: vi.fn(async (fleetId, vesselIds) => {
      attachCalls.push({ fleetId, vesselIds });
      return { count: vesselIds.length };
    }),
    listForOrg: vi.fn(async () => initial?.listRows ?? []),
    getById: vi.fn(),
  } as unknown as FleetRepository;

  return { repo, attachCalls, createCalls };
}

/* --------------------------------------------------------------------------
 * slugify
 * -------------------------------------------------------------------------- */

describe("slugify", () => {
  it("converts spaces to hyphens and lowercases", () => {
    expect(slugify("Fleet Alpha")).toBe("fleet-alpha");
  });
  it("strips diacritics", () => {
    expect(slugify("Côte d'Azur Fleet")).toBe("cote-d-azur-fleet");
  });
  it("collapses repeated separators", () => {
    expect(slugify("  Fleet   ---  Beta  ")).toBe("fleet-beta");
  });
  it("trims to 60 chars", () => {
    const huge = "A".repeat(200);
    expect(slugify(huge).length).toBeLessThanOrEqual(60);
  });
  it("falls back to 'fleet' for all-symbol input", () => {
    expect(slugify("@@@@")).toBe("fleet");
  });
});

/* --------------------------------------------------------------------------
 * FleetService.create
 * -------------------------------------------------------------------------- */

describe("FleetService.create — happy path", () => {
  it("applies defaults (type Mixed, USD, PRIVATE) and generates a slug", async () => {
    const { repo, createCalls } = makeRepoMock();
    const svc = new FleetService(repo);
    const fleet = await svc.create("org_1", { name: "Fleet Gamma" });

    expect(createCalls).toHaveLength(1);
    expect(createCalls[0]).toMatchObject({
      orgId: "org_1",
      slug: "fleet-gamma",
      name: "Fleet Gamma",
      type: "Mixed",
      currency: "USD",
      visibility: "PRIVATE",
    });
    expect(fleet.slug).toBe("fleet-gamma");
  });

  it("attaches vessels when vesselIds are provided", async () => {
    const { repo, attachCalls } = makeRepoMock();
    const svc = new FleetService(repo);
    await svc.create("org_1", {
      name: "Asia Pac",
      vesselIds: ["v1", "v2", "v3"],
      ownerUserId: "user_1",
    });
    expect(attachCalls).toEqual([{ fleetId: "fleet-asia-pac", vesselIds: ["v1", "v2", "v3"] }]);
  });

  it("skips attachVessels when vesselIds is empty", async () => {
    const { repo, attachCalls } = makeRepoMock();
    const svc = new FleetService(repo);
    await svc.create("org_1", { name: "Empty Fleet", vesselIds: [] });
    expect(attachCalls).toHaveLength(0);
  });

  it("passes through visibility, currency, tag and description verbatim", async () => {
    const { repo, createCalls } = makeRepoMock();
    const svc = new FleetService(repo);
    await svc.create("org_1", {
      name: "Atlantic Tankers",
      type: "Tankers",
      currency: "EUR",
      visibility: "TEAM",
      tag: "Regional",
      description: "MR + LR1 product tankers.",
    });
    expect(createCalls[0]).toMatchObject({
      type: "Tankers",
      currency: "EUR",
      visibility: "TEAM",
      tag: "Regional",
      description: "MR + LR1 product tankers.",
    });
  });
});

/* --------------------------------------------------------------------------
 * Uniqueness + slug collision
 * -------------------------------------------------------------------------- */

describe("FleetService.create — uniqueness", () => {
  it("throws FleetNameConflictError on exact-name duplicate", async () => {
    const { repo } = makeRepoMock({ fleetsByName: new Set(["Fleet Alpha"]) });
    const svc = new FleetService(repo);
    await expect(svc.create("org_1", { name: "Fleet Alpha" })).rejects.toBeInstanceOf(
      FleetNameConflictError,
    );
  });

  it("throws FleetNameConflictError on case-insensitive duplicate", async () => {
    const { repo } = makeRepoMock({ fleetsByName: new Set(["Fleet Alpha"]) });
    const svc = new FleetService(repo);
    await expect(svc.create("org_1", { name: "fleet alpha" })).rejects.toBeInstanceOf(
      FleetNameConflictError,
    );
  });

  it("resolves slug collision by appending -2", async () => {
    const { repo, createCalls } = makeRepoMock({ slugs: new Set(["fleet-alpha"]) });
    // Note: name "Fleet Alpha (Copy)" -> slug "fleet-alpha-copy", but if the
    // base already exists with a different name we still expect -2. Force
    // collision by giving same-named-but-OK input (name dedupe not triggered).
    const svc = new FleetService(repo);
    await svc.create("org_1", { name: "Fleet Alpha" }); // distinct name first
    expect(createCalls[0]!.slug).toBe("fleet-alpha-2");
  });

  it("resolves repeated slug collisions to -3", async () => {
    const { repo, createCalls } = makeRepoMock({
      slugs: new Set(["fleet-alpha", "fleet-alpha-2"]),
    });
    const svc = new FleetService(repo);
    await svc.create("org_1", { name: "Fleet Alpha" });
    expect(createCalls[0]!.slug).toBe("fleet-alpha-3");
  });
});

/* --------------------------------------------------------------------------
 * listForOrg KPI computation
 * -------------------------------------------------------------------------- */

describe("FleetService.listForOrg", () => {
  it("computes vessel count, DWT, FMV, avg age, and type mix", async () => {
    const currentYear = new Date().getFullYear();
    const listRows = [
      {
        id: "f1",
        slug: "alpha",
        name: "Fleet Alpha",
        description: null,
        type: "Mixed",
        currency: "USD",
        visibility: "TEAM",
        tag: null,
        ownerUserId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        _count: { fleetVessels: 3 },
        fleetVessels: [
          {
            vessel: {
              id: "v1",
              yearBuilt: currentYear - 10,
              dwt: 80_000,
              currentFmv: Number("28.5"),
              vesselType: { code: "BULK.PANAMAX", name: "Panamax Bulk", shortLabel: "BULK" },
            },
          },
          {
            vessel: {
              id: "v2",
              yearBuilt: currentYear - 4,
              dwt: 80_000,
              currentFmv: Number("31.5"),
              vesselType: { code: "BULK.KAMSARMAX", name: "Kamsarmax Bulk", shortLabel: "BULK" },
            },
          },
          {
            vessel: {
              id: "v3",
              yearBuilt: currentYear - 6,
              dwt: 158_000,
              currentFmv: Number("62.0"),
              vesselType: { code: "TANKER.SUEZMAX", name: "Suezmax Tanker", shortLabel: "TANKER" },
            },
          },
        ],
      },
    ];
    const { repo } = makeRepoMock({ listRows });
    const svc = new FleetService(repo);
    const summaries = await svc.listForOrg("org_1");

    expect(summaries).toHaveLength(1);
    const s = summaries[0]!;
    expect(s.vesselCount).toBe(3);
    expect(s.totalDwt).toBe(318_000);
    expect(s.totalFmvUsd).toBeCloseTo(122.0, 1);
    expect(s.avgAgeYears).toBeCloseTo((10 + 4 + 6) / 3, 1);
    expect(s.typeMix).toEqual({ BULK: 2, TANKER: 1 });
  });

  it("returns avgAgeYears=null and zero totals for an empty fleet", async () => {
    const listRows = [
      {
        id: "f1",
        slug: "empty",
        name: "Empty Fleet",
        description: null,
        type: "Mixed",
        currency: "USD",
        visibility: "PRIVATE",
        tag: null,
        ownerUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { fleetVessels: 0 },
        fleetVessels: [],
      },
    ];
    const { repo } = makeRepoMock({ listRows });
    const svc = new FleetService(repo);
    const summaries = await svc.listForOrg("org_1");
    const s = summaries[0]!;

    expect(s.vesselCount).toBe(0);
    expect(s.totalDwt).toBe(0);
    expect(s.totalFmvUsd).toBe(0);
    expect(s.avgAgeYears).toBeNull();
    expect(s.typeMix).toEqual({});
  });
});
