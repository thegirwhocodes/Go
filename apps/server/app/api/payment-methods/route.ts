import { getDb, schema } from '@class-on-time/db';
import { PAYMENT_REMOVAL_LOCKUP_MS } from '@class-on-time/shared';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

// DELETE schedules detachment 7 days from now. We never detach inline — the
// nightly lockup-sweep cron is the only place that actually calls Stripe.
const deleteBody = z.object({
  userId: z.string().uuid(),
  paymentMethodId: z.string().uuid(),
});

export async function DELETE(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = deleteBody.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const db = getDb();
  const now = new Date();
  const removableAt = new Date(now.getTime() + PAYMENT_REMOVAL_LOCKUP_MS);

  const updated = await db
    .update(schema.paymentMethods)
    .set({
      status: 'pending_removal',
      removalRequestedAt: now,
      removableAt,
    })
    .where(
      and(
        eq(schema.paymentMethods.id, parsed.data.paymentMethodId),
        eq(schema.paymentMethods.userId, parsed.data.userId),
      ),
    )
    .returning();

  if (updated.length === 0) {
    return Response.json({ error: 'not found' }, { status: 404 });
  }

  await db.insert(schema.lockupLog).values({
    userId: parsed.data.userId,
    paymentMethodId: parsed.data.paymentMethodId,
    action: 'detach_requested',
    executesAt: removableAt,
  });

  return Response.json({ ok: true, removableAt });
}
