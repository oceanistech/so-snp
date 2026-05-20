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

const EMPLOYMENT_OPTIONS = [
  { value: "CURRENT_EARNINGS", label: "Current Earnings" },
  { value: "HISTORIC_EARNINGS", label: "Historic Earnings" },
  { value: "FUTURE_EARNINGS", label: "Future Earnings" },
] as const;

// Lifecycle Status (ACTIVE / DRYDOCK / …) and Currency (USD / EUR / …) are
// no longer surfaced on /vessels/new — the form posts safe defaults via
// hidden inputs. The full select UIs live on the vessel detail edit page.

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
}: {
  referenceData: AddVesselReferenceData;
  fleets: FleetOption[];
}) {
  // `ports` / `engineModels` are intentionally not destructured — the
  // prototype's add-vessel form doesn't surface Port of Registry or the
  // Engine Model picker; both are editable from the vessel detail page.
  const { vesselTypes, countries, shipyards, classSocieties } = referenceData;

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
            <Button
              form="add-vessel-form"
              type="submit"
              name="lifecycleStatus"
              value="ACTIVE"
              disabled={isPending}
            >
              <Check className="size-3.5" />
              {isPending ? "Saving…" : "Add to Fleet"}
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

          {/* ── 1. Vessel Identification ──────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Vessel Identification</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              {/* Row 1: 3 fields (last column empty in 4-col grid) — matches prototype */}
              <div className="grid gap-4 md:grid-cols-4">
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
                <FormField label="IMO" required hint="7-digit IMO identifier" error={fieldErrors.imo?.[0]}>
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
                <FormField label="Call Sign" error={fieldErrors.callSign?.[0]}>
                  <input name="callSign" type="text" placeholder="e.g. V7AB2" className={inputCls} />
                </FormField>
              </div>
              {/* Row 2: 4 fields filling the 4-col grid — matches prototype */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Flag" required error={fieldErrors.flagCountryId?.[0]}>
                  <select
                    name="flagCountryId"
                    value={flagCountryId}
                    onChange={(e) => setFlagCountryId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— Select —</option>
                    {countries.filter((c) => c.isFlagState).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Flag Code" error={fieldErrors.flagCode?.[0]}>
                  <input name="flagCode" type="text" maxLength={3} placeholder="e.g. LBR" className={inputCls} />
                </FormField>
                <FormField label="Classification Register" error={fieldErrors.classSocietyId?.[0]}>
                  <select name="classSocietyId" className={inputCls} defaultValue="">
                    <option value="">— Select —</option>
                    {classSocieties.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Class Renewal Date" error={fieldErrors.classRenewalDate?.[0]}>
                  <input name="classRenewalDate" type="date" className={inputCls} />
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
                  <input name="builtForTrade" type="text" placeholder="e.g. Crude" className={inputCls} />
                </FormField>
                <FormField label="Current Trade" error={fieldErrors.currentTrade?.[0]}>
                  <input name="currentTrade" type="text" placeholder="e.g. Dirty" className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Design Model" error={fieldErrors.designModel?.[0]}>
                  <input name="designModel" type="text" placeholder="e.g. HHI Aframax" className={inputCls} />
                </FormField>
                <FormField label="Ice Class" error={fieldErrors.iceClass?.[0]}>
                  <input name="iceClass" type="text" placeholder="e.g. 1A" className={inputCls} />
                </FormField>
                <FormField label="Propulsion Type" error={fieldErrors.propulsionType?.[0]}>
                  <input name="propulsionType" type="text" placeholder="e.g. Diesel" className={inputCls} />
                </FormField>
              </div>
              <CheckboxLabel name="cleanDirtyWilling">Clean / Dirty Willing</CheckboxLabel>
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
                    placeholder="e.g. 2016"
                    className={inputCls}
                    aria-invalid={!!fieldErrors.yearBuilt}
                  />
                </FormField>
                <FormField label="Built Country" error={fieldErrors.builtCountry?.[0]}>
                  <input name="builtCountry" type="text" placeholder="e.g. South Korea" className={inputCls} />
                </FormField>
                <FormField label="Shipyard" error={fieldErrors.shipyardId?.[0]}>
                  <select name="shipyardId" className={inputCls} defaultValue="">
                    <option value="">— Select —</option>
                    {shipyards.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}{s.city ? ` (${s.city})` : ""}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Yard Number" error={fieldErrors.yardNumber?.[0]}>
                  <input name="yardNumber" type="text" placeholder="e.g. S488" className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Delivery Date" error={fieldErrors.deliveryDate?.[0]}>
                  <input name="deliveryDate" type="date" className={inputCls} />
                </FormField>
                <FormField label="Scrapped Date" error={fieldErrors.scrappedDate?.[0]}>
                  <input name="scrappedDate" type="date" className={inputCls} />
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
                  <select name="orderBook.status" defaultValue="" className={inputCls}>
                    <option value="">— Select —</option>
                    <option value="ON_ORDER">On Order</option>
                    <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    <option value="LAUNCHED">Launched</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </FormField>
                <FormField label="Order Date">
                  <input name="orderBook.orderDate" type="date" className={inputCls} />
                </FormField>
                <FormField label="Construction Start">
                  <input name="orderBook.constructionStartDate" type="date" className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Launch Date">
                  <input name="orderBook.launchDate" type="date" className={inputCls} />
                </FormField>
                <FormField label="Scheduled Delivery">
                  <input name="orderBook.scheduledDeliveryDate" type="date" className={inputCls} />
                </FormField>
                <FormField label="Cancelled Date">
                  <input name="orderBook.cancelledDate" type="date" className={inputCls} />
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
              {/* Row 1: Deadweight, LOA, Breadth Extreme (int), Breadth
                  (decimal) — matches prototype's 4-field row. The schema
                  has a single `beamM`; "Breadth Extreme" is a display-only
                  rounded integer view (no `name`, not posted). */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Deadweight (t)" required error={fieldErrors.dwt?.[0]}>
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
                <FormField label="Length Overall (m)" error={fieldErrors.loaM?.[0]}>
                  <input name="loaM" type="number" step="0.01" placeholder="e.g. 229" className={inputCls} />
                </FormField>
                <FormField label="Breadth Extreme (m)">
                  <input type="number" placeholder="e.g. 32" className={inputCls} />
                </FormField>
                <FormField label="Breadth (decimal)" error={fieldErrors.beamM?.[0]}>
                  <input name="beamM" type="number" step="0.01" placeholder="e.g. 32.20" className={inputCls} />
                </FormField>
              </div>
              {/* Row 2: Moulded Depth, Draught, Air Draught — matches prototype */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Moulded Depth (m)" error={fieldErrors.mouldedDepthM?.[0]}>
                  <input name="mouldedDepthM" type="number" step="0.01" placeholder="e.g. 20.1" className={inputCls} />
                </FormField>
                <FormField label="Draught (m)" error={fieldErrors.draftM?.[0]}>
                  <input name="draftM" type="number" step="0.01" placeholder="e.g. 14.5" className={inputCls} />
                </FormField>
                <FormField label="Air Draught (m)" error={fieldErrors.airDraughtM?.[0]}>
                  <input name="airDraughtM" type="number" step="0.01" placeholder="e.g. 48" className={inputCls} />
                </FormField>
              </div>
              {/* Row 3: Lightship, Summer TPC — matches prototype */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Lightship (t)" error={fieldErrors.lightshipT?.[0]}>
                  <input name="lightshipT" type="number" placeholder="e.g. 14500" className={inputCls} />
                </FormField>
                <FormField label="Summer TPC" error={fieldErrors.summerTpc?.[0]}>
                  <input name="summerTpc" type="number" step="0.01" placeholder="e.g. 89.3" className={inputCls} />
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
              {/* Row 1: 3 fields in 4-col grid (matches prototype) */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Gross Rated (GRT)" error={fieldErrors.grt?.[0]}>
                  <input name="grt" type="number" placeholder="e.g. 44000" className={inputCls} />
                </FormField>
                <FormField label="Reduced Gross" error={fieldErrors.reducedGrt?.[0]}>
                  <input name="reducedGrt" type="number" placeholder="e.g. 35000" className={inputCls} />
                </FormField>
                <FormField label="Net Rated (NRT)" error={fieldErrors.nrt?.[0]}>
                  <input name="nrt" type="number" placeholder="e.g. 27000" className={inputCls} />
                </FormField>
              </div>
              {/* Row 2: 2 fields in 4-col grid */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Panama Canal Net" error={fieldErrors.panamaCanalNrt?.[0]}>
                  <input name="panamaCanalNrt" type="number" placeholder="e.g. 36000" className={inputCls} />
                </FormField>
                <FormField label="Suez Canal Net" error={fieldErrors.suezCanalNrt?.[0]}>
                  <input name="suezCanalNrt" type="number" placeholder="e.g. 40500" className={inputCls} />
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
              {/* Row 1: 3 bulk-cargo volume fields */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Cubic Size (m³)">
                  <input name="cubicSizeM3" type="number" placeholder="e.g. 95000" className={inputCls} />
                </FormField>
                <FormField label="Grain Capacity (m³)">
                  <input name="grainCapacityM3" type="number" placeholder="e.g. 93000" className={inputCls} />
                </FormField>
                <FormField label="Bale Capacity (m³)">
                  <input name="baleCapacityM3" type="number" placeholder="e.g. 90000" className={inputCls} />
                </FormField>
              </div>
              {/* Row 2: 4 container TEU fields */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="TEU">
                  <input name="teu" type="number" placeholder="e.g. 8500" className={inputCls} />
                </FormField>
                <FormField label="TEU @ 14t">
                  <input name="teuAt14t" type="number" placeholder="e.g. 6200" className={inputCls} />
                </FormField>
                <FormField label="Deck TEU">
                  <input name="deckTeu" type="number" placeholder="e.g. 4500" className={inputCls} />
                </FormField>
                <FormField label="Under Deck TEU">
                  <input name="underDeckTeu" type="number" placeholder="e.g. 4000" className={inputCls} />
                </FormField>
              </div>
              {/* Row 3: Reefers alone (matches prototype) */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Reefers">
                  <input name="reefers" type="number" placeholder="e.g. 800" className={inputCls} />
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
                  <input name="numHolds" type="number" placeholder="e.g. 7" className={inputCls} />
                </FormField>
                <FormField label="# Hatches">
                  <input name="numHatches" type="number" placeholder="e.g. 7" className={inputCls} />
                </FormField>
                <FormField label="# Cranes">
                  <input name="numCranes" type="number" placeholder="e.g. 4" className={inputCls} />
                </FormField>
                <FormField label="# Grabs">
                  <input name="numGrabs" type="number" placeholder="e.g. 4" className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Cranes Max Outreach (m)">
                  <input name="cranesMaxOutreachM" type="number" step="0.1" placeholder="e.g. 22" className={inputCls} />
                </FormField>
                <FormField label="Cranes Max Lifting (t)">
                  <input name="cranesMaxLiftingT" type="number" placeholder="e.g. 35" className={inputCls} />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Hold Details" className="md:col-span-2">
                  <textarea name="holdDetails" rows={2} className={textareaCls} placeholder="Hold dimensions, capacities…" />
                </FormField>
                <FormField label="Hatch Details" className="md:col-span-2">
                  <textarea name="hatchDetails" rows={2} className={textareaCls} placeholder="Hatch dimensions…" />
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Crane Details" className="md:col-span-2">
                  <textarea name="craneDetails" rows={2} className={textareaCls} placeholder="Crane specifications…" />
                </FormField>
                <FormField label="Grab Details" className="md:col-span-2">
                  <textarea name="grabDetails" rows={2} className={textareaCls} placeholder="Grab specifications…" />
                </FormField>
              </div>
              <SubgroupLabel>Equipment fitted</SubgroupLabel>
              {/* Left-aligned, wrap left-to-right. gap-y-6 = 24px vertical,
                  gap-x-2 = 8px horizontal between boxes. */}
              <div className={checkboxRowCls}>
                <CheckboxLabel name="isGeared">Geared</CheckboxLabel>
                <CheckboxLabel name="grabsFitted">Grabs Fitted</CheckboxLabel>
                <CheckboxLabel name="boxShapedHolds">Box-Shaped Holds</CheckboxLabel>
                <CheckboxLabel name="openHatch">Open Hatch</CheckboxLabel>
                <CheckboxLabel name="australianHoldLadder">Australian Hold Ladder</CheckboxLabel>
                <CheckboxLabel name="logFitted">Log Fitted</CheckboxLabel>
                <CheckboxLabel name="a60Bulkhead">A60 Bulkhead</CheckboxLabel>
                <CheckboxLabel name="co2Fitted">CO₂ Fitted</CheckboxLabel>
              </div>
            </div>
          </Card>

          {/* ── 9. Parallel Body Length ──────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Parallel Body Length</SectionTitle>
            </CardHeader>
            {/* 3 fields in a 4-col grid — each takes ¼ of the row, last
                column empty (matches prototype's `.form-row` 4-col grid). */}
            <div className="grid gap-4 p-6 md:grid-cols-4">
              <FormField label="Laden (m)">
                <input name="parallelBodyLadenM" type="number" step="0.01" placeholder="e.g. 95" className={inputCls} />
              </FormField>
              <FormField label="Ballast (m)">
                <input name="parallelBodyBallastM" type="number" step="0.01" placeholder="e.g. 85" className={inputCls} />
              </FormField>
              <FormField label="Empty (m)">
                <input name="parallelBodyEmptyM" type="number" step="0.01" placeholder="e.g. 75" className={inputCls} />
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
              {/* Labels match the prototype exactly: "Bow → Centre Manifold",
                  "Waterline → Manifold", "Deck → Centre Manifold",
                  "Rail → Centre Manifold". */}
              <FormField label="Bow → Centre Manifold (m)">
                <input name="bowToCentreManifoldM" type="number" step="0.01" placeholder="e.g. 130" className={inputCls} />
              </FormField>
              <FormField label="Waterline → Manifold (m)">
                <input name="waterlineToManifoldM" type="number" step="0.01" placeholder="e.g. 18" className={inputCls} />
              </FormField>
              <FormField label="Deck → Centre Manifold (m)">
                <input name="deckToCentreManifoldM" type="number" step="0.01" placeholder="e.g. 12" className={inputCls} />
              </FormField>
              <FormField label="Rail → Centre Manifold (m)">
                <input name="railToCentreManifoldM" type="number" step="0.01" placeholder="e.g. 2.5" className={inputCls} />
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
              {/* Left-aligned, wraps left-to-right. IMO Type 1/2/3 are
                  checkboxes per the prototype; they all post to the same
                  `imoType` field — first checked value wins on save. */}
              <div className={checkboxRowCls}>
                <CheckboxLabel name="imoType" value="1">IMO Type 1</CheckboxLabel>
                <CheckboxLabel name="imoType" value="2">IMO Type 2</CheckboxLabel>
                <CheckboxLabel name="imoType" value="3">IMO Type 3</CheckboxLabel>
                <CheckboxLabel name="inertGasSystem">Inert Gas System (IGS)</CheckboxLabel>
                <CheckboxLabel name="crudeOilWashing">Crude Oil Washing (COW)</CheckboxLabel>
                <CheckboxLabel name="heatingCoils">Heating Coils Fitted</CheckboxLabel>
              </div>
              <SubgroupLabel>Tank coatings (m² or % coverage)</SubgroupLabel>
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="STST">
                  <input name="ststCoating" type="number" placeholder="0" className={inputCls} />
                </FormField>
                <FormField label="Epoxy">
                  <input name="epoxyCoating" type="number" placeholder="0" className={inputCls} />
                </FormField>
                <FormField label="Zinc">
                  <input name="zincCoating" type="number" placeholder="0" className={inputCls} />
                </FormField>
                <FormField label="Marineline">
                  <input name="marinelineCoating" type="number" placeholder="0" className={inputCls} />
                </FormField>
                <FormField label="Interline">
                  <input name="interlineCoating" type="number" placeholder="0" className={inputCls} />
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
              {/* Row 1: 2 count fields (matches prototype) */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="# Bow Chain Stoppers">
                  <input name="numBowChainStoppers" type="number" placeholder="e.g. 2" className={inputCls} />
                </FormField>
                <FormField label="# Bow Thrusters">
                  <input name="numBowThrusters" type="number" placeholder="e.g. 1" className={inputCls} />
                </FormField>
              </div>
              {/* Row 2: details on its own row */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="Bow Chain Stopper Details">
                  <input name="bowChainStopperDetails" type="text" placeholder="e.g. 2 × Smit brackets, 200t SWL" className={inputCls} />
                </FormField>
              </div>
              <CheckboxLabel name="bowChainStoppersFitted">Bow Chain Stoppers Fitted</CheckboxLabel>
            </div>
          </Card>

          {/* ── 13. Main Engine ──────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Main Engine</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6 md:grid-cols-4">
              <FormField label="Manufacturer" error={fieldErrors.engineManufacturer?.[0]}>
                <input name="engineManufacturer" type="text" placeholder="e.g. MAN B&W" className={inputCls} />
              </FormField>
              <FormField label="Power (kW)" error={fieldErrors.enginePowerKw?.[0]}>
                <input name="enginePowerKw" type="number" placeholder="e.g. 18000" className={inputCls} />
              </FormField>
              <FormField label="RPM" error={fieldErrors.engineRpm?.[0]}>
                <input name="engineRpm" type="number" placeholder="e.g. 91" className={inputCls} />
              </FormField>
              <FormField label="Mewis Duct" error={fieldErrors.mewisDuct?.[0]}>
                <input name="mewisDuct" type="text" placeholder="e.g. Fitted / Retrofit" className={inputCls} />
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
                  <input name="gasContainmentType" type="text" placeholder="e.g. Type C, Membrane" className={inputCls} />
                </FormField>
                <FormField label="Min Temperature (°C)">
                  <input name="minTemperatureC" type="number" step="0.1" placeholder="e.g. -163" className={inputCls} />
                </FormField>
                <FormField label="Max Pressure (bar)">
                  <input name="maxPressureBar" type="number" step="0.01" placeholder="e.g. 18" className={inputCls} />
                </FormField>
              </div>
              <SubgroupLabel>Cargoes carried</SubgroupLabel>
              <div className={checkboxRowCls}>
                <CheckboxLabel name="carriesAmmonia">Ammonia</CheckboxLabel>
                <CheckboxLabel name="carriesVcm">VCM</CheckboxLabel>
                <CheckboxLabel name="carriesEthylene">Ethylene</CheckboxLabel>
              </div>
            </div>
          </Card>

          {/* ── 15. Environmental & Compliance ───────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Environmental &amp; Compliance</SectionTitle>
            </CardHeader>
            <div className="grid gap-4 p-6">
              {/* Row: 2 fields in 4-col grid — matches prototype. Next Special
                  Survey lives on the vessel detail edit page. */}
              <div className="grid gap-4 md:grid-cols-4">
                <FormField label="GHG Rating">
                  <select name="ghgRating" defaultValue="" className={inputCls}>
                    <option value="">— Select —</option>
                    {["A", "B", "C", "D", "E"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Scrubbers Installed">
                  <input name="scrubbersInstalledDate" type="date" className={inputCls} />
                </FormField>
              </div>
              <div className={checkboxRowCls}>
                <CheckboxLabel name="ballastWaterTreatmentSystem">BWTS</CheckboxLabel>
                <CheckboxLabel name="neoPanamaLocks">Neo-Panama Locks</CheckboxLabel>
                <CheckboxLabel name="sternLine">Stern Line</CheckboxLabel>
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
                <input name="commercialOperator" type="text" placeholder="e.g. Star Bulk Carriers" className={inputCls} />
              </FormField>
              <FormField label="Beneficial Owner">
                <input name="beneficialOwner" type="text" placeholder="e.g. Cardiff Marine" className={inputCls} />
              </FormField>
            </div>
          </Card>

          {/* ── 17. Sanctions History ────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Sanctions History</SectionTitle>
            </CardHeader>
            <div className="p-6">
              <div className="rounded-md border border-dashed bg-muted/30 p-3 text-[12px] text-muted-foreground">
                Sanctions entries (authority, program, dates, description) can
                be added from the vessel detail page after creation. Inline
                editing on this form ships in a follow-up step.
              </div>
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
              {/* Row 1: Assign to Fleet, Employment Status, Acquisition Cost
                  — matches prototype. Lifecycle Status / Currency / On-Sale
                  / Listed-at fields default safely and are editable from
                  the vessel detail page. */}
              <div className="grid gap-4 md:grid-cols-4">
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
                <FormField
                  label="Acquisition Cost (USD)"
                  error={fieldErrors.acquisitionCost?.[0]}
                >
                  <input
                    name="acquisitionCost"
                    type="number"
                    placeholder="e.g. 28500000"
                    className={inputCls}
                  />
                </FormField>
              </div>
              {/* Row 2: Acquisition Date, Current FMV, Outstanding Loan */}
              <div className="grid gap-4 md:grid-cols-4">
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
              </div>
              {/* Hidden Currency default — required by the schema, USD on
                  /vessels/new. The vessel detail page lets the user change it.
                  (Lifecycle is now decided by which submit button is pressed
                  at the bottom: "Add to Fleet" → ACTIVE; "Save as Draft" →
                  DRAFT.) */}
              <input type="hidden" name="currency" value="USD" />
            </div>
          </Card>

          {/* ── 19. Notes ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle>Notes</SectionTitle>
            </CardHeader>
            <div className="p-6">
              {/* Prototype: plain textarea, no label */}
              <textarea
                name="notes"
                rows={3}
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

          {/* Action buttons — primary saves as ACTIVE, "Save as Draft"
              saves as DRAFT. Each button carries its own `lifecycleStatus`
              via the button name/value pair, so whichever button the user
              clicks decides the lifecycle written to the row. */}
          <div className="flex gap-2 pb-6">
            <Button
              type="submit"
              name="lifecycleStatus"
              value="ACTIVE"
              disabled={isPending}
            >
              <Check className="size-3.5" />
              {isPending ? "Saving…" : "Add to Fleet"}
            </Button>
            <Button
              type="submit"
              name="lifecycleStatus"
              value="DRAFT"
              variant="secondary"
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save as Draft"}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
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
      {/* Vessel name — matches prototype's `.vessel-preview-name` →
          font-size: var(--text-base) = 13px, font-weight: 800.
          Typed names render in the primary accent so the saved value
          stands out; the empty-state "Untitled vessel" placeholder uses
          the same `text-foreground` color as the section group titles. */}
      <div
        className={cn(
          "text-[13px] font-extrabold leading-tight",
          name ? "text-primary" : "text-foreground",
        )}
      >
        {name || "Untitled vessel"}
      </div>
      <div className="text-[11px] text-muted-foreground">
        IMO {imo || "—"} · Year {yearBuilt || "—"}
      </div>
      <PreviewRow k="DWT" v={dwtNum != null ? `${dwtNum.toLocaleString()} t` : "—"} />
      <PreviewRow k="Flag" v={flagName ?? "—"} />
      <PreviewRow k="Fleet" v={fleetName ?? "Unassigned"} />
      <PreviewRow k="Status" v="—" />
      {ready ? (
        <div className="mt-1 flex items-center gap-1.5 rounded border border-signal-green/30 bg-signal-green/8 px-3 py-2 text-[11px] font-semibold text-signal-green">
          <Check className="size-3" />
          Ready to save
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-1.5 rounded border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-semibold text-primary">
          <Info className="size-3" />
          Enter name, IMO, type, and DWT to continue
        </div>
      )}

      {/* Prototype footer: "After adding you can:" checklist */}
      <div className="mt-2 border-t pt-3">
        <div className="mb-2 text-[11px] text-muted-foreground">
          After adding you can:
        </div>
        <ul className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Check className="size-3 text-signal-green" />
            Request a valuation
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="size-3 text-signal-green" />
            Run cashflow scenarios
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="size-3 text-signal-green" />
            Add to a project
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="size-3 text-signal-green" />
            Track AIS position
          </li>
        </ul>
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
 * Field shell + section title
 * -------------------------------------------------------------------------- */

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";

const textareaCls =
  "w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring";

/**
 * Checkbox group container: left-aligned, wraps left-to-right.
 * Horizontal gap is 24px (gap-x-6) between adjacent boxes on the same
 * line; vertical gap is 8px (gap-y-2) when the row wraps. Used by all
 * the boolean-row groupings (Equipment fitted, IMO classification,
 * Cargoes carried, Environmental compliance, …).
 */
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
  children,
}: {
  name: string;
  /** Optional explicit value posted when this box is checked. Lets several
   *  boxes share one `name` (e.g. IMO Type 1 / 2 / 3 all post to `imoType`). */
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px]">
      <input
        type="checkbox"
        name={name}
        {...(value != null ? { value } : {})}
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
  /** Extra Tailwind classes — most commonly `md:col-span-2` for fields
   *  that should span two columns of the section grid (textareas, etc.). */
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
  // Matches the prototype's `.card-title` → font-size: var(--text-md) = 14px.
  return <div className="text-[14px] font-bold leading-snug">{children}</div>;
}
