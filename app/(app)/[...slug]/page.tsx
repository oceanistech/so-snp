import { notFound } from "next/navigation";

/**
 * Catch-all 404 inside the auth-gated app shell.
 *
 * Next.js's App Router only renders a segment's `not-found.tsx` when a route
 * in that segment calls `notFound()` (or fails its dynamic-segment match).
 * For a completely unknown URL — say `/foo-bad-url` — Next.js can't decide
 * which segment "owns" it, so it falls through to the *root* `app/not-found.tsx`,
 * which has no sidebar and no auth context.
 *
 * This optional-catch-all page captures any URL inside `(app)` that doesn't
 * match a more specific route and immediately calls `notFound()`. Effect:
 *
 *  - The request goes through `(app)/layout.tsx` first → `auth()` runs;
 *    unauthenticated visitors are redirected to /sign-in as usual.
 *  - For signed-in users, `notFound()` then bubbles to `(app)/not-found.tsx`,
 *    which renders inside the app shell with the sidebar still visible.
 *
 * Real routes (e.g. `/dashboard`, `/projects/[id]`) match before this
 * catch-all because Next.js prefers more specific segments, so this only
 * triggers for genuinely unknown URLs.
 */
export default function AppCatchAll() {
  notFound();
}
