import Link from "next/link";
import { Building2, Globe, Mail, Phone } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import { PageTabs } from "@/components/app/page-tabs";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";

type Owner = {
  id: string;
  name: string;
  hq: string;
  founded: string;
  website: string;
  email: string;
  phone: string;
  blurb: string;
  fleetSize: number;
  totalDwt: string;
  fleetFmv: string;
  recentActivity: number;
  vessels: { imo: string; name: string; spec: string; type: VesselType; built: number; dwt: number }[];
};

const OWNERS: Record<string, Owner> = {
  "star-bulk": {
    id: "star-bulk",
    name: "Star Bulk Carriers Corp.",
    hq: "Athens, Greece",
    founded: "2007",
    website: "starbulk.com",
    email: "info@starbulk.com",
    phone: "+30 210 617 8400",
    blurb: "One of the largest dry bulk shipping companies globally, listed on NASDAQ. Pure-play exposure to Capesize and Kamsarmax bulk carriers.",
    fleetSize: 22,
    totalDwt: "1.42M",
    fleetFmv: "$416M",
    recentActivity: 4,
    vessels: [
      { imo: "9512098", name: "MV Northern Star", spec: "Capesize · 2017", type: "Bulk Carrier", built: 2017, dwt: 180000 },
      { imo: "9885640", name: "MV Cape Fortuna",  spec: "Capesize · 2019", type: "Bulk Carrier", built: 2019, dwt: 80000 },
      { imo: "9462201", name: "MV Baltic Crown",  spec: "Supramax · 2010", type: "Bulk Carrier", built: 2010, dwt: 56000 },
      { imo: "9905611", name: "MV Coral Bay",     spec: "Bulk · 2021",      type: "Bulk Carrier", built: 2021, dwt: 62100 },
    ],
  },
};

const FALLBACK = OWNERS["star-bulk"]!;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = OWNERS[id] ?? FALLBACK;
  return { title: `${o.name} · Owner` };
}

export default async function OwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = OWNERS[id] ?? FALLBACK;

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "Owners" },
          { label: o.name },
        ]}
        title={o.name}
        subtitle={o.blurb}
      />

      <PageTabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: <OverviewPanel o={o} />,
          },
          { id: "fleet", label: "Fleet", placeholder: true },
          { id: "sp", label: "S&P Activity", placeholder: true },
          { id: "financials", label: "Financials", placeholder: true },
          { id: "contacts", label: "Contacts", placeholder: true },
        ]}
      />
    </div>
  );
}

function OverviewPanel({ o }: { o: Owner }) {
  return (
    <div className="flex flex-col gap-6 p-8">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Fleet Size" value={String(o.fleetSize)} meta="Owned vessels" accent="blue" />
            <KpiCard label="Total DWT" value={o.totalDwt} accent="green" />
            <KpiCard label="Fleet FMV" value={o.fleetFmv} accent="cyan" />
            <KpiCard label="S&P Activity (12M)" value={String(o.recentActivity)} meta="Sales + acquisitions" accent="orange" />
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <Card className="lg:col-span-4">
              <CardHeader className="border-b">
                <h2 className="text-[14px] font-bold">Company Information</h2>
              </CardHeader>
              <div className="space-y-3 p-4 text-[12px]">
                <InfoRow icon={<Building2 className="size-3.5" />} label="Headquarters" value={o.hq} />
                <InfoRow label="Founded" value={o.founded} />
                <InfoRow icon={<Globe className="size-3.5" />} label="Website" value={o.website} />
                <InfoRow icon={<Mail className="size-3.5" />} label="Email" value={o.email} />
                <InfoRow icon={<Phone className="size-3.5" />} label="Phone" value={o.phone} />
              </div>
            </Card>

            <Card className="overflow-hidden lg:col-span-8">
              <CardHeader className="border-b">
                <h2 className="text-[14px] font-bold">Top Vessels</h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {o.vessels.length} vessels shown · Click to drill in
                </p>
              </CardHeader>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2 text-left">Vessel</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-right">Built</th>
                    <th className="px-4 py-2 text-right">DWT</th>
                  </tr>
                </thead>
                <tbody>
                  {o.vessels.map((v) => (
                    <tr key={v.imo} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <Link href={`/vessels/${v.imo}`} className="font-semibold hover:text-primary">
                          {v.name}
                        </Link>
                        <span className="ml-2 font-mono text-[10px] tabular-nums text-muted-foreground">
                          IMO {v.imo}
                        </span>
                      </td>
                      <td className="px-4 py-2.5"><VesselTypeBadge value={v.type} /></td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{v.built}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{v.dwt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-2 last:border-0">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
