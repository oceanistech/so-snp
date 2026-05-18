/**
 * /fleetspace — Server-rendered shell for the Fleets listing page.
 *
 * Fetches the org's fleets and vessels server-side via the service layer
 * (Route → Service → Repository per CLAUDE.md) and hands the data to
 * `FleetspaceClient` for the interactive tab/search/filter UI.
 *
 * The (app)/layout.tsx ahead of us already guards unauthenticated access;
 * we can assume a valid session by the time this RSC runs.
 */
import { Suspense } from "react";
import { FleetService } from "@/lib/services/fleet.service";
import { VesselService } from "@/lib/services/vessel.service";
import { requireSession } from "@/lib/auth/session";
import { FleetspaceClient } from "./fleetspace-client";

export const dynamic = "force-dynamic"; // session-bound; no static caching

export default async function FleetspacePage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;

  // Parallelise the two reads — they're independent.
  const [fleets, vessels] = await Promise.all([
    new FleetService().listForOrg(session.orgId),
    new VesselService().listForOrg(session.orgId),
  ]);

  // If the URL carries ?created=<id>, look up the created fleet so we can
  // show a name in the success banner without an extra DB round trip.
  const createdFleet = params.created
    ? fleets.find((f) => f.id === params.created)
    : undefined;

  return (
    <Suspense>
      <FleetspaceClient
        initialFleets={fleets}
        initialVessels={vessels}
        justCreated={createdFleet ? { id: createdFleet.id, name: createdFleet.name } : null}
      />
    </Suspense>
  );
}
