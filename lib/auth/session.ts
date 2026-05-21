/**
 * Server-side helpers for resolving the current session → org context.
 *
 * Today users have exactly one membership (the dev org). When the platform
 * supports multi-org membership the active org will come from a session
 * claim or a cookie; this helper is the single place that needs to learn
 * about it.
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Unauthenticated");
    this.name = "UnauthenticatedError";
  }
}

export class NoMembershipError extends Error {
  constructor(userId: string) {
    super(`User ${userId} is not a member of any organisation`);
    this.name = "NoMembershipError";
  }
}

export type SessionContext = {
  userId: string;
  email: string;
  orgId: string;
};

/**
 * Resolve the current session and pick the user's active org. Throws
 * `UnauthenticatedError` if the session is missing and `NoMembershipError`
 * if the user has no organisation membership.
 *
 * Server actions should call this first; if the throw bubbles to the page,
 * the (app)/ layout's existing `redirect("/sign-in")` guard handles it.
 */
export async function requireSession(): Promise<SessionContext> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) throw new UnauthenticatedError();

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    select: { orgId: true },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) throw new NoMembershipError(session.user.id);

  return {
    userId: session.user.id,
    email: session.user.email,
    orgId: membership.orgId,
  };
}
