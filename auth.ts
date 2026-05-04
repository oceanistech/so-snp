import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

/**
 * Auth.js (NextAuth v5) — full configuration.
 *
 * This module imports Prisma and nodemailer, so it MUST NOT be imported from
 * `middleware.ts` or any other Edge-runtime code. Middleware uses
 * `auth.config.ts` instead.
 *
 * - Prisma adapter persists Account / Session / VerificationToken / User.
 * - Credentials provider matches the seeded dev user (email + bcrypt password).
 * - Nodemailer/Email provider sends magic links via the same SMTP transport
 *   used by lib/mail.ts (Mailpit in local dev).
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    EmailProvider({
      server: {
        host: process.env.MAIL_HOST ?? "localhost",
        port: Number(process.env.MAIL_PORT ?? 1025),
        secure: process.env.MAIL_SECURE === "true",
        auth:
          process.env.MAIL_USER && process.env.MAIL_PASS
            ? {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
              }
            : undefined,
      },
      from: process.env.MAIL_FROM ?? "Signal S&P <no-reply@signalsp.local>",
    }),
  ],
});

export const { GET, POST } = handlers;
