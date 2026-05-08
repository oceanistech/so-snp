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

export const metadata = { title: "SOFR Rate Tracker" };

const TENORS = [
  { label: "Overnight", value: "5.32%", changeM: "−0.08%", changeY: "−0.18%" },
  { label: "1M",         value: "5.34%", changeM: "−0.06%", changeY: "−0.20%" },
  { label: "3M",         value: "5.38%", changeM: "−0.10%", changeY: "−0.28%" },
  { label: "6M",         value: "5.42%", changeM: "−0.14%", changeY: "−0.36%" },
];

const HISTORY = [
  { date: "Mar 2026", overnight: 5.32, m1: 5.34, m3: 5.38, m6: 5.42 },
  { date: "Feb 2026", overnight: 5.40, m1: 5.40, m3: 5.48, m6: 5.56 },
  { date: "Jan 2026", overnight: 5.46, m1: 5.46, m3: 5.55, m6: 5.62 },
  { date: "Dec 2025", overnight: 5.48, m1: 5.48, m3: 5.58, m6: 5.66 },
  { date: "Nov 2025", overnight: 5.50, m1: 5.50, m3: 5.58, m6: 5.68 },
  { date: "Oct 2025", overnight: 5.50, m1: 5.50, m3: 5.60, m6: 5.78 },
];

export default function SofrPage() {
  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[{ label: "Market" }, { label: "SOFR" }]}
        title="SOFR Rate Tracker"
        subtitle="Secured Overnight Financing Rate — monitor current levels, term structure and loan portfolio impact"
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
                label={`SOFR ${t.label}`}
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
                <CardTitle className="text-base">SOFR — Trailing 6 Months</CardTitle>
                <CardDescription>Monthly close rates by tenor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-primary" />Overnight</span>
                  <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-green" />1M</span>
                  <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-orange" />3M</span>
                  <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-signal-purple" />6M</span>
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
                    <th className="px-3 py-2 text-right">O/N</th>
                    <th className="px-3 py-2 text-right">1M</th>
                    <th className="px-3 py-2 text-right">3M</th>
                    <th className="px-3 py-2 text-right">6M</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map((h, i) => (
                    <tr key={h.date} className={cn("border-b last:border-0", i === 0 && "bg-primary/5 font-bold")}>
                      <td className="px-3 py-2 font-semibold">{h.date}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.overnight.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.m1.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.m3.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.m6.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <Card className="border-signal-orange/30 bg-signal-orange/5 p-4">
            <p className="text-[12px]">
              <span className="font-bold text-signal-orange">Fed holding firm</span>{" "}
              <span className="text-muted-foreground">
                — SOFR has retreated only modestly from its 2024 peak. USD
                ship-loan all-in cost is ~7.20% (SOFR 3M + 180bps margin).
              </span>
            </p>
          </Card>
        </div>
  );
}
