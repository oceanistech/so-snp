/**
 * Unit tests for FleetCreateSchema and FleetUpdateSchema.
 *
 * The fleet schema is simpler than the vessel one — almost everything has
 * a default. Tests focus on the required name + default behaviour + a few
 * format checks.
 */
import { describe, expect, it } from "vitest";
import { FleetCreateSchema, FleetTypeSchema, FleetUpdateSchema } from "../fleet";

const validCuid = "clxxabc0000099qq8w7vr5l9j";

describe("FleetCreateSchema — happy path", () => {
  it("accepts a fleet with just a name", () => {
    const parsed = FleetCreateSchema.parse({ name: "Fleet Alpha" });
    expect(parsed.name).toBe("Fleet Alpha");
  });

  it("applies the documented defaults", () => {
    const parsed = FleetCreateSchema.parse({ name: "Fleet Alpha" });
    expect(parsed.type).toBe("Mixed");
    expect(parsed.currency).toBe("USD");
    expect(parsed.visibility).toBe("PRIVATE");
    expect(parsed.vesselIds).toEqual([]);
  });

  it("accepts a full payload with vessels attached", () => {
    const parsed = FleetCreateSchema.parse({
      name: "Asia-Pacific Fleet",
      type: "Bulk Carriers",
      currency: "USD",
      description: "Vessels operating in Asia-Pacific routes.",
      visibility: "TEAM",
      tag: "Regional",
      vesselIds: [validCuid],
    });
    expect(parsed.vesselIds).toHaveLength(1);
    expect(parsed.tag).toBe("Regional");
  });
});

describe("FleetCreateSchema — failures", () => {
  it("rejects when name is missing", () => {
    expect(() => FleetCreateSchema.parse({})).toThrow();
  });
  it("rejects name shorter than 2 chars", () => {
    expect(() => FleetCreateSchema.parse({ name: "A" })).toThrow(/required/i);
  });
  it("rejects name longer than 80 chars", () => {
    const longName = "A".repeat(81);
    expect(() => FleetCreateSchema.parse({ name: longName })).toThrow();
  });
  it("rejects unknown type", () => {
    expect(() =>
      FleetCreateSchema.parse({ name: "X", type: "Not A Type" }),
    ).toThrow();
  });
  it("rejects unknown visibility", () => {
    expect(() =>
      FleetCreateSchema.parse({ name: "X", visibility: "EVERYONE" }),
    ).toThrow();
  });
  it("rejects unknown currency", () => {
    expect(() =>
      FleetCreateSchema.parse({ name: "X", currency: "BTC" }),
    ).toThrow();
  });
  it("rejects bogus CUIDs in vesselIds", () => {
    expect(() =>
      FleetCreateSchema.parse({
        name: "Fleet",
        vesselIds: ["not-a-cuid"],
      }),
    ).toThrow();
  });
});

describe("FleetTypeSchema", () => {
  it("accepts every documented type", () => {
    for (const t of ["Mixed", "Bulk Carriers", "Tankers", "Gas Carriers", "Containers", "Offshore"]) {
      expect(FleetTypeSchema.parse(t)).toBe(t);
    }
  });
});

describe("FleetUpdateSchema", () => {
  it("accepts a partial update with just a description", () => {
    const parsed = FleetUpdateSchema.parse({ description: "updated" });
    expect(parsed.description).toBe("updated");
  });
  it("still rejects bad enum values when present", () => {
    expect(() => FleetUpdateSchema.parse({ visibility: "BOGUS" })).toThrow();
  });
});
