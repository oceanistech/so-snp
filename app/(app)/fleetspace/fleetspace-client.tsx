"use client";
/**
 * FleetspaceClient — interactive island for /fleetspace.
 *
 * Visually mirrors `html/my-fleet.html` (BRD §7.2 + UI prototype):
 *   - persistent "All Fleets" tab + per-fleet openable tabs (closeable)
 *   - 4-up KPI stats row (vessels, FMV, DWT, avg age) with %-of-global pills
 *   - "All Fleets" list-of-fleets table with type-mix tags + row actions
 *   - per-fleet detail view: filter bar + vessel table
 *
 * Out of scope for OT-175 (M02 work): the Employments / Gantt / TC schedule
 * sections from the prototype. Those need a real Employment + Charterer
 * model that doesn't exist yet — adding them as a static mock would
 * mis-set expectations about what the platform actually does. We render a
 * placeholder banner in the detail view linking to the M02 ticket instead.
 *
 * Pagination is intentionally a one-page no-op right now: the dev org has
 * 12 fleets and ~45 vessels, well within the page size. Real pagination
 * lands in the URL-param contract step (Step 6).
 */
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  Info,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EnvScoreBadge } from "@/components/app/env-score-badge";
import { TablePagination } from "@/components/app/table-pagination";
import { cn } from "@/lib/utils";
import type { FleetSummary } from "@/lib/services/fleet.service";
import type { VesselListItem, VesselDetail } from "@/lib/services/vessel.service";
import { VesselDetailTabs } from "@/app/(app)/vessels/[imo]/vessel-detail-tabs";
import { VesselActionsMenu } from "@/app/(app)/vessels/[imo]/vessel-actions-menu";
import { FleetActionsMenu } from "./fleet-actions-menu";
import { FleetDetailActionsMenu } from "./fleet-detail-actions-menu";

/* --------------------------------------------------------------------------
 * Visual helpers — match the prototype's type tag and dot colour palette.
 * -------------------------------------------------------------------------- */

const TYPE_TAG: Record<
  VesselListItem["typeRoot"],
  { label: string; cls: string }
> = {
  BULK:      { label: "BULK",   cls: "bg-primary/12 text-primary" },
  TANKER:    { label: "TANKER", cls: "bg-signal-orange/15 text-signal-orange" },
  GAS:       { label: "GAS",    cls: "bg-accent/15 text-accent" },
  CONTAINER: { label: "CONT",   cls: "bg-signal-purple/15 text-signal-purple" },
  OFFSHORE:  { label: "OFF",    cls: "bg-signal-green/15 text-signal-green" },
  OTHER:     { label: "OTHER",  cls: "bg-muted text-muted-foreground" },
};

/** Cycle through the prototype's tab accent colours so each fleet gets one. */
/** Solid colour used by the dot indicator on every vessel sub-tab. */
const VESSEL_DOT = "bg-primary";

const TAB_ACCENTS = [
  "bg-primary",
  "bg-signal-green",
  "bg-accent",
  "bg-signal-orange",
  "bg-signal-purple",
  "bg-signal-magenta",
];
function accentFor(index: number): string {
  // `noUncheckedIndexedAccess` makes array access `T | undefined`; the
  // modulo guarantees a hit but TS doesn't know that — fall back so the
  // return type stays `string`.
  return TAB_ACCENTS[index % TAB_ACCENTS.length] ?? "bg-primary";
}

function fmtDwt(t: number) {
  if (t >= 1_000_000) return (t / 1_000_000).toFixed(1) + "M";
  if (t >= 1000) return Math.round(t / 1000) + "K";
  return String(t);
}

function fmtFmvUsd(usd: number) {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(0)}M`;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(0)}K`;
  return `$${usd}`;
}

function fmtCreated(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * `JSON.parse` turns Date fields into ISO strings; the `VesselDetail`
 * shape declares them as `Date | null`, so re-hydrate before handing the
 * payload to React components that call `.getTime()` etc.
 */
function hydrateVesselDetailDates(raw: VesselDetail): VesselDetail {
  const toDate = (v: unknown): Date | null =>
    v == null ? null : typeof v === "string" || typeof v === "number" ? new Date(v) : (v as Date);
  return {
    ...raw,
    acquisitionDate: toDate(raw.acquisitionDate),
    onSaleAt: toDate(raw.onSaleAt),
    nextSpecialSurvey: toDate(raw.nextSpecialSurvey),
    createdAt: toDate(raw.createdAt) ?? new Date(),
    updatedAt: toDate(raw.updatedAt) ?? new Date(),
    certificates: raw.certificates.map((c) => ({
      ...c,
      expiresAt: toDate(c.expiresAt),
    })),
    ownershipHistory: raw.ownershipHistory.map((o) => ({
      ...o,
      fromDate: toDate(o.fromDate),
      toDate: toDate(o.toDate),
    })),
  };
}

/* --------------------------------------------------------------------------
 * Props + global derived state
 * -------------------------------------------------------------------------- */

type GlobalKpi = {
  vessels: number;
  fmvUsd: number;
  dwt: number;
  avgAgeYears: number | null;
};

export function FleetspaceClient({
  initialFleets,
  initialVessels,
  justCreated,
}: {
  initialFleets: FleetSummary[];
  initialVessels: VesselListItem[];
  justCreated: { id: string; name: string } | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* --------------------------------------------------------------------
   * Tab state — derived from URL on first render so refresh restores the
   * exact tab the user was on. URL contract:
   *   /fleetspace                          → All Fleets
   *   /fleetspace?fleet=<id>               → fleet view, All Vessels sub-tab
   *   /fleetspace?fleet=<id>&vessel=<id>   → fleet view, vessel sub-tab
   * Tab clicks call `router.replace` (no scroll) so the back/forward
   * buttons and copy-the-URL workflow both behave naturally.
   * ------------------------------------------------------------------ */
  const initialState = React.useMemo(() => {
    const fleetParam = searchParams.get("fleet");
    const vesselParam = searchParams.get("vessel");
    const validFleetId =
      fleetParam && initialFleets.some((f) => f.id === fleetParam) ? fleetParam : null;
    const validVesselId =
      validFleetId && vesselParam
        ? initialVessels.some(
            (v) =>
              v.id === vesselParam &&
              v.fleets.some((fl) => fl.id === validFleetId),
          )
          ? vesselParam
          : null
        : null;
    return {
      activeView: (validFleetId ?? "global") as string,
      openTabs: validFleetId ? [validFleetId] : ([] as string[]),
      openVesselsByFleet: (validFleetId && validVesselId
        ? { [validFleetId]: [validVesselId] }
        : {}) as Record<string, string[]>,
      activeVesselByFleet: (validFleetId && validVesselId
        ? { [validFleetId]: validVesselId }
        : {}) as Record<string, string>,
      // Pre-flag the loading slot so the lazy-fetch effect kicks off
      // immediately when we hydrate from a `?vessel=` URL.
      vesselDetailCache: (validVesselId
        ? { [validVesselId]: "loading" as const }
        : {}) as Record<string, VesselDetail | "loading" | "error">,
    };
    // Empty deps — only computed once at mount. State diverges from URL
    // after that and is re-synchronised by `useEffect` below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeView, setActiveView] = React.useState<string>(initialState.activeView);
  const [openTabs, setOpenTabs] = React.useState<string[]>(initialState.openTabs);
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  /* Nested vessel sub-tabs — keyed per fleet.
   *   - openVesselsByFleet[fleetId] is the ordered list of vessel ids open
   *     as sub-tabs in that fleet
   *   - activeVesselByFleet[fleetId] is "all" (the All Vessels table) or a
   *     specific vessel id (its detail panel)
   *   - vesselDetailCache memoises the API response so re-opening a sub-tab
   *     doesn't re-fetch. Values can be `"loading"`, `"error"`, or the
   *     full VesselDetail object.
   */
  const [openVesselsByFleet, setOpenVesselsByFleet] = React.useState<
    Record<string, string[]>
  >(initialState.openVesselsByFleet);
  const [activeVesselByFleet, setActiveVesselByFleet] = React.useState<
    Record<string, string>
  >(initialState.activeVesselByFleet);
  const [vesselDetailCache, setVesselDetailCache] = React.useState<
    Record<string, VesselDetail | "loading" | "error">
  >(initialState.vesselDetailCache);

  /** Open a vessel as a sub-tab inside a fleet view (or switch to it if
   *  already open). Triggers a lazy fetch when we haven't seen this vessel
   *  before; subsequent opens hit the cache. */
  const openVesselTab = React.useCallback(
    (fleetId: string, vesselId: string) => {
      setOpenVesselsByFleet((prev) => {
        const list = prev[fleetId] ?? [];
        if (list.includes(vesselId)) return prev;
        return { ...prev, [fleetId]: [...list, vesselId] };
      });
      setActiveVesselByFleet((prev) => ({ ...prev, [fleetId]: vesselId }));

      setVesselDetailCache((prev) => {
        if (prev[vesselId] != null) return prev;
        return { ...prev, [vesselId]: "loading" };
      });
    },
    [],
  );

  // Side-effect: kick off fetches for any vessel we just marked "loading".
  React.useEffect(() => {
    for (const [vesselId, value] of Object.entries(vesselDetailCache)) {
      if (value !== "loading") continue;
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch(`/api/vessels/${vesselId}`);
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = (await res.json()) as VesselDetail;
          // Re-hydrate the Date fields — JSON.parse gave us strings.
          if (!cancelled) {
            setVesselDetailCache((prev) => ({
              ...prev,
              [vesselId]: hydrateVesselDetailDates(data),
            }));
          }
        } catch (err) {
          console.error("[openVesselTab] fetch failed", err);
          if (!cancelled) {
            setVesselDetailCache((prev) => ({ ...prev, [vesselId]: "error" }));
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [vesselDetailCache]);

  function closeVesselTab(fleetId: string, vesselId: string) {
    setOpenVesselsByFleet((prev) => {
      const list = (prev[fleetId] ?? []).filter((id) => id !== vesselId);
      return { ...prev, [fleetId]: list };
    });
    setActiveVesselByFleet((prev) => {
      if (prev[fleetId] !== vesselId) return prev;
      // Pick the next sub-tab, otherwise fall back to All Vessels
      const list = (openVesselsByFleet[fleetId] ?? []).filter((id) => id !== vesselId);
      const next = list[list.length - 1] ?? "all";
      return { ...prev, [fleetId]: next };
    });
  }

  function switchVesselSubTab(fleetId: string, key: string) {
    setActiveVesselByFleet((prev) => ({ ...prev, [fleetId]: key }));
  }

  /* Global KPIs — computed once from the listing payload. */
  const globalKpi = React.useMemo<GlobalKpi>(() => {
    const vessels = initialVessels.length;
    const fmvUsd = initialVessels.reduce(
      (sum, v) => sum + (v.currentFmvUsd ?? 0),
      0,
    );
    const dwt = initialVessels.reduce((sum, v) => sum + v.dwt, 0);
    const currentYear = new Date().getFullYear();
    const ages = initialVessels
      .map((v) => currentYear - v.yearBuilt)
      .filter((n) => Number.isFinite(n));
    const avgAgeYears =
      ages.length > 0
        ? Number((ages.reduce((s, n) => s + n, 0) / ages.length).toFixed(1))
        : null;
    return { vessels, fmvUsd, dwt, avgAgeYears };
  }, [initialVessels]);

  const activeFleet = React.useMemo(
    () => initialFleets.find((f) => f.id === activeView),
    [initialFleets, activeView],
  );

  /* Mirror the active fleet / vessel selection back to the URL. The deps
   * are deliberately narrow — we read a single string from
   * `activeVesselByFleet` and only re-run when the *active* sub-tab
   * changes (not on every open/close of an unrelated vessel tab). */
  const activeVesselId =
    activeView !== "global" ? activeVesselByFleet[activeView] ?? null : null;
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (activeView !== "global") {
      params.set("fleet", activeView);
      if (activeVesselId && activeVesselId !== "all") {
        params.set("vessel", activeVesselId);
      }
    }
    const qs = params.toString();
    router.replace(`/fleetspace${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [activeView, activeVesselId, router]);

  function openFleet(id: string) {
    setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveView(id);
  }
  function closeFleet(id: string) {
    setOpenTabs((prev) => prev.filter((x) => x !== id));
    if (activeView === id) setActiveView("global");
    // Drop the fleet's nested vessel state — re-opening the fleet starts fresh.
    setOpenVesselsByFleet((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveVesselByFleet((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function dismissBanner() {
    setBannerDismissed(true);
    // Clear the ?created=… so a refresh doesn't re-show the banner.
    const next = new URLSearchParams(searchParams);
    next.delete("created");
    router.replace(`/fleetspace${next.size > 0 ? `?${next}` : ""}`);
  }

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Fleets" }]}
        title="Fleet Overview"
        subtitle="Organise vessels into fleets and monitor portfolio performance"
        actions={
          <>
            <Button asChild className="gap-1.5">
              <Link href="/fleetspace/create">
                <Plus className="size-3.5" />
                Create Fleet
              </Link>
            </Button>
            <Button asChild className="gap-1.5" variant="secondary">
              <Link href="/vessels/new">
                <Plus className="size-3.5" />
                Add Vessel
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4 p-8">
        {justCreated && !bannerDismissed ? (
          <div className="flex items-center gap-3 rounded-md border border-signal-green/40 bg-signal-green/8 px-4 py-2.5 text-[12px]">
            <CheckCircle2 className="size-4 shrink-0 text-signal-green" />
            <span className="flex-1">
              <strong className="font-bold">{justCreated.name}</strong> was
              created. You can{" "}
              <button
                type="button"
                className="font-semibold text-primary underline-offset-2 hover:underline"
                onClick={() => openFleet(justCreated.id)}
              >
                open it now
              </button>{" "}
              or add vessels later.
            </span>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss"
              className="rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        {/* Tab + content stack — folder-tab pills on the page background.
            We use `flex-col` with NO gap so the vessel bar (or fleet bar,
            when no fleet is open) can sit flush against the content card
            below — `-mb-px` on the active tab then overlaps the content
            card's top border, hiding the horizontal line where the tab
            sits and producing the prototype's "tab-attached-to-content"
            look. The vessel bar adds its own `mt-5` for breathing space
            from the fleet bar above. */}
        <div className="flex flex-col">
        {/* Fleet tab bar — flat row of pill tabs on the page background. */}
          <div className="flex shrink-0 items-center rounded-t-lg gap-1 overflow-x-auto border px-2 pt-2 pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-6">
          <FleetTab
            label="All Fleets"
            badge={globalKpi.vessels}
            accent="bg-primary"
            active={activeView === "global"}
            onClick={() => setActiveView("global")}
          />
          {openTabs.map((id) => {
            const f = initialFleets.find((x) => x.id === id);
            if (!f) return null;
            const idx = initialFleets.findIndex((x) => x.id === id);
            return (
              <FleetTab
                key={id}
                label={f.name}
                badge={f.vesselCount}
                accent={accentFor(idx)}
                active={activeView === id}
                onClick={() => setActiveView(id)}
                onClose={() => closeFleet(id)}
              />
            );
          })}
        </div>

        {/* Vessel tab bar — sits 20px below the fleet bar so the two tab
            rows read as two distinct strips. `-mb-px` on the active
            vessel tab still merges it flush with the content card below. */}
        {activeFleet ? (
          <div
            role="tablist"
            aria-label={`${activeFleet.name} sub-tabs`}
            className="flex flex-wrap items-center gap-1"
          >
            <VesselSubTab
              label="All Vessels"
              badge={
                initialVessels.filter((v) =>
                  v.fleets.some((fl) => fl.id === activeFleet.id),
                ).length
              }
              active={(activeVesselByFleet[activeFleet.id] ?? "all") === "all"}
              onClick={() => switchVesselSubTab(activeFleet.id, "all")}
            />
            {(openVesselsByFleet[activeFleet.id] ?? []).map((vesselId) => {
              const v = initialVessels.find((x) => x.id === vesselId);
              const cached = vesselDetailCache[vesselId];
              const label =
                v?.name ??
                (cached && cached !== "loading" && cached !== "error"
                  ? cached.name
                  : "Vessel");
              return (
                <VesselSubTab
                  key={vesselId}
                  label={label}
                  active={activeVesselByFleet[activeFleet.id] === vesselId}
                  dot={VESSEL_DOT}
                  onClick={() => switchVesselSubTab(activeFleet.id, vesselId)}
                  onClose={() => closeVesselTab(activeFleet.id, vesselId)}
                />
              );
            })}
          </div>
        ) : null}

        {/* Content area — switches presentation based on what's active:
              • Fleet content (All Fleets list OR a fleet's All Vessels
                view): wrapped in a white card with rounded border + p-4
                so the KPIs and tables sit on a unified white surface.
              • Vessel sub-tab: NO wrapping card. `VesselDetailTabs` has
                its own white-header + muted-body card structure and
                renders edge-to-edge, so there's no double-padded
                "card inside a card" look. */}
        {activeView === "global" ? (
          <div className="flex flex-col gap-4 rounded-b-lg  border bg-card p-4">
            <ViewingLabel fleetName="All Fleets" accent="bg-primary" />
            <StatsRow
              activeFleet={null}
              global={globalKpi}
              fleetCount={initialFleets.length}
            />
            <AllFleetsView fleets={initialFleets} onOpenFleet={openFleet} />
          </div>
        ) : activeFleet ? (
          (activeVesselByFleet[activeFleet.id] ?? "all") === "all" ? (
            <div className="flex flex-col gap-4 rounded-b-lg border bg-card p-4">
              <ViewingLabel
                fleetName={activeFleet.name}
                accent={accentFor(
                  initialFleets.findIndex((f) => f.id === activeFleet.id),
                )}
              />
              <StatsRow
                activeFleet={activeFleet}
                global={globalKpi}
                fleetCount={initialFleets.length}
              />
              <FleetDetailView
                fleet={activeFleet}
                vessels={initialVessels.filter((v) =>
                  v.fleets.some((fl) => fl.id === activeFleet.id),
                )}
                onOpenVessel={(vesselId) =>
                  openVesselTab(activeFleet.id, vesselId)
                }
                onRemoved={() => closeFleet(activeFleet.id)}
              />
            </div>
          ) : (
            <VesselSubTabContent
              vesselId={activeVesselByFleet[activeFleet.id]!}
              fleetName={activeFleet.name}
              fallbackName={
                initialVessels.find(
                  (v) => v.id === activeVesselByFleet[activeFleet.id],
                )?.name ?? "Vessel"
              }
              cached={vesselDetailCache[activeVesselByFleet[activeFleet.id]!]}
            />
          )
        ) : null}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * "Viewing" label — mirrors prototype `.fleet-viewing-label`
 * -------------------------------------------------------------------------- */
function ViewingLabel({
  fleetName,
  accent,
}: {
  fleetName: string;
  accent: string;
}) {
  return (
    <p className="flex items-center gap-1.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
      Viewing
      <span className={cn("inline-block size-[9px] shrink-0 rounded-full", accent)} />
      <span className="text-foreground">{fleetName}</span>
      <span className="font-normal text-muted-foreground">
        — data reflects selected fleet
      </span>
    </p>
  );
}

/* --------------------------------------------------------------------------
 * KPI stats row — global or per-fleet, with %-of-global pills.
 * -------------------------------------------------------------------------- */
function StatsRow({
  activeFleet,
  global,
  fleetCount,
}: {
  activeFleet: FleetSummary | null;
  global: GlobalKpi;
  fleetCount: number;
}) {
  const isGlobal = activeFleet == null;
  const pct = (a: number, b: number) =>
    b === 0 ? 0 : Math.round((a / b) * 100);

  const vessels = isGlobal ? global.vessels : activeFleet!.vesselCount;
  const fmvUsd = isGlobal ? global.fmvUsd : activeFleet!.totalFmvUsd;
  const dwt = isGlobal ? global.dwt : activeFleet!.totalDwt;
  const age = isGlobal ? global.avgAgeYears : activeFleet!.avgAgeYears;
  const ageDiff =
    !isGlobal && age != null && global.avgAgeYears != null
      ? (age - global.avgAgeYears).toFixed(1)
      : null;
  const ageUp = ageDiff != null && Number(ageDiff) >= 0;

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <FleetKpi
        accent="bg-primary"
        label="Total Vessels"
        value={String(vessels)}
        meta={isGlobal ? `Across ${fleetCount} fleets` : activeFleet!.name}
        share={isGlobal ? null : `${pct(vessels, global.vessels)}% of global`}
      />
      <FleetKpi
        accent="bg-signal-green"
        label="Total FMV"
        value={fmtFmvUsd(fmvUsd)}
        meta={isGlobal ? "Portfolio value" : activeFleet!.name}
        share={isGlobal ? null : `${pct(fmvUsd, global.fmvUsd)}% of global`}
      />
      <FleetKpi
        accent="bg-accent"
        label="Total DWT"
        value={fmtDwt(dwt)}
        meta={isGlobal ? "Combined capacity" : activeFleet!.name}
        share={isGlobal ? null : `${pct(dwt, global.dwt)}% of global`}
      />
      <FleetKpi
        accent="bg-signal-orange"
        label="AVG Vessel Age"
        value={
          age == null ? (
            "—"
          ) : (
            <>
              {age}
              <span className="ml-1 text-[16px] font-normal tracking-normal text-muted-foreground">
                yrs
              </span>
            </>
          )
        }
        meta={
          isGlobal
            ? "Fleet average"
            : global.avgAgeYears != null
              ? `vs ${global.avgAgeYears} yrs global avg`
              : "—"
        }
        share={
          isGlobal || ageDiff == null
            ? null
            : { text: `${ageUp ? "+" : ""}${ageDiff}y vs global`, tone: ageUp ? "warn" : "good" }
        }
      />
    </section>
  );
}

function FleetKpi({
  label,
  value,
  meta,
  accent,
  share,
}: {
  label: string;
  value: React.ReactNode;
  meta?: string;
  accent: string;
  share?:
    | string
    | { text: string; tone: "good" | "warn" }
    | null;
}) {
  let shareEl: React.ReactNode = null;
  if (typeof share === "string") {
    shareEl = (
      <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
        {share}
      </span>
    );
  } else if (share && typeof share === "object") {
    shareEl = (
      <span
        className={cn(
          "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
          share.tone === "warn"
            ? "bg-signal-orange/15 text-signal-orange"
            : "bg-signal-green/15 text-signal-green",
        )}
      >
        {share.text}
      </span>
    );
  }
  return (
    <div className="relative flex flex-col gap-1 overflow-hidden rounded-md border bg-card p-6 shadow-sm">
      <span
        aria-hidden
        className={cn("pointer-events-none absolute inset-y-0 left-0 w-[3px]", accent)}
      />
      <div className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline">
        <span className="font-display text-[24px] font-extrabold leading-tight tracking-[-0.6px] tabular-nums text-foreground">
          {value}
        </span>
        {shareEl}
      </div>
      {meta ? <div className="text-[11px] text-muted-foreground">{meta}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * All Fleets list view
 * -------------------------------------------------------------------------- */
function AllFleetsView({
  fleets,
  onOpenFleet,
}: {
  fleets: FleetSummary[];
  onOpenFleet: (id: string) => void;
}) {
  const [search, setSearch] = React.useState("");
  /**
   * Pagination state. Defaults to 5 fleets per page (matches the
   * prototype's `.pagination` block + the user's expected initial
   * load). Per-page options are 5/10/25 — switching any of these
   * resets to page 1 so the user never sees a phantom empty page.
   */
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(5);

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q === "") return fleets;
    return fleets.filter((f) => f.name.toLowerCase().includes(q));
  }, [fleets, search]);

  // Compute how many pages we have, then clamp `page` back to a valid
  // value when the underlying dataset shrinks (search narrows the rows,
  // a fleet is deleted, per-page increases past the row count, etc.).
  const totalPages = Math.max(1, Math.ceil(visible.length / perPage));
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Slice the visible rows down to the current page's window.
  const paginated = React.useMemo(
    () => visible.slice((page - 1) * perPage, page * perPage),
    [visible, page, perPage],
  );

  // Reset to page 1 whenever the search query or per-page changes so
  // the user always lands on the first page of the new result set.
  React.useEffect(() => {
    setPage(1);
  }, [search, perPage]);

  if (fleets.length === 0) {
    return (
      <EmptyState
        title="No fleets yet"
        body="Create your first fleet to group vessels and monitor portfolio performance."
        cta={
          <Button asChild>
            <Link href="/fleetspace/create">
              <Plus className="size-3.5" />
              Create Fleet
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-[340px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search fleet name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {visible.length} fleet{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      <Card className="overflow-visible">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2.5 text-left">Fleet</th>
              <th className="px-4 py-2.5 text-left">Vessels</th>
              <th className="px-4 py-2.5 text-left">Total FMV</th>
              <th className="px-4 py-2.5 text-left">Total DWT</th>
              <th className="px-4 py-2.5 text-left">Avg Age</th>
              <th className="px-4 py-2.5 text-left">Type Mix</th>
              <th className="px-4 py-2.5 text-left">Created</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((f, idx) => {
              // Use the global (across-all-pages) row index so the
              // tab-accent colours stay consistent for a given fleet as
              // the user pages through the table.
              const accent = accentFor((page - 1) * perPage + idx);
              return (
                <tr
                  key={f.id}
                  onClick={() => onOpenFleet(f.id)}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("inline-block size-2.5 shrink-0 rounded-full", accent)} />
                      <span className="font-semibold text-primary">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{f.vesselCount}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    {fmtFmvUsd(f.totalFmvUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{fmtDwt(f.totalDwt)} DWT</td>
                  <td className="px-4 py-3 tabular-nums">
                    {f.avgAgeYears == null ? "—" : `${f.avgAgeYears} yrs`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(f.typeMix).map(([root, count]) => {
                        const tag =
                          TYPE_TAG[root as VesselListItem["typeRoot"]] ??
                          TYPE_TAG.OTHER;
                        return (
                          <span
                            key={root}
                            className={cn(
                              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
                              tag.cls,
                            )}
                          >
                            {count}×{tag.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {fmtCreated(f.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {/* The "Open" button was removed in OT-175 — the prototype
                        only carries a single "More" trigger here, and View
                        Fleet inside the dropdown does the same thing. */}
                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FleetActionsMenu fleet={f} onView={onOpenFleet} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="text-[12px] font-bold text-muted-foreground">
                    No fleets match your search
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Try a different name.
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <TablePagination
          page={page}
          totalPages={totalPages}
          totalRows={visible.length}
          perPage={perPage}
          perPageOptions={[5, 10, 25]}
          rowLabel="fleet"
          onPageChange={(next) => setPage(next)}
          onPerPageChange={(next) => {
            setPerPage(next);
            // The dedicated useEffect already snaps page back to 1, but
            // doing it inline avoids the brief one-frame flash where
            // the table renders an old slice on the new per-page count.
            setPage(1);
          }}
        />
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Fleet Detail view — real vessels for the selected fleet
 * -------------------------------------------------------------------------- */
const YEAR_TEST: Record<string, (y: number) => boolean> = {
  "2020+": (y) => y >= 2020,
  "2015-2019": (y) => y >= 2015 && y <= 2019,
  "2010-2014": (y) => y >= 2010 && y <= 2014,
  "Before 2010": (y) => y < 2010,
};

function FleetDetailView({
  fleet,
  vessels,
  onOpenVessel,
  onRemoved,
}: {
  fleet: FleetSummary;
  vessels: VesselListItem[];
  onOpenVessel: (vesselId: string) => void;
  /** Invoked after the fleet is successfully soft-deleted from this
   *  tab's "Remove Fleet" action — the parent uses this to drop the
   *  fleet's tab from its open-tabs list. */
  onRemoved: () => void;
}) {
  const [filterType, setFilterType] = React.useState<string>("");
  const [filterYear, setFilterYear] = React.useState<string>("");
  const [filterSearch, setFilterSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    return vessels.filter((v) => {
      if (filterType && v.typeRoot !== filterType) return false;
      if (filterYear && YEAR_TEST[filterYear] && !YEAR_TEST[filterYear](v.yearBuilt))
        return false;
      if (filterSearch.trim() !== "") {
        const q = filterSearch.toLowerCase();
        if (!v.name.toLowerCase().includes(q) && !v.typeLabel.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [vessels, filterType, filterYear, filterSearch]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 p-3">
        <FilterSelect
          label="Type"
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: "", label: "All Types" },
            { value: "BULK", label: "Bulk Carrier" },
            { value: "TANKER", label: "Tanker" },
            { value: "CONTAINER", label: "Container" },
            { value: "GAS", label: "Gas Carrier" },
            { value: "OFFSHORE", label: "Offshore" },
          ]}
        />
        <FilterSelect
          label="Year Built"
          value={filterYear}
          onChange={setFilterYear}
          options={[
            { value: "", label: "Any Year" },
            { value: "2020+", label: "2020+" },
            { value: "2015-2019", label: "2015–2019" },
            { value: "2010-2014", label: "2010–2014" },
            { value: "Before 2010", label: "Before 2010" },
          ]}
        />
        <div className="h-5 w-px bg-border" />
        <div className="relative max-w-[300px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vessel name…"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground">
          <strong className="font-bold text-foreground">{filtered.length}</strong>
          {filtered.length === vessels.length
            ? ` vessel${filtered.length === 1 ? "" : "s"}`
            : ` of ${vessels.length} vessels`}
        </span>
      </div>

      <Card className="overflow-visible">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="text-[14px] font-bold">{fleet.name}</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {filtered.length} vessel{filtered.length === 1 ? "" : "s"}
              {filtered.length !== vessels.length ? " (filtered)" : ""} ·{" "}
              {fleet.description ?? "No description"}
            </p>
          </div>
          <FleetDetailActionsMenu
            fleetId={fleet.id}
            fleetName={fleet.name}
            fleetSlug={fleet.slug}
            onRemoved={onRemoved}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Vessel Name</th>
                <th className="px-3 py-2 text-left">IMO</th>
                <th className="px-3 py-2 text-left">Vessel Type</th>
                <th className="px-3 py-2 text-left">Year Built</th>
                <th className="px-3 py-2 text-left">Size (DWT)</th>
                <th className="px-3 py-2 text-left">Env. Score</th>
                <th className="px-3 py-2 text-left">FMV</th>
                <th className="px-3 py-2 text-left">On Sale</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const tag = TYPE_TAG[v.typeRoot] ?? TYPE_TAG.OTHER;
                return (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenVessel(v.id)}
                        className="text-left font-semibold text-primary hover:underline"
                      >
                        {v.name}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {v.imo}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
                          tag.cls,
                        )}
                      >
                        {tag.label}
                      </span>
                      <span className="ml-1.5 text-[12px]">{v.typeLabel}</span>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{v.yearBuilt}</td>
                    <td className="px-3 py-2.5 font-semibold tabular-nums">
                      {v.dwt.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      {v.envScore ? <EnvScoreBadge value={v.envScore} /> : "—"}
                    </td>
                    <td className="px-3 py-2.5 font-semibold tabular-nums">
                      {v.currentFmvUsd == null ? "—" : `$${v.currentFmvUsd.toFixed(1)}M`}
                    </td>
                    <td className="px-3 py-2.5">
                      {v.isOnSale ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-signal-magenta/10 px-2 py-0.5 text-[10px] font-bold text-signal-magenta">
                          ON SALE
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Button size="sm" variant="ghost" className="gap-1">
                        More
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="text-[12px] font-bold text-muted-foreground">
                      {vessels.length === 0
                        ? "No vessels in this fleet yet"
                        : "No vessels match your filters"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {vessels.length === 0
                        ? "Add vessels from the org roster to start tracking this fleet."
                        : "Try adjusting the vessel type, year, or search term."}
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={1}
          totalPages={1}
          totalRows={filtered.length}
          perPage={10}
          perPageOptions={[10, 25, 50]}
          rowLabel="vessel"
        />
      </Card>

      {/* M02 placeholder — Employment / TC tracking lives in a later sprint */}
      <div className="flex items-center gap-3 rounded-md border border-dashed bg-muted/30 px-4 py-3 text-[12px] text-muted-foreground">
        <Info className="size-4 shrink-0" />
        <span>
          Employments, TC schedule, and timeline come in <strong>M02</strong>{" "}
          (OT-176+). Those sections will appear here once the Employment model
          ships.
        </span>
      </div>
    </>
  );
}

/* --------------------------------------------------------------------------
 * FleetViewWithVesselTabs — wraps FleetDetailView with the nested vessel
 * sub-tab strip (All Vessels + per-vessel tabs). Matches the prototype's
 * `.vessel-browser-bar` directly above the fleet content.
 * -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
 * VesselSubTab — single tab in the vessel-browser-bar
 * -------------------------------------------------------------------------- */
function VesselSubTab({
  label,
  badge,
  active = false,
  dot,
  onClick,
  onClose,
}: {
  label: string;
  badge?: number;
  active?: boolean;
  /**
   * Tailwind `bg-*` class for the small dot rendered next to the vessel
   * name. Used to colour-code vessel tabs by type root (BULK = primary,
   * TANKER = orange, …). The "All Vessels" tab passes no dot so its
   * row stays clean.
   */
  dot?: string;
  onClick: () => void;
  onClose?: () => void;
}) {
  return (
    <div
      role="tab"
      aria-selected={active}
      className={cn(
        // Folder-tab: rounded top corners only, white bg, 1px gray borders
        // on top + sides, no bottom border, `-mb-px` to overlap the content
        // below. No blue top stripe — the primary accent is reserved for
        // the fleet tab row above.
        "group relative inline-flex items-center gap-1.5 rounded-t-sm px-4 py-2 text-[12px] font-semibold transition-colors",
        active
          ? "-mb-px border border-b-0 border-border bg-card text-foreground"
          : "border border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <button type="button" onClick={onClick} className="flex items-center gap-1.5">
        {dot ? (
          <span className={cn("inline-block size-2 shrink-0 rounded-full", dot)} />
        ) : null}
        <span className="max-w-[160px] truncate">{label}</span>
        {badge != null ? (
          <span
            className={cn(
              "rounded-full px-1.5 text-[10px] font-bold leading-[16px] tabular-nums",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
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

/* --------------------------------------------------------------------------
 * VesselSubTabContent — lazy-loaded VesselDetailTabs panel
 * -------------------------------------------------------------------------- */
function VesselSubTabContent({
  vesselId,
  fleetName,
  fallbackName,
  cached,
}: {
  vesselId: string;
  fleetName: string;
  fallbackName: string;
  cached: VesselDetail | "loading" | "error" | undefined;
}) {
  if (cached === "loading" || cached === undefined) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-dashed bg-muted/20 px-6 py-16 text-center">
        <Search className="size-5 animate-pulse text-muted-foreground" />
        <span className="text-[13px] text-muted-foreground">
          Loading {fallbackName}…
        </span>
      </div>
    );
  }
  if (cached === "error") {
    return (
      <div className="rounded-md border border-signal-magenta/30 bg-signal-magenta/8 p-4 text-[12px] text-signal-magenta">
        Couldn&apos;t load <strong>{fallbackName}</strong>.{" "}
        <Link
          href={`/vessels/${vesselId}`}
          className="font-semibold underline-offset-2 hover:underline"
        >
          Open it on its own page.
        </Link>
      </div>
    );
  }
  const vessel = cached;
  const subtitle = [
    vessel.vesselType?.name ?? "Vessel",
    `Built ${vessel.yearBuilt}`,
    `IMO ${vessel.imo}`,
    `${vessel.dwt.toLocaleString()} DWT`,
  ].join(" · ");
  return (
    <VesselDetailTabs
      vessel={vessel}
      embedded
      headerSlot={
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-3">
          <div className="min-w-0 flex-1">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground"
            >
              <Link
                href="/fleetspace"
                className="transition-colors hover:text-foreground"
              >
                Fleets
              </Link>
              <span aria-hidden>/</span>
              <span className="text-foreground/80">{fleetName}</span>
              <span aria-hidden>/</span>
              <span className="font-semibold text-foreground">{vessel.name}</span>
            </nav>
            <h2 className="mt-1 font-display text-[20px] font-extrabold leading-tight tracking-[-0.4px]">
              {vessel.name}
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <VesselActionsMenu vesselId={vessel.id} vesselName={vessel.name} />
          </div>
        </div>
      }
    />
  );
}

/* --------------------------------------------------------------------------
 * Small bits
 * -------------------------------------------------------------------------- */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FleetTab({
  label,
  badge,
  active = false,
  accent,
  onClick,
  onClose,
}: {
  label: string;
  badge: number;
  active?: boolean;
  accent: string;
  onClick: () => void;
  onClose?: () => void;
}) {
  // `accent` is kept on the type for compatibility with future fleet
  // colour theming, but the new folder-tab look only uses a single blue
  // top stripe so we ignore the per-fleet hue for now.
  void accent;
  return (
    <div
      className={cn(
        // Folder-tab styling: rounded top corners only, white bg, 2px
        // primary top border, gray side borders, NO bottom border, and
        // -mb-px so the tab's white fill overlaps the content card's
        // top border by 1px (hides the line where the active tab sits).
        "group relative inline-flex shrink-0 items-center gap-1.5 rounded-t-sm px-4 py-2 text-[12px] font-semibold transition-colors",
        active
          ? "-mb-px border border-b-0 border-border border-t-2 border-t-primary bg-card text-foreground"
          : "border border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="flex items-center gap-1.5"
      >
        <span>{label}</span>
        <span
          className={cn(
            "rounded-full px-1.5 text-[10px] font-bold leading-[16px] tabular-nums",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {badge}
        </span>
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

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed bg-muted/20 px-6 py-16 text-center">
      <FileText className="size-8 text-muted-foreground" />
      <div className="text-[13px] font-bold">{title}</div>
      <div className="max-w-[420px] text-[12px] text-muted-foreground">{body}</div>
      {cta ? <div className="mt-2">{cta}</div> : null}
    </div>
  );
}
