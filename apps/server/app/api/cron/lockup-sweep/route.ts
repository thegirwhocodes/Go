import { assertCronAuthorized } from '@/lib/cron-auth';
import { getDb, schema } from '@class-on-time/db';
import { getStripe } from '@/lib/stripe';
import { and, eq, isNotNull, lte } from 'drizzle-orm';

export const runtime = 'nodejs';

// Once a day, actually detach payment methods whose lockup window has elapsed.
// The user-facing "remove" action only marks pending_removal — this sweep is
// the only path that calls Stripe's detach API.
export async function GET(req: Request) {
  try {
    assertCronAuthorized(req);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  const db = getDb();
  const stripe = getStripe();
  const now = new Date();

  const due = await db
    .select()
    .from(schema.paymentMethods)
    .where(
      and(
        eq(schema.paymentMethods.status, 'pending_removal'),
        isNotNull(schema.paymentMethods.removableAt),
        lte(schema.paymentMethods.removableAt, now),
      ),
    );

  let detached = 0;
  for (const pm of due) {
    try {
      await stripe.paymentMethods.detach(pm.stripePmId);
    } catch {
      // already detached upstream — ignore
    }
    await db.delete(schema.paymentMethods).where(eq(schema.paymentMethods.id, pm.id));
    await db.insert(schema.lockupLog).values({
      userId: pm.userId,
      paymentMethodId: pm.id,
      action: 'detach_executed',
      executesAt: now,
      executedAt: now,
    });
    detached += 1;
  }
  return Response.json({ ok: true, detached });
}
