"use client";
/**
 * CreateFleetForm — interactive island for /fleetspace/create.
 *
 * Three sections mirroring `html/create-fleet.html`:
 *   1. Fleet Details      — name*, type, currency, description, tag
 *   2. Add Vessels        — searchable checklist of the org's vessels
 *   3. Visibility & Access — owner (read-only), visibility, tag
 *
 * Validation: shared FleetCreateSchema runs on both sides. Errors come back
 * from `createFleetAction` as `state.fieldErrors[name]: string[]` and are
 * rendered under each input. The submit button shows a pending state via
 * the `isPending` flag from `useActionState`.
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
import { createFleetAction } from "@/lib/actions/fleet.actions";
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

/**
 * Map a Fleet Type select value to the corresponding VesselType root the
 * Add-Vessels checklist should filter by. `Mixed` returns `null` →
 * filtering is disabled (show every vessel). The other values map onto
 * the `VesselListItem["typeRoot"]` literal union ("BULK", "TANKER", …).
 */
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

export function CreateFleetForm({
  attachableVessels,
  ownerLabel,
}: {
  attachableVessels: AttachableVessel[];
  ownerLabel: string;
}) {
  const [state, formAction, isPending] = useActionState<FleetFormState, FormData>(
    createFleetAction,
    INITIAL_FLEET_FORM_STATE,
  );
  const fieldErrors = !state.ok ? state.fieldErrors : {};
  const formError = !state.ok ? state.formError : null;

  const [vesselFilter, setVesselFilter] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  /**
   * Selected fleet type — mirrors the Fleet Type select. Changing this
   * narrows the vessel checklist to vessels whose `typeRoot` matches.
   * "Mixed" disables the type filter (shows every attachable vessel).
   */
  const [fleetType, setFleetType] = React.useState<
    (typeof FLEET_TYPES)[number]
  >("Mixed");

  const filteredVessels = React.useMemo(() => {
    const requiredRoot = FLEET_TYPE_TO_VESSEL_ROOT[fleetType];
    const q = vesselFilter.trim().toLowerCase();
    return attachableVessels.filter((v) => {
      // Type filter — only when the Fleet Type is a specific category.
      if (requiredRoot != null && v.typeRoot !== requiredRoot) return false;
      // Text filter — name / IMO / typeLabel / year.
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
          { label: "Create Fleet" },
        ]}
        title="Create New Fleet"
        subtitle="Set up a fleet group and assign vessels to start tracking portfolio performance"
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
            <Button form="create-fleet-form" type="submit" disabled={isPending}>
              <Check className="size-3.5" />
              {isPending ? "Creating…" : "Create Fleet"}
            </Button>
          </>
        }
      />

      <form
        id="create-fleet-form"
        action={formAction}
        className="flex flex-col gap-6 p-8"
        noValidate
      >
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
                  placeholder="e.g. Fleet Gamma, Asia-Pacific Fleet…"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-err" : undefined}
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
                  defaultValue="USD"
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
                placeholder="Describe this fleet's purpose, strategy, or scope (e.g. dry bulk vessels acquired post-2018 for long-term TC strategy)…"
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
          </div>
        </Card>

        {/* ── Section 2: Add Vessels ───────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <SectionTitle step={2}>Add Vessels</SectionTitle>
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
              Select vessels from your existing roster to include in this fleet.
              You can also add vessels later.
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
              {/* Free-text owner display name — person or company.
                  Pre-filled with the current user's email so a freshly-
                  created fleet always has something to render in the Owner
                  column; the user can overwrite it (e.g. "Cardiff Marine"). */}
              <input
                name="ownerName"
                type="text"
                defaultValue={ownerLabel}
                placeholder="e.g. Cardiff Marine"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
            <FormField label="Visibility" error={fieldErrors.visibility?.[0]}>
              <select
                name="visibility"
                defaultValue="PRIVATE"
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
                placeholder="e.g. 2026 Expansion, Q1 Review…"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FormField>
          </div>
        </Card>

        <div className="flex gap-2 pb-6">
          <Button type="submit" disabled={isPending}>
            <Check className="size-3.5" />
            {isPending ? "Creating…" : "Create Fleet"}
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
    <div className="flex items-center gap-2 text-[15px] font-bold">
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-extrabold text-primary-foreground">
        {step}
      </span>
      {children}
    </div>
  );
}
