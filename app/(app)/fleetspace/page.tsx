"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EnvScoreBadge } from "@/components/app/env-score-badge";
import { TablePagination } from "@/components/app/table-pagination";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────────
 * Fleet data — mirrors html/my-fleet.html `FLEET` + `VESSELS` literals.
 * All numbers, IMOs, type labels and val-cert IDs match the prototype
 * one-for-one so KPI totals reconcile.
 * ─────────────────────────────────────────────────────────────────── */

type FleetKey = "alpha" | "beta";
type ViewKey = "global" | FleetKey;
type VesselTypeKey = "bulk" | "tanker" | "gas" | "container";

type FleetMeta = {
  label: string;
  vessels: number;
  fmv: number; // $M
  dwt: number; // K
  age: number; // years
  created: string;
};

const FLEET: Record<ViewKey, FleetMeta> = {
  global: { label: "All Fleets",  vessels: 14, fmv: 312, dwt: 842, age: 8.4, created: "—" },
  alpha:  { label: "Fleet Alpha", vessels: 8,  fmv: 178, dwt: 478, age: 9.8, created: "Mar 2020" },
  beta:   { label: "Fleet Beta",  vessels: 6,  fmv: 134, dwt: 364, age: 6.4, created: "Jan 2022" },
};

const FLEET_DOT: Record<ViewKey, string> = {
  global: "bg-primary",
  alpha: "bg-primary",
  beta: "bg-signal-green",
};

type Vessel = {
  fleet: FleetKey;
  name: string;
  imo: string;
  type: VesselTypeKey;
  typeLabel: string;
  year: number;
  dwt: number;
  env: "A" | "B" | "C" | "D";
  fmv: number;
  resale: number;
  nb: number;
  valcert: string | null;
  valcertDate: string | null;
};

const VESSELS: Vessel[] = [
  /* Fleet Alpha — 8 vessels */
  { fleet: "alpha", name: "MV Pacific Star",   imo: "9623148", type: "bulk",   typeLabel: "Panamax Bulk",   year: 2016, dwt: 82000,  env: "A", fmv: 28.5, resale: 24.2, nb: 38.0,  valcert: "VC-2026-0312", valcertDate: "26 Mar 2026" },
  { fleet: "alpha", name: "MT Helios Trader",  imo: "9712305", type: "tanker", typeLabel: "Suezmax Tanker", year: 2014, dwt: 158400, env: "B", fmv: 62.0, resale: 52.1, nb: 82.0,  valcert: "VC-2026-0298", valcertDate: "18 Mar 2026" },
  { fleet: "alpha", name: "MV Baltic Crown",   imo: "9544210", type: "bulk",   typeLabel: "Supramax Bulk",  year: 2010, dwt: 55700,  env: "C", fmv: 16.8, resale: 13.5, nb: 31.0,  valcert: "VC-2025-0184", valcertDate: "12 Dec 2025" },
  { fleet: "alpha", name: "MV Cape Fortuna",   imo: "9831044", type: "bulk",   typeLabel: "Capesize Bulk",  year: 2019, dwt: 181000, env: "A", fmv: 54.2, resale: 48.0, nb: 64.0,  valcert: "VC-2026-0187", valcertDate: "15 Feb 2026" },
  { fleet: "alpha", name: "MT Nordic Eagle",   imo: "9388221", type: "tanker", typeLabel: "VLCC Tanker",    year: 2008, dwt: 299990, env: "D", fmv: 38.0, resale: 30.0, nb: 118.0, valcert: "VC-2025-0142", valcertDate: "08 Nov 2025" },
  { fleet: "alpha", name: "MV Atlantic Star",  imo: "9720401", type: "bulk",   typeLabel: "Panamax Bulk",   year: 2018, dwt: 82500,  env: "A", fmv: 32.1, resale: 27.8, nb: 38.0,  valcert: "VC-2026-0271", valcertDate: "05 Mar 2026" },
  { fleet: "alpha", name: "MV Global Pioneer", imo: "9612334", type: "bulk",   typeLabel: "Capesize Bulk",  year: 2017, dwt: 184000, env: "B", fmv: 48.5, resale: 42.0, nb: 64.0,  valcert: "VC-2026-0289", valcertDate: "14 Mar 2026" },
  { fleet: "alpha", name: "MT Aegean Spirit",  imo: "9455612", type: "tanker", typeLabel: "Aframax Tanker", year: 2012, dwt: 115000, env: "B", fmv: 32.0, resale: 26.5, nb: 56.0,  valcert: null,           valcertDate: null          },
  /* Fleet Beta — 6 vessels */
  { fleet: "beta",  name: "MV Nordic Crest",   imo: "9834521", type: "bulk",   typeLabel: "Kamsarmax Bulk", year: 2022, dwt: 81000,  env: "A", fmv: 29.0, resale: 25.0, nb: 38.5,  valcert: "VC-2026-0301", valcertDate: "22 Mar 2026" },
  { fleet: "beta",  name: "MT Eastern Sun",    imo: "9761234", type: "tanker", typeLabel: "MR Tanker",      year: 2022, dwt: 52000,  env: "A", fmv: 24.5, resale: 21.0, nb: 42.0,  valcert: "VC-2026-0244", valcertDate: "28 Feb 2026" },
  { fleet: "beta",  name: "MV Blue Horizon",   imo: "9712890", type: "bulk",   typeLabel: "Panamax Bulk",   year: 2020, dwt: 82000,  env: "B", fmv: 25.5, resale: 22.0, nb: 38.0,  valcert: "VC-2026-0211", valcertDate: "18 Jan 2026" },
  { fleet: "beta",  name: "MV Ocean Knight",   imo: "9698123", type: "bulk",   typeLabel: "Ultramax Bulk",  year: 2019, dwt: 63000,  env: "B", fmv: 22.0, resale: 18.5, nb: 34.0,  valcert: null,           valcertDate: null          },
  { fleet: "beta",  name: "MV Silver Wave",    imo: "9623456", type: "bulk",   typeLabel: "Handysize Bulk", year: 2018, dwt: 38000,  env: "C", fmv: 17.5, resale: 14.0, nb: 26.5,  valcert: "VC-2025-0198", valcertDate: "04 Dec 2025" },
  { fleet: "beta",  name: "MV Crystal Ridge",  imo: "9534789", type: "bulk",   typeLabel: "Supramax Bulk",  year: 2016, dwt: 48000,  env: "B", fmv: 15.5, resale: 12.5, nb: 31.0,  valcert: "VC-2026-0156", valcertDate: "10 Jan 2026" },
];

const TYPE_TAG: Record<VesselTypeKey, { label: string; cls: string }> = {
  bulk:      { label: "BULK",   cls: "bg-primary/12 text-primary" },
  tanker:    { label: "TANKER", cls: "bg-signal-orange/15 text-signal-orange" },
  gas:       { label: "GAS",    cls: "bg-accent/15 text-accent" },
  container: { label: "CONT",   cls: "bg-signal-purple/15 text-signal-purple" },
};

/* Year-built filter buckets */
const YEAR_TEST: Record<string, (y: number) => boolean> = {
  "2020+":     (y) => y >= 2020,
  "2015-2019": (y) => y >= 2015 && y <= 2019,
  "2010-2014": (y) => y >= 2010 && y <= 2014,
  "Before 2010": (y) => y < 2010,
};

function fmtDwt(k: number) {
  return k >= 1000 ? (k / 1000).toFixed(0) + "M" : k + "K";
}

/* ──────────────────────────────────────────────────────────────────────
 * Page
 * ─────────────────────────────────────────────────────────────────── */

export default function FleetSpacePage() {
  /* Tab state — global is permanent; alpha/beta are openable tabs */
  const [activeView, setActiveView] = React.useState<ViewKey>("global");
  const [openTabs, setOpenTabs] = React.useState<FleetKey[]>([]);

  function openFleet(slug: FleetKey) {
    setOpenTabs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setActiveView(slug);
  }
  function closeFleet(slug: FleetKey) {
    setOpenTabs((prev) => prev.filter((s) => s !== slug));
    if (activeView === slug) setActiveView("global");
  }

  const meta = FLEET[activeView];

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Fleets" }]}
        title="Fleet Overview"
        subtitle="Organise vessels into fleets and monitor portfolio performance"
        actions={
          <>
            <Button asChild className="gap-1.5">
              <Link href="/fleetspace/create">
                <Plus className="size-3.5" />
                Create Fleet
              </Link>
            </Button>
            <Button asChild className="gap-1.5">
              <Link href="/fleetspace/add-vessel">
                <Plus className="size-3.5" />
                Add Vessel
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-col p-8">
        {/* Fleet browser tab strip — `.fleet-browser-bar` from prototype:
            gray bg, 8px padding, 2px gap, top-rounded, top/sides border.
            Connected to the content panel below via shared border. */}
        <div className="relative z-[1] flex shrink-0 items-stretch gap-[2px] overflow-x-auto rounded-t-md border border-b-0 bg-muted/40 px-2 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FleetTab
            label="All Fleets"
            badge={FLEET.global.vessels}
            accent="bg-primary"
            active={activeView === "global"}
            onClick={() => setActiveView("global")}
          />
          {openTabs.map((s) => (
            <FleetTab
              key={s}
              label={FLEET[s].label}
              badge={FLEET[s].vessels}
              dot={s === "alpha" ? "bg-primary" : "bg-signal-green"}
              accent={s === "alpha" ? "bg-primary" : "bg-signal-green"}
              active={activeView === s}
              onClick={() => setActiveView(s)}
              onClose={() => closeFleet(s)}
            />
          ))}
        </div>

        {/* Browser content area — `.fleet-browser-content`:
            white bg, border (no top), bottom-rounded, 16px padding. */}
        <div className="flex flex-col gap-4 rounded-b-md border bg-card p-4">
          {/* Viewing label — `.fleet-viewing-label`: 11px / 700 / uppercase / 0.5px tracking. */}
          <p className="flex items-center gap-1.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
            Viewing
            <span
              className={cn(
                "inline-block size-[9px] shrink-0 rounded-full",
                FLEET_DOT[activeView],
              )}
            />
            <span className="text-foreground">{meta.label}</span>
            <span className="font-normal text-muted-foreground">
              — data reflects selected fleet
            </span>
          </p>

          {/* Stats row — share pills appear when a fleet (not "global") is active */}
          <StatsRow view={activeView} />

          {activeView === "global" ? (
            <AllFleetsView onOpenFleet={openFleet} />
          ) : (
            <FleetDetailView fleet={activeView} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * KPI Stats row
 * ─────────────────────────────────────────────────────────────────── */

function StatsRow({ view }: { view: ViewKey }) {
  const d = FLEET[view];
  const g = FLEET.global;
  const isGlobal = view === "global";

  const pct = (a: number, b: number) => Math.round((a / b) * 100);
  const ageDiff = (d.age - g.age).toFixed(1);
  const ageUp = Number(ageDiff) >= 0;

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <FleetKpi
        accent="bg-primary"
        label="Total Vessels"
        value={String(d.vessels)}
        meta={isGlobal ? "Across 2 fleets" : d.label}
        share={isGlobal ? null : `${pct(d.vessels, g.vessels)}% of global`}
      />
      <FleetKpi
        accent="bg-signal-green"
        label="Total FMV"
        value={`$${d.fmv}M`}
        meta={isGlobal ? "Portfolio value" : d.label}
        share={isGlobal ? null : `${pct(d.fmv, g.fmv)}% of global`}
      />
      <FleetKpi
        accent="bg-accent"
        label="Total DWT"
        value={fmtDwt(d.dwt)}
        meta={isGlobal ? "Combined capacity" : d.label}
        share={isGlobal ? null : `${pct(d.dwt, g.dwt)}% of global`}
      />
      <FleetKpi
        accent="bg-signal-orange"
        label="AVG Vessel Age"
        value={
          <>
            {d.age}
            <span className="ml-1 text-[16px] font-normal tracking-normal text-muted-foreground">
              yrs
            </span>
          </>
        }
        meta={isGlobal ? "Fleet average" : `vs ${g.age} yrs global avg`}
        share={
          isGlobal
            ? null
            : { text: `${ageUp ? "+" : ""}${ageDiff}y vs global`, tone: ageUp ? "warn" : "good" }
        }
      />
    </section>
  );
}

/**
 * FleetKpi — mirrors the prototype's `.stat-card` exactly:
 *   - 24px padding
 *   - 4px gap between rows (`--sp-xs`)
 *   - 3px LEFT-side accent stripe (color per accent prop)
 *   - label: 11px / 600 / muted / uppercase / 0.4px tracking
 *   - value: Inter Tight (display font) / 24px / 800 / -0.6px / tabular nums
 *   - meta:  11px / muted
 */
function FleetKpi({
  label,
  value,
  meta,
  accent,
  share,
}: {
  label: string;
  value: React.ReactNode;
  meta?: string;
  /** Tailwind bg- class for the left accent stripe (e.g. "bg-primary"). */
  accent: string;
  share?:
    | string
    | { text: string; tone: "good" | "warn" }
    | null;
}) {
  let shareEl: React.ReactNode = null;
  if (typeof share === "string") {
    shareEl = (
      <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
        {share}
      </span>
    );
  } else if (share && typeof share === "object") {
    shareEl = (
      <span
        className={cn(
          "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
          share.tone === "warn"
            ? "bg-signal-orange/15 text-signal-orange"
            : "bg-signal-green/15 text-signal-green",
        )}
      >
        {share.text}
      </span>
    );
  }
  return (
    <div className="relative flex flex-col gap-1 overflow-hidden rounded-md border bg-card p-6 shadow-sm">
      {/* Left accent stripe (3px, full height) */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-[3px]",
          accent,
        )}
      />
      <div className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline">
        <span className="font-display text-[24px] font-extrabold leading-tight tracking-[-0.6px] tabular-nums text-foreground">
          {value}
        </span>
        {shareEl}
      </div>
      {meta ? (
        <div className="text-[11px] text-muted-foreground">{meta}</div>
      ) : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * All Fleets list view
 * ─────────────────────────────────────────────────────────────────── */

function AllFleetsView({
  onOpenFleet,
}: {
  onOpenFleet: (slug: FleetKey) => void;
}) {
  const [search, setSearch] = React.useState("");
  const all: { key: FleetKey; meta: FleetMeta }[] = [
    { key: "alpha", meta: FLEET.alpha },
    { key: "beta", meta: FLEET.beta },
  ];
  const visible = all.filter((f) =>
    f.meta.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-[340px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search fleet name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {visible.length} fleet{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Fleet list table */}
      <Card className="overflow-visible">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2.5 text-left">Fleet</th>
              <th className="px-4 py-2.5 text-left">Vessels</th>
              <th className="px-4 py-2.5 text-left">Total FMV</th>
              <th className="px-4 py-2.5 text-left">Total DWT</th>
              <th className="px-4 py-2.5 text-left">Avg Age</th>
              <th className="px-4 py-2.5 text-left">Type Mix</th>
              <th className="px-4 py-2.5 text-left">Created</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ key, meta }) => {
              const fleetVessels = VESSELS.filter((v) => v.fleet === key);
              const types = fleetVessels.reduce<Record<VesselTypeKey, number>>(
                (acc, v) => {
                  acc[v.type] = (acc[v.type] || 0) + 1;
                  return acc;
                },
                {} as Record<VesselTypeKey, number>,
              );
              return (
                <tr
                  key={key}
                  onClick={() => onOpenFleet(key)}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "inline-block size-2.5 shrink-0 rounded-full",
                          FLEET_DOT[key],
                        )}
                      />
                      <span className="font-semibold text-primary">
                        {meta.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    {meta.vessels}
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    ${meta.fmv}M
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {fmtDwt(meta.dwt)} DWT
                  </td>
                  <td className="px-4 py-3 tabular-nums">{meta.age} yrs</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(types).map(([t, count]) => {
                        const tag = TYPE_TAG[t as VesselTypeKey];
                        return (
                          <span
                            key={t}
                            className={cn(
                              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
                              tag.cls,
                            )}
                          >
                            {count}×{tag.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {meta.created}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        onClick={() => onOpenFleet(key)}
                      >
                        Open
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-[26px]"
                        title="Fleet options"
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="text-[12px] font-bold text-muted-foreground">
                    No fleets match your search
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Try a different name.
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <TablePagination
          page={1}
          totalPages={1}
          totalRows={visible.length}
          perPage={5}
          perPageOptions={[5, 10, 25]}
          rowLabel="fleet"
        />
      </Card>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Fleet detail view — vessel table + employments section
 * ─────────────────────────────────────────────────────────────────── */

function FleetDetailView({ fleet }: { fleet: FleetKey }) {
  const meta = FLEET[fleet];
  const allFleetVessels = React.useMemo(
    () => VESSELS.filter((v) => v.fleet === fleet),
    [fleet],
  );

  const [filterType, setFilterType] = React.useState<VesselTypeKey | "">("");
  const [filterYear, setFilterYear] = React.useState<string>("");
  const [filterSearch, setFilterSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    return allFleetVessels.filter((v) => {
      if (filterType && v.type !== filterType) return false;
      if (filterYear && YEAR_TEST[filterYear] && !YEAR_TEST[filterYear](v.year))
        return false;
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        if (
          !v.name.toLowerCase().includes(q) &&
          !v.typeLabel.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [allFleetVessels, filterType, filterYear, filterSearch]);

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 p-3">
        <FilterSelect
          label="Type"
          value={filterType}
          onChange={(v) => setFilterType(v as VesselTypeKey | "")}
          options={[
            { value: "", label: "All Types" },
            { value: "bulk", label: "Bulk Carrier" },
            { value: "tanker", label: "Tanker" },
            { value: "container", label: "Container" },
            { value: "gas", label: "Gas Carrier" },
          ]}
        />
        <FilterSelect
          label="Year Built"
          value={filterYear}
          onChange={setFilterYear}
          options={[
            { value: "", label: "Any Year" },
            { value: "2020+", label: "2020+" },
            { value: "2015-2019", label: "2015–2019" },
            { value: "2010-2014", label: "2010–2014" },
            { value: "Before 2010", label: "Before 2010" },
          ]}
        />
        <div className="h-5 w-px bg-border" />
        <div className="relative max-w-[300px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vessel name…"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground">
          <strong className="font-bold text-foreground">{filtered.length}</strong>
          {filtered.length === allFleetVessels.length
            ? ` vessel${filtered.length === 1 ? "" : "s"}`
            : ` of ${allFleetVessels.length} vessels`}
        </span>
      </div>

      {/* Vessel table */}
      <Card className="overflow-visible">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="text-[14px] font-bold">{meta.label}</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {filtered.length} vessel{filtered.length === 1 ? "" : "s"}
              {filtered.length !== allFleetVessels.length ? " (filtered)" : ""}{" "}
              · Updated 25 Mar 2026
            </p>
          </div>
          <Button size="icon" variant="ghost" className="size-7">
            <MoreHorizontal className="size-3.5" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="w-8 px-3 py-2">
                  <input type="checkbox" />
                </th>
                <th className="px-3 py-2 text-left">Vessel Name</th>
                <th className="px-3 py-2 text-left">IMO</th>
                <th className="px-3 py-2 text-left">Vessel Type</th>
                <th className="px-3 py-2 text-left">Year Built</th>
                <th className="px-3 py-2 text-left">Size (DWT)</th>
                <th className="px-3 py-2 text-left">Env. Score</th>
                <th className="px-3 py-2 text-left">FMV</th>
                <th className="px-3 py-2 text-left">Resale Value</th>
                <th className="px-3 py-2 text-left">Newbuild Value</th>
                <th className="px-3 py-2 text-left">Val. Certificate</th>
                <th className="px-3 py-2 text-left">Val. Date</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const tag = TYPE_TAG[v.type];
                return (
                  <tr key={v.imo} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <input type="checkbox" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/vessels/${v.imo}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {v.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {v.imo}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
                          tag.cls,
                        )}
                      >
                        {tag.label}
                      </span>
                      <span className="ml-1.5 text-[12px]">{v.typeLabel}</span>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{v.year}</td>
                    <td className="px-3 py-2.5 font-semibold tabular-nums">
                      {v.dwt.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <EnvScoreBadge value={v.env} />
                    </td>
                    <td className="px-3 py-2.5 font-semibold tabular-nums">
                      ${v.fmv.toFixed(1)}M
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      ${v.resale.toFixed(1)}M
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      ${v.nb.toFixed(1)}M
                    </td>
                    <td className="px-3 py-2.5">
                      {v.valcert ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          <FileText className="size-2.5" />
                          {v.valcert}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {v.valcertDate || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Button size="sm" variant="ghost" className="gap-1">
                        More
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center">
                    <div className="text-[12px] font-bold text-muted-foreground">
                      No vessels match your filters
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Try adjusting the vessel type, year, or search term.
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={1}
          totalPages={1}
          totalRows={filtered.length}
          perPage={10}
          perPageOptions={[10, 25, 50]}
          rowLabel="vessel"
        />
      </Card>

      {/* Employments section */}
      <EmploymentsSection fleetLabel={meta.label} />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Filter select control (Type / Year Built)
 * ─────────────────────────────────────────────────────────────────── */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Employments section
 * ─────────────────────────────────────────────────────────────────── */

type EmploymentStatus = "TC" | "SPOT" | "IDLE" | "EXPIRING";

type EmploymentRow = {
  vessel: string;
  type: VesselTypeKey;
  status: EmploymentStatus;
  charterer: string;
  rate: string;
  start: string;
  end: string;
  daysRemaining: number | null;
  daysColor?: "blue" | "orange" | "magenta";
  cta?: "Renew TC" | "Fix TC" | null;
};

const EMPLOYMENT_ROWS: EmploymentRow[] = [
  { vessel: "MV Pacific Star",   type: "bulk",   status: "TC",       charterer: "Cargill",  rate: "$17,500", start: "2025-10-01", end: "2026-09-30", daysRemaining: 184, daysColor: "blue",    cta: "Renew TC" },
  { vessel: "MT Helios Trader",  type: "tanker", status: "TC",       charterer: "Shell",    rate: "$38,000", start: "2024-07-01", end: "2026-06-30", daysRemaining: 92,  daysColor: "orange",  cta: "Renew TC" },
  { vessel: "MV Baltic Crown",   type: "bulk",   status: "SPOT",     charterer: "—",        rate: "Spot rate", start: "—",        end: "—",          daysRemaining: null, cta: "Fix TC" },
  { vessel: "MV Cape Fortuna",   type: "bulk",   status: "TC",       charterer: "Vale",     rate: "$21,200", start: "2025-01-15", end: "2026-12-31", daysRemaining: 276, daysColor: "blue",    cta: null },
  { vessel: "MT Nordic Eagle",   type: "tanker", status: "IDLE",     charterer: "—",        rate: "—",       start: "—",          end: "—",          daysRemaining: null, cta: "Fix TC" },
  { vessel: "MV Atlantic Star",  type: "bulk",   status: "TC",       charterer: "BHP",      rate: "$19,800", start: "2025-09-01", end: "2026-08-31", daysRemaining: 154, daysColor: "blue",    cta: "Renew TC" },
  { vessel: "MV Global Pioneer", type: "bulk",   status: "TC",       charterer: "Rio Tinto", rate: "$22,500", start: "2025-12-01", end: "2026-11-30", daysRemaining: 245, daysColor: "blue",    cta: null },
  { vessel: "MT Aegean Spirit",  type: "tanker", status: "EXPIRING", charterer: "Vitol",    rate: "$28,000", start: "2025-05-15", end: "2026-04-30", daysRemaining: 31,  daysColor: "magenta", cta: "Renew TC" },
];

const GANTT = [
  { vessel: "MV Pacific Star",   bars: [{ kind: "tc",   left: 0,    width: 75,   label: "TC · Cargill" }] },
  { vessel: "MT Helios Trader",  bars: [{ kind: "tc",   left: 0,    width: 50,   label: "TC · Shell" }, { kind: "spot", left: 50, width: 50, label: "Spot" }] },
  { vessel: "MV Baltic Crown",   bars: [{ kind: "spot", left: 0,    width: 100,  label: "Spot" }] },
  { vessel: "MV Cape Fortuna",   bars: [{ kind: "tc",   left: 0,    width: 100,  label: "TC · Vale" }] },
  { vessel: "MT Nordic Eagle",   bars: [{ kind: "idle", left: 0,    width: 100,  label: "Idle / Layup" }] },
  { vessel: "MV Atlantic Star",  bars: [{ kind: "tc",   left: 0,    width: 66.7, label: "TC · BHP" }, { kind: "spot", left: 66.7, width: 33.3, label: "Spot" }] },
  { vessel: "MV Global Pioneer", bars: [{ kind: "tc",   left: 0,    width: 91.7, label: "TC · Rio Tinto" }] },
  { vessel: "MT Aegean Spirit",  bars: [{ kind: "tc",   left: 0,    width: 33.3, label: "TC · Vitol" }, { kind: "spot", left: 33.3, width: 66.7, label: "Spot" }] },
] as const;

const BAR_COLOR: Record<string, string> = {
  tc: "bg-primary",
  spot: "bg-signal-green",
  idle: "bg-signal-orange",
};

function EmploymentsSection({ fleetLabel }: { fleetLabel: string }) {
  return (
    <section className="mt-2 flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 p-3">
        <FilterSelect
          label="Fleet"
          value=""
          onChange={() => undefined}
          options={[
            { value: "", label: "All Fleets" },
            { value: "alpha", label: "Fleet Alpha" },
            { value: "beta", label: "Fleet Beta" },
          ]}
        />
        <FilterSelect
          label="Employment Type"
          value=""
          onChange={() => undefined}
          options={[
            { value: "", label: "All Types" },
            { value: "tc", label: "Time Charter (TC)" },
            { value: "spot", label: "Spot" },
            { value: "idle", label: "Idle / Layup" },
          ]}
        />
        <FilterSelect
          label="TC Expiry"
          value=""
          onChange={() => undefined}
          options={[
            { value: "", label: "All" },
            { value: "30", label: "Expiring < 30 days" },
            { value: "90", label: "Expiring < 90 days" },
            { value: "180", label: "Expiring < 6 months" },
          ]}
        />
      </div>

      {/* Employment KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FleetKpi accent="border-t-primary"        label="On Time Charter"     value="9" meta="of 14 active vessels" />
        <FleetKpi accent="border-t-signal-green"   label="Spot Market"         value="3" meta="Open / spot trading" />
        <FleetKpi accent="border-t-signal-orange"  label="Idle / Layup"        value="2" meta="Awaiting employment" />
        <FleetKpi accent="border-t-accent"         label="TC Expiring (<90d)"  value="3" meta="Next: MT Aegean Spirit, 31d" />
      </section>

      {/* Gantt + Donut + Avg TC */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Gantt timeline */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h3 className="text-[14px] font-bold">Employment Timeline — 2026</h3>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                12-month forward view · {fleetLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <LegendDot color="bg-primary" label="Time Charter" />
              <LegendDot color="bg-signal-green" label="Spot" />
              <LegendDot color="bg-signal-orange" label="Idle" />
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <div className="w-[110px]" />
                <div className="grid flex-1 grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"].map((m) => (
                    <div key={m} className="text-center">{m}</div>
                  ))}
                </div>
              </div>
              {GANTT.map((row) => (
                <div key={row.vessel} className="flex items-center gap-3">
                  <div className="w-[110px] truncate text-[11px] font-semibold text-foreground">
                    {row.vessel}
                  </div>
                  <div className="relative h-6 flex-1 rounded bg-muted/50">
                    {/* Today line at 25% (≈ end of March) */}
                    <span
                      className="absolute inset-y-0 w-px bg-signal-magenta"
                      style={{ left: "25%" }}
                      aria-hidden
                    />
                    {row.bars.map((bar, i) => (
                      <span
                        key={i}
                        className={cn(
                          "absolute inset-y-0.5 flex items-center justify-center overflow-hidden rounded px-1.5 text-[10px] font-semibold text-white",
                          BAR_COLOR[bar.kind],
                        )}
                        style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
                      >
                        <span className="truncate">{bar.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              Pink line = today (30 Mar 2026). Bars extending past year-end continue into 2027.
            </p>
          </div>
        </Card>

        {/* Right column — donut + avg TC */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-1 flex-col">
            <div className="border-b px-5 py-4">
              <h3 className="text-[14px] font-bold">Employment Breakdown</h3>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                14 active vessels
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center gap-4 p-5">
              <div className="relative size-[130px] shrink-0">
                <div
                  className="size-[130px] rounded-full"
                  style={{
                    background:
                      "conic-gradient(hsl(var(--primary)) 0% 64.3%, hsl(var(--signal-green)) 64.3% 85.7%, hsl(var(--signal-orange)) 85.7% 100%)",
                  }}
                />
                <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-card">
                  <div className="text-[20px] font-extrabold leading-none">14</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Vessels
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <DonutLegend color="bg-primary" label="Time Charter" value="9" />
                <DonutLegend color="bg-signal-green" label="Spot Market" value="3" />
                <DonutLegend color="bg-signal-orange" label="Idle / Layup" value="2" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="border-b px-5 py-4">
              <h3 className="text-[14px] font-bold">Avg TC Rate</h3>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Current fixtures
              </p>
            </div>
            <div className="flex flex-col gap-2.5 p-4">
              <RateRow label="Bulk Carriers" value="$18,400/day" />
              <RateRow label="Tankers" value="$32,100/day" />
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-[11px] font-bold text-muted-foreground">
                  Fleet Average
                </span>
                <span className="text-[12px] font-extrabold text-primary">
                  $24,250/day
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Employment Schedule */}
      <Card className="overflow-hidden">
        <div className="border-b px-5 py-4">
          <h3 className="text-[14px] font-bold">Employment Schedule</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Active employments across all vessels — {fleetLabel}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Charterer</th>
                <th className="px-3 py-2 text-left">TC Rate / Day</th>
                <th className="px-3 py-2 text-left">TC Start</th>
                <th className="px-3 py-2 text-left">TC End</th>
                <th className="px-3 py-2 text-left">Days Remaining</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {EMPLOYMENT_ROWS.map((r) => {
                const tag = TYPE_TAG[r.type];
                const expiring = r.status === "EXPIRING";
                return (
                  <tr
                    key={r.vessel}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30",
                      expiring && "bg-signal-magenta/5",
                    )}
                  >
                    <td className="px-3 py-2.5 font-semibold">{r.vessel}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold", tag.cls)}>
                        {tag.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <EmploymentBadge status={r.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      {r.charterer === "—" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        r.charterer
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-semibold">
                      {r.rate === "—" || r.rate === "Spot rate" ? (
                        <span className="font-normal text-muted-foreground">{r.rate}</span>
                      ) : (
                        r.rate
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.start}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.end}</td>
                    <td
                      className={cn(
                        "px-3 py-2.5 font-semibold tabular-nums",
                        r.daysColor === "blue" && "text-primary",
                        r.daysColor === "orange" && "text-signal-orange",
                        r.daysColor === "magenta" && "text-signal-magenta",
                        !r.daysColor && "text-muted-foreground",
                      )}
                    >
                      {r.daysRemaining ?? (r.status === "SPOT" ? "Open" : "—")}
                    </td>
                    <td className="px-3 py-2.5">
                      {r.cta ? (
                        <Button
                          size="sm"
                          variant={expiring ? "default" : "outline"}
                        >
                          {r.cta}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upcoming TC Expirations */}
      <Card>
        <div className="border-b px-5 py-4">
          <h3 className="text-[14px] font-bold">Upcoming TC Expirations</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Vessels with time charters expiring within 6 months
          </p>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <ExpAlert
            tone="critical"
            vessel="MT Aegean Spirit"
            details={
              <>
                TC with <strong>Vitol</strong> expires <strong>30 Apr 2026</strong> · Aframax Tanker · $28,000/day
              </>
            }
            days={31}
            cta="Renew TC"
          />
          <ExpAlert
            tone="warning"
            vessel="MT Helios Trader"
            details={
              <>
                TC with <strong>Shell</strong> expires <strong>30 Jun 2026</strong> · Suezmax Tanker · $38,000/day
              </>
            }
            days={92}
            cta="Review"
          />
          <ExpAlert
            tone="info"
            vessel="MV Pacific Star"
            details={
              <>
                TC with <strong>Cargill</strong> expires <strong>30 Sep 2026</strong> · Panamax Bulk · $17,500/day
              </>
            }
            days={184}
            cta="Review"
          />
        </div>
      </Card>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Small presentational helpers
 * ─────────────────────────────────────────────────────────────────── */

/**
 * FleetTab — mirrors the prototype's `.fbt`:
 *   - 8px / 14px / 9px padding (px-3.5 py-2)
 *   - 12px / 600 weight / muted text
 *   - active state: white bg, top accent stripe in fleet color (2px),
 *     border on three sides connecting visually to the content panel
 *   - badge: rounded-full, transparent gray bg, fleet-color bg when active
 */
function FleetTab({
  label,
  badge,
  active = false,
  accent,
  dot,
  onClick,
  onClose,
}: {
  label: string;
  badge: number;
  active?: boolean;
  /** Tailwind bg- class for the top accent stripe when active. */
  accent: string;
  dot?: string;
  onClick: () => void;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative -mb-px flex shrink-0 items-center gap-[7px] rounded-t-md px-3.5 pb-[9px] pt-2 text-[12px] font-semibold transition-colors",
        active
          ? "border border-b-0 border-border bg-card text-foreground"
          : "border border-transparent text-muted-foreground hover:bg-white/60 hover:text-foreground",
      )}
    >
      {/* Top accent strip — 2px in fleet color, only when active */}
      {active ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-md",
            accent,
          )}
        />
      ) : null}

      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="flex items-center gap-[7px]"
      >
        {dot ? (
          <span className={cn("inline-block size-[9px] rounded-full", dot)} />
        ) : null}
        {label}
        <span
          className={cn(
            "rounded-full px-[7px] text-[11px] font-bold leading-[17px] tabular-nums",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-black/[0.06] text-muted-foreground",
          )}
        >
          {badge}
        </span>
      </button>
      {onClose ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${label}`}
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground transition-all hover:bg-signal-magenta/12 hover:text-signal-magenta",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-sm", color)} />
      {label}
    </span>
  );
}

function DonutLegend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className={cn("size-2.5 shrink-0 rounded-full", color)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-bold tabular-nums">{value}</span>
    </div>
  );
}

function RateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function EmploymentBadge({ status }: { status: EmploymentStatus }) {
  const map: Record<EmploymentStatus, string> = {
    TC: "bg-primary/12 text-primary",
    SPOT: "bg-signal-green/12 text-signal-green",
    IDLE: "bg-signal-orange/15 text-signal-orange",
    EXPIRING: "bg-signal-magenta/15 text-signal-magenta",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
        map[status],
      )}
    >
      {status}
    </span>
  );
}

function ExpAlert({
  tone,
  vessel,
  details,
  days,
  cta,
}: {
  tone: "critical" | "warning" | "info";
  vessel: string;
  details: React.ReactNode;
  days: number;
  cta: string;
}) {
  const styles = {
    critical: {
      wrap: "border-signal-magenta/30 bg-signal-magenta/5",
      icon: "bg-signal-magenta/15 text-signal-magenta",
      days: "text-signal-magenta",
      btn: "default" as const,
    },
    warning: {
      wrap: "border-signal-orange/30 bg-signal-orange/5",
      icon: "bg-signal-orange/15 text-signal-orange",
      days: "text-signal-orange",
      btn: "outline" as const,
    },
    info: {
      wrap: "border-primary/20 bg-primary/5",
      icon: "bg-primary/15 text-primary",
      days: "text-primary",
      btn: "outline" as const,
    },
  }[tone];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-2",
        styles.wrap,
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          styles.icon,
        )}
      >
        <AlertCircle className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-bold">{vessel}</div>
        <div className="text-[11px] text-muted-foreground">{details}</div>
      </div>
      <div className={cn("whitespace-nowrap text-[11px] font-extrabold", styles.days)}>
        {days} DAYS
      </div>
      <Button size="sm" variant={styles.btn}>
        {cta}
      </Button>
    </div>
  );
}
