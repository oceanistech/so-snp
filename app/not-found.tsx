import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Root 404 page.
 *
 * Catches any URL that doesn't match a route — including ones outside the
 * auth-gated `(app)` segment. Renders standalone (no sidebar) since the
 * visitor may be signed out. Signed-in users hitting an unknown route inside
 * `(app)` see `(app)/not-found.tsx` instead, which keeps the sidebar.
 */
export const metadata = { title: "Page not found" };

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5">
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
            broken, or the page may have moved.
          </p>
        </div>

        <Button asChild className="mt-2 gap-2">
          <Link href="/">Go to Ship Invest</Link>
        </Button>
      </div>
    </main>
  );
}
