"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { SubTabItem } from "./page-header";

/**
 * HeaderTabs — the secondary tab strip rendered inside `AppPageHeader`
 * when a page passes `tabs` + `activeTab` + `onTabChange`.
 *
 * Lives in its own `"use client"` file so the parent `AppPageHeader`
 * can stay a server component. Pages that don't pass `tabs` never pull
 * this client island into their tree.
 *
 * Mirrors the prototype's `.subtabs` row from
 * html/assets/css/signal-design-system.css.
 */
type Props<T extends string> = {
  tabs: readonly SubTabItem<T>[];
  activeTab?: T;
  onTabChange?: (id: T) => void;
};

export function HeaderTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: Props<T>) {
  return (
    <div
      role="tablist"
      className="mt-1 flex items-end gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange?.(t.id)}
            className={cn(
              "flex items-center gap-1 whitespace-nowrap border-b-2 px-5 py-2.5 text-[12px] font-semibold leading-normal transition-colors [&_svg]:opacity-70",
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
    </div>
  );
}
