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
import { VesselService } from "../vessel.service";
import type { VesselRepository } from "@/lib/db/repositories/vessel.repository";

function makeRepo(rows: unknown[]) {
  return {
    listForOrg: vi.fn(async () => rows),
    listAttachableForOrg: vi.fn(async () => rows),
    countForOrg: vi.fn(async () => rows.length),
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
