"use client";
/**
 * AddVesselForm — interactive island for /vessels/new.
 *
 * Layout mirrors `html/add-vessel.html`:
 *   - LEFT column: 4 sections — Identification, Specifications,
 *     Commercial & Financial, Notes — plus an "IMO Quick Lookup" card
 *     at the top (currently a coming-soon placeholder; Signal Ocean
 *     wiring lands in a separate ticket).
 *   - RIGHT rail: a live `VesselPreview` card that updates as the user
 *     types name / IMO / year / DWT / flag / type / fleet.
 *
 * Two-level type picker: the parent dropdown lists VesselType rows with
 * `parentId === null`, and the subtype dropdown is filtered client-side
 * from the same `vesselTypes` array whenever the parent changes. The
 * `vesselTypeId` posted to the server is the leaf (subtype) id when one
 * exists, otherwise the parent id.
 *
 * Validation runs in two places: the same `VesselCreateSchema` Zod schema
 * is the source of truth on both client and server. The action returns
 * `state.fieldErrors[name]: string[]` which is rendered under each input.
 */
import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Check, Info, Search } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AddVesselReferenceData } from "@/lib/services/reference.service";
import { createVesselAction } from "@/lib/actions/vessel.actions";
import {
  INITIAL_VESSEL_FORM_STATE,
  type VesselFormState,
} from "@/lib/actions/vessel.form-state";

/* --------------------------------------------------------------------------
 * Static enums + small helpers
 * -------------------------------------------------------------------------- */

const CURRENCIES = ["USD", "EUR", "GBP"] as const;

const EMPLOYMENT_OPTIONS = [
  { value: "CURRENT_EARNINGS", label: "Current Earnings" },
  { value: "HISTORIC_EARNINGS", label: "Historic Earnings" },
  { value: "FUTURE_EARNINGS", label: "Future Earnings" },
] as const;

const LIFECYCLE_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRYDOCK", label: "Dry Dock" },
  { value: "LAID_UP", label: "Laid Up" },
  { value: "UNDER_REPAIR", label: "Under Repair" },
  { value: "RETIRED", label: "Retired" },
] as const;

/** Map VesselType root → badge palette used in the live preview. */
type TypeRoot = "BULK" | "TANKER" | "GAS" | "CONTAINER" | "OFFSHORE" | "OTHER";

const TYPE_TAG: Record<TypeRoot, { label: string; cls: string }> = {
  BULK:      { label: "BULK",   cls: "bg-primary/12 text-primary" },
  TANKER:    { label: "TANKER", cls: "bg-signal-orange/15 text-signal-orange" },
  GAS:       { label: "GAS",    cls: "bg-accent/15 text-accent" },
  CONTAINER: { label: "CONT",   cls: "bg-signal-purple/15 text-signal-purple" },
  OFFSHORE:  { label: "OFFSH",  cls: "bg-signal-green/15 text-signal-green" },
  OTHER:     { label: "OTHER",  cls: "bg-muted text-muted-foreground" },
};

const KNOWN_ROOTS: readonly TypeRoot[] = [
  "BULK",
  "TANKER",
  "GAS",
  "CONTAINER",
  "OFFSHORE",
];

function rootOfCode(code: string | undefined | null): TypeRoot {
  if (!code) return "OTHER";
  const head = code.split(".")[0];
  const candidate = (head ?? "").toUpperCase();
  return KNOWN_ROOTS.includes(candidate as TypeRoot)
    ? (candidate as TypeRoot)
    : "OTHER";
}

/* --------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

type FleetOption = { id: string; name: string };

export function AddVesselForm({
  referenceData,
  fleets,
  ownerLabel,
}: {
  referenceData: AddVesselReferenceData;
  fleets: FleetOption[];
  ownerLabel: string;
}) {
  const { vesselTypes, countries, ports, shipyards, classSocieties, engineModels } =
    referenceData;

  const parentTypes = React.useMemo(
    () => vesselTypes.filter((t) => t.parentId === null),
    [vesselTypes],
  );

  const [state, formAction, isPending] = useActionState<VesselFormState, FormData>(
    createVesselAction,
    INITIAL_VESSEL_FORM_STATE,
  );
  const fieldErrors = !state.ok ? state.fieldErrors : {};
  const formError = !state.ok ? state.formError : null;

  // Form state — held in React so the live preview can mirror it
  const [name, setName] = React.useState("");
  const [imo, setImo] = React.useState("");
  const [parentTypeId, setParentTypeId] = React.useState<string>("");
  const [subTypeId, setSubTypeId] = React.useState<string>("");
  const [yearBuilt, setYearBuilt] = React.useState<string>("");
  const [dwt, setDwt] = React.useState<string>("");
  const [flagCountryId, setFlagCountryId] = React.useState<string>("");
  const [fleetId, setFleetId] = React.useState<string>("");

  // Subtypes for the currently-picked parent
  const subTypes = React.useMemo(
    () => (parentTypeId ? vesselTypes.filter((t) => t.parentId === parentTypeId) : []),
    [parentTypeId, vesselTypes],
  );

  // Reset subtype whenever parent changes
  React.useEffect(() => {
    setSubTypeId("");
  }, [parentTypeId]);

  // The vesselTypeId we actually submit: subtype when available, otherwise parent
  const submittedTypeId = subTypeId || parentTypeId;
  const submittedTypeCode = React.useMemo(() => {
    const node = vesselTypes.find((t) => t.id === submittedTypeId);
    return node?.code ?? null;
  }, [submittedTypeId, vesselTypes]);

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Fleets", href: "/fleetspace" },
          { label: "Add Vessel" },
        ]}
        title="Add Vessel"
        subtitle="Register a new vessel to your portfolio. Fields marked * are required."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
            <Button form="add-vessel-form" type="submit" disabled={isPending}>
              <Check className="size-3.5" />
              {isPending ? "Saving…" : "Save Vessel"}
            </Button>
          </>
        }
      />

      <form
        id="add-vessel-form"
        action={formAction}
        className="grid gap-6 p-8 lg:grid-cols-[1fr_300px]"
        noValidate
      >
        {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {formError ? (
            <div
              role="alert"
              className="rounded-md border border-signal-magenta/30 bg-signal-magenta/8 px-4 py-2 text-[12px] text-signal-magenta"
            >
              {formError}
            </div>
          ) : null}

          {/* IMO Quick Lookup placeholder */}
          <Card className="border-l-[3px] border-l-primary">
            <div className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex shrink-0 items-center gap-2">
                <Search className="size-4 text-primary" />
                <div>
                  <div className="text-[13px] font-bold">Quick lookup by IMO</div>
                  <div className="text-[11px] text-muted-foreground">
                    Auto-fill from Signal Ocean — coming soon
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                <Info className="size-3.5" />
                Wiring lands in a follow-up ticket
              </div>
            </div>
          </Card>

          {/* ── 1. Identification ─────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Vessel Identification</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-4 pt-0">
              <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
                <FormField label="Vessel Name" required error={fieldErrors.name?.[0]}>
                  <input
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MV Ocean Voyager"
                    className={inputCls}
                    aria-invalid={!!fieldErrors.name}
                  />
                </FormField>
                <FormField
                  label="IMO Number"
                  required
                  hint="7-digit IMO identifier"
                  error={fieldErrors.imo?.[0]}
                >
                  <input
                    name="imo"
                    type="text"
                    value={imo}
                    onChange={(e) => setImo(e.target.value)}
                    placeholder="9XXXXXXX"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={inputCls}
                    aria-invalid={!!fieldErrors.imo}
                  />
                </FormField>
                <FormField label="MMSI" error={fieldErrors.mmsi?.[0]}>
                  <input name="mmsi" type="text" placeholder="9-digit MMSI" className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Call Sign" error={fieldErrors.callSign?.[0]}>
                  <input name="callSign" type="text" placeholder="e.g. V7AB2" className={inputCls} />
                </FormField>
                <FormField label="Flag State" required error={fieldErrors.flagCountryId?.[0]}>
                  <select
                    name="flagCountryId"
                    value={flagCountryId}
                    onChange={(e) => setFlagCountryId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— Select —</option>
                    {countries
                      .filter((c) => c.isFlagState)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </FormField>
                <FormField label="Port of Registry" error={fieldErrors.portOfRegistryId?.[0]}>
                  <select name="portOfRegistryId" className={inputCls} defaultValue="">
                    <option value="">— Select —</option>
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 2. Specifications ─────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Vessel Specifications</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-4 pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Vessel Type" required error={fieldErrors.vesselTypeId?.[0]}>
                  <select
                    value={parentTypeId}
                    onChange={(e) => setParentTypeId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— Select —</option>
                    {parentTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Sub-type">
                  <select
                    value={subTypeId}
                    onChange={(e) => setSubTypeId(e.target.value)}
                    disabled={subTypes.length === 0}
                    className={cn(inputCls, subTypes.length === 0 && "text-muted-foreground")}
                  >
                    <option value="">
                      {parentTypeId
                        ? subTypes.length === 0
                          ? "— No sub-types —"
                          : "— Select —"
                        : "— Select type first —"}
                    </option>
                    {subTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {/* The hidden input is what actually gets posted as
                       vesselTypeId — subtype when available, parent otherwise. */}
                  <input type="hidden" name="vesselTypeId" value={submittedTypeId} />
                </FormField>
                <FormField label="Year Built" required error={fieldErrors.yearBuilt?.[0]}>
                  <input
                    name="yearBuilt"
                    type="number"
                    min="1970"
                    max={String(new Date().getFullYear() + 4)}
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    placeholder="e.g. 2016"
                    className={inputCls}
                    aria-invalid={!!fieldErrors.yearBuilt}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="DWT (tonnes)" required error={fieldErrors.dwt?.[0]}>
                  <input
                    name="dwt"
                    type="number"
                    value={dwt}
                    onChange={(e) => setDwt(e.target.value)}
                    placeholder="e.g. 82000"
                    className={inputCls}
                    aria-invalid={!!fieldErrors.dwt}
                  />
                </FormField>
                <FormField label="GRT" error={fieldErrors.grt?.[0]}>
                  <input name="grt" type="number" placeholder="e.g. 44000" className={inputCls} />
                </FormField>
                <FormField label="LOA (m)" error={fieldErrors.loaM?.[0]}>
                  <input
                    name="loaM"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 229"
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Beam (m)" error={fieldErrors.beamM?.[0]}>
                  <input
                    name="beamM"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 32.2"
                    className={inputCls}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Builder / Shipyard" error={fieldErrors.shipyardId?.[0]}>
                  <select name="shipyardId" className={inputCls} defaultValue="">
                    <option value="">— Select —</option>
                    {shipyards.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.city ? ` (${s.city})` : ""}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="Classification Society"
                  error={fieldErrors.classSocietyId?.[0]}
                >
                  <select name="classSocietyId" className={inputCls} defaultValue="">
                    <option value="">— Select —</option>
                    {classSocieties.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="Next Special Survey"
                  error={fieldErrors.nextSpecialSurvey?.[0]}
                >
                  <input
                    name="nextSpecialSurvey"
                    type="date"
                    className={inputCls}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Engine Model (optional)">
                  <select name="engineModelId" className={inputCls} defaultValue="">
                    <option value="">— Select —</option>
                    {engineModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.maker.name} {m.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Service Speed (knots)">
                  <input
                    name="serviceSpeedKn"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14.5"
                    className={inputCls}
                  />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 3. Commercial & Financial ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Commercial &amp; Financial</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-4 pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Assign to Fleet">
                  <select
                    name="fleetId"
                    value={fleetId}
                    onChange={(e) => setFleetId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— None / Unassigned —</option>
                    {fleets.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="Employment Status"
                  error={fieldErrors.employmentStatus?.[0]}
                >
                  <select
                    name="employmentStatus"
                    defaultValue="CURRENT_EARNINGS"
                    className={inputCls}
                  >
                    {EMPLOYMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Lifecycle Status" error={fieldErrors.lifecycleStatus?.[0]}>
                  <select name="lifecycleStatus" defaultValue="ACTIVE" className={inputCls}>
                    {LIFECYCLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Currency">
                  <select name="currency" defaultValue="USD" className={inputCls}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="Acquisition Cost"
                  error={fieldErrors.acquisitionCost?.[0]}
                >
                  <input
                    name="acquisitionCost"
                    type="number"
                    placeholder="e.g. 28500000"
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Acquisition Date" error={fieldErrors.acquisitionDate?.[0]}>
                  <input name="acquisitionDate" type="date" className={inputCls} />
                </FormField>
                <FormField
                  label="Current FMV (USD)"
                  hint="Leave blank to request automatic valuation"
                  error={fieldErrors.currentFmv?.[0]}
                >
                  <input
                    name="currentFmv"
                    type="number"
                    placeholder="e.g. 28500000"
                    className={inputCls}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  label="Outstanding Loan (USD)"
                  error={fieldErrors.outstandingLoan?.[0]}
                >
                  <input
                    name="outstandingLoan"
                    type="number"
                    placeholder="e.g. 18000000"
                    className={inputCls}
                  />
                </FormField>
                <FormField label="On Sale?">
                  <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-[13px]">
                    <input
                      type="checkbox"
                      name="isOnSale"
                      className="size-3.5 accent-primary"
                    />
                    Mark as on sale
                  </label>
                </FormField>
                <FormField label="Listed-at Date" error={fieldErrors.onSaleAt?.[0]}>
                  <input name="onSaleAt" type="date" className={inputCls} />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 4. Notes ──────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Notes</SectionTitle>
            </CardHeader>
            <div className="p-4 pt-0">
              <FormField label="Free-text notes" error={fieldErrors.notes?.[0]}>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Additional notes, trading history, ownership context…"
                  className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2 pb-6">
            <Button type="submit" disabled={isPending}>
              <Check className="size-3.5" />
              {isPending ? "Saving…" : "Save Vessel"}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
            <span className="ml-auto self-center text-[11px] text-muted-foreground">
              Owner: <strong className="font-semibold text-foreground">{ownerLabel}</strong>
            </span>
          </div>
        </div>

        {/* ── RIGHT RAIL: Live Vessel Preview ────────────────────────── */}
        <aside className="sticky top-4 self-start">
          <VesselPreview
            name={name}
            imo={imo}
            yearBuilt={yearBuilt}
            dwt={dwt}
            flagName={
              countries.find((c) => c.id === flagCountryId)?.name ?? null
            }
            fleetName={fleets.find((f) => f.id === fleetId)?.name ?? null}
            typeCode={submittedTypeCode}
          />
        </aside>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Live Vessel Preview card (right rail)
 * -------------------------------------------------------------------------- */
function VesselPreview({
  name,
  imo,
  yearBuilt,
  dwt,
  flagName,
  fleetName,
  typeCode,
}: {
  name: string;
  imo: string;
  yearBuilt: string;
  dwt: string;
  flagName: string | null;
  fleetName: string | null;
  typeCode: string | null;
}) {
  const root = rootOfCode(typeCode);
  const tag = TYPE_TAG[root];
  const dwtNum = dwt ? Number(dwt) : null;
  const ready = Boolean(name && imo.length === 7 && typeCode && dwt);

  return (
    <div
      data-testid="vessel-preview"
      className="flex flex-col gap-3 rounded-md border bg-card p-4 shadow-sm"
    >
      <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        Vessel Preview
      </div>
      <div>
        <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold", tag.cls)}>
          {tag.label}
        </span>
      </div>
      <div className="text-[16px] font-bold leading-tight">
        {name || <span className="text-muted-foreground">Untitled vessel</span>}
      </div>
      <div className="text-[11px] text-muted-foreground">
        IMO {imo || "—"} · Year {yearBuilt || "—"}
      </div>
      <PreviewRow k="DWT" v={dwtNum != null ? `${dwtNum.toLocaleString()} t` : "—"} />
      <PreviewRow k="Flag" v={flagName ?? "—"} />
      <PreviewRow k="Fleet" v={fleetName ?? "Unassigned"} />
      {ready ? (
        <div className="mt-1 rounded border border-signal-green/30 bg-signal-green/8 px-3 py-2 text-[11px] font-semibold text-signal-green">
          Ready to save
        </div>
      ) : (
        <div className="mt-1 rounded border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-semibold text-primary">
          Enter name, IMO, type, and DWT to continue
        </div>
      )}
    </div>
  );
}

function PreviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-t pt-2 text-[12px]">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold tabular-nums">{v}</span>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Field shell + section title
 * -------------------------------------------------------------------------- */

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  // Wrapping `children` *inside* the `<label>` creates an implicit
  // label-for-input association (the same one HTML spec guarantees when
  // a form control is nested inside a label). Without this, the select /
  // input has no accessible name, which fails screen readers AND any
  // RTL `getByLabelText` / `getByRole({ name })` query.
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        {label}
        {required ? <span className="ml-0.5 text-signal-magenta">*</span> : null}
      </span>
      {children}
      {error ? (
        <p role="alert" className="text-[12px] font-medium text-signal-magenta">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] font-bold">{children}</div>;
}
