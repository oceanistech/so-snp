import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AppSidebar } from "@/components/app/sidebar";

/**
 * Auth-gated layout for all post-login pages.
 *
 * Anything under app/(app)/... lives behind this layout. The route group
 * parentheses keep the URLs clean — /dashboard, /vessel-search, etc.
 *
 * The layout calls `auth()` server-side; an unauthenticated visitor is
 * redirected to /sign-in BEFORE any nested layout or page renders, so the
 * sidebar never flashes for signed-out users.
 *
 * Pattern matches the prototype's `app-shell` grid (sidebar | main).
 * The sidebar carries the brand mark, the user line, and the sign-out
 * action, so the main column has no top account bar.
 */
async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="fixed inset-0 grid grid-cols-[220px_minmax(0,1fr)] overflow-hidden">
      <AppSidebar
        userEmail={session.user.email}
        signOutAction={signOutAction}
      />
      <main className="min-h-0 min-w-0 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
