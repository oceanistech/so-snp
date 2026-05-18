/**
 * Form-state types and constants for the Add Vessel flow.
 *
 * Lives in its own non-`"use server"` file because Next.js rewrites every
 * export from a server-action module as a server-action reference, which
 * strips plain objects on the client and surfaces them as `undefined`.
 * See `lib/actions/fleet.form-state.ts` for the same pattern + the trap
 * write-up in `docs/architecture/fleets-and-vessels.md`.
 */

export type VesselFormState =
  | { ok: false; formError: string | null; fieldErrors: Record<string, string[]> }
  | { ok: true; vesselId: string };

export const INITIAL_VESSEL_FORM_STATE: VesselFormState = {
  ok: false,
  formError: null,
  fieldErrors: {},
};
