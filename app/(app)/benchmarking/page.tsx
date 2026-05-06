"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Equal,
  RefreshCcw,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EnvScoreBadge,
  type EnvScore,
} from "@/components/app/env-score-badge";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — mirrors html/benchmarking.html
 * -------------------------------------------------------------------------- */

type Direction = "better" | "worse" | "equal";

/* ── Tab 1 · Fleet vs Fleet ──────────────────────────────────────── */

type BenchKpi = {
  label: string;
  a: string;
  b: string;
  delta: string;
  direction: Direction;
};

const FLEET_KPIS: BenchKpi[] = [
  { label: "Avg. FMV / Vessel", a: "$22.3M",  b: "$22.3M",  delta: "= Equal",        direction: "equal" },
  { label: "Avg. Vessel Age",    a: "8.4 yrs", b: "7.6 yrs", delta: "+0.8y older",   direction: "worse" },
  { label: "Avg. CII Score",     a: "B",        b: "A",       delta: "1 grade worse", direction: "worse" },
  { label: "Avg. LTV",           a: "50.0%",    b: "47.8%",   delta: "+2.2pp higher", direction: "worse" },
];

type CompareBar = {
  label: string;
  aLabel: string;
  aPct: number;
  aTone: "primary" | "orange";
  bLabel: string;
  bPct: number;
  bTone: "green" | "primary" | "orange";
};

const COMPARE_BARS: CompareBar[] = [
  { label: "FMV per Vessel",  aLabel: "$22.3M",  aPct: 59, aTone: "primary", bLabel: "$22.3M",  bPct: 59, bTone: "green" },
  { label: "Avg. DWT",        aLabel: "60,143",  aPct: 60, aTone: "primary", bLabel: "72,023",  bPct: 72, bTone: "green" },
  { label: "Avg. Age (yrs)",  aLabel: "8.4 yrs", aPct: 56, aTone: "primary", bLabel: "7.6 yrs", bPct: 51, bTone: "green" },
  { label: "Avg. LTV",        aLabel: "50.0%",   aPct: 50, aTone: "orange",  bLabel: "47.8%",   bPct: 48, bTone: "orange" },
  { label: "Avg. DSCR",       aLabel: "1.71×",   aPct: 65, aTone: "primary", bLabel: "1.94×",   bPct: 74, bTone: "green" },
  { label: "Avg. TC Rate",    aLabel: "$18,400", aPct: 46, aTone: "primary", bLabel: "$18,400", bPct: 46, bTone: "green" },
  { label: "CO₂ Intensity",   aLabel: "8.42 g/t",aPct: 58, aTone: "primary", bLabel: "7.90 g/t",bPct: 52, bTone: "green" },
];

type ScorecardRow = {
  metric: string;
  winner: "tie" | "a" | "b";
};

const SCORECARD: ScorecardRow[] = [
  { metric: "FMV / Vessel",   winner: "tie" },
  { metric: "Avg. DWT",       winner: "b" },
  { metric: "Vessel Age",     winner: "b" },
  { metric: "Avg. LTV",       winner: "b" },
  { metric: "DSCR",           winner: "b" },
  { metric: "TC Rate",        winner: "tie" },
  { metric: "CII Rating",     winner: "b" },
  { metric: "CO₂ Intensity",  winner: "b" },
];

type CiiBucket = { grade: EnvScore; count: number };
const CII_DISTRIBUTION_A: CiiBucket[] = [
  { grade: "A", count: 4 },
  { grade: "B", count: 6 },
  { grade: "C", count: 3 },
  { grade: "D", count: 1 },
];
const CII_DISTRIBUTION_B: CiiBucket[] = [
  { grade: "A", count: 3 },
  { grade: "B", count: 4 },
  { grade: "C", count: 1 },
];

type FleetVesselRow = {
  name: string;
  fleet: "Alpha" | "Beta";
  type: VesselType;
  typeLabel: string;
  year: number;
  dwt: number;
  fmv: string;
  ltv: string;
  ltvTone: "green" | "orange";
  cii: EnvScore;
  tcRate: string;
  tcRateTone?: "muted";
};

const FLEET_VESSELS: FleetVesselRow[] = [
  { name: "MT Helios Trader",   fleet: "Alpha", type: "Tanker",       typeLabel: "TANKER", year: 2014, dwt: 158400, fmv: "$62.0M", ltv: "58%", ltvTone: "orange", cii: "B", tcRate: "$38,000" },
  { name: "MV Cape Fortuna",    fleet: "Alpha", type: "Bulk Carrier", typeLabel: "BULK",   year: 2019, dwt: 181000, fmv: "$54.2M", ltv: "34%", ltvTone: "green",  cii: "A", tcRate: "$21,200" },
  { name: "MV Global Pioneer",  fleet: "Alpha", type: "Bulk Carrier", typeLabel: "BULK",   year: 2017, dwt: 184000, fmv: "$48.5M", ltv: "38%", ltvTone: "green",  cii: "B", tcRate: "$20,100" },
  { name: "MT Nordic Eagle",    fleet: "Alpha", type: "Tanker",       typeLabel: "TANKER", year: 2008, dwt: 299990, fmv: "$38.0M", ltv: "53%", ltvTone: "orange", cii: "D", tcRate: "Idle",      tcRateTone: "muted" },
  { name: "MV Atlantic Star",   fleet: "Alpha", type: "Bulk Carrier", typeLabel: "BULK",   year: 2018, dwt: 82500,  fmv: "$32.1M", ltv: "45%", ltvTone: "green",  cii: "A", tcRate: "$18,700" },
  { name: "MT Aegean Spirit",   fleet: "Alpha", type: "Tanker",       typeLabel: "TANKER", year: 2012, dwt: 115000, fmv: "$32.0M", ltv: "41%", ltvTone: "green",  cii: "B", tcRate: "$29,500" },
  { name: "MV Pacific Star",    fleet: "Alpha", type: "Bulk Carrier", typeLabel: "BULK",   year: 2016, dwt: 82000,  fmv: "$28.5M", ltv: "65%", ltvTone: "orange", cii: "A", tcRate: "$17,500" },
  { name: "MV Baltic Crown",    fleet: "Alpha", type: "Bulk Carrier", typeLabel: "BULK",   year: 2010, dwt: 55700,  fmv: "$16.8M", ltv: "58%", ltvTone: "orange", cii: "C", tcRate: "Spot",      tcRateTone: "muted" },
];

/* ── Tab 2 · Fleet vs Market ─────────────────────────────────────── */

const MARKET_KPIS: BenchKpi[] = [
  { label: "FMV / Newbuild",    a: "64%",     b: "58%",      delta: "+6pp ahead",     direction: "better" },
  { label: "Avg. Vessel Age",   a: "8.4 yrs", b: "9.8 yrs",  delta: "−1.4y younger",  direction: "better" },
  { label: "Avg. TC Rate",      a: "$18,400", b: "$17,300",  delta: "+6.4% above",    direction: "better" },
  { label: "CII Score",         a: "B",        b: "C",        delta: "1 grade better", direction: "better" },
];

type MarketRow = {
  metric: string;
  fleet: string;
  market: string;
  delta: string;
  deltaTone: "green" | "magenta";
  assessment: string;
  assessmentTone: "green" | "orange";
};

const MARKET_TABLE: MarketRow[] = [
  { metric: "Avg FMV per vessel",  fleet: "$22.3M",  market: "$23.1M",  delta: "−3.5%",  deltaTone: "green",   assessment: "Below avg",       assessmentTone: "orange" },
  { metric: "Avg DWT per vessel",  fleet: "60,143",  market: "58,200",  delta: "+3.3%",  deltaTone: "green",   assessment: "Above avg",       assessmentTone: "green"  },
  { metric: "Avg vessel age",       fleet: "8.4 yrs", market: "9.8 yrs", delta: "−1.4y",  deltaTone: "green",   assessment: "Younger fleet",   assessmentTone: "green"  },
  { metric: "FMV / Newbuild ratio", fleet: "64%",     market: "58%",     delta: "+6pp",   deltaTone: "green",   assessment: "Above avg",       assessmentTone: "green"  },
  { metric: "Avg TC rate ($/day)",  fleet: "$18,400", market: "$17,300", delta: "+6.4%",  deltaTone: "green",   assessment: "Above avg",       assessmentTone: "green"  },
  { metric: "Env. Score (CII avg)", fleet: "B",        market: "C",        delta: "Better", deltaTone: "green",   assessment: "Outperforming",   assessmentTone: "green"  },
  { metric: "LTV ratio",            fleet: "50.0%",   market: "48.5%",   delta: "+1.5pp", deltaTone: "magenta", assessment: "Slightly above",  assessmentTone: "orange" },
  { metric: "Avg DSCR",             fleet: "1.71×",   market: "1.65×",   delta: "+0.06×", deltaTone: "green",   assessment: "Above avg",       assessmentTone: "green"  },
];

/* ── Tab 3 · Vessel Deep-dive ────────────────────────────────────── */

type DeepDiveBar = {
  label: string;
  vesselLabel: string;
  vesselPct: number;
  peerLabel: string;
  peerPct: number;
};

const DEEP_DIVE_BARS: DeepDiveBar[] = [
  { label: "FMV ($M)",        vesselLabel: "$28.5M",  vesselPct: 75, peerLabel: "$25.9M", peerPct: 68 },
  { label: "TC Rate ($/day)", vesselLabel: "$17,500", vesselPct: 68, peerLabel: "$16,800",peerPct: 63 },
  { label: "OPEX ($/day)",    vesselLabel: "$6,200",  vesselPct: 52, peerLabel: "$6,500", peerPct: 56 },
  { label: "CO₂ (g/t·nm)",    vesselLabel: "7.20",    vesselPct: 45, peerLabel: "9.40",   peerPct: 60 },
];

type CompSale = {
  vessel: string;
  age: string;
  dwt: string;
  price: string;
  perDwt: string;
  perDwtTone: "green" | "magenta";
};

const COMP_SALES: CompSale[] = [
  { vessel: "Pacific Orca",  age: "9 yrs",  dwt: "82,100", price: "$32.5M", perDwt: "$396", perDwtTone: "green"   },
  { vessel: "Nordic Wave",   age: "11 yrs", dwt: "81,400", price: "$26.2M", perDwt: "$322", perDwtTone: "magenta" },
  { vessel: "Baltic Hero",   age: "10 yrs", dwt: "83,200", price: "$27.8M", perDwt: "$334", perDwtTone: "magenta" },
  { vessel: "Star Harmony",  age: "8 yrs",  dwt: "82,500", price: "$31.0M", perDwt: "$376", perDwtTone: "green"   },
  { vessel: "Ocean Atlas",   age: "10 yrs", dwt: "80,900", price: "$28.8M", perDwt: "$356", perDwtTone: "magenta" },
];

/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "fleet-fleet",  label: "Fleet vs Fleet" },
  { id: "fleet-market", label: "Fleet vs Market" },
  { id: "vessel-deep",  label: "Vessel Deep-dive" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BenchmarkingPage() {
  const [active, setActive] = React.useState<TabId>("fleet-fleet");

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Finance Toolkit" }, { label: "Benchmarking" }]}
        title="Benchmarking"
        subtitle="Compare your fleet or individual vessels against peers, market averages, and other fleets"
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
            <Button className="gap-2">
              <RefreshCcw className="size-3.5" />
              Run Benchmark
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex items-end gap-0 overflow-x-auto border-b bg-card px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            aria-selected={active === t.id}
            role="tab"
            className={cn(
              "whitespace-nowrap border-b-2 px-5 py-2.5 text-[12px] font-semibold transition-colors",
              active === t.id
                ? "border-primary text-primary"
                : "border-transparent text-[#A0ABB2] hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 p-8">
        {active === "fleet-fleet"  ? <FleetVsFleetPanel  /> : null}
        {active === "fleet-market" ? <FleetVsMarketPanel /> : null}
        {active === "vessel-deep"  ? <VesselDeepDivePanel /> : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — Fleet vs Fleet
 * -------------------------------------------------------------------------- */

function FleetVsFleetPanel() {
  return (
    <>
      {/* Selector bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            My Fleet
          </span>
          <select className="h-9 min-w-[160px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Fleets (14)</option>
            <option>Fleet Alpha (8)</option>
            <option>Fleet Beta (6)</option>
          </select>
          <VsBadge />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Compare Against
          </span>
          <select
            defaultValue="alpha"
            className="h-9 min-w-[200px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="market">Market Average (Global)</option>
            <option value="alpha">Fleet Alpha</option>
            <option value="beta">Fleet Beta</option>
            <option>Peer Group — Bulk Carriers</option>
            <option>Peer Group — Tankers</option>
            <option>Industry Top 10 Owners</option>
          </select>
          <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Metric Set
          </span>
          <select className="h-9 min-w-[160px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Metrics</option>
            <option>Financial Only</option>
            <option>Valuation Only</option>
            <option>Environmental Only</option>
            <option>Operational Only</option>
          </select>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <span className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="size-2.5 rounded-full bg-primary" />
          All Fleets
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="size-2.5 rounded-full bg-signal-green" />
          Fleet Alpha
        </span>
        <span className="text-[11px] text-muted-foreground">
          Showing 14 vs 8 vessels · Data as of 27 Mar 2026
        </span>
      </div>

      {/* KPI tiles */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FLEET_KPIS.map((k) => (
          <BenchKpiCard key={k.label} kpi={k} />
        ))}
      </section>

      {/* 2-1 split: comparison bars + scorecard/CII */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
            <div>
              <CardTitle className="text-base">Metric-by-Metric Comparison</CardTitle>
              <CardDescription>
                Side-by-side bar comparison across key performance indicators
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                All Fleets
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-signal-green" />
                Fleet Alpha
              </span>
            </div>
          </CardHeader>
          <ul className="divide-y">
            {COMPARE_BARS.map((m) => (
              <li key={m.label} className="px-4 py-3">
                <p className="mb-2 text-[12px] font-semibold">{m.label}</p>
                <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-muted-foreground">All Fleets</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          m.aTone === "primary" && "bg-primary",
                          m.aTone === "orange" && "bg-signal-orange",
                        )}
                        style={{ width: `${m.aPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold tabular-nums">
                    {m.aLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-muted-foreground">Fleet Alpha</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          m.bTone === "green" && "bg-signal-green",
                          m.bTone === "primary" && "bg-primary",
                          m.bTone === "orange" && "bg-signal-orange/70",
                        )}
                        style={{ width: `${m.bPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold tabular-nums">
                    {m.bLabel}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Scorecard</CardTitle>
              <CardDescription>Fleet A vs Fleet B</CardDescription>
            </CardHeader>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Metric</th>
                  <th className="px-4 py-2 text-center">Winner</th>
                </tr>
              </thead>
              <tbody>
                {SCORECARD.map((row) => (
                  <tr
                    key={row.metric}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2 text-muted-foreground">
                      {row.metric}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <ScorecardWinner winner={row.winner} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="m-3 rounded-md border border-signal-green/20 bg-signal-green/5 px-3 py-2 text-center text-[12px] font-bold text-signal-green">
              Fleet Alpha leads in 6 of 8 metrics
            </div>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">CII Distribution</CardTitle>
              <CardDescription>Rating spread comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-3 text-[12px]">
              <CiiBars label="All Fleets" buckets={CII_DISTRIBUTION_A} />
              <CiiBars label="Fleet Alpha" buckets={CII_DISTRIBUTION_B} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Vessel-Level Detail table */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-base">Vessel-Level Detail</CardTitle>
            <CardDescription>
              All vessels across selected fleets ranked by FMV
            </CardDescription>
          </div>
          <select className="h-8 rounded-md border border-input bg-background px-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Sort: FMV ↓</option>
            <option>Sort: Age ↑</option>
            <option>Sort: DWT ↓</option>
            <option>Sort: CII</option>
          </select>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-left">Fleet</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Year</th>
                <th className="px-3 py-2 text-right">DWT</th>
                <th className="px-3 py-2 text-right">FMV</th>
                <th className="px-3 py-2 text-right">LTV</th>
                <th className="px-3 py-2 text-center">CII</th>
                <th className="px-3 py-2 text-right">TC Rate / Day</th>
              </tr>
            </thead>
            <tbody>
              {FLEET_VESSELS.map((v) => (
                <tr
                  key={v.name}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <Link
                      href={`/vessel-search?q=${encodeURIComponent(v.name)}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {v.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold">
                      <span className="size-2 rounded-full bg-primary" />
                      {v.fleet}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <VesselTypeBadge value={v.type} />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {v.year}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                    {v.dwt.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                    {v.fmv}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right tabular-nums",
                      v.ltvTone === "green" && "text-signal-green",
                      v.ltvTone === "orange" && "text-signal-orange",
                    )}
                  >
                    {v.ltv}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <EnvScoreBadge value={v.cii} />
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-bold tabular-nums",
                      v.tcRateTone === "muted" && "font-normal text-muted-foreground",
                    )}
                  >
                    {v.tcRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 2 — Fleet vs Market
 * -------------------------------------------------------------------------- */

function FleetVsMarketPanel() {
  return (
    <>
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            My Fleet
          </span>
          <select className="h-9 min-w-[160px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Fleets (14)</option>
            <option>Fleet Alpha (8)</option>
            <option>Fleet Beta (6)</option>
          </select>
          <VsBadge />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Market Segment
          </span>
          <select className="h-9 min-w-[200px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Global Market Average</option>
            <option>Bulk Carriers — Panamax</option>
            <option>Bulk Carriers — Capesize</option>
            <option>Tankers — Aframax</option>
            <option>Tankers — VLCC</option>
            <option>Top 20 Greek Owners</option>
          </select>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MARKET_KPIS.map((k) => (
          <BenchKpiCard key={k.label} kpi={k} />
        ))}
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Fleet vs Market KPIs</CardTitle>
          <CardDescription>
            Your fleet performance against global peer averages
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Metric</th>
                <th className="px-3 py-2 text-right">Your Fleet</th>
                <th className="px-3 py-2 text-right">Market Avg</th>
                <th className="px-3 py-2 text-right">Δ vs Market</th>
                <th className="px-3 py-2 text-left">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {MARKET_TABLE.map((r) => (
                <tr
                  key={r.metric}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2.5 text-muted-foreground">{r.metric}</td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                    {r.fleet}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {r.market}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-bold tabular-nums",
                      r.deltaTone === "green" && "text-signal-green",
                      r.deltaTone === "magenta" && "text-signal-magenta",
                    )}
                  >
                    {r.delta}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                        r.assessmentTone === "green"  && "bg-signal-green/15 text-signal-green",
                        r.assessmentTone === "orange" && "bg-signal-orange/15 text-signal-orange",
                      )}
                    >
                      {r.assessment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 3 — Vessel Deep-dive
 * -------------------------------------------------------------------------- */

function VesselDeepDivePanel() {
  return (
    <>
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Select Vessel
          </span>
          <select className="h-9 min-w-[260px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>MV Pacific Star — Panamax Bulk (2016)</option>
            <option>MT Helios Trader — Suezmax Tanker (2014)</option>
            <option>MV Cape Fortuna — Capesize Bulk (2019)</option>
            <option>MT Nordic Eagle — VLCC Tanker (2008)</option>
            <option>MV Atlantic Star — Handymax Bulk (2018)</option>
          </select>
          <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            Benchmark
          </span>
          <select className="h-9 min-w-[200px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Peer Vessels (same type/age)</option>
            <option>Global Panamax Avg</option>
            <option>Top 10 Similar Sales</option>
          </select>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">MV Pacific Star vs Peers</CardTitle>
            <CardDescription>
              Panamax Bulk Carriers, 8–12 years old
            </CardDescription>
          </CardHeader>
          <ul className="divide-y">
            {DEEP_DIVE_BARS.map((m) => (
              <li key={m.label} className="px-4 py-3">
                <p className="mb-2 text-[12px] font-semibold">{m.label}</p>
                <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-muted-foreground">MV Pacific Star</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${m.vesselPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold tabular-nums">
                    {m.vesselLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-muted-foreground">Peer Avg</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-muted-foreground/50"
                        style={{ width: `${m.peerPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold tabular-nums text-muted-foreground">
                    {m.peerLabel}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Recent Comparable Sales</CardTitle>
            <CardDescription>
              Panamax Bulk Carriers, ±2 years age
            </CardDescription>
          </CardHeader>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-right">Age</th>
                <th className="px-3 py-2 text-right">DWT</th>
                <th className="px-3 py-2 text-right">Sale Price</th>
                <th className="px-3 py-2 text-right">$/DWT</th>
              </tr>
            </thead>
            <tbody>
              {COMP_SALES.map((s) => (
                <tr key={s.vessel} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-bold">{s.vessel}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {s.age}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {s.dwt}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                    {s.price}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-bold tabular-nums",
                      s.perDwtTone === "green" && "text-signal-green",
                      s.perDwtTone === "magenta" && "text-signal-magenta",
                    )}
                  >
                    {s.perDwt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t px-4 py-3 text-[11px] text-muted-foreground">
            MV Pacific Star FMV of{" "}
            <strong className="text-foreground">$28.5M</strong> is{" "}
            <strong className="text-signal-green">+10%</strong> above the
            comparable sales average of $25.9M
          </p>
        </Card>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function VsBadge() {
  return (
    <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-[10px] font-extrabold text-muted-foreground">
      VS
    </span>
  );
}

function BenchKpiCard({ kpi }: { kpi: BenchKpi }) {
  return (
    <div className="flex flex-col rounded-md border bg-card p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {kpi.label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[18px] font-extrabold tabular-nums text-primary">
          {kpi.a}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">vs</span>
        <span className="text-[16px] font-extrabold tabular-nums text-muted-foreground">
          {kpi.b}
        </span>
      </div>
      <div className="mt-2">
        <DeltaIndicator direction={kpi.direction} delta={kpi.delta} />
      </div>
    </div>
  );
}

function DeltaIndicator({
  direction,
  delta,
}: {
  direction: Direction;
  delta: string;
}) {
  const Icon =
    direction === "better" ? ArrowUp : direction === "worse" ? ArrowDown : Equal;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        direction === "better" && "bg-signal-green/10 text-signal-green",
        direction === "worse" && "bg-signal-magenta/10 text-signal-magenta",
        direction === "equal" && "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-2.5" />
      {delta}
    </span>
  );
}

function ScorecardWinner({ winner }: { winner: "tie" | "a" | "b" }) {
  if (winner === "tie") {
    return (
      <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
        Tie
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-signal-green">
      <span className="size-2 rounded-full bg-signal-green" />
      Fleet {winner === "a" ? "A" : "Alpha"}
    </span>
  );
}

function CiiBars({
  label,
  buckets,
}: {
  label: string;
  buckets: CiiBucket[];
}) {
  const GRADE_COLOR: Record<EnvScore, string> = {
    A: "bg-signal-green",
    B: "bg-primary",
    C: "bg-signal-yellow",
    D: "bg-signal-orange",
    E: "bg-signal-magenta",
  };

  return (
    <div>
      <p className="mb-1.5 text-[11px] text-muted-foreground">{label}</p>
      <div className="flex h-3 overflow-hidden rounded-md">
        {buckets.map((b) => (
          <div
            key={b.grade}
            className={cn("h-full", GRADE_COLOR[b.grade])}
            style={{ flex: b.count }}
            title={`${b.grade}: ${b.count}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {buckets.map((b) => (
          <span key={b.grade} className="flex items-center gap-1">
            <span className={cn("size-2 rounded-sm", GRADE_COLOR[b.grade])} />
            {b.grade}:{b.count}
          </span>
        ))}
      </div>
    </div>
  );
}
