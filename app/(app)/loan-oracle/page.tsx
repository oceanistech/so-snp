"use client";

import * as React from "react";
import Link from "next/link";
import {
  Construction,
  Download,
  Eye,
  Plus,
  Search,
  Trash2,
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
import {
  FinancibilityChip,
  type Financibility,
} from "@/components/app/financibility-chip";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — mirrors html/loan-oracle.html
 * -------------------------------------------------------------------------- */

/* ── Tab 1 · Loan Oracle (vessel-grouped request history) ───────── */

type LoanRequest = {
  date: string;
  versionName: string;
  type: string;
  fmv: string;
  ltv: string;
  loanAmount: string;
  financibility: Financibility;
  lendersMatched: string;
};

type VesselGroup = {
  imo: string;
  name: string;
  spec: string;
  requests: LoanRequest[];
};

const VESSEL_GROUPS: VesselGroup[] = [
  {
    imo: "9617832",
    name: "MV Pacific Star",
    spec: "Capesize Bulk Carrier · Built 2018 · IMO 9617832 · 182,000 DWT · FMV $34.2M",
    requests: [
      { date: "27 Mar 2026", versionName: "Pacific Star — Base",         type: "Panamax Bulk", fmv: "$28.5M", ltv: "65%", loanAmount: "$18.5M", financibility: "highly-possible", lendersMatched: "8 of 12" },
      { date: "25 Mar 2026", versionName: "Pacific Star — High LTV",     type: "Panamax Bulk", fmv: "$28.5M", ltv: "75%", loanAmount: "$21.4M", financibility: "possible",        lendersMatched: "5 of 12" },
      { date: "18 Mar 2026", versionName: "Pacific Star — Conservative", type: "Panamax Bulk", fmv: "$28.5M", ltv: "55%", loanAmount: "$15.7M", financibility: "done-deal",       lendersMatched: "10 of 12" },
    ],
  },
  {
    imo: "9587441",
    name: "MV Nordic Eagle",
    spec: "Supramax Bulk Carrier · Built 2016 · IMO 9587441 · 56,000 DWT · FMV $18.7M",
    requests: [
      { date: "20 Mar 2026", versionName: "Nordic Eagle Refi", type: "Capesize Bulk", fmv: "$42.0M", ltv: "58%", loanAmount: "$24.4M", financibility: "done-deal", lendersMatched: "11 of 12" },
    ],
  },
  {
    imo: "9734219",
    name: "MT Artemis",
    spec: "MR Tanker · Built 2019 · IMO 9734219 · 50,000 DWT · FMV $22.1M",
    requests: [
      { date: "02 Mar 2026", versionName: "Artemis Acquisition", type: "MR Tanker", fmv: "$18.2M", ltv: "70%", loanAmount: "$12.7M", financibility: "possible", lendersMatched: "6 of 12" },
    ],
  },
  {
    imo: "9401876",
    name: "MV Coral Bay",
    spec: "Handysize Bulk Carrier · Built 2012 · IMO 9401876 · 32,000 DWT · FMV $8.5M",
    requests: [
      { date: "10 Jan 2026", versionName: "Coral Bay 2026", type: "Supramax Bulk", fmv: "$12.8M", ltv: "78%", loanAmount: "$10.0M", financibility: "challenging", lendersMatched: "3 of 12" },
    ],
  },
  {
    imo: "9301555",
    name: "MV Atlantic Rover",
    spec: "Handysize Bulk Carrier · Built 2010 · IMO 9301555 · 28,000 DWT · FMV $8.5M",
    requests: [
      { date: "28 Nov 2025", versionName: "Atlantic Rover Draft", type: "Handysize Bulk", fmv: "$8.5M", ltv: "80%", loanAmount: "$6.8M", financibility: "hardly-possible", lendersMatched: "1 of 12" },
    ],
  },
];

const RATING_OPTIONS: { value: Financibility | "all"; label: string }[] = [
  { value: "all",              label: "All Ratings" },
  { value: "done-deal",        label: "Done Deal" },
  { value: "highly-possible",  label: "Highly Possible" },
  { value: "possible",         label: "Possible" },
  { value: "promising",        label: "Promising" },
  { value: "challenging",      label: "Challenging" },
  { value: "very-challenging", label: "Very Challenging" },
  { value: "hardly-possible",  label: "Hardly Possible" },
];

/* ── Tab 2 · Financiers ─────────────────────────────────────────── */

type Financier = {
  name: string;
  type: "Fund" | "Bank";
  reply: string;
  replyTone: "green" | "orange" | "magenta";
  ticket: string;
  geography: string;
  vesselTypes: string;
  relationship: "Active" | "Passive";
};

const FINANCIERS: Financier[] = [
  { name: "Ocean Crest Capital",      type: "Fund", reply: "1–2 days",  replyTone: "green",   ticket: "$5M – $50M",    geography: "Global",          vesselTypes: "Dry, Tanker",    relationship: "Active"  },
  { name: "Meridian Ship Finance",     type: "Fund", reply: "2–3 days",  replyTone: "green",   ticket: "$10M – $80M",   geography: "Europe, Asia",    vesselTypes: "All types",      relationship: "Active"  },
  { name: "Bluestone Maritime Fund",   type: "Fund", reply: "3–5 days",  replyTone: "orange",  ticket: "$8M – $60M",    geography: "Americas, Europe",vesselTypes: "Bulk, Container",relationship: "Passive" },
  { name: "Anchor Capital Partners",   type: "Fund", reply: "3–4 days",  replyTone: "orange",  ticket: "$3M – $30M",    geography: "Global",          vesselTypes: "Dry, MPP",       relationship: "Active"  },
  { name: "DNB Bank ASA",              type: "Bank", reply: "5–7 days",  replyTone: "orange",  ticket: "$15M – $200M",  geography: "Global",          vesselTypes: "All types",      relationship: "Active"  },
  { name: "Nordea Ship Finance",       type: "Bank", reply: "5–7 days",  replyTone: "orange",  ticket: "$20M – $300M",  geography: "Nordic, Global",  vesselTypes: "All types",      relationship: "Active"  },
  { name: "Hamburg Commercial Bank",   type: "Bank", reply: "7–10 days", replyTone: "magenta", ticket: "$10M – $150M",  geography: "Europe",          vesselTypes: "Dry, Tanker",    relationship: "Passive" },
  { name: "Sumitomo Mitsui Banking",   type: "Bank", reply: "7–14 days", replyTone: "magenta", ticket: "$25M – $500M",  geography: "Asia, Global",    vesselTypes: "All types",      relationship: "Passive" },
];

const COVERAGE_SUMMARY = [
  { key: "Total Financiers", value: "12",    tone: "neutral" as const },
  { key: "Funds",            value: "5",     tone: "neutral" as const },
  { key: "Banks",            value: "7",     tone: "neutral" as const },
  { key: "Active (this deal)", value: "8",   tone: "green"   as const },
  { key: "Avg Fund Reply",     value: "2.4 days", tone: "green"   as const },
  { key: "Avg Bank Reply",     value: "7.1 days", tone: "neutral" as const },
];

/* ── Tab 3 · SOFR & EURIBOR ─────────────────────────────────────── */

type RatePoint = { date: string; col1: string; col2: string };

const SOFR_RATES = {
  current: [
    { key: "SOFR Overnight", value: "5.35%" },
    { key: "SOFR 1M Avg",     value: "5.38%" },
    { key: "SOFR 3M Avg",     value: "5.42%" },
    { key: "SOFR 6M Avg",     value: "5.31%" },
    { key: "SOFR 12M Avg",    value: "5.18%" },
  ],
  history: [
    { date: "Mar 2026", col1: "5.35%", col2: "5.42%" },
    { date: "Feb 2026", col1: "5.33%", col2: "5.40%" },
    { date: "Jan 2026", col1: "5.33%", col2: "5.39%" },
    { date: "Dec 2025", col1: "5.35%", col2: "5.41%" },
    { date: "Nov 2025", col1: "5.32%", col2: "5.38%" },
    { date: "Oct 2025", col1: "5.30%", col2: "5.36%" },
  ] as RatePoint[],
};

const EURIBOR_RATES = {
  current: [
    { key: "EURIBOR 1M",       value: "3.61%" },
    { key: "EURIBOR 3M",       value: "3.54%" },
    { key: "EURIBOR 6M",       value: "3.42%" },
    { key: "EURIBOR 12M",      value: "3.29%" },
    { key: "ECB Deposit Rate", value: "3.15%" },
  ],
  history: [
    { date: "Mar 2026", col1: "3.54%", col2: "3.42%" },
    { date: "Feb 2026", col1: "3.58%", col2: "3.45%" },
    { date: "Jan 2026", col1: "3.62%", col2: "3.48%" },
    { date: "Dec 2025", col1: "3.66%", col2: "3.52%" },
    { date: "Nov 2025", col1: "3.71%", col2: "3.56%" },
    { date: "Oct 2025", col1: "3.78%", col2: "3.62%" },
  ] as RatePoint[],
};

/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "oracle",     label: "Loan Oracle",     title: "Loan Oracle",     subtitle: "Assess vessel financibility, compare potential financiers and monitor market rates" },
  { id: "financiers", label: "Financiers",      title: "Financiers",      subtitle: "Browse and compare ship-finance providers — terms, sectors covered, deal flow" },
  { id: "rates",      label: "SOFR & EURIBOR",  title: "SOFR & EURIBOR",  subtitle: "Live USD and EUR benchmark rates underpinning floating-rate ship loans" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function LoanOraclePage() {
  const [active, setActive] = React.useState<TabId>("oracle");
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Finance Toolkit" },
          { label: "Loan Oracle" },
          ...(active !== "oracle" ? [{ label: activeTab.label }] : []),
        ]}
        title={activeTab.title}
        subtitle={activeTab.subtitle}
        actions={
          <Button asChild className="gap-2">
            <Link href="/loan-oracle/new">
              <Plus className="size-3.5" />
              New Loan Oracle Calculation
            </Link>
          </Button>
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
        {active === "oracle" ? <OraclePanel /> : null}
        {active === "financiers" ? <FinanciersPanel /> : null}
        {active === "rates" ? <RatesPanel /> : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — Loan Oracle
 * -------------------------------------------------------------------------- */

function OraclePanel() {
  const totalCalcs = VESSEL_GROUPS.reduce(
    (sum, g) => sum + g.requests.length,
    0,
  );

  return (
    <>
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vessels…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            {RATING_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" className="gap-2">
            <Search className="size-3.5" />
            Search
          </Button>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {totalCalcs} calculations across {VESSEL_GROUPS.length} vessels
          </span>
        </div>
      </Card>

      {VESSEL_GROUPS.map((group) => (
        <Card key={group.imo} className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
            <div>
              <h2 className="text-[15px] font-bold">
                {group.name} Loan Oracle Calculations
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {group.spec}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {group.requests.length}{" "}
              {group.requests.length === 1 ? "version" : "versions"}
            </span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="w-8 px-3 py-2 text-left">
                    <input type="checkbox" className="cursor-pointer" />
                  </th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Version Name</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Fair Market Value</th>
                  <th className="px-3 py-2 text-right">LTV</th>
                  <th className="px-3 py-2 text-right">Loan Amount</th>
                  <th className="px-3 py-2 text-left">Financibility</th>
                  <th className="px-3 py-2 text-left">Lenders Matched</th>
                  <th className="px-3 py-2 text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {group.requests.map((r, idx) => (
                  <tr
                    key={`${group.imo}-${idx}`}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2.5">
                      <input type="checkbox" className="cursor-pointer" />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {r.date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-semibold">
                      {r.versionName}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {r.type}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                      {r.fmv}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {r.ltv}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                      {r.loanAmount}
                    </td>
                    <td className="px-3 py-2.5">
                      <FinancibilityChip value={r.financibility} />
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {r.lendersMatched}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <RowActionButton title="View result">
                          <Eye className="size-3.5" />
                        </RowActionButton>
                        <RowActionButton title="Download report">
                          <Download className="size-3.5" />
                        </RowActionButton>
                        <RowActionButton title="Delete request" danger>
                          <Trash2 className="size-3.5" />
                        </RowActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <Pagination pages={[1, 2, 3, "…", 8]} />
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 2 — Financiers
 * -------------------------------------------------------------------------- */

type FinancierFilter = "all" | "fund" | "bank";

function FinanciersPanel() {
  const [filter, setFilter] = React.useState<FinancierFilter>("all");

  const visibleFinanciers = React.useMemo(() => {
    if (filter === "all") return FINANCIERS;
    if (filter === "fund") return FINANCIERS.filter((f) => f.type === "Fund");
    return FINANCIERS.filter((f) => f.type === "Bank");
  }, [filter]);

  const totalCount = FINANCIERS.length;
  const fundCount = FINANCIERS.filter((f) => f.type === "Fund").length;
  const bankCount = FINANCIERS.filter((f) => f.type === "Bank").length;
  const visibleCount = visibleFinanciers.length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <FilterToggle
          options={[
            { value: "all",  label: `All (${totalCount})` },
            { value: "fund", label: `Funds (${fundCount})` },
            { value: "bank", label: `Banks (${bankCount})` },
          ]}
          active={filter}
          onChange={(v) => setFilter(v as FinancierFilter)}
        />
        <select className="ml-auto h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
          <option>Sort by: Speed of Reply</option>
          <option>Sort by: Ticket Size</option>
          <option>Sort by: Relationship</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Financier Comparison</CardTitle>
          <CardDescription>
            {filter === "all"
              ? `${totalCount} financiers match this deal profile`
              : `${visibleCount} ${
                  filter === "fund" ? "funds" : "banks"
                } match this deal profile`}
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Financier</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Speed of Reply</th>
                <th className="px-3 py-2 text-left">Ticket Size</th>
                <th className="px-3 py-2 text-left">Geography</th>
                <th className="px-3 py-2 text-left">Vessel Types</th>
                <th className="px-3 py-2 text-left">Relationship</th>
                <th className="px-3 py-2 text-right" aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {visibleFinanciers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-[12px] text-muted-foreground"
                  >
                    No financiers match the current filter.
                  </td>
                </tr>
              ) : (
                visibleFinanciers.map((f) => (
                  <tr
                    key={f.name}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 font-semibold">
                      {f.name}
                    </td>
                    <td className="px-3 py-2.5">
                      <FinancierTypeBadge type={f.type} />
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 font-semibold",
                        f.replyTone === "green"   && "text-signal-green",
                        f.replyTone === "orange"  && "text-signal-orange",
                        f.replyTone === "magenta" && "text-signal-magenta",
                      )}
                    >
                      {f.reply}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{f.ticket}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {f.geography}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {f.vesselTypes}
                    </td>
                    <td className="px-3 py-2.5">
                      <RelationshipBadge value={f.relationship} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button
                        size="sm"
                        variant={f.relationship === "Active" ? "default" : "outline"}
                        className="h-7 px-2 text-[11px]"
                      >
                        Contact
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6-4 grid */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <Card className="lg:col-span-6">
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              Speed of Reply — Funds vs Banks
            </CardTitle>
            <CardDescription>
              Average response time — Funds vs Banks (days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder height="h-44" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Coverage Summary</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ul className="divide-y text-[12px]">
              {COVERAGE_SUMMARY.map((row) => (
                <li
                  key={row.key}
                  className="flex items-baseline justify-between gap-3 py-2"
                >
                  <span className="text-muted-foreground">{row.key}</span>
                  <span
                    className={cn(
                      "font-mono font-bold tabular-nums",
                      row.tone === "green" && "text-signal-green",
                      row.tone === "neutral" && "text-foreground",
                    )}
                  >
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 3 — SOFR & EURIBOR
 * -------------------------------------------------------------------------- */

function RatesPanel() {
  const [rate, setRate] = React.useState<"sofr" | "euribor">("sofr");

  return (
    <>
      <div className="flex items-center gap-2">
        <FilterToggle
          options={[
            { value: "sofr",    label: "SOFR" },
            { value: "euribor", label: "EURIBOR" },
          ]}
          active={rate}
          onChange={(v) => setRate(v as "sofr" | "euribor")}
        />
      </div>

      {rate === "sofr" ? (
        <RateView
          kpis={[
            { label: "SOFR Overnight", value: "5.35%", direction: "up",      change: "+2bps vs prev",   accent: "blue" },
            { label: "SOFR 1-Month",   value: "5.38%", meta: "30-day avg",                              accent: "purple" },
            { label: "SOFR 3-Month",   value: "5.42%", meta: "Term rate",                                accent: "purple" },
            { label: "SOFR 12-Month",  value: "5.18%", meta: "Forward view",                             accent: "purple" },
          ]}
          historyTitle="SOFR Rate History"
          termTitle="SOFR Term Structure"
          termSubtitle="Overnight vs term rate spread"
          currentLabel="Current Rates"
          currentRows={SOFR_RATES.current}
          historyHeaders={["Date", "O/N", "3M"]}
          historyRows={SOFR_RATES.history}
        />
      ) : (
        <RateView
          kpis={[
            { label: "EURIBOR 1M",  value: "3.61%", direction: "down", change: "−4bps vs prev", accent: "cyan" },
            { label: "EURIBOR 3M",  value: "3.54%", meta: "Reference rate",                       accent: "purple" },
            { label: "EURIBOR 6M",  value: "3.42%", meta: "Widely used",                          accent: "purple" },
            { label: "EURIBOR 12M", value: "3.29%", meta: "Long-term view",                       accent: "purple" },
          ]}
          historyTitle="EURIBOR Rate History"
          termTitle="EURIBOR Term Curve"
          termSubtitle="1M to 12M spread and inversion analysis"
          currentLabel="Current Rates"
          currentRows={EURIBOR_RATES.current}
          historyHeaders={["Date", "3M", "6M"]}
          historyRows={EURIBOR_RATES.history}
        />
      )}
    </>
  );
}

type RateAccent = "blue" | "cyan" | "purple";
type Direction = "up" | "down" | "neutral";

type RateKpi = {
  label: string;
  value: string;
  meta?: string;
  change?: string;
  direction?: Direction;
  accent: RateAccent;
};

function RateView({
  kpis,
  historyTitle,
  termTitle,
  termSubtitle,
  currentLabel,
  currentRows,
  historyHeaders,
  historyRows,
}: {
  kpis: RateKpi[];
  historyTitle: string;
  termTitle: string;
  termSubtitle: string;
  currentLabel: string;
  currentRows: { key: string; value: string }[];
  historyHeaders: [string, string, string];
  historyRows: RatePoint[];
}) {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            meta={k.meta}
            direction={k.direction}
            change={k.change}
            accent={k.accent}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
              <CardTitle className="text-base">{historyTitle}</CardTitle>
              <PeriodToggle options={["3M", "6M", "1Y", "3Y"]} active="3M" />
            </CardHeader>
            <CardContent>
              <ChartPlaceholder height="h-64" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">{termTitle}</CardTitle>
              <CardDescription>{termSubtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder height="h-44" />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-3">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">{currentLabel}</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <ul className="divide-y text-[12px]">
                {currentRows.map((row, i) => (
                  <li
                    key={row.key}
                    className={cn(
                      "flex items-baseline justify-between gap-3 py-2",
                      i === currentRows.length - 1 && "border-t-2 pt-2 font-semibold",
                    )}
                  >
                    <span className="text-muted-foreground">{row.key}</span>
                    <span className="font-mono font-bold tabular-nums">
                      {row.value}
                    </span>
                  </li>
                ))}
                <li className="flex items-baseline justify-between gap-3 border-t-2 pt-2">
                  <span className="font-semibold">Last Updated</span>
                  <span className="font-mono tabular-nums">26 Mar 2026</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Historical Data</CardTitle>
            </CardHeader>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2 text-left">{historyHeaders[0]}</th>
                  <th className="px-3 py-2 text-right">{historyHeaders[1]}</th>
                  <th className="px-3 py-2 text-right">{historyHeaders[2]}</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((r) => (
                  <tr
                    key={r.date}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5">{r.date}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      {r.col1}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      {r.col2}
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
 * Local helpers
 * -------------------------------------------------------------------------- */

function FilterToggle({
  options,
  active,
  onChange,
}: {
  options: { value: string; label: string }[];
  active: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border bg-card">
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange?.(o.value)}
          className={cn(
            "px-3 py-1.5 text-[12px] font-semibold transition-colors",
            i > 0 && "border-l",
            o.value === active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {o.label}
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

function FinancierTypeBadge({ type }: { type: "Fund" | "Bank" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        type === "Fund"
          ? "bg-signal-purple/15 text-signal-purple"
          : "bg-primary/15 text-primary",
      )}
    >
      {type}
    </span>
  );
}

function RelationshipBadge({ value }: { value: "Active" | "Passive" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        value === "Active"
          ? "bg-signal-green/15 text-signal-green"
          : "bg-muted text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

function RowActionButton({
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

function Pagination({ pages }: { pages: Array<number | "…"> }) {
  return (
    <div className="flex items-center justify-center gap-1 py-2 text-[11px]">
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            className={cn(
              "rounded-md border px-2 py-1 hover:bg-card",
              i === 0 && "bg-primary text-primary-foreground",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button className="rounded-md border px-2 py-1 hover:bg-card">
        Next
      </button>
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
