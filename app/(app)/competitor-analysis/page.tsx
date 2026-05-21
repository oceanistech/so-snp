"use client";

import * as React from "react";
import {
  Download,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EnvScoreBadge,
  type EnvScore,
} from "@/components/app/env-score-badge";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data
 * -------------------------------------------------------------------------- */

const COMPETITORS = [
  { name: "Star Bulk Carriers", active: true },
  { name: "Scorpio Tankers", active: false },
  { name: "Diana Shipping", active: false },
] as const;

type FavorTone = "favorable" | "unfavorable" | "neutral";

type CompKpi = {
  metric: string;
  unit: string;
  you: string;
  comp: string;
  delta: string;
  tone: FavorTone;
};

const KPIS: CompKpi[] = [
  { metric: "Fleet Size",       unit: "Vessels", you: "14",      comp: "22",     delta: "−8",   tone: "unfavorable" },
  { metric: "Total DWT",        unit: "mt",      you: "842K",    comp: "1.42M",  delta: "−41%", tone: "unfavorable" },
  { metric: "Avg FMV / Vessel", unit: "USD",     you: "$22.3M",  comp: "$18.9M", delta: "+18%", tone: "favorable" },
  { metric: "Avg Fleet Age",    unit: "Newer",   you: "8.4 yrs", comp: "9.1 yrs", delta: "−0.7y", tone: "favorable" },
  { metric: "Portfolio FMV",    unit: "USD",     you: "$312M",   comp: "$416M",  delta: "−25%", tone: "unfavorable" },
];

type CompBar = { type: string; pct: number; count: number; color: string };

const YOUR_FLEET: CompBar[] = [
  { type: "Bulk Carrier", pct: 57, count: 8, color: "bg-primary" },
  { type: "Tanker",       pct: 43, count: 6, color: "bg-signal-green" },
  { type: "Gas Carrier",  pct: 0,  count: 0, color: "bg-signal-orange" },
];

const COMP_FLEET: CompBar[] = [
  { type: "Bulk Carrier", pct: 82, count: 18, color: "bg-muted-foreground/50" },
  { type: "Tanker",       pct: 9,  count: 2,  color: "bg-muted-foreground/40" },
  { type: "Gas Carrier",  pct: 9,  count: 2,  color: "bg-muted-foreground/30" },
];

/** CII distribution per fleet — vessel counts per grade. */
type CiiDist = { who: string; total: number; A: number; B: number; C: number; D: number; muted?: boolean };

const CII_DIST: CiiDist[] = [
  { who: "Your Portfolio",      total: 14, A: 4, B: 4, C: 4, D: 2 },
  { who: "Star Bulk Carriers",  total: 22, A: 3, B: 8, C: 7, D: 4, muted: true },
];

/** Age distribution for grouped bar chart. */
const AGE_DIST = [
  { bucket: "<5 yrs",   you: 2, comp: 5 },
  { bucket: "5–10 yrs", you: 7, comp: 8 },
  { bucket: "10–15 yrs", you: 4, comp: 6 },
  { bucket: "15+ yrs",  you: 1, comp: 3 },
];

/** Market position by segment — leader = "you" or "comp". */
const MARKET_POSITION = [
  { segment: "Panamax Bulk",            youCount: 2, youShare: "3.1%", compCount: 6, compShare: "9.4%", leader: "comp" as const },
  { segment: "Capesize Bulk",           youCount: 2, youShare: "1.8%", compCount: 4, compShare: "3.6%", leader: "comp" as const },
  { segment: "Supramax / Ultramax Bulk", youCount: 4, youShare: "4.2%", compCount: 8, compShare: "8.4%", leader: "comp" as const },
  { segment: "Aframax Tanker",          youCount: 2, youShare: "5.3%", compCount: 1, compShare: "2.6%", leader: "you" as const },
  { segment: "Suezmax Tanker",          youCount: 2, youShare: "4.1%", compCount: 1, compShare: "2.0%", leader: "you" as const },
  { segment: "VLCC Tanker",             youCount: 2, youShare: "3.7%", compCount: 0, compShare: "—",    leader: "you" as const },
];

const TABS = [
  {
    id: "overview",
    label: "Overview",
    title: "Competitor Analysis",
    subtitle:
      "Benchmark your portfolio against key competitors — fleet size, composition, valuation, and environmental performance",
  },
  {
    id: "intelligence",
    label: "Fleet Intelligence",
    title: "Fleet Intelligence",
    subtitle:
      "Deep-dive on competitor fleet composition, age profiles, and recent S&P activity",
  },
  {
    id: "watchlist",
    label: "Vessel Watchlist",
    badge: 6,
    title: "Vessel Watchlist",
    subtitle:
      "Vessels you're tracking from competitor fleets — FMV deltas and sale alerts",
  },
] as const;

/* -------------------------------------------------------------------------- */

export default function CompetitorAnalysisPage() {
  const [active, setActive] = React.useState<(typeof TABS)[number]["id"]>("overview");
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "Competitor Analysis" },
          ...(active !== "overview" ? [{ label: activeTab.label }] : []),
        ]}
        title={activeTab.title}
        subtitle={activeTab.subtitle}
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="size-3.5" />
              Add Competitor
            </Button>
          </>
        }
        tabs={TABS}
        activeTab={active}
        onTabChange={setActive}
      />

      {active === "overview" ? <OverviewPanel /> : null}
      {active === "intelligence" ? <FleetIntelligencePanel /> : null}
      {active === "watchlist" ? <WatchlistPanel /> : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — Overview
 * -------------------------------------------------------------------------- */

function OverviewPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Select Competitor
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {COMPETITORS.map((c) => (
                <CompetitorChip key={c.name} {...c} />
              ))}
              <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-[11px]">
                <Plus className="size-3" />
                Add
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Currently comparing:{" "}
              <span className="font-bold text-foreground">
                Your Portfolio vs Star Bulk Carriers
              </span>{" "}
              · Last updated 1 Apr 2026
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-[11px]">
            <span className="flex items-center gap-2 font-bold">
              <span className="size-2.5 rounded-full bg-primary" />
              Your Portfolio
            </span>
            <span className="flex items-center gap-2 font-bold text-muted-foreground">
              <span className="size-2.5 rounded-full bg-muted-foreground/50" />
              Star Bulk Carriers
            </span>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {KPIS.map((k) => (
          <CompKpiCard key={k.metric} kpi={k} />
        ))}
      </section>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Fleet Composition</CardTitle>
          <CardDescription>
            Vessel type breakdown — Your Portfolio vs Star Bulk Carriers
          </CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2 lg:gap-10">
          <FleetSidePanel
            dotColor="bg-primary"
            title="Your Portfolio — 14 vessels"
            bars={YOUR_FLEET}
          />
          <FleetSidePanel
            dotColor="bg-muted-foreground/50"
            title="Star Bulk Carriers — 22 vessels"
            bars={COMP_FLEET}
            muted
          />
        </div>
      </Card>

      {/* Environmental Benchmarking — CII rating distribution per fleet:
            badge counts on the left, segmented bar to the right, total at far right. */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Environmental Benchmarking</CardTitle>
          <CardDescription>CII rating distribution comparison</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-3 p-4">
          {CII_DIST.map((row) => (
            <CiiDistRow key={row.who} row={row} />
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] font-bold">
            <CiiLegend grade="A" label="Best" />
            <CiiLegend grade="B" />
            <CiiLegend grade="C" />
            <CiiLegend grade="D" label="Needs Improvement" />
          </div>
        </div>
      </Card>

      {/* Age Distribution — grouped bar chart, 4 buckets × 2 fleets. */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-base">Age Distribution</CardTitle>
            <CardDescription>
              Vessel count by age bracket — grouped bar chart
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-primary">
              <span className="size-2.5 rounded-sm bg-primary" />
              Your Fleet
            </span>
            <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
              <span className="size-2.5 rounded-sm bg-muted-foreground/40" />
              Star Bulk
            </span>
          </div>
        </CardHeader>
        <div className="p-4">
          <AgeDistributionChart />
        </div>
      </Card>

      {/* Market Position by Segment — share table with leader badge. */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Market Position by Segment</CardTitle>
          <CardDescription>Estimated fleet share in each vessel segment</CardDescription>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Segment</th>
              <th className="px-4 py-2 text-right">Your Vessels</th>
              <th className="px-4 py-2 text-right">Your Share</th>
              <th className="px-4 py-2 text-right">Comp Vessels</th>
              <th className="px-4 py-2 text-right">Comp Share</th>
              <th className="px-4 py-2 text-left">Leader</th>
            </tr>
          </thead>
          <tbody>
            {MARKET_POSITION.map((row) => (
              <tr key={row.segment} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">{row.segment}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{row.youCount}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{row.youShare}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{row.compCount}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{row.compShare}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                      row.leader === "you"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {row.leader === "you" ? "You" : "Star Bulk"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 2 — Fleet Intelligence
 * -------------------------------------------------------------------------- */

/**
 * Star Bulk Carriers fleet roster — 12 vessels mirroring the prototype.
 * Used as the source for the Fleet Intelligence vessel table.
 */
type CompFleetVessel = {
  name: string;
  type: string;
  built: number;
  dwt: number;
  flag: string;
  cii: EnvScore;
  fmv: string;
  vsAvgPct: number;       // delta vs your avg FMV ($22.3M)
  status: "Active" | "Older Fleet";
};

const COMP_FLEET_VESSELS: CompFleetVessel[] = [
  { name: "Star Sigma",   type: "Capesize Bulk", built: 2018, dwt: 182000, flag: "Liberia",      cii: "B", fmv: "$52.1M", vsAvgPct: 134,  status: "Active" },
  { name: "Star Kappa",   type: "Panamax Bulk",  built: 2017, dwt: 81500,  flag: "Panama",       cii: "A", fmv: "$29.8M", vsAvgPct: 34,   status: "Active" },
  { name: "Star Theta",   type: "Panamax Bulk",  built: 2015, dwt: 80200,  flag: "Malta",        cii: "B", fmv: "$24.5M", vsAvgPct: 10,   status: "Active" },
  { name: "Star Lambda",  type: "Supramax",      built: 2019, dwt: 63000,  flag: "Marshall Is.", cii: "A", fmv: "$26.2M", vsAvgPct: 18,   status: "Active" },
  { name: "Star Omega",   type: "Supramax",      built: 2014, dwt: 57800,  flag: "Bahamas",      cii: "C", fmv: "$17.8M", vsAvgPct: -20,  status: "Active" },
  { name: "Star Delta",   type: "Ultramax",      built: 2021, dwt: 64000,  flag: "Liberia",      cii: "A", fmv: "$31.5M", vsAvgPct: 41,   status: "Active" },
  { name: "Star Epsilon", type: "Panamax Bulk",  built: 2013, dwt: 79000,  flag: "Panama",       cii: "C", fmv: "$20.1M", vsAvgPct: -10,  status: "Active" },
  { name: "Star Gamma",   type: "Kamsarmax",     built: 2020, dwt: 82500,  flag: "Greece",       cii: "A", fmv: "$32.0M", vsAvgPct: 44,   status: "Active" },
  { name: "Star Zeta",    type: "Handysize",     built: 2016, dwt: 38200,  flag: "Malta",        cii: "B", fmv: "$17.2M", vsAvgPct: -23,  status: "Active" },
  { name: "Star Eta",     type: "Capesize",      built: 2016, dwt: 178000, flag: "Liberia",      cii: "B", fmv: "$48.5M", vsAvgPct: 118,  status: "Active" },
  { name: "Star Iota",    type: "Ultramax",      built: 2022, dwt: 65500,  flag: "Marshall Is.", cii: "A", fmv: "$33.8M", vsAvgPct: 52,   status: "Active" },
  { name: "Star Alpha",   type: "Supramax",      built: 2012, dwt: 55200,  flag: "Panama",       cii: "D", fmv: "$13.4M", vsAvgPct: -40,  status: "Older Fleet" },
];

const FLEET_STRENGTHS = [
  "Larger fleet scale (22 vessels) provides greater route diversification and rate negotiation power vs your 14-vessel portfolio.",
  "Dominant bulk carrier exposure (82%) aligns well with current dry bulk supercycle — higher leverage to freight rate upswings.",
  "Strong newbuild pipeline with 4 vessels built 2020–2022, supporting long-term fleet renewal and CII compliance.",
  "Broader segment coverage in Kamsarmax and Handysize offers flexibility across grain, coal, and minor bulk trades.",
  "Higher total DWT (1.42M vs 842K) means significantly greater cargo-carrying capacity and revenue potential at scale.",
];

const ALERT_TOGGLES = [
  { label: "Notify on new S&P transactions",           defaultOn: true },
  { label: "Alert when CII rating changes",            defaultOn: true },
  { label: "Track fleet FMV movements (>5%)",          defaultOn: false },
  { label: "Monitor newbuild orders",                  defaultOn: true },
  { label: "Weekly fleet summary digest",              defaultOn: false },
];

function FleetIntelligencePanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Filter bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="Competitor" defaultValue="Star Bulk Carriers">
            <option>Star Bulk Carriers</option>
            <option>Scorpio Tankers</option>
            <option>Diana Shipping</option>
          </FilterSelect>
          <span aria-hidden className="h-5 w-px bg-border" />
          <FilterSelect label="Vessel Type" defaultValue="All Types">
            <option>All Types</option>
            <option>Capesize</option>
            <option>Panamax</option>
            <option>Kamsarmax</option>
            <option>Supramax</option>
            <option>Ultramax</option>
            <option>Handysize</option>
          </FilterSelect>
          <span aria-hidden className="h-5 w-px bg-border" />
          <FilterSelect label="CII Rating" defaultValue="All Ratings">
            <option>All Ratings</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </FilterSelect>
          <span aria-hidden className="h-5 w-px bg-border" />
          <input
            type="text"
            placeholder="Search vessel name…"
            className="h-8 min-w-[180px] flex-1 rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="sm" variant="outline" className="ml-auto gap-2">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </Card>

      {/* Vessel table */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Star Bulk Carriers — Fleet</CardTitle>
          <CardDescription>
            {COMP_FLEET_VESSELS.length} vessels · Your avg FMV: $22.3M
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Built</th>
                <th className="px-4 py-2 text-right">DWT</th>
                <th className="px-4 py-2 text-left">Flag</th>
                <th className="px-4 py-2 text-center">CII</th>
                <th className="px-4 py-2 text-right">Est. FMV</th>
                <th className="px-4 py-2 text-left">vs Your Avg FMV</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {COMP_FLEET_VESSELS.map((v) => (
                <tr key={v.name} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">{v.name}</td>
                  <td className="px-4 py-2.5">{v.type}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums">{v.built}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[11px] tabular-nums">
                    {v.dwt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">{v.flag}</td>
                  <td className="px-4 py-2.5 text-center">
                    <EnvScoreBadge value={v.cii} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums">
                    {v.fmv}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "font-bold tabular-nums",
                        v.vsAvgPct >= 0 ? "text-signal-green" : "text-signal-magenta",
                      )}
                    >
                      {v.vsAvgPct >= 0 ? "+" : ""}
                      {v.vsAvgPct}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                        v.status === "Active"
                          ? "bg-signal-green/15 text-signal-green"
                          : "bg-signal-orange/15 text-signal-orange",
                      )}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Two-column section: Fleet Strengths + Monitor & Alert */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Fleet Strengths</CardTitle>
            <CardDescription>
              Key competitive advantages of Star Bulk Carriers
            </CardDescription>
          </CardHeader>
          <ul className="space-y-2.5 p-4 text-[12px] leading-relaxed text-muted-foreground">
            {FLEET_STRENGTHS.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Monitor &amp; Alert</CardTitle>
            <CardDescription>Configure watchlist alerts for this competitor</CardDescription>
          </CardHeader>
          <div className="flex flex-col gap-3 p-4">
            {ALERT_TOGGLES.map((t) => (
              <AlertToggleRow key={t.label} label={t.label} defaultOn={t.defaultOn} />
            ))}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm">Save Alert Preferences</Button>
              <Button size="sm" variant="outline">
                Add to Watchlist
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

/**
 * FilterSelect — small label + select pair used inside the filter bar.
 */
function FilterSelect({
  label,
  defaultValue,
  children,
}: {
  label: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        {label}
      </span>
      <select
        defaultValue={defaultValue}
        className="h-8 rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>
    </div>
  );
}

/**
 * AlertToggleRow — label + switch, mirrors the prototype's `.intel-alert-row`.
 */
function AlertToggleRow({
  label,
  defaultOn,
}: {
  label: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
      <span className="text-[12px] text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => setOn((v) => !v)}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
            on ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform",
              on ? "translate-x-[18px]" : "translate-x-[2px]",
            )}
          />
        </button>
        <span
          className={cn(
            "min-w-[24px] text-[11px] font-semibold",
            on ? "text-primary" : "text-muted-foreground",
          )}
        >
          {on ? "On" : "Off"}
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 3 — Vessel Watchlist
 * -------------------------------------------------------------------------- */

/**
 * Vessel Watchlist — mirrors the prototype's TAB 3 content:
 *   1. Intro card        — title + description + Refine Criteria + Export List
 *   2. Acquisition       — chip-based criteria filter + competitor select +
 *      Criteria card        Min Match Score + Re-score Matches button
 *   3. Matched Vessels   — ranked list of competitor vessels matching
 *      table                acquisition criteria, with match-score bars
 */
type MatchTone = "high" | "mid" | "low";

type MatchedVessel = {
  name: string;
  type: string;
  built: number;
  dwt: number;
  cii: EnvScore;
  fmv: string;
  competitor: string;
  matchPct: number;
  matchTone: MatchTone;
};

const ACQUISITION_CRITERIA = [
  "Vessel Type: Bulk / Tanker",
  "Min DWT: 50,000",
  "Max Age: 12 yrs",
  "CII: A or B",
  "FMV Range: $15M–$40M",
];

const MATCHED_VESSELS: MatchedVessel[] = [
  { name: "Star Kappa",     type: "Panamax Bulk", built: 2017, dwt: 81500, cii: "A", fmv: "$29.8M", competitor: "Star Bulk",      matchPct: 94, matchTone: "high" },
  { name: "Star Lambda",    type: "Supramax",     built: 2019, dwt: 63000, cii: "A", fmv: "$26.2M", competitor: "Star Bulk",      matchPct: 88, matchTone: "high" },
  { name: "Diana Calypso",  type: "Panamax Bulk", built: 2018, dwt: 82000, cii: "B", fmv: "$28.5M", competitor: "Diana Shipping", matchPct: 82, matchTone: "mid" },
  { name: "Scorpio Taurus", type: "MR Tanker",    built: 2020, dwt: 51000, cii: "A", fmv: "$25.0M", competitor: "Scorpio",        matchPct: 77, matchTone: "mid" },
  { name: "Star Delta",     type: "Ultramax",     built: 2021, dwt: 64000, cii: "A", fmv: "$31.5M", competitor: "Star Bulk",      matchPct: 71, matchTone: "low" },
];

function WatchlistPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      {/* 1 — Intro card */}
      <Card>
        <div className="flex flex-wrap items-start gap-4 p-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold text-foreground">Vessel Watchlist</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Vessels from tracked competitor fleets that match your acquisition
              criteria. Use the filters below to adjust the criteria and re-score
              matches. Vessels are ranked by match score based on type, size, age,
              and CII alignment with your existing portfolio.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Search className="size-3.5" />
              Refine Criteria
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="size-3.5" />
              Export List
            </Button>
          </div>
        </div>
      </Card>

      {/* 2 — Acquisition Criteria */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Acquisition Criteria</CardTitle>
          <CardDescription>Active filters used to score vessel matches</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {ACQUISITION_CRITERIA.map((c) => (
              <CriteriaChip key={c} label={c} />
            ))}
            <Button size="sm" variant="ghost" className="ml-auto gap-1.5 text-[11px]">
              <Plus className="size-3" />
              Add Filter
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect label="Competitors" defaultValue="All Tracked Competitors">
              <option>All Tracked Competitors</option>
              <option>Star Bulk Carriers</option>
              <option>Scorpio Tankers</option>
              <option>Diana Shipping</option>
            </FilterSelect>
            <FilterSelect label="Min Match Score" defaultValue="> 70%">
              <option>&gt; 50%</option>
              <option>&gt; 70%</option>
              <option>&gt; 80%</option>
              <option>&gt; 90%</option>
            </FilterSelect>
            <Button size="sm" className="ml-auto">
              Re-score Matches
            </Button>
          </div>
        </div>
      </Card>

      {/* 3 — Matched Vessels */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Matched Vessels</CardTitle>
          <CardDescription>
            {MATCHED_VESSELS.length} vessels match your criteria · Sorted by match score
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Built</th>
                <th className="px-4 py-2 text-right">DWT</th>
                <th className="px-4 py-2 text-center">CII</th>
                <th className="px-4 py-2 text-right">Est. FMV</th>
                <th className="px-4 py-2 text-left">Competitor</th>
                <th className="min-w-[180px] px-4 py-2 text-left">Match Score</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MATCHED_VESSELS.map((v) => (
                <tr key={v.name} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">{v.name}</td>
                  <td className="px-4 py-2.5">{v.type}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums">{v.built}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[11px] tabular-nums">
                    {v.dwt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <EnvScoreBadge value={v.cii} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums">
                    {v.fmv}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {v.competitor}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <MatchScore pct={v.matchPct} tone={v.matchTone} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost">View</Button>
                      <Button size="sm" variant="outline">Add to Project</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CriteriaChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className="inline-flex size-3.5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-signal-magenta/12 hover:text-signal-magenta"
      >
        <X className="size-2.5" />
      </button>
    </span>
  );
}

function MatchScore({ pct, tone }: { pct: number; tone: MatchTone }) {
  const toneCls: Record<MatchTone, { text: string; bar: string }> = {
    high: { text: "text-signal-green",   bar: "bg-signal-green" },
    mid:  { text: "text-primary",        bar: "bg-primary" },
    low:  { text: "text-signal-orange",  bar: "bg-signal-orange" },
  };
  return (
    <div className="flex items-center gap-2">
      <span className={cn("min-w-[36px] text-[11px] font-bold tabular-nums", toneCls[tone].text)}>
        {pct}%
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", toneCls[tone].bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

/**
 * CompetitorChip — mirrors the prototype's `.comp-chip`:
 *   - 7px/18px padding, 12px / 600 font
 *   - default: white bg, gray border, secondary text
 *   - hover:  primary border + primary text
 *   - active: filled primary bg, white text
 */
function CompetitorChip({
  name,
  active = false,
}: {
  name: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center rounded border px-[18px] py-[7px] text-[12px] font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background text-foreground hover:border-primary hover:text-primary",
      )}
    >
      {name}
    </button>
  );
}

/**
 * CompKpiCard — mirrors the prototype's `.comp-kpi-card`:
 *   - Metric label (11px / 700 / uppercase / 0.5px tracking / muted)
 *   - "You" row: 10px label + 16px / 800 / primary value
 *   - "Comp" row: 10px label + 16px / 800 / secondary value
 *   - Unit label + colored delta pill on the bottom row
 */
function CompKpiCard({ kpi: k }: { kpi: CompKpi }) {
  return (
    <Card className="flex flex-col p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        {k.metric}
      </p>
      <div className="mt-2 flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-[28px] text-[10px] font-bold uppercase tracking-[0.3px] text-muted-foreground">
            You
          </span>
          <span className="font-display text-[16px] font-extrabold leading-tight tabular-nums text-primary">
            {k.you}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-[28px] text-[10px] font-bold uppercase tracking-[0.3px] text-muted-foreground">
            Comp
          </span>
          <span className="font-display text-[16px] font-extrabold leading-tight tabular-nums text-muted-foreground">
            {k.comp}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.3px] text-muted-foreground">
            {k.unit}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-[7px] py-0.5 text-[11px] font-bold tabular-nums",
              k.tone === "favorable" && "bg-signal-green/12 text-signal-green",
              k.tone === "unfavorable" && "bg-signal-orange/12 text-signal-orange",
              k.tone === "neutral" && "bg-muted text-muted-foreground",
            )}
          >
            {k.delta}
          </span>
        </div>
      </div>
    </Card>
  );
}

function FleetSidePanel({
  dotColor,
  title,
  bars,
  muted: _muted = false,
}: {
  dotColor: string;
  title: string;
  bars: CompBar[];
  /** Kept on the prop surface so call sites can flag a side panel as
   *  muted; the styling hook itself hasn't been wired yet. */
  muted?: boolean;
}) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
        <span className={cn("size-2 rounded-full", dotColor)} />
        <span>{title}</span>
      </p>
      <ul className="space-y-2.5">
        {bars.map((b) => (
          <li key={b.type} className="flex items-center gap-3">
            <span className="w-24 text-[11px] text-muted-foreground">{b.type}</span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn("h-full rounded-full transition-[width]", b.color)}
                style={{ width: `${Math.min(100, b.pct)}%` }}
              />
            </div>
            <span className="w-20 text-right text-[11px]">
              {b.pct > 0 ? (
                <>
                  <span className="font-bold tabular-nums">{b.pct}%</span>
                  <span className="ml-1 text-[10px] text-muted-foreground">({b.count})</span>
                </>
              ) : (
                <span className="text-muted-foreground">— ({b.count})</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Reserved for an upcoming favor-tone indicator on the panels above; the
// component is kept inline so we don't lose the styling reference.
function _ToneDot({ tone }: { tone: FavorTone }) {
  return (
    <span
      className={cn(
        "mt-1 size-2 flex-shrink-0 rounded-full",
        tone === "favorable" && "bg-signal-green",
        tone === "unfavorable" && "bg-signal-magenta",
        tone === "neutral" && "bg-muted-foreground/50",
      )}
    />
  );
}

/**
 * CiiDistRow — single fleet's CII rating distribution: name on the left,
 * badge counts in the middle, segmented bar to the right, total at the end.
 * Mirrors the prototype's `.cii-dist-row`.
 */
const CII_SEG_COLOR: Record<EnvScore, string> = {
  A: "bg-signal-green",
  B: "bg-primary",
  C: "bg-signal-orange",
  D: "bg-signal-magenta",
  E: "bg-signal-magenta/70",
};

function CiiDistRow({ row }: { row: CiiDist }) {
  const segs: { grade: EnvScore; count: number }[] = [
    { grade: "A", count: row.A },
    { grade: "B", count: row.B },
    { grade: "C", count: row.C },
    { grade: "D", count: row.D },
  ];
  return (
    <div className="grid grid-cols-1 items-center gap-3 border-b py-3 last:border-0 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
      <div className="text-[12px] font-bold text-foreground">{row.who}</div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          {segs.map((s) => (
            <div key={s.grade} className="flex items-center gap-1.5 text-[11px]">
              <EnvScoreBadge value={s.grade} />
              <span className="font-bold text-muted-foreground">×{s.count}</span>
            </div>
          ))}
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {segs.map((s) =>
            s.count > 0 ? (
              <span
                key={s.grade}
                className={cn("h-full", CII_SEG_COLOR[s.grade])}
                style={{ width: `${(s.count / row.total) * 100}%` }}
                title={`${s.grade}: ${s.count} of ${row.total}`}
              />
            ) : null,
          )}
        </div>
      </div>
      <div className="text-[11px] tabular-nums text-muted-foreground">
        {row.total} vessels
      </div>
    </div>
  );
}

function CiiLegend({ grade, label }: { grade: EnvScore; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-sm", CII_SEG_COLOR[grade])} />
      <span className="text-foreground">
        {grade}
        {label ? <span className="text-muted-foreground"> — {label}</span> : null}
      </span>
    </span>
  );
}

/**
 * AgeDistributionChart — grouped vertical bar chart with 4 buckets and
 * 2 series (You + Comp). Pure SVG, scales bars to a fixed 90px max height.
 */
function AgeDistributionChart() {
  const max = Math.max(...AGE_DIST.flatMap((b) => [b.you, b.comp]));
  const scale = 90 / max;
  const baseY = 110;
  const barWidth = 34;
  const groupWidth = 110;
  const groupOffset = 70;

  return (
    <svg
      viewBox="0 0 480 130"
      preserveAspectRatio="xMidYMid meet"
      className="block h-auto w-full"
    >
      {/* Gridlines + Y-axis labels at 0/2/4/6/8 */}
      {[0, 2, 4, 6, 8].map((tick) => {
        const y = baseY - tick * scale;
        return (
          <g key={tick}>
            <line
              x1={38}
              y1={y}
              x2={476}
              y2={y}
              stroke="currentColor"
              strokeWidth={0.7}
              className="text-border"
            />
            <text
              x={28}
              y={y + 3}
              fontSize={9}
              textAnchor="end"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {tick}
            </text>
          </g>
        );
      })}
      {/* Bars + bucket labels */}
      {AGE_DIST.map((b, i) => {
        const groupX = groupOffset + i * groupWidth;
        const youHeight = b.you * scale;
        const compHeight = b.comp * scale;
        return (
          <g key={b.bucket}>
            <rect
              x={groupX}
              y={baseY - youHeight}
              width={barWidth}
              height={youHeight}
              rx={3}
              fill="currentColor"
              className="text-primary"
            />
            <rect
              x={groupX + barWidth + 4}
              y={baseY - compHeight}
              width={barWidth}
              height={compHeight}
              rx={3}
              fill="currentColor"
              className="text-muted-foreground/40"
            />
            <text
              x={groupX + barWidth + 2}
              y={124}
              fontSize={9}
              textAnchor="middle"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {b.bucket}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
