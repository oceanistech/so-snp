"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Search,
  Zap,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Vessel quicklook — hard-coded list mirrors the prototype's dropdown in
 * html/new-loan-request.html.
 * -------------------------------------------------------------------------- */

type VesselOption = {
  imo: string;
  name: string;
  type: string;
  dwt: string;
  year: number;
  fmv: number; // $M
};

const VESSELS: VesselOption[] = [
  { imo: "9512345", name: "MV Athena",       type: "Panamax Bulk Carrier",   dwt: "75,000",  year: 2014, fmv: 12.4 },
  { imo: "9617832", name: "MV Pacific Star", type: "Capesize Bulk Carrier",  dwt: "182,000", year: 2018, fmv: 34.2 },
  { imo: "9587441", name: "MV Nordic Eagle", type: "Supramax Bulk Carrier",  dwt: "56,000",  year: 2016, fmv: 18.7 },
  { imo: "9734219", name: "MT Artemis",      type: "MR Tanker",              dwt: "50,000",  year: 2019, fmv: 22.1 },
  { imo: "9401876", name: "MV Coral Bay",    type: "Handysize Bulk Carrier", dwt: "32,000",  year: 2012, fmv: 8.5  },
];

const COUNTRIES_OWNER_TM = [
  "Algeria",
  "Bahamas",
  "Cyprus",
  "Greece",
  "Hong Kong",
  "Liberia",
  "Malta",
  "Marshall Islands",
  "Monaco",
  "Norway",
  "Panama",
  "Singapore",
  "United Kingdom",
  "United States",
  "Other",
];

const COUNTRIES_FLAG = [
  "Bahamas",
  "Cyprus",
  "Greece",
  "Liberia",
  "Malta",
  "Marshall Islands",
  "Netherlands (the)",
  "Norway",
  "Panama",
  "Singapore",
  "United Kingdom",
  "Other",
];

type EmploymentType = "spot" | "tc" | "bareboat" | "idle";

/* --------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

export default function NewLoanOraclePage() {
  const [title, setTitle] = React.useState("Unsaved Loan Oracle Calculation");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<VesselOption | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hasResults, setHasResults] = React.useState(false);
  const [employment, setEmployment] = React.useState<EmploymentType>("spot");

  const visibleVessels = VESSELS.filter((v) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      v.name.toLowerCase().includes(q) ||
      v.imo.includes(q) ||
      v.type.toLowerCase().includes(q)
    );
  });

  function handleSelect(v: VesselOption) {
    setSelected(v);
    setQuery(v.name);
    setDropdownOpen(false);
  }

  function handleClearVessel() {
    setSelected(null);
    setQuery("");
  }

  function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setHasResults(true);
  }

  const runDisabled = !selected;

  return (
    <form onSubmit={handleRun} className="flex h-full min-h-0 flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Finance Toolkit" },
          { label: "Loan Oracle", href: "/loan-oracle" },
          { label: "New Loan Oracle Calculation" },
        ]}
        title={
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="-mx-1 -my-0.5 rounded border border-transparent bg-transparent px-1 py-0.5 font-display text-[24px] font-extrabold leading-[1.2] tracking-[-0.6px] text-foreground hover:border-dashed hover:border-muted-foreground focus:border-solid focus:border-primary focus:outline-none"
          />
        }
        subtitle="Estimate financing terms for any vessel — in seconds."
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/loan-oracle">
                <ArrowLeft className="size-3.5" />
                Back
              </Link>
            </Button>
            <Button type="button" disabled={runDisabled} className="gap-2">
              <Save className="size-3.5" />
              Save Calculation
            </Button>
          </>
        }
      />

      {/* Split layout — 520px left form, flex right results */}
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[520px_1fr]">
        {/* ── LEFT PANEL ── */}
        <div className="flex min-h-0 flex-col overflow-hidden border-r bg-card">
          <div className="flex-1 overflow-y-auto px-8 py-5">
            {/* Vessel search */}
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDropdownOpen(true);
                  setSelected(null);
                }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                placeholder="Search by vessel name, IMO, or type..."
                autoComplete="off"
                className="h-[42px] w-full rounded-md border border-input bg-background pl-9 pr-3 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {dropdownOpen && visibleVessels.length > 0 && !selected ? (
                <div className="absolute left-0 right-0 top-[46px] z-20 max-h-60 overflow-y-auto rounded-md border bg-card shadow-lg">
                  {visibleVessels.map((v) => (
                    <button
                      key={v.imo}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(v);
                      }}
                      className="block w-full border-b px-4 py-2 text-left last:border-0 hover:bg-primary/[0.06]"
                    >
                      <div className="text-[12px] font-semibold text-foreground">
                        {v.name} — {v.type}, {v.year}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        IMO {v.imo} · {v.dwt} DWT · ${v.fmv.toFixed(1)}M
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Vessel summary */}
            {selected ? (
              <div className="mb-3 rounded-md border bg-muted/40 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[12px] font-bold text-foreground">{selected.name}</span>
                  <button
                    type="button"
                    onClick={handleClearVessel}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <SummaryLine label="IMO"          value={selected.imo} />
                  <SummaryLine label="Type"         value={selected.type} />
                  <SummaryLine label="DWT"          value={selected.dwt} />
                  <SummaryLine label="Built"        value={String(selected.year)} />
                  <SummaryLine label="Market Value" value={`$${selected.fmv.toFixed(1)}M`} />
                </div>
              </div>
            ) : null}

            {/* ── FUTURE SETUP ── */}
            <ParamSection first>Future Setup</ParamSection>
            <Form2Col>
              <Field label="Country of Owner" required>
                <SelectInput defaultValue="Greece" options={COUNTRIES_OWNER_TM} />
              </Field>
              <Field label="Country of Technical Manager" required>
                <SelectInput defaultValue="Greece" options={COUNTRIES_OWNER_TM} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Country of Flag" required>
                <SelectInput defaultValue="Marshall Islands" options={COUNTRIES_FLAG} />
              </Field>
              <span />
            </Form2Col>

            <Divider />

            {/* ── OTHER INFORMATION ── */}
            <ParamSection>Other Information</ParamSection>
            <Form2Col>
              <Field label="OPEX ($/day)">
                <TextInput defaultValue="2,300" />
              </Field>
              <Field label="Technical Management Fees ($)">
                <TextInput defaultValue="56,000" />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="SG&A ($)">
                <TextInput defaultValue="50,000" />
              </Field>
              <Field label="Dry Dock Costs ($)">
                <TextInput defaultValue="4,500" />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Dry Dock Due Date">
                <DateInput defaultValue="2025-09-24" />
              </Field>
              <span />
            </Form2Col>

            <Divider />

            {/* ── EMPLOYMENT ── */}
            <ParamSection>Employment</ParamSection>
            <Form2Col>
              <Field label="Employment Type" required>
                <select
                  value={employment}
                  onChange={(e) => setEmployment(e.target.value as EmploymentType)}
                  className={SELECT_CLASS}
                >
                  <option value="spot">Spot</option>
                  <option value="tc">Time Charter</option>
                  <option value="bareboat">Bareboat Charter</option>
                  <option value="idle">Idle</option>
                </select>
              </Field>
              <span />
            </Form2Col>

            {employment === "spot" ? (
              <>
                <Form2Col>
                  <Field label="Earnings / Day" required>
                    <TextInput defaultValue="4,500" />
                  </Field>
                  <Field label="Months" required>
                    <TextInput defaultValue="24" />
                  </Field>
                </Form2Col>
                <Form2Col>
                  <Field label="Charter Commissions" required>
                    <TextInput defaultValue="0" placeholder="%" />
                  </Field>
                  <span />
                </Form2Col>
              </>
            ) : null}

            {employment === "tc" ? (
              <>
                <Form2Col>
                  <Field label="Employment Period" required>
                    <DateRange defaultStart="2025-09-04" defaultEnd="2027-09-04" />
                  </Field>
                  <Field label="TC Rate" required>
                    <TextInput defaultValue="14,500" />
                  </Field>
                </Form2Col>
                <Form2Col>
                  <Field label="Charter Commissions" required>
                    <TextInput defaultValue="0" placeholder="%" />
                  </Field>
                  <span />
                </Form2Col>
              </>
            ) : null}

            {employment === "bareboat" ? (
              <>
                <Form2Col>
                  <Field label="Bareboat Rate" required>
                    <TextInput placeholder="Bareboat Rate" />
                  </Field>
                  <Field label="Months" required>
                    <TextInput placeholder="Months" />
                  </Field>
                </Form2Col>
              </>
            ) : null}

            <Divider />

            {/* ── FINANCING ── */}
            <ParamSection>Financing</ParamSection>
            <Form2Col>
              <Field label="Financing Type" required>
                <SelectInput
                  defaultValue="Re-financing"
                  options={["Re-financing", "New Purchase", "Pre-delivery", "Post-delivery"]}
                />
              </Field>
              <Field label="Loan Amount" required>
                <TextInput defaultValue="17,940,000" />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="LTV" hint="Auto-calculated from Loan Amount & FMV">
                <TextInput defaultValue="39" readOnly />
              </Field>
              <Field label="Fair Market Value ($M)" hint="Auto-populated from Signal Ocean">
                <TextInput defaultValue="46.0" />
              </Field>
            </Form2Col>
          </div>

          {/* Sticky run footer */}
          <div className="flex flex-shrink-0 flex-col gap-1.5 border-t bg-card px-8 py-3">
            <Button
              type="submit"
              disabled={runDisabled}
              className="h-[42px] w-full gap-2 text-[13px] font-bold"
            >
              <Zap className="size-3.5" />
              Run Loan Oracle →
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Results based on current senior secured shipping finance market.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-y-auto bg-muted/30 px-8 py-5">
          {hasResults ? <ResultsPanel /> : <ResultsEmptyState />}
        </div>
      </div>
    </form>
  );
}

/* --------------------------------------------------------------------------
 * Form helpers
 * -------------------------------------------------------------------------- */

const INPUT_CLASS =
  "h-9 w-full rounded border border-input bg-card px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const SELECT_CLASS =
  "h-9 w-full rounded border border-input bg-card px-2 text-[12px] text-foreground focus:border-primary focus:outline-none";

function ParamSection({
  children,
  first = false,
}: {
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <h3
      className={cn(
        "mb-3 text-[11px] font-bold uppercase tracking-[0.04em] text-foreground",
        first ? "mt-0" : "mt-5",
      )}
    >
      {children}
    </h3>
  );
}

function Form2Col({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 grid grid-cols-2 gap-x-6 gap-y-0">{children}</div>;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 flex flex-col">
      <span className="mb-1 text-[11px] font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-muted-foreground">*</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="mt-0.5 text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      {...props}
      className={cn(
        INPUT_CLASS,
        props.readOnly && "bg-muted/40 text-muted-foreground",
        props.className,
      )}
    />
  );
}

function DateInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="date" {...props} className={cn(INPUT_CLASS, props.className)} />;
}

function SelectInput({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <select {...props} className={cn(SELECT_CLASS, props.className)}>
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  );
}

function DateRange({
  defaultStart,
  defaultEnd,
}: {
  defaultStart?: string;
  defaultEnd?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="date" defaultValue={defaultStart} className={cn(INPUT_CLASS, "flex-1")} />
      <span className="text-[11px] text-muted-foreground">~</span>
      <input type="date" defaultValue={defaultEnd} className={cn(INPUT_CLASS, "flex-1")} />
    </div>
  );
}

function Divider() {
  return <hr className="my-4 border-border" />;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px]">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Right panel — empty + results
 * -------------------------------------------------------------------------- */

function ResultsEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <svg
        width="64"
        height="64"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
        className="mb-3 text-muted-foreground/30"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M11 8v3m0 0v3m0-3h3m-3 0H8" strokeWidth="1.5" />
      </svg>
      <h3 className="mb-1 text-[14px] font-bold text-muted-foreground">
        Configure &amp; Run
      </h3>
      <p className="max-w-[300px] text-[12px] leading-relaxed text-muted-foreground">
        Set your vessel and deal parameters on the left, then click &ldquo;Run Loan Oracle&rdquo;
        to see financing estimates.
      </p>
    </div>
  );
}

/* The 7 chance levels (red → green) — matches the prototype's `.chance-bar .seg.lN` colors. */
const CHANCE_COLORS = [
  "#ef4444", // l1 — Hardly possible
  "#f97316", // l2 — Very challenging
  "#f59e0b", // l3 — Challenging
  "#84cc16", // l4 — Promising
  "#22c55e", // l5 — Good chances
  "#10b981", // l6 — High certainty
  "#059669", // l7 — Done Deal
];

const CHANCE_LABELS = [
  "Hardly possible",
  "Very challenging",
  "Challenging",
  "Promising",
  "Good chances",
  "High certainty",
  "Done Deal",
];

function ResultsPanel() {
  // Hardcoded mock values to match the prototype's static result section.
  const filledLevel = 5; // matches prototype: "Good chances" with 5 of 7 segs lit

  return (
    <div className="flex flex-col">
      {/* Chances label */}
      <div className="mb-3 text-center text-[18px] font-extrabold text-[#22c55e]">
        Good chances
      </div>

      {/* 7-step progress bar */}
      <div className="mb-3 flex h-[14px] gap-[3px] overflow-hidden rounded-full">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              backgroundColor: i < filledLevel ? CHANCE_COLORS[i] : "#e2e8f0",
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mb-2 flex justify-between text-[10px] text-muted-foreground">
        {CHANCE_LABELS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>

      {/* Feedback paragraph */}
      <p className="mb-5 px-3 text-center text-[12px] leading-relaxed text-muted-foreground">
        Your project has good chances of attracting competitive financing offers from
        several financial institutions on our platform.
      </p>

      <hr className="mb-6 border-border" />

      {/* Expected Terms */}
      <h3 className="mb-3 text-[14px] font-extrabold tracking-tight text-foreground">
        Expected Terms
      </h3>
      <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <TermCard label="Margin"        value="1.9% – 3.0%" />
        <TermCard label="Loan Amount"   value="$ 11.50 m" />
        <TermCard label="Loan-To-Value" value="25.0%" />
        <TermCard label="Tenor"         value="5" />
      </div>

      <hr className="mb-6 border-border" />

      {/* Potential Financiers */}
      <h3 className="mb-3 text-[14px] font-extrabold tracking-tight text-foreground">
        Potential Financiers
      </h3>
      <div className="mb-6 overflow-hidden rounded-md border bg-card">
        <FinancierRow header>Name</FinancierRow>
        <FinancierRow>First Citizens Bank (former CIT)</FinancierRow>
        <FinancierRow>DZ Bank</FinancierRow>
        <FinancierRow>Hamburg Commercial Bank AG</FinancierRow>
        <FinancierRow>Ostfriesische Volksbank</FinancierRow>
        <FinancierRow last>PROW Capital</FinancierRow>
      </div>

      <hr className="mb-6 border-border" />

      {/* Financial Transactions */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-extrabold tracking-tight text-foreground">
          Financial Transactions
        </h3>
        <input
          type="text"
          placeholder="Search by a keyword"
          className="h-[34px] w-[240px] rounded border border-input bg-card px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <TransactionsTable />
    </div>
  );
}

function TermCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#0B1929] p-4 text-white">
      <div className="mb-1.5 text-[11px] font-semibold opacity-75">{label}</div>
      <div className="font-display text-[18px] font-extrabold leading-tight tracking-tight">
        {value}
      </div>
    </div>
  );
}

function FinancierRow({
  children,
  header = false,
  last = false,
}: {
  children: React.ReactNode;
  header?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center px-4 py-2 text-[12px]",
        !last && "border-b",
        header
          ? "bg-muted/40 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground"
          : "text-foreground",
      )}
    >
      {children}
    </div>
  );
}

type Txn = {
  type: string;
  date: string;
  financier: string;
  ltv: string;
  size: string;
  loan: string;
};

const TXNS: Txn[] = [
  { type: "Newbuilding Financing",      date: "12 Jan 2026", financier: "Taiwanese Bank",     ltv: "-",   size: "66,000 DWT", loan: "-" },
  { type: "Newbuilding Financing",      date: "12 Jan 2026", financier: "Taiwanese Bank",     ltv: "-",   size: "66,000 DWT", loan: "-" },
  { type: "Newbuilding Financing",      date: "17 Dec 2025", financier: "German Bank",        ltv: "-",   size: "63,500 DWT", loan: "-" },
  { type: "Newbuilding Financing",      date: "17 Dec 2025", financier: "German Bank",        ltv: "-",   size: "63,500 DWT", loan: "-" },
  { type: "Acquisition Financing",      date: "22 Apr 2025", financier: "US Fund",            ltv: "71%", size: "30,000 DWT", loan: "$ 11.50 m" },
  { type: "Acquisition Financing +…",   date: "22 Apr 2025", financier: "—",                  ltv: "-",   size: "30,000 DWT", loan: "$ 10.50 m" },
  { type: "Debt Refinancing",           date: "22 Apr 2025", financier: "Taiwanese Leasing",  ltv: "70%", size: "30,000 DWT", loan: "$ 17.80 m" },
  { type: "Acquisition Financing",      date: "22 Apr 2025", financier: "Taiwanese Leasing",  ltv: "69%", size: "30,000 DWT", loan: "$ 10.00 m" },
  { type: "Acquisition Financing",      date: "22 Apr 2025", financier: "Dutch Financier",    ltv: "60%", size: "30,000 DWT", loan: "$ 8.50 m" },
];

function TransactionsTable() {
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            {["Financing Type", "Financier", "LTV", "Size", "Loan Amount"].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap border-b bg-muted/40 px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground"
              >
                <span className="inline-flex items-center gap-1">
                  {h}
                  <span className="opacity-50">⇅</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TXNS.map((t, i) => (
            <tr key={i} className="border-b last:border-b-0 hover:bg-primary/[0.04]">
              <td className="px-4 py-2.5 align-middle">
                <div className="whitespace-nowrap text-[12px] font-semibold text-foreground">
                  {t.type}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{t.date}</div>
              </td>
              <td className="px-4 py-2.5 align-middle text-foreground">{t.financier}</td>
              <td className="px-4 py-2.5 align-middle text-foreground">{t.ltv}</td>
              <td className="px-4 py-2.5 align-middle text-foreground">{t.size}</td>
              <td className="px-4 py-2.5 align-middle text-foreground">{t.loan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
