"use server";
/**
 * Server actions for the Fleets feature.
 *
 * Pattern: each action takes a previous state (so the form can use
 * `useActionState`) and the submitted FormData. It returns a typed
 * `FleetFormState` carrying field-level errors, a form-level error, or
 * `ok: true` plus a redirect target. The client form maps `fieldErrors`
 * into per-input error chips and follows `redirectTo` on success.
 *
 * Validation happens via FleetCreateSchema (the same schema used by RHF on
 * the form), so client + server share one source of truth.
 *
 * NB: `FleetFormState` and `INITIAL_FLEET_FORM_STATE` live in their own
 * file (`./fleet.form-state.ts`) — Next.js treats every export from a
 * `"use server"` module as a server-action reference, so plain objects
 * exported alongside the action would be bundle-stripped on the client.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { FleetCreateSchema, FleetUpdateSchema } from "@/lib/validation/fleet";
import {
  FleetService,
  FleetNameConflictError,
  FleetNotFoundError,
} from "@/lib/services/fleet.service";
import { requireSession } from "@/lib/auth/session";
import type { FleetFormState } from "./fleet.form-state";

/** Shape returned by the row-action server functions invoked from the
 *  Fleets "More" dropdown. Discriminated so the client can branch cleanly. */
export type FleetActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

/**
 * Create a fleet from a posted HTML form.
 *
 * The form posts:
 *   - name           (text, required)
 *   - type           (select, default "Mixed")
 *   - currency       (select, default "USD")
 *   - description    (textarea, optional)
 *   - visibility     (select, default "PRIVATE")
 *   - tag            (text, optional)
 *   - vesselIds      (one or more checkbox values, optional)
 *
 * On success the action redirects to `/fleetspace?created=<id>`; on failure
 * it returns inline form-state for the client to render.
 */
export async function createFleetAction(
  _prev: FleetFormState,
  formData: FormData,
): Promise<FleetFormState> {
  // 1. Resolve session → org. If the session is missing we throw, which
  //    bubbles up to the gated layout's redirect.
  const session = await requireSession();

  // 2. Pull raw values. Empty strings become undefined so optional fields
  //    default cleanly via the Zod schema.
  const raw = {
    name: String(formData.get("name") ?? ""),
    type: emptyToUndef(formData.get("type")),
    currency: emptyToUndef(formData.get("currency")),
    description: emptyToUndef(formData.get("description")),
    visibility: emptyToUndef(formData.get("visibility")),
    tag: emptyToUndef(formData.get("tag")),
    ownerName: emptyToUndef(formData.get("ownerName")),
    vesselIds: formData.getAll("vesselIds").map((v) => String(v)).filter(Boolean),
  };

  // 3. Validate.
  const parsed = FleetCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      formError: null,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // 4. Call the service. Map known business errors to inline field errors.
  //    Pin ownerUserId to a concrete `string` so the spread + override
  //    pattern doesn't trip Zod's `{} | undefined` widening on optional
  //    refined string schemas.
  const ownerUserId: string = parsed.data.ownerUserId ?? session.userId;
  let created: { id: string; slug: string };
  try {
    const fleet = await new FleetService().create(session.orgId, {
      ...parsed.data,
      ownerUserId,
    });
    created = { id: fleet.id, slug: fleet.slug };
  } catch (err) {
    if (err instanceof FleetNameConflictError) {
      return {
        ok: false,
        formError: null,
        fieldErrors: { name: [err.message] },
      };
    }
    // Unexpected — log and surface a generic error so the form stays usable.
    console.error("[createFleetAction] unexpected:", err);
    return {
      ok: false,
      formError: "Something went wrong creating the fleet. Please try again.",
      fieldErrors: {},
    };
  }

  // 5. Success → redirect. We do this *after* the try/catch because
  //    `redirect()` throws internally and we don't want to mask it.
  redirect(`/fleetspace?created=${encodeURIComponent(created.id)}`);
}

/**
 * Soft-delete a fleet. Invoked from the "More → Delete Fleet" row action
 * on `/fleetspace`. Returns a typed result so the client can show a
 * sonner toast and call `router.refresh()` to drop the row.
 */
export async function deleteFleetAction(
  fleetId: string,
): Promise<FleetActionResult> {
  const session = await requireSession();
  try {
    await new FleetService().softDelete(session.orgId, fleetId);
  } catch (err) {
    if (err instanceof FleetNotFoundError) {
      return { ok: false, error: err.message };
    }
    console.error("[deleteFleetAction] unexpected:", err);
    return {
      ok: false,
      error: "Something went wrong deleting the fleet. Please try again.",
    };
  }

  // Invalidate the listing so the row drops on the next render.
  revalidatePath("/fleetspace");
  return { ok: true, message: "Fleet deleted." };
}

/**
 * Edit a fleet via the full-page `/fleetspace/[slug]/edit` form.
 *
 * Mirrors `createFleetAction` exactly — same FormData shape (`name`,
 * `type`, `currency`, `description`, `visibility`, `tag`, `vesselIds[]`)
 * plus a hidden `fleetId` field so we know which row to update. Returns
 * a typed `FleetFormState` so the form can stay bound to
 * `useActionState` and surface field errors inline.
 *
 * Vessel membership is reconciled atomically: any current attachment
 * not in the posted `vesselIds[]` is soft-deleted; any id in the set
 * that isn't already attached is inserted.
 */
export async function editFleetAction(
  _prev: FleetFormState,
  formData: FormData,
): Promise<FleetFormState> {
  const session = await requireSession();

  const fleetId = String(formData.get("fleetId") ?? "");
  if (!fleetId) {
    return {
      ok: false,
      formError: "Missing fleet id. Please reload and try again.",
      fieldErrors: {},
    };
  }

  // Same raw-extraction logic as `createFleetAction` — empty strings
  // become `undefined` so Zod's defaults / optionals apply cleanly.
  const raw = {
    name: String(formData.get("name") ?? ""),
    type: emptyToUndef(formData.get("type")),
    currency: emptyToUndef(formData.get("currency")),
    description: emptyToUndef(formData.get("description")),
    visibility: emptyToUndef(formData.get("visibility")),
    tag: emptyToUndef(formData.get("tag")),
    ownerName: emptyToUndef(formData.get("ownerName")),
    vesselIds: formData.getAll("vesselIds").map((v) => String(v)).filter(Boolean),
  };

  const parsed = FleetUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      formError: null,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await new FleetService().updateWithVessels(
      session.orgId,
      fleetId,
      session.userId,
      parsed.data,
    );
  } catch (err) {
    if (err instanceof FleetNameConflictError) {
      return {
        ok: false,
        formError: null,
        fieldErrors: { name: [err.message] },
      };
    }
    if (err instanceof FleetNotFoundError) {
      return {
        ok: false,
        formError: err.message,
        fieldErrors: {},
      };
    }
    console.error("[editFleetAction] unexpected:", err);
    return {
      ok: false,
      formError: "Something went wrong saving the fleet. Please try again.",
      fieldErrors: {},
    };
  }

  redirect(`/fleetspace?updated=${encodeURIComponent(fleetId)}`);
}

/**
 * Duplicate a fleet. Creates a sibling with a fresh slug and the same
 * vessel attachments. The optional `name` lets the user override the
 * auto-resolved "<source> (Copy)" name from the dialog. Invoked from the
 * "More → Duplicate Fleet" row action.
 */
export async function duplicateFleetAction(
  fleetId: string,
  options: { name?: string } = {},
): Promise<FleetActionResult & { newFleetId?: string }> {
  const session = await requireSession();
  try {
    const copy = await new FleetService().duplicate(
      session.orgId,
      fleetId,
      session.userId,
      options.name !== undefined ? { name: options.name } : {},
    );
    revalidatePath("/fleetspace");
    return {
      ok: true,
      message: `Fleet duplicated as "${copy.name}".`,
      newFleetId: copy.id,
    };
  } catch (err) {
    if (err instanceof FleetNotFoundError) {
      return { ok: false, error: err.message };
    }
    if (err instanceof FleetNameConflictError) {
      return { ok: false, error: err.message };
    }
    console.error("[duplicateFleetAction] unexpected:", err);
    return {
      ok: false,
      error: "Something went wrong duplicating the fleet. Please try again.",
    };
  }
}

/**
 * Server lookup: ask for the name the duplicate dialog should pre-fill.
 * Returned name is guaranteed unique among non-deleted siblings at the
 * moment of the call. The dialog re-uses the same value the auto path
 * would have used, but the user can still edit it before submitting.
 */
export async function suggestDuplicateFleetNameAction(
  fleetId: string,
): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  const session = await requireSession();
  const name = await new FleetService().suggestCopyName(session.orgId, fleetId);
  if (name == null) {
    return { ok: false, error: "Fleet not found." };
  }
  return { ok: true, name };
}

/** FormData values are `FormDataEntryValue | null`. Treat empty strings as
 *  undefined so Zod's defaults take over. */
function emptyToUndef(v: FormDataEntryValue | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}
