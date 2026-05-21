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

/* Helpers for the broader prototype field surface. All optional + coerced
 * from string (HTML form inputs always submit strings). */
const optionalText = (max = 120) =>
  emptyStringToUndefined(z.string().trim().max(max).optional());
const optionalLongText = emptyStringToUndefined(
  z.string().trim().max(4000).optional(),
);
const optionalPositiveInt = (max = 999_999_999) =>
  emptyStringToUndefined(z.coerce.number().int().nonnegative().max(max).optional());
const optionalPositiveDecimal = (precision: number, max = 999_999) =>
  emptyStringToUndefined(
    z.coerce
      .number()
      .nonnegative()
      .max(max)
      .transform((n) => Number(n.toFixed(precision)))
      .optional(),
  );
const optionalBool = z.preprocess(
  (v) =>
    v === "on" || v === "true" || v === true
      ? true
      : v === "off" || v === "false" || v === false
        ? false
        : v === undefined || v === null || v === ""
          ? undefined
          : Boolean(v),
  z.boolean().optional(),
);

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

    // Identification — extras from the latest prototype
    flagCode: optionalText(8), // ISO-3 like "LBR"
    classRenewalDate: optionalDate,

    // Vessel Type & Classification
    builtForTrade: optionalText(),
    currentTrade: optionalText(),
    designModel: optionalText(),
    iceClass: optionalText(40),
    propulsionType: optionalText(40),
    cleanDirtyWilling: optionalBool,

    // Build & Delivery
    builtCountry: optionalText(),
    yardNumber: optionalText(40),
    deliveryDate: optionalDate,
    scrappedDate: optionalDate,
    shipyardId: optionalCuid,
    shipyardOther: optionalReferenceOther,

    // Principal Dimensions
    loaM: optionalLoa,
    beamM: optionalBeam,
    mouldedDepthM: optionalPositiveDecimal(2, 200),
    draftM: optionalDraft,
    airDraughtM: optionalPositiveDecimal(2, 200),
    lightshipT: optionalPositiveInt(500_000),
    summerTpc: optionalPositiveDecimal(2, 9_999),

    // Tonnage
    grt: optionalGrt,
    reducedGrt: optionalPositiveInt(500_000),
    nrt: optionalNrt,
    panamaCanalNrt: optionalPositiveInt(500_000),
    suezCanalNrt: optionalPositiveInt(500_000),

    // Cargo Capacity
    cubicSizeM3: optionalPositiveInt(9_999_999),
    grainCapacityM3: optionalPositiveInt(9_999_999),
    baleCapacityM3: optionalPositiveInt(9_999_999),
    teu: optionalPositiveInt(99_999),
    teuAt14t: optionalPositiveInt(99_999),
    deckTeu: optionalPositiveInt(99_999),
    underDeckTeu: optionalPositiveInt(99_999),
    reefers: optionalPositiveInt(99_999),

    // Holds, Hatches, Cranes & Grabs
    numHolds: optionalPositiveInt(999),
    numHatches: optionalPositiveInt(999),
    numCranes: optionalPositiveInt(999),
    numGrabs: optionalPositiveInt(999),
    cranesMaxOutreachM: optionalPositiveDecimal(2, 999),
    cranesMaxLiftingT: optionalPositiveInt(99_999),
    holdDetails: optionalLongText,
    hatchDetails: optionalLongText,
    craneDetails: optionalLongText,
    grabDetails: optionalLongText,
    isGeared: optionalBool,
    grabsFitted: optionalBool,
    boxShapedHolds: optionalBool,
    openHatch: optionalBool,
    australianHoldLadder: optionalBool,
    logFitted: optionalBool,
    a60Bulkhead: optionalBool,
    co2Fitted: optionalBool,

    // Parallel Body Length
    parallelBodyLadenM: optionalPositiveDecimal(2, 999),
    parallelBodyBallastM: optionalPositiveDecimal(2, 999),
    parallelBodyEmptyM: optionalPositiveDecimal(2, 999),

    // Manifold (tanker)
    bowToCentreManifoldM: optionalPositiveDecimal(2, 999),
    waterlineToManifoldM: optionalPositiveDecimal(2, 999),
    deckToCentreManifoldM: optionalPositiveDecimal(2, 999),
    railToCentreManifoldM: optionalPositiveDecimal(2, 999),

    // Tanker Equipment
    imoType: emptyStringToUndefined(z.enum(["1", "2", "3"]).optional()),
    inertGasSystem: optionalBool,
    crudeOilWashing: optionalBool,
    heatingCoils: optionalBool,
    ststCoating: optionalPositiveInt(999_999),
    epoxyCoating: optionalPositiveInt(999_999),
    zincCoating: optionalPositiveInt(999_999),
    marinelineCoating: optionalPositiveInt(999_999),
    interlineCoating: optionalPositiveInt(999_999),

    // Bow Equipment
    numBowChainStoppers: optionalPositiveInt(99),
    numBowThrusters: optionalPositiveInt(99),
    bowChainStopperDetails: optionalText(200),
    bowChainStoppersFitted: optionalBool,

    // Main Engine
    engineModelId: optionalCuid,
    engineModelOther: optionalReferenceOther,
    engineManufacturer: optionalText(120),
    enginePowerKw: optionalPositiveInt(999_999),
    engineRpm: optionalPositiveInt(9_999),
    mewisDuct: optionalText(40),
    serviceSpeedKn: optionalSpeed,

    // Gas Carrier
    gasContainmentType: optionalText(80),
    minTemperatureC: emptyStringToUndefined(
      z.coerce.number().min(-300).max(300).optional(),
    ),
    maxPressureBar: optionalPositiveDecimal(2, 9_999),
    carriesAmmonia: optionalBool,
    carriesVcm: optionalBool,
    carriesEthylene: optionalBool,

    // Environmental & Compliance
    ghgRating: emptyStringToUndefined(z.nativeEnum(EnvScore).optional()),
    scrubbersInstalledDate: optionalDate,
    ballastWaterTreatmentSystem: optionalBool,
    neoPanamaLocks: optionalBool,
    sternLine: optionalBool,
    classSocietyId: optionalCuid,
    classSocietyOther: optionalReferenceOther,
    nextSpecialSurvey: optionalDate,

    // Operators & Owners
    commercialOperator: optionalText(120),
    beneficialOwner: optionalText(120),

    // Order Book (newbuilds) — single nested record
    orderBook: z
      .object({
        status: emptyStringToUndefined(
          z
            .enum([
              "ON_ORDER",
              "UNDER_CONSTRUCTION",
              "LAUNCHED",
              "DELIVERED",
              "CANCELLED",
            ])
            .optional(),
        ),
        orderDate: optionalDate,
        constructionStartDate: optionalDate,
        launchDate: optionalDate,
        scheduledDeliveryDate: optionalDate,
        cancelledDate: optionalDate,
      })
      .optional(),

    // Sanctions History — zero or more entries
    sanctions: z
      .array(
        z.object({
          authority: z.string().trim().min(1).max(120),
          program: optionalText(120),
          startDate: optionalDate,
          endDate: optionalDate,
          description: optionalLongText,
        }),
      )
      .optional(),

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
