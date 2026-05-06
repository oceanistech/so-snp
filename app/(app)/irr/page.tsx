"use client";

import * as React from "react";
import { Download, RefreshCcw } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — mirrors html/irr.html "5-Year Unlevered IRR by Vessel Type".
 * -------------------------------------------------------------------------- */

type IrrTone = "pos" | "neg" | "neu";

type IrrCellValue = { value: string; tone: IrrTone };

type IrrRow = {
  asset: string;
  eco?: boolean;
  /** holding period — "5yr" / "10yr" / "15yr". */
  size: string;
  /** resale price in $ millions, e.g. "$376.2". */
  resalePrice: string;
  bestYield: IrrCellValue;
  bestShortTerm: IrrCellValue;
  worstYield: IrrCellValue;
  worstHist: IrrCellValue;
  reqTlc: string;
};

type IrrSection = {
  type: string;
  /** which top-level tab(s) this section belongs to. */
  segment: "bulk" | "tanker" | "gas";
  rows: IrrRow[];
};

const cell = (value: string, tone: IrrTone): IrrCellValue => ({ value, tone });

const SECTIONS: IrrSection[] = [
  {
    type: "Capesize",
    segment: "bulk",
    rows: [
      { asset: "180k", eco: true, size: "5yr",  resalePrice: "$376.2", bestYield: cell("3.90%",  "pos"), bestShortTerm: cell("1.50%",  "pos"), worstYield: cell("0.50%",   "neu"), worstHist: cell("−6.48%",  "neg"), reqTlc: "$32,918" },
      { asset: "180k", eco: true, size: "10yr", resalePrice: "$363.2", bestYield: cell("5.30%",  "pos"), bestShortTerm: cell("−3.22%", "neg"), worstYield: cell("−3.60%",  "neg"), worstHist: cell("−7.49%",  "neg"), reqTlc: "$40,088" },
      { asset: "82k",  eco: true, size: "15yr", resalePrice: "$246.1", bestYield: cell("1.00%",  "neu"), bestShortTerm: cell("−0.82%", "neg"), worstYield: cell("−16.75%", "neg"), worstHist: cell("−10.62%", "neg"), reqTlc: "$26,879" },
    ],
  },
  {
    type: "Bulk Carriers",
    segment: "bulk",
    rows: [
      { asset: "64k", eco: true, size: "5yr",  resalePrice: "$34.9", bestYield: cell("5.68%", "pos"), bestShortTerm: cell("3.10%",  "pos"), worstYield: cell("−5.47%", "neg"), worstHist: cell("−7.02%", "neg"), reqTlc: "$19,096" },
      { asset: "64k", eco: true, size: "10yr", resalePrice: "$29.8", bestYield: cell("3.95%", "pos"), bestShortTerm: cell("−0.39%", "neg"), worstYield: cell("−3.94%", "neg"), worstHist: cell("−7.91%", "neg"), reqTlc: "$14,522" },
      { asset: "40k",            size: "10yr", resalePrice: "$24.8", bestYield: cell("3.78%", "pos"), bestShortTerm: cell("−0.33%", "neg"), worstYield: cell("−4.11%", "neg"), worstHist: cell("−8.05%", "neg"), reqTlc: "$12,744" },
      { asset: "34k",            size: "10yr", resalePrice: "$21.6", bestYield: cell("3.44%", "pos"), bestShortTerm: cell("−0.21%", "neg"), worstYield: cell("−3.88%", "neg"), worstHist: cell("−7.63%", "neg"), reqTlc: "$11,190" },
      { asset: "38k",            size: "15yr", resalePrice: "$23.5", bestYield: cell("2.41%", "pos"), bestShortTerm: cell("0.08%",  "neu"), worstYield: cell("−5.30%", "neg"), worstHist: cell("−9.77%", "neg"), reqTlc: "$10,540" },
    ],
  },
  {
    type: "VLCC",
    segment: "tanker",
    rows: [
      { asset: "300k", eco: true, size: "5yr",  resalePrice: "$131.0", bestYield: cell("3.22%", "pos"), bestShortTerm: cell("3.79%", "pos"), worstYield: cell("−4.93%", "neg"), worstHist: cell("−8.66%", "neg"), reqTlc: "$57,012" },
      { asset: "300k",            size: "10yr", resalePrice: "$86.0",  bestYield: cell("4.58%", "pos"), bestShortTerm: cell("1.99%", "pos"), worstYield: cell("−2.37%", "neg"), worstHist: cell("−8.66%", "neg"), reqTlc: "$46,324" },
    ],
  },
  {
    type: "Suezmax",
    segment: "tanker",
    rows: [
      { asset: "160k", eco: true, size: "5yr",  resalePrice: "$79.4", bestYield: cell("4.17%", "pos"), bestShortTerm: cell("1.61%", "pos"), worstYield: cell("−0.98%", "neg"), worstHist: cell("−4.91%", "neg"), reqTlc: "$36,419" },
      { asset: "160k", eco: true, size: "10yr", resalePrice: "$45.2", bestYield: cell("5.29%", "pos"), bestShortTerm: cell("2.24%", "pos"), worstYield: cell("−1.02%", "neg"), worstHist: cell("−5.12%", "neg"), reqTlc: "$37,031" },
    ],
  },
  {
    type: "LR2",
    segment: "tanker",
    rows: [
      { asset: "110k", eco: true, size: "5yr",  resalePrice: "$88.8", bestYield: cell("1.97%",  "pos"), bestShortTerm: cell("8.59%",   "pos"), worstYield: cell("−3.78%", "neg"), worstHist: cell("−8.24%",  "neg"), reqTlc: "$33,592" },
      { asset: "110k", eco: true, size: "10yr", resalePrice: "$68.3", bestYield: cell("−5.27%", "neg"), bestShortTerm: cell("−10.20%", "neg"), worstYield: cell("−2.07%", "neg"), worstHist: cell("−14.69%", "neg"), reqTlc: "$34,689" },
      { asset: "110k",            size: "15yr", resalePrice: "$40.7", bestYield: cell("−7.65%", "neg"), bestShortTerm: cell("−11.49%", "neg"), worstYield: cell("−0.87%", "neg"), worstHist: cell("−15.38%", "neg"), reqTlc: "$32,751" },
    ],
  },
  {
    type: "Aframax",
    segment: "tanker",
    rows: [
      { asset: "110k", eco: true, size: "5yr",  resalePrice: "$68.3", bestYield: cell("3.04%", "pos"), bestShortTerm: cell("8.89%",  "pos"), worstYield: cell("−3.08%", "neg"), worstHist: cell("−8.08%", "neg"), reqTlc: "$29,041" },
      { asset: "110k",            size: "10yr", resalePrice: "$38.2", bestYield: cell("7.12%", "pos"), bestShortTerm: cell("11.39%", "pos"), worstYield: cell("−0.54%", "neg"), worstHist: cell("−6.17%", "neg"), reqTlc: "$32,751" },
    ],
  },
  {
    type: "MR",
    segment: "tanker",
    rows: [
      { asset: "50k", eco: true, size: "5yr",  resalePrice: "$47.0", bestYield: cell("−7.85%", "neg"), bestShortTerm: cell("−4.70%", "neg"), worstYield: cell("−3.08%",  "neg"), worstHist: cell("−8.30%",  "neg"), reqTlc: "$29,181" },
      { asset: "50k",            size: "10yr", resalePrice: "$38.2", bestYield: cell("−0.63%", "neg"), bestShortTerm: cell("4.89%",  "pos"), worstYield: cell("−12.90%", "neg"), worstHist: cell("−12.04%", "neg"), reqTlc: "$28,064" },
      { asset: "70k",            size: "10yr", resalePrice: "$38.2", bestYield: cell("−0.63%", "neg"), bestShortTerm: cell("4.89%",  "pos"), worstYield: cell("−12.90%", "neg"), worstHist: cell("−12.04%", "neg"), reqTlc: "$27,247" },
    ],
  },
  {
    type: "LPG",
    segment: "gas",
    rows: [
      { asset: "70k", eco: true, size: "5yr",  resalePrice: "$47.0", bestYield: cell("8.51%", "pos"), bestShortTerm: cell("7.66%", "pos"), worstYield: cell("−0.63%",  "neu"), worstHist: cell("−4.41%",  "neg"), reqTlc: "$24,241" },
      { asset: "52k", eco: true, size: "5yr",  resalePrice: "$46.2", bestYield: cell("9.52%", "pos"), bestShortTerm: cell("7.44%", "pos"), worstYield: cell("−9.99%",  "neg"), worstHist: cell("−8.32%",  "neg"), reqTlc: "$24,241" },
      { asset: "52k",            size: "10yr", resalePrice: "$32.5", bestYield: cell("8.52%", "pos"), bestShortTerm: cell("8.32%", "pos"), worstYield: cell("−27.17%", "neg"), worstHist: cell("−21.57%", "neg"), reqTlc: "$2,604"  },
    ],
  },
];

/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "bulk",     label: "Bulk Carriers" },
  { id: "tanker",   label: "Tankers" },
  { id: "gas",      label: "Gas Carriers" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function IrrPage() {
  const [active, setActive] = React.useState<TabId>("overview");

  const visibleSections = React.useMemo(() => {
    if (active === "overview") return SECTIONS;
    return SECTIONS.filter((s) => s.segment === active);
  }, [active]);

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "IRR" }]}
        title="Investment Return (IRR)"
        subtitle="5-year unlevered investment return benchmarks across vessel types — best & worst case scenarios"
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
            <Button className="gap-2">
              <RefreshCcw className="size-3.5" />
              Refresh
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
        {/* Stats */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Best Segment (5yr)"
            value="LPG 70k ECO"
            direction="up"
            change="8.51% unlevered IRR"
            accent="green"
          />
          <KpiCard
            label="Avg Best-Case IRR"
            value="3.8%"
            meta="Across all vessel types"
            accent="blue"
          />
          <KpiCard
            label="Avg Worst-Case IRR"
            value="−6.2%"
            meta="Back to historical values"
            accent="magenta"
          />
          <KpiCard
            label="As of"
            value="Mar 2026"
            meta="Resale price basis"
            accent="orange"
          />
        </section>

        {/* Benchmark table */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <h2 className="text-[14px] font-bold">
              5-Year Unlevered IRR by Vessel Type
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Resale vessels — best &amp; worst case scenarios, unlevered, 5-year holding period
              {active !== "overview" ? (
                <>
                  {" "}
                  · filtered to{" "}
                  <strong className="text-foreground">
                    {TABS.find((t) => t.id === active)?.label}
                  </strong>
                </>
              ) : null}
            </p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2 text-left" colSpan={4} />
                  <th
                    className="border-b-2 border-signal-green px-3 py-2 text-center text-signal-green"
                    colSpan={2}
                  >
                    IRR — Best Case
                  </th>
                  <th
                    className="border-b-2 border-signal-magenta border-l border-l-border bg-muted/20 px-3 py-2 text-center text-signal-magenta"
                    colSpan={2}
                  >
                    IRR — Worst Case
                  </th>
                  <th className="border-l border-l-border px-3 py-2 text-center" />
                </tr>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2 text-left">Asset Type</th>
                  <th className="px-3 py-2 text-left">Asset</th>
                  <th className="px-3 py-2 text-left">Size</th>
                  <th className="px-3 py-2 text-right">Resale Price</th>
                  <th className="px-3 py-2 text-right">5yr Yield</th>
                  <th className="px-3 py-2 text-right">Short-term empl.</th>
                  <th className="border-l border-l-border bg-muted/20 px-3 py-2 text-right">
                    5yr Yield
                  </th>
                  <th className="bg-muted/20 px-3 py-2 text-right">
                    Back to hist.
                  </th>
                  <th className="border-l border-l-border px-3 py-2 text-right">
                    Req. TLC
                    <br />
                    <span className="text-[9px] normal-case tracking-normal">
                      for 10% IRR
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleSections.map((section, sIdx) => (
                  <SectionGroup
                    key={section.type}
                    section={section}
                    addSeparator={sIdx < visibleSections.length - 1}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IrrCellPreview tone="pos">3.95%</IrrCellPreview>
              Positive yield
            </span>
            <span className="flex items-center gap-1.5">
              <IrrCellPreview tone="neu">0.50%</IrrCellPreview>
              Neutral
            </span>
            <span className="flex items-center gap-1.5">
              <IrrCellPreview tone="neg">−5.47%</IrrCellPreview>
              Negative yield
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
              <span className="rounded bg-signal-green/15 px-1.5 py-0.5 text-signal-green">
                ECO
              </span>
              Eco-design hull
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function SectionGroup({
  section,
  addSeparator,
}: {
  section: IrrSection;
  addSeparator: boolean;
}) {
  return (
    <React.Fragment>
      {section.rows.map((row, i) => (
        <tr
          key={`${section.type}-${i}`}
          className="border-b last:border-0 hover:bg-muted/30"
        >
          {i === 0 ? (
            <td
              rowSpan={section.rows.length}
              className="border-r bg-muted/20 px-3 py-2.5 align-top text-[13px] font-bold"
            >
              {section.type}
            </td>
          ) : null}
          <td className="px-3 py-2.5">
            <span className="font-mono tabular-nums">{row.asset}</span>
            {row.eco ? (
              <span className="ml-1.5 rounded bg-signal-green/15 px-1.5 py-0.5 text-[9px] font-bold text-signal-green">
                ECO
              </span>
            ) : null}
          </td>
          <td className="px-3 py-2.5 text-muted-foreground">{row.size}</td>
          <td className="px-3 py-2.5 text-right font-mono tabular-nums">
            {row.resalePrice}
          </td>
          <IrrCell tone={row.bestYield.tone}>{row.bestYield.value}</IrrCell>
          <IrrCell tone={row.bestShortTerm.tone}>
            {row.bestShortTerm.value}
          </IrrCell>
          <IrrCell tone={row.worstYield.tone} divider>
            {row.worstYield.value}
          </IrrCell>
          <IrrCell tone={row.worstHist.tone}>{row.worstHist.value}</IrrCell>
          <td className="border-l border-l-border px-3 py-2.5 text-right font-mono tabular-nums">
            {row.reqTlc}
          </td>
        </tr>
      ))}
      {addSeparator ? (
        <tr aria-hidden>
          <td colSpan={9} className="h-1 bg-muted/40" />
        </tr>
      ) : null}
    </React.Fragment>
  );
}

function IrrCell({
  tone,
  divider = false,
  children,
}: {
  tone: IrrTone;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 text-right font-mono font-semibold tabular-nums",
        divider && "border-l border-l-border bg-muted/20",
        tone === "pos" && "text-signal-green",
        tone === "neg" && "text-signal-magenta",
        tone === "neu" && "text-muted-foreground",
      )}
    >
      {children}
    </td>
  );
}

function IrrCellPreview({
  tone,
  children,
}: {
  tone: IrrTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded bg-card px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums",
        tone === "pos" && "text-signal-green",
        tone === "neg" && "text-signal-magenta",
        tone === "neu" && "text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
