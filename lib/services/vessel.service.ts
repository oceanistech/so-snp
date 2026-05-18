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

    const { fleetId, ...rest } = input;
    return this.repo.create(
      {
        orgId,
        createdBy,
        ...rest,
        name,
        imo,
      },
      fleetId ?? undefined,
      createdBy,
    );
  }

  /**
   * Detail payload for `/vessels/[id]`. Returns `null` when the vessel
   * doesn't exist under the current org so the page can render a 404
   * without leaking the existence of vessels in other orgs.
   */
  async getDetailById(id: string, orgId: string): Promise<VesselDetail | null> {
    const row = (await this.repo.getDetailById(id, orgId)) as unknown as
      | VesselDetailRow
      | null;
    if (!row) return null;
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
  imo: string;
  name: string;
  mmsi?: string;
  callSign?: string;
  vesselTypeId: string;
  yearBuilt: number;
  dwt: number;
  grt?: number;
  nrt?: number;
  loaM?: number;
  beamM?: number;
  draftM?: number;
  serviceSpeedKn?: number;
  flagCountryId?: string;
  flagOther?: string;
  portOfRegistryId?: string;
  portOfRegistryOther?: string;
  shipyardId?: string;
  shipyardOther?: string;
  classSocietyId?: string;
  classSocietyOther?: string;
  engineModelId?: string;
  engineModelOther?: string;
  nextSpecialSurvey?: Date;
  acquisitionCost?: number;
  acquisitionDate?: Date;
  currentFmv?: number;
  outstandingLoan?: number;
  currency?: Currency;
  lifecycleStatus?: VesselLifecycleStatus;
  employmentStatus?: EmploymentStatus;
  envScore?: EnvScore;
  isOnSale?: boolean;
  onSaleAt?: Date;
  notes?: string;
  fleetId?: string;
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
