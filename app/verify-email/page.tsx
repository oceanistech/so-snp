import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/verification";

export const metadata = { title: "Verify email" };

/**
 * Email verification handler.
 *
 * The link in the verification email points here:
 *   /verify-email?token=<hex>
 *
 * We validate the token, mark the user's email as verified, delete the
 * (single-use) token, and redirect to /sign-in with a success flag so the
 * sign-in page can show a "Email verified — please sign in" message.
 *
 * Errors (missing/invalid/expired token) redirect to /sign-in with an error.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/sign-in?error=InvalidToken");
  }

  const result = await verifyToken(token);

  if (!result) {
    redirect("/sign-in?error=InvalidToken");
  }

  redirect(
    `/sign-in?verified=1&email=${encodeURIComponent(result.email)}`,
  );
}
