import { cn } from "@/lib/utils";

/**
 * FinancibilityChip — visual label for a Loan Oracle outcome.
 *
 * The seven ratings come from the prototype's filter dropdown:
 *   Done Deal · Highly Possible · Possible · Promising
 *   · Challenging · Very Challenging · Hardly Possible
 * mapped to the Signal accent palette by severity.
 */
export type Financibility =
  | "done-deal"
  | "highly-possible"
  | "possible"
  | "promising"
  | "challenging"
  | "very-challenging"
  | "hardly-possible";

const STYLE: Record<Financibility, { bg: string; text: string; label: string }> = {
  "done-deal": {
    bg: "bg-signal-green/15",
    text: "text-signal-green",
    label: "Done Deal",
  },
  "highly-possible": {
    bg: "bg-signal-green/10",
    text: "text-signal-green",
    label: "Highly Possible",
  },
  possible: {
    bg: "bg-primary/15",
    text: "text-primary",
    label: "Possible",
  },
  promising: {
    bg: "bg-primary/10",
    text: "text-primary",
    label: "Promising",
  },
  challenging: {
    bg: "bg-signal-orange/10",
    text: "text-signal-orange",
    label: "Challenging",
  },
  "very-challenging": {
    bg: "bg-signal-orange/15",
    text: "text-signal-orange",
    label: "Very Challenging",
  },
  "hardly-possible": {
    bg: "bg-signal-magenta/10",
    text: "text-signal-magenta",
    label: "Hardly Possible",
  },
};

export function FinancibilityChip({ value }: { value: Financibility }) {
  const s = STYLE[value];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-tight",
        s.bg,
        s.text,
      )}
    >
      {s.label}
    </span>
  );
}
