/**
 * Reference data repository — read-only Prisma queries against the
 * platform-global reference tables (Country, Port, VesselType, Shipyard,
 * ClassSociety, EngineModel) used to populate Add Vessel form dropdowns.
 *
 * These tables are seeded by the dev team and never edited by org admins
 * (per ADR-0003). The "Other" free-text fallback handled by the form
 * doesn't touch this repository — it goes straight into the vessel row
 * via the `*Other` columns.
 */
import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";

export class ReferenceRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  /**
   * Every vessel type, parent + child, sorted by their hierarchical
   * `code`. The page filters parents vs subtypes client-side so the
   * subtype dropdown can repopulate without a server round trip.
   */
  async listVesselTypes() {
    return this.db.vesselType.findMany({
      where: { isActive: true },
      orderBy: [{ code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        shortLabel: true,
        parentId: true,
      },
    });
  }

  /**
   * Sovereign states — projection carries `isFlagState` so the form can
   * narrow the Flag State dropdown to recognised registry-issuing nations
   * while still using the same dataset for other country pickers.
   */
  async listCountries() {
    return this.db.country.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }],
      select: { id: true, iso2: true, name: true, isFlagState: true },
    });
  }

  async listPorts() {
    return this.db.port.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, countryId: true },
    });
  }

  async listShipyards() {
    return this.db.shipyard.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, city: true },
    });
  }

  async listClassSocieties() {
    return this.db.classSociety.findMany({
      orderBy: [{ code: "asc" }],
      select: { id: true, code: true, name: true },
    });
  }

  async listEngineModels() {
    return this.db.engineModel.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        maker: { select: { id: true, name: true } },
      },
    });
  }
}
