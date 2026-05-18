/**
 * Vessel repository — read-only for now (Prisma calls only).
 *
 * The create/update/delete path lands in a later step (server actions for
 * /vessels/new + /vessels/[id]/edit). What we need *today* is enough to
 * power the fleet listing + create form:
 *
 *   1. `listForOrg` — vessels in the org, optionally filtered by fleet
 *     membership, vessel type root, or year-built bucket. Returns the
 *     shape the UI needs (name, IMO, type label, yearBuilt, dwt, env,
 *     fmv, fleet membership).
 *   2. `listAttachableForOrg` — minimal projection for the "Add Vessels"
 *     checklist on the create-fleet form (id, name, IMO, type label, year).
 */
import type { PrismaClient, Prisma } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";

export type VesselListFilters = {
  /** When set, return vessels that ARE assigned to this fleet via an
   *  active (non-deleted) FleetVessel row. */
  fleetId?: string;
  /** When set, return vessels NOT assigned to any active fleet. */
  unassignedOnly?: boolean;
  /** Vessel type "root" (e.g. "BULK", "TANKER") — matches the prefix of
   *  VesselType.code split on the first "." */
  typeRoot?: string;
  /** Substring match against the vessel name (case-insensitive). */
  search?: string;
};

export class VesselRepository {
  // We accept the full `PrismaClient` (not a `Pick<>` slice) so Prisma's
  // generic return-type inference for `findMany({ select: … })` stays
  // intact. Tests stub the whole `VesselRepository` rather than its client.
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  /**
   * Vessels visible to the org listing UI. Always filters out soft-deleted
   * rows; callers don't get to see the trash.
   */
  async listForOrg(orgId: string, filters: VesselListFilters = {}) {
    const where: Prisma.VesselWhereInput = {
      orgId,
      deletedAt: null,
    };

    if (filters.fleetId) {
      where.fleetVessels = {
        some: { fleetId: filters.fleetId, deletedAt: null },
      };
    } else if (filters.unassignedOnly) {
      where.fleetVessels = { none: { deletedAt: null } };
    }

    if (filters.typeRoot) {
      // The hierarchical code starts with the root, e.g. "BULK.PANAMAX".
      where.vesselType = { code: { startsWith: filters.typeRoot } };
    }

    if (filters.search && filters.search.trim() !== "") {
      where.name = { contains: filters.search.trim(), mode: "insensitive" };
    }

    return this.db.vessel.findMany({
      where,
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        imo: true,
        name: true,
        yearBuilt: true,
        dwt: true,
        currentFmv: true,
        envScore: true,
        lifecycleStatus: true,
        employmentStatus: true,
        isOnSale: true,
        vesselType: { select: { code: true, name: true, shortLabel: true } },
        fleetVessels: {
          where: { deletedAt: null },
          select: {
            fleet: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    });
  }

  /**
   * Trimmed projection used by the "Add Vessels" checklist on the
   * create-fleet form — keeps the payload small for very large rosters.
   */
  async listAttachableForOrg(orgId: string) {
    return this.db.vessel.findMany({
      where: { orgId, deletedAt: null },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        imo: true,
        name: true,
        yearBuilt: true,
        vesselType: { select: { code: true, name: true, shortLabel: true } },
      },
    });
  }

  /** Vessel count (active only) — used for org-wide KPI cards. */
  async countForOrg(orgId: string) {
    return this.db.vessel.count({ where: { orgId, deletedAt: null } });
  }
}
