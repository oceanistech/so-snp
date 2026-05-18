/**
 * Vessel service — read-only projection over the VesselRepository.
 *
 * Today this is mostly mapping Prisma rows into a stable UI shape. The
 * service exists now (rather than being inlined into pages) so the
 * eventual create/update/delete logic has a home and the wire-up between
 * pages and the repository stays consistent.
 */
import { VesselRepository, type VesselListFilters } from "@/lib/db/repositories/vessel.repository";
import type { EmploymentStatus, EnvScore, VesselLifecycleStatus } from "@prisma/client";

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
}
