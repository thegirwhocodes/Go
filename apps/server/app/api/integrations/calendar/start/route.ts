import { googleOauthClient } from '@/lib/google-calendar';

export const runtime = 'nodejs';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectAfter = url.searchParams.get('redirect') ?? '/';
  const oauth = googleOauthClient();
  const authUrl = oauth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: encodeURIComponent(redirectAfter),
  });
  return Response.redirect(authUrl, 302);
}
