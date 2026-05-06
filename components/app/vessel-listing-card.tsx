import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import { cn } from "@/lib/utils";

/**
 * VesselListingCard — vessel "for sale" tile.
 *
 * Mirrors the prototype's `.vessel-card`:
 *   - colored accent bar at the top (mapped to vessel type)
 *   - header: name + type tag, IMO/built/origin, asking price on the right
 *   - 6-cell specs grid
 *   - footer: availability badges, broker, Valuation + View Details actions
 */
type Listing = {
  imo: string;
  name: string;
  type: VesselType;
  built: number;
  origin: string;
  asking: string;
  specs: { label: string; value: string }[];
  available: boolean;
  scrubber?: boolean;
  broker: string;
};

const ACCENT: Record<VesselType, string> = {
  "Bulk Carrier": "bg-primary",
  Tanker: "bg-signal-orange",
  Container: "bg-signal-purple",
  "Gas Carrier": "bg-signal-green",
  LNG: "bg-accent",
  LPG: "bg-signal-yellow",
  "Chemical Tanker": "bg-signal-magenta",
  "Car Carrier": "bg-muted-foreground",
  "General Cargo": "bg-muted-foreground",
};

export function VesselListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className={cn("h-1 w-full", ACCENT[listing.type])} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/vessels/${listing.imo}`}
                className="text-[15px] font-bold tracking-tight text-foreground hover:text-primary"
              >
                {listing.name}
              </Link>
              <VesselTypeBadge value={listing.type} />
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              IMO {listing.imo} · Built {listing.built} · {listing.origin}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[18px] font-extrabold leading-none tracking-tight text-primary">
              {listing.asking}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              Asking Price
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-2 rounded-md bg-muted/40 p-2">
          {listing.specs.map((s) => (
            <li
              key={s.label}
              className="flex flex-col items-start gap-0.5 px-1 py-0.5"
            >
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </span>
              <span className="text-[12px] font-bold text-foreground">
                {s.value}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {listing.available ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-signal-green/10 px-2 py-0.5 text-[10px] font-bold text-signal-green">
                <span className="size-1.5 rounded-full bg-signal-green" />
                Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                Under Negotiation
              </span>
            )}
            {listing.scrubber ? (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Scrubber Fitted
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {listing.broker}
            </span>
            <Button asChild size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[11px]">
              <Link href={`/valuations?imo=${listing.imo}`}>
                <FileText className="size-3" />
                Valuation
              </Link>
            </Button>
            <Button asChild size="sm" className="h-7 px-2 text-[11px]">
              <Link href={`/vessels/${listing.imo}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
