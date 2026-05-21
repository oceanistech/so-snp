/**
 * Vessel repository — Prisma calls for the Vessel + supporting reference
 * tables. The repository owns nothing but data access; the service is the
 * only thing that gets to make business decisions.
 *
 * Today's surface:
 *   1. `listForOrg` — vessels visible to a UI listing, filterable.
 *   2. `listAttachableForOrg` — slim projection for the create-fleet checklist.
 *   3. `findByImoAndName` — case-insensitive lookup for (orgId, imo, name)
 *      uniqueness enforcement before insert.
 *   4. `create` — insert a vessel + optional FleetVessel join row in a
 *      single transaction.
 *   5. `getDetailById` — full detail payload for the /vessels/[id] page.
 *   6. `countForOrg` — KPI cards.
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

  /**
   * Case-insensitive lookup against `(orgId, imo, name)` — used by the
   * service to pre-empt the DB unique constraint and return a clean
   * field-level error to the user.
   */
  async findByImoAndName(orgId: string, imo: string, name: string) {
    return this.db.vessel.findFirst({
      where: {
        orgId,
        imo,
        name: { equals: name, mode: "insensitive" },
        deletedAt: null,
      },
      select: { id: true, name: true, imo: true },
    });
  }

  /**
   * Insert a vessel + its optional sub-records in a single transaction:
   *   • the Vessel row itself
   *   • an optional FleetVessel join (when the form picks a fleet)
   *   • an optional VesselOrderBookEntry (1:1, newbuilds only)
   *   • zero or more VesselSanctionEntry rows
   * Returns the created vessel so the action can redirect to /vessels/[id].
   */
  async create(
    data: Prisma.VesselUncheckedCreateInput,
    extras: {
      fleetId?: string;
      addedBy?: string;
      orderBook?: {
        status?:
          | "ON_ORDER"
          | "UNDER_CONSTRUCTION"
          | "LAUNCHED"
          | "DELIVERED"
          | "CANCELLED";
        orderDate?: Date;
        constructionStartDate?: Date;
        launchDate?: Date;
        scheduledDeliveryDate?: Date;
        cancelledDate?: Date;
      };
      sanctions?: {
        authority: string;
        program?: string;
        startDate?: Date;
        endDate?: Date;
        description?: string;
      }[];
    },
  ) {
    return this.db.$transaction(async (tx) => {
      const vessel = await tx.vessel.create({ data });

      if (extras.fleetId) {
        await tx.fleetVessel.create({
          data: {
            fleetId: extras.fleetId,
            vesselId: vessel.id,
            addedBy: extras.addedBy,
          },
        });
      }

      if (extras.orderBook) {
        const ob = extras.orderBook;
        // Skip insert if every field is empty/undefined.
        const hasAny =
          ob.status ||
          ob.orderDate ||
          ob.constructionStartDate ||
          ob.launchDate ||
          ob.scheduledDeliveryDate ||
          ob.cancelledDate;
        if (hasAny) {
          await tx.vesselOrderBookEntry.create({
            data: { vesselId: vessel.id, ...ob },
          });
        }
      }

      if (extras.sanctions && extras.sanctions.length > 0) {
        await tx.vesselSanctionEntry.createMany({
          data: extras.sanctions.map((s) => ({ vesselId: vessel.id, ...s })),
        });
      }

      return vessel;
    });
  }

  /**
   * Full detail payload for the `/vessels/[id]` page — includes the
   * reference relations (vesselType, flag, shipyard, …) so the page can
   * render labels without follow-up queries. Returns `null` when the
   * vessel doesn't exist in the current org (the service translates this
   * to a 404).
   */
  async getDetailById(id: string, orgId: string) {
    return this.db.vessel.findFirst({
      where: { id, orgId, deletedAt: null },
      include: {
        vesselType: {
          select: {
            id: true,
            code: true,
            name: true,
            shortLabel: true,
            parent: { select: { id: true, code: true, name: true } },
          },
        },
        flagCountry: { select: { id: true, iso2: true, name: true } },
        portOfRegistry: { select: { id: true, name: true } },
        shipyard: { select: { id: true, name: true, city: true } },
        classSociety: { select: { id: true, code: true, name: true } },
        engineModel: { select: { id: true, name: true } },
        fleetVessels: {
          where: { deletedAt: null },
          select: {
            fleet: { select: { id: true, slug: true, name: true } },
          },
        },
        certificates: {
          orderBy: [{ expiresAt: "asc" }],
          select: { id: true, label: true, issuer: true, expiresAt: true },
        },
        ownershipHistory: {
          orderBy: [{ fromDate: "desc" }],
          select: {
            id: true,
            ownerName: true,
            fromDate: true,
            toDate: true,
          },
        },
        // The 1:1 Order Book entry — present only on newbuilds. Pulled
        // here so the detail page's "Order Book" card can render the
        // status + milestone dates without a follow-up query.
        orderBook: {
          select: {
            status: true,
            orderDate: true,
            constructionStartDate: true,
            launchDate: true,
            scheduledDeliveryDate: true,
            cancelledDate: true,
          },
        },
      },
    });
  }

  /**
   * Soft-delete a vessel — stamp `deletedAt = now()` so it disappears from
   * the default org listing. `updateMany` returns `{ count }` so the
   * service can detect "vessel not found / wrong org / already deleted"
   * via `count === 0` and raise a typed error.
   */
  async softDelete(id: string, orgId: string) {
    return this.db.vessel.updateMany({
      where: { id, orgId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Patch a vessel's editable fields. Org-scoped via `updateMany` so a
   * caller from one org can't accidentally mutate another org's row.
   */
  async update(id: string, orgId: string, data: Prisma.VesselUpdateInput) {
    return this.db.vessel.updateMany({
      where: { id, orgId, deletedAt: null },
      data,
    });
  }

  /**
   * Soft-delete every currently-active FleetVessel row for this vessel
   * EXCEPT the one for `keepFleetId`. Used by the "Detach from all other
   * fleets" row action so the vessel stays in the fleet the user is
   * currently viewing while leaving every other fleet it was attached to.
   * Returns `{ count }` reflecting how many rows were detached.
   */
  async detachFromOtherFleets(vesselId: string, keepFleetId: string) {
    return this.db.fleetVessel.updateMany({
      where: {
        vesselId,
        fleetId: { not: keepFleetId },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Reassign a vessel's fleet membership to exactly one fleet:
   *   1. Soft-delete every currently-active FleetVessel row for the vessel.
   *   2. If `fleetId` is non-null, insert (or restore) a row attaching
   *      the vessel to that fleet.
   * Atomic via `$transaction`. Returns the new active FleetVessel row
   * (or `null` if `fleetId` is null — i.e. detach from all fleets).
   */
  async reassignToFleet(
    vesselId: string,
    fleetId: string | null,
    addedBy: string | undefined,
  ) {
    return this.db.$transaction(async (tx) => {
      await tx.fleetVessel.updateMany({
        where: { vesselId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      if (fleetId == null) return null;
      // skipDuplicates handles the case where a soft-deleted row already
      // exists for this (fleetId, vesselId) pair — we just insert a new
      // active row alongside it instead of trying to un-soft-delete.
      await tx.fleetVessel.createMany({
        data: [{ fleetId, vesselId, addedBy }],
        skipDuplicates: true,
      });
      return tx.fleetVessel.findFirst({
        where: { fleetId, vesselId, deletedAt: null },
        select: { id: true, fleetId: true, vesselId: true },
      });
    });
  }

  /**
   * Hard-replace a vessel's sanctions list. The `VesselSanctionEntry`
   * model has no `deletedAt` column (sanctions aren't soft-deletable —
   * unlike vessels/fleets, the audit story is the `createdAt` history
   * of the rows themselves), so we delete every existing entry for the
   * vessel and createMany the new list in a transaction.
   */
  async replaceSanctions(
    vesselId: string,
    entries: {
      authority: string;
      program?: string;
      startDate?: Date;
      endDate?: Date;
      description?: string;
    }[],
  ) {
    return this.db.$transaction(async (tx) => {
      await tx.vesselSanctionEntry.deleteMany({ where: { vesselId } });
      if (entries.length > 0) {
        await tx.vesselSanctionEntry.createMany({
          data: entries.map((e) => ({ vesselId, ...e })),
        });
      }
      return { count: entries.length };
    });
  }

  /**
   * Read every active sanction entry for a vessel — used by the edit
   * form to pre-fill the existing rows so the user can amend / remove
   * them. Scoped to the vessel; org-scoping happens at the service
   * layer via `getFullById`.
   */
  async getSanctionsByVesselId(vesselId: string) {
    return this.db.vesselSanctionEntry.findMany({
      where: { vesselId },
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        authority: true,
        program: true,
        startDate: true,
        endDate: true,
        description: true,
      },
    });
  }

  /**
   * Read everything `VesselService.duplicate` / `update` / `moveToFleet`
   * need: every scalar field plus the ids of attached fleets. Scoped by
   * vessel id within the org. The Vessel ↔ VesselOrderBookEntry relation
   * is named `orderBook` in the schema, not `orderBookEntry`.
   */
  async getFullById(id: string, orgId: string) {
    return this.db.vessel.findFirst({
      where: { id, orgId, deletedAt: null },
      include: {
        fleetVessels: {
          where: { deletedAt: null },
          select: { fleetId: true },
        },
        orderBook: true,
      },
    });
  }
}
