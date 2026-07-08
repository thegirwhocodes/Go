import { getDb, schema } from '@class-on-time/db';
import { getStripe } from '@/lib/stripe';
import { requireUser, unauthorized } from '@/lib/session';
import { PENALTY_AMOUNT_CENTS } from '@class-on-time/shared';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// Mobile calls this to get a SetupIntent client secret. The mobile Stripe
// SDK then presents the PaymentSheet which accepts BOTH Apple Pay (card
// rail) and Bank of America via Financial Connections (us_bank_account
// rail). Both land as PaymentMethods on the same Stripe Customer.

const CONSENT_VERSION = '2026-05-11.v1';
const CONSENT_TEXT =
  'I authorize Go to charge me $100.00 USD to my linked payment ' +
  'method each time I fail to arrive at a scheduled class or commitment at ' +
  'least 30 minutes before its scheduled start, and to charge a $25.00 USD ' +
  'cancellation fee if I cancel within 2 hours of the required arrival time. ' +
  'Removing a payment method requires a 7-day waiting period before it takes ' +
  'effect; charges during the waiting period are still authorized.';

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const db = getDb();
  const stripe = getStripe();

  // Reuse Stripe Customer if we've already created one; otherwise create.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await db
      .update(schema.users)
      .set({ stripeCustomerId: customerId })
      .where(eq(schema.users.id, user.id));
  }

  // Capture consent before SetupIntent. The IP + UA become Stripe metadata
  // on every future PaymentIntent for dispute defense.
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null;
  const ua = req.headers.get('user-agent') ?? null;
  const consentRow = await db
    .insert(schema.consents)
    .values({
      userId: user.id,
      consentVersion: CONSENT_VERSION,
      consentText: CONSENT_TEXT,
      ipAddress: ip,
      userAgent: ua,
    })
    .returning();
  const consentId = consentRow[0].id;

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card', 'us_bank_account'],
    usage: 'off_session',
    payment_method_options: {
      us_bank_account: {
        financial_connections: { permissions: ['payment_method'] },
        verification_method: 'instant',
      },
    },
    metadata: {
      consent_id: consentId,
      consent_version: CONSENT_VERSION,
      penalty_amount_cents: String(PENALTY_AMOUNT_CENTS),
    },
  });

  return Response.json({
    setupIntentId: setupIntent.id,
    clientSecret: setupIntent.client_secret,
    customerId,
    consentVersion: CONSENT_VERSION,
    consentText: CONSENT_TEXT,
  });
}
