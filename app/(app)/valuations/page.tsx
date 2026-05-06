import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Send,
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
import { SegmentInsightPanel } from "@/components/app/segment-insight-panel";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "Valuations" };

/* --------------------------------------------------------------------------
 * Mock data — segment cohort + per-vessel valuations + S&P transactions.
 * -------------------------------------------------------------------------- */

// Header segment pills — match the prototype's `.segment-pill.{type}.active`
// from html/valuations.html (solid coloured background, white text, 1.5px
// transparent border). Default is rendered active because the prototype
// shows all four segments selected on page load.
const SEGMENT_PILLS = [
  { label: "Bulk",      color: "bg-primary text-white" },
  { label: "Tanker",    color: "bg-signal-orange text-white" },
  { label: "Container", color: "bg-signal-purple text-white" },
  { label: "Gas",       color: "bg-[#0aaccf] text-white" },
] as const;

const RATIO_BARS: Array<{
  segment: string;
  pct: number;
  tone: "primary" | "accent" | "orange" | "magenta";
}> = [
  { segment: "Gas Carriers",      pct: 79, tone: "accent" },
  { segment: "Bulk — Panamax",    pct: 75, tone: "primary" },
  { segment: "Tanker — Suezmax",  pct: 74, tone: "primary" },
  { segment: "Tanker — Aframax",  pct: 59, tone: "primary" },
  { segment: "Bulk — Supramax",   pct: 49, tone: "orange" },
  { segment: "Container",         pct: 38, tone: "orange" },
  { segment: "Tanker — VLCC",     pct: 30, tone: "magenta" },
];

type FeedbackEntry = {
  vessel: string;
  date: string;
  type: "Market Observation" | "Flag for Review" | "General Comment" | "Valuation Query" | "Data Discrepancy";
  body: string;
};

const FEEDBACK_LOG: FeedbackEntry[] = [
  {
    vessel: "MV Pacific Star",
    date: "26 Mar 2026",
    type: "Market Observation",
    body: "BDI uptick should push Q2 FMV higher. Current value looks slightly conservative vs recent Panamax comps at $29–30M.",
  },
  {
    vessel: "MT Nordic Eagle",
    date: "20 Mar 2026",
    type: "Flag for Review",
    body: "VLCC age profile (18 yrs) and D-class CII could affect bankability. Recommend conservative FMV in lender context.",
  },
  {
    vessel: "LNG Adriatic Pearl",
    date: "15 Mar 2026",
    type: "General Comment",
    body: "LNG freight market softening slightly. FMV range looks right but $198M may be ceiling near-term.",
  },
];

const SEGMENT_COHORTS = [
  { segment: "Panamax Bulk (82k DWT)",     fmv: "$28.5M", newbuild: "$48.0M", resale: "$23.2M", scrap: "$5.6M",  momDelta: "+2.1%", momDirection: "up"   as const },
  { segment: "Supramax Bulk (62k DWT)",     fmv: "$22.4M", newbuild: "$36.0M", resale: "$18.6M", scrap: "$4.2M",  momDelta: "+1.8%", momDirection: "up"   as const },
  { segment: "Capesize Bulk (180k DWT)",    fmv: "$58.6M", newbuild: "$74.0M", resale: "$48.2M", scrap: "$12.4M", momDelta: "+3.4%", momDirection: "up"   as const },
  { segment: "Aframax Tanker (105k DWT)",   fmv: "$48.3M", newbuild: "$66.0M", resale: "$40.4M", scrap: "$5.0M",  momDelta: "+0.6%", momDirection: "up"   as const },
  { segment: "Suezmax Tanker (158k DWT)",   fmv: "$62.2M", newbuild: "$78.0M", resale: "$52.0M", scrap: "$7.1M",  momDelta: "−0.4%", momDirection: "down" as const },
  { segment: "MR Tanker (50k DWT)",         fmv: "$36.9M", newbuild: "$54.0M", resale: "$31.0M", scrap: "$3.3M",  momDelta: "+2.7%", momDirection: "up"   as const },
  { segment: "LNG Carrier (174k cbm)",      fmv: "$214.5M", newbuild: "$252.0M", resale: "$180.0M", scrap: "$18.0M", momDelta: "+0.9%", momDirection: "up" as const },
];

type SpStatus = "Completed" | "Under Offer" | "En Bloc";
type SpTxn = {
  id: string;
  vessel: string;
  type: VesselType;
  spec: string;
  dwt: string;
  built: number;
  age: number;
  price: string;
  pricePerDwt: string;
  buyer: string;
  seller: string;
  region: string;
  date: string;
  status: SpStatus;
};

type QuarterGroup = { label: string; rows: SpTxn[] };

const SP_GROUPS: QuarterGroup[] = [
  {
    label: "Q1 2026",
    rows: [
      { id: "txn-1",  vessel: "MV Pacific Star",     type: "Bulk Carrier",  spec: "Panamax",     dwt: "82,000",   built: 2016, age: 10, price: "$28.5M",  pricePerDwt: "$347", buyer: "Portfolio Co. Ltd.",    seller: "Jiangsu New Yangzi",  region: "Far East",      date: "26 Mar 2026", status: "Completed"   },
      { id: "txn-2",  vessel: "MV Helios Panamax",   type: "Bulk Carrier",  spec: "Panamax",     dwt: "80,500",   built: 2018, age: 8,  price: "$26.8M",  pricePerDwt: "$333", buyer: "Pacific Bridge Corp.",  seller: "Norden A/S",          region: "NW Europe",     date: "18 Mar 2026", status: "Completed"   },
      { id: "txn-3",  vessel: "MT Helios Trader",    type: "Tanker",        spec: "Suezmax",     dwt: "158,400",  built: 2014, age: 12, price: "$62.0M",  pricePerDwt: "$391", buyer: "Nordic Tankers",        seller: "Hellas Marine",       region: "NW Europe",     date: "8 Mar 2026",  status: "Under Offer" },
      { id: "txn-4",  vessel: "LNG Adriatic Pearl",  type: "Gas Carrier",   spec: "LNG Carrier", dwt: "174k cbm", built: 2019, age: 7,  price: "$198.0M", pricePerDwt: "—",    buyer: "Qatari Energy",         seller: "Adriatic Gas Co",     region: "Middle East",   date: "5 Mar 2026",  status: "Completed"   },
      { id: "txn-5",  vessel: "MV Baltic Crown",     type: "Bulk Carrier",  spec: "Supramax",    dwt: "55,700",   built: 2010, age: 16, price: "$16.8M",  pricePerDwt: "$302", buyer: "Baltic Star Lines",     seller: "Crown Shipping",      region: "Baltic Sea",    date: "2 Mar 2026",  status: "Completed"   },
      { id: "txn-6",  vessel: "MT Nordic Eagle",     type: "Tanker",        spec: "VLCC",        dwt: "299,990",  built: 2008, age: 18, price: "$38.0M",  pricePerDwt: "$127", buyer: "Asian Petro Corp",      seller: "Nordic Tankers AS",   region: "ME Gulf",       date: "28 Feb 2026", status: "En Bloc"     },
      { id: "txn-7",  vessel: "MV Cape Pioneer",     type: "Bulk Carrier",  spec: "Capesize",    dwt: "181,000",  built: 2017, age: 9,  price: "$52.0M",  pricePerDwt: "$287", buyer: "Iron Peak Capital",     seller: "Cape Ventures",       region: "Australia",     date: "25 Feb 2026", status: "Completed"   },
      { id: "txn-8",  vessel: "MT Aegean Spirit",    type: "Tanker",        spec: "Aframax",     dwt: "115,800",  built: 2015, age: 11, price: "$43.5M",  pricePerDwt: "$376", buyer: "Dynacom Tankers",       seller: "Overseas Shipholding",region: "Mediterranean", date: "22 Feb 2026", status: "Completed"   },
      { id: "txn-9",  vessel: "MV Coral Voyager",    type: "Bulk Carrier",  spec: "Panamax",     dwt: "79,200",   built: 2019, age: 7,  price: "$28.5M",  pricePerDwt: "$360", buyer: "Costamare Inc.",        seller: "Star Bulk Carriers",  region: "Far East",      date: "18 Feb 2026", status: "Completed"   },
      { id: "txn-10", vessel: "CMA Rhone Express",   type: "Container",     spec: "Panamax",     dwt: "4,250 teu",built: 2011, age: 15, price: "$18.2M",  pricePerDwt: "—",    buyer: "Box Shipping LLC",      seller: "Euro Contain",        region: "W. Med",        date: "20 Feb 2026", status: "Under Offer" },
      { id: "txn-11", vessel: "MV Atlantic Grain",   type: "Bulk Carrier",  spec: "Panamax",     dwt: "81,400",   built: 2014, age: 12, price: "$24.2M",  pricePerDwt: "$297", buyer: "Hamburg Commercial",    seller: "Grieg Maritime",      region: "NW Europe",     date: "15 Feb 2026", status: "Completed"   },
      { id: "txn-12", vessel: "MT Eastern Sun",      type: "Tanker",        spec: "MR Product",  dwt: "49,800",   built: 2017, age: 9,  price: "$36.1M",  pricePerDwt: "$725", buyer: "Hafnia Tankers",        seller: "Thenamaris",          region: "SE Asia",       date: "10 Feb 2026", status: "Completed"   },
      { id: "txn-13", vessel: "MV Iron Horizon",     type: "Bulk Carrier",  spec: "Capesize",    dwt: "178,500",  built: 2013, age: 13, price: "$38.0M",  pricePerDwt: "$213", buyer: "Pacific Basin",         seller: "Zodiac Maritime",     region: "Far East",      date: "5 Feb 2026",  status: "Completed"   },
      { id: "txn-14", vessel: "LPG Stellar Orion",   type: "Gas Carrier",   spec: "VLGC",        dwt: "84k cbm",  built: 2016, age: 10, price: "$72.0M",  pricePerDwt: "—",    buyer: "BW LPG",                seller: "Avance Gas",          region: "Middle East",   date: "28 Jan 2026", status: "Completed"   },
      { id: "txn-15", vessel: "MV North Star Bulk",  type: "Bulk Carrier",  spec: "Handysize",   dwt: "32,400",   built: 2012, age: 14, price: "$12.8M",  pricePerDwt: "$395", buyer: "Himalaya Shipping",     seller: "Oldendorff Carriers", region: "Baltic Sea",    date: "20 Jan 2026", status: "Completed"   },
    ],
  },
  {
    label: "Q4 2025",
    rows: [
      { id: "txn-16", vessel: "MT Nordic Frost",     type: "Tanker",        spec: "Suezmax",       dwt: "157,200", built: 2012, age: 13, price: "$54.0M", pricePerDwt: "$344", buyer: "Tsakos Energy Nav.",  seller: "Sovcomflot",       region: "NW Europe", date: "18 Dec 2025", status: "Completed" },
      { id: "txn-17", vessel: "MV Asiatic Breeze",   type: "Bulk Carrier",  spec: "Panamax",       dwt: "76,800",  built: 2015, age: 11, price: "$19.8M", pricePerDwt: "$258", buyer: "Himalaya Shipping",   seller: "Cargill Ocean",    region: "Far East",  date: "12 Nov 2025", status: "Completed" },
      { id: "txn-18", vessel: "MV Sunrise Bulker",   type: "Bulk Carrier",  spec: "Supramax",      dwt: "57,100",  built: 2011, age: 15, price: "$14.2M", pricePerDwt: "$249", buyer: "Thoresen Thai",       seller: "Pacific Basin",    region: "SE Asia",   date: "4 Nov 2025",  status: "Completed" },
      { id: "txn-19", vessel: "COSCO Ningbo Star",   type: "Container",     spec: "Post-Panamax",  dwt: "8,100 teu",built: 2009, age: 17, price: "$31.0M", pricePerDwt: "—",   buyer: "Seaspan Corporation", seller: "COSCO Shipping",   region: "Far East",  date: "28 Oct 2025", status: "Completed" },
      { id: "txn-20", vessel: "MT Ocean Voyager",    type: "Tanker",        spec: "VLCC",          dwt: "318,000", built: 2007, age: 19, price: "$32.5M", pricePerDwt: "$102", buyer: "Euronav NV",          seller: "Maran Tankers",    region: "Middle East",date:"15 Oct 2025", status: "Completed" },
      { id: "txn-21", vessel: "MV Cape Fortuna",     type: "Bulk Carrier",  spec: "Capesize",      dwt: "176,400", built: 2016, age: 10, price: "$49.3M", pricePerDwt: "$279", buyer: "Navios Maritime",     seller: "Berge Bulk",       region: "Australia", date: "8 Oct 2025",  status: "Completed" },
    ],
  },
  {
    label: "Q3 2025",
    rows: [
      { id: "txn-22", vessel: "MV Ocean Bulk IV",    type: "Bulk Carrier",  spec: "Supramax",      dwt: "56,200",  built: 2013, age: 13, price: "$23.7M", pricePerDwt: "$422", buyer: "DNB Bank ASA",        seller: "Pacific Basin",    region: "NW Europe", date: "22 Sep 2025", status: "Completed" },
      { id: "txn-23", vessel: "MT Stellar Harvest",  type: "Tanker",        spec: "Aframax",       dwt: "112,400", built: 2015, age: 11, price: "$42.8M", pricePerDwt: "$381", buyer: "Golden Ocean",        seller: "Frontline Ltd.",   region: "NW Europe", date: "14 Sep 2025", status: "Completed" },
      { id: "txn-24", vessel: "LNG Baltic Frost",    type: "Gas Carrier",   spec: "LNG Carrier",   dwt: "160k cbm",built: 2017, age: 9,  price: "$182.0M",pricePerDwt: "—",    buyer: "Shell LNG",           seller: "MOL Gas",          region: "Far East",  date: "3 Sep 2025",  status: "Completed" },
      { id: "txn-25", vessel: "MV Handy Jasmine",    type: "Bulk Carrier",  spec: "Handysize",     dwt: "28,700",  built: 2009, age: 17, price: "$8.6M",  pricePerDwt: "$300", buyer: "United Bulk Carriers",seller: "Korean Line",      region: "Far East",  date: "28 Aug 2025", status: "Completed" },
      { id: "txn-26", vessel: "MT Primrose",         type: "Tanker",        spec: "MR Product",    dwt: "50,100",  built: 2020, age: 6,  price: "$42.5M", pricePerDwt: "$848", buyer: "Trafigura",           seller: "Product Shipping SA",region:"Mediterranean",date:"10 Aug 2025",status:"Completed" },
      { id: "txn-27", vessel: "MV Globe Carrier",    type: "Bulk Carrier",  spec: "Capesize",      dwt: "179,800", built: 2011, age: 15, price: "$34.5M", pricePerDwt: "$192", buyer: "Diana Shipping",      seller: "Bocimar International",region:"Far East",date:"5 Jul 2025", status: "Completed" },
    ],
  },
  {
    label: "Q2 2025",
    rows: [
      { id: "txn-28", vessel: "CMA CGM Jade",        type: "Container",     spec: "Feeder",        dwt: "2,500 teu",built:2013, age: 13, price: "$11.4M", pricePerDwt: "—",    buyer: "X-Press Feeders",     seller: "CMA CGM",          region: "SE Asia",    date: "24 Jun 2025", status: "Completed" },
      { id: "txn-29", vessel: "MT Kastor",           type: "Tanker",        spec: "Suezmax",       dwt: "160,400", built: 2010, age: 16, price: "$44.0M", pricePerDwt: "$274", buyer: "Enterprises Shipping",seller: "Capital Product",  region: "Mediterranean",date:"15 May 2025",status:"Completed" },
      { id: "txn-30", vessel: "MV Pacific Bulk VI",  type: "Bulk Carrier",  spec: "Ultramax",      dwt: "63,500",  built: 2018, age: 8,  price: "$27.0M", pricePerDwt: "$425", buyer: "Pacific Basin",       seller: "Daiichi Chuo Kisen",region: "Far East",   date: "4 May 2025",  status: "Completed" },
      { id: "txn-31", vessel: "MT Athena",           type: "Tanker",        spec: "VLCC",          dwt: "302,000", built: 2006, age: 20, price: "$28.0M", pricePerDwt: "$93",  buyer: "Oil Tankers AS",      seller: "TI Tankers",       region: "ME Gulf",    date: "22 Apr 2025", status: "Completed" },
      { id: "txn-32", vessel: "MV Sandalwood",       type: "Bulk Carrier",  spec: "Handymax",      dwt: "44,700",  built: 2014, age: 12, price: "$18.5M", pricePerDwt: "$414", buyer: "Ernst Russ GmbH",     seller: "Sinobull Shipping",region: "Far East",   date: "11 Apr 2025", status: "Completed" },
    ],
  },
];

const MONTHLY_VOLUME: Array<{ month: string; pct: number; projected: boolean }> = [
  { month: "Jan", pct: 62, projected: false },
  { month: "Feb", pct: 71, projected: false },
  { month: "Mar", pct: 80, projected: false },
  { month: "Apr", pct: 28, projected: true },
  { month: "May", pct: 22, projected: true },
  { month: "Jun", pct: 18, projected: true },
  { month: "Jul", pct: 15, projected: true },
  { month: "Aug", pct: 12, projected: true },
  { month: "Sep", pct: 18, projected: true },
  { month: "Oct", pct: 22, projected: true },
  { month: "Nov", pct: 24, projected: true },
  { month: "Dec", pct: 20, projected: true },
];

const VESSEL_TYPE_SHARE: Array<{ label: string; pct: number; tone: string }> = [
  { label: "Bulk Carrier", pct: 38, tone: "bg-primary" },
  { label: "Tanker",       pct: 31, tone: "bg-signal-orange" },
  { label: "Container",    pct: 14, tone: "bg-signal-purple" },
  { label: "Gas Carrier",  pct: 10, tone: "bg-accent" },
  { label: "Other",        pct: 7,  tone: "bg-muted-foreground/40" },
];

/* -------------------------------------------------------------------------- */

export default function ValuationsPage() {
  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "Valuations" }]}
        title="Market Valuations"
        subtitle="Live FMV, newbuild and resale values across all vessel segments in the global market"
        actions={
          <>
            <div className="hidden flex-wrap gap-1 md:flex">
              {SEGMENT_PILLS.map((p) => (
                <span
                  key={p.label}
                  className={cn(
                    "inline-flex items-center rounded-full border-[1.5px] border-transparent px-2.5 py-0.5 text-[11px] font-bold",
                    p.color,
                  )}
                >
                  {p.label}
                </span>
              ))}
            </div>
            <Button asChild className="gap-2">
              <Link href="/valuations/request">
                <FileText className="size-3.5" />
                Request Certificate
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        {/* ───────────────────────── Segment Insight Panel ──────────────── */}
        <SegmentInsightPanel />

        {/* ───────────────────────── VALUATIONS section ───────────────────── */}

        {/* Stats row — 5 KPI cards */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            label="Global Fleet FMV"
            value="$2.14T"
            direction="up"
            change="+3.2% vs last month"
            accent="blue"
          />
          <KpiCard
            label="Total Newbuild Value"
            value="$3.82T"
            meta="Equiv. replacement cost"
            accent="cyan"
          />
          <KpiCard
            label="Total Resale Value"
            value="$1.76T"
            direction="up"
            change="+1.8% vs last month"
            accent="green"
          />
          <KpiCard
            label="Avg. FMV / Newbuild"
            value="57%"
            meta="Fleet-wide average ratio"
            accent="orange"
          />
          <KpiCard
            label="Total Scrap Value"
            value="$218.4B"
            meta="At $490/LDT"
            accent="purple"
          />
        </section>

        {/* Filter bar */}
        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Fleet"
              options={["All Fleets", "Fleet Alpha", "Fleet Beta"]}
            />
            <FilterSelect
              label="Sort by"
              options={[
                "FMV (High → Low)",
                "FMV (Low → High)",
                "Year Built",
                "FMV/NB Ratio",
                "MoM Change",
              ]}
            />
            <span className="mx-1 h-6 w-px bg-border" aria-hidden />
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vessel name or IMO…"
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </Card>

        {/* Trend + Index charts */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  Market Value Trends
                </CardTitle>
                <CardDescription>
                  Historical FMV, Resale, Newbuild and Scrap values by segment · USD millions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-7 rounded-md border border-input bg-background px-2 text-[11px]">
                  <option>Panamax Bulk</option>
                  <option>Supramax Bulk</option>
                  <option>Aframax Tanker</option>
                  <option>Suezmax Tanker</option>
                  <option>LNG Carrier</option>
                  <option>All Segments (avg)</option>
                </select>
                <PeriodToggle options={["1Y", "3Y", "5Y", "10Y"]} active="1Y" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[
                  { label: "FMV", color: "bg-primary" },
                  { label: "Resale", color: "bg-signal-green" },
                  { label: "Newbuild", color: "bg-accent" },
                  { label: "Scrap", color: "bg-signal-orange" },
                ]}
              />
              <ChartPlaceholder height="h-56" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  Market Index Graphs
                </CardTitle>
                <CardDescription>
                  Spot rates, FFAs and forward curve values by segment
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-7 rounded-md border border-input bg-background px-2 text-[11px]">
                  <option>Panamax Bulk (82k DWT)</option>
                  <option>Supramax Bulk</option>
                  <option>Suezmax Tanker</option>
                  <option>Aframax Tanker</option>
                  <option>LNG Carrier</option>
                </select>
                <PeriodToggle options={["6M", "1Y", "2Y"]} active="6M" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Sub-tabs Spot / FFAs / Forward (visual only) */}
              <div className="mb-3 flex items-center gap-1 border-b text-[12px] font-semibold">
                <span className="-mb-px border-b-2 border-primary px-3 py-1.5 text-foreground">Spot</span>
                <span className="-mb-px px-3 py-1.5 text-muted-foreground">FFAs</span>
                <span className="-mb-px px-3 py-1.5 text-muted-foreground">Forward Values</span>
              </div>
              {/* Spot KPIs */}
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SpotKpi label="BDI" value="1,842" delta="+4.1% WoW" deltaTone="up" />
                <SpotKpi label="BDTI" value="924" delta="−2.3% WoW" deltaTone="down" />
                <SpotKpi label="BCTI" value="656" delta="+1.8% WoW" deltaTone="up" />
                <SpotKpi label="Panamax TCE" value="$14,200" delta="+2.8% WoW" deltaTone="up" highlight />
              </div>
              <ChartLegend
                items={[
                  { label: "BDI (Bulk)", color: "bg-primary" },
                  { label: "BDTI (Tanker)", color: "bg-signal-orange" },
                ]}
              />
              <ChartPlaceholder height="h-44" />
            </CardContent>
          </Card>
        </section>

        {/* NB Parity + Residual Values */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  Newbuilding Parity
                </CardTitle>
                <CardDescription>
                  Depreciation curve — FMV as % of newbuild cost over vessel lifetime
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-7 rounded-md border border-input bg-background px-2 text-[11px]">
                  <option>Panamax Bulk</option>
                  <option>Supramax Bulk</option>
                  <option>Aframax Tanker</option>
                  <option>Suezmax Tanker</option>
                  <option>LNG Carrier</option>
                </select>
                <PeriodToggle options={["15Y", "20Y", "25Y"]} active="15Y" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder height="h-44" />
              <ChartLegend
                items={[
                  { label: "FMV / NB Parity", color: "bg-primary" },
                  { label: "Newbuild (100%)", color: "bg-accent" },
                  { label: "Scrap floor", color: "bg-signal-orange" },
                ]}
              />
              <div className="mt-3 grid grid-cols-3 gap-3 border-t pt-3">
                <ParityStat label="At 5 years" value="~72%" />
                <ParityStat label="At 10 years" value="~52%" />
                <ParityStat label="At 15 years" value="~34%" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  Residual Values · Fixed Age
                </CardTitle>
                <CardDescription>
                  FMV trajectory for a vessel of fixed age — cross-segment comparison
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-7 rounded-md border border-input bg-background px-2 text-[11px]">
                  <option>Panamax Bulk</option>
                  <option>Supramax Bulk</option>
                  <option>Aframax Tanker</option>
                  <option>Suezmax Tanker</option>
                  <option>LNG Carrier</option>
                </select>
                <PeriodToggle options={["5Y", "10Y", "15Y", "20Y"]} active="5Y" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder height="h-44" />
              <div className="mt-3 grid grid-cols-3 gap-3 border-t pt-3">
                <ParityStat label="Current FMV" value="$38.0M" />
                <ParityStat
                  label="12M change"
                  value="+$4.2M"
                  valueClassName="text-signal-green"
                />
                <ParityStat label="Age cohort" value="5Y old" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* S&P vs FMV + FMV vs Newbuild */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">S&amp;P Transactions vs FMV</CardTitle>
                <CardDescription>
                  Sale price vs estimated FMV at transaction date
                </CardDescription>
              </div>
              <select className="h-7 rounded-md border border-input bg-background px-2 text-[11px]">
                <optgroup label="By Vessel">
                  <option>MV Pacific Star</option>
                  <option>MT Helios Trader</option>
                  <option>LNG Adriatic Pearl</option>
                  <option>MV Baltic Crown</option>
                  <option>MT Nordic Eagle</option>
                </optgroup>
                <optgroup label="By Type">
                  <option>All Bulk Carriers</option>
                  <option>All Tankers</option>
                  <option>Gas Carriers</option>
                  <option>Containers</option>
                </optgroup>
              </select>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder height="h-44" />
              <ChartLegend
                items={[
                  { label: "FMV (estimated)", color: "bg-primary" },
                  { label: "Sale above FMV", color: "bg-signal-green" },
                  { label: "Sale below FMV", color: "bg-signal-orange" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">FMV vs Newbuilding Value</CardTitle>
                <CardDescription>
                  Secondhand FMV relative to current newbuild price · trailing 24M
                </CardDescription>
              </div>
              <select className="h-7 rounded-md border border-input bg-background px-2 text-[11px]">
                <option>Panamax Bulk</option>
                <option>Suezmax Tanker</option>
                <option>LNG Carrier</option>
                <option>Aframax Tanker</option>
              </select>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder height="h-44" />
              <ChartLegend
                items={[
                  { label: "FMV", color: "bg-primary" },
                  { label: "Newbuild Price", color: "bg-accent" },
                ]}
              />
            </CardContent>
          </Card>
        </section>

        {/* FMV/NB Ratio bars + Feedback */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">FMV / Newbuild Ratio by Segment</CardTitle>
              <CardDescription>Current secondhand discount to newbuild cost</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {RATIO_BARS.map((b) => (
                  <li key={b.segment} className="flex items-center gap-3 text-[12px]">
                    <span className="w-32 truncate text-muted-foreground">{b.segment}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          b.tone === "primary" && "bg-primary",
                          b.tone === "accent" && "bg-accent",
                          b.tone === "orange" && "bg-signal-orange",
                          b.tone === "magenta" && "bg-signal-magenta",
                        )}
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-bold tabular-nums">{b.pct}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Valuation Feedback &amp; Comments
              </CardTitle>
              <CardDescription>
                Add notes or flag concerns on a specific vessel valuation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Vessel
                  </span>
                  <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
                    <option>MV Pacific Star</option>
                    <option>MT Helios Trader</option>
                    <option>LNG Adriatic Pearl</option>
                    <option>MV Baltic Crown</option>
                    <option>MT Nordic Eagle</option>
                    <option>MT Aegean Wind</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Feedback Type
                  </span>
                  <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
                    <option>General Comment</option>
                    <option>Valuation Query</option>
                    <option>Data Discrepancy</option>
                    <option>Market Observation</option>
                    <option>Flag for Review</option>
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Comment
                </span>
                <textarea
                  placeholder="Add your observation, note or concern regarding this vessel's valuation…"
                  className="min-h-[80px] rounded-md border border-input bg-background p-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <Button size="sm" className="w-fit gap-2">
                <Send className="size-3.5" />
                Submit Feedback
              </Button>

              <div className="mt-2 border-t pt-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Recent Feedback
                </p>
                <ul className="divide-y">
                  {FEEDBACK_LOG.map((f, i) => (
                    <li key={i} className="py-2.5">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[12px] font-bold">{f.vessel}</span>
                        <span className="text-[10px] text-muted-foreground">{f.date}</span>
                      </div>
                      <FeedbackTag type={f.type} />
                      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                        {f.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Segment cohort table */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              Segment Cohort Valuations
            </CardTitle>
            <CardDescription>
              Average FMV, Newbuild, Resale and Scrap by canonical segment cohort
            </CardDescription>
          </CardHeader>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Segment</th>
                <th className="px-4 py-2 text-right">FMV</th>
                <th className="px-4 py-2 text-right">Newbuild</th>
                <th className="px-4 py-2 text-right">Resale</th>
                <th className="px-4 py-2 text-right">Scrap</th>
                <th className="px-4 py-2 text-right">MoM</th>
              </tr>
            </thead>
            <tbody>
              {SEGMENT_COHORTS.map((s) => (
                <tr key={s.segment} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">{s.segment}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">{s.fmv}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{s.newbuild}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{s.resale}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{s.scrap}</td>
                  <td className="px-4 py-2.5 text-right">
                    <DeltaBadge delta={s.momDelta} direction={s.momDirection} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ───────────────────────── S&P TRANSACTIONS section ─────────────── */}
        <div className="my-3 h-px bg-border" aria-hidden />
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          S&amp;P Transactions
        </h2>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Transactions YTD" value="184" direction="up" change="+22 vs 2025 pace" accent="blue" />
          <KpiCard label="Total Value YTD" value="$6.84B" direction="up" change="+8.4% vs last period" accent="green" />
          <KpiCard label="Avg Deal Price" value="$37.1M" direction="up" change="+4.2% vs Q4 2025" accent="cyan" />
          <KpiCard label="Largest Deal YTD" value="$198M" meta="LNG Adriatic Pearl" accent="orange" />
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Avg $/DWT" value="$412" direction="down" change="−1.8% vs last month" accent="purple" />
          <KpiCard label="Bulk Deals YTD" value="70" meta="38% of all deals" accent="blue" />
          <KpiCard label="Tanker Deals YTD" value="57" meta="31% of all deals" accent="cyan" />
          <KpiCard label="Avg Age at Sale" value="13.4 yrs" direction="down" change="−0.6 yrs vs 2025" accent="green" />
        </section>

        {/* Volume + Type charts */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Deal Volume 2026</CardTitle>
              <CardDescription>
                Confirmed transactions per month · Jan–Mar actuals, Apr–Dec projected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-44 items-end gap-1.5">
                {MONTHLY_VOLUME.map((b) => (
                  <div key={b.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className={cn(
                          "w-full rounded-t",
                          b.projected
                            ? "border border-dashed border-muted-foreground/50 bg-muted/40"
                            : "bg-primary",
                        )}
                        style={{ height: `${b.pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{b.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded bg-primary" />
                  Confirmed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded border border-dashed border-muted-foreground/50 bg-muted/40" />
                  Projected
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                By Vessel Type
              </CardTitle>
              <CardDescription>Share of total transaction value YTD by segment</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {VESSEL_TYPE_SHARE.map((s) => (
                  <li key={s.label} className="flex items-center gap-3 text-[12px]">
                    <span className="w-28 truncate text-muted-foreground">{s.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", s.tone)} style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="w-10 text-right font-bold tabular-nums">{s.pct}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* S&P filter bar */}
        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Type"
              options={["All Types", "Bulk Carrier", "Tanker", "Container", "Gas Carrier"]}
            />
            <FilterSelect
              label="Year Built"
              options={["Any Year", "2020+", "2015–2019", "2010–2014", "Before 2010"]}
            />
            <FilterSelect
              label="Price Range"
              options={["Any Price", "Under $20M", "$20M – $50M", "$50M – $100M", "$100M+"]}
            />
            <FilterSelect
              label="Region"
              options={[
                "All Regions",
                "Far East",
                "NW Europe",
                "Middle East",
                "SE Asia",
                "Baltic Sea",
                "Mediterranean",
              ]}
            />
            <FilterSelect
              label="Date Range"
              options={["Last 30 days", "Last 90 days", "YTD 2026", "Full Year 2025"]}
            />
            <span className="mx-1 h-6 w-px bg-border" aria-hidden />
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vessel or company…"
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button size="sm" className="ml-auto gap-2">
              <Plus className="size-3.5" />
              Add Transaction
            </Button>
          </div>
        </Card>

        {/* S&P transactions table */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
            <div>
              <CardTitle className="text-base">All S&amp;P Transactions</CardTitle>
              <CardDescription>
                184 reported transactions · YTD 2026 + FY 2025 · Sorted by date descending · Source: Signal Ocean S&amp;P Database
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Refresh">
              <RefreshCw className="size-3.5" />
              <span className="sr-only">Refresh</span>
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Vessel Name</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="whitespace-nowrap px-4 py-2 text-right">DWT</th>
                  <th className="px-4 py-2 text-left">Built</th>
                  <th className="px-4 py-2 text-right">Age</th>
                  <th className="px-4 py-2 text-right">Sale Price</th>
                  <th className="px-4 py-2 text-right">$/DWT</th>
                  <th className="px-4 py-2 text-left">Buyer</th>
                  <th className="px-4 py-2 text-left">Seller</th>
                  <th className="px-4 py-2 text-left">Region</th>
                  <th className="whitespace-nowrap px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {SP_GROUPS.map((group) => (
                  <React.Fragment key={group.label}>
                    <tr className="bg-primary/5">
                      <td
                        colSpan={12}
                        className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {group.rows.map((t) => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-2.5 font-semibold">{t.vessel}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <VesselTypeBadge value={t.type} />
                            <span className="text-[11px] text-muted-foreground">{t.spec}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                          {t.dwt}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums">{t.built}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          {t.age}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold tabular-nums">{t.price}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          {t.pricePerDwt}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{t.buyer}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{t.seller}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{t.region}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                          {t.date}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
            <span>Showing 32 of 184 transactions · YTD 2026 &amp; FY 2025</span>
            <span>Source: Signal Ocean S&amp;P Database · Updated 31 Mar 2026</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function FilterSelect({
  label,
  options,
}: {
  label: string;
  options: readonly string[];
}) {
  return (
    <label className="flex items-center gap-2 text-[12px]">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
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
      <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
        Chart placeholder · charting library wired in next sprint
      </div>
    </div>
  );
}

function ParityStat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 text-[13px] font-bold tabular-nums", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function DeltaBadge({
  delta,
  direction,
}: {
  delta: string;
  direction: "up" | "down" | "neutral";
}) {
  // Mirrors the prototype's `.fmv-up / .fmv-down / .fmv-flat` pills from
  // html/valuations.html: 12% tinted background, deeper readable foreground.
  const colors =
    direction === "up"
      ? "bg-[rgba(15,210,154,0.12)] text-[#0aab7e]"
      : direction === "down"
        ? "bg-signal-magenta/[0.12] text-signal-magenta"
        : "bg-primary/10 text-primary";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
        colors,
      )}
    >
      {direction === "up" ? (
        <ArrowUp className="size-2.5" />
      ) : direction === "down" ? (
        <ArrowDown className="size-2.5" />
      ) : null}
      {delta}
    </span>
  );
}

function SpotKpi({
  label,
  value,
  delta,
  deltaTone,
  highlight = false,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone: "up" | "down";
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-muted/30 px-3 py-2 text-center",
        highlight && "border-2 border-primary bg-primary/5",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[15px] font-extrabold tabular-nums",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "text-[10px] font-semibold tabular-nums",
          deltaTone === "up" ? "text-signal-green" : "text-signal-magenta",
        )}
      >
        {delta}
      </p>
    </div>
  );
}

function FeedbackTag({ type }: { type: FeedbackEntry["type"] }) {
  const tone: Record<FeedbackEntry["type"], string> = {
    "Market Observation": "bg-primary/10 text-primary",
    "Flag for Review": "bg-signal-magenta/10 text-signal-magenta",
    "General Comment": "bg-signal-green/10 text-signal-green",
    "Valuation Query": "bg-primary/10 text-primary",
    "Data Discrepancy": "bg-signal-orange/10 text-signal-orange",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
        tone[type],
      )}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: SpStatus }) {
  const tone: Record<SpStatus, string> = {
    Completed: "bg-signal-green/15 text-signal-green",
    "Under Offer": "bg-signal-orange/15 text-signal-orange",
    "En Bloc": "bg-primary/10 text-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        tone[status],
      )}
    >
      {status}
    </span>
  );
}
