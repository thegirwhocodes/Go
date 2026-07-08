import type { Database } from '@class-on-time/db';
import { schema } from '@class-on-time/db';
import { eq } from 'drizzle-orm';

export async function rememberStripePaymentMethod(
  db: Database,
  args: {
    userId: string;
    stripePmId: string;
    type: string;
    last4: string | null;
  },
) {
  const existing = await db
    .select()
    .from(schema.paymentMethods)
    .where(eq(schema.paymentMethods.stripePmId, args.stripePmId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.paymentMethods)
      .set({
        userId: args.userId,
        type: args.type,
        last4: args.last4,
        status: 'active',
        removalRequestedAt: null,
        removableAt: null,
      })
      .where(eq(schema.paymentMethods.id, existing[0].id));
    return existing[0].id;
  }

  const inserted = await db
    .insert(schema.paymentMethods)
    .values({
      userId: args.userId,
      stripePmId: args.stripePmId,
      type: args.type,
      last4: args.last4,
      status: 'active',
    })
    .returning({ id: schema.paymentMethods.id });
  return inserted[0].id;
}
