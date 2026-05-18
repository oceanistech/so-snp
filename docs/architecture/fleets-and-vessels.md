# Fleets & Vessels — Architecture

**Owner:** OT-175 (Fleets and Vessels feature)
**Status:** Listing + Create flow landed; rest of M02 backlog tracked in BRD §M02.

This document describes how the `/fleetspace` listing and `/fleetspace/create`
form are wired end-to-end. It complements but does not duplicate the BRD —
the BRD describes *what* the feature does for users; this describes *how*
the code is organised.

---

## Layering — Route → Service → Repository

Per `CLAUDE.md` the feature follows the strict RSR separation.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Routes (RSC + client islands + server actions)                        │
│  ────────────────────────────────────────────────────────────────────  │
│  app/(app)/fleetspace/page.tsx               ← server component shell  │
│   └─ FleetspaceClient (client island)        ← tabs / search / filter  │
│                                                                        │
│  app/(app)/fleetspace/create/page.tsx        ← server component shell  │
│   └─ CreateFleetForm (client island)         ← useActionState form     │
│                                                                        │
│  lib/actions/fleet.actions.ts                ← server actions          │
│   └─ createFleetAction(state, formData)                                │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Services (business logic, default resolution, orchestration)          │
│  ────────────────────────────────────────────────────────────────────  │
│  lib/services/fleet.service.ts                                         │
│   ├─ create() — slug gen, case-insensitive name uniqueness, attach     │
│   └─ listForOrg() — KPI aggregates (DWT, FMV, age, type mix)           │
│                                                                        │
│  lib/services/vessel.service.ts                                        │
│   ├─ listForOrg() — UI projection (typeRoot, Decimal→number)           │
│   └─ listAttachableForOrg() — slim shape for the create checklist      │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Repositories (Prisma calls only)                                      │
│  ────────────────────────────────────────────────────────────────────  │
│  lib/db/repositories/fleet.repository.ts                               │
│   ├─ listForOrg, getById, create, attachVessels                        │
│   └─ findByNameCaseInsensitive, slugsStartingWith                      │
│                                                                        │
│  lib/db/repositories/vessel.repository.ts                              │
│   ├─ listForOrg(filters: VesselListFilters)                            │
│   └─ listAttachableForOrg, countForOrg                                 │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                            PostgreSQL via Prisma
```

## Session resolution

`lib/auth/session.ts` exports `requireSession()` — a single helper that
runs Auth.js's `auth()` and then resolves the user's active org via the
first Membership row. Every server entry point (RSC pages and server
actions) starts with this call. When multi-org membership ships, the
active org will come from a cookie/session claim and this helper is the
only thing that needs to change.

## Validation — one Zod schema, two sides

`lib/validation/fleet.ts` exports `FleetCreateSchema` and
`FleetUpdateSchema`. The same schemas are used by:

1. **Server actions** — `createFleetAction` calls `safeParse` on the
   `FormData`, returns `state.fieldErrors` keyed by input name.
2. **Client form** (future) — React Hook Form via `zodResolver` for
   inline validation as the user types. The client + server validate
   against the exact same rules; the server is authoritative.

Cross-field rules (`onSaleAt requires isOnSale=true`, "Other" mutual
exclusion, etc.) live in `.superRefine` blocks on the schemas.

## `"use server"` files export functions only

Modules with `"use server"` at the top are treated by Next.js as server-
action bundles: every export is rewritten into a thin client-side reference
that proxies to the server. **Non-function exports (types, constants, plain
objects) get stripped on the client and arrive as `undefined`.**

For that reason we split:

- `lib/actions/fleet.actions.ts` — `"use server"`, only async server actions
- `lib/actions/fleet.form-state.ts` — plain TS, holds `FleetFormState` + `INITIAL_FLEET_FORM_STATE`

The same split applies to every future feature with a server-action form.

## Server actions vs API routes

We use **server actions** (not API routes) for write paths. Reasons:

- Progressive enhancement: the form works without JS via the native HTML
  POST that React renders.
- Single source of truth for field-level errors: the action returns a
  typed `FleetFormState` and `useActionState` keeps it in sync.
- No double validation: actions call into the service directly without
  serialising-then-reparsing JSON.

API routes will appear for *external integrations* — Signal Ocean
lookups, programmatic vessel registry sync, etc. — not for UI write
paths.

## Slug generation

Slugs are generated by the service from the fleet name via `slugify()`:

```
"Fleet Alpha"           → "fleet-alpha"
"Côte d'Azur Fleet"     → "cote-d-azur-fleet"
"@@@@"                  → "fleet"  (fallback)
```

If the base slug is already taken in the org, the service appends `-2`,
`-3`, … via `resolveSlug` (which queries `slugsStartingWith` once and
walks the cached set in-memory).

## Uniqueness enforcement

The Prisma model has `@@unique([orgId, name])` and `@@unique([orgId, slug])`,
both case-sensitive. The service additionally enforces **case-insensitive**
name uniqueness via `findByNameCaseInsensitive` before calling `create()` —
this avoids a Prisma `P2002` round trip and gives the user a clean
field-level error message.

## URL params and the success banner

After `createFleetAction` succeeds, it redirects to
`/fleetspace?created=<fleetId>`. The listing RSC reads `searchParams`,
looks the fleet up in the freshly-fetched list, and passes it to
`FleetspaceClient` as `justCreated`. The client renders a dismissable
banner with a one-click "open it now" button that opens the new fleet's
tab. Dismissal calls `router.replace("/fleetspace")` to clear the param
so a manual refresh doesn't re-show the banner.

## What's deliberately out of scope (M02 deferred)

The HTML prototype's `my-fleet.html` includes an Employments section
(Gantt timeline, TC schedule, expirations alerts). Those need an
**Employment** + **Charterer** data model that doesn't exist yet and
shipping them as a static mock would mis-set expectations. We render an
inline placeholder in the fleet detail view linking to the future ticket.

## Tests

| Path | What it covers |
|---|---|
| `lib/services/__tests__/fleet.service.test.ts` | slugify, defaults, uniqueness, slug collision, KPI aggregation |
| `lib/services/__tests__/vessel.service.test.ts` | row → UI projection, typeRoot derivation, null FMV handling |
| `lib/actions/__tests__/fleet.actions.test.ts` | redirect on success, field errors, duplicate-name mapping, generic error |
| `app/(app)/fleetspace/__tests__/fleetspace-client.test.tsx` | empty state, table render, tab switch, justCreated banner |
| `app/(app)/fleetspace/create/__tests__/create-fleet-form.test.tsx` | sections render, vessel checklist toggle/filter, error rendering |

Repository-level (Prisma) tests are deferred to the integration test
suite (`lib/__tests__/seed.test.ts` already exercises Prisma against the
docker Postgres; the new repository methods will get their own
`it.runIf(dbReachable)` cases when row-action server actions land).
