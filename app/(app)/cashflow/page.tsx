"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, Download, Eye, Plus, Search, Trash2 } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { PageTabs } from "@/components/app/page-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  RequestStatusChip,
  type RequestStatus,
} from "@/components/app/request-status-chip";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — mirrors html/cashflow.html
 * -------------------------------------------------------------------------- */

type CashflowType = "Advanced" | "Light - Senior Loan" | "Light - Leasing";

type CashflowRequest = {
  versionName: string;
  type: CashflowType;
  created: string;
  holding: string;
  irr: string;
  npv: string;
  irrTone: "pos" | "neg" | "muted";
  npvTone: "pos" | "neg" | "muted";
  status: RequestStatus;
};

type VesselGroup<T> = {
  imo: string;
  name: string;
  spec: string;
  rows: T[];
};

const CASHFLOW_GROUPS: VesselGroup<CashflowRequest>[] = [
  {
    imo: "9617832",
    name: "MV Pacific Star",
    spec: "Capesize Bulk Carrier · Built 2018 · IMO 9617832 · 182,000 DWT · FMV $34.2M",
    rows: [
      { versionName: "Pacific Star — Base",      type: "Advanced",            created: "26 Mar 2026", holding: "5 yr",  irr: "14.8%", npv: "+$4.2M", irrTone: "pos", npvTone: "pos", status: "completed" },
      { versionName: "Pacific Star — Bear",      type: "Advanced",            created: "26 Mar 2026", holding: "5 yr",  irr: "6.2%",  npv: "−$1.4M", irrTone: "neg", npvTone: "neg", status: "completed" },
      { versionName: "Pacific Star — Bull",      type: "Advanced",            created: "25 Mar 2026", holding: "5 yr",  irr: "18.3%", npv: "+$7.1M", irrTone: "pos", npvTone: "pos", status: "completed" },
      { versionName: "Pacific Star — 3yr Hold",  type: "Light - Senior Loan", created: "20 Mar 2026", holding: "3 yr",  irr: "10.2%", npv: "+$1.8M", irrTone: "pos", npvTone: "pos", status: "completed" },
    ],
  },
  {
    imo: "9734219",
    name: "MT Artemis",
    spec: "MR Tanker · Built 2019 · IMO 9734219 · 50,000 DWT · FMV $22.1M",
    rows: [
      { versionName: "Artemis NPV Study", type: "Advanced", created: "22 Mar 2026", holding: "7 yr", irr: "11.4%", npv: "+$2.8M", irrTone: "pos", npvTone: "pos", status: "completed" },
    ],
  },
  {
    imo: "9587441",
    name: "MV Nordic Eagle",
    spec: "Supramax Bulk Carrier · Built 2016 · IMO 9587441 · 56,000 DWT · FMV $18.7M",
    rows: [
      { versionName: "Nordic Eagle Leasing", type: "Light - Leasing", created: "18 Mar 2026", holding: "3 yr", irr: "—", npv: "—", irrTone: "muted", npvTone: "muted", status: "running" },
    ],
  },
  {
    imo: "9401876",
    name: "MV Coral Bay",
    spec: "Handysize Bulk Carrier · Built 2012 · IMO 9401876 · 32,000 DWT · FMV $8.5M",
    rows: [
      { versionName: "Coral Bay 2026 Plan", type: "Advanced", created: "14 Mar 2026", holding: "12 mo", irr: "9.1%", npv: "+$0.9M", irrTone: "pos", npvTone: "pos", status: "completed" },
    ],
  },
  {
    imo: "9587441-2",
    name: "MV Aurora",
    spec: "Supramax Bulk Carrier · Built 2016 · IMO 9587441 · 56,000 DWT · FMV $18.7M",
    rows: [
      { versionName: "Aurora Acquisition Draft", type: "Advanced", created: "10 Mar 2026", holding: "10 yr", irr: "—", npv: "—", irrTone: "muted", npvTone: "muted", status: "draft" },
    ],
  },
];

type DcfRequest = {
  versionName: string;
  discountRate: string;
  horizon: string;
  npv: string;
  irr: string;
  payback: string;
  created: string;
  npvTone: "pos" | "neg";
  irrTone: "pos" | "neg";
  status: RequestStatus;
};

const DCF_GROUPS: VesselGroup<DcfRequest>[] = [
  {
    imo: "9617832",
    name: "MV Pacific Star",
    spec: "Capesize Bulk Carrier · Built 2018 · IMO 9617832 · 182,000 DWT · FMV $34.2M",
    rows: [
      { versionName: "Pacific Star — Base DCF", discountRate: "8.5%",  horizon: "10 yr", npv: "+$5.8M", irr: "14.2%", payback: "5.3 yrs", created: "28 Mar 2026", npvTone: "pos", irrTone: "pos", status: "completed" },
      { versionName: "Pacific Star — Bull DCF", discountRate: "7.0%",  horizon: "10 yr", npv: "+$9.4M", irr: "18.6%", payback: "4.1 yrs", created: "27 Mar 2026", npvTone: "pos", irrTone: "pos", status: "completed" },
      { versionName: "Pacific Star — Bear DCF", discountRate: "10.0%", horizon: "10 yr", npv: "−$1.2M", irr: "5.3%",  payback: "9.4 yrs", created: "26 Mar 2026", npvTone: "neg", irrTone: "neg", status: "completed" },
    ],
  },
  {
    imo: "9345671",
    name: "MT Aegean Wind",
    spec: "Tanker · Built 2015 · IMO 9345671 · 115,200 DWT · FMV $41.2M",
    rows: [
      { versionName: "Aegean Wind — Bull DCF", discountRate: "9.0%", horizon: "8 yr", npv: "+$3.1M", irr: "11.7%", payback: "6.1 yrs", created: "25 Mar 2026", npvTone: "pos", irrTone: "pos", status: "completed" },
    ],
  },
  {
    imo: "9789012",
    name: "MV Blue Star",
    spec: "Container · Built 2020 · IMO 9789012 · 55,000 DWT · FMV $52.4M",
    rows: [
      { versionName: "Blue Star — Base DCF", discountRate: "8.0%", horizon: "10 yr", npv: "+$7.4M", irr: "16.1%", payback: "4.2 yrs", created: "20 Mar 2026", npvTone: "pos", irrTone: "pos", status: "completed" },
    ],
  },
  {
    imo: "9567890",
    name: "LNG Pioneer",
    spec: "LNG Carrier · Built 2021 · IMO 9567890 · 145,000 DWT · FMV $185.0M",
    rows: [
      { versionName: "LNG Pioneer — Bull DCF", discountRate: "10.0%", horizon: "15 yr", npv: "+$12.6M", irr: "13.8%", payback: "5.8 yrs", created: "18 Mar 2026", npvTone: "pos", irrTone: "pos", status: "completed" },
    ],
  },
];

const TYPE_OPTIONS = [
  "All Types",
  "Advanced",
  "Light - Senior Loan",
  "Light - Leasing",
] as const;

const SCENARIO_OPTIONS = ["All Scenarios", "Base", "Bull", "Bear"] as const;

const STATUS_OPTIONS = [
  "All Statuses",
  "Completed",
  "Running",
  "Draft",
] as const;

/* -------------------------------------------------------------------------- */

export default function CashflowPage() {
  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Finance Toolkit" }, { label: "Cashflow" }]}
        title="Cashflow Model"
        subtitle="Project operating income, expenses and returns for vessel acquisitions"
        actions={
          <Button asChild className="gap-2">
            <Link href="/cashflow/new">
              <Plus className="size-3.5" />
              New Cashflow Calculation
            </Link>
          </Button>
        }
      />

      <PageTabs
        defaultActive="cashflow"
        tabs={[
          {
            id: "cashflow",
            label: "Cashflow Calculations",
            content: (
              <div className="flex flex-col gap-6 p-8">
                <CashflowPanel />
              </div>
            ),
          },
          {
            id: "dcf",
            label: "DCF Calculations",
            content: (
              <div className="flex flex-col gap-6 p-8">
                <DcfPanel />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Cashflow Calculations
 * -------------------------------------------------------------------------- */

function CashflowPanel() {
  const totalCalcs = CASHFLOW_GROUPS.reduce((sum, g) => sum + g.rows.length, 0);

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
            {TYPE_OPTIONS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Button size="sm" variant="outline" className="gap-2">
            <Search className="size-3.5" />
            Search
          </Button>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {totalCalcs} calculations across {CASHFLOW_GROUPS.length} vessels
          </span>
        </div>
      </Card>

      {CASHFLOW_GROUPS.map((group) => (
        <Card key={group.imo} className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
            <div>
              <h2 className="text-[15px] font-bold">
                {group.name} Cashflow Calculations
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {group.spec}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {group.rows.length}{" "}
              {group.rows.length === 1 ? "version" : "versions"}
            </span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="w-8 px-3 py-2 text-left">
                    <input type="checkbox" className="cursor-pointer" />
                  </th>
                  <th className="px-3 py-2 text-left">Version Name</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-right">Holding</th>
                  <th className="px-3 py-2 text-right">IRR</th>
                  <th className="px-3 py-2 text-right">NPV</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r, idx) => (
                  <tr
                    key={`${group.imo}-${idx}`}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2.5">
                      <input type="checkbox" className="cursor-pointer" />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-semibold">
                      {r.versionName}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground">
                      {r.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {r.created}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {r.holding}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right font-bold tabular-nums",
                        r.irrTone === "pos" && "text-signal-green",
                        r.irrTone === "neg" && "text-signal-magenta",
                        r.irrTone === "muted" && "text-muted-foreground",
                      )}
                    >
                      {r.irr}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right tabular-nums",
                        r.npvTone === "pos" && "text-signal-green",
                        r.npvTone === "neg" && "text-signal-magenta",
                        r.npvTone === "muted" && "text-muted-foreground",
                      )}
                    >
                      {r.npv}
                    </td>
                    <td className="px-3 py-2.5">
                      <RequestStatusChip value={r.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <RowActions />
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
 * Tab — DCF Calculations
 * -------------------------------------------------------------------------- */

function DcfPanel() {
  const totalCalcs = DCF_GROUPS.reduce((sum, g) => sum + g.rows.length, 0);

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
            {SCENARIO_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Button size="sm" variant="outline" className="gap-2">
            <Search className="size-3.5" />
            Search
          </Button>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {totalCalcs} DCF calculations across {DCF_GROUPS.length} vessels
          </span>
        </div>
      </Card>

      {DCF_GROUPS.map((group) => (
        <Card key={group.imo} className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
            <div>
              <h2 className="text-[15px] font-bold">
                {group.name} DCF Calculations
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {group.spec}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {group.rows.length}{" "}
              {group.rows.length === 1 ? "version" : "versions"}
            </span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="w-8 px-3 py-2 text-left">
                    <input type="checkbox" className="cursor-pointer" />
                  </th>
                  <th className="px-3 py-2 text-left">Version Name</th>
                  <th className="px-3 py-2 text-left">Discount Rate</th>
                  <th className="px-3 py-2 text-left">Horizon</th>
                  <th className="px-3 py-2 text-right">NPV</th>
                  <th className="px-3 py-2 text-right">IRR</th>
                  <th className="px-3 py-2 text-left">Payback</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r, idx) => (
                  <tr
                    key={`${group.imo}-${idx}`}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2.5">
                      <input type="checkbox" className="cursor-pointer" />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-semibold">
                      {r.versionName}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {r.discountRate}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{r.horizon}</td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right tabular-nums",
                        r.npvTone === "pos" && "text-signal-green",
                        r.npvTone === "neg" && "text-signal-magenta",
                      )}
                    >
                      {r.npv}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right font-bold tabular-nums",
                        r.irrTone === "pos" && "text-signal-green",
                        r.irrTone === "neg" && "text-signal-magenta",
                      )}
                    >
                      {r.irr}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {r.payback}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {r.created}
                    </td>
                    <td className="px-3 py-2.5">
                      <RequestStatusChip value={r.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <RowActions />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <Pagination pages={[1, 2, 3, "…", 5]} />
    </>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function RowActions() {
  return (
    <div className="flex items-center justify-end gap-1">
      <RowActionButton title="View result">
        <Eye className="size-3.5" />
      </RowActionButton>
      <RowActionButton title="Duplicate">
        <Copy className="size-3.5" />
      </RowActionButton>
      <RowActionButton title="Download">
        <Download className="size-3.5" />
      </RowActionButton>
      <RowActionButton title="Delete" danger>
        <Trash2 className="size-3.5" />
      </RowActionButton>
    </div>
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
