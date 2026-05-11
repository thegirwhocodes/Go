import { assertCronAuthorized } from '@/lib/cron-auth';
import { getDb, schema } from '@class-on-time/db';
import { getWalkingDirections } from '@/lib/mapbox';
import { sendPush } from '@/lib/expo-push';
import { and, eq, gt, isNotNull, lte } from 'drizzle-orm';

export const runtime = 'nodejs';

// Runs every minute. For each pending event in the next ~4 hours we recompute
// walking ETA from the user's last known location and decide whether to push
// the "start heading to your destination" alert now.
export async function GET(req: Request) {
  try {
    assertCronAuthorized(req);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  const db = getDb();
  const now = new Date();
  const horizon = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const candidates = await db
    .select({
      event: schema.events,
      user: schema.users,
    })
    .from(schema.events)
    .innerJoin(schema.users, eq(schema.users.id, schema.events.userId))
    .where(
      and(
        eq(schema.events.status, 'pending'),
        gt(schema.events.startsAt, now),
        lte(schema.events.startsAt, horizon),
        isNotNull(schema.events.destinationLat),
        isNotNull(schema.events.destinationLng),
      ),
    );

  let pushed = 0;
  for (const { event, user } of candidates) {
    if (
      user.currentLat == null ||
      user.currentLng == null ||
      event.destinationLat == null ||
      event.destinationLng == null
    ) {
      continue;
    }
    const directions = await getWalkingDirections(
      { lat: user.currentLat, lng: user.currentLng },
      { lat: event.destinationLat, lng: event.destinationLng },
    );
    const departureAt = new Date(
      event.requiredArrivalAt.getTime() - directions.durationSeconds * 1000,
    );
    await db
      .update(schema.events)
      .set({
        walkingEtaSeconds: directions.durationSeconds,
        departureAt,
      })
      .where(eq(schema.events.id, event.id));

    if (departureAt <= now && user.expoPushToken) {
      await sendPush({
        to: user.expoPushToken,
        sound: 'default',
        title: `Time to head to ${event.title}`,
        body: `${Math.round(directions.durationSeconds / 60)} min walk — arrive 30 min early.`,
        data: { eventId: event.id },
      });
      await db
        .update(schema.events)
        .set({ status: 'notified', notifiedAt: now })
        .where(eq(schema.events.id, event.id));
      pushed += 1;
    }
  }
  return Response.json({ ok: true, evaluated: candidates.length, pushed });
}
