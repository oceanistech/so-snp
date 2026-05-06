/**
 * Shared route-transition skeleton for every (app) route.
 *
 * Next.js App Router automatically renders this whenever a page below
 * /app/(app)/... is loading. Without it the router holds the previous
 * page on screen until the new RSC payload + client chunk fully resolve,
 * which feels like a freeze on heavy pages. With it, the user sees an
 * instant placeholder shaped like the destination page.
 *
 * The shape is intentionally generic — page header band on top, a few
 * skeleton tiles + a table-ish block below — so it works for KPI pages,
 * tables, forms, and split-panel layouts alike.
 */
export default function AppLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="flex h-full min-h-0 flex-col"
    >
      {/* Page header band — matches AppPageHeader's vertical rhythm */}
      <div className="border-b bg-card px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <SkeletonBar className="h-3 w-40" />        {/* breadcrumb */}
            <SkeletonBar className="h-7 w-72" />        {/* title */}
            <SkeletonBar className="h-3 w-96" />        {/* subtitle */}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <SkeletonBar className="h-8 w-24 rounded" />  {/* action */}
            <SkeletonBar className="h-8 w-32 rounded" />  {/* primary action */}
          </div>
        </div>
      </div>

      {/* Body — KPI row + content card */}
      <div className="flex flex-1 flex-col gap-4 p-8">
        {/* KPI row (covers most analytics pages) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Content card — generic placeholder for tables, charts, forms */}
        <div className="flex-1 space-y-3 rounded-md border bg-card p-5 shadow-sm">
          <SkeletonBar className="h-4 w-1/3" />
          <SkeletonBar className="h-3 w-2/3" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBar key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Local primitives — no external dependencies, animation in pure CSS.
 * -------------------------------------------------------------------------- */

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted/60 ${className ?? ""}`}
      aria-hidden
    />
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-md border bg-card p-4 shadow-sm">
      <SkeletonBar className="h-2.5 w-1/2" />
      <SkeletonBar className="h-6 w-1/3" />
      <SkeletonBar className="h-2.5 w-2/3" />
    </div>
  );
}
