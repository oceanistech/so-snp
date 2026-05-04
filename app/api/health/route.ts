import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mailer } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Check = { ok: boolean; latencyMs?: number; error?: string };

async function timed<T>(fn: () => Promise<T>): Promise<Check> {
  const start = performance.now();
  try {
    await fn();
    return { ok: true, latencyMs: Math.round(performance.now() - start) };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET() {
  const [db, mail] = await Promise.all([
    timed(async () => {
      await prisma.$queryRaw`SELECT 1`;
    }),
    timed(async () => {
      await mailer().verify();
    }),
  ]);

  const ok = db.ok && mail.ok;
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      checks: { db, mail },
      timestamp: new Date().toISOString(),
      service: "snp-module-web",
      version: process.env.npm_package_version ?? "0.0.1",
    },
    { status: ok ? 200 : 503 },
  );
}
