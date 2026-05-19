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
import { EnvScoreBadge } from "@/components/app/env-score-badge";
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

const usd = (n: number | null) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);

const usdShort = (n: number | null) => {
  if (n == null) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const fmtDate = (d: Date | null) =>
  d == null
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d);

const fmtMonth = (d: Date | null) =>
  d == null
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "numeric",
      }).format(d);

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
          <CardHeader className="flex flex-row items-center justify-between">
            <SectionTitle>Vessel Profile</SectionTitle>
            <span
              className={cn(
                "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold",
                tag.cls,
              )}
            >
              {tag.label}
            </span>
          </CardHeader>
          <dl className="grid gap-2 p-4 pt-0 text-[12px]">
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
          <dl className="grid gap-2 p-4 pt-0 text-[12px]">
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

      {/* Row 3 — Employment + Certificates + Ownership */}
      <div className="grid gap-4 lg:grid-cols-3">
        <CurrentEmploymentCard vessel={vessel} />
        <CertificatesCard vessel={vessel} />
        <OwnershipHistoryCard vessel={vessel} />
      </div>

      {/* Notes (if any) */}
      {vessel.notes ? (
        <Card>
          <CardHeader>
            <SectionTitle>Notes</SectionTitle>
          </CardHeader>
          <p className="whitespace-pre-line p-4 pt-0 text-[13px] text-foreground/90">
            {vessel.notes}
          </p>
        </Card>
      ) : null}
    </div>
  );
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
      <CardHeader className="flex flex-row items-center justify-between">
        <SectionTitle>Current Employment</SectionTitle>
        <EmploymentBadge status={vessel.employmentStatus} />
      </CardHeader>
      <div className="space-y-2 p-4 pt-0 text-[12px]">
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
        <Row k="On Sale" v={vessel.isOnSale ? "Yes" : "No"} />
        {vessel.isOnSale ? (
          <Row k="Listed-at" v={fmtDate(vessel.onSaleAt)} />
        ) : null}
      </div>
    </Card>
  );
}

function EmploymentBadge({ status }: { status: string }) {
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
      <div className="p-4 pt-0">
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
      <div className="p-4 pt-0">
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
