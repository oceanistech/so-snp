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
    return new Set(rows.map((r: { slug: string }) => r.slug));
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

  /**
   * Soft-delete a fleet: stamp `deletedAt = now` so it disappears from the
   * default list-for-org query. The row is preserved for audit + restore.
   * `updateMany` returns `{ count }` so callers can detect "fleet not found
   * in this org / already deleted" via `count === 0`.
   */
  async softDelete(id: string, orgId: string) {
    return this.db.fleet.updateMany({
      where: { id, orgId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Patch a fleet's editable fields. Like `softDelete` we use `updateMany`
   * scoped to `(id, orgId, deletedAt: null)` so a caller from one org can't
   * accidentally mutate another org's row; the `{ count }` tells the
   * service whether the row was actually found.
   */
  async update(
    id: string,
    orgId: string,
    data: Prisma.FleetUpdateInput,
  ) {
    return this.db.fleet.updateMany({
      where: { id, orgId, deletedAt: null },
      data,
    });
  }

  /**
   * Read everything `FleetService.duplicate` needs to build a copy:
   * the source fleet's settings plus the ids of its currently attached
   * (non-deleted) vessels.
   */
  async getForDuplicate(id: string, orgId: string) {
    return this.db.fleet.findFirst({
      where: { id, orgId, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        currency: true,
        visibility: true,
        tag: true,
        fleetVessels: {
          where: { deletedAt: null },
          select: { vesselId: true },
        },
      },
    });
  }

  /**
   * Read everything the edit page needs: the fleet's current settings
   * plus the ids of every currently-attached vessel so the checklist can
   * pre-tick them. Scoped by slug (the URL form `/fleetspace/[slug]/edit`).
   */
  async getForEdit(slug: string, orgId: string) {
    return this.db.fleet.findFirst({
      where: { slug, orgId, deletedAt: null },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        type: true,
        currency: true,
        visibility: true,
        tag: true,
        ownerUserId: true,
        ownerName: true,
        fleetVessels: {
          where: { deletedAt: null },
          select: { vesselId: true },
        },
      },
    });
  }

  /**
   * Reconcile a fleet's vessel membership against `vesselIds`:
   *   1. Soft-delete any currently-active FleetVessel row whose
   *      `vesselId` isn't in the new set.
   *   2. Insert a new FleetVessel row for every id in `vesselIds` that
   *      doesn't already have an active row (preserving any soft-deleted
   *      row from a previous detach — Prisma's `createMany` with
   *      `skipDuplicates` won't dedupe against soft-deletes, so we do
   *      the dedupe ourselves).
   *
   * Uses a transaction so the membership is atomic from the caller's
   * point of view.
   */
  async replaceVessels(
    fleetId: string,
    vesselIds: string[],
    addedBy: string | undefined,
  ) {
    const keep = new Set(vesselIds);
    return this.db.$transaction(async (tx) => {
      // Explicit row type so the callbacks below typecheck even when the
      // Prisma client hasn't been regenerated (it falls back to `any` for
      // `tx.fleetVessel.findMany` return otherwise).
      type Row = { id: string; vesselId: string };
      const current = (await tx.fleetVessel.findMany({
        where: { fleetId, deletedAt: null },
        select: { id: true, vesselId: true },
      })) as Row[];
      const currentIds = new Set(current.map((r: Row) => r.vesselId));

      const toDetach = current
        .filter((r: Row) => !keep.has(r.vesselId))
        .map((r: Row) => r.id);
      if (toDetach.length > 0) {
        await tx.fleetVessel.updateMany({
          where: { id: { in: toDetach } },
          data: { deletedAt: new Date() },
        });
      }

      const toAttach = vesselIds.filter((id: string) => !currentIds.has(id));
      if (toAttach.length > 0) {
        await tx.fleetVessel.createMany({
          data: toAttach.map((vesselId: string) => ({
            fleetId,
            vesselId,
            addedBy,
          })),
          skipDuplicates: true,
        });
      }

      return { attached: toAttach.length, detached: toDetach.length };
    });
  }
}
