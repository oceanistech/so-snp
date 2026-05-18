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
import { FleetCreateSchema } from "@/lib/validation/fleet";
import { FleetService, FleetNameConflictError } from "@/lib/services/fleet.service";
import { requireSession } from "@/lib/auth/session";
import type { FleetFormState } from "./fleet.form-state";

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

/** FormData values are `FormDataEntryValue | null`. Treat empty strings as
 *  undefined so Zod's defaults take over. */
function emptyToUndef(v: FormDataEntryValue | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}
