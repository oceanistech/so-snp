import Link from "next/link";
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
  await signIn("credentials", {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirectTo: "/",
  });
}

async function emailAction(formData: FormData) {
  "use server";
  await signIn("email", {
    email: String(formData.get("email") ?? ""),
    redirectTo: "/",
  });
}

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <SignalSpMark className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">Signal S&P</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use the seeded dev credentials, or send yourself a magic link via
              Mailpit.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form action={credentialsAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue="dev@signalsp.local"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  defaultValue="password"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in with password
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form action={emailAction} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email-magic">Email magic link</Label>
                <Input
                  id="email-magic"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                Email me a sign-in link
              </Button>
            </form>
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
