import NextAuth from "next-auth";
import authConfig from "@/auth.config";

/**
 * Edge middleware for Auth.js.
 *
 * IMPORTANT: This file imports from `auth.config.ts`, NOT `auth.ts`.
 * The full `auth.ts` pulls in Prisma and nodemailer, both of which require
 * the Node runtime; the Edge runtime bans those modules.
 *
 * NOTE: We use JWT sessions (set in auth.ts), so the middleware CAN read
 * and validate the session at the Edge — the user payload is signed into
 * the cookie itself and Auth.js decodes it without touching the database.
 * This is the slot for future protected-route guards.
 *
 * Pattern: https://authjs.dev/getting-started/installation#edge-compatibility
 */
const { auth } = NextAuth(authConfig);

export default auth((_req) => {
  // intentionally empty — placeholder for future Edge-safe guards.
});

export const config = {
  matcher: [
    // Skip Next internals and static files.
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
