"use client";
/**
 * VesselActionsMenu — page-header Actions dropdown for /vessels/[id].
 *
 * Structure (matches the row-level menu on /fleetspace's vessel table,
 * grouped into General → Analytics → Documents → Danger):
 *
 *   General
 *     - Edit Vessel       → `/vessels/[id]/edit`
 *     - Duplicate Vessel  → DuplicateVesselDialog (free-floating copy)
 *     - Move to Fleet     → MoveVesselToFleetDialog
 *     - Add to Project    → toast placeholder (M16)
 *   Analytics
 *     - Run Loan Oracle           (M14, placeholder toast)
 *     - Run Cashflow              (M15, placeholder toast)
 *   Documents
 *     - Request Valuation Certificate (M13, placeholder toast)
 *   Danger
 *     - Remove Vessel     → ConfirmDialog → soft-delete → /fleetspace
 */
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  ChevronDown,
  Copy,
  FolderOpen,
  Layers,
  LineChart,
  Pencil,
  ScrollText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteVesselAction } from "@/lib/actions/vessel.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DuplicateVesselDialog,
  type DuplicateVesselTarget,
} from "@/app/(app)/fleetspace/duplicate-vessel-dialog";
import {
  MoveVesselToFleetDialog,
  type MoveVesselTarget,
} from "@/app/(app)/fleetspace/move-vessel-to-fleet-dialog";

export type VesselActionsFleet = { id: string; name: string };

type VesselActionsMenuProps = {
  vesselId: string;
  vesselName: string;
  vesselImo: string;
  /** Every fleet in the org — passed to the Move to Fleet dialog so it
   *  has every destination to choose from. */
  fleets: VesselActionsFleet[];
};

export function VesselActionsMenu({
  vesselId,
  vesselName,
  vesselImo,
  fleets,
}: VesselActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [moveOpen, setMoveOpen] = React.useState(false);
  const [removeOpen, setRemoveOpen] = React.useState(false);

  const duplicateTarget: DuplicateVesselTarget = {
    id: vesselId,
    name: vesselName,
    imo: vesselImo,
  };
  const moveTarget: MoveVesselTarget = {
    id: vesselId,
    name: vesselName,
  };

  function placeholder(action: string, target: string) {
    toast.info(`${action} — coming in a future release`, {
      description: `${vesselName} will be the subject when ${target} ships.`,
    });
  }

  function handleEdit() {
    router.push(`/vessels/${encodeURIComponent(vesselId)}/edit`);
  }

  function confirmRemove() {
    startTransition(async () => {
      const res = await deleteVesselAction(vesselId);
      if (res.ok) {
        toast.success(res.message ?? `"${vesselName}" removed.`);
        setRemoveOpen(false);
        // No row to refresh — bounce back to the fleets listing where
        // the user can see the deletion took effect.
        router.push("/fleetspace");
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
            className="inline-flex h-8 items-center gap-1.5 rounded border border-primary bg-primary px-3.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-[#1278e0] hover:border-[#1278e0] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Actions
            <ChevronDown className="size-3 transition-transform data-[state=open]:rotate-180" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            /* py-1 keeps vertical breathing room; px-0 lets each item's
               highlight band run edge-to-edge — same pattern as the
               row-level menu. */
            className="z-50 min-w-[230px] overflow-hidden rounded-md border bg-card py-1 shadow-lg ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <GroupLabel>General</GroupLabel>
            <Item icon={<Pencil className="size-3.5" />} onSelect={handleEdit}>
              Edit Vessel
            </Item>
            <Item icon={<Copy className="size-3.5" />} onSelect={() => setDuplicateOpen(true)}>
              Duplicate Vessel
            </Item>
            <Item icon={<Layers className="size-3.5" />} onSelect={() => setMoveOpen(true)}>
              Move to Fleet
            </Item>
            <Item
              icon={<FolderOpen className="size-3.5" />}
              onSelect={() => placeholder("Add to Project", "the Projects module (M16)")}
            >
              Add to Project
            </Item>

            <Divider />
            <GroupLabel>Analytics</GroupLabel>
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

            <Divider />
            <GroupLabel>Documents</GroupLabel>
            <Item
              icon={<ScrollText className="size-3.5" />}
              onSelect={() =>
                placeholder("Request Valuation Certificate", "Val Certs (M13)")
              }
            >
              Request Valuation Certificate
            </Item>

            <Divider />
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
        vessel={duplicateTarget}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />

      <MoveVesselToFleetDialog
        vessel={moveTarget}
        fleets={fleets}
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
            <strong className="font-semibold text-foreground">{vesselName}</strong>?
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

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
      {children}
    </div>
  );
}

function Divider() {
  return <DropdownMenu.Separator className="my-1 h-px bg-border" />;
}

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
        // Edge-to-edge highlight band — no narrow gap on left/right.
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
