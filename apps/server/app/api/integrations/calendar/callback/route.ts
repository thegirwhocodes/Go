import { getDb, schema } from '@class-on-time/db';
import { googleOauthClient } from '@/lib/google-calendar';
import { createSessionToken } from '@/lib/session';
import { google } from 'googleapis';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('missing code', { status: 400 });

  const oauth = googleOauthClient();
  const { tokens } = await oauth.getToken(code);
  oauth.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth });
  const { data: profile } = await oauth2.userinfo.get();
  if (!profile.id || !profile.email) return new Response('no profile', { status: 400 });

  const db = getDb();
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.googleUserId, profile.id))
    .limit(1);

  let userId: string;
  if (existing.length === 0) {
    const inserted = await db
      .insert(schema.users)
      .values({ googleUserId: profile.id, email: profile.email })
      .returning({ id: schema.users.id });
    userId = inserted[0].id;
  } else {
    userId = existing[0].id;
  }

  await db
    .insert(schema.oauthTokens)
    .values({
      userId,
      provider: 'google',
      accessToken: tokens.access_token ?? '',
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      scope: tokens.scope ?? null,
    });

  const redirectTo = decodeURIComponent(url.searchParams.get('state') ?? '/');
  const target = new URL(redirectTo, url.origin);
  target.searchParams.set('userId', userId);
  target.searchParams.set('token', createSessionToken(userId));
  return Response.redirect(target.toString(), 302);
}
