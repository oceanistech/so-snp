/**
 * /vessels/[imo] — Vessel Detail page.
 *
 * NOTE on the directory name: the route segment is called `[imo]` for
 * historical prototype reasons, but the value is treated as a Prisma
 * CUID (per ADR-0002, IMOs aren't globally unique). The dynamic segment
 * name is a label only; the page validates the value through
 * `VesselService.getDetailById` (which org-scopes the lookup) and 404s
 * on miss.
 *
 * The page itself is a thin RSC: resolve session, fetch the vessel, and
 * hand the detail object to the `VesselDetailTabs` client island. That
 * island renders the prototype's 8-tab strip and the Main Information
 * panel (matching `html/vessel-details.html`'s layout 1:1). The other
 * seven tabs render a `ComingInModulePlaceholder` until their owning
 * modules ship.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { FleetService } from "@/lib/services/fleet.service";
import { VesselService } from "@/lib/services/vessel.service";
import { requireSession } from "@/lib/auth/session";
import { VesselDetailTabs } from "./vessel-detail-tabs";
import { VesselActionsMenu } from "./vessel-actions-menu";

export const dynamic = "force-dynamic";

export default async function VesselDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ imo: string }>;
  searchParams: Promise<{ created?: string; tab?: string }>;
}) {
  const session = await requireSession();
  const { imo: vesselId } = await params;
  const { created } = await searchParams;

  // Fetch the vessel + the org's fleets in parallel — the fleets list
  // feeds the Actions menu's "Move to Fleet" picker.
  const [vessel, fleets] = await Promise.all([
    new VesselService().getDetailById(vesselId, session.orgId),
    new FleetService().listForOrg(session.orgId),
  ]);
  if (!vessel) notFound();

  return (
    <div className="flex flex-col">
      <AppPageHeader
        breadcrumb={[
          { label: "Fleets", href: "/fleetspace" },
          { label: "Vessels", href: "/fleetspace" },
          { label: vessel.name },
        ]}
        title={vessel.name}
        subtitle={[
          vessel.vesselType?.name ?? "Vessel",
          `Built ${vessel.yearBuilt}`,
          `IMO ${vessel.imo}`,
          `${vessel.dwt.toLocaleString()} DWT`,
        ].join(" · ")}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/fleetspace">
                <ArrowLeft className="size-3.5" />
                Back to Fleets
              </Link>
            </Button>
            <VesselActionsMenu
              vesselId={vessel.id}
              vesselName={vessel.name}
              vesselImo={vessel.imo}
              fleets={fleets.map((f) => ({ id: f.id, name: f.name }))}
            />
          </>
        }
      />

      {created ? (
        <div className="mx-8 my-4 flex items-center gap-3 rounded-md border border-signal-green/40 bg-signal-green/8 px-4 py-2.5 text-[12px]">
          <span aria-hidden className="inline-block size-2 rounded-full bg-signal-green" />
          <span>
            <strong className="font-bold">{vessel.name}</strong> was saved.{" "}
            {vessel.fleets.length > 0 ? (
              <>
                Assigned to{" "}
                <Link
                  href="/fleetspace"
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {vessel.fleets[0]!.name}
                </Link>
                .
              </>
            ) : (
              <>
                No fleet yet —{" "}
                <Link
                  href="/fleetspace"
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  add it to a fleet from /fleetspace
                </Link>
                .
              </>
            )}
          </span>
        </div>
      ) : null}

      <VesselDetailTabs vessel={vessel} />
    </div>
  );
}
