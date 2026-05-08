"use client";

import * as React from "react";
import { Construction } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PageTabs — the single shared secondary tab strip used below `AppPageHeader`
 * on every (app) page (Cashflow, Loan Oracle, Alerts, Net Fleet, Vessels,
 * EURIBOR, SOFR, Owners, …).
 *
 * Mirrors the prototype's `.subtabs` row from
 * html/assets/css/signal-design-system.css:
 *   - row sits on the white surface with a 1px bottom border
 *   - each tab is a flat button; the active one gets a 2px primary
 *     bottom rail aligned to the page-header's bottom border
 *   - the row is horizontally scrollable on overflow but the native
 *     scrollbar is hidden across all browsers so the visual matches
 *     the static prototype 1:1
 *   - horizontal padding (`px-8`) matches `AppPageHeader`'s `--sp-xl: 32px`
 *
 * The component owns its own active-tab state, so consuming pages can stay
 * server components (preserving `metadata` exports). For a tab that hasn't
 * been ported yet, set `placeholder: true` instead of providing `content`.
 */
export type PageTabItem<T extends string = string> = {
  id: T;
  label: React.ReactNode;
  /** Optional small numeric chip rendered to the right of the label. */
  badge?: number;
  /** Body rendered when this tab is active. Omit when `placeholder` is true. */
  content?: React.ReactNode;
  /** Marks the tab as not-yet-implemented; renders `ComingSoonPanel` instead. */
  placeholder?: boolean;
};

type PageTabsProps<T extends string = string> = {
  tabs: readonly PageTabItem<T>[];
  /** Initial active tab id. Defaults to the first non-placeholder tab. */
  defaultActive?: T;
  /** Optional content rendered on the right edge of the strip. */
  trailing?: React.ReactNode;
  className?: string;
};

export function PageTabs<T extends string = string>({
  tabs,
  defaultActive,
  trailing,
  className,
}: PageTabsProps<T>) {
  const initial =
    defaultActive ??
    (tabs.find((t) => !t.placeholder)?.id as T | undefined) ??
    (tabs[0]?.id as T);
  const [active, setActive] = React.useState<T>(initial);
  const activeTab = tabs.find((t) => t.id === active);

  return (
    <>
      <div
        role="tablist"
        className={cn(
          "flex items-end gap-0 overflow-x-auto border-b bg-card px-8",
          // Hide native scrollbar across browsers, keep horizontal scrolling.
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap border-b-2 px-5 py-2.5 text-[12px] font-semibold transition-colors [&_svg]:opacity-70",
                isActive
                  ? "border-primary text-primary [&_svg]:opacity-100"
                  : "border-transparent text-[#A0ABB2] hover:text-foreground",
              )}
            >
              {t.label}
              {t.badge !== undefined ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
        {trailing ? <div className="ml-auto pr-1">{trailing}</div> : null}
      </div>

      {activeTab?.placeholder ? (
        <ComingSoonPanel label={activeTab.label} />
      ) : (
        activeTab?.content ?? null
      )}
    </>
  );
}

/**
 * ComingSoonPanel — empty-state body rendered for tabs whose content
 * hasn't been ported to the platform yet. Exported separately so any
 * page can reuse it outside of `PageTabs` if needed.
 */
export function ComingSoonPanel({ label }: { label: React.ReactNode }) {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 p-10 text-center">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Construction className="size-5" />
        </span>
        <div>
          <p className="text-[14px] font-bold">{label}</p>
          <p className="mt-1 max-w-md text-[12px] text-muted-foreground">
            This tab&rsquo;s content is not ported yet. The route is wired and
            navigation works — the implementation lands in a follow-up sprint.
          </p>
        </div>
      </div>
    </div>
  );
}
