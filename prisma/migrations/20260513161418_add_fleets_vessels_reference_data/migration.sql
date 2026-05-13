-- CreateEnum
CREATE TYPE "CounterpartyType" AS ENUM ('OWNER', 'BUYER', 'SELLER', 'CHARTERER', 'OPERATOR', 'LENDER', 'FINANCIER', 'BROKER', 'MANAGER', 'TECHNICAL_MANAGER', 'INSURER');

-- CreateEnum
CREATE TYPE "PendingReferenceTable" AS ENUM ('PORT', 'SHIPYARD', 'CLASS_SOCIETY', 'ENGINE_MAKER', 'ENGINE_MODEL', 'COUNTERPARTY');

-- CreateEnum
CREATE TYPE "PendingReferenceStatus" AS ENUM ('PENDING', 'MERGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FleetVisibility" AS ENUM ('PRIVATE', 'TEAM', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "VesselLifecycleStatus" AS ENUM ('ACTIVE', 'LAID_UP', 'DRYDOCK', 'SOLD', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('CURRENT_EARNINGS', 'HISTORIC_EARNINGS', 'FUTURE_EARNINGS');

-- CreateEnum
CREATE TYPE "EnvScore" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CNY');

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isFlagState" BOOLEAN NOT NULL DEFAULT false,
    "flagEmoji" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL,
    "unlocode" TEXT,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "lat" DECIMAL(8,5),
    "lng" DECIMAL(8,5),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessel_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "shortLabel" TEXT,
    "colorHex" TEXT,
    "minDwt" INTEGER,
    "maxDwt" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vessel_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipyards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT,
    "city" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipyards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_societies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "iacsMember" BOOLEAN NOT NULL DEFAULT true,
    "websiteUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_societies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engine_makers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engine_makers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engine_models" (
    "id" TEXT NOT NULL,
    "makerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engine_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counterparties" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "name" TEXT NOT NULL,
    "type" "CounterpartyType" NOT NULL DEFAULT 'CHARTERER',
    "countryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counterparties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_reference_suggestions" (
    "id" TEXT NOT NULL,
    "table" "PendingReferenceTable" NOT NULL,
    "suggestion" TEXT NOT NULL,
    "context" JSONB,
    "status" "PendingReferenceStatus" NOT NULL DEFAULT 'PENDING',
    "orgId" TEXT,
    "suggestedBy" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "mergedIntoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_reference_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleets" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Mixed',
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "visibility" "FleetVisibility" NOT NULL DEFAULT 'PRIVATE',
    "tag" TEXT,
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "fleets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessels" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "imo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mmsi" TEXT,
    "callSign" TEXT,
    "flagCountryId" TEXT,
    "portOfRegistryId" TEXT,
    "vesselTypeId" TEXT NOT NULL,
    "shipyardId" TEXT,
    "classSocietyId" TEXT,
    "engineModelId" TEXT,
    "flagOther" TEXT,
    "portOfRegistryOther" TEXT,
    "shipyardOther" TEXT,
    "classSocietyOther" TEXT,
    "engineModelOther" TEXT,
    "yearBuilt" INTEGER NOT NULL,
    "nextSpecialSurvey" TIMESTAMP(3),
    "dwt" INTEGER NOT NULL,
    "grt" INTEGER,
    "nrt" INTEGER,
    "loaM" DECIMAL(6,2),
    "beamM" DECIMAL(6,2),
    "draftM" DECIMAL(6,2),
    "serviceSpeedKn" DECIMAL(4,2),
    "acquisitionCost" DECIMAL(14,2),
    "acquisitionDate" TIMESTAMP(3),
    "currentFmv" DECIMAL(14,2),
    "outstandingLoan" DECIMAL(14,2),
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "lifecycleStatus" "VesselLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'CURRENT_EARNINGS',
    "envScore" "EnvScore",
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "onSaleAt" TIMESTAMP(3),
    "heroImageUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,

    CONSTRAINT "vessels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_vessels" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "fleet_vessels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessel_ownership_history" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vessel_ownership_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessel_certificates" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "issuer" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vessel_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessel_registry_cache" (
    "id" TEXT NOT NULL,
    "imo" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'SIGNAL_OCEAN',
    "payload" JSONB NOT NULL,
    "normalized" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceUpdatedAt" TIMESTAMP(3),
    "hits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vessel_registry_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso2_key" ON "countries"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso3_key" ON "countries"("iso3");

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE INDEX "countries_isFlagState_idx" ON "countries"("isFlagState");

-- CreateIndex
CREATE UNIQUE INDEX "ports_unlocode_key" ON "ports"("unlocode");

-- CreateIndex
CREATE INDEX "ports_countryId_idx" ON "ports"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "ports_name_countryId_key" ON "ports"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "vessel_types_code_key" ON "vessel_types"("code");

-- CreateIndex
CREATE INDEX "vessel_types_parentId_idx" ON "vessel_types"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "shipyards_name_countryId_key" ON "shipyards"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "class_societies_code_key" ON "class_societies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "class_societies_name_key" ON "class_societies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "engine_makers_name_key" ON "engine_makers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "engine_models_makerId_name_key" ON "engine_models"("makerId", "name");

-- CreateIndex
CREATE INDEX "counterparties_type_idx" ON "counterparties"("type");

-- CreateIndex
CREATE UNIQUE INDEX "counterparties_orgId_name_key" ON "counterparties"("orgId", "name");

-- CreateIndex
CREATE INDEX "pending_reference_suggestions_status_table_idx" ON "pending_reference_suggestions"("status", "table");

-- CreateIndex
CREATE INDEX "fleets_orgId_deletedAt_idx" ON "fleets"("orgId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "fleets_orgId_slug_key" ON "fleets"("orgId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "fleets_orgId_name_key" ON "fleets"("orgId", "name");

-- CreateIndex
CREATE INDEX "vessels_orgId_imo_idx" ON "vessels"("orgId", "imo");

-- CreateIndex
CREATE INDEX "vessels_orgId_vesselTypeId_idx" ON "vessels"("orgId", "vesselTypeId");

-- CreateIndex
CREATE INDEX "vessels_orgId_deletedAt_idx" ON "vessels"("orgId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "vessels_orgId_imo_name_key" ON "vessels"("orgId", "imo", "name");

-- CreateIndex
CREATE INDEX "fleet_vessels_vesselId_idx" ON "fleet_vessels"("vesselId");

-- CreateIndex
CREATE INDEX "fleet_vessels_fleetId_deletedAt_idx" ON "fleet_vessels"("fleetId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_vessels_fleetId_vesselId_key" ON "fleet_vessels"("fleetId", "vesselId");

-- CreateIndex
CREATE INDEX "vessel_ownership_history_vesselId_idx" ON "vessel_ownership_history"("vesselId");

-- CreateIndex
CREATE INDEX "vessel_certificates_vesselId_expiresAt_idx" ON "vessel_certificates"("vesselId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "vessel_registry_cache_imo_key" ON "vessel_registry_cache"("imo");

-- CreateIndex
CREATE INDEX "vessel_registry_cache_fetchedAt_idx" ON "vessel_registry_cache"("fetchedAt");

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessel_types" ADD CONSTRAINT "vessel_types_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "vessel_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipyards" ADD CONSTRAINT "shipyards_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engine_models" ADD CONSTRAINT "engine_models_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "engine_makers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counterparties" ADD CONSTRAINT "counterparties_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "orgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counterparties" ADD CONSTRAINT "counterparties_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "orgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "orgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_flagCountryId_fkey" FOREIGN KEY ("flagCountryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_portOfRegistryId_fkey" FOREIGN KEY ("portOfRegistryId") REFERENCES "ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_vesselTypeId_fkey" FOREIGN KEY ("vesselTypeId") REFERENCES "vessel_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_shipyardId_fkey" FOREIGN KEY ("shipyardId") REFERENCES "shipyards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_classSocietyId_fkey" FOREIGN KEY ("classSocietyId") REFERENCES "class_societies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_engineModelId_fkey" FOREIGN KEY ("engineModelId") REFERENCES "engine_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_vessels" ADD CONSTRAINT "fleet_vessels_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_vessels" ADD CONSTRAINT "fleet_vessels_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessel_ownership_history" ADD CONSTRAINT "vessel_ownership_history_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessel_certificates" ADD CONSTRAINT "vessel_certificates_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
