import { getStripe } from '@/lib/stripe';
import { getDb, schema } from '@class-on-time/db';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// Stripe sends webhook events as a raw body — we must verify the signature
// against the raw bytes, not parsed JSON.
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new Response('not configured', { status: 400 });

  const raw = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return new Response(`invalid signature: ${err instanceof Error ? err.message : err}`, {
      status: 400,
    });
  }

  const db = getDb();
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const arrivalId = (pi.metadata as Record<string, string>).arrival_id;
      if (arrivalId) {
        await db
          .update(schema.charges)
          .set({ status: 'succeeded', stripeChargeId: pi.id })
          .where(eq(schema.charges.arrivalId, arrivalId));
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      const arrivalId = (pi.metadata as Record<string, string>).arrival_id;
      if (arrivalId) {
        await db
          .update(schema.charges)
          .set({
            status: 'failed',
            failureReason: pi.last_payment_error?.message ?? 'unknown',
          })
          .where(eq(schema.charges.arrivalId, arrivalId));
      }
      break;
    }
    case 'payment_method.detached': {
      // Anti-escape: if Stripe tells us a payment method was detached outside
      // our normal lockup flow, mark every method for that customer as
      // pending_removal so the user is forced to re-onboard before the next
      // charge cycle. The lockup-sweep cron handles the actual delete.
      const pm = event.data.object;
      const customerId = typeof pm.customer === 'string' ? pm.customer : null;
      if (customerId) {
        const user = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.stripeCustomerId, customerId))
          .limit(1);
        if (user[0]) {
          console.warn(
            `[cot] payment_method.detached for user ${user[0].id} — flagging for re-onboard`,
          );
          await db
            .delete(schema.paymentMethods)
            .where(eq(schema.paymentMethods.stripePmId, pm.id));
        }
      }
      break;
    }
    case 'setup_intent.succeeded': {
      // The mobile SDK confirmed a PaymentMethod via the PaymentSheet —
      // mirror it into our table so penalty-charges can find it.
      const si = event.data.object;
      const pmId = typeof si.payment_method === 'string' ? si.payment_method : null;
      const customerId = typeof si.customer === 'string' ? si.customer : null;
      if (pmId && customerId) {
        const userRow = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.stripeCustomerId, customerId))
          .limit(1);
        if (userRow[0]) {
          const pm = await getStripe().paymentMethods.retrieve(pmId);
          const last4 = pm.card?.last4 ?? pm.us_bank_account?.last4 ?? null;
          const type = pm.type === 'us_bank_account' ? 'us_bank_account' : 'apple_pay';
          await db
            .insert(schema.paymentMethods)
            .values({
              userId: userRow[0].id,
              stripePmId: pmId,
              type,
              last4,
              status: 'active',
            })
            .onConflictDoNothing();
        }
      }
      break;
    }
    default:
      // ignore — keep the log noise down
      break;
  }
  return Response.json({ received: true });
}
