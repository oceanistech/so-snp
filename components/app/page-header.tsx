import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeaderTabs } from "./page-header-tabs";

/**
 * AppPageHeader — single shared header component for every (app) page.
 *
 * Wraps four parts as one unit so pages don't have to assemble them:
 *
 *   1. breadcrumb — small muted trail (with optional links)
 *   2. title       — Inter Tight 24/800/-0.6px
 *   3. subtitle    — 12px muted body line
 *   4. actions     — right-side button cluster (passed as ReactNode)
 *
 * For pages that have **sub-tabs**, pass `tabs` + `activeTab` + `onTabChange`
 * (controlled) — the component renders the secondary tab strip flush below
 * the title row, hidden-scrollbar, with a 2px primary bottom rail under the
 * active tab. The whole assembly forms the prototype's `.page-header` block.
 *
 * Performance note: this component is a **server component** so it can be
 * imported by any page (server or client) without dragging the page into
 * the client graph. The interactive tab strip lives in `./page-header-tabs`,
 * a tiny client island that's only included when `tabs` is provided.
 *
 * Mirrors the prototype's CSS tokens:
 *   .page-breadcrumb { 11px muted, gap 4px }
 *   .page-title       { Inter Tight 24px / 800 / -0.6px / leading 1.2 }
 *   .page-subtitle    { 12px muted, margin-top 3px, leading 1.5 }
 *   .subtabs          { flex; align-items: flex-end; gap 0; margin-top 4px }
 *   .subtab           { 12px / 600 muted; 2px transparent bottom border }
 *   .subtab.active    { primary blue text + 2px primary bottom border }
 */
type Crumb = { label: string; href?: string };

export type SubTabItem<T extends string = string> = {
  id: T;
  label: React.ReactNode;
  badge?: number;
};

type AppPageHeaderProps<T extends string = string> = {
  breadcrumb?: Crumb[];
  /** Plain string or ReactNode (e.g. an inline editable input). */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Sub-tab definitions. When provided, the strip is rendered below the title row. */
  tabs?: readonly SubTabItem<T>[];
  /** Current active tab id (controlled). Required when `tabs` is provided. */
  activeTab?: T;
  /** Tab change handler (controlled). Required when `tabs` is provided. */
  onTabChange?: (id: T) => void;
  /** Optional second-row content (filter chips, etc.) — rendered between
   *  the title and the tab strip. Most pages don't need this. */
  children?: React.ReactNode;
  className?: string;
};

export function AppPageHeader<T extends string = string>({
  breadcrumb,
  title,
  subtitle,
  actions,
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: AppPageHeaderProps<T>) {
  const hasTabs = tabs && tabs.length > 0;
  return (
    <div
      className={cn(
        "bg-card px-8 pt-6",
        hasTabs ? "pb-0" : "pb-1",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 ? (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-[11px] text-muted-foreground"
            >
              {breadcrumb.map((c, i) => {
                const isLast = i === breadcrumb.length - 1;
                const label = (
                  <span
                    className={cn(
                      "transition-colors",
                      isLast
                        ? "text-foreground/80"
                        : "text-muted-foreground/90 hover:text-foreground",
                    )}
                  >
                    {c.label}
                  </span>
                );
                return (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 ? (
                      <span className="text-border" aria-hidden>
                        /
                      </span>
                    ) : null}
                    {c.href && !isLast ? (
                      <Link href={c.href}>{label}</Link>
                    ) : (
                      label
                    )}
                  </span>
                );
              })}
            </nav>
          ) : null}
          {typeof title === "string" ? (
            <h1 className="mt-1 font-display text-[24px] font-extrabold leading-[1.2] tracking-[-0.6px] text-foreground">
              {title}
            </h1>
          ) : (
            <div className="mt-1">{title}</div>
          )}
          {subtitle ? (
            <p className="mt-[3px] max-w-3xl text-[12px] leading-normal text-muted-foreground mb-2">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {children ? <div className="mt-3">{children}</div> : null}

      {hasTabs ? (
        <HeaderTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      ) : null}
    </div>
  );
}
