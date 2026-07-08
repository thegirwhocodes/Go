import { getDb, schema } from '@class-on-time/db';
import { requireUser, unauthorized } from '@/lib/session';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

const body = z.object({
  aliasId: z.string().uuid(),
  confirmedByUser: z.boolean(),
});

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const rows = await getDb()
    .select()
    .from(schema.userLocationAliases)
    .where(eq(schema.userLocationAliases.userId, user.id))
    .orderBy(asc(schema.userLocationAliases.createdAt));
  return Response.json(rows);
}

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const json = await req.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const where = and(
    eq(schema.userLocationAliases.id, parsed.data.aliasId),
    eq(schema.userLocationAliases.userId, user.id),
  );

  if (!parsed.data.confirmedByUser) {
    await getDb().delete(schema.userLocationAliases).where(where);
    return Response.json({ ok: true });
  }

  await getDb()
    .update(schema.userLocationAliases)
    .set({ confirmedByUser: true })
    .where(where);
  return Response.json({ ok: true });
}
