/**
 * GET /api/vessels/[id] — returns the full `VesselDetail` payload for the
 * vessel with the given CUID, scoped to the current session's org.
 *
 * Used by the FleetspaceClient's nested vessel sub-tabs to lazy-fetch
 * detail content when the user opens a vessel tab inside a fleet view.
 * Per-vessel data is small (single Prisma query with includes) so this
 * route doesn't paginate or stream.
 *
 * 401 on unauthenticated, 404 when the vessel isn't in the caller's org.
 */
import { NextResponse } from "next/server";
import { VesselService } from "@/lib/services/vessel.service";
import { requireSession, UnauthenticatedError } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("[/api/vessels/[id]] session error:", err);
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await context.params;
  const vessel = await new VesselService().getDetailById(id, session.orgId);
  if (!vessel) {
    return NextResponse.json({ error: "Vessel not found" }, { status: 404 });
  }
  return NextResponse.json(vessel);
}
