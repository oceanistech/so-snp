/**
 * Fleet repository — Prisma calls only, no business logic.
 *
 * Per the Route → Service → Repository convention in CLAUDE.md the service
 * layer is the only thing allowed to import from here, and the only thing
 * here is the data access. Anything that needs to make decisions about which
 * org a row belongs to, what defaults to set, or how to resolve a
 * uniqueness collision belongs in `FleetService`.
 */
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";

/**
 * We accept the full `PrismaClient` here (rather than a `Pick<>` slice).
 * Prisma's `findMany({ include: … })` return-type inference relies on the
 * generic context of the whole client; slicing it with `Pick` collapses
 * the conditional type and the return type drops back to the base model.
 *
 * Tests that don't want a real client pass a hand-rolled object cast as
 * `FleetRepository` directly (see `lib/services/__tests__/fleet.service.test.ts`).
 */
export class FleetRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  /**
   * List active (non-deleted) fleets for an org with their vessel counts.
   *
   * Aggregates that need DWT / FMV totals are computed here too — this is
   * the single place that talks to the DB so the service can stay generic.
   */
  async listForOrg(orgId: string, options: { includeDeleted?: boolean } = {}) {
    return this.db.fleet.findMany({
      where: {
        orgId,
        ...(options.includeDeleted ? {} : { deletedAt: null }),
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        _count: {
          select: { fleetVessels: { where: { deletedAt: null } } },
        },
        fleetVessels: {
          where: { deletedAt: null },
          select: {
            vessel: {
              select: {
                id: true,
                yearBuilt: true,
                dwt: true,
                currentFmv: true,
                vesselType: { select: { code: true, name: true, shortLabel: true } },
              },
            },
          },
        },
      },
    });
  }

  /** Return a single fleet scoped to an org (or null). */
  async getById(id: string, orgId: string) {
    return this.db.fleet.findFirst({
      where: { id, orgId, deletedAt: null },
      include: {
        _count: { select: { fleetVessels: { where: { deletedAt: null } } } },
      },
    });
  }

  /**
   * Case-insensitive name lookup used by the service to enforce
   * `(orgId, name)` uniqueness — the DB constraint is case-sensitive.
   */
  async findByNameCaseInsensitive(orgId: string, name: string) {
    return this.db.fleet.findFirst({
      where: {
        orgId,
        deletedAt: null,
        name: { equals: name, mode: "insensitive" },
      },
      select: { id: true, name: true },
    });
  }

  /**
   * Return the set of slugs in this org that start with `prefix`. Used by
   * the service to resolve slug collisions (append `-2`, `-3`, …).
   */
  async slugsStartingWith(orgId: string, prefix: string) {
    const rows = await this.db.fleet.findMany({
      where: {
        orgId,
        // include soft-deleted: we don't want to silently reuse a slug that
        // refers to a fleet sitting in the trash.
        slug: { startsWith: prefix },
      },
      select: { slug: true },
    });
    return new Set(rows.map((r) => r.slug));
  }

  /** Insert a new fleet row. The service is expected to have resolved
   *  uniqueness, slug, defaults, and visibility before calling this. */
  async create(data: Prisma.FleetUncheckedCreateInput) {
    return this.db.fleet.create({ data });
  }

  /** Attach a batch of vessels to a fleet by inserting FleetVessel rows.
   *  Skips vessels already attached (idempotent). */
  async attachVessels(
    fleetId: string,
    vesselIds: string[],
    addedBy: string | undefined,
  ) {
    if (vesselIds.length === 0) return { count: 0 };
    return this.db.fleetVessel.createMany({
      data: vesselIds.map((vesselId) => ({ fleetId, vesselId, addedBy })),
      skipDuplicates: true,
    });
  }
}
