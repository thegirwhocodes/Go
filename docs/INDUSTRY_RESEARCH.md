# How real apps solve our hard problems

Audit done 2026-05-11. **Stripe sections verified live against docs.stripe.com; everything else is from training data — verify before shipping anything financial.**

---

## 1. Auto-debit penalty payments

**Beeminder's pattern** (and Forfeit's): silent off-session Stripe charge on failure, immediate post-charge email with "legit check" link letting the user dispute *inside the app* before going to the bank. The friendly pre-charge confirmation is deliberately omitted — that would defeat the commitment device.

**The Stripe shape for Class on Time:**
- One `Customer` per user.
- One `SetupIntent` with `payment_method_types=['us_bank_account','card']`. ACH via Financial Connections + Apple Pay token (sits behind the `card` rail) both get attached as PaymentMethods on that same Customer.
- On a late arrival: `PaymentIntent` with `customer`, `payment_method`, `off_session=true`, `confirm=true`. Try ACH first (lower dispute rate, ~3-day settlement), fall back to card on `insufficient_funds`.
- `payment_intent.metadata` carries: signed consent string + IP + UA + timestamp + event ID. Stripe stores it; it's your dispute-defense evidence.
- For ACH specifically: pass `mandate` params on the SetupIntent — Stripe records a Nacha-compliant authorization.

**Failure modes:**
- ACH `insufficient_funds` → retry in 3 days, then fall back to card.
- Card `card_declined` → enable Stripe Smart Retries in dashboard.
- User detaches payment method → webhook `payment_method.detached` → **lock the app**. That's the anti-escape lever. Reactivation requires re-attach + (in our design) the 7-day lockup countdown.

**If you only do one thing:** SetupIntent with both rails on one Customer + consent metadata on every off-session PaymentIntent. That single pattern handles ACH, Apple Pay card fallback, and chargeback evidence.

---

## 2. Resolving a calendar event title to a map pin

**What Apple Calendar does:** on-device `NSDataDetector` + heavy biasing by your Significant Locations history. "Lunch at Coffee Shop" only resolves because you've been to that coffee shop before. It's not pure NLP.

**What Granola / Cal.com / Fellow do:** they assume the user typed location into a structured field. They don't solve our problem at all — that's the gap Class on Time fills.

**The right pipeline (layered, short-circuit on first confident hit):**

1. **Per-user alias memory** (new for us): `user_location_aliases` table mapping `(user_id, normalized_phrase) → mapbox_id`. The first time we resolve "gym" → "Freeman Athletic Center" we ask the user to confirm; after that, "gym" routes there forever. This is the Apple Significant Locations equivalent.
2. **Campus dictionary** (already have it for Wesleyan): hardcoded buildings, zero latency, zero cost. Most campuses use Concept3D maps that expose `/api/v1/locations` JSON — Wesleyan's specifically *needs verification* (their public map is at `wesleyan.edu/map` but no public REST endpoint confirmed).
3. **LLM extraction** (already have it): Claude pulls the candidate string from title + description.
4. **Mapbox geocoding** with `proximity=Wesleyan` and `bbox` constrained to Middletown CT. Already have proximity bias; bbox would help even more.
5. **Mapbox Search Box POI** for non-academic ("Red & Black Café"). Same proximity bias.
6. **User confirmation** when `relevance < 0.8`. Save the confirmed binding into `user_location_aliases`.

**If you only do one thing:** add the `user_location_aliases` table + the one-tap "yes this is right" prompt on low-confidence matches. Without it, the geocoder will keep getting "gym" wrong for everyone differently.

---

## 3. One-click Google Calendar (the claude.ai experience)

**Claude.ai's "magic" is just vanilla OAuth — minus the scary warning.** Anthropic:
- Submitted **Brand Verification** in Google Cloud Console (logo + domain ownership, ~1 week, **free**)
- Passed **Sensitive Scope Verification** (calendar.readonly is "sensitive") — requires a CASA security assessment by a Google-approved third party (Leviathan, Bishop Fox, etc.), **~$15-75K**, 4-12 weeks
- Requests only minimum scopes so the consent screen is short

Result: the consent screen shows the Anthropic logo, no "this app isn't verified" warning, and there's exactly one consent click. Same OAuth as ours under the hood. *Pricing and timeline approximate — verify with Google's current docs.*

**Two real paths for us:**

**Path A — Brand Verification only (recommended now):**
- Free, ~1 week.
- Removes the "this app isn't verified" warning.
- We can serve up to 100 users in "Testing" mode without it; "in production" requires Brand at minimum.
- Defer the $15K CASA assessment until we have paying users.

**Path B — Managed integration platform:**
- **Nango** (~$250-650/mo): open-source-core, devs love it.
- **Pipedream Connect** (free tier → $29/mo+): React component ready, fast integration.
- **Composio** (free tier → $49/mo+): AI-agent-focused, decent fit.
- **Paragon** ($500-2K+/mo): polished UI, enterprise-pitched.
- *All pricing as of training cutoff — verify each vendor's current page.*

The catch: even with Path B, users see *some* consent screen — it just says "Nango wants to access your Google Calendar," which can be *more* confusing than your own brand. Pipedream lets you white-label most of the UI but Google still shows its native screen at the end.

**If you only do one thing:** stay in OAuth Testing mode with our own client ID (current state — warning is dismissible) and submit Brand Verification in parallel. That ~1 week step removes ~80% of the scariness. Path B is overkill until we're past 100 users.

---

## What we're actioning right now

Based on this:
- ✅ Wesleyan venue dictionary already in `apps/server/lib/geocode.ts` — keep
- 🔨 Add `user_location_aliases` table + alias-lookup-first in geocode flow
- 🔨 Add Stripe SetupIntent endpoint + consent capture metadata
- 🔨 Add `payment_method.detached` webhook handler → lock the user out
- 📋 Naomi: submit Brand Verification in Google Cloud Console this week (free, ~1 week turnaround)
- ⏸️ Defer CASA assessment until there's revenue
