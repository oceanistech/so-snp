import { cn } from "@/lib/utils";

/**
 * CertChip — a certificate / compliance row chip with a status dot.
 * Three states mirror the prototype's `.cert-chip .dot {ok|warn|expired}`.
 */
type CertStatus = "ok" | "warn" | "expired";

const DOT: Record<CertStatus, string> = {
  ok: "bg-signal-green",
  warn: "bg-signal-orange",
  expired: "bg-signal-magenta",
};

export function CertChip({
  status,
  children,
}: {
  status: CertStatus;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-[12px]">
      <span className={cn("size-2 flex-shrink-0 rounded-full", DOT[status])} />
      <span className="flex-1 text-foreground/90">{children}</span>
    </div>
  );
}
