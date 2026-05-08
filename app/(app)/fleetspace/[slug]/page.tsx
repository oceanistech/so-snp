import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Edit3, MoreHorizontal, Plus } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import {
  EnvScoreBadge,
  type EnvScore,
} from "@/components/app/env-score-badge";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Mock fleet data — keyed by slug.
 * -------------------------------------------------------------------------- */

type FleetVessel = {
  imo: string;
  name: string;
  type: VesselType;
  year: number;
  dwt: number;
  fmv: string;
  cii: EnvScore;
  status: "Active" | "Laid Up" | "Drydock";
};

type Fleet = {
  slug: string;
  name: string;
  description: string;
  created: string;
  modified: string;
  totalFmv: string;
  totalDwt: string;
  avgAge: string;
  vessels: FleetVessel[];
  accent: "blue" | "green" | "orange" | "purple";
};

const FLEETS: Record<string, Fleet> = {
  alpha: {
    slug: "alpha",
    name: "Fleet Alpha",
    description: "Bulk + tanker mix, acquired post-2018 for long-term TC strategy.",
    created: "12 Jan 2025",
    modified: "25 Mar 2026",
    totalFmv: "$498M",
    totalDwt: "512K",
    avgAge: "7.2 yrs",
    accent: "blue",
    vessels: [
      { imo: "9623148", name: "MV Pacific Star",   type: "Bulk Carrier", year: 2018, dwt: 82000,  fmv: "$28.5M", cii: "A", status: "Active" },
      { imo: "9905611", name: "MV Coral Bay",      type: "Bulk Carrier", year: 2021, dwt: 62100,  fmv: "$32.4M", cii: "A", status: "Active" },
      { imo: "9512098", name: "MV Northern Star",  type: "Bulk Carrier", year: 2017, dwt: 180000, fmv: "$98.4M", cii: "B", status: "Active" },
      { imo: "9742158", name: "MV Nordic Eagle",   type: "Tanker",        year: 2014, dwt: 105000, fmv: "$42.8M", cii: "B", status: "Active" },
      { imo: "9712305", name: "MT Helios Trader",  type: "Tanker",        year: 2014, dwt: 158400, fmv: "$62.0M", cii: "B", status: "Active" },
      { imo: "9888420", name: "MT Cosmos Trader",  type: "Tanker",        year: 2020, dwt: 49500,  fmv: "$36.9M", cii: "A", status: "Active" },
      { imo: "9450112", name: "MV Sea Breeze",     type: "Bulk Carrier", year: 2012, dwt: 76800,  fmv: "$18.2M", cii: "C", status: "Drydock" },
      { imo: "9762890", name: "MV Star Voyager",   type: "Container",     year: 2018, dwt: 86000,  fmv: "$84.5M", cii: "B", status: "Active" },
    ],
  },
  beta: {
    slug: "beta",
    name: "Fleet Beta",
    description: "Tanker-heavy fleet focused on dirty trade and S&P opportunities.",
    created: "04 Mar 2025",
    modified: "22 Mar 2026",
    totalFmv: "$344M",
    totalDwt: "330K",
    avgAge: "10.1 yrs",
    accent: "green",
    vessels: [
      { imo: "9617832", name: "MV Atlantic Pioneer", type: "Tanker",        year: 2009, dwt: 158000, fmv: "$26.4M", cii: "D", status: "Active" },
      { imo: "9345671", name: "MT Aegean Wind",      type: "Tanker",        year: 2015, dwt: 115200, fmv: "$41.2M", cii: "B", status: "Active" },
      { imo: "9885640", name: "MV Cape Fortuna",     type: "Bulk Carrier", year: 2019, dwt: 80000,  fmv: "$25.1M", cii: "A", status: "Active" },
      { imo: "9462201", name: "MV Baltic Crown",     type: "Bulk Carrier", year: 2010, dwt: 56000,  fmv: "$14.8M", cii: "C", status: "Laid Up" },
      { imo: "9742218", name: "MT Nordic Crest",     type: "Tanker",        year: 2022, dwt: 76000,  fmv: "$38.0M", cii: "A", status: "Active" },
      { imo: "9532148", name: "MT Aegean Spirit",    type: "Tanker",        year: 2012, dwt: 105000, fmv: "$22.0M", cii: "C", status: "Active" },
    ],
  },
};

/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = FLEETS[slug];
  return { title: `${f?.name ?? slug} · FleetSpace` };
}

export default async function FleetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fleet = FLEETS[slug];
  if (!fleet) notFound();

  const accent =
    fleet.accent === "blue"
      ? "bg-primary/10 text-primary"
      : fleet.accent === "green"
        ? "bg-signal-green/10 text-signal-green"
        : fleet.accent === "orange"
          ? "bg-signal-orange/10 text-signal-orange"
          : "bg-signal-purple/10 text-signal-purple";

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "FleetSpace", href: "/fleetspace" },
          { label: fleet.name },
        ]}
        title={fleet.name}
        subtitle={fleet.description}
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/fleetspace/${fleet.slug}/edit`}>
                <Edit3 className="size-3.5" />
                Edit Fleet
              </Link>
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
            <Button asChild className="gap-2">
              <Link href="/fleetspace/add-vessel">
                <Plus className="size-3.5" />
                Add Vessel
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Vessels"
            value={String(fleet.vessels.length)}
            meta={`${fleet.vessels.filter((v) => v.status === "Active").length} active`}
            accent="blue"
          />
          <KpiCard label="Total FMV" value={fleet.totalFmv} accent="green" />
          <KpiCard label="Total DWT" value={fleet.totalDwt} accent="cyan" />
          <KpiCard label="Avg. Vessel Age" value={fleet.avgAge} accent="orange" />
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
            <div>
              <h2 className="flex items-center gap-2 text-[14px] font-bold">
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-md",
                    accent,
                  )}
                >
                  {fleet.name.charAt(fleet.name.length - 1)}
                </span>
                {fleet.name} — Vessels
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Created {fleet.created} · Updated {fleet.modified}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreHorizontal className="size-4" />
            </Button>
          </CardHeader>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Vessel</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Year</th>
                <th className="px-4 py-2 text-right">DWT</th>
                <th className="px-4 py-2 text-right">FMV</th>
                <th className="px-4 py-2 text-center">CII</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {fleet.vessels.map((v) => (
                <tr key={v.imo} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <Link href={`/vessels/${v.imo}`} className="block font-semibold text-foreground hover:text-primary">
                      {v.name}
                    </Link>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">IMO {v.imo}</span>
                  </td>
                  <td className="px-4 py-2.5"><VesselTypeBadge value={v.type} /></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{v.year}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{v.dwt.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">{v.fmv}</td>
                  <td className="px-4 py-2.5 text-center"><EnvScoreBadge value={v.cii} /></td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                        v.status === "Active" && "bg-signal-green/15 text-signal-green",
                        v.status === "Laid Up" && "bg-signal-orange/15 text-signal-orange",
                        v.status === "Drydock" && "bg-primary/15 text-primary",
                      )}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
