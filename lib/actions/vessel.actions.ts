"use server";
/**
 * Server actions for the Vessels feature.
 *
 * `createVesselAction` is bound to the `/vessels/new` form via
 * `useActionState`. It validates the posted FormData against
 * `VesselCreateSchema`, calls `VesselService.create`, and either
 * redirects to `/vessels/{id}?created=1` on success or returns a typed
 * `VesselFormState` carrying inline field errors.
 *
 * `VesselFormState` and `INITIAL_VESSEL_FORM_STATE` live in
 * `./vessel.form-state.ts` — see the comment there for why a "use server"
 * module can only export functions.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { VesselCreateSchema, VesselUpdateSchema } from "@/lib/validation/vessel";
import {
  VesselService,
  VesselConflictError,
  VesselNotFoundError,
} from "@/lib/services/vessel.service";
import { requireSession } from "@/lib/auth/session";
import type { VesselFormState } from "./vessel.form-state";

/** Shape returned by the JSON-style row-action server functions invoked
 *  from the Vessels "More" dropdown. Discriminated union so the client
 *  can `if (res.ok) …` branch cleanly. */
export type VesselActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

/**
 * Read a FormData entry and treat empty strings / whitespace as
 * `undefined`. Lets the Zod schema's defaults take over when a field is
 * left blank.
 */
function asOptional(v: FormDataEntryValue | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

export async function createVesselAction(
  _prev: VesselFormState,
  formData: FormData,
): Promise<VesselFormState> {
  const session = await requireSession();

  // Read an HTML checkbox into a "true"/"false" string. Zod's boolean
  // preprocessor accepts either; an unchecked checkbox doesn't post at
  // all, so absence = false.
  const cb = (n: string): "true" | "false" =>
    formData.get(n) === "on" ? "true" : "false";

  // Parse a JSON-encoded value from a hidden input, used for dynamic
  // list inputs (sanctions). Returns `undefined` on missing/blank/
  // unparseable JSON so the Zod schema's `.optional()` chain applies.
  const json = (n: string): unknown => {
    const raw = formData.get(n);
    if (raw == null || raw === "") return undefined;
    try {
      return JSON.parse(String(raw));
    } catch {
      return undefined;
    }
  };

  // Pull raw values. Empty inputs become undefined so Zod's coercion +
  // defaults work cleanly. Numbers stay as strings — the schema's
  // `z.coerce.number()` does the conversion.
  const raw = {
    // 1. Identification
    name: String(formData.get("name") ?? ""),
    imo: String(formData.get("imo") ?? ""),
    mmsi: asOptional(formData.get("mmsi")),
    callSign: asOptional(formData.get("callSign")),
    flagCountryId: asOptional(formData.get("flagCountryId")),
    flagCode: asOptional(formData.get("flagCode")),
    flagOther: asOptional(formData.get("flagOther")),
    portOfRegistryId: asOptional(formData.get("portOfRegistryId")),
    portOfRegistryOther: asOptional(formData.get("portOfRegistryOther")),
    classSocietyId: asOptional(formData.get("classSocietyId")),
    classSocietyOther: asOptional(formData.get("classSocietyOther")),
    classRenewalDate: asOptional(formData.get("classRenewalDate")),

    // 2. Vessel Type & Classification
    vesselTypeId: String(formData.get("vesselTypeId") ?? ""),
    builtForTrade: asOptional(formData.get("builtForTrade")),
    currentTrade: asOptional(formData.get("currentTrade")),
    designModel: asOptional(formData.get("designModel")),
    iceClass: asOptional(formData.get("iceClass")),
    propulsionType: asOptional(formData.get("propulsionType")),
    cleanDirtyWilling: cb("cleanDirtyWilling"),

    // 3. Build & Delivery
    yearBuilt: asOptional(formData.get("yearBuilt")),
    builtCountry: asOptional(formData.get("builtCountry")),
    shipyardId: asOptional(formData.get("shipyardId")),
    shipyardOther: asOptional(formData.get("shipyardOther")),
    yardNumber: asOptional(formData.get("yardNumber")),
    deliveryDate: asOptional(formData.get("deliveryDate")),
    scrappedDate: asOptional(formData.get("scrappedDate")),

    // 4. Order Book (nested)
    orderBook: {
      status: asOptional(formData.get("orderBook.status")),
      orderDate: asOptional(formData.get("orderBook.orderDate")),
      constructionStartDate: asOptional(formData.get("orderBook.constructionStartDate")),
      launchDate: asOptional(formData.get("orderBook.launchDate")),
      scheduledDeliveryDate: asOptional(formData.get("orderBook.scheduledDeliveryDate")),
      cancelledDate: asOptional(formData.get("orderBook.cancelledDate")),
    },

    // 5. Principal Dimensions
    dwt: asOptional(formData.get("dwt")),
    loaM: asOptional(formData.get("loaM")),
    beamM: asOptional(formData.get("beamM")),
    mouldedDepthM: asOptional(formData.get("mouldedDepthM")),
    draftM: asOptional(formData.get("draftM")),
    airDraughtM: asOptional(formData.get("airDraughtM")),
    lightshipT: asOptional(formData.get("lightshipT")),
    summerTpc: asOptional(formData.get("summerTpc")),

    // 6. Tonnage
    grt: asOptional(formData.get("grt")),
    reducedGrt: asOptional(formData.get("reducedGrt")),
    nrt: asOptional(formData.get("nrt")),
    panamaCanalNrt: asOptional(formData.get("panamaCanalNrt")),
    suezCanalNrt: asOptional(formData.get("suezCanalNrt")),

    // 7. Cargo Capacity
    cubicSizeM3: asOptional(formData.get("cubicSizeM3")),
    grainCapacityM3: asOptional(formData.get("grainCapacityM3")),
    baleCapacityM3: asOptional(formData.get("baleCapacityM3")),
    teu: asOptional(formData.get("teu")),
    teuAt14t: asOptional(formData.get("teuAt14t")),
    deckTeu: asOptional(formData.get("deckTeu")),
    underDeckTeu: asOptional(formData.get("underDeckTeu")),
    reefers: asOptional(formData.get("reefers")),

    // 8. Holds / Hatches / Cranes & Grabs
    numHolds: asOptional(formData.get("numHolds")),
    numHatches: asOptional(formData.get("numHatches")),
    numCranes: asOptional(formData.get("numCranes")),
    numGrabs: asOptional(formData.get("numGrabs")),
    cranesMaxOutreachM: asOptional(formData.get("cranesMaxOutreachM")),
    cranesMaxLiftingT: asOptional(formData.get("cranesMaxLiftingT")),
    holdDetails: asOptional(formData.get("holdDetails")),
    hatchDetails: asOptional(formData.get("hatchDetails")),
    craneDetails: asOptional(formData.get("craneDetails")),
    grabDetails: asOptional(formData.get("grabDetails")),
    isGeared: cb("isGeared"),
    grabsFitted: cb("grabsFitted"),
    boxShapedHolds: cb("boxShapedHolds"),
    openHatch: cb("openHatch"),
    australianHoldLadder: cb("australianHoldLadder"),
    logFitted: cb("logFitted"),
    a60Bulkhead: cb("a60Bulkhead"),
    co2Fitted: cb("co2Fitted"),

    // 9. Parallel Body Length
    parallelBodyLadenM: asOptional(formData.get("parallelBodyLadenM")),
    parallelBodyBallastM: asOptional(formData.get("parallelBodyBallastM")),
    parallelBodyEmptyM: asOptional(formData.get("parallelBodyEmptyM")),

    // 10. Manifold (tanker)
    bowToCentreManifoldM: asOptional(formData.get("bowToCentreManifoldM")),
    waterlineToManifoldM: asOptional(formData.get("waterlineToManifoldM")),
    deckToCentreManifoldM: asOptional(formData.get("deckToCentreManifoldM")),
    railToCentreManifoldM: asOptional(formData.get("railToCentreManifoldM")),

    // 11. Tanker Equipment
    imoType: asOptional(formData.get("imoType")),
    inertGasSystem: cb("inertGasSystem"),
    crudeOilWashing: cb("crudeOilWashing"),
    heatingCoils: cb("heatingCoils"),
    ststCoating: asOptional(formData.get("ststCoating")),
    epoxyCoating: asOptional(formData.get("epoxyCoating")),
    zincCoating: asOptional(formData.get("zincCoating")),
    marinelineCoating: asOptional(formData.get("marinelineCoating")),
    interlineCoating: asOptional(formData.get("interlineCoating")),

    // 12. Bow Equipment
    numBowChainStoppers: asOptional(formData.get("numBowChainStoppers")),
    numBowThrusters: asOptional(formData.get("numBowThrusters")),
    bowChainStopperDetails: asOptional(formData.get("bowChainStopperDetails")),
    bowChainStoppersFitted: cb("bowChainStoppersFitted"),

    // 13. Main Engine
    engineModelId: asOptional(formData.get("engineModelId")),
    engineModelOther: asOptional(formData.get("engineModelOther")),
    engineManufacturer: asOptional(formData.get("engineManufacturer")),
    enginePowerKw: asOptional(formData.get("enginePowerKw")),
    engineRpm: asOptional(formData.get("engineRpm")),
    mewisDuct: asOptional(formData.get("mewisDuct")),
    serviceSpeedKn: asOptional(formData.get("serviceSpeedKn")),

    // 14. Gas Carrier
    gasContainmentType: asOptional(formData.get("gasContainmentType")),
    minTemperatureC: asOptional(formData.get("minTemperatureC")),
    maxPressureBar: asOptional(formData.get("maxPressureBar")),
    carriesAmmonia: cb("carriesAmmonia"),
    carriesVcm: cb("carriesVcm"),
    carriesEthylene: cb("carriesEthylene"),

    // 15. Environmental & Compliance
    ghgRating: asOptional(formData.get("ghgRating")),
    scrubbersInstalledDate: asOptional(formData.get("scrubbersInstalledDate")),
    ballastWaterTreatmentSystem: cb("ballastWaterTreatmentSystem"),
    neoPanamaLocks: cb("neoPanamaLocks"),
    sternLine: cb("sternLine"),
    nextSpecialSurvey: asOptional(formData.get("nextSpecialSurvey")),

    // 16. Operators & Owners
    commercialOperator: asOptional(formData.get("commercialOperator")),
    beneficialOwner: asOptional(formData.get("beneficialOwner")),

    // 17. Commercial / financial
    fleetId: asOptional(formData.get("fleetId")),
    acquisitionCost: asOptional(formData.get("acquisitionCost")),
    acquisitionDate: asOptional(formData.get("acquisitionDate")),
    currentFmv: asOptional(formData.get("currentFmv")),
    outstandingLoan: asOptional(formData.get("outstandingLoan")),
    currency: asOptional(formData.get("currency")),

    // 18. Status + sale indicator
    lifecycleStatus: asOptional(formData.get("lifecycleStatus")),
    employmentStatus: asOptional(formData.get("employmentStatus")),
    isOnSale: cb("isOnSale"),
    onSaleAt: asOptional(formData.get("onSaleAt")),

    // 19. Notes
    notes: asOptional(formData.get("notes")),

    // 20. Sanctions History — posted as a single JSON-encoded hidden
    // input from the SanctionsListInput component. `undefined` when the
    // form didn't include one; Zod's `.optional()` chain accepts that.
    sanctions: json("sanctions"),
  };

  const parsed = VesselCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      formError: null,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let createdId: string;
  try {
    // The schema's parsed.data has every default applied + optional
    // fields kept as `undefined`. Forward as-is to the service.
    const vessel = await new VesselService().create(
      session.orgId,
      parsed.data,
      session.userId,
    );
    createdId = vessel.id;
  } catch (err) {
    if (err instanceof VesselConflictError) {
      return {
        ok: false,
        formError: null,
        fieldErrors: {
          imo: [err.message],
          name: [err.message],
        },
      };
    }
    console.error("[createVesselAction] unexpected:", err);
    return {
      ok: false,
      formError: "Something went wrong saving the vessel. Please try again.",
      fieldErrors: {},
    };
  }

  redirect(`/vessels/${encodeURIComponent(createdId)}?created=1`);
}

/* ============================================================================
 * Row-action server functions (used by VesselRowActionsMenu)
 * ========================================================================= */

/**
 * Soft-delete a vessel. Invoked from the "More → Remove Vessel" row
 * action on /fleetspace's vessel table. Returns a typed result so the
 * client can render a sonner toast and `router.refresh()`.
 */
export async function deleteVesselAction(
  vesselId: string,
): Promise<VesselActionResult> {
  const session = await requireSession();
  try {
    await new VesselService().softDelete(session.orgId, vesselId);
  } catch (err) {
    if (err instanceof VesselNotFoundError) {
      return { ok: false, error: err.message };
    }
    console.error("[deleteVesselAction] unexpected:", err);
    return {
      ok: false,
      error: "Something went wrong removing the vessel. Please try again.",
    };
  }
  revalidatePath("/fleetspace");
  return { ok: true, message: "Vessel removed." };
}

/**
 * Duplicate a vessel. The caller supplies a new `name` and `imo` (IMOs
 * are externally assigned, so the server can't pick one). Invoked from
 * the "More → Duplicate Vessel" row action's modal.
 */
export async function duplicateVesselAction(
  vesselId: string,
  options: { name: string; imo: string; attachToFleetId?: string },
): Promise<VesselActionResult & { newVesselId?: string }> {
  const session = await requireSession();
  try {
    const copy = await new VesselService().duplicate(
      session.orgId,
      vesselId,
      session.userId,
      {
        name: options.name,
        imo: options.imo,
        attachToFleetId: options.attachToFleetId,
      },
    );
    revalidatePath("/fleetspace");
    return {
      ok: true,
      message: `Vessel duplicated as "${copy.name}".`,
      newVesselId: copy.id,
    };
  } catch (err) {
    if (err instanceof VesselNotFoundError) {
      return { ok: false, error: err.message };
    }
    if (err instanceof VesselConflictError) {
      return { ok: false, error: err.message };
    }
    console.error("[duplicateVesselAction] unexpected:", err);
    return {
      ok: false,
      error: "Something went wrong duplicating the vessel. Please try again.",
    };
  }
}

/**
 * Server lookup: ask for the name the duplicate dialog should pre-fill.
 * `<original> (Copy)` is the default. The dialog re-uses this value
 * but the user can edit it before submitting.
 */
export async function suggestDuplicateVesselNameAction(
  vesselId: string,
): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  const session = await requireSession();
  const name = await new VesselService().suggestDuplicateName(
    session.orgId,
    vesselId,
  );
  if (name == null) {
    return { ok: false, error: "Vessel not found." };
  }
  return { ok: true, name };
}

/**
 * Reassign a vessel to a single fleet. Invoked from the "More → Move to
 * Fleet" row action's modal. The vessel's existing fleet memberships
 * are soft-deleted; the chosen fleet becomes the only active membership.
 */
export async function moveVesselToFleetAction(
  vesselId: string,
  fleetId: string,
): Promise<VesselActionResult> {
  const session = await requireSession();
  try {
    await new VesselService().moveToFleet(
      session.orgId,
      vesselId,
      fleetId,
      session.userId,
    );
  } catch (err) {
    if (err instanceof VesselNotFoundError) {
      return { ok: false, error: err.message };
    }
    console.error("[moveVesselToFleetAction] unexpected:", err);
    return {
      ok: false,
      error: "Something went wrong moving the vessel. Please try again.",
    };
  }
  revalidatePath("/fleetspace");
  return { ok: true, message: "Vessel moved." };
}

/**
 * Detach a vessel from every fleet EXCEPT `keepFleetId` (typically the
 * fleet the user is currently viewing). Used by the "Detach from all
 * other fleets" option in the Move to Fleet dialog — semantically
 * different from `moveVesselToFleetAction(vesselId, keepFleetId)`
 * because we don't churn the kept membership's audit row.
 */
export async function detachVesselFromOtherFleetsAction(
  vesselId: string,
  keepFleetId: string,
): Promise<VesselActionResult> {
  const session = await requireSession();
  try {
    await new VesselService().detachFromOtherFleets(
      session.orgId,
      vesselId,
      keepFleetId,
    );
  } catch (err) {
    if (err instanceof VesselNotFoundError) {
      return { ok: false, error: err.message };
    }
    console.error("[detachVesselFromOtherFleetsAction] unexpected:", err);
    return {
      ok: false,
      error: "Something went wrong detaching the vessel. Please try again.",
    };
  }
  revalidatePath("/fleetspace");
  return { ok: true, message: "Detached from other fleets." };
}

/**
 * Edit a vessel via the full-page `/vessels/[imo]/edit` form. Mirrors
 * `createVesselAction`'s FormData → Zod → service pattern so the same
 * form layout works for create and edit. IMO is immutable per ADR-0002
 * so it isn't read from FormData here.
 */
export async function editVesselAction(
  _prev: VesselFormState,
  formData: FormData,
): Promise<VesselFormState> {
  const session = await requireSession();
  const vesselId = String(formData.get("vesselId") ?? "");
  if (!vesselId) {
    return {
      ok: false,
      formError: "Missing vessel id. Please reload and try again.",
      fieldErrors: {},
    };
  }

  // Same checkbox helper as `createVesselAction`. Absent → "false".
  const cb = (n: string): "true" | "false" =>
    formData.get(n) === "on" ? "true" : "false";

  // JSON-encoded hidden-input reader for dynamic lists (sanctions).
  // Returns `undefined` on missing/blank/unparseable JSON.
  const json = (n: string): unknown => {
    const raw = formData.get(n);
    if (raw == null || raw === "") return undefined;
    try {
      return JSON.parse(String(raw));
    } catch {
      return undefined;
    }
  };

  // Reuse the same FormData reads as `createVesselAction` but drop `imo`
  // (not editable). Most fields go straight to asOptional; numerics let
  // the schema's `z.coerce.number()` do the conversion.
  const raw: Record<string, unknown> = {
    name: String(formData.get("name") ?? ""),
    mmsi: asOptional(formData.get("mmsi")),
    callSign: asOptional(formData.get("callSign")),
    flagCountryId: asOptional(formData.get("flagCountryId")),
    flagCode: asOptional(formData.get("flagCode")),
    portOfRegistryId: asOptional(formData.get("portOfRegistryId")),
    classSocietyId: asOptional(formData.get("classSocietyId")),
    classRenewalDate: asOptional(formData.get("classRenewalDate")),

    vesselTypeId: String(formData.get("vesselTypeId") ?? ""),
    builtForTrade: asOptional(formData.get("builtForTrade")),
    currentTrade: asOptional(formData.get("currentTrade")),
    designModel: asOptional(formData.get("designModel")),
    iceClass: asOptional(formData.get("iceClass")),
    propulsionType: asOptional(formData.get("propulsionType")),
    cleanDirtyWilling: cb("cleanDirtyWilling"),

    yearBuilt: asOptional(formData.get("yearBuilt")),
    builtCountry: asOptional(formData.get("builtCountry")),
    shipyardId: asOptional(formData.get("shipyardId")),
    yardNumber: asOptional(formData.get("yardNumber")),
    deliveryDate: asOptional(formData.get("deliveryDate")),
    scrappedDate: asOptional(formData.get("scrappedDate")),

    dwt: asOptional(formData.get("dwt")),
    loaM: asOptional(formData.get("loaM")),
    beamM: asOptional(formData.get("beamM")),
    mouldedDepthM: asOptional(formData.get("mouldedDepthM")),
    draftM: asOptional(formData.get("draftM")),
    airDraughtM: asOptional(formData.get("airDraughtM")),
    lightshipT: asOptional(formData.get("lightshipT")),
    summerTpc: asOptional(formData.get("summerTpc")),

    grt: asOptional(formData.get("grt")),
    reducedGrt: asOptional(formData.get("reducedGrt")),
    nrt: asOptional(formData.get("nrt")),
    panamaCanalNrt: asOptional(formData.get("panamaCanalNrt")),
    suezCanalNrt: asOptional(formData.get("suezCanalNrt")),

    cubicSizeM3: asOptional(formData.get("cubicSizeM3")),
    grainCapacityM3: asOptional(formData.get("grainCapacityM3")),
    baleCapacityM3: asOptional(formData.get("baleCapacityM3")),
    teu: asOptional(formData.get("teu")),
    teuAt14t: asOptional(formData.get("teuAt14t")),
    deckTeu: asOptional(formData.get("deckTeu")),
    underDeckTeu: asOptional(formData.get("underDeckTeu")),
    reefers: asOptional(formData.get("reefers")),

    engineManufacturer: asOptional(formData.get("engineManufacturer")),
    enginePowerKw: asOptional(formData.get("enginePowerKw")),
    engineRpm: asOptional(formData.get("engineRpm")),
    mewisDuct: asOptional(formData.get("mewisDuct")),

    ghgRating: asOptional(formData.get("ghgRating")),
    scrubbersInstalledDate: asOptional(formData.get("scrubbersInstalledDate")),
    ballastWaterTreatmentSystem: cb("ballastWaterTreatmentSystem"),
    neoPanamaLocks: cb("neoPanamaLocks"),
    sternLine: cb("sternLine"),

    commercialOperator: asOptional(formData.get("commercialOperator")),
    beneficialOwner: asOptional(formData.get("beneficialOwner")),

    acquisitionCost: asOptional(formData.get("acquisitionCost")),
    acquisitionDate: asOptional(formData.get("acquisitionDate")),
    currentFmv: asOptional(formData.get("currentFmv")),
    outstandingLoan: asOptional(formData.get("outstandingLoan")),
    currency: asOptional(formData.get("currency")),

    lifecycleStatus: asOptional(formData.get("lifecycleStatus")),
    employmentStatus: asOptional(formData.get("employmentStatus")),

    // On-Sale flag + Listed-at Date (Fleet & Commercial section).
    // Absent checkbox → "false"; absent date input → undefined so
    // the Zod schema's `.optional()` chain kicks in.
    isOnSale: cb("isOnSale"),
    onSaleAt: asOptional(formData.get("onSaleAt")),

    notes: asOptional(formData.get("notes")),

    // Sanctions list — JSON-encoded hidden input from the
    // SanctionsListInput component. Empty array means "remove all
    // saved entries"; `undefined` means "leave them alone".
    sanctions: json("sanctions"),
  };

  const parsed = VesselUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      formError: null,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await new VesselService().update(
      session.orgId,
      vesselId,
      parsed.data,
    );
  } catch (err) {
    if (err instanceof VesselConflictError) {
      return {
        ok: false,
        formError: null,
        fieldErrors: { name: [err.message] },
      };
    }
    if (err instanceof VesselNotFoundError) {
      return { ok: false, formError: err.message, fieldErrors: {} };
    }
    console.error("[editVesselAction] unexpected:", err);
    return {
      ok: false,
      formError: "Something went wrong saving the vessel. Please try again.",
      fieldErrors: {},
    };
  }

  redirect(`/vessels/${encodeURIComponent(vesselId)}?updated=1`);
}
