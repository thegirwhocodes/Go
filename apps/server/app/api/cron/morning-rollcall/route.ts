import { assertCronAuthorized } from '@/lib/cron-auth';
import { getDb, schema } from '@class-on-time/db';
import { sendPush } from '@/lib/expo-push';
import { and, eq, gte, isNotNull, lte } from 'drizzle-orm';

export const runtime = 'nodejs';

// Runs daily at 7am ET (cron schedule: `0 11 * * *` in UTC). For each user
// with events scheduled today and an expo push token, sends one push that
// opens the in-app roll-call screen. The actual roll-call UI is in the
// mobile app — this cron is just the wake-up.
export async function GET(req: Request) {
  try {
    assertCronAuthorized(req);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  const db = getDb();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const users = await db.select().from(schema.users).where(isNotNull(schema.users.expoPushToken));
  let pinged = 0;
  for (const user of users) {
    const todays = await db
      .select()
      .from(schema.events)
      .where(
        and(
          eq(schema.events.userId, user.id),
          gte(schema.events.startsAt, startOfDay),
          lte(schema.events.startsAt, endOfDay),
          eq(schema.events.status, 'pending'),
        ),
      );
    if (todays.length === 0) continue;
    if (!user.expoPushToken) continue;
    await sendPush({
      to: user.expoPushToken,
      sound: 'default',
      title: `Roll call — ${todays.length} commitment${todays.length === 1 ? '' : 's'} today`,
      body: 'Tap to confirm each one out loud.',
      data: { kind: 'morning_rollcall' },
    });
    pinged += 1;
  }
  return Response.json({ ok: true, pinged });
}
