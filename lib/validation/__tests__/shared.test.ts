/**
 * Unit tests for the shared validation primitives.
 *
 * Goal: every primitive has a happy-path case and each failure mode it
 * explicitly guards against.
 */
import { describe, expect, it } from "vitest";
import {
  beamMetresSchema,
  callSignSchema,
  cuidSchema,
  dimensionMetresSchema,
  dwtSchema,
  emptyStringToUndefined,
  hexColorSchema,
  imoSchema,
  mmsiSchema,
  moneySchema,
  speedKnotsSchema,
  yearBuiltSchema,
} from "../shared";

describe("imoSchema", () => {
  it("accepts a 7-digit IMO", () => {
    expect(imoSchema.parse("9623148")).toBe("9623148");
  });
  it("rejects fewer than 7 digits", () => {
    expect(() => imoSchema.parse("123456")).toThrow();
  });
  it("rejects more than 7 digits", () => {
    expect(() => imoSchema.parse("12345678")).toThrow();
  });
  it("rejects non-numeric input", () => {
    expect(() => imoSchema.parse("ABCDEFG")).toThrow();
  });
  it("trims whitespace before validating", () => {
    expect(imoSchema.parse("  9623148  ")).toBe("9623148");
  });
});

describe("mmsiSchema", () => {
  it("accepts a 9-digit MMSI", () => {
    expect(mmsiSchema.parse("538006142")).toBe("538006142");
  });
  it("rejects shorter input", () => {
    expect(() => mmsiSchema.parse("12345678")).toThrow();
  });
});

describe("callSignSchema", () => {
  it("accepts a 5-character call sign", () => {
    expect(callSignSchema.parse("V7AB2")).toBe("V7AB2");
  });
  it("rejects empty strings", () => {
    expect(() => callSignSchema.parse("")).toThrow();
  });
  it("rejects 11+ characters", () => {
    expect(() => callSignSchema.parse("ABCDEFGHIJK")).toThrow();
  });
});

describe("cuidSchema", () => {
  it("accepts a valid CUID", () => {
    expect(cuidSchema.parse("clxxabc0000099qq8w7vr5l9j")).toBeTruthy();
  });
  it("rejects a plain string", () => {
    expect(() => cuidSchema.parse("not-a-cuid")).toThrow();
  });
});

describe("yearBuiltSchema", () => {
  it("accepts 2016", () => {
    expect(yearBuiltSchema.parse(2016)).toBe(2016);
  });
  it("accepts a numeric string from a form input", () => {
    expect(yearBuiltSchema.parse("2016")).toBe(2016);
  });
  it("rejects years before 1970", () => {
    expect(() => yearBuiltSchema.parse(1969)).toThrow();
  });
  it("rejects years > current year + 4", () => {
    const tooFar = new Date().getFullYear() + 5;
    expect(() => yearBuiltSchema.parse(tooFar)).toThrow();
  });
  it("rejects non-integers", () => {
    expect(() => yearBuiltSchema.parse(2016.5)).toThrow();
  });
});

describe("dwtSchema", () => {
  it("accepts 82,000", () => {
    expect(dwtSchema.parse(82_000)).toBe(82_000);
  });
  it("rejects zero", () => {
    expect(() => dwtSchema.parse(0)).toThrow();
  });
  it("rejects negative values", () => {
    expect(() => dwtSchema.parse(-1)).toThrow();
  });
  it("rejects > 1,000,000", () => {
    expect(() => dwtSchema.parse(1_000_001)).toThrow();
  });
});

describe("moneySchema", () => {
  it("accepts 28,500,000", () => {
    expect(moneySchema.parse(28_500_000)).toBe(28_500_000);
  });
  it("accepts zero", () => {
    expect(moneySchema.parse(0)).toBe(0);
  });
  it("rejects negative", () => {
    expect(() => moneySchema.parse(-100)).toThrow();
  });
});

describe("dimensionMetresSchema", () => {
  it("accepts 229", () => {
    expect(dimensionMetresSchema.parse(229)).toBe(229);
  });
  it("rejects > 500", () => {
    expect(() => dimensionMetresSchema.parse(501)).toThrow();
  });
});

describe("beamMetresSchema", () => {
  it("accepts 32.2", () => {
    expect(beamMetresSchema.parse(32.2)).toBeCloseTo(32.2);
  });
  it("rejects > 80", () => {
    expect(() => beamMetresSchema.parse(81)).toThrow();
  });
});

describe("speedKnotsSchema", () => {
  it("accepts 14.5", () => {
    expect(speedKnotsSchema.parse(14.5)).toBeCloseTo(14.5);
  });
  it("rejects > 50", () => {
    expect(() => speedKnotsSchema.parse(60)).toThrow();
  });
});

describe("hexColorSchema", () => {
  it("accepts #248FF9", () => {
    expect(hexColorSchema.parse("#248FF9")).toBe("#248FF9");
  });
  it("rejects names like 'blue'", () => {
    expect(() => hexColorSchema.parse("blue")).toThrow();
  });
  it("rejects short hex like #248", () => {
    expect(() => hexColorSchema.parse("#248")).toThrow();
  });
});

describe("emptyStringToUndefined", () => {
  it("converts empty string to undefined", () => {
    const schema = emptyStringToUndefined(callSignSchema.optional());
    expect(schema.parse("")).toBeUndefined();
  });
  it("converts whitespace-only to undefined", () => {
    const schema = emptyStringToUndefined(callSignSchema.optional());
    expect(schema.parse("   ")).toBeUndefined();
  });
  it("passes a real value through", () => {
    const schema = emptyStringToUndefined(callSignSchema.optional());
    expect(schema.parse("V7AB2")).toBe("V7AB2");
  });
});
