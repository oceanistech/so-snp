"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  VesselTypeBadge,
  type VesselType,
} from "@/components/app/vessel-type-badge";
import {
  type ProjectStatus,
  type ProjectCategory,
} from "@/components/app/project-card";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring";

const VESSELS: { imo: string; name: string; spec: string; type: VesselType }[] = [
  { imo: "9623148", name: "MV Pacific Star",     spec: "Capesize Bulk · 2018", type: "Bulk Carrier" },
  { imo: "9742158", name: "MV Nordic Eagle",     spec: "Aframax Tanker · 2014", type: "Tanker" },
  { imo: "9888420", name: "MV Atlantic Pioneer", spec: "Suezmax Tanker · 2009", type: "Tanker" },
  { imo: "9712305", name: "MT Helios Trader",    spec: "Suezmax Tanker · 2014", type: "Tanker" },
  { imo: "9905611", name: "MV Coral Bay",        spec: "Bulk Carrier · 2021",   type: "Bulk Carrier" },
];

const STATUSES: ProjectStatus[] = ["Active", "Draft"];
const CATEGORIES: ProjectCategory[] = [
  "Investment", "Performance", "Newbuild", "Refinance", "ESG",
];

export default function NewProjectPage() {
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus>("Active");
  const [category, setCategory] = React.useState<ProjectCategory>("Investment");
  const [description, setDescription] = React.useState("");
  const [selectedImos, setSelectedImos] = React.useState<Set<string>>(new Set());
  const [tag, setTag] = React.useState("");

  function toggle(imo: string) {
    setSelectedImos((prev) => {
      const next = new Set(prev);
      if (next.has(imo)) next.delete(imo);
      else next.add(imo);
      return next;
    });
  }

  const canSubmit = title.trim().length > 0 && selectedImos.size > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    alert(`Demo — would create project "${title}" with ${selectedImos.size} vessels.`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "DiscoverySpace" },
          { label: "Projects", href: "/projects" },
          { label: "New Project" },
        ]}
        title="New Project"
        subtitle="Start a new analysis project — pick a vessel cohort and capture your scenarios over time"
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/projects">Cancel</Link>
            </Button>
            <Button type="submit" className="gap-2" disabled={!canSubmit}>
              <Check className="size-3.5" />
              Create Project
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        <Card>
          <CardHeader className="border-b">
            <h2 className="flex items-center gap-2 text-[15px] font-bold">
              <StepNumber>1</StepNumber>
              Project Details
            </h2>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[2fr_1fr_1fr]">
            <FormField label="Project Title" required>
              <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="e.g. Bulk Fleet Expansion 2026" className={INPUT_CLASS} />
            </FormField>
            <FormField label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={INPUT_CLASS}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)} className={INPUT_CLASS}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-4 px-4 pb-4">
            <FormField label="Description / Purpose">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What's this project's goal? (e.g. Evaluation of 4 Panamax bulk carriers for portfolio expansion…)" className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Tag / Label">
              <input value={tag} onChange={(e) => setTag(e.target.value)} type="text" placeholder="e.g. Q1 Review, 2026 Expansion…" className={INPUT_CLASS} />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
            <h2 className="flex items-center gap-2 text-[15px] font-bold">
              <StepNumber>2</StepNumber>
              Vessel Cohort
            </h2>
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary-foreground">
              {selectedImos.size}
            </span>
          </CardHeader>
          <ul className="divide-y p-1">
            {VESSELS.map((v) => {
              const checked = selectedImos.has(v.imo);
              return (
                <li key={v.imo}>
                  <label className={cn("flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors", checked ? "bg-primary/5" : "hover:bg-muted/40")}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(v.imo)} className="cursor-pointer accent-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold">{v.name}</p>
                      <p className="text-[11px] text-muted-foreground">{v.spec} · IMO {v.imo}</p>
                    </div>
                    <VesselTypeBadge value={v.type} />
                  </label>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </form>
  );
}

function FormField({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}{required ? <span className="ml-1 text-signal-magenta">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function StepNumber({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">{children}</span>;
}
