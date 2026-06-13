# HolstonMeet

Multi-tenant video conferencing SaaS built on Cloudflare Realtime SFU.

## Stack

- **Framework:** React Router v7 (Cloudflare Workers)
- **Build:** Vite 8 + @cloudflare/vite-plugin
- **Styling:** Tailwind CSS v4 + Radix UI
- **Database:** D1 (SQLite) + Drizzle ORM 0.45
- **Realtime:** Cloudflare Realtime SFU + Durable Objects
- **State:** PartyServer 0.5 / PartyTracks / PartySocket
- **Validation:** Zod
- **Linting:** Biome (tabs, 100 char width, single quotes)
- **Testing:** Vitest + @cloudflare/vitest-pool-workers + Playwright

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (wrangler dev via Vite)
pnpm build            # Build for production (react-router build + post-build patch)
pnpm lint             # Lint with Biome
pnpm typecheck        # Type check
pnpm test             # Run unit tests
pnpm test:ci          # CI test (no watch)
pnpm check            # Lint + typecheck + test
pnpm seed             # Seed 5 demo accounts into local D1
pnpm deploy           # Full CI test + build + deploy to Cloudflare
```

## Deploy

```bash
pnpm build && wrangler deploy
```

The deploy requires:
- `wrangler.jsonc` with correct `account_id` and `d1_databases` binding
- `SESSION_SECRET` and `LEGACY_SESSION_SECRET` set via `wrangler secret put`
- The `scripts/patch-server-build.mjs` post-build step runs automatically during `pnpm build`

## Key Files

| File | Purpose |
|------|---------|
| `workers/app.ts` | Workers entry point (ChatRoom DO export + request handler) |
| `app/routes.ts` | React Router route config (flatRoutes) |
| `vite.config.mts` | Vite + CF Vite plugin + Tailwind v4 |
| `schema.ts` | Drizzle ORM schema (Users, Orgs, Rooms, RateLimits) |
| `app/utils/auth.server.ts` | PBKDF2 hashing, session management, RBAC |
| `app/utils/csrf.server.ts` | CSRF double-submit cookie protection |
| `app/utils/rate-limit.server.ts` | 10 attempts / 15min window per key |
| `app/durableObjects/ChatRoom.server.ts` | Durable Object for realtime chat/rooms |
| `scripts/patch-server-build.mjs` | Post-build: stubs `__require` for Workers compat |
| `seed.ts` | Demo account seeder (5 orgs with PBKDF2-hashed passwords) |
| `wrangler.jsonc` | Base wrangler config (Workers deploy) |
| `wrangler.production.jsonc` | Production config with D1 + queues |

## Env Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | Yes (prod) | Cookie session signing secret |
| `LEGACY_SESSION_SECRET` | Yes (prod) | Legacy CF Access username bridge |
| `CALLS_APP_ID` | Yes | Cloudflare Realtime SFU app ID |
| `CALLS_APP_SECRET` | Yes | Cloudflare Realtime SFU secret (wrangler secret) |

## Demo Accounts

| Email | Password | Org |
|-------|----------|-----|
| cody@holstonplatforms.com | HolstonDemo2026! | Holston Demo |
| alice@acme.com | AcmeMeet2026! | Acme Corp |
| bob@globex.com | GlobexPass2026! | Globex Industries |
| carol@initech.com | InitechMeet2026! | Initech Solutions |
| david@wayne.com | WayneDemo2026! | Wayne Enterprises |

## Architecture Notes

- **React Router v7** on Cloudflare Workers (migrated from Remix v2)
- **CF Vite plugin** resolves `virtual:react-router/server-build` during dev
- **Post-build patch** stubs `createRequire(import.meta.url)` for Workers compat
- **Wrangler alias** maps `virtual:react-router/server-build` to `build/server/index.js`
- **`nodejs_compat_v2`** flag for Node.js API compatibility in Workers
