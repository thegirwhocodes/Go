# Runbook

## First-time setup

```bash
# from repo root
npm install                # installs all workspaces
cp apps/server/.env.example apps/server/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
# fill in values per docs/CREDENTIALS.md

# database
npm --workspace packages/db run generate
npm --workspace packages/db run migrate
```

## Daily dev loop

```bash
# terminal 1 — Next.js server
npm run dev:server

# terminal 2 — Expo dev client
npm run dev:mobile
```

Test cron endpoints locally with the secret you set:

```bash
curl http://localhost:3000/api/cron/calendar-sync?secret=$CRON_SECRET
curl http://localhost:3000/api/cron/departure-tick?secret=$CRON_SECRET
```

## Deploying

```bash
vercel deploy            # preview
vercel deploy --prod     # production
```

Vercel reads `vercel.ts` for crons. After deploying, confirm the crons show up in the dashboard.

## Build the iOS dev client

You can't run this app in plain Expo Go because of `expo-task-manager` and `react-native-maps`. Use EAS Build:

```bash
npm i -g eas-cli
eas login
eas build --platform ios --profile development
```

Install the resulting `.ipa` on your iPhone via TestFlight or the development tether.
