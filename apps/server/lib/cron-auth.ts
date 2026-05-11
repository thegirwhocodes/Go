// Vercel Cron requests carry an `Authorization: Bearer ${CRON_SECRET}` header.
// We also allow the same secret as a query param for local curl testing.
export function assertCronAuthorized(req: Request): void {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') return;
    throw new Response('CRON_SECRET not configured', { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${expected}`) return;
  const url = new URL(req.url);
  if (url.searchParams.get('secret') === expected) return;
  throw new Response('Unauthorized', { status: 401 });
}
