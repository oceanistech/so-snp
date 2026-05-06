"use client";

import * as React from "react";
import {
  AlertTriangle,
  Bell,
  Construction,
  Download,
  MapPin,
  Pencil,
  Plus,
  TrendingDown,
  TrendingUp,
  Trash2,
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
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock data — mirrors html/notifications.html
 * -------------------------------------------------------------------------- */

/* ── Tab 1 · FMV Alerts (overview) ───────────────────────────────── */

type FmvRule = {
  vessel: string;
  imo: string;
  currentFmv: string;
  condition: "Above" | "Below";
  threshold: string;
  status: "Active" | "Triggered";
};

const FMV_RULES: FmvRule[] = [
  { vessel: "MV Pacific Star",  imo: "9876543", currentFmv: "$28.5M", condition: "Below", threshold: "$25.0M", status: "Active"    },
  { vessel: "MT Aegean Wind",   imo: "9345671", currentFmv: "$41.2M", condition: "Above", threshold: "$45.0M", status: "Active"    },
  { vessel: "MV Nordic Cape",   imo: "9512340", currentFmv: "$33.8M", condition: "Below", threshold: "$30.0M", status: "Triggered" },
  { vessel: "MV Blue Star",     imo: "9623891", currentFmv: "$52.4M", condition: "Above", threshold: "$55.0M", status: "Active"    },
];

type LtvCovenantRow = {
  vessel: string;
  loanValue: string;
  currentFmv: string;
  currentLtv: string;
  ltvLimit: string;
  buffer: string;
  bufferTone: "pos" | "neg";
  status: "OK" | "Watch" | "Breach";
  urgent?: boolean;
};

const LTV_COVENANT_ROWS: LtvCovenantRow[] = [
  { vessel: "MV Pacific Star", loanValue: "$18.0M", currentFmv: "$28.5M", currentLtv: "63.2%", ltvLimit: "70%", buffer: "+6.8pp", bufferTone: "pos", status: "OK"     },
  { vessel: "MT Horizon",      loanValue: "$14.0M", currentFmv: "$22.1M", currentLtv: "63.3%", ltvLimit: "70%", buffer: "+6.7pp", bufferTone: "pos", status: "Watch"  },
  { vessel: "MV Nordic Cape",  loanValue: "$25.0M", currentFmv: "$33.8M", currentLtv: "74.0%", ltvLimit: "70%", buffer: "−4.0pp", bufferTone: "neg", status: "Breach", urgent: true },
];

type MarketIndexRow = {
  index: string;
  current: string;
  condition: "Above" | "Below";
  threshold: string;
  lastTriggered: string;
  status: "Active" | "Pending";
};

const MARKET_INDEX_ROWS: MarketIndexRow[] = [
  { index: "SOFR 3M",        current: "5.41%",   condition: "Above", threshold: "5.50%",  lastTriggered: "Never",       status: "Pending" },
  { index: "EURIBOR 6M",     current: "3.85%",   condition: "Below", threshold: "3.50%",  lastTriggered: "2026-01-15",  status: "Active"  },
  { index: "USD/EUR",        current: "1.0842",  condition: "Above", threshold: "1.10",   lastTriggered: "Never",       status: "Active"  },
  { index: "BDI",            current: "1,247",   condition: "Below", threshold: "1,100",  lastTriggered: "2025-11-20",  status: "Active"  },
  { index: "Baltic Panamax", current: "986",     condition: "Above", threshold: "1,050",  lastTriggered: "Never",       status: "Pending" },
];

type GeoZone = {
  name: string;
  meta: string;
  status: "Active" | "Active-Med" | "Active-Low";
};

const GEO_ZONES: GeoZone[] = [
  { name: "Gulf of Aden",         meta: "High Risk · 3 vessels",   status: "Active"     },
  { name: "Strait of Hormuz",     meta: "Medium Risk · 1 vessel",  status: "Active-Med" },
  { name: "Mediterranean Custom", meta: "Low Risk · 5 vessels",    status: "Active-Low" },
];

type TrackedVessel = {
  name: string;
  location: string;
  inRisk: boolean;
};

const TRACKED_VESSELS: TrackedVessel[] = [
  { name: "MV Pacific Star", location: "Pacific Ocean",  inRisk: false },
  { name: "MT Aegean Wind",  location: "Mediterranean",  inRisk: false },
  { name: "MV Nordic Cape",  location: "Gulf of Aden",   inRisk: true  },
];

type FeedItem = {
  icon: "pin" | "trend-down" | "warn" | "trend-up";
  text: string;
  time: string;
};

const RECENT_ALERTS: FeedItem[] = [
  { icon: "pin",        text: "MV Nordic Cape entered Gulf of Aden",     time: "2h ago" },
  { icon: "trend-down", text: "MV Nordic Cape FMV dropped below $34M",   time: "1d ago" },
  { icon: "warn",       text: "LTV breach: MV Nordic Cape (74.0%)",      time: "2d ago" },
  { icon: "trend-up",   text: "EURIBOR 6M crossed 3.85%",                time: "5d ago" },
];

/* ── Tab 2 · LTV Covenant ────────────────────────────────────────── */

type LtvLoanRow = {
  vessel: string;
  loanId: string;
  balance: string;
  currentFmv: string;
  currentLtv: string;
  ltvLimit: string;
  buffer: string;
  bufferTone: "pos" | "neg";
  daysToBreach: string;
  daysTone: "muted" | "orange";
  status: "OK" | "Watch" | "Breach";
};

const LTV_LOANS: LtvLoanRow[] = [
  { vessel: "Pacific Star", loanId: "LN-2024-008", balance: "$17.5M", currentFmv: "$28.5M",  currentLtv: "61.4%", ltvLimit: "70%", buffer: "+8.6pp",  bufferTone: "pos", daysToBreach: "180d",  daysTone: "muted",  status: "OK"    },
  { vessel: "Aegean Wind",  loanId: "LN-2023-015", balance: "$28.5M", currentFmv: "$41.2M",  currentLtv: "69.2%", ltvLimit: "75%", buffer: "+5.8pp",  bufferTone: "pos", daysToBreach: "60d",   daysTone: "orange", status: "Watch" },
  { vessel: "Nordic Cape",  loanId: "LN-2022-021", balance: "$21.1M", currentFmv: "$33.8M",  currentLtv: "62.4%", ltvLimit: "70%", buffer: "+7.6pp",  bufferTone: "pos", daysToBreach: "N/A",   daysTone: "muted",  status: "OK"    },
  { vessel: "MT Horizon",   loanId: "LN-2024-011", balance: "$13.9M", currentFmv: "$22.1M",  currentLtv: "62.9%", ltvLimit: "70%", buffer: "+7.1pp",  bufferTone: "pos", daysToBreach: "N/A",   daysTone: "muted",  status: "OK"    },
  { vessel: "LNG Pioneer",  loanId: "LN-2025-003", balance: "$90.0M", currentFmv: "$185.0M", currentLtv: "48.6%", ltvLimit: "65%", buffer: "+16.4pp", bufferTone: "pos", daysToBreach: "N/A",   daysTone: "muted",  status: "OK"    },
];

/* ── Tab 3 · Market Indices ─────────────────────────────────────── */

type IndexSnapshot = {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down";
};

const INDEX_SNAPSHOT: IndexSnapshot[] = [
  { label: "BDI",             value: "1,247",  change: "+12",     direction: "up"   },
  { label: "Baltic Panamax",  value: "986",    change: "+8",      direction: "up"   },
  { label: "Baltic Supramax", value: "1,124",  change: "−5",      direction: "down" },
  { label: "SOFR 3M",         value: "5.41%",  change: "−0.02pp", direction: "down" },
  { label: "EURIBOR 6M",      value: "3.85%",  change: "+0.01pp", direction: "up"   },
  { label: "USD/EUR",         value: "1.0842", change: "−0.0018", direction: "down" },
];

type IndexAlertRow = {
  index: string;
  current: string;
  direction: "up" | "down";
  directionLabel: "Rising" | "Falling";
  threshold: string;
  tolerance: string;
  notifyWhen: string;
  channels: string;
  lastTriggered: string;
  lastTone: "muted" | "orange";
  status: "Monitoring" | "Triggered";
};

const INDEX_ALERTS: IndexAlertRow[] = [
  { index: "BDI",            current: "1,247",  direction: "up",   directionLabel: "Rising",  threshold: "1,300",  tolerance: "±25",      notifyWhen: "Rises above 1,300",  channels: "Email + In-app", lastTriggered: "Mar 10, 2026", lastTone: "muted",  status: "Monitoring" },
  { index: "Baltic Panamax", current: "986",    direction: "up",   directionLabel: "Rising",  threshold: "900",    tolerance: "±15",      notifyWhen: "Falls below 900",    channels: "Email",          lastTriggered: "—",            lastTone: "muted",  status: "Monitoring" },
  { index: "SOFR 3M",        current: "5.41%",  direction: "down", directionLabel: "Falling", threshold: "5.00%",  tolerance: "±0.05pp",  notifyWhen: "Falls below 5.00%",  channels: "Email + In-app", lastTriggered: "—",            lastTone: "muted",  status: "Monitoring" },
  { index: "EURIBOR 6M",     current: "3.85%",  direction: "up",   directionLabel: "Rising",  threshold: "4.20%",  tolerance: "±0.10pp",  notifyWhen: "Rises above 4.20%",  channels: "In-app",         lastTriggered: "Mar 15, 2026", lastTone: "orange", status: "Triggered"  },
];

/* ── Tab 4 · Exchange Rates ─────────────────────────────────────── */

type FxRate = {
  pair: string;
  value: string;
  change: string;
  direction: "up" | "down";
};

const FX_RATES: FxRate[] = [
  { pair: "USD / EUR", value: "0.9224", change: "−0.0018 (−0.19%)", direction: "down" },
  { pair: "USD / GBP", value: "0.7891", change: "−0.0024 (−0.30%)", direction: "down" },
  { pair: "USD / JPY", value: "149.82", change: "+0.43 (+0.29%)",   direction: "up"   },
  { pair: "USD / NOK", value: "10.612", change: "+0.038 (+0.36%)",  direction: "up"   },
  { pair: "USD / SGD", value: "1.3448", change: "−0.0021 (−0.16%)", direction: "down" },
  { pair: "USD / CNY", value: "7.2381", change: "+0.0140 (+0.19%)", direction: "up"   },
  { pair: "EUR / USD", value: "1.0842", change: "+0.0020 (+0.18%)", direction: "up"   },
  { pair: "EUR / NOK", value: "11.505", change: "−0.055 (−0.48%)",  direction: "down" },
];

type FxAlertRow = {
  pair: string;
  current: string;
  direction: "up" | "down";
  directionLabel: "Rising" | "Falling" | "Weakening";
  threshold: string;
  tolerance: string;
  condition: string;
  channels: string;
  lastTriggered: string;
  lastTone: "muted" | "orange";
  status: "Monitoring" | "Triggered";
};

const FX_ALERTS: FxAlertRow[] = [
  { pair: "USD / EUR", current: "0.9224", direction: "down", directionLabel: "Weakening", threshold: "0.9000",  tolerance: "±0.005", condition: "Falls below 0.9000",  channels: "Email + In-app", lastTriggered: "—",            lastTone: "muted",  status: "Monitoring" },
  { pair: "USD / JPY", current: "149.82", direction: "up",   directionLabel: "Rising",    threshold: "152.00",  tolerance: "±0.50",  condition: "Rises above 152.00",  channels: "Email + In-app", lastTriggered: "—",            lastTone: "muted",  status: "Monitoring" },
  { pair: "EUR / USD", current: "1.0842", direction: "up",   directionLabel: "Rising",    threshold: "1.1000",  tolerance: "±0.005", condition: "Rises above 1.1000",  channels: "In-app",         lastTriggered: "Feb 18, 2026", lastTone: "muted",  status: "Monitoring" },
  { pair: "USD / NOK", current: "10.612", direction: "up",   directionLabel: "Rising",    threshold: "11.000",  tolerance: "±0.050", condition: "Rises above 11.000",  channels: "Email",          lastTriggered: "Mar 20, 2026", lastTone: "orange", status: "Triggered"  },
];

const FX_PORTFOLIO_IMPACT = [
  { label: "USD Loan Repayments (EUR)", value: "€4.28M", meta: "Annual principal + interest", delta: "+€82k vs 3M ago (USD/EUR shift)", deltaTone: "magenta" as const },
  { label: "TC Revenue (USD → EUR)",     value: "€5.89M", meta: "Annualised TC income converted", delta: "+€105k vs 3M ago",                deltaTone: "green"   as const },
  { label: "FX Net Effect (Annual)",     value: "+€23k",  meta: "Revenue gain minus cost increase", delta: "Based on current spot rates",   deltaTone: "muted"   as const },
];

/* ── Tab 5 · Geo-Alerts ──────────────────────────────────────────── */

type GeoZoneRow = {
  zone: string;
  risk: "High" | "Medium" | "Low";
  coverage: string;
  vessels: number;
  alertType: string;
  status: "Active";
};

const GEO_ZONE_ROWS: GeoZoneRow[] = [
  { zone: "Gulf of Aden",      risk: "High",   coverage: "Polygon",       vessels: 3, alertType: "Entry + Exit", status: "Active" },
  { zone: "Strait of Hormuz",  risk: "Medium", coverage: "Polygon",       vessels: 1, alertType: "Entry",        status: "Active" },
  { zone: "Med Custom",        risk: "Low",    coverage: "Circle 200nm",  vessels: 5, alertType: "Entry",        status: "Active" },
];

type GeoTracking = {
  vessel: string;
  position: string;
  status: "In Zone" | "Monitoring" | "Near Zone" | "Clear";
};

const GEO_TRACKING: GeoTracking[] = [
  { vessel: "MV Pacific Star", position: "12.3°N, 44.1°E — Gulf of Aden",       status: "In Zone"    },
  { vessel: "MV Aegean Wind",  position: "36.5°N, 14.7°E — Mediterranean",      status: "Monitoring" },
  { vessel: "MT Nordic Cape",  position: "26.1°N, 56.3°E — Strait of Hormuz",   status: "Near Zone"  },
  { vessel: "MT Horizon",      position: "1.2°N, 103.8°E — Singapore Strait",   status: "Clear"      },
  { vessel: "LNG Pioneer",     position: "29.5°N, 48.2°E — Kuwait",              status: "Clear"      },
];

/* ── Tab 6 · Alert History ───────────────────────────────────────── */

type HistoryRow = {
  date: string;
  time: string;
  type: "FMV" | "LTV" | "Index" | "Geo";
  vesselIndex: string;
  condition: string;
  valueAtTrigger: string;
  threshold: string;
  status: "Triggered" | "Active" | "Dismissed";
  action: "Dismiss" | "Review" | "View";
};

const HISTORY_ROWS: HistoryRow[] = [
  { date: "Mar 24, 2026", time: "09:14", type: "Geo",   vesselIndex: "MV Pacific Star",  condition: "Entered Gulf of Aden zone",         valueAtTrigger: "12.3°N, 44.1°E", threshold: "Zone boundary",   status: "Triggered", action: "Dismiss" },
  { date: "Mar 22, 2026", time: "11:45", type: "LTV",   vesselIndex: "Aegean Wind",       condition: "LTV > 68% (60d warning)",          valueAtTrigger: "69.2%",          threshold: "75% limit",       status: "Active",    action: "Review"  },
  { date: "Mar 20, 2026", time: "08:02", type: "FMV",   vesselIndex: "MT Nordic Cape",    condition: "FMV dropped >5% in 30d",           valueAtTrigger: "$33.8M",         threshold: "$35.5M (−5%)",    status: "Dismissed", action: "View"    },
  { date: "Mar 18, 2026", time: "15:30", type: "Index", vesselIndex: "EURIBOR 6M",        condition: "Crossed 3.80% threshold",          valueAtTrigger: "3.85%",          threshold: "3.80%",           status: "Dismissed", action: "View"    },
  { date: "Mar 15, 2026", time: "10:11", type: "Geo",   vesselIndex: "MT Nordic Cape",    condition: "Approaching Strait of Hormuz",     valueAtTrigger: "26.1°N, 56.3°E", threshold: "50nm boundary",   status: "Dismissed", action: "View"    },
  { date: "Mar 12, 2026", time: "07:58", type: "FMV",   vesselIndex: "LNG Pioneer",       condition: "FMV monthly revaluation",          valueAtTrigger: "$185.0M",        threshold: "$180.0M (+alert)",status: "Dismissed", action: "View"    },
  { date: "Mar 10, 2026", time: "12:22", type: "Index", vesselIndex: "BDI",               condition: "BDI rose above 1,200",             valueAtTrigger: "1,247",          threshold: "1,200",           status: "Dismissed", action: "View"    },
  { date: "Mar 08, 2026", time: "16:05", type: "LTV",   vesselIndex: "Aegean Wind",       condition: "LTV > 65% first warning",          valueAtTrigger: "67.8%",          threshold: "75% limit",       status: "Dismissed", action: "View"    },
  { date: "Mar 05, 2026", time: "09:33", type: "FMV",   vesselIndex: "MV Pacific Star",   condition: "FMV below $27M threshold",         valueAtTrigger: "$26.9M",         threshold: "$27.0M",          status: "Dismissed", action: "View"    },
  { date: "Mar 02, 2026", time: "11:00", type: "Geo",   vesselIndex: "MV Aegean Wind",    condition: "Entered Med Custom zone",          valueAtTrigger: "36.5°N, 14.7°E", threshold: "Circle boundary", status: "Dismissed", action: "View"    },
  { date: "Feb 28, 2026", time: "14:45", type: "LTV",   vesselIndex: "Nordic Cape",       condition: "Loan balance updated (refi)",      valueAtTrigger: "62.4%",          threshold: "70% limit",       status: "Dismissed", action: "View"    },
  { date: "Feb 25, 2026", time: "08:17", type: "Index", vesselIndex: "SOFR 3M",           condition: "SOFR crossed 5.50% level",         valueAtTrigger: "5.52%",          threshold: "5.50%",           status: "Dismissed", action: "View"    },
];

/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "fmv",     label: "FMV Alerts",      title: "FMV Alerts",          subtitle: "Get notified when vessel fair-market values cross your thresholds" },
  { id: "ltv",     label: "LTV Covenant",    title: "LTV Covenant Alerts", subtitle: "Monitor loan-to-value ratios against covenant trigger levels" },
  { id: "index",   label: "Market Indices",  title: "Market Index Alerts", subtitle: "Watch BDI, BDTI, BCTI and other freight indices for breakout moves" },
  { id: "fx",      label: "Exchange Rates",  title: "FX Rate Alerts",      subtitle: "Track currency pairs that affect your USD-denominated portfolio" },
  { id: "geo",     label: "Geo-Alerts",      title: "Geo-Alerts",          subtitle: "Geographic risk zones — sanctions, war risk, port congestion" },
  { id: "history", label: "Alert History",   title: "Alert History",       subtitle: "Past triggers across all alert types — last 90 days" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AlertsPage() {
  const [active, setActive] = React.useState<TabId>("fmv");
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Alerts" },
          ...(active !== "fmv" ? [{ label: activeTab.label }] : []),
        ]}
        title={activeTab.title}
        subtitle={activeTab.subtitle}
        tabs={TABS}
        activeTab={active}
        onTabChange={setActive}
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Bell className="size-3.5" />
              Alert History
            </Button>
            <Button className="gap-2">
              <Plus className="size-3.5" />
              New Alert
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        {active === "fmv"     ? <FmvAlertsPanel /> : null}
        {active === "ltv"     ? <LtvPanel /> : null}
        {active === "index"   ? <IndexPanel /> : null}
        {active === "fx"      ? <FxPanel /> : null}
        {active === "geo"     ? <GeoPanel /> : null}
        {active === "history" ? <HistoryPanel /> : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tab 1 — FMV Alerts (overview of all alert categories)
 * -------------------------------------------------------------------------- */

function FmvAlertsPanel() {
  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-10">
      {/* LEFT — main alert categories */}
      <div className="flex flex-col gap-3 lg:col-span-7">
        {/* FMV Threshold Alerts */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">FMV Threshold Alerts</CardTitle>
            <CardDescription>
              Get notified when a vessel&apos;s Fair Market Value crosses your target price
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
            <select className="h-9 min-w-[240px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
              {FMV_RULES.map((r) => (
                <option key={r.imo}>
                  {r.vessel} – IMO {r.imo}
                </option>
              ))}
            </select>
            <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
              <option>Above</option>
              <option>Below</option>
            </select>
            <input
              type="number"
              placeholder="$M"
              className="h-9 w-24 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="sm" className="gap-2">
              <Plus className="size-3.5" />
              Add Alert
            </Button>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel</th>
                <th className="px-4 py-2 text-right">Current FMV</th>
                <th className="px-4 py-2 text-left">Condition</th>
                <th className="px-4 py-2 text-right">Threshold</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {FMV_RULES.map((r) => (
                <tr
                  key={r.imo}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/30",
                    r.status === "Triggered" && "bg-signal-orange/5",
                  )}
                >
                  <td className="px-4 py-2.5 font-semibold">{r.vessel}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.currentFmv}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.condition}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.threshold}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={r.status === "Active" ? "green" : "orange"}>
                      {r.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions
                      extraAction={
                        r.status === "Triggered" ? { label: "Dismiss", urgent: true } : undefined
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* LTV Covenant Alerts */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">LTV Covenant Alerts</CardTitle>
            <CardDescription>
              Monitor loan-to-value ratios and receive covenant breach warnings
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
            <select className="h-9 min-w-[220px] rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
              <option>MV Pacific Star – IMO 9876543</option>
              <option>MT Aegean Wind – IMO 9345671</option>
              <option>MV Nordic Cape – IMO 9512340</option>
              <option>MT Horizon – IMO 9401234</option>
            </select>
            <input type="number" placeholder="Loan $M" className="h-9 w-24 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="number" placeholder="LTV %" className="h-9 w-20 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="number" placeholder="Lead (d)" className="h-9 w-20 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            <Button size="sm" className="gap-2">
              <Plus className="size-3.5" />
              Add Alert
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Vessel</th>
                  <th className="px-4 py-2 text-right">Loan Value</th>
                  <th className="px-4 py-2 text-right">Current FMV</th>
                  <th className="px-4 py-2 text-right">Current LTV</th>
                  <th className="px-4 py-2 text-right">LTV Limit</th>
                  <th className="px-4 py-2 text-right">Buffer</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {LTV_COVENANT_ROWS.map((r) => (
                  <tr key={r.vessel} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-semibold">{r.vessel}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.loanValue}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.currentFmv}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.currentLtv}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{r.ltvLimit}</td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-bold tabular-nums",
                        r.bufferTone === "pos" ? "text-signal-green" : "text-signal-magenta",
                      )}
                    >
                      {r.buffer}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        tone={
                          r.status === "OK" ? "green" : r.status === "Watch" ? "orange" : "magenta"
                        }
                      >
                        {r.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-2.5">
                      <RowActions extraAction={r.urgent ? { label: "Urgent", urgent: true } : undefined} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Market Index & Rate Alerts */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Market Index &amp; Rate Alerts</CardTitle>
            <CardDescription>
              Track SOFR, EURIBOR, FX rates and commodity indices
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
            <select className="h-9 w-44 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
              <option>SOFR 3M</option>
              <option>EURIBOR 6M</option>
              <option>USD/EUR</option>
              <option>BDI</option>
              <option>Baltic Panamax</option>
            </select>
            <select className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15">
              <option>Above</option>
              <option>Below</option>
              <option>±Change%</option>
            </select>
            <input type="number" placeholder="Value" className="h-9 w-24 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            <Button size="sm" className="gap-2">
              <Plus className="size-3.5" />
              Add Alert
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Index</th>
                  <th className="px-4 py-2 text-right">Current Value</th>
                  <th className="px-4 py-2 text-left">Condition</th>
                  <th className="px-4 py-2 text-right">Threshold</th>
                  <th className="px-4 py-2 text-left">Last Triggered</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {MARKET_INDEX_ROWS.map((r) => (
                  <tr key={r.index} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-semibold">{r.index}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.current}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.condition}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.threshold}</td>
                    <td
                      className={cn(
                        "px-4 py-2.5",
                        r.lastTriggered === "Never" && "text-muted-foreground",
                      )}
                    >
                      {r.lastTriggered}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge tone={r.status === "Active" ? "green" : "muted"}>
                        {r.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-2.5">
                      <RowActions />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* RIGHT — Geo + Recent Alerts */}
      <div className="flex flex-col gap-3 lg:col-span-3">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Geographic Risk Alerts</CardTitle>
            <CardDescription>
              Get notified when tracked vessels enter high-risk zones
            </CardDescription>
          </CardHeader>
          <CardContent className="py-3">
            {/* Map placeholder */}
            <div className="relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-md bg-[#1a1d28] text-[11px] uppercase tracking-widest text-muted-foreground/70">
              <div className="absolute left-[20%] top-[35%] size-12 rounded-full bg-signal-magenta/30 ring-1 ring-signal-magenta/60" />
              <div className="absolute left-[60%] top-[28%] size-8 rounded-full bg-signal-orange/30 ring-1 ring-signal-orange/60" />
              <div className="absolute left-[40%] top-[62%] size-9 rounded-full bg-primary/20 ring-1 ring-primary/40" />
              <span className="relative z-10 text-white/40">World Risk Map</span>
              <button className="absolute bottom-2 right-2 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                + Draw Custom Zone
              </button>
            </div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              My Alert Zones
            </p>
            <ul className="mb-3 divide-y border-y">
              {GEO_ZONES.map((z) => (
                <li key={z.name} className="flex items-center gap-2 py-2 text-[12px]">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{z.name}</p>
                    <p className="text-[10px] text-muted-foreground">{z.meta}</p>
                  </div>
                  <StatusBadge
                    tone={
                      z.status === "Active"
                        ? "magenta"
                        : z.status === "Active-Med"
                          ? "orange"
                          : "blue"
                    }
                  >
                    Active
                  </StatusBadge>
                  <ActionLink>Edit</ActionLink>
                </li>
              ))}
            </ul>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tracked Vessels
            </p>
            <ul className="space-y-2">
              {TRACKED_VESSELS.map((v) => (
                <li key={v.name} className="flex items-center gap-2 text-[12px]">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      v.inRisk ? "bg-signal-magenta" : "bg-signal-green",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-[10px] text-muted-foreground">{v.location}</p>
                  </div>
                  <span
                    className={cn(
                      "whitespace-nowrap text-[11px] font-bold",
                      v.inRisk ? "text-signal-magenta" : "text-signal-green",
                    )}
                  >
                    {v.inRisk ? "⚠ In Risk Zone" : "Safe ✓"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Recent Alerts</CardTitle>
          </CardHeader>
          <ul className="divide-y">
            {RECENT_ALERTS.map((f, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
                <FeedIcon icon={f.icon} />
                <p className="min-w-0 flex-1">{f.text}</p>
                <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                  {f.time}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Tab 2 — LTV Covenant
 * -------------------------------------------------------------------------- */

function LtvPanel() {
  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active LTV Alerts"     value="3"      meta="Across 3 vessels"           accent="orange"  />
        <KpiCard label="Covenant Breaches"      value="1"      meta="Requires immediate action" accent="magenta" />
        <KpiCard label="Avg LTV Across Loans"   value="65.4%"  meta="vs 70% avg limit"           accent="blue"    />
        <KpiCard label="Loans Within Buffer"    value="4 / 5"  meta="≥5pp buffer remaining"      accent="green"   />
      </section>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Add LTV Alert</CardTitle>
          <CardDescription>
            Monitor loan-to-value ratio against covenant thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="Vessel">
              <select className="h-9 w-52 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Select Vessel…</option>
                <option>MV Pacific Star</option>
                <option>MV Aegean Wind</option>
                <option>MT Nordic Cape</option>
                <option>MT Horizon</option>
                <option>LNG Pioneer</option>
              </select>
            </FormField>
            <FormField label="Loan Amt">
              <input type="number" placeholder="$M" className="h-9 w-28 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="FMV Basis">
              <select className="h-9 w-40 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Live FMV</option>
                <option>Manual</option>
              </select>
            </FormField>
            <FormField label="LTV Limit %">
              <input type="number" placeholder="70" className="h-9 w-20 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Lead Time (days)">
              <input type="number" placeholder="30" className="h-9 w-20 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <Button size="sm" className="ml-auto gap-2">
              <Plus className="size-3.5" />
              Add Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-base">LTV Monitoring — All Loans</CardTitle>
            <CardDescription>Real-time LTV vs covenant thresholds</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="size-3.5" />
            Export
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel</th>
                <th className="px-4 py-2 text-left">Loan ID</th>
                <th className="px-4 py-2 text-right">Loan Balance</th>
                <th className="px-4 py-2 text-right">Current FMV</th>
                <th className="px-4 py-2 text-right">Current LTV</th>
                <th className="px-4 py-2 text-right">LTV Limit</th>
                <th className="px-4 py-2 text-right">Buffer</th>
                <th className="px-4 py-2 text-right">Days to Breach</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {LTV_LOANS.map((r) => (
                <tr key={r.loanId} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">{r.vessel}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {r.loanId}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.balance}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.currentFmv}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.currentLtv}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {r.ltvLimit}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right font-bold tabular-nums",
                      r.bufferTone === "pos" ? "text-signal-green" : "text-signal-magenta",
                    )}
                  >
                    {r.buffer}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right tabular-nums",
                      r.daysTone === "muted" ? "text-muted-foreground" : "font-bold text-signal-orange",
                    )}
                  >
                    {r.daysToBreach}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      tone={r.status === "OK" ? "green" : r.status === "Watch" ? "orange" : "magenta"}
                    >
                      {r.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions
                      extraAction={r.status === "Watch" ? { label: "Review", urgent: true } : undefined}
                      removeLabel="Remove"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">LTV Ratio Trend</CardTitle>
          <CardDescription>Last 12 Months by Vessel</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartPlaceholder height="h-56" />
        </CardContent>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 3 — Market Indices
 * -------------------------------------------------------------------------- */

function IndexPanel() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-base">Live Index Snapshot</CardTitle>
            <CardDescription>Updated every 15 minutes — as of 14:32 UTC</CardDescription>
          </div>
          <StatusBadge tone="green">Live</StatusBadge>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {INDEX_SNAPSHOT.map((i) => (
              <div
                key={i.label}
                className="rounded-md border bg-muted/30 px-3 py-2"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {i.label}
                </p>
                <p className="mt-1 text-[16px] font-extrabold tabular-nums">{i.value}</p>
                <p
                  className={cn(
                    "text-[10px] font-semibold tabular-nums",
                    i.direction === "up" ? "text-signal-green" : "text-signal-magenta",
                  )}
                >
                  {i.direction === "up" ? "↑" : "↓"} {i.change}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Add Index Alert</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="Index">
              <select className="h-9 w-44 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Select Index…</option>
                <option>BDI</option>
                <option>Baltic Panamax</option>
                <option>Baltic Supramax</option>
                <option>SOFR 3M</option>
                <option>EURIBOR 6M</option>
                <option>USD/EUR</option>
              </select>
            </FormField>
            <FormField label="Condition">
              <select className="h-9 w-36 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Condition…</option>
                <option>Rises above</option>
                <option>Falls below</option>
                <option>Changes by ±</option>
              </select>
            </FormField>
            <FormField label="Value">
              <input type="number" placeholder="Value" className="h-9 w-24 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Notify via">
              <select className="h-9 w-40 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Notify via…</option>
                <option>Email</option>
                <option>In-app</option>
                <option>Email + In-app</option>
              </select>
            </FormField>
            <Button size="sm" className="ml-auto gap-2">
              <Plus className="size-3.5" />
              Add Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Active Index Alerts</CardTitle>
          <CardDescription>
            Monitoring market indices against user-defined thresholds
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Index</th>
                <th className="px-4 py-2 text-right">Current</th>
                <th className="px-4 py-2 text-left">Direction</th>
                <th className="px-4 py-2 text-right">Threshold</th>
                <th className="px-4 py-2 text-left">Tolerance</th>
                <th className="px-4 py-2 text-left">Notify When</th>
                <th className="px-4 py-2 text-left">Channels</th>
                <th className="px-4 py-2 text-left">Last Triggered</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {INDEX_ALERTS.map((r) => (
                <tr key={r.index} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">{r.index}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.current}</td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-[11px] font-semibold",
                      r.direction === "up" ? "text-signal-green" : "text-signal-magenta",
                    )}
                  >
                    {r.direction === "up" ? "↑" : "↓"} {r.directionLabel}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.threshold}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.tolerance}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.notifyWhen}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.channels}</td>
                  <td
                    className={cn(
                      "px-4 py-2.5",
                      r.lastTone === "muted" ? "text-muted-foreground" : "text-signal-orange",
                    )}
                  >
                    {r.lastTriggered}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={r.status === "Monitoring" ? "blue" : "orange"}>
                      {r.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">BDI — Last 90 Days</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartPlaceholder height="h-44" />
        </CardContent>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 4 — Exchange Rates
 * -------------------------------------------------------------------------- */

function FxPanel() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-base">Live FX Rates</CardTitle>
            <CardDescription>
              Key currency pairs for ship finance &amp; trading — updated every 15 min
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="green">Live</StatusBadge>
            <span className="text-[11px] text-muted-foreground">as of 14:32 UTC</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
            {FX_RATES.map((r) => (
              <div
                key={r.pair}
                className="rounded-md border bg-muted/30 px-3 py-2"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {r.pair}
                </p>
                <p className="mt-1 text-[18px] font-extrabold tabular-nums">{r.value}</p>
                <p
                  className={cn(
                    "text-[10px] font-semibold tabular-nums",
                    r.direction === "up" ? "text-signal-green" : "text-signal-magenta",
                  )}
                >
                  {r.direction === "up" ? "↑" : "↓"} {r.change}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Add Exchange Rate Alert</CardTitle>
          <CardDescription>
            Trigger a notification when a currency pair crosses a threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="Currency Pair">
              <select className="h-9 w-44 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Select pair…</option>
                {FX_RATES.map((r) => (
                  <option key={r.pair}>{r.pair}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Condition">
              <select className="h-9 w-40 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Condition…</option>
                <option>Rises above</option>
                <option>Falls below</option>
                <option>Changes by ± %</option>
                <option>Daily change &gt;</option>
              </select>
            </FormField>
            <FormField label="Threshold">
              <input type="number" placeholder="e.g. 1.10" className="h-9 w-28 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Tolerance">
              <input type="number" placeholder="± 0.005" className="h-9 w-28 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Notify via">
              <select className="h-9 w-40 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Notify via…</option>
                <option>Email</option>
                <option>In-app</option>
                <option>Email + In-app</option>
              </select>
            </FormField>
            <Button size="sm" className="ml-auto gap-2">
              <Plus className="size-3.5" />
              Add Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Active Exchange Rate Alerts</CardTitle>
          <CardDescription>
            Monitoring FX pairs against user-defined thresholds
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Pair</th>
                <th className="px-4 py-2 text-right">Current Rate</th>
                <th className="px-4 py-2 text-left">Direction</th>
                <th className="px-4 py-2 text-right">Threshold</th>
                <th className="px-4 py-2 text-left">Tolerance</th>
                <th className="px-4 py-2 text-left">Condition</th>
                <th className="px-4 py-2 text-left">Notify via</th>
                <th className="px-4 py-2 text-left">Last Triggered</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {FX_ALERTS.map((r) => (
                <tr key={r.pair} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">{r.pair}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.current}</td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-[11px] font-semibold",
                      r.direction === "up" ? "text-signal-green" : "text-signal-magenta",
                    )}
                  >
                    {r.direction === "up" ? "↑" : "↓"} {r.directionLabel}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.threshold}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.tolerance}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.condition}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.channels}</td>
                  <td
                    className={cn(
                      "px-4 py-2.5",
                      r.lastTone === "muted" ? "text-muted-foreground" : "text-signal-orange",
                    )}
                  >
                    {r.lastTriggered}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={r.status === "Monitoring" ? "blue" : "orange"}>
                      {r.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Portfolio FX Impact</CardTitle>
          <CardDescription>
            Estimated effect of current exchange rates on your fleet financials
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {FX_PORTFOLIO_IMPACT.map((m) => (
              <div key={m.label} className="rounded-md border bg-muted/30 p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </p>
                <p
                  className={cn(
                    "mt-1 text-[20px] font-extrabold tabular-nums",
                    m.label === "FX Net Effect (Annual)" && "text-signal-green",
                  )}
                >
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.meta}</p>
                <p
                  className={cn(
                    "mt-1 text-[11px] font-semibold",
                    m.deltaTone === "green"   && "text-signal-green",
                    m.deltaTone === "magenta" && "text-signal-magenta",
                    m.deltaTone === "muted"   && "text-muted-foreground",
                  )}
                >
                  {m.delta}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">USD / EUR — Last 90 Days</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartPlaceholder height="h-44" />
        </CardContent>
      </Card>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 5 — Geo-Alerts
 * -------------------------------------------------------------------------- */

function GeoPanel() {
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">World Risk Map</CardTitle>
          <CardDescription>Click to draw a new alert zone on the map</CardDescription>
        </CardHeader>
        <div className="relative h-[380px] overflow-hidden bg-[#1a1d28]">
          {/* abstract risk zones */}
          <div className="absolute left-[56%] top-[42%] h-10 w-16 rounded-[40%] border border-signal-magenta/55 bg-signal-magenta/20" />
          <div className="absolute left-[61%] top-[36%] size-9 rounded-full border border-signal-orange/50 bg-signal-orange/15" />
          <div className="absolute left-[26%] top-[30%] h-12 w-20 rounded-md border border-dashed border-primary/40 bg-primary/10" />
          {/* grid */}
          <div className="absolute inset-y-0 left-[20%] w-px bg-accent/10" />
          <div className="absolute inset-y-0 left-[40%] w-px bg-accent/10" />
          <div className="absolute inset-y-0 left-[60%] w-px bg-accent/10" />
          <div className="absolute inset-y-0 left-[80%] w-px bg-accent/10" />
          <div className="absolute inset-x-0 top-[25%] h-px bg-accent/10" />
          <div className="absolute inset-x-0 top-[50%] h-px bg-accent/10" />
          <div className="absolute inset-x-0 top-[75%] h-px bg-accent/10" />
          <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-white/20">
            World Risk Map — Click to Draw Alert Zone
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
            <div>
              <CardTitle className="text-base">My Alert Zones</CardTitle>
              <CardDescription>User-defined geographic alert areas</CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="size-3.5" />
              New Zone
            </Button>
          </CardHeader>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Zone Name</th>
                <th className="px-3 py-2 text-left">Risk Level</th>
                <th className="px-3 py-2 text-left">Coverage</th>
                <th className="px-3 py-2 text-right">Vessels</th>
                <th className="px-3 py-2 text-left">Alert Type</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {GEO_ZONE_ROWS.map((z) => (
                <tr key={z.zone} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-semibold">{z.zone}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge
                      tone={z.risk === "High" ? "magenta" : z.risk === "Medium" ? "orange" : "blue"}
                    >
                      {z.risk}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{z.coverage}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{z.vessels}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{z.alertType}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge
                      tone={z.risk === "High" ? "magenta" : z.risk === "Medium" ? "orange" : "blue"}
                    >
                      {z.status}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-2.5">
                    <RowActions />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Vessel Tracking for Geo-Alerts</CardTitle>
            <CardDescription>Current position and zone status</CardDescription>
          </CardHeader>
          <ul className="divide-y">
            {GEO_TRACKING.map((v) => (
              <li
                key={v.vessel}
                className="flex items-center gap-3 px-4 py-2.5 text-[12px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{v.vessel}</p>
                  <p className="text-[10px] text-muted-foreground">{v.position}</p>
                </div>
                <StatusBadge
                  tone={
                    v.status === "In Zone"
                      ? "magenta"
                      : v.status === "Near Zone"
                        ? "orange"
                        : v.status === "Monitoring"
                          ? "blue"
                          : "green"
                  }
                >
                  {v.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Tab 6 — Alert History
 * -------------------------------------------------------------------------- */

function HistoryPanel() {
  return (
    <>
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            From
            <input
              type="date"
              defaultValue="2026-02-23"
              className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            To
            <input
              type="date"
              defaultValue="2026-03-25"
              className="h-8 rounded-sm border border-input bg-card px-2 text-[12px] text-foreground hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <select className="h-9 w-40 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Types</option>
            <option>FMV Alerts</option>
            <option>LTV Covenant</option>
            <option>Market Indices</option>
            <option>Geo-Alerts</option>
          </select>
          <select className="h-9 w-44 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Vessels / Indices</option>
            <option>MV Pacific Star</option>
            <option>MV Aegean Wind</option>
            <option>MT Nordic Cape</option>
            <option>MT Horizon</option>
            <option>LNG Pioneer</option>
            <option>BDI</option>
            <option>SOFR 3M</option>
          </select>
          <select className="h-9 w-36 rounded-md border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Statuses</option>
            <option>Triggered</option>
            <option>Dismissed</option>
            <option>Active</option>
          </select>
          <Button size="sm" variant="outline" className="ml-auto gap-2">
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Alert History — Last 30 Days</CardTitle>
          <CardDescription>{HISTORY_ROWS.length} alerts across all types</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Vessel / Index</th>
                <th className="px-3 py-2 text-left">Condition</th>
                <th className="px-3 py-2 text-left">Value at Trigger</th>
                <th className="px-3 py-2 text-left">Threshold</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right" aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {HISTORY_ROWS.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-3 py-2.5">{r.date}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.time}</td>
                  <td className="px-3 py-2.5">
                    <HistoryTypeBadge type={r.type} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{r.vesselIndex}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.condition}</td>
                  <td className="px-3 py-2.5 tabular-nums">{r.valueAtTrigger}</td>
                  <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{r.threshold}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge
                      tone={
                        r.status === "Triggered" ? "magenta" : r.status === "Active" ? "orange" : "muted"
                      }
                    >
                      {r.status}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <ActionLink urgent={r.action === "Review"}>{r.action}</ActionLink>
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
 * Local helpers
 * -------------------------------------------------------------------------- */

type StatusTone = "green" | "orange" | "magenta" | "blue" | "muted";

function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone;
  children: React.ReactNode;
}) {
  const STYLE: Record<StatusTone, string> = {
    green:   "bg-signal-green/15 text-signal-green",
    orange:  "bg-signal-orange/15 text-signal-orange",
    magenta: "bg-signal-magenta/15 text-signal-magenta",
    blue:    "bg-primary/15 text-primary",
    muted:   "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        STYLE[tone],
      )}
    >
      {children}
    </span>
  );
}

function HistoryTypeBadge({ type }: { type: HistoryRow["type"] }) {
  const STYLE: Record<HistoryRow["type"], string> = {
    FMV:   "bg-primary/15 text-primary",
    LTV:   "bg-signal-orange/15 text-signal-orange",
    Index: "bg-signal-green/15 text-signal-green",
    Geo:   "bg-signal-magenta/15 text-signal-magenta",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", STYLE[type])}>
      {type}
    </span>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function RowActions({
  extraAction,
  removeLabel = "Delete",
}: {
  extraAction?: { label: string; urgent?: boolean };
  removeLabel?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ActionLink>
        <Pencil className="size-3" />
        Edit
      </ActionLink>
      {extraAction ? (
        <ActionLink urgent={extraAction.urgent}>{extraAction.label}</ActionLink>
      ) : null}
      <ActionLink danger>
        <Trash2 className="size-3" />
        {removeLabel}
      </ActionLink>
    </div>
  );
}

function ActionLink({
  children,
  danger = false,
  urgent = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
  urgent?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
        danger
          ? "text-signal-magenta hover:bg-signal-magenta/10"
          : urgent
            ? "text-signal-orange hover:bg-signal-orange/10"
            : "text-primary hover:bg-primary/10",
      )}
    >
      {children}
    </button>
  );
}

function FeedIcon({ icon }: { icon: FeedItem["icon"] }) {
  const Icon =
    icon === "pin"
      ? MapPin
      : icon === "trend-down"
        ? TrendingDown
        : icon === "trend-up"
          ? TrendingUp
          : AlertTriangle;
  const tone =
    icon === "pin"
      ? "text-signal-magenta"
      : icon === "trend-down"
        ? "text-signal-magenta"
        : icon === "trend-up"
          ? "text-signal-green"
          : "text-signal-orange";
  return <Icon className={cn("size-4 flex-shrink-0", tone)} />;
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

