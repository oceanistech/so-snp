"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Search,
  X,
  Zap,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Vessel quicklook — vessels surfaced in the left-panel search dropdown.
 * Mirrors the prototype's hard-coded list at the top of new-cashflow-request.html.
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

type CashflowType = "advanced" | "light";

/* --------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

export default function NewCashflowPage() {
  const [title, setTitle] = React.useState("Unsaved Cashflow Model");
  const [cashflowType, setCashflowType] = React.useState<CashflowType>("advanced");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<VesselOption | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hasResults, setHasResults] = React.useState(false);

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

  // The form is enabled even without a vessel selection so users can browse —
  // but the prototype keeps the Run button disabled until a vessel is picked.
  const runDisabled = !selected;

  return (
    <form onSubmit={handleRun} className="flex h-full min-h-0 flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Finance Toolkit" },
          { label: "Cashflow", href: "/cashflow" },
          { label: "New Cashflow Model" },
        ]}
        title={
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="-mx-1 -my-0.5 rounded border border-transparent bg-transparent px-1 py-0.5 font-display text-[24px] font-extrabold leading-[1.2] tracking-[-0.6px] text-foreground hover:border-dashed hover:border-muted-foreground focus:border-solid focus:border-primary focus:outline-none"
          />
        }
        subtitle="Model operating income, expenses, and returns for any vessel."
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/cashflow">
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

      {/* ── Split layout (520px left / flex right), matching the prototype ── */}
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

            {/* Vessel summary (visible only when selected) */}
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
                  <SummaryLine label="IMO"   value={selected.imo} />
                  <SummaryLine label="Type"  value={selected.type} />
                  <SummaryLine label="DWT"   value={selected.dwt} />
                  <SummaryLine label="Built" value={String(selected.year)} />
                  <SummaryLine label="FMV"   value={`$${selected.fmv.toFixed(1)}M`} />
                </div>
              </div>
            ) : null}

            {/* Cashflow type pills (Advanced / Light) */}
            <div className="mb-5 flex overflow-hidden rounded-md border border-input">
              {(["advanced", "light"] as const).map((id, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCashflowType(id)}
                  className={cn(
                    "flex-1 py-2 text-[11px] font-semibold capitalize transition-colors",
                    i > 0 && "border-l border-input",
                    cashflowType === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {id}
                </button>
              ))}
            </div>

            {cashflowType === "advanced" ? <AdvancedSections /> : <LightSections />}
          </div>

          {/* Sticky footer with Run button — same shape as prototype's `.panel-left-footer` */}
          <div className="flex flex-shrink-0 flex-col gap-1.5 border-t bg-card px-8 py-3">
            <Button
              type="submit"
              disabled={runDisabled}
              className="h-[42px] w-full gap-2 text-[13px] font-bold"
            >
              <Zap className="size-3.5" />
              Run Cashflow Model →
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Results based on input parameters. All figures are estimates.
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
 * Advanced sections — full prototype parity
 * -------------------------------------------------------------------------- */

type EmploymentRow = {
  id: number;
  type: string;
  start: string;
  end: string;
  tcRate: string;
  commissions: string;
};

type DryDockRow = {
  id: number;
  isDryDock: string;
  dueDate: string;
  duration: string;
  buildUp: string;
  costs: string;
};

type IntSurveyRow = {
  id: number;
  buildUp: string;
  dueDate: string;
  duration: string;
  surveyType: string;
  costs: string;
};

type UpgradeRow = {
  id: number;
  buildUp: string;
  dueDate: string;
  duration: string;
  upgradingType: string;
  costs: string;
};

type CallOptionRow = {
  id: number;
  year: string;
  prepaymentFee: string;
};

let nextId = 1;
const newId = () => nextId++;

function AdvancedSections() {
  const [financingStructure, setFinancingStructure] =
    React.useState<"leasing" | "senior-loan">("leasing");

  const [employmentRows, setEmploymentRows] = React.useState<EmploymentRow[]>([
    { id: newId(), type: "Time Charter", start: "2025-11-03", end: "2025-12-19", tcRate: "45,000", commissions: "5" },
  ]);
  const [dryDockRows, setDryDockRows] = React.useState<DryDockRow[]>([
    { id: newId(), isDryDock: "Yes", dueDate: "2025-01-01", duration: "10", buildUp: "Average", costs: "1,080,000" },
  ]);
  const [intSurveyRows, setIntSurveyRows] = React.useState<IntSurveyRow[]>([
    { id: newId(), buildUp: "Yes", dueDate: "", duration: "", surveyType: "Full Amount", costs: "" },
  ]);
  const [upgradeRows, setUpgradeRows] = React.useState<UpgradeRow[]>([
    { id: newId(), buildUp: "Yes", dueDate: "", duration: "", upgradingType: "Full Amount", costs: "" },
  ]);
  const [callOptionRows, setCallOptionRows] = React.useState<CallOptionRow[]>([
    { id: newId(), year: "", prepaymentFee: "" },
  ]);

  const removeRow = <T extends { id: number }>(
    rows: T[],
    setRows: React.Dispatch<React.SetStateAction<T[]>>,
    id: number,
  ) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  return (
    <>
      {/* General Information */}
      <ParamSection first>General Information</ParamSection>
      <Form2Col>
        <Field label="Start Date of Calculation">
          <DateInput defaultValue="2025-11-07" />
        </Field>
        <Field label="Fair Market Value" required>
          <TextInput defaultValue="6,434,794" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Purchase Price">
          <TextInput placeholder="Purchase Price" />
        </Field>
        <Field label="Purchase Date">
          <DateInput />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Currency" required>
          <SelectInput defaultValue="USD" options={["USD", "EUR", "GBP", "NOK"]} />
        </Field>
        <Field label="Date of Built" required>
          <DateInput defaultValue="2001-01-01" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Scrap Value" required>
          <TextInput defaultValue="3,957,168" />
        </Field>
        <Field label="$/m.t." required>
          <TextInput defaultValue="415" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Useful Economic Lifetime" required>
          <NumberInput defaultValue="25" min={1} />
        </Field>
        <span />
      </Form2Col>

      <Divider />

      {/* Employment Details */}
      <ParamSection>Employment Details</ParamSection>
      <Form2Col>
        <Field label="Earnings Days" required>
          <NumberInput defaultValue="360" />
        </Field>
        <Field label="Operating Days" required>
          <NumberInput defaultValue="366" />
        </Field>
      </Form2Col>
      <RepeatableContainer>
        {employmentRows.map((row, idx) => (
          <RepeatableGroup
            key={row.id}
            onRemove={() => removeRow(employmentRows, setEmploymentRows, row.id)}
            removable={employmentRows.length > 1}
            isFirst={idx === 0}
          >
            <Form2Col>
              <Field label="Employment Type" required>
                <SelectInput
                  defaultValue={row.type}
                  options={["Spot", "Time Charter", "Bareboat Charter", "Pool"]}
                />
              </Field>
              <Field label="Employment Period" required>
                <DateRange defaultStart={row.start} defaultEnd={row.end} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="TC Rate" required>
                <TextInput defaultValue={row.tcRate} />
              </Field>
              <Field label="Charter Commissions" required>
                <TextInput defaultValue={row.commissions} />
              </Field>
            </Form2Col>
          </RepeatableGroup>
        ))}
      </RepeatableContainer>
      <AddRowBtn
        onClick={() =>
          setEmploymentRows((rows) => [
            ...rows,
            { id: newId(), type: "Time Charter", start: "", end: "", tcRate: "", commissions: "5" },
          ])
        }
      >
        + Add Employment
      </AddRowBtn>

      <Divider />

      {/* Expenses */}
      <ParamSection>Expenses</ParamSection>
      <Form2Col>
        <Field label="OPEX Amount ($/day)">
          <TextInput defaultValue="5,696" />
        </Field>
        <Field label="OPEX Inflation p.a. (%)">
          <TextInput defaultValue="3" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Management Fees p.a. ($)">
          <TextInput defaultValue="140,000" />
        </Field>
        <Field label="SG&A p.a. ($)">
          <TextInput defaultValue="50,000" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Takeover Expenses ($)">
          <TextInput defaultValue="100,000" />
        </Field>
        <Field label="Extra Fees ($)">
          <TextInput defaultValue="0" />
        </Field>
      </Form2Col>

      <Divider />

      {/* Capex */}
      <ParamSection>Capex</ParamSection>
      <Form2Col>
        <Field label="Prefunded Dry Docking ($)">
          <TextInput defaultValue="0" />
        </Field>
        <Field label="Prefunded Intermediate Survey ($)">
          <TextInput defaultValue="0" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Prefunded Upgrading ($)">
          <TextInput defaultValue="0" />
        </Field>
        <span />
      </Form2Col>

      <SubsectionTitle>Dry Dock</SubsectionTitle>
      <RepeatableContainer>
        {dryDockRows.map((row, idx) => (
          <RepeatableGroup
            key={row.id}
            onRemove={() => removeRow(dryDockRows, setDryDockRows, row.id)}
            removable={dryDockRows.length > 1}
            isFirst={idx === 0}
          >
            <Form2Col>
              <Field label="Dry Dock" required>
                <SelectInput defaultValue={row.isDryDock} options={["Yes", "No"]} />
              </Field>
              <Field label="Due Date" required>
                <DateInput defaultValue={row.dueDate} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Duration (days)" required>
                <NumberInput defaultValue={row.duration} />
              </Field>
              <Field label="Build Up" required>
                <SelectInput defaultValue={row.buildUp} options={["Average", "Full Amount"]} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Costs" required>
                <TextInput defaultValue={row.costs} />
              </Field>
              <span />
            </Form2Col>
          </RepeatableGroup>
        ))}
      </RepeatableContainer>
      <AddRowBtn
        onClick={() =>
          setDryDockRows((rows) => [
            ...rows,
            { id: newId(), isDryDock: "Yes", dueDate: "", duration: "", buildUp: "Average", costs: "" },
          ])
        }
      >
        + Add Next Dry Dock
      </AddRowBtn>

      <SubsectionTitle>Intermediate Survey</SubsectionTitle>
      <RepeatableContainer>
        {intSurveyRows.map((row, idx) => (
          <RepeatableGroup
            key={row.id}
            onRemove={() => removeRow(intSurveyRows, setIntSurveyRows, row.id)}
            removable={intSurveyRows.length > 1}
            isFirst={idx === 0}
          >
            <Form2Col>
              <Field label="Build Up" required>
                <SelectInput defaultValue={row.buildUp} options={["Yes", "No"]} />
              </Field>
              <Field label="Due Date" required>
                <DateInput defaultValue={row.dueDate} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Duration (days)" required>
                <NumberInput defaultValue={row.duration} />
              </Field>
              <Field label="Survey Type" required>
                <SelectInput defaultValue={row.surveyType} options={["Full Amount", "Average"]} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Costs" required>
                <TextInput defaultValue={row.costs} />
              </Field>
              <span />
            </Form2Col>
          </RepeatableGroup>
        ))}
      </RepeatableContainer>
      <AddRowBtn
        onClick={() =>
          setIntSurveyRows((rows) => [
            ...rows,
            { id: newId(), buildUp: "Yes", dueDate: "", duration: "", surveyType: "Full Amount", costs: "" },
          ])
        }
      >
        + Add Next Intermediate Survey
      </AddRowBtn>

      <SubsectionTitle>Upgrading</SubsectionTitle>
      <RepeatableContainer>
        {upgradeRows.map((row, idx) => (
          <RepeatableGroup
            key={row.id}
            onRemove={() => removeRow(upgradeRows, setUpgradeRows, row.id)}
            removable={upgradeRows.length > 1}
            isFirst={idx === 0}
          >
            <Form2Col>
              <Field label="Build Up" required>
                <SelectInput defaultValue={row.buildUp} options={["Yes", "No"]} />
              </Field>
              <Field label="Due Date" required>
                <DateInput defaultValue={row.dueDate} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Duration (days)" required>
                <NumberInput defaultValue={row.duration} />
              </Field>
              <Field label="Upgrading Type" required>
                <SelectInput defaultValue={row.upgradingType} options={["Full Amount", "Average"]} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Costs" required>
                <TextInput defaultValue={row.costs} />
              </Field>
              <span />
            </Form2Col>
          </RepeatableGroup>
        ))}
      </RepeatableContainer>
      <AddRowBtn
        onClick={() =>
          setUpgradeRows((rows) => [
            ...rows,
            { id: newId(), buildUp: "Yes", dueDate: "", duration: "", upgradingType: "Full Amount", costs: "" },
          ])
        }
      >
        + Add Next Upgrading
      </AddRowBtn>

      <Divider />

      {/* Financing Details */}
      <ParamSection>Financing Details</ParamSection>
      <Form2Col>
        <Field label="Financing Required" required>
          <SelectInput defaultValue="Yes" options={["Yes", "No"]} />
        </Field>
        <Field label="Financing Structure" required>
          <select
            value={financingStructure}
            onChange={(e) => setFinancingStructure(e.target.value as "leasing" | "senior-loan")}
            className={SELECT_CLASS}
          >
            <option value="leasing">Leasing</option>
            <option value="senior-loan">Senior Loan</option>
          </select>
        </Field>
      </Form2Col>

      {financingStructure === "leasing" ? (
        <LeasingFields />
      ) : (
        <SeniorLoanFields />
      )}

      <Divider />

      {/* Call Option */}
      <ParamSection>Call Option</ParamSection>
      <RepeatableContainer>
        {callOptionRows.map((row, idx) => (
          <RepeatableGroup
            key={row.id}
            onRemove={() => removeRow(callOptionRows, setCallOptionRows, row.id)}
            removable={callOptionRows.length > 1}
            isFirst={idx === 0}
          >
            <Form2Col>
              <Field label="Call Option (Year)">
                <NumberInput defaultValue={row.year} />
              </Field>
              <Field label="Prepayment Fee (%)">
                <TextInput defaultValue={row.prepaymentFee} />
              </Field>
            </Form2Col>
          </RepeatableGroup>
        ))}
      </RepeatableContainer>
      <AddRowBtn
        onClick={() =>
          setCallOptionRows((rows) => [
            ...rows,
            { id: newId(), year: "", prepaymentFee: "" },
          ])
        }
      >
        + Add Year
      </AddRowBtn>

      <Divider />

      {/* Sensitivity Analysis */}
      <ParamSection>Sensitivity Analysis</ParamSection>
      <SubsectionTitle>Downside Case</SubsectionTitle>
      <Form2Col>
        <Field label="Earnings">
          <TextInput placeholder="Earnings" />
        </Field>
        <Field label="Exit Value">
          <TextInput placeholder="Exit Value" />
        </Field>
      </Form2Col>
      <SubsectionTitle>Upside Case</SubsectionTitle>
      <Form2Col>
        <Field label="Earnings">
          <TextInput placeholder="Earnings" />
        </Field>
        <Field label="Exit Value">
          <TextInput placeholder="Exit Value" />
        </Field>
      </Form2Col>
      <SubsectionTitle>Best Case</SubsectionTitle>
      <Form2Col>
        <Field label="Earnings">
          <TextInput placeholder="Earnings" />
        </Field>
        <Field label="Exit Value">
          <TextInput placeholder="Exit Value" />
        </Field>
      </Form2Col>
    </>
  );
}

function LeasingFields() {
  return (
    <>
      <Form2Col>
        <Field label="Lease Amount Base" required>
          <SelectInput defaultValue="Fair Market Value" options={["Fair Market Value", "Purchase Price", "Custom"]} />
        </Field>
        <Field label="Lease Amount" required>
          <TextInput defaultValue="14,640,000" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="LTV" hint="Auto-calculated">
          <TextInput defaultValue="60" readOnly />
        </Field>
        <Field label="Purchase Obligation" required>
          <TextInput placeholder="Purchase Obligation" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Interest" required>
          <SelectInput defaultValue="Floating" options={["Floating", "Fixed"]} />
        </Field>
        <Field label="Base Rate" required>
          <SelectInput defaultValue="SOFR" options={["SOFR", "EURIBOR", "LIBOR"]} />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Margin" required>
          <TextInput placeholder="Margin" />
        </Field>
        <Field label="Drawdown Date" required>
          <DateInput defaultValue="2026-04-01" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Holding Period (years)" required>
          <NumberInput defaultValue="5" />
        </Field>
        <Field label="Holding Period (months)">
          <NumberInput defaultValue="0" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Exit Date" required>
          <DateInput defaultValue="2031-03-31" />
        </Field>
        <Field label="Exit Value" required>
          <SelectInput
            defaultValue="Depreciation to Scrap"
            options={["Depreciation to Scrap", "Depreciation to 0", "Scrap Value", "Custom"]}
          />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Tenor (years)" required>
          <NumberInput defaultValue="5" />
        </Field>
        <Field label="Tenor (months)">
          <NumberInput defaultValue="0" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Profile" required>
          <TextInput placeholder="Profile" />
        </Field>
        <span />
      </Form2Col>

      <SubsectionTitle>Costs</SubsectionTitle>
      <Form2Col>
        <Field label="Prefunded Min. Liquidity" required>
          <SelectInput defaultValue="Total" options={["Total", "Partial"]} />
        </Field>
        <Field label="Prefunded Min. Liquidity Amount" required>
          <TextInput placeholder="Amount" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Transaction Expenses" required>
          <TextInput placeholder="Transaction Expenses" />
        </Field>
        <Field label="Cost of Equity" required>
          <TextInput placeholder="Cost of Equity" />
        </Field>
      </Form2Col>
    </>
  );
}

function SeniorLoanFields() {
  return (
    <>
      <Form2Col>
        <Field label="Loan Amount Base" required>
          <SelectInput defaultValue="Fair Market Value" options={["Fair Market Value", "Purchase Price", "Custom"]} />
        </Field>
        <Field label="Loan Amount" required>
          <TextInput defaultValue="14,640,000" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="LTV" hint="Auto-calculated">
          <TextInput defaultValue="60" readOnly />
        </Field>
        <Field label="Interest" required>
          <SelectInput defaultValue="Floating" options={["Floating", "Fixed"]} />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Rate" required>
          <SelectInput defaultValue="SOFR" options={["SOFR", "EURIBOR", "LIBOR"]} />
        </Field>
        <Field label="Margin" required>
          <TextInput placeholder="Margin" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Tenor (years)" required>
          <NumberInput defaultValue="5" />
        </Field>
        <Field label="Tenor (months)">
          <NumberInput defaultValue="0" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Drawdown Date" required>
          <DateInput defaultValue="2026-04-01" />
        </Field>
        <Field label="Holding Period (years)" required>
          <NumberInput defaultValue="5" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Holding Period (months)">
          <NumberInput defaultValue="0" />
        </Field>
        <Field label="Exit Date" required>
          <DateInput defaultValue="2031-03-31" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Instalments" required>
          <SelectInput defaultValue="Average" options={["Average", "Annuity", "Bullet", "Custom"]} />
        </Field>
        <Field label="Instalment Amount" hint="Loan Amount/Balloon/Tenor required to calculate">
          <TextInput placeholder="Instalment Amount" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Balloon" required>
          <TextInput placeholder="Balloon" />
        </Field>
        <Field label="Profile" required>
          <TextInput placeholder="Profile" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Exit Value" required>
          <SelectInput
            defaultValue="Depreciation to Scrap"
            options={["Depreciation to Scrap", "Depreciation to 0", "Scrap Value", "Custom"]}
          />
        </Field>
        <span />
      </Form2Col>

      <SubsectionTitle>Costs</SubsectionTitle>
      <Form2Col>
        <Field label="Prefunded Min. Liquidity" required>
          <SelectInput defaultValue="Total" options={["Total", "Partial"]} />
        </Field>
        <Field label="Prefunded Min. Liquidity Amount" required>
          <TextInput placeholder="Amount" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Further Prefunded Funds" required>
          <TextInput placeholder="Further Prefunded Funds" />
        </Field>
        <Field label="Transaction Expenses" required>
          <TextInput placeholder="Transaction Expenses" />
        </Field>
      </Form2Col>
      <Form2Col>
        <Field label="Arrangement Fee Ratio" required>
          <TextInput placeholder="Arrangement Fee Ratio" />
        </Field>
        <Field label="Cost of Equity" required>
          <TextInput placeholder="Cost of Equity" />
        </Field>
      </Form2Col>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Light sections — same prototype parity, smaller form
 * -------------------------------------------------------------------------- */

type LightEmploymentRow = {
  id: number;
  type: string;
  earnings: string;
  months: string;
  commissions: string;
};

type BareboatRow = {
  id: number;
  rate: string;
  months: string;
};

function LightSections() {
  const [finStructure, setFinStructure] = React.useState<"senior-loan" | "leasing">("senior-loan");
  const [empRows, setEmpRows] = React.useState<LightEmploymentRow[]>([
    { id: newId(), type: "Time Charter", earnings: "", months: "10", commissions: "5" },
  ]);
  const [bareboatRows, setBareboatRows] = React.useState<BareboatRow[]>([
    { id: newId(), rate: "450,000", months: "120" },
  ]);

  return (
    <>
      <ParamSection first>Light Version</ParamSection>
      <Form2Col>
        <Field label="Currency" required>
          <SelectInput defaultValue="USD" options={["USD", "EUR", "GBP"]} />
        </Field>
        <span />
      </Form2Col>
      <RepeatableContainer>
        {empRows.map((row, idx) => (
          <RepeatableGroup
            key={row.id}
            removable={empRows.length > 1}
            onRemove={() => empRows.length > 1 && setEmpRows(empRows.filter((r) => r.id !== row.id))}
            isFirst={idx === 0}
          >
            <Form2Col>
              <Field label="Employment Type" required>
                <SelectInput defaultValue={row.type} options={["Spot", "Time Charter", "Bareboat"]} />
              </Field>
              <Field label="Earnings / Day" required>
                <TextInput placeholder="Earnings / Day" defaultValue={row.earnings} />
              </Field>
            </Form2Col>
            <Form2Col>
              <Field label="Months" required>
                <NumberInput defaultValue={row.months} />
              </Field>
              <Field label="Charter Commissions" required>
                <TextInput defaultValue={row.commissions} />
              </Field>
            </Form2Col>
          </RepeatableGroup>
        ))}
      </RepeatableContainer>
      <AddRowBtn
        onClick={() =>
          setEmpRows((rows) => [
            ...rows,
            { id: newId(), type: "Time Charter", earnings: "", months: "10", commissions: "5" },
          ])
        }
      >
        + Add Employment
      </AddRowBtn>

      <Divider />

      <Form2Col>
        <Field label="Financing Structure" required>
          <select
            value={finStructure}
            onChange={(e) => setFinStructure(e.target.value as "senior-loan" | "leasing")}
            className={SELECT_CLASS}
          >
            <option value="senior-loan">Senior Loan</option>
            <option value="leasing">Leasing</option>
          </select>
        </Field>
        <span />
      </Form2Col>

      {finStructure === "senior-loan" ? (
        <>
          <Form2Col>
            <Field label="Financing Required" required>
              <SelectInput defaultValue="Yes" options={["Yes", "No"]} />
            </Field>
            <Field label="Loan Amount" required>
              <TextInput defaultValue="3,989,572" />
            </Field>
          </Form2Col>
          <Form2Col>
            <Field label="LTV">
              <TextInput defaultValue="62" readOnly />
            </Field>
            <Field label="FMV / Purchase Price" required>
              <TextInput defaultValue="6,434,794" />
            </Field>
          </Form2Col>
          <Form2Col>
            <Field label="OPEX p.d." required>
              <TextInput defaultValue="5,696" />
            </Field>
            <Field label="Exit Value">
              <TextInput placeholder="Exit Value" />
            </Field>
          </Form2Col>
        </>
      ) : (
        <>
          <Form2Col>
            <Field label="Lease Amount" required>
              <TextInput defaultValue="3,989,572" />
            </Field>
            <Field label="Tenor (years)" required>
              <NumberInput defaultValue="10" />
            </Field>
          </Form2Col>
          <Form2Col>
            <Field label="Tenor (months)" required>
              <NumberInput defaultValue="0" />
            </Field>
            <span />
          </Form2Col>
          <RepeatableContainer>
            {bareboatRows.map((row, idx) => (
              <RepeatableGroup
                key={row.id}
                removable={bareboatRows.length > 1}
                onRemove={() =>
                  bareboatRows.length > 1 &&
                  setBareboatRows(bareboatRows.filter((r) => r.id !== row.id))
                }
                isFirst={idx === 0}
              >
                <Form2Col>
                  <Field label="Bareboat Charter" required>
                    <TextInput defaultValue={row.rate} />
                  </Field>
                  <Field label="Months" required>
                    <NumberInput defaultValue={row.months} />
                  </Field>
                </Form2Col>
              </RepeatableGroup>
            ))}
          </RepeatableContainer>
          <AddRowBtn
            onClick={() =>
              setBareboatRows((rows) => [
                ...rows,
                { id: newId(), rate: "", months: "120" },
              ])
            }
          >
            + Add Bareboat Charter
          </AddRowBtn>

          <Divider />
          <Form2Col>
            <Field label="Purchase Obligation" required>
              <TextInput defaultValue="33,329.98" />
            </Field>
            <Field label="OPEX p.d." required>
              <TextInput defaultValue="5,696" />
            </Field>
          </Form2Col>
          <Form2Col>
            <Field label="Exit Value">
              <TextInput placeholder="Exit Value" />
            </Field>
            <span />
          </Form2Col>
        </>
      )}
    </>
  );
}

/* --------------------------------------------------------------------------
 * Form helper components
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

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-3 text-[11px] font-semibold text-foreground">
      {children}
    </div>
  );
}

function Form2Col({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 grid grid-cols-2 gap-x-6 gap-y-0">{children}</div>
  );
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
      className={cn(INPUT_CLASS, props.readOnly && "bg-muted/40 text-muted-foreground", props.className)}
    />
  );
}

function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" {...props} className={cn(INPUT_CLASS, props.className)} />;
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
      <input
        type="date"
        defaultValue={defaultStart}
        className={cn(INPUT_CLASS, "flex-1")}
      />
      <span className="text-[11px] text-muted-foreground">~</span>
      <input
        type="date"
        defaultValue={defaultEnd}
        className={cn(INPUT_CLASS, "flex-1")}
      />
    </div>
  );
}

function Divider() {
  return <hr className="my-4 border-border" />;
}

function RepeatableContainer({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function RepeatableGroup({
  children,
  removable,
  onRemove,
  isFirst,
}: {
  children: React.ReactNode;
  removable: boolean;
  onRemove: () => void;
  isFirst: boolean;
}) {
  return (
    <div
      className={cn(
        "relative py-2",
        !isFirst && "mt-2 border-t border-dashed border-border pt-3",
      )}
    >
      {removable ? (
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          className="absolute right-0 top-2 inline-flex size-6 items-center justify-center rounded border border-input bg-card text-muted-foreground hover:border-signal-magenta hover:bg-[#fff5f5] hover:text-signal-magenta"
        >
          <X className="size-3" strokeWidth={2.5} />
        </button>
      ) : null}
      {children}
    </div>
  );
}

function AddRowBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 inline-flex items-center gap-1 bg-transparent py-1 text-[11px] font-semibold text-primary hover:underline"
    >
      {children}
    </button>
  );
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
 * Right panel — empty state + results
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
        Set your vessel and parameters on the left, then click &ldquo;Run Cashflow Model&rdquo;
        to see projections.
      </p>
    </div>
  );
}

function ResultsPanel() {
  // Hardcoded mock figures lifted directly from the prototype's static result
  // section so the visual is 1:1 — matches the brd's "interactive vs. mock" rule.
  return (
    <div className="flex flex-col">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <TermCard label="IRR" value="-100.00%" />
        <TermCard label="Money Multiple" value="-5.27" />
        <TermCard label="Exit Value" value="$0" />
        <TermCard label="Calculation Assumptions" value="View →" small />
      </div>

      {/* Sources & Uses */}
      <h3 className="mb-3 text-[14px] font-extrabold tracking-tight text-foreground">
        Sources &amp; Uses
      </h3>
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SourcesUsesCard
          title="Sources"
          rows={[
            { label: "Loan Amount", value: "$ 3,667,833" },
            { label: "Equity",      value: "$ 2,866,961" },
          ]}
          total="$ 6,534,794"
        />
        <SourcesUsesCard
          title="Uses"
          rows={[
            { label: "Fair Market Value",            value: "$ 6,424,794" },
            { label: "Prefunded Minimum Liquidity",  value: "$ 0" },
            { label: "Prefunded CAPEX",              value: "$ 0" },
            { label: "Prefunded Earnings Account",   value: "$ 0" },
            { label: "Prefunded Arrangement Fee",    value: "$ 0" },
            { label: "Takeover Costs",               value: "$ 100,000" },
            { label: "Transaction Costs",            value: "$ 0" },
            { label: "Extra Fees",                   value: "$ 0" },
          ]}
          total="$ 6,534,794"
        />
      </div>

      <hr className="mb-6 border-border" />

      {/* Yearly & Quarterly Overview */}
      <h3 className="mb-3 text-[14px] font-extrabold tracking-tight text-foreground">
        Yearly &amp; Quarterly Overview
      </h3>
      <div className="mb-6 overflow-x-auto">
        <YearlyOverviewTable />
      </div>

      <hr className="mb-6 border-border" />

      {/* Sensitivity Analysis */}
      <h3 className="mb-3 text-[14px] font-extrabold tracking-tight text-foreground">
        Sensitivity Analysis
      </h3>
      <SubsectionTitle>Earnings</SubsectionTitle>
      <SensitivityTable />
    </div>
  );
}

function TermCard({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-md bg-[#0B1929] p-4 text-white">
      <div className="mb-1.5 text-[11px] font-semibold opacity-75">{label}</div>
      <div
        className={cn(
          "font-display font-extrabold leading-tight tracking-tight",
          small ? "cursor-pointer text-[12px] opacity-70" : "text-[18px]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function SourcesUsesCard({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; value: string }[];
  total: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border bg-card">
      <div className="border-b bg-muted/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-1 flex-col">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between border-b px-4 py-1.5 text-[12px] text-muted-foreground last:border-b-0"
          >
            <span>{r.label}</span>
            <span>{r.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between border-t bg-[#FAFBFC] px-4 py-1.5 text-[12px] font-bold text-foreground">
        <span>Total</span>
        <span>{total}</span>
      </div>
    </div>
  );
}

function YearlyOverviewTable() {
  type Row =
    | { kind: "data"; label: string; vals: (string | number)[] }
    | { kind: "group"; label: string }
    | { kind: "subtotal"; label: string; vals: (string | number)[] }
    | { kind: "total"; label: string; vals: (string | number)[] };

  const rows: Row[] = [
    { kind: "data",     label: "Vessel Age",                           vals: [26, 27, 28, 29, 30] },
    { kind: "data",     label: "Operating days",                       vals: [280, 365, 365, 365, 365] },
    { kind: "data",     label: "Earnings days",                        vals: [277, 360, 361, 360, 360] },
    { kind: "group",    label: "Revenue" },
    { kind: "data",     label: "Gross Revenue",                        vals: ["1,800,000", "0", "0", "0", "0"] },
    { kind: "data",     label: "Commissions",                          vals: ["-71,000", "0", "0", "0", "0"] },
    { kind: "group",    label: "Operating Expenses" },
    { kind: "data",     label: "OPEX",                                 vals: ["-1,612,443", "-2,119,329", "-2,201,136", "-1,261,127", "-3,338,681"] },
    { kind: "data",     label: "Technical Management",                 vals: ["-82,647", "-100,959", "-101,229", "-100,000", "-100,000"] },
    { kind: "data",     label: "SG&A",                                 vals: ["-41,324", "-50,480", "-50,195", "-50,000", "-50,000"] },
    { kind: "subtotal", label: "Operational Cashflow (I)",             vals: ["-7,413", "-2,382,769", "-2,351,480", "-1,411,127", "-2,478,681"] },
    { kind: "data",     label: "Interest Expenses",                    vals: ["-206,015", "-239,107", "-232,414", "-228,227", "-224,409"] },
    { kind: "subtotal", label: "Cashflow after interest (II)",         vals: ["-210,428", "-2,521,875", "-2,583,894", "-1,639,354", "-2,703,090"] },
    { kind: "data",     label: "Installments",                         vals: ["-67,377", "-67,377", "-67,377", "-67,377", "-67,377"] },
    { kind: "subtotal", label: "Cashflow after installments (III)",    vals: ["-279,805", "-2,589,252", "-2,651,171", "-1,706,731", "-2,770,366"] },
    { kind: "data",     label: "Outstanding Loan BoP",                 vals: ["3,661,833", "3,600,456", "3,533,080", "3,465,703", "3,398,327"] },
    { kind: "data",     label: "Outstanding Loan EoP",                 vals: ["3,600,456", "3,533,080", "3,465,703", "3,398,327", "3,330,950"] },
    { kind: "data",     label: "Scrap Value",                          vals: ["3,957,168", "3,957,168", "3,957,168", "3,957,168", "3,957,168"] },
    { kind: "data",     label: "Pref. Min. Liquidity BoP",             vals: ["0", "0", "0", "0", "0"] },
    { kind: "data",     label: "Dry Docking Costs BoP",                vals: ["0", "0", "0", "0", "0"] },
    { kind: "data",     label: "Upgrading Costs BoP",                  vals: ["0", "0", "0", "0", "0"] },
    { kind: "data",     label: "Int. Survey Costs BoP",                vals: ["0", "0", "0", "0", "0"] },
    { kind: "data",     label: "DD & Maintenance Total BoP",           vals: ["0", "0", "0", "0", "0"] },
    { kind: "data",     label: "Exit Value",                           vals: ["0", "0", "0", "0", "0"] },
    { kind: "data",     label: "Balloon",                              vals: ["0", "0", "0", "0", "0"] },
    { kind: "total",    label: "Free Cashflow",                        vals: ["-279,805", "-2,589,252", "-2,651,171", "-1,706,731", "-2,770,366"] },
    { kind: "data",     label: "Accumulated Free Cashflow",            vals: ["-279,805", "-2,869,057", "-5,520,327", "-8,227,058", "-10,997,425"] },
    { kind: "data",     label: "Breakeven I",                          vals: ["5,262", "6,338", "6,510", "6,694", "6,882"] },
    { kind: "data",     label: "Breakeven II",                         vals: ["7,001", "7,012", "7,154", "7,327", "7,504"] },
    { kind: "data",     label: "Breakeven III",                        vals: ["7,244", "7,188", "7,340", "7,515", "7,698"] },
  ];

  const isNeg = (v: string | number) => typeof v === "string" && v.startsWith("-");

  return (
    <table className="w-full overflow-hidden rounded-md border bg-card text-[11px]">
      <thead>
        <tr>
          <th className="min-w-[180px] border-b bg-muted/40 px-2 py-2 text-left text-[10px] font-semibold uppercase text-muted-foreground" />
          <th className="border-b bg-muted/40 px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">2026 →</th>
          <th className="border-b bg-muted/40 px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">2027 →</th>
          <th className="border-b bg-muted/40 px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">2028 →</th>
          <th className="border-b bg-muted/40 px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">2029 →</th>
          <th className="border-b bg-muted/40 px-2 py-2 text-right text-[10px] font-semibold text-muted-foreground">2030 →</th>
        </tr>
        <tr>
          <th className="border-b bg-muted/40 px-2 py-1 text-left text-[10px] font-semibold uppercase text-muted-foreground" />
          <th className="border-b bg-muted/40 px-2 py-1 text-right text-[10px] font-semibold text-muted-foreground">Year 1</th>
          <th className="border-b bg-muted/40 px-2 py-1 text-right text-[10px] font-semibold text-muted-foreground">Year 2</th>
          <th className="border-b bg-muted/40 px-2 py-1 text-right text-[10px] font-semibold text-muted-foreground">Year 3</th>
          <th className="border-b bg-muted/40 px-2 py-1 text-right text-[10px] font-semibold text-muted-foreground">Year 4</th>
          <th className="border-b bg-muted/40 px-2 py-1 text-right text-[10px] font-semibold text-muted-foreground">Year 5</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          if (row.kind === "group") {
            return (
              <tr key={i}>
                <td
                  colSpan={6}
                  className="border-b bg-muted/30 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground"
                >
                  {row.label}
                </td>
              </tr>
            );
          }
          if (row.kind === "subtotal") {
            return (
              <tr key={i} className="border-b bg-[#FAFBFC] font-semibold text-foreground">
                <td className="px-2 py-1.5 text-left">{row.label}</td>
                {row.vals.map((v, idx) => (
                  <td key={idx} className={cn("px-2 py-1.5 text-right tabular-nums", isNeg(v) && "text-signal-magenta")}>
                    {v}
                  </td>
                ))}
              </tr>
            );
          }
          if (row.kind === "total") {
            return (
              <tr key={i} className="border-b border-t-2 border-t-primary bg-primary/[0.06] font-bold text-foreground">
                <td className="px-2 py-1.5 text-left">{row.label}</td>
                {row.vals.map((v, idx) => (
                  <td key={idx} className={cn("px-2 py-1.5 text-right tabular-nums", isNeg(v) && "text-signal-magenta")}>
                    {v}
                  </td>
                ))}
              </tr>
            );
          }
          return (
            <tr key={i} className="border-b last:border-b-0">
              <td className="px-2 py-1.5 text-left font-medium text-foreground">{row.label}</td>
              {row.vals.map((v, idx) => (
                <td key={idx} className={cn("px-2 py-1.5 text-right tabular-nums text-muted-foreground", isNeg(v) && "text-signal-magenta")}>
                  {v}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SensitivityTable() {
  const rows: { label: string; vals: string[] }[] = [
    { label: "Estimated IRR", vals: ["$1,039", "$ 45,000", "$ 95,000", "$ 37,500"] },
    { label: "$ 0",           vals: ["-100.00%", "~", "~", "~"] },
    { label: "$ 0",           vals: ["~", "~", "~", "~"] },
    { label: "$ 0",           vals: ["~", "~", "~", "~"] },
    { label: "$ 0",           vals: ["~", "~", "~", "~"] },
    { label: "$ 0",           vals: ["~", "~", "~", "~"] },
  ];
  return (
    <table className="w-full overflow-hidden rounded-md border bg-card text-[12px]">
      <thead>
        <tr>
          <th className="border-b bg-muted/40 px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground" />
          <th className="border-b bg-muted/40 px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground">Base Case</th>
          <th className="border-b bg-muted/40 px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground">Downside Case</th>
          <th className="border-b bg-muted/40 px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground">Upside Case</th>
          <th className="border-b bg-muted/40 px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground">Best Case</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b last:border-b-0">
            <td className="px-3 py-2 font-semibold text-foreground">{r.label}</td>
            {r.vals.map((v, idx) => (
              <td key={idx} className="px-3 py-2 text-muted-foreground">
                {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
