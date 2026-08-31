# Ultrasound Clinic — Backend API

Production-oriented REST API for Dr. Hassan Irshad's ultrasound clinic
website: appointment requests, contact inquiries, the ultrasound service
catalog, clinic settings, an admin dashboard, and a strictly-protected
foundation for future patient records / reporting.

Built with **NestJS 12 + TypeScript**, **PostgreSQL** via **Prisma 7**
(driver-adapter architecture), JWT auth with rotating refresh tokens,
RBAC, rate limiting, audit logging, and Swagger docs.

## Stack notes (read this first)

- **Prisma is pinned to `7.10.0`.** `npm install prisma@latest` currently
  resolves to an `8.0.0-rc` release with a completely different,
  platform/cloud-oriented CLI (no more `prisma generate` / `migrate dev` as
  you know them). Don't upgrade past 7.x until Prisma 8 is GA and you've
  reviewed its migration guide.
- Prisma 7 uses **driver adapters** — the database URL is *not* read from
  `schema.prisma` anymore. It lives in `prisma.config.ts` (used by the CLI)
  and is passed to `PrismaClient` via `@prisma/adapter-pg` at runtime (see
  `src/prisma/prisma.service.ts`).
- The project is **ESM** (`"type": "module"`) with `moduleResolution:
  nodenext` — every relative import ends in `.js`, even though the source
  files are `.ts`. This is intentional, not a typo.

## Getting started

```bash
cp .env.example .env
# fill in JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (openssl rand -hex 32),
# and SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (12+ chars) for the first admin

npm install

# start Postgres locally (requires Docker)
docker compose up -d db

npm run db:migrate     # applies prisma/migrations, creates them on first run
npm run db:seed        # seeds clinic info, the 10 ultrasound services, and
                        # the first SUPER_ADMIN (only if SEED_ADMIN_* is set)

npm run start:dev      # http://localhost:3000/api/v1
```

Swagger docs (dev/staging only): `http://localhost:3000/api/docs`

> **This environment has no Docker or local PostgreSQL installed**, so the
> schema, seed script, and full app were built and type-checked/unit-tested
> here, but never run against a live database. Run the commands above once
> you have Postgres available — see "What's been verified" below for the
> exact split.

## No default admin password

There is no hard-coded administrator account. The first `SUPER_ADMIN` is
created by `prisma/seed.ts` **only** if `SEED_ADMIN_EMAIL` and
`SEED_ADMIN_PASSWORD` (12+ characters) are set in `.env` when you run
`npm run db:seed`. Additional admins are created afterward via
`POST /api/v1/admins` by an existing `SUPER_ADMIN`.

## Project layout

```
src/
  auth/            JWT access + rotating refresh-token auth, RBAC
  admins/          Admin account management (SUPER_ADMIN only)
  services/        Ultrasound service catalog (public read, admin write)
  appointments/     Appointment *requests* — never auto-confirmed
  inquiries/       Public contact form → admin-managed
  clinic/          Singleton clinic settings (name/address/hours/phone)
  dashboard/       Aggregate operational counts for the admin UI
  audit/           Admin action audit log (+ read API for SUPER_ADMIN)
  health/          GET /health — API + DB connectivity
  notifications/   Mock notification provider (logs only — no real
                   email/SMS/WhatsApp credentials exist yet)
  patients/        Future-ready, strictly admin-only, minimal fields
  reports/         Future-ready ultrasound reporting, strictly admin-only
  files/           Secure file storage abstraction (local disk today;
                   swap in an S3 provider later — never publicly exposed)
  common/          Guards, decorators, filters, interceptors, pagination
  config/          Environment variable validation
  prisma/          PrismaService (driver-adapter wired)
prisma/
  schema.prisma
  seed.ts
```

## Security posture

- **Secure by default**: a global `JwtAuthGuard` requires a valid access
  token on every route unless explicitly marked `@Public()`. A route can
  never be accidentally left unprotected.
- **RBAC**: `@Roles(...)` + a global `RolesGuard`. Three roles —
  `SUPER_ADMIN`, `ADMIN`, `STAFF` — enforced per-route, not assumed.
- **Passwords**: hashed with Argon2, never returned by any endpoint.
- **Refresh tokens**: opaque random tokens (not JWTs), stored only as a
  SHA-256 hash, delivered via an `httpOnly`/`secure`/`sameSite` cookie,
  rotated on every use, individually revocable.
- **Rate limiting**: `@nestjs/throttler`, with tighter named budgets for
  `POST /auth/login`, `POST /appointments`, and `POST /inquiries`.
- **Validation**: global `ValidationPipe` with `whitelist` +
  `forbidNonWhitelisted` — unexpected fields are rejected, not silently
  dropped or stored (blocks mass-assignment).
- **Consistent error shape**: a global exception filter maps everything
  (validation, Prisma, auth, unexpected) to
  `{ success: false, error: { code, message } }` and never leaks a stack
  trace when `NODE_ENV=production`.
- **Audit log**: every admin mutation (login, confirm/cancel an
  appointment, resolve an inquiry, edit a service, change clinic settings,
  create/update an admin, upload/delete a file, …) is recorded with actor,
  action, resource, and a redacted metadata blob — never passwords or
  tokens.
- **Patient privacy by design**: the public appointment form collects only
  `patientName`, `patientPhone`, `requestedService`, and optional
  date/time/message — no medical history, no national ID, no financial
  data. Patient records and ultrasound reports live behind strictly
  admin-only routes with no public endpoint anywhere in the API.

## What's been verified here vs. what needs a live database

**Verified in this environment** (no Docker/Postgres available):
- `npx tsc --noEmit` — clean, whole project
- `nest build` — clean
- `npm run lint` (oxlint) — clean
- `npx prisma generate` — schema is valid, client generates correctly
- Unit tests (`npm test`) — **10/10 passing**, no DB required
  (`AuthService` login/refresh logic, `RolesGuard` authorization logic)
- `argon2` native binding — confirmed working (hash + verify round-trip)

**Not yet run — needs a live PostgreSQL** (via `docker compose up -d db`):
- `npm run db:migrate` (creates the actual migration files — none exist
  yet, since generating them requires connecting to a database)
- `npm run db:seed`
- Booting the app for real (`PrismaService.onModuleInit` connects on
  startup)
- The e2e tests in `test/*.e2e-spec.ts` (health check, public services/
  clinic endpoints, validation, honeypot, 401s on protected routes)

Once Docker/Postgres is available, run the "Getting started" steps above,
then `npm run test:e2e` — I'd expect these to pass as written, but treat
that as a prediction to confirm, not a claim already checked.

## Docker

```bash
docker compose up -d db      # Postgres only, for local `npm run start:dev`
docker compose up --build    # full stack: API + Postgres
```

Set `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `CORS_ORIGIN` in your shell
or a `.env` next to `docker-compose.yml` before running the full stack —
no secrets are baked into the compose file or image.

## Known gaps / honest limitations

- `@nestjs/throttler@6.5.0`'s published peer range tops out at
  `@nestjs/common@^11`; this project is on `^12`. It was installed with
  `--legacy-peer-deps` since the guard/reflector APIs it depends on are
  stable across those majors, but re-verify after the next throttler
  release formally adds v12 support.
- `npm audit` reports vulnerabilities in dev-only tooling pulled in by the
  NestJS CLI template (e.g. an `esbuild`/`workerd` chain used by
  `@nestjs/mau` deploy tooling) — nothing shipped in the production
  runtime bundle. Worth a `npm audit fix` pass later; not urgent.
- Notifications are mock-only (logged, not sent) until real email/SMS/
  WhatsApp provider credentials are supplied — this was intentional per
  the project brief, not an oversight.
- The frontend (`../ultrasound-website`) does not yet call this API —
  it still renders the static content in `src/utils/data.ts`. Wiring it up
  (services/clinic fetched live, plus building actual appointment/inquiry
  forms, which don't exist on the site yet) is a good next step once you
  can run this backend end-to-end.
