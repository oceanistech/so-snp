import { cn } from "@/lib/utils";

/**
 * RequestStatusChip — a generic request lifecycle badge.
 * Used by long-running calculations (Cashflow, DCF, future cohorts).
 */
export type RequestStatus = "completed" | "running" | "draft" | "failed";

const STYLE: Record<RequestStatus, { bg: string; text: string; label: string }> = {
  completed: {
    bg: "bg-signal-green/15",
    text: "text-signal-green",
    label: "Completed",
  },
  running: {
    bg: "bg-primary/10",
    text: "text-primary",
    label: "Running",
  },
  draft: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    label: "Draft",
  },
  failed: {
    bg: "bg-signal-magenta/10",
    text: "text-signal-magenta",
    label: "Failed",
  },
};

export function RequestStatusChip({ value }: { value: RequestStatus }) {
  const s = STYLE[value];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        s.bg,
        s.text,
      )}
    >
      {s.label}
    </span>
  );
}
