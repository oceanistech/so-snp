/**
 * /fleetspace/create — Server-rendered shell for the Create Fleet form.
 *
 * Loads the org's vessel roster (for the "Add Vessels" checklist) on the
 * server so the form never needs to round-trip for that data. The actual
 * form is a client island bound to `createFleetAction` via useActionState.
 */
import { VesselService } from "@/lib/services/vessel.service";
import { requireSession } from "@/lib/auth/session";
import { CreateFleetForm } from "./create-fleet-form";

export const dynamic = "force-dynamic";

export default async function CreateFleetPage() {
  const session = await requireSession();
  const vessels = await new VesselService().listAttachableForOrg(session.orgId);
  return (
    <CreateFleetForm
      attachableVessels={vessels}
      ownerLabel={session.email}
    />
  );
}
