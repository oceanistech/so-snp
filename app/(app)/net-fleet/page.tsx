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
import { AppCardHeader } from "@/components/app/card-header";
import { SegmentInsightPanel } from "@/components/app/segment-insight-panel";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — sub-segment fleet roll, fleet balance, deliveries, age profile,
 * orderbook tables, demolitions, deliveries calendar, historical summary.
 * Mirrors html/net-fleet.html.
 * -------------------------------------------------------------------------- */

type TagKey = "bulk" | "tanker" | "cont" | "gas";

const TAG_STYLE: Record<TagKey, string> = {
  bulk: "bg-primary/10 text-primary",
  tanker: "bg-signal-orange/10 text-signal-orange",
  cont: "bg-signal-purple/10 text-signal-purple",
  gas: "bg-accent/10 text-accent",
};

const TAG_LABEL: Record<TagKey, string> = {
  bulk: "Bulk Carrier",
  tanker: "Tanker",
  cont: "Container",
  gas: "LNG",
};

/* ── Fleet Overview — sub-segment table ──────────────────────────── */

type SubSegmentRow = {
  name: string;
  tag: TagKey;
  active: string;
  onOrder: string;
  ratio: string;
  ratioTone: "blue" | "green" | "orange";
  ytdDeliveries: string;
  ytdScrapped: string;
  netChange: string;
  netDirection: "up" | "down" | "neutral";
};

const SUB_SEGMENTS: SubSegmentRow[] = [
  { name: "Capesize",  tag: "bulk", active: "382,400 kt", onOrder: "34,800 kt", ratio: "9.1%",  ratioTone: "blue",   ytdDeliveries: "+5,200 kt", ytdScrapped: "−820 kt",   netChange: "+4,380 kt", netDirection: "up" },
  { name: "Panamax",   tag: "bulk", active: "244,100 kt", onOrder: "18,600 kt", ratio: "7.6%",  ratioTone: "green",  ytdDeliveries: "+3,100 kt", ytdScrapped: "−1,200 kt", netChange: "+1,900 kt", netDirection: "up" },
  { name: "Supramax",  tag: "bulk", active: "198,600 kt", onOrder: "14,200 kt", ratio: "7.1%",  ratioTone: "green",  ytdDeliveries: "+2,400 kt", ytdScrapped: "−2,100 kt", netChange: "+300 kt",   netDirection: "up" },
  { name: "Handysize", tag: "bulk", active: "157,300 kt", onOrder: "17,000 kt", ratio: "10.8%", ratioTone: "orange", ytdDeliveries: "+4,100 kt", ytdScrapped: "−2,080 kt", netChange: "+2,020 kt", netDirection: "up" },
];

const SUB_SEGMENT_TOTAL = {
  active: "982,400 kt",
  onOrder: "84,600 kt",
  ratio: "8.6%",
  ytdDeliveries: "+14,800 kt",
  ytdScrapped: "−6,200 kt",
  netChange: "+8,600 kt",
};

/* ── Fleet Balance flow ──────────────────────────────────────────── */

type FlowRow = { label: string; tone: "muted" | "green" | "magenta" | "orange"; barPct: number; value: string };

const FLEET_BALANCE: FlowRow[] = [
  { label: "Fleet Start (Jan)",     tone: "muted",   barPct: 0,  value: "973.8M DWT" },
  { label: "Deliveries YTD",         tone: "green",   barPct: 72, value: "+14.8M" },
  { label: "Demolitions YTD",        tone: "magenta", barPct: 31, value: "−6.2M" },
  { label: "Total Losses / Other",   tone: "orange",  barPct: 10, value: "−0.0M" },
];

/* ── Upcoming Deliveries (right column on Fleet Overview) ────────── */

type UpcomingRow = { name: string; meta: string; eta: string; status: "ontrack" | "delayed" | "ordered" };

const UPCOMING_DELIVERIES_SHORT: UpcomingRow[] = [
  { name: "MV Cape Fortuna",   meta: "Hyundai HI · 181,000 DWT Capesize",       eta: "Apr 2026", status: "ontrack" },
  { name: "MV Atlantic Star",  meta: "CSSC · 82,000 DWT Panamax",                eta: "Apr 2026", status: "ontrack" },
  { name: "MV Pacific Horizon",meta: "Imabari SB · 61,000 DWT Supra",            eta: "May 2026", status: "delayed" },
  { name: "MV Ocean Pioneer",  meta: "DSME · 208,000 DWT Newcastlemax",          eta: "May 2026", status: "ontrack" },
  { name: "MV Baltic Spirit",  meta: "Yangzijiang · 38,000 DWT Handy",           eta: "Jun 2026", status: "ordered" },
];

const UPCOMING_STATUS_LABEL: Record<UpcomingRow["status"], string> = {
  ontrack: "On track",
  delayed: "Delayed 2w",
  ordered: "On order",
};

const UPCOMING_STATUS_TONE: Record<UpcomingRow["status"], string> = {
  ontrack: "bg-signal-green/15 text-signal-green",
  delayed: "bg-signal-orange/15 text-signal-orange",
  ordered: "bg-primary/10 text-primary",
};

/* ── Age Profile ────────────────────────────────────────────────── */

const AGE_PROFILE = [
  { bucket: "0–5 years",                pct: 22.4, tone: "green"    as const },
  { bucket: "6–10 years",               pct: 31.8, tone: "blue"     as const },
  { bucket: "11–15 years",              pct: 28.1, tone: "muted"    as const },
  { bucket: "16–20 years",              pct: 12.6, tone: "orange"   as const },
  { bucket: "20+ years (potential scrap)", pct: 5.1, tone: "magenta" as const },
];

const AGE_TONE: Record<typeof AGE_PROFILE[number]["tone"], string> = {
  green: "bg-signal-green",
  blue: "bg-primary",
  muted: "bg-muted-foreground/50",
  orange: "bg-signal-orange",
  magenta: "bg-signal-magenta",
};

const AGE_TEXT_TONE: Record<typeof AGE_PROFILE[number]["tone"], string> = {
  green: "text-signal-green",
  blue: "text-primary",
  muted: "text-muted-foreground",
  orange: "text-signal-orange",
  magenta: "text-signal-magenta",
};

/* ── Orderbook tab ──────────────────────────────────────────────── */

type OrderRow = {
  type: TagKey;
  vessels: number;
  dwt: string;
  pctFleet: string;
  pctTone: "blue" | "green" | "orange";
  avgEta: string;
};

const ORDERBOOK_BY_TYPE: OrderRow[] = [
  { type: "bulk",   vessels: 312, dwt: "48.2M", pctFleet: "9.8%",  pctTone: "orange", avgEta: "Q3 2027" },
  { type: "tanker", vessels: 189, dwt: "22.4M", pctFleet: "7.1%",  pctTone: "green",  avgEta: "Q4 2026" },
  { type: "cont",   vessels: 224, dwt: "8.6M",  pctFleet: "6.2%",  pctTone: "green",  avgEta: "Q2 2027" },
  { type: "gas",    vessels: 148, dwt: "5.4M",  pctFleet: "14.2%", pctTone: "blue",   avgEta: "Q1 2028" },
];

type YardRow = {
  yard: string;
  country: string;
  vessels: number;
  dwt: string;
  share: string;
  shareTone: "blue" | "green" | "muted";
};

const TOP_YARDS: YardRow[] = [
  { yard: "DSME",          country: "South Korea", vessels: 142, dwt: "18.4M", share: "21.7%", shareTone: "blue"  },
  { yard: "CSSC",          country: "China",       vessels: 118, dwt: "14.2M", share: "16.8%", shareTone: "blue"  },
  { yard: "HHI",           country: "South Korea", vessels: 98,  dwt: "12.1M", share: "14.3%", shareTone: "green" },
  { yard: "Cosco",         country: "China",       vessels: 86,  dwt: "9.8M",  share: "11.6%", shareTone: "green" },
  { yard: "Samsung Heavy", country: "South Korea", vessels: 74,  dwt: "8.6M",  share: "10.2%", shareTone: "muted" },
];

/* ── Demolitions tab ────────────────────────────────────────────── */

type DemoSegmentRow = {
  type: TagKey;
  vessels: number;
  dwt: string;
  avgAge: string;
  avgPrice: string;
};

const DEMO_BY_SEGMENT: DemoSegmentRow[] = [
  { type: "bulk",   vessels: 28, dwt: "3.2M", avgAge: "27.1 yrs", avgPrice: "$458" },
  { type: "tanker", vessels: 14, dwt: "1.8M", avgAge: "25.8 yrs", avgPrice: "$471" },
  { type: "cont",   vessels: 22, dwt: "0.9M", avgAge: "32.4 yrs", avgPrice: "$412" },
  { type: "cont",   vessels: 8,  dwt: "0.3M", avgAge: "24.1 yrs", avgPrice: "$489" },
];

const DEMO_SEGMENT_LABELS = ["Bulk Carrier", "Tanker", "General Cargo", "Container"];

const TOP_DEMO_YARDS = [
  { yard: "Alang",      country: "India",      vessels: 28, dwt: "2.6M" },
  { yard: "Chittagong", country: "Bangladesh", vessels: 18, dwt: "1.8M" },
  { yard: "Gadani",     country: "Pakistan",   vessels: 12, dwt: "1.1M" },
  { yard: "Aliaga",     country: "Turkey",     vessels: 14, dwt: "0.7M" },
];

/* ── Deliveries Calendar tab ────────────────────────────────────── */

type DeliveryRow = {
  vessel: string;
  type: TagKey;
  spec: string;
  dwt: string;
  yard: string;
  owner: string;
  eta: string;
  status: "On Schedule" | "Delayed" | "Sea Trial";
};

const DELIVERIES_90D: DeliveryRow[] = [
  { vessel: "MV Cape Fortuna",   type: "bulk",  spec: "Capesize",     dwt: "181,000",     yard: "Hyundai HI",      owner: "Pacific Bulk Ltd",     eta: "04 Apr 2026", status: "On Schedule" },
  { vessel: "MV Atlantic Star",  type: "bulk",  spec: "Panamax",      dwt: "82,000",      yard: "CSSC Hudong",     owner: "Nordic Bulk AS",       eta: "12 Apr 2026", status: "On Schedule" },
  { vessel: "MV Pacific Horizon",type: "bulk",  spec: "Supramax",     dwt: "61,000",      yard: "Imabari SB",      owner: "Imabari Shipping",     eta: "24 Apr 2026", status: "Delayed" },
  { vessel: "MV Ocean Pioneer",  type: "bulk",  spec: "Newcastlemax", dwt: "208,000",     yard: "DSME",            owner: "Star Bulk Carriers",   eta: "02 May 2026", status: "On Schedule" },
  { vessel: "MV Baltic Spirit",  type: "bulk",  spec: "Handysize",    dwt: "38,000",      yard: "Yangzijiang SB",  owner: "Grieg Maritime",       eta: "18 May 2026", status: "Sea Trial" },
  { vessel: "MT Perseus Voyager",type: "tanker",spec: "Aframax",      dwt: "115,000",     yard: "Samsung Heavy",   owner: "Frontline Ltd",        eta: "28 May 2026", status: "On Schedule" },
  { vessel: "MV Kestrel Arrow",  type: "bulk",  spec: "Ultramax",     dwt: "64,000",      yard: "New Times SB",    owner: "Golden Ocean",         eta: "05 Jun 2026", status: "Delayed" },
  { vessel: "LNG Coral Nebula",  type: "gas",   spec: "LNG Carrier",  dwt: "174,000 cbm", yard: "HHI",             owner: "Shell Int'l Trading",  eta: "19 Jun 2026", status: "Sea Trial" },
];

const DELIVERY_STATUS_TONE: Record<DeliveryRow["status"], string> = {
  "On Schedule": "bg-signal-green/15 text-signal-green",
  "Delayed": "bg-signal-orange/15 text-signal-orange",
  "Sea Trial": "bg-primary/10 text-primary",
};

/* ── Historical Trends tab ──────────────────────────────────────── */

type HistoryRow = {
  year: string;
  active: string;
  orderbook: string;
  demolitions: string;
  net: string;
  netDirection: "up" | "down";
  yoy: string;
  yoyDirection: "up" | "down";
  highlight?: boolean;
};

const HISTORY_ROWS: HistoryRow[] = [
  { year: "2016",     active: "782.4", orderbook: "98.2M", demolitions: "26.1M", net: "−8.4M",  netDirection: "down", yoy: "−1.1%",  yoyDirection: "down" },
  { year: "2017",     active: "798.6", orderbook: "82.4M", demolitions: "18.6M", net: "+16.2M", netDirection: "up",   yoy: "+2.1%",  yoyDirection: "up" },
  { year: "2018",     active: "824.2", orderbook: "74.8M", demolitions: "12.4M", net: "+25.6M", netDirection: "up",   yoy: "+3.2%",  yoyDirection: "up" },
  { year: "2019",     active: "849.8", orderbook: "68.2M", demolitions: "19.8M", net: "+25.6M", netDirection: "up",   yoy: "+3.1%",  yoyDirection: "up" },
  { year: "2020",     active: "868.4", orderbook: "62.1M", demolitions: "24.2M", net: "+18.6M", netDirection: "up",   yoy: "+2.2%",  yoyDirection: "up" },
  { year: "2021",     active: "884.6", orderbook: "58.8M", demolitions: "8.4M",  net: "+16.2M", netDirection: "up",   yoy: "+1.9%",  yoyDirection: "up" },
  { year: "2022",     active: "902.8", orderbook: "64.2M", demolitions: "6.2M",  net: "+18.2M", netDirection: "up",   yoy: "+2.1%",  yoyDirection: "up" },
  { year: "2023",     active: "928.4", orderbook: "72.4M", demolitions: "7.8M",  net: "+25.6M", netDirection: "up",   yoy: "+2.8%",  yoyDirection: "up" },
  { year: "2024",     active: "954.2", orderbook: "78.6M", demolitions: "9.4M",  net: "+25.8M", netDirection: "up",   yoy: "+2.8%",  yoyDirection: "up" },
  { year: "2025",     active: "973.8", orderbook: "82.1M", demolitions: "7.6M",  net: "+19.6M", netDirection: "up",   yoy: "+2.1%",  yoyDirection: "up" },
  { year: "2026 YTD", active: "982.4", orderbook: "84.6M", demolitions: "6.2M",  net: "+8.6M",  netDirection: "up",   yoy: "+0.88%", yoyDirection: "up", highlight: true },
];

/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "overview",   label: "Fleet Overview",      title: "Net Fleet Development", subtitle: "Track global fleet supply: newbuildings, demolitions and net growth by segment" },
  { id: "orderbook",  label: "Orderbook",           title: "Orderbook",             subtitle: "Vessels currently on order — yard, delivery quarter, dwt and owner" },
  { id: "demo",       label: "Demolitions",         title: "Demolitions",           subtitle: "Recent and forecasted demolitions across the fleet" },
  { id: "calendar",   label: "Deliveries Calendar", title: "Deliveries Calendar",   subtitle: "Forward delivery schedule by month — segment and yard breakdown" },
  { id: "history",    label: "Historical Trends",   title: "Historical Fleet Trends", subtitle: "Long-run net fleet growth, scrap age, and orderbook ratio history" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function NetFleetPage() {
  const [active, setActive] = React.useState<TabId>("overview");
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Market" },
          { label: "Net Fleet" },
          ...(active !== "overview" ? [{ label: activeTab.label }] : []),
        ]}
        title={activeTab.title}
        subtitle={activeTab.subtitle}
        actions={
          <>
            <SegmentPills />
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
        {/* Segment Insight Panel — same data as valuations */}
        <SegmentInsightPanel />

        {active === "overview" ? <FleetOverviewPanel /> : null}
        {active === "orderbook" ? <OrderbookPanel /> : null}
        {active === "demo" ? <DemolitionsPanel /> : null}
        {active === "calendar" ? <DeliveriesCalendarPanel /> : null}
        {active === "history" ? <HistoryPanel /> : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Fleet Overview
 * -------------------------------------------------------------------------- */

function FleetOverviewPanel() {
  return (
    <>
      {/* KPI strip */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Active Fleet (DWT)" value="982.4M" meta="Bulk Carriers" accent="blue" />
        <KpiCard label="Orderbook (DWT)" value="84.6M" direction="up" change="8.6% of fleet" accent="green" />
        <KpiCard label="Demolitions YTD" value="6.2M" direction="down" change="−18% vs 2025" accent="magenta" />
        <KpiCard label="Deliveries YTD" value="14.8M" meta="DWT delivered 2026" accent="cyan" />
        <Card className="flex flex-col rounded-md border border-l-[6px] border-l-signal-green bg-signal-green/5 p-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-signal-green">
            Net Fleet Growth
          </div>
          <div className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-signal-green">
            +8.6M
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            DWT · YTD 2026 · deliveries minus demolitions
          </div>
        </Card>
      </section>

      {/* 7-3 split */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        {/* LEFT — chart + sub-segment table */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  Net Fleet Development — Bulk Carriers
                </CardTitle>
                <CardDescription>
                  Monthly deliveries minus demolitions · DWT million
                </CardDescription>
              </div>
              <select className="h-7 rounded-md border border-input bg-background px-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>2026 YTD</option>
                <option>Last 12M</option>
                <option>3 Years</option>
                <option>5 Years</option>
              </select>
            </CardHeader>
            <CardContent>
              <ChartLegend
                items={[
                  { label: "Deliveries", color: "bg-signal-green" },
                  { label: "Demolitions", color: "bg-signal-magenta" },
                  { label: "Net (line)", color: "bg-primary" },
                ]}
              />
              <ChartPlaceholder height="h-64" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <AppCardHeader
              title="Fleet by Sub-Segment"
              subtitle="Active fleet · orderbook · YTD churn — DWT in thousand tonnes"
              actions={
                <Button size="sm" variant="ghost" className="text-[11px]">
                  View Full Breakdown
                </Button>
              }
            />
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Segment</th>
                  <th className="px-4 py-2 text-right">Active Fleet</th>
                  <th className="px-4 py-2 text-right">On Order</th>
                  <th className="px-4 py-2 text-right">Order / Fleet</th>
                  <th className="px-4 py-2 text-right">YTD Deliveries</th>
                  <th className="px-4 py-2 text-right">YTD Scrapped</th>
                  <th className="px-4 py-2 text-right">Net Change</th>
                </tr>
              </thead>
              <tbody>
                {SUB_SEGMENTS.map((s) => (
                  <tr key={s.name} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <SegmentTag tag={s.tag} label={s.name} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums">{s.active}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {s.onOrder}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <RatioPill ratio={s.ratio} tone={s.ratioTone} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-signal-green">
                      {s.ytdDeliveries}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-signal-magenta">
                      {s.ytdScrapped}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-bold tabular-nums",
                        s.netDirection === "up" && "text-signal-green",
                        s.netDirection === "down" && "text-signal-magenta",
                        s.netDirection === "neutral" && "text-muted-foreground",
                      )}
                    >
                      {s.netChange}
                    </td>
                  </tr>
                ))}
                <tr className="bg-primary/5 font-bold">
                  <td className="px-4 py-2.5">Total Bulk</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{SUB_SEGMENT_TOTAL.active}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{SUB_SEGMENT_TOTAL.onOrder}</td>
                  <td className="px-4 py-2.5 text-right">
                    <RatioPill ratio={SUB_SEGMENT_TOTAL.ratio} tone="blue" />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-signal-green">
                    {SUB_SEGMENT_TOTAL.ytdDeliveries}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-signal-magenta">
                    {SUB_SEGMENT_TOTAL.ytdScrapped}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-signal-green">
                    {SUB_SEGMENT_TOTAL.netChange}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        {/* RIGHT — Fleet Balance + Upcoming Deliveries + Age Profile */}
        <div className="flex flex-col gap-3 lg:col-span-3">
          {/* Fleet Balance flow */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Fleet Balance (2026)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 py-3">
              {FLEET_BALANCE.map((row) => (
                <FleetBalanceRow key={row.label} row={row} />
              ))}
              <div className="mt-1 flex items-center justify-between border-t-2 bg-signal-green/5 px-2 py-2 text-[12px] font-bold">
                <span>Fleet Now (Mar 2026)</span>
                <span className="text-signal-green">982.4M DWT</span>
              </div>
              <div className="mt-2 px-2">
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-muted-foreground">YTD Net Growth</span>
                  <span className="font-semibold text-signal-green">+0.88%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-signal-green" style={{ width: "60%" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deliveries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
              <CardTitle className="text-base">Upcoming Deliveries</CardTitle>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Next 90 days
              </span>
            </CardHeader>
            <ul className="divide-y">
              {UPCOMING_DELIVERIES_SHORT.map((u) => (
                <li key={u.name} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold">{u.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{u.meta}</p>
                  </div>
                  <span className="whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
                    {u.eta}
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold",
                      UPCOMING_STATUS_TONE[u.status],
                    )}
                  >
                    {UPCOMING_STATUS_LABEL[u.status]}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Age Profile */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Fleet Age Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 py-3">
              {AGE_PROFILE.map((a) => (
                <div key={a.bucket}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span>{a.bucket}</span>
                    <span className={cn("font-semibold tabular-nums", AGE_TEXT_TONE[a.tone])}>
                      {a.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", AGE_TONE[a.tone])}
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Orderbook
 * -------------------------------------------------------------------------- */

function OrderbookPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Orderbook DWT" value="84.6M" meta="Total across all segments" accent="blue" />
        <KpiCard
          label="Orderbook / Fleet Ratio"
          value="8.6%"
          direction="up"
          change="vs 7.9% last year"
          accent="green"
        />
        <KpiCard
          label="Avg Delivery Lead Time"
          value="18 mo"
          meta="From contract to delivery"
          accent="cyan"
        />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Orderbook by Vessel Type</CardTitle>
              <CardDescription>Active orders as of March 2026</CardDescription>
            </CardHeader>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Vessels on Order</th>
                  <th className="px-4 py-2 text-right">Total DWT</th>
                  <th className="px-4 py-2 text-right">% of Active Fleet</th>
                  <th className="px-4 py-2 text-right">Avg Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {ORDERBOOK_BY_TYPE.map((r) => (
                  <tr key={r.type} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <SegmentTag tag={r.type} label={TAG_LABEL[r.type]} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums">
                      {r.vessels}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.dwt}</td>
                    <td className="px-4 py-2.5 text-right">
                      <RatioPill ratio={r.pctFleet} tone={r.pctTone} />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {r.avgEta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Orderbook Delivery Schedule</CardTitle>
              <CardDescription>Monthly DWT 2026–2029</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder height="h-64" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Top Shipyards by Orderbook</CardTitle>
            </CardHeader>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2 text-left">Yard</th>
                  <th className="px-3 py-2 text-left">Country</th>
                  <th className="px-3 py-2 text-right">Vessels</th>
                  <th className="px-3 py-2 text-right">DWT</th>
                  <th className="px-3 py-2 text-right">% Share</th>
                </tr>
              </thead>
              <tbody>
                {TOP_YARDS.map((y) => (
                  <tr key={y.yard} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5 font-semibold">{y.yard}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{y.country}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{y.vessels}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{y.dwt}</td>
                    <td className="px-3 py-2.5 text-right">
                      <RatioPill ratio={y.share} tone={y.shareTone} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Demolitions
 * -------------------------------------------------------------------------- */

function DemolitionsPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Demolitions YTD" value="6.2M DWT" meta="2026 year to date" accent="magenta" />
        <KpiCard label="Avg Age at Demo" value="26.4 yrs" meta="Weighted average" accent="orange" />
        <KpiCard label="Avg Demo Price" value="$462/LDT" meta="All yards combined" accent="cyan" />
        <KpiCard
          label="Demo Rate vs 2025"
          value="−18%"
          direction="down"
          change="Lower demolition activity"
          accent="magenta"
        />
      </section>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Monthly Demolition Volume</CardTitle>
          <CardDescription>2026 YTD vs 2025 — DWT</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPlaceholder height="h-64" />
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <Card className="overflow-hidden lg:col-span-7">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Demolitions by Segment</CardTitle>
            <CardDescription>2026 YTD breakdown</CardDescription>
          </CardHeader>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Segment</th>
                <th className="px-4 py-2 text-right">Vessels</th>
                <th className="px-4 py-2 text-right">DWT</th>
                <th className="px-4 py-2 text-right">Avg Age</th>
                <th className="px-4 py-2 text-right">Avg Price/LDT</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_BY_SEGMENT.map((r, i) => (
                <tr key={`${r.type}-${i}`} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <SegmentTag tag={r.type} label={DEMO_SEGMENT_LABELS[i]} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">
                    {r.vessels}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.dwt}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {r.avgAge}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.avgPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden lg:col-span-3">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Top Demo Yards</CardTitle>
          </CardHeader>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Yard</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-right">Vessels</th>
                <th className="px-3 py-2 text-right">DWT</th>
              </tr>
            </thead>
            <tbody>
              {TOP_DEMO_YARDS.map((y) => (
                <tr key={y.yard} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-semibold">{y.yard}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{y.country}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{y.vessels}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{y.dwt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Deliveries Calendar
 * -------------------------------------------------------------------------- */

function DeliveriesCalendarPanel() {
  return (
    <>
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Filters
          </span>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            <option>All Months</option>
            <option>March 2026</option>
            <option>April 2026</option>
            <option>May 2026</option>
            <option>June 2026</option>
          </select>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            <option>All Segments</option>
            <option>Bulk Carrier</option>
            <option>Tanker</option>
            <option>Container</option>
            <option>LNG</option>
          </select>
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-muted-foreground">DWT:</span>
            <input
              type="text"
              placeholder="Min"
              className="h-9 w-20 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="text"
              placeholder="Max"
              className="h-9 w-20 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button size="sm" className="ml-auto">Apply Filters</Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-base">Upcoming Deliveries — Next 90 Days</CardTitle>
            <CardDescription>{DELIVERIES_90D.length} vessels scheduled</CardDescription>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {DELIVERIES_90D.length} vessels
          </span>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">DWT</th>
                <th className="px-4 py-2 text-left">Yard</th>
                <th className="px-4 py-2 text-left">Owner</th>
                <th className="px-4 py-2 text-right">Expected Delivery</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERIES_90D.map((d) => (
                <tr key={d.vessel} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">{d.vessel}</td>
                  <td className="px-4 py-2.5">
                    <SegmentTag tag={d.type} label={d.spec} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                    {d.dwt}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.yard}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.owner}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {d.eta}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                        DELIVERY_STATUS_TONE[d.status],
                      )}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Delivery Density</CardTitle>
          <CardDescription>Mar–Dec 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPlaceholder height="h-44" />
        </CardContent>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Historical Trends
 * -------------------------------------------------------------------------- */

function HistoryPanel() {
  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">
            Net Fleet Growth — Annual DWT Change
          </CardTitle>
          <CardDescription>2010–2026</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPlaceholder height="h-64" />
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Orderbook / Fleet Ratio</CardTitle>
            <CardDescription>Historical · global fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder height="h-56" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Demolition Rate</CardTitle>
            <CardDescription>Historical · DWT scrapped per year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder height="h-56" />
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">10-Year Summary Table</CardTitle>
          <CardDescription>Bulk carrier fleet metrics 2016–2026</CardDescription>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Year</th>
              <th className="px-4 py-2 text-right">Active Fleet (DWT M)</th>
              <th className="px-4 py-2 text-right">Orderbook</th>
              <th className="px-4 py-2 text-right">Demolitions</th>
              <th className="px-4 py-2 text-right">Net Change</th>
              <th className="px-4 py-2 text-right">YoY %</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY_ROWS.map((r) => (
              <tr
                key={r.year}
                className={cn(
                  "border-b last:border-0 hover:bg-muted/30",
                  r.highlight && "bg-signal-green/5 font-bold",
                )}
              >
                <td className="px-4 py-2.5">{r.year}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.active}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.orderbook}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.demolitions}</td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right tabular-nums",
                    r.netDirection === "up" ? "text-signal-green" : "text-signal-magenta",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {r.netDirection === "up" ? (
                      <ArrowUp className="size-2.5" />
                    ) : (
                      <ArrowDown className="size-2.5" />
                    )}
                    {r.net}
                  </span>
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 text-right tabular-nums",
                    r.yoyDirection === "up" ? "text-signal-green" : "text-signal-magenta",
                  )}
                >
                  {r.yoy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function SegmentPills() {
  type Seg = {
    label: string;
    active: boolean;
    activeClass: string;
  };
  const segs: Seg[] = [
    { label: "Bulk", active: true, activeClass: "bg-primary text-primary-foreground" },
    { label: "Tanker", active: true, activeClass: "bg-signal-orange text-white" },
    { label: "Container", active: true, activeClass: "bg-signal-purple text-white" },
    { label: "Gas", active: true, activeClass: "bg-accent text-accent-foreground" },
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

function SegmentTag({ tag, label }: { tag: TagKey; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold",
        TAG_STYLE[tag],
      )}
    >
      {label}
    </span>
  );
}

function RatioPill({
  ratio,
  tone,
}: {
  ratio: string;
  tone: "blue" | "green" | "orange" | "muted";
}) {
  const TONE: Record<typeof tone, string> = {
    blue: "bg-primary/10 text-primary",
    green: "bg-signal-green/10 text-signal-green",
    orange: "bg-signal-orange/10 text-signal-orange",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
        TONE[tone],
      )}
    >
      {ratio}
    </span>
  );
}

function FleetBalanceRow({ row }: { row: FlowRow }) {
  const TONE_TEXT: Record<FlowRow["tone"], string> = {
    muted: "text-foreground",
    green: "text-signal-green",
    magenta: "text-signal-magenta",
    orange: "text-signal-orange",
  };
  const TONE_BAR: Record<FlowRow["tone"], string> = {
    muted: "bg-muted",
    green: "bg-signal-green",
    magenta: "bg-signal-magenta",
    orange: "bg-signal-orange",
  };
  return (
    <div className="flex items-center gap-2 px-2 text-[12px]">
      <span className="flex-1 truncate text-muted-foreground">
        {row.tone === "muted" ? (
          row.label
        ) : (
          <span className={cn("inline-flex items-center gap-1.5 font-semibold", TONE_TEXT[row.tone])}>
            {row.tone === "green" ? (
              <ArrowUp className="size-3" />
            ) : row.tone === "magenta" || row.tone === "orange" ? (
              <ArrowDown className="size-3" />
            ) : null}
            {row.label}
          </span>
        )}
      </span>
      {row.barPct > 0 ? (
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full", TONE_BAR[row.tone])} style={{ width: `${row.barPct}%` }} />
        </div>
      ) : null}
      <span className={cn("w-20 text-right font-bold tabular-nums", TONE_TEXT[row.tone])}>
        {row.value}
      </span>
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
