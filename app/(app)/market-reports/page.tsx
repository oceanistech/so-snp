import {
  Bell,
  Bookmark,
  Download,
  FileText,
  Search,
  Share2,
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
  ReportCard,
  type Report,
} from "@/components/app/report-card";
import { SegmentInsightPanel } from "@/components/app/segment-insight-panel";
import { PageTabs, type PageTabItem } from "@/components/app/page-tabs";
import { cn } from "@/lib/utils";
import {
  ALL_REPORTS,
  SP_REPORTS,
  FREIGHT_REPORTS,
  ESG_REPORTS,
  MACRO_REPORTS,
  SAVED_REPORTS,
  SAVED_SEARCHES,
  SUBSCRIPTIONS,
  TYPE_OPTIONS,
  RANGE_OPTIONS,
} from "./_data";

/**
 * Market Reports — research, outlooks and sector analyses.
 *
 * This page is a **server component**. The only interactive part is the
 * top-level tab strip, which lives inside `<PageTabs>` (a tiny client
 * island). The mock report data lives in a sibling `_data.ts` module so it
 * never ships in the client bundle — RSC serializes the rendered output.
 */

type TabId = "all" | "sp" | "freight" | "esg" | "macro" | "saved";

export default function MarketReportsPage() {
  const tabs: ReadonlyArray<PageTabItem<TabId>> = [
    { id: "all",     label: "All Reports", content: <AllReportsPanel /> },
    { id: "sp",      label: "S&P",         content: <CategoryPanel reports={SP_REPORTS}      placeholder="Search S&P reports…"     defaultRange="Last 90D" /> },
    { id: "freight", label: "Freight",     content: <CategoryPanel reports={FREIGHT_REPORTS} placeholder="Search freight reports…" defaultRange="Last 90D" /> },
    { id: "esg",     label: "ESG",         content: <CategoryPanel reports={ESG_REPORTS}     placeholder="Search ESG reports…"     defaultRange="Last 12M" rangeOptions={["All Time", "Last 12M", "Last 6M"]} /> },
    { id: "macro",   label: "Macro",       content: <CategoryPanel reports={MACRO_REPORTS}   placeholder="Search macro reports…"   defaultRange="Last 6M"  rangeOptions={["All Time", "Last 6M", "Last 12M"]} /> },
    { id: "saved",   label: "Saved",       content: <SavedPanel /> },
  ];

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "Market Reports" }]}
        title="Market Reports"
        subtitle="Research reports, market outlooks and sector analyses from Signal Ocean Intelligence"
        actions={
          <>
            <SegmentPills />
            <Button variant="outline" className="gap-2">
              <Bell className="size-3.5" />
              Manage Alerts
            </Button>
            <Button className="gap-2">
              <Bookmark className="size-3.5" />
              My Saved Reports
            </Button>
          </>
        }
      />

      <PageTabs tabs={tabs} defaultActive="all" />
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — All Reports
 * -------------------------------------------------------------------------- */

function AllReportsPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <SegmentInsightPanel />
      {/* Filter bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports by title or topic…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <FilterSelect options={TYPE_OPTIONS} />
          <FilterSelect options={RANGE_OPTIONS} active="Last 30D" />
          <Button size="sm" variant="outline" className="ml-auto gap-2">
            <Bookmark className="size-3.5" />
            Save Search
          </Button>
        </div>
      </Card>

      {/* Stats row */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Reports"        value="342" meta="All time in library"      accent="blue"   />
        <KpiCard label="New This Month"        value="14"  direction="up" change="+3 vs last month" accent="green"  />
        <KpiCard label="Saved by Me"           value="7"   meta="Across all categories"   accent="orange" />
        <KpiCard label="Active Subscriptions"  value="3"   meta="Auto-delivered reports"  accent="cyan"   />
      </section>

      {/* Featured report */}
      <Card
        className="overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--signal-green) / 0.08))",
          borderColor: "hsl(var(--primary) / 0.25)",
        }}
      >
        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              Quarterly Outlook · March 2026
            </span>
            <h2 className="text-[20px] font-extrabold leading-tight tracking-tight">
              Q1 2026 Dry Bulk Market Outlook
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Signal Ocean Intelligence Team · Published March 20, 2026
            </p>
            <p className="max-w-2xl text-[13px] leading-relaxed text-foreground/80">
              Dry bulk shipping navigates headwinds from softening Chinese steel
              demand, partially offset by the recovery of Brazilian iron ore
              export volumes. BDI averaged 1,247 in Q1, 14% below Q4 2025.
              Capesize TCE averaged $19,400/day. For Q2 2026, we forecast
              Capesize TCE in the $18,000–$22,000/day range, contingent on
              Chinese infrastructure stimulus…
            </p>
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {["Dry Bulk", "Capesize", "BDI", "China"].map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-stretch gap-2 lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-2 lg:flex-col">
              <Button className="gap-2">
                <FileText className="size-3.5" />
                Read Full Report
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="size-3.5" />
                Download PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="size-3.5" />
                Share
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground lg:text-right">
              24 pages · 1,840 downloads
            </p>
          </div>
        </div>
      </Card>

      {/* Reports grid */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ALL_REPORTS.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </section>

      {/* Pagination */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Showing 1–{ALL_REPORTS.length} of 342
        </span>
        <div className="flex items-center gap-1">
          <button
            className="rounded-md border px-2 py-1 hover:bg-card disabled:opacity-50"
            disabled
          >
            Previous
          </button>
          <span className="rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">
            1
          </span>
          <button className="rounded-md border px-2 py-1 hover:bg-card">2</button>
          <button className="rounded-md border px-2 py-1 hover:bg-card">3</button>
          <span className="px-1">…</span>
          <button className="rounded-md border px-2 py-1 hover:bg-card">43</button>
          <button className="rounded-md border px-2 py-1 hover:bg-card">Next</button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tabs 2-5 — category panels with the same skeleton (filter + grid)
 * -------------------------------------------------------------------------- */

function CategoryPanel({
  reports,
  placeholder,
  defaultRange,
  rangeOptions = ["All Time", "Last 90D", "Last 30D"],
}: {
  reports: Report[];
  placeholder: string;
  defaultRange: string;
  rangeOptions?: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-6 p-8">
      <SegmentInsightPanel />
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={placeholder}
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <FilterSelect options={rangeOptions} active={defaultRange} />
          <Button size="sm" variant="outline" className="ml-auto gap-2">
            <Bookmark className="size-3.5" />
            Save Search
          </Button>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </section>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 6 — Saved
 * -------------------------------------------------------------------------- */

function SavedPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <SegmentInsightPanel />
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">My Saved Reports</CardTitle>
          <CardDescription>
            Reports you have bookmarked for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SAVED_REPORTS.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </section>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Saved Searches</CardTitle>
          <CardDescription>
            Reuse saved filters and get notified on new matches
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Search Name</th>
                <th className="px-3 py-2 text-left">Filters</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Last Match</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {SAVED_SEARCHES.map((s) => (
                <tr key={s.name} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-semibold">{s.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.filters}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.created}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.lastMatch}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]">
                      Run
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">My Subscriptions</CardTitle>
          <CardDescription>
            Auto-delivered report series — manage delivery preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="py-3">
          <ul className="divide-y">
            {SUBSCRIPTIONS.map((s) => (
              <li
                key={s.title}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">{s.cadence}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    s.status === "Active"
                      ? "bg-signal-green/15 text-signal-green"
                      : "bg-signal-orange/15 text-signal-orange",
                  )}
                >
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t pt-3">
            <Button size="sm" variant="outline">
              Manage Subscriptions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers — both server-renderable (no event handlers, no hooks).
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

function FilterSelect({
  options,
  active,
}: {
  options: readonly string[];
  active?: string;
}) {
  return (
    <select
      defaultValue={active}
      className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
