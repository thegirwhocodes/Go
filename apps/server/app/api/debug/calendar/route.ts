import { assertCronAuthorized } from '@/lib/cron-auth';
import { getDb, schema } from '@class-on-time/db';
import { fetchUpcomingEvents } from '@/lib/google-calendar';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// Debug-only: dumps the next 7 days of every user's calendar with the fields
// we care about so we can see why calendar-sync isn't picking events up.
// Remove before deploying.
export async function GET(req: Request) {
  try {
    assertCronAuthorized(req);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  const db = getDb();
  const users = await db.select().from(schema.users);
  const out: Array<Record<string, unknown>> = [];
  for (const user of users) {
    const tokens = await db
      .select()
      .from(schema.oauthTokens)
      .where(eq(schema.oauthTokens.userId, user.id))
      .limit(1);
    if (tokens.length === 0) continue;
    const events = await fetchUpcomingEvents(
      tokens[0].accessToken,
      tokens[0].refreshToken,
      7 * 24 * 60 * 60 * 1000,
    );
    out.push({
      user: user.email,
      eventCount: events.length,
      events: events.slice(0, 25).map((e) => ({
        title: e.summary ?? null,
        location: e.location ?? null,
        description: e.description?.slice(0, 200) ?? null,
        startDateTime: e.start?.dateTime ?? null,
        startDate: e.start?.date ?? null,
      })),
    });
  }
  return Response.json(out);
}
