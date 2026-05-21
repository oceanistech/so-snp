/**
 * Fleet service — business logic for the Fleets feature.
 *
 * Owns slug generation, case-insensitive uniqueness enforcement, default
 * resolution and orchestration with the FleetRepository. Server actions and
 * route handlers call into this layer; the repository never leaves it.
 */
import type { Currency, FleetVisibility, Prisma } from "@prisma/client";
import { FleetRepository } from "@/lib/db/repositories/fleet.repository";

/**
 * Local row shape that mirrors what `FleetRepository.listForOrg` returns.
 *
 * We declare it explicitly (rather than rely on Prisma's `GetPayload`
 * helpers) so the service is *describable* even when callers stub the
 * repository in unit tests — the test rows just have to fit this shape.
 */
type ListedFleetRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  currency: Currency;
  visibility: FleetVisibility;
  tag: string | null;
  ownerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { fleetVessels: number };
  fleetVessels: {
    vessel: {
      id: string;
      yearBuilt: number;
      dwt: number;
      currentFmv: { toString: () => string } | number | string | null;
      vesselType: { code: string; name: string; shortLabel: string | null } | null;
    };
  }[];
};

/**
 * Error subclasses so the action layer can map specific failure modes to
 * user-facing field errors (e.g. duplicate name) without parsing strings.
 */
export class FleetNameConflictError extends Error {
  constructor(name: string) {
    super(`A fleet named "${name}" already exists in this organisation`);
    this.name = "FleetNameConflictError";
  }
}

/** Thrown by `softDelete` / `duplicate` when the target fleet doesn't
 *  exist in this org (or was already soft-deleted). */
export class FleetNotFoundError extends Error {
  constructor(id: string) {
    super(`Fleet "${id}" was not found in this organisation`);
    this.name = "FleetNotFoundError";
  }
}

/* --------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

/** Kebab-case slug: lowercase, ascii-ish, hyphens, no leading/trailing dash. */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "fleet";
}

/* --------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type CreateFleetInput = {
  name: string;
  type?: string;
  currency?: Currency;
  description?: string;
  visibility?: FleetVisibility;
  tag?: string;
  vesselIds?: string[];
  ownerUserId?: string;
  /** Free-text owner display name (person or company). */
  ownerName?: string;
};

/** PATCH-style input for `FleetService.update` — every field optional. */
export type UpdateFleetInput = {
  name?: string;
  type?: string;
  currency?: Currency;
  description?: string | null;
  visibility?: FleetVisibility;
  tag?: string | null;
  ownerName?: string | null;
};

/** Payload accepted by `FleetService.updateWithVessels` — superset of
 *  `UpdateFleetInput` that also lets callers reconcile vessel membership
 *  in the same call. When `vesselIds` is `undefined` the membership is
 *  left alone; when it's an array (including empty) the membership is
 *  fully replaced by that set. */
export type UpdateFleetWithVesselsInput = UpdateFleetInput & {
  vesselIds?: string[];
};

/** Shape returned by `FleetService.getForEdit` — everything the edit
 *  form needs to pre-fill its inputs. */
export type FleetEditPayload = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: string;
  currency: Currency;
  visibility: FleetVisibility;
  tag: string | null;
  ownerUserId: string | null;
  ownerName: string | null;
  vesselIds: string[];
};

export type FleetSummary = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  currency: Currency;
  visibility: FleetVisibility;
  tag: string | null;
  ownerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  vesselCount: number;
  totalDwt: number;
  totalFmvUsd: number;
  avgAgeYears: number | null;
  typeMix: Record<string, number>;
};

/* --------------------------------------------------------------------------
 * Service
 * -------------------------------------------------------------------------- */

export class FleetService {
  constructor(private readonly repo: FleetRepository = new FleetRepository()) {}

  /**
   * Create a new fleet for an org.
   *
   * Steps:
   *   1. Reject duplicate names (case-insensitive) early.
   *   2. Generate a base slug; resolve collisions by appending `-2`, `-3`, …
   *   3. Insert the fleet.
   *   4. Optionally attach vessels in the same call.
   */
  async create(orgId: string, input: CreateFleetInput) {
    const name = input.name.trim();
    const dupe = await this.repo.findByNameCaseInsensitive(orgId, name);
    if (dupe) throw new FleetNameConflictError(name);

    const slug = await this.resolveSlug(orgId, slugify(name));

    const fleet = await this.repo.create({
      orgId,
      slug,
      name,
      description: input.description,
      type: input.type ?? "Mixed",
      currency: input.currency ?? "USD",
      visibility: input.visibility ?? "PRIVATE",
      tag: input.tag,
      ownerUserId: input.ownerUserId,
      ownerName: input.ownerName,
    });

    if (input.vesselIds && input.vesselIds.length > 0) {
      await this.repo.attachVessels(fleet.id, input.vesselIds, input.ownerUserId);
    }

    return fleet;
  }

  /**
   * Listing payload for /fleetspace — fleets with the KPI aggregates the
   * UI cards need (vessel count, total DWT, total FMV, avg age, type mix).
   *
   * Heavier filtering/sorting (per-page, sort key) stays in the page layer
   * because the data set is tiny per org and pagination is mostly cosmetic.
   */
  async listForOrg(orgId: string): Promise<FleetSummary[]> {
    // Cast through `unknown` because Prisma's inferred include type doesn't
    // textually overlap with our explicit row shape (the include adds
    // `_count` / `fleetVessels` which TS' strict cast checker treats as a
    // disjoint widening). See `ListedFleetRow` for the contract we rely on.
    const rows = (await this.repo.listForOrg(orgId)) as unknown as ListedFleetRow[];
    const currentYear = new Date().getFullYear();

    return rows.map((f) => {
      const vessels = f.fleetVessels.map((fv) => fv.vessel);
      const totalDwt = vessels.reduce(
        (sum: number, v) => sum + (v.dwt ?? 0),
        0,
      );
      const totalFmvUsd = vessels.reduce(
        (sum: number, v) => sum + Number(v.currentFmv ?? 0),
        0,
      );
      const ages = vessels
        .map((v) => currentYear - v.yearBuilt)
        .filter((n) => Number.isFinite(n));
      const avgAgeYears =
        ages.length > 0
          ? Number(
              (
                ages.reduce((s: number, n: number) => s + n, 0) / ages.length
              ).toFixed(1),
            )
          : null;

      const typeMix: Record<string, number> = {};
      for (const v of vessels) {
        const code = v.vesselType?.code ?? "OTHER";
        const root = code.split(".")[0] ?? "OTHER";
        typeMix[root] = (typeMix[root] ?? 0) + 1;
      }

      return {
        id: f.id,
        slug: f.slug,
        name: f.name,
        type: f.type,
        description: f.description,
        currency: f.currency,
        visibility: f.visibility,
        tag: f.tag,
        ownerUserId: f.ownerUserId,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        vesselCount: f._count.fleetVessels,
        totalDwt,
        totalFmvUsd,
        avgAgeYears,
        typeMix,
      };
    });
  }

  /**
   * Soft-delete a fleet — stamp `deletedAt = now()` so it disappears from
   * the default org listing. Throws `FleetNotFoundError` if the row is
   * already gone (so the action layer can return a clean error to the UI
   * instead of silently no-op-ing).
   */
  async softDelete(orgId: string, fleetId: string): Promise<void> {
    const result = await this.repo.softDelete(fleetId, orgId);
    if (result.count === 0) throw new FleetNotFoundError(fleetId);
  }

  /**
   * Patch a fleet's editable fields.
   *
   * Behaviour:
   *   - `name` is trimmed and checked against the org's case-insensitive
   *     uniqueness rule. Changing the name does NOT re-slug the fleet —
   *     the slug stays stable so existing links keep working.
   *   - `description` / `tag` accept `null` to explicitly clear.
   *   - Returns the updated row so the UI can re-render with fresh data.
   */
  async update(
    orgId: string,
    fleetId: string,
    input: UpdateFleetInput,
  ): Promise<void> {
    const patch: Prisma.FleetUpdateInput = {};

    if (input.name !== undefined) {
      const next = input.name.trim();
      if (next === "") throw new Error("Fleet name cannot be empty");
      // Uniqueness — allow the row to keep its own name (so user can
      // re-save without renaming), but reject collision with siblings.
      const dupe = await this.repo.findByNameCaseInsensitive(orgId, next);
      if (dupe && dupe.id !== fleetId) {
        throw new FleetNameConflictError(next);
      }
      patch.name = next;
    }
    if (input.type !== undefined) patch.type = input.type;
    if (input.currency !== undefined) patch.currency = input.currency;
    if (input.description !== undefined) patch.description = input.description;
    if (input.visibility !== undefined) patch.visibility = input.visibility;
    if (input.tag !== undefined) patch.tag = input.tag;
    if (input.ownerName !== undefined) patch.ownerName = input.ownerName;

    // No-op shortcut.
    if (Object.keys(patch).length === 0) return;

    const result = await this.repo.update(fleetId, orgId, patch);
    if (result.count === 0) throw new FleetNotFoundError(fleetId);
  }

  /**
   * Duplicate a fleet — create a sibling fleet with the same settings,
   * a fresh slug, and the same set of currently-attached vessels copied
   * over via the existing `attachVessels` path.
   *
   * Name resolution:
   *   - If the caller passes `options.name`, that name is used (trimmed
   *     + uniqueness-checked). A `FleetNameConflictError` is thrown if
   *     it's already taken.
   *   - Otherwise we auto-resolve "<source name> (Copy)", appending
   *     " (Copy 2)", " (Copy 3)", … until a free name is found.
   *
   * `ownerUserId` becomes the duplicating user.
   */
  async duplicate(
    orgId: string,
    fleetId: string,
    ownerUserId: string,
    options: { name?: string } = {},
  ): Promise<{ id: string; slug: string; name: string }> {
    const source = await this.repo.getForDuplicate(fleetId, orgId);
    if (!source) throw new FleetNotFoundError(fleetId);

    let newName: string;
    if (options.name !== undefined) {
      newName = options.name.trim();
      if (newName === "") throw new Error("Fleet name cannot be empty");
      const dupe = await this.repo.findByNameCaseInsensitive(orgId, newName);
      if (dupe) throw new FleetNameConflictError(newName);
    } else {
      // Resolve a "<name> (Copy)" name that doesn't collide with another
      // fleet in this org. Append "(Copy 2)", "(Copy 3)", … as needed.
      newName = await this.resolveCopyName(orgId, source.name);
    }
    const slug = await this.resolveSlug(orgId, slugify(newName));

    const fleet = await this.repo.create({
      orgId,
      slug,
      name: newName,
      description: source.description ?? undefined,
      type: source.type,
      currency: source.currency,
      visibility: source.visibility,
      tag: source.tag ?? undefined,
      ownerUserId,
    });

    const vesselIds = source.fleetVessels.map(
      (fv: { vesselId: string }) => fv.vesselId,
    );
    if (vesselIds.length > 0) {
      await this.repo.attachVessels(fleet.id, vesselIds, ownerUserId);
    }

    return { id: fleet.id, slug: fleet.slug, name: fleet.name };
  }

  /**
   * Compute the default name the duplicate-dialog should pre-fill the
   * input with (so the user sees the same name the server would auto-
   * resolve, but with the ability to override). Public so the action
   * layer can call it without re-implementing the (Copy N) logic.
   */
  async suggestCopyName(orgId: string, fleetId: string): Promise<string | null> {
    const source = await this.repo.getForDuplicate(fleetId, orgId);
    if (!source) return null;
    return this.resolveCopyName(orgId, source.name);
  }

  /**
   * Read everything the edit page needs to pre-fill its inputs.
   * Returns `null` when the slug doesn't belong to this org (or was
   * soft-deleted), so the page can respond with a 404.
   */
  async getForEdit(orgId: string, slug: string): Promise<FleetEditPayload | null> {
    const row = await this.repo.getForEdit(slug, orgId);
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      type: row.type,
      currency: row.currency,
      visibility: row.visibility,
      tag: row.tag,
      ownerUserId: row.ownerUserId,
      ownerName: row.ownerName,
      vesselIds: row.fleetVessels.map(
        (fv: { vesselId: string }) => fv.vesselId,
      ),
    };
  }

  /**
   * Edit-form variant of `update` — patches the fleet's settings AND
   * reconciles vessel membership in the same call. Used by
   * `editFleetAction` on `/fleetspace/[slug]/edit`.
   *
   *   - `vesselIds === undefined` → membership untouched.
   *   - `vesselIds === []` → all vessels detached.
   *   - `vesselIds === [a, b, c]` → membership becomes exactly {a, b, c}
   *     (any current attachments not in the set are soft-deleted).
   *
   * Throws `FleetNotFoundError` if the fleet is gone, or
   * `FleetNameConflictError` if a rename collides with another sibling.
   */
  async updateWithVessels(
    orgId: string,
    fleetId: string,
    ownerUserId: string,
    input: UpdateFleetWithVesselsInput,
  ): Promise<void> {
    const { vesselIds, ...settings } = input;
    // Settings patch — same code path as `update()` so name uniqueness,
    // null-clearing, and not-found semantics behave identically.
    await this.update(orgId, fleetId, settings);

    // Vessel reconciliation — only if the caller passed an explicit list.
    if (vesselIds !== undefined) {
      await this.repo.replaceVessels(fleetId, vesselIds, ownerUserId);
    }
  }

  /* ------------------------------------------------------------------------
   * Internals
   * ---------------------------------------------------------------------- */

  /** Build a "<name> (Copy)" / "(Copy 2)" / "(Copy 3)" … that doesn't
   *  collide with any existing fleet name in this org (case-insensitive). */
  private async resolveCopyName(orgId: string, base: string): Promise<string> {
    // Try the simple "(Copy)" suffix first.
    let candidate = `${base} (Copy)`;
    let dupe = await this.repo.findByNameCaseInsensitive(orgId, candidate);
    if (!dupe) return candidate;
    for (let n = 2; n < 1000; n++) {
      candidate = `${base} (Copy ${n})`;
      dupe = await this.repo.findByNameCaseInsensitive(orgId, candidate);
      if (!dupe) return candidate;
    }
    throw new Error(`Unable to resolve a free "Copy" name for "${base}"`);
  }

  /**
   * Resolve a free slug. If `base` is unused, return it. Otherwise append
   * `-2`, `-3`, … until we find one that isn't taken (within this org).
   */
  private async resolveSlug(orgId: string, base: string): Promise<string> {
    const taken = await this.repo.slugsStartingWith(orgId, base);
    if (!taken.has(base)) return base;
    for (let n = 2; n < 1000; n++) {
      const candidate = `${base}-${n}`;
      if (!taken.has(candidate)) return candidate;
    }
    // Pathological — shouldn't happen, but throw rather than infinite-loop.
    throw new Error(`Unable to resolve a free slug for "${base}"`);
  }
}
