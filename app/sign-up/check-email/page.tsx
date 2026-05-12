import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignalSpMark } from "@/components/brand/signal-sp-mark";

export const metadata = { title: "Check your email" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          aria-label="Signal S&P home"
          className="mb-6 flex items-center justify-center gap-3 hover:opacity-90"
        >
          <SignalSpMark className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">Signal S&P</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a verification link to{" "}
              <strong className="text-foreground">
                {email ?? "your inbox"}
              </strong>
              . Click the link to verify your address and then sign in.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The link expires in 24 hours.</p>
            <p>
              Didn&apos;t get it? Check spam, or{" "}
              <Link
                href="/sign-up"
                className="font-medium text-foreground hover:underline"
              >
                try signing up again
              </Link>{" "}
              with the same email to receive a new link.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 text-xs text-muted-foreground">
            <Link
              href="/sign-in"
              className="font-medium text-foreground hover:underline"
            >
              ← Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
