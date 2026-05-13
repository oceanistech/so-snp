/**
 * Platform-global reference data — seeded by the dev team, never edited by
 * org admins. See ADR-0003 for the policy.
 *
 * Idempotent: every upsert is keyed on a stable natural key (iso2, code,
 * name + countryId, …) so re-running this file produces no duplicates.
 */
import {
  CounterpartyType,
  PrismaClient,
  type Country,
  type Port,
  type VesselType,
} from "@prisma/client";

/* --------------------------------------------------------------------------
 * Countries (ISO-3166). isFlagState=true marks common ship-registry flags.
 * -------------------------------------------------------------------------- */

type CountrySeed = {
  iso2: string;
  iso3: string;
  name: string;
  isFlagState?: boolean;
  flagEmoji?: string;
};

const COUNTRIES: CountrySeed[] = [
  // Open registries (most common flags for commercial fleets)
  { iso2: "LR", iso3: "LBR", name: "Liberia",            isFlagState: true,  flagEmoji: "🇱🇷" },
  { iso2: "PA", iso3: "PAN", name: "Panama",             isFlagState: true,  flagEmoji: "🇵🇦" },
  { iso2: "MH", iso3: "MHL", name: "Marshall Islands",   isFlagState: true,  flagEmoji: "🇲🇭" },
  { iso2: "BS", iso3: "BHS", name: "Bahamas",            isFlagState: true,  flagEmoji: "🇧🇸" },
  { iso2: "MT", iso3: "MLT", name: "Malta",              isFlagState: true,  flagEmoji: "🇲🇹" },
  { iso2: "CY", iso3: "CYP", name: "Cyprus",             isFlagState: true,  flagEmoji: "🇨🇾" },
  { iso2: "AG", iso3: "ATG", name: "Antigua and Barbuda", isFlagState: true, flagEmoji: "🇦🇬" },
  { iso2: "VC", iso3: "VCT", name: "Saint Vincent and the Grenadines", isFlagState: true, flagEmoji: "🇻🇨" },
  { iso2: "KY", iso3: "CYM", name: "Cayman Islands",     isFlagState: true,  flagEmoji: "🇰🇾" },
  { iso2: "GI", iso3: "GIB", name: "Gibraltar",          isFlagState: true,  flagEmoji: "🇬🇮" },

  // Traditional maritime countries
  { iso2: "GR", iso3: "GRC", name: "Greece",             isFlagState: true,  flagEmoji: "🇬🇷" },
  { iso2: "NO", iso3: "NOR", name: "Norway",             isFlagState: true,  flagEmoji: "🇳🇴" },
  { iso2: "GB", iso3: "GBR", name: "United Kingdom",     isFlagState: true,  flagEmoji: "🇬🇧" },
  { iso2: "US", iso3: "USA", name: "United States",      isFlagState: true,  flagEmoji: "🇺🇸" },
  { iso2: "JP", iso3: "JPN", name: "Japan",              isFlagState: true,  flagEmoji: "🇯🇵" },
  { iso2: "CN", iso3: "CHN", name: "China",              isFlagState: true,  flagEmoji: "🇨🇳" },
  { iso2: "KR", iso3: "KOR", name: "South Korea",        isFlagState: true,  flagEmoji: "🇰🇷" },
  { iso2: "SG", iso3: "SGP", name: "Singapore",          isFlagState: true,  flagEmoji: "🇸🇬" },
  { iso2: "HK", iso3: "HKG", name: "Hong Kong",          isFlagState: true,  flagEmoji: "🇭🇰" },
  { iso2: "DK", iso3: "DNK", name: "Denmark",            isFlagState: true,  flagEmoji: "🇩🇰" },
  { iso2: "NL", iso3: "NLD", name: "Netherlands",        isFlagState: true,  flagEmoji: "🇳🇱" },
  { iso2: "DE", iso3: "DEU", name: "Germany",            isFlagState: true,  flagEmoji: "🇩🇪" },
  { iso2: "IT", iso3: "ITA", name: "Italy",              isFlagState: true,  flagEmoji: "🇮🇹" },
  { iso2: "FR", iso3: "FRA", name: "France",             isFlagState: true,  flagEmoji: "🇫🇷" },
  { iso2: "ES", iso3: "ESP", name: "Spain",              isFlagState: true,  flagEmoji: "🇪🇸" },
  { iso2: "BE", iso3: "BEL", name: "Belgium",            isFlagState: true,  flagEmoji: "🇧🇪" },
  { iso2: "IN", iso3: "IND", name: "India",              isFlagState: true,  flagEmoji: "🇮🇳" },
  { iso2: "AE", iso3: "ARE", name: "United Arab Emirates", isFlagState: true, flagEmoji: "🇦🇪" },
  { iso2: "TR", iso3: "TUR", name: "Turkey",             isFlagState: true,  flagEmoji: "🇹🇷" },
  { iso2: "BR", iso3: "BRA", name: "Brazil",             isFlagState: false, flagEmoji: "🇧🇷" },
  { iso2: "AU", iso3: "AUS", name: "Australia",          isFlagState: false, flagEmoji: "🇦🇺" },
  { iso2: "CA", iso3: "CAN", name: "Canada",             isFlagState: false, flagEmoji: "🇨🇦" },
  { iso2: "RU", iso3: "RUS", name: "Russia",             isFlagState: false, flagEmoji: "🇷🇺" },
  { iso2: "PH", iso3: "PHL", name: "Philippines",        isFlagState: false, flagEmoji: "🇵🇭" },
  { iso2: "VN", iso3: "VNM", name: "Vietnam",            isFlagState: false, flagEmoji: "🇻🇳" },
  { iso2: "TH", iso3: "THA", name: "Thailand",           isFlagState: false, flagEmoji: "🇹🇭" },
  { iso2: "ID", iso3: "IDN", name: "Indonesia",          isFlagState: false, flagEmoji: "🇮🇩" },
  { iso2: "MY", iso3: "MYS", name: "Malaysia",           isFlagState: false, flagEmoji: "🇲🇾" },
];

/* --------------------------------------------------------------------------
 * Major maritime ports linked to their countries by iso2.
 * -------------------------------------------------------------------------- */

type PortSeed = { unlocode?: string; name: string; iso2: string };

const PORTS: PortSeed[] = [
  { unlocode: "LRMLW", name: "Monrovia",       iso2: "LR" },
  { unlocode: "PABTC", name: "Panama City",    iso2: "PA" },
  { unlocode: "PAONX", name: "Colon",          iso2: "PA" },
  { unlocode: "MHMAJ", name: "Majuro",         iso2: "MH" },
  { unlocode: "MTMLA", name: "Valletta",       iso2: "MT" },
  { unlocode: "CYLMS", name: "Limassol",       iso2: "CY" },
  { unlocode: "GRPIR", name: "Piraeus",        iso2: "GR" },
  { unlocode: "NOOSL", name: "Oslo",           iso2: "NO" },
  { unlocode: "GBLON", name: "London",         iso2: "GB" },
  { unlocode: "USNYC", name: "New York",       iso2: "US" },
  { unlocode: "USLAX", name: "Los Angeles",    iso2: "US" },
  { unlocode: "USHOU", name: "Houston",        iso2: "US" },
  { unlocode: "JPTYO", name: "Tokyo",          iso2: "JP" },
  { unlocode: "JPYOK", name: "Yokohama",       iso2: "JP" },
  { unlocode: "CNSHA", name: "Shanghai",       iso2: "CN" },
  { unlocode: "CNNGB", name: "Ningbo",         iso2: "CN" },
  { unlocode: "CNSZP", name: "Shenzhen",       iso2: "CN" },
  { unlocode: "KRPUS", name: "Busan",          iso2: "KR" },
  { unlocode: "SGSIN", name: "Singapore",      iso2: "SG" },
  { unlocode: "HKHKG", name: "Hong Kong",      iso2: "HK" },
  { unlocode: "DKCPH", name: "Copenhagen",     iso2: "DK" },
  { unlocode: "NLRTM", name: "Rotterdam",      iso2: "NL" },
  { unlocode: "DEHAM", name: "Hamburg",        iso2: "DE" },
  { unlocode: "ITGOA", name: "Genoa",          iso2: "IT" },
  { unlocode: "FRMRS", name: "Marseille",      iso2: "FR" },
  { unlocode: "ESBCN", name: "Barcelona",      iso2: "ES" },
  { unlocode: "AEDXB", name: "Dubai",          iso2: "AE" },
  { unlocode: "INNSA", name: "Nhava Sheva",    iso2: "IN" },
  { unlocode: "BRSSZ", name: "Santos",         iso2: "BR" },
  { unlocode: "AUMEL", name: "Melbourne",      iso2: "AU" },
  { unlocode: "AUPHE", name: "Port Hedland",   iso2: "AU" },
  { unlocode: "CAVAN", name: "Vancouver",      iso2: "CA" },
];

/* --------------------------------------------------------------------------
 * Vessel type hierarchy. Top-level segments first; subtypes reference parent
 * by code so the parent ID lookup happens after the parents land.
 * -------------------------------------------------------------------------- */

type VesselTypeSeed = {
  code: string;
  name: string;
  parentCode?: string;
  shortLabel?: string;
  colorHex?: string;
  minDwt?: number;
  maxDwt?: number;
  sortOrder?: number;
};

const VESSEL_TYPES: VesselTypeSeed[] = [
  // Top-level segments
  { code: "BULK",      name: "Bulk Carrier",   shortLabel: "BULK",   colorHex: "#248FF9", sortOrder: 10 },
  { code: "TANKER",    name: "Tanker",         shortLabel: "TANKER", colorHex: "#FF961F", sortOrder: 20 },
  { code: "GAS",       name: "Gas Carrier",    shortLabel: "GAS",    colorHex: "#EC298C", sortOrder: 30 },
  { code: "CONTAINER", name: "Container",      shortLabel: "CNTR",   colorHex: "#1FD6FF", sortOrder: 40 },
  { code: "OFFSHORE",  name: "Offshore",       shortLabel: "OFFSH",  colorHex: "#B870FF", sortOrder: 50 },
  { code: "GENERAL",   name: "General Cargo",  shortLabel: "CARGO",  colorHex: "#0FD29A", sortOrder: 60 },
  { code: "RORO",      name: "RoRo",           shortLabel: "RORO",   colorHex: "#F2C602", sortOrder: 70 },

  // Bulk subtypes
  { parentCode: "BULK", code: "BULK.HANDYSIZE",     name: "Handysize",     minDwt: 10_000,  maxDwt: 39_999,  sortOrder: 11 },
  { parentCode: "BULK", code: "BULK.HANDYMAX",      name: "Handymax",      minDwt: 40_000,  maxDwt: 49_999,  sortOrder: 12 },
  { parentCode: "BULK", code: "BULK.SUPRAMAX",      name: "Supramax",      minDwt: 50_000,  maxDwt: 59_999,  sortOrder: 13 },
  { parentCode: "BULK", code: "BULK.ULTRAMAX",      name: "Ultramax",      minDwt: 60_000,  maxDwt: 69_999,  sortOrder: 14 },
  { parentCode: "BULK", code: "BULK.PANAMAX",       name: "Panamax",       minDwt: 70_000,  maxDwt: 84_999,  sortOrder: 15 },
  { parentCode: "BULK", code: "BULK.KAMSARMAX",     name: "Kamsarmax",     minDwt: 80_000,  maxDwt: 89_999,  sortOrder: 16 },
  { parentCode: "BULK", code: "BULK.POSTPANAMAX",   name: "Post-Panamax",  minDwt: 85_000,  maxDwt: 119_999, sortOrder: 17 },
  { parentCode: "BULK", code: "BULK.CAPESIZE",      name: "Capesize",      minDwt: 120_000, maxDwt: 199_999, sortOrder: 18 },
  { parentCode: "BULK", code: "BULK.VLOC",          name: "VLOC",          minDwt: 200_000,                  sortOrder: 19 },

  // Tanker subtypes
  { parentCode: "TANKER", code: "TANKER.MR",       name: "MR Tanker",      minDwt: 40_000,  maxDwt: 54_999,  sortOrder: 21 },
  { parentCode: "TANKER", code: "TANKER.LR1",      name: "LR1",            minDwt: 55_000,  maxDwt: 79_999,  sortOrder: 22 },
  { parentCode: "TANKER", code: "TANKER.LR2",      name: "LR2",            minDwt: 80_000,  maxDwt: 119_999, sortOrder: 23 },
  { parentCode: "TANKER", code: "TANKER.AFRAMAX",  name: "Aframax",        minDwt: 80_000,  maxDwt: 119_999, sortOrder: 24 },
  { parentCode: "TANKER", code: "TANKER.SUEZMAX",  name: "Suezmax",        minDwt: 120_000, maxDwt: 199_999, sortOrder: 25 },
  { parentCode: "TANKER", code: "TANKER.VLCC",     name: "VLCC",           minDwt: 200_000, maxDwt: 319_999, sortOrder: 26 },
  { parentCode: "TANKER", code: "TANKER.ULCC",     name: "ULCC",           minDwt: 320_000,                  sortOrder: 27 },

  // Gas subtypes
  { parentCode: "GAS", code: "GAS.MGC",            name: "MGC",            sortOrder: 31 },
  { parentCode: "GAS", code: "GAS.LGC",            name: "LGC",            sortOrder: 32 },
  { parentCode: "GAS", code: "GAS.VLGC",           name: "VLGC",           sortOrder: 33 },
  { parentCode: "GAS", code: "GAS.LNG",            name: "LNG Conventional", sortOrder: 34 },
  { parentCode: "GAS", code: "GAS.FSRU",           name: "LNG FSRU",       sortOrder: 35 },

  // Container subtypes
  { parentCode: "CONTAINER", code: "CONTAINER.FEEDER",      name: "Feeder",       sortOrder: 41 },
  { parentCode: "CONTAINER", code: "CONTAINER.SUBPANAMAX",  name: "Sub-Panamax",  sortOrder: 42 },
  { parentCode: "CONTAINER", code: "CONTAINER.PANAMAX",     name: "Panamax",      sortOrder: 43 },
  { parentCode: "CONTAINER", code: "CONTAINER.POSTPANAMAX", name: "Post-Panamax", sortOrder: 44 },
  { parentCode: "CONTAINER", code: "CONTAINER.ULCV",        name: "ULCV",         sortOrder: 45 },

  // Offshore subtypes
  { parentCode: "OFFSHORE", code: "OFFSHORE.AHTS",      name: "AHTS",       sortOrder: 51 },
  { parentCode: "OFFSHORE", code: "OFFSHORE.PSV",       name: "PSV",        sortOrder: 52 },
  { parentCode: "OFFSHORE", code: "OFFSHORE.DRILLSHIP", name: "Drillship",  sortOrder: 53 },
  { parentCode: "OFFSHORE", code: "OFFSHORE.JACKUP",    name: "Jack-up",    sortOrder: 54 },
  { parentCode: "OFFSHORE", code: "OFFSHORE.SEMISUB",   name: "Semi-sub",   sortOrder: 55 },
  { parentCode: "OFFSHORE", code: "OFFSHORE.FPSO",      name: "FPSO",       sortOrder: 56 },

  // General cargo subtypes
  { parentCode: "GENERAL", code: "GENERAL.MPP",      name: "MPP",         sortOrder: 61 },
  { parentCode: "GENERAL", code: "GENERAL.HEAVY",    name: "Heavy Lift",  sortOrder: 62 },
  { parentCode: "GENERAL", code: "GENERAL.REEFER",   name: "Reefer",      sortOrder: 63 },

  // RoRo subtypes
  { parentCode: "RORO", code: "RORO.PCTC",    name: "PCTC",              sortOrder: 71 },
  { parentCode: "RORO", code: "RORO.PCC",     name: "Pure Car Carrier",  sortOrder: 72 },
  { parentCode: "RORO", code: "RORO.CONRO",   name: "ConRo",             sortOrder: 73 },
];

/* --------------------------------------------------------------------------
 * Shipyards — top yards by recent newbuild deliveries.
 * -------------------------------------------------------------------------- */

type ShipyardSeed = { name: string; iso2?: string; city?: string };

const SHIPYARDS: ShipyardSeed[] = [
  { name: "Hyundai Heavy Industries",       iso2: "KR", city: "Ulsan" },
  { name: "HHI Mipo",                       iso2: "KR", city: "Ulsan" },
  { name: "Samsung Heavy Industries",       iso2: "KR", city: "Geoje" },
  { name: "Daewoo Shipbuilding (DSME)",     iso2: "KR", city: "Geoje" },
  { name: "Imabari Shipbuilding",           iso2: "JP", city: "Imabari" },
  { name: "Japan Marine United (JMU)",      iso2: "JP", city: "Yokohama" },
  { name: "Tsuneishi Shipbuilding",         iso2: "JP", city: "Fukuyama" },
  { name: "Mitsubishi Heavy Industries",    iso2: "JP", city: "Nagasaki" },
  { name: "Oshima Shipbuilding",            iso2: "JP", city: "Saikai" },
  { name: "COSCO Shipping Heavy Industry",  iso2: "CN", city: "Shanghai" },
  { name: "Hudong-Zhonghua",                iso2: "CN", city: "Shanghai" },
  { name: "Jiangsu New Yangzi",             iso2: "CN", city: "Jingjiang" },
  { name: "Yangzijiang Shipbuilding",       iso2: "CN", city: "Jiangyin" },
  { name: "New Times Shipbuilding",         iso2: "CN", city: "Jingjiang" },
  { name: "NACKS (Nantong COSCO KHI)",      iso2: "CN", city: "Nantong" },
  { name: "Fincantieri",                    iso2: "IT", city: "Trieste" },
  { name: "Meyer Werft",                    iso2: "DE", city: "Papenburg" },
  { name: "Damen Shipyards",                iso2: "NL", city: "Gorinchem" },
  { name: "Hanjin Heavy Industries",        iso2: "KR", city: "Busan" },
  { name: "Tsuji Heavy Industries",         iso2: "CN", city: "Jiangsu" },
];

/* --------------------------------------------------------------------------
 * Classification societies — IACS members plus a few non-IACS.
 * -------------------------------------------------------------------------- */

type ClassSocietySeed = {
  code: string;
  name: string;
  shortName?: string;
  iacsMember: boolean;
  websiteUrl?: string;
};

const CLASS_SOCIETIES: ClassSocietySeed[] = [
  { code: "DNV",  name: "DNV",                                shortName: "DNV",            iacsMember: true,  websiteUrl: "https://www.dnv.com" },
  { code: "LR",   name: "Lloyd's Register",                   shortName: "Lloyd's",        iacsMember: true,  websiteUrl: "https://www.lr.org" },
  { code: "ABS",  name: "American Bureau of Shipping",        shortName: "ABS",            iacsMember: true,  websiteUrl: "https://ww2.eagle.org" },
  { code: "BV",   name: "Bureau Veritas",                     shortName: "BV",             iacsMember: true,  websiteUrl: "https://marine-offshore.bureauveritas.com" },
  { code: "NK",   name: "Nippon Kaiji Kyokai (ClassNK)",      shortName: "ClassNK",        iacsMember: true,  websiteUrl: "https://www.classnk.or.jp" },
  { code: "CCS",  name: "China Classification Society",       shortName: "CCS",            iacsMember: true,  websiteUrl: "https://www.ccs.org.cn" },
  { code: "KR",   name: "Korean Register",                    shortName: "KR",             iacsMember: true,  websiteUrl: "https://www.krs.co.kr" },
  { code: "RINA", name: "RINA",                               shortName: "RINA",           iacsMember: true,  websiteUrl: "https://www.rina.org" },
  { code: "RS",   name: "Russian Maritime Register of Shipping", shortName: "RMRS",        iacsMember: true,  websiteUrl: "https://rs-class.org" },
  { code: "IRS",  name: "Indian Register of Shipping",        shortName: "IRS",            iacsMember: true,  websiteUrl: "https://www.irclass.org" },
  { code: "PRS",  name: "Polish Register of Shipping",        shortName: "PRS",            iacsMember: true,  websiteUrl: "https://www.prs.pl" },
  { code: "CRS",  name: "Croatian Register of Shipping",      shortName: "CRS",            iacsMember: false, websiteUrl: "https://www.crs.hr" },
  { code: "TASN", name: "Tasneef",                            shortName: "Tasneef",        iacsMember: false, websiteUrl: "https://www.tasneef.ae" },
];

/* --------------------------------------------------------------------------
 * Engine makers + models.
 * -------------------------------------------------------------------------- */

type EngineSeed = { maker: string; models: string[] };

const ENGINES: EngineSeed[] = [
  { maker: "MAN B&W",      models: ["6S60ME-C8", "6G60ME-C9.5", "7S70ME-C8", "8G80ME-C9.5", "6G70ME-C9.5"] },
  { maker: "Wärtsilä",     models: ["RT-flex96C", "RT-flex68D", "X62", "X72", "X82-B"] },
  { maker: "WinGD",        models: ["X62-B", "X72DF", "X82", "X92DF"] },
  { maker: "Mitsubishi UE", models: ["UEC60LSII", "UEC68LSE", "UEC85LSE"] },
];

/* --------------------------------------------------------------------------
 * Counterparties — globally seeded well-known firms. orgId=null marks them
 * as platform-global.
 * -------------------------------------------------------------------------- */

type CounterpartySeed = { name: string; type: CounterpartyType; iso2?: string };

const COUNTERPARTIES: CounterpartySeed[] = [
  { name: "Cargill",          type: CounterpartyType.CHARTERER, iso2: "US" },
  { name: "Shell",            type: CounterpartyType.CHARTERER, iso2: "GB" },
  { name: "BP",               type: CounterpartyType.CHARTERER, iso2: "GB" },
  { name: "Vitol",            type: CounterpartyType.CHARTERER, iso2: "CH" },
  { name: "Trafigura",        type: CounterpartyType.CHARTERER, iso2: "SG" },
  { name: "Glencore",         type: CounterpartyType.CHARTERER, iso2: "CH" },
  { name: "Vale",             type: CounterpartyType.CHARTERER, iso2: "BR" },
  { name: "BHP",              type: CounterpartyType.CHARTERER, iso2: "AU" },
  { name: "Rio Tinto",        type: CounterpartyType.CHARTERER, iso2: "AU" },
  { name: "ADM",              type: CounterpartyType.CHARTERER, iso2: "US" },
  { name: "Bunge",            type: CounterpartyType.CHARTERER, iso2: "US" },
  { name: "Louis Dreyfus",    type: CounterpartyType.CHARTERER, iso2: "FR" },
  { name: "Mercuria",         type: CounterpartyType.CHARTERER, iso2: "CH" },
  { name: "Gunvor",           type: CounterpartyType.CHARTERER, iso2: "CH" },
  { name: "COSCO",            type: CounterpartyType.OPERATOR,  iso2: "CN" },
  { name: "NYK Line",         type: CounterpartyType.OPERATOR,  iso2: "JP" },
  { name: "Oldendorff Carriers", type: CounterpartyType.OPERATOR, iso2: "DE" },
  { name: "Pacific Basin",    type: CounterpartyType.OPERATOR,  iso2: "HK" },
  { name: "Klaveness",        type: CounterpartyType.OPERATOR,  iso2: "NO" },
  { name: "Maersk Tankers",   type: CounterpartyType.OPERATOR,  iso2: "DK" },
];

/* --------------------------------------------------------------------------
 * Seeder entry point.
 * -------------------------------------------------------------------------- */

export type SeedReferenceResult = {
  countries: number;
  ports: number;
  vesselTypes: number;
  shipyards: number;
  classSocieties: number;
  engineMakers: number;
  engineModels: number;
  counterparties: number;
};

export async function seedReferenceData(
  prisma: PrismaClient,
): Promise<SeedReferenceResult> {
  // Countries — natural key is iso2
  const countryByIso2 = new Map<string, Country>();
  for (const c of COUNTRIES) {
    const row = await prisma.country.upsert({
      where: { iso2: c.iso2 },
      update: { iso3: c.iso3, name: c.name, isFlagState: c.isFlagState ?? false, flagEmoji: c.flagEmoji },
      create: { iso2: c.iso2, iso3: c.iso3, name: c.name, isFlagState: c.isFlagState ?? false, flagEmoji: c.flagEmoji },
    });
    countryByIso2.set(c.iso2, row);
  }

  // Add CH (Switzerland) for counterparty seed; not a flag state.
  if (!countryByIso2.has("CH")) {
    const ch = await prisma.country.upsert({
      where: { iso2: "CH" },
      update: { iso3: "CHE", name: "Switzerland", isFlagState: false, flagEmoji: "🇨🇭" },
      create: { iso2: "CH", iso3: "CHE", name: "Switzerland", isFlagState: false, flagEmoji: "🇨🇭" },
    });
    countryByIso2.set("CH", ch);
  }

  // Ports — natural key is (name, countryId)
  const portByName = new Map<string, Port>();
  for (const p of PORTS) {
    const country = countryByIso2.get(p.iso2);
    if (!country) continue;
    const row = await prisma.port.upsert({
      where: { name_countryId: { name: p.name, countryId: country.id } },
      update: { unlocode: p.unlocode },
      create: { name: p.name, countryId: country.id, unlocode: p.unlocode },
    });
    portByName.set(p.name, row);
  }

  // Vessel types — two-pass to resolve parents
  const typeByCode = new Map<string, VesselType>();
  for (const t of VESSEL_TYPES.filter((t) => !t.parentCode)) {
    const row = await prisma.vesselType.upsert({
      where: { code: t.code },
      update: { name: t.name, shortLabel: t.shortLabel, colorHex: t.colorHex, sortOrder: t.sortOrder ?? 0 },
      create: { code: t.code, name: t.name, shortLabel: t.shortLabel, colorHex: t.colorHex, sortOrder: t.sortOrder ?? 0 },
    });
    typeByCode.set(t.code, row);
  }
  for (const t of VESSEL_TYPES.filter((t) => t.parentCode)) {
    const parent = typeByCode.get(t.parentCode!);
    if (!parent) continue;
    const row = await prisma.vesselType.upsert({
      where: { code: t.code },
      update: {
        name: t.name,
        parentId: parent.id,
        minDwt: t.minDwt,
        maxDwt: t.maxDwt,
        sortOrder: t.sortOrder ?? 0,
      },
      create: {
        code: t.code,
        name: t.name,
        parentId: parent.id,
        minDwt: t.minDwt,
        maxDwt: t.maxDwt,
        sortOrder: t.sortOrder ?? 0,
      },
    });
    typeByCode.set(t.code, row);
  }

  // Shipyards — natural key is (name, countryId). Branch on countryId presence
  // because Prisma's compound key includes countryId and SQL nulls don't
  // dedupe in unique constraints.
  for (const y of SHIPYARDS) {
    const country = y.iso2 ? countryByIso2.get(y.iso2) : null;
    if (country) {
      await prisma.shipyard.upsert({
        where: { name_countryId: { name: y.name, countryId: country.id } },
        update: { city: y.city },
        create: { name: y.name, countryId: country.id, city: y.city },
      });
    } else {
      const existing = await prisma.shipyard.findFirst({
        where: { name: y.name, countryId: null },
      });
      if (existing) {
        await prisma.shipyard.update({ where: { id: existing.id }, data: { city: y.city } });
      } else {
        await prisma.shipyard.create({ data: { name: y.name, city: y.city } });
      }
    }
  }

  // Class societies — natural key is code
  for (const c of CLASS_SOCIETIES) {
    await prisma.classSociety.upsert({
      where: { code: c.code },
      update: { name: c.name, shortName: c.shortName, iacsMember: c.iacsMember, websiteUrl: c.websiteUrl },
      create: { code: c.code, name: c.name, shortName: c.shortName, iacsMember: c.iacsMember, websiteUrl: c.websiteUrl },
    });
  }

  // Engine makers + models — natural key is name (maker) and (makerId, name) (model)
  let engineModelCount = 0;
  for (const e of ENGINES) {
    const maker = await prisma.engineMaker.upsert({
      where: { name: e.maker },
      update: {},
      create: { name: e.maker },
    });
    for (const m of e.models) {
      await prisma.engineModel.upsert({
        where: { makerId_name: { makerId: maker.id, name: m } },
        update: {},
        create: { makerId: maker.id, name: m },
      });
      engineModelCount += 1;
    }
  }

  // Counterparties — global (orgId=null). Use findFirst+create rather than
  // upsert because Postgres unique constraints don't dedupe across NULLs.
  for (const cp of COUNTERPARTIES) {
    const country = cp.iso2 ? countryByIso2.get(cp.iso2) : null;
    const existing = await prisma.counterparty.findFirst({
      where: { orgId: null, name: cp.name },
    });
    if (existing) {
      await prisma.counterparty.update({
        where: { id: existing.id },
        data: { type: cp.type, countryId: country?.id },
      });
    } else {
      await prisma.counterparty.create({
        data: { name: cp.name, type: cp.type, countryId: country?.id },
      });
    }
  }

  return {
    countries: countryByIso2.size,
    ports: portByName.size,
    vesselTypes: typeByCode.size,
    shipyards: SHIPYARDS.length,
    classSocieties: CLASS_SOCIETIES.length,
    engineMakers: ENGINES.length,
    engineModels: engineModelCount,
    counterparties: COUNTERPARTIES.length,
  };
}
