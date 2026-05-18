/**
 * Unit tests for VesselService.
 *
 * The repo is mocked. Tests cover:
 *   - the row → UI shape projection
 *   - type-root derivation from hierarchical code (BULK.PANAMAX → BULK)
 *   - currentFmv null-safety + Decimal-to-number coercion
 *   - fleet membership flattening
 */
import { describe, expect, it, vi } from "vitest";
import { VesselService, VesselConflictError } from "../vessel.service";
import type { VesselRepository } from "@/lib/db/repositories/vessel.repository";

function makeRepo(rows: unknown[]) {
  return {
    listForOrg: vi.fn(async () => rows),
    listAttachableForOrg: vi.fn(async () => rows),
    countForOrg: vi.fn(async () => rows.length),
    findByImoAndName: vi.fn(async () => null),
    create: vi.fn(async (data: unknown) => ({ id: "vessel-new", ...(data as object) })),
    getDetailById: vi.fn(),
  } as unknown as VesselRepository;
}

describe("VesselService.listForOrg projection", () => {
  it("maps BULK.PANAMAX → typeRoot 'BULK'", async () => {
    const svc = new VesselService(
      makeRepo([
        {
          id: "v1",
          imo: "9623148",
          name: "MV Pacific Star",
          yearBuilt: 2016,
          dwt: 82000,
          currentFmv: "28.5",
          envScore: "A",
          lifecycleStatus: "ACTIVE",
          employmentStatus: "CURRENT_EARNINGS",
          isOnSale: false,
          vesselType: { code: "BULK.PANAMAX", name: "Panamax Bulk", shortLabel: "BULK" },
          fleetVessels: [
            { fleet: { id: "f1", slug: "alpha", name: "Fleet Alpha" } },
          ],
        },
      ]),
    );
    const [v] = await svc.listForOrg("org_1");
    if (!v) throw new Error("expected at least one vessel");
    expect(v.typeRoot).toBe("BULK");
    expect(v.typeLabel).toBe("Panamax Bulk");
    expect(v.currentFmvUsd).toBeCloseTo(28.5, 1);
    expect(v.fleets).toEqual([{ id: "f1", slug: "alpha", name: "Fleet Alpha" }]);
  });

  it("falls back to typeRoot='OTHER' for unknown codes", async () => {
    const svc = new VesselService(
      makeRepo([
        {
          id: "v2",
          imo: "9712305",
          name: "Strange Vessel",
          yearBuilt: 2018,
          dwt: 60000,
          currentFmv: null,
          envScore: null,
          lifecycleStatus: "ACTIVE",
          employmentStatus: "CURRENT_EARNINGS",
          isOnSale: false,
          vesselType: { code: "SPECIAL.HEAVYLIFT", name: "Heavy Lift", shortLabel: null },
          fleetVessels: [],
        },
      ]),
    );
    const [v] = await svc.listForOrg("org_1");
    if (!v) throw new Error("expected at least one vessel");
    expect(v.typeRoot).toBe("OTHER");
    expect(v.currentFmvUsd).toBeNull();
    expect(v.fleets).toEqual([]);
  });

  it("recognises every known root (BULK/TANKER/GAS/CONTAINER/OFFSHORE)", async () => {
    const codes = [
      ["BULK.CAPESIZE", "BULK"],
      ["TANKER.VLCC", "TANKER"],
      ["GAS.LNG", "GAS"],
      ["CONTAINER.PANAMAX", "CONTAINER"],
      ["OFFSHORE.PSV", "OFFSHORE"],
    ] as const;
    for (const [code, expected] of codes) {
      const svc = new VesselService(
        makeRepo([
          {
            id: "v",
            imo: "9000000",
            name: "X",
            yearBuilt: 2020,
            dwt: 10000,
            currentFmv: null,
            envScore: null,
            lifecycleStatus: "ACTIVE",
            employmentStatus: "CURRENT_EARNINGS",
            isOnSale: false,
            vesselType: { code, name: code, shortLabel: null },
            fleetVessels: [],
          },
        ]),
      );
      const [v] = await svc.listForOrg("org_1");
      if (!v) throw new Error("expected at least one vessel");
      expect(v.typeRoot).toBe(expected);
    }
  });
});

describe("VesselService.listAttachableForOrg", () => {
  it("returns the trimmed projection used by the create-fleet checklist", async () => {
    const svc = new VesselService(
      makeRepo([
        {
          id: "v1",
          imo: "9623148",
          name: "MV Pacific Star",
          yearBuilt: 2016,
          vesselType: { code: "BULK.PANAMAX", name: "Panamax Bulk", shortLabel: "BULK" },
        },
      ]),
    );
    const [v] = await svc.listAttachableForOrg("org_1");
    if (!v) throw new Error("expected at least one vessel");
    expect(v).toEqual({
      id: "v1",
      imo: "9623148",
      name: "MV Pacific Star",
      yearBuilt: 2016,
      typeCode: "BULK.PANAMAX",
      typeLabel: "Panamax Bulk",
      typeRoot: "BULK",
    });
  });
});

/* --------------------------------------------------------------------------
 * VesselService.create
 * -------------------------------------------------------------------------- */

function makeRepoWithDupe(existing: { imo: string; name: string } | null) {
  // Type the full 3-arg signature so `create.mock.calls[0]` is a 3-tuple.
  const create = vi.fn(
    async (
      data: Record<string, unknown>,
      _fleetId: string | undefined,
      _addedBy: string | undefined,
    ) => ({ id: "vessel-new", ...data }),
  );
  return {
    repo: {
      listForOrg: vi.fn(),
      listAttachableForOrg: vi.fn(),
      countForOrg: vi.fn(),
      findByImoAndName: vi.fn(async (_orgId: string, imo: string, name: string) =>
        existing && existing.imo === imo && existing.name.toLowerCase() === name.toLowerCase()
          ? { id: "existing", imo, name }
          : null,
      ),
      create,
      getDetailById: vi.fn(),
    } as unknown as VesselRepository,
    create,
  };
}

const validInput = {
  imo: "9623148",
  name: "MV Pacific Star",
  vesselTypeId: "type_1",
  yearBuilt: 2016,
  dwt: 82_000,
  flagCountryId: "country_1",
};

describe("VesselService.create — happy path", () => {
  it("trims name + imo and forwards everything else to the repository", async () => {
    const { repo, create } = makeRepoWithDupe(null);
    const svc = new VesselService(repo);
    const vessel = await svc.create(
      "org_1",
      { ...validInput, name: "  MV Pacific Star  ", imo: " 9623148 " },
      "user_1",
    );
    expect(create).toHaveBeenCalledOnce();
    const [data, fleetId, addedBy] = create.mock.calls[0]!;
    expect(data).toMatchObject({
      orgId: "org_1",
      createdBy: "user_1",
      imo: "9623148",
      name: "MV Pacific Star",
      vesselTypeId: "type_1",
      yearBuilt: 2016,
      dwt: 82_000,
      flagCountryId: "country_1",
    });
    expect(fleetId).toBeUndefined();
    expect(addedBy).toBe("user_1");
    expect(vessel.id).toBe("vessel-new");
  });

  it("forwards fleetId so the repo attaches the vessel in the same txn", async () => {
    const { repo, create } = makeRepoWithDupe(null);
    const svc = new VesselService(repo);
    await svc.create("org_1", { ...validInput, fleetId: "fleet_x" }, "user_1");
    const [_data, fleetId] = create.mock.calls[0]!;
    expect(fleetId).toBe("fleet_x");
  });

  it("strips fleetId from the vessel payload (it lives on FleetVessel)", async () => {
    const { repo, create } = makeRepoWithDupe(null);
    const svc = new VesselService(repo);
    await svc.create("org_1", { ...validInput, fleetId: "fleet_x" }, "user_1");
    const [data] = create.mock.calls[0]!;
    expect(data).not.toHaveProperty("fleetId");
  });
});

describe("VesselService.create — uniqueness", () => {
  it("throws VesselConflictError on exact (imo, name) duplicate", async () => {
    const { repo } = makeRepoWithDupe({ imo: "9623148", name: "MV Pacific Star" });
    const svc = new VesselService(repo);
    await expect(svc.create("org_1", validInput, "user_1")).rejects.toBeInstanceOf(
      VesselConflictError,
    );
  });

  it("throws VesselConflictError on case-insensitive name duplicate", async () => {
    const { repo } = makeRepoWithDupe({ imo: "9623148", name: "MV Pacific Star" });
    const svc = new VesselService(repo);
    await expect(
      svc.create("org_1", { ...validInput, name: "mv pacific star" }, "user_1"),
    ).rejects.toBeInstanceOf(VesselConflictError);
  });

  it("allows same IMO with a different name (per ADR-0002)", async () => {
    const { repo, create } = makeRepoWithDupe({ imo: "9623148", name: "MV Pacific Star" });
    const svc = new VesselService(repo);
    await svc.create(
      "org_1",
      { ...validInput, name: "MV Pacific Star (ex-Bluestar)" },
      "user_1",
    );
    expect(create).toHaveBeenCalledOnce();
  });
});
