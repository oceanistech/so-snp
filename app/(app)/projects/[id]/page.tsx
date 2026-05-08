import Link from "next/link";
import {
  Calculator,
  Edit3,
  GitCompare,
  LineChart,
  Plus,
} from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import {
  RequestStatusChip,
  type RequestStatus,
} from "@/components/app/request-status-chip";
import { cn } from "@/lib/utils";

const PROJECTS: Record<
  string,
  {
    title: string;
    description: string;
    status: "Active" | "Complete" | "Draft" | "Archived";
    category: string;
    created: string;
    modified: string;
    owner: string;
    vessels: { imo: string; name: string; spec: string }[];
    scenarios: {
      id: string;
      kind: "Cashflow" | "Loan Oracle";
      vessel: string;
      result: string;
      tone: "pos" | "neg" | "neu";
      created: string;
      status: RequestStatus;
    }[];
  }
> = {
  "bulk-fleet-expansion-2026": {
    title: "Bulk Fleet Expansion 2026",
    description:
      "Evaluation of 4 Panamax and Kamsarmax bulk carriers for portfolio expansion. Includes cashflow projections and loan oracle scenarios.",
    status: "Active",
    category: "Investment",
    created: "10 Mar 2026",
    modified: "25 Mar 2026",
    owner: "A. Avdieieva",
    vessels: [
      { imo: "9623148", name: "MV Pacific Star",    spec: "Panamax Bulk · 2018" },
      { imo: "9462201", name: "MV Baltic Crown",    spec: "Supramax Bulk · 2010" },
      { imo: "9885640", name: "MV Cape Fortuna",    spec: "Capesize Bulk · 2019" },
      { imo: "9876110", name: "MV Blue Horizon",    spec: "Panamax Bulk · 2020" },
    ],
    scenarios: [
      { id: "s-1", kind: "Cashflow",    vessel: "MV Pacific Star", result: "IRR 14.8% · NPV +$4.2M",  tone: "pos", created: "26 Mar 2026", status: "completed" },
      { id: "s-2", kind: "Cashflow",    vessel: "MV Pacific Star", result: "IRR 6.2% · NPV −$1.4M",   tone: "neg", created: "26 Mar 2026", status: "completed" },
      { id: "s-3", kind: "Cashflow",    vessel: "MV Cape Fortuna", result: "IRR 10.1% · NPV +$2.1M",  tone: "pos", created: "24 Mar 2026", status: "completed" },
      { id: "s-4", kind: "Loan Oracle", vessel: "MV Pacific Star", result: "Highly Possible · LTV 65%", tone: "pos", created: "23 Mar 2026", status: "completed" },
      { id: "s-5", kind: "Loan Oracle", vessel: "MV Baltic Crown", result: "Possible · LTV 75%",       tone: "neu", created: "20 Mar 2026", status: "completed" },
    ],
  },
};

const FALLBACK = PROJECTS["bulk-fleet-expansion-2026"]!;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = PROJECTS[id] ?? FALLBACK;
  return { title: `${p.title} · Projects` };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = PROJECTS[id] ?? FALLBACK;
  const cashflowCount = p.scenarios.filter((s) => s.kind === "Cashflow").length;
  const loanCount = p.scenarios.filter((s) => s.kind === "Loan Oracle").length;

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "Projects", href: "/projects" },
          { label: p.title },
        ]}
        title={p.title}
        subtitle={p.description}
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/projects/${id}/compare`}>
                <GitCompare className="size-3.5" />
                Compare
              </Link>
            </Button>
            <Button variant="outline" className="gap-2">
              <Edit3 className="size-3.5" />
              Edit
            </Button>
            <Button className="gap-2">
              <Plus className="size-3.5" />
              New Scenario
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Status" value={p.status} accent="green" />
          <KpiCard label="Vessels" value={String(p.vessels.length)} meta={p.category} accent="blue" />
          <KpiCard label="Cashflow Scenarios" value={String(cashflowCount)} accent="cyan" />
          <KpiCard label="Loan Oracle Scenarios" value={String(loanCount)} accent="orange" />
        </section>

        <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <Card className="overflow-hidden lg:col-span-5">
            <CardHeader className="border-b">
              <h2 className="text-[14px] font-bold">Vessel Cohort</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {p.vessels.length} vessels under analysis
              </p>
            </CardHeader>
            <ul className="divide-y">
              {p.vessels.map((v) => (
                <li key={v.imo} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/vessels/${v.imo}`} className="text-[12px] font-semibold hover:text-primary">
                      {v.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {v.spec} · IMO {v.imo}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="overflow-hidden lg:col-span-7">
            <CardHeader className="border-b">
              <h2 className="text-[14px] font-bold">Scenarios</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Latest analysis runs in this project
              </p>
            </CardHeader>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Vessel</th>
                  <th className="px-4 py-2 text-left">Result</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {p.scenarios.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold">
                        {s.kind === "Cashflow" ? <Calculator className="size-3 text-primary" /> : <LineChart className="size-3 text-signal-orange" />}
                        {s.kind}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.vessel}</td>
                    <td className={cn(
                      "px-4 py-2.5 font-semibold",
                      s.tone === "pos" && "text-signal-green",
                      s.tone === "neg" && "text-signal-magenta",
                      s.tone === "neu" && "text-foreground",
                    )}>
                      {s.result}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.created}</td>
                    <td className="px-4 py-2.5"><RequestStatusChip value={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <Card className="bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Project meta
            </span>
            <span className="text-[12px]"><strong>Created:</strong> {p.created}</span>
            <span className="text-[12px]"><strong>Modified:</strong> {p.modified}</span>
            <span className="text-[12px]"><strong>Owner:</strong> {p.owner}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
