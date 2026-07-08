import { assertCronAuthorized } from '@/lib/cron-auth';
import { getDb, schema } from '@class-on-time/db';
import { computeRequiredArrival } from '@class-on-time/shared';
import { groupByThread, readRecentMessages } from '@/lib/imessage';
import { extractCommitments, type ConversationLine } from '@/lib/extract-commitments';
import { geocodeForUser } from '@/lib/geocode';
import { and, eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// Local-dev only — reads ~/Library/Messages/chat.db on the host machine,
// extracts meeting commitments, and inserts them as events. Use sparingly —
// this calls the LLM once per conversation thread.
export async function GET(req: Request) {
  try {
    assertCronAuthorized(req);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'dev-only endpoint' }, { status: 403 });
  }
  const url = new URL(req.url);
  const daysBack = parseInt(url.searchParams.get('days') ?? '7', 10);
  const userEmail = url.searchParams.get('user') ?? 'nivie@wesleyan.edu';

  const db = getDb();
  const userRow = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, userEmail))
    .limit(1);
  if (userRow.length === 0) return Response.json({ error: 'user not found' }, { status: 404 });
  const userId = userRow[0].id;

  const messages = readRecentMessages(daysBack);
  const threads = groupByThread(messages);

  const found: Array<{
    thread: string;
    commitments: number;
    inserted: number;
  }> = [];

  for (const [threadKey, msgs] of threads) {
    // Skip threads that are obvious system/promotional senders.
    if (/noreply|verification|otp|code is/i.test(msgs.map((m) => m.text).join(' '))) continue;
    if (msgs.length < 2) continue; // need back-and-forth

    const lines: ConversationLine[] = msgs.map((m) => ({
      who: m.isFromMe ? 'Naomi' : threadKey,
      when: m.date,
      text: m.text,
    }));

    const commitments = await extractCommitments(lines, `iMessage with ${threadKey}`);
    let inserted = 0;
    for (const c of commitments) {
      if (c.confidence === 'low') continue;
      const startsAt = new Date(c.startsAt);
      const endsAt = new Date(c.endsAt);
      if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) continue;
      if (startsAt.getTime() < Date.now()) continue; // past

      let destinationLat: number | null = null;
      let destinationLng: number | null = null;
      let locationText = c.location;
      if (locationText) {
        const geo = await geocodeForUser(userId, locationText);
        if (geo) {
          destinationLat = geo.lat;
          destinationLng = geo.lng;
          locationText = geo.placeName;
        }
      }
      if (destinationLat == null || destinationLng == null) continue;

      const sourceEventId = `imessage:${threadKey}:${c.evidenceQuote.slice(0, 80)}`;
      const existing = await db
        .select({ id: schema.events.id })
        .from(schema.events)
        .where(and(eq(schema.events.userId, userId), eq(schema.events.sourceEventId, sourceEventId)))
        .limit(1);
      const values = {
        title: c.title,
        locationText,
        destinationLat,
        destinationLng,
        startsAt,
        endsAt,
        requiredArrivalAt: computeRequiredArrival(startsAt),
        source: 'imessage',
        rawJson: c as unknown as Record<string, unknown>,
      };

      if (existing[0]) {
        await db.update(schema.events).set(values).where(eq(schema.events.id, existing[0].id));
      } else {
        await db.insert(schema.events).values({
          userId,
          sourceEventId,
          ...values,
        });
      }
      inserted += 1;
    }
    if (commitments.length > 0) {
      found.push({ thread: threadKey, commitments: commitments.length, inserted });
    }
  }

  return Response.json({
    ok: true,
    threadsScanned: threads.size,
    messagesScanned: messages.length,
    found,
  });
}
