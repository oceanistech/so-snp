import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * AlertPill — header notification chip used on Dashboard.
 *
 * Compact rounded pill with a coloured dot + count. Severity-tinted
 * background and border using the signal accent palette.
 */
type Severity = "high" | "medium" | "low" | "info";

const SEVERITY: Record<Severity, { bg: string; border: string; text: string; dot: string }> = {
  high: {
    bg: "bg-signal-magenta/10",
    border: "border-signal-magenta/30",
    text: "text-signal-magenta",
    dot: "bg-signal-magenta",
  },
  medium: {
    bg: "bg-signal-orange/10",
    border: "border-signal-orange/30",
    text: "text-signal-orange",
    dot: "bg-signal-orange",
  },
  low: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    dot: "bg-primary",
  },
  info: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

type AlertPillProps = {
  severity: Severity;
  label: string;
  href?: string;
};

export function AlertPill({ severity, label, href = "/alerts" }: AlertPillProps) {
  const s = SEVERITY[severity];
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-80",
        s.bg,
        s.border,
        s.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {label}
    </Link>
  );
}
