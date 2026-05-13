/**
 * Schema smoke test — verifies the Prisma client compiles with the new models
 * and enums introduced for the Fleets & Vessels module (OT-175). Doesn't
 * connect to the database — that's covered by repository tests in step 9.
 *
 * If this file fails to type-check, either:
 *   - schema.prisma diverged from what the test expects, or
 *   - `pnpm db:generate` hasn't been run after a schema edit.
 */
import { describe, expect, it } from "vitest";
import {
  Currency,
  EmploymentStatus,
  EnvScore,
  FleetVisibility,
  PendingReferenceStatus,
  PendingReferenceTable,
  CounterpartyType,
  VesselLifecycleStatus,
} from "@prisma/client";

describe("Prisma schema — enum values", () => {
  it("FleetVisibility includes PRIVATE, TEAM, READ_ONLY", () => {
    expect(FleetVisibility.PRIVATE).toBe("PRIVATE");
    expect(FleetVisibility.TEAM).toBe("TEAM");
    expect(FleetVisibility.READ_ONLY).toBe("READ_ONLY");
  });

  it("Currency includes USD, EUR, GBP, JPY, CNY", () => {
    expect(Object.values(Currency)).toEqual(
      expect.arrayContaining(["USD", "EUR", "GBP", "JPY", "CNY"]),
    );
  });

  it("EmploymentStatus represents earnings buckets", () => {
    expect(Object.values(EmploymentStatus)).toEqual(
      expect.arrayContaining(["CURRENT_EARNINGS", "HISTORIC_EARNINGS", "FUTURE_EARNINGS"]),
    );
  });

  it("VesselLifecycleStatus covers the documented values", () => {
    expect(Object.values(VesselLifecycleStatus)).toEqual(
      expect.arrayContaining(["ACTIVE", "LAID_UP", "DRYDOCK", "SOLD", "SCRAPPED"]),
    );
  });

  it("EnvScore covers A-E", () => {
    expect(Object.values(EnvScore)).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("CounterpartyType covers all 11 roles", () => {
    expect(Object.values(CounterpartyType)).toEqual(
      expect.arrayContaining([
        "OWNER",
        "BUYER",
        "SELLER",
        "CHARTERER",
        "OPERATOR",
        "LENDER",
        "FINANCIER",
        "BROKER",
        "MANAGER",
        "TECHNICAL_MANAGER",
        "INSURER",
      ]),
    );
  });

  it("PendingReferenceTable covers the six lookup tables that accept Other", () => {
    expect(Object.values(PendingReferenceTable)).toEqual(
      expect.arrayContaining([
        "PORT",
        "SHIPYARD",
        "CLASS_SOCIETY",
        "ENGINE_MAKER",
        "ENGINE_MODEL",
        "COUNTERPARTY",
      ]),
    );
  });

  it("PendingReferenceStatus has PENDING, MERGED, REJECTED", () => {
    expect(Object.values(PendingReferenceStatus)).toEqual([
      "PENDING",
      "MERGED",
      "REJECTED",
    ]);
  });
});
