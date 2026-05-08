import { cn } from "@/lib/utils";

/**
 * DetailRow — a label / value pair used across vessel-detail style cards.
 * Mirrors the prototype's `.detail-row` block with a thin bottom border.
 */
type DetailRowProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Render the value in a monospace font (IMO, MMSI, etc.). */
  mono?: boolean;
  /** Override the value's text color via Tailwind utility. */
  valueClassName?: string;
};

export function DetailRow({
  label,
  value,
  mono = false,
  valueClassName,
}: DetailRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-2 text-[12px] last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right font-semibold text-foreground",
          mono && "font-mono tabular-nums",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}
