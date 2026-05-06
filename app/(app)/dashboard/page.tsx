"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { AlertPill } from "@/components/app/alert-pill";
import { KpiCard } from "@/components/app/kpi-card";
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
 * Mock data — keyed per fleet so the dashboard updates when the user picks
 * a different fleet from the body's fleet selector. Mirrors the section
 * layout in html/dashboard.html.
 * -------------------------------------------------------------------------- */

type FleetKey = "all" | "alpha" | "beta";

const FLEET_OPTIONS: { value: FleetKey; label: string; vesselCount: number }[] = [
  { value: "all",   label: "All Fleets",  vesselCount: 14 },
  { value: "alpha", label: "Fleet Alpha", vesselCount: 8 },
  { value: "beta",  label: "Fleet Beta",  vesselCount: 6 },
];

type DashboardKpi = {
  label: string;
  value: string;
  direction: "up" | "down" | "neutral";
  change: string;
  meta: string;
  accent: "blue" | "green" | "purple" | "cyan" | "orange" | "magenta" | "yellow";
  href: string;
};

type CompositionSlice = {
  label: string;
  fmv: string;
  pct: number;
  color: string;
};

type EmploymentSlice = { label: string; count: number; color: string };

type ValuationsSummary = {
  fmv: string;
  resale: string;
  newbuild: string;
  scrap: string;
};

type FreightIndex = {
  index: string;
  value: string;
  delta: string;
  deltaTone: "green" | "magenta" | "muted";
  trendColor: string;
};

type SpRecentTxn = {
  vessel: string;
  type: VesselType;
  typeLabel: string;
  price: string;
  age: string;
};

type CiiVesselRow = {
  vessel: string;
  pct: number;
  color: string;
  grade: EnvScore;
};

type CiiSummary = {
  distribution: { grade: EnvScore; count: number; color: string }[];
  vessels: CiiVesselRow[];
  metrics: { label: string; value: string; tone: "magenta" | "green" | "orange" | "neutral" }[];
};

type AlertItem = {
  title: string;
  meta: string;
  severity: "high" | "medium" | "low";
  dotColor: string;
};

type ActivityItem = {
  title: string;
  meta: string;
  dotColor: string;
};

type FleetData = {
  alerts: { high: number; medium: number; low: number; info: number };
  kpis: DashboardKpi[];
  valuations: ValuationsSummary;
  composition: CompositionSlice[];
  employment: EmploymentSlice[];
  totalFmv: string;
  freightIndices: FreightIndex[];
  spRecent: SpRecentTxn[];
  spStats: { label: string; value: string }[];
  cii: CiiSummary;
  openAlerts: AlertItem[];
  activity: ActivityItem[];
};

/* ────────────────────────────────────────────────────────────── */

const ALL: FleetData = {
  alerts: { high: 1, medium: 2, low: 3, info: 14 },
  kpis: [
    { label: "Total Fleets",         value: "2",       direction: "neutral", change: "Active fleets",            meta: "Alpha: 8 vessels · Beta: 6 vessels",        accent: "blue",   href: "/fleetspace" },
    { label: "Total Vessels",        value: "14",      direction: "up",      change: "+2 this month",            meta: "Bulk: 7 · Tanker: 3 · Gas: 1 · Other: 3",   accent: "blue",   href: "/fleetspace" },
    { label: "Total FMV",            value: "$842.3M", direction: "up",      change: "+3.2% MoM",                meta: "NB equiv.: $1,148.0M · Scrap: $68.4M",       accent: "green",  href: "/valuations" },
    { label: "Avg. Vessel Age",      value: "8.4 yrs", direction: "neutral", change: "+0.1 yr vs last month",    meta: "Youngest: 2022 · Oldest: 2009",              accent: "purple", href: "/fleetspace" },
    { label: "Avg. CII / Env. Score", value: "B",       direction: "up",      change: "Improved from C (Q4 2025)", meta: "A: 4 · B: 6 · C: 3 · D: 1",                 accent: "green",  href: "/environmental-score" },
    { label: "Avg. LTV",             value: "50.0%",   direction: "down",    change: "−1.2 pts MoM",             meta: "Covenant max: 70% · Headroom: $169M",         accent: "cyan",   href: "/loan-oracle" },
  ],
  valuations: { fmv: "$842.3M", resale: "$819.6M", newbuild: "$1,104.5M", scrap: "$94.1M" },
  totalFmv: "$842M",
  composition: [
    { label: "Bulk Carriers", fmv: "$387M", pct: 46, color: "bg-primary" },
    { label: "Tankers",       fmv: "$227M", pct: 27, color: "bg-signal-orange" },
    { label: "Gas Carriers",  fmv: "$118M", pct: 14, color: "bg-accent" },
    { label: "Containers",    fmv: "$67M",  pct: 8,  color: "bg-signal-purple" },
    { label: "Other",         fmv: "$42M",  pct: 5,  color: "bg-muted-foreground/40" },
  ],
  employment: [
    { label: "TC: 8",       count: 8, color: "bg-primary" },
    { label: "Spot: 4",     count: 4, color: "bg-signal-green" },
    { label: "Idle: 1",     count: 1, color: "bg-muted-foreground/50" },
    { label: "Dry Dock: 1", count: 1, color: "bg-signal-orange" },
  ],
  freightIndices: [
    { index: "BDI",  value: "1,842", delta: "+4.1%", deltaTone: "green",   trendColor: "stroke-primary" },
    { index: "BDTI", value: "924",   delta: "−2.3%", deltaTone: "magenta", trendColor: "stroke-signal-orange" },
    { index: "BCTI", value: "656",   delta: "+1.8%", deltaTone: "green",   trendColor: "stroke-signal-purple" },
    { index: "SOFR", value: "4.84%", delta: "0 bps", deltaTone: "muted",   trendColor: "stroke-accent" },
  ],
  spRecent: [
    { vessel: "Pacific Orca",  type: "Bulk Carrier", typeLabel: "BULK",  price: "$32.5M",  age: "9 yrs"  },
    { vessel: "Nordic Carrier", type: "Tanker",       typeLabel: "TNKR",  price: "$48.2M",  age: "6 yrs"  },
    { vessel: "Golden Eagle",  type: "Bulk Carrier", typeLabel: "BULK",  price: "$26.8M",  age: "12 yrs" },
    { vessel: "Hellenic Star", type: "Gas Carrier",  typeLabel: "GAS",   price: "$195.0M", age: "3 yrs"  },
  ],
  spStats: [
    { label: "Avg. $/DWT (Bulk, Panamax)", value: "$348" },
    { label: "YTD S&P volume (global)",     value: "$18.4B" },
  ],
  cii: {
    distribution: [
      { grade: "A", count: 4, color: "bg-signal-green"   },
      { grade: "B", count: 6, color: "bg-primary"        },
      { grade: "C", count: 3, color: "bg-signal-yellow"  },
      { grade: "D", count: 1, color: "bg-signal-orange"  },
    ],
    vessels: [
      { vessel: "MV Pacific Star",     pct: 88, color: "bg-signal-green",  grade: "A" },
      { vessel: "MV Aegean Explorer",  pct: 72, color: "bg-primary",       grade: "B" },
      { vessel: "MT Black Sea Star",   pct: 72, color: "bg-primary",       grade: "B" },
      { vessel: "MV Coral Pioneer",    pct: 52, color: "bg-signal-yellow", grade: "C" },
      { vessel: "MV Horizon Trader",   pct: 32, color: "bg-signal-orange", grade: "D" },
    ],
    metrics: [
      { label: "1 vessel at risk (D rating)", value: "Action required",       tone: "magenta" },
      { label: "Avg. AER (attained)",         value: "8.42 gCO₂/t·nm",        tone: "neutral" },
      { label: "Avg. AER (required)",         value: "9.10 gCO₂/t·nm",        tone: "neutral" },
      { label: "IMO 2030 gap",                value: "−7.4% (ahead)",          tone: "green"   },
      { label: "EU ETS cost (est. 2026)",     value: "$1.24M",                 tone: "orange"  },
    ],
  },
  openAlerts: [
    { title: "MV Horizon Trader – LTV breach risk",       meta: "LTV 68.4% · Covenant max 70% · FMV must not fall below $18.4M", severity: "high",   dotColor: "bg-signal-magenta" },
    { title: "Loan maturity in 91 days – $38M facility",  meta: "MV Pacific Star · Matures Jun 2026 · Renewal discussions due",   severity: "medium", dotColor: "bg-signal-orange" },
    { title: "MV Horizon Trader – CII D rating",          meta: "Corrective action plan required per IMO guidelines",            severity: "medium", dotColor: "bg-signal-orange" },
    { title: "3 valuations due within 30 days",           meta: "MV Nordic Crest, MT Eastern Sun, MV Blue Horizon",              severity: "low",    dotColor: "bg-primary" },
    { title: "Insurance renewal – 2 vessels",             meta: "MV Pacific Star, MT Black Sea Star · Due Apr 15",               severity: "low",    dotColor: "bg-primary" },
  ],
  activity: [
    { title: "Valuation completed · MV Pacific Star",          meta: "FMV: $28.5M (+1.8% MoM) · Valued by Signal Ocean · 26 Mar 2026", dotColor: "bg-signal-green" },
    { title: "Loan Oracle run completed · Fleet Alpha",         meta: "IRR: 14.2% (Base) · 18.1% (Bull) · 9.8% (Bear) · 26 Mar 2026",  dotColor: "bg-primary" },
    { title: "Valuation certificate issued · MT Black Sea Star",meta: "Certificate #VC-2026-0312 · PDF generated · 25 Mar 2026",        dotColor: "bg-signal-orange" },
    { title: "S&P transaction noted · Pacific Orca",            meta: "Panamax bulk · $32.5M · Age 9 · Comparable used in valuations · 24 Mar", dotColor: "bg-signal-purple" },
    { title: "Cashflow model updated · LNG Zeus",               meta: "TC rate revised to $82,000/day · 10-yr model · 23 Mar 2026",    dotColor: "bg-accent" },
    { title: "CII improvement · MV Aegean Explorer",            meta: "Rating upgraded C → B following slow steaming plan · 22 Mar",   dotColor: "bg-signal-green" },
    { title: "Market report published · Bulk sector",           meta: "BDI up 4.1% WoW · Panamax rates firm · Q1 2026 outlook · 21 Mar",dotColor: "bg-muted-foreground" },
  ],
};

const ALPHA: FleetData = {
  ...ALL,
  alerts: { high: 1, medium: 1, low: 2, info: 8 },
  kpis: [
    { label: "Total Fleets",         value: "1",       direction: "neutral", change: "Active fleet",              meta: "Fleet Alpha · 8 vessels",                       accent: "blue",   href: "/fleetspace" },
    { label: "Total Vessels",        value: "8",       direction: "up",      change: "+1 this month",             meta: "Bulk: 4 · Tanker: 2 · Gas: 1 · Container: 1",   accent: "blue",   href: "/fleetspace" },
    { label: "Total FMV",            value: "$498.6M", direction: "up",      change: "+3.8% MoM",                 meta: "NB equiv.: $674.2M · Scrap: $40.3M",            accent: "green",  href: "/valuations" },
    { label: "Avg. Vessel Age",      value: "7.6 yrs", direction: "neutral", change: "Stable vs last month",      meta: "Youngest: 2022 · Oldest: 2014",                 accent: "purple", href: "/fleetspace" },
    { label: "Avg. CII / Env. Score", value: "A",       direction: "up",      change: "Improved from B (Q4 2025)", meta: "A: 3 · B: 4 · C: 1",                            accent: "green",  href: "/environmental-score" },
    { label: "Avg. LTV",             value: "47.8%",   direction: "down",    change: "−0.9 pts MoM",              meta: "Covenant max: 70% · Headroom: $111M",            accent: "cyan",   href: "/loan-oracle" },
  ],
  valuations: { fmv: "$498.6M", resale: "$485.4M", newbuild: "$674.2M", scrap: "$40.3M" },
  totalFmv: "$499M",
  composition: [
    { label: "Bulk Carriers", fmv: "$248M", pct: 50, color: "bg-primary" },
    { label: "Tankers",       fmv: "$132M", pct: 26, color: "bg-signal-orange" },
    { label: "Gas Carriers",  fmv: "$74M",  pct: 15, color: "bg-accent" },
    { label: "Containers",    fmv: "$45M",  pct: 9,  color: "bg-signal-purple" },
  ],
  employment: [
    { label: "TC: 5",       count: 5, color: "bg-primary" },
    { label: "Spot: 2",     count: 2, color: "bg-signal-green" },
    { label: "Dry Dock: 1", count: 1, color: "bg-signal-orange" },
  ],
  cii: {
    distribution: [
      { grade: "A", count: 3, color: "bg-signal-green"  },
      { grade: "B", count: 4, color: "bg-primary"       },
      { grade: "C", count: 1, color: "bg-signal-yellow" },
    ],
    vessels: ALL.cii.vessels.slice(0, 4),
    metrics: [
      { label: "0 vessels at risk",            value: "All ≥ B",                tone: "green"   },
      { label: "Avg. AER (attained)",          value: "7.92 gCO₂/t·nm",         tone: "neutral" },
      { label: "Avg. AER (required)",          value: "9.10 gCO₂/t·nm",         tone: "neutral" },
      { label: "IMO 2030 gap",                 value: "−12.9% (ahead)",          tone: "green"   },
      { label: "EU ETS cost (est. 2026)",      value: "$0.74M",                  tone: "orange"  },
    ],
  },
  openAlerts: ALL.openAlerts.slice(0, 4),
  activity: ALL.activity.slice(0, 5),
};

const BETA: FleetData = {
  ...ALL,
  alerts: { high: 0, medium: 1, low: 1, info: 6 },
  kpis: [
    { label: "Total Fleets",         value: "1",       direction: "neutral", change: "Active fleet",             meta: "Fleet Beta · 6 vessels",                          accent: "blue",   href: "/fleetspace" },
    { label: "Total Vessels",        value: "6",       direction: "up",      change: "+1 this month",            meta: "Bulk: 3 · Tanker: 1 · Container: 1 · Other: 1",  accent: "blue",   href: "/fleetspace" },
    { label: "Total FMV",            value: "$343.7M", direction: "up",      change: "+2.4% MoM",                meta: "NB equiv.: $473.8M · Scrap: $28.1M",              accent: "green",  href: "/valuations" },
    { label: "Avg. Vessel Age",      value: "9.5 yrs", direction: "neutral", change: "+0.2 yr vs last month",    meta: "Youngest: 2018 · Oldest: 2009",                   accent: "purple", href: "/fleetspace" },
    { label: "Avg. CII / Env. Score", value: "B",       direction: "neutral", change: "Stable vs Q4 2025",        meta: "A: 1 · B: 2 · C: 2 · D: 1",                       accent: "green",  href: "/environmental-score" },
    { label: "Avg. LTV",             value: "53.5%",   direction: "down",    change: "−1.6 pts MoM",             meta: "Covenant max: 70% · Headroom: $58M",              accent: "cyan",   href: "/loan-oracle" },
  ],
  valuations: { fmv: "$343.7M", resale: "$334.2M", newbuild: "$473.8M", scrap: "$28.1M" },
  totalFmv: "$344M",
  composition: [
    { label: "Bulk Carriers", fmv: "$139M", pct: 41, color: "bg-primary" },
    { label: "Tankers",       fmv: "$95M",  pct: 28, color: "bg-signal-orange" },
    { label: "Gas Carriers",  fmv: "$44M",  pct: 13, color: "bg-accent" },
    { label: "Containers",    fmv: "$22M",  pct: 6,  color: "bg-signal-purple" },
    { label: "Other",         fmv: "$42M",  pct: 12, color: "bg-muted-foreground/40" },
  ],
  employment: [
    { label: "TC: 3",       count: 3, color: "bg-primary" },
    { label: "Spot: 2",     count: 2, color: "bg-signal-green" },
    { label: "Idle: 1",     count: 1, color: "bg-muted-foreground/50" },
  ],
  cii: {
    distribution: [
      { grade: "A", count: 1, color: "bg-signal-green"  },
      { grade: "B", count: 2, color: "bg-primary"       },
      { grade: "C", count: 2, color: "bg-signal-yellow" },
      { grade: "D", count: 1, color: "bg-signal-orange" },
    ],
    vessels: ALL.cii.vessels.slice(2),
    metrics: ALL.cii.metrics,
  },
  openAlerts: ALL.openAlerts.filter((a) => a.severity !== "high"),
  activity: ALL.activity.slice(0, 4),
};

const DASH: Record<FleetKey, FleetData> = { all: ALL, alpha: ALPHA, beta: BETA };

/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const [fleet, setFleet] = React.useState<FleetKey>("all");
  const data = DASH[fleet];
  const fleetLabel = FLEET_OPTIONS.find((o) => o.value === fleet)?.label ?? "All Fleets";
  const subtitle = `Portfolio overview as of 27 Mar 2026 · All values in USD`;

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Dashboard" }]}
        title="Portfolio Overview"
        subtitle={subtitle}
      />

      <div className="flex flex-col gap-6 p-8">
        {/* Fleet selector + alert pills row — matches the prototype's
            `.page-body > flex` row that sits at the top of the body. */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Select Fleets
          </span>
          <select
            value={fleet}
            onChange={(e) => setFleet(e.target.value as FleetKey)}
            className="h-8 w-40 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {FLEET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {data.alerts.high > 0 ? (
              <AlertPill
                severity="high"
                label={`${data.alerts.high} High Alert${data.alerts.high === 1 ? "" : "s"}`}
              />
            ) : null}
            {data.alerts.medium > 0 ? (
              <AlertPill
                severity="medium"
                label={`${data.alerts.medium} Loan Renewal${data.alerts.medium === 1 ? "" : "s"}`}
              />
            ) : null}
            {data.alerts.low > 0 ? (
              <AlertPill
                severity="low"
                label={`${data.alerts.low} Valuations Due`}
              />
            ) : null}
            <AlertPill
              severity="info"
              label={`${data.alerts.info} Vessels Active`}
            />
          </div>
        </div>

        {/* Core KPIs */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {data.kpis.map((k) => (
            <KpiCard key={k.label} {...k} size="md" />
          ))}
        </section>

        {/* Fleet Historical Valuations + Fleet Composition */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
              <div>
                <CardTitle className="text-base">Fleet Historical Valuations</CardTitle>
                <CardDescription>
                  Portfolio valuation metrics · trailing 12 months · USD millions
                </CardDescription>
              </div>
              <div className="flex overflow-hidden rounded-md border text-[11px] font-semibold">
                <button className="bg-primary px-2.5 py-1 text-primary-foreground">12M</button>
                <button className="border-l px-2.5 py-1 text-muted-foreground hover:bg-muted">3Y</button>
                <button className="border-l px-2.5 py-1 text-muted-foreground hover:bg-muted">5Y</button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-4">
              <ChartLegend
                items={[
                  { label: "FMV",              color: "bg-primary" },
                  { label: "Resale Value",      color: "bg-signal-green" },
                  { label: "Scrap Value",       color: "bg-signal-orange" },
                  { label: "Newbuilding Value", color: "bg-signal-purple" },
                ]}
              />
              <ChartPlaceholder height="h-44" />
              <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-4">
                <SummaryStat label="FMV"              value={data.valuations.fmv}      />
                <SummaryStat label="Resale Value"      value={data.valuations.resale}   tone="green" />
                <SummaryStat label="Newbuilding Value" value={data.valuations.newbuild} tone="purple" />
                <SummaryStat label="Scrap Value"       value={data.valuations.scrap}    tone="orange" />
              </div>
            </CardContent>
            <ViewMoreFooter href="/valuations" />
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Fleet Composition</CardTitle>
              <CardDescription>By vessel type · FMV share</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-4">
              <CompositionDonut
                composition={data.composition}
                totalFmv={data.totalFmv}
              />
              <div className="mt-4">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Employment Status
                </p>
                <div className="flex h-3 overflow-hidden rounded-full">
                  {data.employment.map((e) => (
                    <div
                      key={e.label}
                      className={cn("h-full", e.color)}
                      style={{ flex: e.count }}
                      title={e.label}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  {data.employment.map((e) => (
                    <span key={e.label} className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-sm", e.color)} />
                      {e.label}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <ViewMoreFooter href="/fleetspace" />
          </Card>
        </section>

        {/* Market Pulse + Environmental Score */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Market Pulse</CardTitle>
              <CardDescription>S&amp;P activity &amp; freight indices</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-4">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Freight Indices
                  </p>
                  <ul className="space-y-2">
                    {data.freightIndices.map((f) => (
                      <li
                        key={f.index}
                        className="flex items-center gap-2 text-[12px]"
                      >
                        <span className="w-12 text-muted-foreground">{f.index}</span>
                        <Sparkline className={f.trendColor} />
                        <span className="w-14 text-right font-bold tabular-nums">
                          {f.value}
                        </span>
                        <span
                          className={cn(
                            "w-12 text-right text-[10px] font-semibold tabular-nums",
                            f.deltaTone === "green"   && "text-signal-green",
                            f.deltaTone === "magenta" && "text-signal-magenta",
                            f.deltaTone === "muted"   && "text-muted-foreground",
                          )}
                        >
                          {f.delta}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Recent S&amp;P Transactions
                  </p>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        <th className="py-1 text-left font-bold">Vessel</th>
                        <th className="py-1 text-left font-bold">Type</th>
                        <th className="py-1 text-right font-bold">Price</th>
                        <th className="py-1 text-right font-bold">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.spRecent.map((r) => (
                        <tr key={r.vessel} className="border-t">
                          <td className="py-1.5 font-semibold">{r.vessel}</td>
                          <td className="py-1.5">
                            <VesselTypeBadge value={r.type} />
                          </td>
                          <td className="py-1.5 text-right font-bold tabular-nums">
                            {r.price}
                          </td>
                          <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                            {r.age}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ul className="mt-2 space-y-1.5 border-t pt-2 text-[11px]">
                    {data.spStats.map((s) => (
                      <li
                        key={s.label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-bold tabular-nums">{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <ViewMoreFooter href="/valuations" />
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Environmental Score</CardTitle>
              <CardDescription>CII ratings &amp; carbon intensity</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-4">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    CII Rating Distribution ({data.cii.distribution.reduce((s, d) => s + d.count, 0)} vessels)
                  </p>
                  <div className="mb-2 flex h-3 overflow-hidden rounded-full">
                    {data.cii.distribution.map((d) => (
                      <div
                        key={d.grade}
                        className={cn("h-full", d.color)}
                        style={{ flex: d.count }}
                        title={`${d.grade}: ${d.count}`}
                      />
                    ))}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                    {data.cii.distribution.map((d) => (
                      <span key={d.grade} className="flex items-center gap-1">
                        <span className={cn("size-2 rounded-sm", d.color)} />
                        {d.grade}: {d.count}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-2">
                    {data.cii.vessels.map((v) => (
                      <li
                        key={v.vessel}
                        className="flex items-center justify-between gap-2 text-[11px]"
                      >
                        <span className="truncate text-muted-foreground">
                          {v.vessel}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn("h-full", v.color)}
                              style={{ width: `${v.pct}%` }}
                            />
                          </div>
                          <EnvScoreBadge value={v.grade} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2.5 text-[11px]">
                    {data.cii.metrics.map((m) => (
                      <li
                        key={m.label}
                        className="flex items-baseline justify-between gap-2"
                      >
                        <span className="text-muted-foreground">{m.label}</span>
                        <span
                          className={cn(
                            "font-bold tabular-nums",
                            m.tone === "magenta" && "text-signal-magenta",
                            m.tone === "green"   && "text-signal-green",
                            m.tone === "orange"  && "text-signal-orange",
                            m.tone === "neutral" && "text-foreground",
                          )}
                        >
                          {m.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <ViewMoreFooter href="/environmental-score" />
          </Card>
        </section>

        {/* Open Alerts + Recent Activity */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
              <div>
                <CardTitle className="text-base">Open Alerts</CardTitle>
                <CardDescription>
                  Requires attention · {data.openAlerts.length} open
                </CardDescription>
              </div>
              <Link
                href="/alerts"
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                View all →
              </Link>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-0 pt-0">
              <ul>
                {data.openAlerts.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 border-b px-4 py-3 last:border-0"
                  >
                    <span className={cn("mt-1.5 size-2 flex-shrink-0 rounded-full", a.dotColor)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold leading-snug">{a.title}</p>
                      <span
                        className={cn(
                          "mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                          a.severity === "high"   && "bg-signal-magenta/15 text-signal-magenta",
                          a.severity === "medium" && "bg-signal-orange/15 text-signal-orange",
                          a.severity === "low"    && "bg-primary/10 text-primary",
                        )}
                      >
                        {a.severity}
                      </span>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{a.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <ViewMoreFooter href="/alerts" />
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest events across your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-0 pt-0">
              <ul>
                {data.activity.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 border-b px-4 py-3 last:border-0"
                  >
                    <span className={cn("mt-1.5 size-2 flex-shrink-0 rounded-full", item.dotColor)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold leading-snug">{item.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{item.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <ViewMoreFooter href="/alerts" />
          </Card>
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function ChartLegend({
  items,
}: {
  items: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className={cn("h-1 w-5 rounded", it.color)} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function ChartPlaceholder({ height = "h-56" }: { height?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-dashed bg-muted/40",
        height,
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
        Chart placeholder · charting library wired in next sprint
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "purple" | "orange";
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[14px] font-bold tabular-nums",
          tone === "green"   && "text-signal-green",
          tone === "purple"  && "text-signal-purple",
          tone === "orange"  && "text-signal-orange",
          tone === "neutral" && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CompositionDonut({
  composition,
  totalFmv,
}: {
  composition: CompositionSlice[];
  totalFmv: string;
}) {
  // Render a conic-gradient donut keyed off the percentage values, with the
  // legend on the right (mirrors the prototype's `.donut-wrap`).
  let cumulative = 0;
  const stops: string[] = [];
  composition.forEach((c) => {
    const start = cumulative;
    cumulative += c.pct;
    stops.push(`var(--seg-${c.label.replace(/\s+/g, "-").toLowerCase()}, currentColor) ${start}% ${cumulative}%`);
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-[120px] flex-shrink-0">
        <div className="absolute inset-0 rounded-full bg-muted" />
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <DonutSegments composition={composition} />
        </div>
        <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-[14px] font-extrabold tabular-nums">{totalFmv}</span>
          <span className="text-[9px] text-muted-foreground">Total FMV</span>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {composition.map((c) => (
          <li
            key={c.label}
            className="flex items-center gap-2 text-[11px]"
          >
            <span className={cn("size-2.5 rounded-sm", c.color)} />
            <span className="flex-1 truncate text-muted-foreground">{c.label}</span>
            <span className="font-bold tabular-nums">{c.fmv}</span>
            <span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
              {c.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DonutSegments({ composition }: { composition: CompositionSlice[] }) {
  // Pure CSS donut using a conic-gradient. Map each Tailwind color class
  // back to a CSS variable through a small style block.
  const total = composition.reduce((s, c) => s + c.pct, 0);
  let acc = 0;
  const colorMap: Record<string, string> = {
    "bg-primary":              "hsl(var(--primary))",
    "bg-signal-green":         "hsl(var(--signal-green))",
    "bg-signal-orange":        "hsl(var(--signal-orange))",
    "bg-signal-purple":        "hsl(var(--signal-purple))",
    "bg-signal-yellow":        "hsl(var(--signal-yellow))",
    "bg-accent":               "hsl(var(--accent))",
    "bg-muted-foreground/40":  "hsl(var(--muted-foreground) / 0.4)",
  };
  const stops = composition.map((c) => {
    const start = (acc / total) * 100;
    acc += c.pct;
    const end = (acc / total) * 100;
    return `${colorMap[c.color] ?? "currentColor"} ${start}% ${end}%`;
  });
  return (
    <div
      className="size-full rounded-full"
      style={{ background: `conic-gradient(${stops.join(", ")})` }}
    />
  );
}

function Sparkline({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 80 24"
      preserveAspectRatio="none"
      className="h-6 flex-1"
    >
      <polyline
        points="0,18 10,14 20,16 30,10 40,8 50,6 60,4 70,7 80,5"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      />
    </svg>
  );
}

/**
 * ViewMoreFooter — bottom CTA strip mirroring the prototype's `.card-view-more`:
 *   - gray-bg footer with top border, bottom-rounded corners
 *   - left-aligned blue filled button (not a plain link)
 *   - 11px / 600 / white text + small right chevron
 */
function ViewMoreFooter({ href }: { href: string }) {
  return (
    <div className="flex items-center justify-start rounded-b-md border-t bg-muted/40 px-4 py-1.5">
      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded bg-primary px-3 py-[5px] text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        View more <ChevronRight className="size-3" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
