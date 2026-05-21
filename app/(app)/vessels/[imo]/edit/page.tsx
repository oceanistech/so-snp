/**
 * /vessels/[imo]/edit — Server-rendered shell for the Edit Vessel form.
 *
 * Loads everything the form needs in a single round trip:
 *   - the vessel's current detail (every column the edit form pre-fills)
 *   - the reference data (vessel types, countries, shipyards, class
 *     societies) so the form's selects render the same options as
 *     the create page
 *
 * The actual form is a client island bound to `editVesselAction` via
 * `useActionState`. On success the action redirects to
 * `/vessels/{id}?updated=1`.
 *
 * NOTE: the route param is `imo` for historical prototype reasons but
 * holds the vessel CUID, matching the detail page's convention.
 */
import { notFound } from "next/navigation";
import { FleetService } from "@/lib/services/fleet.service";
import { VesselService } from "@/lib/services/vessel.service";
import { ReferenceService } from "@/lib/services/reference.service";
import { requireSession } from "@/lib/auth/session";
import { EditVesselForm } from "./edit-vessel-form";

export const dynamic = "force-dynamic";

export default async function EditVesselPage({
  params,
}: {
  params: Promise<{ imo: string }>;
}) {
  const session = await requireSession();
  const { imo: vesselId } = await params;

  // Load everything the form needs in a single round trip — the wide
  // edit payload (every scalar column), the reference data the selects
  // are populated from, the org's fleets (for the Fleet & Commercial
  // section's "Assign to Fleet" select), and the vessel's existing
  // sanctions rows (so the Sanctions History section pre-fills with
  // what was already saved).
  const vesselService = new VesselService();
  const [vessel, referenceData, fleets, sanctions] = await Promise.all([
    vesselService.getEditPayload(session.orgId, vesselId),
    new ReferenceService().loadAddVesselData(),
    new FleetService().listForOrg(session.orgId),
    vesselService.getSanctions(session.orgId, vesselId),
  ]);

  if (!vessel) notFound();

  return (
    <EditVesselForm
      vessel={vessel}
      referenceData={referenceData}
      fleets={fleets.map((f: { id: string; name: string }) => ({
        id: f.id,
        name: f.name,
      }))}
      initialSanctions={
        sanctions?.map(
          (s: {
            id: string;
            authority: string;
            program: string | null;
            startDate: Date | null;
            endDate: Date | null;
          }) => ({
            id: s.id,
            authority: s.authority,
            program: s.program ?? undefined,
            startDate: s.startDate
              ? s.startDate.toISOString().slice(0, 10)
              : undefined,
            endDate: s.endDate
              ? s.endDate.toISOString().slice(0, 10)
              : undefined,
          }),
        ) ?? []
      }
    />
  );
}
