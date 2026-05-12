import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

/**
 * Custom credentials-sign-in error for accounts that exist with a valid
 * password but haven't completed email verification yet. NextAuth preserves
 * `code` on the URL so the sign-in page can show a tailored message.
 */
class EmailNotVerifiedError extends CredentialsSignin {
  override code = "EmailNotVerified";
}

/**
 * Auth.js (NextAuth v5) — full configuration.
 *
 * This module imports Prisma so it MUST NOT be imported from `middleware.ts`
 * or any other Edge-runtime code. Middleware uses `auth.config.ts` instead.
 *
 * - Prisma adapter persists Account / Session / VerificationToken / User.
 * - Credentials provider authenticates email + bcrypt password.
 * - Sign-up email verification uses a separate flow (lib/verification.ts +
 *   Mailgun HTTP API in lib/mail.ts), not Auth.js's EmailProvider.
 *
 * NOTE: Per platform-brd.md §4 we standardise on Auth.js. JWT/Passport-style
 * patterns are explicitly out of scope.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // Auth.js v5 requires JWT sessions when the Credentials provider is in use.
  // The Prisma adapter still persists User, Account, and VerificationToken
  // rows (the latter for Email magic links); it just won't write to Session.
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        // Block sign-in for unverified emails. Throwing a CredentialsSignin
        // subclass preserves the `code` so the sign-in page can show the
        // "please verify your email" message instead of generic invalid creds.
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});

export const { GET, POST } = handlers;
