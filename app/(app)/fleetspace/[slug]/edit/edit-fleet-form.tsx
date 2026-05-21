"use client";
/**
 * EditFleetForm — interactive island for `/fleetspace/[slug]/edit`.
 *
 * Visually identical to `CreateFleetForm` (same three sections, same
 * field shells, same vessel checklist) — the only differences are:
 *   1. Inputs are pre-filled with the fleet's current values.
 *   2. The vessel checklist starts with the currently-attached vessels
 *      ticked, and unticking detaches them on save.
 *   3. The form posts to `editFleetAction` instead of `createFleetAction`.
 *   4. A hidden `fleetId` input tells the action which row to update.
 *
 * Validation runs the same shared `FleetUpdateSchema` (a `.partial()` of
 * `FleetCreateSchema`) on both sides, and errors come back as
 * `state.fieldErrors[name]: string[]` so per-field rendering is identical
 * to the create form.
 */
import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AttachableVessel } from "@/lib/services/vessel.service";
import type { FleetEditPayload } from "@/lib/services/fleet.service";
import { editFleetAction } from "@/lib/actions/fleet.actions";
import {
  INITIAL_FLEET_FORM_STATE,
  type FleetFormState,
} from "@/lib/actions/fleet.form-state";

const FLEET_TYPES = [
  "Mixed",
  "Bulk Carriers",
  "Tankers",
  "Gas Carriers",
  "Containers",
  "Offshore",
] as const;

/** Map Fleet Type → VesselType root used by the Add-Vessels filter.
 *  "Mixed" disables filtering; the rest constrain to a single typeRoot. */
const FLEET_TYPE_TO_VESSEL_ROOT: Record<
  (typeof FLEET_TYPES)[number],
  string | null
> = {
  Mixed: null,
  "Bulk Carriers": "BULK",
  Tankers: "TANKER",
  "Gas Carriers": "GAS",
  Containers: "CONTAINER",
  Offshore: "OFFSHORE",
};

const CURRENCIES = ["USD", "EUR", "GBP"] as const;

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", label: "Private (only me)" },
  { value: "TEAM", label: "Team (all users)" },
  { value: "READ_ONLY_SHARE", label: "Read-only share" },
] as const;

const TYPE_TAG: Record<string, string> = {
  BULK: "bg-primary/12 text-primary",
  TANKER: "bg-signal-orange/15 text-signal-orange",
  GAS: "bg-accent/15 text-accent",
  CONTAINER: "bg-signal-purple/15 text-signal-purple",
  OFFSHORE: "bg-signal-green/15 text-signal-green",
  OTHER: "bg-muted text-muted-foreground",
};

export function EditFleetForm({
  fleet,
  attachableVessels,
  ownerLabel,
}: {
  fleet: FleetEditPayload;
  attachableVessels: AttachableVessel[];
  ownerLabel: string;
}) {
  const [state, formAction, isPending] = useActionState<FleetFormState, FormData>(
    editFleetAction,
    INITIAL_FLEET_FORM_STATE,
  );
  const fieldErrors = !state.ok ? state.fieldErrors : {};
  const formError = !state.ok ? state.formError : null;

  const [vesselFilter, setVesselFilter] = React.useState("");
  // Pre-tick the currently-attached vessels so the user sees the existing
  // membership and can deselect to detach.
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set(fleet.vesselIds),
  );
  // Mirror the Fleet Type select so changing it filters the checklist.
  const [fleetType, setFleetType] = React.useState<
    (typeof FLEET_TYPES)[number]
  >(
    // The DB value may not be in our enum (older fleets / migrated data),
    // so default to "Mixed" — that disables type filtering on the
    // checklist without losing the user's saved choice (the select
    // option still reflects whatever the DB has).
    (FLEET_TYPES as readonly string[]).includes(fleet.type)
      ? (fleet.type as (typeof FLEET_TYPES)[number])
      : "Mixed",
  );

  const filteredVessels = React.useMemo(() => {
    const requiredRoot = FLEET_TYPE_TO_VESSEL_ROOT[fleetType];
    const q = vesselFilter.trim().toLowerCase();
    return attachableVessels.filter((v) => {
      // Type filter — only when the Fleet Type is a specific category.
      if (requiredRoot != null && v.typeRoot !== requiredRoot) return false;
      if (q === "") return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.imo.includes(q) ||
        v.typeLabel.toLowerCase().includes(q) ||
        String(v.yearBuilt).includes(q)
      );
    });
  }, [attachableVessels, vesselFilter, fleetType]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Fleets", href: "/fleetspace" },
          { label: fleet.name, href: `/fleetspace?fleet=${fleet.id}` },
          { label: "Edit" },
        ]}
        title={`Edit ${fleet.name}`}
        subtitle="Update fleet settings, then save to commit changes"
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
            <Button form="edit-fleet-form" type="submit" disabled={isPending}>
              <Check className="size-3.5" />
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </>
        }
      />

      <form
        id="edit-fleet-form"
        action={formAction}
        className="flex flex-col gap-6 p-8"
        noValidate
      >
        {/* Hidden id — tells the server action which row to update.
            Cancel works without a value (just navigates away). */}
        <input type="hidden" name="fleetId" value={fleet.id} />

        {formError ? (
          <div
            role="alert"
            className="rounded-md border border-signal-magenta/30 bg-signal-magenta/8 px-4 py-2 text-[12px] text-signal-magenta"
          >
            {formError}
          </div>
        ) : null}

        {/* ── Section 1: Fleet Details ─────────────────────────────────── */}
        <Card>
          <CardHeader>
            <SectionTitle step={1}>Fleet Details</SectionTitle>
          </CardHeader>
          <div className="flex flex-col gap-4 p-6">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
              <FormField
                label="Fleet Name"
                required
                error={fieldErrors.name?.[0]}
              >
                <input
                  name="name"
                  type="text"
                  defaultValue={fleet.name}
                  placeholder="e.g. Fleet Gamma, Asia-Pacific Fleet…"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-invalid={!!fieldErrors.name}
                />
              </FormField>
              <FormField label="Fleet Type" error={fieldErrors.type?.[0]}>
                <select
                  name="type"
                  value={fleetType}
                  onChange={(e) =>
                    setFleetType(e.target.value as (typeof FLEET_TYPES)[number])
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {FLEET_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Reporting Currency" error={fieldErrors.currency?.[0]}>
                <select
                  name="currency"
                  defaultValue={fleet.currency}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Description / Purpose" error={fieldErrors.description?.[0]}>
              <textarea
                name="description"
                rows={3}
                defaultValue={fleet.description ?? ""}
                placeholder="Describe this fleet's purpose, strategy, or scope (e.g. dry bulk vessels acquired post-2018 for long-term TC strategy)…"
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
          </div>
        </Card>

        {/* ── Section 2: Add Vessels ───────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <SectionTitle step={2}>Vessels in this Fleet</SectionTitle>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 ? (
                <span
                  data-testid="selected-vessels-count"
                  className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-extrabold text-primary-foreground"
                >
                  {selectedIds.size}
                </span>
              ) : null}
              <Button asChild size="sm" variant="secondary">
                <Link href="/vessels/new">
                  <Plus className="size-3" />
                  Add New Vessel
                </Link>
              </Button>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-3 p-6">
            <p className="text-[13px] text-muted-foreground">
              Tick the vessels that should belong to this fleet. Unticking
              detaches a vessel on save — the vessel record itself is not
              affected.
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter vessels by name, IMO, type, or year…"
                value={vesselFilter}
                onChange={(e) => setVesselFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {attachableVessels.length === 0 ? (
              <div className="rounded-md border border-dashed bg-muted/20 px-6 py-10 text-center">
                <div className="text-[13px] font-bold text-muted-foreground">
                  No vessels in this organisation yet
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  Add a vessel first, then come back to assign it to a fleet.
                </div>
                <div className="mt-3">
                  <Button asChild size="sm">
                    <Link href="/vessels/new">
                      <Plus className="size-3" />
                      Add Vessel
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <ul
                className="grid gap-1.5 md:grid-cols-2 lg:grid-cols-3"
                role="listbox"
                aria-label="Available vessels"
              >
                {filteredVessels.map((v) => {
                  const checked = selectedIds.has(v.id);
                  const tagCls = TYPE_TAG[v.typeRoot] ?? TYPE_TAG.OTHER;
                  return (
                    <li key={v.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-md border bg-background px-3 py-2 text-[13px] transition-colors hover:border-primary/50 hover:bg-primary/[0.04]",
                          checked && "border-primary/70 bg-primary/[0.06]",
                        )}
                      >
                        <input
                          type="checkbox"
                          name="vesselIds"
                          value={v.id}
                          checked={checked}
                          onChange={() => toggle(v.id)}
                          className="size-3.5 shrink-0 accent-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{v.name}</div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {v.typeLabel} · {v.yearBuilt} · IMO {v.imo}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
                            tagCls,
                          )}
                        >
                          {v.typeRoot}
                        </span>
                      </label>
                    </li>
                  );
                })}
                {filteredVessels.length === 0 ? (
                  <li className="col-span-full px-3 py-6 text-center text-[12px] text-muted-foreground">
                    No vessels match your filter.
                  </li>
                ) : null}
              </ul>
            )}

            {fieldErrors.vesselIds ? (
              <p className="text-[12px] text-signal-magenta">
                {fieldErrors.vesselIds[0]}
              </p>
            ) : null}
          </div>
        </Card>

        {/* ── Section 3: Visibility & Access ──────────────────────────── */}
        <Card>
          <CardHeader>
            <SectionTitle step={3}>Visibility &amp; Access</SectionTitle>
          </CardHeader>
          <div className="grid gap-4 p-6 md:grid-cols-3">
            <FormField label="Owner" error={fieldErrors.ownerName?.[0]}>
              {/* Free-text owner display name — person or company. Defaults
                  to the stored `ownerName` if the fleet was already given
                  one, otherwise the session's email so older fleets still
                  show something. Fully editable. */}
              <input
                name="ownerName"
                type="text"
                defaultValue={fleet.ownerName ?? ownerLabel}
                placeholder="e.g. Cardiff Marine"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
            <FormField label="Visibility" error={fieldErrors.visibility?.[0]}>
              <select
                name="visibility"
                defaultValue={fleet.visibility}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {VISIBILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Tag / Label" error={fieldErrors.tag?.[0]}>
              <input
                name="tag"
                type="text"
                defaultValue={fleet.tag ?? ""}
                placeholder="e.g. 2026 Expansion, Q1 Review…"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
          </div>
        </Card>

        <div className="flex gap-2 pb-6">
          <Button type="submit" disabled={isPending}>
            <Check className="size-3.5" />
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
          <Button asChild variant="secondary">
            <Link href="/fleetspace">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Field shell — label, required *, child input, error message
 * -------------------------------------------------------------------------- */
function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        {label}
        {required ? <span className="ml-0.5 text-signal-magenta">*</span> : null}
      </label>
      {children}
      {error ? (
        <p
          role="alert"
          className="text-[12px] font-medium text-signal-magenta"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SectionTitle({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[14px] font-bold leading-snug">
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-extrabold text-primary-foreground">
        {step}
      </span>
      {children}
    </div>
  );
}
