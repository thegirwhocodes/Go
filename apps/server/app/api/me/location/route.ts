import { getDb, schema } from '@class-on-time/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

const body = z.object({
  userId: z.string().uuid(),
  lat: z.number(),
  lng: z.number(),
});

// The mobile app pings this every few minutes (or on significant movement) so
// the departure-tick cron has a fresh starting point for walking-ETA math.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const db = getDb();
  await db
    .update(schema.users)
    .set({
      currentLat: parsed.data.lat,
      currentLng: parsed.data.lng,
      currentLocUpdatedAt: new Date(),
    })
    .where(eq(schema.users.id, parsed.data.userId));
  return Response.json({ ok: true });
}
