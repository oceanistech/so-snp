import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignalSpMark } from "@/components/brand/signal-sp-mark";
import { auth } from "@/auth";

const modules = [
  {
    code: "M11",
    title: "Loan Oracle",
    blurb: "Loan facility structuring, risk scoring, and term-sheet PDFs.",
  },
  {
    code: "M12",
    title: "Cash Flow Engine",
    blurb: "DCF, IRR, NPV and FMV analysis across vessel and fleet cohorts.",
  },
  {
    code: "M13",
    title: "Fleet Management",
    blurb: "Group vessels, pin watchlists, and track operational metrics.",
  },
  {
    code: "M14",
    title: "Vessels for Sale",
    blurb: "Curated S&P opportunities with FMV cross-checks.",
  },
] as const;

export default async function HomePage() {
  // Signed-in visitors go straight to the app shell.
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <section className="border-b bg-card">
        <div className="container flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <SignalSpMark className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Signal S&P
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground md:text-base">
                Sale &amp; purchase platform for ship finance teams. Built on
                Next.js, Prisma and Auth.js.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/health">Health</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Modules
            </p>
            <h2 className="mt-1 text-2xl font-bold">Build surface area</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Module catalogue mirrors{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
                docs/brd/platform-brd.md
              </code>
              . The four below are the highest-priority commercial demos.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <Card key={m.code} className="border-border/70">
              <CardHeader>
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary">
                  {m.code}
                </p>
                <CardTitle className="text-lg">{m.title}</CardTitle>
                <CardDescription>{m.blurb}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Status: <span className="font-medium">planned</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>
            Signal S&P prototype scaffold. Read-only landing page. Source of
            truth: <code>docs/brd/platform-brd.md</code>.
          </p>
          <p className="font-mono">
            Next 15 · React 19 · Prisma 6 · Auth.js 5 · Tailwind 3 · shadcn/ui
          </p>
        </div>
      </footer>
    </main>
  );
}
