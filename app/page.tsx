import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignalSpMark } from "@/components/brand/signal-sp-mark";
import { auth } from "@/auth";

export default async function HomePage() {
  // Signed-in visitors go straight to the app shell.
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-6">
      <div className="w-full max-w-md text-center">
        <Link
          href="/"
          aria-label="Signal S&P home"
          className="mb-6 inline-flex items-center justify-center gap-3 hover:opacity-90"
        >
          <SignalSpMark className="h-10 w-10" />
          <span className="text-2xl font-black tracking-tight">Signal S&P</span>
        </Link>

        <p className="text-base text-muted-foreground">
          Sale &amp; purchase platform for ship finance teams.
        </p>

        <p className="mt-6 text-sm text-muted-foreground">
          Sign in to your account, or create a new one to get started.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
