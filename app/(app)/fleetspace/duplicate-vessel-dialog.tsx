"use client";
/**
 * DuplicateVesselDialog — modal opened from "More → Duplicate Vessel".
 *
 * The user must provide both a new vessel name AND a new IMO (IMOs are
 * externally assigned by IMO HQ — the server can't auto-pick one). Name
 * is pre-filled with the server-suggested "<source> (Copy)" string; IMO
 * is left empty because there's no sensible default.
 *
 * On submit:
 *   1. Calls `duplicateVesselAction(vesselId, { name, imo })`.
 *   2. On success → toast + close + `router.refresh()`.
 *   3. On conflict (duplicate name+IMO) → inline error so the user can
 *      adjust the values and retry without closing the modal.
 */
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  duplicateVesselAction,
  suggestDuplicateVesselNameAction,
} from "@/lib/actions/vessel.actions";
/** Minimal vessel shape the dialog needs — id for the action, name for
 *  the suggested copy name + toast, imo for the placeholder + validation
 *  against picking the same IMO. Both callers (row menu + detail page
 *  Actions menu) project their richer vessel objects into this shape. */
export type DuplicateVesselTarget = {
  id: string;
  name: string;
  imo: string;
};

export function DuplicateVesselDialog({
  vessel,
  /** When the dialog is opened from inside an opened fleet tab, this is
   *  the fleet's id so the new vessel automatically joins it (and shows
   *  up in the table the user is currently looking at). Pass `undefined`
   *  to leave the duplicate free-floating. */
  attachToFleetId,
  open,
  onOpenChange,
}: {
  vessel: DuplicateVesselTarget;
  attachToFleetId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [name, setName] = React.useState("");
  const [imo, setImo] = React.useState("");
  const [suggesting, setSuggesting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setName(`${vessel.name} (Copy)`);
    setImo("");
    setSuggesting(true);
    let cancelled = false;
    (async () => {
      const res = await suggestDuplicateVesselNameAction(vessel.id);
      if (cancelled) return;
      if (res.ok) setName(res.name);
      setSuggesting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, vessel.id, vessel.name]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const trimmedImo = imo.trim();
    if (trimmedName === "") {
      setError("Please enter a name for the duplicated vessel.");
      return;
    }
    if (trimmedImo === "") {
      setError("Please enter an IMO for the duplicated vessel.");
      return;
    }
    if (!/^\d{7}$/.test(trimmedImo)) {
      setError("IMO must be a 7-digit number.");
      return;
    }
    startTransition(async () => {
      const res = await duplicateVesselAction(vessel.id, {
        name: trimmedName,
        imo: trimmedImo,
        attachToFleetId,
      });
      if (res.ok) {
        toast.success(res.message ?? `"${vessel.name}" duplicated.`);
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
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[520px]",
            "-translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          )}
        >
          <form onSubmit={handleSubmit}>
            <div className="border-b px-5 py-4">
              <Dialog.Title className="text-[14px] font-bold leading-snug">
                Duplicate vessel
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-[11px] text-muted-foreground">
                A copy of{" "}
                <strong className="font-semibold text-foreground">
                  {vessel.name}
                </strong>{" "}
                will be created with the same specs. Give the new vessel its
                own name and IMO.
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
                  New Vessel Name
                  <span className="ml-0.5 text-signal-magenta">*</span>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`${vessel.name} (Copy)`}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  {suggesting
                    ? "Loading suggested name…"
                    : "Must be unique within your organisation."}
                </span>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted-foreground">
                  New IMO Number
                  <span className="ml-0.5 text-signal-magenta">*</span>
                </span>
                <input
                  type="text"
                  value={imo}
                  onChange={(e) => setImo(e.target.value)}
                  placeholder="9XXXXXXX"
                  inputMode="numeric"
                  pattern="[0-9]{7}"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  7-digit IMO. Cannot match the original ({vessel.imo}).
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" disabled={pending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={pending || name.trim() === "" || imo.trim() === ""}
              >
                {pending ? "Duplicating…" : "Duplicate Vessel"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
