# Go

iOS commitment device. Charges me $100 every time I'm late to class.

→ Live: https://go-place.vercel.app

## What it does

Reads my Google Calendar. Computes a walking ETA from my current GPS to each event's geocoded address. Sends a "leave now" push thirty minutes before each event. The moment my GPS misses the geofence, an off-session Stripe charge fires against my own card.

Removing a payment method takes seven days. The anti-escape mechanism is the entire point.

## How it works

```
Google Calendar sync → Mapbox geocoding → walking-ETA computation
  → Expo push 30 min before leave-time → GPS geofence check at event start
  → on miss: Stripe Financial Connections off-session charge → seven-day lockup
```

Voice rollcall every morning: a Claude-Haiku intent classifier listens to my plan and reschedules the geofences.

## Stack
Expo (iOS) · Next.js 16 (server, Vercel) · Postgres (Neon, 9-table schema) · Stripe Financial Connections · Mapbox · Whisper + Claude Haiku · GitHub Actions cron (every 5 min)

## Status
Private alpha. Marketing site is live; iOS app on EAS dev client.
