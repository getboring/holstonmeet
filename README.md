# HolstonMeet

By [Holston Platforms](https://holstonplatforms.com)

Secure, real-time video meetings powered by Cloudflare Realtime SFU.

Built on [Cloudflare Meet](https://github.com/cloudflare/meet) -- the reference implementation for Cloudflare Realtime.

## Quick Start

```sh
pnpm install
pnpm dev
```

Open [http://127.0.0.1:8787](http://127.0.0.1:8787)

## Stack

- **Framework:** React Router v7 (Cloudflare Workers)
- **Styling:** Tailwind CSS v3 + Radix UI
- **Database:** D1 (SQLite) + Drizzle ORM
- **Realtime:** Cloudflare Realtime SFU + Durable Objects
- **State:** PartyServer / PartyTracks / PartySocket
- **Validation:** Zod
- **Build:** Vite + Cloudflare Vite Plugin
- **Linting:** Biome

## SaaS Features

- **Organizations** -- multi-tenant with per-org rooms and limits
- **User accounts** -- email/password auth with roles (owner, admin, member)
- **Dashboard** -- room management, meeting history, org settings
- **Room limits** -- per-plan room and participant caps
- **AI participant** -- OpenAI realtime model integration
- **E2EE** -- MLS messaging with WASM crypto

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing / room join |
| `/login` | Sign in |
| `/register` | Create organization + account |
| `/dashboard` | Org dashboard |
| `/dashboard/rooms` | Manage rooms |
| `/dashboard/settings` | Account & org settings |
| `/:roomName` | Join a meeting room |

## Variables

Create `.dev.vars`:

```
CALLS_APP_ID=<APP_ID>
CALLS_APP_SECRET=<SECRET>
SESSION_SECRET=<RANDOM_SECRET>
```

Optional:
- `MAX_WEBCAM_BITRATE` (default `1200000`)
- `MAX_WEBCAM_FRAMERATE` (default `24`)
- `MAX_WEBCAM_QUALITY_LEVEL` (default `1080`)
- `OPENAI_MODEL_ENDPOINT` + `OPENAI_API_TOKEN` -- AI meeting participant
- `LEGACY_SESSION_SECRET` -- for CF Access username bridge

## Database

```sh
# Generate migrations
pnpm db:generate

# Apply locally
pnpm db:migrate:local

# Apply to production
pnpm db:migrate:production
```

## Testing

```sh
# Unit tests
pnpm test

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# All checks
pnpm check
```

## Deployment

```sh
wrangler login
wrangler secret put CALLS_APP_SECRET
wrangler secret put SESSION_SECRET
pnpm deploy
```

## License

Apache License 2.0. Copyright (c) 2024 Cloudflare, Inc. Copyright (c) 2026 Holston Platforms.
