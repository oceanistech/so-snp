"use client";
/**
 * FleetActionsMenu — the per-row "More" dropdown on /fleetspace's All
 * Fleets table. Mirrors `html/my-fleet.html`'s `.row-actions-dropdown`:
 * five items (View / Edit / Duplicate / Export / Delete) where Delete is
 * separated from the rest by a divider and styled as a danger action.
 *
 * Built on top of `@radix-ui/react-dropdown-menu` directly — same pattern
 * the vessel detail page uses for its Actions dropdown. Confirmations use
 * the shared `<ConfirmDialog>` (Radix Dialog under the hood); never the
 * browser's `window.confirm()`.
 *
 * Actions:
 *   - View Fleet      → `onView(fleetId)` (opens the fleet as a tab).
 *   - Edit Fleet      → navigates to the full-page `/fleetspace/[slug]/edit`
 *                       form, which mirrors the create flow (3 sections,
 *                       same vessel checklist).
 *   - Duplicate Fleet → opens `<DuplicateFleetDialog>` (editable name) →
 *                       `duplicateFleetAction` + `router.refresh()`.
 *   - Export Fleet    → sonner `toast.info` placeholder until the F7
 *                       export helper ships (PDF/XLSX).
 *   - Delete Fleet    → `<ConfirmDialog tone="danger">` →
 *                       `deleteFleetAction` + `router.refresh()`.
 */
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDown,
  Copy,
  Download,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteFleetAction } from "@/lib/actions/fleet.actions";
import type { FleetSummary } from "@/lib/services/fleet.service";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DuplicateFleetDialog } from "./duplicate-fleet-dialog";

type FleetActionsMenuProps = {
  fleet: FleetSummary;
  onView: (fleetId: string) => void;
};

export function FleetActionsMenu({ fleet, onView }: FleetActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  // Dialog visibility — two independent modals owned by this row.
  // (Edit Fleet navigates to a dedicated full-page form instead.)
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  function handleEdit() {
    // Navigate to the full-page edit form. The route lives at
    // `/fleetspace/[slug]/edit` and visually matches the create form
    // (same three sections, same vessel checklist).
    router.push(`/fleetspace/${encodeURIComponent(fleet.slug)}/edit`);
  }

  function handleExport() {
    // Export is shelved until the F7 export helper ships — the legacy
    // plain-text blob download didn't carry valuations, IRR, cashflow,
    // or vessel-level detail and was misleading as a "fleet export".
    // The real exporter will support PDF + XLSX with the same payload
    // as the per-vessel export.
    toast.info("Export Fleet — coming in a future ticket", {
      description: `"${fleet.name}" will be exportable to PDF/XLSX once the F7 export helper lands.`,
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteFleetAction(fleet.id);
      if (res.ok) {
        toast.success(res.message ?? `"${fleet.name}" deleted.`);
        setDeleteOpen(false);
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
            aria-label={`Actions for fleet ${fleet.name}`}
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
            /* `py-1` keeps a little vertical breathing room at the top and
               bottom of the menu, but `px-0` lets each item's highlight
               extend the full width — no narrow gap on the left and right
               edges when you hover an option. */
            className="z-50 min-w-[170px] overflow-hidden rounded-md border bg-card py-1 shadow-lg ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <Item icon={<Eye className="size-3.5" />} onSelect={() => onView(fleet.id)}>
              View Fleet
            </Item>
            <Item icon={<Pencil className="size-3.5" />} onSelect={handleEdit}>
              Edit Fleet
            </Item>
            <Item icon={<Copy className="size-3.5" />} onSelect={() => setDuplicateOpen(true)}>
              Duplicate Fleet
            </Item>
            <Item icon={<Download className="size-3.5" />} onSelect={handleExport}>
              Export Fleet
            </Item>
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <Item
              icon={<Trash2 className="size-3.5" />}
              onSelect={() => setDeleteOpen(true)}
              danger
            >
              Delete Fleet
            </Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Duplicate dialog — lets the user edit the suggested name before
          confirming. The dialog owns its own pending/error state because
          the name input is editable across the request roundtrip. */}
      <DuplicateFleetDialog
        fleet={fleet}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />

      {/* Delete confirmation — danger tone. */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete fleet?"
        description={
          <>
            Delete fleet <strong className="font-semibold text-foreground">{fleet.name}</strong>?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete Fleet"
        tone="danger"
        pending={pending}
        onConfirm={confirmDelete}
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
        // Stop Radix from auto-closing before our handler completes — for
        // synchronous handlers it doesn't matter, but the dialogs need a
        // tick for `open` state to settle.
        e.preventDefault();
        onSelect();
      }}
      className={cn(
        // `rounded-none` + edge-to-edge px-3 means the hover/highlight band
        // fills the full menu width — no narrow gap on the left/right.
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

