# ADR-0003 — Platform-global reference data with "Other" free-text fallback

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Web platform team, @ja

## Context

Several Vessel and Fleet fields reference well-known maritime entities that are stable across orgs: flag countries, ports of registry, vessel types (a hierarchy: segment → subtype), shipyards, classification societies, engine makers and models, and counterparties (charterers, lenders, brokers).

The old Laravel platform let any org admin add new reference entries, which produced a long tail of duplicates with inconsistent spelling — `"Hyundai HHI"`, `"Hyundai Heavy Industries"`, `"HHI"`, all referring to the same yard — that polluted aggregate reporting and cross-org analysis. We want to avoid that here.

At the same time, the form should not block a user who has a vessel built at a yard we haven't seeded yet. The user needs a way forward immediately, even if the canonical reference list is incomplete.

## Decision

Reference data is **platform-global** and **seeded by the dev team only**. Customer admins cannot add, edit, or delete reference rows from the UI. The reference tables are:

- `Country` (with `isFlagState`)
- `Port`
- `VesselType` (hierarchical: top-level segments and their subtypes)
- `Shipyard`
- `ClassSociety`
- `EngineMaker`
- `EngineModel`
- `Counterparty` — globally seeded for well-known firms (Shell, Cargill, BP, …); the schema supports an `orgId` column so a future feature can re-enable org-private entries if needed.

Each form field that targets one of these tables provides an **"Other" option**. When the user selects "Other" and types a free-text value:

1. The form stores the FK as `null` and writes the user's text into a dedicated `*Other` column on the consuming row (e.g. `Vessel.shipyardOther`). This keeps the record saveable today.
2. The same submission also writes a row to `pending_reference_suggestions` with the table, the free text, any contextual data (e.g. proposed country), and the user/org who suggested it.
3. A future admin screen lets the platform team review each suggestion and either:
   - **Merge:** add it as a proper row in the reference table and (optionally) re-link any vessels whose `*Other` value matches.
   - **Reject:** mark the suggestion rejected with an optional note.

Reference rows are soft-deactivated via `isActive = false` rather than deleted, so historical FKs in user data stay valid even when an entry is retired (e.g. a yard closes down).

## Consequences

### Positive

- Reference data stays clean and consistent across orgs, which makes aggregate reporting trustworthy.
- "Other" never blocks a user from saving their data.
- The admin review queue gives the dev team a structured way to grow the reference catalogue from real-world demand rather than guessing.
- Soft deactivation preserves data lineage when reference entries are retired.

### Negative / trade-offs

- The admin review screen has to exist for the loop to close. Until it ships, suggestions accumulate but don't get merged. We accept this as a P2 task — the loop can run manually via SQL in the meantime.
- Free-text `*Other` columns duplicate data conceptually (one of `shipyardId` or `shipyardOther` is set, not both). Acceptable for two reasons: (a) it's a small set of columns, (b) it lets the application render the value uniformly without joining to a "free-text override" table.
- Org-private reference entries are deliberately not supported in P1. If a customer demands "we want our own list of charterers", we'll revisit.

## Alternatives considered

- **Let org admins add reference rows freely** — the previous platform's approach. Rejected because it produced inconsistent, polluted reference data within months.
- **Free text only, no reference tables** — easiest to build, but kills any chance of aggregate reporting and autocomplete UX.
- **Store free-text on the `pending_reference_suggestions` row only, leave the consuming row's FK null without a `*Other` mirror** — forces every form view to join to the suggestions table to render the user-entered name. Rejected for the join overhead.

## References

- `web/docs/brd/platform-brd.md` §7.2 (Fleet) and §7.3 (Vessel)
- `prisma/schema.prisma` — `pending_reference_suggestions` model and the `*Other` columns on `Vessel`
- `web/docs/architecture/database.md` — reference-table conventions
