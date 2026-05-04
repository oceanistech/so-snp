import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Dev-only smoke test for the SMTP transport.
 *
 * Gated by ENABLE_DEV_ROUTES so the route returns 404 in production even if
 * accidentally deployed. Hit GET /dev/mail-test?to=you@example.com to send a
 * test email through the configured transport (Mailpit in local dev).
 */
export async function GET(request: Request) {
  if (process.env.ENABLE_DEV_ROUTES !== "true") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const to = url.searchParams.get("to") ?? "dev@signalsp.local";

  try {
    const info = await sendMail({
      to,
      subject: "Signal S&P — mail transport smoke test",
      text: "If you can read this, the SMTP transport is wired correctly.",
      html: `
        <div style="font-family:Lato,system-ui,sans-serif;color:#2C2F3C">
          <h1 style="color:#248FF9;margin:0 0 12px">Signal S&amp;P</h1>
          <p>If you can read this, the SMTP transport is wired correctly.</p>
          <p style="font-size:12px;color:#6b7280">
            Sent at ${new Date().toISOString()} from the dev mail-test route.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, messageId: info.messageId, to });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
