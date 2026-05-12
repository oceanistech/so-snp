import Link from "next/link";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
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
import { prisma } from "@/lib/prisma";
import {
  createVerificationToken,
  sendVerificationEmail,
} from "@/lib/verification";
import { SignalSpMark } from "@/components/brand/signal-sp-mark";

export const metadata = { title: "Sign up" };

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

/**
 * Server action: password sign-up with email verification.
 *
 * Flow:
 *   1. Validate input.
 *   2. Reject if the email already has a verified account.
 *      If unverified, regenerate the verification token (the previous one
 *      may have been emailed but never clicked) and re-send.
 *   3. Create the user with passwordHash and emailVerified=null.
 *   4. Generate a verification token, persist it, email the link.
 *   5. Redirect to /sign-up/check-email so the user knows to check their inbox.
 *
 * The user CANNOT sign in until the email is verified (enforced in auth.ts).
 */
async function signUpAction(formData: FormData) {
  "use server";

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    redirect(`/sign-up?error=${encodeURIComponent(msg)}`);
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing?.emailVerified) {
    redirect(`/sign-up?error=${encodeURIComponent("EmailExists")}`);
  }

  // First-time signup: create the user. Otherwise update name+password on
  // the existing unverified record so the user can correct typos.
  if (!existing) {
    await prisma.user.create({
      data: { email, name, passwordHash },
    });
  } else {
    await prisma.user.update({
      where: { email },
      data: { name, passwordHash },
    });
  }

  const token = await createVerificationToken(email);
  await sendVerificationEmail({ to: email, name, token });

  redirect(`/sign-up/check-email?email=${encodeURIComponent(email)}`);
}

function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case "EmailExists":
      return "An account with that email already exists. Try signing in instead.";
    case "AccessDenied":
      return "Sign-ups are currently restricted.";
    default:
      return decodeURIComponent(code);
  }
}

export default async function SignUpPage({
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
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              We&apos;ll email you a link to verify your address before you can
              sign in.
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

            <form action={signUpAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-foreground hover:underline"
              >
                Sign in
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
