import { createHmac, timingSafeEqual } from 'node:crypto';
import { getDb, schema } from '@class-on-time/db';
import { eq } from 'drizzle-orm';

interface SessionPayload {
  userId: string;
  exp: number;
}

const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.SESSION_SECRET ?? process.env.CRON_SECRET ?? process.env.STRIPE_SECRET_KEY;
  if (!value) throw new Error('SESSION_SECRET or CRON_SECRET is required for mobile sessions');
  return value;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encoded = base64url(JSON.stringify(payload));
  return `v1.${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [version, encoded, signature] = token.split('.');
  if (version !== 'v1' || !encoded || !signature) return null;

  const expected = sign(encoded);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length) return null;
  if (!timingSafeEqual(actualBytes, expectedBytes)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.userId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function requireUser(req: Request) {
  const auth = req.headers.get('authorization');
  const token = auth?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, payload.userId))
    .limit(1);
  return rows[0] ?? null;
}

export function unauthorized() {
  return Response.json({ error: 'unauthorized' }, { status: 401 });
}
