import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * In-app 404 page.
 *
 * Renders inside the `(app)` layout — the sidebar stays visible so a signed-in
 * user who hits a stale link or mistyped URL keeps full navigation context.
 * The Next.js App Router renders this whenever a route below /app/(app)/...
 * doesn't match or a server component calls `notFound()`.
 */
export const metadata = { title: "Page not found" };

export default function AppNotFound() {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center bg-background px-8 py-16 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5">
        {/* Compass icon as a soft visual anchor — no nautical illustration in
            the prototype, but the icon picks up the maritime theme without
            adding a heavy SVG. */}
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="size-8" strokeWidth={1.75} />
        </div>

        <div className="space-y-2">
          <p className="font-display text-[64px] font-extrabold leading-none tracking-[-1.5px] text-foreground">
            404
          </p>
          <h1 className="font-display text-[20px] font-bold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="text-[13px] leading-relaxed text-[#788187]">
            We couldn&rsquo;t find what you were looking for. The link may be
            broken, the page may have moved, or you may not have access to it.
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard">
              <Home className="size-3.5" />
              Back to dashboard
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/vessel-search">Search vessels</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
