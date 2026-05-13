/**
 * Unit tests for VesselCreateSchema and VesselUpdateSchema.
 *
 * Covers:
 *   - happy path with the minimum required field set
 *   - every required-field failure mode
 *   - format validators (IMO, MMSI, year, DWT)
 *   - cross-field "Other" fallback rules
 *   - default values
 */
import { describe, expect, it } from "vitest";
import { VesselCreateSchema, VesselUpdateSchema } from "../vessel";

const validCuid = "clxxabc0000099qq8w7vr5l9j";
const anotherCuid = "clyyabc0000088pp7v6tw4k8i";

const minimumValid = {
  name: "MV Pacific Star",
  imo: "9623148",
  flagCountryId: validCuid,
  vesselTypeId: anotherCuid,
  yearBuilt: 2016,
  dwt: 82_000,
};

describe("VesselCreateSchema — happy path", () => {
  it("accepts the minimum required fields", () => {
    const parsed = VesselCreateSchema.parse(minimumValid);
    expect(parsed.name).toBe("MV Pacific Star");
    expect(parsed.imo).toBe("9623148");
  });

  it("applies sensible defaults", () => {
    const parsed = VesselCreateSchema.parse(minimumValid);
    expect(parsed.currency).toBe("USD");
    expect(parsed.lifecycleStatus).toBe("ACTIVE");
    expect(parsed.employmentStatus).toBe("CURRENT_EARNINGS");
    expect(parsed.isOnSale).toBe(false);
    expect(parsed.fleetId).toBeUndefined();
  });

  it("accepts a full payload with every optional field", () => {
    const parsed = VesselCreateSchema.parse({
      ...minimumValid,
      mmsi: "538006142",
      callSign: "V7AB2",
      portOfRegistryId: anotherCuid,
      grt: 44200,
      loaM: 229,
      beamM: 32.2,
      draftM: 14.4,
      acquisitionCost: 26_000_000,
      acquisitionDate: "2018-01-15",
      currentFmv: 28_500_000,
      outstandingLoan: 12_000_000,
      isOnSale: true,
      onSaleAt: "2026-04-01",
      notes: "Long-term TC with Oldendorff.",
    });
    expect(parsed.mmsi).toBe("538006142");
    expect(parsed.isOnSale).toBe(true);
  });
});

describe("VesselCreateSchema — required-field failures", () => {
  it("rejects when name is missing", () => {
    const { name: _name, ...rest } = minimumValid;
    expect(() => VesselCreateSchema.parse(rest)).toThrow();
  });
  it("rejects when imo is missing", () => {
    const { imo: _imo, ...rest } = minimumValid;
    expect(() => VesselCreateSchema.parse(rest)).toThrow();
  });
  it("rejects when both flagCountryId and flagOther are missing", () => {
    const { flagCountryId: _flag, ...rest } = minimumValid;
    expect(() => VesselCreateSchema.parse(rest)).toThrow(/flag state is required/i);
  });
  it("accepts when flagOther is provided instead of flagCountryId", () => {
    const { flagCountryId: _flag, ...rest } = minimumValid;
    const parsed = VesselCreateSchema.parse({ ...rest, flagOther: "Liberia" });
    expect(parsed.flagOther).toBe("Liberia");
  });
  it("rejects when vesselTypeId is missing", () => {
    const { vesselTypeId: _vt, ...rest } = minimumValid;
    expect(() => VesselCreateSchema.parse(rest)).toThrow();
  });
  it("rejects when yearBuilt is missing", () => {
    const { yearBuilt: _yb, ...rest } = minimumValid;
    expect(() => VesselCreateSchema.parse(rest)).toThrow();
  });
  it("rejects when dwt is missing", () => {
    const { dwt: _dwt, ...rest } = minimumValid;
    expect(() => VesselCreateSchema.parse(rest)).toThrow();
  });
});

describe("VesselCreateSchema — format validators", () => {
  it("rejects IMO not 7 digits", () => {
    expect(() => VesselCreateSchema.parse({ ...minimumValid, imo: "12345" })).toThrow();
  });
  it("rejects MMSI not 9 digits when provided", () => {
    expect(() => VesselCreateSchema.parse({ ...minimumValid, mmsi: "12345" })).toThrow();
  });
  it("rejects yearBuilt < 1970", () => {
    expect(() => VesselCreateSchema.parse({ ...minimumValid, yearBuilt: 1969 })).toThrow();
  });
  it("rejects negative DWT", () => {
    expect(() => VesselCreateSchema.parse({ ...minimumValid, dwt: -1 })).toThrow();
  });
  it("rejects negative money values", () => {
    expect(() =>
      VesselCreateSchema.parse({ ...minimumValid, currentFmv: -1 }),
    ).toThrow();
  });
});

describe("VesselCreateSchema — Other fallback cross-field rules", () => {
  it("rejects when both shipyardId AND shipyardOther are set", () => {
    expect(() =>
      VesselCreateSchema.parse({
        ...minimumValid,
        shipyardId: validCuid,
        shipyardOther: "Hyundai Heavy Industries",
      }),
    ).toThrow();
  });
  it("rejects when both flagCountryId AND flagOther are set", () => {
    expect(() =>
      VesselCreateSchema.parse({
        ...minimumValid,
        flagOther: "Liberia",
      }),
    ).toThrow();
  });
  it("accepts only shipyardOther when shipyardId is absent", () => {
    const parsed = VesselCreateSchema.parse({
      ...minimumValid,
      shipyardOther: "Independent yard",
    });
    expect(parsed.shipyardOther).toBe("Independent yard");
    expect(parsed.shipyardId).toBeUndefined();
  });
});

describe("VesselCreateSchema — sale and date rules", () => {
  it("rejects acquisitionDate in the future", () => {
    const future = new Date(Date.now() + 86_400_000 * 30); // 30 days ahead
    expect(() =>
      VesselCreateSchema.parse({
        ...minimumValid,
        acquisitionDate: future.toISOString(),
      }),
    ).toThrow(/cannot be in the future/i);
  });

  it("rejects onSaleAt when isOnSale=false", () => {
    expect(() =>
      VesselCreateSchema.parse({
        ...minimumValid,
        isOnSale: false,
        onSaleAt: "2026-04-01",
      }),
    ).toThrow(/marked on sale/i);
  });

  it("accepts onSaleAt when isOnSale=true", () => {
    const parsed = VesselCreateSchema.parse({
      ...minimumValid,
      isOnSale: true,
      onSaleAt: "2026-04-01",
    });
    expect(parsed.onSaleAt).toBeInstanceOf(Date);
  });
});

describe("VesselUpdateSchema", () => {
  it("accepts a partial update with just one field", () => {
    const parsed = VesselUpdateSchema.parse({ currentFmv: 30_000_000 });
    expect(parsed.currentFmv).toBe(30_000_000);
  });
  it("still enforces format validators when fields are present", () => {
    expect(() => VesselUpdateSchema.parse({ imo: "abc" })).toThrow();
  });
  it("still enforces 'Other' cross-field rule", () => {
    expect(() =>
      VesselUpdateSchema.parse({
        shipyardId: validCuid,
        shipyardOther: "Independent yard",
      }),
    ).toThrow();
  });
});
