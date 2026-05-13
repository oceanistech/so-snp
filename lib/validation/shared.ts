/**
 * Shared Zod primitives used across feature schemas.
 *
 * Keep generic, domain-agnostic validators here (IMO format, money, year,
 * hex colour, CUID). Feature-specific composed schemas live next to the
 * feature (`lib/validation/vessel.ts`, `lib/validation/fleet.ts`, …).
 */
import { z } from "zod";

/* --------------------------------------------------------------------------
 * Identifiers
 * -------------------------------------------------------------------------- */

/**
 * Prisma CUID — 25-character lowercase string starting with "c".
 * Zod ships a built-in `.cuid()` matcher that accepts this exact format.
 */
export const cuidSchema = z.string().cuid("Must be a valid id");

/**
 * IMO number — exactly 7 digits.
 *
 * The IMO is a globally-unique 7-digit identifier assigned to a hull at
 * the time of registration. Vessels not yet in Signal Ocean are still
 * required to have an assigned IMO when added to the platform — see
 * ADR-0002 and the §"future-IMO vessels" decision.
 */
export const imoSchema = z
  .string()
  .trim()
  .regex(/^\d{7}$/, "IMO must be exactly 7 digits");

/**
 * MMSI number — exactly 9 digits when present.
 */
export const mmsiSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$/, "MMSI must be exactly 9 digits");

/**
 * Call sign — 1–10 characters, alphanumeric (no enforcement of region
 * prefixes; ITU-T E.218 allows broad latitude).
 */
export const callSignSchema = z
  .string()
  .trim()
  .min(1)
  .max(10, "Call sign cannot exceed 10 characters");

/* --------------------------------------------------------------------------
 * Numeric helpers — all `coerce` so HTML inputs (always strings) pass.
 * -------------------------------------------------------------------------- */

/** Year built — at or after 1970, at most 4 years past the current year. */
export const yearBuiltSchema = z.coerce
  .number()
  .int("Year must be a whole number")
  .min(1970, "Year must be 1970 or later")
  .max(
    new Date().getFullYear() + 4,
    "Year cannot be more than 4 years in the future",
  );

/** Positive integer cap, used for DWT (max 1,000,000 t covers any real hull). */
export const dwtSchema = z.coerce
  .number()
  .int("DWT must be a whole number")
  .positive("DWT must be greater than zero")
  .max(1_000_000, "DWT cannot exceed 1,000,000 tonnes");

/** Generic non-negative money value with two decimal precision allowed. */
export const moneySchema = z.coerce
  .number()
  .nonnegative("Amount cannot be negative")
  .max(999_999_999_999.99, "Amount exceeds the maximum we can store");

/** Dimension in metres — positive, up to 500m (no real hull is bigger). */
export const dimensionMetresSchema = z.coerce
  .number()
  .positive("Dimension must be greater than zero")
  .max(500, "Dimension cannot exceed 500 metres");

/** Beam — capped at 80m to keep one input from accepting bogus data. */
export const beamMetresSchema = z.coerce
  .number()
  .positive("Beam must be greater than zero")
  .max(80, "Beam cannot exceed 80 metres");

/** Service speed in knots. */
export const speedKnotsSchema = z.coerce
  .number()
  .positive("Speed must be greater than zero")
  .max(50, "Speed cannot exceed 50 knots");

/* --------------------------------------------------------------------------
 * Strings / patterns
 * -------------------------------------------------------------------------- */

/** Hex colour: `#RRGGBB`. */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid colour — expected #RRGGBB");

/** Optional free-text fallback used for the "Other" reference pattern. */
export const referenceOtherSchema = z
  .string()
  .trim()
  .min(1, "Please type the name")
  .max(120, "Name cannot exceed 120 characters");

/* --------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

/**
 * Treat empty strings as undefined. Useful for HTML form inputs where a
 * blank `<input>` arrives as "" but the underlying field is optional.
 */
export function emptyStringToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    schema,
  );
}

/**
 * Ensure at most one of (referenceId, referenceOther) is set. Used in feature
 * schemas via `.superRefine()` for each FK + "Other" pair on a Vessel.
 */
export function ensureAtMostOneOf<T extends Record<string, unknown>>(
  data: T,
  ctx: z.RefinementCtx,
  idKey: keyof T & string,
  otherKey: keyof T & string,
  label: string,
) {
  const id = data[idKey];
  const other = data[otherKey];
  if (id && other) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [otherKey],
      message: `Pick either an existing ${label} or enter a new one, not both`,
    });
  }
}
