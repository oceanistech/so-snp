# Testing strategy

This document records how automated testing is organised across the web app.
It is the source of truth for "where does this test go?" and "which tool runs
it?" — keep it current as the codebase grows.

## Tools

| Tool | Purpose | Config |
|---|---|---|
| **Vitest** | Unit + integration tests (TS files + RTL component tests) | `vitest.config.ts`, `vitest.setup.ts` |
| **@testing-library/react** | DOM testing for React components | loaded by `vitest.setup.ts` |
| **@testing-library/jest-dom** | Custom DOM matchers (`toBeInTheDocument`, etc.) | extended via `vitest.setup.ts` |
| **MSW** | Network mocking for tests that hit external APIs (Signal Ocean) | per-test, no global server |
| **jsdom** | Browser-like DOM for component tests | Vitest `environment: "jsdom"` |
| **Playwright** | End-to-end browser tests | `playwright.config.ts` |

We deliberately did not pick Jest. Vitest has identical APIs, native ESM,
and a much faster cold start under Next.js 15 + React 19. Anything you'd
write in Jest works unchanged here.

## Test categories and where each lives

| Category | What it covers | Path convention | Runtime |
|---|---|---|---|
| Pure unit | Validators, formatters, mappers, helpers | `lib/**/__tests__/*.test.ts` or co-located `*.test.ts` | Node + jsdom |
| Repository | Prisma queries, repository-layer functions | `lib/repositories/__tests__/*.test.ts` | Real test Postgres |
| Server actions | Form-handling, mutations | `app/(app)/**/actions.test.ts` | Real test Postgres + mocked session |
| API routes | `app/api/**/route.ts` handlers | `app/api/**/route.test.ts` | Real test Postgres + MSW |
| Component | React components (RTL) | `components/**/*.test.tsx` | jsdom |
| End-to-end | Full user flows via real browser | `tests/e2e/**/*.spec.ts` | Real Next.js server + real Postgres |

## Scripts

| Command | What it does |
|---|---|
| `pnpm test` | Run all Vitest suites once |
| `pnpm test:watch` | Watch mode (re-runs on file change) |
| `pnpm test:coverage` | Run with V8 coverage, write `./coverage/` |
| `pnpm test:e2e` | Run all Playwright suites once |
| `pnpm test:e2e:headed` | Same, but with a visible browser window |
| `pnpm test:e2e:ui` | Open Playwright's interactive runner |
| `pnpm test:all` | Vitest + Playwright in sequence |

## Coverage targets

Enforced by `vitest.config.ts` against the files under `lib/`, server actions,
and API routes:

| Metric | Threshold |
|---|---|
| Lines | 80% |
| Functions | 80% |
| Branches | 75% |
| Statements | 80% |

Components are intentionally **excluded** from the threshold — UI churn
shouldn't be obsessively covered. Cover the important interactions via RTL
and the full flow via Playwright instead.

## Database for tests

CI spins up a Postgres 16 service container per workflow run. Locally:

- The default workflow is to keep `docker compose up` running for development
  and to run **unit/repository tests against the same DB**. This is fine
  because every test that touches user data does so inside a transaction
  that's rolled back, so no test data persists between runs.
- If you need an isolated test DB, run a second compose stack with a
  different volume + port. Add it to `docker-compose.test.yml` if/when
  that pattern becomes common.

CI uses a fresh `snp_test` database that's wiped at the start of each job.

## Mocking external services

**Signal Ocean** is the only external service called from server code today.
Tests never reach the real Signal Ocean API:

- **Unit / API-route tests** stub Signal Ocean via MSW. Each test sets up its
  own MSW server with the responses it needs, then tears it down in
  `afterEach`. There is no shared global MSW server — keeping setup
  per-test makes failures easy to localise.
- **Playwright tests** intercept Signal Ocean requests via
  `page.route("https://api.signalocean.com/**", …)`. The handler returns
  fixture JSON. No real HTTP request leaves the test runner.
- **CI** sets `SIGNAL_OCEAN_API_ENABLED=false` and a placeholder key so any
  test that accidentally constructs a real client gets refused fast.

## File naming and conventions

- Tests live next to the code they cover whenever possible:
  - `lib/format/money.ts` → `lib/format/money.test.ts`
  - `components/app/vessel-search-combobox.tsx` → `components/app/vessel-search-combobox.test.tsx`
- Repository tests use a `__tests__/` subfolder because they're heavier and
  often share setup:
  - `lib/repositories/fleet.repository.ts` → `lib/repositories/__tests__/fleet.repository.test.ts`
- Playwright specs are grouped by feature folder under `tests/e2e/`:
  - `tests/e2e/fleets/create.spec.ts`
  - `tests/e2e/vessels/add-with-imo-lookup.spec.ts`
- One test file = one subject. If a file has more than ~200 lines of tests,
  split by scenario rather than letting one file grow indefinitely.

## CI workflow

Defined in `.github/workflows/ci.yml`. Triggers on pushes and PRs targeting
`main` and any `feature/**` branch. The job:

1. Sets up pnpm 9 + Node 22 with pnpm cache
2. Installs deps with frozen lockfile
3. `pnpm db:generate` then `pnpm db:migrate:deploy` against the Postgres service
4. `pnpm typecheck`
5. `pnpm lint`
6. `pnpm test:coverage` — uploads `web/coverage/` as an artifact
7. Installs Playwright browsers
8. `pnpm test:e2e` — uploads `web/playwright-report/` on failure

A red build blocks merge. Pre-push runs typecheck + lint locally; tests run
in CI so the hook stays fast.

## Adding a new test

1. Decide which category it falls into (table above).
2. Create the file at the conventional path.
3. Run `pnpm test:watch` (or `pnpm test:e2e:ui` for E2E) while writing it.
4. If the test needs DB, use a transaction-rollback helper from
   `lib/test-utils/` (added per repository when first needed).
5. If the test needs a stubbed external call, use MSW for server-side tests
   or `page.route()` for Playwright.
6. Commit the test in the same commit as the production code it covers.
   The commit message should reference both, e.g.
   `OT-175 - Add Fleet repository with org-scoped CRUD and tests`.

## Things we deliberately do not test

- Generated Prisma client code.
- Third-party library internals.
- CSS / Tailwind class output (visual regression belongs in a separate
  pipeline, not Vitest).
- Next.js framework behaviour. Trust the framework; test your code.
