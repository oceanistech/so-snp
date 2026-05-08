"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, FileText, Plus } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data
 * -------------------------------------------------------------------------- */

type Tx = {
  id: string;
  date: string;
  vesselImo: string;
  vessel: string;
  type: VesselType;
  built: number;
  dwt: number;
  price: string;
  priceM: number;        // numeric for analytics
  buyer: string;
  seller: string;
  broker: string;
  mode: "Sale" | "Bareboat" | "Resale";
};

const TXNS: Tx[] = [
  { id: "SP-2026-0142", date: "2026-03-22", vesselImo: "9450112", vessel: "MV Sea Breeze",       type: "Bulk Carrier", built: 2012, dwt: 76800,  price: "$28.4M", priceM: 28.4,  buyer: "Pacific Maritime",      seller: "Star Bulk Carriers", broker: "Clarksons",     mode: "Sale" },
  { id: "SP-2026-0141", date: "2026-03-20", vesselImo: "9617832", vessel: "MV Atlantic Pioneer", type: "Tanker",       built: 2009, dwt: 158000, price: "$22.1M", priceM: 22.1,  buyer: "Diana Shipping",        seller: "Scorpio Tankers",     broker: "Braemar",       mode: "Sale" },
  { id: "SP-2026-0140", date: "2026-03-18", vesselImo: "9762890", vessel: "MV Star Voyager",     type: "Container",    built: 2018, dwt: 86000,  price: "$84.5M", priceM: 84.5,  buyer: "Maersk",                seller: "Hapag-Lloyd",         broker: "Howe Robinson", mode: "Sale" },
  { id: "SP-2026-0139", date: "2026-03-15", vesselImo: "9885640", vessel: "MV Cape Fortuna",     type: "Bulk Carrier", built: 2019, dwt: 80000,  price: "$25.1M", priceM: 25.1,  buyer: "Oldendorff Carriers",   seller: "Diana Shipping",      broker: "Affinity",      mode: "Resale" },
  { id: "SP-2026-0138", date: "2026-03-12", vesselImo: "9742158", vessel: "MV Nordic Eagle",     type: "Tanker",       built: 2014, dwt: 105000, price: "$42.8M", priceM: 42.8,  buyer: "Frontline",             seller: "Euronav",             broker: "Clarksons",     mode: "Sale" },
  { id: "SP-2026-0137", date: "2026-03-10", vesselImo: "9888420", vessel: "MT Cosmos Trader",    type: "Tanker",       built: 2020, dwt: 49500,  price: "$36.9M", priceM: 36.9,  buyer: "Teekay Tankers",        seller: "Ardmore Shipping",    broker: "Maersk Broker", mode: "Bareboat" },
  { id: "SP-2026-0136", date: "2026-03-08", vesselImo: "9905611", vessel: "MV Coral Bay",        type: "Bulk Carrier", built: 2021, dwt: 62100,  price: "$32.4M", priceM: 32.4,  buyer: "Eagle Bulk",            seller: "Genco Shipping",      broker: "Howe Robinson", mode: "Sale" },
  { id: "SP-2026-0135", date: "2026-03-05", vesselImo: "9712305", vessel: "MT Helios Trader",    type: "Tanker",       built: 2014, dwt: 158400, price: "$62.0M", priceM: 62.0,  buyer: "Tsakos Energy",         seller: "DHT Holdings",        broker: "Braemar",       mode: "Sale" },
];

const MODE_STYLE = {
  Sale: "bg-signal-green/15 text-signal-green",
  Bareboat: "bg-primary/15 text-primary",
  Resale: "bg-signal-orange/15 text-signal-orange",
} as const;

const TABS = [
  { id: "recent",  label: "Recent",       title: "Recent S&P Transactions", subtitle: "Latest detected sale & purchase transactions across all vessel types" },
  { id: "segment", label: "By Segment",   title: "S&P by Segment",          subtitle: "Transaction volume and average price broken down by vessel segment" },
  { id: "analyt",  label: "Analytics",    title: "S&P Analytics",           subtitle: "Time-series of deal counts, average prices and rolling momentum" },
  { id: "share",   label: "Market Share", title: "Market Share",            subtitle: "Buyer and seller league tables across the major shipping segments" },
  { id: "export",  label: "Export",       title: "Export Transactions",     subtitle: "Download S&P data in CSV, XLSX, or JSON for downstream analysis" },
] as const;

/* -------------------------------------------------------------------------- */

export default function SPTransactionsPage() {
  const [active, setActive] = React.useState<(typeof TABS)[number]["id"]>("recent");
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "S&P Transactions" },
          ...(active !== "recent" ? [{ label: activeTab.label }] : []),
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
              Log Transaction
            </Button>
          </>
        }
      />

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

      {active === "recent" ? <RecentPanel /> : null}
      {active === "segment" ? <BySegmentPanel /> : null}
      {active === "analyt" ? <AnalyticsPanel /> : null}
      {active === "share" ? <MarketSharePanel /> : null}
      {active === "export" ? <ExportPanel /> : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — Recent
 * -------------------------------------------------------------------------- */

function RecentPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Transactions (30d)" value={String(TXNS.length)} direction="up" change="+3 vs prior period" accent="blue" />
        <KpiCard label="Total Value" value="$334.2M" direction="up" change="+12.4% vs prior period" accent="green" />
        <KpiCard label="Avg Sale Price" value="$41.8M" meta="Across all vessel types" accent="cyan" />
        <KpiCard label="Most Active Type" value="Tanker" meta="4 transactions this period" accent="orange" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Recent Transactions</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Last 30 days across global S&P market
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">TX ID</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Built</th>
                <th className="px-3 py-2 text-right">DWT</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-left">Buyer</th>
                <th className="px-3 py-2 text-left">Seller</th>
                <th className="px-3 py-2 text-left">Broker</th>
                <th className="px-3 py-2 text-left">Mode</th>
              </tr>
            </thead>
            <tbody>
              {TXNS.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground">{t.id}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{t.date}</td>
                  <td className="px-3 py-2.5">
                    <Link href={`/vessels/${t.vesselImo}`} className="font-semibold hover:text-primary">
                      {t.vessel}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5"><VesselTypeBadge value={t.type} /></td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{t.built}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{t.dwt.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">{t.price}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{t.buyer}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{t.seller}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{t.broker}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", MODE_STYLE[t.mode])}>
                      {t.mode}
                    </span>
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

/* --------------------------------------------------------------------------
 * Tab 2 — By Segment
 * -------------------------------------------------------------------------- */

function BySegmentPanel() {
  // Group transactions by vessel type for the segment summary.
  const groups = ["Bulk Carrier", "Tanker", "Container"].map((typeLabel) => {
    const items = TXNS.filter((t) => t.type === (typeLabel as VesselType));
    const totalM = items.reduce((sum, t) => sum + t.priceM, 0);
    const avgM = items.length ? totalM / items.length : 0;
    return { typeLabel: typeLabel as VesselType, items, totalM, avgM };
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.typeLabel} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <VesselTypeBadge value={g.typeLabel} />
              <span className="text-[11px] text-muted-foreground">
                {g.items.length} {g.items.length === 1 ? "deal" : "deals"}
              </span>
            </div>
            <p className="mt-3 text-[18px] font-extrabold tabular-nums text-primary">
              ${g.totalM.toFixed(1)}M
            </p>
            <p className="text-[11px] text-muted-foreground">
              total volume · avg ${g.avgM.toFixed(1)}M
            </p>
          </Card>
        ))}
      </section>

      {groups.map((g) => (
        <Card key={`${g.typeLabel}-table`} className="overflow-hidden">
          <CardHeader className="border-b">
            <h2 className="flex items-center gap-2 text-[14px] font-bold">
              <VesselTypeBadge value={g.typeLabel} />
              {g.typeLabel} transactions
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {g.items.length} {g.items.length === 1 ? "transaction" : "transactions"} · ${g.totalM.toFixed(1)}M total
            </p>
          </CardHeader>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Built</th>
                <th className="px-4 py-2 text-right">DWT</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-left">Buyer</th>
                <th className="px-4 py-2 text-left">Mode</th>
              </tr>
            </thead>
            <tbody>
              {g.items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <Link href={`/vessels/${t.vesselImo}`} className="font-semibold hover:text-primary">
                      {t.vessel}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{t.date}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{t.built}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{t.dwt.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">{t.price}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{t.buyer}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", MODE_STYLE[t.mode])}>
                      {t.mode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 3 — Analytics
 * -------------------------------------------------------------------------- */

function AnalyticsPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Avg Sale Price" value="$41.8M" direction="up" change="+4.2% vs prior period" accent="blue" />
        <KpiCard label="Median Sale Price" value="$36.9M" direction="up" change="+2.1% vs prior period" accent="green" />
        <KpiCard label="Avg Vessel Age" value="14.6 yrs" direction="down" change="−1.2 yrs YoY" accent="orange" />
        <KpiCard label="Avg Days to Close" value="34" direction="down" change="−6d vs prior period" accent="cyan" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-[14px] font-bold">Transaction Volume — Trailing 12 Months</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Monthly USD volume by vessel type</p>
          </CardHeader>
          <div className="p-4">
            <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-primary" />Bulk</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-orange" />Tanker</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-purple" />Container</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-green" />Gas</span>
            </div>
            <div className="relative h-56 overflow-hidden rounded-md border border-dashed bg-muted/40">
              <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
                Chart placeholder · charting library wired in next sprint
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-[14px] font-bold">Sale Price vs FMV</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Discount/premium to estimated FMV at deal date</p>
          </CardHeader>
          <div className="p-4">
            <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-primary" />FMV trend</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-signal-green" />Above FMV</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-signal-magenta" />Below FMV</span>
            </div>
            <div className="relative h-56 overflow-hidden rounded-md border border-dashed bg-muted/40">
              <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
                Scatter placeholder · charting library wired in next sprint
              </div>
            </div>
          </div>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Cohort Analytics</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Per-segment statistics across the trailing 12 months
          </p>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Segment</th>
              <th className="px-4 py-2 text-right">Deals</th>
              <th className="px-4 py-2 text-right">Volume</th>
              <th className="px-4 py-2 text-right">Avg Price</th>
              <th className="px-4 py-2 text-right">Avg Age</th>
              <th className="px-4 py-2 text-right">Avg vs FMV</th>
            </tr>
          </thead>
          <tbody>
            {[
              { seg: "Capesize Bulk",   deals: 36, vol: "$2.1B",  avg: "$58.2M", age: "9.2", vs: "−1.2%", up: false },
              { seg: "Panamax Bulk",    deals: 49, vol: "$1.4B",  avg: "$28.5M", age: "11.8", vs: "+0.4%", up: true },
              { seg: "Supramax Bulk",   deals: 41, vol: "$0.9B",  avg: "$22.4M", age: "13.4", vs: "−2.1%", up: false },
              { seg: "Suezmax Tanker",  deals: 29, vol: "$1.8B",  avg: "$62.0M", age: "10.6", vs: "+1.8%", up: true },
              { seg: "Aframax Tanker",  deals: 25, vol: "$1.2B",  avg: "$48.3M", age: "12.0", vs: "+0.6%", up: true },
              { seg: "MR Tanker",       deals: 17, vol: "$0.6B",  avg: "$36.9M", age: "8.4",  vs: "+2.3%", up: true },
              { seg: "Container",       deals: 6,  vol: "$0.5B",  avg: "$84.5M", age: "7.8",  vs: "−3.4%", up: false },
              { seg: "LNG TFDE",        deals: 2,  vol: "$0.4B",  avg: "$214.5M", age: "6.0", vs: "+0.0%", up: true },
            ].map((r) => (
              <tr key={r.seg} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">{r.seg}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.deals}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.vol}</td>
                <td className="px-4 py-2.5 text-right font-bold tabular-nums">{r.avg}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{r.age}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                    r.up ? "bg-signal-green/10 text-signal-green" : "bg-signal-magenta/10 text-signal-magenta",
                  )}>
                    {r.vs}
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
 * Tab 4 — Market Share
 * -------------------------------------------------------------------------- */

function MarketSharePanel() {
  type Pos = { name: string; deals: number; volume: number; share: number };

  // Aggregate buyers and sellers from the transaction list.
  const buyers: Pos[] = [];
  const sellers: Pos[] = [];
  const brokers: Pos[] = [];

  function addOrInc(arr: Pos[], name: string, vol: number) {
    const existing = arr.find((p) => p.name === name);
    if (existing) {
      existing.deals += 1;
      existing.volume += vol;
    } else {
      arr.push({ name, deals: 1, volume: vol, share: 0 });
    }
  }

  TXNS.forEach((t) => {
    addOrInc(buyers, t.buyer, t.priceM);
    addOrInc(sellers, t.seller, t.priceM);
    addOrInc(brokers, t.broker, t.priceM);
  });

  const totalVol = TXNS.reduce((sum, t) => sum + t.priceM, 0);
  [buyers, sellers, brokers].forEach((arr) => {
    arr.forEach((p) => {
      p.share = totalVol === 0 ? 0 : (p.volume / totalVol) * 100;
    });
    arr.sort((a, b) => b.volume - a.volume);
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Top Buyer Share" value={`${buyers[0] ? buyers[0].share.toFixed(1) : "0.0"}%`} meta={buyers[0]?.name ?? "—"} accent="blue" />
        <KpiCard label="Top Seller Share" value={`${sellers[0] ? sellers[0].share.toFixed(1) : "0.0"}%`} meta={sellers[0]?.name ?? "—"} accent="green" />
        <KpiCard label="Top Broker Share" value={`${brokers[0] ? brokers[0].share.toFixed(1) : "0.0"}%`} meta={brokers[0]?.name ?? "—"} accent="orange" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <ShareCard title="Top Buyers" rows={buyers} barColor="bg-primary" />
        <ShareCard title="Top Sellers" rows={sellers} barColor="bg-signal-green" />
        <ShareCard title="Top Brokers" rows={brokers} barColor="bg-signal-orange" />
      </section>
    </div>
  );
}

function ShareCard({
  title,
  rows,
  barColor,
}: {
  title: string;
  rows: { name: string; deals: number; volume: number; share: number }[];
  barColor: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <h2 className="text-[14px] font-bold">{title}</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">By transaction volume</p>
      </CardHeader>
      <ul className="divide-y">
        {rows.map((r, i) => (
          <li key={r.name} className="px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="flex-1 truncate text-[12px] font-semibold">{r.name}</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {r.deals} {r.deals === 1 ? "deal" : "deals"}
              </span>
              <span className="w-14 text-right font-mono text-[12px] font-bold tabular-nums">
                ${r.volume.toFixed(1)}M
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", barColor)}
                  style={{ width: `${Math.min(100, r.share)}%` }}
                />
              </div>
              <span className="w-10 text-right text-[10px] tabular-nums text-muted-foreground">
                {r.share.toFixed(1)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* --------------------------------------------------------------------------
 * Tab 5 — Export
 * -------------------------------------------------------------------------- */

function ExportPanel() {
  const [format, setFormat] = React.useState<"csv" | "xlsx" | "pdf">("xlsx");
  const [range, setRange] = React.useState("Last 30 days");
  const [includeMode, setIncludeMode] = React.useState(true);
  const [includeBroker, setIncludeBroker] = React.useState(true);
  const [includeBuyerSeller, setIncludeBuyerSeller] = React.useState(true);
  const [includeFmv, setIncludeFmv] = React.useState(false);

  const FORMATS = [
    { id: "csv" as const,  label: "CSV",  blurb: "Plain comma-separated values" },
    { id: "xlsx" as const, label: "Excel", blurb: "XLSX workbook with formatted columns" },
    { id: "pdf" as const,  label: "PDF",  blurb: "Print-ready report layout" },
  ];

  function handleExport() {
    alert(
      `Demo — would export ${TXNS.length} transactions as ${format.toUpperCase()} for "${range}".`,
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <Card>
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Export Transactions</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Download S&amp;P transaction data for offline analysis or reporting
          </p>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Format
            </p>
            <div className="grid grid-cols-1 gap-2">
              {FORMATS.map((f) => (
                <label
                  key={f.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors",
                    format === f.id
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/40",
                  )}
                >
                  <input
                    type="radio"
                    name="format"
                    value={f.id}
                    checked={format === f.id}
                    onChange={() => setFormat(f.id)}
                    className="cursor-pointer accent-primary"
                  />
                  <span className="inline-flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {f.id === "xlsx" ? <FileSpreadsheet className="size-3.5" /> : <FileText className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">{f.label}</p>
                    <p className="text-[11px] text-muted-foreground">{f.blurb}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Date Range
              </p>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 12 months</option>
                <option>Custom range…</option>
              </select>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Include Columns
              </p>
              <div className="space-y-1.5">
                <ColumnToggle label="Mode (Sale / Bareboat / Resale)" checked={includeMode} onChange={setIncludeMode} />
                <ColumnToggle label="Broker" checked={includeBroker} onChange={setIncludeBroker} />
                <ColumnToggle label="Buyer / Seller" checked={includeBuyerSeller} onChange={setIncludeBuyerSeller} />
                <ColumnToggle label="Estimated FMV at deal date" checked={includeFmv} onChange={setIncludeFmv} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-[11px] text-muted-foreground">
            {TXNS.length} transactions in selected range · approx 12 KB
          </span>
          <Button onClick={handleExport} className="gap-2">
            <Download className="size-3.5" />
            Export {format.toUpperCase()}
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Recent Exports</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Files downloaded in the last 30 days
          </p>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">File</th>
              <th className="px-4 py-2 text-left">Format</th>
              <th className="px-4 py-2 text-left">Range</th>
              <th className="px-4 py-2 text-right">Rows</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-right" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {[
              { file: "sp-transactions-2026-03-22.xlsx", fmt: "XLSX", range: "Last 30 days", rows: 23, when: "2026-03-22 09:14" },
              { file: "sp-tankers-2026-Q1.csv",          fmt: "CSV",  range: "2026-Q1",      rows: 71, when: "2026-03-15 14:02" },
              { file: "sp-bulk-yoy.pdf",                  fmt: "PDF",  range: "12 months",    rows: 156, when: "2026-03-08 11:27" },
            ].map((e) => (
              <tr key={e.file} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-mono text-[11px]">{e.file}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                    {e.fmt}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{e.range}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{e.rows}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{e.when}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-[11px]">
                    <Download className="size-3" />
                    Re-download
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function ColumnToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] hover:bg-muted/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="cursor-pointer accent-primary"
      />
      <span className="flex-1">{label}</span>
    </label>
  );
}
