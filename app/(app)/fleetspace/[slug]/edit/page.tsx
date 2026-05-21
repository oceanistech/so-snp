/**
 * /fleetspace/[slug]/edit — Server-rendered shell for the Edit Fleet form.
 *
 * Loads everything the form needs in a single round trip:
 *   - the fleet's current settings + attached vessel ids
 *   - the org's full vessel roster (for the "Add Vessels" checklist)
 *   - the current user's email (rendered read-only in the Visibility card)
 *
 * The actual form is a client island bound to `editFleetAction` via
 * `useActionState`. On success the action redirects to
 * `/fleetspace?updated={fleetId}`.
 */
import { notFound } from "next/navigation";
import { FleetService } from "@/lib/services/fleet.service";
import { VesselService } from "@/lib/services/vessel.service";
import { requireSession } from "@/lib/auth/session";
import { EditFleetForm } from "./edit-fleet-form";

export const dynamic = "force-dynamic";

export default async function EditFleetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();
  const { slug } = await params;

  const [fleet, attachableVessels] = await Promise.all([
    new FleetService().getForEdit(session.orgId, slug),
    new VesselService().listAttachableForOrg(session.orgId),
  ]);

  if (!fleet) notFound();

  return (
    <EditFleetForm
      fleet={fleet}
      attachableVessels={attachableVessels}
      ownerLabel={session.email}
    />
  );
}
