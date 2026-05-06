"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarFilterOverlay } from "./sidebar-filter-overlay";

/**
 * AppSidebar — left navigation rail for all post-login pages.
 *
 * Mirrors the prototype's `aside.sidebar` from html/*.html (signal-design-system.css):
 *   - dark navy background (sidebar token)
 *   - brand + user line in the header
 *   - search wrap with magnifier + filter toggle
 *   - flat leaf items (rest type weight, muted text)
 *   - bold expandable parent items (white, 700, 13px)
 *   - active leaf item: white text, 600 weight, sidebar-active background, 3px blue left rail
 *
 * Per platform-brd.md §4.2 we compose Tailwind utilities only; design tokens
 * live in app/globals.css and tailwind.config.ts.
 */

type FlatItem = { label: string; href: string };
type Group = { label: string; items: FlatItem[] };

const FLAT_TOP: FlatItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Fleets", href: "/fleetspace" },
];

const GROUPS: Group[] = [
  {
    label: "DiscoverySpace",
    items: [
      { label: "Vessel Search", href: "/vessel-search" },
      { label: "Projects", href: "/projects" },
      { label: "Competitor Analysis", href: "/competitor-analysis" },
    ],
  },
  {
    label: "Market",
    items: [
      { label: "Valuations", href: "/valuations" },
      { label: "Net Fleet", href: "/net-fleet" },
      { label: "Financial Transactions", href: "/financial-transactions" },
      { label: "Earnings & Expenses", href: "/earnings" },
      { label: "IRR", href: "/irr" },
      { label: "Environmental Score", href: "/environmental-score" },
      { label: "Market Reports", href: "/market-reports" },
    ],
  },
  {
    label: "Finance Toolkit",
    items: [
      { label: "Cashflow", href: "/cashflow" },
      { label: "Loan Oracle", href: "/loan-oracle" },
      { label: "Benchmarking", href: "/benchmarking" },
    ],
  },
];

const FLAT_BOTTOM: FlatItem[] = [{ label: "Alerts", href: "/alerts" }];

type AppSidebarProps = {
  userEmail?: string | null;
  /** Server action that signs the user out — wired to the icon button on the brand row. */
  signOutAction?: () => Promise<void> | void;
};

export function AppSidebar({ userEmail, signOutAction }: AppSidebarProps) {
  const pathname = usePathname();
  const [filterOpen, setFilterOpen] = React.useState(false);
  const searchWrapRef = React.useRef<HTMLDivElement | null>(null);
  const filterToggleRef = React.useRef<HTMLButtonElement | null>(null);

  // A group is open by default if any of its items is the active route, or
  // the user has expanded it explicitly during the session.
  const initialOpen = React.useMemo(() => {
    return Object.fromEntries(
      GROUPS.map((g) => [g.label, g.items.some((i) => pathname.startsWith(i.href))]),
    );
  }, [pathname]);
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>(initialOpen);

  const toggle = (label: string) =>
    setOpenMap((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="flex h-full w-[220px] flex-col overflow-y-auto overflow-x-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Header — brand on the left, sign-out icon button vertically centered on the right */}
      <div className="px-4 pb-2 pt-5">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="block flex-1 truncate font-display text-[20px] font-black leading-[1.2] tracking-[-0.4px] text-white transition-colors hover:text-accent"
          >
            Ship Invest
          </Link>
          {signOutAction ? (
            <form action={signOutAction} className="flex-shrink-0">
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className="inline-flex size-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.07] text-sidebar-muted transition-colors hover:bg-white/15 hover:text-white"
              >
                <LogOut className="size-3.5" />
                <span className="sr-only">Sign out</span>
              </button>
            </form>
          ) : null}
        </div>
        {userEmail ? (
          <div className="mt-0.5 truncate text-[11px] text-sidebar-muted">
            {userEmail}
          </div>
        ) : null}
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div
          ref={searchWrapRef}
          className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.07] px-2.5 py-1.5"
        >
          <Search className="size-3.5 shrink-0 text-sidebar-muted" />
          <input
            type="text"
            placeholder="Search Vessels & Ports"
            className="w-full bg-transparent text-[11px] text-sidebar-foreground placeholder:text-sidebar-muted focus:outline-none"
          />
          <button
            ref={filterToggleRef}
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            title="Filter vessels"
            aria-pressed={filterOpen}
            className={cn(
              "inline-flex size-5 shrink-0 items-center justify-center rounded transition-colors",
              filterOpen
                ? "bg-primary/20 text-primary"
                : "text-sidebar-muted hover:bg-white/10 hover:text-white",
            )}
          >
            <SlidersHorizontal className="size-3" />
            <span className="sr-only">Toggle filter</span>
          </button>
        </div>
      </div>

      <SidebarFilterOverlay
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        anchorRef={searchWrapRef}
        toggleRef={filterToggleRef}
      />

      {/* Nav */}
      <nav className="flex-1 pb-4 pt-2">
        {/* Top flat items (Dashboard, Fleets) */}
        {FLAT_TOP.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} />
        ))}

        {/* Collapsible groups (these are the only "white & bold" parent rows
            — they own a sub-menu, per the prototype's `.sidebar-parent-item`). */}
        {GROUPS.map((group) => (
          <div key={group.label}>
            <button
              type="button"
              onClick={() => toggle(group.label)}
              className="flex w-full items-center justify-between px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-sidebar-hover"
              aria-expanded={openMap[group.label] ?? false}
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn(
                  "size-3 opacity-60 transition-transform duration-200",
                  openMap[group.label] && "rotate-180",
                )}
              />
            </button>
            {openMap[group.label] ? (
              <div className="pb-1">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    nested
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {/* Bottom flat items (Alerts) */}
        {FLAT_BOTTOM.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}

function SidebarLink({
  item,
  pathname,
  nested = false,
}: {
  item: FlatItem;
  pathname: string;
  nested?: boolean;
}) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex min-h-[32px] items-center text-[12px] transition-colors",
        nested ? "py-1.5 pl-8 pr-4" : "px-4 py-2",
        // Default leaf style: muted text, regular weight
        "font-normal text-sidebar-foreground",
        // Active leaf: white text, 700, sidebar-active background, 3px blue rail
        active
          ? "bg-sidebar-active font-bold text-white"
          : "hover:bg-sidebar-hover hover:text-white",
      )}
    >
      {active ? (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-r bg-primary"
          aria-hidden
        />
      ) : null}
      {item.label}
    </Link>
  );
}
