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
import { VesselCreateSchema } from "@/lib/validation/vessel";
import {
  VesselService,
  VesselConflictError,
} from "@/lib/services/vessel.service";
import { requireSession } from "@/lib/auth/session";
import type { VesselFormState } from "./vessel.form-state";

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

  // Pull raw values. Empty inputs become undefined so Zod's coercion +
  // defaults work cleanly. Numbers stay as strings — the schema's
  // `z.coerce.number()` does the conversion.
  const raw = {
    // Identification
    name: String(formData.get("name") ?? ""),
    imo: String(formData.get("imo") ?? ""),
    mmsi: asOptional(formData.get("mmsi")),
    callSign: asOptional(formData.get("callSign")),
    flagCountryId: asOptional(formData.get("flagCountryId")),
    flagOther: asOptional(formData.get("flagOther")),
    portOfRegistryId: asOptional(formData.get("portOfRegistryId")),
    portOfRegistryOther: asOptional(formData.get("portOfRegistryOther")),

    // Specifications
    vesselTypeId: String(formData.get("vesselTypeId") ?? ""),
    yearBuilt: asOptional(formData.get("yearBuilt")),
    dwt: asOptional(formData.get("dwt")),
    grt: asOptional(formData.get("grt")),
    nrt: asOptional(formData.get("nrt")),
    loaM: asOptional(formData.get("loaM")),
    beamM: asOptional(formData.get("beamM")),
    draftM: asOptional(formData.get("draftM")),
    serviceSpeedKn: asOptional(formData.get("serviceSpeedKn")),
    shipyardId: asOptional(formData.get("shipyardId")),
    shipyardOther: asOptional(formData.get("shipyardOther")),
    classSocietyId: asOptional(formData.get("classSocietyId")),
    classSocietyOther: asOptional(formData.get("classSocietyOther")),
    engineModelId: asOptional(formData.get("engineModelId")),
    engineModelOther: asOptional(formData.get("engineModelOther")),
    nextSpecialSurvey: asOptional(formData.get("nextSpecialSurvey")),

    // Commercial / financial
    fleetId: asOptional(formData.get("fleetId")),
    acquisitionCost: asOptional(formData.get("acquisitionCost")),
    acquisitionDate: asOptional(formData.get("acquisitionDate")),
    currentFmv: asOptional(formData.get("currentFmv")),
    outstandingLoan: asOptional(formData.get("outstandingLoan")),
    currency: asOptional(formData.get("currency")),

    // Status + sale indicator
    lifecycleStatus: asOptional(formData.get("lifecycleStatus")),
    employmentStatus: asOptional(formData.get("employmentStatus")),
    isOnSale: formData.get("isOnSale") === "on" ? "true" : "false",
    onSaleAt: asOptional(formData.get("onSaleAt")),

    // Notes
    notes: asOptional(formData.get("notes")),
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
