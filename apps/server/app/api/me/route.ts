import { getDb, schema } from '@class-on-time/db';
import { requireUser, unauthorized } from '@/lib/session';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const paymentMethods = await getDb()
    .select()
    .from(schema.paymentMethods)
    .where(eq(schema.paymentMethods.userId, user.id));

  return Response.json({
    user,
    paymentMethods,
    paymentLocked: paymentMethods.every((pm) => pm.status !== 'active'),
  });
}
