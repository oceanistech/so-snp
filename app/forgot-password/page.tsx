import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignalSpMark } from "@/components/brand/signal-sp-mark";
import { prisma } from "@/lib/prisma";
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/verification";

export const metadata = { title: "Forgot password" };

const forgotSchema = z.object({
  email: z.string().email().max(254),
});

/**
 * Server action behind the forgot-password form.
 *
 * Enumeration protection: we always redirect to the same
 * `/forgot-password/check-email` confirmation page regardless of
 * whether the email is registered. That way an attacker probing the
 * endpoint can't distinguish "real account" from "no such user".
 *
 * Only when the email *does* belong to a real user do we actually
 * generate a token and send the email — silently no-op otherwise.
 */
async function forgotPasswordAction(formData: FormData) {
  "use server";

  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Please enter a valid email.";
    redirect(`/forgot-password?error=${encodeURIComponent(msg)}`);
  }

  const email = parsed.data.email.toLowerCase().trim();

  // Look up the user but DON'T branch the redirect on whether we found
  // them — that would reveal account existence to an attacker.
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, emailVerified: true },
  });

  // Only send an email to verified accounts. Unverified accounts get
  // the same silent no-op so we don't double-leak account state.
  if (user?.emailVerified) {
    const token = await createPasswordResetToken(email);
    await sendPasswordResetEmail({
      to: email,
      name: user.name ?? undefined,
      token,
    });
  }

  redirect(`/forgot-password/check-email?email=${encodeURIComponent(email)}`);
}

function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  return decodeURIComponent(code);
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errMsg = errorMessage(error);

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
            <CardTitle>Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a link to choose a new
              one. The link is valid for 1 hour.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errMsg ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errMsg}
              </div>
            ) : null}

            <form action={forgotPasswordAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-foreground hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">
              ← Back to landing
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
