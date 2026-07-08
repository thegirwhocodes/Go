import { getDb, schema } from '@class-on-time/db';
import { isOnTime } from '@class-on-time/shared';
import { requireUser, unauthorized } from '@/lib/session';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

const arrivalSchema = z.object({
  eventId: z.string().uuid(),
  arrivedAt: z.string().datetime(),
  lat: z.number(),
  lng: z.number(),
});

// Mobile app POSTs here when its background geofence fires at the destination.
// We decide on-time vs late here (a single timestamp comparison) and let the
// cron-driven charge job actually run Stripe.
export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = arrivalSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const db = getDb();
  const eventRow = await db
    .select()
    .from(schema.events)
    .where(and(eq(schema.events.id, parsed.data.eventId), eq(schema.events.userId, user.id)))
    .limit(1);
  const event = eventRow[0];
  if (!event) return Response.json({ error: 'event not found' }, { status: 404 });

  const arrivedAt = new Date(parsed.data.arrivedAt);
  const onTime = isOnTime(arrivedAt, event.requiredArrivalAt);

  const inserted = await db
    .insert(schema.arrivals)
    .values({
      eventId: event.id,
      userId: user.id,
      arrivedAt,
      arrivalLat: parsed.data.lat,
      arrivalLng: parsed.data.lng,
      wasOnTime: onTime,
    })
    .returning();

  await db
    .update(schema.events)
    .set({ status: onTime ? 'arrived_on_time' : 'arrived_late' })
    .where(eq(schema.events.id, event.id));

  return Response.json({ ok: true, onTime, arrival: inserted[0] });
}
