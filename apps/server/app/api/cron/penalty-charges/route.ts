import { assertCronAuthorized } from '@/lib/cron-auth';
import { getDb, schema } from '@class-on-time/db';
import { getStripe } from '@/lib/stripe';
import { PENALTY_AMOUNT_CENTS } from '@class-on-time/shared';
import { and, eq, gt, isNotNull, isNull } from 'drizzle-orm';
import type { Database } from '@class-on-time/db';
import type Stripe from 'stripe';

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
    const result = await chargeUser(db, stripe, {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      amountCents: PENALTY_AMOUNT_CENTS,
      kind: 'late_arrival',
      arrivalId: arrival.id,
      eventId: arrival.eventId,
      description: `Go late-arrival penalty (arrival ${arrival.id})`,
    });
    if (result.chargeId) {
      await db
        .update(schema.arrivals)
        .set({ penaltyChargeId: result.chargeId })
        .where(eq(schema.arrivals.id, arrival.id));
    }
    if (result.charged) charged += 1;
  }

  const cancelledEvents = await db
    .select({
      event: schema.events,
      user: schema.users,
    })
    .from(schema.events)
    .innerJoin(schema.users, eq(schema.users.id, schema.events.userId))
    .where(
      and(
        eq(schema.events.status, 'cancelled'),
        isNotNull(schema.events.cancellationFeeCents),
        gt(schema.events.cancellationFeeCents, 0),
      ),
    );

  let cancelledCharged = 0;
  for (const { event, user } of cancelledEvents) {
    const existing = await db
      .select()
      .from(schema.charges)
      .where(and(eq(schema.charges.eventId, event.id), eq(schema.charges.kind, 'cancellation')))
      .limit(1);
    if (existing[0]) continue;

    const result = await chargeUser(db, stripe, {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      amountCents: event.cancellationFeeCents ?? 0,
      kind: 'cancellation',
      eventId: event.id,
      description: `Go cancellation fee (event ${event.id})`,
    });
    if (result.charged) cancelledCharged += 1;
  }

  return Response.json({
    ok: true,
    lateArrivalsConsidered: lateArrivals.length,
    lateArrivalsCharged: charged,
    cancelledEventsConsidered: cancelledEvents.length,
    cancelledEventsCharged: cancelledCharged,
  });
}

async function chargeUser(
  db: Database,
  stripe: Stripe,
  args: {
    userId: string;
    stripeCustomerId: string | null;
    amountCents: number;
    kind: 'late_arrival' | 'cancellation';
    arrivalId?: string;
    eventId?: string;
    description: string;
  },
): Promise<{ charged: boolean; chargeId?: string }> {
  if (!args.stripeCustomerId || args.amountCents <= 0) return { charged: false };

  const pms = await db
    .select()
    .from(schema.paymentMethods)
    .where(eq(schema.paymentMethods.userId, args.userId));
  const ach = pms.find((p) => p.type === 'us_bank_account' && p.status === 'active');
  const card = pms.find((p) => p.type === 'apple_pay' && p.status === 'active');
  const ordered = [ach, card].filter(Boolean) as typeof pms;
  if (ordered.length === 0) return { charged: false };

  const consentRows = await db
    .select()
    .from(schema.consents)
    .where(eq(schema.consents.userId, args.userId))
    .orderBy(schema.consents.signedAt);
  const latestConsent = consentRows[consentRows.length - 1];

  const charge = await db
    .insert(schema.charges)
    .values({
      userId: args.userId,
      arrivalId: args.arrivalId,
      eventId: args.eventId,
      paymentMethodId: ordered[0].id,
      amountCents: args.amountCents,
      kind: args.kind,
      status: 'pending',
    })
    .returning();
  const chargeId = charge[0].id;

  for (const pm of ordered) {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: args.amountCents,
        currency: 'usd',
        customer: args.stripeCustomerId,
        payment_method: pm.stripePmId,
        confirm: true,
        off_session: true,
        payment_method_types: pm.type === 'us_bank_account' ? ['us_bank_account'] : ['card'],
        description: args.description,
        metadata: {
          charge_id: chargeId,
          charge_kind: args.kind,
          arrival_id: args.arrivalId ?? 'none',
          event_id: args.eventId ?? 'none',
          user_id: args.userId,
          consent_id: latestConsent?.id ?? 'none',
          consent_version: latestConsent?.consentVersion ?? 'none',
          consent_signed_at: latestConsent?.signedAt?.toISOString() ?? 'none',
        },
      });
      await db
        .update(schema.charges)
        .set({
          paymentMethodId: pm.id,
          stripeChargeId: intent.id,
          status: intent.status,
          failureReason: null,
        })
        .where(eq(schema.charges.id, chargeId));
      return { charged: true, chargeId };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      await db
        .update(schema.charges)
        .set({ paymentMethodId: pm.id, status: 'failed', failureReason: reason })
        .where(eq(schema.charges.id, chargeId));
    }
  }

  return { charged: false, chargeId };
}
