/**
 * Demo data — 12 fleets and ~45 vessels distributed across them, plus a
 * handful of unassigned vessels to exercise the "Unassigned" pseudo-fleet
 * in the UI.
 *
 * Idempotent: every upsert keys on (orgId, slug) for fleets and
 * (orgId, imo, name) for vessels.
 */
import {
  EmploymentStatus,
  EnvScore,
  FleetVisibility,
  PrismaClient,
  VesselLifecycleStatus,
} from "@prisma/client";

type FleetSeed = {
  slug: string;
  name: string;
  description: string;
  type: string;
  visibility: FleetVisibility;
  tag?: string;
};

const FLEETS: FleetSeed[] = [
  { slug: "alpha",                name: "Fleet Alpha",          description: "Bulk + tanker mix, acquired post-2018 for long-term TC strategy.",  type: "Mixed",         visibility: FleetVisibility.TEAM,    tag: "Core" },
  { slug: "beta",                 name: "Fleet Beta",           description: "Tanker-heavy fleet focused on dirty trade and S&P opportunities.",  type: "Tankers",       visibility: FleetVisibility.TEAM,    tag: "Core" },
  { slug: "gamma",                name: "Fleet Gamma",          description: "Capesize bulk concentration for iron-ore routes.",                  type: "Bulk Carriers", visibility: FleetVisibility.PRIVATE },
  { slug: "asia-pacific",         name: "Asia-Pacific Fleet",   description: "Panamax + Ultramax vessels trading intra-Asia and Pacific.",        type: "Bulk Carriers", visibility: FleetVisibility.TEAM,    tag: "Regional" },
  { slug: "atlantic-tankers",     name: "Atlantic Tankers",     description: "MR and LR1 product tankers on transatlantic routes.",               type: "Tankers",       visibility: FleetVisibility.TEAM,    tag: "Regional" },
  { slug: "lng-express",          name: "LNG Express",          description: "Modern LNG carriers on long-term contracts.",                       type: "Gas Carriers",  visibility: FleetVisibility.PRIVATE, tag: "Gas" },
  { slug: "container-northstar",  name: "Container Northstar",  description: "Feeder + Sub-Panamax containers for short-sea services.",           type: "Containers",    visibility: FleetVisibility.TEAM },
  { slug: "mediterranean-coastal", name: "Mediterranean Coastal", description: "Handysize fleet for Mediterranean short-haul cargo.",            type: "Bulk Carriers", visibility: FleetVisibility.PRIVATE },
  { slug: "newbuilds-2024",       name: "Newbuilds 2024+",      description: "Recently delivered vessels under inaugural employments.",            type: "Mixed",         visibility: FleetVisibility.TEAM,    tag: "New" },
  { slug: "legacy-holdings",      name: "Legacy Holdings",      description: "Older tonnage being evaluated for sale or recycling.",               type: "Mixed",         visibility: FleetVisibility.PRIVATE, tag: "Disposal" },
  { slug: "q1-review",            name: "Q1 Review",            description: "Vessels flagged for Q1 analyst review.",                            type: "Mixed",         visibility: FleetVisibility.PRIVATE, tag: "Q1 2026" },
  { slug: "special-cargo",        name: "Special Cargo Fleet",  description: "RoRo and heavy-lift specialised tonnage.",                          type: "Mixed",         visibility: FleetVisibility.TEAM },
];

type VesselSeed = {
  name: string;
  imo: string;
  typeCode: string;          // VesselType.code, e.g. "BULK.PANAMAX"
  yearBuilt: number;
  dwt: number;
  flagIso2: string;
  shipyardName?: string;
  classSocietyCode?: string;
  envScore?: EnvScore;
  fmvUsd?: number;
  acquisitionCostUsd?: number;
  outstandingLoanUsd?: number;
  lifecycle?: VesselLifecycleStatus;
  employment?: EmploymentStatus;
  // Optional on-sale indicator.
  isOnSale?: boolean;
  onSaleAt?: Date;
  // Where the vessel lands — one fleet slug, or null for the unassigned pool.
  fleetSlug: string | null;
};

const VESSELS: VesselSeed[] = [
  // Fleet Alpha — 8 vessels, bulk + tanker mix
  { name: "MV Pacific Star",     imo: "9623148", typeCode: "BULK.PANAMAX",     yearBuilt: 2016, dwt: 82_000,  flagIso2: "MH", shipyardName: "Jiangsu New Yangzi",            classSocietyCode: "BV",  envScore: EnvScore.A, fmvUsd: 28_500_000, acquisitionCostUsd: 26_000_000, outstandingLoanUsd: 14_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "alpha" },
  { name: "MT Helios Trader",    imo: "9712305", typeCode: "TANKER.SUEZMAX",   yearBuilt: 2014, dwt: 158_400, flagIso2: "LR", shipyardName: "Hyundai Heavy Industries",      classSocietyCode: "LR",  envScore: EnvScore.B, fmvUsd: 62_000_000, acquisitionCostUsd: 58_000_000, outstandingLoanUsd: 31_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "alpha" },
  { name: "MV Baltic Crown",     imo: "9544210", typeCode: "BULK.SUPRAMAX",    yearBuilt: 2010, dwt: 55_700,  flagIso2: "PA", shipyardName: "Tsuneishi Shipbuilding",        classSocietyCode: "NK",  envScore: EnvScore.C, fmvUsd: 16_800_000, acquisitionCostUsd: 19_000_000, outstandingLoanUsd:  6_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "alpha" },
  { name: "MV Cape Fortuna",     imo: "9831044", typeCode: "BULK.CAPESIZE",    yearBuilt: 2019, dwt: 181_000, flagIso2: "MT", shipyardName: "Imabari Shipbuilding",          classSocietyCode: "DNV", envScore: EnvScore.A, fmvUsd: 54_200_000, acquisitionCostUsd: 51_000_000, outstandingLoanUsd: 28_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "alpha" },
  { name: "MT Nordic Eagle",     imo: "9388221", typeCode: "TANKER.VLCC",      yearBuilt: 2008, dwt: 299_990, flagIso2: "BS", shipyardName: "Daewoo Shipbuilding (DSME)",    classSocietyCode: "ABS", envScore: EnvScore.D, fmvUsd: 38_000_000, acquisitionCostUsd: 42_000_000, outstandingLoanUsd: 12_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "alpha" },
  { name: "MV Atlantic Star",    imo: "9720401", typeCode: "BULK.PANAMAX",     yearBuilt: 2018, dwt: 82_500,  flagIso2: "LR", shipyardName: "Yangzijiang Shipbuilding",      classSocietyCode: "BV",  envScore: EnvScore.A, fmvUsd: 32_100_000, acquisitionCostUsd: 30_000_000, outstandingLoanUsd: 18_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "alpha" },
  { name: "MV Global Pioneer",   imo: "9612334", typeCode: "BULK.CAPESIZE",    yearBuilt: 2017, dwt: 184_000, flagIso2: "MH", shipyardName: "COSCO Shipping Heavy Industry", classSocietyCode: "CCS", envScore: EnvScore.B, fmvUsd: 48_500_000, acquisitionCostUsd: 50_000_000, outstandingLoanUsd: 25_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "alpha" },
  { name: "MT Aegean Spirit",    imo: "9455612", typeCode: "TANKER.AFRAMAX",   yearBuilt: 2012, dwt: 115_000, flagIso2: "GR", shipyardName: "Samsung Heavy Industries",      classSocietyCode: "DNV", envScore: EnvScore.B, fmvUsd: 32_000_000, acquisitionCostUsd: 36_000_000, outstandingLoanUsd: 14_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "alpha" },

  // Fleet Beta — 6 vessels, tanker-heavy
  { name: "MV Nordic Crest",     imo: "9834521", typeCode: "BULK.KAMSARMAX",   yearBuilt: 2022, dwt: 81_000,  flagIso2: "NO", shipyardName: "Hyundai Heavy Industries",      classSocietyCode: "DNV", envScore: EnvScore.A, fmvUsd: 29_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "beta" },
  { name: "MT Eastern Sun",      imo: "9761234", typeCode: "TANKER.MR",        yearBuilt: 2022, dwt: 52_000,  flagIso2: "SG", shipyardName: "HHI Mipo",                      classSocietyCode: "KR",  envScore: EnvScore.A, fmvUsd: 24_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "beta" },
  { name: "MV Blue Horizon",     imo: "9712890", typeCode: "BULK.PANAMAX",     yearBuilt: 2020, dwt: 82_000,  flagIso2: "MH", shipyardName: "Tsuneishi Shipbuilding",        classSocietyCode: "NK",  envScore: EnvScore.B, fmvUsd: 25_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "beta" },
  { name: "MV Ocean Knight",     imo: "9698123", typeCode: "BULK.ULTRAMAX",    yearBuilt: 2019, dwt: 63_000,  flagIso2: "PA", shipyardName: "Oshima Shipbuilding",           classSocietyCode: "NK",  envScore: EnvScore.B, fmvUsd: 22_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "beta" },
  { name: "MV Silver Wave",      imo: "9623456", typeCode: "BULK.HANDYSIZE",   yearBuilt: 2018, dwt: 38_000,  flagIso2: "MT", shipyardName: "Hudong-Zhonghua",               classSocietyCode: "CCS", envScore: EnvScore.C, fmvUsd: 17_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "beta" },
  { name: "MV Crystal Ridge",    imo: "9534789", typeCode: "BULK.SUPRAMAX",    yearBuilt: 2016, dwt: 48_000,  flagIso2: "LR", shipyardName: "NACKS (Nantong COSCO KHI)",     classSocietyCode: "BV",  envScore: EnvScore.B, fmvUsd: 15_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "beta" },

  // Fleet Gamma — 4 capesize bulkers
  { name: "MV Iron Pioneer",     imo: "9901234", typeCode: "BULK.CAPESIZE",    yearBuilt: 2020, dwt: 180_000, flagIso2: "MH", shipyardName: "Imabari Shipbuilding",          classSocietyCode: "DNV", envScore: EnvScore.A, fmvUsd: 56_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "gamma" },
  { name: "MV Iron Voyager",     imo: "9902345", typeCode: "BULK.CAPESIZE",    yearBuilt: 2021, dwt: 182_000, flagIso2: "MH", shipyardName: "Hyundai Heavy Industries",      classSocietyCode: "ABS", envScore: EnvScore.A, fmvUsd: 58_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "gamma" },
  { name: "MV Iron Phoenix",     imo: "9803456", typeCode: "BULK.CAPESIZE",    yearBuilt: 2018, dwt: 185_000, flagIso2: "PA", shipyardName: "Daewoo Shipbuilding (DSME)",    classSocietyCode: "KR",  envScore: EnvScore.B, fmvUsd: 50_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "gamma" },
  { name: "MV Iron Atlas",       imo: "9704567", typeCode: "BULK.VLOC",        yearBuilt: 2015, dwt: 320_000, flagIso2: "LR", shipyardName: "COSCO Shipping Heavy Industry", classSocietyCode: "CCS", envScore: EnvScore.C, fmvUsd: 65_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "gamma" },

  // Asia-Pacific Fleet — 5 vessels
  { name: "MV Asia Voyager",     imo: "9805678", typeCode: "BULK.PANAMAX",     yearBuilt: 2017, dwt: 81_500,  flagIso2: "SG", shipyardName: "Tsuneishi Shipbuilding",        classSocietyCode: "NK",  envScore: EnvScore.B, fmvUsd: 27_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "asia-pacific" },
  { name: "MV Pacific Empress",  imo: "9806789", typeCode: "BULK.ULTRAMAX",    yearBuilt: 2019, dwt: 64_000,  flagIso2: "HK", shipyardName: "Oshima Shipbuilding",           classSocietyCode: "NK",  envScore: EnvScore.A, fmvUsd: 24_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "asia-pacific" },
  { name: "MV Korea Maru",       imo: "9807890", typeCode: "BULK.PANAMAX",     yearBuilt: 2020, dwt: 82_300,  flagIso2: "KR", shipyardName: "HHI Mipo",                      classSocietyCode: "KR",  envScore: EnvScore.A, fmvUsd: 28_800_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "asia-pacific" },
  { name: "MV Saigon Spirit",    imo: "9808901", typeCode: "BULK.HANDYMAX",    yearBuilt: 2015, dwt: 45_000,  flagIso2: "VN", shipyardName: "Yangzijiang Shipbuilding",      classSocietyCode: "BV",  envScore: EnvScore.C, fmvUsd: 14_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "asia-pacific" },
  { name: "MV Manila Bay",       imo: "9809012", typeCode: "BULK.HANDYSIZE",   yearBuilt: 2014, dwt: 35_000,  flagIso2: "PH", shipyardName: "New Times Shipbuilding",        classSocietyCode: "CCS", envScore: EnvScore.C, fmvUsd: 11_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "asia-pacific" },

  // Atlantic Tankers — 4 MR/LR1
  { name: "MT Atlantic Rose",    imo: "9710001", typeCode: "TANKER.MR",        yearBuilt: 2017, dwt: 51_000,  flagIso2: "BS", shipyardName: "HHI Mipo",                      classSocietyCode: "LR",  envScore: EnvScore.B, fmvUsd: 22_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "atlantic-tankers" },
  { name: "MT Atlantic Pearl",   imo: "9710002", typeCode: "TANKER.MR",        yearBuilt: 2018, dwt: 52_500,  flagIso2: "MT", shipyardName: "HHI Mipo",                      classSocietyCode: "LR",  envScore: EnvScore.A, fmvUsd: 23_800_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "atlantic-tankers" },
  { name: "MT Atlantic Dawn",    imo: "9710003", typeCode: "TANKER.LR1",       yearBuilt: 2019, dwt: 74_000,  flagIso2: "PA", shipyardName: "Hyundai Heavy Industries",      classSocietyCode: "BV",  envScore: EnvScore.A, fmvUsd: 32_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "atlantic-tankers" },
  { name: "MT Atlantic Crown",   imo: "9710004", typeCode: "TANKER.LR1",       yearBuilt: 2016, dwt: 75_000,  flagIso2: "LR", shipyardName: "Daewoo Shipbuilding (DSME)",    classSocietyCode: "DNV", envScore: EnvScore.B, fmvUsd: 28_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "atlantic-tankers" },

  // LNG Express — 2 vessels
  { name: "LNG Polaris",         imo: "9908001", typeCode: "GAS.LNG",          yearBuilt: 2022, dwt: 95_000,  flagIso2: "BS", shipyardName: "Samsung Heavy Industries",      classSocietyCode: "ABS", envScore: EnvScore.A, fmvUsd: 220_000_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: "lng-express" },
  { name: "LNG Orion",           imo: "9908002", typeCode: "GAS.LNG",          yearBuilt: 2023, dwt: 96_500,  flagIso2: "MT", shipyardName: "Hudong-Zhonghua",               classSocietyCode: "DNV", envScore: EnvScore.A, fmvUsd: 235_000_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: "lng-express" },

  // Container Northstar — 3 vessels
  { name: "MV North Carrier",    imo: "9711001", typeCode: "CONTAINER.FEEDER",      yearBuilt: 2017, dwt: 18_000, flagIso2: "DE", shipyardName: "Meyer Werft",          classSocietyCode: "DNV", envScore: EnvScore.B, fmvUsd: 18_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,   fleetSlug: "container-northstar" },
  { name: "MV North Express",    imo: "9711002", typeCode: "CONTAINER.SUBPANAMAX",  yearBuilt: 2019, dwt: 28_500, flagIso2: "NL", shipyardName: "Damen Shipyards",      classSocietyCode: "BV",  envScore: EnvScore.A, fmvUsd: 35_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,   fleetSlug: "container-northstar" },
  { name: "MV North Frontier",   imo: "9711003", typeCode: "CONTAINER.PANAMAX",     yearBuilt: 2021, dwt: 50_000, flagIso2: "SG", shipyardName: "Hyundai Heavy Industries", classSocietyCode: "ABS", envScore: EnvScore.A, fmvUsd: 78_000_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: "container-northstar" },

  // Mediterranean Coastal — 3 handysize vessels
  { name: "MV Med Trader",       imo: "9612001", typeCode: "BULK.HANDYSIZE",   yearBuilt: 2013, dwt: 32_000, flagIso2: "MT", shipyardName: "Fincantieri",                    classSocietyCode: "RINA", envScore: EnvScore.C, fmvUsd: 10_500_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: "mediterranean-coastal" },
  { name: "MV Med Voyager",      imo: "9612002", typeCode: "BULK.HANDYSIZE",   yearBuilt: 2014, dwt: 34_000, flagIso2: "CY", shipyardName: "Fincantieri",                    classSocietyCode: "RINA", envScore: EnvScore.C, fmvUsd: 11_200_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: "mediterranean-coastal" },
  { name: "MV Med Pioneer",      imo: "9612003", typeCode: "BULK.HANDYSIZE",   yearBuilt: 2016, dwt: 36_000, flagIso2: "GR", shipyardName: "Yangzijiang Shipbuilding",       classSocietyCode: "BV",   envScore: EnvScore.B, fmvUsd: 13_500_000, employment: EmploymentStatus.CURRENT_EARNINGS,   fleetSlug: "mediterranean-coastal" },

  // Newbuilds 2024+ — 3 vessels (not yet delivered, FUTURE_EARNINGS)
  { name: "MV Future I",         imo: "9924001", typeCode: "BULK.KAMSARMAX",   yearBuilt: 2024, dwt: 82_000, flagIso2: "SG", shipyardName: "Imabari Shipbuilding",          classSocietyCode: "NK",  envScore: EnvScore.A, fmvUsd: 36_000_000, employment: EmploymentStatus.FUTURE_EARNINGS, fleetSlug: "newbuilds-2024" },
  { name: "MT Future II",        imo: "9924002", typeCode: "TANKER.LR2",       yearBuilt: 2024, dwt: 115_000, flagIso2: "LR", shipyardName: "Hyundai Heavy Industries",     classSocietyCode: "DNV", envScore: EnvScore.A, fmvUsd: 70_000_000, employment: EmploymentStatus.FUTURE_EARNINGS, fleetSlug: "newbuilds-2024" },
  { name: "MV Future III",       imo: "9924003", typeCode: "CONTAINER.POSTPANAMAX", yearBuilt: 2025, dwt: 75_000, flagIso2: "MH", shipyardName: "Samsung Heavy Industries", classSocietyCode: "ABS", envScore: EnvScore.A, fmvUsd: 120_000_000, employment: EmploymentStatus.FUTURE_EARNINGS, fleetSlug: "newbuilds-2024" },

  // Legacy Holdings — 3 older vessels, laid up and marked for sale.
  { name: "MV Old Mariner",      imo: "9201001", typeCode: "BULK.SUPRAMAX",    yearBuilt: 2002, dwt: 53_000, flagIso2: "PA", shipyardName: "Mitsubishi Heavy Industries",   classSocietyCode: "NK",  envScore: EnvScore.D, fmvUsd:  7_500_000, lifecycle: VesselLifecycleStatus.LAID_UP,  employment: EmploymentStatus.HISTORIC_EARNINGS, isOnSale: true, onSaleAt: new Date("2026-02-12"), fleetSlug: "legacy-holdings" },
  { name: "MT Old Trader",       imo: "9201002", typeCode: "TANKER.AFRAMAX",   yearBuilt: 2001, dwt: 110_000, flagIso2: "LR", shipyardName: "Hanjin Heavy Industries",      classSocietyCode: "KR",  envScore: EnvScore.E, fmvUsd:  6_500_000, lifecycle: VesselLifecycleStatus.LAID_UP,  employment: EmploymentStatus.HISTORIC_EARNINGS, isOnSale: true, onSaleAt: new Date("2026-01-08"), fleetSlug: "legacy-holdings" },
  { name: "MV Old Voyager",      imo: "9301003", typeCode: "BULK.HANDYMAX",    yearBuilt: 2004, dwt: 47_000, flagIso2: "MH", shipyardName: "Daewoo Shipbuilding (DSME)",    classSocietyCode: "KR",  envScore: EnvScore.D, fmvUsd:  8_000_000, lifecycle: VesselLifecycleStatus.LAID_UP,  employment: EmploymentStatus.HISTORIC_EARNINGS, isOnSale: true, onSaleAt: new Date("2026-03-22"), fleetSlug: "legacy-holdings" },

  // Q1 Review — 1 vessel flagged for analyst review (and listed for sale).
  { name: "MV Q1 Watch",         imo: "9888001", typeCode: "BULK.CAPESIZE",    yearBuilt: 2017, dwt: 182_500, flagIso2: "BS", shipyardName: "Imabari Shipbuilding",         classSocietyCode: "DNV", envScore: EnvScore.B, fmvUsd: 49_500_000, employment: EmploymentStatus.CURRENT_EARNINGS, isOnSale: true, onSaleAt: new Date("2026-04-02"), fleetSlug: "q1-review" },

  // Special Cargo Fleet — 2 RoRo/MPP
  { name: "MV Auto Carrier I",   imo: "9777001", typeCode: "RORO.PCTC",        yearBuilt: 2019, dwt: 19_000, flagIso2: "PA", shipyardName: "Tsuji Heavy Industries",        classSocietyCode: "BV",  envScore: EnvScore.B, fmvUsd: 65_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,    fleetSlug: "special-cargo" },
  { name: "MV Heavy Lifter",     imo: "9777002", typeCode: "GENERAL.HEAVY",    yearBuilt: 2015, dwt: 14_000, flagIso2: "NL", shipyardName: "Damen Shipyards",               classSocietyCode: "BV",  envScore: EnvScore.C, fmvUsd: 32_000_000, employment: EmploymentStatus.CURRENT_EARNINGS,  fleetSlug: "special-cargo" },

  // Unassigned — 4 vessels with no fleet membership (Unassigned pseudo-fleet)
  { name: "MV Unassigned One",   imo: "9520001", typeCode: "BULK.PANAMAX",     yearBuilt: 2014, dwt: 81_000, flagIso2: "PA", shipyardName: "Tsuneishi Shipbuilding",        classSocietyCode: "NK",  envScore: EnvScore.B, fmvUsd: 17_500_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: null },
  { name: "MT Unassigned Two",   imo: "9520002", typeCode: "TANKER.MR",        yearBuilt: 2015, dwt: 50_000, flagIso2: "MH", shipyardName: "HHI Mipo",                      classSocietyCode: "LR",  envScore: EnvScore.C, fmvUsd: 18_000_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: null },
  { name: "MV Unassigned Three", imo: "9520003", typeCode: "BULK.SUPRAMAX",    yearBuilt: 2011, dwt: 56_000, flagIso2: "LR", shipyardName: "Yangzijiang Shipbuilding",      classSocietyCode: "BV",  envScore: EnvScore.D, fmvUsd: 10_500_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: null },
  { name: "MV Unassigned Four",  imo: "9520004", typeCode: "BULK.HANDYSIZE",   yearBuilt: 2013, dwt: 34_500, flagIso2: "GR", shipyardName: "New Times Shipbuilding",        classSocietyCode: "CCS", envScore: EnvScore.C, fmvUsd:  9_200_000, employment: EmploymentStatus.CURRENT_EARNINGS, fleetSlug: null },
];

export type SeedDemoResult = {
  fleets: number;
  vessels: number;
  assignedToFleet: number;
  unassigned: number;
};

export async function seedDemoFleetsAndVessels(
  prisma: PrismaClient,
  orgId: string,
  ownerUserId: string,
): Promise<SeedDemoResult> {
  // 1. Fleets — keyed on (orgId, slug)
  const fleetIdBySlug = new Map<string, string>();
  for (const f of FLEETS) {
    const row = await prisma.fleet.upsert({
      where: { orgId_slug: { orgId, slug: f.slug } },
      update: {
        name: f.name,
        description: f.description,
        type: f.type,
        visibility: f.visibility,
        tag: f.tag,
        ownerUserId,
        deletedAt: null,
      },
      create: {
        orgId,
        slug: f.slug,
        name: f.name,
        description: f.description,
        type: f.type,
        visibility: f.visibility,
        tag: f.tag,
        ownerUserId,
      },
    });
    fleetIdBySlug.set(f.slug, row.id);
  }

  // 2. Resolve reference lookups once per seed run.
  const types = await prisma.vesselType.findMany();
  const typeIdByCode = new Map(types.map((t) => [t.code, t.id] as const));

  const countries = await prisma.country.findMany();
  const countryIdByIso2 = new Map(countries.map((c) => [c.iso2, c.id] as const));

  const yards = await prisma.shipyard.findMany();
  const yardIdByName = new Map(yards.map((y) => [y.name, y.id] as const));

  const cs = await prisma.classSociety.findMany();
  const classSocietyIdByCode = new Map(cs.map((c) => [c.code, c.id] as const));

  // 3. Vessels — keyed on (orgId, imo, name) per ADR-0002
  let assignedToFleet = 0;
  let unassigned = 0;

  for (const v of VESSELS) {
    const vesselTypeId = typeIdByCode.get(v.typeCode);
    if (!vesselTypeId) {
      throw new Error(`[seed] Unknown vessel type code: ${v.typeCode} (vessel ${v.name})`);
    }
    const flagCountryId = countryIdByIso2.get(v.flagIso2);
    const shipyardId = v.shipyardName ? yardIdByName.get(v.shipyardName) ?? null : null;
    const classSocietyId = v.classSocietyCode ? classSocietyIdByCode.get(v.classSocietyCode) ?? null : null;

    const vessel = await prisma.vessel.upsert({
      where: { orgId_imo_name: { orgId, imo: v.imo, name: v.name } },
      update: {
        vesselTypeId,
        flagCountryId,
        shipyardId,
        classSocietyId,
        yearBuilt: v.yearBuilt,
        dwt: v.dwt,
        envScore: v.envScore,
        currentFmv: v.fmvUsd,
        acquisitionCost: v.acquisitionCostUsd,
        outstandingLoan: v.outstandingLoanUsd,
        lifecycleStatus: v.lifecycle ?? VesselLifecycleStatus.ACTIVE,
        employmentStatus: v.employment ?? EmploymentStatus.CURRENT_EARNINGS,
        isOnSale: v.isOnSale ?? false,
        onSaleAt: v.onSaleAt ?? null,
        deletedAt: null,
      },
      create: {
        orgId,
        imo: v.imo,
        name: v.name,
        vesselTypeId,
        flagCountryId,
        shipyardId,
        classSocietyId,
        yearBuilt: v.yearBuilt,
        dwt: v.dwt,
        envScore: v.envScore,
        currentFmv: v.fmvUsd,
        acquisitionCost: v.acquisitionCostUsd,
        outstandingLoan: v.outstandingLoanUsd,
        lifecycleStatus: v.lifecycle ?? VesselLifecycleStatus.ACTIVE,
        employmentStatus: v.employment ?? EmploymentStatus.CURRENT_EARNINGS,
        isOnSale: v.isOnSale ?? false,
        onSaleAt: v.onSaleAt,
      },
    });

    // FleetVessel membership — keyed on (fleetId, vesselId)
    if (v.fleetSlug) {
      const fleetId = fleetIdBySlug.get(v.fleetSlug);
      if (!fleetId) {
        throw new Error(`[seed] Unknown fleet slug: ${v.fleetSlug} (vessel ${v.name})`);
      }
      await prisma.fleetVessel.upsert({
        where: { fleetId_vesselId: { fleetId, vesselId: vessel.id } },
        update: { deletedAt: null, addedBy: ownerUserId },
        create: { fleetId, vesselId: vessel.id, addedBy: ownerUserId },
      });
      assignedToFleet += 1;
    } else {
      unassigned += 1;
    }
  }

  return {
    fleets: FLEETS.length,
    vessels: VESSELS.length,
    assignedToFleet,
    unassigned,
  };
}
