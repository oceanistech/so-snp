import { cn } from "@/lib/utils";

/**
 * VesselTypeBadge — colored chip for a vessel's type classification.
 * Colors map to the prototype's `.badge-blue`, `.badge-orange`, etc.
 */
export type VesselType =
  | "Bulk Carrier"
  | "Tanker"
  | "Container"
  | "Gas Carrier"
  | "LNG"
  | "LPG"
  | "Chemical Tanker"
  | "Car Carrier"
  | "General Cargo";

const COLOR: Record<VesselType, string> = {
  "Bulk Carrier": "bg-primary/10 text-primary",
  Tanker: "bg-signal-orange/10 text-signal-orange",
  Container: "bg-signal-purple/10 text-signal-purple",
  "Gas Carrier": "bg-signal-green/10 text-signal-green",
  LNG: "bg-accent/15 text-accent-foreground",
  LPG: "bg-signal-yellow/15 text-signal-yellow",
  "Chemical Tanker": "bg-signal-magenta/10 text-signal-magenta",
  "Car Carrier": "bg-muted text-muted-foreground",
  "General Cargo": "bg-muted text-muted-foreground",
};

export function VesselTypeBadge({ value }: { value: VesselType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
        COLOR[value],
      )}
    >
      {value}
    </span>
  );
}
