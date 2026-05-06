import Link from "next/link";
import { ChevronDown, LineChart } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { type EnvScore } from "@/components/app/env-score-badge";
import {
  VesselDetailTabs,
  type VesselDetail,
} from "./_tabs";

/* --------------------------------------------------------------------------
 * Mock data — vessel records keyed by IMO.
 * Until the API is ready, any unmapped IMO falls back to MV Pacific Star.
 * Shapes follow vessel-details.html.
 * -------------------------------------------------------------------------- */

const PACIFIC_STAR: VesselDetail = {
  imo: "9623148",
  mmsi: "538006142",
  name: "MV Pacific Star",
  flag: "Marshall Islands",
  type: "Bulk Carrier",
  classification: "Bureau Veritas (BV)",
  yearBuilt: 2016,
  shipyard: "Jiangsu New Yangzi, China",
  dwt: 82000,
  grt: 44200,
  nrt: 27600,
  loa: "229.0 m",
  beam: "32.26 m",
  draft: "14.43 m",
  engine: "MAN B&W 6G60ME",
  speed: "14.5 kn (eco 12.5 kn)",
  fmv: "$28.5M",
  fmvChange: "+4.0% vs 6 months ago",
  envScore: "A" satisfies EnvScore,
  heroImage:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&auto=format&q=80",
  spec: "Panamax Bulk Carrier · Built 2016 · IMO 9623148 · 82,000 DWT",
  employment: {
    type: "Time Charter",
    charterer: "Oldendorff Carriers",
    rate: "$14,500 / day",
    period: "Sep 2025 – Aug 2026",
    daysRemaining: 154,
    lastPort: "Port Hedland, AU",
    voyage: "Hedland → Qingdao",
    cargo: "Iron Ore — 79,200 MT",
  },
  certificates: [
    { status: "ok", label: "Safety Management Cert — 2027-04" },
    { status: "ok", label: "Class Certificate (BV) — 2026-09" },
    { status: "ok", label: "ISM DOC — 2027-01" },
    { status: "ok", label: "ISSC — 2026-11" },
    { status: "ok", label: "MLC Certificate — 2027-06" },
    { status: "warn", label: "Load Line Cert — 2026-06" },
    { status: "ok", label: "IOPP Certificate — 2026-08" },
    { status: "ok", label: "P&I Certificate (Gard) — 2026" },
  ],
  ownership: [
    { from: "2022", to: "Present", owner: "Star Bulk Carriers Corp." },
    { from: "2018", to: "2022", owner: "Diana Shipping Inc." },
    { from: "2016", to: "2018", owner: "Jiangsu Yangzi Shipping" },
  ],
};

const VESSELS: Record<string, VesselDetail> = {
  [PACIFIC_STAR.imo]: PACIFIC_STAR,
};

/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ imo: string }>;
}) {
  const { imo } = await params;
  const v = VESSELS[imo] ?? PACIFIC_STAR;
  return { title: `${v.name} · Vessel Details` };
}

export default async function VesselDetailPage({
  params,
}: {
  params: Promise<{ imo: string }>;
}) {
  const { imo } = await params;
  // Allow any IMO during the prototype phase by falling back to Pacific Star
  // but exposing the requested IMO/name. This keeps cross-links from search /
  // fleet tables / dashboard from 404-ing.
  const base = VESSELS[imo] ?? PACIFIC_STAR;
  const v: VesselDetail = base.imo === imo ? base : { ...base, imo };

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "Vessel Search", href: "/vessel-search" },
          { label: "Vessel Details" },
        ]}
        title={v.name}
        subtitle={v.spec}
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/cashflow/new?imo=${v.imo}`}>
                <LineChart className="size-3.5" />
                Run Cashflow
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href={`/loan-oracle/new?imo=${v.imo}`}>
                Actions
                <ChevronDown className="size-3.5" />
              </Link>
            </Button>
          </>
        }
      />

      <VesselDetailTabs vessel={v} />
    </div>
  );
}
