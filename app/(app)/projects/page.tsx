"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calculator,
  Download,
  Edit3,
  FolderOpen,
  GitCompare,
  LayoutGrid,
  LineChart as LineChartIcon,
  List,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import {
  ProjectCard,
  type Project,
} from "@/components/app/project-card";
import {
  RequestStatusChip,
  type RequestStatus,
} from "@/components/app/request-status-chip";
import {
  EnvScoreBadge,
  type EnvScore,
} from "@/components/app/env-score-badge";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data
 * -------------------------------------------------------------------------- */

const PROJECTS: Project[] = [
  { id: "bulk-fleet-expansion-2026", title: "Bulk Fleet Expansion 2026", status: "Active",   category: "Investment",
    description: "Evaluation of 4 Panamax and Kamsarmax bulk carriers for portfolio expansion. Includes cashflow projections and loan oracle scenarios.",
    vessels: ["MV Pacific Star", "MV Baltic Crown", "MV Cape Fortuna", "MV Horizon Bay"],
    created: "10 Mar 2026", modified: "25 Mar 2026", scenarios: "5 cashflow · 3 loan oracle", owner: "A. Avdieieva" },
  { id: "tanker-portfolio-q1",      title: "Tanker Portfolio Review Q1",  status: "Active",   category: "Performance",
    description: "Q1 2026 performance review of the tanker sub-portfolio. Comparing actual vs projected earnings and loan covenant compliance.",
    vessels: ["MT Helios Trader", "MT Nordic Eagle", "MT Aegean Wind"],
    created: "01 Jan 2026", modified: "22 Mar 2026", scenarios: "2 cashflow · 2 loan oracle", owner: "A. Avdieieva" },
  { id: "lng-newbuild-assessment",  title: "LNG Newbuild Assessment",     status: "Complete", category: "Newbuild",
    description: "Assessment of two TFDE LNG carriers — yard slot, financing structure and 10-year IRR profile across charter scenarios.",
    vessels: ["LNG Adriatic Pearl", "LNG Pioneer"],
    created: "15 Feb 2026", modified: "18 Mar 2026", scenarios: "4 cashflow · 2 loan oracle", owner: "J. Karaman" },
  { id: "lpg-refi-q2",               title: "LPG Refi Window — Q2 2026",   status: "Draft",    category: "Refinance",
    description: "Refinancing scenarios for two ageing VLGCs as their existing facilities reach 5-year break dates. Sensitivity to SOFR moves.",
    vessels: ["MT Olympia", "MT Black Sea"],
    created: "20 Mar 2026", modified: "26 Mar 2026", scenarios: "3 cashflow · 1 loan oracle", owner: "A. Avdieieva" },
  { id: "esg-cii-uplift",            title: "Fleet CII Uplift Plan",       status: "Active",   category: "ESG",
    description: "Engine power limitation, slow-steaming and biofuel pilots across 6 vessels currently rated C/D. Targeting B by 2027.",
    vessels: ["MV Sea Breeze", "MV Atlantic Pioneer", "MT Coral Sea"],
    created: "05 Mar 2026", modified: "24 Mar 2026", scenarios: "6 cashflow · 0 loan oracle", owner: "M. Schultz" },
  { id: "container-divest",          title: "Container Divestment Scenario", status: "Archived", category: "Investment",
    description: "Scenario analysis for divesting 2 post-Panamax containers ahead of expected 2027 supply glut. Evaluated vs holding through cycle.",
    vessels: ["MV Star Voyager", "MV Challenger"],
    created: "12 Dec 2025", modified: "08 Feb 2026", scenarios: "3 cashflow · 1 loan oracle", owner: "A. Avdieieva" },
];

// Per-project scenario history for the project tabs.
type Scenario = {
  id: string;
  kind: "Cashflow" | "Loan Oracle";
  vessel: string;
  result: string;
  tone: "pos" | "neg" | "neu";
  created: string;
  status: RequestStatus;
};

const SCENARIOS_BY_PROJECT: Record<string, Scenario[]> = {
  "bulk-fleet-expansion-2026": [
    { id: "s-1", kind: "Cashflow",    vessel: "MV Pacific Star", result: "IRR 14.8% · NPV +$4.2M",  tone: "pos", created: "26 Mar 2026", status: "completed" },
    { id: "s-2", kind: "Cashflow",    vessel: "MV Pacific Star", result: "IRR 6.2% · NPV −$1.4M",   tone: "neg", created: "26 Mar 2026", status: "completed" },
    { id: "s-3", kind: "Cashflow",    vessel: "MV Cape Fortuna", result: "IRR 10.1% · NPV +$2.1M",  tone: "pos", created: "24 Mar 2026", status: "completed" },
    { id: "s-4", kind: "Loan Oracle", vessel: "MV Pacific Star", result: "Highly Possible · LTV 65%", tone: "pos", created: "23 Mar 2026", status: "completed" },
    { id: "s-5", kind: "Loan Oracle", vessel: "MV Baltic Crown", result: "Possible · LTV 75%",       tone: "neu", created: "20 Mar 2026", status: "completed" },
  ],
  "tanker-portfolio-q1": [
    { id: "t-1", kind: "Cashflow",    vessel: "MT Helios Trader", result: "IRR 9.4% · NPV +$1.8M",  tone: "pos", created: "20 Mar 2026", status: "completed" },
    { id: "t-2", kind: "Cashflow",    vessel: "MT Aegean Wind",   result: "IRR 7.6% · NPV +$0.6M",  tone: "pos", created: "18 Mar 2026", status: "completed" },
    { id: "t-3", kind: "Loan Oracle", vessel: "MT Nordic Eagle",  result: "Possible · LTV 70%",      tone: "neu", created: "12 Mar 2026", status: "completed" },
    { id: "t-4", kind: "Loan Oracle", vessel: "MT Helios Trader", result: "Highly Possible · LTV 60%", tone: "pos", created: "08 Mar 2026", status: "completed" },
  ],
  "lng-newbuild-assessment": [
    { id: "l-1", kind: "Cashflow",    vessel: "LNG Pioneer",        result: "IRR 11.2% · NPV +$8.4M", tone: "pos", created: "16 Mar 2026", status: "completed" },
    { id: "l-2", kind: "Cashflow",    vessel: "LNG Adriatic Pearl", result: "IRR 9.8% · NPV +$6.2M",  tone: "pos", created: "14 Mar 2026", status: "completed" },
    { id: "l-3", kind: "Loan Oracle", vessel: "LNG Pioneer",        result: "Possible · LTV 65%",      tone: "neu", created: "12 Mar 2026", status: "completed" },
  ],
  "lpg-refi-q2": [
    { id: "r-1", kind: "Loan Oracle", vessel: "MT Olympia",   result: "Challenging · LTV 70%", tone: "neg", created: "26 Mar 2026", status: "running" },
  ],
  "esg-cii-uplift": [
    { id: "e-1", kind: "Cashflow", vessel: "MV Sea Breeze", result: "IRR 8.2% · NPV +$0.9M", tone: "pos", created: "22 Mar 2026", status: "completed" },
  ],
  "container-divest": [
    { id: "c-1", kind: "Cashflow", vessel: "MV Star Voyager", result: "IRR 5.4% · NPV −$2.1M", tone: "neg", created: "01 Feb 2026", status: "completed" },
  ],
};

const TOTAL_VESSELS_ANALYSED = new Set(PROJECTS.flatMap((p) => p.vessels)).size;
const TOTAL_SCENARIOS = PROJECTS.reduce((sum, p) => {
  const m = p.scenarios.match(/(\d+) cashflow · (\d+) loan oracle/);
  return sum + (m ? Number(m[1]) + Number(m[2]) : 0);
}, 0);
const ACTIVE_COUNT = PROJECTS.filter((p) => p.status === "Active").length;
const COMPLETE_COUNT = PROJECTS.filter((p) => p.status === "Complete").length;

/* --------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

type SubTab = "my" | "compare";

export default function ProjectsPage() {
  // Top-level sub-tab: "my" → My Projects panel · "compare" → Vessel Compare panel.
  const [subTab, setSubTab] = React.useState<SubTab>("my");

  // Within "My Projects": "all" shows the grid; otherwise an opened project id.
  const [active, setActive] = React.useState<string>("all");
  // Project ids the user has opened by clicking. Empty by default.
  const [openIds, setOpenIds] = React.useState<string[]>([]);

  function openProject(id: string) {
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActive(id);
    setSubTab("my");
  }

  function closeProject(id: string) {
    setOpenIds((prev) => prev.filter((x) => x !== id));
    if (active === id) {
      setActive("all");
    }
  }

  const openProjects = openIds
    .map((id) => PROJECTS.find((p) => p.id === id))
    .filter((p): p is Project => Boolean(p));

  const activeProject = PROJECTS.find((p) => p.id === active);

  // Header title/subtitle update with active sub-tab + opened project.
  const headerTitle =
    subTab === "my" && activeProject
      ? activeProject.title
      : subTab === "compare"
        ? "Vessel Compare"
        : "Projects";
  const headerSubtitle =
    subTab === "my" && activeProject
      ? activeProject.description
      : subTab === "compare"
        ? "Side-by-side benchmarking across vessel cohorts"
        : "Manage analysis projects, compare vessels, and evaluate investment scenarios";

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "Projects", href: "/projects" },
          ...(subTab === "my" && activeProject
            ? [{ label: activeProject.title }]
            : subTab === "compare"
              ? [{ label: "Vessel Compare" }]
              : []),
        ]}
        title={headerTitle}
        subtitle={headerSubtitle}
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="size-3.5" />
              New Project
            </Button>
          </>
        }
      />

      {/* Top-level sub-tab strip — same pattern other (app) pages use */}
      <div className="flex flex-shrink-0 items-end gap-0 overflow-x-auto border-b bg-card px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SubTabButton
          label="My Projects"
          active={subTab === "my"}
          onClick={() => setSubTab("my")}
        />
        <SubTabButton
          label="Vessel Compare"
          active={subTab === "compare"}
          onClick={() => setSubTab("compare")}
        />
      </div>

      {subTab === "my" ? (
        <div className="flex flex-col p-8">
          {/* Project browser tab strip — `.proj-browser-bar` from prototype */}
          <div className="relative z-[1] flex shrink-0 items-stretch gap-[2px] overflow-x-auto rounded-t-md border border-b-0 bg-muted/40 px-2 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ProjectTab
              label="All Projects"
              badge={PROJECTS.length}
              active={active === "all"}
              onClick={() => setActive("all")}
            />
            {openProjects.map((p) => (
              <ProjectTab
                key={p.id}
                label={p.title}
                active={active === p.id}
                onClick={() => setActive(p.id)}
                onClose={() => closeProject(p.id)}
                truncate
              />
            ))}
          </div>

          {/* Browser content area — `.proj-browser-content`: white bg,
              border (no top), bottom-rounded, 16px padding. */}
          <div className="flex flex-col gap-4 rounded-b-md border bg-card p-4">
            {active === "all" ? <AllProjectsView onOpenProject={openProject} /> : null}
            {activeProject ? <ProjectDetailView project={activeProject} /> : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 p-8">
          <VesselComparePanel />
        </div>
      )}
    </div>
  );
}

/**
 * SubTabButton — the standard top-level sub-tab styling shared with other
 * (app) pages: 12px / 600 / muted text by default, 2px primary bottom rail
 * and foreground text when active.
 */
function SubTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "whitespace-nowrap border-b-2 px-5 py-2.5 text-[12px] font-semibold transition-colors",
        active
          ? "border-primary text-primary"
          : "border-transparent text-[#A0ABB2] hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

/* --------------------------------------------------------------------------
 * Tab — All Projects
 * -------------------------------------------------------------------------- */

function AllProjectsView({
  onOpenProject,
}: {
  onOpenProject: (id: string) => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, vessel, type, owner…"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <ViewToggle />
        <span className="ml-auto text-[11px] text-muted-foreground">
          {PROJECTS.length} projects
        </span>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active Projects"
          value={String(PROJECTS.length)}
          meta={`${ACTIVE_COUNT} in progress · ${COMPLETE_COUNT} complete`}
          accent="blue"
        />
        <KpiCard label="Vessels Analysed" value={String(TOTAL_VESSELS_ANALYSED)} meta="Across all projects" accent="cyan" />
        <KpiCard label="Analysis Scenarios" value={String(TOTAL_SCENARIOS)} meta="Cashflow & Loan runs" accent="green" />
        <KpiCard label="Last Updated" value="26 Mar" meta="LPG Refi Window — Q2 2026" accent="orange" />
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {PROJECTS.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onClick={() => onOpenProject(p.id)}
          />
        ))}
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Project Detail (one per opened project)
 * -------------------------------------------------------------------------- */

/**
 * ProjectDetailView — mirrors the prototype's `#proj-detail-view` from
 * html/projects.html. Four stacked sections inside the white browser-content:
 *   1. Project hero  — title (text-xl/800), status+category badges,
 *                       description, Edit + Export action buttons
 *   2. KPI row       — 4 inline gray boxes (Vessels / Scenarios /
 *                       Created / Last Modified)
 *   3. Two-column    — Vessels in Project (table) | Analysis Scenarios
 *                       (Cashflow + Loan Oracle scenario pill lists)
 *   4. Vessel Comparison — same comparison-table shape as the standalone
 *                       Vessel Compare panel, scoped to this project's
 *                       vessels.
 */
function ProjectDetailView({ project: p }: { project: Project }) {
  const scenarios = SCENARIOS_BY_PROJECT[p.id] ?? [];
  const cashflowScenarios = scenarios.filter((s) => s.kind === "Cashflow");
  const loanScenarios = scenarios.filter((s) => s.kind === "Loan Oracle");

  // Per-vessel quick-look data for the "Vessels in Project" table.
  const vesselDetails = p.vessels.map((name) => {
    const fallback = VESSEL_QUICKLOOK[name];
    return {
      name,
      type: fallback?.type ?? "Bulk Carrier",
      tag: fallback?.tag ?? "BULK",
      tagColor: fallback?.tagColor ?? "bg-primary/12 text-primary",
      fmv: fallback?.fmv ?? "—",
      cii: (fallback?.cii ?? "B") as EnvScore,
    };
  });

  return (
    <>
      {/* 1 — Project hero */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[20px] font-extrabold tracking-[-0.4px] text-foreground">
              {p.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={p.status} />
              <CategoryBadge category={p.category} />
            </div>
            <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-muted-foreground">
              {p.description}
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Edit3 className="size-3.5" />
              Edit
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* 2 — Inline KPI row */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ProjKpi value={String(p.vessels.length)} label="Vessels" />
        <ProjKpi value={String(scenarios.length)} label="Scenarios" />
        <ProjKpi value={shortDate(p.created)} label="Created" />
        <ProjKpi value={shortDate(p.modified)} label="Last Modified" />
      </section>

      {/* 3 — Vessels in Project | Analysis Scenarios */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
            <h3 className="text-[14px] font-bold">Vessels in Project</h3>
            <Button size="sm" variant="outline">Add Vessel</Button>
          </CardHeader>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">FMV</th>
                <th className="px-4 py-2 text-center">CII</th>
              </tr>
            </thead>
            <tbody>
              {vesselDetails.map((v) => (
                <tr key={v.name} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/vessel-search?q=${encodeURIComponent(v.name)}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {v.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
                        v.tagColor,
                      )}
                    >
                      {v.tag}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {v.fmv}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <EnvScoreBadge value={v.cii} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
            <h3 className="text-[14px] font-bold">Analysis Scenarios</h3>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="size-3.5" />
              New Scenario
            </Button>
          </CardHeader>
          <div className="flex flex-col gap-4 p-4">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
                Cashflow Scenarios ({cashflowScenarios.length})
              </div>
              <div className="flex flex-col gap-1.5">
                {cashflowScenarios.length > 0 ? (
                  cashflowScenarios.map((s, i) => (
                    <ScenarioPill
                      key={s.id}
                      kind="cashflow"
                      label={s.vessel + (s.result ? ` — ${s.result.split(" · ")[0]}` : "")}
                      active={i === 0}
                    />
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground">No cashflow scenarios yet.</p>
                )}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
                Loan Oracle Scenarios ({loanScenarios.length})
              </div>
              <div className="flex flex-col gap-1.5">
                {loanScenarios.length > 0 ? (
                  loanScenarios.map((s) => (
                    <ScenarioPill
                      key={s.id}
                      kind="loan"
                      label={s.vessel + (s.result ? ` — ${s.result.split(" · ")[0]}` : "")}
                    />
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground">No loan oracle scenarios yet.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 4 — Vessel Comparison scoped to this project — mirrors the
            prototype's pd-vessel-compare table, with 4 sections and bar
            visualisations for FMV + LTV. */}
      <ProjectCompareTable vessels={vesselDetails} />

      {/* Footer with deeper links */}
      <Card className="border-dashed bg-muted/30 p-3">
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
            Project meta
          </span>
          <span>
            <strong className="font-semibold">Owner:</strong> {p.owner}
          </span>
          <span>
            <strong className="font-semibold">Category:</strong> {p.category}
          </span>
          <Button asChild size="sm" variant="outline" className="ml-auto gap-2">
            <Link href={`/projects/${p.id}/compare`}>
              <GitCompare className="size-3.5" />
              Full Compare
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={`/projects/${p.id}`}>Open full page</Link>
          </Button>
        </div>
      </Card>
    </>
  );
}

/**
 * Per-vessel quicklook lookup powering BOTH the project detail's
 * "Vessels in Project" table AND the project-scoped Vessel Comparison
 * matrix below it. Mirrors the prototype's `pd-vessels-table` rows plus
 * the comparison-table cells (specs, valuations, financial, environmental).
 */
type VesselQuicklook = {
  /* Tag rendering */
  type: string;
  tag: string;
  tagColor: string;
  /* Specs */
  imo: string;
  yearBuilt: number;
  dwt: number;
  classification: string;
  /* Valuations */
  fmv: string;          // display string e.g. "$28.5M"
  fmvNum: number;       // numeric in $M for bar scaling
  resale: string;
  newbuildPct: number;  // 0–100 — FMV / Newbuild
  /* Financial */
  loan: string;
  ltv: number;          // %
  ltvSafe: boolean;     // <60% = green, else orange
  tce: string;
  /* Environmental */
  cii: EnvScore;
  co2: string;
  eexi: "Compliant" | "Conditional" | "Non-Compliant";
};

const VESSEL_QUICKLOOK: Record<string, VesselQuicklook> = {
  "MV Pacific Star":     { type: "Panamax Bulk",      tag: "BULK",   tagColor: "bg-primary/12 text-primary",                 imo: "9623148", yearBuilt: 2016, dwt: 82000,  classification: "DNV",     fmv: "$28.5M", fmvNum: 28.5, resale: "$24.2M", newbuildPct: 75, loan: "$18.5M", ltv: 65, ltvSafe: false, tce: "$18,200/d", cii: "A", co2: "7.2 g/t·nm",  eexi: "Compliant" },
  "MV Baltic Crown":     { type: "Supramax Bulk",     tag: "BULK",   tagColor: "bg-primary/12 text-primary",                 imo: "9544210", yearBuilt: 2010, dwt: 55700,  classification: "BV",      fmv: "$16.8M", fmvNum: 16.8, resale: "$13.5M", newbuildPct: 54, loan: "$9.8M",  ltv: 58, ltvSafe: true,  tce: "$13,400/d", cii: "C", co2: "9.8 g/t·nm",  eexi: "Conditional" },
  "MV Cape Fortuna":     { type: "Capesize Bulk",     tag: "BULK",   tagColor: "bg-primary/12 text-primary",                 imo: "9831044", yearBuilt: 2019, dwt: 181000, classification: "ABS",     fmv: "$54.2M", fmvNum: 54.2, resale: "$48.0M", newbuildPct: 85, loan: "$34.0M", ltv: 63, ltvSafe: false, tce: "$24,500/d", cii: "A", co2: "6.9 g/t·nm",  eexi: "Compliant" },
  "MV Horizon Bay":      { type: "Kamsarmax Bulk",    tag: "BULK",   tagColor: "bg-primary/12 text-primary",                 imo: "9712045", yearBuilt: 2017, dwt: 82400,  classification: "Lloyd's", fmv: "$31.0M", fmvNum: 31.0, resale: "$27.0M", newbuildPct: 81, loan: "$19.5M", ltv: 63, ltvSafe: false, tce: "$17,800/d", cii: "B", co2: "8.1 g/t·nm",  eexi: "Compliant" },
  "MT Helios Trader":    { type: "Suezmax Tanker",    tag: "TANKER", tagColor: "bg-signal-orange/15 text-signal-orange",     imo: "9712305", yearBuilt: 2014, dwt: 158400, classification: "Lloyd's", fmv: "$62.0M", fmvNum: 62.0, resale: "$52.1M", newbuildPct: 76, loan: "$38.0M", ltv: 61, ltvSafe: false, tce: "$32,100/d", cii: "B", co2: "8.0 g/t·nm",  eexi: "Compliant" },
  "MT Nordic Eagle":     { type: "VLCC Tanker",       tag: "TANKER", tagColor: "bg-signal-orange/15 text-signal-orange",     imo: "9388221", yearBuilt: 2008, dwt: 299990, classification: "ABS",     fmv: "$38.0M", fmvNum: 38.0, resale: "$30.0M", newbuildPct: 32, loan: "$20.0M", ltv: 53, ltvSafe: true,  tce: "$19,500/d", cii: "D", co2: "11.2 g/t·nm", eexi: "Non-Compliant" },
  "MT Aegean Wind":      { type: "Aframax Tanker",    tag: "TANKER", tagColor: "bg-signal-orange/15 text-signal-orange",     imo: "9455612", yearBuilt: 2014, dwt: 115000, classification: "Lloyd's", fmv: "$32.0M", fmvNum: 32.0, resale: "$26.5M", newbuildPct: 57, loan: "$22.1M", ltv: 69, ltvSafe: false, tce: "$22,800/d", cii: "B", co2: "8.4 g/t·nm",  eexi: "Compliant" },
  "LNG Adriatic Pearl":  { type: "TFDE LNG Carrier",  tag: "LNG",    tagColor: "bg-accent/15 text-accent",                   imo: "9745910", yearBuilt: 2021, dwt: 145000, classification: "DNV",     fmv: "$185.0M", fmvNum: 185.0, resale: "$172.0M", newbuildPct: 78, loan: "$118.0M", ltv: 64, ltvSafe: false, tce: "$92,000/d", cii: "A", co2: "5.4 g/t·nm",  eexi: "Compliant" },
  "LNG Pioneer":         { type: "TFDE LNG Carrier",  tag: "LNG",    tagColor: "bg-accent/15 text-accent",                   imo: "9567890", yearBuilt: 2022, dwt: 145000, classification: "DNV",     fmv: "$192.0M", fmvNum: 192.0, resale: "$178.0M", newbuildPct: 81, loan: "$120.0M", ltv: 63, ltvSafe: false, tce: "$94,500/d", cii: "A", co2: "5.2 g/t·nm",  eexi: "Compliant" },
  "MT Olympia":          { type: "VLGC",              tag: "GAS",    tagColor: "bg-accent/15 text-accent",                   imo: "9412300", yearBuilt: 2009, dwt: 84000,  classification: "BV",      fmv: "$84.0M",  fmvNum: 84.0,  resale: "$72.0M",  newbuildPct: 70, loan: "$48.0M",  ltv: 57, ltvSafe: true,  tce: "$54,000/d", cii: "C", co2: "9.4 g/t·nm",  eexi: "Conditional" },
  "MT Black Sea":        { type: "VLGC",              tag: "GAS",    tagColor: "bg-accent/15 text-accent",                   imo: "9430812", yearBuilt: 2010, dwt: 84000,  classification: "BV",      fmv: "$78.0M",  fmvNum: 78.0,  resale: "$66.0M",  newbuildPct: 68, loan: "$45.0M",  ltv: 58, ltvSafe: true,  tce: "$52,000/d", cii: "C", co2: "9.6 g/t·nm",  eexi: "Conditional" },
  "MV Sea Breeze":       { type: "Panamax Bulk",      tag: "BULK",   tagColor: "bg-primary/12 text-primary",                 imo: "9450112", yearBuilt: 2012, dwt: 76800,  classification: "BV",      fmv: "$18.2M", fmvNum: 18.2, resale: "$14.8M", newbuildPct: 48, loan: "$10.4M", ltv: 57, ltvSafe: true,  tce: "$14,200/d", cii: "C", co2: "9.6 g/t·nm",  eexi: "Conditional" },
  "MV Atlantic Pioneer": { type: "Aframax Tanker",    tag: "TANKER", tagColor: "bg-signal-orange/15 text-signal-orange",     imo: "9617832", yearBuilt: 2009, dwt: 158000, classification: "ABS",     fmv: "$26.4M", fmvNum: 26.4, resale: "$22.0M", newbuildPct: 47, loan: "$15.2M", ltv: 58, ltvSafe: true,  tce: "$21,400/d", cii: "D", co2: "10.6 g/t·nm", eexi: "Non-Compliant" },
  "MT Coral Sea":        { type: "MR Tanker",         tag: "TANKER", tagColor: "bg-signal-orange/15 text-signal-orange",     imo: "9622914", yearBuilt: 2018, dwt: 50000,  classification: "DNV",     fmv: "$22.4M", fmvNum: 22.4, resale: "$18.4M", newbuildPct: 53, loan: "$13.8M", ltv: 62, ltvSafe: false, tce: "$19,200/d", cii: "B", co2: "8.2 g/t·nm",  eexi: "Compliant" },
  "MV Star Voyager":     { type: "Post-Panamax Cont.", tag: "CONT",  tagColor: "bg-signal-purple/15 text-signal-purple",     imo: "9726810", yearBuilt: 2018, dwt: 86000,  classification: "Lloyd's", fmv: "$84.5M", fmvNum: 84.5, resale: "$72.0M", newbuildPct: 64, loan: "$52.0M", ltv: 62, ltvSafe: false, tce: "$28,400/d", cii: "B", co2: "8.6 g/t·nm",  eexi: "Compliant" },
  "MV Challenger":       { type: "Post-Panamax Cont.", tag: "CONT",  tagColor: "bg-signal-purple/15 text-signal-purple",     imo: "9701244", yearBuilt: 2017, dwt: 86000,  classification: "Lloyd's", fmv: "$78.0M", fmvNum: 78.0, resale: "$66.0M", newbuildPct: 60, loan: "$48.0M", ltv: 62, ltvSafe: false, tce: "$26,800/d", cii: "B", co2: "8.8 g/t·nm",  eexi: "Compliant" },
};

function shortDate(s: string): string {
  // e.g. "10 Mar 2026" → "10 Mar"
  return s.split(" ").slice(0, 2).join(" ");
}

function ProjKpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded border bg-muted/30 px-4 py-3">
      <div className="font-display text-[20px] font-extrabold leading-tight text-foreground">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const cls: Record<Project["status"], string> = {
    Active:   "bg-signal-green/15 text-signal-green",
    Complete: "bg-signal-purple/15 text-signal-purple",
    Draft:    "bg-muted text-muted-foreground",
    Archived: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        cls[status] ?? cls.Draft,
      )}
    >
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category: Project["category"] }) {
  const cls: Record<Project["category"], string> = {
    Investment:  "bg-primary/15 text-primary",
    Performance: "bg-signal-orange/15 text-signal-orange",
    Newbuild:    "bg-signal-purple/15 text-signal-purple",
    Refinance:   "bg-accent/15 text-accent",
    ESG:         "bg-signal-green/15 text-signal-green",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        cls[category] ?? "bg-muted text-muted-foreground",
      )}
    >
      {category}
    </span>
  );
}

function ScenarioPill({
  kind,
  label,
  active = false,
}: {
  kind: "cashflow" | "loan";
  label: string;
  active?: boolean;
}) {
  const Icon = kind === "cashflow" ? Calculator : LineChartIcon;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded border px-3 py-2 text-[12px] transition-colors",
        active
          ? "border-primary/30 bg-primary/5 text-primary"
          : "border-border bg-muted/30 text-foreground hover:border-primary/30 hover:text-primary",
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span className="flex-1 truncate font-semibold">{label}</span>
      {active ? (
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
          Active
        </span>
      ) : null}
    </div>
  );
}

/**
 * ProjectCompareTable — full project-scoped comparison matrix mirroring
 * the prototype's pd-vessel-compare table. Renders 4 sections:
 *
 *   1. Vessel Specifications — Type, IMO Number, Year Built, DWT, Classification
 *   2. Valuations            — Fair Market Value, FMV (visual bar), Resale,
 *                               FMV vs Newbuild (% chip)
 *   3. Financial             — Loan Balance, LTV Ratio (visual bar), TCE YTD
 *   4. Environmental         — CII Rating, CO₂ Intensity, EEXI Status (chip)
 */
type ProjectVessel = {
  name: string;
  type: string;
  tag: string;
  tagColor: string;
  fmv: string;
  cii: EnvScore;
};

function ProjectCompareTable({ vessels }: { vessels: ProjectVessel[] }) {
  const colSpan = vessels.length + 1;
  const data = vessels.map((v) => VESSEL_QUICKLOOK[v.name]).filter(Boolean) as VesselQuicklook[];
  const maxFmv = data.length > 0 ? Math.max(...data.map((d) => d.fmvNum)) : 1;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
        <div>
          <h3 className="text-[14px] font-bold">Vessel Comparison</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Vessels in this project · side-by-side analysis
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-2">
          <Download className="size-3.5" />
          Export
        </Button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="min-w-[180px] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
                Metric
              </th>
              {vessels.map((v) => (
                <th
                  key={v.name}
                  className="min-w-[160px] px-4 py-3 text-left text-[12px] font-bold"
                >
                  {v.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Specifications */}
            <ProjectCompareSectionHeader span={colSpan}>
              Vessel Specifications
            </ProjectCompareSectionHeader>
            <ProjectCompareRow
              label="Vessel Type"
              cells={data.map((d) => d.type)}
            />
            <ProjectCompareRow
              label="IMO Number"
              cells={data.map((d) => (
                <span key={d.imo} className="font-mono text-[11px] tabular-nums">
                  {d.imo}
                </span>
              ))}
            />
            <ProjectCompareRow
              label="Year Built"
              cells={data.map((d) => String(d.yearBuilt))}
            />
            <ProjectCompareRow
              label="DWT"
              cells={data.map((d) => (
                <span key={d.imo} className="font-semibold tabular-nums">
                  {d.dwt.toLocaleString()}
                </span>
              ))}
            />
            <ProjectCompareRow
              label="Classification"
              cells={data.map((d) => d.classification)}
            />

            {/* Valuations */}
            <ProjectCompareSectionHeader span={colSpan}>
              Valuations
            </ProjectCompareSectionHeader>
            <ProjectCompareRow
              label="Fair Market Value"
              cells={data.map((d) => (
                <span key={d.imo} className="font-semibold tabular-nums">
                  {d.fmv}
                </span>
              ))}
            />
            <ProjectCompareRow
              label="FMV (visual)"
              cells={data.map((d) => (
                <CompareBar
                  key={d.imo}
                  pct={(d.fmvNum / maxFmv) * 100}
                  label={d.fmv}
                  color="bg-primary"
                />
              ))}
            />
            <ProjectCompareRow
              label="Resale Value"
              cells={data.map((d) => d.resale)}
            />
            <ProjectCompareRow
              label="FMV vs Newbuild"
              cells={data.map((d) => (
                <span
                  key={d.imo}
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                    d.newbuildPct >= 80
                      ? "bg-signal-green/15 text-signal-green"
                      : "bg-signal-orange/15 text-signal-orange",
                  )}
                >
                  {d.newbuildPct}% NB
                </span>
              ))}
            />

            {/* Financial */}
            <ProjectCompareSectionHeader span={colSpan}>
              Financial
            </ProjectCompareSectionHeader>
            <ProjectCompareRow
              label="Loan Balance"
              cells={data.map((d) => d.loan)}
            />
            <ProjectCompareRow
              label="LTV Ratio"
              cells={data.map((d) => (
                <CompareBar
                  key={d.imo}
                  pct={d.ltv}
                  label={`${d.ltv}%`}
                  color={d.ltvSafe ? "bg-signal-green" : "bg-signal-orange"}
                />
              ))}
            />
            <ProjectCompareRow
              label="TCE YTD"
              cells={data.map((d) => d.tce)}
            />

            {/* Environmental */}
            <ProjectCompareSectionHeader span={colSpan}>
              Environmental
            </ProjectCompareSectionHeader>
            <ProjectCompareRow
              label="CII Rating"
              cells={data.map((d) => <EnvScoreBadge key={d.imo} value={d.cii} />)}
            />
            <ProjectCompareRow
              label="CO₂ Intensity"
              cells={data.map((d) => d.co2)}
            />
            <ProjectCompareRow
              label="EEXI Status"
              cells={data.map((d) => (
                <span
                  key={d.imo}
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                    d.eexi === "Compliant" && "bg-signal-green/15 text-signal-green",
                    d.eexi === "Conditional" && "bg-signal-orange/15 text-signal-orange",
                    d.eexi === "Non-Compliant" && "bg-signal-magenta/15 text-signal-magenta",
                  )}
                >
                  {d.eexi}
                </span>
              ))}
            />
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ProjectCompareSectionHeader({
  span,
  children,
}: {
  span: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={span}
        className="bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.5px] text-muted-foreground"
      >
        {children}
      </td>
    </tr>
  );
}

function ProjectCompareRow({
  label,
  cells,
}: {
  label: string;
  cells: React.ReactNode[];
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-4 py-2.5 text-muted-foreground">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-4 py-2.5 tabular-nums">
          {c}
        </td>
      ))}
    </tr>
  );
}

/* --------------------------------------------------------------------------
 * Tab — Vessel Compare
 * -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
 * Vessel Compare — three cards mirroring html/projects.html PANEL 2:
 *   1. Selector card  — 4 vessel dropdowns + Compare button
 *   2. Comparison table — Specifications / Valuations / Financial /
 *                          Environmental sections, with FMV + LTV bars
 *   3. Financial Analysis — Cashflow Compare / Loan Oracle Compare sub-tabs
 * -------------------------------------------------------------------------- */

const ALL_COMPARE_VESSELS = [
  "MV Pacific Star",
  "MT Helios Trader",
  "MV Baltic Crown",
  "MV Cape Fortuna",
  "MT Nordic Eagle",
  "MT Aegean Wind",
  "LNG Pioneer",
  "MV Atlantic Star",
] as const;

type CompareVessel = {
  name: string;
  imo: string;
  /* Specs */
  type: string;
  yearBuilt: number;
  dwt: number;
  flag: string;
  classification: string;
  specialSurvey: string;
  /* Valuations */
  fmv: number;       // $M
  resale: number;
  newbuild: number;
  /* Financial */
  loan: number;
  ltv: number;       // %
  ltvSafe: boolean;  // <60% → green, else orange
  debtService: number;
  dscr: number;
  dscrTone: "pos" | "warn";
  tce: string;
  /* Environmental */
  cii: EnvScore;
  envScore: EnvScore;
  co2: string;
  eexi: "Compliant" | "Conditional" | "Non-Compliant";
};

const VESSEL_COMPARE_DATA: CompareVessel[] = [
  {
    name: "MV Pacific Star",   imo: "9623148",
    type: "Panamax Bulk",  yearBuilt: 2016, dwt: 82000,  flag: "Liberia",          classification: "DNV",     specialSurvey: "Mar 2026",
    fmv: 28.5, resale: 24.2, newbuild: 38.0,
    loan: 18.5, ltv: 65, ltvSafe: false, debtService: 2.4, dscr: 1.84, dscrTone: "pos",  tce: "$18,200/d",
    cii: "A", envScore: "A", co2: "7.2 g/t·nm",  eexi: "Compliant",
  },
  {
    name: "MV Baltic Crown",   imo: "9544210",
    type: "Supramax Bulk", yearBuilt: 2010, dwt: 55700,  flag: "Panama",           classification: "BV",      specialSurvey: "Oct 2025",
    fmv: 16.8, resale: 13.5, newbuild: 31.0,
    loan: 9.8, ltv: 58, ltvSafe: true,  debtService: 1.5, dscr: 1.62, dscrTone: "pos",  tce: "$13,400/d",
    cii: "C", envScore: "C", co2: "9.8 g/t·nm",  eexi: "Conditional",
  },
  {
    name: "MT Aegean Wind",    imo: "9455612",
    type: "Aframax Tanker", yearBuilt: 2014, dwt: 115000, flag: "Marshall Islands", classification: "Lloyd's", specialSurvey: "Nov 2024",
    fmv: 32.0, resale: 26.5, newbuild: 56.0,
    loan: 22.1, ltv: 69, ltvSafe: false, debtService: 2.9, dscr: 1.91, dscrTone: "pos",  tce: "$22,800/d",
    cii: "B", envScore: "B", co2: "8.4 g/t·nm",  eexi: "Compliant",
  },
  {
    name: "MT Nordic Eagle",   imo: "9388221",
    type: "VLCC Tanker",   yearBuilt: 2008, dwt: 299990, flag: "Bahamas",          classification: "ABS",     specialSurvey: "Aug 2023",
    fmv: 38.0, resale: 30.0, newbuild: 118.0,
    loan: 20.0, ltv: 53, ltvSafe: true,  debtService: 2.6, dscr: 1.43, dscrTone: "warn", tce: "$19,500/d",
    cii: "D", envScore: "D", co2: "11.2 g/t·nm", eexi: "Non-Compliant",
  },
];

function VesselComparePanel() {
  const maxFmv = Math.max(...VESSEL_COMPARE_DATA.map((v) => v.fmv));
  const maxNb  = Math.max(...VESSEL_COMPARE_DATA.map((v) => v.newbuild));
  const [selected, setSelected] = React.useState(
    VESSEL_COMPARE_DATA.map((v) => v.name),
  );
  const [faTab, setFaTab] = React.useState<"cf" | "lo">("cf");

  return (
    <>
      {/* Card 1 — Vessel selectors */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
          <div>
            <h2 className="text-[14px] font-bold">Vessel Comparison</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Compare up to 4 vessels side by side across valuations, financials and environmental metrics
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            Export
          </Button>
        </CardHeader>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
                Vessel {i + 1}
              </label>
              <select
                value={selected[i] ?? ""}
                onChange={(e) =>
                  setSelected((cur) => {
                    const next = [...cur];
                    next[i] = e.target.value;
                    return next;
                  })
                }
                className="h-8 rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {i === 3 ? <option value="">— None —</option> : null}
                {ALL_COMPARE_VESSELS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex items-end">
            <Button>Compare</Button>
          </div>
        </div>
      </Card>

      {/* Card 2 — Comparison table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="min-w-[180px] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Metric
                </th>
                {VESSEL_COMPARE_DATA.map((v) => (
                  <th
                    key={v.imo}
                    className="min-w-[160px] px-4 py-3 text-left text-[12px] font-bold"
                  >
                    {v.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareSectionHeader>Vessel Specifications</CompareSectionHeader>
              <CompareRow label="Vessel Type" cells={VESSEL_COMPARE_DATA.map((v) => v.type)} />
              <CompareRow
                label="IMO Number"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <span key={v.imo} className="font-mono text-[11px] tabular-nums">
                    {v.imo}
                  </span>
                ))}
              />
              <CompareRow label="Year Built" cells={VESSEL_COMPARE_DATA.map((v) => String(v.yearBuilt))} />
              <CompareRow
                label="DWT"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <span key={v.imo} className="font-semibold tabular-nums">
                    {v.dwt.toLocaleString()}
                  </span>
                ))}
              />
              <CompareRow label="Flag State" cells={VESSEL_COMPARE_DATA.map((v) => v.flag)} />
              <CompareRow label="Classification" cells={VESSEL_COMPARE_DATA.map((v) => v.classification)} />
              <CompareRow label="Special Survey" cells={VESSEL_COMPARE_DATA.map((v) => v.specialSurvey)} />

              <CompareSectionHeader>Valuations</CompareSectionHeader>
              <CompareRow
                label="Fair Market Value"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <span key={v.imo} className="font-semibold tabular-nums">
                    ${v.fmv.toFixed(1)}M
                  </span>
                ))}
              />
              <CompareRow
                label="FMV (visual)"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <CompareBar
                    key={v.imo}
                    pct={(v.fmv / maxFmv) * 100}
                    label={`$${v.fmv.toFixed(1)}M`}
                    color="bg-primary"
                  />
                ))}
              />
              <CompareRow
                label="Resale Value"
                cells={VESSEL_COMPARE_DATA.map((v) => `$${v.resale.toFixed(1)}M`)}
              />
              <CompareRow
                label="Newbuild Value"
                cells={VESSEL_COMPARE_DATA.map((v) => `$${v.newbuild.toFixed(1)}M`)}
              />
              <CompareRow
                label="FMV vs Newbuild"
                cells={VESSEL_COMPARE_DATA.map((v) => {
                  const pct = Math.round((v.fmv / v.newbuild) * 100);
                  return (
                    <span
                      key={v.imo}
                      className="inline-flex items-center rounded-full bg-signal-orange/15 px-2 py-0.5 text-[11px] font-bold text-signal-orange"
                    >
                      {pct}% NB
                    </span>
                  );
                })}
              />

              <CompareSectionHeader>Financial</CompareSectionHeader>
              <CompareRow
                label="Loan Balance"
                cells={VESSEL_COMPARE_DATA.map((v) => `$${v.loan.toFixed(1)}M`)}
              />
              <CompareRow
                label="LTV Ratio"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <CompareBar
                    key={v.imo}
                    pct={v.ltv}
                    label={`${v.ltv}%`}
                    color={v.ltvSafe ? "bg-signal-green" : "bg-signal-orange"}
                  />
                ))}
              />
              <CompareRow
                label="Annual Debt Service"
                cells={VESSEL_COMPARE_DATA.map((v) => `$${v.debtService.toFixed(1)}M`)}
              />
              <CompareRow
                label="DSCR"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <span
                    key={v.imo}
                    className={cn(
                      "tabular-nums",
                      v.dscrTone === "pos"
                        ? "text-signal-green"
                        : "text-signal-orange",
                    )}
                  >
                    {v.dscr.toFixed(2)}×
                  </span>
                ))}
              />
              <CompareRow label="TCE YTD" cells={VESSEL_COMPARE_DATA.map((v) => v.tce)} />

              <CompareSectionHeader>Environmental</CompareSectionHeader>
              <CompareRow
                label="CII Rating"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <EnvScoreBadge key={v.imo} value={v.cii} />
                ))}
              />
              <CompareRow
                label="Environmental Score"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <EnvScoreBadge key={v.imo} value={v.envScore} />
                ))}
              />
              <CompareRow
                label="CO₂ Intensity"
                cells={VESSEL_COMPARE_DATA.map((v) => v.co2)}
              />
              <CompareRow
                label="EEXI Status"
                cells={VESSEL_COMPARE_DATA.map((v) => (
                  <span
                    key={v.imo}
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                      v.eexi === "Compliant" && "bg-signal-green/15 text-signal-green",
                      v.eexi === "Conditional" && "bg-signal-orange/15 text-signal-orange",
                      v.eexi === "Non-Compliant" && "bg-signal-magenta/15 text-signal-magenta",
                    )}
                  >
                    {v.eexi}
                  </span>
                ))}
              />
            </tbody>
          </table>
        </div>
      </Card>

      {/* Card 3 — Financial Analysis with sub-tabs */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">Financial Analysis</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Compare cashflow scenarios or loan oracle structures for the selected vessel
          </p>
        </CardHeader>
        <div className="border-b px-4">
          <div className="flex gap-4">
            {(["cf", "lo"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFaTab(id)}
                className={cn(
                  "border-b-2 py-2.5 text-[12px] font-semibold transition-colors",
                  faTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-[#A0ABB2] hover:text-foreground",
                )}
              >
                {id === "cf" ? "Cashflow Compare" : "Loan Oracle Compare"}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 text-[12px] text-muted-foreground">
          {faTab === "cf" ? (
            <p>
              Cashflow comparison view — pick a vessel above and run scenario
              variants to see side-by-side TCE, OPEX, and NPV trajectories.
            </p>
          ) : (
            <p>
              Loan Oracle comparison view — compare facility structures
              (term, margin, LTV, covenants) for the selected vessel cohort.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}

function CompareSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td
        colSpan={VESSEL_COMPARE_DATA.length + 1}
        className="bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.5px] text-muted-foreground"
      >
        {children}
      </td>
    </tr>
  );
}

function CompareRow({
  label,
  cells,
}: {
  label: string;
  cells: React.ReactNode[];
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-4 py-2.5 text-muted-foreground">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-4 py-2.5 tabular-nums">
          {c}
        </td>
      ))}
    </tr>
  );
}

function CompareBar({
  pct,
  label,
  color,
}: {
  pct: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded bg-muted">
        <div
          className={cn("h-full rounded", color)}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <span className="min-w-[40px] text-[11px] tabular-nums text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

/**
 * ProjectTab — mirrors the prototype's `.pbt`:
 *   - 8px / 14px / 9px padding (px-3.5 py-2)
 *   - 12px / 600 weight / muted text
 *   - active state: white bg + 2px primary top accent strip + 3-sided border
 *     that connects visually with the content panel below
 *   - close (×) hidden until hover or active, with magenta hover state
 */
function ProjectTab({
  label,
  badge,
  active = false,
  truncate = false,
  onClick,
  onClose,
}: {
  label: string;
  badge?: number;
  active?: boolean;
  truncate?: boolean;
  onClick: () => void;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative -mb-px flex shrink-0 items-center gap-[7px] rounded-t-md px-3.5 pb-[9px] pt-2 text-[12px] font-semibold transition-colors",
        active
          ? "border border-b-0 border-border bg-card text-foreground"
          : "border border-transparent text-muted-foreground hover:bg-white/60 hover:text-foreground",
      )}
    >
      {/* Top accent strip — 2px primary, only when active */}
      {active ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-md bg-primary"
        />
      ) : null}

      <button type="button" onClick={onClick} className="flex items-center gap-[7px]">
        <FolderOpen className={cn("size-3.5", active ? "text-primary" : "text-muted-foreground")} />
        <span className={cn(truncate && "max-w-[200px] truncate")}>{label}</span>
        {badge !== undefined ? (
          <span
            className={cn(
              "rounded-full px-[7px] text-[11px] font-bold leading-[17px] tabular-nums",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-black/[0.06] text-muted-foreground",
            )}
          >
            {badge}
          </span>
        ) : null}
      </button>
      {onClose ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${label}`}
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground transition-all hover:bg-signal-magenta/12 hover:text-signal-magenta",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

function ViewToggle() {
  return (
    <div className="flex overflow-hidden rounded-md border">
      <button
        type="button"
        title="List view"
        className="px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <List className="size-3.5" />
      </button>
      <button
        type="button"
        title="Gallery view"
        aria-pressed
        className="border-l bg-primary px-2.5 py-1.5 text-primary-foreground"
      >
        <LayoutGrid className="size-3.5" />
      </button>
    </div>
  );
}
