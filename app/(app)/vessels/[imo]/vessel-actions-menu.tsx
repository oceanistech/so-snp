"use client";
/**
 * VesselActionsMenu — page-header Actions dropdown for /vessels/[id].
 *
 * Mirrors `html/vessel-details.html`'s `.va-menu` exactly: three grouped
 * sections (Manage, Analytics, Documents) with six items, each with a
 * left icon. Handlers are placeholders until the owning modules ship —
 * Loan Oracle (M14), Cashflow (M15), Valuation Certificates (M13), Export
 * (F7) — and surface a toast so the user gets feedback when they click.
 *
 * Built on top of `@radix-ui/react-dropdown-menu` directly because we
 * don't have a shadcn wrapper for it yet and the menu is local to this
 * one page.
 */
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import {
  BarChart3,
  ChevronDown,
  Download,
  FolderOpen,
  Layers,
  LineChart,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type VesselActionsMenuProps = {
  vesselId: string;
  vesselName: string;
};

export function VesselActionsMenu({ vesselId, vesselName }: VesselActionsMenuProps) {
  function placeholder(action: string, target: string) {
    toast.info(`${action} — ${target} ships in a follow-up ticket`, {
      description: `${vesselName} would be the subject when this action lands.`,
    });
    // `vesselId` is captured so future handlers can pass it to server actions
    // without re-threading the prop. Acknowledge it here to dodge "unused".
    void vesselId;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded border border-primary bg-primary px-3.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-[#1278e0] hover:border-[#1278e0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-haspopup="menu"
        >
          Actions
          <ChevronDown className="size-3 transition-transform data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[230px] rounded-md border bg-card p-1 shadow-lg ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <GroupLabel>Manage</GroupLabel>
          <Item icon={<FolderOpen className="size-3.5" />} onClick={() => placeholder("Add to Project", "Projects (M16)")}>
            Add to Project
          </Item>
          <Item icon={<Layers className="size-3.5" />} onClick={() => placeholder("Add to Fleet", "Fleet picker (M02)")}>
            Add to Fleet
          </Item>

          <Divider />
          <GroupLabel>Analytics</GroupLabel>
          <Item icon={<BarChart3 className="size-3.5" />} onClick={() => placeholder("Run Loan Oracle", "Loan Oracle (M14)")}>
            Run Loan Oracle
          </Item>
          <Item icon={<LineChart className="size-3.5" />} onClick={() => placeholder("Run Cashflow", "Cashflow (M15)")}>
            Run Cashflow
          </Item>

          <Divider />
          <GroupLabel>Documents</GroupLabel>
          <Item icon={<ScrollText className="size-3.5" />} onClick={() => placeholder("Request Valuation Certificate", "Val Certs (M13)")}>
            Request Valuation Certificate
          </Item>
          <Item icon={<Download className="size-3.5" />} onClick={() => placeholder("Export", "F7 export helper")}>
            Export
          </Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/* --------------------------------------------------------------------------
 * Subcomponents
 * -------------------------------------------------------------------------- */

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
      {children}
    </div>
  );
}

function Divider() {
  return (
    <DropdownMenu.Separator className="my-1 h-px bg-border" />
  );
}

function Item({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded px-3 py-1.5 text-[12px] font-medium",
        "outline-none transition-colors",
        "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{children}</span>
    </DropdownMenu.Item>
  );
}
