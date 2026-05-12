# Runbook — Getting started locally

How to bring up Signal S&P on your machine, what each service is for, and how to check it's healthy.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20 LTS | Pinned in `.nvmrc`. Use `nvm use` from the `web/` directory. |
| pnpm | 9.x | `corepack enable && corepack prepare pnpm@9.15.0 --activate`. |
| Docker Desktop | recent | Compose V2 plugin is required (i.e. the `docker compose` command, with a space — not the legacy `docker-compose` binary). |
| OpenSSL | any | For generating `AUTH_SECRET`: `openssl rand -base64 32`. |

## First-run cleanup

The scaffold ships with two harmless leftover artefacts from the build sandbox. Delete them before your first install:

```bash
cd web
rm -rf node_modules _tmp_*
```

## Bring-up — full stack in Docker

```bash
cd web
cp .env.example .env.local
# Generate a real secret and paste it in:
openssl rand -base64 32

# Start db + mail + web
docker compose up --build

# In a second terminal, migrate and seed.
# Name the FIRST migration `init`; later migrations can be auto-named.
docker compose exec web pnpm db:migrate --name init
docker compose exec web pnpm db:seed
```

That's it — the seed creates the dev org and a sign-in user.

## Bring-up — host pnpm + containerised infra only

If you want hot-reload speed and only need Postgres + Mailpit in containers:

```bash
cd web
cp .env.example .env.local

docker compose up -d db mail

pnpm install
pnpm db:migrate --name init   # first time only
pnpm db:seed
pnpm dev
```

## Service map

| Service | URL / port | Image | Purpose |
|---|---|---|---|
| **Web app** | <http://localhost:3000> | `node:20-alpine` (built from `Dockerfile.dev`) | Next.js 15 app — the platform. |
| **Sign in** | <http://localhost:3000/sign-in> | — | Auth.js Credentials + magic-link sign-in. |
| **Health JSON** | <http://localhost:3000/api/health> | — | Db ping + SMTP `verify()`. Returns 200 when both ok, 503 when degraded. |
| **Dev mail-test** | <http://localhost:3000/dev/mail-test?to=you@example.com> | — | Sends a test email through the SMTP transport. Disabled in prod via `ENABLE_DEV_ROUTES`. |
| **Mailpit web UI** | <http://localhost:18025> | `axllent/mailpit:latest` | Inbox catching every outbound dev email. |
| **Mailpit SMTP** | `localhost:11025` | same | What `lib/mail.ts` connects to in dev. |
| **Postgres** | `localhost:55432` | `postgres:16-alpine` | DB. User `snp`, password `snp`, database `snp`. |
| **Prisma Studio** | <http://localhost:5555> | host process | Run `pnpm db:studio` to browse / edit data. |

## Seeded credentials

The `pnpm db:seed` script creates one organisation and one OWNER user. Use them on `/sign-in`:

| Field | Value |
|---|---|
| Org slug | `signal-sp-dev` |
| Email | `engineroom@oceanis.io` |
| Password | `engineroom` |

Override the defaults at runtime via env vars:

```bash
SEED_USER_EMAIL=ja@oceanis.io SEED_USER_PASSWORD=somethingstronger pnpm db:seed
```

Re-running `pnpm db:seed` is idempotent — safe to call repeatedly.

New users can also self-register at `/sign-up` (name + email + password). After sign-up the app sends a verification link by email **via Mailgun's HTTP API**; the user **cannot sign in until they click that link**. Local dev needs `MAILGUN_DOMAIN` + `MAILGUN_SECRET` set in `.env.local` — either a real domain or a Mailgun sandbox with authorized recipients.

## Verification checklist

After `docker compose up`, run through these in order. If any step fails, see Troubleshooting below.

1. **Containers up.** `docker compose ps` shows `db`, `mail`, `web` all `running` and `db` `healthy`.
2. **Migrations applied.** `docker compose exec web pnpm db:migrate --name init` (first run) or `pnpm db:migrate` (subsequent) ends with "Already in sync" or applies migrations cleanly.
3. **Seed run.** `docker compose exec web pnpm db:seed` ends with `[seed] sign in at /sign-in with engineroom@oceanis.io / engineroom`.
4. **Health page.** `curl -s http://localhost:3000/api/health | jq` returns `"status": "ok"` with `db.ok: true` and `mail.ok: true`.
5. **Mail smoke test.** `curl "http://localhost:3000/dev/mail-test?to=test@example.com"` returns `{"ok":true,...}` and the message appears in the Mailpit inbox at <http://localhost:18025>.
6. **Sign in.** Open <http://localhost:3000/sign-in> and authenticate with the seeded credentials. You should land on `/`.
7. **Magic link.** Submit your address in the second form on `/sign-in`. The Auth.js email arrives in Mailpit; click the link to sign in.

## Common scripts

Run from `web/` (host) or via `docker compose exec web pnpm <script>` (containerised):

| Script | What it does |
|---|---|
| `pnpm dev` | Next dev server on `:3000`. |
| `pnpm typecheck` | `tsc --noEmit` over the project. |
| `pnpm lint` | ESLint via `next lint`. |
| `pnpm db:generate` | Regenerate the Prisma client. |
| `pnpm db:migrate` | `prisma migrate dev` — creates a new migration if the schema changed. |
| `pnpm db:reset` | Drops and recreates the database, then re-seeds. **Destructive.** |
| `pnpm db:seed` | Idempotent seed. |
| `pnpm db:studio` | Prisma Studio at `:5555`. |

## Troubleshooting

### `docker compose: command not found`
You're on the legacy V1 plugin. Either upgrade Docker Desktop (V2 ships built-in) or replace with `docker-compose` (with hyphen) in the commands above. The compose file itself is V2-compatible and works either way.

### `Health page returns 503 with db.ok = false`
Postgres isn't ready yet. Check `docker compose ps` — `db` should show `(healthy)`. If it stays `starting`, look at `docker compose logs db` for the cause (most often a port conflict on `:5432`).

### `Health page returns 503 with mail.ok = false`
Mailpit isn't reachable. Verify with `docker compose logs mail`. Inside the container the SMTP target is `mail:1025`; on the host pnpm path it's `localhost:11025`. Make sure `MAIL_HOST` / `MAIL_PORT` in `.env.local` match the path you're running. On the host pnpm path, also ensure `docker compose up -d mail` is running.

### `Sign-in with credentials fails`
Either you didn't run `pnpm db:seed`, or your `AUTH_SECRET` differs between when sessions were created and now. Rotate `AUTH_SECRET` in `.env.local`, restart the web service, sign in again.

### `Magic link email never arrives`
It's in Mailpit at <http://localhost:18025>, not your real inbox. The SMTP transport in dev intentionally captures everything locally so we don't accidentally ship test emails to real addresses.

### `The edge runtime does not support Node.js 'stream' module`
Middleware imported nodemailer transitively. Auth.js's split-config pattern fixes this:

- `auth.config.ts` — Edge-safe slice (no Prisma, no nodemailer)
- `auth.ts` — Node-only full config (Prisma adapter + Email provider)
- `middleware.ts` — imports from `auth.config.ts`, NOT `auth.ts`

If you hit this after editing auth files, check that `middleware.ts` imports `@/auth.config` and not `@/auth`. Then clear the build cache:

```bash
docker compose exec web rm -rf .next .turbo
docker compose restart web
```

### `CallbackRouteError` when signing in with credentials
Two known causes:

1. **You used `session: { strategy: "database" }`** — Auth.js v5's Credentials provider only supports JWT sessions. The shipped `auth.ts` already uses `strategy: "jwt"`. If you changed it, change it back.
2. **The runtime database is different from the one seed wrote to.** See the next entry below — it's almost always Next.js's `.env.local` overriding the compose `environment:` block with a host-targeted URL.

The actual underlying error is in `docker compose logs web` — `CallbackRouteError` is just the wrapper.

### Sign-in fails with `The table public.users does not exist` (but seed succeeded)
The compose `environment:` block sets `DATABASE_URL=…@db:5432/snp` for inside the container, **but Next.js loads `.env.local` and overrides it**. Since `.env.local` is bind-mounted from the host into `/app/`, Next picks up your host-targeted URL (`localhost:55432`) and the runtime hits a different db than seed/migrate did.

Fix: keep `.env.local` aligned with the docker-internal addresses by default:

```
DATABASE_URL=postgresql://snp:snp@db:5432/snp?schema=public
MAIL_HOST=mail
MAIL_PORT=1025
```

When you want to run `pnpm dev` on the host outside docker, temporarily swap to:

```
DATABASE_URL=postgresql://snp:snp@localhost:55432/snp?schema=public
MAIL_HOST=localhost
MAIL_PORT=11025
```

After editing, restart the web container so Next.js re-loads env: `docker compose restart web`.

### `Bind for 0.0.0.0:5432 failed: port is already allocated`
Another Postgres is running on your host. Find and stop it:

```bash
lsof -i :5432                        # shows the PID and process holding the port

# Common culprits:
brew services stop postgresql@16     # Homebrew-installed Postgres 16
brew services stop postgresql        # older Homebrew formula name
docker ps                            # then `docker stop <name>` if it's a stale container
# Postgres.app? Quit it from the macOS menu bar.
```

Same pattern for `11025` (Mailpit SMTP) or `18025` (Mailpit UI) if those collide. If the conflict is something you can't or don't want to stop, edit the host-side port in `docker-compose.yml` (e.g. change `"55432:5432"` to `"45432:5432"`) **and** update `DATABASE_URL` in `.env.local` accordingly (`postgresql://snp:snp@localhost:45432/snp?...`). The container-side port stays `5432` because the web service talks to the db over Docker's internal network, where there is no conflict.

### `initdb: error: could not create directory ... No space left on device`
Docker Desktop's virtual disk image is full — *not* your Mac's disk. Diagnose, then prune:

```bash
docker system df                              # see what's using the space
docker compose down -v                        # drop the partial db volume so init can restart cleanly
docker system prune -a --volumes -f           # remove unused containers, images, volumes, build cache
docker compose up --build
```

If `docker system df` still shows the disk near full after prune, raise Docker Desktop's allocation: Docker Desktop → Settings → Resources → Disk image size, increase by ~30 GB, Apply & Restart.

> **Why `-v` matters here.** Once `initdb` fails partway, the named `db-data` volume contains a half-written cluster. On the next start, Postgres sees the existing directory and refuses to re-init. Dropping the volume forces a clean first-boot.

### Docker build fails with `Could not find Prisma Schema`
The `Dockerfile.dev` must `COPY prisma ./prisma` *before* `pnpm install`, because the `postinstall: prisma generate` hook in `package.json` runs during install and needs the schema. The shipped Dockerfile already does this — if you've customised it and hit this error, restore the original ordering:

```dockerfile
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma          # must come before install
RUN pnpm install --frozen-lockfile=false
COPY . .
```

### `prisma generate fails with "Failed to fetch the engine file"`
Your machine can't reach `binaries.prisma.sh`. Either you're on a restricted network (set `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` and try again), or your Docker proxy is blocking it. Run `pnpm db:generate` directly on the host if needed.

### pnpm store ends up inside the project (`.pnpm-store/v3/...` getting staged)
pnpm's content-addressable store should live in `~/.local/share/pnpm/store/v3` (macOS) or `%LOCALAPPDATA%\pnpm\store\v3` (Windows). When pnpm can't reach the default path — most often because it ran inside a container without `HOME` set, or with a read-only home — it falls back to a project-relative `.pnpm-store/`. That folder is huge (thousands of files) and must NOT be committed.

Resolve in three steps:

```bash
# 1. Stop tracking it (the .gitignore already excludes it)
git rm -r --cached .pnpm-store .npm .cache 2>/dev/null

# 2. Pin pnpm's store to a sane location for this project
echo "store-dir=${HOME}/.local/share/pnpm/store/v3" > .npmrc

# 3. Re-install on the host (NOT via docker exec) so pnpm uses your real home dir
rm -rf node_modules .pnpm-store
pnpm install
```

If you need to install inside the container, pass HOME explicitly:

```bash
docker compose exec -e HOME=/tmp web pnpm install
```

### `Stale node_modules / EACCES errors`
If you migrated this folder from the build sandbox, run the cleanup at the top of this file: `rm -rf node_modules _tmp_*`, then `pnpm install`.

## Resetting from scratch

Nuclear option for when things drift:

```bash
docker compose down -v          # stops services, removes volumes (⚠️ wipes db)
rm -rf node_modules .next       # purge build artefacts
pnpm install
docker compose up --build
docker compose exec web pnpm db:migrate
docker compose exec web pnpm db:seed
```

## See also

- [`../brd/platform-brd.md`](../brd/platform-brd.md) — full platform spec
- [`../architecture/`](../architecture/) — component diagrams (TBD)
- [`../decisions/`](../decisions/) — ADRs (TBD)
