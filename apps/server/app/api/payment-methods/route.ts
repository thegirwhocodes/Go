import { getDb, schema } from '@class-on-time/db';
import { PAYMENT_REMOVAL_LOCKUP_MS } from '@class-on-time/shared';
import { requireUser, unauthorized } from '@/lib/session';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

// DELETE schedules detachment 7 days from now. We never detach inline — the
// nightly lockup-sweep cron is the only place that actually calls Stripe.
const deleteBody = z.object({
  paymentMethodId: z.string().uuid(),
});

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const rows = await getDb()
    .select()
    .from(schema.paymentMethods)
    .where(eq(schema.paymentMethods.userId, user.id));

  return Response.json(rows);
}

export async function DELETE(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

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
        eq(schema.paymentMethods.userId, user.id),
      ),
    )
    .returning();

  if (updated.length === 0) {
    return Response.json({ error: 'not found' }, { status: 404 });
  }

  await db.insert(schema.lockupLog).values({
    userId: user.id,
    paymentMethodId: parsed.data.paymentMethodId,
    action: 'detach_requested',
    executesAt: removableAt,
  });

  return Response.json({ ok: true, removableAt });
}
