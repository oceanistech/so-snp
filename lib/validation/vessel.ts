/**
 * Zod schemas for Vessel create / update forms.
 *
 * One source of truth used by:
 *   - the React Hook Form on `/vessels/new` and `/vessels/[id]/edit` (via zodResolver)
 *   - server actions and `/api/vessels` route handlers
 *
 * The schema validates shape and format. Cross-row checks that need a DB
 * lookup (uniqueness, foreign-key existence, vessel type leaf rule) happen
 * at the service / repository layer, not here.
 */
import { z } from "zod";
import {
  Currency,
  EmploymentStatus,
  EnvScore,
  VesselLifecycleStatus,
} from "@prisma/client";
import {
  beamMetresSchema,
  callSignSchema,
  cuidSchema,
  dimensionMetresSchema,
  dwtSchema,
  emptyStringToUndefined,
  ensureAtMostOneOf,
  imoSchema,
  mmsiSchema,
  moneySchema,
  referenceOtherSchema,
  speedKnotsSchema,
  yearBuiltSchema,
} from "./shared";

/* --------------------------------------------------------------------------
 * Reusable optionals — empty strings on the form get coerced to undefined so
 * the consumer doesn't have to clean inputs before calling .parse().
 * -------------------------------------------------------------------------- */

const optionalCuid = emptyStringToUndefined(cuidSchema.optional());
const optionalReferenceOther = emptyStringToUndefined(referenceOtherSchema.optional());
const optionalMmsi = emptyStringToUndefined(mmsiSchema.optional());
const optionalCallSign = emptyStringToUndefined(callSignSchema.optional());
const optionalGrt = emptyStringToUndefined(
  z.coerce.number().int().positive().max(500_000).optional(),
);
const optionalNrt = emptyStringToUndefined(
  z.coerce.number().int().positive().max(500_000).optional(),
);
const optionalLoa = emptyStringToUndefined(dimensionMetresSchema.optional());
const optionalBeam = emptyStringToUndefined(beamMetresSchema.optional());
const optionalDraft = emptyStringToUndefined(dimensionMetresSchema.optional());
const optionalSpeed = emptyStringToUndefined(speedKnotsSchema.optional());
const optionalMoney = emptyStringToUndefined(moneySchema.optional());
const optionalDate = emptyStringToUndefined(z.coerce.date().optional());

/* --------------------------------------------------------------------------
 * Create schema
 * -------------------------------------------------------------------------- */

/**
 * VesselCreateSchema — payload accepted by the Add Vessel form / server action.
 *
 * Required fields (* in the UI):
 *   name, imo, flagCountryId, vesselTypeId, yearBuilt, dwt
 *
 * "Other" fallback: for each of shipyard / portOfRegistry / classSociety /
 * engineModel / flag — at most one of (id, other) may be set on a given row.
 * This is enforced via `.superRefine`.
 */
export const VesselCreateSchema = z
  .object({
    // Identification — required
    name: z.string().trim().min(2, "Vessel name is required").max(120),
    imo: imoSchema,
    flagCountryId: cuidSchema.optional(),
    flagOther: optionalReferenceOther,

    // Identification — optional
    mmsi: optionalMmsi,
    callSign: optionalCallSign,
    portOfRegistryId: optionalCuid,
    portOfRegistryOther: optionalReferenceOther,

    // Specifications — required
    vesselTypeId: cuidSchema,
    yearBuilt: yearBuiltSchema,
    dwt: dwtSchema,

    // Specifications — optional
    grt: optionalGrt,
    nrt: optionalNrt,
    loaM: optionalLoa,
    beamM: optionalBeam,
    draftM: optionalDraft,
    serviceSpeedKn: optionalSpeed,
    shipyardId: optionalCuid,
    shipyardOther: optionalReferenceOther,
    classSocietyId: optionalCuid,
    classSocietyOther: optionalReferenceOther,
    engineModelId: optionalCuid,
    engineModelOther: optionalReferenceOther,
    nextSpecialSurvey: optionalDate,

    // Commercial / financial — all optional
    fleetId: optionalCuid,
    acquisitionCost: optionalMoney,
    acquisitionDate: optionalDate,
    currentFmv: optionalMoney,
    outstandingLoan: optionalMoney,
    currency: z.nativeEnum(Currency).default("USD"),

    // Status / lifecycle
    lifecycleStatus: z.nativeEnum(VesselLifecycleStatus).default("ACTIVE"),
    employmentStatus: z.nativeEnum(EmploymentStatus).default("CURRENT_EARNINGS"),
    envScore: z.nativeEnum(EnvScore).optional(),

    // Sale indicator
    isOnSale: z.coerce.boolean().default(false),
    onSaleAt: optionalDate,

    // Free-text notes
    notes: emptyStringToUndefined(
      z.string().max(2000, "Notes cannot exceed 2,000 characters").optional(),
    ),
  })
  .superRefine((data, ctx) => {
    // Flag — at least one of (id, other) must be set (flag is required).
    if (!data.flagCountryId && !data.flagOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flagCountryId"],
        message: "Flag state is required",
      });
    }

    // "Other" pairs — at most one of (id, other) for each reference field.
    ensureAtMostOneOf(data, ctx, "flagCountryId", "flagOther", "flag");
    ensureAtMostOneOf(data, ctx, "portOfRegistryId", "portOfRegistryOther", "port of registry");
    ensureAtMostOneOf(data, ctx, "shipyardId", "shipyardOther", "shipyard");
    ensureAtMostOneOf(data, ctx, "classSocietyId", "classSocietyOther", "classification society");
    ensureAtMostOneOf(data, ctx, "engineModelId", "engineModelOther", "engine model");

    // Acquisition date must not be in the future.
    if (data.acquisitionDate && data.acquisitionDate > new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["acquisitionDate"],
        message: "Acquisition date cannot be in the future",
      });
    }

    // onSaleAt only meaningful when isOnSale=true; warn otherwise.
    if (data.onSaleAt && !data.isOnSale) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["onSaleAt"],
        message: "Listed-at date requires the vessel to be marked on sale",
      });
    }
  });

export type VesselCreateInput = z.infer<typeof VesselCreateSchema>;

/* --------------------------------------------------------------------------
 * Update schema
 * -------------------------------------------------------------------------- */

/**
 * VesselUpdateSchema — same shape as create, but every field is optional
 * because PATCH-style updates only send changed fields. The cross-field
 * rules from create still apply when the relevant fields are present.
 */
export const VesselUpdateSchema = VesselCreateSchema.innerType()
  .partial()
  .superRefine((data, ctx) => {
    ensureAtMostOneOf(data, ctx, "flagCountryId", "flagOther", "flag");
    ensureAtMostOneOf(data, ctx, "portOfRegistryId", "portOfRegistryOther", "port of registry");
    ensureAtMostOneOf(data, ctx, "shipyardId", "shipyardOther", "shipyard");
    ensureAtMostOneOf(data, ctx, "classSocietyId", "classSocietyOther", "classification society");
    ensureAtMostOneOf(data, ctx, "engineModelId", "engineModelOther", "engine model");

    if (data.acquisitionDate && data.acquisitionDate > new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["acquisitionDate"],
        message: "Acquisition date cannot be in the future",
      });
    }
  });

export type VesselUpdateInput = z.infer<typeof VesselUpdateSchema>;
