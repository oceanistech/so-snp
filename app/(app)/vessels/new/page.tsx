/**
 * /vessels/new — Server-rendered shell for the Add Vessel form.
 *
 * Loads everything the form needs in a single round trip:
 *   - reference data (vessel types, countries, ports, shipyards, etc.)
 *   - the org's active fleets (for the optional "Assign to Fleet" dropdown)
 *   - the current user's email (rendered read-only in the form header)
 *
 * The actual form is a client island bound to `createVesselAction` via
 * `useActionState`. On success the action redirects to
 * `/vessels/{id}?created=1`.
 */
import { FleetService } from "@/lib/services/fleet.service";
import { ReferenceService } from "@/lib/services/reference.service";
import { requireSession } from "@/lib/auth/session";
import { AddVesselForm } from "./add-vessel-form";

export const dynamic = "force-dynamic";

export default async function AddVesselPage() {
  const session = await requireSession();
  const [referenceData, fleets] = await Promise.all([
    new ReferenceService().loadAddVesselData(),
    new FleetService().listForOrg(session.orgId),
  ]);
  return (
    <AddVesselForm
      referenceData={referenceData}
      fleets={fleets.map((f) => ({ id: f.id, name: f.name }))}
      ownerLabel={session.email}
    />
  );
}
