/**
 * Zod schemas for Fleet create / update forms.
 *
 * Same single-source-of-truth pattern as `vessel.ts`. The schema validates
 * shape and format; uniqueness (case-insensitive `(orgId, name)`) is enforced
 * at the service layer.
 */
import { z } from "zod";
import { Currency, FleetVisibility } from "@prisma/client";
import { cuidSchema, emptyStringToUndefined } from "./shared";

/** Fleet "type" — the BRD-defined informal grouping. Free-text-ish; bounded
 *  to a small enum so the dropdown stays consistent. */
export const FleetTypeSchema = z.enum([
  "Mixed",
  "Bulk Carriers",
  "Tankers",
  "Gas Carriers",
  "Containers",
  "Offshore",
]);

export type FleetType = z.infer<typeof FleetTypeSchema>;

/**
 * FleetCreateSchema — payload accepted by /fleetspace/new.
 *
 * Required fields (* in the UI): name. Everything else has a default.
 */
export const FleetCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Fleet name is required")
    .max(80, "Fleet name cannot exceed 80 characters"),
  type: FleetTypeSchema.default("Mixed"),
  currency: z.nativeEnum(Currency).default("USD"),
  description: emptyStringToUndefined(
    z.string().max(2000, "Description cannot exceed 2,000 characters").optional(),
  ),
  visibility: z.nativeEnum(FleetVisibility).default("PRIVATE"),
  tag: emptyStringToUndefined(z.string().max(40).optional()),
  vesselIds: z.array(cuidSchema).default([]),
  ownerUserId: cuidSchema.optional(),
});

export type FleetCreateInput = z.infer<typeof FleetCreateSchema>;

/** PATCH-style update — every field optional. */
export const FleetUpdateSchema = FleetCreateSchema.partial();
export type FleetUpdateInput = z.infer<typeof FleetUpdateSchema>;
