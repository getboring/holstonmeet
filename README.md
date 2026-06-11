# HolstonMeet

By [Holston Platforms](https://holstonplatforms.com)

Secure, real-time video meetings powered by Cloudflare Realtime SFU.

Built on [Cloudflare Meet](https://github.com/cloudflare/meet) — the reference implementation for Cloudflare Realtime.

## Quick Start

```sh
npm install
npm run dev
```

Open [http://127.0.0.1:8787](http://127.0.0.1:8787)

## SaaS Features

- **Organizations** — multi-tenant with per-org rooms and limits
- **User accounts** — email/password auth with roles (owner, admin, member)
- **Dashboard** — room management, meeting history, org settings
- **Room limits** — per-plan room and participant caps

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
```

Optional:
- `MAX_WEBCAM_BITRATE` (default `1200000`)
- `MAX_WEBCAM_FRAMERATE` (default `24`)
- `MAX_WEBCAM_QUALITY_LEVEL` (default `1080`)
- `OPENAI_MODEL_ENDPOINT` + `OPENAI_API_TOKEN` — AI meeting participant

## Database

```sh
# Generate migrations
npm run db:generate

# Apply locally
npm run db:migrate:local

# Apply to production
npm run db:migrate:production
```

## Deployment

```sh
wrangler login
wrangler secret put CALLS_APP_SECRET
npm run deploy
```
