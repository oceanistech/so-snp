"use client";
/**
 * FleetDetailActionsMenu — the per-tab "3 dots" dropdown rendered next
 * to the fleet name when a fleet is opened as a tab inside /fleetspace.
 *
 * Smaller than the row-level `FleetActionsMenu` on the All Fleets table:
 * the user has already opened the fleet, so the available actions are
 * just Edit and Remove. View/Duplicate/Export live on the table row
 * instead.
 *
 * Actions:
 *   - Edit Fleet   → navigates to `/fleetspace/[slug]/edit`.
 *   - Remove Fleet → confirmation dialog (danger tone) →
 *                    `deleteFleetAction` → close this tab via
 *                    `onRemoved` + `router.refresh()`.
 */
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteFleetAction } from "@/lib/actions/fleet.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function FleetDetailActionsMenu({
  fleetId,
  fleetName,
  fleetSlug,
  onRemoved,
}: {
  fleetId: string;
  fleetName: string;
  fleetSlug: string;
  /** Called after a successful soft-delete. The parent should drop the
   *  fleet's tab from its open-tabs list so the user lands back on All
   *  Fleets. The router.refresh that follows reloads the listing. */
  onRemoved: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [removeOpen, setRemoveOpen] = React.useState(false);

  function handleEdit() {
    router.push(`/fleetspace/${encodeURIComponent(fleetSlug)}/edit`);
  }

  function confirmRemove() {
    startTransition(async () => {
      const res = await deleteFleetAction(fleetId);
      if (res.ok) {
        toast.success(res.message ?? `"${fleetName}" removed.`);
        setRemoveOpen(false);
        onRemoved();
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
            aria-label={`Actions for fleet ${fleetName}`}
            className="inline-flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            /* py-1 keeps vertical breathing room; px-0 lets each item's
               highlight band run edge-to-edge. */
            className="z-50 min-w-[170px] overflow-hidden rounded-md border bg-card py-1 shadow-lg ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <Item icon={<Pencil className="size-3.5" />} onSelect={handleEdit}>
              Edit Fleet
            </Item>
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <Item
              icon={<Trash2 className="size-3.5" />}
              onSelect={() => setRemoveOpen(true)}
              danger
            >
              Remove Fleet
            </Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title="Remove fleet?"
        description={
          <>
            Remove fleet{" "}
            <strong className="font-semibold text-foreground">{fleetName}</strong>?
            The fleet will be soft-deleted and disappear from the listing.
            This action cannot be undone from the UI.
          </>
        }
        confirmLabel="Remove Fleet"
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
