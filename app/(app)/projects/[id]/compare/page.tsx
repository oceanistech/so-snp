import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  EnvScoreBadge,
  type EnvScore,
} from "@/components/app/env-score-badge";
import { cn } from "@/lib/utils";

type CompareVessel = {
  imo: string;
  name: string;
  spec: string;
  fmv: string;
  dwt: number;
  age: number;
  cii: EnvScore;
  irr: string;
  irrTone: "pos" | "neg" | "neu";
  npv: string;
  npvTone: "pos" | "neg" | "neu";
  ltv: string;
  fin: "Done Deal" | "Possible" | "Challenging";
};

const VESSELS: CompareVessel[] = [
  { imo: "9623148", name: "MV Pacific Star",  spec: "Panamax Bulk",     fmv: "$28.5M", dwt: 82000, age: 8,  cii: "A", irr: "14.8%", irrTone: "pos", npv: "+$4.2M", npvTone: "pos", ltv: "65%", fin: "Done Deal" },
  { imo: "9462201", name: "MV Baltic Crown",  spec: "Supramax Bulk",    fmv: "$14.8M", dwt: 56000, age: 16, cii: "C", irr: "8.4%",  irrTone: "pos", npv: "+$0.8M", npvTone: "pos", ltv: "75%", fin: "Possible" },
  { imo: "9885640", name: "MV Cape Fortuna",  spec: "Capesize Bulk",    fmv: "$25.1M", dwt: 80000, age: 7,  cii: "A", irr: "10.1%", irrTone: "pos", npv: "+$2.1M", npvTone: "pos", ltv: "60%", fin: "Done Deal" },
  { imo: "9876110", name: "MV Blue Horizon",  spec: "Panamax Bulk",     fmv: "$26.2M", dwt: 82000, age: 6,  cii: "B", irr: "9.6%",  irrTone: "pos", npv: "+$1.6M", npvTone: "pos", ltv: "70%", fin: "Possible" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Compare — ${id}` };
}

const ROWS = [
  { label: "FMV",      key: "fmv" as const,    bold: true },
  { label: "DWT",      key: "dwt" as const,    bold: false, format: "thousands" },
  { label: "Age",      key: "age" as const,    bold: false, format: "years" },
  { label: "CII",      key: "cii" as const,    bold: false, badge: true },
  { label: "IRR",      key: "irr" as const,    bold: true,  toneKey: "irrTone" as const },
  { label: "NPV",      key: "npv" as const,    bold: false, toneKey: "npvTone" as const },
  { label: "LTV",      key: "ltv" as const,    bold: false },
  { label: "Financibility", key: "fin" as const, bold: true },
];

export default async function ProjectCompare({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "Projects", href: "/projects" },
          { label: id, href: `/projects/${id}` },
          { label: "Compare" },
        ]}
        title="Vessel Comparison"
        subtitle="Side-by-side performance metrics for every vessel in this project"
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/projects/${id}`}>Back to project</Link>
            </Button>
            <Button className="gap-2">
              <Download className="size-3.5" />
              Export
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <h2 className="text-[14px] font-bold">Comparison Matrix</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {VESSELS.length} vessels · all metrics weighted equally
            </p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Metric
                  </th>
                  {VESSELS.map((v) => (
                    <th key={v.imo} className="min-w-[160px] px-4 py-3 text-left">
                      <Link href={`/vessels/${v.imo}`} className="block text-[13px] font-bold hover:text-primary">
                        {v.name}
                      </Link>
                      <p className="text-[10px] font-normal text-muted-foreground">
                        {v.spec} · IMO {v.imo}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="bg-muted/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {row.label}
                    </td>
                    {VESSELS.map((v) => {
                      const raw = v[row.key];
                      const tone = row.toneKey ? v[row.toneKey] : undefined;
                      let display: React.ReactNode = String(raw);
                      if (row.badge && typeof raw === "string") {
                        display = <EnvScoreBadge value={raw as EnvScore} />;
                      } else if (row.format === "thousands" && typeof raw === "number") {
                        display = raw.toLocaleString();
                      } else if (row.format === "years" && typeof raw === "number") {
                        display = `${raw} yrs`;
                      }
                      return (
                        <td
                          key={v.imo}
                          className={cn(
                            "px-4 py-2.5 tabular-nums",
                            row.bold && "font-bold",
                            tone === "pos" && "text-signal-green",
                            tone === "neg" && "text-signal-magenta",
                          )}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="bg-muted/20 px-4 py-3" />
                  {VESSELS.map((v) => (
                    <td key={v.imo} className="px-4 py-3">
                      <Button asChild size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[11px]">
                        <Link href={`/vessels/${v.imo}`}>
                          <Eye className="size-3" />
                          Details
                        </Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
