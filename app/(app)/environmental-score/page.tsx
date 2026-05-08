"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Construction,
  Download,
  Plus,
  RefreshCcw,
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
  EnvScoreBadge,
  type EnvScore,
} from "@/components/app/env-score-badge";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — mirrors html/environmental-score.html
 * -------------------------------------------------------------------------- */

const TOTAL_VESSELS = 34;

/* ── CII Grade Distribution (Tab 1) ──────────────────────────────── */

type GradeKey = "A" | "B" | "C" | "D" | "E";

const GRADE_DISTRIBUTION: Array<{
  grade: GradeKey;
  vessels: number;
  pct: number;
  fill: string;
  text: string;
}> = [
  { grade: "A", vessels: 8,  pct: 23.5, fill: "bg-signal-green/30",   text: "text-signal-green"   },
  { grade: "B", vessels: 14, pct: 41.2, fill: "bg-primary/30",        text: "text-primary"        },
  { grade: "C", vessels: 9,  pct: 26.5, fill: "bg-signal-orange/25",  text: "text-signal-orange"  },
  { grade: "D", vessels: 3,  pct: 8.8,  fill: "bg-signal-magenta/25", text: "text-signal-magenta" },
];

/* ── Tab 1 · Fleet CII & EEXI Status ─────────────────────────────── */

type Trend = "up" | "down" | "flat";

type FleetEnvRow = {
  imo: string;
  name: string;
  type: VesselType;
  typeLabel: string;
  year: number;
  dwt: number;
  cii: GradeKey;
  score: number;
  eexi: "compliant" | "non-compliant";
  lastSurvey: string;
  trend: Trend;
  trendLabel?: string;
};

const FLEET: FleetEnvRow[] = [
  { imo: "9876543", name: "MV Pacific Star",   type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2018, dwt: 82400,  cii: "A", score: 6.8,  eexi: "compliant",      lastSurvey: "2025-11", trend: "down", trendLabel: "improving" },
  { imo: "9345671", name: "MT Aegean Wind",    type: "Tanker",       typeLabel: "Tanker",       year: 2015, dwt: 115200, cii: "B", score: 8.1,  eexi: "compliant",      lastSurvey: "2025-09", trend: "flat" },
  { imo: "9123456", name: "MV Nordic Cape",    type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2010, dwt: 180000, cii: "C", score: 10.4, eexi: "non-compliant",  lastSurvey: "2024-06", trend: "up",   trendLabel: "worsening" },
  { imo: "9654321", name: "MT Horizon",        type: "Tanker",       typeLabel: "Chem. Tanker", year: 2019, dwt: 19800,  cii: "A", score: 6.2,  eexi: "compliant",      lastSurvey: "2025-12", trend: "down" },
  { imo: "9567890", name: "LNG Pioneer",       type: "Gas Carrier",  typeLabel: "LNG Carrier",  year: 2021, dwt: 145000, cii: "A", score: 5.9,  eexi: "compliant",      lastSurvey: "2025-10", trend: "down" },
  { imo: "9789012", name: "MV Blue Star",      type: "Container",    typeLabel: "Container",    year: 2020, dwt: 55000,  cii: "A", score: 6.5,  eexi: "compliant",      lastSurvey: "2025-11", trend: "flat" },
  { imo: "9234567", name: "MT Olympia",        type: "Tanker",       typeLabel: "Tanker",       year: 2012, dwt: 98500,  cii: "B", score: 8.8,  eexi: "compliant",      lastSurvey: "2024-08", trend: "flat" },
  { imo: "9456789", name: "MV Challenger",     type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2008, dwt: 76200,  cii: "D", score: 13.2, eexi: "non-compliant",  lastSurvey: "2023-04", trend: "up" },
  { imo: "9678901", name: "MV Southern Cross", type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2014, dwt: 58600,  cii: "B", score: 8.3,  eexi: "compliant",      lastSurvey: "2024-11", trend: "flat" },
  { imo: "9890123", name: "MT Coral Sea",      type: "Tanker",       typeLabel: "Tanker",       year: 2017, dwt: 72400,  cii: "B", score: 8.6,  eexi: "compliant",      lastSurvey: "2025-03", trend: "flat" },
  { imo: "9112233", name: "MV Pacific Venture",type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2019, dwt: 68400,  cii: "A", score: 7.1,  eexi: "compliant",      lastSurvey: "2025-07", trend: "down" },
  { imo: "9445566", name: "MT Black Sea",      type: "Tanker",       typeLabel: "Tanker",       year: 2016, dwt: 81200,  cii: "C", score: 9.9,  eexi: "compliant",      lastSurvey: "2024-12", trend: "up" },
];

/* ── CII Grade Legend (Tab 1 right) ──────────────────────────────── */

const CII_LEGEND: Array<{
  grade: GradeKey;
  title: string;
  text: string;
}> = [
  { grade: "A", title: "Grade A", text: "Significantly below required level" },
  { grade: "B", title: "Grade B", text: "Minor improvement needed" },
  { grade: "C", title: "Grade C", text: "Meets requirement" },
  { grade: "D", title: "Grade D", text: "Below requirement — requires action" },
  { grade: "E", title: "Grade E", text: "Major deficiency" },
];

/* ── Vessels Requiring Action / Top Improvers (Tab 1 right) ─────── */

type ActionItem = {
  vessel: string;
  detail: string;
  badge: { label: string; tone: "orange" | "red" };
};

const ACTION_REQUIRED: ActionItem[] = [
  { vessel: "MV Nordic Cape", detail: "C rating — Plan required",        badge: { label: "C",          tone: "orange" } },
  { vessel: "MV Challenger",  detail: "Urgent: submit SEEMP Part III",   badge: { label: "D — Urgent", tone: "red"    } },
  { vessel: "MT Black Sea",   detail: "C rating — Monitor",               badge: { label: "C",          tone: "orange" } },
];

const TOP_IMPROVERS: Array<{
  vessel: string;
  transition: string;
  change: string;
}> = [
  { vessel: "MV Pacific Star", transition: "B → A",         change: "↓ 1.2 pts" },
  { vessel: "MT Horizon",      transition: "B → A",         change: "↓ 0.8 pts" },
  { vessel: "LNG Pioneer",     transition: "A maintained",  change: "↓ 0.3 pts" },
];

/* ── Tab 2 · CII Ratings Detail ──────────────────────────────────── */

type CiiDetailRow = {
  vessel: string;
  type: VesselType;
  typeLabel: string;
  year: number;
  dwt: number;
  attained: number;
  required: number;
  ratio: number;
  rating: GradeKey;
  trend: Trend;
  action: string;
  actionTone?: "magenta";
};

const CII_DETAIL: CiiDetailRow[] = [
  { vessel: "LNG Pioneer",        type: "Gas Carrier",  typeLabel: "LNG Carrier",  year: 2021, dwt: 145000, attained: 5.9,  required: 7.2,  ratio: 0.82, rating: "A", trend: "down", action: "None" },
  { vessel: "MT Horizon",         type: "Tanker",       typeLabel: "Chem. Tanker", year: 2019, dwt: 19800,  attained: 6.2,  required: 7.3,  ratio: 0.85, rating: "A", trend: "down", action: "None" },
  { vessel: "MV Pacific Star",    type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2018, dwt: 82400,  attained: 6.8,  required: 7.6,  ratio: 0.89, rating: "A", trend: "down", action: "None" },
  { vessel: "MV Blue Star",       type: "Container",    typeLabel: "Container",    year: 2020, dwt: 55000,  attained: 6.5,  required: 7.1,  ratio: 0.91, rating: "A", trend: "flat", action: "None" },
  { vessel: "MV Pacific Venture", type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2019, dwt: 68400,  attained: 7.1,  required: 7.6,  ratio: 0.94, rating: "A", trend: "down", action: "None" },
  { vessel: "MT Aegean Wind",     type: "Tanker",       typeLabel: "Tanker",       year: 2015, dwt: 115200, attained: 8.1,  required: 8.3,  ratio: 0.98, rating: "B", trend: "flat", action: "Monitor" },
  { vessel: "MV Southern Cross",  type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2014, dwt: 58600,  attained: 8.3,  required: 8.4,  ratio: 0.99, rating: "B", trend: "flat", action: "Monitor" },
  { vessel: "MT Coral Sea",       type: "Tanker",       typeLabel: "Tanker",       year: 2017, dwt: 72400,  attained: 8.6,  required: 8.5,  ratio: 1.01, rating: "B", trend: "flat", action: "Monitor" },
  { vessel: "MT Olympia",         type: "Tanker",       typeLabel: "Tanker",       year: 2012, dwt: 98500,  attained: 8.8,  required: 8.6,  ratio: 1.02, rating: "B", trend: "flat", action: "Monitor" },
  { vessel: "MT Black Sea",       type: "Tanker",       typeLabel: "Tanker",       year: 2016, dwt: 81200,  attained: 9.9,  required: 9.3,  ratio: 1.06, rating: "C", trend: "up",   action: "Speed reduction plan" },
  { vessel: "MV Nordic Cape",     type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2010, dwt: 180000, attained: 10.4, required: 9.6,  ratio: 1.08, rating: "C", trend: "up",   action: "SEEMP Part III required" },
  { vessel: "MV Challenger",      type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2008, dwt: 76200,  attained: 13.2, required: 10.9, ratio: 1.21, rating: "D", trend: "up",   action: "Urgent: EPL + SEEMP", actionTone: "magenta" },
];

/* ── Tab 3 · EEXI Compliance ─────────────────────────────────────── */

type EexiRow = {
  vessel: string;
  type: VesselType;
  typeLabel: string;
  year: number;
  attained: number;
  required: number;
  marginPct: string;
  marginTone: "green" | "orange" | "magenta";
  status: "Compliant" | "Survey Pending" | "Non-Compliant";
  statusTone: "green" | "orange" | "red";
  action: string;
  actionTone?: "magenta";
};

const EEXI_ROWS: EexiRow[] = [
  { vessel: "LNG Pioneer",       type: "Gas Carrier",  typeLabel: "LNG Carrier",  year: 2021, attained: 3.82, required: 5.10, marginPct: "−25.1%", marginTone: "green",   status: "Compliant",      statusTone: "green",  action: "None" },
  { vessel: "MV Pacific Star",   type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2018, attained: 4.21, required: 5.40, marginPct: "−22.0%", marginTone: "green",   status: "Compliant",      statusTone: "green",  action: "None" },
  { vessel: "MV Blue Star",      type: "Container",    typeLabel: "Container",    year: 2020, attained: 7.14, required: 8.80, marginPct: "−18.9%", marginTone: "green",   status: "Compliant",      statusTone: "green",  action: "None" },
  { vessel: "MT Aegean Wind",    type: "Tanker",       typeLabel: "Tanker",       year: 2015, attained: 5.68, required: 6.50, marginPct: "−12.6%", marginTone: "green",   status: "Compliant",      statusTone: "green",  action: "None" },
  { vessel: "MT Olympia",        type: "Tanker",       typeLabel: "Tanker",       year: 2012, attained: 6.90, required: 6.50, marginPct: "+6.2%",  marginTone: "orange",  status: "Survey Pending", statusTone: "orange", action: "EEXI survey Q2 2026" },
  { vessel: "MT Black Sea",      type: "Tanker",       typeLabel: "Tanker",       year: 2016, attained: 6.12, required: 6.50, marginPct: "−5.8%",  marginTone: "green",   status: "Compliant",      statusTone: "green",  action: "None" },
  { vessel: "MV Nordic Cape",    type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2010, attained: 6.84, required: 5.40, marginPct: "+26.7%", marginTone: "magenta", status: "Non-Compliant",  statusTone: "red",    action: "Engine Power Limitation (EPL)",         actionTone: "magenta" },
  { vessel: "MV Challenger",     type: "Bulk Carrier", typeLabel: "Bulk Carrier", year: 2008, attained: 7.92, required: 5.40, marginPct: "+46.7%", marginTone: "magenta", status: "Non-Compliant",  statusTone: "red",    action: "EPL + Shaft Power Limitation",          actionTone: "magenta" },
];

/* ── Tab 4 · Peer Comparison ─────────────────────────────────────── */

type PeerRow = {
  vessel: string;
  isYou?: boolean;
  cii: number;
  rating: GradeKey;
  dwt: number;
  year: number;
  operator: string;
};

const PEER_COMPARISON: PeerRow[] = [
  { vessel: "MV Pacific Star (You)", isYou: true, cii: 6.8,  rating: "A", dwt: 82400, year: 2018, operator: "Your fleet" },
  { vessel: "Peer Vessel A",         cii: 5.4,  rating: "A", dwt: 78200, year: 2020, operator: "Undisclosed" },
  { vessel: "Peer Vessel B",         cii: 7.1,  rating: "A", dwt: 85600, year: 2017, operator: "Undisclosed" },
  { vessel: "Peer Vessel C",         cii: 7.8,  rating: "B", dwt: 80100, year: 2016, operator: "Undisclosed" },
  { vessel: "Peer Vessel D",         cii: 8.2,  rating: "B", dwt: 76800, year: 2019, operator: "Undisclosed" },
  { vessel: "Peer Vessel E",         cii: 8.6,  rating: "B", dwt: 83400, year: 2018, operator: "Undisclosed" },
  { vessel: "Peer Vessel F",         cii: 9.4,  rating: "C", dwt: 88900, year: 2016, operator: "Undisclosed" },
  { vessel: "Peer Vessel G",         cii: 10.8, rating: "C", dwt: 79300, year: 2017, operator: "Undisclosed" },
];

/* ── Tab 5 · Improvement Plans ───────────────────────────────────── */

const IMPROVEMENT_PLANS: Array<{
  vessel: string;
  current: GradeKey;
  target: GradeKey;
  status: "In Progress" | "Submitted" | "Approved" | "Overdue";
  measures: string;
  deadline: string;
  responsible: string;
}> = [
  { vessel: "MV Nordic Cape", current: "C", target: "B", status: "In Progress", measures: "Speed optimization + hull cleaning", deadline: "Dec 2026", responsible: "Fleet Operations" },
  { vessel: "MV Challenger",  current: "D", target: "C", status: "Submitted",   measures: "EPL + fuel switch to VLSFO",          deadline: "Jun 2026", responsible: "Technical Dept" },
];

const RECOMMENDED_MEASURES: Array<{
  measure: string;
  saving: string;
  implementation: string;
  cost: "Low" | "Medium" | "High";
}> = [
  { measure: "Speed Reduction (slow steaming)", saving: "8–15%",  implementation: "Operational",  cost: "Low"    },
  { measure: "Hull & Propeller Cleaning",        saving: "4–8%",   implementation: "Dry dock",     cost: "Medium" },
  { measure: "Engine Tuning & Optimisation",     saving: "2–5%",   implementation: "Technical",    cost: "Medium" },
  { measure: "Alternative Fuels (VLSFO / LNG)",  saving: "10–25%", implementation: "Retrofit req.",cost: "High"   },
  { measure: "Voyage Optimisation (routing)",    saving: "3–7%",   implementation: "Operational",  cost: "Low"    },
  { measure: "Waste Heat Recovery",              saving: "3–6%",   implementation: "Technical",    cost: "Medium" },
];

/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "overview",    label: "Fleet Overview" },
  { id: "cii",         label: "CII Ratings" },
  { id: "eexi",        label: "EEDI / EEXI" },
  { id: "benchmark",   label: "Benchmarking" },
  { id: "improvement", label: "Improvement Plans" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function EnvironmentalScorePage() {
  const [active, setActive] = React.useState<TabId>("overview");

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "Environmental Score" }]}
        title="Environmental Score"
        subtitle="CII ratings, EEDI/EEXI compliance and carbon intensity benchmarking across your fleet"
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export Report
            </Button>
            <Button className="gap-2">
              <RefreshCcw className="size-3.5" />
              Refresh Data
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
        {active === "overview" ? <FleetOverviewPanel /> : null}
        {active === "cii" ? <CiiRatingsPanel /> : null}
        {active === "eexi" ? <EexiPanel /> : null}
        {active === "benchmark" ? <BenchmarkingPanel /> : null}
        {active === "improvement" ? <ImprovementPlansPanel /> : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — Fleet Overview
 * -------------------------------------------------------------------------- */

function FleetOverviewPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard size="sm" label="Fleet Avg CII"          value="B"               meta={`${TOTAL_VESSELS} vessels in fleet`} accent="blue"    />
        <KpiCard size="sm" label="A-Rated Vessels"         value="8"               direction="up" change="+2 vs prior year"   accent="green"   />
        <KpiCard size="sm" label="EEXI Compliant"          value={`31/${TOTAL_VESSELS}`} meta="3 require action"             accent="cyan"    />
        <KpiCard size="sm" valueClassName="text-[16px]" label="Avg Carbon Intensity"    value="8.4 g CO₂/DWTnm"  direction="down" change="−0.6 vs 2024"     accent="orange"  />
        <KpiCard size="sm" valueClassName="text-[16px]" label="Next IMO Reporting"      value="2026-12-31"      meta="280 days remaining"                  accent="magenta" />
      </section>

      {/* 7-3 grid */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <div className="flex flex-col gap-3 lg:col-span-7">
          {/* CII Grade Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
              <div>
                <CardTitle className="text-base">CII Grade Distribution</CardTitle>
                <CardDescription>
                  All {TOTAL_VESSELS} monitored vessels — 2025 annual ratings
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-[11px]">
                  By Type
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[11px]">
                  By Age
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {GRADE_DISTRIBUTION.map((g) => (
                <div key={g.grade} className="flex items-center gap-3">
                  <div className="w-8 shrink-0">
                    <EnvScoreBadge value={g.grade as EnvScore} />
                  </div>
                  <div className="relative h-7 flex-1 overflow-hidden rounded bg-muted/40">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded transition-[width]",
                        g.fill,
                      )}
                      style={{ width: `${g.pct}%` }}
                      aria-hidden
                    />
                  </div>
                  <div className="w-[88px] shrink-0 whitespace-nowrap text-right text-[12px] font-bold tabular-nums">
                    {g.vessels} vessels
                  </div>
                  <div className="w-[52px] shrink-0 whitespace-nowrap text-right text-[11px] tabular-nums text-muted-foreground">
                    {g.pct.toFixed(1)}%
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fleet CII & EEXI Status table */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
              <div>
                <CardTitle className="text-base">Fleet CII &amp; EEXI Status</CardTitle>
                <CardDescription>
                  Showing {FLEET.length} of {TOTAL_VESSELS} vessels — sorted by CII score
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-8 rounded-md border border-input bg-background px-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>All Types</option>
                  <option>Bulk Carrier</option>
                  <option>Tanker</option>
                  <option>Container</option>
                  <option>LNG Carrier</option>
                </select>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="size-3.5" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-3 py-2 text-left">Vessel</th>
                    <th className="px-3 py-2 text-left">IMO</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-right">Year</th>
                    <th className="px-3 py-2 text-right">DWT</th>
                    <th className="px-3 py-2 text-center">CII</th>
                    <th className="px-3 py-2 text-right">Score</th>
                    <th className="px-3 py-2 text-center">EEXI</th>
                    <th className="px-3 py-2 text-left">Last Survey</th>
                    <th className="px-3 py-2 text-left">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {FLEET.map((v) => (
                    <tr key={v.imo} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/vessels/${v.imo}`}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {v.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                        {v.imo}
                      </td>
                      <td className="px-3 py-2.5">
                        <VesselTypeBadge value={v.type} />
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                        {v.year}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                        {v.dwt.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <EnvScoreBadge value={v.cii as EnvScore} />
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                        {v.score.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <EexiStatusBadge status={v.eexi} />
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {v.lastSurvey}
                      </td>
                      <td className="px-3 py-2.5">
                        <TrendChip trend={v.trend} label={v.trendLabel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-3 lg:col-span-3">
          {/* CII Grade Legend */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">CII Grade Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 py-3">
              {CII_LEGEND.map((g) => (
                <div key={g.grade} className="flex items-start gap-3">
                  <EnvScoreBadge value={g.grade as EnvScore} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold">{g.title}</p>
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      {g.text}
                    </p>
                  </div>
                </div>
              ))}
              <p className="mt-4 rounded-r border-l-[3px] border-primary bg-primary/[0.05] px-4 py-2 text-[11px] leading-[1.5] text-[#788187]">
                CII is calculated annually based on actual operational data. Vessels rated
                D or E for 3 consecutive years require a corrective action plan under
                MARPOL Annex VI.
              </p>
            </CardContent>
          </Card>

          {/* Vessels Requiring Action */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
              <CardTitle className="text-base">Vessels Requiring Action</CardTitle>
              <span className="rounded-full bg-signal-magenta/15 px-2 py-0.5 text-[10px] font-bold text-signal-magenta">
                {ACTION_REQUIRED.length}
              </span>
            </CardHeader>
            <ul className="divide-y">
              {ACTION_REQUIRED.map((a) => (
                <li
                  key={a.vessel}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold">{a.vessel}</p>
                    <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                  </div>
                  <span
                    className={cn(
                      "whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold",
                      a.badge.tone === "orange" &&
                        "bg-signal-orange/15 text-signal-orange",
                      a.badge.tone === "red" &&
                        "bg-signal-magenta/15 text-signal-magenta",
                    )}
                  >
                    {a.badge.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Top Improvers */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Top Improvers (YTD)</CardTitle>
            </CardHeader>
            <ul className="divide-y">
              {TOP_IMPROVERS.map((i) => (
                <li
                  key={i.vessel}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold">{i.vessel}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {i.transition}
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] font-bold tabular-nums text-signal-green">
                    {i.change}
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
 * Tab 2 — CII Ratings
 * -------------------------------------------------------------------------- */

function CiiRatingsPanel() {
  return (
    <>
      <Card className="border-l-[3px] border-l-primary bg-primary/[0.04]">
        <CardContent className="p-4">
          <p className="m-0 text-[12px] leading-[1.6] text-[#788187]">
            <strong className="text-foreground">CII (Carbon Intensity Indicator)</strong>{" "}
            is an annual operational rating under MARPOL Annex VI. Vessels are rated A–E
            based on grams of CO₂ per cargo-carrying capacity and nautical mile. A and B
            ratings indicate good performance; D and E ratings require corrective action
            plans.
          </p>
        </CardContent>
      </Card>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            <option>All Vessel Types</option>
            <option>Bulk Carrier</option>
            <option>Tanker</option>
            <option>Container</option>
            <option>LNG Carrier</option>
          </select>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            <option>All CII Grades</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
            <option>E</option>
          </select>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
          <Button size="sm" variant="outline" className="ml-auto gap-2">
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">CII Ratings Detail</CardTitle>
          <CardDescription>
            Annual CII ratings — {CII_DETAIL.length} vessels shown, sorted by CII ratio
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Year Built</th>
                <th className="px-3 py-2 text-right">DWT</th>
                <th className="px-3 py-2 text-right">Attained CII</th>
                <th className="px-3 py-2 text-right">Required CII</th>
                <th className="px-3 py-2 text-right">CII Ratio</th>
                <th className="px-3 py-2 text-center">Rating</th>
                <th className="px-3 py-2 text-left">Trend</th>
                <th className="px-3 py-2 text-left">Action Required</th>
              </tr>
            </thead>
            <tbody>
              {CII_DETAIL.map((r) => (
                <tr key={r.vessel} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-semibold">{r.vessel}</td>
                  <td className="px-3 py-2.5">
                    <VesselTypeBadge value={r.type} />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {r.year}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {r.dwt.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {r.attained.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {r.required.toFixed(1)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-bold tabular-nums",
                      r.ratio < 0.95 && "text-signal-green",
                      r.ratio >= 0.95 && r.ratio <= 1.05 && "text-primary",
                      r.ratio > 1.05 && r.ratio < 1.15 && "text-signal-orange",
                      r.ratio >= 1.15 && "text-signal-magenta",
                    )}
                  >
                    {r.ratio.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <EnvScoreBadge value={r.rating as EnvScore} />
                  </td>
                  <td className="px-3 py-2.5">
                    <TrendChip trend={r.trend} />
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5",
                      r.actionTone === "magenta"
                        ? "font-semibold text-signal-magenta"
                        : r.action === "None"
                          ? "text-muted-foreground"
                          : "text-foreground",
                    )}
                  >
                    {r.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 3 — EEDI / EEXI
 * -------------------------------------------------------------------------- */

function EexiPanel() {
  return (
    <>
      <Card className="border-l-[3px] border-l-accent bg-accent/[0.04]">
        <CardContent className="p-4">
          <p className="m-0 text-[12px] leading-[1.6] text-[#788187]">
            <strong className="text-foreground">EEDI (Energy Efficiency Design Index)</strong>{" "}
            applies to new vessels and measures design-phase energy efficiency.{" "}
            <strong className="text-foreground">EEXI (Energy Efficiency Existing Ship Index)</strong>{" "}
            is a one-time technical requirement for existing vessels in service from 2023,
            assessed against IMO reference lines by ship type and size.
          </p>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard size="sm" label="EEXI Compliant"   value="31/34"   meta="91.2% compliance rate" accent="green"  />
        <KpiCard size="sm" label="Non-Compliant"     value="3"       meta="EPL or SPL required"  accent="magenta" />
        <KpiCard size="sm" label="Pending Survey"    value="2"       meta="Survey due Q2 2026"   accent="orange" />
        <KpiCard size="sm" label="Avg EEXI Margin"   value="−14.2%"  meta="Below required value" accent="blue"   />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-base">EEXI Compliance Status</CardTitle>
            <CardDescription>
              Key vessels — attained vs required EEXI values
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Year</th>
                <th className="px-3 py-2 text-right">Attained EEXI</th>
                <th className="px-3 py-2 text-right">Required EEXI</th>
                <th className="px-3 py-2 text-right">Margin</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-left">Required Action</th>
              </tr>
            </thead>
            <tbody>
              {EEXI_ROWS.map((r) => (
                <tr key={r.vessel} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-semibold">{r.vessel}</td>
                  <td className="px-3 py-2.5">
                    <VesselTypeBadge value={r.type} />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {r.year}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                    {r.attained.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {r.required.toFixed(2)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-bold tabular-nums",
                      r.marginTone === "green"   && "text-signal-green",
                      r.marginTone === "orange"  && "text-signal-orange",
                      r.marginTone === "magenta" && "text-signal-magenta",
                    )}
                  >
                    {r.marginPct}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                        r.statusTone === "green" &&
                          "bg-signal-green/15 text-signal-green",
                        r.statusTone === "orange" &&
                          "bg-signal-orange/15 text-signal-orange",
                        r.statusTone === "red" &&
                          "bg-signal-magenta/15 text-signal-magenta",
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5",
                      r.actionTone === "magenta"
                        ? "font-semibold text-signal-magenta"
                        : r.action === "None"
                          ? "text-muted-foreground"
                          : "text-foreground",
                    )}
                  >
                    {r.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="m-0 border-t px-4 py-3 text-[11px] leading-[1.5] text-muted-foreground">
          Note: Vessels built before 2013 must demonstrate EEXI ≤ required value.
          Non-compliance requires Engine Power Limitation (EPL) or shaft power limitation
          to reduce attained EEXI below the required threshold.
        </p>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 4 — Benchmarking
 * -------------------------------------------------------------------------- */

function BenchmarkingPanel() {
  return (
    <>
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            <option>MV Pacific Star</option>
            <option>MT Aegean Wind</option>
            <option>MV Nordic Cape</option>
            <option>MT Horizon</option>
            <option>LNG Pioneer</option>
            <option>MV Blue Star</option>
            <option>MT Olympia</option>
            <option>MV Challenger</option>
          </select>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            <option>Bulk Carriers 75–90K DWT, built 2016–2022</option>
            <option>Bulk Carriers 150K+ DWT</option>
            <option>Tankers 80–120K DWT</option>
            <option>LNG Carriers</option>
          </select>
          <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
            <option>2025 Annual</option>
            <option>2024 Annual</option>
            <option>Q1 2026</option>
          </select>
          <Button size="sm" className="ml-auto">
            Run Benchmark
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Carbon Intensity Benchmarking</CardTitle>
          <CardDescription>
            MV Pacific Star vs Peer Group — Bulk Carriers 75–90K DWT, built 2016–2022
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPlaceholder height="h-64" />
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard size="sm" label="Selected Vessel CII" value="6.8" meta="MV Pacific Star"           accent="green"  />
        <KpiCard size="sm" label="Peer Group Avg"      value="8.2" meta="17 peer vessels"            accent="blue"   />
        <KpiCard size="sm" label="Best-in-Class"       value="5.4" meta="Top performer in group"     accent="cyan"   />
        <KpiCard size="sm" label="Fleet Average"       value="8.4" meta="All monitored vessels"      accent="orange" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Peer Comparison</CardTitle>
          <CardDescription>
            Anonymized peer vessels — Bulk Carriers 75–90K DWT, built 2016–2022
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-right">CII Score</th>
                <th className="px-3 py-2 text-center">Rating</th>
                <th className="px-3 py-2 text-right">DWT</th>
                <th className="px-3 py-2 text-right">Year Built</th>
                <th className="px-3 py-2 text-left">Operator</th>
              </tr>
            </thead>
            <tbody>
              {PEER_COMPARISON.map((r) => (
                <tr
                  key={r.vessel}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/30",
                    r.isYou && "bg-primary/5",
                  )}
                >
                  <td
                    className={cn(
                      "px-3 py-2.5 font-semibold",
                      r.isYou && "text-primary",
                    )}
                  >
                    {r.vessel}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-bold tabular-nums",
                      r.isYou && "text-signal-green",
                    )}
                  >
                    {r.cii.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <EnvScoreBadge value={r.rating as EnvScore} />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {r.dwt.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {r.year}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {r.operator}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 5 — Improvement Plans
 * -------------------------------------------------------------------------- */

function ImprovementPlansPanel() {
  return (
    <>
      <Card className="border-l-[3px] border-l-signal-orange bg-signal-orange/5">
        <CardContent className="p-4">
          <p className="m-0 text-[12px] leading-[1.6] text-[#788187]">
            Create and track{" "}
            <strong className="text-foreground">SEEMP Part III corrective action plans</strong>{" "}
            for vessels rated D or E. Under MARPOL Annex VI, vessels rated D for three
            consecutive years or E in any year must submit an approved corrective action
            plan to their flag administration.
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-base">Active Improvement Plans</CardTitle>
            <CardDescription>
              SEEMP Part III corrective action plans — vessels rated C, D or E
            </CardDescription>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="size-3.5" />
            Create New Improvement Plan
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Vessel</th>
                <th className="px-3 py-2 text-center">Current Rating</th>
                <th className="px-3 py-2 text-center">Target Rating</th>
                <th className="px-3 py-2 text-center">Plan Status</th>
                <th className="px-3 py-2 text-left">Measures</th>
                <th className="px-3 py-2 text-left">Deadline</th>
                <th className="px-3 py-2 text-left">Responsible</th>
              </tr>
            </thead>
            <tbody>
              {IMPROVEMENT_PLANS.map((p) => (
                <tr key={p.vessel} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-semibold">{p.vessel}</td>
                  <td className="px-3 py-2.5 text-center">
                    <EnvScoreBadge value={p.current as EnvScore} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <EnvScoreBadge value={p.target as EnvScore} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <PlanStatusBadge status={p.status} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {p.measures}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{p.deadline}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {p.responsible}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6-4 grid */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <Card className="overflow-hidden lg:col-span-6">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Recommended Measures</CardTitle>
            <CardDescription>Typical CO₂ reduction potential per measure</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-3 py-2 text-left">Measure</th>
                  <th className="px-3 py-2 text-right">Typical CO₂ Saving</th>
                  <th className="px-3 py-2 text-left">Implementation</th>
                  <th className="px-3 py-2 text-center">Cost Indicator</th>
                </tr>
              </thead>
              <tbody>
                {RECOMMENDED_MEASURES.map((m) => (
                  <tr key={m.measure} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5 font-semibold">{m.measure}</td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums text-signal-green">
                      {m.saving}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {m.implementation}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <CostBadge cost={m.cost} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <ul className="divide-y">
                <SummaryLine label="Active Plans"     value="2" />
                <SummaryLine label="Submitted to Flag" value="1" />
                <SummaryLine label="Approved"          value="0" tone="green" />
                <SummaryLine label="Overdue"           value="0" tone="magenta" />
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 py-3">
              <Button size="sm" className="w-full justify-center gap-2">
                <Plus className="size-3.5" />
                Create New Improvement Plan
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-center gap-2">
                <Download className="size-3.5" />
                Export Plans (PDF)
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-center">
                Submit to Flag Administration
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function EexiStatusBadge({ status }: { status: "compliant" | "non-compliant" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        status === "compliant"
          ? "bg-signal-green/15 text-signal-green"
          : "bg-signal-magenta/15 text-signal-magenta",
      )}
    >
      {status === "compliant" ? "Compliant" : "Non-compliant"}
    </span>
  );
}

function TrendChip({
  trend,
  label,
}: {
  trend: Trend;
  label?: string;
}) {
  const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : ArrowRight;
  const tone =
    trend === "up"
      ? "text-signal-magenta"
      : trend === "down"
        ? "text-signal-green"
        : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", tone)}>
      <Icon className="size-3" />
      {label ?? ""}
    </span>
  );
}

function PlanStatusBadge({
  status,
}: {
  status: "In Progress" | "Submitted" | "Approved" | "Overdue";
}) {
  const STYLE = {
    "In Progress": "bg-primary/15 text-primary",
    "Submitted":   "bg-signal-orange/15 text-signal-orange",
    "Approved":    "bg-signal-green/15 text-signal-green",
    "Overdue":     "bg-signal-magenta/15 text-signal-magenta",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

function CostBadge({ cost }: { cost: "Low" | "Medium" | "High" }) {
  const STYLE = {
    Low:    "bg-signal-green/15 text-signal-green",
    Medium: "bg-primary/10 text-primary",
    High:   "bg-signal-magenta/15 text-signal-magenta",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        STYLE[cost],
      )}
    >
      {cost}
    </span>
  );
}

function SummaryLine({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "magenta";
}) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[14px] font-bold tabular-nums",
          tone === "green"   && "text-signal-green",
          tone === "magenta" && "text-signal-magenta",
          tone === "neutral" && "text-foreground",
        )}
      >
        {value}
      </span>
    </li>
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
