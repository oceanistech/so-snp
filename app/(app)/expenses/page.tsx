import { Download } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import { PageTabs } from "@/components/app/page-tabs";
import { cn } from "@/lib/utils";

export const metadata = { title: "Expenses" };

const OPEX_BREAKDOWN = [
  { category: "Crew",            ytd: "$8.4M",  pct: 32, color: "bg-primary" },
  { category: "Stores",          ytd: "$3.2M",  pct: 12, color: "bg-signal-green" },
  { category: "Repairs",         ytd: "$5.1M",  pct: 19, color: "bg-signal-orange" },
  { category: "Insurance",       ytd: "$2.8M",  pct: 11, color: "bg-signal-purple" },
  { category: "Lubricants",      ytd: "$1.6M",  pct: 6,  color: "bg-accent" },
  { category: "Management Fee",  ytd: "$2.1M",  pct: 8,  color: "bg-signal-magenta" },
  { category: "Other / SG&A",    ytd: "$3.2M",  pct: 12, color: "bg-muted-foreground/40" },
];

const VESSEL_OPEX = [
  { name: "MV Pacific Star",     daily: "$7,420", ytd: "$2.6M", budget: "$2.7M",  variance: "−3.7%", positive: true  },
  { name: "MT Aegean Wind",      daily: "$8,150", ytd: "$2.9M", budget: "$2.8M",  variance: "+3.6%", positive: false },
  { name: "MV Northern Star",    daily: "$8,940", ytd: "$3.2M", budget: "$3.1M",  variance: "+3.2%", positive: false },
  { name: "MV Atlantic Pioneer", daily: "$8,210", ytd: "$2.9M", budget: "$2.9M",  variance: "+0.0%", positive: true  },
  { name: "MV Nordic Eagle",     daily: "$7,860", ytd: "$2.8M", budget: "$2.9M",  variance: "−3.4%", positive: true  },
  { name: "MV Coral Bay",        daily: "$6,940", ytd: "$2.5M", budget: "$2.6M",  variance: "−3.8%", positive: true  },
];

export default function ExpensesPage() {
  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "Expenses" }]}
        title="Expenses"
        subtitle="Fleet OPEX, technical management fees, and SG&A — historic, current and forecast"
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="size-3.5" />
            Export
          </Button>
        }
      />

      <PageTabs
        tabs={[
          {
            id: "current",
            label: "Current Period",
            content: <CurrentPeriodPanel />,
          },
          { id: "historical", label: "Historical Costs", placeholder: true },
          { id: "budget", label: "Budget & Forecast", placeholder: true },
        ]}
      />
    </div>
  );
}

function CurrentPeriodPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Fleet OPEX YTD"
              value="$26.4M"
              direction="up"
              change="+4.2% vs prior year"
              accent="blue"
            />
            <KpiCard
              label="Avg Daily OPEX"
              value="$7,920"
              meta="14 vessels"
              accent="orange"
            />
            <KpiCard
              label="Mgmt Fee YTD"
              value="$2.1M"
              meta="External management"
              accent="purple"
            />
            <KpiCard
              label="Variance to Budget"
              value="+1.4%"
              direction="up"
              change="$370K over"
              accent="cyan"
            />
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle className="text-base">OPEX Breakdown</CardTitle>
                <CardDescription>Year-to-date by category · USD millions</CardDescription>
              </CardHeader>
              <ul className="space-y-2.5 p-4">
                {OPEX_BREAKDOWN.map((b) => (
                  <li key={b.category} className="flex items-center gap-3">
                    <span className="w-32 text-[12px] text-muted-foreground">{b.category}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full transition-[width]", b.color)} style={{ width: `${b.pct}%` }} />
                    </div>
                    <span className="w-16 text-right text-[12px] font-bold tabular-nums">{b.ytd}</span>
                    <span className="w-10 text-right text-[10px] tabular-nums text-muted-foreground">{b.pct}%</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="overflow-hidden lg:col-span-7">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Per-Vessel OPEX</CardTitle>
                <CardDescription>Daily rate · YTD spend · vs budget</CardDescription>
              </CardHeader>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2 text-left">Vessel</th>
                    <th className="px-4 py-2 text-right">Daily</th>
                    <th className="px-4 py-2 text-right">YTD</th>
                    <th className="px-4 py-2 text-right">Budget</th>
                    <th className="px-4 py-2 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {VESSEL_OPEX.map((v) => (
                    <tr key={v.name} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-semibold">{v.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{v.daily}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{v.ytd}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{v.budget}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                            v.positive ? "bg-signal-green/10 text-signal-green" : "bg-signal-magenta/10 text-signal-magenta",
                          )}
                        >
                          {v.variance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </div>
  );
}
