"use client";
/**
 * DuplicateFleetDialog — modal opened from "More → Duplicate Fleet".
 *
 * Pre-fills the name input with the server-suggested unique name (the
 * same name the auto path would have picked: "<source> (Copy)", or
 * "(Copy 2)", "(Copy 3)" if a collision is detected). The user can
 * accept or edit the suggestion before submitting.
 *
 * On submit:
 *   1. Calls `duplicateFleetAction(fleetId, { name })`.
 *   2. On success → toast + close + `router.refresh()` to show the row.
 *   3. On conflict → inline error so the user can change the name.
 */
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  duplicateFleetAction,
  suggestDuplicateFleetNameAction,
} from "@/lib/actions/fleet.actions";
import type { FleetSummary } from "@/lib/services/fleet.service";

export function DuplicateFleetDialog({
  fleet,
  open,
  onOpenChange,
}: {
  fleet: FleetSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [name, setName] = React.useState("");
  const [suggesting, setSuggesting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * When the dialog opens, ask the server for a unique suggestion (so the
   * "(Copy)" we show actually clears the case-insensitive name check at
   * the moment of opening). Falls back to a client-side "(Copy)" if the
   * lookup fails for any reason — the server still validates on submit.
   */
  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setName(`${fleet.name} (Copy)`);
    setSuggesting(true);
    let cancelled = false;
    (async () => {
      const res = await suggestDuplicateFleetNameAction(fleet.id);
      if (cancelled) return;
      if (res.ok) setName(res.name);
      setSuggesting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, fleet.id, fleet.name]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (trimmed === "") {
      setError("Please enter a name for the duplicated fleet.");
      return;
    }
    startTransition(async () => {
      const res = await duplicateFleetAction(fleet.id, { name: trimmed });
      if (res.ok) {
        toast.success(res.message ?? `"${fleet.name}" duplicated.`);
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
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[480px]",
            "-translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          )}
        >
          <form onSubmit={handleSubmit}>
            <div className="border-b px-5 py-4">
              <Dialog.Title className="text-[14px] font-bold leading-snug">
                Duplicate fleet
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-[11px] text-muted-foreground">
                A copy of{" "}
                <strong className="font-semibold text-foreground">
                  {fleet.name}
                </strong>{" "}
                will be created with the same vessels and settings. Adjust
                the name if you&apos;d like.
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
                  New Fleet Name
                  <span className="ml-0.5 text-signal-magenta">*</span>
                </span>
                <input
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`${fleet.name} (Copy)`}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  autoFocus
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  {suggesting
                    ? "Checking for a free name…"
                    : "Must be unique within your organisation."}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" disabled={pending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={pending || name.trim() === ""}>
                {pending ? "Duplicating…" : "Duplicate Fleet"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
