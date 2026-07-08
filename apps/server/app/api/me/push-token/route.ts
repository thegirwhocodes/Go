import { getDb, schema } from '@class-on-time/db';
import { requireUser, unauthorized } from '@/lib/session';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

const body = z.object({
  expoPushToken: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const json = await req.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  await getDb()
    .update(schema.users)
    .set({ expoPushToken: parsed.data.expoPushToken })
    .where(eq(schema.users.id, user.id));

  return Response.json({ ok: true });
}
