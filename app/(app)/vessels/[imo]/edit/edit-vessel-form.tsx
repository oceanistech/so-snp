"use client";
/**
 * EditVesselForm — interactive island for `/vessels/[imo]/edit`.
 *
 * Mirrors the 17 sections of `AddVesselForm` 1:1 so editing a vessel
 * surfaces every field that was captured at creation. Every input
 * pre-fills from `vessel.<field>` and posts back to `editVesselAction`,
 * which uses the same FormData → Zod → service pipeline as the create
 * flow.
 *
 * Notable differences vs. the create form:
 *   - IMO is read-only (immutable per ADR-0002 — IMOs are externally
 *     assigned and shouldn't change for a given vessel).
 *   - A hidden `vesselId` input tells the action which row to update.
 *   - Breadcrumb and titles read "Edit <name>" / "Save Changes" rather
 *     than "Add Vessel" / "Add to Fleet".
 *   - The IMO Quick Lookup card from create is omitted — the vessel
 *     already exists in the DB so re-fetching from Signal Ocean would
 *     overwrite the user's local edits.
 *
 * The right-rail Vessel Preview is also reused so the user sees the
 * live updated tag / name / DWT / flag while editing.
 */
import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Check, Info } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  SanctionsListInput,
  type SanctionEntry,
} from "@/components/app/sanctions-list-input";
import { cn } from "@/lib/utils";
import type { AddVesselReferenceData } from "@/lib/services/reference.service";
import type { VesselEditPayload } from "@/lib/services/vessel.service";
import { editVesselAction } from "@/lib/actions/vessel.actions";
import {
  INITIAL_VESSEL_FORM_STATE,
  type VesselFormState,
} from "@/lib/actions/vessel.form-state";

/* --------------------------------------------------------------------------
 * Static enums + helpers
 * -------------------------------------------------------------------------- */

const EMPLOYMENT_OPTIONS = [
  { value: "CURRENT_EARNINGS", label: "Current Earnings" },
  { value: "HISTORIC_EARNINGS", label: "Historic Earnings" },
  { value: "FUTURE_EARNINGS", label: "Future Earnings" },
] as const;

const LIFECYCLE_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRYDOCK", label: "Dry Dock" },
  { value: "LAID_UP", label: "Laid Up" },
  { value: "SOLD", label: "Sold" },
  { value: "SCRAPPED", label: "Scrapped" },
] as const;

const CURRENCIES = ["USD", "EUR", "GBP"] as const;

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
  "BULK", "TANKER", "GAS", "CONTAINER", "OFFSHORE",
];

function rootOfCode(code: string | undefined | null): TypeRoot {
  if (!code) return "OTHER";
  const head = code.split(".")[0];
  const candidate = (head ?? "").toUpperCase();
  return KNOWN_ROOTS.includes(candidate as TypeRoot)
    ? (candidate as TypeRoot)
    : "OTHER";
}

const toDateString = (d: Date | null): string | undefined =>
  d ? d.toISOString().slice(0, 10) : undefined;

const toNumberString = (n: number | string | null | undefined): string =>
  n == null ? "" : String(n);

/* --------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

type FleetOption = { id: string; name: string };

export function EditVesselForm({
  vessel,
  referenceData,
  fleets,
  initialSanctions = [],
}: {
  vessel: VesselEditPayload;
  referenceData: AddVesselReferenceData;
  fleets: FleetOption[];
  /** Saved sanctions rows for this vessel, fetched server-side via
   *  `VesselService.getSanctions`. The SanctionsListInput pre-fills its
   *  internal state from this list on first render. */
  initialSanctions?: SanctionEntry[];
}) {
  const { vesselTypes, countries, shipyards, classSocieties } = referenceData;

  const parentTypes = React.useMemo(
    () => vesselTypes.filter((t) => t.parentId === null),
    [vesselTypes],
  );

  // Find the current vessel's parent + leaf type so the two cascading
  // selects pre-fill correctly even when the saved type is a leaf.
  const currentType = vesselTypes.find((t) => t.id === vessel.vesselTypeId);
  const initialParentTypeId =
    currentType?.parentId ?? currentType?.id ?? "";
  const initialSubTypeId =
    currentType?.parentId != null ? currentType.id : "";

  const [state, formAction, isPending] = useActionState<VesselFormState, FormData>(
    editVesselAction,
    INITIAL_VESSEL_FORM_STATE,
  );
  const fieldErrors = !state.ok ? state.fieldErrors : {};
  const formError = !state.ok ? state.formError : null;

  // Form state held in React so the live preview can mirror it.
  const [name, setName] = React.useState(vessel.name);
  const [parentTypeId, setParentTypeId] = React.useState<string>(initialParentTypeId);
  const [subTypeId, setSubTypeId] = React.useState<string>(initialSubTypeId);
  const [yearBuilt, setYearBuilt] = React.useState<string>(String(vessel.yearBuilt));
  const [dwt, setDwt] = React.useState<string>(String(vessel.dwt));
  const [flagCountryId, setFlagCountryId] = React.useState<string>(
    vessel.flagCountryId ?? "",
  );
  // Flag Code mirrors the selected country's ISO2 (uppercased) when the
  // user picks a flag. Held in React state because the value needs to
  // flip live the moment the flag select changes; the user can still
  // override it (e.g. type "LBR" for the older 3-letter convention).
  const [flagCode, setFlagCode] = React.useState<string>(vessel.flagCode ?? "");
  const [fleetId, setFleetId] = React.useState<string>(
    vessel.fleetIds[0] ?? "",
  );

  const subTypes = React.useMemo(
    () => (parentTypeId ? vesselTypes.filter((t) => t.parentId === parentTypeId) : []),
    [parentTypeId, vesselTypes],
  );

  // When parent type changes, reset the leaf select (parent change is
  // user-initiated, not a re-render of the initial seed).
  const didInitParent = React.useRef(true);
  React.useEffect(() => {
    if (didInitParent.current) {
      didInitParent.current = false;
      return;
    }
    setSubTypeId("");
  }, [parentTypeId]);

  // The vesselTypeId we actually submit: leaf when available, otherwise parent.
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
          { label: "Vessels", href: "/fleetspace" },
          { label: vessel.name, href: `/vessels/${encodeURIComponent(vessel.id)}` },
          { label: "Edit" },
        ]}
        title={`Edit ${vessel.name}`}
        subtitle={`IMO ${vessel.imo} · ${currentType?.name ?? "Vessel"} · Built ${vessel.yearBuilt}`}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/vessels/${encodeURIComponent(vessel.id)}`}>Cancel</Link>
            </Button>
            <Button form="edit-vessel-form" type="submit" disabled={isPending}>
              <Check className="size-3.5" />
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </>
        }
      />

      <form
        id="edit-vessel-form"
        action={formAction}
        className="grid gap-6 p-8 lg:grid-cols-[1fr_300px]"
        noValidate
      >
        {/* Hidden id — tells the server action which row to update. */}
        <input type="hidden" name="vesselId" value={vessel.id} />

        {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {formError ? (
            <div
              role="alert"
              className="rounded-md border border-signal-magenta/30 bg-signal-magenta/8 px-4 py-2 text-[12px] text-signal-magenta"
            >
              {formError}
            </div>
          ) : null}

          {/* ── 1. Vessel Identification ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Vessel Identification</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Vessel Name" required error={fieldErrors.name?.[0]}>
                  <input
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    aria-invalid={!!fieldErrors.name}
                  />
                </FormField>
                <FormField label="IMO" hint="Immutable — set at creation">
                  <input
                    type="text"
                    value={vessel.imo}
                    readOnly
                    className={cn(inputCls, "bg-muted/40 text-muted-foreground")}
                  />
                </FormField>
                <FormField label="Call Sign" error={fieldErrors.callSign?.[0]}>
                  <input name="callSign" type="text" defaultValue={vessel.callSign ?? ""} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Flag" error={fieldErrors.flagCountryId?.[0]}>
                  <select
                    name="flagCountryId"
                    value={flagCountryId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setFlagCountryId(nextId);
                      // Auto-fill Flag Code with the country's ISO2 the
                      // moment the flag changes. Empty selection clears
                      // the code. Uppercase for visual consistency.
                      const picked = countries.find((c) => c.id === nextId);
                      setFlagCode(picked ? picked.iso2.toUpperCase() : "");
                    }}
                    className={inputCls}
                  >
                    <option value="">— Select —</option>
                    {countries.filter((c) => c.isFlagState).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Flag Code" error={fieldErrors.flagCode?.[0]}>
                  <input
                    name="flagCode"
                    type="text"
                    maxLength={3}
                    value={flagCode}
                    onChange={(e) => setFlagCode(e.target.value)}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Classification Register" error={fieldErrors.classSocietyId?.[0]}>
                  <select name="classSocietyId" defaultValue={vessel.classSocietyId ?? ""} className={inputCls}>
                    <option value="">— Select —</option>
                    {classSocieties.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Class Renewal Date" error={fieldErrors.classRenewalDate?.[0]}>
                  <input name="classRenewalDate" type="date" defaultValue={toDateString(vessel.classRenewalDate)} className={inputCls} />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 2. Vessel Type & Classification ──────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Vessel Type &amp; Classification</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Vessel Type" required error={fieldErrors.vesselTypeId?.[0]}>
                  <select value={parentTypeId} onChange={(e) => setParentTypeId(e.target.value)} className={inputCls}>
                    <option value="">— Select —</option>
                    {parentTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Vessel Class">
                  <select
                    value={subTypeId}
                    onChange={(e) => setSubTypeId(e.target.value)}
                    disabled={subTypes.length === 0}
                    className={cn(inputCls, subTypes.length === 0 && "text-muted-foreground")}
                  >
                    <option value="">
                      {parentTypeId
                        ? subTypes.length === 0 ? "— No sub-types —" : "— Select —"
                        : "— Select type first —"}
                    </option>
                    {subTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <input type="hidden" name="vesselTypeId" value={submittedTypeId} />
                </FormField>
                <FormField label="Built For Trade" error={fieldErrors.builtForTrade?.[0]}>
                  <input name="builtForTrade" type="text" defaultValue={vessel.builtForTrade ?? ""} className={inputCls} />
                </FormField>
                <FormField label="Current Trade" error={fieldErrors.currentTrade?.[0]}>
                  <input name="currentTrade" type="text" defaultValue={vessel.currentTrade ?? ""} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Design Model" error={fieldErrors.designModel?.[0]}>
                  <input name="designModel" type="text" defaultValue={vessel.designModel ?? ""} className={inputCls} />
                </FormField>
                <FormField label="Ice Class" error={fieldErrors.iceClass?.[0]}>
                  <input name="iceClass" type="text" defaultValue={vessel.iceClass ?? ""} className={inputCls} />
                </FormField>
                <FormField label="Propulsion Type" error={fieldErrors.propulsionType?.[0]}>
                  <input name="propulsionType" type="text" defaultValue={vessel.propulsionType ?? ""} className={inputCls} />
                </FormField>
              </div>
              <CheckboxLabel name="cleanDirtyWilling" defaultChecked={vessel.cleanDirtyWilling}>
                Clean / Dirty Willing
              </CheckboxLabel>
            </div>
          </Card>

          {/* ── 3. Build & Delivery ──────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Build &amp; Delivery</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Year Built" required error={fieldErrors.yearBuilt?.[0]}>
                  <input
                    name="yearBuilt"
                    type="number"
                    min="1970"
                    max={String(new Date().getFullYear() + 4)}
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Built Country" error={fieldErrors.builtCountry?.[0]}>
                  <input name="builtCountry" type="text" defaultValue={vessel.builtCountry ?? ""} className={inputCls} />
                </FormField>
                <FormField label="Shipyard" error={fieldErrors.shipyardId?.[0]}>
                  <select name="shipyardId" defaultValue={vessel.shipyardId ?? ""} className={inputCls}>
                    <option value="">— Select —</option>
                    {shipyards.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}{s.city ? ` (${s.city})` : ""}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Yard Number" error={fieldErrors.yardNumber?.[0]}>
                  <input name="yardNumber" type="text" defaultValue={vessel.yardNumber ?? ""} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Delivery Date" error={fieldErrors.deliveryDate?.[0]}>
                  <input name="deliveryDate" type="date" defaultValue={toDateString(vessel.deliveryDate)} className={inputCls} />
                </FormField>
                <FormField label="Scrapped Date" error={fieldErrors.scrappedDate?.[0]}>
                  <input name="scrappedDate" type="date" defaultValue={toDateString(vessel.scrappedDate)} className={inputCls} />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 4. Order Book (newbuilds only) ───────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>
                Order Book{" "}
                <span className="font-medium text-muted-foreground text-[12px]">(newbuilds only)</span>
              </SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Order Book Status">
                  <select name="orderBook.status" defaultValue={vessel.orderBook?.status ?? ""} className={inputCls}>
                    <option value="">— Select —</option>
                    <option value="ON_ORDER">On Order</option>
                    <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    <option value="LAUNCHED">Launched</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </FormField>
                <FormField label="Order Date">
                  <input name="orderBook.orderDate" type="date" defaultValue={toDateString(vessel.orderBook?.orderDate ?? null)} className={inputCls} />
                </FormField>
                <FormField label="Construction Start">
                  <input name="orderBook.constructionStartDate" type="date" defaultValue={toDateString(vessel.orderBook?.constructionStartDate ?? null)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Launch Date">
                  <input name="orderBook.launchDate" type="date" defaultValue={toDateString(vessel.orderBook?.launchDate ?? null)} className={inputCls} />
                </FormField>
                <FormField label="Scheduled Delivery">
                  <input name="orderBook.scheduledDeliveryDate" type="date" defaultValue={toDateString(vessel.orderBook?.scheduledDeliveryDate ?? null)} className={inputCls} />
                </FormField>
                <FormField label="Cancelled Date">
                  <input name="orderBook.cancelledDate" type="date" defaultValue={toDateString(vessel.orderBook?.cancelledDate ?? null)} className={inputCls} />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 5. Principal Dimensions ──────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Principal Dimensions</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Deadweight (t)" required error={fieldErrors.dwt?.[0]}>
                  <input
                    name="dwt"
                    type="number"
                    value={dwt}
                    onChange={(e) => setDwt(e.target.value)}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Length Overall (m)" error={fieldErrors.loaM?.[0]}>
                  <input name="loaM" type="number" step="0.01" defaultValue={toNumberString(vessel.loaM)} className={inputCls} />
                </FormField>
                <FormField label="Breadth (m)" error={fieldErrors.beamM?.[0]}>
                  <input name="beamM" type="number" step="0.01" defaultValue={toNumberString(vessel.beamM)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Moulded Depth (m)" error={fieldErrors.mouldedDepthM?.[0]}>
                  <input name="mouldedDepthM" type="number" step="0.01" defaultValue={toNumberString(vessel.mouldedDepthM)} className={inputCls} />
                </FormField>
                <FormField label="Draught (m)" error={fieldErrors.draftM?.[0]}>
                  <input name="draftM" type="number" step="0.01" defaultValue={toNumberString(vessel.draftM)} className={inputCls} />
                </FormField>
                <FormField label="Air Draught (m)" error={fieldErrors.airDraughtM?.[0]}>
                  <input name="airDraughtM" type="number" step="0.01" defaultValue={toNumberString(vessel.airDraughtM)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Lightship (t)" error={fieldErrors.lightshipT?.[0]}>
                  <input name="lightshipT" type="number" defaultValue={toNumberString(vessel.lightshipT)} className={inputCls} />
                </FormField>
                <FormField label="Summer TPC" error={fieldErrors.summerTpc?.[0]}>
                  <input name="summerTpc" type="number" step="0.01" defaultValue={toNumberString(vessel.summerTpc)} className={inputCls} />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 6. Tonnage ───────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Tonnage</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Gross Rated (GRT)" error={fieldErrors.grt?.[0]}>
                  <input name="grt" type="number" defaultValue={toNumberString(vessel.grt)} className={inputCls} />
                </FormField>
                <FormField label="Reduced Gross" error={fieldErrors.reducedGrt?.[0]}>
                  <input name="reducedGrt" type="number" defaultValue={toNumberString(vessel.reducedGrt)} className={inputCls} />
                </FormField>
                <FormField label="Net Rated (NRT)" error={fieldErrors.nrt?.[0]}>
                  <input name="nrt" type="number" defaultValue={toNumberString(vessel.nrt)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Panama Canal Net" error={fieldErrors.panamaCanalNrt?.[0]}>
                  <input name="panamaCanalNrt" type="number" defaultValue={toNumberString(vessel.panamaCanalNrt)} className={inputCls} />
                </FormField>
                <FormField label="Suez Canal Net" error={fieldErrors.suezCanalNrt?.[0]}>
                  <input name="suezCanalNrt" type="number" defaultValue={toNumberString(vessel.suezCanalNrt)} className={inputCls} />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 7. Cargo Capacity ────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Cargo Capacity</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Cubic Size (m³)">
                  <input name="cubicSizeM3" type="number" defaultValue={toNumberString(vessel.cubicSizeM3)} className={inputCls} />
                </FormField>
                <FormField label="Grain Capacity (m³)">
                  <input name="grainCapacityM3" type="number" defaultValue={toNumberString(vessel.grainCapacityM3)} className={inputCls} />
                </FormField>
                <FormField label="Bale Capacity (m³)">
                  <input name="baleCapacityM3" type="number" defaultValue={toNumberString(vessel.baleCapacityM3)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="TEU">
                  <input name="teu" type="number" defaultValue={toNumberString(vessel.teu)} className={inputCls} />
                </FormField>
                <FormField label="TEU @ 14t">
                  <input name="teuAt14t" type="number" defaultValue={toNumberString(vessel.teuAt14t)} className={inputCls} />
                </FormField>
                <FormField label="Deck TEU">
                  <input name="deckTeu" type="number" defaultValue={toNumberString(vessel.deckTeu)} className={inputCls} />
                </FormField>
                <FormField label="Under Deck TEU">
                  <input name="underDeckTeu" type="number" defaultValue={toNumberString(vessel.underDeckTeu)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Reefers">
                  <input name="reefers" type="number" defaultValue={toNumberString(vessel.reefers)} className={inputCls} />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 8. Holds, Hatches, Cranes & Grabs ────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Holds, Hatches, Cranes &amp; Grabs</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="# Holds">
                  <input name="numHolds" type="number" defaultValue={toNumberString(vessel.numHolds)} className={inputCls} />
                </FormField>
                <FormField label="# Hatches">
                  <input name="numHatches" type="number" defaultValue={toNumberString(vessel.numHatches)} className={inputCls} />
                </FormField>
                <FormField label="# Cranes">
                  <input name="numCranes" type="number" defaultValue={toNumberString(vessel.numCranes)} className={inputCls} />
                </FormField>
                <FormField label="# Grabs">
                  <input name="numGrabs" type="number" defaultValue={toNumberString(vessel.numGrabs)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Cranes Max Outreach (m)">
                  <input name="cranesMaxOutreachM" type="number" step="0.1" defaultValue={toNumberString(vessel.cranesMaxOutreachM)} className={inputCls} />
                </FormField>
                <FormField label="Cranes Max Lifting (t)">
                  <input name="cranesMaxLiftingT" type="number" defaultValue={toNumberString(vessel.cranesMaxLiftingT)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Hold Details" className="md:col-span-2">
                  <textarea name="holdDetails" rows={2} className={textareaCls} defaultValue={vessel.holdDetails ?? ""} />
                </FormField>
                <FormField label="Hatch Details" className="md:col-span-2">
                  <textarea name="hatchDetails" rows={2} className={textareaCls} defaultValue={vessel.hatchDetails ?? ""} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Crane Details" className="md:col-span-2">
                  <textarea name="craneDetails" rows={2} className={textareaCls} defaultValue={vessel.craneDetails ?? ""} />
                </FormField>
                <FormField label="Grab Details" className="md:col-span-2">
                  <textarea name="grabDetails" rows={2} className={textareaCls} defaultValue={vessel.grabDetails ?? ""} />
                </FormField>
              </div>
              <SubgroupLabel>Equipment fitted</SubgroupLabel>
              <div className={checkboxRowCls}>
                <CheckboxLabel name="isGeared" defaultChecked={vessel.isGeared}>Geared</CheckboxLabel>
                <CheckboxLabel name="grabsFitted" defaultChecked={vessel.grabsFitted}>Grabs Fitted</CheckboxLabel>
                <CheckboxLabel name="boxShapedHolds" defaultChecked={vessel.boxShapedHolds}>Box-Shaped Holds</CheckboxLabel>
                <CheckboxLabel name="openHatch" defaultChecked={vessel.openHatch}>Open Hatch</CheckboxLabel>
                <CheckboxLabel name="australianHoldLadder" defaultChecked={vessel.australianHoldLadder}>Australian Hold Ladder</CheckboxLabel>
                <CheckboxLabel name="logFitted" defaultChecked={vessel.logFitted}>Log Fitted</CheckboxLabel>
                <CheckboxLabel name="a60Bulkhead" defaultChecked={vessel.a60Bulkhead}>A60 Bulkhead</CheckboxLabel>
                <CheckboxLabel name="co2Fitted" defaultChecked={vessel.co2Fitted}>CO₂ Fitted</CheckboxLabel>
              </div>
            </div>
          </Card>

          {/* ── 9. Parallel Body Length ──────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Parallel Body Length</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6 md:grid-cols-4">
              <FormField label="Laden (m)">
                <input name="parallelBodyLadenM" type="number" step="0.01" defaultValue={toNumberString(vessel.parallelBodyLadenM)} className={inputCls} />
              </FormField>
              <FormField label="Ballast (m)">
                <input name="parallelBodyBallastM" type="number" step="0.01" defaultValue={toNumberString(vessel.parallelBodyBallastM)} className={inputCls} />
              </FormField>
              <FormField label="Empty (m)">
                <input name="parallelBodyEmptyM" type="number" step="0.01" defaultValue={toNumberString(vessel.parallelBodyEmptyM)} className={inputCls} />
              </FormField>
            </div>
          </Card>

          {/* ── 10. Manifold (tankers) ───────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>
                Manifold{" "}
                <span className="font-medium text-muted-foreground text-[12px]">(tankers)</span>
              </SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6 md:grid-cols-4">
              <FormField label="Bow → Centre Manifold (m)">
                <input name="bowToCentreManifoldM" type="number" step="0.01" defaultValue={toNumberString(vessel.bowToCentreManifoldM)} className={inputCls} />
              </FormField>
              <FormField label="Waterline → Manifold (m)">
                <input name="waterlineToManifoldM" type="number" step="0.01" defaultValue={toNumberString(vessel.waterlineToManifoldM)} className={inputCls} />
              </FormField>
              <FormField label="Deck → Centre Manifold (m)">
                <input name="deckToCentreManifoldM" type="number" step="0.01" defaultValue={toNumberString(vessel.deckToCentreManifoldM)} className={inputCls} />
              </FormField>
              <FormField label="Rail → Centre Manifold (m)">
                <input name="railToCentreManifoldM" type="number" step="0.01" defaultValue={toNumberString(vessel.railToCentreManifoldM)} className={inputCls} />
              </FormField>
            </div>
          </Card>

          {/* ── 11. Tanker Equipment ─────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Tanker Equipment</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <SubgroupLabel>IMO classification &amp; systems</SubgroupLabel>
              <div className={checkboxRowCls}>
                <CheckboxLabel name="imoType" value="1" defaultChecked={vessel.imoType === "1"}>IMO Type 1</CheckboxLabel>
                <CheckboxLabel name="imoType" value="2" defaultChecked={vessel.imoType === "2"}>IMO Type 2</CheckboxLabel>
                <CheckboxLabel name="imoType" value="3" defaultChecked={vessel.imoType === "3"}>IMO Type 3</CheckboxLabel>
                <CheckboxLabel name="inertGasSystem" defaultChecked={vessel.inertGasSystem}>Inert Gas System (IGS)</CheckboxLabel>
                <CheckboxLabel name="crudeOilWashing" defaultChecked={vessel.crudeOilWashing}>Crude Oil Washing (COW)</CheckboxLabel>
                <CheckboxLabel name="heatingCoils" defaultChecked={vessel.heatingCoils}>Heating Coils Fitted</CheckboxLabel>
              </div>
              <SubgroupLabel>Tank coatings (m² or % coverage)</SubgroupLabel>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="STST Coating">
                  <input name="ststCoating" type="number" defaultValue={toNumberString(vessel.ststCoating)} className={inputCls} />
                </FormField>
                <FormField label="Epoxy Coating">
                  <input name="epoxyCoating" type="number" defaultValue={toNumberString(vessel.epoxyCoating)} className={inputCls} />
                </FormField>
                <FormField label="Zinc Coating">
                  <input name="zincCoating" type="number" defaultValue={toNumberString(vessel.zincCoating)} className={inputCls} />
                </FormField>
                <FormField label="Marineline Coating">
                  <input name="marinelineCoating" type="number" defaultValue={toNumberString(vessel.marinelineCoating)} className={inputCls} />
                </FormField>
                <FormField label="Interline Coating">
                  <input name="interlineCoating" type="number" defaultValue={toNumberString(vessel.interlineCoating)} className={inputCls} />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 12. Bow Equipment ────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Bow Equipment</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="# Bow Chain Stoppers">
                  <input name="numBowChainStoppers" type="number" defaultValue={toNumberString(vessel.numBowChainStoppers)} className={inputCls} />
                </FormField>
                <FormField label="# Bow Thrusters">
                  <input name="numBowThrusters" type="number" defaultValue={toNumberString(vessel.numBowThrusters)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Bow Chain Stopper Details">
                  <input name="bowChainStopperDetails" type="text" defaultValue={vessel.bowChainStopperDetails ?? ""} className={inputCls} />
                </FormField>
              </div>
              <CheckboxLabel name="bowChainStoppersFitted" defaultChecked={vessel.bowChainStoppersFitted}>
                Bow Chain Stoppers Fitted
              </CheckboxLabel>
            </div>
          </Card>

          {/* ── 13. Main Engine ──────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Main Engine</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6 md:grid-cols-4">
              <FormField label="Manufacturer" error={fieldErrors.engineManufacturer?.[0]}>
                <input name="engineManufacturer" type="text" defaultValue={vessel.engineManufacturer ?? ""} className={inputCls} />
              </FormField>
              <FormField label="Power (kW)" error={fieldErrors.enginePowerKw?.[0]}>
                <input name="enginePowerKw" type="number" defaultValue={toNumberString(vessel.enginePowerKw)} className={inputCls} />
              </FormField>
              <FormField label="RPM" error={fieldErrors.engineRpm?.[0]}>
                <input name="engineRpm" type="number" defaultValue={toNumberString(vessel.engineRpm)} className={inputCls} />
              </FormField>
              <FormField label="Mewis Duct" error={fieldErrors.mewisDuct?.[0]}>
                <input name="mewisDuct" type="text" defaultValue={vessel.mewisDuct ?? ""} className={inputCls} />
              </FormField>
            </div>
          </Card>

          {/* ── 14. Gas Carrier ──────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>
                Gas Carrier{" "}
                <span className="font-medium text-muted-foreground text-[12px]">(LPG / LNG)</span>
              </SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Gas Containment Type">
                  <input name="gasContainmentType" type="text" defaultValue={vessel.gasContainmentType ?? ""} className={inputCls} />
                </FormField>
                <FormField label="Min Temperature (°C)">
                  <input name="minTemperatureC" type="number" step="0.1" defaultValue={toNumberString(vessel.minTemperatureC)} className={inputCls} />
                </FormField>
                <FormField label="Max Pressure (bar)">
                  <input name="maxPressureBar" type="number" step="0.01" defaultValue={toNumberString(vessel.maxPressureBar)} className={inputCls} />
                </FormField>
              </div>
              <SubgroupLabel>Cargoes carried</SubgroupLabel>
              <div className={checkboxRowCls}>
                <CheckboxLabel name="carriesAmmonia" defaultChecked={vessel.carriesAmmonia}>Ammonia</CheckboxLabel>
                <CheckboxLabel name="carriesVcm" defaultChecked={vessel.carriesVcm}>VCM</CheckboxLabel>
                <CheckboxLabel name="carriesEthylene" defaultChecked={vessel.carriesEthylene}>Ethylene</CheckboxLabel>
              </div>
            </div>
          </Card>

          {/* ── 15. Environmental & Compliance ───────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Environmental &amp; Compliance</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="GHG Rating">
                  <select name="ghgRating" defaultValue={vessel.ghgRating ?? ""} className={inputCls}>
                    <option value="">— Select —</option>
                    {["A", "B", "C", "D", "E"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Scrubbers Installed">
                  <input name="scrubbersInstalledDate" type="date" defaultValue={toDateString(vessel.scrubbersInstalledDate)} className={inputCls} />
                </FormField>
              </div>
              <div className={checkboxRowCls}>
                <CheckboxLabel name="ballastWaterTreatmentSystem" defaultChecked={vessel.ballastWaterTreatmentSystem}>BWTS</CheckboxLabel>
                <CheckboxLabel name="neoPanamaLocks" defaultChecked={vessel.neoPanamaLocks}>Neo-Panama Locks</CheckboxLabel>
                <CheckboxLabel name="sternLine" defaultChecked={vessel.sternLine}>Stern Line</CheckboxLabel>
              </div>
            </div>
          </Card>

          {/* ── 16. Operators & Owners ───────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Operators &amp; Owners</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6 md:grid-cols-4">
              <FormField label="Commercial Operator">
                <input name="commercialOperator" type="text" defaultValue={vessel.commercialOperator ?? ""} className={inputCls} />
              </FormField>
              <FormField label="Beneficial Owner">
                <input name="beneficialOwner" type="text" defaultValue={vessel.beneficialOwner ?? ""} className={inputCls} />
              </FormField>
            </div>
          </Card>

          {/* ── 17. Sanctions History ────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Sanctions History</SectionTitle>
            </CardHeader>
            <div className="px-6 py-6">
              {/* `SanctionsListInput` posts a JSON-encoded hidden input
                  named "sanctions"; editVesselAction parses it and the
                  service does a hard-replace of the vessel's sanction
                  rows so removing a row here actually deletes it. */}
              <SanctionsListInput initialEntries={initialSanctions} />
            </div>
          </Card>

          {/* ── 18. Fleet & Commercial (internal) ────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>
                Fleet &amp; Commercial{" "}
                <span className="font-medium text-muted-foreground text-[12px]">(internal)</span>
              </SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Assign to Fleet" hint="Use 'Move to Fleet' on the vessel row to switch fleets.">
                  <select
                    value={fleetId}
                    onChange={(e) => setFleetId(e.target.value)}
                    disabled
                    className={cn(inputCls, "bg-muted/40 text-muted-foreground")}
                  >
                    <option value="">— None / Unassigned —</option>
                    {fleets.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Employment Status" error={fieldErrors.employmentStatus?.[0]}>
                  <select name="employmentStatus" defaultValue={vessel.employmentStatus} className={inputCls}>
                    {EMPLOYMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Acquisition Cost (USD)" error={fieldErrors.acquisitionCost?.[0]}>
                  <input name="acquisitionCost" type="number" defaultValue={toNumberString(vessel.acquisitionCost)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Acquisition Date" error={fieldErrors.acquisitionDate?.[0]}>
                  <input name="acquisitionDate" type="date" defaultValue={toDateString(vessel.acquisitionDate)} className={inputCls} />
                </FormField>
                <FormField
                  label="Current FMV (USD)"
                  hint="Leave blank to request automatic valuation"
                  error={fieldErrors.currentFmv?.[0]}
                >
                  <input name="currentFmv" type="number" defaultValue={toNumberString(vessel.currentFmv)} className={inputCls} />
                </FormField>
                <FormField label="Outstanding Loan (USD)" error={fieldErrors.outstandingLoan?.[0]}>
                  <input name="outstandingLoan" type="number" defaultValue={toNumberString(vessel.outstandingLoan)} className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Currency">
                  <select name="currency" defaultValue={vessel.currency} className={inputCls}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Lifecycle Status" error={fieldErrors.lifecycleStatus?.[0]}>
                  <select name="lifecycleStatus" defaultValue={vessel.lifecycleStatus} className={inputCls}>
                    {LIFECYCLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              {/* On-Sale flag + Listed-at Date. The "ON SALE" tag rendered
                  on the fleet's vessel table + the vessel detail page
                  reads `isOnSale`; `onSaleAt` is the date the listing
                  was published. */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="On Sale?">
                  <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-[13px]">
                    <input
                      type="checkbox"
                      name="isOnSale"
                      defaultChecked={vessel.isOnSale}
                      className="size-3.5 accent-primary"
                    />
                    Mark as on sale
                  </label>
                </FormField>
                <FormField label="Listed-at Date" error={fieldErrors.onSaleAt?.[0]}>
                  <input
                    name="onSaleAt"
                    type="date"
                    defaultValue={toDateString(vessel.onSaleAt)}
                    className={inputCls}
                  />
                </FormField>
              </div>
            </div>
          </Card>

          {/* ── 19. Notes ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Notes</SectionTitle>
            </CardHeader>
            <div className="p-6">
              <textarea
                name="notes"
                rows={3}
                defaultValue={vessel.notes ?? ""}
                placeholder="Additional notes, trading history, ownership context…"
                className={textareaCls}
                aria-label="Notes"
              />
              {fieldErrors.notes?.[0] ? (
                <p role="alert" className="mt-1 text-[12px] font-medium text-signal-magenta">
                  {fieldErrors.notes[0]}
                </p>
              ) : null}
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2 pb-6">
            <Button type="submit" disabled={isPending}>
              <Check className="size-3.5" />
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/vessels/${encodeURIComponent(vessel.id)}`}>Cancel</Link>
            </Button>
          </div>
        </div>

        {/* ── RIGHT RAIL: Live Vessel Preview ────────────────────────── */}
        <aside className="sticky top-4 self-start">
          <VesselPreview
            name={name}
            imo={vessel.imo}
            yearBuilt={yearBuilt}
            dwt={dwt}
            flagName={countries.find((c) => c.id === flagCountryId)?.name ?? null}
            fleetName={fleets.find((f) => f.id === fleetId)?.name ?? null}
            typeCode={submittedTypeCode}
          />
        </aside>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Live Vessel Preview (right rail) — mirrors the create form's preview
 * so the visual feedback stays consistent.
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
      <div className="text-[13px] font-extrabold leading-tight text-foreground">
        {name || "Untitled vessel"}
      </div>
      <div className="text-[11px] text-muted-foreground">
        IMO {imo || "—"} · Year {yearBuilt || "—"}
      </div>
      <PreviewRow k="DWT" v={dwtNum != null ? `${dwtNum.toLocaleString()} t` : "—"} />
      <PreviewRow k="Flag" v={flagName ?? "—"} />
      <PreviewRow k="Fleet" v={fleetName ?? "Unassigned"} />
      <PreviewRow k="Status" v="—" />
      <div className="mt-1 flex items-center gap-1.5 rounded border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-semibold text-primary">
        <Info className="size-3" />
        Editing — save to apply changes
      </div>
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
 * Reused shells
 * -------------------------------------------------------------------------- */

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";

const textareaCls =
  "w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring";

const checkboxRowCls = "flex flex-wrap gap-x-6 gap-y-2";

function SubgroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
      {children}
    </div>
  );
}

function CheckboxLabel({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value?: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px]">
      <input
        type="checkbox"
        name={name}
        {...(value != null ? { value } : {})}
        defaultChecked={defaultChecked}
        className="size-3.5 accent-primary"
      />
      {children}
    </label>
  );
}

function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        {label}
        {required ? <span className="ml-0.5 text-signal-magenta">*</span> : null}
      </span>
      {children}
      {error ? (
        <p role="alert" className="text-[12px] font-medium text-signal-magenta">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[14px] font-bold leading-snug">{children}</div>;
}
