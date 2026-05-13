# Architecture Decision Records (ADRs)

One file per decision. Filename pattern: `NNNN-kebab-title.md`, e.g.
`0001-prisma-postgres.md`.

## Template

```
# ADR-NNNN — Title

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD
- **Deciders:** @handle, @handle

## Context
What's the situation that forced this decision?

## Decision
What did we decide?

## Consequences
- Positive
- Negative
- Trade-offs accepted

## Alternatives considered
What else was on the table, and why was it rejected?
```

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](./0001-prisma-postgres.md) | Prisma + PostgreSQL for application persistence | Accepted |
| [0002](./0002-imo-not-globally-unique.md) | Vessel IMO is not globally unique within an org | Accepted |
| [0003](./0003-reference-data-strategy.md) | Platform-global reference data with "Other" free-text fallback | Accepted |
