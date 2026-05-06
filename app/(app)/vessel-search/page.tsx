"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Bookmark,
  Check,
  ChevronDown,
  DollarSign,
  Download,
  Edit3,
  Eye,
  FileText,
  FolderPlus,
  Home,
  Info,
  LayoutGrid,
  List,
  MoreVertical,
  Play,
  Search,
  Trash2,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { TablePagination } from "@/components/app/table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { AppCardHeader } from "@/components/app/card-header";
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
 * Mock data
 * -------------------------------------------------------------------------- */

type Vessel = {
  imo: string;
  name: string;
  type: VesselType;
  flag: string;
  year: number;
  dwt: number;
  envScore: EnvScore;
  fmv: string;
  forSale: boolean;
  status: "Active" | "Laid Up" | "Demolished";
};

const VESSELS: Vessel[] = [
  { imo: "9876543", name: "MV Pacific Star",     type: "Bulk Carrier", flag: "Panama",        year: 2018, dwt: 82400,  envScore: "A", fmv: "$28.5M", forSale: false, status: "Active" },
  { imo: "9345671", name: "MT Aegean Wind",      type: "Tanker",       flag: "Marshall Is.",  year: 2015, dwt: 115200, envScore: "B", fmv: "$41.2M", forSale: true,  status: "Active" },
  { imo: "9512098", name: "MV Northern Star",    type: "Bulk Carrier", flag: "Liberia",       year: 2017, dwt: 180000, envScore: "B", fmv: "$98.4M", forSale: false, status: "Active" },
  { imo: "9617832", name: "MV Atlantic Pioneer", type: "Tanker",       flag: "Greece",        year: 2009, dwt: 158000, envScore: "D", fmv: "$26.4M", forSale: true,  status: "Active" },
  { imo: "9742158", name: "MV Nordic Eagle",     type: "Tanker",       flag: "Norway",        year: 2014, dwt: 105000, envScore: "B", fmv: "$42.8M", forSale: false, status: "Active" },
  { imo: "9888420", name: "MT Cosmos Trader",    type: "Tanker",       flag: "Singapore",     year: 2020, dwt: 49500,  envScore: "A", fmv: "$36.9M", forSale: false, status: "Active" },
  { imo: "9450112", name: "MV Sea Breeze",       type: "Bulk Carrier", flag: "Cyprus",        year: 2012, dwt: 76800,  envScore: "C", fmv: "$18.2M", forSale: true,  status: "Laid Up" },
  { imo: "9905611", name: "MV Coral Bay",        type: "Bulk Carrier", flag: "Malta",         year: 2021, dwt: 62100,  envScore: "A", fmv: "$32.4M", forSale: false, status: "Active" },
];

type VesselTypeFilter = { label: VesselType; count: number; checked?: boolean };
const VESSEL_TYPES: VesselTypeFilter[] = [
  { label: "Bulk Carrier",      count: 1124, checked: true },
  { label: "Tanker",            count: 892,  checked: true },
  { label: "Container",         count: 345 },
  { label: "Gas Carrier",       count: 188 },
  { label: "LNG",               count: 97 },
  { label: "LPG",               count: 74 },
  { label: "Chemical Tanker",   count: 63 },
  { label: "Car Carrier",       count: 41 },
  { label: "General Cargo",     count: 23 },
];

const FLAGS = [
  { label: "Panama",       count: 412 },
  { label: "Marshall Is.", count: 388 },
  { label: "Liberia",      count: 295 },
  { label: "Singapore",    count: 184 },
  { label: "Greece",       count: 167 },
  { label: "Cyprus",       count: 144 },
  { label: "Malta",        count: 121 },
  { label: "Norway",       count: 95 },
];

const CLASSIFICATION_SOCIETIES = [
  { label: "DNV",              count: 712, checked: true },
  { label: "Lloyd's Register", count: 545 },
  { label: "Bureau Veritas",   count: 488 },
  { label: "ABS",              count: 321 },
  { label: "ClassNK",          count: 214 },
  { label: "RINA",             count: 98 },
];

const ECO_FEATURES = [
  { label: "Scrubber Fitted (EGCS)", count: 498 },
  { label: "BWTS Installed",         count: 1241 },
  { label: "Eco Design Hull",        count: 634 },
  { label: "Air Lubrication System", count: 187 },
  { label: "Shore Power Ready",      count: 93 },
  { label: "Solar PV Installed",     count: 37 },
];

const COMMERCIAL_STATUS = [
  { label: "Listed for Sale",            count: 142 },
  { label: "Under Offer / In Negotiation", count: 31 },
  { label: "On Time Charter",            count: 984 },
  { label: "Open (Spot Available)",      count: 213 },
  { label: "In Dry Dock",                count: 89 },
];

const DRY_DOCK_BUCKETS = [
  "Within 3 months",
  "3–6 months",
  "6–12 months",
  "1–2 years",
  "2+ years",
] as const;

type SavedSearch = {
  id: string;
  name: string;
  filters: { label: string; tone?: "blue" | "green" | "orange" }[];
  results: number;
  date: string;
};

const SAVED_SEARCHES: SavedSearch[] = [
  {
    id: "ss-1",
    name: "Handysize Bulk 2015+",
    filters: [
      { label: "Bulk", tone: "blue" },
      { label: "DWT: 25–45K", tone: "blue" },
      { label: "Year: 2015+", tone: "blue" },
    ],
    results: 284,
    date: "Today",
  },
  {
    id: "ss-2",
    name: "Eco Tankers Flag Panama",
    filters: [
      { label: "Tanker", tone: "blue" },
      { label: "Panama", tone: "blue" },
      { label: "Env: A/B", tone: "green" },
    ],
    results: 147,
    date: "20 Mar 2026",
  },
  {
    id: "ss-3",
    name: "Capesize For Sale",
    filters: [
      { label: "Bulk", tone: "blue" },
      { label: "DWT: 150K+", tone: "blue" },
      { label: "For Sale", tone: "orange" },
    ],
    results: 23,
    date: "18 Mar 2026",
  },
];

type WatchVessel = {
  imo: string;
  name: string;
  type: VesselType;
  year: number;
  dwt: number;
  fmv: string;
  fmv30dDelta: string;
  fmv30dPositive: boolean;
  status: "Active" | "Laid Up" | "Demolished";
  added: string;
  alertActive: boolean;
};

const WATCHLIST: WatchVessel[] = [
  { imo: "9876543", name: "MV Pacific Star",     type: "Bulk Carrier", year: 2018, dwt: 82400,  fmv: "$28.5M", fmv30dDelta: "+$0.8M", fmv30dPositive: true,  status: "Active", added: "2026-02-10", alertActive: true },
  { imo: "9345671", name: "MT Aegean Wind",      type: "Tanker",       year: 2015, dwt: 115200, fmv: "$41.2M", fmv30dDelta: "−$1.2M", fmv30dPositive: false, status: "Active", added: "2026-01-15", alertActive: true },
  { imo: "9512098", name: "MV Northern Star",    type: "Bulk Carrier", year: 2017, dwt: 180000, fmv: "$98.4M", fmv30dDelta: "+$3.4M", fmv30dPositive: true,  status: "Active", added: "2025-12-08", alertActive: false },
  { imo: "9617832", name: "MV Atlantic Pioneer", type: "Tanker",       year: 2009, dwt: 158000, fmv: "$26.4M", fmv30dDelta: "−$0.4M", fmv30dPositive: false, status: "Active", added: "2026-03-02", alertActive: true },
  { imo: "9742158", name: "MV Nordic Eagle",     type: "Tanker",       year: 2014, dwt: 105000, fmv: "$42.8M", fmv30dDelta: "+$0.6M", fmv30dPositive: true,  status: "Active", added: "2026-02-20", alertActive: true },
  { imo: "9888420", name: "MT Cosmos Trader",    type: "Tanker",       year: 2020, dwt: 49500,  fmv: "$36.9M", fmv30dDelta: "+$1.0M", fmv30dPositive: true,  status: "Active", added: "2026-03-15", alertActive: false },
  { imo: "9450112", name: "MV Sea Breeze",       type: "Bulk Carrier", year: 2012, dwt: 76800,  fmv: "$18.2M", fmv30dDelta: "−$0.6M", fmv30dPositive: false, status: "Laid Up", added: "2025-11-30", alertActive: false },
  { imo: "9905611", name: "MV Coral Bay",        type: "Bulk Carrier", year: 2021, dwt: 62100,  fmv: "$32.4M", fmv30dDelta: "+$1.4M", fmv30dPositive: true,  status: "Active", added: "2026-03-01", alertActive: true },
];

const TABS = [
  {
    id: "search",
    label: "Search",
    title: "Vessel Search",
    subtitle: "Apply multiple filters to search across the global vessel database",
  },
  {
    id: "saved",
    label: "Saved Searches",
    badge: SAVED_SEARCHES.length,
    title: "Saved Searches",
    subtitle: "Quick-access filters and recent queries — click play to re-apply",
  },
  {
    id: "watch",
    label: "Watchlist",
    badge: WATCHLIST.length,
    title: "Watchlist",
    subtitle: "Vessels you are watching — FMV deltas and active alerts",
  },
] as const;

/* -------------------------------------------------------------------------- */

export default function VesselSearchPage() {
  const [active, setActive] = React.useState<(typeof TABS)[number]["id"]>("search");
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "Vessel Search" },
          ...(active !== "search" ? [{ label: activeTab.label }] : []),
        ]}
        title={activeTab.title}
        subtitle={activeTab.subtitle}
      />

      {/* Tab strip */}
      <div className="flex flex-shrink-0 items-end gap-0 overflow-x-auto border-b bg-card px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      {active === "search" ? <SearchPanel /> : null}
      {active === "saved" ? <SavedSearchesPanel /> : null}
      {active === "watch" ? <WatchlistPanel /> : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — Search
 * -------------------------------------------------------------------------- */

function SearchPanel() {
  const [hasSearched, setHasSearched] = React.useState(false);
  const [flagQuery, setFlagQuery] = React.useState("");
  // Selection state for the results table — IMO is the stable row id.
  const [selectedImos, setSelectedImos] = React.useState<Set<string>>(
    () => new Set(),
  );

  const visibleFlags = FLAGS.filter((f) =>
    f.label.toLowerCase().includes(flagQuery.toLowerCase()),
  );

  const allSelected =
    VESSELS.length > 0 && selectedImos.size === VESSELS.length;
  const someSelected =
    selectedImos.size > 0 && selectedImos.size < VESSELS.length;

  function toggleRow(imo: string) {
    setSelectedImos((prev) => {
      const next = new Set(prev);
      if (next.has(imo)) next.delete(imo);
      else next.add(imo);
      return next;
    });
  }

  function toggleAll() {
    setSelectedImos(allSelected ? new Set() : new Set(VESSELS.map((v) => v.imo)));
  }

  function clearSelection() {
    setSelectedImos(new Set());
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[420px_1fr]">
      {/* ── LEFT: filter panel — full-height white column with a single right
            border, mirroring the prototype's `.filter-panel`. The aside owns
            its own scroll, so the sticky action footer stays pinned. ──── */}
      <aside className="flex min-h-0 flex-col overflow-hidden border-r bg-card">
        {/* Header — flush with content, no border-b */}
        <div className="flex flex-shrink-0 items-center justify-between px-8 pt-6">
          <span className="text-[14px] font-bold">Filters</span>
          <button
            type="button"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Reset All
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 pt-2">
            <FilterGroup label="IMO / Vessel Name" defaultOpen>
              <FilterFieldLabel>Search</FilterFieldLabel>
              <input
                type="text"
                placeholder="Enter IMO number or vessel name"
                className="h-8 w-full rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FilterGroup>

            <FilterGroup label="Vessel Type" defaultOpen>
              <CheckboxList items={VESSEL_TYPES} />
            </FilterGroup>

            <FilterGroup label="Vessel Deadweight (DWT)" defaultOpen>
              <RangeInputs minLabel="Min DWT" maxLabel="Max DWT" minPlaceholder="0" maxPlaceholder="500,000" />
            </FilterGroup>

            <FilterGroup label="Year Built" defaultOpen>
              <RangeInputs minLabel="From Year" maxLabel="To Year" minPlaceholder="1990" maxPlaceholder="2026" />
            </FilterGroup>

            <FilterGroup label="Flag State" defaultOpen>
              <input
                type="text"
                value={flagQuery}
                onChange={(e) => setFlagQuery(e.target.value)}
                placeholder="Search flag states…"
                className="mb-2 h-8 w-full rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <CheckboxList items={visibleFlags} />
            </FilterGroup>

            <FilterGroup label="Classification Society" defaultOpen>
              <CheckboxList items={CLASSIFICATION_SOCIETIES} />
            </FilterGroup>

            <FilterGroup label="Environmental Score" defaultOpen>
              <EnvScoreChecks defaults={["A", "B"]} />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Select one or more grades to filter.
              </p>
            </FilterGroup>

            <FilterGroup label="FMV Range ($M)" defaultOpen>
              <RangeInputs minLabel="Min ($M)" maxLabel="Max ($M)" minPlaceholder="0" maxPlaceholder="500" />
            </FilterGroup>

            <FilterGroup label="Owner / Manager" defaultOpen>
              <FilterFieldLabel>Owner</FilterFieldLabel>
              <input
                type="text"
                placeholder="Company name or country…"
                className="mb-2 h-8 w-full rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <FilterFieldLabel>Technical Manager</FilterFieldLabel>
              <input
                type="text"
                placeholder="e.g. V.Ships, Columbia"
                className="mb-2 h-8 w-full rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <FilterFieldLabel>Operator / Charterer</FilterFieldLabel>
              <input
                type="text"
                placeholder="e.g. Cargill, Trafigura"
                className="h-8 w-full rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FilterGroup>

            <FilterGroup label="Eco & Compliance Features">
              <CheckboxList items={ECO_FEATURES} />
            </FilterGroup>

            <FilterGroup label="CII Rating (2024)">
              <EnvScoreChecks defaults={["A", "B"]} includeE />
              <p className="mt-2 text-[11px] text-muted-foreground">
                CII is the IMO Carbon Intensity Indicator. D/E ratings require corrective action plans.
              </p>
            </FilterGroup>

            <FilterGroup label="Commercial Status">
              <CheckboxList items={COMMERCIAL_STATUS} />
            </FilterGroup>

            <FilterGroup label="Dry Dock / Survey Due">
              <DrydockPills />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Filter by vessels approaching Special Survey or dry-dock windows.
              </p>
            </FilterGroup>
          </div>

        {/* Sticky footer */}
        <div className="flex flex-shrink-0 items-center gap-2 border-t bg-card px-8 py-4">
          <Button variant="outline" className="flex-1 gap-1.5">
            <Bookmark className="size-3.5" />
            Save Search
          </Button>
          <Button
            className="flex-1 gap-1.5"
            onClick={() => setHasSearched(true)}
          >
            <Search className="size-3.5" />
            Apply Filters
          </Button>
        </div>
      </aside>

      {/* ── RIGHT: results panel — gray bg, mirrors `.results-panel`. ── */}
      <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto bg-muted/30 p-8">
        {!hasSearched ? (
          <ResultsEmptyState />
        ) : (
          <>
            <ResultsToolbar
              selectedCount={selectedImos.size}
              onClearSelection={clearSelection}
            />

            <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="w-8 px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        className="cursor-pointer accent-primary"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={toggleAll}
                        title={allSelected ? "Deselect all" : "Select all"}
                      />
                    </th>
                    <th className="min-w-[180px] px-3 py-2 text-left">Vessel Name</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Flag</th>
                    <th className="px-3 py-2 text-right">Year</th>
                    <th className="px-3 py-2 text-right">DWT</th>
                    <th className="px-3 py-2 text-center">Env</th>
                    <th className="px-3 py-2 text-right">FMV</th>
                    <th className="px-3 py-2 text-left">For Sale</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {VESSELS.map((v) => {
                    const isSelected = selectedImos.has(v.imo);
                    return (
                    <tr
                      key={v.imo}
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/30",
                        isSelected && "bg-primary/[0.04]",
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          className="cursor-pointer accent-primary"
                          checked={isSelected}
                          onChange={() => toggleRow(v.imo)}
                          aria-label={`Select ${v.name}`}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/vessels/${v.imo}`}
                          className="block font-semibold text-foreground hover:text-primary"
                        >
                          {v.name}
                        </Link>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          IMO {v.imo}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <VesselTypeBadge value={v.type} />
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{v.flag}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{v.year}</td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                        {v.dwt.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <EnvScoreBadge value={v.envScore} />
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                        {v.fmv}
                      </td>
                      <td className="px-3 py-2.5">
                        {v.forSale ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-signal-green/15 px-2 py-0.5 text-[10px] font-bold text-signal-green">
                            <Check className="size-2.5" />
                            For Sale
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            v.status === "Active"
                              ? "bg-signal-green/10 text-signal-green"
                              : v.status === "Laid Up"
                                ? "bg-signal-orange/10 text-signal-orange"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <RowActionsMenu vessel={v} />
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={1}
              totalPages={1}
              totalRows={VESSELS.length}
              perPage={25}
              rowLabel="vessel"
            />
          </Card>
          </>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Search-panel helper components
 * -------------------------------------------------------------------------- */

function FilterFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
      {children}
    </div>
  );
}

function CheckboxList({
  items,
}: {
  items: { label: string; count: number; checked?: boolean }[];
}) {
  return (
    <ul className="space-y-1">
      {items.map((it) => (
        <li key={it.label}>
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[12px] hover:bg-muted">
            <input
              type="checkbox"
              defaultChecked={it.checked}
              className="cursor-pointer"
            />
            <span className="flex-1">{it.label}</span>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {it.count.toLocaleString()}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function EnvScoreChecks({
  defaults = [],
  includeE = false,
}: {
  defaults?: ReadonlyArray<"A" | "B" | "C" | "D" | "E">;
  includeE?: boolean;
}) {
  const grades = (includeE ? ["A", "B", "C", "D", "E"] : ["A", "B", "C", "D"]) as const;
  const styles: Record<string, string> = {
    A: "peer-checked:bg-signal-green/15 peer-checked:text-signal-green peer-checked:border-signal-green/30",
    B: "peer-checked:bg-primary/15 peer-checked:text-primary peer-checked:border-primary/30",
    C: "peer-checked:bg-signal-yellow/20 peer-checked:text-signal-yellow peer-checked:border-signal-yellow/30",
    D: "peer-checked:bg-signal-orange/15 peer-checked:text-signal-orange peer-checked:border-signal-orange/30",
    E: "peer-checked:bg-signal-magenta/15 peer-checked:text-signal-magenta peer-checked:border-signal-magenta/30",
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {grades.map((g) => (
        <label key={g} className="cursor-pointer" title={`Score ${g}`}>
          <input
            type="checkbox"
            defaultChecked={defaults.includes(g)}
            className="peer sr-only"
          />
          <span
            className={cn(
              "inline-flex size-8 items-center justify-center rounded border border-input bg-background text-[12px] font-bold text-muted-foreground transition-colors",
              styles[g],
            )}
          >
            {g}
          </span>
        </label>
      ))}
    </div>
  );
}

function DrydockPills() {
  const [active, setActive] = React.useState<(typeof DRY_DOCK_BUCKETS)[number]>("1–2 years");
  return (
    <div className="flex flex-wrap gap-1.5">
      {DRY_DOCK_BUCKETS.map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => setActive(b)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
            active === b
              ? "border-primary bg-primary/10 text-primary"
              : "border-input bg-background text-muted-foreground hover:bg-muted",
          )}
        >
          {b}
        </button>
      ))}
    </div>
  );
}

/**
 * ResultsToolbar — sits above the search-results table.
 *
 * Mirrors the prototype's `.results-toolbar`:
 *   - LEFT:  "Sort by" dropdown (Relevance / Year Built / DWT / FMV)
 *   - RIGHT: when rows are selected → bulk-action bar
 *           ("[N] selected" + Add to Fleet + 3-dot more menu);
 *           otherwise → "Export CSV" button + segmented List/Grid view toggle.
 */
function ResultsToolbar({
  selectedCount,
  onClearSelection,
}: {
  selectedCount: number;
  onClearSelection: () => void;
}) {
  const [view, setView] = React.useState<"list" | "grid">("list");
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card px-6 py-3">
      <select
        className="h-8 min-w-[140px] rounded border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
        defaultValue="relevance"
      >
        <option value="relevance">Sort by: Relevance</option>
        <option value="year">Sort by: Year Built</option>
        <option value="dwt">Sort by: DWT</option>
        <option value="fmv">Sort by: FMV</option>
      </select>

      <div className="ml-auto flex items-center gap-2">
        {hasSelection ? (
          <BulkInlineActions
            count={selectedCount}
            onClear={onClearSelection}
          />
        ) : (
          <>
            <Button variant="outline" className="gap-1.5">
              <Download className="size-3.5" />
              Export CSV
            </Button>
            <div
              role="group"
              aria-label="View"
              className="inline-flex h-8 overflow-hidden rounded border border-input"
            >
              <button
                type="button"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                title="List view"
                className={cn(
                  "inline-flex size-8 items-center justify-center transition-colors",
                  view === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                <List className="size-3.5" />
                <span className="sr-only">List view</span>
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                title="Grid view"
                className={cn(
                  "inline-flex size-8 items-center justify-center border-l border-input transition-colors",
                  view === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                <LayoutGrid className="size-3.5" />
                <span className="sr-only">Grid view</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * BulkInlineActions — replaces the default toolbar buttons whenever rows are
 * selected in the results table. Mirrors the prototype's `.bulk-inline`:
 *   - selection-count badge ("[N] selected")
 *   - "Add to Fleet" primary action
 *   - 3-dot "More actions" menu (Add to Project / Watchlist / Export Selected)
 */
function BulkInlineActions({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  // Close the popover on outside click + Escape.
  React.useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClear}
        title="Clear selection"
        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/15"
      >
        <span className="tabular-nums">{count}</span> selected
      </button>
      <Button variant="outline" className="gap-1.5">
        <Home className="size-3.5" />
        Add to Fleet
      </Button>
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title="More actions"
          className="inline-flex size-8 items-center justify-center rounded border border-input bg-card text-foreground transition-colors hover:bg-muted"
        >
          <MoreVertical className="size-3.5" />
          <span className="sr-only">More actions</span>
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[180px] overflow-hidden rounded-md border bg-card shadow-lg"
          >
            <BulkMenuItem icon={<FolderPlus className="size-3.5" />} label="Add to Project" />
            <BulkMenuItem icon={<Eye className="size-3.5" />}        label="Add to Watchlist" />
            <BulkMenuItem icon={<Download className="size-3.5" />}    label="Export Selected" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BulkMenuItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-foreground hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </button>
  );
}

/**
 * RowActionsMenu — replaces the plain "More" link in each results-table row.
 *
 * Mirrors the prototype's `.row-actions-menu` from html/advanced-search.html:
 * a "More ▾" pill button that toggles a 3-section dropdown.
 *
 *   1. View       — View Details · Get Valuation Certificate
 *   2. Run        — Run Loan Oracle · Run Cash Flow
 *   3. Add to     — Add to Fleet · Add to Project · Add to Watchlist
 *
 * Closes on outside-click and on Escape.
 */
function RowActionsMenu({ vessel }: { vessel: Vessel }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-7 items-center gap-1 rounded-md border border-input bg-card px-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
      >
        More
        <ChevronDown
          className={cn(
            "size-3 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-30 min-w-[210px] overflow-hidden rounded-md border bg-card text-left shadow-lg"
        >
          {/* Section 1 — View */}
          <div className="border-b py-1">
            <RowMenuLink
              href={`/vessels/${vessel.imo}`}
              icon={<Info className="size-3.5" />}
              label="View Details"
            />
            <RowMenuItem
              icon={<FileText className="size-3.5" />}
              label="Get Valuation Certificate"
            />
          </div>
          {/* Section 2 — Run */}
          <div className="border-b py-1">
            <RowMenuLink
              href={`/loan-oracle/new?imo=${vessel.imo}`}
              icon={<DollarSign className="size-3.5" />}
              label="Run Loan Oracle"
            />
            <RowMenuLink
              href={`/cashflow/new?imo=${vessel.imo}`}
              icon={<Activity className="size-3.5" />}
              label="Run Cash Flow"
            />
          </div>
          {/* Section 3 — Add */}
          <div className="py-1">
            <RowMenuItem
              icon={<Home className="size-3.5" />}
              label="Add to Fleet"
            />
            <RowMenuItem
              icon={<FolderPlus className="size-3.5" />}
              label="Add to Project"
            />
            <RowMenuItem
              icon={<Eye className="size-3.5" />}
              label="Add to Watchlist"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RowMenuItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-foreground hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </button>
  );
}

function RowMenuLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-foreground hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}

function ResultsEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
      <Search className="size-16 stroke-1 text-muted-foreground/40" />
      <h3 className="text-[16px] font-bold">Search the Global Vessel Database</h3>
      <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">
        Use the filters on the left to search by vessel name, IMO number, type,
        deadweight, year built, and more. Click <strong className="font-bold text-foreground">Apply Filters</strong> to see results.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <EmptyStat value="2,847" label="Vessels Available" />
        <EmptyStat value="9" label="Vessel Types" />
        <EmptyStat value="42" label="Flag States" />
      </div>
    </div>
  );
}

function EmptyStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border bg-card px-4 py-2 text-center">
      <div className="font-display text-[20px] font-extrabold leading-none tracking-[-0.4px] text-foreground">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 2 — Saved Searches
 * -------------------------------------------------------------------------- */

const FILTER_TONE: Record<NonNullable<SavedSearch["filters"][number]["tone"]>, string> = {
  blue: "bg-primary/10 text-primary",
  green: "bg-signal-green/15 text-signal-green",
  orange: "bg-signal-orange/15 text-signal-orange",
};

function SavedSearchesPanel() {
  const avgResults = Math.round(
    SAVED_SEARCHES.reduce((sum, s) => sum + s.results, 0) / SAVED_SEARCHES.length,
  );

  return (
    <div className="flex flex-col gap-6 p-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <KpiCard
          label="Saved Searches"
          value={String(SAVED_SEARCHES.length)}
          meta="Quick-access filters"
          accent="blue"
        />
        <KpiCard
          label="Avg Results / Search"
          value={String(avgResults)}
          meta="Vessels found"
          accent="green"
        />
      </section>

      <Card className="overflow-hidden">
        <AppCardHeader
          title="Saved Searches"
          subtitle={`${SAVED_SEARCHES.length} saved searches · click the play button to re-apply filters`}
        />
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Search Name</th>
              <th className="px-4 py-2 text-left">Filters Applied</th>
              <th className="px-4 py-2 text-right">Results</th>
              <th className="whitespace-nowrap px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-right" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {SAVED_SEARCHES.map((s) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-bold">{s.name}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {s.filters.map((f) => (
                      <span
                        key={f.label}
                        className={cn(
                          "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                          FILTER_TONE[f.tone ?? "blue"],
                        )}
                      >
                        {f.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-bold tabular-nums">
                  {s.results}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-muted-foreground">
                  {s.date}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <RowAction title="Run search">
                      <Play className="size-3.5" />
                    </RowAction>
                    <RowAction title="Edit search">
                      <Edit3 className="size-3.5" />
                    </RowAction>
                    <RowAction title="Remove" danger>
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
 * Tab 3 — Watchlist
 * -------------------------------------------------------------------------- */

function WatchlistPanel() {
  const alertsActive = WATCHLIST.filter((v) => v.alertActive).length;

  return (
    <div className="flex flex-col gap-6 p-8">
      <Card className="border-primary/30 bg-primary/5 p-4 text-[12px]">
        <p className="text-muted-foreground">
          Add vessels to your watchlist to monitor changes in FMV, status and
          availability. Price alerts notify you when a vessel&rsquo;s FMV
          crosses your target threshold.
        </p>
      </Card>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <KpiCard
          label="Watchlist Vessels"
          value={String(WATCHLIST.length)}
          meta="Currently tracked"
          accent="blue"
        />
        <KpiCard
          label="Price Alerts Active"
          value={String(alertsActive)}
          meta={`Across ${alertsActive} vessels`}
          accent="orange"
        />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <h2 className="text-[14px] font-bold">My Vessel Watchlist</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {WATCHLIST.length} vessels tracked · FMV updates daily
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Year</th>
                <th className="px-4 py-2 text-right">DWT</th>
                <th className="px-4 py-2 text-right">Current FMV</th>
                <th className="px-4 py-2 text-right">FMV (30d)</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Alert</th>
                <th className="whitespace-nowrap px-4 py-2 text-left">Added</th>
                <th className="px-4 py-2 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {WATCHLIST.map((v) => (
                <tr key={v.imo} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/vessels/${v.imo}`}
                      className="block font-semibold text-foreground hover:text-primary"
                    >
                      {v.name}
                    </Link>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      IMO {v.imo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <VesselTypeBadge value={v.type} />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{v.year}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {v.dwt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">
                    {v.fmv}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right font-bold tabular-nums",
                      v.fmv30dPositive ? "text-signal-green" : "text-signal-magenta",
                    )}
                  >
                    {v.fmv30dDelta}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                        v.status === "Active" && "bg-signal-green/15 text-signal-green",
                        v.status === "Laid Up" && "bg-signal-orange/15 text-signal-orange",
                        v.status === "Demolished" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {v.alertActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Active
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-muted-foreground">
                    {v.added}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-signal-magenta hover:text-signal-magenta">
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

/**
 * FilterGroup — collapsible group within the filter panel.
 *
 * Matches the prototype's `.filter-group-header`:
 *   - py-[11px] vertical padding, no horizontal padding (the panel
 *     already pads its scroll body via px-8)
 *   - 12px / 700 weight / primary text color (NOT muted, NOT
 *     uppercase, NO letter-spacing)
 *   - hover state is just opacity-80 — no bg/color change
 *   - chevron is a small SVG that rotates 180° when open
 *   - separator: subtle bottom border, none on the last group
 */
function FilterGroup({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b last:border-0">
      <summary className="flex cursor-pointer list-none items-center py-[11px] text-[12px] font-bold text-foreground transition-opacity hover:opacity-80 [&::-webkit-details-marker]:hidden">
        <span className="flex-1">{label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="pb-4 pt-1">{children}</div>
    </details>
  );
}

function RangeInputs({
  minLabel,
  maxLabel,
  minPlaceholder,
  maxPlaceholder,
}: {
  minLabel: string;
  maxLabel: string;
  minPlaceholder: string;
  maxPlaceholder: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {minLabel}
        </span>
        <input
          type="text"
          placeholder={minPlaceholder}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {maxLabel}
        </span>
        <input
          type="text"
          placeholder={maxPlaceholder}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
    </div>
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
