import { Download, Search } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailRow } from "@/components/app/detail-row";
import { cn } from "@/lib/utils";

export const metadata = { title: "AIS Tracking" };

/* --------------------------------------------------------------------------
 * Mock data — last 10 AIS pings.
 * -------------------------------------------------------------------------- */

type AisPing = {
  ts: string;
  latLon: string;
  speed: string;
  heading: string;
  event: "Underway" | "At Anchor" | "Drifting" | "Moored";
  current?: boolean;
};

const PINGS: AisPing[] = [
  { ts: "25 Mar 2026 14:22", latLon: "12.48°N / 44.82°E", speed: "12.4", heading: "084°", event: "Underway", current: true },
  { ts: "25 Mar 2026 12:06", latLon: "12.31°N / 43.94°E", speed: "12.2", heading: "082°", event: "Underway" },
  { ts: "25 Mar 2026 10:04", latLon: "12.18°N / 43.12°E", speed: "12.6", heading: "081°", event: "Underway" },
  { ts: "25 Mar 2026 08:00", latLon: "12.02°N / 42.28°E", speed: "11.8", heading: "079°", event: "Underway" },
  { ts: "25 Mar 2026 06:01", latLon: "11.84°N / 41.44°E", speed: "12.1", heading: "082°", event: "Underway" },
  { ts: "25 Mar 2026 04:02", latLon: "11.62°N / 40.60°E", speed: "12.3", heading: "080°", event: "Underway" },
  { ts: "25 Mar 2026 02:00", latLon: "11.42°N / 39.82°E", speed: "12.0", heading: "083°", event: "Underway" },
  { ts: "25 Mar 2026 00:03", latLon: "11.24°N / 39.04°E", speed: "11.6", heading: "081°", event: "Underway" },
  { ts: "24 Mar 2026 22:01", latLon: "11.08°N / 38.24°E", speed: "0.0",  heading: "—",    event: "At Anchor" },
  { ts: "24 Mar 2026 18:40", latLon: "11.08°N / 38.24°E", speed: "0.0",  heading: "—",    event: "At Anchor" },
];

const EVENT_STYLE: Record<AisPing["event"], string> = {
  Underway: "bg-signal-green/15 text-signal-green",
  "At Anchor": "bg-signal-orange/15 text-signal-orange",
  Drifting: "bg-signal-magenta/15 text-signal-magenta",
  Moored: "bg-primary/15 text-primary",
};

/* -------------------------------------------------------------------------- */

export default function AisTrackingPage() {
  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Finance Toolkit" }, { label: "AIS Tracking" }]}
        title="AIS Tracking"
        subtitle="Real-time vessel position, speed and route history via AIS data"
        actions={
          <>
            <div className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 min-w-[260px]">
              <Search className="size-3.5 text-muted-foreground" />
              <input
                type="text"
                defaultValue="MV Pacific Star"
                placeholder="Search vessel…"
                className="w-full bg-transparent text-[13px] focus:outline-none"
              />
            </div>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-signal-green/10 px-3 text-[11px] font-bold text-signal-green">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-signal-green" />
              </span>
              Live AIS
            </span>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        {/* Map placeholder */}
        <MapPlaceholder />

        {/* Two-column 8-4 */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* LEFT — Track history */}
          <Card className="overflow-hidden lg:col-span-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
              <h2 className="text-[14px] font-bold">
                Track History — Last 10 Positions
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-green/10 px-2 py-0.5 text-[10px] font-bold text-signal-green">
                <span className="size-1.5 rounded-full bg-signal-green" />
                Live AIS
              </span>
            </CardHeader>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Timestamp</th>
                  <th className="px-4 py-2 text-left">Lat / Lon</th>
                  <th className="px-4 py-2 text-right">Speed (kts)</th>
                  <th className="px-4 py-2 text-right">Heading</th>
                  <th className="px-4 py-2 text-left">Event</th>
                </tr>
              </thead>
              <tbody>
                {PINGS.map((p, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30",
                      p.current && "bg-primary/5",
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {p.current ? (
                          <span className="inline-flex size-1.5 rounded-full bg-signal-green ring-2 ring-signal-green/30" />
                        ) : (
                          <span className="inline-flex size-1.5 rounded-full bg-muted-foreground/40" />
                        )}
                        {p.ts}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono tabular-nums text-muted-foreground">
                      {p.latLon}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums",
                        p.current && "font-bold",
                      )}
                    >
                      {p.speed}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {p.heading}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                          EVENT_STYLE[p.event],
                        )}
                      >
                        {p.event}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* RIGHT — Current Position */}
          <Card className="lg:col-span-4">
            <CardHeader className="border-b">
              <h2 className="text-[14px] font-bold">Current Position</h2>
            </CardHeader>
            <div className="px-4 py-2">
              <DetailRow label="Last Position" value="Gulf of Aden" />
              <DetailRow label="Coordinates" value="12.48°N / 44.82°E" mono />
              <DetailRow label="Speed" value="12.4 kts" />
              <DetailRow label="Heading" value="084°" mono />
              <DetailRow label="Draught" value="13.8 m" />
              <DetailRow label="Destination" value="JNPT, India" />
              <DetailRow label="ETA" value="28 Mar 2026" />
              <DetailRow
                label="AIS Updated"
                value="2 min ago"
                valueClassName="text-muted-foreground"
              />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local helpers
 * -------------------------------------------------------------------------- */

function MapPlaceholder() {
  return (
    <div className="relative h-[400px] overflow-hidden rounded-md border border-primary/20 bg-sidebar">
      {/* Grid lines (horizontal) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--primary) / 0.08) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.08) 1px, transparent 1px)",
          backgroundSize: "20% 25%",
        }}
        aria-hidden
      />

      {/* Dashed track line */}
      <svg
        className="absolute inset-0 size-full opacity-50"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points="150,280 280,240 420,210 560,220 680,200 760,190 830,175"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
        />
      </svg>

      {/* Vessel position dot */}
      <div
        className="absolute"
        style={{ top: "43%", left: "83%" }}
        aria-label="Current vessel position"
      >
        <span className="relative flex size-3.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal-green/40" />
          <span className="relative inline-flex size-3.5 rounded-full bg-signal-green ring-4 ring-signal-green/25" />
        </span>
      </div>

      {/* Label badge top-left */}
      <div className="absolute left-5 top-4 flex items-center gap-2 rounded-md border border-primary/30 bg-sidebar/90 px-3 py-1.5 text-[11px] font-bold text-sidebar-foreground backdrop-blur">
        <span className="inline-flex size-1.5 rounded-full bg-signal-green" />
        AIS Position Map — MV Pacific Star
      </div>

      {/* Watermark */}
      <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-sidebar-muted/60">
        Map placeholder · live tiles wired in next sprint
      </span>
    </div>
  );
}
