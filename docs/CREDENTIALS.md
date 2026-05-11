# External credentials

Audited 2026-05-09 against existing projects on this Mac.

## ✅ Already wired (reused from other projects)

These values are already in `apps/server/.env.local` and `apps/mobile/.env.local`. Each one has a comment in those files noting where it came from.

| Variable | Source on disk | Notes |
|---|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | `~/cortex/cortex-web/.env.local` | Calendar scope already approved. Redirect URI `/api/integrations/calendar/callback` is already registered — that's why this app's route is mounted at that path. |
| `GOOGLE_REDIRECT_URI` | same | Local dev URI as registered. |
| `ANTHROPIC_API_KEY` | `~/cortex/cortex-web/.env.local` | Not used in MVP — kept for future LLM features. |
| `MAPBOX_ACCESS_TOKEN` / `EXPO_PUBLIC_MAPBOX_TOKEN` | provided directly by user (Mapbox account `naomi-ivie`) | Public token; safe in client. |
| `STRIPE_SECRET_KEY` | `~/Downloads/server.js` (preorder form) | **Test mode only.** Same Stripe account as preorder. |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `~/Downloads/preorder-form V3.html` | Same Stripe account. |
| `appleTeamId` (in `apps/mobile/eas.json`) | extracted from `~/Downloads/App/Bethel/Bethel.xcodeproj/project.pbxproj` and `~/Downloads/App/Sleep/ShutdownApp.xcodeproj/project.pbxproj` — both use `7RTTC5R7ZQ` | Active Apple Developer team — she's already enrolled. |

## ⚠️ Reused but needs a small action from you

### Stripe — enable Apple Pay + Financial Connections
The keys are wired but the *features* aren't enabled on this Stripe account yet. In dashboard.stripe.com → Settings → Payment methods:
1. Toggle on **Apple Pay** (will prompt you to register `merchant.com.naomi.classontime` — make that merchant ID in Apple Developer portal at developer.apple.com → Identifiers → +).
2. Toggle on **Financial Connections** (the new Stripe-owned Plaid replacement — Bank of America is supported).
3. Add a webhook → endpoint `<your-domain>/api/stripe/webhook`, events `payment_intent.*` → copy the `whsec_*` secret into `STRIPE_WEBHOOK_SECRET`.

### Google OAuth — add prod redirect when deploying
When you `vercel deploy --prod`, add the prod redirect URI (`https://<vercel-domain>/api/integrations/calendar/callback`) to the existing OAuth client at console.cloud.google.com → Credentials. 2 clicks.

## ⏳ Still need to create from scratch

### Database (you said you'd do this)
Create a *new* Supabase project — don't share the existing `addkjndgmbxiulpquizn.supabase.co` (that one is shared between cortex-web and voice-email). After creating, copy the Postgres connection string into `DATABASE_URL` and run:
```bash
npm --workspace packages/db run generate
npm --workspace packages/db run migrate
```

### Apple Pay merchant ID (10 minutes once enrolled)
At developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → + → Merchant ID → `merchant.com.naomi.classontime`. Then in Stripe dashboard, register this merchant ID under Apple Pay settings (Stripe will give you a CSR, you upload it to Apple).

## Audited and confirmed not present anywhere on disk

- Plaid keys (covered by Stripe Financial Connections instead).
- OpenAI keys (Anthropic is used everywhere).
- Vercel CLI auth token (just `vercel login` once).

## Other projects worth knowing about

- `~/cortex/voice-email` — uses the same Supabase project as cortex-web.
- `~/Downloads/App/Archive/Rings*` — earlier mobile attempts (no Apple Team ID set in the Rings projects, but Bethel and Sleep have it).
- `~/Downloads/App/Bethel`, `~/Downloads/App/Sleep` — Xcode projects with the active Apple Developer team.
