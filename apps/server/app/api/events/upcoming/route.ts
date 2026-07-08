import { getDb, schema } from '@class-on-time/db';
import { requireUser, unauthorized } from '@/lib/session';
import { and, asc, eq, gt, ne } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const db = getDb();
  const now = new Date();
  const rows = await db
    .select()
    .from(schema.events)
    .where(
      and(
        eq(schema.events.userId, user.id),
        gt(schema.events.startsAt, now),
        ne(schema.events.status, 'arrived_on_time'),
      ),
    )
    .orderBy(asc(schema.events.startsAt))
    .limit(10);
  return Response.json(rows);
}
