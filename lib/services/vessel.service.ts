/**
 * Vessel service — read projections + create flow.
 *
 * Owns the business rules around vessel creation:
 *   - case-insensitive `(orgId, imo, name)` uniqueness check (the DB
 *     constraint is case-sensitive; the service catches a duplicate
 *     before we ever round-trip to Postgres)
 *   - default resolution (currency, employment status)
 *   - optional fleet attachment via the repository transaction
 *
 * Read projections (`listForOrg`, `listAttachableForOrg`, `getDetailById`)
 * map Prisma row shapes to UI-friendly DTOs.
 */
import { VesselRepository, type VesselListFilters } from "@/lib/db/repositories/vessel.repository";
import type {
  Currency,
  EmploymentStatus,
  EnvScore,
  Prisma,
  VesselLifecycleStatus,
} from "@prisma/client";

/**
 * Specific business-error surface so the action layer can map known
 * failure modes to inline field errors without parsing strings.
 */
export class VesselConflictError extends Error {
  constructor(imo: string, name: string) {
    super(`A vessel with IMO ${imo} and name "${name}" already exists`);
    this.name = "VesselConflictError";
  }
}

/** Thrown by `softDelete` / `update` / `duplicate` / `moveToFleet` when
 *  the target vessel doesn't exist in this org (or was already
 *  soft-deleted). */
export class VesselNotFoundError extends Error {
  constructor(id: string) {
    super(`Vessel "${id}" was not found in this organisation`);
    this.name = "VesselNotFoundError";
  }
}

/* --------------------------------------------------------------------------
 * Local row shapes mirroring `VesselRepository` query projections.
 * Declared explicitly so tests can stub the repository with plain objects.
 * -------------------------------------------------------------------------- */

type ListedVesselRow = {
  id: string;
  imo: string;
  name: string;
  yearBuilt: number;
  dwt: number;
  currentFmv: { toString: () => string } | number | string | null;
  envScore: EnvScore | null;
  lifecycleStatus: VesselLifecycleStatus;
  employmentStatus: EmploymentStatus;
  isOnSale: boolean;
  vesselType: { code: string; name: string; shortLabel: string | null } | null;
  fleetVessels: {
    fleet: { id: string; slug: string; name: string };
  }[];
};

type AttachableVesselRow = {
  id: string;
  imo: string;
  name: string;
  yearBuilt: number;
  vesselType: { code: string; name: string; shortLabel: string | null } | null;
};

export type VesselListItem = {
  id: string;
  imo: string;
  name: string;
  typeCode: string;
  typeLabel: string;
  typeRoot: "BULK" | "TANKER" | "GAS" | "CONTAINER" | "OFFSHORE" | "OTHER";
  yearBuilt: number;
  dwt: number;
  currentFmvUsd: number | null;
  envScore: EnvScore | null;
  lifecycleStatus: VesselLifecycleStatus;
  employmentStatus: EmploymentStatus;
  isOnSale: boolean;
  fleets: { id: string; slug: string; name: string }[];
};

export type AttachableVessel = {
  id: string;
  imo: string;
  name: string;
  yearBuilt: number;
  typeCode: string;
  typeLabel: string;
  typeRoot: VesselListItem["typeRoot"];
};

const KNOWN_ROOTS: VesselListItem["typeRoot"][] = [
  "BULK",
  "TANKER",
  "GAS",
  "CONTAINER",
  "OFFSHORE",
];

function rootOf(code: string): VesselListItem["typeRoot"] {
  const head = code.split(".")[0];
  const root = (head ?? "").toUpperCase();
  return (KNOWN_ROOTS as string[]).includes(root)
    ? (root as VesselListItem["typeRoot"])
    : "OTHER";
}

/**
 * Recursively coerce any Prisma `Decimal` into a plain number so the
 * value survives the RSC → Client Component boundary (Next.js requires
 * plain JSON-safe payloads). Detects Decimals by duck-typing (they
 * expose `.toNumber()`) so the helper doesn't need a hard import from
 * `@prisma/client/runtime`. Dates and primitives pass through; nested
 * objects + arrays are recursed so a Decimal buried inside (e.g.
 * `orderBook`) is still caught.
 */
function serialiseDecimal(v: unknown): unknown {
  if (v == null) return v;
  if (typeof v !== "object") return v;
  if (v instanceof Date) return v;
  if (Array.isArray(v)) return v.map(serialiseDecimal);
  const obj = v as { toNumber?: () => number; toString?: () => string };
  if (typeof obj.toNumber === "function") {
    // Prisma Decimal → plain number. `Decimal(14,2)` fits inside JS's
    // 2^53 range for any vessel-grade monetary value we'd hold.
    try {
      return obj.toNumber();
    } catch {
      // Pathological — fall back to the string form so the data still
      // survives the wire, even if it loses precision in the form.
      return obj.toString?.() ?? null;
    }
  }
  // Plain object — walk every key.
  const out: Record<string, unknown> = {};
  for (const [k, vv] of Object.entries(v)) {
    out[k] = serialiseDecimal(vv);
  }
  return out;
}

export class VesselService {
  constructor(private readonly repo: VesselRepository = new VesselRepository()) {}

  async listForOrg(
    orgId: string,
    filters: VesselListFilters = {},
  ): Promise<VesselListItem[]> {
    const rows = (await this.repo.listForOrg(orgId, filters)) as unknown as ListedVesselRow[];
    return rows.map((v) => ({
      id: v.id,
      imo: v.imo,
      name: v.name,
      typeCode: v.vesselType?.code ?? "OTHER",
      typeLabel: v.vesselType?.name ?? "Other",
      typeRoot: rootOf(v.vesselType?.code ?? "OTHER"),
      yearBuilt: v.yearBuilt,
      dwt: v.dwt,
      currentFmvUsd: v.currentFmv != null ? Number(v.currentFmv) : null,
      envScore: v.envScore,
      lifecycleStatus: v.lifecycleStatus,
      employmentStatus: v.employmentStatus,
      isOnSale: v.isOnSale,
      fleets: v.fleetVessels.map((fv) => ({
        id: fv.fleet.id,
        slug: fv.fleet.slug,
        name: fv.fleet.name,
      })),
    }));
  }

  async listAttachableForOrg(orgId: string): Promise<AttachableVessel[]> {
    const rows = (await this.repo.listAttachableForOrg(orgId)) as unknown as AttachableVesselRow[];
    return rows.map((v) => ({
      id: v.id,
      imo: v.imo,
      name: v.name,
      yearBuilt: v.yearBuilt,
      typeCode: v.vesselType?.code ?? "OTHER",
      typeLabel: v.vesselType?.name ?? "Other",
      typeRoot: rootOf(v.vesselType?.code ?? "OTHER"),
    }));
  }

  countForOrg(orgId: string) {
    return this.repo.countForOrg(orgId);
  }

  /**
   * Insert a vessel (and optionally attach it to a fleet) for an org.
   *
   *   1. Reject duplicate `(orgId, imo, name)` (case-insensitive).
   *   2. Repository transaction inserts the vessel + FleetVessel row.
   *   3. Defaults that aren't on the schema (currency, lifecycle, employment)
   *      come from the Prisma defaults — we only forward what the form
   *      explicitly set.
   */
  async create(orgId: string, input: CreateVesselInput, createdBy: string) {
    const name = input.name.trim();
    const imo = input.imo.trim();
    const dupe = await this.repo.findByImoAndName(orgId, imo, name);
    if (dupe) throw new VesselConflictError(imo, name);

    // Split off the related sub-records (Order Book is 1:1, Sanctions are
    // 1-many). They get written by the repository inside the same txn as
    // the parent Vessel row.
    const { fleetId, orderBook, sanctions, ...vesselFields } = input;
    return this.repo.create(
      {
        orgId,
        createdBy,
        ...vesselFields,
        name,
        imo,
      },
      {
        fleetId: fleetId ?? undefined,
        addedBy: createdBy,
        orderBook,
        sanctions,
      },
    );
  }

  /**
   * Soft-delete a vessel. Throws `VesselNotFoundError` if the row is
   * already gone (so the action layer can return a clean error to the
   * UI instead of silently no-op-ing).
   */
  async softDelete(orgId: string, vesselId: string): Promise<void> {
    const result = await this.repo.softDelete(vesselId, orgId);
    if (result.count === 0) throw new VesselNotFoundError(vesselId);
  }

  /**
   * Patch a vessel. The Edit form posts the full create payload (minus
   * imo, which is immutable per ADR-0002), so this takes a `Partial`
   * shape; only defined fields are written. Name + IMO uniqueness is
   * re-checked when name changes (IMO can't change).
   */
  async update(
    orgId: string,
    vesselId: string,
    input: Partial<Omit<CreateVesselInput, "imo">>,
  ): Promise<void> {
    // Pull off sub-records / fleet membership — those are reconciled
    // separately. The remainder maps 1:1 onto Prisma's VesselUpdateInput.
    const { fleetId: _fleetId, orderBook: _orderBook, sanctions, ...fields } = input;
    void _fleetId;
    void _orderBook;

    // Name uniqueness — allow same row to keep its own name; reject any
    // sibling collision via the existing case-insensitive lookup.
    if (fields.name !== undefined) {
      const trimmed = fields.name.trim();
      if (trimmed === "") throw new Error("Vessel name cannot be empty");
      fields.name = trimmed;

      // Look up the row's own imo so we can scope the uniqueness check.
      const current = await this.repo.getFullById(vesselId, orgId);
      if (!current) throw new VesselNotFoundError(vesselId);
      const dupe = await this.repo.findByImoAndName(orgId, current.imo, trimmed);
      if (dupe && dupe.id !== vesselId) {
        throw new VesselConflictError(current.imo, trimmed);
      }
    }

    // Drop undefined keys so they don't write `null` to columns.
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) return;

    // Only run the scalar `update` if there's something to patch — when
    // the form only changed sanctions, `patch` is empty and we'd send a
    // no-op `updateMany` that returns `count: 0`, falsely tripping the
    // not-found error below.
    if (Object.keys(patch).length > 0) {
      const result = await this.repo.update(
        vesselId,
        orgId,
        patch as Prisma.VesselUpdateInput,
      );
      if (result.count === 0) throw new VesselNotFoundError(vesselId);
    }

    // Sanctions are a 0..N child relation, reconciled separately. When
    // the form posts the list (which it always does — empty list means
    // "remove all"), we hard-replace the rows. Skipping this when the
    // caller didn't provide a `sanctions` key preserves the existing
    // list (e.g. callers that only patch a scalar field).
    if (sanctions !== undefined) {
      // Verify the vessel still exists under this org before mutating
      // sanctions — otherwise we'd happily delete entries pointing at a
      // vessel from a different org.
      const exists = await this.repo.getFullById(vesselId, orgId);
      if (!exists) throw new VesselNotFoundError(vesselId);
      await this.repo.replaceSanctions(
        vesselId,
        sanctions.map((s) => ({
          authority: s.authority,
          ...(s.program !== undefined ? { program: s.program } : {}),
          ...(s.startDate !== undefined ? { startDate: s.startDate } : {}),
          ...(s.endDate !== undefined ? { endDate: s.endDate } : {}),
          ...(s.description !== undefined ? { description: s.description } : {}),
        })),
      );
    }
  }

  /**
   * Read the saved sanctions for a vessel so the edit form can pre-fill
   * the row list. Returns `null` when the vessel doesn't exist in this
   * org (matches the `getEditPayload` not-found semantics).
   */
  async getSanctions(orgId: string, vesselId: string) {
    const exists = await this.repo.getFullById(vesselId, orgId);
    if (!exists) return null;
    return this.repo.getSanctionsByVesselId(vesselId);
  }

  /**
   * Duplicate a vessel. The user must supply a new `name` and `imo` (they
   * can't be auto-generated — IMOs are externally assigned and must be
   * globally unique). All other fields are copied verbatim from the
   * source vessel.
   *
   * Fleet membership: pass `options.attachToFleetId` to land the copy in
   * a specific fleet (typically the one the caller is currently viewing).
   * When omitted, the copy is free-floating and won't appear in any
   * fleet's vessel table until the user explicitly attaches it.
   */
  async duplicate(
    orgId: string,
    sourceVesselId: string,
    createdBy: string,
    options: {
      name: string;
      imo: string;
      attachToFleetId?: string;
    },
  ): Promise<{ id: string; name: string; imo: string }> {
    const source = await this.repo.getFullById(sourceVesselId, orgId);
    if (!source) throw new VesselNotFoundError(sourceVesselId);

    const name = options.name.trim();
    const imo = options.imo.trim();
    if (name === "") throw new Error("Vessel name cannot be empty");
    if (imo === "") throw new Error("Vessel IMO cannot be empty");

    const dupe = await this.repo.findByImoAndName(orgId, imo, name);
    if (dupe) throw new VesselConflictError(imo, name);

    // Strip identity / audit / soft-delete columns from the source row;
    // keep every domain field so the copy has the same specs.
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      deletedAt: _deletedAt,
      createdBy: _createdBy,
      imo: _sourceImo,
      name: _sourceName,
      fleetVessels,
      orderBook: _orderBook,
      ...domainFields
    } = source as unknown as Record<string, unknown> & {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      createdBy: string;
      imo: string;
      name: string;
      fleetVessels: { fleetId: string }[];
      orderBook: unknown;
    };
    void _id;
    void _createdAt;
    void _updatedAt;
    void _deletedAt;
    void _createdBy;
    void _sourceImo;
    void _sourceName;
    void _orderBook;

    const created = await this.repo.create(
      {
        ...(domainFields as Record<string, unknown>),
        orgId,
        createdBy,
        name,
        imo,
      } as Prisma.VesselUncheckedCreateInput,
      {
        fleetId: options.attachToFleetId,
        addedBy: createdBy,
      },
    );
    // `fleetVessels` was destructured for the side-effect of dropping the
    // include from the spread. The actual fleet attachment uses
    // `options.attachToFleetId`, not the source vessel's fleets.
    void fleetVessels;
    return { id: created.id, name: created.name, imo: created.imo };
  }

  /**
   * Read everything the full-page edit form needs: every scalar column
   * on the Vessel row plus its current fleet ids and (optional) Order
   * Book entry. The form's 17 sections pre-fill from this payload —
   * `VesselDetail` only carries the ~25 fields the detail page renders,
   * so we project a wider shape here.
   *
   * Returns `null` when the vessel doesn't exist in this org so the page
   * can 404 cleanly.
   */
  async getEditPayload(
    orgId: string,
    vesselId: string,
  ): Promise<VesselEditPayload | null> {
    const raw = await this.repo.getFullById(vesselId, orgId);
    if (!raw) return null;

    // Prisma returns `@db.Decimal` columns as `Decimal` objects which
    // can't cross the RSC → Client Component boundary (Next.js requires
    // plain JSON-safe values). The recursive helper unwraps every
    // Decimal — top-level dimensions/money columns AND any nested ones
    // inside `orderBook`/`fleetVessels` — to a plain number.
    const serialised = serialiseDecimal(raw) as Record<string, unknown> & {
      fleetVessels: { fleetId: string }[];
    };
    const { fleetVessels, ...rest } = serialised;
    return {
      ...(rest as unknown as Omit<VesselEditPayload, "fleetIds">),
      fleetIds: fleetVessels.map((fv) => fv.fleetId),
    };
  }

  /**
   * Suggest a default name for the duplicate dialog: `<source> (Copy)`.
   * Returns `null` if the source vessel doesn't exist in this org so
   * the action layer can 404 cleanly.
   */
  async suggestDuplicateName(
    orgId: string,
    vesselId: string,
  ): Promise<string | null> {
    const source = await this.repo.getFullById(vesselId, orgId);
    if (!source) return null;
    return `${source.name} (Copy)`;
  }

  /**
   * Reassign a vessel to a single fleet — soft-deletes every existing
   * FleetVessel row for the vessel and inserts one for the new fleet.
   * Pass `fleetId: null` to detach the vessel from every fleet.
   */
  async moveToFleet(
    orgId: string,
    vesselId: string,
    fleetId: string | null,
    addedBy: string,
  ): Promise<void> {
    // Verify the vessel exists in this org before reshuffling FleetVessel.
    const exists = await this.repo.getFullById(vesselId, orgId);
    if (!exists) throw new VesselNotFoundError(vesselId);
    await this.repo.reassignToFleet(vesselId, fleetId, addedBy);
  }

  /**
   * Soft-delete every FleetVessel membership for this vessel EXCEPT the
   * one for `keepFleetId`. Used by the "Detach from all other fleets"
   * row action so the vessel stays in the fleet the user is currently
   * viewing while leaving every other fleet it was attached to.
   */
  async detachFromOtherFleets(
    orgId: string,
    vesselId: string,
    keepFleetId: string,
  ): Promise<void> {
    const exists = await this.repo.getFullById(vesselId, orgId);
    if (!exists) throw new VesselNotFoundError(vesselId);
    await this.repo.detachFromOtherFleets(vesselId, keepFleetId);
  }

  /**
   * Detail payload for `/vessels/[id]`. Returns `null` when the vessel
   * doesn't exist under the current org so the page can render a 404
   * without leaking the existence of vessels in other orgs.
   */
  async getDetailById(id: string, orgId: string): Promise<VesselDetail | null> {
    const raw = await this.repo.getDetailById(id, orgId);
    if (!raw) return null;
    // `row` is the typed-but-narrow projection used by the existing
    // mappings below; `wide` is a permissive read of every other column
    // we surface on the extended detail page (Build, Tonnage, Cargo,
    // Holds, Tanker Equipment, Gas Carrier, …). `wide` columns include
    // Prisma `@db.Decimal` cells that we coerce to `number | null` via
    // the local `num` helper before returning.
    const row = raw as unknown as VesselDetailRow;
    const wide = raw as unknown as Record<string, unknown> & {
      orderBook: {
        status: string | null;
        orderDate: Date | null;
        constructionStartDate: Date | null;
        launchDate: Date | null;
        scheduledDeliveryDate: Date | null;
        cancelledDate: Date | null;
      } | null;
    };
    const num = (v: unknown): number | null =>
      v == null ? null : Number(v as never);
    const str = (v: unknown): string | null =>
      v == null ? null : String(v);
    const bool = (v: unknown): boolean => Boolean(v);
    const date = (v: unknown): Date | null =>
      v == null ? null : (v as Date);
    return {
      id: row.id,
      imo: row.imo,
      name: row.name,
      mmsi: row.mmsi,
      callSign: row.callSign,
      yearBuilt: row.yearBuilt,
      dwt: row.dwt,
      grt: row.grt,
      nrt: row.nrt,
      loaM: row.loaM != null ? Number(row.loaM) : null,
      beamM: row.beamM != null ? Number(row.beamM) : null,
      draftM: row.draftM != null ? Number(row.draftM) : null,
      serviceSpeedKn:
        row.serviceSpeedKn != null ? Number(row.serviceSpeedKn) : null,
      acquisitionCostUsd:
        row.acquisitionCost != null ? Number(row.acquisitionCost) : null,
      acquisitionDate: row.acquisitionDate,
      currentFmvUsd: row.currentFmv != null ? Number(row.currentFmv) : null,
      outstandingLoanUsd:
        row.outstandingLoan != null ? Number(row.outstandingLoan) : null,
      currency: row.currency,
      lifecycleStatus: row.lifecycleStatus,
      employmentStatus: row.employmentStatus,
      envScore: row.envScore,
      isOnSale: row.isOnSale,
      onSaleAt: row.onSaleAt,
      nextSpecialSurvey: row.nextSpecialSurvey,
      notes: row.notes,
      heroImageUrl: row.heroImageUrl,

      // ── Extended scalar fields surfaced on the detail page ──
      // Type & Classification
      builtForTrade: str(wide.builtForTrade),
      currentTrade: str(wide.currentTrade),
      designModel: str(wide.designModel),
      iceClass: str(wide.iceClass),
      propulsionType: str(wide.propulsionType),
      cleanDirtyWilling: bool(wide.cleanDirtyWilling),

      // Build & Delivery
      builtCountry: str(wide.builtCountry),
      yardNumber: str(wide.yardNumber),
      deliveryDate: date(wide.deliveryDate),
      scrappedDate: date(wide.scrappedDate),

      // Dimensions extended
      mouldedDepthM: num(wide.mouldedDepthM),
      airDraughtM: num(wide.airDraughtM),
      lightshipT: num(wide.lightshipT),
      summerTpc: num(wide.summerTpc),

      // Tonnage extended
      reducedGrt: num(wide.reducedGrt),
      panamaCanalNrt: num(wide.panamaCanalNrt),
      suezCanalNrt: num(wide.suezCanalNrt),

      // Cargo Capacity
      cubicSizeM3: num(wide.cubicSizeM3),
      grainCapacityM3: num(wide.grainCapacityM3),
      baleCapacityM3: num(wide.baleCapacityM3),
      teu: num(wide.teu),
      teuAt14t: num(wide.teuAt14t),
      deckTeu: num(wide.deckTeu),
      underDeckTeu: num(wide.underDeckTeu),
      reefers: num(wide.reefers),

      // Holds, Hatches, Cranes & Grabs
      numHolds: num(wide.numHolds),
      numHatches: num(wide.numHatches),
      numCranes: num(wide.numCranes),
      numGrabs: num(wide.numGrabs),
      cranesMaxOutreachM: num(wide.cranesMaxOutreachM),
      cranesMaxLiftingT: num(wide.cranesMaxLiftingT),
      holdDetails: str(wide.holdDetails),
      hatchDetails: str(wide.hatchDetails),
      craneDetails: str(wide.craneDetails),
      grabDetails: str(wide.grabDetails),
      isGeared: bool(wide.isGeared),
      grabsFitted: bool(wide.grabsFitted),
      boxShapedHolds: bool(wide.boxShapedHolds),
      openHatch: bool(wide.openHatch),
      australianHoldLadder: bool(wide.australianHoldLadder),
      logFitted: bool(wide.logFitted),
      a60Bulkhead: bool(wide.a60Bulkhead),
      co2Fitted: bool(wide.co2Fitted),

      // Parallel Body
      parallelBodyLadenM: num(wide.parallelBodyLadenM),
      parallelBodyBallastM: num(wide.parallelBodyBallastM),
      parallelBodyEmptyM: num(wide.parallelBodyEmptyM),

      // Manifold
      bowToCentreManifoldM: num(wide.bowToCentreManifoldM),
      waterlineToManifoldM: num(wide.waterlineToManifoldM),
      deckToCentreManifoldM: num(wide.deckToCentreManifoldM),
      railToCentreManifoldM: num(wide.railToCentreManifoldM),

      // Tanker Equipment
      imoType: str(wide.imoType),
      inertGasSystem: bool(wide.inertGasSystem),
      crudeOilWashing: bool(wide.crudeOilWashing),
      heatingCoils: bool(wide.heatingCoils),
      ststCoating: num(wide.ststCoating),
      epoxyCoating: num(wide.epoxyCoating),
      zincCoating: num(wide.zincCoating),
      marinelineCoating: num(wide.marinelineCoating),
      interlineCoating: num(wide.interlineCoating),

      // Bow Equipment
      numBowChainStoppers: num(wide.numBowChainStoppers),
      numBowThrusters: num(wide.numBowThrusters),
      bowChainStopperDetails: str(wide.bowChainStopperDetails),
      bowChainStoppersFitted: bool(wide.bowChainStoppersFitted),

      // Main Engine extended
      engineManufacturer: str(wide.engineManufacturer),
      enginePowerKw: num(wide.enginePowerKw),
      engineRpm: num(wide.engineRpm),
      mewisDuct: str(wide.mewisDuct),

      // Gas Carrier
      gasContainmentType: str(wide.gasContainmentType),
      minTemperatureC: num(wide.minTemperatureC),
      maxPressureBar: num(wide.maxPressureBar),
      carriesAmmonia: bool(wide.carriesAmmonia),
      carriesVcm: bool(wide.carriesVcm),
      carriesEthylene: bool(wide.carriesEthylene),

      // Environmental & Compliance
      ghgRating: str(wide.ghgRating),
      scrubbersInstalledDate: date(wide.scrubbersInstalledDate),
      ballastWaterTreatmentSystem: bool(wide.ballastWaterTreatmentSystem),
      neoPanamaLocks: bool(wide.neoPanamaLocks),
      sternLine: bool(wide.sternLine),

      // Operators & Owners
      commercialOperator: str(wide.commercialOperator),
      beneficialOwner: str(wide.beneficialOwner),

      // Order Book (newbuilds only) — null when no entry exists.
      orderBook: wide.orderBook
        ? {
            status: wide.orderBook.status,
            orderDate: wide.orderBook.orderDate,
            constructionStartDate: wide.orderBook.constructionStartDate,
            launchDate: wide.orderBook.launchDate,
            scheduledDeliveryDate: wide.orderBook.scheduledDeliveryDate,
            cancelledDate: wide.orderBook.cancelledDate,
          }
        : null,

      flag: row.flagCountry
        ? { id: row.flagCountry.id, iso2: row.flagCountry.iso2, name: row.flagCountry.name }
        : row.flagOther
          ? { id: null, iso2: null, name: row.flagOther }
          : null,
      portOfRegistry: row.portOfRegistry
        ? { id: row.portOfRegistry.id, name: row.portOfRegistry.name }
        : row.portOfRegistryOther
          ? { id: null, name: row.portOfRegistryOther }
          : null,
      shipyard: row.shipyard
        ? { id: row.shipyard.id, name: row.shipyard.name, city: row.shipyard.city }
        : row.shipyardOther
          ? { id: null, name: row.shipyardOther, city: null }
          : null,
      classSociety: row.classSociety
        ? { id: row.classSociety.id, code: row.classSociety.code, name: row.classSociety.name }
        : row.classSocietyOther
          ? { id: null, code: null, name: row.classSocietyOther }
          : null,
      engineModel: row.engineModel
        ? { id: row.engineModel.id, name: row.engineModel.name }
        : row.engineModelOther
          ? { id: null, name: row.engineModelOther }
          : null,
      vesselType: row.vesselType
        ? {
            id: row.vesselType.id,
            code: row.vesselType.code,
            name: row.vesselType.name,
            shortLabel: row.vesselType.shortLabel,
            parent: row.vesselType.parent
              ? {
                  id: row.vesselType.parent.id,
                  code: row.vesselType.parent.code,
                  name: row.vesselType.parent.name,
                }
              : null,
          }
        : null,
      typeRoot: rootOf(row.vesselType?.code ?? "OTHER"),
      fleets: row.fleetVessels.map((fv) => ({
        id: fv.fleet.id,
        slug: fv.fleet.slug,
        name: fv.fleet.name,
      })),
      certificates: row.certificates.map((c) => ({
        id: c.id,
        label: c.label,
        issuer: c.issuer,
        expiresAt: c.expiresAt,
        status: certificateStatus(c.expiresAt),
      })),
      ownershipHistory: row.ownershipHistory.map((o) => ({
        id: o.id,
        ownerName: o.ownerName,
        fromDate: o.fromDate,
        toDate: o.toDate,
        isCurrent: o.toDate === null,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

/**
 * Three-state certificate health signal used by the detail page's
 * cert-chip dots. Anything within 90 days of expiry is `warn`; past
 * expiry is `expired`. No expiry date defaults to `ok` (the chip just
 * renders without a date suffix).
 */
function certificateStatus(expiresAt: Date | null): "ok" | "warn" | "expired" {
  if (!expiresAt) return "ok";
  const now = Date.now();
  const diff = expiresAt.getTime() - now;
  if (diff < 0) return "expired";
  if (diff < 90 * 24 * 60 * 60 * 1000) return "warn";
  return "ok";
}

/* --------------------------------------------------------------------------
 * Create input + detail types
 * -------------------------------------------------------------------------- */

/**
 * Service-layer create payload — kept narrow on purpose. The action layer
 * runs the Zod schema first and only forwards fields the service should
 * see (no display-only "fleetLabel", etc.). Optional fields are passed as
 * `undefined`; the repository / Prisma fills defaults.
 */
export type CreateVesselInput = {
  // 1. Identification
  imo: string;
  name: string;
  mmsi?: string;
  callSign?: string;
  flagCountryId?: string;
  flagCode?: string;
  flagOther?: string;
  portOfRegistryId?: string;
  portOfRegistryOther?: string;
  classSocietyId?: string;
  classSocietyOther?: string;
  classRenewalDate?: Date;

  // 2. Type & Classification
  vesselTypeId: string;
  builtForTrade?: string;
  currentTrade?: string;
  designModel?: string;
  iceClass?: string;
  propulsionType?: string;
  cleanDirtyWilling?: boolean;

  // 3. Build & Delivery
  yearBuilt: number;
  builtCountry?: string;
  shipyardId?: string;
  shipyardOther?: string;
  yardNumber?: string;
  deliveryDate?: Date;
  scrappedDate?: Date;

  // 4. Principal Dimensions
  dwt: number;
  loaM?: number;
  beamM?: number;
  mouldedDepthM?: number;
  draftM?: number;
  airDraughtM?: number;
  lightshipT?: number;
  summerTpc?: number;

  // 5. Tonnage
  grt?: number;
  reducedGrt?: number;
  nrt?: number;
  panamaCanalNrt?: number;
  suezCanalNrt?: number;

  // 6. Cargo Capacity
  cubicSizeM3?: number;
  grainCapacityM3?: number;
  baleCapacityM3?: number;
  teu?: number;
  teuAt14t?: number;
  deckTeu?: number;
  underDeckTeu?: number;
  reefers?: number;

  // 7. Holds, Hatches, Cranes & Grabs
  numHolds?: number;
  numHatches?: number;
  numCranes?: number;
  numGrabs?: number;
  cranesMaxOutreachM?: number;
  cranesMaxLiftingT?: number;
  holdDetails?: string;
  hatchDetails?: string;
  craneDetails?: string;
  grabDetails?: string;
  isGeared?: boolean;
  grabsFitted?: boolean;
  boxShapedHolds?: boolean;
  openHatch?: boolean;
  australianHoldLadder?: boolean;
  logFitted?: boolean;
  a60Bulkhead?: boolean;
  co2Fitted?: boolean;

  // 8. Parallel Body Length
  parallelBodyLadenM?: number;
  parallelBodyBallastM?: number;
  parallelBodyEmptyM?: number;

  // 9. Manifold (tanker)
  bowToCentreManifoldM?: number;
  waterlineToManifoldM?: number;
  deckToCentreManifoldM?: number;
  railToCentreManifoldM?: number;

  // 10. Tanker Equipment
  imoType?: "1" | "2" | "3";
  inertGasSystem?: boolean;
  crudeOilWashing?: boolean;
  heatingCoils?: boolean;
  ststCoating?: number;
  epoxyCoating?: number;
  zincCoating?: number;
  marinelineCoating?: number;
  interlineCoating?: number;

  // 11. Bow Equipment
  numBowChainStoppers?: number;
  numBowThrusters?: number;
  bowChainStopperDetails?: string;
  bowChainStoppersFitted?: boolean;

  // 12. Main Engine
  engineModelId?: string;
  engineModelOther?: string;
  engineManufacturer?: string;
  enginePowerKw?: number;
  engineRpm?: number;
  mewisDuct?: string;
  serviceSpeedKn?: number;

  // 13. Gas Carrier
  gasContainmentType?: string;
  minTemperatureC?: number;
  maxPressureBar?: number;
  carriesAmmonia?: boolean;
  carriesVcm?: boolean;
  carriesEthylene?: boolean;

  // 14. Environmental & Compliance
  envScore?: EnvScore;
  ghgRating?: EnvScore;
  scrubbersInstalledDate?: Date;
  ballastWaterTreatmentSystem?: boolean;
  neoPanamaLocks?: boolean;
  sternLine?: boolean;
  nextSpecialSurvey?: Date;

  // 15. Operators & Owners
  commercialOperator?: string;
  beneficialOwner?: string;

  // 16. Commercial / financial
  acquisitionCost?: number;
  acquisitionDate?: Date;
  currentFmv?: number;
  outstandingLoan?: number;
  currency?: Currency;

  // 17. Status / sale / misc
  lifecycleStatus?: VesselLifecycleStatus;
  employmentStatus?: EmploymentStatus;
  isOnSale?: boolean;
  onSaleAt?: Date;
  notes?: string;
  fleetId?: string;

  // 18. Related sub-records
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
};

type VesselDetailRow = {
  id: string;
  imo: string;
  name: string;
  mmsi: string | null;
  callSign: string | null;
  yearBuilt: number;
  dwt: number;
  grt: number | null;
  nrt: number | null;
  loaM: { toString: () => string } | number | string | null;
  beamM: { toString: () => string } | number | string | null;
  draftM: { toString: () => string } | number | string | null;
  serviceSpeedKn: { toString: () => string } | number | string | null;
  acquisitionCost: { toString: () => string } | number | string | null;
  acquisitionDate: Date | null;
  currentFmv: { toString: () => string } | number | string | null;
  outstandingLoan: { toString: () => string } | number | string | null;
  currency: Currency;
  lifecycleStatus: VesselLifecycleStatus;
  employmentStatus: EmploymentStatus;
  envScore: EnvScore | null;
  isOnSale: boolean;
  onSaleAt: Date | null;
  nextSpecialSurvey: Date | null;
  notes: string | null;
  heroImageUrl: string | null;
  flagCountry: { id: string; iso2: string; name: string } | null;
  flagOther: string | null;
  portOfRegistry: { id: string; name: string } | null;
  portOfRegistryOther: string | null;
  shipyard: { id: string; name: string; city: string | null } | null;
  shipyardOther: string | null;
  classSociety: { id: string; code: string; name: string } | null;
  classSocietyOther: string | null;
  engineModel: { id: string; name: string } | null;
  engineModelOther: string | null;
  vesselType: {
    id: string;
    code: string;
    name: string;
    shortLabel: string | null;
    parent: { id: string; code: string; name: string } | null;
  } | null;
  fleetVessels: {
    fleet: { id: string; slug: string; name: string };
  }[];
  certificates: VesselCertificateRow[];
  ownershipHistory: VesselOwnershipRow[];
  createdAt: Date;
  updatedAt: Date;
};

type VesselCertificateRow = {
  id: string;
  label: string;
  issuer: string | null;
  expiresAt: Date | null;
};

type VesselOwnershipRow = {
  id: string;
  ownerName: string;
  fromDate: Date | null;
  toDate: Date | null;
};

/**
 * Wide payload used by `/vessels/[id]/edit` to pre-fill every form
 * input. Every scalar column on the Vessel Prisma model is here so the
 * 17 form sections (Identification, Type, Build, Order Book, Dimensions,
 * Tonnage, Cargo, Holds, Parallel Body, Manifold, Tanker Equipment,
 * Bow Equipment, Main Engine, Gas Carrier, Compliance, Operators,
 * Commercial, Notes) can read `vessel.<field>` directly.
 *
 * Optional related rows (`orderBook`, fleet membership ids) are
 * surfaced separately so the form can pre-fill the Order Book section
 * and the "Assign to Fleet" picker.
 */
export type VesselEditPayload = {
  // 1. Identification
  id: string;
  imo: string;
  name: string;
  mmsi: string | null;
  callSign: string | null;
  flagCountryId: string | null;
  flagCode: string | null;
  flagOther: string | null;
  portOfRegistryId: string | null;
  portOfRegistryOther: string | null;
  classSocietyId: string | null;
  classSocietyOther: string | null;
  classRenewalDate: Date | null;

  // 2. Type & Classification
  vesselTypeId: string | null;
  builtForTrade: string | null;
  currentTrade: string | null;
  designModel: string | null;
  iceClass: string | null;
  propulsionType: string | null;
  cleanDirtyWilling: boolean;

  // 3. Build & Delivery
  yearBuilt: number;
  builtCountry: string | null;
  shipyardId: string | null;
  shipyardOther: string | null;
  yardNumber: string | null;
  deliveryDate: Date | null;
  scrappedDate: Date | null;

  // 5. Principal Dimensions
  dwt: number;
  loaM: number | null;
  beamM: number | null;
  mouldedDepthM: number | null;
  draftM: number | null;
  airDraughtM: number | null;
  lightshipT: number | null;
  summerTpc: number | null;

  // 6. Tonnage
  grt: number | null;
  reducedGrt: number | null;
  nrt: number | null;
  panamaCanalNrt: number | null;
  suezCanalNrt: number | null;

  // 7. Cargo Capacity
  cubicSizeM3: number | null;
  grainCapacityM3: number | null;
  baleCapacityM3: number | null;
  teu: number | null;
  teuAt14t: number | null;
  deckTeu: number | null;
  underDeckTeu: number | null;
  reefers: number | null;

  // 8. Holds / Hatches / Cranes & Grabs
  numHolds: number | null;
  numHatches: number | null;
  numCranes: number | null;
  numGrabs: number | null;
  cranesMaxOutreachM: number | null;
  cranesMaxLiftingT: number | null;
  holdDetails: string | null;
  hatchDetails: string | null;
  craneDetails: string | null;
  grabDetails: string | null;
  isGeared: boolean;
  grabsFitted: boolean;
  boxShapedHolds: boolean;
  openHatch: boolean;
  australianHoldLadder: boolean;
  logFitted: boolean;
  a60Bulkhead: boolean;
  co2Fitted: boolean;

  // 9. Parallel Body Length
  parallelBodyLadenM: number | null;
  parallelBodyBallastM: number | null;
  parallelBodyEmptyM: number | null;

  // 10. Manifold
  bowToCentreManifoldM: number | null;
  waterlineToManifoldM: number | null;
  deckToCentreManifoldM: number | null;
  railToCentreManifoldM: number | null;

  // 11. Tanker Equipment
  imoType: string | null;
  inertGasSystem: boolean;
  crudeOilWashing: boolean;
  heatingCoils: boolean;
  ststCoating: number | null;
  epoxyCoating: number | null;
  zincCoating: number | null;
  marinelineCoating: number | null;
  interlineCoating: number | null;

  // 12. Bow Equipment
  numBowChainStoppers: number | null;
  numBowThrusters: number | null;
  bowChainStopperDetails: string | null;
  bowChainStoppersFitted: boolean;

  // 13. Main Engine
  engineModelId: string | null;
  engineModelOther: string | null;
  engineManufacturer: string | null;
  enginePowerKw: number | null;
  engineRpm: number | null;
  mewisDuct: string | null;
  serviceSpeedKn: number | null;

  // 14. Gas Carrier
  gasContainmentType: string | null;
  minTemperatureC: number | null;
  maxPressureBar: number | null;
  carriesAmmonia: boolean;
  carriesVcm: boolean;
  carriesEthylene: boolean;

  // 15. Environmental & Compliance
  ghgRating: string | null;
  scrubbersInstalledDate: Date | null;
  ballastWaterTreatmentSystem: boolean;
  neoPanamaLocks: boolean;
  sternLine: boolean;
  nextSpecialSurvey: Date | null;

  // 16. Operators & Owners
  commercialOperator: string | null;
  beneficialOwner: string | null;

  // 17. Commercial / Financial
  acquisitionCost: number | string | null;
  acquisitionDate: Date | null;
  currentFmv: number | string | null;
  outstandingLoan: number | string | null;
  currency: Currency;
  lifecycleStatus: VesselLifecycleStatus;
  employmentStatus: EmploymentStatus;
  isOnSale: boolean;
  onSaleAt: Date | null;

  notes: string | null;

  /** ids of every fleet this vessel is currently a member of. */
  fleetIds: string[];

  /** Optional Order Book entry (newbuilds). */
  orderBook: {
    id: string;
    vesselId: string;
    status: string | null;
    orderDate: Date | null;
    constructionStartDate: Date | null;
    launchDate: Date | null;
    scheduledDeliveryDate: Date | null;
    cancelledDate: Date | null;
  } | null;
};

export type VesselDetail = {
  id: string;
  imo: string;
  name: string;
  mmsi: string | null;
  callSign: string | null;
  yearBuilt: number;
  dwt: number;
  grt: number | null;
  nrt: number | null;
  loaM: number | null;
  beamM: number | null;
  draftM: number | null;
  serviceSpeedKn: number | null;
  acquisitionCostUsd: number | null;
  acquisitionDate: Date | null;
  currentFmvUsd: number | null;
  outstandingLoanUsd: number | null;
  currency: Currency;
  lifecycleStatus: VesselLifecycleStatus;
  employmentStatus: EmploymentStatus;
  envScore: EnvScore | null;
  isOnSale: boolean;
  onSaleAt: Date | null;
  nextSpecialSurvey: Date | null;
  notes: string | null;
  heroImageUrl: string | null;

  /* ── Additional scalar fields surfaced on the detail page so users
     see every spec the edit form captures. Grouped here in the type by
     the corresponding edit-form section for easier mapping. ────────── */

  // Type & Classification
  builtForTrade: string | null;
  currentTrade: string | null;
  designModel: string | null;
  iceClass: string | null;
  propulsionType: string | null;
  cleanDirtyWilling: boolean;

  // Build & Delivery
  builtCountry: string | null;
  yardNumber: string | null;
  deliveryDate: Date | null;
  scrappedDate: Date | null;

  // Dimensions (extended beyond the existing loa/beam/draft)
  mouldedDepthM: number | null;
  airDraughtM: number | null;
  lightshipT: number | null;
  summerTpc: number | null;

  // Tonnage (extended)
  reducedGrt: number | null;
  panamaCanalNrt: number | null;
  suezCanalNrt: number | null;

  // Cargo Capacity
  cubicSizeM3: number | null;
  grainCapacityM3: number | null;
  baleCapacityM3: number | null;
  teu: number | null;
  teuAt14t: number | null;
  deckTeu: number | null;
  underDeckTeu: number | null;
  reefers: number | null;

  // Holds, Hatches, Cranes & Grabs
  numHolds: number | null;
  numHatches: number | null;
  numCranes: number | null;
  numGrabs: number | null;
  cranesMaxOutreachM: number | null;
  cranesMaxLiftingT: number | null;
  holdDetails: string | null;
  hatchDetails: string | null;
  craneDetails: string | null;
  grabDetails: string | null;
  isGeared: boolean;
  grabsFitted: boolean;
  boxShapedHolds: boolean;
  openHatch: boolean;
  australianHoldLadder: boolean;
  logFitted: boolean;
  a60Bulkhead: boolean;
  co2Fitted: boolean;

  // Parallel Body Length
  parallelBodyLadenM: number | null;
  parallelBodyBallastM: number | null;
  parallelBodyEmptyM: number | null;

  // Manifold (tankers)
  bowToCentreManifoldM: number | null;
  waterlineToManifoldM: number | null;
  deckToCentreManifoldM: number | null;
  railToCentreManifoldM: number | null;

  // Tanker Equipment
  imoType: string | null;
  inertGasSystem: boolean;
  crudeOilWashing: boolean;
  heatingCoils: boolean;
  ststCoating: number | null;
  epoxyCoating: number | null;
  zincCoating: number | null;
  marinelineCoating: number | null;
  interlineCoating: number | null;

  // Bow Equipment
  numBowChainStoppers: number | null;
  numBowThrusters: number | null;
  bowChainStopperDetails: string | null;
  bowChainStoppersFitted: boolean;

  // Main Engine (extended beyond the existing engineModel relation)
  engineManufacturer: string | null;
  enginePowerKw: number | null;
  engineRpm: number | null;
  mewisDuct: string | null;

  // Gas Carrier
  gasContainmentType: string | null;
  minTemperatureC: number | null;
  maxPressureBar: number | null;
  carriesAmmonia: boolean;
  carriesVcm: boolean;
  carriesEthylene: boolean;

  // Environmental & Compliance
  ghgRating: string | null;
  scrubbersInstalledDate: Date | null;
  ballastWaterTreatmentSystem: boolean;
  neoPanamaLocks: boolean;
  sternLine: boolean;

  // Operators & Owners
  commercialOperator: string | null;
  beneficialOwner: string | null;

  /** Optional Order Book entry (newbuilds). Null when the vessel was
   *  already delivered before being entered into the platform. */
  orderBook: {
    status: string | null;
    orderDate: Date | null;
    constructionStartDate: Date | null;
    launchDate: Date | null;
    scheduledDeliveryDate: Date | null;
    cancelledDate: Date | null;
  } | null;

  flag: { id: string | null; iso2: string | null; name: string } | null;
  portOfRegistry: { id: string | null; name: string } | null;
  shipyard: { id: string | null; name: string; city: string | null } | null;
  classSociety: { id: string | null; code: string | null; name: string } | null;
  engineModel: { id: string | null; name: string } | null;
  vesselType: {
    id: string;
    code: string;
    name: string;
    shortLabel: string | null;
    parent: { id: string; code: string; name: string } | null;
  } | null;
  typeRoot: VesselListItem["typeRoot"];
  fleets: { id: string; slug: string; name: string }[];
  certificates: {
    id: string;
    label: string;
    issuer: string | null;
    expiresAt: Date | null;
    /** Heuristic for the certificate-chip dot colour: ok | warn | expired. */
    status: "ok" | "warn" | "expired";
  }[];
  ownershipHistory: {
    id: string;
    ownerName: string;
    fromDate: Date | null;
    toDate: Date | null;
    isCurrent: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
};
