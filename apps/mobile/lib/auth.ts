import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { apiBaseUrl } from './config';

const TOKEN_KEY = 'cot.session';
const USER_ID_KEY = 'cot.userId';

export async function startGoogleSignIn() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'classontime', path: 'auth' });
  const startUrl = new URL('/api/integrations/calendar/start', apiBaseUrl);
  startUrl.searchParams.set('redirect', redirectUri);

  const result = await WebBrowser.openAuthSessionAsync(startUrl.toString(), redirectUri);
  if (result.type !== 'success') return false;

  const callback = new URL(result.url);
  const token = callback.searchParams.get('token');
  const userId = callback.searchParams.get('userId');
  if (!token || !userId) throw new Error('Google sign-in did not return a session');

  await setSessionToken(token);
  await setCurrentUserId(userId);
  return true;
}

export async function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getCurrentUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

export async function setCurrentUserId(userId: string): Promise<void> {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}
