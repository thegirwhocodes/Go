import { assertCronAuthorized } from '@/lib/cron-auth';
import { getDb, schema } from '@class-on-time/db';
import { getStripe } from '@/lib/stripe';
import { PENALTY_AMOUNT_CENTS } from '@class-on-time/shared';
import { and, eq, isNull } from 'drizzle-orm';

export const runtime = 'nodejs';

// Picks up arrivals that were late and have not been charged yet, then issues
// a $100 charge using the user's Apple Pay PM if available, falling back to
// us_bank_account ACH. We never charge inline with the arrival webhook to
// keep that path latency-insensitive.
export async function GET(req: Request) {
  try {
    assertCronAuthorized(req);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  const db = getDb();
  const stripe = getStripe();

  const lateArrivals = await db
    .select({
      arrival: schema.arrivals,
      user: schema.users,
    })
    .from(schema.arrivals)
    .innerJoin(schema.users, eq(schema.users.id, schema.arrivals.userId))
    .where(and(eq(schema.arrivals.wasOnTime, false), isNull(schema.arrivals.penaltyChargeId)));

  let charged = 0;
  for (const { arrival, user } of lateArrivals) {
    if (!user.stripeCustomerId) continue;
    const pms = await db
      .select()
      .from(schema.paymentMethods)
      .where(eq(schema.paymentMethods.userId, user.id));
    const applePay = pms.find((p) => p.type === 'apple_pay' && p.status === 'active');
    const ach = pms.find((p) => p.type === 'us_bank_account' && p.status === 'active');
    const pm = applePay ?? ach;
    if (!pm) continue;

    const charge = await db
      .insert(schema.charges)
      .values({
        userId: user.id,
        arrivalId: arrival.id,
        paymentMethodId: pm.id,
        amountCents: PENALTY_AMOUNT_CENTS,
        status: 'pending',
      })
      .returning();
    const chargeId = charge[0].id;

    // Look up the user's signed consent for dispute-defense metadata.
    const consentRows = await db
      .select()
      .from(schema.consents)
      .where(eq(schema.consents.userId, user.id))
      .orderBy(schema.consents.signedAt);
    const latestConsent = consentRows[consentRows.length - 1];

    try {
      const intent = await stripe.paymentIntents.create({
        amount: PENALTY_AMOUNT_CENTS,
        currency: 'usd',
        customer: user.stripeCustomerId,
        payment_method: pm.stripePmId,
        confirm: true,
        off_session: true,
        payment_method_types: pm.type === 'us_bank_account' ? ['us_bank_account'] : ['card'],
        description: `Class on Time penalty (arrival ${arrival.id})`,
        metadata: {
          arrival_id: arrival.id,
          user_id: user.id,
          consent_id: latestConsent?.id ?? 'none',
          consent_version: latestConsent?.consentVersion ?? 'none',
          consent_signed_at: latestConsent?.signedAt?.toISOString() ?? 'none',
        },
      });
      await db
        .update(schema.charges)
        .set({ stripeChargeId: intent.id, status: intent.status })
        .where(eq(schema.charges.id, chargeId));
      await db
        .update(schema.arrivals)
        .set({ penaltyChargeId: chargeId })
        .where(eq(schema.arrivals.id, arrival.id));
      charged += 1;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      await db
        .update(schema.charges)
        .set({ status: 'failed', failureReason: reason })
        .where(eq(schema.charges.id, chargeId));
    }
  }
  return Response.json({ ok: true, considered: lateArrivals.length, charged });
}
