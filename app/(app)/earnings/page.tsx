"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Construction,
  Download,
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
import { KpiCard } from "@/components/app/kpi-card";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — mirrors html/earnings.html.
 * -------------------------------------------------------------------------- */

/* ── Tab 1 · Overview ────────────────────────────────────────────── */

type CoverageRow = {
  vessel: string;
  count: number;
  onPct: number;
  spotPct: number;
  revenue: string;
  barColor: string;
};

const COVERAGE_BY_VESSEL: CoverageRow[] = [
  { vessel: "Panamax Bulk", count: 7, onPct: 71,  spotPct: 29, revenue: "$28.4M", barColor: "bg-primary" },
  { vessel: "Suezmax",      count: 2, onPct: 50,  spotPct: 50, revenue: "$12.8M", barColor: "bg-signal-orange" },
  { vessel: "Aframax",      count: 1, onPct: 40,  spotPct: 60, revenue: "$5.2M",  barColor: "bg-signal-purple" },
  { vessel: "LNG TFDE",     count: 1, onPct: 100, spotPct: 0,  revenue: "$29.9M", barColor: "bg-signal-green" },
  { vessel: "Container",    count: 1, onPct: 0,   spotPct: 80, revenue: "—",      barColor: "bg-signal-magenta" },
];

const COVERAGE_DONUT = [
  { label: "Time Charter",   pct: 57, color: "bg-primary" },
  { label: "Spot / Voyage",  pct: 30, color: "bg-signal-green" },
  { label: "Idle / Drydock", pct: 13, color: "bg-muted-foreground/40" },
];

type SpotRate = {
  index: string;
  meta: string;
  value: string;
  delta: string;
  up: boolean;
};

const SPOT_RATES: SpotRate[] = [
  { index: "BDI (Composite)",  meta: "Baltic Dry Index",         value: "1,842",   delta: "+4.1%", up: true  },
  { index: "Panamax (P2A)",    meta: "82k DWT · TransAtlantic RV", value: "$18,200", delta: "+3.2%", up: true  },
  { index: "Kamsarmax (P3A)",  meta: "82k DWT · Pacific RV",       value: "$20,100", delta: "+2.8%", up: true  },
  { index: "Suezmax (TD6)",    meta: "Black Sea → Med",            value: "$28,400", delta: "−1.2%", up: false },
  { index: "Aframax (TD19)",   meta: "Cross-Med",                  value: "$22,600", delta: "+0.6%", up: true  },
];

/* ── Tab 2 · Historical Rates ────────────────────────────────────── */

type AnnualRow = {
  year: string;
  panamax: string;     panamaxTone: "up" | "down" | null;
  kamsarmax: string;   kamsarmaxTone: "up" | "down" | null;
  capesize: string;    capesizeTone: "up" | "down" | null;
  suezmax: string;     suezmaxTone: "up" | "down" | null;
  aframax: string;     aframaxTone: "up" | "down" | null;
  lng: string;         lngTone: "up" | "down" | null;
  bdi: string;         bdiTone: "up" | "down" | null;
  highlight?: boolean;
};

const ANNUAL_RATES: AnnualRow[] = [
  { year: "2021",     panamax: "$24,100", panamaxTone: null,  kamsarmax: "$25,800", kamsarmaxTone: null,   capesize: "$28,400", capesizeTone: null,   suezmax: "$22,600", suezmaxTone: "up",   aframax: "$17,800", aframaxTone: null,   lng: "$55,000",      lngTone: null,   bdi: "2,244", bdiTone: null   },
  { year: "2022",     panamax: "$17,200", panamaxTone: "down", kamsarmax: "$18,400", kamsarmaxTone: "down", capesize: "$15,100", capesizeTone: "down", suezmax: "$31,400", suezmaxTone: "up",   aframax: "$29,200", aframaxTone: "up",   lng: "$79,000",      lngTone: "up",   bdi: "1,872", bdiTone: "down" },
  { year: "2023",     panamax: "$12,400", panamaxTone: "down", kamsarmax: "$13,200", kamsarmaxTone: "down", capesize: "$9,800",  capesizeTone: "down", suezmax: "$21,800", suezmaxTone: null,   aframax: "$18,400", aframaxTone: "down", lng: "$52,000",      lngTone: "down", bdi: "1,314", bdiTone: "down" },
  { year: "2024",     panamax: "$15,800", panamaxTone: "up",   kamsarmax: "$16,900", kamsarmaxTone: "up",   capesize: "$14,200", capesizeTone: "up",   suezmax: "$26,400", suezmaxTone: "up",   aframax: "$21,200", aframaxTone: "up",   lng: "$72,000",      lngTone: null,   bdi: "1,642", bdiTone: "up"   },
  { year: "2025",     panamax: "$17,100", panamaxTone: "up",   kamsarmax: "$18,400", kamsarmaxTone: "up",   capesize: "$16,800", capesizeTone: "up",   suezmax: "$27,800", suezmaxTone: "up",   aframax: "$22,100", aframaxTone: "up",   lng: "$75,000",      lngTone: null,   bdi: "1,786", bdiTone: "up"   },
  { year: "2026 YTD", panamax: "$18,200", panamaxTone: "up",   kamsarmax: "$20,100", kamsarmaxTone: "up",   capesize: "$18,400", capesizeTone: "up",   suezmax: "$28,400", suezmaxTone: "up",   aframax: "$22,600", aframaxTone: "up",   lng: "$82,000 TC",   lngTone: null,   bdi: "1,842", bdiTone: "up", highlight: true },
];

const RATE_CONTEXT = [
  { key: "Current vs 5Y avg (Panamax)", value: "+23%",                tone: "green"   as const },
  { key: "Current vs 5Y avg (Suezmax)", value: "+45%",                tone: "green"   as const },
  { key: "Panamax — 5Y high",            value: "$57,600 (Oct 21)",    tone: "neutral" as const },
  { key: "Panamax — 5Y low",             value: "$9,200 (Apr 23)",     tone: "magenta" as const },
  { key: "Suezmax — 5Y high",            value: "$68,400 (Oct 22)",    tone: "neutral" as const },
  { key: "Suezmax — 5Y low",             value: "$8,100 (Jan 21)",     tone: "magenta" as const },
  { key: "BDI — 5Y high",                value: "5,650 (Oct 21)",      tone: "neutral" as const },
  { key: "BDI — 5Y low",                 value: "1,128 (Sep 23)",      tone: "magenta" as const },
];

const SEASONALITY = [
  { month: "J", value: "$16k", pct: 50    },
  { month: "F", value: "$14k", pct: 33.3  },
  { month: "M", value: "$15k", pct: 41.7  },
  { month: "A", value: "$13k", pct: 25    },
  { month: "M", value: "$12k", pct: 16.7  },
  { month: "J", value: "$11.5k", pct: 12.5 },
  { month: "J", value: "$12k", pct: 16.7  },
  { month: "A", value: "$13.5k", pct: 29.2 },
  { month: "S", value: "$14k", pct: 33.3  },
  { month: "O", value: "$18k", pct: 66.7  },
  { month: "N", value: "$20k", pct: 83.3  },
  { month: "D", value: "$18k", pct: 66.7  },
];

/* ── Tab 3 · Current Market ──────────────────────────────────────── */

type VesselEarning = {
  name: string;
  spec: string;
  status: "TC" | "Spot" | "Drydock" | "Idle";
  rate: string;
  rateTone: "default" | "spot" | "muted" | "warn";
  monthly: string;
  ytd: string;
  expiry: string;
};

const VESSEL_EARNINGS: VesselEarning[] = [
  { name: "MV Pacific Star",     spec: "Panamax Bulk · 82,000 DWT · 2016",        status: "TC",      rate: "$19,000",  rateTone: "default", monthly: "$589K",  ytd: "$1.77M", expiry: "Dec 2026" },
  { name: "MV Aegean Explorer",  spec: "Kamsarmax · 82,000 DWT · 2015",            status: "TC",      rate: "$20,500",  rateTone: "default", monthly: "$636K",  ytd: "$1.91M", expiry: "Jun 2027" },
  { name: "MV Nordic Crest",     spec: "Kamsarmax · 82,000 DWT · 2017",            status: "Spot",    rate: "$21,400",  rateTone: "spot",    monthly: "$663K",  ytd: "$1.84M", expiry: "—"        },
  { name: "MV Blue Horizon",     spec: "Panamax Bulk · 76,000 DWT · 2018",         status: "TC",      rate: "$18,500",  rateTone: "default", monthly: "$574K",  ytd: "$1.72M", expiry: "Mar 2027" },
  { name: "MV Eastern Breeze",   spec: "Panamax Bulk · 76,000 DWT · 2016",         status: "Spot",    rate: "$19,800",  rateTone: "spot",    monthly: "$614K",  ytd: "$1.68M", expiry: "—"        },
  { name: "MV Silver Star",      spec: "Panamax Bulk · 82,000 DWT · 2013",         status: "TC",      rate: "$17,200",  rateTone: "default", monthly: "$533K",  ytd: "$1.60M", expiry: "Sep 2026" },
  { name: "MV Coral Pioneer",    spec: "Handysize Bulk · 38,000 DWT · 2014",       status: "Spot",    rate: "$14,200",  rateTone: "spot",    monthly: "$440K",  ytd: "$1.24M", expiry: "—"        },
  { name: "MT Black Sea Star",   spec: "Suezmax Tanker · 160,000 DWT · 2018",      status: "TC",      rate: "$27,000",  rateTone: "default", monthly: "$837K",  ytd: "$2.51M", expiry: "Oct 2027" },
  { name: "MT Atlantic Eagle",   spec: "Suezmax Tanker · 160,000 DWT · 2016",      status: "Spot",    rate: "$29,800",  rateTone: "spot",    monthly: "$924K",  ytd: "$2.62M", expiry: "—"        },
  { name: "MT Pacific Dawn",     spec: "Aframax Tanker · 110,000 DWT · 2017",      status: "TC",      rate: "$22,000",  rateTone: "default", monthly: "$682K",  ytd: "$2.05M", expiry: "Aug 2026" },
  { name: "LNG Zeus",            spec: "LNG TFDE · 174,000 m³ · 2022",              status: "TC",      rate: "$82,000",  rateTone: "spot",    monthly: "$2.54M", ytd: "$7.38M", expiry: "Dec 2031" },
  { name: "MV Meridian Star",    spec: "Kamsarmax · 82,000 DWT · 2021",            status: "TC",      rate: "$21,000",  rateTone: "default", monthly: "$651K",  ytd: "$1.95M", expiry: "Feb 2028" },
  { name: "MV Horizon Trader",   spec: "Panamax Container · 4,500 TEU · 2009",     status: "Spot",    rate: "$9,200",   rateTone: "warn",    monthly: "$285K",  ytd: "$0.82M", expiry: "—"        },
  { name: "MV Ocean Princess",   spec: "Panamax Bulk · 82,000 DWT · 2019",         status: "Drydock", rate: "—",         rateTone: "muted",   monthly: "—",       ytd: "$0.58M", expiry: "Back Apr 8" },
];

const RATE_VS_BUDGET = [
  { class: "Panamax Bulk", pct: 88,  delta: "+8%",  deltaTone: "green"   as const, barColor: "bg-primary" },
  { class: "Kamsarmax",    pct: 95,  delta: "+12%", deltaTone: "green"   as const, barColor: "bg-accent" },
  { class: "Suezmax",      pct: 100, delta: "+18%", deltaTone: "green"   as const, barColor: "bg-signal-orange" },
  { class: "Aframax",      pct: 78,  delta: "−4%",  deltaTone: "orange"  as const, barColor: "bg-signal-purple" },
  { class: "Container",    pct: 54,  delta: "−28%", deltaTone: "magenta" as const, barColor: "bg-signal-purple/50" },
];

const OPEN_POSITION_RISK = [
  { key: "Open days — next 30d",        value: "310",                                tone: "neutral" as const },
  { key: "Open days — next 90d",        value: "830",                                tone: "neutral" as const },
  { key: "Open days — next 12M",        value: "4,380",                              tone: "neutral" as const },
  { key: "Exp. spot rev. (base)",        value: "$29.4M",                             tone: "green"   as const },
  { key: "Exp. spot rev. (bear −20%)",   value: "$23.5M",                             tone: "magenta" as const },
  { key: "Earnings at risk",             value: "$8.4M",                              tone: "magenta" as const },
  { key: "Next TC expiry",               value: "Sep 2026 · MV Silver Star",          tone: "orange"  as const },
];

/* ── Tab 4 · Forward Curve ───────────────────────────────────────── */

type QuarterRow = {
  quarter: string;
  tc: string;
  spot: string;
  bear: string;
  base: string;
  bull: string;
  openDays: string;
  coverage: string;
  highlight?: boolean;
};

const FORWARD_QUARTERS: QuarterRow[] = [
  { quarter: "Q2 2026",  tc: "$12.8M", spot: "$7.1M", bear: "$17.4M", base: "$19.9M", bull: "$22.4M", openDays: "806",   coverage: "58%" },
  { quarter: "Q3 2026",  tc: "$12.4M", spot: "$7.8M", bear: "$16.2M", base: "$20.2M", bull: "$24.2M", openDays: "966",   coverage: "52%" },
  { quarter: "Q4 2026",  tc: "$11.8M", spot: "$9.2M", bear: "$16.8M", base: "$21.0M", bull: "$25.2M", openDays: "1,058", coverage: "47%" },
  { quarter: "Q1 2027",  tc: "$10.2M", spot: "$9.8M", bear: "$16.0M", base: "$20.0M", bull: "$24.0M", openDays: "1,164", coverage: "40%" },
  { quarter: "Full 12M", tc: "$47.2M", spot: "$34.0M", bear: "$66.4M", base: "$81.2M", bull: "$95.8M", openDays: "3,994", coverage: "46%", highlight: true },
];

type Outlook = {
  segment: string;
  tone: "positive" | "neutral" | "cautious";
  summary: string;
};

const ANALYST_OUTLOOK: Outlook[] = [
  { segment: "Panamax Bulk",  tone: "positive", summary: "Grain export season driving demand. BDI above 5Y avg. Forward curve in contango, suggesting supply tightness through Q4." },
  { segment: "Suezmax Tanker", tone: "positive", summary: "Black Sea trade disruption routes adding ton-miles. OPEC+ cut compliance creates rate support. Rates well above break-even." },
  { segment: "Aframax",        tone: "neutral",  summary: "Rates range-bound. Newbuild deliveries adding supply pressure H2 2026. Regional demand patterns mixed." },
  { segment: "Container",      tone: "cautious", summary: "Significant overcapacity from 2023–24 orderbook deliveries. Rates under pressure; spot exposure to MV Horizon Trader is a risk." },
];

const TC_RENEWAL = [
  { vessel: "MT Pacific Dawn",    detail: "Aug 2026 · $22k/d",   tone: "orange"  as const },
  { vessel: "MV Silver Star",     detail: "Sep 2026 · $17.2k/d", tone: "orange"  as const },
  { vessel: "MV Pacific Star",    detail: "Dec 2026 · $19k/d",   tone: "neutral" as const },
  { vessel: "MV Blue Horizon",    detail: "Mar 2027 · $18.5k/d", tone: "neutral" as const },
  { vessel: "MV Aegean Explorer", detail: "Jun 2027 · $20.5k/d", tone: "neutral" as const },
];

/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "overview",   label: "Overview" },
  { id: "history",    label: "Historical Rates" },
  { id: "current",    label: "Current Market" },
  { id: "forward",    label: "Forward Curve" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function EarningsPage() {
  const [active, setActive] = React.useState<TabId>("overview");

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "Earnings" }]}
        title="Earnings"
        subtitle="Charter market rates, fleet earnings and forward revenue across vessel types"
        actions={
          <>
            <SegmentPills />
            <PeriodToggle options={["1M", "3M", "1Y", "3Y", "5Y"]} active="1Y" />
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
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
        {active === "overview" ? <OverviewPanel /> : null}
        {active === "history" ? <HistoryPanel /> : null}
        {active === "current" ? <CurrentMarketPanel /> : null}
        {active === "forward" ? <ForwardCurvePanel /> : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Overview
 * -------------------------------------------------------------------------- */

function OverviewPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Portfolio TCE"    value="$18,240" direction="up" change="+$840 WoW"           meta="Wtd. avg. across 14 vessels · /day" accent="blue"    />
        <KpiCard label="Revenue YTD"      value="$68.3M"  direction="up" change="+12.4% vs prior yr" meta="TC: $51.2M · Spot: $17.1M"           accent="green"   />
        <KpiCard label="TC Coverage (12M)" value="57%"     direction="up" change="+5 pts vs Q4 2025"  meta="8 TC · 4 spot · 1 idle · 1 drydock"  accent="cyan"    />
        <KpiCard label="Open Days (12M)"   value="4,380"   meta="Spot-exposed vessel·days · est. spot rev. $29.4M"                              accent="orange"  />
        <KpiCard label="Earnings at Risk"  value="$8.4M"   meta="−20% rate shock · vs. base forecast"                                          accent="magenta" />
      </section>

      {/* 7-3 split */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">TCE Rate History — Trailing 12 Months</CardTitle>
              <CardDescription>
                Time Charter Equivalent $/day · by vessel class · Apr 2025 – Mar 2026
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[
                  { label: "Panamax Bulk",   color: "bg-primary" },
                  { label: "Kamsarmax",       color: "bg-accent" },
                  { label: "Suezmax Tanker", color: "bg-signal-orange" },
                  { label: "LNG TFDE",        color: "bg-signal-green" },
                  { label: "Aframax",         color: "bg-signal-purple" },
                ]}
              />
              <ChartPlaceholder height="h-56" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Gross Revenue</CardTitle>
              <CardDescription>
                Total fleet earnings by month · USD millions · stacked by employment type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[
                  { label: "Time Charter",   color: "bg-primary" },
                  { label: "Spot / Voyage",  color: "bg-signal-green" },
                ]}
              />
              <ChartPlaceholder height="h-44" />
              <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-4">
                <SummaryStat label="Total YTD Revenue" value="$68.3M" />
                <SummaryStat label="TC Revenue"        value="$51.2M" suffix="75%" />
                <SummaryStat label="Spot Revenue"      value="$17.1M" suffix="25%" valueClassName="text-signal-green" />
                <SummaryStat label="Best Month"        value="Mar 2026 · $17.3M" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-3">
          {/* TC Coverage donut + per-vessel breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">TC Coverage</CardTitle>
              <CardDescription>On cover vs open · next 12M</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Donut substitute — stacked horizontal bar with center % */}
              <div className="mb-3 flex items-center gap-4">
                <div className="relative inline-flex size-[100px] items-center justify-center rounded-full bg-muted">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(hsl(var(--primary)) 0% 57%, hsl(var(--signal-green)) 57% 87%, hsl(var(--muted-foreground)/0.4) 87% 100%)`,
                    }}
                  />
                  <div className="absolute inset-2.5 flex flex-col items-center justify-center rounded-full bg-card text-center">
                    <span className="text-[14px] font-extrabold leading-none">57%</span>
                    <span className="text-[8px] text-muted-foreground">on cover</span>
                  </div>
                </div>
                <ul className="flex flex-1 flex-col gap-1.5 text-[11px]">
                  {COVERAGE_DONUT.map((c) => (
                    <li key={c.label} className="flex items-center gap-2">
                      <span className={cn("size-2.5 rounded-sm", c.color)} />
                      <span className="flex-1 truncate">{c.label}</span>
                      <span className="font-bold tabular-nums">{c.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                By Vessel Type
              </p>
              <ul className="space-y-2">
                {COVERAGE_BY_VESSEL.map((c) => (
                  <li key={c.vessel} className="text-[11px]">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="flex-1 truncate font-semibold">
                        {c.vessel}{" "}
                        <span className="font-normal text-muted-foreground">({c.count})</span>
                      </span>
                      <span className="w-10 text-right font-bold tabular-nums">{c.onPct}%</span>
                      <span className="w-14 text-right tabular-nums text-muted-foreground">
                        {c.revenue}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full", c.barColor)} style={{ width: `${c.onPct}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Spot Market Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spot Market Snapshot</CardTitle>
              <CardDescription>Key route rates · as of 27 Mar 2026</CardDescription>
            </CardHeader>
            <ul className="divide-y">
              {SPOT_RATES.map((r) => (
                <li key={r.index} className="flex items-baseline gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold">{r.index}</p>
                    <p className="text-[10px] text-muted-foreground">{r.meta}</p>
                  </div>
                  <span className="font-mono text-[13px] font-bold tabular-nums">{r.value}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                      r.up
                        ? "bg-signal-green/10 text-signal-green"
                        : "bg-signal-magenta/10 text-signal-magenta",
                    )}
                  >
                    {r.up ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
                    {r.delta}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Historical Rates
 * -------------------------------------------------------------------------- */

function HistoryPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="5Y Avg TCE — Panamax" value="$14,820/day" direction="up" change="Current +23% above 5Y avg" accent="blue"    />
        <KpiCard label="5Y Avg TCE — Suezmax" value="$19,640/day" direction="up" change="Current +45% above 5Y avg" accent="orange"  />
        <KpiCard label="All-Time High — Panamax" value="$57,600/day" meta="Oct 2021 · Commodity demand surge" accent="green" />
        <KpiCard label="All-Time Low — Panamax"  value="$2,100/day"  meta="Apr 2020 · COVID demand collapse"  accent="magenta" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">5-Year TCE Rate History</CardTitle>
                <CardDescription>
                  Monthly average TCE $/day · Jan 2021 – Mar 2026 · Panamax Bulk &amp; Suezmax Tanker
                </CardDescription>
              </div>
              <PeriodToggle options={["1Y", "3Y", "5Y"]} active="5Y" />
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[
                  { label: "Panamax Bulk 82k", color: "bg-primary" },
                  { label: "Suezmax 160k",      color: "bg-signal-orange" },
                  { label: "Kamsarmax 82k",      color: "bg-accent" },
                  { label: "5Y Avg (Panamax)",  color: "bg-muted-foreground/50" },
                ]}
              />
              <ChartPlaceholder height="h-64" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Annual Average TCE Rates</CardTitle>
              <CardDescription>$/day · calendar year averages · WoW and YoY change</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-3 py-2 text-left">Year</th>
                    <th className="px-3 py-2 text-right">Panamax 82k</th>
                    <th className="px-3 py-2 text-right">Kamsarmax 82k</th>
                    <th className="px-3 py-2 text-right">Capesize 180k</th>
                    <th className="px-3 py-2 text-right">Suezmax 160k</th>
                    <th className="px-3 py-2 text-right">Aframax 110k</th>
                    <th className="px-3 py-2 text-right">LNG TFDE</th>
                    <th className="px-3 py-2 text-right">BDI Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {ANNUAL_RATES.map((r) => (
                    <tr
                      key={r.year}
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/30",
                        r.highlight && "bg-primary/5 font-bold",
                      )}
                    >
                      <td className={cn("px-3 py-2.5", r.highlight && "font-extrabold")}>
                        {r.year}
                      </td>
                      <RateCell value={r.panamax}   tone={r.panamaxTone}   bold={r.highlight} />
                      <RateCell value={r.kamsarmax} tone={r.kamsarmaxTone} bold={r.highlight} />
                      <RateCell value={r.capesize}  tone={r.capesizeTone}  bold={r.highlight} />
                      <RateCell value={r.suezmax}   tone={r.suezmaxTone}   bold={r.highlight} />
                      <RateCell value={r.aframax}   tone={r.aframaxTone}   bold={r.highlight} />
                      <RateCell value={r.lng}       tone={r.lngTone}       bold={r.highlight} />
                      <RateCell value={r.bdi}       tone={r.bdiTone}       bold={r.highlight} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rate Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-[12px]">
              {RATE_CONTEXT.map((m) => (
                <div key={m.key} className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground">{m.key}</span>
                  <span
                    className={cn(
                      "font-mono font-bold tabular-nums",
                      m.tone === "green" && "text-signal-green",
                      m.tone === "magenta" && "text-signal-magenta",
                      m.tone === "neutral" && "text-foreground",
                    )}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seasonality — Panamax</CardTitle>
              <CardDescription>Average monthly TCE · 5Y composite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-24 items-end gap-1">
                {SEASONALITY.map((s, i) => (
                  <div key={`${s.month}-${i}`} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{ height: `${s.pct}%`, opacity: 0.3 + (s.pct / 100) * 0.7 }}
                      title={`${s.value}`}
                    />
                    <span className="text-[9px] text-muted-foreground">{s.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2 border-t pt-3 text-[12px]">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground">Peak season</span>
                  <span className="font-bold">Oct–Dec (+28%)</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground">Trough season</span>
                  <span className="font-bold text-signal-orange">May–Jul (−18%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Current Market
 * -------------------------------------------------------------------------- */

function CurrentMarketPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Fleet Utilization"        value="92.9%"        direction="up" change="13 of 14 earning"     accent="blue"   />
        <KpiCard label="Revenue This Month"        value="$17.3M"       direction="up" change="Best month YTD"        accent="green"  />
        <KpiCard label="Avg. TC Rate (on cover)"   value="$19,400/day"  meta="Wtd. avg. across 8 TC vessels"           accent="cyan"   />
        <KpiCard label="Avg. Spot TCE"             value="$20,800/day"  direction="up" change="Above TC cover rate"   accent="orange" />
        <KpiCard label="Days in Port / Idle"       value="38"           meta="2.7% of fleet·days this month"           accent="purple" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <Card className="overflow-hidden lg:col-span-7">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
            <div>
              <CardTitle className="text-base">Current Vessel Earnings</CardTitle>
              <CardDescription>
                Individual vessel rates, status and YTD revenue · Mar 2026
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select className="h-8 rounded-md border border-input bg-background px-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>All Types</option>
                <option>Bulk Carrier</option>
                <option>Tanker</option>
                <option>Gas Carrier</option>
              </select>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="size-3.5" />
                Export
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2 text-left">Vessel</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Rate/day</th>
                  <th className="px-3 py-2 text-right">Mo. Rev.</th>
                  <th className="px-3 py-2 text-right">YTD Rev.</th>
                  <th className="px-3 py-2 text-right">TC Expiry</th>
                </tr>
              </thead>
              <tbody>
                {VESSEL_EARNINGS.map((v) => (
                  <tr key={v.name} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground">{v.spec}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={v.status} />
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right font-bold tabular-nums",
                        v.rateTone === "spot" && "text-signal-green",
                        v.rateTone === "muted" && "text-muted-foreground",
                        v.rateTone === "warn" && "text-signal-orange",
                      )}
                    >
                      {v.rate}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right tabular-nums",
                        v.rateTone === "muted" && "text-muted-foreground",
                      )}
                    >
                      {v.monthly}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{v.ytd}</td>
                    <td className="px-3 py-2.5 text-right text-muted-foreground">
                      {v.expiry}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-primary/40 bg-primary/5 font-bold">
                  <td className="px-3 py-3" colSpan={2}>
                    Fleet Total
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    $18,240<span className="text-[10px] font-normal text-muted-foreground">/day avg</span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-signal-green">
                    $10.97M
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">$29.67M</td>
                  <td className="px-3 py-3" />
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rate vs Budget</CardTitle>
              <CardDescription>Actual vs budgeted TCE · Mar 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {RATE_VS_BUDGET.map((r) => (
                <div key={r.class} className="flex items-center gap-2 text-[11px]">
                  <span className="w-24 truncate font-semibold">{r.class}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", r.barColor)} style={{ width: `${r.pct}%` }} />
                  </div>
                  <span
                    className={cn(
                      "w-10 text-right font-bold tabular-nums",
                      r.deltaTone === "green" && "text-signal-green",
                      r.deltaTone === "orange" && "text-signal-orange",
                      r.deltaTone === "magenta" && "text-signal-magenta",
                    )}
                  >
                    {r.delta}
                  </span>
                </div>
              ))}
              <div className="space-y-2 border-t pt-3 text-[12px]">
                <SummaryLine label="Portfolio vs budget"   value="+9.4%"  tone="green" />
                <SummaryLine label="Outperforming vessels"  value="10 of 14" tone="neutral" />
                <SummaryLine label="Underperforming"        value="3 of 14"  tone="orange" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open Position Risk</CardTitle>
              <CardDescription>Spot-exposed vessel·days ahead</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-[12px]">
              {OPEN_POSITION_RISK.map((m) => (
                <SummaryLine key={m.key} label={m.key} value={m.value} tone={m.tone} />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Forward Curve
 * -------------------------------------------------------------------------- */

function ForwardCurvePanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="1Y Forward TCE — Panamax" value="$19,200/day" direction="up" change="+5.5% vs current spot" accent="blue"   />
        <KpiCard label="Expected Rev. (12M)"      value="$81.2M"      meta="Base case · open + covered"            accent="green"  />
        <KpiCard label="Bull Scenario (12M)"      value="$96.4M"      meta="+20% spot rate assumption"             accent="orange" />
        <KpiCard label="Bear Scenario (12M)"      value="$68.8M"      meta="−20% spot rate assumption"             accent="magenta" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Forward Rate Curve — Panamax 82k TCE</CardTitle>
                <CardDescription>
                  $/day · Apr 2026 – Sep 2027 · base / bull / bear scenarios
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <ScenarioChip label="Base" tone="primary" />
                <ScenarioChip label="Bull" tone="green" />
                <ScenarioChip label="Bear" tone="magenta" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[
                  { label: "Base case",          color: "bg-primary" },
                  { label: "Bull (+20%)",        color: "bg-signal-green" },
                  { label: "Bear (−20%)",        color: "bg-signal-magenta" },
                  { label: "Uncertainty band",   color: "bg-primary/20" },
                ]}
              />
              <ChartPlaceholder height="h-56" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Expected Revenue by Quarter</CardTitle>
              <CardDescription>Open + covered positions · USD millions</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-3 py-2 text-left">Quarter</th>
                    <th className="px-3 py-2 text-right">TC Revenue</th>
                    <th className="px-3 py-2 text-right">Spot Revenue</th>
                    <th className="px-3 py-2 text-right">Total (Bear)</th>
                    <th className="px-3 py-2 text-right">Total (Base)</th>
                    <th className="px-3 py-2 text-right">Total (Bull)</th>
                    <th className="px-3 py-2 text-right">Open Days</th>
                    <th className="px-3 py-2 text-right">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {FORWARD_QUARTERS.map((r) => (
                    <tr
                      key={r.quarter}
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/30",
                        r.highlight && "bg-primary/5 font-bold",
                      )}
                    >
                      <td className={cn("px-3 py-2.5", r.highlight && "font-extrabold")}>
                        {r.quarter}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.tc}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.spot}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-signal-magenta">{r.bear}</td>
                      <td className={cn("px-3 py-2.5 text-right tabular-nums", r.highlight ? "text-primary" : "font-bold")}>
                        {r.base}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-signal-green">{r.bull}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.openDays}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.coverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analyst Outlook</CardTitle>
            </CardHeader>
            <ul className="divide-y">
              {ANALYST_OUTLOOK.map((o) => (
                <li key={o.segment} className="px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-bold">{o.segment}</span>
                    <OutlookChip tone={o.tone} />
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {o.summary}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">TC Renewal Schedule</CardTitle>
              <CardDescription>Expiring charter cover</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-[12px]">
              {TC_RENEWAL.map((t) => (
                <div key={t.vessel} className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground">{t.vessel}</span>
                  <span
                    className={cn(
                      "font-mono font-bold tabular-nums",
                      t.tone === "orange"  && "text-signal-orange",
                      t.tone === "neutral" && "text-foreground",
                    )}
                  >
                    {t.detail}
                  </span>
                </div>
              ))}
              <div className="mt-2 border-t pt-3 text-[11px] leading-relaxed text-muted-foreground">
                Forward 1Y TC market currently{" "}
                <strong className="text-signal-green">+5.5% above</strong> existing
                cover rates — renewal conditions are favourable. Recommend locking
                in TC for MT Pacific Dawn on renewal.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function SegmentPills() {
  type Seg = { label: string; active: boolean; activeClass: string };
  const segs: Seg[] = [
    { label: "Bulk",      active: true,  activeClass: "bg-primary text-primary-foreground" },
    { label: "Tanker",    active: false, activeClass: "bg-signal-orange text-white" },
    { label: "Gas",       active: false, activeClass: "bg-signal-green text-white" },
    { label: "Container", active: false, activeClass: "bg-signal-purple text-white" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-md border bg-card p-0.5">
      {segs.map((s) => (
        <button
          key={s.label}
          type="button"
          className={cn(
            "rounded px-2.5 py-1 text-[11px] font-semibold transition-colors",
            s.active
              ? s.activeClass
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function PeriodToggle({
  options,
  active,
}: {
  options: readonly string[];
  active: string;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border text-[11px] font-semibold">
      {options.map((o, i) => (
        <button
          key={o}
          className={cn(
            "px-2.5 py-1 transition-colors",
            i > 0 && "border-l",
            o === active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

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
      <div className="absolute inset-0 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <Construction className="size-4" />
        Chart placeholder · charting library wired in next sprint
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  suffix,
  valueClassName,
}: {
  label: string;
  value: string;
  suffix?: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 text-[14px] font-bold tabular-nums", valueClassName)}>
        {value}
        {suffix ? (
          <span className="ml-1 text-[11px] font-normal text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </p>
    </div>
  );
}

function RateCell({
  value,
  tone,
  bold = false,
}: {
  value: string;
  tone: "up" | "down" | null;
  bold?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 text-right tabular-nums",
        bold && "font-extrabold",
        tone === "up" && "text-signal-green",
        tone === "down" && "text-signal-magenta",
      )}
    >
      {value}
    </td>
  );
}

function StatusBadge({ status }: { status: "TC" | "Spot" | "Drydock" | "Idle" }) {
  const STYLE = {
    TC: "bg-primary/15 text-primary",
    Spot: "bg-signal-green/15 text-signal-green",
    Drydock: "bg-muted text-muted-foreground",
    Idle: "bg-signal-orange/15 text-signal-orange",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

function SummaryLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "magenta" | "orange" | "neutral";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono font-bold tabular-nums",
          tone === "green" && "text-signal-green",
          tone === "magenta" && "text-signal-magenta",
          tone === "orange" && "text-signal-orange",
          tone === "neutral" && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ScenarioChip({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "green" | "magenta";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1",
        tone === "primary" && "bg-primary/10 text-primary ring-primary/30",
        tone === "green" && "bg-signal-green/10 text-signal-green ring-signal-green/30",
        tone === "magenta" && "bg-signal-magenta/10 text-signal-magenta ring-signal-magenta/30",
      )}
    >
      {label}
    </span>
  );
}

function OutlookChip({ tone }: { tone: "positive" | "neutral" | "cautious" }) {
  const STYLE = {
    positive: "bg-signal-green/15 text-signal-green",
    neutral: "bg-muted text-muted-foreground",
    cautious: "bg-signal-orange/15 text-signal-orange",
  } as const;
  const LABEL = { positive: "Positive", neutral: "Neutral", cautious: "Cautious" } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        STYLE[tone],
      )}
    >
      {LABEL[tone]}
    </span>
  );
}
