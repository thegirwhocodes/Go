import { getDb, schema } from '@class-on-time/db';
import { cancellationFeeCents } from '@class-on-time/shared';
import { requireUser, unauthorized } from '@/lib/session';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

// User-initiated cancellation. Fee is set server-side from the event's
// required_arrival_at so the client can't game it by lying about timing.
const body = z.object({
  eventId: z.string().uuid(),
  reason: z.string().max(280).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const json = await req.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const db = getDb();
  const eventRow = await db
    .select()
    .from(schema.events)
    .where(and(eq(schema.events.id, parsed.data.eventId), eq(schema.events.userId, user.id)))
    .limit(1);
  const event = eventRow[0];
  if (!event) return Response.json({ error: 'event not found' }, { status: 404 });
  if (event.status !== 'pending' && event.status !== 'notified') {
    return Response.json(
      { error: 'event cannot be cancelled in its current state', status: event.status },
      { status: 409 },
    );
  }

  const now = new Date();
  const fee = cancellationFeeCents(now.getTime(), event.requiredArrivalAt.getTime());

  await db
    .update(schema.events)
    .set({
      status: 'cancelled',
      cancelledAt: now,
      cancellationFeeCents: fee,
      cancellationReason: parsed.data.reason ?? null,
    })
    .where(eq(schema.events.id, event.id));

  // The penalty-charges cron picks up cancellation_fee_cents > 0 events and
  // bills them the same way it bills late arrivals.
  return Response.json({ ok: true, feeCents: fee, cancelledAt: now });
}
