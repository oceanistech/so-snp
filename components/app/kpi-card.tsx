import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * KpiCard — primary metric tile.
 *
 * Two variants:
 *   - `sm` (default): mirrors the prototype's `.stat-card` used on every page
 *     except the dashboard (env-score, market-reports, IRR, loan-oracle, …).
 *     LEFT 3px accent rail, 20px display value with -0.6px tracking, uppercase
 *     600 label with 0.4px letter-spacing, soft shadow.
 *   - `md`: mirrors the prototype's `.kpi-card` used only on the dashboard.
 *     TOP 3px accent border, 20px bold value (-0.5px tracking, 1.2 leading),
 *     uppercase 700 label.
 *
 * Renders as an anchor when `href` is provided so the whole tile is clickable.
 */
type Accent = "blue" | "green" | "cyan" | "purple" | "magenta" | "orange" | "yellow";
type Direction = "up" | "down" | "neutral";
type Size = "sm" | "md";

const ACCENT_BORDER_TOP: Record<Accent, string> = {
  blue: "border-t-primary",
  green: "border-t-signal-green",
  cyan: "border-t-accent",
  purple: "border-t-signal-purple",
  magenta: "border-t-signal-magenta",
  orange: "border-t-signal-orange",
  yellow: "border-t-signal-yellow",
};

/** Background colors for the left rail of size="sm" cards. */
const ACCENT_BG: Record<Accent, string> = {
  blue: "bg-primary",
  green: "bg-signal-green",
  cyan: "bg-accent",
  purple: "bg-signal-purple",
  magenta: "bg-signal-magenta",
  orange: "bg-signal-orange",
  yellow: "bg-signal-yellow",
};

const CHANGE_TEXT: Record<Direction, string> = {
  up: "text-signal-green",
  down: "text-signal-magenta",
  neutral: "text-muted-foreground",
};

const ChangeIcon = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
} as const;

type KpiCardProps = {
  label: string;
  value: string;
  /** Direction of change vs previous period. */
  direction?: Direction;
  /** Short change description (e.g. "+3.2% MoM"). */
  change?: string;
  /** Tiny supplementary breakdown line. */
  meta?: string;
  /** Accent color (top rail for `md`, left rail for `sm`). */
  accent?: Accent;
  /** If provided, the entire tile is a link. */
  href?: string;
  /** Tile sizing. See component docstring for full description. */
  size?: Size;
  /** Optional override for the value's classes (e.g. forcing 16px on long strings). */
  valueClassName?: string;
};

export function KpiCard({
  label,
  value,
  direction = "neutral",
  change,
  meta,
  accent = "blue",
  href,
  size = "sm",
  valueClassName,
}: KpiCardProps) {
  const Icon = ChangeIcon[direction];
  const isSm = size === "sm";
  const body = (
    <div
      className={cn(
        "flex h-full flex-col rounded-md bg-card transition-colors",
        isSm
          ? // .stat-card — left rail + soft shadow + hover border tweak.
            "relative overflow-hidden border p-4 shadow-sm hover:border-foreground/20"
          : // .kpi-card — top 3px rail (radius rounded only at top), tighter padding.
            cn("border border-t-[3px] px-4 py-3", ACCENT_BORDER_TOP[accent]),
        href && "hover:bg-muted/40",
      )}
    >
      {isSm ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-[3px]",
            ACCENT_BG[accent],
          )}
        />
      ) : null}

      <div
        className={cn(
          "text-[11px] uppercase text-muted-foreground",
          isSm
            ? "font-semibold tracking-[0.4px]"
            : "font-bold tracking-[0.5px]",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-1 tabular-nums text-[20px] leading-[1.2]",
          isSm
            ? "font-display font-extrabold tracking-[-0.6px]"
            : "font-bold tracking-[-0.5px] text-foreground",
          valueClassName,
        )}
      >
        {value}
      </div>
      {change ? (
        <div className={cn("mt-2 flex items-center gap-1 text-[11px] font-semibold", CHANGE_TEXT[direction])}>
          <Icon className="size-3" />
          {change}
        </div>
      ) : null}
      {meta ? (
        <div className="mt-2 text-[11px] text-muted-foreground">{meta}</div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    );
  }
  return body;
}
