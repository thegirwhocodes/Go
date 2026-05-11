# Class on Time — Build Plan

> "Uber for walking to class." A commitment device that reads my calendar, alerts me to leave so I arrive **30 minutes early**, and **automatically charges me $100 every time I'm late.**

---

## 1. Product summary

**One-line:** When a calendar event approaches, the app calculates walking ETA and pops up "start heading to your destination" so I arrive 30 minutes early. If I don't, it charges $100. The penalty is the entire point — anti-escape design is a first-class feature.

**Core loop:**
1. Connect Google Calendar (Wesleyan account).
2. App polls calendar; for every event with a physical location different from my current location, computes `departure_time = event_start − 30min − walking_eta`.
3. At `departure_time`, push notification + map screen wakes up showing my sprite avatar + the route.
4. Geofence at the destination decides on-time vs. late.
5. Late → automatic $100 ACH/Apple Pay charge.

---

## 2. MVP vs. stretch

| | MVP (ship first) | Stretch (post-MVP) |
|---|---|---|
| Platform | iOS only (Expo / EAS) | Android |
| Calendar | Google Calendar (read-only) | iCloud, Outlook, manual events |
| Routing | Walking ETA via Mapbox Directions | Real-time route deviation correction |
| Map UI | Mapbox Standard 3D w/ `lightPreset: "dusk"` + cartoon trees + emoji sprite | Lottie walking animation, weather sprites, night-mode toggle |
| Payment | Stripe: Apple Pay + Financial Connections (BoA ACH) | Blockchain escrow (Base + USDC) |
| Anti-escape | 7-day lockup on payment-method removal | On-chain commitment that can't be reversed server-side |
| Penalty | Fixed $100 to a configured recipient | Variable amount, escalating, donation routing |

The blockchain version is **possible later** — the server already issues the "late" event, so swapping the payment processor is a leaf change.

---

## 3. Architecture

```
┌──────────────────────────┐        ┌──────────────────────────────┐
│  iOS app (Expo)          │        │  Next.js server (Vercel)     │
│  — Mapbox cartoon map    │ HTTPS  │  — App Router API routes     │
│  — Lottie sprite avatar  │ ◄────► │  — Drizzle + Neon Postgres   │
│  — GPS + geofence        │        │  — Vercel Cron (every 1 min) │
│  — Expo Push receiver    │        │  — Google Calendar sync      │
│  — Apple Pay sheet       │        │  — Stripe charges            │
└──────────────────────────┘        └──────────────────────────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              ▼              ▼              ▼
                       Google Calendar   Mapbox API    Stripe API
                       (OAuth, read)     (walking ETA) (Apple Pay + FC)
```

**Why this stack**
- **Expo + EAS:** native push, GPS background, Apple Pay sheet — all without writing Swift. iOS-first as requested.
- **Mapbox over Apple/Google Maps:** the Mapbox Standard 3D style with `lightPreset: "dusk"` + `show3dObjects: true` is the cartoon-illustrated look from the reference shots she liked. Apple/Google Maps can't be styled this way. Requires `@rnmapbox/maps` and an EAS dev client build (no Expo Go).
- **Vercel + Neon Postgres:** Vercel Cron triggers the leave-now alert, Postgres stores calendar+arrivals+lockup state. (Vercel Postgres is no longer offered — Neon via Marketplace is the replacement.)
- **Stripe Financial Connections:** Stripe-native replacement for Plaid; pulls Bank of America via OAuth, then ACH-debits $100 on demand. Apple Pay rides on the same Stripe customer.
- **No blockchain in MVP:** Stripe ships in days, smart contracts ship in weeks. Easy to bolt on later.

---

## 4. Data model (initial)

```
users
  id, google_user_id, email, expo_push_token, current_lat, current_lng, current_loc_updated_at

oauth_tokens
  user_id, provider ('google' | 'stripe'), access_token, refresh_token, expires_at

events
  id, user_id, source_event_id, title, location_text,
  destination_lat, destination_lng, starts_at, ends_at,
  required_arrival_at  -- = starts_at − 30min
  walking_eta_seconds, departure_at,  -- recomputed
  notified_at, status ('pending' | 'notified' | 'arrived_on_time' | 'arrived_late' | 'no_show')

arrivals
  id, event_id, arrived_at, arrival_lat, arrival_lng,
  was_on_time (bool), penalty_charge_id (nullable)

payment_methods
  id, user_id, stripe_pm_id, type ('apple_pay' | 'us_bank_account'),
  last4, status ('active' | 'pending_removal'),
  removal_requested_at, removable_at  -- requested + 7 days

charges
  id, user_id, arrival_id, stripe_charge_id, amount_cents, status, created_at

lockup_log
  id, user_id, action, payment_method_id, requested_at, executes_at, executed_at
```

---

## 5. Critical flows

### 5.1 Onboarding
1. Sign in with Google (Calendar read scope).
2. Connect a payment method:
   - **Apple Pay:** PaymentSheet → save to Stripe customer.
   - **Bank of America:** Stripe Financial Connections OAuth → us_bank_account PaymentMethod.
3. Show explicit copy: *"This app will charge you $100 every time you arrive less than 30 minutes before a class. Removing a payment method takes 7 days. Continue?"* — single confirm button.
4. Grant location permission ("Always" — needed for background geofence).
5. Grant push permission.

### 5.2 Calendar sync (server, runs every 5 min)
- For each user, fetch primary calendar's next 24h of events.
- Drop events with no location, all-day events, declined events.
- Geocode `location_text` once per unique string.
- Upsert into `events` with `required_arrival_at = starts_at − 30min`.

### 5.3 Departure alerting (Vercel Cron, every 1 min)
- For each `events` row where `status = 'pending'` and `starts_at` is within next 4 hours:
  - Recompute `walking_eta_seconds` from user's `current_lat/lng` to destination.
  - `departure_at = required_arrival_at − walking_eta_seconds`.
  - If `departure_at ≤ now`: send Expo Push, mark `status = 'notified'`, store `notified_at`.

### 5.4 Arrival detection (mobile, background)
- App registers a geofence (50 m radius) around each upcoming destination on sync.
- On geofence enter, POST `/api/arrivals` with timestamp + GPS.
- Server: `was_on_time = (arrived_at ≤ required_arrival_at)`. If false, enqueue charge.

### 5.5 Penalty charge
- Job picks up arrivals with `was_on_time = false` and no `penalty_charge_id`.
- Tries Apple Pay PM first (instant), falls back to ACH (us_bank_account, slower).
- On success, write `charges` row, link to `arrivals`.
- On failure, retry with backoff; surface in-app banner.

### 5.6 Payment-method removal (lockup)
- "Remove" sets `payment_methods.status = 'pending_removal'`, `removal_requested_at = now`, `removable_at = now + 7d`.
- UI shows countdown.
- A nightly job actually detaches the Stripe PM only after `removable_at`.
- During the lockup window, charges still go through that PM.

---

## 6. Repo layout (monorepo, pnpm workspaces)

```
class-on-time/
├── apps/
│   ├── mobile/         # Expo (React Native, TypeScript)
│   └── server/         # Next.js 15 App Router on Vercel
├── packages/
│   ├── shared/         # Shared TS types (Event, Arrival, ...)
│   └── db/             # Drizzle schema + migrations
├── package.json        # pnpm workspaces
├── pnpm-workspace.yaml
├── vercel.ts           # Vercel project config (TS, replaces vercel.json)
├── PLAN.md             # this file
└── README.md
```

---

## 7. Build order (concrete)

1. **Scaffold monorepo** — pnpm workspaces, TS config, prettier, biome.
2. **Server skeleton** — Next.js on Vercel, Drizzle schema, Neon DB via Vercel Marketplace.
3. **Auth + Google Calendar** — NextAuth (or Clerk) with Google provider, Calendar scope, token refresh, sync job.
4. **Mobile skeleton** — Expo TS, navigation, Mapbox map screen, Lottie sprite placeholder.
5. **Mobile ↔ server auth** — same Google token, Expo SecureStore, Expo Push registration.
6. **Walking ETA + cron** — Mapbox Directions, departure_at recomputation, Expo Push trigger.
7. **Geofence + arrival** — `expo-location` background geofence, arrival API, on-time/late decision.
8. **Stripe wiring** — Financial Connections + Apple Pay onboarding, $100 charge on late.
9. **Lockup UI + nightly job** — 7-day delay on payment-method removal.
10. **Polish** — sprite walking animation along route, sound, copy.

---

## 8. Open questions for me to confirm

1. **Penalty recipient.** $100 goes where? Charity, savings account, friend's Venmo, on-chain wallet? (Stripe payouts to anyone other than yourself need either a charity/Stripe Connect account or a manual transfer step.)
2. **Definition of "late."** Strict: missed the 30-min-early window by even 1 second = $100. Or graduated: <30 but ≥15 min early = warning only, <15 min early = charge?
3. **Which calendars count?** Primary only, or also subscribed/shared? "Class" events vs. all events with a location?
4. **What counts as "physically different"?** A geofence around current location with some radius (e.g., 100 m), so events at the same building don't trigger?
5. **Sleep / off-hours.** Should the app suppress alerts overnight (e.g., 11pm–7am) or trust the calendar?
6. **Test mode.** I'll need a way to disable real charges while developing. Stripe test mode handles this, but the lockup logic still needs a dev override.

I'll proceed on sensible defaults for everything in this list and we can adjust later.
