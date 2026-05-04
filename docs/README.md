# Signal S&P — `web/docs/`

This tree holds **all documentation that lives with the app code**. Top-level
work-in-progress notes live in `../../.gsd/`; the canonical platform spec
lives in `../../platform-brd.md` and is mirrored here under `brd/`.

## Layout

| Folder | Purpose |
|---|---|
| [`architecture/`](./architecture/) | Component diagrams, request-flow walkthroughs, deployment topology. |
| [`decisions/`](./decisions/) | Architecture Decision Records (ADRs). One file per decision, immutable. |
| [`runbooks/`](./runbooks/) | Operational runbooks: incident response, on-call playbooks, recovery procedures. |
| [`brd/`](./brd/) | Read-only mirror of `platform-brd.md` and `platform-brd.html`. **Do not edit here.** |

## Docs-as-code rules

- Every directory has a `README.md` that lists the documents inside it.
- All docs are Markdown unless a binary asset (PDF, image) is required.
- Mermaid for diagrams when possible. Save complex Figma artifacts under `architecture/assets/`.
- Decisions in `decisions/` are immutable. Supersede a decision by writing a new ADR that references the old one.
