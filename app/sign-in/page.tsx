import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
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
import { signIn } from "@/auth";
import { SignalSpMark } from "@/components/brand/signal-sp-mark";

export const metadata = { title: "Sign in" };

async function credentialsAction(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      // CredentialsSignin subclasses (incl. EmailNotVerifiedError) carry a
      // `code` property; fall back to err.type for other AuthError flavours.
      const code = (err as AuthError & { code?: string }).code ?? err.type;
      redirect(`/sign-in?error=${encodeURIComponent(code)}`);
    }
    throw err; // NEXT_REDIRECT (the success redirect) bubbles through
  }
}

function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case "credentials":
    case "CredentialsSignin":
      return "Invalid email or password.";
    case "EmailNotVerified":
      return "Please verify your email first. Check your inbox for the verification link.";
    case "AccessDenied":
      return "You don't have access to this application.";
    case "InvalidToken":
      return "That verification link is invalid or has expired. Try signing up again to receive a new one.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; verified?: string; email?: string }>;
}) {
  const { error, verified, email } = await searchParams;
  const errMsg = errorMessage(error);
  const verifiedOk = verified === "1";

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
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Welcome back. Enter your email and password to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {verifiedOk ? (
              <div
                role="status"
                className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
              >
                Email verified. You can sign in now.
              </div>
            ) : null}

            {errMsg ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errMsg}
              </div>
            ) : null}

            <form action={credentialsAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={email ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-foreground hover:underline"
              >
                Sign up
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
