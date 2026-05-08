import { cn } from "@/lib/utils";

/**
 * EnvScoreBadge — IMO CII / Environmental rating (A best, E worst).
 * Mirrors the prototype's `.cii-A` … `.cii-E` classes.
 */
export type EnvScore = "A" | "B" | "C" | "D" | "E";

const STYLE: Record<EnvScore, string> = {
  A: "bg-signal-green/15 text-signal-green",
  B: "bg-primary/15 text-primary",
  C: "bg-signal-yellow/20 text-signal-yellow",
  D: "bg-signal-orange/15 text-signal-orange",
  E: "bg-signal-magenta/15 text-signal-magenta",
};

export function EnvScoreBadge({ value }: { value: EnvScore }) {
  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-md text-[12px] font-extrabold",
        STYLE[value],
      )}
      title={`Environmental score: ${value}`}
    >
      {value}
    </span>
  );
}
