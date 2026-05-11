import { google } from 'googleapis';
import type { calendar_v3 } from 'googleapis';

// Google OAuth credentials are reused from the user's existing cortex-web
// project (see /Users/naomiivie/cortex/cortex-web/.env.local). The OAuth
// client there already has calendar.readonly scope and the redirect URI
// `/api/integrations/calendar/callback` registered, which is why the route
// in this app is mounted at that exact path.
export function googleOauthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Missing Google OAuth env vars');
  }
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export async function fetchUpcomingEvents(
  accessToken: string,
  refreshToken: string | null,
  windowMs = 24 * 60 * 60 * 1000,
): Promise<calendar_v3.Schema$Event[]> {
  const auth = googleOauthClient();
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken ?? undefined });
  const calendar = google.calendar({ version: 'v3', auth });
  const now = new Date();
  const end = new Date(now.getTime() + windowMs);
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 50,
  });
  return res.data.items ?? [];
}
