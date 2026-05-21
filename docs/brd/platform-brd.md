# Signal S&P — Platform BRD

**Status:** Draft — being finalised
**Owner:** Web platform team
**Codebase:** `./web/` (Next.js + Prisma + PostgreSQL)
**Source artifacts:** `./brd.md` (original business document, read-only) and `./html/` (visual prototype, read-only)

---

## Table of Contents

1. [Purpose & Relationship to Other Documents](#1-purpose--relationship-to-other-documents)
2. [Conventions](#2-conventions)
3. [Status & Phase Legend](#3-status--phase-legend)
4. [Technology Stack](#4-technology-stack)
5. [Reconciliation Notes — Prototype vs Original BRD](#5-reconciliation-notes--prototype-vs-original-brd)
6. [Module Map](#6-module-map)
7. [Module Roadmap Snapshot](#7-module-roadmap-snapshot)
8. Foundations
   - [F1. Authentication & Organisation Setup](#f1-authentication--organisation-setup)
   - [F2. App Shell & Navigation](#f2-app-shell--navigation)
   - [F3. Design System & Component Library](#f3-design-system--component-library)
   - [F4. Data Model & Persistence](#f4-data-model--persistence)
   - [F5. External Integrations & Market Data Layer](#f5-external-integrations--market-data-layer)
   - [F6. Notifications & Mail Subsystem](#f6-notifications--mail-subsystem)
   - [F7. Exports, Reporting & PDF](#f7-exports-reporting--pdf)
   - [F8. Observability, Audit & Security](#f8-observability-audit--security)
9. Modules — Portfolio Layer
   - [M01. Dashboard](#m01-dashboard)
   - [M02. My Fleet (FleetSpace)](#m02-my-fleet-fleetspace)
   - [M03. Add Vessel & Create Fleet](#m03-add-vessel--create-fleet)
10. Modules — Vessel Discovery & Detail
    - [M04. Vessel Search](#m04-vessel-search)
    - [M05. Advanced Search](#m05-advanced-search)
    - [M06. Vessel Detail](#m06-vessel-detail)
    - [M07. Owner Profile](#m07-owner-profile)
11. Modules — S&P Layer
    - [M08. Vessels for Sale](#m08-vessels-for-sale)
    - [M09. S&P Transactions](#m09-sp-transactions)
    - [M10. Projects](#m10-projects)
    - [M11. Competitor Analysis](#m11-competitor-analysis)
12. Modules — Valuation Layer
    - [M12. Market Valuations](#m12-market-valuations)
    - [M13. Valuation Certificates](#m13-valuation-certificates)
13. Modules — Market Intelligence Layer
    - [M14. Net Fleet](#m14-net-fleet)
    - [M15. Earnings](#m15-earnings)
    - [M16. Expenses](#m16-expenses)
    - [M17. Financial Transactions](#m17-financial-transactions)
    - [M18. Market Reports](#m18-market-reports)
14. Modules — Finance & Analytics Layer
    - [M19. Cashflow](#m19-cashflow)
    - [M20. Loan Oracle](#m20-loan-oracle)
    - [M21. Benchmarking](#m21-benchmarking)
    - [M22. IRR Analysis](#m22-irr-analysis)
    - [M23. SOFR Tracker](#m23-sofr-tracker)
    - [M24. EURIBOR Tracker](#m24-euribor-tracker)
15. Modules — ESG Layer
    - [M25. Environmental Score](#m25-environmental-score)
    - [M26. Emissions Tracker](#m26-emissions-tracker)
16. Modules — Alerts & Tracking Layer
    - [M27. Alerts & Notifications](#m27-alerts--notifications)
    - [M28. AIS Tracking](#m28-ais-tracking)
17. [Phase Plans](#17-phase-plans)
18. [Open Questions & Decisions Pending](#18-open-questions--decisions-pending)
19. [Glossary](#19-glossary)

---

## 1. Purpose & Relationship to Other Documents

This document is the **canonical, living build specification** for the Signal S&P web platform implemented in `./web/`. It exists to translate the business requirements in `./brd.md` and the visual prototype in `./html/` into actionable, traceable engineering work.

| Document | Audience | Mutability | Purpose |
|---|---|---|---|
| `./brd.md` | Stakeholders, product | **Frozen** as historical record | Original business requirements (v2.0, April 2026) |
| `./html/` | Designers, engineers | **Frozen** as visual reference | Validated UX patterns and feature scope as a static prototype |
| `./platform-brd.md` (this) | Engineering, product, QA | **Living** — updated each sprint | Source of truth for what is being built in `./web/` and the order in which it is built |
| `./web/docs/BRD/` | Same as platform-BRD | Mirror of this document | In-repo copy referenced by Technical Guides and User Guides |

**Rules of engagement.** When the prototype and `./brd.md` disagree, this document records both interpretations and the resolution in §5 (Reconciliation Notes). When new features are discovered or descoped during implementation, this document is updated **before** the code merges. When `./web/` is initialised, `web/docs/BRD/README.md` will mirror the structure of this document so the platform-BRD travels with the codebase.

---

## 2. Conventions

### 2.1 Identifier Scheme

| Prefix | Scope | Example |
|---|---|---|
| `Fn` | Foundation module | `F1` — Authentication |
| `Mnn` | Feature module | `M12` — Market Valuations |
| `Enn-x` | Epic within a module | `E12-1` — Segment-aware FMV display |
| `Snn-x.y` | Story within an epic | `S12-1.2` — Segment Insight Panel renders per active segment |
| `Tnn-x.y.z` | Atomic task within a story | `T12-1.2.3` — Implement orderbook bar component |

Tasks are atomic units of engineering work — each is one PR-sized change with a clear acceptance hook.

### 2.2 Story Template

Each story is documented as:

```
**S<id>** — One-sentence outcome, written from the user's perspective.
- Persona: who needs this.
- Acceptance criteria: 2–6 testable conditions.
- Phase: P1 / P2 / P3 / P4.
- Source: brd.md §<ref>, html/<file>.html, prototype-only, or new.
```

### 2.3 Task Table Columns

Tasks are listed in tables with columns:

| Column | Meaning |
|---|---|
| ID | Stable task identifier (`Tnn-x.y.z`) |
| Task | Imperative description of the work |
| Phase | Target phase (P1 / P2 / P3 / P4) |
| Depends on | Other task IDs that must land first |
| Source | Origin reference — BRD requirement ID, prototype HTML file, or "new" |

### 2.4 Traceability

- Every story carries a `Source` line citing `brd.md §X.Y` and/or `html/<file>.html`.
- Every BRD requirement ID (e.g., `DB-1`, `LO-3`) referenced in `./brd.md §7` is mapped to at least one story.
- "Prototype-only" or "BRD-only" features are flagged in §5.

### 2.5 Document Maintenance

- **Document only the chosen stack.** The BRD describes what `./web/` will build, not the alternatives that were considered. Alternatives that remain genuinely undecided live in §18 (Open Questions); everything else is folded into the relevant module or foundation section as a binding constraint.
- **No editorial-process metadata in the body.** No changelogs, version tags, or PR back-references inside the document. Decisions that warrant a paper trail go in §4.6 (Decision Log) where they belong; sprint-level history lives in the sprint review notes, not here.
- **Maintain the HTML mirror in lockstep.** A read-only HTML rendering of this document lives at `./platform-brd.html`. Any change to `platform-brd.md` must be paired with a regenerated `platform-brd.html` committed in the same commit; the two files are kept identical in content. Regenerate by running `./build-brd-html.sh` from the repo root (requires `pandoc 2.9+`). Build helpers — the embedded stylesheet, the read-only banner, and a closing wrapper — live in `./.brd-build/`. The HTML mirror is read-only: never edit it by hand; always regenerate from the markdown source.
- Update `Status` columns at the start of each sprint.
- Append new tasks rather than mutating completed ones (retain history).
- When a story or task is materially descoped, mark it `Deferred — <reason>` and link to the deciding sprint review.

---

## 3. Status & Phase Legend

### Status

| Tag | Meaning |
|---|---|
| **Planned** | Not yet started. |
| **In Progress** | At least one task in the story has shipped or has a PR open. |
| **Shipped** | All acceptance criteria met, merged to `main`, in a deployed environment. |
| **Deferred** | Consciously postponed; reason recorded inline. |
| **Removed** | Removed from scope; reason recorded inline. |

### Phase

| Phase | Goal | Source |
|---|---|---|
| **P1** | Foundation: working app with portfolio view, valuation, and loan structuring. | `brd.md §12 Phase 1` |
| **P2** | Market Intelligence: segment-aware market layer. | `brd.md §12 Phase 2` |
| **P3** | Analytics & ESG: deep analytics and compliance tooling. | `brd.md §12 Phase 3` |
| **P4** | Scale & Automation: real-time, automation, enterprise. | `brd.md §12 Phase 4` |

Default phase for any story without an explicit assignment is the phase of its parent module.

---

## 4. Technology Stack

This section is the **binding technical contract** for `./web/`. Every PR must conform to it; deviations require an entry in §18 (Open Questions) before the PR opens.

### 4.1 Stack Overview

| Concern | Choice | Rationale |
|---|---|---|
| Application framework | **Next.js (latest stable) with App Router**, React, TypeScript (`strict: true`) | One framework spans frontend, backend route handlers, RSC server work, and SSR; aligns with the team's familiarity. |
| Language | **TypeScript** everywhere (no `any` without justification) | Type safety across UI, API, ORM. |
| Server runtime | **Node.js 20-alpine** in containers | Aligns with Next.js, supports Prisma. |
| API layer | **Next.js Route Handlers** (`app/api/**`) + Server Actions where idiomatic | Same repo, no separate service. |
| Validation | **Zod** at every input boundary (route handlers, server actions, server-side helpers, mail input) | Single source of truth for runtime + TS types. |
| ORM | **Prisma** (latest) with PostgreSQL provider | Type-safe schema; first-class Next.js integration. |
| Database | **PostgreSQL 16** in dev (Docker) and prod | Relational + JSONB; TimescaleDB extension added in P2 for time series (`brd.md §11.3`). |
| Migrations | **Prisma Migrate** (`prisma migrate dev` in dev, `prisma migrate deploy` in prod) | First-party tool. |
| Cache | In-memory in dev; **Redis 7** in P2+ for market-data TTL caching and rate limiting | `brd.md §11.3` |
| Auth | **Auth.js (NextAuth)** Credentials provider in P1; pluggable for SSO/SAML in later phases | Idiomatic for App Router; serverless-friendly. (See §18 OQ-1.) |
| Mail transport | **Nodemailer** over SMTP, single code path; **Mailpit** for dev, **Mailgun** for staging/prod | Swap is purely env-var (`MAIL_HOST`, `MAIL_PORT`, etc.). |
| Background jobs | Vercel Cron / `node-cron` in P2; queue worker (BullMQ on Redis) in P3+ | Start simple, escalate when needed. |
| Object storage | S3-compatible (AWS S3 or Cloudflare R2) for PDFs, certificates, vessel documents | `brd.md §11.3` |
| PDF generation | **Playwright** headless Chromium rendering an RSC HTML template | Better maintained than Puppeteer; same template engine works in dev and prod. |
| Excel/CSV exports | **ExcelJS** for `.xlsx`; streaming CSV via Node stream helpers | `brd.md §13 NFR-13` |
| Charts | **Recharts** wrapped by a token-aware `<Chart>` adapter (F3) | `brd.md §11.1` |
| Maps | **MapLibre GL** with OSM/MapTiler tiles for AIS map and geo-zone editor | Open-source, no vendor lock-in. (See §18 OQ-20.) |
| Logging | **Pino** with request-id correlation | JSON logs; performant. |
| Error tracking | **Sentry** (or self-hosted GlitchTip) | Frontend + server. |
| Observability | OpenTelemetry SDK exporting to Datadog (prod) or Prometheus + Grafana | `brd.md §11.5` |
| Linting | **ESLint** with Next.js config + Prettier | Default Next.js config is fine. |
| Formatting | **Prettier** | Default config; pre-commit hook in P2. |
| Tests | **Vitest** for unit, **Playwright** for E2E, **Storybook** for component docs + visual regression (Chromatic in P2) | One UI test runner across unit and E2E. |
| Type checking in CI | `tsc --noEmit` on every PR | Catches type drift. |
| Package manager | **pnpm** | Fast, disk-efficient, monorepo-ready. |
| CI/CD | **GitHub Actions** for lint, type-check, test, build, deploy | `brd.md §11.5` |
| Containerisation | Docker Compose locally; Kubernetes (or Vercel) in prod | `brd.md §11.5` |
| Cloud target | AWS primary; Cloudflare for CDN + R2 | `brd.md §11.5` |
| Secret management | `.env.local` in dev (gitignored); AWS Secrets Manager in prod | `brd.md §11.5` |

### 4.2 Frontend & Styling

This is the section the prototype's custom CSS does **not** translate into. The prototype's `assets/css/signal-design-system.css` is a **token reference** for the platform — colour values, spacing scale, type scale, radii — but the platform itself ships **no custom CSS rules** beyond what is necessary to expose tokens to Tailwind.

| Concern | Choice |
|---|---|
| UI framework | **React 19** via Next.js App Router |
| Styling primitive | **Tailwind CSS** utility classes — applied directly to JSX |
| Component library | **shadcn/ui** primitives copied into `components/ui/` (button, input, label, card, form, table, badge, dialog, popover, tabs, sheet, select, combobox, ...) |
| Tokens | Brand palette, spacing, typography, radii expressed in `tailwind.config.ts` `theme.extend` and as CSS custom properties on `:root` (and `[data-theme="dark"]`) for runtime access. |
| Icons | **lucide-react** |
| Class composition | `cn()` helper (`lib/utils.ts`) — `clsx` + `tailwind-merge`. |
| Variants | **CVA** (class-variance-authority) for component variants where shadcn ships it. |
| Animation | **Tailwind transitions** + **Radix primitives'** built-in animations (no Framer Motion in P1). |
| Fonts | Loaded via `next/font/google` (Lato to mirror prototype, `--font-sans` set on `<html>`). |

#### Styling rules for `./web/` (binding)

These rules supersede prototype practice. They exist so that future modules stay consistent and the design system remains the single source of truth.

1. **No bespoke `.css` rules in app code.** The only CSS files in the repo are:
   - `app/globals.css` — Tailwind directives (`@tailwind base/components/utilities`), CSS custom-property declarations exposing design tokens, base typographic resets if any.
   - `tailwind.config.ts` — token definitions consumed by utility classes.
   - One CSS module per component **only** when a Tailwind utility cannot express the rule (e.g. complex SVG mask, a third-party widget overriding); each instance must be justified in a comment.
   No page-scoped or feature-scoped `.css` files. No global selectors mutating shadcn primitives.
2. **Tailwind utilities first, shadcn primitives second, custom JSX components third.** A new component is only justified when (a) the same Tailwind class string repeats four or more times, or (b) the component encodes domain semantics (e.g. `<KpiCard>`, `<SegmentPill>`).
3. **No inline `style={{}}` for layout, spacing, or colour.** Only acceptable use of inline style is a runtime-computed value that cannot be expressed as a class (e.g. a chart bar width as `${pct}%`).
4. **Tokens, not literals.** Colour, spacing, radius, typography are referenced through Tailwind's theme keys (e.g. `bg-brand-blue`, `text-text-muted`, `rounded-md`). Hex values and arbitrary `text-[13px]` literals are forbidden in component code.
5. **Theming is data-attribute driven.** Light is default; dark theme on the AIS map and Geo-zone editor is enabled by `[data-theme="dark"]` on a wrapper element, not by separate CSS files.
6. **shadcn primitives are not forked.** When a primitive needs visual change, customise via CVA variants or props — not by editing the generated component files in `components/ui/`. If a fork is absolutely required, document the deviation in `docs/TechnicalGuides/FrontendConventions.md`.
7. **The prototype's CSS is read-only reference.** No file in `assets/css/signal-design-system.css` is copied verbatim into `./web/`. Tokens are extracted and re-expressed as Tailwind theme entries; everything else is rebuilt with utilities.

### 4.3 Backend Conventions

- **Route → Service → Repository (RSR) separation.** Route handlers validate and delegate; services hold business logic; repositories own all Prisma access. No business logic in route handlers; no Prisma in services.
- **Every mutation flows through `auditedMutation()`** which writes to `audit_event` (F4 / F8).
- **Every query is org-scoped** via Prisma middleware (F1 T1-2.1.3); helpers without `organizationId` fail CI lint.
- **Server Actions** are used for mutations triggered from forms; route handlers (`app/api/**`) for everything else (downloads, third-party callbacks, machine-to-machine).
- **No "magic" returns from services.** Services return Zod-validated DTOs; repositories return Prisma row types; the boundary between them is explicit.
- **Soft delete is the default**; hard deletes require a written justification in the migration.

### 4.4 Local Dev Layout

```
./web/
├── app/                    # Next.js App Router
│   ├── (embedded)/         # route group: no shell layout
│   ├── api/
│   ├── globals.css         # Tailwind directives + token CSS vars
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn primitives (auto-generated)
│   └── domain/             # KpiCard, SegmentPill, ...
├── lib/                    # prisma.ts, mail.ts, providers/, utils.ts
├── prisma/
├── docker/
├── docs/
├── tailwind.config.ts
├── components.json         # shadcn config
└── docker-compose.yml
```

### 4.5 Versioning & Upgrades

- Pin **major** versions in `package.json` (`^` allowed for minor/patch).
- Renovate or Dependabot raises monthly upgrade PRs; auto-merge for green patch updates only.
- A platform-BRD entry must accompany any major-version upgrade that affects public APIs (Next.js, Prisma, Tailwind, shadcn).

### 4.6 Development Workflow

**Working directory.** `web/` is the project root for all development commands. Every shell example in this BRD and the runbooks assumes the current working directory is `web/`.

**Container-only tooling.** All `pnpm`, `node`, `prisma`, and `playwright` commands run inside the dev container (built from `Dockerfile.dev`). The host machine doesn't need a working `node_modules` for builds or tests. The canonical command form is:

```bash
docker compose exec so-snp-web pnpm <script>
```

Rationale: the container runs Linux x86_64 with a known Node 22 + pnpm 9.15.0 toolchain; the host (typically macOS arm64) hits inconsistent native-binary issues with optional dependencies (Rollup, esbuild, swc). Keeping all build/test commands in one runtime eliminates "works on my machine" drift, matches CI exactly, and keeps the husky pre-commit / pre-push hooks consistent.

The host install is supported only for IDE autocomplete and is documented as optional in `web/docs/runbooks/getting-started.md`.

**Testing toolchain.**

| Tool | Purpose | Where it runs |
|---|---|---|
| Vitest | Unit + integration tests, RTL component tests | Dev container |
| @testing-library/react | DOM testing for React components | Dev container |
| MSW | Mocking external APIs (Signal Ocean) | Dev container |
| Playwright | End-to-end browser tests | CI; locally only when Playwright deps are baked into the image |
| GitHub Actions | CI pipeline running typecheck, lint, Vitest, Playwright | CI |

See `web/docs/architecture/testing-strategy.md` for the full strategy.

**Commit message convention.** Every commit on a feature branch carries the Jira ticket ID as a prefix:

```
OT-NNN - <single line, imperative, ≤72 chars>
```

This ties every change back to its tracker entry. Use the active branch's ticket ID (e.g. `OT-175` for `feature/OT-175-fleets-and-vessels`).

### 4.7 Decision Log

When the platform stack changes, append an entry here with date, decision, rationale, and the PR or ADR link. Foundational stack choices that need ADRs in `docs/BRD/` ride alongside this section.

| Date | Decision | Rationale | Reference |
|---|---|---|---|
| 2026-04-30 | Adopt Next.js App Router + Prisma + PostgreSQL + Tailwind + shadcn (no custom CSS) | Diverges from `brd.md §11`'s React+Vite+NestJS spec; better fit for the team and codebase. | This BRD §4 |
| 2026-04-30 | Auth.js (NextAuth v5) for authentication, integrated with Prisma via `@auth/prisma-adapter` | Idiomatic for Next.js App Router; meets the security requirements in `brd.md §13 NFR-6`. Alternatives (Lucia, Better-Auth, managed providers) tracked in §18 OQ-1. | This BRD §4.1, F1 |

---

## 5. Reconciliation Notes — Prototype vs Original BRD

These items differ between `./html/` and `./brd.md`. Each is resolved here as the binding decision for `./web/`. Open items are surfaced in §18.

| # | Topic | `./brd.md` says | `./html/` shows | Resolution for `./web/` |
|---|---|---|---|---|
| R-1 | Sidebar grouping | §10.1: *S&P / Valuations / Market / Analytics / ESG / Alerts & Tracking* | Dashboard / FleetSpace / DiscoverySpace (Vessel Search · Projects · Competitor Analysis) / Market (Valuations · Net Fleet · Financial Transactions · Earnings & Expenses · IRR · Environmental Score · Market Reports) / Finance Toolkit (Cashflow · Loan Oracle · Benchmarking · AIS Tracking) / Alerts | **Adopt prototype grouping.** Users have already validated it in the prototype. Document the BRD's grouping as the historical reference. Decision tracked in §18 OQ-3. |
| R-2 | Vessel Detail sub-tabs | §10.2 / VS-4: *Main Information · Valuations · Valuation Certificates · S&P History · Technical · ESG · Benchmarking · AIS Tracking* (8 tabs) | Main Information · Valuations · Net Fleet · Financial Transactions · Earnings & Expenses · IRR · Environmental Score · Valuation Certificates (8 tabs, but a different set) | **Adopt prototype tab set as the user-facing layout** in P1; surface BRD's S&P History, Technical, Benchmarking, and AIS Tracking as additional tabs in P3 once the underlying modules ship. Decision tracked in §18 OQ-4. |
| R-3 | Embedded Vessel Detail | §11.1 / VS-5: iframe with `body.embedded` CSS class | Not implemented in any prototype HTML | **Implement via Next.js route group + layout suppression** rather than iframe (better deep links, state sharing, accessibility). Resolves `brd.md §14 OI-8`. |
| R-4 | Tech stack | §11: React + Vite + NestJS | n/a | **Web version uses Next.js (App Router) + Prisma + PostgreSQL + Mailpit/Mailgun + Auth.js.** Original BRD's stack is superseded for `./web/`. |
| R-5 | Cashflow scope | §7.7 CF-1..CF-6: Bear/Base/Bull, P&L, IRR, NPV, payback, LTV at exit | Cashflow + a separate **DCF Calculations** sub-tab; sensitivity tables; quarterly and monthly views | **Both Cashflow and DCF supported in M19**, sensitivity table is part of M19 epic E19-3. |
| R-6 | Loan Oracle scope | §7.7 LO-1..LO-5: lender cards, Financibility Score, covenant monitor, term sheet | Adds a **Financiers** sub-tab (lender database) and an embedded **SOFR & EURIBOR** sub-tab | Adopt prototype scope; lender database becomes E20-2; integrated rate panel becomes E20-4. SOFR/EURIBOR also exist as standalone trackers (M23, M24). |
| R-7 | Notifications scope | §7.11 AL-1: LTV / price / operational / geo | Splits into **FMV / LTV / Market Index / Exchange Rates / Geo / Alert History** sub-tabs | Adopt prototype scope. FX-rate alerts and Index alerts are new vs BRD — captured as E27-3 and E27-4. |
| R-8 | Earnings sub-tabs | §7.8 ER-1, ER-2: TCE rate, coverage analysis | Overview · Historical Rates · Current Market · Forward Curve | Adopt prototype tab structure; ER-2 forward curve becomes E15-4. |
| R-9 | Expenses sub-tabs | §7.8 EX-1, EX-2: OPEX, budget variance, YoY | Overview · Historical Costs · Current Period · Budget & Forecast (3-year forecast) | Adopt prototype scope; the 3-year forecast is new vs BRD — captured as E16-4. |
| R-10 | Vessel Search scope | §7.3 VS-1: autocomplete, recent, type/flag pills | Includes Market Intelligence and Documents tabs (document upload per vessel) | Adopt prototype scope; document upload per vessel is new — captured as E04-3. |
| R-11 | Add Vessel & Create Fleet | §7.2 FL-7 mentions add/remove vessel from fleet, but no dedicated registration flow | Two dedicated wizards: `add-vessel.html` and `create-fleet.html` | Adopt prototype scope as **M03**. |
| R-12 | Owner Profile | Not in BRD | Full module: Overview · Fleet · S&P Activity · Financials · Contacts | Adopt as **M07**, scoped to P3. |
| R-13 | Competitor Analysis | §12 Phase 4 mentions briefly | Full module: Overview · Fleet Intelligence · Vessel Watchlist · Acquisition Criteria · Matched Vessels · Alert Preferences | Adopt prototype scope as **M11**, scoped to P3 with a watchlist micro-feature available earlier. |
| R-14 | Market Reports | §7.8 MR-1..MR-3 | Adds Subscriptions and Saved Searches | Adopt prototype scope as M18 epics E18-3 and E18-4. |
| R-15 | Project name | "Signal S&P", "ShipInvest", "S&P Module" used interchangeably | Browser titles say "Ship Invest" | **Code/repo name = `snp-module`**; UI display name = "Signal S&P"; long-form description = "Signal S&P (a.k.a. ShipInvest)". |

---

## 6. Module Map

```
Foundations
├── F1 Authentication & Organisation Setup
├── F2 App Shell & Navigation
├── F3 Design System & Component Library
├── F4 Data Model & Persistence
├── F5 External Integrations & Market Data Layer
├── F6 Notifications & Mail Subsystem
├── F7 Exports, Reporting & PDF
└── F8 Observability, Audit & Security

Portfolio Layer
├── M01 Dashboard
├── M02 My Fleet (FleetSpace)
└── M03 Add Vessel & Create Fleet

Vessel Discovery & Detail
├── M04 Vessel Search
├── M05 Advanced Search
├── M06 Vessel Detail
└── M07 Owner Profile

S&P Layer
├── M08 Vessels for Sale
├── M09 S&P Transactions
├── M10 Projects
└── M11 Competitor Analysis

Valuation Layer
├── M12 Market Valuations
└── M13 Valuation Certificates

Market Intelligence Layer
├── M14 Net Fleet
├── M15 Earnings
├── M16 Expenses
├── M17 Financial Transactions
└── M18 Market Reports

Finance & Analytics Layer
├── M19 Cashflow
├── M20 Loan Oracle
├── M21 Benchmarking
├── M22 IRR Analysis
├── M23 SOFR Tracker
└── M24 EURIBOR Tracker

ESG Layer
├── M25 Environmental Score
└── M26 Emissions Tracker

Alerts & Tracking Layer
├── M27 Alerts & Notifications
└── M28 AIS Tracking
```

---

## 7. Module Roadmap Snapshot

The current planning state. Updated each sprint review. Today (2026-04-30) every module is **Planned**.

| Module | Phase | Status | Lead persona | Prototype source |
|---|---|---|---|---|
| F1 Authentication & Org Setup | P1 | Planned | All users | n/a |
| F2 App Shell & Navigation | P1 | Planned | All | dashboard.html (sidebar) |
| F3 Design System | P1 | Planned | All | assets/css/signal-design-system.css |
| F4 Data Model | P1 | Planned | All | new |
| F5 Integrations & Market Data | P2 | Planned | Analyst, Manager | new |
| F6 Notifications & Mail | P1 | Planned | All | new (BRD §14 OI-11) |
| F7 Exports, Reporting & PDF | P1 | Planned | Analyst, Compliance | valuation-certificates.html |
| F8 Observability, Audit & Security | P1 | Planned | Eng, SRE | new |
| M01 Dashboard | P1 | Planned | Manager, Owner | dashboard.html |
| M02 My Fleet | P1 | Planned | Owner, Manager | my-fleet.html |
| M03 Add Vessel & Create Fleet | P1 | Planned | Owner, Manager | add-vessel.html, create-fleet.html |
| M04 Vessel Search | P1 | Planned | Broker, Analyst | vessels.html |
| M05 Advanced Search | P3 | Planned | Broker, Analyst | advanced-search.html |
| M06 Vessel Detail | P1 | Planned | All | vessel-details.html |
| M07 Owner Profile | P3 | Planned | Broker, Manager | owner.html |
| M08 Vessels for Sale | P2 | Planned | Broker, Manager | vessels-for-sale.html |
| M09 S&P Transactions | P2 | Planned | Broker, Manager | sp-transactions.html |
| M10 Projects | P3 | Planned | Manager, Analyst | projects.html |
| M11 Competitor Analysis | P3 | Planned | Manager, Analyst | competitor-analysis.html |
| M12 Market Valuations | P1 | Planned | All | valuations.html |
| M13 Valuation Certificates | P1 | Planned | Analyst, Compliance | valuation-certificates.html |
| M14 Net Fleet | P2 | Planned | Manager, Analyst | net-fleet.html |
| M15 Earnings | P2 | Planned | Ops, Analyst | earnings.html |
| M16 Expenses | P2 | Planned | Ops, Analyst | expenses.html |
| M17 Financial Transactions | P2 | Planned | Analyst | financial-transactions.html |
| M18 Market Reports | P2 | Planned | All | market-reports.html |
| M19 Cashflow | P1 | Planned | Analyst | cashflow.html, new-cashflow-request.html |
| M20 Loan Oracle | P1 | Planned | Analyst, Manager | loan-oracle.html, new-loan-request.html |
| M21 Benchmarking | P3 | Planned | Manager | benchmarking.html |
| M22 IRR Analysis | P3 | Planned | Analyst | irr.html |
| M23 SOFR Tracker | P2 | Planned | Analyst | sofr.html |
| M24 EURIBOR Tracker | P2 | Planned | Analyst | euribor.html |
| M25 Environmental Score | P3 | Planned | Compliance | environmental-score.html |
| M26 Emissions Tracker | P3 | Planned | Compliance | emissions-tracker.html |
| M27 Alerts & Notifications | P1 (LTV+price); P2 (rest) | Planned | All | notifications.html |
| M28 AIS Tracking | P3 | Planned | Ops, Manager | ais-tracking.html |

---

## F1. Authentication & Organisation Setup

**Phase:** P1 · **Status:** Planned · **Source:** `brd.md §11.2`, `brd.md §13 NFR-6/NFR-7/NFR-9`, new

**Purpose.** Provide secure, organisation-scoped access to every screen and API. All user data — fleets, models, certificates, alerts — must belong to exactly one organisation; cross-organisation access is impossible by construction.

### Epics

- **E1-1** — User identity & session
- **E1-2** — Organisation & multi-tenancy
- **E1-3** — Role-based access control
- **E1-4** — Account management surfaces

### Stories

**S1-1.1** — As a user, I can sign in with email and password.
- Persona: All
- Acceptance: valid creds set a session cookie; invalid creds show inline error within 1 s; rate-limited at 10 attempts/min/IP; session survives reload.
- Phase: P1
- Source: `brd.md §11.2` (auth security requirements; implemented via Auth.js for App Router).

**S1-1.2** — As a user, I can sign out and have my session terminated server-side.
- Persona: All
- Acceptance: clicking "Sign out" deletes the session cookie, invalidates server-side session, redirects to /login.
- Phase: P1
- Source: new

**S1-1.3** — As a user, my session refreshes silently and rotates the token.
- Persona: All
- Acceptance: session refreshes on every authenticated request; session rotation on a 30-minute boundary; rotation events logged in audit table.
- Phase: P1
- Source: `brd.md §13 NFR-6`.

**S1-1.4** — As a user, I can request a password reset by email.
- Persona: All
- Acceptance: token expires in 1 h; one-time use; email rendered via F6 transport.
- Phase: P2
- Source: new

**S1-2.1** — As a developer, every database row that holds user data has an `organization_id` foreign key.
- Persona: Eng
- Acceptance: Prisma schema rejects models that hold user data without `organizationId`; lint rule documented.
- Phase: P1
- Source: `brd.md §13 NFR-9`.

**S1-2.2** — As an admin, I can see which users belong to my organisation.
- Persona: Manager, Owner (with `Admin` role)
- Acceptance: `/settings/organization/members` lists members with role badges; only `Admin` may invite/remove.
- Phase: P2
- Source: new

**S1-2.3** — As a user, I can switch between organisations I belong to.
- Persona: Multi-org consultant
- Acceptance: org switcher in topbar; current org persists in cookie; all queries scope to the active org.
- Phase: P3
- Source: new

**S1-3.1** — As an admin, I can assign roles: `Admin`, `Portfolio Manager`, `Analyst`, `Compliance`, `Read-Only`.
- Persona: Admin
- Acceptance: a permission map maps each role to allowed actions; UI hides forbidden actions; API rejects forbidden actions with 403 + audit log.
- Phase: P2
- Source: `brd.md §13 NFR-7`.

**S1-3.2** — As a Compliance officer, I can view ESG screens but cannot edit Loan Oracle data.
- Persona: Compliance
- Acceptance: route-level permission middleware; verified by integration test.
- Phase: P2
- Source: `brd.md §13 NFR-7`.

**S1-4.1** — As a user, I can view and edit my profile (name, avatar, email, password, notification preferences).
- Persona: All
- Acceptance: changes persist; password change re-authenticates the session.
- Phase: P2
- Source: new

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T1-1.1.1 | Choose and install Auth.js (NextAuth) for App Router | P1 | F4 ready | new |
| T1-1.1.2 | Add `User` and `Session` Prisma models | P1 | T1-1.1.1 | brd.md §11.2 |
| T1-1.1.3 | Implement Credentials provider with bcrypt password hashing (cost ≥ 12) | P1 | T1-1.1.2 | brd.md §13 NFR-6 |
| T1-1.1.4 | Build `/login` page with shadcn Form + Zod validation | P1 | T1-1.1.3, F3 | new |
| T1-1.1.5 | Add IP-bound rate limiter (10/min) on /login | P1 | T1-1.1.4 | brd.md §13 NFR-6 |
| T1-1.2.1 | Implement `/api/auth/signout` and topbar Sign Out button | P1 | T1-1.1.4 | new |
| T1-1.3.1 | Configure session rotation interval in Auth.js and verify in middleware | P1 | T1-1.1.3 | brd.md §13 NFR-6 |
| T1-1.4.1 | Add `/forgot-password` and `/reset-password/[token]` flows | P2 | F6 mail ready | new |
| T1-2.1.1 | Add `Organization` Prisma model with `slug` and `name` | P1 | T1-1.1.2 | brd.md §13 NFR-9 |
| T1-2.1.2 | Add `OrganizationUser` join with `role` enum | P1 | T1-2.1.1 | brd.md §13 NFR-7 |
| T1-2.1.3 | Implement Prisma middleware that injects active `organizationId` into every query | P1 | T1-2.1.2 | brd.md §13 NFR-9 |
| T1-2.1.4 | Lint rule / repo helper that fails any new repo function lacking `organizationId` scoping | P1 | T1-2.1.3 | new |
| T1-2.2.1 | Build `/settings/organization/members` table | P2 | T1-2.1.2 | new |
| T1-2.2.2 | Implement invite-by-email flow with token-based acceptance | P2 | T1-2.2.1, F6 | new |
| T1-2.3.1 | Topbar org switcher with cookie-backed active-org context | P3 | T1-2.1.3 | new |
| T1-3.1.1 | Define `Role` enum and permission map module | P2 | T1-2.1.2 | brd.md §13 NFR-7 |
| T1-3.1.2 | Server-side authorisation helper (`assertCan(role, action)`) | P2 | T1-3.1.1 | new |
| T1-3.1.3 | Client-side `<Authorized>` component to hide/disable UI by permission | P2 | T1-3.1.1 | new |
| T1-3.2.1 | Integration tests covering each role × each protected route matrix | P2 | T1-3.1.2 | new |
| T1-4.1.1 | Build `/settings/profile` page | P2 | T1-1.1.4 | new |
| T1-4.1.2 | Password change flow with current-password re-auth | P2 | T1-4.1.1 | brd.md §13 NFR-6 |

---

## F2. App Shell & Navigation

**Phase:** P1 · **Status:** Planned · **Source:** `dashboard.html` sidebar, `brd.md §10`, `assets/js/main.js`

**Purpose.** Provide the persistent topbar, sidebar, breadcrumb, fleet selector, alert pills, and search affordance shared across every authenticated screen. Mirror the prototype's structure (Reconciliation R-1 above).

### Epics

- **E2-1** — Sidebar with collapsible groups
- **E2-2** — Topbar (logo, alerts, profile)
- **E2-3** — Breadcrumb (sidebar resets, in-page preserves origin)
- **E2-4** — Global vessel/port search
- **E2-5** — Embedded mode (Vessel Detail rendered without shell)

### Stories

**S2-1.1** — As a user, the sidebar shows: Dashboard · FleetSpace · DiscoverySpace · Market · Finance Toolkit · Alerts.
- Persona: All
- Acceptance: groups match prototype; active item highlighted; group state collapses/expands and persists in localStorage.
- Phase: P1
- Source: `dashboard.html:549-576`, R-1

**S2-1.2** — As a user, the sidebar shows my display name and tenant.
- Persona: All
- Acceptance: name pulled from session; tenant name in subtitle.
- Phase: P1
- Source: `dashboard.html:540`

**S2-2.1** — As a user, I see alert pills (HIGH / MEDIUM / LOW / INFO) in the topbar that link to Alerts.
- Persona: All
- Acceptance: counts driven by live alert query; clicking pill navigates to filtered alerts list.
- Phase: P1
- Source: `dashboard.html:603-616`, `brd.md §7.11 AL-2`

**S2-2.2** — As a user, I have a profile menu in the topbar with Sign Out and Profile links.
- Persona: All
- Acceptance: opens via avatar; closes on outside click; keyboard navigable.
- Phase: P1
- Source: new + `assets/css/signal-design-system.css .avatar`

**S2-3.1** — As a user, the breadcrumb resets to root when I click any sidebar item.
- Persona: All
- Acceptance: matches main.js behaviour: only the current page name shown after sidebar nav.
- Phase: P1
- Source: `assets/js/main.js:65-70`, `brd.md §10.3`

**S2-3.2** — As a user, the breadcrumb preserves origin context when I navigate within a page (e.g., a fleet → vessel detail).
- Persona: All
- Acceptance: shows "Fleet Alpha / MV Pacific Star" or similar; back link returns to origin.
- Phase: P1
- Source: `assets/js/main.js:46-55`, `brd.md §10.3`

**S2-3.3** — As a user, switching a sub-tab updates the trailing breadcrumb segment to the tab label.
- Persona: All
- Acceptance: matches main.js behaviour.
- Phase: P1
- Source: `assets/js/main.js:142-149`

**S2-4.1** — As a user, I can search for a vessel or port from the sidebar.
- Persona: All
- Acceptance: input dropdown shows top 5 matches; Enter navigates to Vessel Detail; recent searches persist.
- Phase: P1
- Source: `dashboard.html:542-548`, `brd.md §7.3 VS-1`

**S2-4.2** — As a user, I can apply quick filters from the sidebar search (vessel type, flag).
- Persona: Analyst, Broker
- Acceptance: filter button opens panel; selections persist for the session.
- Phase: P2
- Source: `dashboard.html:545-547`

**S2-5.1** — As a developer, Vessel Detail renders without sidebar/topbar when accessed via embedded route group.
- Persona: Eng
- Acceptance: a route group such as `(embedded)` provides a no-shell layout; the same component tree powers both modes; visual diff covered by Storybook.
- Phase: P1
- Source: `brd.md §11.1`, R-3

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T2-1.1.1 | Implement `<Sidebar>` component with groups, items, chevrons | P1 | F3 tokens | dashboard.html, R-1 |
| T2-1.1.2 | Persist group expansion state to localStorage | P1 | T2-1.1.1 | new |
| T2-1.1.3 | Highlight active item from current pathname | P1 | T2-1.1.1 | new |
| T2-1.2.1 | Render session display name and active org in sidebar header | P1 | F1 ready | new |
| T2-2.1.1 | Implement `<Topbar>` with logo, alert pills, profile menu | P1 | F3 | dashboard.html |
| T2-2.1.2 | Wire alert pill counts to live query | P1 | M27 base | brd.md §7.11 |
| T2-2.2.1 | Profile menu component (popover) with Sign Out and Profile | P1 | F1 | new |
| T2-3.1.1 | Implement `useBreadcrumb()` hook with sessionStorage origin | P1 | T2-1.1.1 | main.js |
| T2-3.1.2 | Reset origin on sidebar navigation | P1 | T2-3.1.1 | main.js |
| T2-3.2.1 | Surface breadcrumb back-link in `<PageHeader>` | P1 | T2-3.1.1 | main.js |
| T2-3.3.1 | Subtab change updates breadcrumb tail | P1 | T2-3.1.1 | main.js |
| T2-4.1.1 | Implement `<GlobalSearch>` with combobox over vessels/ports | P1 | F4 vessels seed | brd.md §7.3 |
| T2-4.1.2 | Persist last 10 recent searches per user | P1 | T2-4.1.1 | new |
| T2-4.2.1 | Quick-filter panel (type, flag) | P2 | T2-4.1.1 | new |
| T2-5.1.1 | Add `(embedded)` route group with shell-less layout | P1 | T2-1.1.1 | brd.md §11.1 |
| T2-5.1.2 | Ensure Vessel Detail page tree works under both layouts | P1 | T2-5.1.1, M06 | brd.md §11.1 |
| T2-5.1.3 | Storybook stories: shell vs embedded vs full Vessel Detail | P1 | T2-5.1.2 | new |

---

## F3. Design System & Component Library

**Phase:** P1 · **Status:** Planned · **Source:** `assets/css/signal-design-system.css` (read-only token reference), `brd.md §9`, `brd.md §13 NFR-14`, §4.2 (styling rules)

**Purpose.** A shared, token-driven UI vocabulary for the platform built on **Tailwind CSS utilities + shadcn/ui primitives**. The prototype's `signal-design-system.css` is mined for token values (palette, spacing, radii, type) and re-expressed as Tailwind theme entries and CSS custom properties — but **no custom CSS rule from the prototype is copied into `./web/`**. App code styles components by composing Tailwind utilities; deviating from this requires sign-off and an entry in §18.

**Binding constraints (re-stated from §4.2).**

1. The only CSS files in `./web/` are `app/globals.css` (Tailwind directives + token CSS variables) and `tailwind.config.ts` (token definitions).
2. No page-scoped or feature-scoped `.css`/`.scss` files. No CSS Modules unless a Tailwind utility cannot express the rule, justified inline.
3. No inline `style={{}}` for layout/spacing/colour. Acceptable only for runtime-computed values (e.g. chart bar widths).
4. Tokens-only — `bg-brand-blue`, `text-text-muted`, `rounded-md`. Hex literals and arbitrary values forbidden in component code.
5. shadcn primitives are not forked; customise via CVA variants and props.

### Epics

- **E3-1** — Token migration from prototype CSS into Tailwind theme + CSS variables
- **E3-2** — shadcn primitives scaffolded (button, input, label, card, form, table, badge, dialog, popover, tabs, sheet, select, combobox)
- **E3-3** — Domain components built from Tailwind utilities + shadcn primitives (KpiCard, SegmentPill, SegmentInsightCard, AlertPill, StatChange, Sparkline, BreadcrumbBar, PageHeader, ConfidenceRing, OrderbookBar, AmortizationBar, BulletBar, EmploymentTimeline)
- **E3-4** — Charting wrapper (Recharts adapter with token-aware theme)
- **E3-5** — Storybook setup and visual regression
- **E3-6** — Lint enforcement of the no-custom-CSS rule

### Stories

**S3-1.1** — As a developer, all design tokens (colour, spacing, radius, typography) are exposed as Tailwind theme entries and CSS custom properties.
- Persona: Eng
- Acceptance: `tailwind.config.ts` contains the brand palette; `globals.css` re-exposes the same values as `--color-*`; tokens match `assets/css/signal-design-system.css:9-65`.
- Phase: P1
- Source: signal-design-system.css

**S3-1.2** — As a designer, light and dark variants of each token are available.
- Persona: Designer
- Acceptance: `data-theme="dark"` on `<html>` switches the palette; AIS Tracking and Notifications geo map use the dark palette.
- Phase: P3
- Source: prototype dark theme on AIS map

**S3-2.1** — As a developer, baseline shadcn primitives are scaffolded.
- Persona: Eng
- Acceptance: `button`, `input`, `label`, `card`, `form` exist under `components/ui/`; tests render basic states.
- Phase: P1
- Source: task brief §1

**S3-2.2** — As a developer, additional primitives (`table`, `badge`, `dialog`, `popover`, `tabs`, `sheet`, `select`, `combobox`) are scaffolded.
- Persona: Eng
- Acceptance: each component imports cleanly and renders in Storybook.
- Phase: P1
- Source: prototype-wide

**S3-3.1** — As a developer, a `<KpiCard>` matching the prototype's stat-card pattern is available.
- Persona: Eng
- Acceptance: props for label, value, change, meta, accent colour, optional sparkline; matches `dashboard.html` 6-up grid.
- Phase: P1
- Source: dashboard.html, brd.md §9.8

**S3-3.2** — As a developer, a `<SegmentPill>` and `<SegmentPillGroup>` enforce the at-least-one-active guard.
- Persona: Eng
- Acceptance: clicking the last active pill is a no-op; segment colour derived from token; controlled state via `value`/`onChange`.
- Phase: P2
- Source: brd.md §7.6 VA-1, §5.2

**S3-3.3** — As a developer, a `<SegmentInsightCard>` renders a cycle-phase badge, three metrics with WoW change, an orderbook bar, ordering status, and 2-sentence commentary.
- Persona: Eng
- Acceptance: matches `brd.md §7.6 VA-2`; renders one card per active segment in a grid.
- Phase: P2
- Source: brd.md §7.6 VA-2

**S3-3.4** — As a developer, helper components exist for repeating prototype patterns: `<AlertPill>`, `<StatChange>`, `<Sparkline>`, `<ConfidenceRing>`, `<OrderbookBar>`, `<AmortizationBar>`, `<BulletBar>`, `<EmploymentTimeline>`.
- Persona: Eng
- Acceptance: each component has a Storybook story and an accessibility check.
- Phase: P1–P3 per component
- Source: prototype-wide

**S3-4.1** — As a developer, charts use a single `<Chart>` adapter that pulls colours from tokens and ships Recharts under the hood.
- Persona: Eng
- Acceptance: adapter exposes Line, Bar, Stacked, Pie, Scatter; theme overrides applied automatically.
- Phase: P1
- Source: brd.md §11.1 (Recharts)

**S3-5.1** — As a developer, every non-trivial component has a Storybook story and a visual regression check.
- Persona: Eng
- Acceptance: Storybook builds in CI; Chromatic or Playwright snapshots gate PR merges.
- Phase: P2
- Source: brd.md §13 NFR-14

**S3-6.1** — As a developer, the codebase enforces the §4.2 styling rules through CI lint, not just convention.
- Persona: Eng
- Acceptance: ESLint rule (or custom lint script) fails PRs that introduce a `.css`/`.scss` file outside `app/globals.css`, an inline `style={{}}` for static layout/colour/spacing, or hex/arbitrary value literals in component className strings; the rule's allowed exceptions are documented in `docs/TechnicalGuides/FrontendConventions.md` with examples.
- Phase: P1
- Source: §4.2

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T3-1.1.1 | Extract token map from `assets/css/signal-design-system.css` into a JSON file | P1 | — | signal-design-system.css |
| T3-1.1.2 | Configure `tailwind.config.ts` to consume the token map | P1 | T3-1.1.1 | new |
| T3-1.1.3 | Re-expose tokens as CSS custom properties in `globals.css` | P1 | T3-1.1.2 | new |
| T3-1.2.1 | Define dark-theme overrides for navy/sidebar/map screens | P3 | T3-1.1.3 | prototype dark theme |
| T3-2.1.1 | `npx shadcn init` and add baseline primitives | P1 | T3-1.1.2 | task brief |
| T3-2.2.1 | Add table/badge/dialog/popover/tabs/sheet/select/combobox | P1 | T3-2.1.1 | prototype-wide |
| T3-3.1.1 | Implement `<KpiCard>` with prototype's accent-bar variants | P1 | T3-2.1.1 | dashboard.html |
| T3-3.2.1 | Implement `<SegmentPill>` + `<SegmentPillGroup>` with at-least-one guard | P2 | T3-2.1.1 | brd.md §7.6 VA-1 |
| T3-3.3.1 | Implement `<SegmentInsightCard>` | P2 | T3-3.2.1 | brd.md §7.6 VA-2 |
| T3-3.4.1 | Implement `<AlertPill>`, `<StatChange>`, `<Sparkline>` | P1 | T3-2.1.1 | dashboard.html |
| T3-3.4.2 | Implement `<ConfidenceRing>`, `<OrderbookBar>`, `<AmortizationBar>`, `<BulletBar>` | P2 | T3-2.1.1 | valuations.html, loan-oracle.html |
| T3-3.4.3 | Implement `<EmploymentTimeline>` | P2 | T3-2.1.1 | my-fleet.html |
| T3-4.1.1 | Build `<Chart>` Recharts wrapper with token-aware theme | P1 | T3-1.1.2 | brd.md §11.1 |
| T3-5.1.1 | Bootstrap Storybook in `web/` | P2 | T3-2.1.1 | brd.md §13 NFR-14 |
| T3-5.1.2 | Wire visual regression (Chromatic or Playwright snapshots) | P2 | T3-5.1.1 | brd.md §13 NFR-14 |
| T3-6.1.1 | Custom ESLint rule banning new `.css`/`.scss` files outside `app/globals.css` | P1 | T3-1.1.2 | §4.2 |
| T3-6.1.2 | ESLint rule banning inline `style={{}}` for static layout/colour/spacing | P1 | T3-2.1.1 | §4.2 |
| T3-6.1.3 | ESLint rule banning hex literals and `text-[N]px` arbitrary values in `className` | P1 | T3-2.1.1 | §4.2 |
| T3-6.1.4 | Document allowed exceptions in `docs/TechnicalGuides/FrontendConventions.md` | P1 | T3-6.1.1, T3-6.1.2, T3-6.1.3 | §4.2 |

---

## F4. Data Model & Persistence

**Phase:** P1 · **Status:** Planned · **Source:** `brd.md §6`, `brd.md §11.3`

**Purpose.** Define the relational schema, naming conventions, soft-delete strategy, and seeding approach used across modules. Postgres + Prisma; TimescaleDB extension introduced in P2 for time-series tables.

### Epics

- **E4-1** — Schema scaffolding & conventions
- **E4-2** — Reference data (vessels registry, segments, lenders, indices)
- **E4-3** — User-generated entities (fleets, projects, models, certificates, alerts)
- **E4-4** — Time-series storage (FMV, freight indices, rate histories, AIS positions)
- **E4-5** — Seeding & fixtures

### Stories

**S4-1.1** — As a developer, every Prisma model holding user data has `id` (UUID), `organizationId`, `createdAt`, `updatedAt`, `deletedAt` fields.
- Persona: Eng
- Acceptance: schema linter (custom script run in CI) fails when a user-data model lacks any of these.
- Phase: P1
- Source: F1 S1-2.1, brd.md §13 NFR-9

**S4-1.2** — As a developer, soft delete is the default — `deletedAt` is set instead of row removal.
- Persona: Eng
- Acceptance: repository layer wraps deletes; queries default to `deletedAt: null`.
- Phase: P1
- Source: brd.md §13 NFR-17 audit trail implication

**S4-1.3** — As a developer, every mutation writes an `audit_event` row (actor, entity, action, before/after JSON).
- Persona: Eng
- Acceptance: helper called from all repositories; covered by integration test for create/update/delete on Fleet.
- Phase: P1
- Source: brd.md §13 NFR-17

**S4-2.1** — As an analyst, the platform ships with a static Vessel registry seeded from a JSON file (until IHS Markit integration in P4).
- Persona: Analyst
- Acceptance: 50+ vessels loaded; columns: imo, name, type, sub_type, dwt, flag, year_built, builder, owner; unique on `imo`.
- Phase: P1
- Source: brd.md §6.2 (anticipated source), prototype seed

**S4-2.2** — As an analyst, a Lender directory is seeded with the 18+ lenders shown in the prototype.
- Persona: Analyst
- Acceptance: fields: name, kind (bank/fund/leasing), country, all_in_rate_typical, ltv_typical, tenor_typical, covenants, recommended_flag.
- Phase: P1
- Source: loan-oracle.html, brd.md §7.7 LO-2

**S4-2.3** — As a developer, segment metadata (Bulk, Tanker, Container, Gas + sub-segments) is centralised.
- Persona: Eng
- Acceptance: seed file, TypeScript enum, colour map; consumed by Segment Pills.
- Phase: P1
- Source: brd.md §5.2, prototype-wide

**S4-3.1** — As a developer, every user-generated entity from the modules is modelled.
- Persona: Eng
- Acceptance: models for `Fleet`, `FleetVessel`, `Project`, `ProjectVessel`, `Vessel` (instance), `VesselDocument`, `CashflowModel`, `LoanFacility`, `Covenant`, `ValuationCertificate`, `AlertRule`, `AlertEvent`, `Watchlist`, `MarketReportSubscription`, `SavedSearch` exist.
- Phase: P1–P3 progressive
- Source: brd.md §6.5

**S4-4.1** — As a developer, time-series tables use TimescaleDB hypertables.
- Persona: Eng
- Acceptance: hypertables for `fmv_history`, `freight_index`, `rate_history`, `ais_position`; partition by `time` daily.
- Phase: P2
- Source: brd.md §11.3

**S4-5.1** — As a developer, `pnpm db:seed` produces a working demo dataset.
- Persona: Eng
- Acceptance: 2 demo organisations, 10 users across roles, 14 vessels in 2 fleets, 5 projects, 4 cashflow models, 18 lenders, 90 days of FMV/index history, 30 alert events.
- Phase: P1
- Source: prototype data

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T4-1.1.1 | Define base Prisma fields helper (id, ts, soft-delete, org) | P1 | F1 ready | new |
| T4-1.1.2 | CI lint script: every user-data model uses base helper | P1 | T4-1.1.1 | new |
| T4-1.2.1 | Repository layer with soft-delete defaults | P1 | T4-1.1.1 | new |
| T4-1.3.1 | `audit_event` model + `auditedMutation` helper | P1 | T4-1.2.1 | brd.md §13 NFR-17 |
| T4-1.3.2 | Integration test covering CRUD audit emission on Fleet | P1 | T4-1.3.1 | new |
| T4-2.1.1 | `Vessel` registry model + JSON seed of 50 vessels | P1 | T4-1.1.1 | brd.md §6.2 |
| T4-2.2.1 | `Lender` model + JSON seed of 18 lenders | P1 | T4-1.1.1 | loan-oracle.html |
| T4-2.3.1 | `Segment` and `SubSegment` enums + colour map | P1 | T4-1.1.1 | brd.md §5.2 |
| T4-3.1.1 | `Fleet` and `FleetVessel` models | P1 | T4-2.1.1 | brd.md §7.2 |
| T4-3.1.2 | `Project` and `ProjectVessel` models | P3 | T4-3.1.1 | brd.md §7.5 |
| T4-3.1.3 | `CashflowModel`, `CashflowAssumption`, `CashflowOutput` models | P1 | T4-3.1.1 | brd.md §7.7 CF-* |
| T4-3.1.4 | `LoanFacility`, `Covenant`, `LoanTransaction` models | P1 | T4-3.1.1 | brd.md §7.7 LO-* |
| T4-3.1.5 | `ValuationCertificate`, `Comparable` models | P1 | T4-3.1.1 | brd.md §7.6 VA-* |
| T4-3.1.6 | `AlertRule`, `AlertEvent` models | P1 | T4-3.1.1 | brd.md §7.11 AL-* |
| T4-3.1.7 | `Watchlist`, `SavedSearch`, `MarketReportSubscription` models | P3 | T4-3.1.1 | competitor-analysis.html, market-reports.html |
| T4-3.1.8 | `VesselDocument` model + S3-compatible blob storage hook | P2 | T4-2.1.1 | vessels.html R-10 |
| T4-4.1.1 | Add TimescaleDB extension migration | P2 | T4-1.1.1 | brd.md §11.3 |
| T4-4.1.2 | Hypertables: `fmv_history`, `freight_index`, `rate_history`, `ais_position` | P2 | T4-4.1.1 | brd.md §11.3 |
| T4-5.1.1 | `pnpm db:seed` script producing the demo dataset | P1 | T4-2.*, T4-3.* | prototype data |
| T4-5.1.2 | Document seed data in `docs/TechnicalGuides/Database.md` | P1 | T4-5.1.1 | new |

---

## F5. External Integrations & Market Data Layer

**Phase:** P2 · **Status:** Planned · **Source:** `brd.md §6.1–6.4`, `brd.md §11.4`

**Purpose.** Pluggable adapters for each external data provider, fed into a market-data store with TTL caching. In P1, providers may return canned fixtures; the abstraction is what matters so we can swap fixtures for real APIs without touching consumers.

### Epics

- **E5-1** — Provider abstraction (`MarketDataProvider` interface)
- **E5-2** — Fixture providers (P1) and live providers (P2+)
- **E5-3** — Scheduled jobs / cron
- **E5-4** — TTL cache (Redis or in-memory in dev)

### Stories

**S5-1.1** — As a developer, every external dataset is accessed through a `MarketDataProvider` interface returning typed results.
- Persona: Eng
- Acceptance: interfaces defined for FreightIndex, TceRate, AskingPrice, NewbuildingPrice, AisPosition, OwnershipHistory, ClassSurvey, SofrRate, EuriborRate, FxRate, EuaPrice, CarbonCreditPrice.
- Phase: P2
- Source: brd.md §6

**S5-2.1** — As a developer, P1 ships fixture providers for every interface.
- Persona: Eng
- Acceptance: each provider returns realistic deterministic data; UI screens render against fixtures.
- Phase: P1
- Source: prototype seed values

**S5-2.2** — As a developer, P2 swaps select providers for live REST adapters.
- Persona: Eng
- Acceptance: env-var-driven `PROVIDER_<X>=fixture|live`; live adapters covered by recorded fixtures in tests.
- Phase: P2
- Source: brd.md §11.4

**S5-3.1** — As a developer, a job runner refreshes daily-cadence providers.
- Persona: Eng
- Acceptance: cron at 06:00 UTC pulls SOFR/EURIBOR/EUA/FX; failures alert via F8.
- Phase: P2
- Source: brd.md §6.1, §11.4

**S5-4.1** — As a developer, fetched data is cached at the documented TTL (5 min indices, 15 min rates, vessel registry weekly).
- Persona: Eng
- Acceptance: cache helper around providers; TTL respected; cache hits and misses observable via F8 metrics.
- Phase: P2
- Source: brd.md §11.3 Redis

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T5-1.1.1 | Define provider interfaces in `lib/providers/` | P2 | F4 ready | brd.md §6 |
| T5-1.1.2 | Add OpenAPI typegen helper for provider response shapes | P2 | T5-1.1.1 | new |
| T5-2.1.1 | Implement fixture providers (one per interface) | P1 | T5-1.1.1 | new |
| T5-2.2.1 | Live provider for Baltic Exchange freight indices | P2 | T5-2.1.1 | brd.md §6.1 |
| T5-2.2.2 | Live provider for SOFR/EURIBOR rates | P2 | T5-2.1.1 | brd.md §6.3 |
| T5-2.2.3 | Live provider for AIS positions | P3 | T5-2.1.1 | brd.md §6.2 |
| T5-2.2.4 | Live provider for EU ETS allowance price | P3 | T5-2.1.1 | brd.md §6.4 |
| T5-3.1.1 | Cron runner (e.g. node-cron or Vercel cron) | P2 | T5-1.1.1 | new |
| T5-3.1.2 | Wire daily refresh jobs and persist to TimescaleDB | P2 | T5-3.1.1, T4-4 | brd.md §11.4 |
| T5-4.1.1 | Cache helper with documented TTLs | P2 | T5-3.1.2 | brd.md §11.3 |

---

## F6. Notifications & Mail Subsystem

**Phase:** P1 · **Status:** Planned · **Source:** `brd.md §12 Phase 4 (email notifications)`, `brd.md §14 OI-11`, task brief §4

**Purpose.** Single mail layer used for transactional email (password reset, alert digests, certificate generation success) and (in P4) configurable digests. Same code path for Mailpit (dev) and Mailgun (prod).

### Epics

- **E6-1** — Transport abstraction (Nodemailer over SMTP)
- **E6-2** — Email templates & rendering
- **E6-3** — Alert digest scheduler
- **E6-4** — In-app notifications (UI bell icon → list)

### Stories

**S6-1.1** — As a developer, `lib/mail.ts` exposes a singleton transporter and a `sendMail({ to, subject, html, text })` helper validated by Zod.
- Persona: Eng
- Acceptance: env-driven host/port/user/pass; works against Mailpit in dev and Mailgun in prod with no code change.
- Phase: P1
- Source: task brief §4

**S6-1.2** — As a developer, dev-only `GET /api/dev/mail-test` sends a sample email and returns `{ ok, messageId }`.
- Persona: Eng
- Acceptance: returns 404 outside `NODE_ENV=development`.
- Phase: P1
- Source: task brief §4

**S6-2.1** — As a developer, email templates are React components rendered server-side to MJML or plain HTML.
- Persona: Eng
- Acceptance: shared layout component; subject + preview text per template; templates rendered in Storybook.
- Phase: P2
- Source: new

**S6-3.1** — As a user, I can opt into a daily/weekly alert digest emailed to me.
- Persona: All
- Acceptance: profile preference; cron sends digest of unread alerts; opt-out link in email.
- Phase: P4
- Source: brd.md §12 Phase 4

**S6-4.1** — As a user, I see an unread-count badge on the topbar bell linking to `/alerts`.
- Persona: All
- Acceptance: badge driven by `AlertEvent` count where `read_at IS NULL`; live updates via polling (P1) or websockets (P4).
- Phase: P1
- Source: brd.md §7.11 AL-2, dashboard.html

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T6-1.1.1 | Install Nodemailer; create singleton transporter | P1 | F4 ready | task brief §4 |
| T6-1.1.2 | Implement `sendMail` with Zod validation | P1 | T6-1.1.1 | task brief §4 |
| T6-1.1.3 | Add transporter `verify()` to health endpoint | P1 | T6-1.1.1 | task brief §5 |
| T6-1.2.1 | Build `/api/dev/mail-test` route | P1 | T6-1.1.2 | task brief §4 |
| T6-2.1.1 | Email layout component (MJML or React Email) | P2 | T6-1.1.2 | new |
| T6-2.1.2 | Templates: password reset, account invite, alert digest | P2 | T6-2.1.1 | new |
| T6-3.1.1 | Daily digest cron job | P4 | T6-2.1.2, M27 | brd.md §12 Phase 4 |
| T6-4.1.1 | Topbar bell with unread badge | P1 | F2 topbar | dashboard.html |
| T6-4.1.2 | Live polling for new alert count (every 60 s) | P1 | T6-4.1.1 | new |

---

## F7. Exports, Reporting & PDF

**Phase:** P1 (PDF certs) · **Status:** Planned · **Source:** `brd.md §7.6 VA-9/VA-10`, `brd.md §13 NFR-13`

**Purpose.** Centralised, server-side generation of PDFs (Valuation Certificates) and CSV/Excel exports, used by every module that needs to ship data outside the app.

### Epics

- **E7-1** — PDF service (Puppeteer or Playwright)
- **E7-2** — CSV/Excel export helpers
- **E7-3** — Async export queue (P3+)

### Stories

**S7-1.1** — As a developer, a `pdf.render(template, data)` helper returns a PDF buffer.
- Persona: Eng
- Acceptance: headless Chromium via Playwright; templates are React Server Components rendered to HTML and printed.
- Phase: P1
- Source: brd.md §11.4

**S7-1.2** — As an analyst, the Valuation Certificate PDF matches `brd.md §7.6 VA-10` layout.
- Persona: Analyst, Compliance
- Acceptance: vessel info block, FMV + confidence, methodology, comparables excerpt, signatory, certificate ID; ≤ 10 s generation (NFR-3).
- Phase: P1
- Source: brd.md §7.6 VA-10

**S7-2.1** — As a user, I can export any data table to CSV.
- Persona: All
- Acceptance: helper accepts column definitions and row data; streaming response for large tables.
- Phase: P1
- Source: brd.md §13 NFR-13

**S7-2.2** — As an analyst, I can export a Cashflow model to Excel.
- Persona: Analyst
- Acceptance: ExcelJS template with assumptions, P&L, scenarios; download under 5 s for typical model.
- Phase: P2
- Source: brd.md §7.7 CF-6

**S7-3.1** — As a user, large exports (full transaction log, bulk certificate ZIP) run async and notify me on completion.
- Persona: All
- Acceptance: `Export` model with status, progress; email + in-app notification on completion.
- Phase: P3
- Source: brd.md §7.6 VA-11

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T7-1.1.1 | Install Playwright; build `pdf.render()` helper | P1 | F4 | brd.md §11.4 |
| T7-1.1.2 | Implement Valuation Certificate template (RSC) | P1 | T7-1.1.1, M13 base | brd.md §7.6 VA-10 |
| T7-1.1.3 | Performance test: certificate < 10 s | P1 | T7-1.1.2 | brd.md §13 NFR-3 |
| T7-2.1.1 | Streaming CSV helper | P1 | F4 | brd.md §13 NFR-13 |
| T7-2.2.1 | Cashflow Excel exporter (ExcelJS) | P2 | T7-2.1.1, M19 | brd.md §7.7 CF-6 |
| T7-3.1.1 | `Export` queue model + worker | P3 | F8 | brd.md §7.6 VA-11 |
| T7-3.1.2 | Bulk certificate ZIP exporter | P3 | T7-3.1.1, M13 | brd.md §7.6 VA-11 |

---

## F8. Observability, Audit & Security

**Phase:** P1 · **Status:** Planned · **Source:** `brd.md §11.5`, `brd.md §13 NFR-4/-6/-8/-17`

**Purpose.** Logs, metrics, traces, error reporting, audit trail, security headers, secret management.

### Epics

- **E8-1** — Structured logging
- **E8-2** — Metrics & traces
- **E8-3** — Audit events surfaced (admin view)
- **E8-4** — Security headers & CSP
- **E8-5** — Secret management

### Stories

**S8-1.1** — As an SRE, every server log line is JSON with request_id, user_id, org_id, route, latency_ms.
- Persona: SRE
- Acceptance: Pino logger; correlation id in every log; redacted fields list.
- Phase: P1
- Source: brd.md §11.5

**S8-2.1** — As an SRE, request latency, error rate, and external-provider error rate are exported to Datadog or Prometheus.
- Persona: SRE
- Acceptance: `/metrics` endpoint or Datadog agent; dashboards documented.
- Phase: P2
- Source: brd.md §11.5

**S8-3.1** — As an admin, I can view audit events for my organisation.
- Persona: Admin
- Acceptance: `/settings/audit` table with filters; export CSV.
- Phase: P3
- Source: brd.md §13 NFR-17

**S8-4.1** — As a user, every response sets HSTS, CSP, Referrer-Policy, X-Content-Type-Options.
- Persona: Eng
- Acceptance: Next middleware sets headers; CSP allows only self + Recharts CDN.
- Phase: P1
- Source: brd.md §13 NFR-6

**S8-5.1** — As an SRE, secrets live in AWS Secrets Manager (prod) and `.env.local` (dev).
- Persona: SRE
- Acceptance: deployment pulls secrets at boot; no secrets in repo; CI fails on detected secrets.
- Phase: P2
- Source: brd.md §11.5

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T8-1.1.1 | Install Pino + request id middleware | P1 | — | brd.md §11.5 |
| T8-1.1.2 | Document log schema in TechnicalGuides | P1 | T8-1.1.1 | new |
| T8-2.1.1 | Wire OpenTelemetry SDK | P2 | T8-1.1.1 | brd.md §11.5 |
| T8-2.1.2 | Datadog or Prometheus exporter config | P2 | T8-2.1.1 | brd.md §11.5 |
| T8-3.1.1 | `/settings/audit` admin page | P3 | F4 audit_event | brd.md §13 NFR-17 |
| T8-4.1.1 | Security headers middleware | P1 | — | brd.md §13 NFR-6 |
| T8-4.1.2 | CSP allowlist for assets, fonts, charts | P1 | T8-4.1.1 | brd.md §13 NFR-6 |
| T8-5.1.1 | Production secret-manager integration | P2 | — | brd.md §11.5 |

---

## M01. Dashboard

**Phase:** P1 · **Status:** Planned · **Lead persona:** Portfolio Manager, Owner, Executive
**Source:** `brd.md §7.1` (DB-1..DB-8), `html/dashboard.html`

**Purpose.** Executive-level entry point. Surface portfolio KPIs, market pulse, alerts, and recent activity in a single render with no required interaction.

### Epics

- **E01-1** — Core KPI grid
- **E01-2** — Fleet selector & global context
- **E01-3** — Charts (Historical Valuation, Composition)
- **E01-4** — Market Pulse panel
- **E01-5** — Alert and Activity feeds
- **E01-6** — Map and employment widgets

### Stories

**S01-1.1** — As a Manager, the dashboard renders six headline KPIs above the fold.
- Persona: Manager, Owner
- Acceptance: KPIs are Total Fleets, Total Vessels, Total FMV, Avg Vessel Age, Avg CII / Env. Score, Avg LTV; each has label, value, change indicator, and meta line; render in < 2 s on first visit.
- Phase: P1
- Source: dashboard.html:619-660, brd.md §7.1 DB-1, NFR-1

**S01-2.1** — As a user, I can switch the dashboard between All Fleets and a single fleet.
- Persona: All
- Acceptance: dropdown above the KPI grid; selection re-fetches all KPIs/charts; persists per session.
- Phase: P1
- Source: dashboard.html:596-602, brd.md §7.1 DB-2

**S01-2.2** — As a user, alert pills next to the fleet selector show counts by severity (HIGH / MEDIUM / LOW / INFO).
- Persona: All
- Acceptance: counts driven by live alert query; clicking a pill links to the matching alerts filter.
- Phase: P1
- Source: dashboard.html:603-616

**S01-3.1** — As a Manager, I see fleet historical FMV with 12M / 3Y / 5Y toggles.
- Persona: Manager
- Acceptance: line chart with toggle group; data range honoured; clicking a point opens valuations module for that period.
- Phase: P1
- Source: brd.md §7.1 DB-3

**S01-3.2** — As a Manager, I see fleet composition by vessel type as a donut.
- Persona: Manager
- Acceptance: matches prototype donut; legend shows count and % per type.
- Phase: P1
- Source: brd.md §7.1 DB-4, dashboard.html

**S01-4.1** — As an analyst, the Market Pulse panel shows BDI, BCI, BPI, VLCC TCE, SOFR, USD/EUR with trend indicators and sparklines.
- Persona: Analyst
- Acceptance: 6 mini-cards in a row; data from F5 freight/rate providers; sparkline for last 30 days.
- Phase: P1 (fixture data) → P2 (live)
- Source: brd.md §7.1 DB-5

**S01-5.1** — As an Owner, I see open alerts (HIGH/MEDIUM/LOW) with one-click navigation to detail.
- Persona: Owner
- Acceptance: list of last 5 unread alerts; severity colour coding + label; click → /alerts/[id].
- Phase: P1
- Source: brd.md §7.1 DB-7

**S01-5.2** — As an Owner, I see recent activity (valuations completed, loans updated, vessels added).
- Persona: Owner
- Acceptance: last 5 events with relative time, actor, and target link.
- Phase: P1
- Source: brd.md §7.1 DB-8

**S01-5.3** — As a Broker, I see the 5 most recent S&P transactions.
- Persona: Broker, Manager
- Acceptance: list pulls from M09; clicking an item opens the transaction in S&P Transactions.
- Phase: P1
- Source: brd.md §7.1 DB-6, dashboard.html

**S01-6.1** — As a user, I see employment status of the fleet at a glance.
- Persona: Manager
- Acceptance: small chart or stacked bar showing TC vs spot vs idle; matches prototype "Employment Status" section label.
- Phase: P2
- Source: dashboard.html

**S01-6.2** — As a user, I see CII rating distribution for my fleet.
- Persona: Compliance, Manager
- Acceptance: stacked bar A–E; counts match `Environmental Score` summary.
- Phase: P2
- Source: dashboard.html "CII Rating Distribution"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T01-1.1.1 | `/dashboard` route + page header + breadcrumb | P1 | F2 | dashboard.html |
| T01-1.1.2 | Implement KPI grid component using `<KpiCard>` | P1 | F3 KpiCard | brd.md §7.1 DB-1 |
| T01-1.1.3 | Compute KPIs server-side aggregating from F4 fleets/vessels | P1 | F4 fleets | brd.md §7.1 DB-1 |
| T01-1.1.4 | Performance test: page render < 2 s | P1 | T01-1.1.3 | brd.md §13 NFR-1 |
| T01-2.1.1 | Fleet selector component + URL query param `fleet` | P1 | M02 base | brd.md §7.1 DB-2 |
| T01-2.2.1 | Alert pill row driven by `AlertEvent` aggregate | P1 | M27 base | dashboard.html |
| T01-3.1.1 | Historical FMV line chart via `<Chart>` adapter | P1 | F3 Chart | brd.md §7.1 DB-3 |
| T01-3.1.2 | 12M/3Y/5Y toggle wiring | P1 | T01-3.1.1 | brd.md §7.1 DB-3 |
| T01-3.2.1 | Composition donut chart | P1 | F3 Chart | brd.md §7.1 DB-4 |
| T01-4.1.1 | Market Pulse strip with 6 mini-cards | P1 | F5 fixture | brd.md §7.1 DB-5 |
| T01-4.1.2 | Sparkline component reused per pulse card | P1 | F3 Sparkline | brd.md §7.1 DB-5 |
| T01-5.1.1 | Open Alerts feed component | P1 | M27 base | brd.md §7.1 DB-7 |
| T01-5.2.1 | Recent Activity feed driven by `audit_event` | P1 | F4 audit | brd.md §7.1 DB-8 |
| T01-5.3.1 | Recent S&P Transactions feed (5 latest) | P1 | M09 base | brd.md §7.1 DB-6 |
| T01-6.1.1 | Employment status widget | P2 | M15 | dashboard.html |
| T01-6.2.1 | CII distribution stacked bar | P2 | M25 base | dashboard.html |

---

## M02. My Fleet (FleetSpace)

**Phase:** P1 · **Status:** Planned · **Lead persona:** Owner, Portfolio Manager
**Source:** `brd.md §7.2` (FL-1..FL-8), `html/my-fleet.html`

**Purpose.** Organise vessels into named fleets, drill into vessels via in-page tabs (embedded Vessel Detail), monitor employment timeline and TC expirations.

### Epics

- **E02-1** — Fleet list & switching
- **E02-2** — Vessel table with filters
- **E02-3** — Inline vessel tabs (embedded Vessel Detail)
- **E02-4** — Employment widgets
- **E02-5** — Fleet management actions

### Stories

**S02-1.1** — As an Owner, I can view all my fleets and switch between them via tabs.
- Persona: Owner, Manager
- Acceptance: tab per fleet with vessel-count badge; active fleet renders below; URL reflects active fleet.
- Phase: P1
- Source: brd.md §7.2 FL-1, my-fleet.html

**S02-2.1** — As a Manager, the vessel table shows the columns from FL-2.
- Persona: Manager
- Acceptance: IMO, Name, Type, Flag, Year Built, DWT, FMV, CII badge, Env Score; sortable; default sort by name.
- Phase: P1
- Source: brd.md §7.2 FL-2

**S02-2.2** — As a Manager, I can filter the vessel table by type, year-built range, and name search.
- Persona: Manager
- Acceptance: filter bar above table; filters compose; result count updates live.
- Phase: P1
- Source: brd.md §7.2 FL-3

**S02-3.1** — As a Manager, clicking a vessel name opens a persistent in-page tab embedding Vessel Detail.
- Persona: Manager
- Acceptance: tab strip beside fleet name; multiple tabs can be open; each individually closable; tabs survive returning to fleet list.
- Phase: P1
- Source: brd.md §7.2 FL-4, FL-5

**S02-3.2** — As a Manager, fleet context widgets are hidden while a vessel tab is active.
- Persona: Manager
- Acceptance: viewing label, stats row, employment widgets collapse when vessel tab active; restore on returning.
- Phase: P1
- Source: brd.md §7.2 FL-6

**S02-4.1** — As an Ops Manager, I see an Employment Timeline for the active fleet showing TC vs Spot vs Idle vs Drydock.
- Persona: Ops, Manager
- Acceptance: Gantt-style timeline keyed by `EmploymentTimeline` component; covers current year by default.
- Phase: P2
- Source: my-fleet.html "Employment Timeline — 2026"

**S02-4.2** — As an Ops Manager, I see upcoming TC expirations for the active fleet.
- Persona: Ops, Manager
- Acceptance: list with vessel, charterer, end date, current rate, action (`Renew TC`, `Fix TC`).
- Phase: P2
- Source: my-fleet.html "Upcoming TC Expirations"

**S02-5.1** — As an Owner, I can create, rename, and delete fleets.
- Persona: Owner, Manager
- Acceptance: actions in fleet header; rename inline; delete confirms; soft-delete only.
- Phase: P1
- Source: brd.md §7.2 FL-7, create-fleet.html

**S02-5.2** — As an Owner, I can add and remove vessels from a fleet.
- Persona: Owner
- Acceptance: "Add Vessel" opens combobox over registry; "Remove" on row with confirm.
- Phase: P1
- Source: brd.md §7.2 FL-7

**S02-5.3** — As an analyst, I can export the current fleet to CSV/Excel.
- Persona: Analyst, Manager
- Acceptance: export uses F7 helper; respects filters; filename includes fleet name and date.
- Phase: P2
- Source: brd.md §7.2 FL-8

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T02-1.1.1 | `/fleets` route with fleet tabs and active-fleet route param | P1 | F2 | my-fleet.html |
| T02-1.1.2 | `Fleet`/`FleetVessel` repository functions | P1 | F4 | brd.md §7.2 |
| T02-2.1.1 | Vessel table component with sortable columns | P1 | F3 table | brd.md §7.2 FL-2 |
| T02-2.2.1 | Filter bar (type, year built, name) | P1 | F3 | brd.md §7.2 FL-3 |
| T02-3.1.1 | In-page tab strip + multi-tab state | P1 | F2 | brd.md §7.2 FL-4 |
| T02-3.1.2 | Render embedded Vessel Detail in active tab | P1 | M06, F2 embedded | brd.md §7.2 FL-5 |
| T02-3.2.1 | Hide/restore fleet context widgets on vessel tab activate | P1 | T02-3.1.1 | brd.md §7.2 FL-6 |
| T02-4.1.1 | Employment Timeline component | P2 | F3 EmploymentTimeline, M15 | my-fleet.html |
| T02-4.2.1 | Upcoming TC Expirations list | P2 | F4 | my-fleet.html |
| T02-5.1.1 | Create / rename / delete fleet actions | P1 | T02-1.1.2 | brd.md §7.2 FL-7 |
| T02-5.2.1 | Add / remove vessel actions | P1 | T02-1.1.2 | brd.md §7.2 FL-7 |
| T02-5.3.1 | CSV/Excel export of vessel table | P2 | F7 | brd.md §7.2 FL-8 |

### Implementation status — OT-175 (May 2026)

The Fleets listing and Create Fleet form ship as part of OT-175. What's
landed and what's still parked for later sprints:

| Story | Status | Notes |
|---|---|---|
| S02-1.1 (tabs + active fleet) | **Done** | All-Fleets list + per-fleet openable tabs; URL `?created=<id>` carries the create-flow success banner. |
| S02-2.1 (vessel table columns) | **Done (initial)** | Name, IMO, Type, Year, DWT, Env, FMV, On-Sale. Resale / Newbuild / ValCert columns parked until M06 valuation cert data lands. |
| S02-2.2 (filters) | **Done** | Type / Year-Built bucket / name search, client-side over the loaded page. |
| S02-3.1 (vessel detail tabs) | **Done** | `/fleetspace` now renders a vessel-browser-bar inside the fleet view: "All Vessels (count)" + per-vessel openable sub-tabs (closeable). Clicking a vessel name in the fleet table opens that vessel as a sub-tab; content lazy-loads via `/api/vessels/[id]` and is cached client-side so re-opening is instant. |
| S02-3.2 (context widget collapse) | **Done** | The fleet KPI row + filter bar belong to the All Vessels sub-tab and only render when it's active. Switching to a vessel sub-tab swaps in `VesselDetailTabs` (Main Information + the seven M06+ placeholder tabs) so the fleet context is implicitly hidden. |
| S02-4.1 (Employment Timeline) | Pending | Needs Employment + Charterer model (M02 — planned for OT-176+). |
| S02-4.2 (TC Expirations) | Pending | Same — needs Employment model. |
| S02-5.1 (create + rename + delete) | **Create done** | Rename/delete come with the row-actions step. |
| S02-5.2 (add / remove vessel) | **Add done (via create form)** | Per-row Add/Remove on fleet detail tracked for the row-actions step. |
| S02-5.3 (CSV/Excel export) | Pending | F7 helper not built yet. |

Architecture: `web/docs/architecture/fleets-and-vessels.md`.

---

## M03. Add Vessel & Create Fleet

**Phase:** P1 · **Status:** Planned · **Lead persona:** Owner, Portfolio Manager
**Source:** `html/add-vessel.html`, `html/create-fleet.html`, `brd.md §7.2 FL-7` (R-11)

**Purpose.** Two onboarding wizards: registering a new vessel and creating a fleet group. Prototype-only: not described in `brd.md` beyond FL-7.

### Epics

- **E03-1** — Add Vessel wizard
- **E03-2** — Create Fleet wizard
- **E03-3** — IMO lookup integration

### Stories

**S03-1.1** — As an Owner, I can register a new vessel via a guided form covering Identification, Specifications, Commercial & Financial, and Notes.
- Persona: Owner, Manager
- Acceptance: matches prototype card sections; validation per section; "Save as Draft" persists incomplete; success links to Vessel Detail.
- Phase: P1
- Source: add-vessel.html

**S03-1.2** — As an Owner, I can look up a vessel by IMO and pre-fill the form.
- Persona: Owner, Manager
- Acceptance: "Look up" button calls `Vessel` registry; populates fields; user can override.
- Phase: P1
- Source: add-vessel.html "Look up" button

**S03-2.1** — As an Owner, I can create a fleet by name and assign vessels.
- Persona: Owner, Manager
- Acceptance: fleet name unique within org; multi-select vessels; redirect to new fleet.
- Phase: P1
- Source: create-fleet.html

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T03-1.1.1 | `/vessels/new` page with sectioned form | P1 | F3 form | add-vessel.html |
| T03-1.1.2 | Zod schema covering all four sections | P1 | T03-1.1.1 | add-vessel.html |
| T03-1.1.3 | Save as Draft persistence | P1 | T03-1.1.1, F4 | add-vessel.html |
| T03-1.2.1 | IMO lookup endpoint backed by `Vessel` registry | P1 | F4 | add-vessel.html |
| T03-1.2.2 | Wire lookup to populate form | P1 | T03-1.2.1 | add-vessel.html |
| T03-2.1.1 | `/fleets/new` page + form | P1 | M02 base | create-fleet.html |
| T03-2.1.2 | Multi-select vessels combobox | P1 | F3 combobox | create-fleet.html |

### Implementation status — OT-175 (May 2026)

The Add Vessel flow ships as part of OT-175. What landed and what's still
parked for later sprints:

| Story | Status | Notes |
|---|---|---|
| S03-1.1 (sectioned form) | **Done** | `/vessels/new` renders Identification, Specifications, Commercial & Financial, Notes; submits via `createVesselAction` server action; redirects to `/vessels/{id}?created=1`. |
| S03-1.2 (IMO lookup) | Pending | Quick Lookup card shows a "coming soon" placeholder; Signal Ocean client + `/api/vessels/lookup` route land in OT-177. |
| S03-2.1 (create fleet) | **Done** (OT-175 earlier batch) | See M02 implementation table. |
| "Save as Draft" (T03-1.1.3) | Pending | The schema models lifecycle = ACTIVE / DRYDOCK / LAID_UP / UNDER_REPAIR / RETIRED, but there's no `DRAFT` state today. Will be added with the edit flow. |

**Vessel-type picker decision.** The form uses a two-level picker: parent
`VesselType` (Bulk, Tanker, Gas, …) feeds a subtype dropdown filtered
client-side. The hidden `vesselTypeId` input that posts to the action is
always the leaf id (subtype) if available, otherwise the parent id. The
parent/subtype dataset is fetched once via `ReferenceService.loadAddVesselData()`.

**Schema expansion (OT-175 batch 12).** The Add Vessel form was rebuilt to
mirror the latest `html/add-vessel.html` prototype, adding ~80 new
nullable columns to the Vessel model across 17 sections — Vessel
Identification extras (flagCode, classRenewalDate), Vessel Type &
Classification (builtForTrade, currentTrade, designModel, iceClass,
propulsionType, cleanDirtyWilling), Build & Delivery (builtCountry,
yardNumber, deliveryDate, scrappedDate), Principal Dimensions extras
(mouldedDepthM, airDraughtM, lightshipT, summerTpc), Tonnage (reducedGrt,
panamaCanalNrt, suezCanalNrt), Cargo Capacity (cubicSizeM3, grainCapacityM3,
baleCapacityM3, teu/teuAt14t/deckTeu/underDeckTeu, reefers), Holds /
Hatches / Cranes & Grabs (counts + 4 text-details + 8 equipment-fitted
booleans), Parallel Body Length (laden/ballast/empty), Manifold (4
tanker dimensions), Tanker Equipment (imoType, 3 system booleans, 5
coating ints), Bow Equipment (chain stoppers + thrusters), Main Engine
(manufacturer, powerKw, rpm, mewisDuct), Gas Carrier (containment, temp,
pressure, 3 cargo booleans), Environmental & Compliance (ghgRating,
scrubbersInstalledDate, BWTS, neoPanamaLocks, sternLine), Operators &
Owners (commercialOperator, beneficialOwner). Plus two new related
tables: `VesselOrderBookEntry` (1:1, 5 dates + status enum for
newbuilds) and `VesselSanctionEntry` (many-per-vessel: authority,
program, dates, description). All new fields are optional/nullable so
existing forms / API consumers stay backwards-compatible. Vessel
detail-page projection is unchanged in this batch — the new fields are
returned by the repository but not yet rendered until the next UI
iteration.

**Vessel detail page.** `/vessels/[imo]/page.tsx` now treats its dynamic
segment as a Prisma CUID (not an IMO) per ADR-0002. The directory name is
preserved to avoid a permission-gated rename; a follow-up housekeeping step
will rename to `[id]`.

The page mirrors `html/vessel-details.html`'s Main Information tab one-
for-one: a hero card (real image when `heroImageUrl` is set, gradient +
ship icon placeholder otherwise), a 2×2 KPI grid (DWT / Year Built / FMV
/ Env Score), a Vessel Profile + Technical Specifications row, then a
Current Employment + Certificates & Documents + Ownership History row.
Real DB values are used wherever they exist; placeholder copy points to
the future module otherwise (Employment → M02, Certificates / Ownership
edit UI → M06 Vessel Detail).

The prototype's other 7 sub-tabs — Valuations, Net Fleet, Financial
Transactions, Earnings & Expenses, IRR, Environmental Score, Valuation
Certificates — render with their tab strip + a `ComingInModulePlaceholder`
card pointing at the owning module's ticket. Tab state is mirrored to
`?tab=<key>` in the URL so deep links work.

Edit / Delete actions are placeholders pending the row-actions step.

Architecture: `web/docs/architecture/fleets-and-vessels.md`.

---

## M04. Vessel Search

**Phase:** P1 · **Status:** Planned · **Lead persona:** Broker, Analyst
**Source:** `brd.md §7.3 VS-1`, `html/vessels.html` (R-10)

**Purpose.** Single-vessel lookup by IMO or name with autocomplete and recent searches; per-vessel Market Intelligence and Documents tabs.

### Epics

- **E04-1** — IMO/name lookup
- **E04-2** — Per-vessel Market Intelligence sub-tab
- **E04-3** — Per-vessel Documents sub-tab (uploads)

### Stories

**S04-1.1** — As a Broker, I can search vessels by IMO or name with autocomplete.
- Persona: Broker, Analyst
- Acceptance: autocomplete shows top 5 matches; Enter navigates to Vessel Detail; recent searches persist last 10.
- Phase: P1
- Source: brd.md §7.3 VS-1, vessels.html

**S04-1.2** — As a user, I can apply quick filters (type, flag) on search results.
- Persona: Broker
- Acceptance: filter pills above results; multi-select.
- Phase: P1
- Source: brd.md §7.3 VS-1

**S04-2.1** — As a Broker, the Market Intelligence tab shows comparable sales, FMV trend, TC rate history, and segment outlook for the selected vessel.
- Persona: Broker
- Acceptance: charts populated from F5; matches `vessels.html` sections.
- Phase: P2
- Source: vessels.html

**S04-3.1** — As an Analyst, I can upload supporting documents for a vessel and list them.
- Persona: Analyst
- Acceptance: drag-and-drop upload; supported types pdf/docx/xlsx/jpg/png; size limit 25MB; soft-deletable; stored via S3-compatible blob storage.
- Phase: P2
- Source: vessels.html "Vessel Documents" / "Upload Document"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T04-1.1.1 | `/vessels` route with combobox autocomplete | P1 | F3 combobox | vessels.html |
| T04-1.1.2 | Recent searches stored in `User` profile | P1 | F1 | new |
| T04-1.2.1 | Filter pills (type, flag) | P1 | F3 | brd.md §7.3 VS-1 |
| T04-2.1.1 | Market Intelligence sub-tab implementation | P2 | F5, M12, M14, M15 | vessels.html |
| T04-3.1.1 | `VesselDocument` model + upload endpoint | P2 | F4 | vessels.html |
| T04-3.1.2 | Documents list with download / delete actions | P2 | T04-3.1.1 | vessels.html |

---

## M05. Advanced Search

**Phase:** P3 · **Status:** Planned · **Lead persona:** Broker, Analyst
**Source:** `brd.md §7.3 VS-2/VS-3`, `html/advanced-search.html`

**Purpose.** Multi-criteria vessel discovery with sticky filter panel, saved searches, and watchlists.

### Epics

- **E05-1** — Sticky filter panel
- **E05-2** — Result grid/list with sort
- **E05-3** — Saved Searches
- **E05-4** — Watchlist

### Stories

**S05-1.1** — As an Analyst, I can build a vessel query with type checkboxes, year-built range, DWT range, flag, CII grade, price range.
- Persona: Analyst, Broker
- Acceptance: filters compose; result count updates live; active-filter chips with remove buttons.
- Phase: P3
- Source: brd.md §7.3 VS-2

**S05-2.1** — As an Analyst, I can switch result view between grid and list and sort by relevance/price/age/size.
- Persona: Analyst
- Acceptance: toggle persists per session; sort respects active sort key.
- Phase: P3
- Source: brd.md §7.3 VS-3

**S05-3.1** — As an Analyst, I can save a search and re-run it later.
- Persona: Analyst
- Acceptance: `SavedSearch` model; named save; runs as a single click.
- Phase: P3
- Source: advanced-search.html

**S05-4.1** — As an Analyst, I can add vessels to my Watchlist.
- Persona: Analyst, Broker
- Acceptance: `Watchlist` model; add from search results; view in dedicated tab.
- Phase: P3
- Source: advanced-search.html

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T05-1.1.1 | `/vessels/advanced-search` route with sticky filter panel | P3 | F3 | advanced-search.html |
| T05-1.1.2 | Active-filter chip strip with remove buttons | P3 | T05-1.1.1 | brd.md §7.3 VS-2 |
| T05-2.1.1 | Grid/List toggle component | P3 | F3 | brd.md §7.3 VS-3 |
| T05-2.1.2 | Sort selector | P3 | F3 | brd.md §7.3 VS-3 |
| T05-3.1.1 | `SavedSearch` model + persistence | P3 | F4 | advanced-search.html |
| T05-3.1.2 | Saved Searches sub-tab | P3 | T05-3.1.1 | advanced-search.html |
| T05-4.1.1 | `Watchlist` model + add/remove actions | P3 | F4 | advanced-search.html |
| T05-4.1.2 | Watchlist sub-tab | P3 | T05-4.1.1 | advanced-search.html |

---

## M06. Vessel Detail

**Phase:** P1 · **Status:** Planned · **Lead persona:** All
**Source:** `brd.md §7.3 VS-4/VS-5/VS-6`, `html/vessel-details.html` (R-2 reconciliation)

**Purpose.** Single canonical vessel screen with eight sub-tabs. Renders identically as a full page or embedded inside My Fleet (R-3 resolution: route group + layout suppression rather than iframe).

### Epics

- **E06-1** — Page header (vessel hero) + breadcrumb
- **E06-2** — Main Information tab
- **E06-3** — Valuations tab
- **E06-4** — Net Fleet tab (segment context)
- **E06-5** — Financial Transactions tab
- **E06-6** — Earnings & Expenses tab
- **E06-7** — IRR tab
- **E06-8** — Environmental Score tab
- **E06-9** — Valuation Certificates tab
- **E06-10** — Embedded mode parity

### Stories

**S06-1.1** — As a user, the vessel header shows name, type, build year, IMO, DWT.
- Persona: All
- Acceptance: matches `vessel-details.html:hero`: "Panamax Bulk Carrier · Built 2016 · IMO 9623148 · 82,000 DWT".
- Phase: P1
- Source: vessel-details.html

**S06-1.2** — As a user, breadcrumb preserves origin context (fleet, search, S&P listing).
- Persona: All
- Acceptance: covered by F2 S2-3.2.
- Phase: P1
- Source: brd.md §7.3 VS-6

**S06-2.1** — As a user, Main Information shows Vessel Profile, Technical Specifications, Current Employment, Certificates & Documents, Ownership History.
- Persona: All
- Acceptance: card layout; technical specs include LBP, beam, draught, GT/NT, MEP, scrubber, ballast type, ice class, refits, classification society, last drydock; ownership history is a chronological table.
- Phase: P1
- Source: vessel-details.html "Vessel Profile" / "Technical Specifications" / "Ownership History"

**S06-3.1** — As an Analyst, Valuations tab shows historical FMV, newbuilding parity, residual value/fixed age, comparable S&P transactions.
- Persona: Analyst
- Acceptance: charts powered by F5; comparables table sortable.
- Phase: P1
- Source: vessel-details.html "Valuation Historical Development", "Newbuilding Parity", "Residual Value / Fixed Age", "Comparable S&P Transactions"

**S06-4.1** — As a Manager, Net Fleet tab shows segment supply context for the vessel's segment.
- Persona: Manager
- Acceptance: "Net Fleet Development", "Fleet by Sub-Segment", "Segment Position", "Segment Comparison" matching prototype.
- Phase: P2
- Source: vessel-details.html "Net Fleet Development — Panamax Bulk"

**S06-5.1** — As an Analyst, Financial Transactions tab shows segment-specific loan transactions for the vessel.
- Persona: Analyst
- Acceptance: filtered to vessel; matches M17 layout.
- Phase: P2
- Source: vessel-details.html "Financial Transactions — Panamax Bulk Carriers"

**S06-6.1** — As an Ops Manager, Earnings & Expenses tab shows monthly revenue, employment history, OPEX history, peer comparison.
- Persona: Ops, Analyst
- Acceptance: "Monthly Revenue", "Employment History", "Monthly Operating Expenses", "OPEX Breakdown", "OPEX History", "Peer Earnings Comparison", "Peer Expenses Comparison".
- Phase: P2
- Source: vessel-details.html

**S06-7.1** — As an Analyst, IRR tab shows the vessel's contribution to IRR analysis.
- Persona: Analyst
- Acceptance: "Cumulative Cash Flow", "Investment Summary", "Annual P&L Summary", "5-Year Unlevered IRR by Vessel Type".
- Phase: P3
- Source: vessel-details.html

**S06-8.1** — As a Compliance officer, Environmental Score tab shows CII history, EEDI/EEXI compliance, fuel/emissions data.
- Persona: Compliance
- Acceptance: matches M25 vessel-level layout.
- Phase: P3
- Source: vessel-details.html (Environmental Score sub-tab)

**S06-9.1** — As an Analyst, Valuation Certificates tab lists all certificates issued for the vessel.
- Persona: Analyst, Compliance
- Acceptance: matches M13 vessel-scoped table.
- Phase: P1
- Source: vessel-details.html

**S06-10.1** — As a developer, Vessel Detail renders identically in standalone and embedded modes.
- Persona: Eng
- Acceptance: route group `(embedded)/vessels/[imo]` produces a no-shell layout; same component tree powers both routes; visual regression diff is zero outside the shell area.
- Phase: P1
- Source: brd.md §11.1, R-3

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T06-1.1.1 | `/vessels/[imo]` route with hero header | P1 | F2 | vessel-details.html |
| T06-1.2.1 | Wire breadcrumb origin into hero | P1 | F2 S2-3.2 | brd.md §7.3 VS-6 |
| T06-2.1.1 | Main Information tab with profile, specs, employment, certs, ownership cards | P1 | F4 | vessel-details.html |
| T06-3.1.1 | Valuations tab — FMV history, parity, residual, comparables | P1 | M12 | vessel-details.html |
| T06-4.1.1 | Net Fleet tab content | P2 | M14 | vessel-details.html |
| T06-5.1.1 | Financial Transactions tab content | P2 | M17 | vessel-details.html |
| T06-6.1.1 | Earnings & Expenses tab content | P2 | M15, M16 | vessel-details.html |
| T06-7.1.1 | IRR tab content | P3 | M22 | vessel-details.html |
| T06-8.1.1 | Environmental Score tab content | P3 | M25 | vessel-details.html |
| T06-9.1.1 | Valuation Certificates tab content | P1 | M13 | vessel-details.html |
| T06-10.1.1 | `(embedded)/vessels/[imo]` route group | P1 | F2 S2-5.1 | brd.md §11.1 |
| T06-10.1.2 | Visual regression covering both modes | P1 | T06-10.1.1, F3 storybook | new |

---

## M07. Owner Profile

**Phase:** P3 · **Status:** Planned · **Lead persona:** Broker, Manager
**Source:** `html/owner.html` (R-12; not in brd.md)

**Purpose.** Display owner-level profile aggregating fleet, S&P activity, financials, and contacts. Useful when researching a counterparty for an acquisition.

### Epics

- **E07-1** — Owner directory & detail page
- **E07-2** — Owner sub-tabs (Overview, Fleet, S&P Activity, Financials, Contacts)

### Stories

**S07-1.1** — As a Broker, I can open an Owner Profile from any vessel's ownership history or S&P transaction.
- Persona: Broker, Manager
- Acceptance: `/owners/[id]` exists; deep links from Vessel Detail and S&P Transactions.
- Phase: P3
- Source: owner.html

**S07-2.1** — As a Broker, the Overview sub-tab shows Company Overview, Fleet Composition, Current Fleet, Employment Mix, Key Financials.
- Persona: Broker
- Acceptance: matches owner.html "Overview" subtab.
- Phase: P3
- Source: owner.html

**S07-2.2** — As a Broker, the Fleet sub-tab shows the Full Fleet Roster with type/status/built filters.
- Persona: Broker
- Acceptance: filterable table.
- Phase: P3
- Source: owner.html

**S07-2.3** — As a Broker, the S&P Activity sub-tab shows the owner's transaction history and TC expiry alerts.
- Persona: Broker
- Acceptance: chronological table; chart of revenue by segment.
- Phase: P3
- Source: owner.html

**S07-2.4** — As a Broker, the Financials sub-tab shows fleet value over time and revenue by segment.
- Persona: Broker
- Acceptance: charts powered by F5/F4.
- Phase: P3
- Source: owner.html

**S07-2.5** — As a Broker, the Contacts sub-tab shows Key Contacts and Office Details.
- Persona: Broker
- Acceptance: contact cards with phone/email/role; office card with address.
- Phase: P3
- Source: owner.html

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T07-1.1.1 | `Owner` and `OwnerContact` models | P3 | F4 | owner.html |
| T07-1.1.2 | `/owners/[id]` route with sub-tabs | P3 | T07-1.1.1 | owner.html |
| T07-2.1.1 | Overview sub-tab | P3 | T07-1.1.2 | owner.html |
| T07-2.2.1 | Fleet sub-tab with filters | P3 | T07-1.1.2, F4 | owner.html |
| T07-2.3.1 | S&P Activity sub-tab | P3 | T07-1.1.2, M09 | owner.html |
| T07-2.4.1 | Financials sub-tab charts | P3 | T07-1.1.2, F5 | owner.html |
| T07-2.5.1 | Contacts sub-tab | P3 | T07-1.1.1 | owner.html |

---

## M08. Vessels for Sale

**Phase:** P2 · **Status:** Planned · **Lead persona:** Broker, Manager
**Source:** `brd.md §7.4 SP-1..SP-4`, `html/vessels-for-sale.html`

**Purpose.** Browse active vessel listings with KPI summary, filters, grid/list/map toggles, and price-history view.

### Epics

- **E08-1** — KPI summary
- **E08-2** — Listings grid with filters
- **E08-3** — Map view with animated markers
- **E08-4** — Price History sub-tab
- **E08-5** — My Listings sub-tab

### Stories

**S08-1.1** — As a Broker, I see KPI cards for active listings, average asking price, deals closed (30d), total value, and new listings (7d).
- Persona: Broker, Manager
- Acceptance: matches `brd.md §7.4 SP-1`.
- Phase: P2
- Source: brd.md §7.4 SP-1

**S08-2.1** — As a Broker, listing cards show asking price (large), type, age, flag, DWT, scrubber badge, broker attribution, listing date.
- Persona: Broker
- Acceptance: matches `brd.md §7.4 SP-2`.
- Phase: P2
- Source: brd.md §7.4 SP-2

**S08-2.2** — As a Broker, I can filter listings by type, size class, year built, price range and toggle grid/list views.
- Persona: Broker
- Acceptance: filters compose; toggle persists.
- Phase: P2
- Source: brd.md §7.4 SP-3

**S08-3.1** — As a Broker, I can switch to a Map view with animated position markers per listing.
- Persona: Broker
- Acceptance: dark map theme; markers from F5 AIS provider; click → listing card.
- Phase: P3
- Source: brd.md §7.4 SP-4

**S08-4.1** — As a Broker, I see Price History for vessels currently listed.
- Persona: Broker
- Acceptance: chart of asking-price changes; table with edits over time.
- Phase: P2
- Source: vessels-for-sale.html "Price History"

**S08-5.1** — As a Broker, I can view My Listings (listings where my org is the seller).
- Persona: Broker
- Acceptance: filtered to org; status badge; edit listing.
- Phase: P3
- Source: vessels-for-sale.html "My Listings"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T08-1.1.1 | `/vessels-for-sale` route with KPI strip | P2 | F4 | brd.md §7.4 SP-1 |
| T08-1.1.2 | KPI aggregation queries | P2 | F4 | brd.md §7.4 SP-1 |
| T08-2.1.1 | `Listing` model (asking_price, broker, listing_date, scrubber_flag, status) | P2 | F4 | vessels-for-sale.html |
| T08-2.1.2 | Listings grid card component | P2 | F3 | brd.md §7.4 SP-2 |
| T08-2.2.1 | Filter bar (type, size, built, price) | P2 | F3 | brd.md §7.4 SP-3 |
| T08-3.1.1 | Map view with animated markers | P3 | F5 AIS | brd.md §7.4 SP-4 |
| T08-4.1.1 | Price History sub-tab + price-change log | P2 | T08-2.1.1 | vessels-for-sale.html |
| T08-5.1.1 | My Listings sub-tab | P3 | T08-2.1.1 | vessels-for-sale.html |

---

## M09. S&P Transactions

**Phase:** P2 · **Status:** Planned · **Lead persona:** Broker, Portfolio Manager
**Source:** `brd.md §7.4 SP-5..SP-7`, `html/sp-transactions.html`

**Purpose.** Historical S&P deal log with KPIs, segment analytics, broker market share, and export.

### Epics

- **E09-1** — Transaction log
- **E09-2** — Analytics (volume/value, price-vs-age, price/DWT)
- **E09-3** — Market Share & Broker leaderboard
- **E09-4** — Export sub-tab (scheduled exports)

### Stories

**S09-1.1** — As a Broker, the All Transactions table shows vessel, IMO, type, buyer, seller, price, date, status (Rumoured/Concluded).
- Persona: Broker
- Acceptance: matches `brd.md §7.4 SP-5`; sortable; date range filter.
- Phase: P2
- Source: brd.md §7.4 SP-5

**S09-1.2** — As a Broker, KPI cards show monthly transaction volume and value.
- Persona: Broker
- Acceptance: matches `brd.md §7.4 SP-6`.
- Phase: P2
- Source: brd.md §7.4 SP-6

**S09-2.1** — As an Analyst, the Analytics sub-tab shows volume bar chart, value chart, price-per-DWT by segment, price-vs-age scatter.
- Persona: Analyst
- Acceptance: matches sp-transactions.html "Analytics"; uses Recharts.
- Phase: P2
- Source: sp-transactions.html, brd.md §7.4 SP-7

**S09-3.1** — As a Broker, the Market Share sub-tab shows broker leaderboard and buyer nationality breakdown.
- Persona: Broker
- Acceptance: top-10 brokers by volume; nationality donut.
- Phase: P2
- Source: sp-transactions.html "Market Share"

**S09-4.1** — As a Broker, I can export transaction data as CSV/Excel and schedule recurring exports.
- Persona: Broker
- Acceptance: F7 helper; scheduled exports list with edit/pause.
- Phase: P3
- Source: sp-transactions.html "Export"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T09-1.1.1 | `Transaction` model (vessel, type, buyer, seller, price, date, status, broker) | P2 | F4 | brd.md §7.4 SP-5 |
| T09-1.1.2 | `/sp-transactions` route with All Transactions sub-tab | P2 | T09-1.1.1 | sp-transactions.html |
| T09-1.2.1 | KPI strip + monthly volume/value bar chart | P2 | F3 Chart | brd.md §7.4 SP-6 |
| T09-2.1.1 | By-Segment sub-tab | P2 | T09-1.1.1 | sp-transactions.html |
| T09-2.1.2 | Analytics sub-tab (price-vs-age scatter, price/DWT) | P2 | F3 Chart | sp-transactions.html |
| T09-3.1.1 | Market Share sub-tab + broker leaderboard | P2 | T09-1.1.1 | sp-transactions.html |
| T09-4.1.1 | Export sub-tab + scheduled export model | P3 | F7 | sp-transactions.html |

---

## M10. Projects

**Phase:** P3 · **Status:** Planned · **Lead persona:** Manager, Analyst
**Source:** `brd.md §7.5 PR-1..PR-5`, `html/projects.html`

**Purpose.** Group multiple vessels into a named project for scenario comparison and IC presentation.

### Epics

- **E10-1** — Project list & lifecycle
- **E10-2** — Vessel Compare workflow
- **E10-3** — Scenario parameters & outputs

### Stories

**S10-1.1** — As a Manager, I can create, rename, archive, and delete projects.
- Persona: Manager
- Acceptance: status badge (Draft/Active/Archived); soft-delete; vessel-count badge.
- Phase: P3
- Source: brd.md §7.5 PR-1, PR-5

**S10-1.2** — As a Manager, I can list projects in grid or list view sorted by status, vessel count, target IRR, last-updated.
- Persona: Manager
- Acceptance: matches PR-4.
- Phase: P3
- Source: brd.md §7.5 PR-4

**S10-2.1** — As an Analyst, I can compare vessels side-by-side using the Vessel Compare workflow.
- Persona: Analyst
- Acceptance: select 2–4 vessels; comparison table covers identification, technical, financial, ESG, market position; chart deltas.
- Phase: P3
- Source: projects.html "Vessel Comparison"

**S10-3.1** — As an Analyst, I can define cashflow parameters per project (vessel value, loan amount, LTV, tenor, rate, holding period).
- Persona: Analyst
- Acceptance: matches PR-2; inputs persist on project.
- Phase: P3
- Source: brd.md §7.5 PR-2

**S10-3.2** — As an Analyst, I can view side-by-side Bear/Base/Bull scenario output with charted IRR, NPV, LTV.
- Persona: Analyst
- Acceptance: matches PR-3.
- Phase: P3
- Source: brd.md §7.5 PR-3

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T10-1.1.1 | `Project`, `ProjectVessel`, `ProjectScenario` models | P3 | F4 | brd.md §7.5 |
| T10-1.1.2 | `/projects` route with grid/list and sort | P3 | T10-1.1.1 | projects.html |
| T10-2.1.1 | Vessel Compare page with multi-select and comparison table | P3 | M06, F4 | projects.html |
| T10-3.1.1 | Project scenario form (cashflow params) | P3 | M19 | brd.md §7.5 PR-2 |
| T10-3.2.1 | Side-by-side scenario chart panel | P3 | T10-3.1.1, F3 Chart | brd.md §7.5 PR-3 |

---

## M11. Competitor Analysis

**Phase:** P3 · **Status:** Planned · **Lead persona:** Manager, Analyst
**Source:** `html/competitor-analysis.html` (R-13), `brd.md §12 Phase 4 (Competitor Benchmarking)`

**Purpose.** Benchmark own portfolio against named competitors on fleet size, composition, valuation, and ESG. Includes acquisition criteria → matched vessels workflow and per-competitor alert preferences.

### Epics

- **E11-1** — Competitor directory & detail (Overview)
- **E11-2** — Fleet Intelligence (composition, age, segment position)
- **E11-3** — Vessel Watchlist
- **E11-4** — Acquisition Criteria → Matched Vessels
- **E11-5** — Alert Preferences per competitor

### Stories

**S11-1.1** — As a Manager, I can pick a competitor and view a profile (fleet composition, environmental benchmark, age distribution, segment position).
- Persona: Manager
- Acceptance: matches competitor-analysis.html "Overview" subtab; covers Star Bulk Carriers seeded as a demo competitor.
- Phase: P3
- Source: competitor-analysis.html

**S11-2.1** — As a Manager, the Fleet Intelligence sub-tab shows fleet composition, environmental benchmarking, age distribution, market position by segment.
- Persona: Manager
- Acceptance: charts via F3 Chart adapter.
- Phase: P3
- Source: competitor-analysis.html "Fleet Intelligence"

**S11-3.1** — As an Analyst, I can build a Vessel Watchlist of vessels of interest from competitor fleets.
- Persona: Analyst
- Acceptance: shared `Watchlist` model with M05; "Add to Watchlist" from competitor fleet listing.
- Phase: P3
- Source: competitor-analysis.html "Vessel Watchlist"

**S11-4.1** — As an Analyst, I can define acquisition criteria (type, size, age, price band, ESG floor) and the system surfaces matched vessels.
- Persona: Analyst
- Acceptance: criteria persist; matched vessels list re-scores on demand.
- Phase: P3
- Source: competitor-analysis.html "Acquisition Criteria" / "Matched Vessels"

**S11-5.1** — As a Manager, I can configure alert preferences per competitor (new acquisition, sale, valuation move ≥ X%).
- Persona: Manager
- Acceptance: integrates with M27 alert engine; one preference set per competitor.
- Phase: P3
- Source: competitor-analysis.html "Monitor & Alert"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T11-1.1.1 | `Competitor` model + seed (Star Bulk + 5 demo competitors) | P3 | F4 | competitor-analysis.html |
| T11-1.1.2 | `/competitors` route with selector and Overview sub-tab | P3 | T11-1.1.1 | competitor-analysis.html |
| T11-2.1.1 | Fleet Intelligence sub-tab implementation | P3 | F3 Chart | competitor-analysis.html |
| T11-3.1.1 | Watchlist integration with Vessel Watchlist sub-tab | P3 | M05 watchlist | competitor-analysis.html |
| T11-4.1.1 | `AcquisitionCriteria` model + matching service | P3 | F4 | competitor-analysis.html |
| T11-4.1.2 | Matched Vessels result panel | P3 | T11-4.1.1 | competitor-analysis.html |
| T11-5.1.1 | Per-competitor alert preferences integrated with M27 | P3 | M27 base | competitor-analysis.html |

---

## M12. Market Valuations

**Phase:** P1 · **Status:** Planned · **Lead persona:** All
**Source:** `brd.md §7.6 VA-1..VA-7`, `html/valuations.html`

**Purpose.** Live FMV, newbuild and resale views by segment with the Segment Insight Panel, comparable transactions, and confidence scoring.

### Epics

- **E12-1** — Segment-aware FMV display
- **E12-2** — Segment Insight Panel
- **E12-3** — Portfolio overview (FMV by segment, FMV/NB ratio, composition donut)
- **E12-4** — AI valuation result with confidence ring & comparables
- **E12-5** — Per-vessel valuation request flow
- **E12-6** — Valuation feedback / comments

### Stories

**S12-1.1** — As a user, the Valuations page shows segment pills (Bulk, Tanker, Container, Gas) — multi-select, all on by default, at-least-one-active guard.
- Persona: All
- Acceptance: matches `brd.md §7.6 VA-1`; shared `<SegmentPillGroup>` from F3.
- Phase: P1 (Bulk + Tanker), P2 (Container + Gas)
- Source: brd.md §7.6 VA-1

**S12-2.1** — As an Analyst, the Segment Insight Panel renders one card per active segment.
- Persona: Analyst
- Acceptance: matches `brd.md §7.6 VA-2`; cycle phase badge, three metrics with WoW change, orderbook bar with historical avg marker, ordering status (under/balanced/over), 2-sentence commentary, three key drivers.
- Phase: P2
- Source: brd.md §7.6 VA-2

**S12-2.2** — As a user, the Segment Insight Panel updates synchronously on pill toggle without page reload.
- Persona: All
- Acceptance: < 200 ms update (NFR-2); no network round-trip; data pre-fetched.
- Phase: P2
- Source: brd.md §7.6 VA-3, NFR-2

**S12-3.1** — As a Manager, the Portfolio Overview shows FMV by segment with trend indicators, FMV/Newbuild ratio bars, composition donut.
- Persona: Manager
- Acceptance: matches `brd.md §7.6 VA-4`; data scoped to active fleet.
- Phase: P1
- Source: brd.md §7.6 VA-4

**S12-4.1** — As an Analyst, the AI valuation panel shows confidence ring (High/Mid/Low), confidence range, and comparable transactions table.
- Persona: Analyst
- Acceptance: ring visual; range text; comparables table sortable.
- Phase: P1
- Source: brd.md §7.6 VA-5

**S12-5.1** — As an Analyst, I can initiate a new valuation request inline for a vessel.
- Persona: Analyst, Compliance
- Acceptance: form captures vessel, purpose (Bank Finance / IC / Sale), as-of date; submits async and links to certificate when ready.
- Phase: P1
- Source: brd.md §7.6 VA-6

**S12-6.1** — As an Analyst, I can leave feedback / comments on a valuation.
- Persona: Analyst
- Acceptance: comments persist per certificate; visible to org members; mention support deferred.
- Phase: P2
- Source: valuations.html "Valuation Feedback & Comments"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T12-1.1.1 | `/valuations` route with segment pills | P1 | F3 SegmentPill | brd.md §7.6 VA-1 |
| T12-1.1.2 | Filter market data by active segments client-side | P1 | T12-1.1.1 | brd.md §7.6 VA-1 |
| T12-2.1.1 | `<SegmentInsightCard>` component (F3 dependency) | P2 | F3 | brd.md §7.6 VA-2 |
| T12-2.1.2 | Segment Insight data API + fixture provider | P2 | F5 | brd.md §7.6 VA-2 |
| T12-2.2.1 | Synchronous update path (no fetch on toggle) | P2 | T12-2.1.1 | brd.md §13 NFR-2 |
| T12-3.1.1 | Portfolio Overview cards (FMV/segment, ratio, donut) | P1 | F3 Chart | brd.md §7.6 VA-4 |
| T12-4.1.1 | Valuation result panel with confidence ring | P1 | F3 ConfidenceRing | brd.md §7.6 VA-5 |
| T12-4.1.2 | Comparable transactions table | P1 | F4 transactions | brd.md §7.6 VA-5 |
| T12-5.1.1 | Inline valuation request form | P1 | T12-1.1.1 | brd.md §7.6 VA-6 |
| T12-5.1.2 | Async valuation worker (fixture in P1, AI in P3+) | P1 | F4 | brd.md §7.6 VA-6 |
| T12-6.1.1 | Valuation comments thread | P2 | F4 | valuations.html |

---

## M13. Valuation Certificates

**Phase:** P1 · **Status:** Planned · **Lead persona:** Analyst, Compliance Officer
**Source:** `brd.md §7.6 VA-8..VA-11`, `html/valuation-certificates.html`

**Purpose.** Certificate generation, history, share, archive. Each certificate is a tamper-evident PDF with system-generated UUID and hash.

### Epics

- **E13-1** — Certificate list & filtering
- **E13-2** — Generate New flow
- **E13-3** — PDF rendering (F7 integration)
- **E13-4** — Share & Archive
- **E13-5** — Bulk generation (P3)

### Stories

**S13-1.1** — As an Analyst, the All Certificates table shows vessel, IMO, FMV, methodology tag, confidence range, date, certificate ID, status.
- Persona: Analyst
- Acceptance: matches `brd.md §7.6 VA-8`; sortable; per-row actions View / Download (PDF) / Renew.
- Phase: P1
- Source: brd.md §7.6 VA-8, VA-9

**S13-2.1** — As an Analyst, I can generate a new certificate via the Generate New sub-tab.
- Persona: Analyst, Compliance
- Acceptance: vessel + purpose + as-of-date inputs; "Generate Certificate" triggers F7 PDF render; success toast and redirect to All Certificates.
- Phase: P1
- Source: valuation-certificates.html "Generate New"

**S13-3.1** — As an Analyst, the certificate PDF matches `brd.md §7.6 VA-10` layout.
- Persona: Analyst, Compliance
- Acceptance: vessel info block, FMV + confidence range, methodology description, comparables excerpt, signatory block, certificate UUID, content hash.
- Phase: P1
- Source: brd.md §7.6 VA-10

**S13-3.2** — As a Compliance officer, certificates are tamper-evident.
- Persona: Compliance
- Acceptance: each certificate stores `content_hash` (SHA-256 of PDF bytes); verify endpoint returns ok/altered.
- Phase: P1
- Source: brd.md §13 NFR-8

**S13-4.1** — As an Analyst, I can share a certificate by email or by generating a signed link.
- Persona: Analyst
- Acceptance: signed-link URL with TTL; email via F6.
- Phase: P2
- Source: valuation-certificates.html "Shared"

**S13-4.2** — As an Analyst, I can archive certificates I no longer need.
- Persona: Analyst
- Acceptance: archive moves out of All Certificates into Archived; not deleted.
- Phase: P2
- Source: valuation-certificates.html "Archived"

**S13-5.1** — As an Analyst, I can bulk-generate certificates by uploading a vessel list.
- Persona: Analyst
- Acceptance: batch run async; ZIP download when complete; F7 export queue.
- Phase: P3
- Source: brd.md §7.6 VA-11

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T13-1.1.1 | `ValuationCertificate` model (uuid, hash, status, methodology, comparables_json) | P1 | F4 | brd.md §7.6 VA-8 |
| T13-1.1.2 | `/valuation-certificates` route with All Certificates table | P1 | T13-1.1.1, F3 table | brd.md §7.6 VA-8 |
| T13-1.1.3 | Per-row actions: View / Download / Renew | P1 | T13-1.1.1 | brd.md §7.6 VA-9 |
| T13-2.1.1 | Generate New sub-tab form | P1 | F3 form | valuation-certificates.html |
| T13-2.1.2 | Generation endpoint orchestrating M12 valuation + F7 PDF render | P1 | M12, F7 | brd.md §7.6 VA-10 |
| T13-3.1.1 | Certificate PDF template matching VA-10 layout | P1 | F7 | brd.md §7.6 VA-10 |
| T13-3.2.1 | Hash + verify endpoint | P1 | T13-3.1.1 | brd.md §13 NFR-8 |
| T13-4.1.1 | Shared sub-tab + signed link service | P2 | F6 | valuation-certificates.html |
| T13-4.2.1 | Archived sub-tab | P2 | T13-1.1.1 | valuation-certificates.html |
| T13-5.1.1 | Bulk generation upload + queue worker | P3 | F7 queue | brd.md §7.6 VA-11 |

---

## M14. Net Fleet

**Phase:** P2 · **Status:** Planned · **Lead persona:** Manager, Analyst
**Source:** `brd.md §7.8 NF-1..NF-5`, `html/net-fleet.html`

**Purpose.** Global supply dynamics by segment — fleet, orderbook, demolitions, deliveries calendar, historical trends.

### Epics

- **E14-1** — Segment-aware fleet supply KPIs
- **E14-2** — Net fleet development chart
- **E14-3** — Orderbook sub-tab
- **E14-4** — Demolitions sub-tab
- **E14-5** — Deliveries Calendar sub-tab
- **E14-6** — Historical Trends sub-tab

### Stories

**S14-1.1** — As an Analyst, the page shows segment pills and the Segment Insight Panel.
- Persona: Analyst, Manager
- Acceptance: matches `brd.md §7.8 NF-1`; uses shared F3 components.
- Phase: P2
- Source: brd.md §7.8 NF-1

**S14-1.2** — As an Analyst, KPI cards show active fleet (DWT), orderbook % of fleet, demolitions YTD, deliveries YTD, net growth.
- Persona: Analyst
- Acceptance: matches `brd.md §7.8 NF-2`.
- Phase: P2
- Source: brd.md §7.8 NF-2

**S14-2.1** — As an Analyst, I see monthly deliveries (green) vs demolitions (red) stacked bar with net line overlay.
- Persona: Analyst
- Acceptance: matches `brd.md §7.8 NF-3`; toggle between segments.
- Phase: P2
- Source: brd.md §7.8 NF-3

**S14-3.1** — As an Analyst, the Orderbook sub-tab shows shipyard, delivery date, vessel type, DWT, expected price.
- Persona: Analyst
- Acceptance: matches `brd.md §7.8 NF-4`; sortable; "Top Shipyards by Orderbook" mini-chart.
- Phase: P2
- Source: brd.md §7.8 NF-4

**S14-4.1** — As an Analyst, the Demolitions sub-tab shows demolitions by segment and top demo yards.
- Persona: Analyst
- Acceptance: matches net-fleet.html "Demolitions".
- Phase: P2
- Source: net-fleet.html

**S14-5.1** — As a user, the Deliveries Calendar shows upcoming deliveries in the next 90 days.
- Persona: All
- Acceptance: list with date, vessel name, type, shipyard, owner.
- Phase: P2
- Source: net-fleet.html "Upcoming Deliveries — Next 90 Days"

**S14-6.1** — As an Analyst, the Historical Trends sub-tab shows a 10-year summary table.
- Persona: Analyst
- Acceptance: rows per year, columns deliveries / demolitions / net growth / orderbook %.
- Phase: P2
- Source: net-fleet.html "10-Year Summary Table"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T14-1.1.1 | `/net-fleet` route with segment pills + insight panel | P2 | F3, F5 | brd.md §7.8 NF-1 |
| T14-1.2.1 | KPI strip with five fleet metrics | P2 | F5 | brd.md §7.8 NF-2 |
| T14-2.1.1 | Net fleet development chart (stacked bar + line) | P2 | F3 Chart | brd.md §7.8 NF-3 |
| T14-3.1.1 | Orderbook table + Top Shipyards mini-chart | P2 | F4, F5 | brd.md §7.8 NF-4 |
| T14-4.1.1 | Demolitions sub-tab + segment breakdown | P2 | F5 | net-fleet.html |
| T14-5.1.1 | Deliveries Calendar list | P2 | F5 | net-fleet.html |
| T14-6.1.1 | Historical Trends 10-year table | P2 | F5 | net-fleet.html |

---

## M15. Earnings

**Phase:** P2 · **Status:** Planned · **Lead persona:** Operations Manager, Analyst
**Source:** `brd.md §7.8 ER-1, ER-2`, `html/earnings.html` (R-8)

**Purpose.** TCE rate tracking, current market snapshot, forward curves, and TC renewal schedule.

### Epics

- **E15-1** — Overview (TCE history + monthly gross revenue)
- **E15-2** — Historical Rates sub-tab (5-year)
- **E15-3** — Current Market sub-tab (spot snapshot, current vessel earnings)
- **E15-4** — Forward Curve sub-tab
- **E15-5** — TC Coverage analysis & renewals

### Stories

**S15-1.1** — As an Ops Manager, I see TCE rate history for the trailing 12 months and monthly gross revenue.
- Persona: Ops, Analyst
- Acceptance: chart by vessel type; revenue from `LoanFacility`/charters.
- Phase: P2
- Source: earnings.html "Overview"

**S15-2.1** — As an Analyst, the Historical Rates sub-tab shows a 5-year TCE chart and annual averages.
- Persona: Analyst
- Acceptance: line chart with selectable vessel type; rate context callouts.
- Phase: P2
- Source: earnings.html "Historical Rates"

**S15-3.1** — As an Ops Manager, the Current Market sub-tab shows a spot market snapshot and current vessel earnings vs budget.
- Persona: Ops
- Acceptance: snapshot table; per-vessel earnings vs budget table; open-position risk callout.
- Phase: P2
- Source: earnings.html "Current Market"

**S15-4.1** — As an Analyst, the Forward Curve sub-tab shows a forward rate curve and expected revenue by quarter under Bear/Base/Bull.
- Persona: Analyst
- Acceptance: matches `brd.md §7.8 ER-2`; analyst outlook callout; TC renewal schedule.
- Phase: P2
- Source: brd.md §7.8 ER-2, earnings.html "Forward Curve"

**S15-5.1** — As a Manager, I see TC Coverage analysis (spot vs time-charter split).
- Persona: Manager, Ops
- Acceptance: matches ER-2; pie or stacked bar.
- Phase: P2
- Source: brd.md §7.8 ER-2

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T15-1.1.1 | `/earnings` route with sub-tabs | P2 | F2, F3 | earnings.html |
| T15-1.1.2 | TCE history chart | P2 | F5 TceRate | brd.md §7.8 ER-1 |
| T15-1.1.3 | Monthly gross revenue chart | P2 | F4, F5 | earnings.html |
| T15-2.1.1 | Historical Rates sub-tab (5Y) | P2 | F5 | earnings.html |
| T15-3.1.1 | Spot market snapshot | P2 | F5 | earnings.html |
| T15-3.1.2 | Per-vessel earnings vs budget table | P2 | F4 | earnings.html |
| T15-4.1.1 | Forward Curve sub-tab | P2 | F5 | brd.md §7.8 ER-2 |
| T15-4.1.2 | Bear/Base/Bull scenario forward curves | P2 | T15-4.1.1 | brd.md §7.8 ER-2 |
| T15-4.1.3 | TC Renewal Schedule list | P2 | F4 | earnings.html |
| T15-5.1.1 | TC Coverage analysis chart | P2 | F4 | brd.md §7.8 ER-2 |

---

## M16. Expenses

**Phase:** P2 · **Status:** Planned · **Lead persona:** Operations Manager, Analyst
**Source:** `brd.md §7.8 EX-1, EX-2`, `html/expenses.html` (R-9)

**Purpose.** Track OPEX by category and vessel, compare actuals against budget, and forecast 3 years out under scenarios.

### Epics

- **E16-1** — Overview (monthly breakdown, YTD donut)
- **E16-2** — Historical Costs sub-tab (5-year)
- **E16-3** — Current Period sub-tab (per-vessel detail, budget variance, dry-dock schedule)
- **E16-4** — Budget & Forecast sub-tab (3-year forecast with scenarios)

### Stories

**S16-1.1** — As an Ops Manager, the Overview sub-tab shows monthly expense breakdown and YTD cost donut.
- Persona: Ops
- Acceptance: 12-month bar chart; YTD donut by category (crew, maintenance, insurance, SG&A).
- Phase: P2
- Source: expenses.html "Overview", brd.md §7.8 EX-1

**S16-2.1** — As an Analyst, the Historical Costs sub-tab shows 5-year annual cost trend and OPEX/DWT trend by vessel type.
- Persona: Analyst
- Acceptance: 5-year line chart; cost-inflation callout.
- Phase: P2
- Source: expenses.html "Historical Costs"

**S16-3.1** — As an Ops Manager, the Current Period sub-tab shows per-vessel expense detail and budget vs actual.
- Persona: Ops
- Acceptance: matches `brd.md §7.8 EX-2`; colour-coded variance; YoY column.
- Phase: P2
- Source: brd.md §7.8 EX-2

**S16-3.2** — As an Ops Manager, I see an upcoming Dry-dock schedule.
- Persona: Ops
- Acceptance: list with vessel, date, yard, estimated cost.
- Phase: P2
- Source: expenses.html "Upcoming Dry-dock Schedule"

**S16-4.1** — As an Analyst, the Budget & Forecast sub-tab shows a 3-year OPEX forecast with Bear/Base/Bull scenarios.
- Persona: Analyst
- Acceptance: chart and table by category; forecast assumptions panel; key cost risks list.
- Phase: P2
- Source: expenses.html "Budget & Forecast"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T16-1.1.1 | `/expenses` route with sub-tabs | P2 | F2, F3 | expenses.html |
| T16-1.1.2 | Monthly expense breakdown chart | P2 | F4 | brd.md §7.8 EX-1 |
| T16-1.1.3 | YTD cost donut by category | P2 | F4 | expenses.html |
| T16-2.1.1 | 5-year annual cost trend chart | P2 | F4 | expenses.html |
| T16-2.1.2 | OPEX/DWT trend by vessel type | P2 | F4 | expenses.html |
| T16-3.1.1 | Per-vessel expense detail table | P2 | F4 | brd.md §7.8 EX-2 |
| T16-3.1.2 | Budget vs Actual variance table | P2 | F4 | brd.md §7.8 EX-2 |
| T16-3.2.1 | Upcoming Dry-dock Schedule list | P2 | F4 | expenses.html |
| T16-4.1.1 | 3-year OPEX forecast model + scenarios | P2 | F4 | expenses.html |
| T16-4.1.2 | Forecast Assumptions and Key Cost Risks panels | P2 | T16-4.1.1 | expenses.html |

---

## M17. Financial Transactions

**Phase:** P2 · **Status:** Planned · **Lead persona:** Analyst
**Source:** `brd.md §7.7 FT-1..FT-4`, `html/financial-transactions.html`

**Purpose.** Track all loan disbursements, repayments, interest accruals, and fee payments. Per-loan amortization schedules.

### Epics

- **E17-1** — Segment-aware monthly summary
- **E17-2** — Disbursement / Repayment / Interest / Fee history
- **E17-3** — Upcoming repayments
- **E17-4** — Per-loan amortization schedule
- **E17-5** — Loan summary by rate basis

### Stories

**S17-1.1** — As an Analyst, segment pills filter the transaction table to matching vessels.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 FT-1`.
- Phase: P2
- Source: brd.md §7.7 FT-1

**S17-1.2** — As an Analyst, the page shows the Segment Insight Panel per active segment.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 FT-2`.
- Phase: P2
- Source: brd.md §7.7 FT-2

**S17-1.3** — As an Analyst, monthly summary cards show disbursements, repayments, interest paid, net cash flow.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 FT-3`.
- Phase: P2
- Source: brd.md §7.7 FT-3

**S17-2.1** — As an Analyst, the page shows tables for Disbursement History, Repayment History, Interest & Fee Payments.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 FT-4`; sortable; per-row vessel link.
- Phase: P2
- Source: brd.md §7.7 FT-4

**S17-3.1** — As an Analyst, I see Upcoming Repayments scheduled for the next 90 days.
- Persona: Analyst
- Acceptance: list with date, loan, vessel, amount, status.
- Phase: P2
- Source: financial-transactions.html "Upcoming Repayments"

**S17-4.1** — As an Analyst, I can pick a loan and see its amortization schedule.
- Persona: Analyst
- Acceptance: "Select Loan" combobox loads schedule with date, principal, interest, balance.
- Phase: P2
- Source: financial-transactions.html "Amortization Schedule"

**S17-5.1** — As an Analyst, I see Loan Summary by Rate Basis (SOFR-linked vs EURIBOR-linked vs fixed).
- Persona: Analyst
- Acceptance: aggregate table.
- Phase: P2
- Source: financial-transactions.html "Loan Summary by Rate Basis"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T17-1.1.1 | `/financial-transactions` route + segment pills | P2 | F3 | brd.md §7.7 FT-1 |
| T17-1.2.1 | Segment insight panel integration | P2 | M12 components | brd.md §7.7 FT-2 |
| T17-1.3.1 | Monthly summary cards | P2 | F4 LoanTransaction | brd.md §7.7 FT-3 |
| T17-2.1.1 | Disbursement / Repayment / Interest / Fee tables | P2 | F4 LoanTransaction | brd.md §7.7 FT-4 |
| T17-3.1.1 | Upcoming Repayments list | P2 | F4 | financial-transactions.html |
| T17-4.1.1 | Loan selector + amortization schedule view | P2 | F4 | financial-transactions.html |
| T17-5.1.1 | Loan Summary by Rate Basis aggregator | P2 | F4 | financial-transactions.html |

---

## M18. Market Reports

**Phase:** P2 · **Status:** Planned · **Lead persona:** All
**Source:** `brd.md §7.8 MR-1..MR-3`, `html/market-reports.html` (R-14)

**Purpose.** Research library with segment-aware filtering, featured report, bookmarks, saved searches, and subscriptions.

### Epics

- **E18-1** — Report library with segment pills + insight panel
- **E18-2** — Featured report hero + grid
- **E18-3** — Saved Searches
- **E18-4** — Subscriptions
- **E18-5** — Saved (My Saved Reports)

### Stories

**S18-1.1** — As a user, segment pills with keyword-mapping auto-detection (e.g., "BDI" → Bulk).
- Persona: All
- Acceptance: matches `brd.md §7.8 MR-1`.
- Phase: P2
- Source: brd.md §7.8 MR-1

**S18-1.2** — As a user, the Segment Insight Panel renders per active segment.
- Persona: All
- Acceptance: shared component.
- Phase: P2
- Source: brd.md §7.8 MR-1

**S18-2.1** — As a user, a featured report hero and grid of recent reports are shown.
- Persona: All
- Acceptance: matches `brd.md §7.8 MR-2`; report card has date, title, summary, tags, bookmark, author.
- Phase: P2
- Source: brd.md §7.8 MR-2

**S18-2.2** — As a user, I can filter by category, date range, and search; pagination shows live result count.
- Persona: All
- Acceptance: matches `brd.md §7.8 MR-3`.
- Phase: P2
- Source: brd.md §7.8 MR-3

**S18-3.1** — As a user, I can save a search and re-run it later.
- Persona: All
- Acceptance: shared `SavedSearch` model; runs as a single click.
- Phase: P2
- Source: market-reports.html "Saved Searches"

**S18-4.1** — As a user, I can subscribe to report categories and receive new-report notifications.
- Persona: All
- Acceptance: `MarketReportSubscription` model; notifications via M27 + F6.
- Phase: P3
- Source: market-reports.html "My Subscriptions"

**S18-5.1** — As a user, I can bookmark reports for later reading.
- Persona: All
- Acceptance: bookmark icon; "My Saved Reports" tab.
- Phase: P2
- Source: market-reports.html "My Saved Reports"

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T18-1.1.1 | `Report` model + seed | P2 | F4 | market-reports.html |
| T18-1.1.2 | `/market-reports` route with segment pills + filters | P2 | F3 | brd.md §7.8 MR-1 |
| T18-1.2.1 | Segment Insight Panel integration | P2 | M12 | brd.md §7.8 MR-1 |
| T18-2.1.1 | Featured report hero card | P2 | F3 | brd.md §7.8 MR-2 |
| T18-2.1.2 | Report grid card component | P2 | F3 | brd.md §7.8 MR-2 |
| T18-2.2.1 | Filter bar + pagination | P2 | F3 | brd.md §7.8 MR-3 |
| T18-3.1.1 | Saved Searches integration | P2 | M05 SavedSearch | market-reports.html |
| T18-4.1.1 | `MarketReportSubscription` model + opt-in UI | P3 | F4, M27 | market-reports.html |
| T18-4.1.2 | New-report digest email | P3 | F6 | market-reports.html |
| T18-5.1.1 | Bookmark action + My Saved Reports tab | P2 | F4 | market-reports.html |

---

## M19. Cashflow

**Phase:** P1 · **Status:** Planned · **Lead persona:** Financial Analyst
**Source:** `brd.md §7.7 CF-1..CF-6`, `html/cashflow.html`, `html/new-cashflow-request.html` (R-5)

**Purpose.** Acquisition / refinance / divest / broker-inquiry cashflow modelling with Bear/Base/Bull scenarios, P&L, IRR/NPV, sensitivity, and DCF parallel sub-tab.

### Epics

- **E19-1** — Model list with status (Draft / Running / Completed)
- **E19-2** — New Cashflow request flow
- **E19-3** — Model viewer (assumptions, P&L, scenarios, return metrics, sensitivity)
- **E19-4** — DCF Calculations sub-tab
- **E19-5** — Excel + PDF export
- **E19-6** — Periodicity (Annual / Quarterly / Monthly)

### Stories

**S19-1.1** — As an Analyst, I see all my cashflow models grouped by vessel.
- Persona: Analyst
- Acceptance: cashflow.html cards "MV Pacific Star Cashflow Calculations" pattern; status badge per model.
- Phase: P1
- Source: cashflow.html, brd.md §7.7 CF-6

**S19-2.1** — As an Analyst, I can create a new cashflow model selecting type: Full Acquisition, Refinance Scenario, Divest Analysis, Broker Inquiry.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 CF-1`; type drives form fields.
- Phase: P1
- Source: brd.md §7.7 CF-1

**S19-2.2** — As an Analyst, the new-cashflow form supports collapsible sections: Vessel & Acquisition Details, Operating Assumptions, Revenue Assumptions, Financing Structure.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 CF-3`; "+ Add Year" / "+ Add Employment" / "+ Add Bareboat Charter" / "+ Add Next Dry Dock" / "+ Add Next Intermediate Survey" / "+ Add Next Upgrading" supported.
- Phase: P1
- Source: brd.md §7.7 CF-3, new-cashflow-request.html

**S19-3.1** — As an Analyst, the model viewer shows Bear / Base / Bull scenario tabs with independently editable assumptions.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 CF-2`.
- Phase: P1
- Source: brd.md §7.7 CF-2

**S19-3.2** — As an Analyst, the P&L table shows operating income, commissions, net revenue, crew, maintenance, insurance, EBITDA, interest, taxes, net income.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 CF-4`.
- Phase: P1
- Source: brd.md §7.7 CF-4

**S19-3.3** — As an Analyst, the KPI summary shows IRR, NPV, payback period, LTV at exit.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 CF-5`; period toggle Annual / Monthly.
- Phase: P1
- Source: brd.md §7.7 CF-5

**S19-3.4** — As an Analyst, the model includes a Scenario Comparison panel and an IRR Breakdown view.
- Persona: Analyst
- Acceptance: matches cashflow.html "Scenario Comparison" / "IRR Breakdown".
- Phase: P1
- Source: cashflow.html

**S19-3.5** — As an Analyst, a Sensitivity Table shows IRR impact for combinations of TCE rate × exit multiple.
- Persona: Analyst
- Acceptance: matches cashflow.html "Sensitivity Table — IRR Impact".
- Phase: P2
- Source: cashflow.html

**S19-4.1** — As an Analyst, I can run a DCF Calculation for a vessel as a parallel sub-tab.
- Persona: Analyst
- Acceptance: matches cashflow.html "DCF Calculations"; reuses model assumptions; outputs DCF-specific metrics.
- Phase: P2
- Source: cashflow.html

**S19-5.1** — As an Analyst, I can export a model to Excel and PDF.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 CF-6`; uses F7 helpers.
- Phase: P2
- Source: brd.md §7.7 CF-6

**S19-6.1** — As an Analyst, I can switch the cashflow viewer between Annual / Quarterly / Monthly views.
- Persona: Analyst
- Acceptance: matches cashflow.html "Quarterly Cashflow Statement" / "Monthly Cashflow — Year 1".
- Phase: P1
- Source: cashflow.html

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T19-1.1.1 | `CashflowModel`, `CashflowAssumption`, `CashflowOutput` models | P1 | F4 | brd.md §7.7 CF-* |
| T19-1.1.2 | `/cashflow` route with model list grouped by vessel | P1 | T19-1.1.1 | cashflow.html |
| T19-2.1.1 | `/cashflow/new` form with type selector | P1 | F3 form | brd.md §7.7 CF-1 |
| T19-2.2.1 | Collapsible section components | P1 | F3 | brd.md §7.7 CF-3 |
| T19-2.2.2 | Year/employment/charter/drydock add-row controls | P1 | T19-2.2.1 | new-cashflow-request.html |
| T19-3.1.1 | Bear/Base/Bull scenario tabs with independent assumptions | P1 | T19-1.1.1 | brd.md §7.7 CF-2 |
| T19-3.2.1 | P&L table component | P1 | F3 table | brd.md §7.7 CF-4 |
| T19-3.3.1 | KPI summary (IRR/NPV/payback/LTV at exit) | P1 | T19-1.1.1 | brd.md §7.7 CF-5 |
| T19-3.4.1 | Scenario Comparison panel | P1 | T19-3.1.1 | cashflow.html |
| T19-3.4.2 | IRR Breakdown chart | P1 | F3 Chart | cashflow.html |
| T19-3.5.1 | Sensitivity table (TCE × exit) | P2 | T19-3.3.1 | cashflow.html |
| T19-4.1.1 | DCF Calculation sub-tab + output panel | P2 | T19-3.1.1 | cashflow.html |
| T19-5.1.1 | Excel exporter (ExcelJS template) | P2 | F7 | brd.md §7.7 CF-6 |
| T19-5.1.2 | PDF exporter | P2 | F7 | brd.md §7.7 CF-6 |
| T19-6.1.1 | Period toggle Annual / Quarterly / Monthly | P1 | T19-3.2.1 | cashflow.html |

---

## M20. Loan Oracle

**Phase:** P1 · **Status:** Planned · **Lead persona:** Financial Analyst, Portfolio Manager
**Source:** `brd.md §7.7 LO-1..LO-5`, `html/loan-oracle.html`, `html/new-loan-request.html` (R-6)

**Purpose.** Assess vessel financibility, compare lenders, monitor covenants, and shop for term sheets. Includes integrated SOFR & EURIBOR view.

### Epics

- **E20-1** — Loan Oracle calculator (sliders → ranked lenders + Financibility Score)
- **E20-2** — Financiers directory
- **E20-3** — Covenant Monitor
- **E20-4** — SOFR & EURIBOR integrated panel
- **E20-5** — Term sheet request flow & comparison
- **E20-6** — Saved loan calculations per vessel

### Stories

**S20-1.1** — As an Analyst, I can input vessel value, desired LTV, and loan tenor; results update in real time.
- Persona: Analyst, Manager
- Acceptance: matches `brd.md §7.7 LO-1`; debounced ≤ 200 ms.
- Phase: P1
- Source: brd.md §7.7 LO-1

**S20-1.2** — As an Analyst, I see ranked lender cards (18+ lenders) with all-in rate, tenor, LTV, covenant type, amortisation bar, "Recommended" badge.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 LO-2`; cards sorted by Financibility Score × competitiveness.
- Phase: P1
- Source: brd.md §7.7 LO-2

**S20-1.3** — As an Analyst, I see a Financibility Score (0–10) with factor-level reasoning (vessel age, segment, LTV, covenant adherence).
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 LO-3`; score breakdown popover.
- Phase: P1
- Source: brd.md §7.7 LO-3

**S20-2.1** — As an Analyst, the Financiers sub-tab lists all lenders with contact info, coverage summary, transaction volume, speed-of-reply chart.
- Persona: Analyst
- Acceptance: matches loan-oracle.html "Financiers".
- Phase: P1
- Source: loan-oracle.html

**S20-3.1** — As an Analyst, the Covenant Monitor shows LTV vs max, Debt/EBITDA vs covenant, Interest Coverage vs minimum.
- Persona: Analyst, Manager
- Acceptance: matches `brd.md §7.7 LO-4`; bullet bars with buffer indicator; breach state visible.
- Phase: P1
- Source: brd.md §7.7 LO-4

**S20-4.1** — As an Analyst, I see a SOFR & EURIBOR sub-tab with current rates, history, term curves embedded.
- Persona: Analyst
- Acceptance: matches loan-oracle.html "SOFR & EURIBOR" subtab; data shared with M23, M24.
- Phase: P1
- Source: loan-oracle.html

**S20-5.1** — As an Analyst, I can request a term sheet from a specific lender.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 LO-5`; modal captures additional inputs; sends email via F6; logs request.
- Phase: P2
- Source: brd.md §7.7 LO-5

**S20-5.2** — As an Analyst, I can compare term sheets side-by-side.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 LO-5`.
- Phase: P2
- Source: brd.md §7.7 LO-5

**S20-6.1** — As an Analyst, my saved Loan Oracle calculations are listed grouped by vessel.
- Persona: Analyst
- Acceptance: matches loan-oracle.html ("MV Pacific Star Loan Oracle Calculations" pattern).
- Phase: P1
- Source: loan-oracle.html

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T20-1.1.1 | `LoanCalculation` model | P1 | F4 | loan-oracle.html |
| T20-1.1.2 | `/loan-oracle` route with sliders panel | P1 | F3 | brd.md §7.7 LO-1 |
| T20-1.2.1 | Lender card component with `<AmortizationBar>` | P1 | F3 | brd.md §7.7 LO-2 |
| T20-1.2.2 | Lender ranking service | P1 | F4 lenders | brd.md §7.7 LO-2 |
| T20-1.3.1 | Financibility Score calculator | P1 | F4 | brd.md §7.7 LO-3 |
| T20-1.3.2 | Score breakdown popover | P1 | T20-1.3.1 | brd.md §7.7 LO-3 |
| T20-2.1.1 | Financiers sub-tab with lender table | P1 | F4 lenders | loan-oracle.html |
| T20-2.1.2 | Coverage summary + transaction volume widgets | P1 | F4 | loan-oracle.html |
| T20-3.1.1 | `Covenant` model + computed thresholds | P1 | F4 | brd.md §7.7 LO-4 |
| T20-3.1.2 | Covenant Monitor panel with bullet bars | P1 | F3 BulletBar | brd.md §7.7 LO-4 |
| T20-4.1.1 | SOFR & EURIBOR embedded panel | P1 | M23, M24 | loan-oracle.html |
| T20-5.1.1 | Term sheet request modal + email | P2 | F6 | brd.md §7.7 LO-5 |
| T20-5.2.1 | Term sheet comparison table | P2 | T20-5.1.1 | brd.md §7.7 LO-5 |
| T20-6.1.1 | Loan calculation list grouped by vessel | P1 | T20-1.1.1 | loan-oracle.html |

---

## M21. Benchmarking

**Phase:** P3 · **Status:** Planned · **Lead persona:** Portfolio Manager
**Source:** `brd.md §7.9 BM-1..BM-3`, `html/benchmarking.html`

**Purpose.** Compare own fleet vs configurable peers across Fleet Value/DWT, Avg Age, CII Distribution, Orderbook %.

### Epics

- **E21-1** — Fleet vs Fleet sub-tab
- **E21-2** — Fleet vs Market sub-tab
- **E21-3** — Vessel Deep-dive sub-tab

### Stories

**S21-1.1** — As a Manager, I can compare two of my own fleets side-by-side.
- Persona: Manager
- Acceptance: matches benchmarking.html "Fleet vs Fleet"; KPI cards with delta % and direction.
- Phase: P3
- Source: benchmarking.html, brd.md §7.9 BM-1

**S21-2.1** — As a Manager, I can compare my fleet vs market averages with KPI delta cards.
- Persona: Manager
- Acceptance: matches `brd.md §7.9 BM-2`.
- Phase: P3
- Source: brd.md §7.9 BM-2

**S21-3.1** — As an Analyst, the Vessel Deep-dive sub-tab shows MV Pacific Star vs Peers and Recent Comparable Sales.
- Persona: Analyst
- Acceptance: matches benchmarking.html "Vessel Deep-dive".
- Phase: P3
- Source: benchmarking.html, brd.md §7.9 BM-3

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T21-1.1.1 | `/benchmarking` route + sub-tabs | P3 | F2, F3 | benchmarking.html |
| T21-1.1.2 | Fleet vs Fleet KPI delta cards | P3 | F4 | brd.md §7.9 BM-2 |
| T21-2.1.1 | Fleet vs Market data wiring | P3 | F5 | brd.md §7.9 BM-1 |
| T21-3.1.1 | Vessel Deep-dive sub-tab content | P3 | M06 | benchmarking.html |

---

## M22. IRR Analysis

**Phase:** P3 · **Status:** Planned · **Lead persona:** Financial Analyst
**Source:** `brd.md §7.9 IR-1..IR-3`, `html/irr.html`

**Purpose.** Benchmark IRR by vessel type, an interactive IRR calculator, and peer distribution.

### Epics

- **E22-1** — Benchmark IRR table grouped by transaction type
- **E22-2** — Interactive IRR calculator
- **E22-3** — Peer comparison distribution

### Stories

**S22-1.1** — As an Analyst, I see a 5-year unlevered IRR benchmark table by vessel type with Bull / Worst Case columns.
- Persona: Analyst
- Acceptance: matches `brd.md §7.9 IR-1`; per-segment sub-tabs (Bulk Carriers, Tankers, Gas Carriers).
- Phase: P3
- Source: brd.md §7.9 IR-1, irr.html

**S22-2.1** — As an Analyst, I can plug in purchase price, exit price, holding years and see IRR.
- Persona: Analyst
- Acceptance: matches `brd.md §7.9 IR-2`; colour-coded output by IRR threshold.
- Phase: P3
- Source: brd.md §7.9 IR-2

**S22-3.1** — As an Analyst, peer comparison distribution shows median and quartile bands for similar asset class.
- Persona: Analyst
- Acceptance: matches `brd.md §7.9 IR-3`.
- Phase: P3
- Source: brd.md §7.9 IR-3

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T22-1.1.1 | `/irr` route with Overview + per-segment sub-tabs | P3 | F2, F3 | irr.html |
| T22-1.1.2 | IRR benchmark table (Bull / Worst Case) | P3 | F4 | brd.md §7.9 IR-1 |
| T22-2.1.1 | Interactive IRR calculator | P3 | F3 | brd.md §7.9 IR-2 |
| T22-3.1.1 | Peer distribution chart | P3 | F3 Chart | brd.md §7.9 IR-3 |

---

## M23. SOFR Tracker

**Phase:** P2 · **Status:** Planned · **Lead persona:** Financial Analyst
**Source:** `brd.md §7.7 RT-1`, `html/sofr.html`

**Purpose.** Live SOFR rates across tenors with historical chart, forward curve, and loan portfolio impact.

### Epics

- **E23-1** — Current Rates sub-tab
- **E23-2** — Historical sub-tab
- **E23-3** — Forward Curve sub-tab
- **E23-4** — Loan Impact sub-tab

### Stories

**S23-1.1** — As an Analyst, I see current SOFR rates for all tenors with daily change indicator.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 RT-1` (current rates), sofr.html "Current Rates".
- Phase: P2
- Source: brd.md §7.7 RT-1

**S23-2.1** — As an Analyst, I see historical SOFR with 12M / 3M / 6M toggles and a 3-year monthly data points table.
- Persona: Analyst
- Acceptance: matches sofr.html "Historical".
- Phase: P2
- Source: sofr.html

**S23-3.1** — As an Analyst, I see implied SOFR forward rates and a forward curve chart.
- Persona: Analyst
- Acceptance: matches sofr.html "Forward Curve".
- Phase: P2
- Source: sofr.html

**S23-4.1** — As an Analyst, I see SOFR-linked loan portfolio impact and scenario modeller (+50/+100/+150 bps).
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 RT-1` (loan pricing impact), sofr.html "Loan Impact".
- Phase: P2
- Source: brd.md §7.7 RT-1

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T23-1.1.1 | `/rates/sofr` route with Current Rates sub-tab | P2 | F5 SofrRate | sofr.html |
| T23-2.1.1 | Historical chart + 3-year data table | P2 | F5 | sofr.html |
| T23-3.1.1 | Forward curve chart | P2 | F5 | sofr.html |
| T23-4.1.1 | SOFR-linked loan portfolio impact panel | P2 | F4, F5 | sofr.html |
| T23-4.1.2 | Scenario modeller (+50/+100/+150 bps) | P2 | T23-4.1.1 | brd.md §7.7 RT-1 |

---

## M24. EURIBOR Tracker

**Phase:** P2 · **Status:** Planned · **Lead persona:** Financial Analyst
**Source:** `brd.md §7.7 RT-2`, `html/euribor.html`

**Purpose.** Same as M23 for EUR-denominated loans, with EUR vs USD all-in cost comparison.

### Epics

- **E24-1** — Current Rates sub-tab
- **E24-2** — Historical sub-tab
- **E24-3** — Forward Curve sub-tab
- **E24-4** — Loan Impact sub-tab + EUR/USD comparison

### Stories

**S24-1.1** — As an Analyst, I see current EURIBOR rates for all tenors.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 RT-2`.
- Phase: P2
- Source: brd.md §7.7 RT-2

**S24-4.1** — As an Analyst, I see EUR vs USD all-in cost comparison.
- Persona: Analyst
- Acceptance: matches `brd.md §7.7 RT-2`.
- Phase: P2
- Source: brd.md §7.7 RT-2

(Sub-tabs E24-2 and E24-3 mirror M23's stories.)

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T24-1.1.1 | `/rates/euribor` route + Current Rates | P2 | F5 EuriborRate | euribor.html |
| T24-2.1.1 | Historical chart + table | P2 | F5 | euribor.html |
| T24-3.1.1 | Forward curve chart | P2 | F5 | euribor.html |
| T24-4.1.1 | EUR-linked loan portfolio impact | P2 | F4, F5 | euribor.html |
| T24-4.1.2 | EUR vs USD all-in cost comparison | P2 | T24-4.1.1, T23-4.1.1 | brd.md §7.7 RT-2 |

---

## M25. Environmental Score

**Phase:** P3 · **Status:** Planned · **Lead persona:** Compliance Officer
**Source:** `brd.md §7.10 ES-1..ES-4`, `html/environmental-score.html`

**Purpose.** CII ratings, EEDI/EEXI compliance, carbon-intensity benchmarking, and improvement plans across the fleet.

### Epics

- **E25-1** — Fleet Overview (CII grade distribution, fleet CII & EEXI status)
- **E25-2** — CII Ratings detail
- **E25-3** — EEDI / EEXI sub-tab
- **E25-4** — Benchmarking sub-tab
- **E25-5** — Improvement Plans sub-tab
- **E25-6** — Vessels Requiring Action panel

### Stories

**S25-1.1** — As a Compliance officer, I see fleet-average CII grade, vessel-level distribution bar chart, and EEDI/EEXI compliance counts.
- Persona: Compliance
- Acceptance: matches `brd.md §7.10 ES-1`.
- Phase: P3
- Source: brd.md §7.10 ES-1

**S25-1.2** — As a Compliance officer, I see Fleet CII & EEXI Status and a CII Grade Legend.
- Persona: Compliance
- Acceptance: legend explains A–E semantics; chart matches prototype.
- Phase: P3
- Source: environmental-score.html

**S25-2.1** — As a Compliance officer, the CII Ratings detail table shows per-vessel grade with sortable columns.
- Persona: Compliance
- Acceptance: filterable; export CSV.
- Phase: P3
- Source: environmental-score.html "CII Ratings"

**S25-3.1** — As a Compliance officer, I see EEXI Compliance Status per vessel.
- Persona: Compliance
- Acceptance: matches environmental-score.html "EEDI / EEXI".
- Phase: P3
- Source: environmental-score.html

**S25-4.1** — As a Compliance officer, I see Carbon Intensity Benchmarking and Peer Comparison.
- Persona: Compliance
- Acceptance: matches environmental-score.html "Benchmarking"; toggles by Age and by Type.
- Phase: P3
- Source: environmental-score.html

**S25-5.1** — As a Compliance officer, I can create and view improvement plans.
- Persona: Compliance
- Acceptance: matches `brd.md §7.10 ES-2`; "+ Create New Improvement Plan"; recommended measures (Scrubber, LNG, wind assist) with CII benefit, cost, payback period.
- Phase: P3
- Source: brd.md §7.10 ES-2, ES-4

**S25-6.1** — As a Compliance officer, the "Vessels Requiring Action" panel surfaces those at risk with target grade, shortfall, urgency.
- Persona: Compliance
- Acceptance: matches `brd.md §7.10 ES-2`.
- Phase: P3
- Source: brd.md §7.10 ES-2

**S25-6.2** — As a Compliance officer, the Fleet CII trend chart shows IMO regulatory limit overlay and next reporting deadline countdown.
- Persona: Compliance
- Acceptance: matches `brd.md §7.10 ES-3`.
- Phase: P3
- Source: brd.md §7.10 ES-3

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T25-1.1.1 | `CiiRecord`, `EexiRecord`, `ImprovementPlan` models | P3 | F4 | brd.md §7.10 |
| T25-1.1.2 | `/environmental-score` route + sub-tabs | P3 | F2, F3 | environmental-score.html |
| T25-1.1.3 | CII grade distribution bar chart | P3 | F3 Chart | brd.md §7.10 ES-1 |
| T25-2.1.1 | CII Ratings table | P3 | T25-1.1.1 | environmental-score.html |
| T25-3.1.1 | EEXI Compliance Status table | P3 | T25-1.1.1 | environmental-score.html |
| T25-4.1.1 | Carbon Intensity Benchmarking chart | P3 | F3 Chart | environmental-score.html |
| T25-4.1.2 | Peer Comparison chart | P3 | F3 Chart | environmental-score.html |
| T25-5.1.1 | Improvement Plan CRUD UI | P3 | T25-1.1.1 | brd.md §7.10 ES-2 |
| T25-5.1.2 | Recommended Measures cards (Scrubber, LNG, wind) | P3 | T25-5.1.1 | brd.md §7.10 ES-4 |
| T25-6.1.1 | "Vessels Requiring Action" panel | P3 | T25-1.1.1 | brd.md §7.10 ES-2 |
| T25-6.2.1 | Fleet CII trend chart with IMO limit overlay | P3 | F3 Chart | brd.md §7.10 ES-3 |
| T25-6.2.2 | Reporting-deadline countdown | P3 | T25-6.2.1 | brd.md §7.10 ES-3 |
| T25-6.2.3 | "Submit to Flag Administration" action | P3 | T25-1.1.1 | environmental-score.html |

---

## M26. Emissions Tracker

**Phase:** P3 · **Status:** Planned · **Lead persona:** Compliance Officer
**Source:** `brd.md §7.10 EM-1..EM-4`, `html/emissions-tracker.html`

**Purpose.** Track CO₂/SOx/NOx, manage EU ETS allowances, manage carbon credits, and produce annual reports.

### Epics

- **E26-1** — Fleet Emissions sub-tab
- **E26-2** — By Voyage sub-tab
- **E26-3** — EU ETS sub-tab
- **E26-4** — Carbon Credits sub-tab
- **E26-5** — Annual Reports sub-tab

### Stories

**S26-1.1** — As a Compliance officer, I see CO₂/SOx/NOx YTD vs target with attainment % and stacked monthly chart.
- Persona: Compliance
- Acceptance: matches `brd.md §7.10 EM-1`.
- Phase: P3
- Source: brd.md §7.10 EM-1

**S26-1.2** — As a Compliance officer, the Vessel Emissions Breakdown shows per-vessel emissions.
- Persona: Compliance
- Acceptance: matches emissions-tracker.html "Vessel Emissions Breakdown".
- Phase: P3
- Source: emissions-tracker.html

**S26-2.1** — As a Compliance officer, the By Voyage sub-tab shows the Voyage Emissions Log per vessel and voyage.
- Persona: Compliance
- Acceptance: matches emissions-tracker.html "Voyage Emissions Log".
- Phase: P3
- Source: emissions-tracker.html

**S26-3.1** — As a Compliance officer, I see EU ETS allowances used vs total with surplus/deficit indicator and year-end forecast.
- Persona: Compliance
- Acceptance: matches `brd.md §7.10 EM-2`.
- Phase: P3
- Source: brd.md §7.10 EM-2

**S26-3.2** — As a Compliance officer, the EU ETS Liability by Vessel table shows CO₂ tonnage, allowances held, surplus/deficit.
- Persona: Compliance
- Acceptance: matches `brd.md §7.10 EM-3`.
- Phase: P3
- Source: brd.md §7.10 EM-3

**S26-4.1** — As a Compliance officer, the Carbon Credit portfolio shows credits held, price, value, gain/loss, pending certifications.
- Persona: Compliance
- Acceptance: matches `brd.md §7.10 EM-4`; "Purchase New Credits" CTA; Upcoming Retirements panel.
- Phase: P3
- Source: brd.md §7.10 EM-4

**S26-5.1** — As a Compliance officer, the Annual Reports sub-tab generates the 2026 Draft Report and lists Regulatory Deadlines.
- Persona: Compliance
- Acceptance: matches emissions-tracker.html "Annual Reports"; "Generate 2026 Draft Report" CTA produces PDF via F7.
- Phase: P3
- Source: emissions-tracker.html

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T26-1.1.1 | `EmissionRecord`, `EuaAllocation`, `CarbonCredit` models | P3 | F4 | brd.md §7.10 EM-* |
| T26-1.1.2 | `/emissions-tracker` route + sub-tabs | P3 | F2, F3 | emissions-tracker.html |
| T26-1.1.3 | Monthly stacked emissions chart | P3 | F3 Chart | brd.md §7.10 EM-1 |
| T26-1.2.1 | Vessel Emissions Breakdown table | P3 | T26-1.1.1 | emissions-tracker.html |
| T26-2.1.1 | Voyage Emissions Log table | P3 | T26-1.1.1 | emissions-tracker.html |
| T26-3.1.1 | EU ETS status panel + year-end forecast | P3 | F5 EUA price | brd.md §7.10 EM-2 |
| T26-3.2.1 | EU ETS Liability by Vessel table | P3 | T26-1.1.1 | brd.md §7.10 EM-3 |
| T26-4.1.1 | Carbon Credit portfolio table | P3 | T26-1.1.1, F5 | brd.md §7.10 EM-4 |
| T26-4.1.2 | Upcoming Retirements panel | P3 | T26-4.1.1 | emissions-tracker.html |
| T26-4.1.3 | Purchase New Credits flow | P3 | T26-4.1.1 | emissions-tracker.html |
| T26-5.1.1 | Annual Report PDF generator | P3 | F7 | emissions-tracker.html |
| T26-5.1.2 | Regulatory Deadlines list | P3 | F4 | emissions-tracker.html |

---

## M27. Alerts & Notifications

**Phase:** P1 (LTV + price); P2 (rest); P3 (geo) · **Status:** Planned · **Lead persona:** All
**Source:** `brd.md §7.11 AL-1..AL-4`, `html/notifications.html` (R-7)

**Purpose.** Configurable alerts across financial, market, FX, and geographic risk types, with an alert feed surfaced everywhere.

### Epics

- **E27-1** — FMV Threshold Alerts
- **E27-2** — LTV Covenant Alerts
- **E27-3** — Market Index & Rate Alerts
- **E27-4** — Exchange Rate Alerts
- **E27-5** — Geographic Risk Alerts (zones, vessel tracking)
- **E27-6** — Alert History
- **E27-7** — Alert Feed UI (topbar bell + dashboard panel)

### Stories

**S27-1.1** — As an Owner, I can set a price-change threshold alert per vessel.
- Persona: Owner
- Acceptance: matches `brd.md §7.11 AL-1`; threshold input is %; mute and dismiss actions on alert events.
- Phase: P1
- Source: brd.md §7.11 AL-1, notifications.html "FMV Threshold Alerts"

**S27-2.1** — As an Analyst, I can set an LTV covenant breach alert per facility.
- Persona: Analyst
- Acceptance: alert fires when computed LTV breaches covenant max; matches `brd.md §7.11 AL-1`; LTV Monitoring — All Loans table view included.
- Phase: P1
- Source: brd.md §7.11 AL-1, notifications.html "LTV Covenant"

**S27-3.1** — As an Analyst, I can set Market Index alerts (e.g., BDI down ≥ 10% WoW).
- Persona: Analyst
- Acceptance: live index snapshot; alert config form; active index alerts list.
- Phase: P2
- Source: notifications.html "Market Indices"

**S27-4.1** — As a Manager, I can set Exchange Rate alerts and see Portfolio FX Impact.
- Persona: Manager
- Acceptance: live FX rates; alert config; FX impact panel calculating EUR/USD exposure.
- Phase: P2
- Source: notifications.html "Exchange Rates"

**S27-5.1** — As an Operations Manager, I can draw a polygon on a dark-theme map and define a geographic risk zone.
- Persona: Ops, Manager
- Acceptance: matches `brd.md §7.11 AL-3`; pre-defined zones available (Suez Canal, Strait of Hormuz).
- Phase: P3
- Source: brd.md §7.11 AL-3

**S27-5.2** — As an Operations Manager, I see a Tracked Vessels panel with real-time Safe / At Risk status per vessel.
- Persona: Ops
- Acceptance: matches `brd.md §7.11 AL-4`.
- Phase: P3
- Source: brd.md §7.11 AL-4

**S27-6.1** — As a user, I see Alert History — Last 30 Days with filtering and export.
- Persona: All
- Acceptance: table; filter by severity / type; CSV export.
- Phase: P1
- Source: notifications.html "Alert History"

**S27-7.1** — As a user, the topbar bell shows an unread badge; clicking opens the Alerts feed.
- Persona: All
- Acceptance: implemented in F6 S6-4.1; matches `brd.md §7.11 AL-2`.
- Phase: P1
- Source: F6 S6-4.1

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T27-1.1.1 | `AlertRule`, `AlertEvent` models with `kind` enum | P1 | F4 | brd.md §7.11 AL-1 |
| T27-1.1.2 | `/alerts` route + sub-tabs | P1 | F2, F3 | notifications.html |
| T27-1.1.3 | FMV alert evaluator (cron + on-valuation) | P1 | F5 | brd.md §7.11 AL-1 |
| T27-2.1.1 | LTV covenant alert evaluator | P1 | M20 covenants, F5 | brd.md §7.11 AL-1 |
| T27-2.1.2 | LTV Monitoring — All Loans table | P1 | M17, M20 | notifications.html |
| T27-3.1.1 | Index alert evaluator | P2 | F5 indices | notifications.html |
| T27-3.1.2 | Live Index Snapshot widget | P2 | F5 | notifications.html |
| T27-4.1.1 | FX alert evaluator | P2 | F5 FX | notifications.html |
| T27-4.1.2 | Live FX Rates widget + Portfolio FX Impact panel | P2 | F4 | notifications.html |
| T27-5.1.1 | Map polygon zone editor | P3 | F5 AIS | brd.md §7.11 AL-3 |
| T27-5.1.2 | Pre-defined zones (Suez, Hormuz) | P3 | T27-5.1.1 | brd.md §7.11 AL-3 |
| T27-5.2.1 | Tracked Vessels panel + Safe/At Risk computation | P3 | F5 AIS | brd.md §7.11 AL-4 |
| T27-6.1.1 | Alert History table + CSV export | P1 | F7 | notifications.html |
| T27-7.1.1 | Topbar bell + Alerts feed (covered by F6 S6-4.1) | P1 | F6 | brd.md §7.11 AL-2 |

---

## M28. AIS Tracking

**Phase:** P3 · **Status:** Planned · **Lead persona:** Operations Manager, Manager
**Source:** `brd.md §7.11 AI-1..AI-4`, `html/ais-tracking.html`

**Purpose.** Live vessel position with route history and metadata; dark-theme map with animated pulse marker.

### Epics

- **E28-1** — Live position search & display
- **E28-2** — Current position metadata
- **E28-3** — Route history
- **E28-4** — Export tracking data

### Stories

**S28-1.1** — As an Ops Manager, I can search for a vessel and see its live position with animated pulse marker.
- Persona: Ops, Manager
- Acceptance: matches `brd.md §7.11 AI-1`; dark map theme.
- Phase: P3
- Source: brd.md §7.11 AI-1

**S28-2.1** — As an Ops Manager, I see current position metadata: location, coordinates, speed, heading, draught, destination, ETA, AIS data age.
- Persona: Ops
- Acceptance: matches `brd.md §7.11 AI-2`.
- Phase: P3
- Source: brd.md §7.11 AI-2

**S28-3.1** — As an Ops Manager, I see route history (last 10 positions) with timestamp, lat/lon, speed, heading, event status.
- Persona: Ops
- Acceptance: matches `brd.md §7.11 AI-3`.
- Phase: P3
- Source: brd.md §7.11 AI-3

**S28-3.2** — As an Ops Manager, I can toggle route history range 24h / 7d / 30d.
- Persona: Ops
- Acceptance: matches `brd.md §7.11 AI-4`.
- Phase: P3
- Source: brd.md §7.11 AI-4

**S28-4.1** — As an Ops Manager, I can export tracking data.
- Persona: Ops
- Acceptance: CSV via F7.
- Phase: P3
- Source: brd.md §7.11 AI-4

### Tasks

| ID | Task | Phase | Depends on | Source |
|---|---|---|---|---|
| T28-1.1.1 | `/ais-tracking` route + dark map shell | P3 | F2, F3 dark theme | ais-tracking.html |
| T28-1.1.2 | Vessel search + autocomplete (reuse F2) | P3 | F2 search | brd.md §7.11 AI-1 |
| T28-1.1.3 | Animated pulse marker | P3 | F5 AIS | brd.md §7.11 AI-1 |
| T28-2.1.1 | Current Position metadata card | P3 | F5 AIS | brd.md §7.11 AI-2 |
| T28-3.1.1 | Track History — Last 10 Positions table | P3 | F5 AIS | brd.md §7.11 AI-3 |
| T28-3.2.1 | History range toggle (24h / 7d / 30d) | P3 | T28-3.1.1 | brd.md §7.11 AI-4 |
| T28-4.1.1 | CSV export of tracking data | P3 | F7 | brd.md §7.11 AI-4 |

---

## 17. Phase Plans

These plans translate the modules above into shippable releases. Each phase has a concrete goal and an exit checklist. Phase boundaries are not date-locked; they advance when the exit checklist is satisfied.

### Phase 1 — Foundation (Months 1–3)

**Goal.** Working app with portfolio view, AI valuation, certificate PDF, loan structuring, cashflow modelling, and core alerts. This is the demo-able product that proves the platform concept.

**Modules in scope:** F1–F4, F6, F7, F8 (security headers + logging), M01, M02, M03, M04, M06, M12 (segments Bulk + Tanker), M13, M19, M20, M27 (LTV + price alerts).

**Stories that must ship:**

- F1: S1-1.1, S1-1.2, S1-1.3, S1-2.1
- F2: S2-1.1, S2-1.2, S2-2.1, S2-2.2, S2-3.1, S2-3.2, S2-3.3, S2-4.1, S2-5.1
- F3: S3-1.1, S3-2.1, S3-2.2, S3-3.1, S3-3.4 (Phase 1 components only), S3-4.1
- F4: S4-1.1, S4-1.2, S4-1.3, S4-2.1, S4-2.2, S4-2.3, S4-3.1 (P1 entities), S4-5.1
- F6: S6-1.1, S6-1.2, S6-4.1
- F7: S7-1.1, S7-1.2, S7-2.1
- F8: S8-1.1, S8-4.1
- M01: all P1 stories
- M02: all P1 stories
- M03: all stories
- M04: S04-1.1, S04-1.2
- M06: S06-1.1, S06-1.2, S06-2.1, S06-3.1, S06-9.1, S06-10.1
- M12: S12-1.1 (Bulk + Tanker), S12-3.1, S12-4.1, S12-5.1
- M13: S13-1.1, S13-2.1, S13-3.1, S13-3.2
- M19: S19-1.1, S19-2.1, S19-2.2, S19-3.1, S19-3.2, S19-3.3, S19-3.4, S19-6.1
- M20: S20-1.1, S20-1.2, S20-1.3, S20-2.1, S20-3.1, S20-4.1, S20-6.1
- M27: S27-1.1, S27-2.1, S27-6.1, S27-7.1

**Exit checklist:**

- [ ] User can sign in and is org-scoped on every API call.
- [ ] Sidebar, topbar, breadcrumb, and embedded route group all behave per F2.
- [ ] Health endpoint reports DB and Mail healthy; Mailpit receives test mail in dev.
- [ ] Demo seed produces ≥ 14 vessels in 2 fleets across 2 orgs and 10 users.
- [ ] Dashboard, My Fleet, Vessel Detail (P1 tabs), Market Valuations (Bulk + Tanker), Valuation Certificates, Cashflow, Loan Oracle render end-to-end.
- [ ] Generating a Valuation Certificate produces a tamper-evident PDF in < 10 s.
- [ ] LTV covenant breach alert fires automatically and surfaces in dashboard + topbar + alerts feed.
- [ ] Lighthouse perf score ≥ 80 on Dashboard and My Fleet on standard broadband.

### Phase 2 — Market Intelligence (Months 4–6)

**Goal.** Segment-aware market layer across all market pages with the Segment Insight Panel deployed everywhere.

**Modules in scope:** F5, M08, M09, M12 (Container + Gas), M14, M15, M16, M17, M18, M23, M24, M27 (Index + FX alerts), F8 metrics & secrets.

**Stories that must ship:** all P2 stories on the listed modules; F3 components S3-3.2, S3-3.3, S3-3.4 (P2 components).

**Exit checklist:**

- [ ] Segment pills + Segment Insight Panel render on Valuations, Net Fleet, Financial Transactions, Market Reports, Earnings.
- [ ] All market pages render in < 2 s with KPIs and primary chart visible (NFR-1).
- [ ] Pill toggle re-renders insight panel in < 200 ms (NFR-2).
- [ ] Live providers cover Baltic Exchange, SOFR, EURIBOR, USD/EUR FX.
- [ ] Vessel for Sale grid + S&P transaction log queryable by all filters.
- [ ] Email digest opt-in flow functional on dev.

### Phase 3 — Analytics & ESG (Months 7–9)

**Goal.** Analytics depth (Projects, Benchmarking, IRR), ESG (Environmental Score, Emissions Tracker), discovery (Advanced Search, Owner Profile, Competitor Analysis), AIS Tracking, geo alerts.

**Modules in scope:** M05, M07, M10, M11, M21, M22, M25, M26, M28, M27 (Geo alerts), F8 (audit admin).

**Exit checklist:**

- [ ] Compliance officer can run a CII review and produce an Annual Report PDF.
- [ ] Analyst can build a project, compare vessels, and run scenario IRR side-by-side.
- [ ] Manager can compare own fleet vs a competitor and matched-vessels list.
- [ ] AIS map renders with route history toggle.
- [ ] Audit log admin page surfaces all mutations for the org.

### Phase 4 — Scale & Automation (Months 10–12)

**Goal.** Automation, real-time, enterprise integrations.

**Modules in scope:** real-time AIS (websocket), automated valuation refresh, automated covenant monitoring, bulk certificate generation (M13 S13-5.1), public API, full role-based access, full email digest stack, advanced peer benchmarking.

**Exit checklist:**

- [ ] AIS map updates without page reload.
- [ ] Daily covenant monitor cron auto-generates breach alerts.
- [ ] Bulk certificate ZIP delivery functional.
- [ ] REST API documented with OpenAPI spec; rate-limited per organisation.

---

## 18. Open Questions & Decisions Pending

| ID | Topic | Question | Owner | Status | Notes |
|---|---|---|---|---|---|
| OQ-1 | Auth provider | Auth.js (NextAuth), Lucia, or Clerk for credentials + SSO? | Tech Lead | Open | Default for P1: Auth.js Credentials. Revisit before P2 if SSO is needed. |
| OQ-2 | Embedded Vessel Detail | Confirm route-group-based suppression rather than iframe (R-3 / brd.md OI-8). | Tech Lead | Open | Recommended. |
| OQ-3 | Sidebar grouping | Adopt prototype grouping (R-1) — confirm. | Product | Open | Default: yes. |
| OQ-4 | Vessel Detail tabs | Adopt prototype tab set (R-2) for P1; surface BRD's missing tabs (S&P History, Technical, Benchmarking, AIS) in P3 — confirm. | Product | Open | |
| OQ-5 | AI valuation methodology | What is the methodology and confidence formula? Inherits brd.md OI-3. | Product / Data Science | Open | P1 may ship with comparable-transaction regression fixture. |
| OQ-6 | Lender directory | Are the 18 lenders representative or indicative? Inherits brd.md OI-4. | Commercial | Open | Seed file marks them indicative. |
| OQ-7 | CII data source | Voyage MRV/DCS data vs estimated? Inherits brd.md OI-5. | Product | Open | P3 default: estimated; switch to actual when integration ships. |
| OQ-8 | EU ETS phasing | Confirm 40% (2024) → 100% (2026) phasing. Inherits brd.md OI-6. | Compliance / Legal | Open | |
| OQ-9 | Multi-role within org | Row-level vs fleet-level access control. Inherits brd.md OI-9. | Product | Open | Default: fleet-level access in P2; row-level deferred to P4. |
| OQ-10 | Notifications transport | Mailgun (prod) confirmed; SES/SendGrid as fallback? Inherits brd.md OI-11. | Tech Lead | Open | Default: Mailgun in prod. |
| OQ-11 | Certificate metering | Pay-per-certificate or subscription-included? Inherits brd.md OI-12. | Commercial | Open | Affects M13 generation flow. |
| OQ-12 | AIS provider | MarineTraffic, Spire, or ExactEarth. Inherits brd.md OI-1. | Tech Lead | Open | Affects P3 M28 cost. |
| OQ-13 | Project name | Codebase = `snp-module`; UI display = "Signal S&P". Confirm (R-15). | Product | Resolved | Decision recorded; no code path uses "ShipInvest" beyond historical references. |
| OQ-14 | Design tokens | When to import prototype tokens — at scaffold or first port? | Eng | Open | Default: first port. Scaffold uses shadcn defaults to avoid stealing from `../html/`. |
| OQ-15 | Seed data | Use prototype's exact vessel/lender names or synthetic? | Product | Open | Default: prototype names for parity. |
| OQ-16 | "Per-segment" Container & Gas | BRD lists 4 segments; prototype demos Bulk/Tanker primarily. Confirm Container & Gas land in P2. | Product | Open | |
| OQ-17 | Public API | Does P4 ship with a public REST API or only an internal one? | Product / Tech Lead | Open | |
| OQ-18 | Storybook + visual regression | Chromatic or self-hosted Playwright snapshots? | Eng | Open | Default: Chromatic (lower ops burden). |
| OQ-19 | Forecast methodology | M16 3-year forecast — driven by user assumptions or model-derived? | Product | Open | Default: assumption-driven, model-assisted. |
| OQ-20 | Geo alerts map provider | Mapbox, MapLibre, or Leaflet for M27 polygon editor? | Eng | Open | Default: MapLibre (open-source, vector tiles). |

---

## 19. Glossary

| Term | Meaning |
|---|---|
| AIS | Automatic Identification System — real-time vessel position broadcast. |
| AVM | Automated Valuation Model. |
| BCI | Baltic Capesize Index. |
| BCTI | Baltic Clean Tanker Index. |
| BDI | Baltic Dry Index. |
| BDTI | Baltic Dirty Tanker Index. |
| BPI | Baltic Panamax Index. |
| Bear / Base / Bull | Three downside/expected/upside scenarios used in cashflow modelling. |
| CII | Carbon Intensity Indicator (IMO). |
| Comparable | A historical transaction or asset used as a reference point for a valuation. |
| Covenant | A clause in a loan agreement that constrains the borrower (e.g. LTV ≤ 70%). |
| DCF | Discounted Cash Flow. |
| DWT | Deadweight Tonnage. |
| EEDI / EEXI | Energy Efficiency Design / Existing Ship Index. |
| EUA | EU Allowance — one tonne of CO₂ under EU ETS. |
| EU ETS | EU Emissions Trading System. |
| EURIBOR | Euro Interbank Offered Rate. |
| FMV | Fair Market Value. |
| Financibility Score | Internal 0–10 score expressing how easily a vessel can be financed. |
| FX | Foreign Exchange. |
| IMO | International Maritime Organization (also: an IMO number — vessel ID). |
| IRR | Internal Rate of Return. |
| LTV | Loan-to-Value ratio. |
| MEP | Main Engine Power. |
| MRV | Monitoring, Reporting, Verification — EU shipping emissions framework. |
| NB / Newbuild | Newbuilding — newly constructed vessel. |
| NPV | Net Present Value. |
| OPEX | Operating Expenses. |
| RSC | React Server Component. |
| S&P | Sale & Purchase. |
| SOFR | Secured Overnight Financing Rate. |
| SP&S | A short-hand sometimes used for Sale & Purchase. |
| TCE | Time Charter Equivalent. |
| TC | Time Charter. |
| TM | Technical Management (fees). |
| VLCC | Very Large Crude Carrier. |
| WoW | Week on Week. |
| YTD | Year to Date. |

---

**End of Platform BRD.**
