# Architecture

Component diagrams, request-flow walkthroughs, deployment topology, and
cross-cutting engineering concerns.

## Index

| Doc | Scope |
|---|---|
| [`database.md`](./database.md) | Schema conventions, ER diagrams, soft-delete pattern, migration workflow |
| [`testing-strategy.md`](./testing-strategy.md) | How automated testing is organised (Vitest, Playwright, MSW, CI) |

_(more docs added as the system grows — fleets & vessels module,
Signal Ocean integration, URL conventions.)_

## Conventions

- Diagrams in Mermaid where possible. Embed inline in `.md`.
- For Figma exports or screenshots, save under `assets/` next to the doc that uses them.
- Reference decisions by ADR number (e.g. "see ADR-0003") rather than copying rationale.
