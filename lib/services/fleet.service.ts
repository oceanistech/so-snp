/**
 * Fleet service — business logic for the Fleets feature.
 *
 * Owns slug generation, case-insensitive uniqueness enforcement, default
 * resolution and orchestration with the FleetRepository. Server actions and
 * route handlers call into this layer; the repository never leaves it.
 */
import type { Currency, FleetVisibility } from "@prisma/client";
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

  /* ------------------------------------------------------------------------
   * Internals
   * ---------------------------------------------------------------------- */

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
