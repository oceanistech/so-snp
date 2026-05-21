"use client";
/**
 * VesselRowActionsMenu — the per-row "More" dropdown on the vessel
 * table inside an opened fleet on /fleetspace. Mirrors the row-level
 * `FleetActionsMenu` styling and divider conventions.
 *
 * Menu items, grouped:
 *   General
 *     - View Vessel       → `onView(vesselId)` (open as sub-tab)
 *     - Edit Vessel       → `/vessels/[id]/edit`
 *     - Duplicate Vessel  → DuplicateVesselDialog
 *     - Move to Fleet     → MoveVesselToFleetDialog
 *   Analytics (placeholder toasts — features ship in later modules)
 *     - Add to Project              (M16)
 *     - Run Loan Oracle             (M14)
 *     - Run Cashflow                (M15)
 *     - Request Valuation Certificate (M13)
 *   Danger
 *     - Remove Vessel     → ConfirmDialog → deleteVesselAction
 */
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  ChevronDown,
  Copy,
  Eye,
  FolderOpen,
  Layers,
  LineChart,
  Pencil,
  ScrollText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteVesselAction } from "@/lib/actions/vessel.actions";
import type { VesselListItem } from "@/lib/services/vessel.service";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DuplicateVesselDialog } from "./duplicate-vessel-dialog";
import { MoveVesselToFleetDialog } from "./move-vessel-to-fleet-dialog";

export type FleetOption = { id: string; name: string };

export function VesselRowActionsMenu({
  vessel,
  fleets,
  currentFleetId,
  onView,
}: {
  vessel: VesselListItem;
  /** All fleets in the org — passed to the move dialog so the user can
   *  pick a destination. The dialog excludes the vessel's current fleet. */
  fleets: FleetOption[];
  /** The fleet whose tab we're currently viewing inside (so we can
   *  exclude it from the "Move to Fleet" picker). */
  currentFleetId: string;
  /** Open the vessel as a sub-tab inside the current fleet view. */
  onView: (vesselId: string) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [moveOpen, setMoveOpen] = React.useState(false);
  const [removeOpen, setRemoveOpen] = React.useState(false);

  function placeholder(label: string, module: string) {
    toast.info(`${label} — coming in a future release`, {
      description: `${vessel.name} will be the subject when ${module} ships.`,
    });
  }

  function handleEdit() {
    router.push(`/vessels/${encodeURIComponent(vessel.id)}/edit`);
  }

  function confirmRemove() {
    startTransition(async () => {
      const res = await deleteVesselAction(vessel.id);
      if (res.ok) {
        toast.success(res.message ?? `"${vessel.name}" removed.`);
        setRemoveOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={pending}
            aria-haspopup="menu"
            aria-label={`Actions for vessel ${vessel.name}`}
            className="inline-flex h-[26px] items-center gap-1 rounded border border-input bg-card px-2.5 text-[11px] font-semibold text-foreground shadow-sm transition-colors hover:bg-background hover:border-foreground/25 hover:shadow active:bg-muted active:shadow-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span>More</span>
            <ChevronDown className="size-3 transition-transform data-[state=open]:rotate-180" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-[220px] overflow-hidden rounded-md border bg-card py-1 shadow-lg ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <Item icon={<Eye className="size-3.5" />} onSelect={() => onView(vessel.id)}>
              View Vessel
            </Item>
            <Item icon={<Pencil className="size-3.5" />} onSelect={handleEdit}>
              Edit Vessel
            </Item>
            <Item icon={<Copy className="size-3.5" />} onSelect={() => setDuplicateOpen(true)}>
              Duplicate Vessel
            </Item>
            <Item icon={<Layers className="size-3.5" />} onSelect={() => setMoveOpen(true)}>
              Move to Fleet
            </Item>

            <DropdownMenu.Separator className="my-1 h-px bg-border" />

            <Item
              icon={<FolderOpen className="size-3.5" />}
              onSelect={() => placeholder("Add to Project", "Projects (M16)")}
            >
              Add to Project
            </Item>
            <Item
              icon={<BarChart3 className="size-3.5" />}
              onSelect={() => placeholder("Run Loan Oracle", "Loan Oracle (M14)")}
            >
              Run Loan Oracle
            </Item>
            <Item
              icon={<LineChart className="size-3.5" />}
              onSelect={() => placeholder("Run Cashflow", "Cashflow (M15)")}
            >
              Run Cashflow
            </Item>
            <Item
              icon={<ScrollText className="size-3.5" />}
              onSelect={() =>
                placeholder("Request Valuation Certificate", "Val Certs (M13)")
              }
            >
              Request Valuation Certificate
            </Item>

            <DropdownMenu.Separator className="my-1 h-px bg-border" />

            <Item
              icon={<Trash2 className="size-3.5" />}
              onSelect={() => setRemoveOpen(true)}
              danger
            >
              Remove Vessel
            </Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DuplicateVesselDialog
        vessel={vessel}
        attachToFleetId={currentFleetId}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />

      <MoveVesselToFleetDialog
        vessel={vessel}
        fleets={fleets}
        currentFleetId={currentFleetId}
        open={moveOpen}
        onOpenChange={setMoveOpen}
      />

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Remove vessel?"
        description={
          <>
            Remove vessel{" "}
            <strong className="font-semibold text-foreground">{vessel.name}</strong>?
            The vessel will be soft-deleted and disappear from the listing.
            This action cannot be undone from the UI.
          </>
        }
        confirmLabel="Remove Vessel"
        tone="danger"
        pending={pending}
        onConfirm={confirmRemove}
      />
    </>
  );
}

/* --------------------------------------------------------------------------
 * Subcomponents
 * -------------------------------------------------------------------------- */

function Item({
  icon,
  children,
  onSelect,
  danger,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        e.preventDefault();
        onSelect();
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-none px-3 py-1.5 text-[12px] font-medium",
        "outline-none transition-colors",
        danger
          ? "text-signal-magenta data-[highlighted]:bg-signal-magenta/10"
          : "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
      )}
    >
      <span className={danger ? "text-signal-magenta" : "text-muted-foreground"}>
        {icon}
      </span>
      <span>{children}</span>
    </DropdownMenu.Item>
  );
}
