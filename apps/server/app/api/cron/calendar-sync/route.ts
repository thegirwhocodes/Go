import { assertCronAuthorized } from '@/lib/cron-auth';
import { getDb, schema } from '@class-on-time/db';
import { computeRequiredArrival } from '@class-on-time/shared';
import { fetchUpcomingEvents } from '@/lib/google-calendar';
import { extractLocations, type InputEvent } from '@/lib/extract-location';
import { geocodeForUser } from '@/lib/geocode';
import { and, eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// Pulls each user's next 48 hours of Google Calendar events, extracts a
// physical location for each (structured `location` field first, then
// LLM extraction from title+description), geocodes via Mapbox, upserts.
export async function GET(req: Request) {
  try {
    assertCronAuthorized(req);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  const db = getDb();
  const userRows = await db.select().from(schema.users);
  let synced = 0;
  let skipped = 0;
  for (const user of userRows) {
    const tokenRow = await db
      .select()
      .from(schema.oauthTokens)
      .where(eq(schema.oauthTokens.userId, user.id))
      .limit(1);
    const token = tokenRow[0];
    if (!token) continue;

    const events = await fetchUpcomingEvents(
      token.accessToken,
      token.refreshToken ?? null,
      48 * 60 * 60 * 1000,
    );

    const timed = events.filter((ev) => ev.id && ev.start?.dateTime && ev.end?.dateTime);

    // Events that already have a structured location can skip the LLM step.
    const needExtraction: InputEvent[] = timed
      .filter((ev) => !ev.location)
      .map((ev) => ({
        sourceEventId: ev.id!,
        title: ev.summary ?? '(no title)',
        description: ev.description ?? null,
      }));

    const extracted = needExtraction.length > 0 ? await extractLocations(needExtraction) : [];
    const extractedById = new Map(extracted.map((e) => [e.sourceEventId, e]));

    for (const ev of timed) {
      const startsAt = new Date(ev.start!.dateTime!);
      const endsAt = new Date(ev.end!.dateTime!);
      const requiredArrivalAt = computeRequiredArrival(startsAt);
      const title = ev.summary ?? '(no title)';

      let locationText: string | null = ev.location ?? null;
      let destinationLat: number | null = null;
      let destinationLng: number | null = null;

      if (!locationText) {
        const hit = extractedById.get(ev.id!);
        if (hit?.location) locationText = hit.location;
      }

      if (locationText) {
        const geo = await geocodeForUser(user.id, locationText);
        if (geo) {
          destinationLat = geo.lat;
          destinationLng = geo.lng;
          locationText = geo.placeName;
        }
      }

      if (destinationLat == null || destinationLng == null) {
        skipped += 1;
        continue;
      }

      const existing = await db
        .select({ id: schema.events.id })
        .from(schema.events)
        .where(and(eq(schema.events.userId, user.id), eq(schema.events.sourceEventId, ev.id!)))
        .limit(1);

      const values = {
        title,
        locationText,
        destinationLat,
        destinationLng,
        startsAt,
        endsAt,
        requiredArrivalAt,
        rawJson: ev,
      };

      if (existing[0]) {
        await db.update(schema.events).set(values).where(eq(schema.events.id, existing[0].id));
      } else {
        await db.insert(schema.events).values({
          userId: user.id,
          sourceEventId: ev.id!,
          ...values,
        });
      }
      synced += 1;
    }
  }
  return Response.json({ ok: true, synced, skipped });
}
