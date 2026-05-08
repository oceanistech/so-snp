import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * AppCardHeader — the shared card header used across the app.
 *
 * Mirrors the prototype's `.card-header` row from
 * html/assets/css/signal-design-system.css:
 *
 *   .card-header {
 *     padding: var(--sp-md) var(--sp-lg);     // py-4 px-6
 *     border-bottom: 1px solid;
 *     display: flex; align-items: center;
 *     justify-content: space-between;
 *     gap: var(--sp-md);                       // gap-4
 *   }
 *   .card-title    { 14px / 700 / snug }
 *   .card-subtitle { 11px / muted / mt-[2px] / leading-normal }
 *   .card-actions  { flex / center / gap-1 / shrink-0 / wrap }
 *
 * The component owns the bottom border + horizontal layout so every
 * card header in the app has identical height (vertical padding =
 * 16px) and identical title typography. Pages should always reach
 * for this rather than rolling their own `<div className="border-b
 * px-5 py-4">` blocks.
 */
type AppCardHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-side content — action buttons, view-more links, status pills, etc. */
  actions?: React.ReactNode;
  className?: string;
};

export function AppCardHeader({
  title,
  subtitle,
  actions,
  className,
}: AppCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b bg-card px-6 py-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-bold leading-snug tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-[2px] text-[11px] leading-normal text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-1">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
