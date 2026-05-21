"use client";
/**
 * ConfirmDialog — a Radix Dialog primitive tuned for "Are you sure?"
 * prompts. Use anywhere the browser's `window.confirm()` would be too
 * abrupt or off-brand (delete a fleet, duplicate a fleet, …).
 *
 * Usage:
 * ```tsx
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Delete fleet?"
 *   description={`Delete "${fleet.name}"? This can't be undone.`}
 *   confirmLabel="Delete Fleet"
 *   tone="danger"
 *   pending={pending}
 *   onConfirm={() => doTheThing()}
 * />
 * ```
 *
 * The dialog auto-closes when `onConfirm` returns (synchronous) or when
 * the parent flips `open` back to `false`. While `pending` is true the
 * buttons are disabled so the user can't double-submit.
 */
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type ConfirmDialogTone = "default" | "danger";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
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
          <div className="border-b px-5 py-4">
            <Dialog.Title className="text-[14px] font-bold leading-snug text-foreground">
              {title}
            </Dialog.Title>
          </div>

          <Dialog.Description asChild>
            <div className="px-5 py-4 text-[12px] text-muted-foreground">
              {description}
            </div>
          </Dialog.Description>

          <div className="flex justify-end gap-2 border-t px-5 py-3">
            <Dialog.Close asChild>
              <Button variant="secondary" disabled={pending}>
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Button
              variant={tone === "danger" ? "destructive" : "default"}
              disabled={pending}
              onClick={async () => {
                await onConfirm();
              }}
            >
              {pending ? "Working…" : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
