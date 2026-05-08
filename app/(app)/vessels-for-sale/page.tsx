"use client";

import * as React from "react";
import Link from "next/link";
import {
  Download,
  Edit3,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { VesselListingCard } from "@/components/app/vessel-listing-card";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data
 * -------------------------------------------------------------------------- */

type Listing = {
  imo: string;
  name: string;
  type: VesselType;
  built: number;
  origin: string;
  asking: string;
  specs: { label: string; value: string }[];
  available: boolean;
  scrubber?: boolean;
  broker: string;
};

const LISTINGS: Listing[] = [
  { imo: "9623148", name: "MV Pacific Star",      type: "Bulk Carrier", built: 2016, origin: "South Korea",
    asking: "$28.5M", available: true, scrubber: true, broker: "Clarksons",
    specs: [
      { label: "DWT", value: "82,000" }, { label: "Type", value: "Panamax" },
      { label: "Flag", value: "Marshall Is." }, { label: "LOA", value: "229m" },
      { label: "Speed", value: "14.0 kts" }, { label: "Class", value: "DNV GL" },
    ] },
  { imo: "9712305", name: "MT Helios Trader",     type: "Tanker",       built: 2014, origin: "Japan",
    asking: "$62.0M", available: true, broker: "Braemar",
    specs: [
      { label: "DWT", value: "158,400" }, { label: "Type", value: "Suezmax" },
      { label: "Flag", value: "Liberia" }, { label: "LOA", value: "274m" },
      { label: "Speed", value: "15.5 kts" }, { label: "Class", value: "ABS" },
    ] },
  { imo: "9450112", name: "MV Sea Breeze",        type: "Bulk Carrier", built: 2012, origin: "China",
    asking: "$18.2M", available: false, broker: "Howe Robinson",
    specs: [
      { label: "DWT", value: "76,800" }, { label: "Type", value: "Panamax" },
      { label: "Flag", value: "Cyprus" }, { label: "LOA", value: "225m" },
      { label: "Speed", value: "13.5 kts" }, { label: "Class", value: "Lloyd's" },
    ] },
  { imo: "9888420", name: "MV Atlantic Pioneer",  type: "Tanker",       built: 2009, origin: "Greece",
    asking: "$26.4M", available: true, broker: "Maersk Broker",
    specs: [
      { label: "DWT", value: "158,000" }, { label: "Type", value: "Suezmax" },
      { label: "Flag", value: "Greece" }, { label: "LOA", value: "275m" },
      { label: "Speed", value: "15.0 kts" }, { label: "Class", value: "BV" },
    ] },
  { imo: "9905611", name: "MV Coral Bay",         type: "Bulk Carrier", built: 2021, origin: "China",
    asking: "$32.4M", available: true, scrubber: true, broker: "Affinity",
    specs: [
      { label: "DWT", value: "62,100" }, { label: "Type", value: "Supramax" },
      { label: "Flag", value: "Malta" }, { label: "LOA", value: "200m" },
      { label: "Speed", value: "14.5 kts" }, { label: "Class", value: "DNV GL" },
    ] },
  { imo: "9762890", name: "MV Star Voyager",      type: "Container",    built: 2018, origin: "South Korea",
    asking: "$84.5M", available: true, broker: "Howe Robinson",
    specs: [
      { label: "TEU", value: "8,500" }, { label: "Type", value: "Post-Panamax" },
      { label: "Flag", value: "Hong Kong" }, { label: "LOA", value: "299m" },
      { label: "Speed", value: "21.0 kts" }, { label: "Class", value: "ABS" },
    ] },
];

const TYPE_OPTIONS = ["All Types", "Bulk Carrier", "Tanker", "Container", "Gas Carrier"] as const;
const SIZE_OPTIONS = ["All Sizes", "Handysize (10–40k DWT)", "Supramax (40–65k DWT)", "Panamax (65–100k DWT)", "Capesize (100k+ DWT)", "VLCC (250k+ DWT)"] as const;
const YEAR_OPTIONS = ["Any Year", "2020+", "2015–2019", "2010–2014", "Before 2010"] as const;
const PRICE_OPTIONS = ["Any Price", "Under $20M", "$20M – $50M", "$50M – $100M", "$100M+"] as const;

const TABS = [
  { id: "listings", label: "For Sale Listings", badge: 142 },
  { id: "history",  label: "Price History" },
  { id: "market",   label: "Market Overview" },
  { id: "my",       label: "My Listings", badge: 2 },
] as const;

/* --------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

export default function VesselsForSalePage() {
  const [active, setActive] = React.useState<(typeof TABS)[number]["id"]>("listings");

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Vessels for Sale" }]}
        title="Vessels for Sale"
        subtitle="Browse active listings across all vessel types and sizes"
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="size-3.5" />
              Request Valuation Certificate
            </Button>
            <Button className="gap-2">
              <Plus className="size-3.5" />
              Add Listing
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
              "flex items-center gap-1 whitespace-nowrap border-b-2 px-5 py-2.5 text-[12px] font-semibold transition-colors",
              active === t.id
                ? "border-primary text-primary"
                : "border-transparent text-[#A0ABB2] hover:text-foreground",
            )}
          >
            {t.label}
            {"badge" in t && t.badge !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  active === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {active === "listings" ? <ListingsPanel /> : null}
      {active === "history" ? <PriceHistoryPanel /> : null}
      {active === "market" ? <MarketOverviewPanel /> : null}
      {active === "my" ? <MyListingsPanel /> : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — For Sale Listings
 * -------------------------------------------------------------------------- */

function ListingsPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Active Listings" value="142" direction="up" change="+18 this week" accent="blue" />
        <KpiCard label="Avg. Asking Price" value="$34.2M" direction="down" change="−2.1% vs last month" accent="green" />
        <KpiCard label="Deals Closed (30d)" value="27" direction="up" change="+5 vs prior period" accent="orange" />
        <KpiCard label="Total Value Listed" value="$4.86B" meta="Across all types" accent="purple" />
        <KpiCard label="Avg. Days Listed" value="38" direction="down" change="−4d vs prior period" accent="cyan" />
      </section>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Type" options={TYPE_OPTIONS} />
          <FilterSelect label="Size" options={SIZE_OPTIONS} />
          <FilterSelect label="Built" options={YEAR_OPTIONS} />
          <FilterSelect label="Price" options={PRICE_OPTIONS} />
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vessel name, IMO…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <SlidersHorizontal className="size-3.5" />
              Filters
            </Button>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {LISTINGS.map((l) => (
          <VesselListingCard key={l.imo} listing={l} />
        ))}
      </section>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Showing 1–{LISTINGS.length} of 142 active listings</span>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-2 py-1 hover:bg-card disabled:opacity-50" disabled>
            Prev
          </button>
          <span className="rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">1</span>
          <button className="rounded-md border px-2 py-1 hover:bg-card">2</button>
          <button className="rounded-md border px-2 py-1 hover:bg-card">3</button>
          <button className="rounded-md border px-2 py-1 hover:bg-card">Next</button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 2 — Price History
 * -------------------------------------------------------------------------- */

function PriceHistoryPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="12M Avg Sale Price" value="$36.8M" direction="up" change="+4.2% YoY" accent="blue" />
        <KpiCard label="Median Sale Price" value="$28.4M" direction="up" change="+2.1% YoY" accent="green" />
        <KpiCard label="Highest Sale (12M)" value="$214M" meta="LNG TFDE · Jul 2025" accent="orange" />
        <KpiCard label="Total Volume (12M)" value="$8.9B" direction="up" change="+12.4% YoY" accent="cyan" />
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-[14px] font-bold">Sale Price Trend by Segment</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Trailing 24 months · USD millions per vessel</p>
        </CardHeader>
        <div className="p-4">
          <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-primary" />Bulk Carrier</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-orange" />Tanker</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-purple" />Container</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-green" />Gas Carrier</span>
          </div>
          <div className="relative h-64 overflow-hidden rounded-md border border-dashed bg-muted/40">
            <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
              Chart placeholder · charting library wired in next sprint
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Recent Sale Prices by Segment</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Average sale price per cohort, last 12 months</p>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Segment</th>
              <th className="px-4 py-2 text-right">Avg Sale Price</th>
              <th className="px-4 py-2 text-right">Median</th>
              <th className="px-4 py-2 text-right">Volume (12M)</th>
              <th className="px-4 py-2 text-right">Transactions</th>
              <th className="px-4 py-2 text-right">YoY Change</th>
            </tr>
          </thead>
          <tbody>
            {[
              { seg: "Capesize Bulk",       avg: "$58.2M",  med: "$54.0M",  vol: "$2.1B",  count: 36, yoy: "+6.2%", up: true },
              { seg: "Panamax Bulk",        avg: "$28.5M",  med: "$26.4M",  vol: "$1.4B",  count: 49, yoy: "+4.8%", up: true },
              { seg: "Supramax Bulk",       avg: "$22.4M",  med: "$21.0M",  vol: "$0.9B",  count: 41, yoy: "+2.1%", up: true },
              { seg: "Suezmax Tanker",      avg: "$62.0M",  med: "$58.4M",  vol: "$1.8B",  count: 29, yoy: "+8.4%", up: true },
              { seg: "Aframax Tanker",      avg: "$48.3M",  med: "$45.0M",  vol: "$1.2B",  count: 25, yoy: "+1.6%", up: true },
              { seg: "MR Tanker",           avg: "$36.9M",  med: "$34.8M",  vol: "$0.6B",  count: 17, yoy: "+2.7%", up: true },
              { seg: "Container Post-Pmx",  avg: "$84.5M",  med: "$78.0M",  vol: "$0.5B",  count: 6,  yoy: "−3.2%", up: false },
              { seg: "LNG TFDE",            avg: "$214.5M", med: "$208.0M", vol: "$0.4B",  count: 2,  yoy: "+0.9%", up: true },
            ].map((r) => (
              <tr key={r.seg} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">{r.seg}</td>
                <td className="px-4 py-2.5 text-right font-bold tabular-nums">{r.avg}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{r.med}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.vol}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.count}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                    r.up ? "bg-signal-green/10 text-signal-green" : "bg-signal-magenta/10 text-signal-magenta",
                  )}>
                    {r.yoy}
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
 * Tab 3 — Market Overview
 * -------------------------------------------------------------------------- */

function MarketOverviewPanel() {
  const segmentBreakdown = [
    { type: "Bulk Carrier", listings: 64, pct: 45, color: "bg-primary" },
    { type: "Tanker",       listings: 42, pct: 30, color: "bg-signal-orange" },
    { type: "Container",    listings: 14, pct: 10, color: "bg-signal-purple" },
    { type: "Gas Carrier",  listings: 12, pct: 8,  color: "bg-signal-green" },
    { type: "LNG / LPG",    listings: 7,  pct: 5,  color: "bg-accent" },
    { type: "Other",        listings: 3,  pct: 2,  color: "bg-muted-foreground/40" },
  ];

  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Listings" value="142" direction="up" change="+18 this week" accent="blue" />
        <KpiCard label="Buyer Inquiries (7d)" value="384" direction="up" change="+22% WoW" accent="green" />
        <KpiCard label="Avg Time on Market" value="38 days" direction="down" change="−4d vs prior period" accent="orange" />
        <KpiCard label="Avg Sale-to-Asking" value="94.6%" meta="Discount to asking" accent="cyan" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <h2 className="text-[14px] font-bold">Segment Breakdown</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">142 active listings by vessel type</p>
          </CardHeader>
          <ul className="space-y-2.5 p-4">
            {segmentBreakdown.map((r) => (
              <li key={r.type} className="flex items-center gap-3">
                <span className="w-32 text-[12px] text-muted-foreground">{r.type}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-[width]", r.color)} style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-12 text-right text-[12px] font-bold tabular-nums">{r.listings}</span>
                <span className="w-10 text-right text-[10px] tabular-nums text-muted-foreground">{r.pct}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden lg:col-span-5">
          <CardHeader className="border-b">
            <h2 className="text-[14px] font-bold">Top Brokers (30d)</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">By active listings represented</p>
          </CardHeader>
          <ul className="divide-y">
            {[
              { name: "Clarksons",      listings: 38, share: 26.8 },
              { name: "Howe Robinson",  listings: 27, share: 19.0 },
              { name: "Braemar",        listings: 22, share: 15.5 },
              { name: "Affinity",       listings: 18, share: 12.7 },
              { name: "Maersk Broker",  listings: 14, share: 9.9 },
              { name: "Other",          listings: 23, share: 16.2 },
            ].map((b, i) => (
              <li key={b.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="inline-flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="flex-1 text-[12px] font-semibold">{b.name}</span>
                <span className="font-mono text-[12px] font-bold tabular-nums">{b.listings}</span>
                <span className="w-12 text-right text-[10px] tabular-nums text-muted-foreground">
                  {b.share.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Card className="border-primary/30 bg-primary/5 p-4 text-[12px]">
        <p>
          <span className="font-bold text-primary">Market sentiment:</span>{" "}
          <span className="text-muted-foreground">
            Buyer activity is up 22% WoW with the Capesize segment seeing the
            firmest pricing. Average time on market has compressed by 4 days,
            suggesting tighter inventory through Q2.
          </span>
        </p>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 4 — My Listings
 * -------------------------------------------------------------------------- */

type MyListing = {
  imo: string;
  name: string;
  type: VesselType;
  asking: string;
  inquiries: number;
  daysListed: number;
  status: "Active" | "Pending" | "Withdrawn";
  listed: string;
};

const MY_LISTINGS: MyListing[] = [
  { imo: "9450112", name: "MV Sea Breeze",   type: "Bulk Carrier", asking: "$18.2M", inquiries: 12, daysListed: 24, status: "Active",  listed: "01 Mar 2026" },
  { imo: "9762890", name: "MV Star Voyager", type: "Container",    asking: "$84.5M", inquiries: 7,  daysListed: 14, status: "Pending", listed: "11 Mar 2026" },
];

function MyListingsPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <Card className="border-primary/30 bg-primary/5 p-4 text-[12px]">
        <p className="text-muted-foreground">
          Vessels you&rsquo;ve listed for sale. Track inquiries from prospective
          buyers, edit listing details, or withdraw a listing at any time.
        </p>
      </Card>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="My Listings" value={String(MY_LISTINGS.length)} meta={`${MY_LISTINGS.filter((l) => l.status === "Active").length} active`} accent="blue" />
        <KpiCard label="Total Asking" value="$102.7M" meta="Across all my listings" accent="green" />
        <KpiCard label="Inquiries (7d)" value="19" direction="up" change="+6 vs prior period" accent="orange" />
        <KpiCard label="Avg Days on Market" value="19" meta="Below market avg of 38" accent="cyan" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
          <div>
            <h2 className="text-[14px] font-bold">My Listings</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {MY_LISTINGS.length} vessels currently posted
            </p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="size-3.5" />
            New Listing
          </Button>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Vessel</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Asking</th>
              <th className="px-4 py-2 text-right">Inquiries</th>
              <th className="px-4 py-2 text-right">Days Listed</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Listed</th>
              <th className="px-4 py-2 text-right" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {MY_LISTINGS.map((l) => (
              <tr key={l.imo} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <Link href={`/vessels/${l.imo}`} className="block font-semibold text-foreground hover:text-primary">
                    {l.name}
                  </Link>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">IMO {l.imo}</span>
                </td>
                <td className="px-4 py-2.5"><VesselTypeBadge value={l.type} /></td>
                <td className="px-4 py-2.5 text-right font-bold tabular-nums">{l.asking}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{l.inquiries}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{l.daysListed}</td>
                <td className="px-4 py-2.5">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                    l.status === "Active" && "bg-signal-green/15 text-signal-green",
                    l.status === "Pending" && "bg-signal-orange/15 text-signal-orange",
                    l.status === "Withdrawn" && "bg-muted text-muted-foreground",
                  )}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{l.listed}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <RowAction title="Edit listing">
                      <Edit3 className="size-3.5" />
                    </RowAction>
                    <RowAction title="Withdraw" danger>
                      <Trash2 className="size-3.5" />
                    </RowAction>
                  </div>
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

function RowAction({
  children,
  title,
  danger = false,
}: {
  children: React.ReactNode;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
        danger
          ? "hover:bg-signal-magenta/10 hover:text-signal-magenta"
          : "hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="sr-only">{title}</span>
      {children}
    </button>
  );
}
