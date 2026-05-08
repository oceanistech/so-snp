import { Download, RefreshCcw } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/components/app/kpi-card";
import { PageTabs } from "@/components/app/page-tabs";
import { cn } from "@/lib/utils";

export const metadata = { title: "EURIBOR Rate Tracker" };

const TENORS = [
  { label: "1M",  value: "3.65%", changeM: "−0.08%", changeY: "−0.42%", direction: "down" as const },
  { label: "3M",  value: "3.72%", changeM: "−0.12%", changeY: "−0.55%", direction: "down" as const },
  { label: "6M",  value: "3.85%", changeM: "−0.15%", changeY: "−0.62%", direction: "down" as const },
  { label: "12M", value: "3.91%", changeM: "−0.18%", changeY: "−0.68%", direction: "down" as const },
];

const HISTORY = [
  { date: "Mar 2026", v1: 3.65, v3: 3.72, v6: 3.85, v12: 3.91 },
  { date: "Feb 2026", v1: 3.73, v3: 3.84, v6: 4.00, v12: 4.09 },
  { date: "Jan 2026", v1: 3.82, v3: 3.96, v6: 4.12, v12: 4.21 },
  { date: "Dec 2025", v1: 3.94, v3: 4.06, v6: 4.22, v12: 4.30 },
  { date: "Nov 2025", v1: 4.02, v3: 4.12, v6: 4.28, v12: 4.36 },
  { date: "Oct 2025", v1: 4.10, v3: 4.18, v6: 4.31, v12: 4.42 },
];

export default function EuriborPage() {
  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "EURIBOR" }]}
        title="EURIBOR Rate Tracker"
        subtitle="Euro Interbank Offered Rate — monitor ECB-driven rate movements and EUR loan exposure"
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="size-3.5" />
              Export CSV
            </Button>
            <Button className="gap-2">
              <RefreshCcw className="size-3.5" />
              Refresh Rates
            </Button>
          </>
        }
      />

      <PageTabs
        tabs={[
          {
            id: "current",
            label: "Current Rates",
            content: <CurrentRatesPanel />,
          },
          { id: "historical", label: "Historical", placeholder: true },
          { id: "forward", label: "Forward Curve", placeholder: true },
          { id: "loan", label: "Loan Impact", placeholder: true },
        ]}
      />
    </div>
  );
}

function CurrentRatesPanel() {
  return (
    <div className="flex flex-col gap-6 p-8">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TENORS.map((t) => (
              <KpiCard
                key={t.label}
                label={`EURIBOR ${t.label}`}
                value={t.value}
                direction="down"
                change={`${t.changeM} vs 1M ago`}
                meta={`${t.changeY} YoY`}
                accent="blue"
              />
            ))}
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <Card className="lg:col-span-7">
              <CardHeader>
                <CardTitle className="text-base">EURIBOR — Trailing 6 Months</CardTitle>
                <CardDescription>Monthly close rates by tenor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-5 rounded bg-primary" />
                    1M
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-5 rounded bg-signal-green" />
                    3M
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-5 rounded bg-signal-orange" />
                    6M
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-5 rounded bg-signal-purple" />
                    12M
                  </span>
                </div>
                <div className="relative h-56 overflow-hidden rounded-md border border-dashed bg-muted/40">
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-muted-foreground">
                    Chart placeholder · charting library wired in next sprint
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden lg:col-span-5">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Recent Months</CardTitle>
                <CardDescription>Close rates by tenor</CardDescription>
              </CardHeader>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-3 py-2 text-left">Month</th>
                    <th className="px-3 py-2 text-right">1M</th>
                    <th className="px-3 py-2 text-right">3M</th>
                    <th className="px-3 py-2 text-right">6M</th>
                    <th className="px-3 py-2 text-right">12M</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map((h, i) => (
                    <tr key={h.date} className={cn("border-b last:border-0", i === 0 && "bg-primary/5 font-bold")}>
                      <td className="px-3 py-2 font-semibold">{h.date}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.v1.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.v3.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.v6.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.v12.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <Card className="border-signal-green/30 bg-signal-green/5 p-4">
            <p className="text-[12px]">
              <span className="font-bold text-signal-green">ECB cut cycle in motion</span>{" "}
              <span className="text-muted-foreground">
                — every tenor is down ≥0.4% YoY. EUR-denominated loans have an
                indicative all-in cost of ~5.85% (EURIBOR 6M + 200bps margin)
                vs ~6.50% a year ago.
              </span>
            </p>
          </Card>
        </div>
  );
}
