import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * SegmentInsightPanel — four market-cycle cards that anchor the top of the
 * Valuations and Net Fleet pages in the prototype.
 *
 * Mirrors `SEG_INSIGHT_DATA` and `renderSegInsightPanel()` from
 * `html/assets/js/main.js` and the `.seg-insight-card` markup the JS produces.
 */

export type SegTone = "primary" | "orange" | "purple" | "accent";
export type Ordering = "under" | "balanced" | "over";
export type MetricChange = "up" | "down" | "neutral";

export type SegInsight = {
  key: string;
  label: string;
  tone: SegTone;
  cycle: string;
  cycleTone: "green" | "orange" | "magenta";
  ordering: Ordering;
  /** Orderbook as % of fleet. */
  orderbook: number;
  /** 5-year average orderbook %, used for the avg tick on the bar. */
  orderbookAvg: number;
  metrics: {
    label: string;
    value: string;
    change: string | null;
    direction: MetricChange;
  }[];
  insight: string;
  drivers: string[];
};

/** Canonical segment insight data — keep in sync with SEG_INSIGHT_DATA in main.js. */
export const SEGMENT_INSIGHTS: SegInsight[] = [
  {
    key: "bulk",
    label: "Bulk Carriers",
    tone: "primary",
    cycle: "Mid-cycle Expansion",
    cycleTone: "green",
    ordering: "under",
    orderbook: 8.6,
    orderbookAvg: 12,
    metrics: [
      { label: "BDI",         value: "1,842",      change: "+4.1%",   direction: "up" },
      { label: "Panamax TCE", value: "$14,200/d",  change: "+2.8%",   direction: "up" },
      { label: "Orderbook",   value: "8.6% fleet", change: null,      direction: "neutral" },
    ],
    insight:
      "Limited new supply through 2026 with orderbook well below historical average. Chinese steel demand and Brazilian iron ore exports support Panamax and Capesize earnings.",
    drivers: [
      "BDI recovering from Q1 lows (+4.1% WoW)",
      "Brazil iron ore volumes +8% YoY",
      "China infrastructure stimulus Q2 2026",
    ],
  },
  {
    key: "tanker",
    label: "Tankers",
    tone: "orange",
    cycle: "Late Cycle, Moderating",
    cycleTone: "orange",
    ordering: "balanced",
    orderbook: 11.2,
    orderbookAvg: 9,
    metrics: [
      { label: "BDTI",      value: "924",         change: "−2.3%",   direction: "down" },
      { label: "VLCC TCE",  value: "$38–45K/d",   change: "Q2 fcst", direction: "neutral" },
      { label: "Orderbook", value: "11.2% fleet", change: null,      direction: "neutral" },
    ],
    insight:
      "OPEC+ compliance moderating near-term earnings. Atlantic arbitrage flows and SPR rebuilding expected to support VLCC rates through Q2. Balanced orderbook limits downside.",
    drivers: [
      "OPEC+ compliance at 104%",
      "Atlantic arbitrage recovering",
      "Russian crude rerouting sustaining ton-miles",
    ],
  },
  {
    key: "cont",
    label: "Containers",
    tone: "purple",
    cycle: "Post-peak Correction",
    cycleTone: "magenta",
    ordering: "over",
    orderbook: 24.8,
    orderbookAvg: 15,
    metrics: [
      { label: "BCTI",      value: "656",         change: "+1.8%", direction: "up" },
      { label: "SCFI",      value: "1,247",       change: "−5.2%", direction: "down" },
      { label: "Orderbook", value: "24.8% fleet", change: null,    direction: "neutral" },
    ],
    insight:
      "Excess newbuild deliveries 2024–2026 compressing freight rates and secondhand values. Orderbook at 24.8% — nearly double the 5Y average — is a structural headwind for the next 18 months.",
    drivers: [
      "14.2M TEU capacity entering 2024–2026",
      "Spot rates 62% below 2022 peak",
      "Scrapping activity rising in 20Y+ vessels",
    ],
  },
  {
    key: "gas",
    label: "Gas Carriers",
    tone: "accent",
    cycle: "Supply Correction",
    cycleTone: "orange",
    ordering: "under",
    orderbook: 13.4,
    orderbookAvg: 11,
    metrics: [
      { label: "LNG Spot",  value: "$2.8/mmBtu",  change: "−12%",  direction: "down" },
      { label: "VLGC Rate", value: "$42/MT",      change: "+3.1%", direction: "up" },
      { label: "Orderbook", value: "13.4% fleet", change: null,    direction: "neutral" },
    ],
    insight:
      "Post-winter normalization softened LNG carrier values 12% from January peak. Structural demand from new liquefaction projects 2027–2028 underpins long-term outlook despite near-term correction.",
    drivers: [
      "Post-winter seasonal demand easing",
      "New US LNG export capacity 2027",
      "12 LNG carriers listed — buyer's market conditions",
    ],
  },
];

const TONE_BORDER: Record<SegTone, string> = {
  primary: "border-t-primary",
  orange: "border-t-signal-orange",
  purple: "border-t-signal-purple",
  accent: "border-t-accent",
};

const TONE_FILL: Record<SegTone, string> = {
  primary: "bg-primary",
  orange: "bg-signal-orange",
  purple: "bg-signal-purple",
  accent: "bg-accent",
};

const CYCLE_PILL: Record<SegInsight["cycleTone"], string> = {
  green: "bg-signal-green/15 text-signal-green ring-signal-green/30",
  orange: "bg-signal-orange/15 text-signal-orange ring-signal-orange/30",
  magenta: "bg-signal-magenta/15 text-signal-magenta ring-signal-magenta/30",
};

const ORDER_PILL: Record<Ordering, string> = {
  under: "bg-signal-green/15 text-signal-green",
  balanced: "bg-signal-orange/15 text-signal-orange",
  over: "bg-signal-magenta/15 text-signal-magenta",
};

const ORDER_FILL: Record<Ordering, string> = {
  under: "bg-signal-green",
  balanced: "bg-signal-orange",
  over: "bg-signal-magenta",
};

const METRIC_TONE: Record<MetricChange, string> = {
  up: "text-signal-green",
  down: "text-signal-magenta",
  neutral: "text-muted-foreground",
};

export function SegmentInsightPanel({
  segments = SEGMENT_INSIGHTS,
}: {
  segments?: SegInsight[];
} = {}) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {segments.map((s) => {
        const fillPct = Math.min((s.orderbook / 30) * 100, 100);
        const avgPct = Math.min((s.orderbookAvg / 30) * 100, 100);

        return (
          <Card
            key={s.key}
            className={cn(
              "flex flex-col rounded-md border-t-[3px] p-4",
              TONE_BORDER[s.tone],
            )}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-bold">{s.label}</p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1",
                  CYCLE_PILL[s.cycleTone],
                )}
              >
                {s.cycle}
              </span>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {s.metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="mt-0.5 text-[14px] font-extrabold tabular-nums leading-tight">
                    {m.value}
                  </p>
                  {m.change ? (
                    <p
                      className={cn(
                        "text-[10px] font-semibold tabular-nums",
                        METRIC_TONE[m.direction],
                      )}
                    >
                      {m.change}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mb-3">
              <div className="mb-1 flex items-center gap-2 text-[11px]">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    ORDER_PILL[s.ordering],
                  )}
                >
                  {s.ordering}
                </span>
                <span className="text-muted-foreground">Orderbook vs. fleet</span>
                <span className="ml-auto font-bold tabular-nums">
                  {s.orderbook}%
                </span>
              </div>
              <div className="relative h-1.5 overflow-visible rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full opacity-80",
                    // Match the prototype: progress bar fill uses the segment's
                    // own color (same as the card's top border), not the
                    // ordering status color.
                    TONE_FILL[s.tone],
                  )}
                  style={{ width: `${fillPct}%` }}
                />
                <div
                  className="absolute -top-0.5 h-2.5 w-px bg-muted-foreground/70"
                  style={{ left: `${avgPct}%` }}
                  title={`5Y avg ${s.orderbookAvg}%`}
                />
                <span
                  className="absolute top-2.5 -translate-x-1/2 text-[8px] uppercase tracking-widest text-muted-foreground"
                  style={{ left: `${avgPct}%` }}
                >
                  avg
                </span>
              </div>
            </div>

            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              {s.insight}
            </p>

            <ul className="mt-3 space-y-1.5">
              {s.drivers.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-1.5 text-[11px] text-foreground"
                >
                  <span
                    className={cn(
                      "mt-1 inline-block size-1.5 flex-shrink-0 rotate-45",
                      TONE_FILL[s.tone],
                    )}
                    aria-hidden
                  />
                  {d}
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </section>
  );
}
