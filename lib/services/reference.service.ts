/**
 * Reference data service — read-only convenience layer over
 * `ReferenceRepository`. Returns the trimmed shapes the Add Vessel form
 * needs without dragging Prisma row types up to the page.
 *
 * Today this is mostly straight-through, but the indirection lets future
 * caching (e.g. memoising the vessel-type tree across requests) and any
 * derived shape (e.g. grouping flag-state vs port-state countries) live
 * in one place.
 */
import { ReferenceRepository } from "@/lib/db/repositories/reference.repository";

export type VesselTypeNode = {
  id: string;
  code: string;
  name: string;
  shortLabel: string | null;
  parentId: string | null;
};

export type FormCountry = {
  id: string;
  iso2: string;
  name: string;
  isFlagState: boolean;
};

export type FormPort = { id: string; name: string; countryId: string };
export type FormShipyard = { id: string; name: string; city: string | null };
export type FormClassSociety = { id: string; code: string; name: string };
export type FormEngineModel = {
  id: string;
  name: string;
  maker: { id: string; name: string };
};

export type AddVesselReferenceData = {
  vesselTypes: VesselTypeNode[];
  countries: FormCountry[];
  ports: FormPort[];
  shipyards: FormShipyard[];
  classSocieties: FormClassSociety[];
  engineModels: FormEngineModel[];
};

export class ReferenceService {
  constructor(
    private readonly repo: ReferenceRepository = new ReferenceRepository(),
  ) {}

  /**
   * One call returns every dataset the Add Vessel form needs, so the
   * server component can render in a single Prisma round trip.
   *
   * Promise.all because the queries are independent.
   */
  async loadAddVesselData(): Promise<AddVesselReferenceData> {
    const [vesselTypes, countries, ports, shipyards, classSocieties, engineModels] =
      await Promise.all([
        this.repo.listVesselTypes(),
        this.repo.listCountries(),
        this.repo.listPorts(),
        this.repo.listShipyards(),
        this.repo.listClassSocieties(),
        this.repo.listEngineModels(),
      ]);
    return {
      vesselTypes,
      countries,
      ports,
      shipyards,
      classSocieties,
      engineModels,
    };
  }
}
