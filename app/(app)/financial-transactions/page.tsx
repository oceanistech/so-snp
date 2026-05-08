"use client";

import * as React from "react";
import Link from "next/link";
import {
  Construction,
  Download,
  Plus,
  Search,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { TablePagination } from "@/components/app/table-pagination";
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
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — mirrors html/financial-transactions.html
 * -------------------------------------------------------------------------- */

type TxType = "Disbursement" | "Repayment" | "Interest" | "Fee";
type TxStatus = "Completed" | "Pending" | "Failed";
type Segment = "bulk" | "tanker" | "cont" | "gas";

type Tx = {
  id: string;
  date: string;
  vessel: string;
  loanId: string;
  type: TxType;
  amountLabel: string;
  amountSign: "pos" | "neg";
  runningBalance: string;
  rateBasis: string;
  status: TxStatus;
  segment: Segment;
};

/* ─ Tab 1 — All Transactions ────────────────────────────────────── */

const TXNS: Tx[] = [
  { id: "TXN-2026-0142", date: "2026-03-20", vessel: "MV Pacific Star",     loanId: "LN-2024-008", type: "Repayment",    amountLabel: "−$285K", amountSign: "neg", runningBalance: "$17.2M", rateBasis: "SOFR+2.5%",    status: "Completed", segment: "bulk"   },
  { id: "TXN-2026-0141", date: "2026-03-18", vessel: "MT Aegean Wind",      loanId: "LN-2023-015", type: "Interest",     amountLabel: "−$148K", amountSign: "neg", runningBalance: "$28.4M", rateBasis: "EURIBOR+2.1%", status: "Completed", segment: "tanker" },
  { id: "TXN-2026-0140", date: "2026-03-15", vessel: "LNG Pioneer",         loanId: "LN-2025-003", type: "Disbursement", amountLabel: "+$5.0M", amountSign: "pos", runningBalance: "$95.0M", rateBasis: "SOFR+1.8%",    status: "Completed", segment: "gas"    },
  { id: "TXN-2026-0139", date: "2026-03-12", vessel: "MV Nordic Cape",      loanId: "LN-2022-021", type: "Repayment",    amountLabel: "−$420K", amountSign: "neg", runningBalance: "$21.1M", rateBasis: "Fixed 6.5%",   status: "Completed", segment: "bulk"   },
  { id: "TXN-2026-0138", date: "2026-03-10", vessel: "MT Horizon",          loanId: "LN-2024-011", type: "Fee",          amountLabel: "−$12K",  amountSign: "neg", runningBalance: "$13.9M", rateBasis: "—",            status: "Completed", segment: "tanker" },
  { id: "TXN-2026-0137", date: "2026-03-08", vessel: "MV Blue Star",        loanId: "LN-2025-007", type: "Disbursement", amountLabel: "+$8.2M", amountSign: "pos", runningBalance: "$38.4M", rateBasis: "SOFR+2.2%",    status: "Completed", segment: "bulk"   },
  { id: "TXN-2026-0136", date: "2026-03-05", vessel: "MV Pacific Star",     loanId: "LN-2024-008", type: "Interest",     amountLabel: "−$106K", amountSign: "neg", runningBalance: "$17.5M", rateBasis: "SOFR+2.5%",    status: "Completed", segment: "bulk"   },
  { id: "TXN-2026-0135", date: "2026-03-03", vessel: "MT Coral Sea",        loanId: "LN-2023-009", type: "Repayment",    amountLabel: "−$310K", amountSign: "neg", runningBalance: "$18.4M", rateBasis: "Fixed 7.1%",   status: "Completed", segment: "tanker" },
  { id: "TXN-2026-0134", date: "2026-02-28", vessel: "MT Olympia",          loanId: "LN-2022-018", type: "Interest",     amountLabel: "−$198K", amountSign: "neg", runningBalance: "$22.8M", rateBasis: "EURIBOR+2.8%", status: "Completed", segment: "tanker" },
  { id: "TXN-2026-0133", date: "2026-02-25", vessel: "MV Challenger",       loanId: "LN-2021-034", type: "Repayment",    amountLabel: "−$180K", amountSign: "neg", runningBalance: "$8.1M",  rateBasis: "Fixed 8.2%",   status: "Completed", segment: "bulk"   },
  { id: "TXN-2026-0132", date: "2026-02-22", vessel: "LNG Pioneer",         loanId: "LN-2025-003", type: "Disbursement", amountLabel: "+$12.0M",amountSign: "pos", runningBalance: "$90.0M", rateBasis: "SOFR+1.8%",    status: "Completed", segment: "gas"    },
  { id: "TXN-2026-0131", date: "2026-02-20", vessel: "MV Southern Cross",   loanId: "LN-2023-027", type: "Interest",     amountLabel: "−$89K",  amountSign: "neg", runningBalance: "$12.1M", rateBasis: "Fixed 6.9%",   status: "Completed", segment: "bulk"   },
  { id: "TXN-2026-0130", date: "2026-02-18", vessel: "MT Aegean Wind",      loanId: "LN-2023-015", type: "Repayment",    amountLabel: "−$520K", amountSign: "neg", runningBalance: "$28.5M", rateBasis: "EURIBOR+2.1%", status: "Completed", segment: "tanker" },
  { id: "TXN-2026-0129", date: "2026-02-15", vessel: "MV Pacific Venture",  loanId: "LN-2024-019", type: "Disbursement", amountLabel: "+$3.5M", amountSign: "pos", runningBalance: "$22.0M", rateBasis: "SOFR+2.4%",    status: "Completed", segment: "bulk"   },
  { id: "TXN-2026-0128", date: "2026-02-12", vessel: "MT Black Sea",        loanId: "LN-2023-041", type: "Fee",          amountLabel: "−$8K",   amountSign: "neg", runningBalance: "$17.8M", rateBasis: "—",            status: "Completed", segment: "tanker" },
];

const VESSEL_OPTIONS = Array.from(new Set(TXNS.map((t) => t.vessel))).sort();
const TYPE_OPTIONS: TxType[] = ["Disbursement", "Repayment", "Interest", "Fee"];

const MONTHLY_CASHFLOW: Array<{ month: string; disbPx: number; repayPx: number }> = [
  { month: "Oct", disbPx: 42, repayPx: 18 },
  { month: "Nov", disbPx: 55, repayPx: 22 },
  { month: "Dec", disbPx: 30, repayPx: 20 },
  { month: "Jan", disbPx: 60, repayPx: 24 },
  { month: "Feb", disbPx: 68, repayPx: 28 },
  { month: "Mar", disbPx: 90, repayPx: 32 },
];

const RATE_BASIS_SUMMARY = [
  { name: "SOFR-linked",    loans: 5, value: "$183.1M", tone: "blue"   as const },
  { name: "EURIBOR-linked", loans: 2, value: "$51.3M",  tone: "green"  as const },
  { name: "Fixed Rate",     loans: 5, value: "$50.1M",  tone: "orange" as const },
];

/* ─ Tab 2 — Disbursements ───────────────────────────────────────── */

type Disbursement = {
  id: string;
  date: string;
  vessel: string;
  loanId: string;
  amountLabel: string;
  balance: string;
  rate: string;
  facility: string;
  status: TxStatus;
};

const DISBURSEMENTS: Disbursement[] = [
  { id: "TX-2026-0312", date: "Mar 22, 2026", vessel: "LNG Pioneer",  loanId: "LN-2025-003", amountLabel: "+$15.0M", balance: "$90.0M", rate: "SOFR+1.80%",   facility: "Tranche B",         status: "Completed" },
  { id: "TX-2026-0298", date: "Mar 15, 2026", vessel: "Pacific Star", loanId: "LN-2024-008", amountLabel: "+$5.0M",  balance: "$17.5M", rate: "SOFR+2.50%",   facility: "Revolving Credit",  status: "Completed" },
  { id: "TX-2026-0275", date: "Mar 08, 2026", vessel: "Aegean Wind",  loanId: "LN-2023-015", amountLabel: "+$5.7M",  balance: "$28.5M", rate: "EURIBOR+2.20%",facility: "Term Loan",         status: "Completed" },
  { id: "TX-2026-0251", date: "Feb 28, 2026", vessel: "LNG Pioneer",  loanId: "LN-2025-003", amountLabel: "+$10.0M", balance: "$75.0M", rate: "SOFR+1.80%",   facility: "Tranche A",         status: "Completed" },
  { id: "TX-2026-0230", date: "Feb 18, 2026", vessel: "MT Horizon",   loanId: "LN-2024-011", amountLabel: "+$3.9M",  balance: "$13.9M", rate: "SOFR+2.75%",   facility: "Term Loan",         status: "Completed" },
  { id: "TX-2026-0204", date: "Feb 05, 2026", vessel: "Nordic Cape",  loanId: "LN-2022-021", amountLabel: "+$1.1M",  balance: "$21.1M", rate: "EURIBOR+2.00%",facility: "Revolving Credit",  status: "Completed" },
  { id: "TX-2026-0178", date: "Jan 22, 2026", vessel: "Pacific Star", loanId: "LN-2024-008", amountLabel: "+$2.0M",  balance: "$12.5M", rate: "SOFR+2.50%",   facility: "Revolving Credit",  status: "Completed" },
  { id: "TX-2026-0155", date: "Jan 10, 2026", vessel: "Aegean Wind",  loanId: "LN-2023-015", amountLabel: "+$0.4M",  balance: "$22.8M", rate: "EURIBOR+2.20%",facility: "Term Loan",         status: "Completed" },
];

/* ─ Tab 3 — Repayments ──────────────────────────────────────────── */

type Repayment = {
  id: string;
  date: string;
  vessel: string;
  loanId: string;
  amountLabel: string;
  balance: string;
  paymentType: "Regular" | "Prepayment" | "Bullet";
  status: TxStatus;
};

const REPAYMENTS: Repayment[] = [
  { id: "TX-2026-0315", date: "Mar 24, 2026", vessel: "Aegean Wind",  loanId: "LN-2023-015", amountLabel: "−$3.1M", balance: "$28.5M", paymentType: "Regular",    status: "Completed" },
  { id: "TX-2026-0308", date: "Mar 20, 2026", vessel: "Pacific Star", loanId: "LN-2024-008", amountLabel: "−$2.1M", balance: "$17.5M", paymentType: "Regular",    status: "Completed" },
  { id: "TX-2026-0290", date: "Mar 10, 2026", vessel: "LNG Pioneer",  loanId: "LN-2025-003", amountLabel: "−$3.1M", balance: "$90.0M", paymentType: "Prepayment", status: "Completed" },
  { id: "TX-2026-0261", date: "Feb 24, 2026", vessel: "Nordic Cape",  loanId: "LN-2022-021", amountLabel: "−$1.8M", balance: "$21.1M", paymentType: "Regular",    status: "Completed" },
  { id: "TX-2026-0244", date: "Feb 20, 2026", vessel: "MT Horizon",   loanId: "LN-2024-011", amountLabel: "−$1.2M", balance: "$13.9M", paymentType: "Regular",    status: "Completed" },
  { id: "TX-2026-0220", date: "Feb 10, 2026", vessel: "Aegean Wind",  loanId: "LN-2023-015", amountLabel: "−$3.1M", balance: "$31.6M", paymentType: "Regular",    status: "Completed" },
  { id: "TX-2026-0195", date: "Jan 20, 2026", vessel: "Pacific Star", loanId: "LN-2024-008", amountLabel: "−$2.1M", balance: "$19.6M", paymentType: "Regular",    status: "Completed" },
  { id: "TX-2026-0160", date: "Jan 10, 2026", vessel: "Nordic Cape",  loanId: "LN-2022-021", amountLabel: "−$2.3M", balance: "$22.9M", paymentType: "Bullet",     status: "Completed" },
];

const UPCOMING_REPAYMENTS = [
  { vessel: "Pacific Star", loanId: "LN-2024-008", due: "Apr 1, 2026",  amount: "$2.1M", days: "7 days",   urgent: true,  type: "Regular" as const },
  { vessel: "Aegean Wind",  loanId: "LN-2023-015", due: "Apr 10, 2026", amount: "$3.1M", days: "16 days",  urgent: false, type: "Regular" as const },
  { vessel: "MT Horizon",   loanId: "LN-2024-011", due: "Apr 20, 2026", amount: "$1.2M", days: "26 days",  urgent: false, type: "Regular" as const },
  { vessel: "Nordic Cape",  loanId: "LN-2022-021", due: "Apr 24, 2026", amount: "$1.8M", days: "30 days",  urgent: false, type: "Regular" as const },
  { vessel: "LNG Pioneer",  loanId: "LN-2025-003", due: "May 01, 2026", amount: "$3.5M", days: "37 days",  urgent: false, type: "Regular" as const },
];

/* ─ Tab 4 — Interest & Fees ─────────────────────────────────────── */

type InterestFeeRow = {
  id: string;
  date: string;
  vessel: string;
  loanId: string;
  type: "Interest" | "Fee";
  amountLabel: string;
  rateApplied: string;
  accrualPeriod: string;
  status: TxStatus;
};

const INTEREST_FEES: InterestFeeRow[] = [
  { id: "TX-2026-0316", date: "Mar 24, 2026", vessel: "Aegean Wind",  loanId: "LN-2023-015", type: "Interest", amountLabel: "−$0.44M", rateApplied: "EURIBOR+2.20%",     accrualPeriod: "Feb 10–Mar 24", status: "Completed" },
  { id: "TX-2026-0309", date: "Mar 20, 2026", vessel: "Pacific Star", loanId: "LN-2024-008", type: "Interest", amountLabel: "−$0.24M", rateApplied: "SOFR+2.50%",        accrualPeriod: "Jan 20–Mar 20", status: "Completed" },
  { id: "TX-2026-0302", date: "Mar 15, 2026", vessel: "LNG Pioneer",  loanId: "LN-2025-003", type: "Interest", amountLabel: "−$1.18M", rateApplied: "SOFR+1.80%",        accrualPeriod: "Feb 15–Mar 15", status: "Completed" },
  { id: "TX-2026-0285", date: "Mar 01, 2026", vessel: "Nordic Cape",  loanId: "LN-2022-021", type: "Fee",      amountLabel: "−$0.04M", rateApplied: "Commitment 0.40%",  accrualPeriod: "Q1 2026",       status: "Completed" },
  { id: "TX-2026-0265", date: "Feb 24, 2026", vessel: "Nordic Cape",  loanId: "LN-2022-021", type: "Interest", amountLabel: "−$0.28M", rateApplied: "EURIBOR+2.00%",     accrualPeriod: "Jan 24–Feb 24", status: "Completed" },
  { id: "TX-2026-0248", date: "Feb 20, 2026", vessel: "MT Horizon",   loanId: "LN-2024-011", type: "Interest", amountLabel: "−$0.18M", rateApplied: "SOFR+2.75%",        accrualPeriod: "Jan 20–Feb 20", status: "Completed" },
  { id: "TX-2026-0225", date: "Feb 10, 2026", vessel: "Aegean Wind",  loanId: "LN-2023-015", type: "Fee",      amountLabel: "−$0.06M", rateApplied: "Mgmt 0.25% p.a.",   accrualPeriod: "Annual Q1",     status: "Completed" },
  { id: "TX-2026-0200", date: "Jan 20, 2026", vessel: "Pacific Star", loanId: "LN-2024-008", type: "Interest", amountLabel: "−$0.26M", rateApplied: "SOFR+2.50%",        accrualPeriod: "Dec 20–Jan 20", status: "Completed" },
];

const FEE_SCHEDULE = [
  { loanId: "LN-2024-008", vessel: "Pacific Star", commitment: "0.35% p.a.", management: "0.20% p.a.", review: "$15,000", nextDue: "Jul 1, 2026"  },
  { loanId: "LN-2023-015", vessel: "Aegean Wind",  commitment: "0.40% p.a.", management: "0.25% p.a.", review: "$20,000", nextDue: "Jun 1, 2026"  },
  { loanId: "LN-2022-021", vessel: "Nordic Cape",  commitment: "0.40% p.a.", management: "0.25% p.a.", review: "$18,000", nextDue: "Jun 24, 2026" },
  { loanId: "LN-2024-011", vessel: "MT Horizon",   commitment: "0.30% p.a.", management: "0.20% p.a.", review: "$12,000", nextDue: "Aug 15, 2026" },
  { loanId: "LN-2025-003", vessel: "LNG Pioneer",  commitment: "0.45% p.a.", management: "0.30% p.a.", review: "$85,000", nextDue: "Jan 10, 2027" },
];

/* ─ Tab 5 — Amortization Schedule ───────────────────────────────── */

const AMORTIZATION = [
  { period: 1,  date: "Apr 1, 2026", opening: "$17,500,000", principal: "$175,000", interest: "$142,604", total: "$317,604", closing: "$17,325,000", cumul: "$175,000"   },
  { period: 2,  date: "May 1, 2026", opening: "$17,325,000", principal: "$175,000", interest: "$141,177", total: "$316,177", closing: "$17,150,000", cumul: "$350,000"   },
  { period: 3,  date: "Jun 1, 2026", opening: "$17,150,000", principal: "$175,000", interest: "$139,750", total: "$314,750", closing: "$16,975,000", cumul: "$525,000"   },
  { period: 4,  date: "Jul 1, 2026", opening: "$16,975,000", principal: "$175,000", interest: "$138,323", total: "$313,323", closing: "$16,800,000", cumul: "$700,000"   },
  { period: 5,  date: "Aug 1, 2026", opening: "$16,800,000", principal: "$175,000", interest: "$136,896", total: "$311,896", closing: "$16,625,000", cumul: "$875,000"   },
  { period: 6,  date: "Sep 1, 2026", opening: "$16,625,000", principal: "$175,000", interest: "$135,469", total: "$310,469", closing: "$16,450,000", cumul: "$1,050,000" },
  { period: 7,  date: "Oct 1, 2026", opening: "$16,450,000", principal: "$175,000", interest: "$134,042", total: "$309,042", closing: "$16,275,000", cumul: "$1,225,000" },
  { period: 8,  date: "Nov 1, 2026", opening: "$16,275,000", principal: "$175,000", interest: "$132,615", total: "$307,615", closing: "$16,100,000", cumul: "$1,400,000" },
  { period: 9,  date: "Dec 1, 2026", opening: "$16,100,000", principal: "$175,000", interest: "$131,188", total: "$306,188", closing: "$15,925,000", cumul: "$1,575,000" },
  { period: 10, date: "Jan 1, 2027", opening: "$15,925,000", principal: "$175,000", interest: "$129,760", total: "$304,760", closing: "$15,750,000", cumul: "$1,750,000" },
  { period: 11, date: "Feb 1, 2027", opening: "$15,750,000", principal: "$175,000", interest: "$128,333", total: "$303,333", closing: "$15,575,000", cumul: "$1,925,000" },
  { period: 12, date: "Mar 1, 2027", opening: "$15,575,000", principal: "$175,000", interest: "$126,906", total: "$301,906", closing: "$15,400,000", cumul: "$2,100,000" },
];

const LOAN_OPTIONS = [
  "LN-2024-008 — MV Pacific Star — $17.5M — SOFR+2.50% — 7-year term",
  "LN-2023-015 — MV Aegean Wind — $28.5M — EURIBOR+2.20% — 8-year term",
  "LN-2022-021 — MT Nordic Cape — $21.1M — EURIBOR+2.00% — 7-year term",
  "LN-2024-011 — MT Horizon — $13.9M — SOFR+2.75% — 5-year term",
  "LN-2025-003 — LNG Pioneer — $90.0M — SOFR+1.80% — 12-year term",
];

/* -------------------------------------------------------------------------- */

export default function FinancialTransactionsPage() {
  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "Financial Transactions" }]}
        title="Financial Transactions"
        subtitle="Track all loan disbursements, repayments, interest accruals and fee payments"
        actions={
          <>
            <SegmentPills />
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export PDF
            </Button>
            <Button className="gap-2">
              <Plus className="size-3.5" />
              New Transaction
            </Button>
          </>
        }
      />

      {/* Single subtab label — mirrors the prototype's `.subtabs` row which
          contains only one entry on this page. */}
      <div className="flex items-end gap-0 border-b bg-card px-8">
        <span
          role="tab"
          aria-selected
          className="whitespace-nowrap border-b-2 border-primary px-5 py-2.5 text-[12px] font-semibold text-primary"
        >
          Financial Transactions
        </span>
      </div>

      <div className="flex flex-col gap-6 p-8">
        {/* Segment Insight Panel — same data shared with Valuations / Net Fleet */}
        <SegmentInsightPanel />

        <AllTransactionsPanel />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab — All Transactions
 * -------------------------------------------------------------------------- */

function AllTransactionsPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total Loan Book"   value="$284.5M" meta="12 active loans"          accent="blue"    />
        <KpiCard label="Active Loans"      value="12"      meta="across 9 vessels"          accent="green"   />
        <KpiCard label="Disbursed YTD"     value="$42.1M"  direction="up"   change="+18.4% vs prior year"   accent="cyan"    />
        <KpiCard label="Repaid YTD"        value="$18.7M"  direction="up"   change="+6.2% vs prior year"    accent="orange"  />
        <KpiCard label="Avg Interest Rate" value="7.24%"   direction="down" change="−0.18% vs last quarter" accent="magenta" />
      </section>

      {/* 7-3 split */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        {/* LEFT — filter + transactions table */}
        <Card className="overflow-hidden lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions…"
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
              <option>All Types</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
              <option>All Vessels</option>
              {VESSEL_OPTIONS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              From
              <input
                type="date"
                defaultValue="2026-02-01"
                className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              To
              <input
                type="date"
                defaultValue="2026-03-25"
                className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <Button size="sm" variant="outline" className="ml-auto gap-2 whitespace-nowrap">
              <Download className="size-3.5" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2 text-left">TX ID</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Vessel</th>
                  <th className="px-3 py-2 text-left">Loan ID</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-right">Running Balance</th>
                  <th className="px-3 py-2 text-left">Rate Basis</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {TXNS.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                      {t.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{t.date}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{t.vessel}</td>
                    <td className="px-3 py-2.5">
                      <LoanIdTag id={t.loanId} />
                    </td>
                    <td className="px-3 py-2.5">
                      <TxTypeBadge type={t.type} />
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right font-bold tabular-nums",
                        t.amountSign === "pos" ? "text-signal-green" : "text-signal-magenta",
                      )}
                    >
                      {t.amountLabel}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{t.runningBalance}</td>
                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{t.rateBasis}</td>
                    <td className="px-3 py-2.5">
                      <StatusChip status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={1}
            totalPages={1}
            totalRows={TXNS.length}
            perPage={25}
            rowLabel="transaction"
          />
        </Card>

        {/* RIGHT — Cash flow + Loan summary */}
        <div className="flex flex-col gap-3 lg:col-span-3">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">This Month&rsquo;s Cash Flow</CardTitle>
              <CardDescription>March 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 py-3 text-[12px]">
              <SummaryLine label="Disbursements" value="+$25.7M" tone="pos"  />
              <SummaryLine label="Repayments"     value="−$8.3M"  tone="blue" />
              <SummaryLine label="Interest Paid"  value="−$1.8M"  tone="orange" />
              <SummaryLine label="Fees"           value="−$0.08M" tone="muted" />
              <div className="mt-2 border-t pt-2">
                <SummaryLine label="Net Cash Flow" value="+$15.5M" tone="pos" bold />
              </div>
            </CardContent>

            <div className="border-t px-4 pt-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                6-Month Cash Flow
              </p>
              <div className="flex h-24 items-end gap-2">
                {MONTHLY_CASHFLOW.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-full w-full items-end gap-0.5">
                      <div
                        className="flex-1 rounded-sm bg-signal-green"
                        style={{ height: `${m.disbPx}%` }}
                        title={`Disb ${m.month}`}
                      />
                      <div
                        className="flex-1 rounded-sm bg-signal-magenta"
                        style={{ height: `${m.repayPx}%` }}
                        title={`Repay ${m.month}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 pb-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-signal-green" />
                  Disbursement
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-signal-magenta" />
                  Repayment
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Loan Summary by Rate Basis</CardTitle>
            </CardHeader>
            <ul className="divide-y">
              {RATE_BASIS_SUMMARY.map((r) => (
                <li key={r.name} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.loans} loan{r.loans === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[14px] font-extrabold tabular-nums",
                      r.tone === "blue" && "text-primary",
                      r.tone === "green" && "text-signal-green",
                      r.tone === "orange" && "text-signal-orange",
                    )}
                  >
                    {r.value}
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
 * Tab — Disbursements
 * -------------------------------------------------------------------------- */

function DisbursementsPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Disbursed YTD"        value="$42.1M" meta="Jan–Mar 2026"        accent="blue"   />
        <KpiCard label="Disbursements This Month"   value="$25.7M" meta="March 2026"          accent="green"  />
        <KpiCard label="Active Drawdown Facilities" value="4"      meta="Available for drawdown" accent="cyan"    />
        <KpiCard label="Pending Disbursements"      value="2"      meta="Awaiting approval"   accent="orange" />
      </section>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-9 w-44 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Vessels</option>
            <option>MV Pacific Star</option>
            <option>MV Aegean Wind</option>
            <option>MT Nordic Cape</option>
            <option>MT Horizon</option>
            <option>LNG Pioneer</option>
          </select>
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            From
            <input type="date" defaultValue="2026-01-01" className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            To
            <input type="date" defaultValue="2026-03-25" className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" />
          </label>
          <input
            type="text"
            placeholder="Loan ID…"
            className="h-9 w-28 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="sm" variant="outline" className="ml-auto gap-2">
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Disbursement History</CardTitle>
          <CardDescription>All loan drawdowns — YTD 2026</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">TX ID</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-left">Loan ID</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right">Balance After</th>
                <th className="px-3 py-2 text-left">Rate Basis</th>
                <th className="px-3 py-2 text-left">Facility Type</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {DISBURSEMENTS.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {d.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{d.date}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{d.vessel}</td>
                  <td className="px-3 py-2.5">
                    <LoanIdTag id={d.loanId} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums text-signal-green">
                    {d.amountLabel}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{d.balance}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{d.rate}</td>
                  <td className="px-3 py-2.5 text-[11px]">{d.facility}</td>
                  <td className="px-3 py-2.5">
                    <StatusChip status={d.status} settledLabel />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Monthly Disbursements</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPlaceholder height="h-44" />
        </CardContent>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Repayments
 * -------------------------------------------------------------------------- */

function RepaymentsPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Repaid YTD"      value="$18.7M" meta="Jan–Mar 2026"          accent="green"  />
        <KpiCard label="Repayments This Month" value="$8.3M"  meta="March 2026"             accent="blue"   />
        <KpiCard label="On-Schedule Rate"      value="100%"   meta="No missed payments"     accent="cyan"   />
        <KpiCard label="Next Payment Due"      value="Apr 1"  meta="$2.1M — Pacific Star"   accent="orange" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Repayment History</CardTitle>
          <CardDescription>All principal and prepayment transactions — YTD 2026</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">TX ID</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-left">Loan ID</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right">Remaining Balance</th>
                <th className="px-3 py-2 text-left">Payment Type</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {REPAYMENTS.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {r.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{r.date}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{r.vessel}</td>
                  <td className="px-3 py-2.5">
                    <LoanIdTag id={r.loanId} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums text-signal-magenta">
                    {r.amountLabel}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.balance}</td>
                  <td className="px-3 py-2.5">
                    <PaymentTypeBadge type={r.paymentType} />
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusChip status={r.status} settledLabel />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Upcoming Repayments</CardTitle>
          <CardDescription>Next scheduled payments across all facilities</CardDescription>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-3 py-2 text-left">Vessel</th>
              <th className="px-3 py-2 text-left">Loan ID</th>
              <th className="px-3 py-2 text-left">Due Date</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-right">Days Until Due</th>
              <th className="px-3 py-2 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {UPCOMING_REPAYMENTS.map((u) => (
              <tr key={u.loanId + u.due} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2.5 font-semibold">{u.vessel}</td>
                <td className="px-3 py-2.5">
                  <LoanIdTag id={u.loanId} />
                </td>
                <td className="px-3 py-2.5">{u.due}</td>
                <td className="px-3 py-2.5 text-right font-bold tabular-nums">{u.amount}</td>
                <td
                  className={cn(
                    "px-3 py-2.5 text-right tabular-nums",
                    u.urgent
                      ? "font-bold text-signal-orange"
                      : "text-muted-foreground",
                  )}
                >
                  {u.days}
                </td>
                <td className="px-3 py-2.5">
                  <PaymentTypeBadge type={u.type} />
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
 * Tab — Interest & Fees
 * -------------------------------------------------------------------------- */

function InterestFeesPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Interest Paid YTD"   value="$8.2M"  meta="Jan–Mar 2026"          accent="blue"   />
        <KpiCard label="Fees Paid YTD"        value="$0.3M"  meta="Commitment + management" accent="orange" />
        <KpiCard label="Avg All-in Cost"      value="7.24%"  meta="Blended across all loans" accent="cyan"   />
        <KpiCard label="Accrued Interest (est.)" value="$0.9M" meta="Current period"        accent="green"  />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Interest &amp; Fee Payments</CardTitle>
          <CardDescription>All interest and fee transactions — YTD 2026</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">TX ID</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-left">Loan ID</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-left">Rate Applied</th>
                <th className="px-3 py-2 text-left">Accrual Period</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {INTEREST_FEES.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {r.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{r.date}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{r.vessel}</td>
                  <td className="px-3 py-2.5">
                    <LoanIdTag id={r.loanId} />
                  </td>
                  <td className="px-3 py-2.5">
                    <TxTypeBadge type={r.type} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums text-signal-magenta">
                    {r.amountLabel}
                  </td>
                  <td className="px-3 py-2.5 text-[11px]">{r.rateApplied}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground">
                    {r.accrualPeriod}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusChip status={r.status} settledLabel />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Fee Schedule</CardTitle>
          <CardDescription>Recurring fees by loan facility</CardDescription>
        </CardHeader>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-3 py-2 text-left">Loan ID</th>
              <th className="px-3 py-2 text-left">Vessel</th>
              <th className="px-3 py-2 text-left">Commitment Fee</th>
              <th className="px-3 py-2 text-left">Management Fee</th>
              <th className="px-3 py-2 text-left">Annual Review Fee</th>
              <th className="px-3 py-2 text-left">Next Due</th>
            </tr>
          </thead>
          <tbody>
            {FEE_SCHEDULE.map((f) => (
              <tr key={f.loanId} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2.5">
                  <LoanIdTag id={f.loanId} />
                </td>
                <td className="px-3 py-2.5 font-semibold">{f.vessel}</td>
                <td className="px-3 py-2.5">{f.commitment}</td>
                <td className="px-3 py-2.5">{f.management}</td>
                <td className="px-3 py-2.5 tabular-nums">{f.review}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{f.nextDue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Amortization Schedule
 * -------------------------------------------------------------------------- */

function AmortizationPanel() {
  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Select Loan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 py-3">
          <select
            defaultValue={LOAN_OPTIONS[0]}
            className="h-9 max-w-[500px] flex-1 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {LOAN_OPTIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <Button size="sm" variant="outline">
            Load Schedule
          </Button>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Current Loan Balance"           value="$17.5M"   meta="LN-2024-008"          accent="blue"    />
        <KpiCard label="Remaining Payments"             value="64"        meta="Monthly instalments"  accent="orange"  />
        <KpiCard label="Maturity Date"                  value="Aug 2031"  meta="64 months remaining"  accent="cyan"    />
        <KpiCard label="Total Interest Remaining (est.)" value="$4.2M"    meta="At current SOFR rate" accent="magenta" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">
            Amortization Schedule — LN-2024-008 — MV Pacific Star
          </CardTitle>
          <CardDescription>
            Next 12 payment periods — SOFR+2.50% — 7-year term
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-right">Period</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Opening Balance</th>
                <th className="px-3 py-2 text-right">Principal</th>
                <th className="px-3 py-2 text-right">Interest</th>
                <th className="px-3 py-2 text-right">Total Payment</th>
                <th className="px-3 py-2 text-right">Closing Balance</th>
                <th className="px-3 py-2 text-right">Cumul. Principal</th>
              </tr>
            </thead>
            <tbody>
              {AMORTIZATION.map((row) => (
                <tr key={row.period} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">{row.period}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{row.date}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">{row.opening}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">{row.principal}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-signal-orange">
                    {row.interest}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold tabular-nums">
                    {row.total}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">{row.closing}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {row.cumul}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Loan Balance Over Time</CardTitle>
          <CardDescription>MV Pacific Star — LN-2024-008</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPlaceholder height="h-44" />
        </CardContent>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function SegmentPills() {
  type Seg = { label: string; activeClass: string };
  const segs: Seg[] = [
    { label: "Bulk",      activeClass: "bg-primary text-primary-foreground" },
    { label: "Tanker",    activeClass: "bg-signal-orange text-white" },
    { label: "Container", activeClass: "bg-signal-purple text-white" },
    { label: "Gas",       activeClass: "bg-accent text-accent-foreground" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-md border bg-card p-0.5">
      {segs.map((s) => (
        <button
          key={s.label}
          type="button"
          className={cn(
            "rounded px-2.5 py-1 text-[11px] font-semibold transition-colors",
            s.activeClass,
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function LoanIdTag({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
      {id}
    </span>
  );
}

function TxTypeBadge({ type }: { type: TxType }) {
  const STYLE: Record<TxType, string> = {
    Disbursement: "bg-signal-green/15 text-signal-green",
    Repayment: "bg-primary/15 text-primary",
    Interest: "bg-signal-orange/15 text-signal-orange",
    Fee: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", STYLE[type])}>
      {type}
    </span>
  );
}

function PaymentTypeBadge({ type }: { type: "Regular" | "Prepayment" | "Bullet" }) {
  const STYLE = {
    Regular: "bg-primary/10 text-primary",
    Prepayment: "bg-signal-orange/10 text-signal-orange",
    Bullet: "bg-signal-magenta/10 text-signal-magenta",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", STYLE[type])}>
      {type}
    </span>
  );
}

function StatusChip({
  status,
  settledLabel = false,
}: {
  status: TxStatus;
  /** When true, render Completed as "Settled" to match the prototype's `badge-green` "Settled" wording in tabs 2–4. */
  settledLabel?: boolean;
}) {
  const STYLE: Record<TxStatus, string> = {
    Completed: "bg-signal-green/15 text-signal-green",
    Pending: "bg-signal-orange/15 text-signal-orange",
    Failed: "bg-signal-magenta/15 text-signal-magenta",
  };
  const label =
    settledLabel && status === "Completed" ? "Settled" : status;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", STYLE[status])}>
      {label}
    </span>
  );
}

function SummaryLine({
  label,
  value,
  tone,
  bold = false,
}: {
  label: string;
  value: string;
  tone: "pos" | "neg" | "neu" | "blue" | "orange" | "muted";
  bold?: boolean;
}) {
  return (
    <div className={cn("flex items-baseline justify-between", bold && "text-[14px]")}>
      <span className={cn("text-muted-foreground", bold && "font-bold text-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "font-mono tabular-nums",
          bold ? "font-extrabold" : "font-bold",
          tone === "pos" && "text-signal-green",
          tone === "neg" && "text-signal-magenta",
          tone === "neu" && "text-foreground",
          tone === "blue" && "text-primary",
          tone === "orange" && "text-signal-orange",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </span>
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

