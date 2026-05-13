# ADR-0001 — Prisma + PostgreSQL for application persistence

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Web platform team, @ja

## Context

The Signal S&P module needs a typed, mainstream ORM and a relational database for org-scoped business data: organisations, users, fleets, vessels, valuations, loans, audit logs. The platform-BRD §4 already pencilled in Prisma + PostgreSQL but the choice was never formally recorded as a decision. This ADR formalises it.

The platform team also evaluated Drizzle, raw `pg`, and Kysely during the initial scaffolding phase. The previous Laravel platform used Eloquent + MySQL, but that stack was end-of-life for this rebuild.

## Decision

The application uses **Prisma 6** as its ORM, with **PostgreSQL 16** as the database. PostgreSQL is hosted on **Supabase** in production (transaction pooler on port 6543 for runtime queries, direct connection on port 5432 for migrations) and **Docker Compose** locally (`so-snp-db` service).

Every Prisma model that holds user data follows the same convention: `id` (CUID), `createdAt`, `updatedAt`, `deletedAt` (soft delete), plus `orgId` for org-scoped models. Reference / lookup tables (Country, Port, VesselType, Shipyard, ClassSociety, EngineMaker, EngineModel) are platform-global and use `isActive` for soft deactivation instead of `deletedAt`.

Migrations live under `web/prisma/migrations/` and are applied via `pnpm db:migrate` (dev) or `pnpm db:migrate:deploy` (CI / prod). The Prisma client is regenerated on `postinstall` and committed via the lockfile.

## Consequences

### Positive

- Single source of truth: the schema in `prisma/schema.prisma` is the database, the TypeScript types, and the documentation in one file.
- Server actions and route handlers get fully-typed query/mutation APIs without writing DTOs.
- `prisma migrate` produces forward-only SQL migrations that are versioned and reviewed in PRs.
- Supabase provides a managed Postgres with point-in-time recovery, daily backups, and a pooler — all without standing up infrastructure.

### Negative / trade-offs

- Prisma's query API is opinionated; complex aggregations sometimes require raw SQL via `$queryRaw`.
- The generated client is large (~10 MB). Cold-start latency on serverless is real, but we run on a long-lived Node server, so it's a non-issue here.
- Vendor coupling to Supabase in production is accepted in exchange for managed Postgres + Auth.js integration.

## Alternatives considered

- **Drizzle** — lighter, closer to SQL, but tooling and ecosystem are still maturing. Migrations and type-level safety are less polished than Prisma's. Re-evaluate in 2027.
- **Kysely + raw migrations** — full SQL control, but the type ergonomics require a lot of boilerplate. Better suited to teams already deep in SQL.
- **Eloquent (Laravel)** — the previous platform. Not in scope for this rebuild.
- **TypeORM / MikroORM** — older Node ORMs, both have decorator + reflection issues with strict TypeScript and Edge runtimes.

## References

- `web/docs/brd/platform-brd.md` §4 Technology Stack
- `web/docs/architecture/database.md` — conventions, ER diagram
- ADR-0002 — Vessel IMO not globally unique
- ADR-0003 — Platform-global reference data strategy
