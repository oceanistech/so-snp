import Link from "next/link";
import { Download, RefreshCcw } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import { PageTabs } from "@/components/app/page-tabs";
import {
  EnvScoreBadge,
  type EnvScore,
} from "@/components/app/env-score-badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "Emissions Tracker" };

type EmissionRow = {
  imo: string;
  name: string;
  cii: EnvScore;
  co2Tonnes: number;          // YTD CO₂
  ciiAttained: number;        // g CO₂ / DWTnm
  euEtsCost: string;          // YTD EU ETS allowance cost
  voyages: number;
  trend: "up" | "down" | "neutral";
};

const FLEET: EmissionRow[] = [
  { imo: "9905611", name: "MV Coral Bay",        cii: "A", co2Tonnes: 12400, ciiAttained: 6.4,  euEtsCost: "$58K",  voyages: 18, trend: "down" },
  { imo: "9888420", name: "MT Cosmos Trader",    cii: "A", co2Tonnes: 9800,  ciiAttained: 6.8,  euEtsCost: "$42K",  voyages: 22, trend: "down" },
  { imo: "9623148", name: "MV Pacific Star",     cii: "A", co2Tonnes: 18200, ciiAttained: 7.1,  euEtsCost: "$84K",  voyages: 14, trend: "neutral" },
  { imo: "9512098", name: "MV Northern Star",    cii: "B", co2Tonnes: 32400, ciiAttained: 7.8,  euEtsCost: "$152K", voyages: 12, trend: "down" },
  { imo: "9742158", name: "MV Nordic Eagle",     cii: "B", co2Tonnes: 24600, ciiAttained: 8.2,  euEtsCost: "$118K", voyages: 16, trend: "neutral" },
  { imo: "9450112", name: "MV Sea Breeze",       cii: "C", co2Tonnes: 21400, ciiAttained: 9.4,  euEtsCost: "$104K", voyages: 14, trend: "neutral" },
  { imo: "9617832", name: "MV Atlantic Pioneer", cii: "D", co2Tonnes: 41200, ciiAttained: 11.2, euEtsCost: "$214K", voyages: 11, trend: "up" },
];

export default function EmissionsTrackerPage() {
  const totalCo2 = FLEET.reduce((sum, r) => sum + r.co2Tonnes, 0);
  const totalEts = FLEET.reduce((sum, r) => sum + Number(r.euEtsCost.replace(/[^0-9]/g, "")) * 1000, 0);

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Market" },
          { label: "Environmental Score", href: "/environmental-score" },
          { label: "Emissions Tracker" },
        ]}
        title="Emissions Tracker"
        subtitle="Monitor CO₂, SOx, NOx and GHG emissions across your fleet · EU ETS compliance tracking"
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export Report
            </Button>
            <Button className="gap-2">
              <RefreshCcw className="size-3.5" />
              Refresh
            </Button>
          </>
        }
      />

      <PageTabs
        tabs={[
          {
            id: "by-vessel",
            label: "By Vessel",
            content: <ByVesselPanel totalCo2={totalCo2} totalEts={totalEts} />,
          },
          { id: "by-voyage", label: "By Voyage", placeholder: true },
          { id: "eu-ets", label: "EU ETS", placeholder: true },
          { id: "carbon-credits", label: "Carbon Credits", placeholder: true },
          { id: "annual-reports", label: "Annual Reports", placeholder: true },
        ]}
      />
    </div>
  );
}

function ByVesselPanel({
  totalCo2,
  totalEts,
}: {
  totalCo2: number;
  totalEts: number;
}) {
  return (
    <div className="flex flex-col gap-6 p-8">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Fleet CO₂ YTD"
              value={`${(totalCo2 / 1000).toFixed(1)}K t`}
              direction="down"
              change="−6.2% vs prior year"
              accent="blue"
            />
            <KpiCard
              label="EU ETS Cost YTD"
              value={`$${(totalEts / 1_000_000).toFixed(2)}M`}
              meta="Allowances purchased"
              accent="orange"
            />
            <KpiCard
              label="Avg Carbon Intensity"
              value="8.4 g/DWTnm"
              direction="down"
              change="−0.6 vs 2024"
              accent="green"
            />
            <KpiCard
              label="Compliant Vessels"
              value={`${FLEET.filter((r) => r.cii !== "D" && r.cii !== "E").length}/${FLEET.length}`}
              meta="CII grade ≥ C"
              accent="cyan"
            />
          </section>

          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <h2 className="text-[14px] font-bold">Per-Vessel Emissions</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Year-to-date · CO₂, CII attained, EU ETS allowance cost
              </p>
            </CardHeader>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Vessel</th>
                  <th className="px-4 py-2 text-center">CII</th>
                  <th className="px-4 py-2 text-right">CO₂ YTD</th>
                  <th className="px-4 py-2 text-right">CII Attained</th>
                  <th className="px-4 py-2 text-right">EU ETS Cost</th>
                  <th className="px-4 py-2 text-right">Voyages</th>
                  <th className="px-4 py-2 text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {FLEET.map((r) => (
                  <tr key={r.imo} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <Link href={`/vessels/${r.imo}`} className="font-semibold hover:text-primary">
                        {r.name}
                      </Link>
                      <span className="ml-2 font-mono text-[10px] tabular-nums text-muted-foreground">IMO {r.imo}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center"><EnvScoreBadge value={r.cii} /></td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.co2Tonnes.toLocaleString()} t</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">{r.ciiAttained.toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.euEtsCost}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.voyages}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={cn(
                          "inline-block size-2 rounded-full",
                          r.trend === "up" && "bg-signal-magenta",
                          r.trend === "down" && "bg-signal-green",
                          r.trend === "neutral" && "bg-muted-foreground/40",
                        )}
                        title={r.trend === "up" ? "Increasing" : r.trend === "down" ? "Improving" : "Stable"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
  );
}
