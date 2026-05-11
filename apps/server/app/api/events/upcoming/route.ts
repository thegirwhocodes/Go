import { getDb, schema } from '@class-on-time/db';
import { and, asc, gt, ne } from 'drizzle-orm';

export const runtime = 'nodejs';

// TODO: derive userId from the session once auth is wired. For now we list
// all upcoming non-arrived events across the table so the mobile scaffold
// has something to render against the dev server.
export async function GET() {
  const db = getDb();
  const now = new Date();
  const rows = await db
    .select()
    .from(schema.events)
    .where(and(gt(schema.events.startsAt, now), ne(schema.events.status, 'arrived_on_time')))
    .orderBy(asc(schema.events.startsAt))
    .limit(10);
  return Response.json(rows);
}
