# Tomorrow morning runbook

You went to sleep with the server fully deployed at https://go-place.vercel.app and an iOS dev client building on EAS. This is what to do when you wake up to get the app working end-to-end.

## 0. Check the build status

```bash
cd "/Users/naomiivie/Class on Time"
eas build:list --limit 1
```

You want to see `status: finished` on the most recent iOS build. If status is `finished`, scroll to step 1. If `errored`, paste the error to Claude.

## 1. Install the dev client on your phone

1. Open the EAS build page (link from `eas build:list`).
2. Scan the QR code → tap "Install."
3. iOS Settings → General → VPN & Device Management → trust your developer cert.
4. Open the new "Class on Time" app on your phone.

## 2. Start the bundler (Mac terminal)

```bash
cd "/Users/naomiivie/Class on Time/apps/mobile"
npx expo start --dev-client --clear
```

The dev client on your phone will detect it and connect.

## 3. Walk through onboarding

When the app opens:
1. **Connect Google Calendar** — taps `connect google` button → browser opens → log in → consent → back to app.
2. **Grant location permissions** — "Always Allow."
3. **Grant microphone permission** — when voice rollcall first runs.
4. **Connect payment method** — Apple Pay if your merchant ID is registered, or card via Stripe.

If any step hangs or errors, screenshot it and send to Claude.

## 4. Verify the pipeline

```bash
# Force a calendar sync right now (don't wait for the cron):
curl "https://go-place.vercel.app/api/cron/calendar-sync?secret=$(grep CRON_SECRET apps/server/.env.local | cut -d= -f2)"
# Should return {"ok":true,"synced":N,"skipped":N}

# Check what's in events:
# (use the Supabase MCP via Claude — "list today's events for me")
```

## 5. Try the rollcall flow

In the app, tap "roll call" in the header. You should see today's events. Tap any → speak "yes I'm going" → app should confirm. Tap a different one → speak "I'm not going" → app should show "$25 fee" (or $100 if within 2 hrs).

## Known gaps to ignore for now

- Stripe webhook signing secret (`STRIPE_WEBHOOK_SECRET`) — once you set up the webhook in the new Stripe account, paste the `whsec_*` to Claude to push it to Vercel.
- iMessage commitment scanner — partially built but blocked on `attributedBody` parsing (rich-text iMessages without plain text).
- Apple Pay merchant ID — registers via developer.apple.com → Identifiers → Merchant IDs → `merchant.com.naomi.classontime`. Then mirror to Stripe Dashboard → Payment methods → Apple Pay.

## What's already wired and ready

- Landing page at https://go-place.vercel.app
- Server APIs: calendar sync, departure tick, arrivals, penalty charges, lockup sweep, rollcall, voice confirm, Stripe setup-intent, Stripe webhook
- DB schema with 9 tables (users, events, arrivals, charges, lockup_log, oauth_tokens, payment_methods, consents, user_location_aliases)
- GitHub Actions cron firing every 5 min hitting the frequent endpoints
- Wesleyan venue dictionary (Olin, Usdan, Freeman, etc. → real coords)
- Voice rollcall UI with on-device STT + Claude intent classifier
- Tiered cancellation fee logic

## When you're ready to push something
Just `git push` from the repo — Vercel auto-deploys, the live URL refreshes within ~90 sec.
