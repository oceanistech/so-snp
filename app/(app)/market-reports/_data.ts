/**
 * Mock data for the Market Reports page — colocated with the route so it
 * stays close to the consumer but lives outside `page.tsx` so the data does
 * NOT ship in the client bundle. Imported only by the server-rendered
 * `page.tsx`; React Server Components serialize the output instead of the
 * raw arrays, dramatically reducing the JS payload sent to the browser.
 */

import type { Report } from "@/components/app/report-card";

/* ── Tab 1 · All Reports ────────────────────────────────────────── */

export const ALL_REPORTS: Report[] = [
  {
    id: "wsp-w12-2026",
    type: "Data Digest",
    date: "Mar 22",
    title: "Weekly S&P Transaction Digest — W12 2026",
    summary:
      "16 S&P transactions recorded this week, 9 dry bulk and 7 tanker. Capesize values firm with 4 sales above $30M, average age 8.2 years.",
    tags: ["Dry Bulk", "Tanker", "S&P"],
  },
  {
    id: "lng-postwinter-2026",
    type: "Analysis",
    date: "Mar 18",
    title: "LNG Carrier Values: Post-Winter Correction",
    summary:
      "LNG carrier spot values have softened 12% from January peaks as seasonal demand normalises. Values remain elevated vs 5-year average at $172M for a 2020-built TFDE.",
    tags: ["LNG"],
  },
  {
    id: "sofr-sensitivity-2026",
    type: "Alert",
    date: "Mar 15",
    title: "SOFR Sensitivity: Impact on Leveraged Fleet Owners",
    summary:
      "With SOFR holding above 5.3%, highly leveraged owners face meaningful margin compression. We identify 8 vessel classes most exposed to refinancing risk in 2026.",
    tags: ["Macro", "Finance"],
  },
  {
    id: "black-sea-grain-2026",
    type: "Quarterly Outlook",
    date: "Mar 10",
    title: "Black Sea Grain Corridor: Fleet Implications 2026",
    summary:
      "The resumed Black Sea grain corridor has lifted Supramax demand by 14% in Q1. We update our net fleet model and revise Supramax TCE forecasts upward.",
    tags: ["Dry Bulk", "Supramax"],
  },
  {
    id: "euribor-stress-2026",
    type: "Analysis",
    date: "Mar 5",
    title: "EURIBOR Transition: EUR Loan Portfolio Stress Test",
    summary:
      "This analysis stress-tests EUR-denominated ship finance portfolios against 3 rate scenarios. Results suggest 15% of EUR loans would breach covenants in a +100bp shock.",
    tags: ["Macro", "Finance"],
  },
  {
    id: "monthly-net-fleet-feb-2026",
    type: "Data Digest",
    date: "Feb 28",
    title: "Monthly Net Fleet Report — February 2026",
    summary:
      "6 Capesize demolitions and 4 VLOC deliveries in February. Net Capesize fleet grew +320K DWT. Orderbook-to-fleet ratio steady at 8.6%.",
    tags: ["Dry Bulk"],
  },
  {
    id: "tanker-q2-preview-2026",
    type: "Quarterly Outlook",
    date: "Feb 20",
    title: "Tanker Market Q2 2026 Preview",
    summary:
      "VLCC rates recovering after Q1 softness driven by higher OPEC+ compliance. We forecast VLCC TCE of $38K–$45K/day for Q2, supported by Atlantic arbitrage flows.",
    tags: ["Tanker", "VLCC"],
  },
  {
    id: "cii-compliance-2025-review",
    type: "Analysis",
    date: "Feb 15",
    title: "CII Compliance Review: 2025 Fleet Performance",
    summary:
      "Analysis of 1,200 Signal Ocean-monitored vessels reveals 18% failed to achieve CII C or better in 2025. Capesize and older VLCC sub-fleets are most at risk.",
    tags: ["ESG", "CII"],
  },
];

/* ── Tab 2 · S&P ────────────────────────────────────────────────── */

export const SP_REPORTS: Report[] = [
  {
    id: "sp-w12-2026",
    type: "Data Digest",
    date: "Mar 22",
    title: "Weekly S&P Digest — W12 2026",
    summary:
      "16 transactions recorded this week. Capesize values firm at $30–34M for 2018–2020-built vessels. Tanker S&P activity subdued with 4 transactions, MR and Aframax segments active.",
    tags: ["Dry Bulk", "Tanker"],
  },
  {
    id: "black-sea-grain-sp-2026",
    type: "Analysis",
    date: "Mar 10",
    title: "Black Sea Grain: Fleet Implications for S&P Market",
    summary:
      "Resumed Black Sea grain corridor has increased demand for Supramax and Handymax, pushing up secondhand values 6–9% since January. Net fleet analysis and updated valuation models.",
    tags: ["Dry Bulk"],
  },
  {
    id: "sp-2026-buyer-seller",
    type: "Quarterly Outlook",
    date: "Feb 20",
    title: "2026 S&P Market Outlook: Buyer's or Seller's Market?",
    summary:
      "With freight rates moderating and CII/EEXI pressure accelerating fleet renewal, we assess whether buyers or sellers hold the advantage in 2026 across Capesize, VLCC and Container segments.",
    tags: ["All Segments"],
  },
  {
    id: "monthly-net-fleet-feb-2026-sp",
    type: "Data Digest",
    date: "Feb 28",
    title: "Monthly Net Fleet Report — February 2026",
    summary:
      "6 Capesize demolitions and 4 VLOC deliveries in February. Net Capesize fleet grew +320K DWT. Orderbook-to-fleet ratio steady at 8.6% — below 5-year average.",
    tags: ["Dry Bulk"],
  },
  {
    id: "capesize-secondhand-jan-2026",
    type: "Analysis",
    date: "Jan 15",
    title: "Capesize Secondhand Values: Post-Holiday Recovery",
    summary:
      "Post-CNY activity surge drives Capesize values up 4.2% in January. We examine the structural drivers of current valuation levels and compare to 2020–2023 cycle peaks.",
    tags: ["Dry Bulk"],
  },
  {
    id: "lng-listings-jan-2026",
    type: "Alert",
    date: "Jan 8",
    title: "LNG Carrier Market: 12 Vessels Listed for Sale Simultaneously",
    summary:
      "Unusual concentration of LNG carrier listings creates buyer's market conditions in the TFDE segment. Values soften 3.1% week-on-week. Signal Ocean identifies potential buying opportunity.",
    tags: ["LNG"],
  },
];

/* ── Tab 3 · Freight ────────────────────────────────────────────── */

export const FREIGHT_REPORTS: Report[] = [
  {
    id: "tanker-q2-vlcc-2026",
    type: "Quarterly Outlook",
    date: "Mar 18",
    title: "Tanker Q2 2026 Preview: VLCC Recovery Underway",
    summary:
      "VLCC rates recovering after Q1 softness driven by higher OPEC+ compliance. We forecast VLCC TCE of $38K–$45K/day for Q2, supported by Atlantic arbitrage flows and SPR rebuilding.",
    tags: ["Tanker", "VLCC"],
  },
  {
    id: "bdi-90d-outlook-2026",
    type: "Analysis",
    date: "Mar 5",
    title: "Baltic Dry Index: Key Drivers and 90-Day Outlook",
    summary:
      "BDI averaged 1,247 in Q1 — 14% below Q4 2025. We model three scenarios for Q2 based on Chinese steel demand, Australian exports and fleet utilisation data.",
    tags: ["Dry Bulk"],
  },
  {
    id: "freight-w7-2026",
    type: "Data Digest",
    date: "Feb 15",
    title: "Weekly Freight Rate Digest — W7 2026",
    summary:
      "Comprehensive weekly rate digest covering Capesize, Panamax, Supramax, Handysize, VLCC, Suezmax, Aframax, and MR tanker segments. Spot and TC rates included.",
    tags: ["All Segments"],
  },
  {
    id: "supramax-h1-2026",
    type: "Quarterly Outlook",
    date: "Jan 30",
    title: "Supramax Rate Outlook H1 2026",
    summary:
      "Black Sea revival and Indonesian coal export growth underpin Supramax demand. H1 TCE forecast range $12,000–$16,000/day. Key risk: grain corridor sustainability post Q2 ceasefire review.",
    tags: ["Dry Bulk"],
  },
  {
    id: "container-redsea-2026",
    type: "Analysis",
    date: "Jan 20",
    title: "Container Freight: Red Sea Rerouting Demand Impact",
    summary:
      "Red Sea rerouting adds 14 days to Asia–Europe voyages, absorbing 18% of effective container capacity. We estimate a 22% uplift to spot rates in Q1, with normalisation expected by Q3 2026.",
    tags: ["Container"],
  },
  {
    id: "pacific-congestion-dec-2025",
    type: "Alert",
    date: "Dec 15, 2025",
    title: "Pacific Basin Congestion Warning: Panamax Premium",
    summary:
      "Port congestion at key Pacific loading ports driving Panamax spot rates 18% above seasonal average. Signal Ocean vessel tracking identifies 34 vessels at anchor, extending load wait times to 9 days.",
    tags: ["Dry Bulk"],
  },
];

/* ── Tab 4 · ESG ────────────────────────────────────────────────── */

export const ESG_REPORTS: Report[] = [
  {
    id: "cii-compliance-2025",
    type: "Analysis",
    date: "Feb 15",
    title: "CII Compliance Review: 2025 Fleet Performance",
    summary:
      "Analysis of 1,200 Signal Ocean-monitored vessels reveals 18% failed to achieve CII C or better in 2025. Capesize and older VLCC sub-fleets are most at risk. Corrective action plan uptake remains low.",
    tags: ["ESG", "CII"],
  },
  {
    id: "imo-2030-readiness",
    type: "Quarterly Outlook",
    date: "Jan 25",
    title: "IMO 2030 Decarbonisation: Fleet Readiness Assessment",
    summary:
      "Only 22% of the global fleet is on a trajectory compatible with IMO's 2030 40% reduction target. We model the investment required and identify early-mover advantages in green financing.",
    tags: ["ESG"],
  },
  {
    id: "eu-ets-2025-impact",
    type: "Analysis",
    date: "Dec 2025",
    title: "EU ETS 2025 Impact: Winners and Losers in Shipping",
    summary:
      "Full-year EU ETS 2025 compliance analysis: total liability €1.2B across covered vessels. Operators with modern fleets and efficient routing show 28% lower per-voyage costs than market average.",
    tags: ["ESG", "Regulation"],
  },
  {
    id: "ghg-monthly-nov-2025",
    type: "Data Digest",
    date: "Nov 2025",
    title: "Monthly GHG Emissions Fleet Report — November 2025",
    summary:
      "Fleet-wide GHG emissions tracking for November 2025: total CO₂ 42,180 MT, 3.1% below trajectory. Scope 1 intensity 8.7 g/DWTnm. 4 vessels flagged for corrective review.",
    tags: ["ESG"],
  },
  {
    id: "alt-fuels-2025",
    type: "Research",
    date: "Oct 2025",
    title: "Alternative Fuels Adoption: Progress & Barriers in 2025",
    summary:
      "LNG, methanol and ammonia-ready vessels now represent 14% of orderbook. However, fuel availability and bunkering infrastructure remain critical barriers. Full survey of 200 operators and port authorities.",
    tags: ["ESG"],
  },
  {
    id: "eexi-noncompliance-sep-2025",
    type: "Alert",
    date: "Sep 2025",
    title: "EEXI Non-Compliance: 120 Vessels Identified",
    summary:
      "Signal Ocean analysis identifies 120 vessels across bulk, tanker and container segments that remain non-compliant with EEXI requirements. EPL implementation deadlines now overdue for 43 vessels.",
    tags: ["ESG", "Regulation"],
  },
];

/* ── Tab 5 · Macro ──────────────────────────────────────────────── */

export const MACRO_REPORTS: Report[] = [
  {
    id: "sofr-sensitivity-mar-2026",
    type: "Alert",
    date: "Mar 15",
    title: "SOFR Sensitivity: Impact on Leveraged Fleet Owners",
    summary:
      "With SOFR holding above 5.3%, highly leveraged owners face meaningful margin compression. We identify 8 vessel classes most exposed to refinancing risk in 2026 and model debt service coverage ratios.",
    tags: ["Finance", "Macro"],
  },
  {
    id: "euribor-stress-mar-2026",
    type: "Analysis",
    date: "Mar 5",
    title: "EURIBOR Transition: EUR Loan Portfolio Stress Test",
    summary:
      "This analysis stress-tests EUR-denominated ship finance portfolios against 3 rate scenarios. Results suggest 15% of EUR loans would breach covenants in a +100bp shock.",
    tags: ["Finance"],
  },
  {
    id: "china-trade-2026",
    type: "Quarterly Outlook",
    date: "Feb 10",
    title: "China Trade Flows 2026: Shipping Demand Implications",
    summary:
      "Chinese iron ore and coal import forecasts revised upward following January stimulus announcement. We quantify incremental tonne-mile demand across Capesize, Panamax and VLCC.",
    tags: ["Macro"],
  },
  {
    id: "usd-strength-jan-2026",
    type: "Analysis",
    date: "Jan 20",
    title: "USD Strength Impact on USD-Denominated Ship Finance",
    summary:
      "A strong USD compresses non-USD operator margins while benefiting USD-revenue earners. Cross-currency analysis of 340 ship finance transactions identifies winners and losers in the current FX environment.",
    tags: ["Finance"],
  },
  {
    id: "geopolitical-risk-dec-2025",
    type: "Research",
    date: "Dec 2025",
    title: "Geopolitical Risk Premium in Ship Values 2025",
    summary:
      "Red Sea rerouting, Black Sea restrictions and sanctions screening have added an estimated 4–9% geopolitical risk premium to secondhand values in affected trade lanes. Quantitative model and case studies.",
    tags: ["Macro"],
  },
  {
    id: "global-finance-q4-2025",
    type: "Quarterly Outlook",
    date: "Nov 2025",
    title: "Global Fleet Financing Conditions Report — Q4 2025",
    summary:
      "Comprehensive review of ship finance market conditions in Q4 2025: loan spreads, LTV trends, green shipping finance uptake, and outlook for 2026 lending appetite from European and Asian banks.",
    tags: ["Finance"],
  },
];

/* ── Tab 6 · Saved ──────────────────────────────────────────────── */

export const SAVED_REPORTS: Report[] = [
  {
    id: "saved-tanker-q2-2026",
    type: "Quarterly Outlook",
    date: "Mar 18",
    title: "Tanker Q2 2026 Preview: VLCC Recovery Underway",
    summary:
      "VLCC rates recovering after Q1 softness driven by higher OPEC+ compliance. Forecast VLCC TCE $38K–$45K/day for Q2.",
    tags: ["Tanker", "VLCC"],
    saved: true,
  },
  {
    id: "saved-cii-compliance-2025",
    type: "Analysis",
    date: "Feb 15",
    title: "CII Compliance Review: 2025 Fleet Performance",
    summary:
      "Analysis of 1,200 Signal Ocean-monitored vessels: 18% failed CII C or better. Capesize and older VLCC most at risk.",
    tags: ["ESG", "CII"],
    saved: true,
  },
  {
    id: "saved-sofr-sensitivity",
    type: "Alert",
    date: "Mar 15",
    title: "SOFR Sensitivity: Impact on Leveraged Fleet Owners",
    summary:
      "SOFR above 5.3% creates margin compression. 8 vessel classes identified with highest refinancing risk in 2026.",
    tags: ["Finance", "Macro"],
    saved: true,
  },
];

export const SAVED_SEARCHES: Array<{
  name: string;
  filters: string;
  created: string;
  lastMatch: string;
}> = [
  { name: "Capesize S&P Weekly",   filters: "Type: Data Digest · Segment: Dry Bulk · Period: Last 7D", created: "Jan 10, 2026", lastMatch: "Mar 22, 2026" },
  { name: "ESG Regulation Alerts", filters: "Type: Alert · Segment: ESG · Period: All Time",          created: "Dec 2, 2025",  lastMatch: "Sep 15, 2025" },
  { name: "VLCC Freight Outlooks", filters: "Type: Outlook · Segment: Tanker · Keyword: VLCC",        created: "Nov 8, 2025",  lastMatch: "Mar 18, 2026" },
];

export const SUBSCRIPTIONS: Array<{
  title: string;
  cadence: string;
  status: "Active" | "Paused";
}> = [
  { title: "S&P Weekly Digest",     cadence: "Every Monday · Email + in-app", status: "Active" },
  { title: "ESG Monthly Report",    cadence: "1st of each month · Email",     status: "Active" },
  { title: "Tanker Market Outlook", cadence: "Quarterly · Email + in-app",    status: "Paused" },
];

export const TYPE_OPTIONS = [
  "All Types",
  "Quarterly Outlook",
  "Analysis",
  "Data Digest",
  "Alert",
  "Research",
] as const;

export const RANGE_OPTIONS = [
  "Last 7D",
  "Last 30D",
  "Last 90D",
  "All Time",
] as const;
