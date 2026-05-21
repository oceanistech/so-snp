"use client";
/**
 * VesselDetailTabs — sub-tab strip + tab panels for /vessels/[id].
 *
 * Matches `html/vessel-details.html`'s `.subtabs` header: 8 tabs
 * (Main Information, Valuations, Net Fleet, Financial Transactions,
 * Earnings & Expenses, IRR, Environmental Score, Valuation Certificates).
 * Only the Main Information panel is real today; the rest render a
 * `ComingInModulePlaceholder` card pointing at the future ticket.
 *
 * Tab state is mirrored to `?tab=<key>` in the URL so direct links work.
 */
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Anchor, ChevronRight, FileSpreadsheet, Ship } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VesselDetail } from "@/lib/services/vessel.service";

/* --------------------------------------------------------------------------
 * Static config
 * -------------------------------------------------------------------------- */

// `module` is the human label rendered by `ComingInModulePlaceholder` —
// `null` for "main" because Main Information is the real implemented tab.
// Keeping the field on every entry gives the union a uniform shape so
// `.find(...)?.module` doesn't trip strict property-existence checks.
type TabConfig = { key: string; label: string; module: string | null };

const TABS = [
  { key: "main",          label: "Main Information",        module: null },
  { key: "valuations",    label: "Valuations",              module: "M06 Vessel Detail · Valuations" },
  { key: "net-fleet",     label: "Net Fleet",               module: "M07 Net Fleet" },
  { key: "transactions",  label: "Financial Transactions",  module: "M09 Financial Transactions" },
  { key: "earnings",      label: "Earnings & Expenses",     module: "M10 Earnings & Expenses" },
  { key: "irr",           label: "IRR",                     module: "M11 IRR" },
  { key: "env-score",     label: "Environmental Score",     module: "M12 Environmental Score" },
  { key: "val-certs",     label: "Valuation Certificates",  module: "M13 Valuation Certificates" },
] as const satisfies readonly TabConfig[];

type TabKey = (typeof TABS)[number]["key"];

type TypeRoot = "BULK" | "TANKER" | "GAS" | "CONTAINER" | "OFFSHORE" | "OTHER";
const TYPE_TAG: Record<TypeRoot, { label: string; cls: string; heroBg: string }> = {
  BULK:      { label: "BULK",   cls: "bg-primary/12 text-primary",                heroBg: "from-primary/40 to-primary/10" },
  TANKER:    { label: "TANKER", cls: "bg-signal-orange/15 text-signal-orange",    heroBg: "from-signal-orange/40 to-signal-orange/10" },
  GAS:       { label: "GAS",    cls: "bg-accent/15 text-accent",                  heroBg: "from-accent/40 to-accent/10" },
  CONTAINER: { label: "CONT",   cls: "bg-signal-purple/15 text-signal-purple",    heroBg: "from-signal-purple/40 to-signal-purple/10" },
  OFFSHORE:  { label: "OFFSH",  cls: "bg-signal-green/15 text-signal-green",      heroBg: "from-signal-green/40 to-signal-green/10" },
  OTHER:     { label: "OTHER",  cls: "bg-muted text-muted-foreground",            heroBg: "from-muted to-muted/30" },
};

function rootOf(typeRoot: string): TypeRoot {
  const known: readonly string[] = ["BULK", "TANKER", "GAS", "CONTAINER", "OFFSHORE"];
  return known.includes(typeRoot) ? (typeRoot as TypeRoot) : "OTHER";
}

/* --------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

const usdShort = (n: number | null) => {
  if (n == null) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

/**
 * Normalise an incoming date-ish value to a real `Date` so the
 * `Intl.DateTimeFormat` calls below never receive an invalid time
 * value (which throws `RangeError: Invalid time value`). Inputs can be
 * a `Date`, an ISO string (which is what Next.js's RSC serialisation
 * can occasionally surface for nested objects), `null`, or `undefined`.
 * Returns `null` when the input is unparseable so the caller renders
 * the standard `—` placeholder instead of crashing.
 */
function toDateOrNull(d: Date | string | null | undefined): Date | null {
  if (d == null) return null;
  const date = d instanceof Date ? d : new Date(d);
  return Number.isNaN(date.getTime()) ? null : date;
}

const fmtDate = (d: Date | string | null | undefined) => {
  const date = toDateOrNull(d);
  if (date == null) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const fmtMonth = (d: Date | string | null | undefined) => {
  const date = toDateOrNull(d);
  if (date == null) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(date);
};

/**
 * Returns true if at least one of the supplied values is "meaningful"
 * (i.e. would render as something other than an em-dash placeholder).
 * Used by the read-only spec tiles to self-hide when every row would
 * be empty so a sparsely-populated vessel doesn't render a wall of
 * "—" placeholders.
 *
 * Rules:
 *   - `null` / `undefined` / `""` → not meaningful
 *   - `false` → not meaningful (a sea of "No"s isn't useful on its own)
 *   - everything else (`true`, numbers including 0, strings, Date) → meaningful
 */
function has(...values: unknown[]): boolean {
  return values.some((v) => {
    if (v == null) return false;
    if (typeof v === "string") return v !== "";
    if (typeof v === "boolean") return v === true;
    return true;
  });
}

/* --------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export function VesselDetailTabs({
  vessel,
  embedded = false,
  headerSlot,
}: {
  vessel: VesselDetail;
  /**
   * When `true`, the component is rendered inside the fleet view's
   * vessel sub-tab. URL updates are suppressed (clicking a tab would
   * otherwise jump the user out of /fleetspace) and the layout is
   * tightened so it nests inside the fleet wrapper card.
   */
  embedded?: boolean;
  /**
   * Optional content rendered on the white "header zone" above the
   * sub-tab strip. Used by the embedded mode to render the prototype's
   * page-header (breadcrumb + name + subtitle + Actions menu) so the
   * embedded experience matches the standalone vessel detail page.
   */
  headerSlot?: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = (searchParams.get("tab") ?? "main") as TabKey;
  const [active, setActive] = React.useState<TabKey>(
    TABS.some((t) => t.key === urlTab) ? urlTab : "main",
  );

  function selectTab(key: TabKey) {
    setActive(key);
    if (embedded) return; // sub-tab inside /fleetspace — don't touch the URL
    const next = new URLSearchParams(searchParams);
    if (key === "main") next.delete("tab");
    else next.set("tab", key);
    next.delete("created"); // dismiss the success banner after first navigation
    const qs = next.toString();
    router.replace(`/vessels/${vessel.id}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex flex-col">
      {/* White header zone — page header (when embedded) + sub-tab strip.
          In embedded mode we drop the top border and the top-rounded
          corners so the active outer vessel tab (in /fleetspace) merges
          flush with this header zone, mirroring the prototype's
          tab-attached-to-content folder look. */}
      <div className={cn("bg-card", embedded ? "rounded-b-lg border" : "")}>
        {headerSlot}
        <nav
          aria-label="Vessel sections"
          className={cn(
            "-mb-px flex flex-wrap gap-1 border-b pt-2",
            embedded ? "px-4" : "px-8",
          )}
        >
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectTab(tab.key)}
                className={cn(
                  "rounded-t-md border border-b-0 px-3 py-2 text-[12px] font-semibold transition-colors",
                  isActive
                    ? "border-border bg-card text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Muted body zone — cards float on a light-gray background so the
          white card surfaces stand out, matching `html/vessel-details.html`. */}
      <div className={cn("", embedded ? "p-4" : "p-8")}>
        {active === "main" ? (
          <MainInformationPanel vessel={vessel} />
        ) : (
          <ComingInModulePlaceholder
            tabLabel={TABS.find((t) => t.key === active)?.label ?? ""}
            moduleName={
              TABS.find((t) => t.key === active)?.module ?? "a future module"
            }
          />
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 · Main Information
 * -------------------------------------------------------------------------- */

function MainInformationPanel({ vessel }: { vessel: VesselDetail }) {
  const root = rootOf(vessel.typeRoot);
  const tag = TYPE_TAG[root];
  const age = new Date().getFullYear() - vessel.yearBuilt;

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1 — Hero + 2×2 KPI grid */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <HeroCard vessel={vessel} tag={tag} />
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            accent="bg-primary"
            label="Deadweight Tonnage"
            value={vessel.dwt.toLocaleString()}
            meta={`DWT · ${vessel.vesselType?.name ?? "Vessel"}`}
          />
          <KpiCard
            accent="bg-accent"
            label="Year Built"
            value={String(vessel.yearBuilt)}
            meta={vessel.shipyard?.name ?? `${age} years old`}
          />
          <KpiCard
            accent="bg-signal-green"
            label="Fair Market Value"
            value={usdShort(vessel.currentFmvUsd)}
            meta={vessel.acquisitionCostUsd != null ? `Acquired ${usdShort(vessel.acquisitionCostUsd)}` : "Auto-valuation pending"}
          />
          <KpiCard
            accent="bg-signal-orange"
            label="Environmental Score"
            value={vessel.envScore ?? "—"}
            meta={vessel.envScore ? "CII 2025 baseline" : "No CII score yet"}
          />
        </div>
      </div>

      {/* Row 2 — Profile + Technical Specs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <SectionTitle>Vessel Profile</SectionTitle>
            {/* Action chip is hard-anchored to the right edge of the
                tile header — `ml-auto` survives any future header
                content changes, and `shrink-0` keeps the chip from
                being squeezed when the title text grows. */}
            <span
              className={cn(
                "ml-auto inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
                tag.cls,
              )}
            >
              {tag.label}
            </span>
          </CardHeader>
          <dl className="grid gap-2 p-6 text-[12px]">
            <Row k="Vessel Name" v={vessel.name} />
            <Row k="IMO Number" v={vessel.imo} mono />
            <Row k="MMSI" v={vessel.mmsi} mono />
            <Row k="Call Sign" v={vessel.callSign} />
            <Row k="Flag State" v={vessel.flag?.name} />
            <Row k="Port of Registry" v={vessel.portOfRegistry?.name} />
            <Row
              k="Vessel Type"
              v={
                vessel.vesselType
                  ? `${vessel.vesselType.name}${vessel.vesselType.parent ? ` · ${vessel.vesselType.parent.name}` : ""}`
                  : null
              }
            />
            <Row k="Classification" v={vessel.classSociety?.name} />
            <Row
              k="Year Built"
              v={`${vessel.yearBuilt}${age > 0 ? ` (${age} years)` : ""}`}
            />
            <Row k="Shipyard" v={vessel.shipyard?.name} />
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle>Technical Specifications</SectionTitle>
          </CardHeader>
          <dl className="grid gap-2 p-6 text-[12px]">
            <Row k="Deadweight (DWT)" v={`${vessel.dwt.toLocaleString()} MT`} />
            <Row
              k="Gross Tonnage (GRT)"
              v={vessel.grt != null ? vessel.grt.toLocaleString() : null}
            />
            <Row
              k="Net Tonnage (NRT)"
              v={vessel.nrt != null ? vessel.nrt.toLocaleString() : null}
            />
            <Row
              k="Length Overall (LOA)"
              v={vessel.loaM != null ? `${vessel.loaM} m` : null}
            />
            <Row k="Beam" v={vessel.beamM != null ? `${vessel.beamM} m` : null} />
            <Row k="Max Draft" v={vessel.draftM != null ? `${vessel.draftM} m` : null} />
            <Row k="Main Engine" v={vessel.engineModel?.name} />
            <Row
              k="Design Speed"
              v={vessel.serviceSpeedKn != null ? `${vessel.serviceSpeedKn} kn` : null}
            />
            <Row k="Next Special Survey" v={fmtDate(vessel.nextSpecialSurvey)} />
          </dl>
        </Card>
      </div>

      {/* Rows 3+ — Employment, Sale Status, Certificates, Ownership and
          all the extended detail cards share a single responsive grid
          so tiles flow naturally without orphaning the last item on
          its own row. Row 2 (Profile + Technical Specs) is reserved as
          the always-2-column summary.

          Responsive breakpoints for this grid:
            - < 768 px  (mobile)            → 1 tile per row
            - 768–1079 px (tablet / small)  → 2 tiles per row
            - ≥ 1080 px (desktop)           → 3 tiles per row

          The 1080 px threshold is an arbitrary breakpoint (not one of
          Tailwind's defaults) so we drop to 2 columns slightly before
          `lg` (1024 px) would otherwise kick three columns in on
          narrow laptops where the tiles get cramped.

          The extended detail cards below mirror the edit form's
          sections so the user can scan every spec captured on
          `/vessels/[id]/edit` in read-only form. Type-specific
          sections render conditionally based on `vessel.typeRoot` so a
          bulk carrier doesn't see Tanker Equipment etc. Each tile also
          self-hides when it has no real data (`has(...)` check) so a
          vessel with mostly-empty columns doesn't render a wall of "—"
          placeholders — the grid reflows cleanly when individual
          tiles drop out. */}
      <div className="grid gap-4 md:grid-cols-2 min-[1080px]:grid-cols-3">
        <CurrentEmploymentCard vessel={vessel} />
        <SaleStatusCard vessel={vessel} />
        <CertificatesCard vessel={vessel} />
        <OwnershipHistoryCard vessel={vessel} />

      {/* Build & Delivery (universal) */}
      {has(
        vessel.builtCountry,
        vessel.shipyard?.name,
        vessel.yardNumber,
        vessel.deliveryDate,
        vessel.scrappedDate,
      ) ? (
        <SpecCard title="Build & Delivery">
          <Row k="Built Country" v={vessel.builtCountry} />
          <Row k="Shipyard" v={vessel.shipyard?.name} />
          <Row k="Yard Number" v={vessel.yardNumber} mono />
          <Row k="Delivery Date" v={fmtDate(vessel.deliveryDate)} />
          <Row k="Scrapped Date" v={fmtDate(vessel.scrappedDate)} />
        </SpecCard>
      ) : null}

      {/* Order Book — newbuilds only */}
      {vessel.orderBook ? (
        <SpecCard title="Order Book">
          <Row k="Status" v={vessel.orderBook.status} />
          <Row k="Order Date" v={fmtDate(vessel.orderBook.orderDate)} />
          <Row k="Construction Start" v={fmtDate(vessel.orderBook.constructionStartDate)} />
          <Row k="Launch Date" v={fmtDate(vessel.orderBook.launchDate)} />
          <Row k="Scheduled Delivery" v={fmtDate(vessel.orderBook.scheduledDeliveryDate)} />
          <Row k="Cancelled Date" v={fmtDate(vessel.orderBook.cancelledDate)} />
        </SpecCard>
      ) : null}

      {/* Type & Classification — hides when every field is empty. */}
      {has(
        vessel.builtForTrade,
        vessel.currentTrade,
        vessel.designModel,
        vessel.iceClass,
        vessel.propulsionType,
        vessel.cleanDirtyWilling,
      ) ? (
        <SpecCard title="Type & Classification">
          <Row k="Built For Trade" v={vessel.builtForTrade} />
          <Row k="Current Trade" v={vessel.currentTrade} />
          <Row k="Design Model" v={vessel.designModel} />
          <Row k="Ice Class" v={vessel.iceClass} />
          <Row k="Propulsion Type" v={vessel.propulsionType} />
          {vessel.cleanDirtyWilling ? (
            <Row k="Clean / Dirty Willing" v="Yes" />
          ) : null}
        </SpecCard>
      ) : null}

      {/* Tonnage — hides when every tonnage column is null. */}
      {has(
        vessel.grt,
        vessel.reducedGrt,
        vessel.nrt,
        vessel.panamaCanalNrt,
        vessel.suezCanalNrt,
      ) ? (
        <SpecCard title="Tonnage">
          <Row k="Gross Rated (GRT)" v={vessel.grt != null ? vessel.grt.toLocaleString() : null} />
          <Row k="Reduced Gross" v={vessel.reducedGrt != null ? vessel.reducedGrt.toLocaleString() : null} />
          <Row k="Net Rated (NRT)" v={vessel.nrt != null ? vessel.nrt.toLocaleString() : null} />
          <Row k="Panama Canal Net" v={vessel.panamaCanalNrt != null ? vessel.panamaCanalNrt.toLocaleString() : null} />
          <Row k="Suez Canal Net" v={vessel.suezCanalNrt != null ? vessel.suezCanalNrt.toLocaleString() : null} />
        </SpecCard>
      ) : null}

      {/* Cargo Capacity — BULK shows cubic/grain/bale, CONTAINER shows
          TEU. Hides when none of the relevant cells have values. */}
      {vessel.typeRoot === "BULK" &&
      has(vessel.cubicSizeM3, vessel.grainCapacityM3, vessel.baleCapacityM3) ? (
        <SpecCard title="Cargo Capacity">
          <Row k="Cubic Size" v={vessel.cubicSizeM3 != null ? `${vessel.cubicSizeM3.toLocaleString()} m³` : null} />
          <Row k="Grain Capacity" v={vessel.grainCapacityM3 != null ? `${vessel.grainCapacityM3.toLocaleString()} m³` : null} />
          <Row k="Bale Capacity" v={vessel.baleCapacityM3 != null ? `${vessel.baleCapacityM3.toLocaleString()} m³` : null} />
        </SpecCard>
      ) : null}
      {vessel.typeRoot === "CONTAINER" &&
      has(
        vessel.teu,
        vessel.teuAt14t,
        vessel.deckTeu,
        vessel.underDeckTeu,
        vessel.reefers,
      ) ? (
        <SpecCard title="Cargo Capacity">
          <Row k="TEU" v={vessel.teu != null ? vessel.teu.toLocaleString() : null} />
          <Row k="TEU @ 14t" v={vessel.teuAt14t != null ? vessel.teuAt14t.toLocaleString() : null} />
          <Row k="Deck TEU" v={vessel.deckTeu != null ? vessel.deckTeu.toLocaleString() : null} />
          <Row k="Under Deck TEU" v={vessel.underDeckTeu != null ? vessel.underDeckTeu.toLocaleString() : null} />
          <Row k="Reefers" v={vessel.reefers != null ? vessel.reefers.toLocaleString() : null} />
        </SpecCard>
      ) : null}

      {/* Holds, Hatches, Cranes & Grabs — BULK only, hides when empty. */}
      {vessel.typeRoot === "BULK" &&
      has(
        vessel.numHolds,
        vessel.numHatches,
        vessel.numCranes,
        vessel.numGrabs,
        vessel.cranesMaxOutreachM,
        vessel.cranesMaxLiftingT,
        equipmentSummary(vessel),
      ) ? (
        <SpecCard title="Holds, Hatches, Cranes & Grabs">
          <Row k="# Holds" v={vessel.numHolds} />
          <Row k="# Hatches" v={vessel.numHatches} />
          <Row k="# Cranes" v={vessel.numCranes} />
          <Row k="# Grabs" v={vessel.numGrabs} />
          <Row k="Cranes Max Outreach" v={vessel.cranesMaxOutreachM != null ? `${vessel.cranesMaxOutreachM} m` : null} />
          <Row k="Cranes Max Lifting" v={vessel.cranesMaxLiftingT != null ? `${vessel.cranesMaxLiftingT} t` : null} />
          <Row k="Equipment Fitted" v={equipmentSummary(vessel)} />
        </SpecCard>
      ) : null}

      {/* Parallel Body Length — BULK + TANKER, hides when empty. */}
      {(vessel.typeRoot === "BULK" || vessel.typeRoot === "TANKER") &&
      has(
        vessel.parallelBodyLadenM,
        vessel.parallelBodyBallastM,
        vessel.parallelBodyEmptyM,
      ) ? (
        <SpecCard title="Parallel Body Length">
          <Row k="Laden" v={vessel.parallelBodyLadenM != null ? `${vessel.parallelBodyLadenM} m` : null} />
          <Row k="Ballast" v={vessel.parallelBodyBallastM != null ? `${vessel.parallelBodyBallastM} m` : null} />
          <Row k="Empty" v={vessel.parallelBodyEmptyM != null ? `${vessel.parallelBodyEmptyM} m` : null} />
        </SpecCard>
      ) : null}

      {/* Manifold — TANKER only, hides when empty. */}
      {vessel.typeRoot === "TANKER" &&
      has(
        vessel.bowToCentreManifoldM,
        vessel.waterlineToManifoldM,
        vessel.deckToCentreManifoldM,
        vessel.railToCentreManifoldM,
      ) ? (
        <SpecCard title="Manifold">
          <Row k="Bow → Centre Manifold" v={vessel.bowToCentreManifoldM != null ? `${vessel.bowToCentreManifoldM} m` : null} />
          <Row k="Waterline → Manifold" v={vessel.waterlineToManifoldM != null ? `${vessel.waterlineToManifoldM} m` : null} />
          <Row k="Deck → Centre Manifold" v={vessel.deckToCentreManifoldM != null ? `${vessel.deckToCentreManifoldM} m` : null} />
          <Row k="Rail → Centre Manifold" v={vessel.railToCentreManifoldM != null ? `${vessel.railToCentreManifoldM} m` : null} />
        </SpecCard>
      ) : null}

      {/* Tanker Equipment — TANKER only, hides when empty.
          Boolean rows render only when true (avoids "No / No / No"). */}
      {vessel.typeRoot === "TANKER" &&
      has(
        vessel.imoType,
        vessel.inertGasSystem,
        vessel.crudeOilWashing,
        vessel.heatingCoils,
        vessel.ststCoating,
        vessel.epoxyCoating,
        vessel.zincCoating,
        vessel.marinelineCoating,
        vessel.interlineCoating,
      ) ? (
        <SpecCard title="Tanker Equipment">
          {vessel.imoType ? <Row k="IMO Type" v={`Type ${vessel.imoType}`} /> : null}
          {vessel.inertGasSystem ? <Row k="Inert Gas System (IGS)" v="Yes" /> : null}
          {vessel.crudeOilWashing ? <Row k="Crude Oil Washing (COW)" v="Yes" /> : null}
          {vessel.heatingCoils ? <Row k="Heating Coils" v="Fitted" /> : null}
          <Row k="STST Coating" v={vessel.ststCoating} />
          <Row k="Epoxy Coating" v={vessel.epoxyCoating} />
          <Row k="Zinc Coating" v={vessel.zincCoating} />
          <Row k="Marineline Coating" v={vessel.marinelineCoating} />
          <Row k="Interline Coating" v={vessel.interlineCoating} />
        </SpecCard>
      ) : null}

      {/* Bow Equipment — BULK + TANKER, hides when empty. */}
      {(vessel.typeRoot === "BULK" || vessel.typeRoot === "TANKER") &&
      has(
        vessel.numBowChainStoppers,
        vessel.numBowThrusters,
        vessel.bowChainStopperDetails,
        vessel.bowChainStoppersFitted,
      ) ? (
        <SpecCard title="Bow Equipment">
          <Row k="# Bow Chain Stoppers" v={vessel.numBowChainStoppers} />
          <Row k="# Bow Thrusters" v={vessel.numBowThrusters} />
          <Row k="Bow Chain Stopper Details" v={vessel.bowChainStopperDetails} />
          {vessel.bowChainStoppersFitted ? (
            <Row k="Bow Chain Stoppers Fitted" v="Yes" />
          ) : null}
        </SpecCard>
      ) : null}

      {/* Main Engine — hides when no engine info present. */}
      {has(
        vessel.engineModel?.name,
        vessel.engineManufacturer,
        vessel.enginePowerKw,
        vessel.engineRpm,
        vessel.mewisDuct,
        vessel.serviceSpeedKn,
      ) ? (
        <SpecCard title="Main Engine">
          <Row k="Model" v={vessel.engineModel?.name} />
          <Row k="Manufacturer" v={vessel.engineManufacturer} />
          <Row k="Power" v={vessel.enginePowerKw != null ? `${vessel.enginePowerKw.toLocaleString()} kW` : null} />
          <Row k="RPM" v={vessel.engineRpm} />
          <Row k="Mewis Duct" v={vessel.mewisDuct} />
          <Row k="Service Speed" v={vessel.serviceSpeedKn != null ? `${vessel.serviceSpeedKn} kn` : null} />
        </SpecCard>
      ) : null}

      {/* Gas Carrier — GAS only, hides when empty. */}
      {vessel.typeRoot === "GAS" &&
      has(
        vessel.gasContainmentType,
        vessel.minTemperatureC,
        vessel.maxPressureBar,
        vessel.carriesAmmonia,
        vessel.carriesVcm,
        vessel.carriesEthylene,
      ) ? (
        <SpecCard title="Gas Carrier">
          <Row k="Containment Type" v={vessel.gasContainmentType} />
          <Row k="Min Temperature" v={vessel.minTemperatureC != null ? `${vessel.minTemperatureC} °C` : null} />
          <Row k="Max Pressure" v={vessel.maxPressureBar != null ? `${vessel.maxPressureBar} bar` : null} />
          {vessel.carriesAmmonia ? <Row k="Carries Ammonia" v="Yes" /> : null}
          {vessel.carriesVcm ? <Row k="Carries VCM" v="Yes" /> : null}
          {vessel.carriesEthylene ? <Row k="Carries Ethylene" v="Yes" /> : null}
        </SpecCard>
      ) : null}

      {/* Environmental & Compliance — hides when no compliance data. */}
      {has(
        vessel.ghgRating,
        vessel.envScore,
        vessel.scrubbersInstalledDate,
        vessel.ballastWaterTreatmentSystem,
        vessel.neoPanamaLocks,
        vessel.sternLine,
        vessel.nextSpecialSurvey,
      ) ? (
        <SpecCard title="Environmental & Compliance">
          <Row k="GHG Rating" v={vessel.ghgRating} />
          <Row k="Env. Score" v={vessel.envScore} />
          <Row k="Scrubbers Installed" v={fmtDate(vessel.scrubbersInstalledDate)} />
          {vessel.ballastWaterTreatmentSystem ? <Row k="BWTS" v="Yes" /> : null}
          {vessel.neoPanamaLocks ? <Row k="Neo-Panama Locks" v="Yes" /> : null}
          {vessel.sternLine ? <Row k="Stern Line" v="Yes" /> : null}
          <Row k="Next Special Survey" v={fmtDate(vessel.nextSpecialSurvey)} />
        </SpecCard>
      ) : null}

      {/* Operators & Owners — hides when both fields are blank. */}
      {has(vessel.commercialOperator, vessel.beneficialOwner) ? (
        <SpecCard title="Operators & Owners">
          <Row k="Commercial Operator" v={vessel.commercialOperator} />
          <Row k="Beneficial Owner" v={vessel.beneficialOwner} />
        </SpecCard>
      ) : null}

      </div>{/* end of unified responsive tile grid (1/2/3-col by viewport) */}

      {/* Notes (if any) — stays full-width because it's prose, not
          name/value rows. */}
      {vessel.notes ? (
        <Card>
          <CardHeader>
            <SectionTitle>Notes</SectionTitle>
          </CardHeader>
          <p className="whitespace-pre-line p-6 text-[13px] text-foreground/90">
            {vessel.notes}
          </p>
        </Card>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * SpecCard — a thin Card wrapper that takes a title and a `<Row>` body.
 * Used by every read-only spec section on the Main Information tab so
 * the visual rhythm stays consistent (border, padding, title weight).
 * -------------------------------------------------------------------------- */
function SpecCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <SectionTitle>{title}</SectionTitle>
      </CardHeader>
      <dl className="grid gap-2 p-6 text-[12px]">{children}</dl>
    </Card>
  );
}

/** Short text summary of the "Equipment fitted" booleans (Geared, Grabs,
 *  Box-Shaped Holds, etc.) used on the Holds card. */
function equipmentSummary(vessel: VesselDetail): string | null {
  const fitted: string[] = [];
  if (vessel.isGeared) fitted.push("Geared");
  if (vessel.grabsFitted) fitted.push("Grabs");
  if (vessel.boxShapedHolds) fitted.push("Box-Shaped Holds");
  if (vessel.openHatch) fitted.push("Open Hatch");
  if (vessel.australianHoldLadder) fitted.push("Aust. Hold Ladder");
  if (vessel.logFitted) fitted.push("Log Fitted");
  if (vessel.a60Bulkhead) fitted.push("A60 Bulkhead");
  if (vessel.co2Fitted) fitted.push("CO₂ Fitted");
  return fitted.length === 0 ? null : fitted.join(" · ");
}

/* --------------------------------------------------------------------------
 * Hero card — vessel image (or gradient placeholder) + bottom overlay
 * -------------------------------------------------------------------------- */
function HeroCard({
  vessel,
  tag,
}: {
  vessel: VesselDetail;
  tag: (typeof TYPE_TAG)[TypeRoot];
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div
        data-testid="vessel-hero"
        className={cn(
          "relative isolate aspect-[4/3] w-full bg-gradient-to-br",
          tag.heroBg,
        )}
      >
        {vessel.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vessel.heroImageUrl}
            alt={vessel.name}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          // Placeholder when no hero image is on file — gradient + big ship icon
          <div className="absolute inset-0 flex items-center justify-center">
            <Ship className="size-24 text-foreground/30" aria-hidden />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-extrabold",
              tag.cls,
            )}
          >
            <Anchor className="size-3" /> {tag.label}
          </span>
        </div>
        {/* ON-SALE badge — overlays the hero image (not the Sale Status
            tile) so the market state is obvious at a glance. Solid
            magenta pill, white text, soft ring + animated dot to draw
            the eye. */}
        {vessel.isOnSale ? (
          <div className="absolute left-3 top-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-signal-magenta px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-foreground shadow-md ring-2 ring-signal-magenta/30"
              data-testid="vessel-hero-on-sale"
            >
              <span
                aria-hidden
                className="inline-block size-1.5 animate-pulse rounded-full bg-primary-foreground"
              />
              On Sale
            </span>
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
          <div className="text-[16px] font-extrabold tracking-tight text-white">
            {vessel.name}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-white/75">
            <span>IMO {vessel.imo}</span>
            <span>·</span>
            <span>{vessel.vesselType?.name ?? "Vessel"}</span>
            <span>·</span>
            <span>Built {vessel.yearBuilt}</span>
            {vessel.flag ? (
              <>
                <span>·</span>
                <span>{vessel.flag.name}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------
 * Stat / KPI / Row primitives
 * -------------------------------------------------------------------------- */
function KpiCard({
  accent,
  label,
  value,
  meta,
}: {
  accent: string;
  label: string;
  value: React.ReactNode;
  meta?: string;
}) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-md border bg-card p-4 shadow-sm">
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", accent)} />
      <div className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-[20px] font-extrabold leading-tight tracking-[-0.4px] tabular-nums">
        {value}
      </div>
      {meta ? (
        <div className="mt-0.5 text-[11px] text-muted-foreground">{meta}</div>
      ) : null}
    </div>
  );
}

function Row({
  k,
  v,
  mono,
}: {
  k: string;
  v: React.ReactNode | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b pb-1.5 last:border-0 last:pb-0">
      <dt className="text-[11px] text-muted-foreground">{k}</dt>
      <dd
        className={cn(
          "text-right text-[12px] font-semibold",
          mono && "font-mono tabular-nums",
        )}
      >
        {v == null || v === "" ? (
          <span className="font-normal text-muted-foreground">—</span>
        ) : (
          v
        )}
      </dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-bold">{children}</div>;
}

/* --------------------------------------------------------------------------
 * Current Employment — placeholder until the Employment model lands (M02)
 * -------------------------------------------------------------------------- */
function CurrentEmploymentCard({ vessel }: { vessel: VesselDetail }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <SectionTitle>Current Employment</SectionTitle>
        {/* `ml-auto` pins the status badge to the right edge of the
            tile header even if the SectionTitle ever wraps or grows. */}
        <EmploymentBadge
          status={vessel.employmentStatus}
          className="ml-auto shrink-0"
        />
      </CardHeader>
      <div className="space-y-2 p-6 text-[12px]">
        <div className="rounded-md border border-dashed bg-muted/30 p-3 text-[11px] text-muted-foreground">
          Charterer, daily rate, voyage details, and TC schedule will appear
          here once the <strong className="font-semibold text-foreground">Employment</strong>{" "}
          and <strong className="font-semibold text-foreground">Charterer</strong> models
          ship (M02 — OT-176+).
        </div>
        <Row
          k="Employment Status"
          v={vessel.employmentStatus.replace(/_/g, " ")}
        />
        <Row k="Lifecycle" v={vessel.lifecycleStatus.replace(/_/g, " ")} />
        {/* On Sale moved to a dedicated `<SaleStatusCard>` tile in Row 3
            so the ON-SALE banner is properly surfaced. */}
      </div>
    </Card>
  );
}

/**
 * SaleStatusCard — dedicated tile for the vessel's sale state. Renders
 * a prominent ON-SALE banner with the listed-at date + asking-reference
 * (current FMV) when the vessel is on the market; a quiet "Not on
 * market" state otherwise so the tile still shows up consistently in
 * the row 3 grid.
 */
function SaleStatusCard({ vessel }: { vessel: VesselDetail }) {
  const askingRef = vessel.currentFmvUsd != null
    ? usdShort(vessel.currentFmvUsd)
    : null;
  return (
    <Card>
      <CardHeader>
        <SectionTitle>Sale Status</SectionTitle>
      </CardHeader>
      {/* The prominent ON-SALE badge now lives on the vessel hero image
          (see HeroCard) — this tile focuses on the data: listed-at,
          asking ref, outstanding loan, or — if not on market —
          acquisition history. A quiet "Not on market" sub-label keeps
          the off-market state legible without a heavy pill. */}
      <div className="space-y-2 p-6 text-[12px]">
        {vessel.isOnSale ? (
          <>
            <div className="text-[11px] text-muted-foreground">
              Vessel is currently on the market.
            </div>
            <Row k="Listed-at" v={fmtDate(vessel.onSaleAt)} />
            <Row k="Asking Reference" v={askingRef} />
            <Row
              k="Outstanding Loan"
              v={
                vessel.outstandingLoanUsd != null
                  ? usdShort(vessel.outstandingLoanUsd)
                  : null
              }
            />
          </>
        ) : (
          <>
            <div className="text-[11px] text-muted-foreground">
              Not on market.
            </div>
            <Row k="Current FMV" v={askingRef} />
            <Row
              k="Acquisition Cost"
              v={
                vessel.acquisitionCostUsd != null
                  ? usdShort(vessel.acquisitionCostUsd)
                  : null
              }
            />
            <Row k="Acquired On" v={fmtDate(vessel.acquisitionDate)} />
          </>
        )}
      </div>
    </Card>
  );
}

function EmploymentBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const map: Record<string, string> = {
    CURRENT_EARNINGS: "bg-primary/12 text-primary",
    HISTORIC_EARNINGS: "bg-signal-purple/15 text-signal-purple",
    FUTURE_EARNINGS: "bg-signal-green/15 text-signal-green",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
        map[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* --------------------------------------------------------------------------
 * Certificates & Documents — real chips when seeded, placeholder otherwise
 * -------------------------------------------------------------------------- */
function CertificatesCard({ vessel }: { vessel: VesselDetail }) {
  return (
    <Card>
      <CardHeader>
        <SectionTitle>Certificates &amp; Documents</SectionTitle>
      </CardHeader>
      <div className="p-6">
        {vessel.certificates.length === 0 ? (
          <div className="rounded-md border border-dashed bg-muted/30 p-3 text-[11px] text-muted-foreground">
            Class, ISM, MLC, IOPP and P&amp;I certificates appear here once
            uploaded. (Adding certificates lands with M06 Vessel Detail edit.)
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {vessel.certificates.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded border bg-card px-2.5 py-1.5 text-[12px]"
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    c.status === "ok" && "bg-signal-green",
                    c.status === "warn" && "bg-signal-orange",
                    c.status === "expired" && "bg-signal-magenta",
                  )}
                />
                <span className="flex-1 truncate font-semibold">{c.label}</span>
                {c.expiresAt ? (
                  <span className="text-[11px] text-muted-foreground">
                    {fmtMonth(c.expiresAt)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------
 * Ownership History — current + previous owners
 * -------------------------------------------------------------------------- */
function OwnershipHistoryCard({ vessel }: { vessel: VesselDetail }) {
  return (
    <Card>
      <CardHeader>
        <SectionTitle>Ownership History</SectionTitle>
      </CardHeader>
      <div className="p-6">
        {vessel.ownershipHistory.length === 0 ? (
          <div className="rounded-md border border-dashed bg-muted/30 p-3 text-[11px] text-muted-foreground">
            Previous owners and acquisition dates appear here once recorded.
            (Adding ownership history lands with M06 Vessel Detail edit.)
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {vessel.ownershipHistory.map((o) => (
              <li
                key={o.id}
                className={cn(
                  "rounded-md border-l-[3px] bg-muted/30 p-2.5",
                  o.isCurrent ? "border-l-primary" : "border-l-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-foreground">
                    {o.ownerName}
                  </span>
                  {o.isCurrent ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      Current
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {fmtMonth(o.fromDate)} — {o.toDate ? fmtMonth(o.toDate) : "Present"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------
 * Coming-soon placeholder for the other 7 tabs
 * -------------------------------------------------------------------------- */
function ComingInModulePlaceholder({
  tabLabel,
  moduleName,
}: {
  tabLabel: string;
  moduleName: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 px-6 py-20 text-center">
      <FileSpreadsheet className="size-10 text-muted-foreground" />
      <div className="text-[14px] font-bold">{tabLabel} — coming soon</div>
      <p className="max-w-md text-[12px] text-muted-foreground">
        This panel will be populated by <strong className="font-semibold text-foreground">{moduleName}</strong>.
        The schema, data sources, and visualisations live in a follow-up ticket.
        For now, the tab is here so the navigation matches the prototype.
      </p>
      <Link
        href="/fleetspace"
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
      >
        Back to Fleets <ChevronRight className="size-3" />
      </Link>
    </div>
  );
}
