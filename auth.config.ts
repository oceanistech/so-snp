import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration.
 *
 * `middleware.ts` runs on the Edge runtime, which forbids Node-only modules
 * such as `stream`, `crypto` (in the Node sense), `fs`, and so on. Anything
 * that transitively imports nodemailer or `@prisma/client` therefore breaks
 * Edge builds.
 *
 * This file is the lightweight slice that's safe to import from middleware:
 *   - no Prisma adapter
 *   - no Email/Nodemailer provider
 *   - no bcrypt
 *
 * The full configuration (with Prisma adapter, Credentials authorize, and
 * the Email magic-link provider) lives in `auth.ts` and is only imported
 * from API routes and Server Components, never from middleware.
 *
 * Pattern: https://authjs.dev/getting-started/installation#edge-compatibility
 */
export default {
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  // Providers live in auth.ts. Middleware only needs the session cookie shape,
  // not the full provider list.
  providers: [],
} satisfies NextAuthConfig;
