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

## Add Vessel — same layering, slightly bigger payload

The Add Vessel flow follows the same Route → Service → Repository split:

```
app/(app)/vessels/new/page.tsx           ← RSC shell, fetches refs + fleets
 └─ AddVesselForm (client island)         ← useActionState form + live preview

app/(app)/vessels/[imo]/page.tsx         ← Detail page (id is a CUID,
                                            not an IMO — see directory note)

lib/actions/vessel.actions.ts            ← "use server" — createVesselAction
lib/actions/vessel.form-state.ts         ← shared FleetFormState equivalent

lib/services/vessel.service.ts           ← create() + getDetailById() +
                                            existing list projections
lib/services/reference.service.ts        ← loadAddVesselData() (single
                                            Promise.all over reference repo)
lib/db/repositories/vessel.repository.ts ← + create(), findByImoAndName(),
                                            getDetailById()
lib/db/repositories/reference.repository.ts ← reads for the form dropdowns
```

**Uniqueness** is `(orgId, imo, name)` per ADR-0002. The service does a
case-insensitive lookup before insert and maps the conflict to inline
`imo` + `name` field errors. The DB constraint is the second line of
defence; the pre-check exists so the user gets a clean message without a
Prisma `P2002` round trip.

**Optional fleet attachment** at create time: when the form submits
`fleetId`, `VesselRepository.create` runs the vessel insert + the
`FleetVessel` row insert inside `prisma.$transaction(...)`. Either both
land or neither does.

**Two-level vessel-type picker.** The form fetches every active
`VesselType` once and filters parent vs subtype client-side. The
`vesselTypeId` posted to the action is always the leaf (subtype) id when
one is picked, otherwise the parent id. The server schema validates the
id is a CUID; the leaf-only business rule lands later as a service guard
when we have schema-level confidence that all leaves exist.

## Nested vessel sub-tabs in /fleetspace

Matches the prototype's two-level tab pattern (`my-fleet.html`'s
`.vessel-browser-bar`):

```
Level 1 — Fleet tabs
  All Fleets | Fleet Alpha | Fleet Beta

Level 2 — Vessel sub-tabs (only inside a specific fleet)
  All Vessels (8) | MV Pacific Star (x) | MT Helios (x)
```

State lives on `FleetspaceClient` and is keyed by fleet id:

- `openVesselsByFleet: Record<fleetId, vesselId[]>` — ordered list of
  open sub-tabs per fleet.
- `activeVesselByFleet: Record<fleetId, "all" | vesselId>` — the
  currently selected sub-tab per fleet.
- `vesselDetailCache: Record<vesselId, VesselDetail | "loading" | "error">`
  — memoised lazy-fetch responses.

**Lazy fetching.** Clicking a vessel name calls `openVesselTab(fleetId, vesselId)`
which adds the tab + marks the cache slot `"loading"`. A `useEffect`
notices new loading slots and dispatches a single `fetch()` per vessel to
`/api/vessels/[id]`. The response is run through `hydrateVesselDetailDates`
(JSON loses Date types) before being committed to the cache. Subsequent
opens of the same vessel hit the cache instantly.

**Closing a fleet tab** drops the fleet's per-fleet vessel state (open
list + active key); the detail cache is intentionally preserved so
re-opening from any fleet remains instant.

**Why an API route, not a server action.** Server actions are the right
fit for mutations; reads benefit from being addressable URLs that can be
hit by `fetch`, paginated/streamed in the future, and reused by an
embedded preview (e.g. Vessel Search M04). The route lives at
`app/api/vessels/[id]/route.ts` and is the only HTTP read endpoint for a
vessel today.

**Vessel name click → sub-tab open.** The fleet vessel table now renders
the name as a `<button>` (was a `<Link>`) that calls `openVesselTab`.
Cmd/Ctrl-click still works because the user can navigate to
`/vessels/[id]` directly from the URL or the vessel detail page itself —
the sub-tab pattern is the in-fleet workflow, not the only path.

## Tests

| Path | What it covers |
|---|---|
| `lib/services/__tests__/fleet.service.test.ts` | slugify, defaults, uniqueness, slug collision, KPI aggregation |
| `lib/services/__tests__/vessel.service.test.ts` | row → UI projection, typeRoot derivation, null FMV handling |
| `lib/actions/__tests__/fleet.actions.test.ts` | redirect on success, field errors, duplicate-name mapping, generic error |
| `app/(app)/fleetspace/__tests__/fleetspace-client.test.tsx` | empty state, table render, tab switch, justCreated banner |
| `app/(app)/fleetspace/create/__tests__/create-fleet-form.test.tsx` | sections render, vessel checklist toggle/filter, error rendering |
| `lib/services/__tests__/vessel.service.test.ts` (extended) | create happy path, (orgId, imo, name) case-insensitive conflict, same-IMO different-name allowed, fleetId stripped from vessel payload |
| `lib/actions/__tests__/vessel.actions.test.ts` | redirect on success, missing-name + bad-IMO + missing-flag field errors, VesselConflictError → inline errors, fleetId pass-through, formError on unexpected failure |
| `app/(app)/vessels/new/__tests__/add-vessel-form.test.tsx` | four sections + required markers, flag-state filter, two-level type picker (disabled state, subtype filter, parent-with-no-subtypes falls back, reset on parent change), live preview reflects every input, "Ready to save" toggle, field + form errors |
| `app/(app)/vessels/[imo]/__tests__/vessel-detail-tabs.test.tsx` | 8-tab strip renders, Main Information default + aria-selected, switching to another tab shows `ComingInModulePlaceholder`, URL `?tab=<key>` written via router.replace, hero card content, KPI cards, profile + specs fields, employment placeholder, certificate chips + placeholder, ownership rows + "Current" badge |
| `app/(app)/vessels/[imo]/__tests__/vessel-actions-menu.test.tsx` | Actions trigger renders with the right label + `aria-haspopup="menu"`. Open + click flow is covered by Playwright (Radix portal + jsdom don't play nicely). |

Repository-level (Prisma) tests are deferred to the integration test
suite (`lib/__tests__/seed.test.ts` already exercises Prisma against the
docker Postgres; the new repository methods will get their own
`it.runIf(dbReachable)` cases when row-action server actions land).
