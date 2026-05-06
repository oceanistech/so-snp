"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, FileText, Search } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring";

const VESSELS = [
  { imo: "9623148", name: "MV Pacific Star",     spec: "Capesize Bulk · 2018" },
  { imo: "9742158", name: "MV Nordic Eagle",     spec: "Aframax Tanker · 2014" },
  { imo: "9888420", name: "MV Atlantic Pioneer", spec: "Suezmax Tanker · 2009" },
];

const TIERS = [
  {
    id: "standard",
    name: "Standard",
    sla: "3 business days",
    price: "$850",
    blurb: "Algorithmic FMV with peer-cohort comp set. Suitable for internal review.",
    delivery: "PDF only",
  },
  {
    id: "professional",
    name: "Professional",
    sla: "1 business day",
    price: "$2,400",
    blurb: "Algorithmic + analyst review. Includes 5-yr historical chart and methodology.",
    delivery: "PDF + Excel workbook",
    recommended: true,
  },
  {
    id: "court",
    name: "Court-Ready",
    sla: "5 business days",
    price: "$5,800",
    blurb: "Full analyst report, signed by an accredited surveyor. Admissible in court & loan covenants.",
    delivery: "Signed PDF · physical copy on request",
  },
];

export default function ValuationRequestPage() {
  const [imo, setImo] = React.useState(VESSELS[0]!.imo);
  const [tier, setTier] = React.useState("professional");
  const [purpose, setPurpose] = React.useState("Internal Review");
  const [recipientEmail, setRecipientEmail] = React.useState("dev@signalsp.local");
  const [notes, setNotes] = React.useState("");

  const vessel = VESSELS.find((v) => v.imo === imo) ?? VESSELS[0]!;
  const selectedTier = TIERS.find((t) => t.id === tier) ?? TIERS[1]!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(
      `Demo — would request a ${selectedTier.name} valuation certificate for ${vessel.name}, delivered to ${recipientEmail}.`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Market" },
          { label: "Valuations", href: "/valuations" },
          { label: "Request Certificate" },
        ]}
        title="Request Valuation Certificate"
        subtitle="Order a formal Signal S&P-issued valuation certificate for any vessel"
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/valuations">Cancel</Link>
            </Button>
            <Button type="submit" className="gap-2">
              <FileText className="size-3.5" />
              Submit Request
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <StepNumber>1</StepNumber>
                Vessel
              </h2>
            </CardHeader>
            <div className="space-y-2 p-4">
              {VESSELS.map((v) => (
                <label
                  key={v.imo}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 transition-colors",
                    imo === v.imo
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/40",
                  )}
                >
                  <input
                    type="radio"
                    name="vessel"
                    value={v.imo}
                    checked={imo === v.imo}
                    onChange={() => setImo(v.imo)}
                    className="cursor-pointer accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">{v.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {v.spec} · IMO {v.imo}
                    </p>
                  </div>
                </label>
              ))}
              <Button type="button" size="sm" variant="outline" className="mt-2 w-full gap-2">
                <Search className="size-3.5" />
                Search more vessels
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <StepNumber>2</StepNumber>
                Certificate Tier
              </h2>
            </CardHeader>
            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
              {TIERS.map((t) => (
                <label
                  key={t.id}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-colors",
                    tier === t.id
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/40",
                  )}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={t.id}
                    checked={tier === t.id}
                    onChange={() => setTier(t.id)}
                    className="sr-only"
                  />
                  {t.recommended ? (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      Recommended
                    </span>
                  ) : null}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-bold">{t.name}</span>
                    {tier === t.id ? <CheckCircle2 className="size-4 text-primary" /> : null}
                  </div>
                  <p className="font-mono text-[16px] font-extrabold tabular-nums text-foreground">
                    {t.price}
                  </p>
                  <p className="text-[11px] text-muted-foreground">SLA: {t.sla}</p>
                  <p className="text-[12px]">{t.blurb}</p>
                  <p className="mt-auto text-[10px] text-muted-foreground">
                    Delivery: {t.delivery}
                  </p>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <StepNumber>3</StepNumber>
                Purpose &amp; Delivery
              </h2>
            </CardHeader>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <FormField label="Purpose">
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={INPUT_CLASS}>
                  <option>Internal Review</option>
                  <option>Loan Application</option>
                  <option>Sale Negotiation</option>
                  <option>Insurance</option>
                  <option>Court / Legal</option>
                  <option>Tax / Audit</option>
                </select>
              </FormField>
              <FormField label="Recipient Email">
                <input
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  type="email"
                  className={INPUT_CLASS}
                />
              </FormField>
            </div>
            <div className="px-4 pb-4">
              <FormField label="Notes for the analyst">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any specific requirements (e.g. include scrap value scenario, comp vessels A/B/C, …)"
                  className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Order Summary
              </p>
              <h3 className="text-[14px] font-bold">Certificate request</h3>
            </CardHeader>
            <div className="space-y-3 p-4 text-[12px]">
              <Row label="Vessel" value={vessel.name} />
              <Row label="IMO" value={vessel.imo} mono />
              <Row label="Tier" value={selectedTier.name} />
              <Row label="SLA" value={selectedTier.sla} />
              <Row label="Purpose" value={purpose} />
              <Row label="Delivery" value={recipientEmail} />
              <div className="flex items-baseline justify-between gap-2 border-t pt-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Total
                </span>
                <span className="font-mono text-[18px] font-extrabold tabular-nums text-primary">
                  {selectedTier.price}
                </span>
              </div>
              <p className="border-t pt-3 text-[10px] text-muted-foreground">
                Demo only — no charge will be made. Real billing connects to
                Stripe in a follow-up sprint.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function StepNumber({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">{children}</span>;
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-bold text-foreground", mono && "font-mono tabular-nums")}>{value}</span>
    </div>
  );
}
