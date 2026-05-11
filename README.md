# Class on Time

> Uber for walking to class. Reads my calendar, alerts me to leave so I arrive 30 minutes early, and charges me $100 every time I'm late.

See [`PLAN.md`](./PLAN.md) for the full design and build order.

## Layout

- `apps/mobile` — Expo (iOS-first) app with Mapbox cartoon map + sprite avatar
- `apps/server` — Next.js 15 on Vercel: API routes, Vercel Cron, Stripe, Google Calendar sync
- `packages/db` — Drizzle schema + migrations (Neon Postgres)
- `packages/shared` — Shared TypeScript types

## Getting started

```bash
# install workspaces
npm install

# start the Next.js server
npm run dev:server

# start the Expo dev client
npm run dev:mobile
```

Environment variables live in `apps/server/.env.local` and `apps/mobile/.env.local` — see each `.env.example`.
