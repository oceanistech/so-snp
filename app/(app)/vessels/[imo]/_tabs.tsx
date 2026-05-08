"use client";

import * as React from "react";
import Link from "next/link";
import {
  Anchor,
  Calculator,
  Download,
  FileText,
  LineChart as LineChartIcon,
  Plus,
  Recycle,
  Ship,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import { DetailRow } from "@/components/app/detail-row";
import { CertChip } from "@/components/app/cert-chip";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import {
  EnvScoreBadge,
  type EnvScore,
} from "@/components/app/env-score-badge";
import {
  FinancibilityChip,
  type Financibility,
} from "@/components/app/financibility-chip";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Vessel type passed down from the Server page.
 * -------------------------------------------------------------------------- */

export type VesselDetail = {
  imo: string;
  mmsi: string;
  name: string;
  flag: string;
  type: VesselType;
  classification: string;
  yearBuilt: number;
  shipyard: string;
  dwt: number;
  grt: number;
  nrt: number;
  loa: string;
  beam: string;
  draft: string;
  engine: string;
  speed: string;
  fmv: string;
  fmvChange: string;
  envScore: EnvScore;
  heroImage: string;
  spec: string;
  employment: {
    type: "Time Charter" | "Spot" | "Bareboat";
    charterer: string;
    rate: string;
    period: string;
    daysRemaining: number;
    lastPort: string;
    voyage: string;
    cargo: string;
  };
  certificates: { status: "ok" | "warn" | "expired"; label: string }[];
  ownership: { from: string; to: string; owner: string }[];
};

const TABS = [
  "Main Information",
  "Valuations",
  "Net Fleet",
  "Financial Transactions",
  "Earnings & Expenses",
  "IRR",
  "Environmental Score",
  "Valuation Certificates",
] as const;

/* -------------------------------------------------------------------------- */

export function VesselDetailTabs({ vessel: v }: { vessel: VesselDetail }) {
  const [active, setActive] = React.useState<(typeof TABS)[number]>("Main Information");

  return (
    <>
      <div className="flex items-end gap-0 overflow-x-auto border-b bg-card px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setActive(label)}
            aria-selected={active === label}
            role="tab"
            className={cn(
              "whitespace-nowrap border-b-2 px-5 py-2.5 text-[12px] font-semibold transition-colors",
              active === label
                ? "border-primary text-primary"
                : "border-transparent text-[#A0ABB2] hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {active === "Main Information" ? <MainInformationPanel v={v} /> : null}
      {active === "Valuations" ? <ValuationsPanel v={v} /> : null}
      {active === "Net Fleet" ? <NetFleetPanel v={v} /> : null}
      {active === "Financial Transactions" ? <FinancialTxPanel v={v} /> : null}
      {active === "Earnings & Expenses" ? <EarningsExpensesPanel v={v} /> : null}
      {active === "IRR" ? <IrrPanel v={v} /> : null}
      {active === "Environmental Score" ? <EnvScorePanel v={v} /> : null}
      {active === "Valuation Certificates" ? <ValCertPanel v={v} /> : null}
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — Main Information
 * -------------------------------------------------------------------------- */

function MainInformationPanel({ v }: { v: VesselDetail }) {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="relative aspect-[4/3] overflow-hidden lg:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={v.heroImage}
            alt={`${v.name} — ${v.type}`}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-card/90 px-2 py-1 text-[11px] font-bold text-foreground backdrop-blur">
              <Ship className="size-3" />
              {v.type.toUpperCase()}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
            <p className="text-base font-extrabold tracking-tight">{v.name}</p>
            <p className="mt-0.5 text-[11px] text-white/70">
              IMO {v.imo} · {v.type} · Built {v.yearBuilt} · {v.flag}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <KpiCard
            label="Deadweight Tonnage"
            value={v.dwt.toLocaleString()}
            meta={`DWT · ${v.type}`}
            accent="blue"
          />
          <KpiCard
            label="Year Built"
            value={String(v.yearBuilt)}
            meta={v.shipyard}
            accent="cyan"
          />
          <KpiCard
            label="Fair Market Value"
            value={v.fmv}
            direction="up"
            change={v.fmvChange}
            accent="green"
          />
          <KpiCard
            label="Environmental Score"
            value={v.envScore}
            meta="CII 2025 · EEXI Compliant"
            accent="orange"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
            <h2 className="text-[14px] font-bold">Vessel Profile</h2>
            <VesselTypeBadge value={v.type} />
          </CardHeader>
          <div className="px-4 py-2">
            <DetailRow label="Vessel Name" value={v.name} />
            <DetailRow label="IMO Number" value={v.imo} mono />
            <DetailRow label="MMSI" value={v.mmsi} mono />
            <DetailRow label="Flag State" value={v.flag} />
            <DetailRow label="Vessel Type" value={v.type} />
            <DetailRow label="Classification" value={v.classification} />
            <DetailRow
              label="Year Built"
              value={`${v.yearBuilt} (${new Date().getFullYear() - v.yearBuilt} years)`}
            />
            <DetailRow label="Shipyard" value={v.shipyard} />
          </div>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <h2 className="text-[14px] font-bold">Technical Specifications</h2>
          </CardHeader>
          <div className="px-4 py-2">
            <DetailRow label="Deadweight (DWT)" value={`${v.dwt.toLocaleString()} MT`} />
            <DetailRow label="Gross Tonnage (GRT)" value={v.grt.toLocaleString()} />
            <DetailRow label="Net Tonnage (NRT)" value={v.nrt.toLocaleString()} />
            <DetailRow label="Length Overall (LOA)" value={v.loa} />
            <DetailRow label="Beam" value={v.beam} />
            <DetailRow label="Max Draft" value={v.draft} />
            <DetailRow label="Main Engine" value={v.engine} />
            <DetailRow label="Design Speed" value={v.speed} />
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
            <h2 className="text-[14px] font-bold">Current Employment</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Anchor className="size-3" />
              {v.employment.type}
            </span>
          </CardHeader>
          <div className="px-4 py-2">
            <DetailRow label="Charterer" value={v.employment.charterer} />
            <DetailRow label="Daily TC Rate" value={v.employment.rate} />
            <DetailRow label="Contract Period" value={v.employment.period} />
            <DetailRow
              label="Days Remaining"
              value={`${v.employment.daysRemaining} days`}
              valueClassName="text-signal-orange"
            />
            <DetailRow label="Last Port" value={v.employment.lastPort} />
            <DetailRow label="Voyage" value={v.employment.voyage} />
            <DetailRow label="Cargo" value={v.employment.cargo} />
          </div>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <h2 className="text-[14px] font-bold">Certificates &amp; Documents</h2>
          </CardHeader>
          <div className="flex flex-col gap-1.5 p-3">
            {v.certificates.map((c) => (
              <CertChip key={c.label} status={c.status}>
                {c.label}
              </CertChip>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <h2 className="text-[14px] font-bold">Ownership History</h2>
          </CardHeader>
          <ol className="relative px-4 py-3">
            {v.ownership.map((o, i) => {
              const current = o.to === "Present";
              return (
                <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < v.ownership.length - 1 ? (
                    <span className="absolute left-[5px] -bottom-1 top-3 w-px bg-border" />
                  ) : null}
                  <span
                    className={cn(
                      "relative z-10 mt-1.5 size-2.5 flex-shrink-0 rounded-full",
                      current
                        ? "bg-signal-green ring-2 ring-signal-green/30"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold leading-tight">{o.owner}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {o.from} – {o.to}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </section>

      <Card className="bg-muted/30 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Quick actions
          </span>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={`/loan-oracle/new?imo=${v.imo}`}>
              <Plus className="size-3.5" />
              Run Loan Oracle
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={`/cashflow/new?imo=${v.imo}`}>
              <Plus className="size-3.5" />
              Run Cashflow
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={`/valuations/request?imo=${v.imo}`}>
              <FileText className="size-3.5" />
              Request Valuation Certificate
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="gap-2">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 2 — Valuations
 * -------------------------------------------------------------------------- */

function ValuationsPanel({ v }: { v: VesselDetail }) {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Current FMV" value={v.fmv} direction="up" change={v.fmvChange} accent="blue" />
        <KpiCard label="Newbuild Equiv." value="$48.0M" meta="Replacement cost" accent="cyan" />
        <KpiCard label="Resale Value" value="$23.2M" direction="up" change="+1.4% MoM" accent="green" />
        <KpiCard label="Scrap Value" value="$5.6M" meta="At $490/LDT" accent="orange" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-[14px] font-bold">FMV Trend — Trailing 24 Months</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Monthly FMV close · alongside resale, newbuild, scrap
            </p>
          </CardHeader>
          <div className="p-4">
            <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-primary" />FMV</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-green" />Resale</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-accent" />Newbuild</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-orange" />Scrap</span>
            </div>
            <div className="relative h-56 overflow-hidden rounded-md border border-dashed bg-muted/40">
              <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
                Chart placeholder · charting library wired in next sprint
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <h2 className="text-[14px] font-bold">Comp Set</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Recent {v.type} sales used as comparables
            </p>
          </CardHeader>
          <ul className="divide-y">
            {[
              { name: "MV Northern Star", year: 2017, fmv: "$30.2M" },
              { name: "MV Sea Breeze",    year: 2012, fmv: "$22.8M" },
              { name: "MV Coral Bay",     year: 2021, fmv: "$32.4M" },
              { name: "MV Cape Fortuna",  year: 2019, fmv: "$25.1M" },
            ].map((c) => (
              <li key={c.name} className="flex items-baseline justify-between gap-2 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.year}</p>
                </div>
                <span className="font-mono text-[12px] font-bold tabular-nums">{c.fmv}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Valuation History</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Successive monthly valuations of this vessel
          </p>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Month</th>
              <th className="px-4 py-2 text-right">FMV</th>
              <th className="px-4 py-2 text-right">Resale</th>
              <th className="px-4 py-2 text-right">Newbuild</th>
              <th className="px-4 py-2 text-right">Scrap</th>
              <th className="px-4 py-2 text-right">FMV/NB</th>
              <th className="px-4 py-2 text-right">MoM</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: "Mar 2026", fmv: "$28.5M", res: "$23.2M", nb: "$48.0M", scrap: "$5.6M", ratio: "59%", mom: "+0.4%", up: true },
              { m: "Feb 2026", fmv: "$28.4M", res: "$23.0M", nb: "$48.0M", scrap: "$5.5M", ratio: "59%", mom: "+0.7%", up: true },
              { m: "Jan 2026", fmv: "$28.2M", res: "$22.8M", nb: "$47.6M", scrap: "$5.5M", ratio: "59%", mom: "+1.1%", up: true },
              { m: "Dec 2025", fmv: "$27.9M", res: "$22.4M", nb: "$47.4M", scrap: "$5.4M", ratio: "59%", mom: "+0.7%", up: true },
              { m: "Nov 2025", fmv: "$27.7M", res: "$22.2M", nb: "$47.0M", scrap: "$5.4M", ratio: "59%", mom: "+0.4%", up: true },
              { m: "Oct 2025", fmv: "$27.6M", res: "$22.0M", nb: "$46.8M", scrap: "$5.3M", ratio: "59%", mom: "−0.4%", up: false },
            ].map((r) => (
              <tr key={r.m} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2 font-semibold">{r.m}</td>
                <td className="px-4 py-2 text-right font-bold tabular-nums">{r.fmv}</td>
                <td className="px-4 py-2 text-right tabular-nums">{r.res}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{r.nb}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{r.scrap}</td>
                <td className="px-4 py-2 text-right tabular-nums">{r.ratio}</td>
                <td className={cn("px-4 py-2 text-right font-bold tabular-nums", r.up ? "text-signal-green" : "text-signal-magenta")}>
                  {r.mom}
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
 * Tab 3 — Net Fleet
 * -------------------------------------------------------------------------- */

function NetFleetPanel({ v }: { v: VesselDetail }) {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Cohort Active Fleet" value="982.4M DWT" meta={`Global ${v.type}s`} accent="blue" />
        <KpiCard label="Cohort Orderbook" value="84.6M DWT" direction="up" change="8.6% of fleet" accent="green" />
        <KpiCard label="This Vessel's Cohort" value="Panamax 65–100k" meta="3 sub-cohorts" accent="cyan" />
        <KpiCard label="Cohort Demolitions YTD" value="6.2M DWT" direction="down" change="−18% vs 2025" accent="magenta" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Sister Vessels in Fleet</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Same {v.type} cohort, comparable size — peer set for valuation and TCE
          </p>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Vessel</th>
              <th className="px-4 py-2 text-right">Year</th>
              <th className="px-4 py-2 text-right">DWT</th>
              <th className="px-4 py-2 text-right">FMV</th>
              <th className="px-4 py-2 text-center">CII</th>
              <th className="px-4 py-2 text-right">Δ vs This</th>
            </tr>
          </thead>
          <tbody>
            {[
              { imo: "9512098", name: "MV Northern Star", year: 2017, dwt: 180000, fmv: "$98.4M", cii: "B", delta: "+$69.9M", up: true },
              { imo: "9450112", name: "MV Sea Breeze",    year: 2012, dwt: 76800,  fmv: "$18.2M", cii: "C", delta: "−$10.3M", up: false },
              { imo: "9905611", name: "MV Coral Bay",     year: 2021, dwt: 62100,  fmv: "$32.4M", cii: "A", delta: "+$3.9M",  up: true },
              { imo: "9885640", name: "MV Cape Fortuna",  year: 2019, dwt: 80000,  fmv: "$25.1M", cii: "A", delta: "−$3.4M",  up: false },
            ].map((r) => (
              <tr key={r.imo} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <Link href={`/vessels/${r.imo}`} className="font-semibold hover:text-primary">
                    {r.name}
                  </Link>
                  <span className="ml-2 font-mono text-[10px] tabular-nums text-muted-foreground">IMO {r.imo}</span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.year}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.dwt.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right font-bold tabular-nums">{r.fmv}</td>
                <td className="px-4 py-2.5 text-center"><EnvScoreBadge value={r.cii as EnvScore} /></td>
                <td className={cn("px-4 py-2.5 text-right font-bold tabular-nums", r.up ? "text-signal-green" : "text-signal-magenta")}>
                  {r.delta}
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
 * Tab 4 — Financial Transactions
 * -------------------------------------------------------------------------- */

function FinancialTxPanel({ v }: { v: VesselDetail }) {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Loan Outstanding" value="$17.2M" meta="LN-2024-008 · SOFR+2.5%" accent="blue" />
        <KpiCard label="LTV" value="60.4%" direction="down" change="−1.2pp QoQ" accent="green" />
        <KpiCard label="Repaid YTD" value="$2.1M" direction="up" change="+8.3% vs prior yr" accent="orange" />
        <KpiCard label="Interest YTD" value="$540K" meta="At 7.82% all-in" accent="magenta" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Recent Transactions</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            All loan flows linked to {v.name}
          </p>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">TX ID</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2 text-left">Rate</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: "TXN-2026-0142", date: "2026-03-20", type: "Repayment",    amt: "−$285K", up: false, bal: "$17.2M", rate: "SOFR+2.5%" },
              { id: "TXN-2026-0136", date: "2026-03-05", type: "Interest",     amt: "−$106K", up: false, bal: "$17.5M", rate: "SOFR+2.5%" },
              { id: "TXN-2026-0119", date: "2026-02-20", type: "Repayment",    amt: "−$285K", up: false, bal: "$17.5M", rate: "SOFR+2.5%" },
              { id: "TXN-2026-0103", date: "2026-02-05", type: "Interest",     amt: "−$108K", up: false, bal: "$17.8M", rate: "SOFR+2.5%" },
              { id: "TXN-2026-0081", date: "2026-01-20", type: "Repayment",    amt: "−$285K", up: false, bal: "$17.8M", rate: "SOFR+2.5%" },
              { id: "TXN-2024-0001", date: "2024-08-12", type: "Disbursement", amt: "+$22.0M", up: true,  bal: "$22.0M", rate: "SOFR+2.5%" },
            ].map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground">{t.id}</td>
                <td className="px-4 py-2.5">{t.date}</td>
                <td className="px-4 py-2.5">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                    t.type === "Disbursement" && "bg-signal-green/15 text-signal-green",
                    t.type === "Repayment" && "bg-primary/15 text-primary",
                    t.type === "Interest" && "bg-signal-orange/15 text-signal-orange",
                  )}>
                    {t.type}
                  </span>
                </td>
                <td className={cn("px-4 py-2.5 text-right font-bold tabular-nums", t.up ? "text-signal-green" : "text-signal-magenta")}>
                  {t.amt}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{t.bal}</td>
                <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{t.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 5 — Earnings & Expenses
 * -------------------------------------------------------------------------- */

function EarningsExpensesPanel({ v }: { v: VesselDetail }) {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="TCE (current)" value="$14,500/d" meta={v.employment.charterer} accent="blue" />
        <KpiCard label="Revenue YTD" value="$3.2M" direction="up" change="+2.1% vs prior yr" accent="green" />
        <KpiCard label="OPEX YTD" value="$2.1M" direction="up" change="+4.2% vs prior yr" accent="orange" />
        <KpiCard label="Net Margin YTD" value="34.4%" direction="down" change="−1.8pp vs prior yr" accent="magenta" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-[14px] font-bold">TCE History</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Trailing 12 months · realised TCE per day</p>
          </CardHeader>
          <div className="p-4">
            <div className="relative h-56 overflow-hidden rounded-md border border-dashed bg-muted/40">
              <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
                Chart placeholder · charting library wired in next sprint
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-[14px] font-bold">OPEX Breakdown</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">YTD by category — daily rate $5,750/d</p>
          </CardHeader>
          <ul className="space-y-2 p-4">
            {[
              { label: "Crew",            ytd: "$680K",  pct: 32, color: "bg-primary" },
              { label: "Stores",          ytd: "$252K",  pct: 12, color: "bg-signal-green" },
              { label: "Repairs",         ytd: "$401K",  pct: 19, color: "bg-signal-orange" },
              { label: "Insurance",       ytd: "$231K",  pct: 11, color: "bg-signal-purple" },
              { label: "Lubricants",      ytd: "$126K",  pct: 6,  color: "bg-accent" },
              { label: "Management Fee", ytd: "$168K",  pct: 8,  color: "bg-signal-magenta" },
              { label: "Other",           ytd: "$252K",  pct: 12, color: "bg-muted-foreground/40" },
            ].map((row) => (
              <li key={row.label} className="flex items-center gap-3 text-[12px]">
                <span className="w-28 text-muted-foreground">{row.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", row.color)} style={{ width: `${row.pct}%` }} />
                </div>
                <span className="w-14 text-right font-bold tabular-nums">{row.ytd}</span>
                <span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">{row.pct}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 6 — IRR
 * -------------------------------------------------------------------------- */

function IrrPanel({ v }: { v: VesselDetail }) {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Latest IRR (5y)" value="14.8%" direction="up" change="Base scenario" accent="green" />
        <KpiCard label="Latest NPV" value="+$4.2M" meta="At 8% discount" accent="blue" />
        <KpiCard label="Worst Case IRR" value="6.2%" direction="down" change="Bear scenario" accent="magenta" />
        <KpiCard label="Best Case IRR" value="18.3%" direction="up" change="Bull scenario" accent="cyan" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Scenario IRR / NPV</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Cashflow runs against {v.name} · 5-year holding period
          </p>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Scenario</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-right">Holding</th>
              <th className="px-4 py-2 text-right">IRR</th>
              <th className="px-4 py-2 text-right">NPV (8%)</th>
              <th className="px-4 py-2 text-right">Exit Multiple</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Bull",         created: "25 Mar 2026", hold: "5 yr", irr: "18.3%", up: true,  npv: "+$7.1M", exit: "1.42x" },
              { name: "Base",         created: "26 Mar 2026", hold: "5 yr", irr: "14.8%", up: true,  npv: "+$4.2M", exit: "1.28x" },
              { name: "Bear",         created: "26 Mar 2026", hold: "5 yr", irr: "6.2%",  up: false, npv: "−$1.4M", exit: "0.94x" },
              { name: "3yr Hold",     created: "20 Mar 2026", hold: "3 yr", irr: "10.2%", up: true,  npv: "+$1.8M", exit: "1.18x" },
            ].map((s) => (
              <tr key={s.name} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-semibold">{s.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{s.created}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{s.hold}</td>
                <td className={cn("px-4 py-2.5 text-right font-bold tabular-nums", s.up ? "text-signal-green" : "text-signal-magenta")}>
                  {s.irr}
                </td>
                <td className={cn("px-4 py-2.5 text-right font-bold tabular-nums", s.up ? "text-signal-green" : "text-signal-magenta")}>
                  {s.npv}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{s.exit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="bg-muted/30 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Quick actions
          </span>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={`/cashflow/new?imo=${v.imo}`}>
              <Calculator className="size-3.5" />
              Run new scenario
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={`/loan-oracle/new?imo=${v.imo}`}>
              <LineChartIcon className="size-3.5" />
              Run Loan Oracle
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 7 — Environmental Score
 * -------------------------------------------------------------------------- */

function EnvScorePanel({ v }: { v: VesselDetail }) {
  const fin: Financibility = v.envScore === "A" ? "highly-possible" : "possible";
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">CII Rating</p>
          <div className="mt-2"><EnvScoreBadge value={v.envScore} /></div>
          <p className="mt-2 text-[10px] text-muted-foreground">2025 IMO classification</p>
        </Card>
        <KpiCard label="Carbon Intensity" value="7.1 g/DWTnm" direction="down" change="−0.4 vs 2024" accent="green" />
        <KpiCard label="EEXI" value="Compliant" meta="Engine power limited" accent="cyan" />
        <KpiCard label="CO₂ YTD" value="18,200 t" meta="14 voyages" accent="orange" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-[14px] font-bold">CII Trend — 5 Year</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Annual attained vs required CII</p>
          </CardHeader>
          <div className="p-4">
            <div className="relative h-56 overflow-hidden rounded-md border border-dashed bg-muted/40">
              <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
                Chart placeholder · charting library wired in next sprint
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <h2 className="text-[14px] font-bold">Compliance Snapshot</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">All current regulatory checks</p>
          </CardHeader>
          <ul className="divide-y">
            {[
              { label: "EEXI compliant",       ok: true,  detail: "EPL approved — March 2024" },
              { label: "EEDI Phase 3 ready",   ok: true,  detail: "Built post-2022 standard" },
              { label: "CII rating ≥ C",       ok: true,  detail: `Currently ${v.envScore}` },
              { label: "DCS verification",     ok: true,  detail: "2025 IMO DCS submitted" },
              { label: "EU MRV",                ok: true,  detail: "2025 verified · THETIS-MRV" },
              { label: "BWM convention",        ok: true,  detail: "Type-approved BWMS installed" },
            ].map((c) => (
              <li key={c.label} className="flex items-start gap-3 px-4 py-3">
                <span className={cn(
                  "mt-0.5 inline-flex size-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  c.ok ? "bg-signal-green/15 text-signal-green" : "bg-signal-orange/15 text-signal-orange",
                )}>
                  {c.ok ? "✓" : "!"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{c.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Card className="border-signal-green/30 bg-signal-green/5 p-4">
        <div className="flex items-start gap-3 text-[12px]">
          <Recycle className="mt-0.5 size-4 flex-shrink-0 text-signal-green" />
          <p>
            <span className="font-bold text-signal-green">Strong ESG profile</span>{" "}
            <span className="text-muted-foreground">
              — this vessel&rsquo;s {v.envScore} rating combined with EEXI compliance positions it favourably for green-financed term sheets and EU ETS allowance trading.
            </span>{" "}
            Loan oracle financibility: <FinancibilityChip value={fin} />
          </p>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 8 — Valuation Certificates
 * -------------------------------------------------------------------------- */

function ValCertPanel({ v }: { v: VesselDetail }) {
  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Certs" value="6" meta="All time" accent="blue" />
        <KpiCard label="This Year" value="3" direction="up" change="On track" accent="green" />
        <KpiCard label="Next Renewal" value="Jun 2026" meta="Class certificate" accent="orange" />
        <KpiCard label="Avg Turnaround" value="1.4 days" meta="Professional tier" accent="cyan" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
          <div>
            <h2 className="text-[14px] font-bold">Issued Certificates</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Past valuations on {v.name}</p>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link href={`/valuations/request?imo=${v.imo}`}>
              <Plus className="size-3.5" />
              Request New
            </Link>
          </Button>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Cert ID</th>
              <th className="px-4 py-2 text-left">Issued</th>
              <th className="px-4 py-2 text-left">Tier</th>
              <th className="px-4 py-2 text-right">FMV</th>
              <th className="px-4 py-2 text-left">Purpose</th>
              <th className="px-4 py-2 text-right" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {[
              { id: "VC-2026-0142", issued: "20 Mar 2026", tier: "Professional", fmv: "$28.5M", purpose: "Loan Application" },
              { id: "VC-2025-0488", issued: "18 Sep 2025", tier: "Professional", fmv: "$27.4M", purpose: "Sale Negotiation" },
              { id: "VC-2025-0214", issued: "12 May 2025", tier: "Court-Ready",  fmv: "$26.9M", purpose: "Insurance" },
              { id: "VC-2024-0721", issued: "04 Dec 2024", tier: "Standard",     fmv: "$25.6M", purpose: "Internal Review" },
            ].map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-mono text-[11px] tabular-nums">{c.id}</td>
                <td className="px-4 py-2.5">{c.issued}</td>
                <td className="px-4 py-2.5">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                    c.tier === "Court-Ready" && "bg-signal-purple/15 text-signal-purple",
                    c.tier === "Professional" && "bg-primary/15 text-primary",
                    c.tier === "Standard" && "bg-muted text-muted-foreground",
                  )}>
                    {c.tier}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-bold tabular-nums">{c.fmv}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.purpose}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-[11px]">
                    <Download className="size-3" />
                    PDF
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
