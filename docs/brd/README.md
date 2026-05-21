# BRD

`platform-brd.md` in this folder is the **canonical, editable Business
Requirements Document** for the web app. All feature work — design discussions,
locked decisions, schema additions, NFRs — gets reflected here as part of the
PR that implements it.

| File | Purpose |
|---|---|
| `platform-brd.md` | Canonical BRD. Edit here. |
| `platform-brd.html` | Rendered HTML view, regenerated from the `.md`. |

## Ownership

Previously this folder was a read-only mirror of `shipinvest/platform-brd.md`
at the repo root. That convention is retired (see ADR-0001). From OT-175
onwards, the canonical BRD lives in this folder. The repo-root copy is kept
for history but is no longer updated.

## Update procedure

Every feature PR that introduces or changes platform behaviour must:

1. Edit `platform-brd.md` to reflect the locked design — new FR rows,
   stories, task tables, data-model additions, NFRs.
2. Regenerate `platform-brd.html` from the `.md` (build script forthcoming;
   for now, regenerate manually if a stakeholder needs the HTML view).
3. Commit both files together with the code change.

## What goes in the BRD vs. ADRs vs. architecture docs

- **BRD** — what the product does, who uses it, what each feature requires.
  Functional requirements, user stories, acceptance criteria, NFRs.
- **ADRs** (`../decisions/`) — single, immutable decisions and their
  trade-offs. Reference these from the BRD rather than copying rationale.
- **Architecture docs** (`../architecture/`) — diagrams, request flows,
  component contracts, testing strategy. Implementation-facing.
- **Runbooks** (`../runbooks/`) — operational playbooks for incidents and
  recovery.

If you find yourself copying the same rationale into multiple places, write
an ADR and link to it everywhere else.

## Cross-references

- ADR index: `../decisions/README.md`
- Architecture index: `../architecture/README.md`
- High-level business document: `../../../.gsd/brd.md`
