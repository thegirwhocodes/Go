# Stripe — finishing the setup

Keys are already wired in `apps/server/.env.local`. Only dashboard toggles remain. ~10 minutes total.

## 1. Toggle Apple Pay
1. Open https://dashboard.stripe.com/test/settings/payment_methods
2. Find **Apple Pay** in the list → click **Turn on** (or "Configure")
3. It will ask for a **Web domain** — for now add `localhost`. We'll add the real Vercel domain later.
4. Mobile (iOS native) Apple Pay needs a **merchant ID** registered with Apple — see step 4 below before you can fully complete this.

## 2. Toggle Financial Connections (for Bank of America ACH)
1. Same page (Settings → Payment methods)
2. Find **US bank account** / **Financial Connections** → **Turn on**
3. Confirm Bank of America is in the supported institutions list (it is).

## 3. Create webhook for the server
1. https://dashboard.stripe.com/test/webhooks → **Add destination**
2. **Endpoint URL:** `http://localhost:3000/api/stripe/webhook` (for dev). After deploying to Vercel, add a second endpoint with the production URL.
3. **Events to send:** select these:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `financial_connections.account.created`
4. Click **Add endpoint**
5. On the resulting page, copy the **Signing secret** (starts with `whsec_...`).
6. Paste it into `apps/server/.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_...`.

For local dev, you can also use the Stripe CLI to forward webhooks:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```
The CLI prints its own `whsec_...` to put in `.env.local` while it's running.

## 4. Apple Pay merchant ID (required for native Apple Pay on iOS)
1. https://developer.apple.com/account/resources/identifiers/list/merchant
2. Click **+** → **Merchant IDs** → Continue
3. **Identifier:** `merchant.com.naomi.classontime`
4. **Description:** `Class on Time penalty payments`
5. Click **Continue** → **Register**
6. Back in Stripe → Apple Pay settings → **Add new application**
7. Stripe will give you a **CSR file** to download. Save it.
8. Back in Apple Developer → click your merchant ID → **Edit** → **Apple Pay Payment Processing Certificate** → **Create Certificate** → upload Stripe's CSR.
9. Download the resulting `.cer` from Apple → upload back to Stripe.

Done — Apple Pay sheet will now work in the iOS app.
