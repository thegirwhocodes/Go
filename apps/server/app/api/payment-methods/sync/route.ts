import { getDb } from '@class-on-time/db';
import { getStripe } from '@/lib/stripe';
import { requireUser, unauthorized } from '@/lib/session';
import { rememberStripePaymentMethod } from '@/lib/payment-methods';
import { z } from 'zod';

export const runtime = 'nodejs';

const body = z.object({
  setupIntentId: z.string().startsWith('seti_'),
});

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const json = await req.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const setupIntent = await getStripe().setupIntents.retrieve(parsed.data.setupIntentId);
  const pmId =
    typeof setupIntent.payment_method === 'string' ? setupIntent.payment_method : setupIntent.payment_method?.id;

  if (!pmId || setupIntent.status !== 'succeeded') {
    return Response.json({ error: 'setup intent is not complete' }, { status: 409 });
  }

  const pm = await getStripe().paymentMethods.retrieve(pmId);
  const last4 = pm.card?.last4 ?? pm.us_bank_account?.last4 ?? null;
  const type = pm.type === 'us_bank_account' ? 'us_bank_account' : 'apple_pay';

  await rememberStripePaymentMethod(getDb(), {
    userId: user.id,
    stripePmId: pmId,
    type,
    last4,
  });

  return Response.json({ ok: true });
}
