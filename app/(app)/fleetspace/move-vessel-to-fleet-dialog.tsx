"use client";
/**
 * MoveVesselToFleetDialog — modal opened from "More → Move to Fleet".
 *
 * The user picks a target fleet from a select. Submitting calls
 * `moveVesselToFleetAction(vesselId, fleetId)` which:
 *   - soft-deletes every active FleetVessel row for the vessel
 *   - inserts a new active row for the chosen fleet
 *
 * The current fleet is excluded from the picker (otherwise moving to it
 * would be a no-op + a wasteful detach/re-attach round-trip). A "—
 * Detach from all fleets —" option lets the user remove the vessel from
 * every fleet without picking a new one.
 */
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  detachVesselFromOtherFleetsAction,
  moveVesselToFleetAction,
} from "@/lib/actions/vessel.actions";
import type { FleetOption } from "./vessel-row-actions-menu";

/** Minimal vessel shape the dialog needs — id for the action, name for
 *  the description + toast. Callers project their richer vessel objects
 *  into this shape. */
export type MoveVesselTarget = {
  id: string;
  name: string;
};

export function MoveVesselToFleetDialog({
  vessel,
  fleets,
  /** The fleet the user is currently viewing inside, when applicable.
   *  Passing it does two things: excludes it from the picker (since
   *  moving the vessel into the fleet it's already in is a no-op), and
   *  enables the "Detach from all other fleets" option (which keeps
   *  membership of this fleet while removing every other one).
   *  When omitted (e.g. on `/vessels/[id]`'s page-level menu where
   *  there's no "currently viewed" fleet), every fleet shows in the
   *  picker and the "Detach from all other fleets" option is hidden. */
  currentFleetId,
  open,
  onOpenChange,
}: {
  vessel: MoveVesselTarget;
  fleets: FleetOption[];
  currentFleetId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  /**
   * Selected target. Special values:
   *   - "" (empty)         → nothing chosen yet, submit disabled
   *   - "__detach_others"  → keep the vessel in the current fleet,
   *                          soft-delete every OTHER membership
   *   - any cuid           → reassign to that fleet (detaches from the
   *                          current fleet and every other one)
   */
  const [target, setTarget] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setTarget("");
    setError(null);
  }, [open]);

  // Exclude the current fleet (when we have one) — moving the vessel
  // "into" the fleet it's already in is a no-op and confusing.
  const candidates = currentFleetId
    ? fleets.filter((f) => f.id !== currentFleetId)
    : fleets;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (target === "") {
      setError(
        currentFleetId
          ? "Pick a destination fleet (or choose to detach)."
          : "Pick a destination fleet.",
      );
      return;
    }
    startTransition(async () => {
      const res =
        target === "__detach_others" && currentFleetId
          ? // Keep the vessel in the current fleet; remove every other
            // membership so the user can still find it where they were.
            await detachVesselFromOtherFleetsAction(vessel.id, currentFleetId)
          : // Reassign to a different fleet — vessel disappears from
            // this table and shows up under the destination.
            await moveVesselToFleetAction(vessel.id, target);
      if (res.ok) {
        toast.success(res.message ?? "Vessel moved.");
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[1px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[440px]",
            "-translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          )}
        >
          <form onSubmit={handleSubmit}>
            <div className="border-b px-5 py-4">
              <Dialog.Title className="text-[14px] font-bold leading-snug">
                Move vessel to a different fleet
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-[11px] text-muted-foreground">
                Pick a destination for{" "}
                <strong className="font-semibold text-foreground">
                  {vessel.name}
                </strong>
                , or detach it from every other fleet so it stays only in
                the fleet you&apos;re currently viewing.
              </Dialog.Description>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5">
              {error ? (
                <div
                  role="alert"
                  className="rounded border border-signal-magenta/30 bg-signal-magenta/8 px-3 py-2 text-[12px] text-signal-magenta"
                >
                  {error}
                </div>
              ) : null}

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
                  Destination Fleet
                  <span className="ml-0.5 text-signal-magenta">*</span>
                </span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                  required
                >
                  <option value="">— Select a fleet —</option>
                  {candidates.length === 0 ? (
                    <option value="" disabled>
                      {currentFleetId
                        ? "No other fleets available"
                        : "No fleets available"}
                    </option>
                  ) : (
                    candidates.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))
                  )}
                  {currentFleetId ? (
                    <option value="__detach_others">
                      — Detach from all other fleets —
                    </option>
                  ) : null}
                </select>
                <span className="text-[11px] text-muted-foreground">
                  {currentFleetId
                    ? "Picking a fleet moves the vessel there (it leaves every fleet it was attached to, including this one). Detaching removes every other membership but keeps the vessel in this fleet."
                    : "Picking a fleet moves the vessel there (it leaves every fleet it was attached to)."}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" disabled={pending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={pending || target === ""}>
                {pending ? "Moving…" : "Move Vessel"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
