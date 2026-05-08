"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Info, Plus, Search } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock vessel pool — sourced from html/create-fleet.html.
 * -------------------------------------------------------------------------- */

type VesselOption = {
  imo: string;
  name: string;
  spec: string;
  type: VesselType;
};

const VESSELS: VesselOption[] = [
  { imo: "9623148", name: "MV Pacific Star",   spec: "Panamax Bulk · 2016",   type: "Bulk Carrier" },
  { imo: "9712305", name: "MT Helios Trader",  spec: "Suezmax Tanker · 2014", type: "Tanker" },
  { imo: "9462201", name: "MV Baltic Crown",   spec: "Supramax Bulk · 2010",  type: "Bulk Carrier" },
  { imo: "9885640", name: "MV Cape Fortuna",   spec: "Capesize Bulk · 2019",  type: "Bulk Carrier" },
  { imo: "9742158", name: "MT Nordic Eagle",   spec: "VLCC Tanker · 2008",    type: "Tanker" },
  { imo: "9744019", name: "MV Atlantic Star",  spec: "Handymax Bulk · 2018",  type: "Bulk Carrier" },
  { imo: "9810224", name: "MV Global Pioneer", spec: "Capesize Bulk · 2017",  type: "Bulk Carrier" },
  { imo: "9532148", name: "MT Aegean Spirit",  spec: "Aframax Tanker · 2012", type: "Tanker" },
  { imo: "9912055", name: "MV Nordic Crest",   spec: "Kamsarmax Bulk · 2022", type: "Bulk Carrier" },
  { imo: "9908712", name: "MT Eastern Sun",    spec: "MR Tanker · 2022",      type: "Tanker" },
  { imo: "9876110", name: "MV Blue Horizon",   spec: "Panamax Bulk · 2020",   type: "Bulk Carrier" },
  { imo: "9788423", name: "MV Silver Wave",    spec: "Handysize Bulk · 2018", type: "Bulk Carrier" },
];

const FLEET_COLORS = [
  { name: "Blue",   hex: "#248FF9" },
  { name: "Green",  hex: "#0FD29A" },
  { name: "Orange", hex: "#FF961F" },
  { name: "Purple", hex: "#B870FF" },
  { name: "Pink",   hex: "#EC298C" },
  { name: "Cyan",   hex: "#1FD6FF" },
  { name: "Yellow", hex: "#F2C602" },
  { name: "Red",    hex: "#E8503A" },
] as const;

type FleetColor = (typeof FLEET_COLORS)[number]["name"];

/* --------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

export default function CreateFleetPage() {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("Mixed");
  const [currency, setCurrency] = React.useState("USD");
  const [description, setDescription] = React.useState("");
  const [color, setColor] = React.useState<FleetColor>("Blue");
  const [vesselFilter, setVesselFilter] = React.useState("");
  const [selectedImos, setSelectedImos] = React.useState<Set<string>>(new Set());
  const [visibility, setVisibility] = React.useState("Private (only me)");
  const [tag, setTag] = React.useState("");

  const filteredVessels = React.useMemo(() => {
    const q = vesselFilter.trim().toLowerCase();
    if (!q) return VESSELS;
    return VESSELS.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.spec.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q),
    );
  }, [vesselFilter]);

  function toggleVessel(imo: string) {
    setSelectedImos((prev) => {
      const next = new Set(prev);
      if (next.has(imo)) next.delete(imo);
      else next.add(imo);
      return next;
    });
  }

  const colorHex =
    FLEET_COLORS.find((c) => c.name === color)?.hex ?? "#248FF9";
  const canSubmit = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    alert(
      `Demo submission — would create fleet "${name}" with ${selectedImos.size} vessels.`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "FleetSpace", href: "/fleetspace" },
          { label: "Create Fleet" },
        ]}
        title="Create New Fleet"
        subtitle="Set up a fleet group and assign vessels to start tracking portfolio performance"
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
            <Button type="submit" className="gap-2" disabled={!canSubmit}>
              <Check className="size-3.5" />
              Create Fleet
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_300px]">
        {/* LEFT — Form steps */}
        <div className="flex flex-col gap-4">
          {/* Step 1 — Fleet Details */}
          <Card>
            <CardHeader className="border-b">
              <h2 className="flex items-center gap-2 text-[14px] font-bold">
                <StepNumber>1</StepNumber>
                Fleet Details
              </h2>
            </CardHeader>

            <div className="space-y-3 p-4">
              <FormRow>
                <FormField className="flex-[2]" label="Fleet Name" required>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="e.g. Fleet Gamma, Asia-Pacific Fleet…"
                    className={INPUT_CLASS}
                  />
                </FormField>
                <FormField label="Fleet Type">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    {[
                      "Mixed",
                      "Bulk Carriers",
                      "Tankers",
                      "Gas Carriers",
                      "Containers",
                      "Offshore",
                    ].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Reporting Currency">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    {["USD", "EUR", "GBP"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
              </FormRow>

              <FormField label="Description / Purpose">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe this fleet's purpose, strategy, or scope (e.g. dry bulk vessels acquired post-2018 for long-term TC strategy)…"
                  className="min-h-[72px] w-full resize-y rounded-sm border border-input bg-background p-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </FormField>

              <FormField label="Fleet Color">
                <div className="flex flex-wrap items-center gap-2.5">
                  {FLEET_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      title={c.name}
                      aria-label={`Select ${c.name}`}
                      aria-pressed={color === c.name}
                      style={{ backgroundColor: c.hex }}
                      className={cn(
                        "size-8 rounded-full border-[3px] transition-transform hover:scale-110",
                        color === c.name
                          ? "border-foreground"
                          : "border-transparent",
                      )}
                    />
                  ))}
                </div>
              </FormField>
            </div>
          </Card>

          {/* Step 2 — Add Vessels */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
              <h2 className="flex items-center gap-2 text-[14px] font-bold">
                <StepNumber>2</StepNumber>
                Add Vessels
              </h2>
              <div className="flex items-center gap-2">
                {selectedImos.size > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-extrabold tabular-nums text-primary-foreground">
                    {selectedImos.size}
                  </span>
                ) : null}
                <Button asChild size="sm" variant="outline" className="gap-1.5">
                  <Link href="/fleetspace/add-vessel">
                    <Plus className="size-3" />
                    Add New Vessel
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <div className="space-y-3 p-4">
              <p className="text-[12px] text-[#788187]">
                Select vessels from your existing roster to include in this fleet.
                You can also add vessels later.
              </p>

              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={vesselFilter}
                  onChange={(e) => setVesselFilter(e.target.value)}
                  placeholder="Filter vessels by name or type…"
                  className={cn(INPUT_CLASS, "pl-8")}
                />
              </div>

              {/* Vessel checklist — 3-column grid like the prototype */}
              <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
                {filteredVessels.length === 0 ? (
                  <div className="col-span-full rounded-sm border bg-muted/20 px-3 py-6 text-center text-[12px] text-muted-foreground">
                    No vessels match &ldquo;{vesselFilter}&rdquo;
                  </div>
                ) : (
                  filteredVessels.map((v) => {
                    const checked = selectedImos.has(v.imo);
                    return (
                      <label
                        key={v.imo}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-sm border bg-background px-3 py-2 text-[12px] transition-colors hover:bg-primary/[0.04] hover:border-primary",
                          checked && "border-primary bg-primary/[0.06]",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleVessel(v.imo)}
                          className="cursor-pointer accent-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-semibold text-foreground">
                            {v.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {v.spec}
                          </div>
                        </div>
                        <span className="ml-auto">
                          <VesselTypeBadge value={v.type} />
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </Card>

          {/* Step 3 — Visibility & Access */}
          <Card>
            <CardHeader className="border-b">
              <h2 className="flex items-center gap-2 text-[14px] font-bold">
                <StepNumber>3</StepNumber>
                Visibility &amp; Access
              </h2>
            </CardHeader>
            <div className="p-4">
              <FormRow>
                <FormField label="Owner">
                  <input
                    value="A. Avdieieva"
                    readOnly
                    className={cn(INPUT_CLASS, "bg-card text-muted-foreground")}
                  />
                </FormField>
                <FormField label="Visibility">
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option>Private (only me)</option>
                    <option>Team (all users)</option>
                    <option>Read-only share</option>
                  </select>
                </FormField>
                <FormField label="Tag / Label">
                  <input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    type="text"
                    placeholder="e.g. 2026 Expansion, Q1 Review…"
                    className={INPUT_CLASS}
                  />
                </FormField>
              </FormRow>
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2 pb-6">
            <Button type="submit" className="gap-2" disabled={!canSubmit}>
              <Check className="size-3.5" />
              Create Fleet
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/fleetspace">Cancel</Link>
            </Button>
          </div>
        </div>

        {/* RIGHT — Live preview (mirrors prototype's `.fleet-preview`) */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-md border bg-card p-5">
            <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
              Live Preview
            </div>
            <div
              className="mb-4 h-1 w-full rounded-sm"
              style={{ backgroundColor: colorHex }}
            />
            <div className="mb-1 text-[16px] font-extrabold text-foreground">
              {name.trim() || "Fleet Name"}
            </div>
            <div className="mb-4 text-[11px] leading-[1.5] text-[#788187]">
              {description.trim() ||
                "Add a description to summarise this fleet's purpose."}
            </div>

            <PreviewStat label="Type" value={type} />
            <PreviewStat
              label="Vessels selected"
              value={String(selectedImos.size)}
            />
            <PreviewStat label="Owner" value="A. Avdieieva" />
            <PreviewStat label="Created" value="Today" />

            {/* Info banner — prototype's "Fill in fleet name and add vessels to continue" */}
            <div className="mt-4 flex items-center gap-1.5 rounded-sm border border-primary/15 bg-primary/[0.06] px-3 py-2 text-[11px] font-semibold text-primary">
              <Info className="size-3 shrink-0" strokeWidth={2} />
              Fill in fleet name and add vessels to continue
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
  "h-9 w-full rounded-sm border border-input bg-background px-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

function FormField({
  label,
  required = false,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-w-[180px] flex-1 flex-col gap-1", className)}>
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        {label}
        {required ? (
          <span className="ml-1 text-signal-magenta">*</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

function StepNumber({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">
      {children}
    </span>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 text-[11px] last:border-b-0">
      <span className="text-[#788187]">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
