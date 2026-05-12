# Signal S&P — `web/`

Next.js 15 platform for the Signal S&P sale & purchase tooling. This is the
**production target** — the canonical app that replaces the prototypes in
`../html/` and `../nodejs/`.

> **Specification.** Everything in this app traces back to
> [`docs/brd/platform-brd.md`](./docs/brd/platform-brd.md). Open
> [`docs/brd/platform-brd.html`](./docs/brd/platform-brd.html) in a browser
> for the rendered version with TOC.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** (App Router, Server Components, Server Actions) |
| Language | TypeScript 5 (`strict: true`) |
| Styling | **Tailwind CSS 3** + **shadcn/ui** (no custom CSS, no inline styles, no hex literals in components) |
| ORM | **Prisma 6** on **Postgres 16** |
| Auth | **Auth.js v5** (NextAuth) — Credentials + Email magic link, Prisma adapter |
| Mail | **Mailgun HTTP API** via `mailgun.js` (`lib/mail.ts`). Configured with `MAILGUN_DOMAIN` + `MAILGUN_SECRET`. |
| Runtime | Node 20 LTS |
| Package manager | pnpm 9 |
| Container | Docker Compose (`db`, `mail`, `web`) |

See `docs/brd/platform-brd.md` §4 Technology Stack for the binding rules.

---

## Prerequisites

- **Node 20 LTS** (use `nvm use` — `.nvmrc` pins it).
- **pnpm 9** — `corepack enable && corepack prepare pnpm@9.15.0 --activate`.
- **Docker Desktop** (for the `db` and `mail` services).

---

> **Looking for the full operations guide?** See
> [`docs/runbooks/getting-started.md`](./docs/runbooks/getting-started.md) —
> it has the complete service map, seeded credentials, verification
> checklist, troubleshooting, and reset-from-scratch procedure.

## Quickstart — full Docker stack

```bash
cd web
cp .env.example .env.local
# Generate a real AUTH_SECRET:
#   openssl rand -base64 32
# Paste the value into .env.local

docker compose up --build
# In a second terminal — name the FIRST migration `init`:
docker compose exec web pnpm db:migrate --name init
docker compose exec web pnpm db:seed
```

Then open:

| URL | Service |
|---|---|
| <http://localhost:3000> | Web app |
| <http://localhost:3000/sign-in> | Sign in (seeded user: `engineroom@oceanis.io` / `engineroom`) |
| <http://localhost:3000/sign-up> | Sign up — name + email + password (requires email verification via link) |
| <http://localhost:3000/api/health> | Health JSON (db + mail) |
| <http://localhost:3000/dev/mail-test?to=you@example.com> | Send a test email through the SMTP transport |
| <http://localhost:18025> | Mailpit web UI — all outbound dev emails land here |
| `localhost:55432` | Postgres (`snp` / `snp` / `snp`) — host port remapped from container 5432 |

---

## Quickstart — host pnpm + Dockerised services only

If you want to run Next.js on the host and only containerise Postgres & Mailpit:

```bash
cd web
cp .env.example .env.local

docker compose up -d db mail
pnpm install
pnpm db:migrate --name init   # first migration only; subsequent runs auto-name
pnpm db:seed
pnpm dev
```

---

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Start the Next.js dev server on `:3000`. |
| `pnpm build` | Production build. |
| `pnpm start` | Run the production build on `:3000`. |
| `pnpm lint` | ESLint over the project. |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm format` / `format:check` | Prettier over `**/*.{ts,tsx,md,json}`. |
| `pnpm db:generate` | `prisma generate`. |
| `pnpm db:migrate` | `prisma migrate dev`. |
| `pnpm db:migrate:deploy` | `prisma migrate deploy` (CI / prod). |
| `pnpm db:reset` | Wipe the database and re-run migrations + seed. |
| `pnpm db:seed` | Insert the dev org + dev user. |
| `pnpm db:studio` | Open Prisma Studio at `:5555`. |

---

## Environment variables

See [`.env.example`](./.env.example) for the canonical list. Required at runtime:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string used at runtime. In production points at the Supabase **transaction pooler** (port 6543). |
| `DIRECT_URL` | Postgres connection string used by `prisma migrate`. In production points at the Supabase **direct connection** (port 5432). Locally can equal `DATABASE_URL`. |
| `AUTH_SECRET` | Auth.js session secret. **Must** be generated with `openssl rand -base64 32`. |
| `AUTH_URL` | Public URL of the app, used by Auth.js for callbacks. |
| `MAILGUN_DOMAIN`, `MAILGUN_SECRET` | Mailgun HTTP API config. Domain must be verified in Mailgun. |
| `MAILGUN_REGION` | `us` (default) or `eu` for EU-region Mailgun accounts. |
| `MAIL_FROM` | From address. Local part anything; domain must match the Mailgun-verified domain. |
| `ENABLE_DEV_ROUTES` | When `true`, `/dev/mail-test` is reachable. **Always `false` in production.** |

---

## Repository layout

```
web/
├── app/                  Next.js App Router
│   ├── api/health/       JSON health check
│   ├── api/auth/         Auth.js handler
│   ├── dev/mail-test/    SMTP smoke test (gated by ENABLE_DEV_ROUTES)
│   ├── sign-in/          Auth.js sign-in page (Credentials + magic link)
│   ├── globals.css       The single allowed stylesheet
│   ├── layout.tsx        Root layout, fonts (Lato + JetBrains Mono)
│   └── page.tsx          Landing page
├── auth.config.ts        Edge-safe Auth.js config slice (imported by middleware)
├── auth.ts               Auth.js v5 full config + handlers (Node-only — Prisma + Email provider)
├── middleware.ts         Edge auth middleware (uses auth.config.ts only)
├── components/
│   ├── ui/               shadcn primitives
│   └── brand/            Brand mark
├── lib/
│   ├── prisma.ts         Singleton PrismaClient
│   ├── mail.ts           Nodemailer transport
│   └── utils.ts          cn() helper
├── prisma/
│   ├── schema.prisma     F1/F2/F3 baseline schema
│   └── seed.ts           Idempotent seed
├── docs/                 Docs-as-code (architecture, decisions, runbooks, brd mirror)
├── docker-compose.yml    db + mail + web
├── Dockerfile.dev        Dev image for the web service
├── tailwind.config.ts    Tailwind + Signal Ocean tokens
├── components.json       shadcn config
├── tsconfig.json         strict TypeScript
└── next.config.ts        Next.js config
```

---

## Style rules (binding)

Per `docs/brd/platform-brd.md` §4.2:

1. **No custom `.css` files** beyond `app/globals.css`.
2. **No inline `style={{...}}` props** in components — use Tailwind utilities.
3. **No raw hex literals** in components — reference semantic tokens (`bg-primary`, `text-muted-foreground`, etc.) defined in `app/globals.css`.
4. New components must compose existing shadcn primitives where one exists.
5. Tokens (colours, radii, fonts) live in `app/globals.css` and `tailwind.config.ts` only.
6. Dark mode is theme-class driven (`.dark` on `html`); never duplicate components per theme.
7. Icons via `lucide-react` only.

---

## First-run cleanup

Before your first `pnpm install`, delete two artefacts left over from the
sandbox where this scaffold was generated:

```bash
cd web
rm -rf node_modules _tmp_*
```

(They're harmless empty placeholders — the FUSE mount used during scaffolding
wouldn't let them be removed remotely.)

## Verification status

The scaffold was verified end-to-end against a clean `pnpm install`:

| Check | Result |
|---|---|
| `pnpm install` | clean — no peer-dep warnings, no security advisories |
| `tsc --noEmit` | passes — entire codebase type-clean |
| `next lint` | passes — zero ESLint errors or warnings |
| `docker compose up --build` | builds and starts cleanly |
| `pnpm db:migrate --name init` | applies the F1/F2/F3 baseline schema |
| `pnpm db:seed` | creates the dev org and seed user |
| Sign in via `/sign-in` | succeeds end-to-end (Credentials → JWT session → landing page shows "Signed in as …") |
| `/api/health` | returns `{ status: "ok" }` with `db.ok` and `mail.ok` both true |

## Next milestones

After verifying this scaffold runs (`pnpm dev`, sign in, health page, magic-link
through Mailpit), the next sprint is:

1. **F1 / F2 / F3 hardening** — finish org-scoped middleware, audit-log writer.
2. **M01 IMO Lookup** — first real feature, no auth gating yet.
3. **M02 Vessel Detail** — embedded mode (route group + layout suppression).

These are tracked in `docs/brd/platform-brd.md` §17 Phase Plans.
