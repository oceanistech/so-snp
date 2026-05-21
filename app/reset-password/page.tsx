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
import { consumePasswordResetToken } from "@/lib/verification";

export const metadata = { title: "Reset password" };

const resetSchema = z
  .object({
    token: z.string().min(1, "Missing reset token."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

/**
 * Server action behind the reset-password form. Validates the new
 * password, verifies the (single-use) token, updates `passwordHash`
 * inside a transaction, and redirects to `/sign-in?reset=1`.
 *
 * On any failure path (bad input, expired token, wrong-type token,
 * missing user) we redirect back to /reset-password with an error
 * code. The token is preserved in the URL so the user can retry with
 * a different password without re-requesting the link.
 */
async function resetPasswordAction(formData: FormData) {
  "use server";

  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    const token = String(formData.get("token") ?? "");
    redirect(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(msg)}`,
    );
  }

  const result = await consumePasswordResetToken(
    parsed.data.token,
    parsed.data.password,
  );

  if (!result) {
    redirect("/sign-in?error=InvalidResetToken");
  }

  redirect("/sign-in?reset=1");
}

function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  return decodeURIComponent(code);
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const errMsg = errorMessage(error);

  // Missing token → bounce back to the request form. No point rendering
  // the password form with no way to submit.
  if (!token) {
    redirect("/forgot-password");
  }

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
            <CardTitle>Choose a new password</CardTitle>
            <CardDescription>
              Pick a strong password you don&apos;t use anywhere else. It needs
              to be at least 8 characters.
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

            <form action={resetPasswordAction} className="space-y-3">
              <input type="hidden" name="token" value={token} />

              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full">
                Update password
              </Button>
            </form>
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
