"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Info, Search } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Constants — mirrored from html/add-vessel.html
 * -------------------------------------------------------------------------- */

type VesselTypeKey =
  | ""
  | "bulk"
  | "tanker"
  | "gas"
  | "container"
  | "offshore"
  | "general"
  | "roro";

const VESSEL_TYPES: Array<{ value: VesselTypeKey; label: string }> = [
  { value: "",          label: "— Select —" },
  { value: "bulk",      label: "Bulk Carrier" },
  { value: "tanker",    label: "Tanker" },
  { value: "gas",       label: "Gas Carrier" },
  { value: "container", label: "Container" },
  { value: "offshore",  label: "Offshore" },
  { value: "general",   label: "General Cargo" },
  { value: "roro",      label: "RoRo" },
];

const SUBTYPES: Record<Exclude<VesselTypeKey, "">, string[]> = {
  bulk:      ["Handysize", "Handymax", "Supramax", "Ultramax", "Panamax", "Kamsarmax", "Post-Panamax", "Capesize", "VLOC"],
  tanker:    ["MR Tanker", "LR1", "LR2", "Aframax", "Suezmax", "VLCC", "ULCC"],
  gas:       ["MGC", "LGC", "VLGC", "LNG Conventional", "LNG FSRU"],
  container: ["Feeder", "Sub-Panamax", "Panamax", "Post-Panamax", "ULCV"],
  offshore:  ["AHTS", "PSV", "Drillship", "Jack-up", "Semi-sub", "FPSO"],
  general:   ["MPP", "Heavy Lift", "Reefer"],
  roro:      ["PCTC", "Pure Car Carrier", "ConRo"],
};

const TYPE_LABELS: Record<Exclude<VesselTypeKey, "">, { label: string; tone: string }> = {
  bulk:      { label: "BULK",   tone: "bg-[#fef3c7] text-[#92400e]" },
  tanker:    { label: "TANKER", tone: "bg-[#dbeafe] text-[#1e40af]" },
  gas:       { label: "GAS",    tone: "bg-[#fce7f3] text-[#9d174d]" },
  container: { label: "CNTR",   tone: "bg-[#cffafe] text-[#155e75]" },
  offshore:  { label: "OFFSH",  tone: "bg-muted text-muted-foreground" },
  general:   { label: "CARGO",  tone: "bg-muted text-muted-foreground" },
  roro:      { label: "RORO",   tone: "bg-muted text-muted-foreground" },
};

const FLAG_STATES = [
  "Liberia", "Panama", "Marshall Islands", "Bahamas", "Malta",
  "Cyprus", "Greece", "Singapore", "Hong Kong", "Norway",
];

const CLASS_SOCIETIES = [
  "DNV", "Lloyd's Register", "Bureau Veritas", "ABS", "ClassNK", "RINA", "KR",
];

const FLEETS = [
  { value: "",      label: "— None / Unassigned —" },
  { value: "alpha", label: "Fleet Alpha" },
  { value: "beta",  label: "Fleet Beta" },
];

const EMPLOYMENT_STATUSES = [
  "Time Charter (TC)",
  "Spot Market",
  "Idle / Layup",
  "Dry Dock",
  "Under Repair",
];

/* --------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

export default function AddVesselPage() {
  // IMO quick lookup
  const [imoLookup, setImoLookup] = React.useState("");

  // Identification
  const [name, setName] = React.useState("");
  const [imo, setImo] = React.useState("");
  const [mmsi, setMmsi] = React.useState("");
  const [callSign, setCallSign] = React.useState("");
  const [flag, setFlag] = React.useState("");
  const [portOfRegistry, setPortOfRegistry] = React.useState("");

  // Specifications
  const [type, setType] = React.useState<VesselTypeKey>("");
  const [subtype, setSubtype] = React.useState("");
  const [yearBuilt, setYearBuilt] = React.useState("");
  const [dwt, setDwt] = React.useState("");
  const [grt, setGrt] = React.useState("");
  const [loa, setLoa] = React.useState("");
  const [beam, setBeam] = React.useState("");
  const [shipyard, setShipyard] = React.useState("");
  const [classSociety, setClassSociety] = React.useState("");
  const [nextSurvey, setNextSurvey] = React.useState("");

  // Commercial & Financial
  const [fleet, setFleet] = React.useState("");
  const [employment, setEmployment] = React.useState(EMPLOYMENT_STATUSES[0] ?? "");
  const [acquisitionCost, setAcquisitionCost] = React.useState("");
  const [acquisitionDate, setAcquisitionDate] = React.useState("");
  const [fmv, setFmv] = React.useState("");
  const [outstandingLoan, setOutstandingLoan] = React.useState("");

  // Notes
  const [notes, setNotes] = React.useState("");

  function lookupIMO() {
    const v = imoLookup.trim();
    if (!v) return;
    // Demo: pre-fill plausible mock data, mirrors prototype lookupIMO().
    setImo(v);
    setName("MV Ocean Discovery");
    setYearBuilt("2017");
    setDwt("82000");
    setFlag("Liberia");
    setType("bulk");
    setSubtype("");
  }

  // Reset subtype when the parent type changes (mirrors prototype updateSubtype()).
  React.useEffect(() => {
    setSubtype("");
  }, [type]);

  const subtypeOptions = type ? SUBTYPES[type] : [];

  const canSubmit =
    name.trim().length > 0 &&
    imo.trim().length >= 7 &&
    type !== "" &&
    dwt.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    alert(`Demo — would add "${name}" (IMO ${imo}) to the fleet.`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "FleetSpace", href: "/fleetspace" },
          { label: "Add Vessel" },
        ]}
        title="Add Vessel"
        subtitle="Register a new vessel to your portfolio by entering its details or looking up by IMO number"
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
            <Button type="submit" className="gap-2" disabled={!canSubmit}>
              <Check className="size-3.5" />
              Add to Fleet
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_280px]">
        {/* LEFT — Form */}
        <div className="flex flex-col gap-4">
          {/* IMO Quick Lookup */}
          <Card className="border-l-[3px] border-l-primary">
            <div className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex shrink-0 items-center gap-2">
                <Search className="size-[18px] text-primary" strokeWidth={2} />
                <div>
                  <div className="text-[12px] font-bold text-foreground">
                    Quick lookup by IMO
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Auto-fill vessel details from Signal Ocean database
                  </div>
                </div>
              </div>
              <div className="flex min-w-[240px] flex-1 gap-1.5">
                <input
                  value={imoLookup}
                  onChange={(e) => setImoLookup(e.target.value)}
                  type="text"
                  placeholder="Enter IMO number (e.g. 9623148)"
                  className={INPUT_CLASS}
                />
                <Button
                  type="button"
                  onClick={lookupIMO}
                  disabled={imoLookup.trim().length < 7}
                  className="h-9"
                >
                  Look up
                </Button>
              </div>
            </div>
          </Card>

          {/* Vessel Identification */}
          <Card>
            <CardHeader className="border-b">
              <h2 className="text-[14px] font-bold">Vessel Identification</h2>
            </CardHeader>
            <div className="space-y-3 p-4">
              <FormRow>
                <FormField className="flex-[2]" label="Vessel Name" required>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="e.g. MV Ocean Voyager"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="IMO Number" required hint="7-digit IMO identifier">
                  <input
                    value={imo}
                    onChange={(e) => setImo(e.target.value)}
                    type="text"
                    placeholder="9XXXXXXX"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="MMSI">
                  <input
                    value={mmsi}
                    onChange={(e) => setMmsi(e.target.value)}
                    type="text"
                    placeholder="9-digit MMSI"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Call Sign">
                  <input
                    value={callSign}
                    onChange={(e) => setCallSign(e.target.value)}
                    type="text"
                    placeholder="e.g. V7AB2"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="Flag State" required>
                  <select
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option value="">— Select —</option>
                    {FLAG_STATES.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Port of Registry">
                  <input
                    value={portOfRegistry}
                    onChange={(e) => setPortOfRegistry(e.target.value)}
                    type="text"
                    placeholder="e.g. Monrovia"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </FormRow>
            </div>
          </Card>

          {/* Vessel Specifications */}
          <Card>
            <CardHeader className="border-b">
              <h2 className="text-[14px] font-bold">Vessel Specifications</h2>
            </CardHeader>
            <div className="space-y-3 p-4">
              <FormRow>
                <FormField label="Vessel Type" required>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VesselTypeKey)}
                    className={INPUT_CLASS}
                  >
                    {VESSEL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Sub-type">
                  <select
                    value={subtype}
                    onChange={(e) => setSubtype(e.target.value)}
                    disabled={!type}
                    className={INPUT_CLASS}
                  >
                    <option value="">
                      {type ? "— Select —" : "— Select type first —"}
                    </option>
                    {subtypeOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Year Built" required>
                  <input
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    type="number"
                    placeholder="e.g. 2016"
                    min={1970}
                    max={2030}
                    className={INPUT_CLASS}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="DWT (tonnes)" required>
                  <input
                    value={dwt}
                    onChange={(e) => setDwt(e.target.value)}
                    type="number"
                    placeholder="e.g. 82000"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="GRT">
                  <input
                    value={grt}
                    onChange={(e) => setGrt(e.target.value)}
                    type="number"
                    placeholder="e.g. 44000"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="LOA (metres)">
                  <input
                    value={loa}
                    onChange={(e) => setLoa(e.target.value)}
                    type="number"
                    placeholder="e.g. 229"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="Beam (metres)">
                  <input
                    value={beam}
                    onChange={(e) => setBeam(e.target.value)}
                    type="number"
                    placeholder="e.g. 32.2"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Builder / Shipyard">
                  <input
                    value={shipyard}
                    onChange={(e) => setShipyard(e.target.value)}
                    type="text"
                    placeholder="e.g. Hyundai Heavy Industries"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="Classification Society">
                  <select
                    value={classSociety}
                    onChange={(e) => setClassSociety(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option value="">— Select —</option>
                    {CLASS_SOCIETIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Next Special Survey">
                  <input
                    value={nextSurvey}
                    onChange={(e) => setNextSurvey(e.target.value)}
                    type="month"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </FormRow>
            </div>
          </Card>

          {/* Commercial & Financial */}
          <Card>
            <CardHeader className="border-b">
              <h2 className="text-[14px] font-bold">Commercial &amp; Financial</h2>
            </CardHeader>
            <div className="space-y-3 p-4">
              <FormRow>
                <FormField label="Assign to Fleet">
                  <select
                    value={fleet}
                    onChange={(e) => setFleet(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    {FLEETS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Employment Status">
                  <select
                    value={employment}
                    onChange={(e) => setEmployment(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    {EMPLOYMENT_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Acquisition Cost (USD)">
                  <input
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    type="text"
                    placeholder="e.g. 28,500,000"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Acquisition Date">
                  <input
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    type="date"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField
                  label="Current FMV (USD)"
                  hint="Leave blank to request automatic valuation"
                >
                  <input
                    value={fmv}
                    onChange={(e) => setFmv(e.target.value)}
                    type="text"
                    placeholder="e.g. 28,500,000"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="Outstanding Loan (USD)">
                  <input
                    value={outstandingLoan}
                    onChange={(e) => setOutstandingLoan(e.target.value)}
                    type="text"
                    placeholder="e.g. 18,000,000"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </FormRow>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="border-b">
              <h2 className="text-[14px] font-bold">Notes</h2>
            </CardHeader>
            <div className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes, trading history, ownership context…"
                className="min-h-[80px] w-full resize-y rounded-sm border border-input bg-background p-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2 pb-6">
            <Button type="submit" className="gap-2" disabled={!canSubmit}>
              <Check className="size-3.5" />
              Add to Fleet
            </Button>
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
          </div>
        </div>

        {/* RIGHT — Vessel Preview */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-md border bg-card p-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
              Vessel Preview
            </div>

            <div className="mb-2">
              {type ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-[0.4px]",
                    TYPE_LABELS[type].tone,
                  )}
                >
                  {TYPE_LABELS[type].label}
                </span>
              ) : (
                <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold tracking-[0.4px] text-muted-foreground">
                  TYPE
                </span>
              )}
            </div>

            <div className="mb-[3px] text-[14px] font-extrabold text-foreground">
              {name.trim() || "Vessel Name"}
            </div>
            <div className="mb-3 text-[11px] text-[#788187]">
              IMO {imo.trim() || "—"} · Year {yearBuilt || "—"}
            </div>

            <PreviewRow label="DWT" value={dwt ? `${Number(dwt).toLocaleString()} t` : "—"} />
            <PreviewRow label="Flag" value={flag || "—"} />
            <PreviewRow
              label="Fleet"
              value={
                FLEETS.find((f) => f.value === fleet && f.value !== "")?.label ??
                "Unassigned"
              }
            />
            <PreviewRow label="Status" value={employment || "—"} />

            {/* Info banner — the prototype's "Enter name, IMO, type, and DWT to continue" */}
            <div className="mt-4 flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/[0.06] px-3 py-2 text-[11px] font-semibold text-primary">
              <Info className="size-3 shrink-0" strokeWidth={2} />
              Enter name, IMO, type, and DWT to continue
            </div>

            {/* "After adding you can:" list */}
            <div className="mt-4 border-t pt-4">
              <div className="mb-2 text-[11px] text-muted-foreground">
                After adding you can:
              </div>
              <div className="flex flex-col gap-1.5 text-[11px] text-[#788187]">
                {[
                  "Request a valuation",
                  "Run cashflow scenarios",
                  "Add to a project",
                  "Track AIS position",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <Check className="size-[11px] shrink-0 text-signal-green" strokeWidth={2.5} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

/* --------------------------------------------------------------------------
 * Form helpers
 * -------------------------------------------------------------------------- */

const INPUT_CLASS =
  "h-9 w-full rounded-sm border border-input bg-background px-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted/40 disabled:text-muted-foreground";

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

function FormField({
  label,
  required = false,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-w-[160px] flex-1 flex-col gap-1", className)}>
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        {label}
        {required ? (
          <span className="ml-1 text-signal-magenta">*</span>
        ) : null}
      </span>
      {children}
      {hint ? (
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 text-[11px] last:border-b-0">
      <span className="text-[#788187]">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
