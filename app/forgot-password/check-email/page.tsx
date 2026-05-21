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

/**
 * Confirmation page shown after the forgot-password form submits.
 *
 * Copy is intentionally vague about whether an email was actually sent
 * — we hit this page even when the submitted email doesn't match any
 * account, to prevent enumeration. Phrasing it as "if an account
 * exists" keeps that promise.
 */
export default async function ForgotPasswordCheckEmailPage({
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
              {email ? (
                <>
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">{email}</span>,
                  we&apos;ve sent a password reset link to it.
                </>
              ) : (
                <>
                  If an account exists for that email, we&apos;ve sent a
                  password reset link to it.
                </>
              )}{" "}
              The link is valid for 1 hour.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Didn&apos;t get the email?</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Check your spam or junk folder.</li>
              <li>
                Make sure the email address was typed correctly — we won&apos;t
                send to accounts that don&apos;t exist or aren&apos;t verified.
              </li>
              <li>
                If it still doesn&apos;t arrive in a few minutes, try{" "}
                <Link
                  href="/forgot-password"
                  className="font-medium text-foreground hover:underline"
                >
                  requesting another link
                </Link>
                .
              </li>
            </ul>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground">
            <Link href="/sign-in" className="hover:underline">
              ← Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
