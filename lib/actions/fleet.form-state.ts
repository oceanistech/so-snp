/**
 * Form-state types and constants shared between the server action and the
 * client form.
 *
 * Lives in its own file (without `"use server"`) because Next.js treats
 * every export from a `"use server"` module as a server action — plain
 * objects exported alongside actions get bundle-stripped on the client and
 * arrive as `undefined`, which is what crashed `/fleetspace/create` on the
 * first render of `CreateFleetForm` (Cannot read properties of undefined).
 */

export type FleetFormState =
  | { ok: false; formError: string | null; fieldErrors: Record<string, string[]> }
  | { ok: true; fleetId: string; slug: string; redirectTo: string };

export const INITIAL_FLEET_FORM_STATE: FleetFormState = {
  ok: false,
  formError: null,
  fieldErrors: {},
};
