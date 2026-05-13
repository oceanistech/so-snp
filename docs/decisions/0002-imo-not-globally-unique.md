# ADR-0002 — Vessel IMO is not globally unique within an org

- **Status:** Accepted
- **Date:** 2026-05-13
- **Deciders:** Web platform team, @ja

## Context

International Maritime Organisation (IMO) numbers are designed to be globally unique identifiers — one IMO per hull, for the life of the hull. The natural database constraint would therefore be a unique key on `(orgId, imo)` for the `Vessel` table.

During the OT-175 design discussion the product owner asked for a different rule: **an org can save multiple vessel records under the same IMO, as long as the vessel name differs.** This supports several legitimate maritime data scenarios that come up in real portfolios:

1. **Historical renames.** A hull's name changes during its life (e.g. after a sale). Users want to keep separate records for each name in their tracker so analyses, certificates, and notes attached to the old name aren't merged with the new one.
2. **Competitor / market vessels.** Brokers sometimes track competitor hulls under their own internal labels rather than the official name, while still recording the IMO for matching against external data sources.
3. **Data quality realities.** External data sources occasionally publish inconsistent IMO/name pairings, and forcing strict uniqueness blocks users from saving what they actually see in the wild.

The trade-off is that "find the vessel for IMO X" can return more than one row, so the application has to handle disambiguation. We accept that complexity in exchange for not constraining the user's data model.

## Decision

The `Vessel` table's uniqueness constraint is **`(orgId, imo, name)`** — not `(orgId, imo)`.

Consequences for the system:

- Routes that previously could have used IMO as the URL identifier (`/vessels/[imo]`) now use the database id instead: **`/vessels/[id]`**. The IMO Quick Lookup combobox shows a result list (one entry per matching saved record + the Signal Ocean result) rather than auto-navigating on match.
- The Add Vessel form does not warn the user when they enter an IMO that already has a vessel under that org (silent acceptance, per the design discussion).
- Search dedupes by `(imo, name)` when surfacing results.
- The Signal Ocean cache table (`VesselRegistryCache`) still uses `imo` as its key — the cache stores the canonical Signal Ocean record per IMO, independent of how many local Vessel rows reference it.

## Consequences

### Positive

- Faithful to how brokers actually track vessels — historical renames, competitor tracking, and noisy external data all work without ad-hoc workarounds.
- The schema doesn't lie about a constraint that doesn't hold in the real world.

### Negative / trade-offs

- The application layer must handle "which of these records did you mean" disambiguation in any flow keyed on IMO (search results, lookup, deep links).
- Routes by `[id]` are slightly less readable than routes by `[imo]`. Mitigated by always pairing the id-route with a breadcrumb that shows the vessel name + IMO.
- Reports that aggregate per-hull (e.g. fleet KPIs) must decide whether to dedupe by IMO or count each record separately. Default behaviour: count each `Vessel` row (the user created them deliberately).

## Alternatives considered

- **Strict `(orgId, imo)` uniqueness** — the natural choice for maritime data. Rejected because it blocks the three legitimate use cases above and forces the user to delete-and-recreate when names need to change.
- **Soft-warn on duplicate IMO + allow override** — adds friction without solving the underlying data shape question. The product owner explicitly chose silent acceptance.
- **Use `(orgId, imo)` unique + a separate "ex-names" table** — captures historical renames cleanly but doesn't help competitor-tracking or data-quality cases. Worth revisiting once the BRD-mandated `VesselOwnershipHistory` is in use; if it covers all the renames-cleanly use cases, this ADR could be superseded.

## References

- `web/docs/brd/platform-brd.md` §7.2/§7.3 — Fleet & Vessel functional requirements
- `prisma/schema.prisma` — `@@unique([orgId, imo, name])` on the `Vessel` model
- OT-175 design discussion
