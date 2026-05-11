import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'cot.session';

// TODO: wire to /api/auth/google/start on the server, exchange the code there,
// store a session token here. Stub for the scaffold.
export async function startGoogleSignIn() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'classontime' });
  console.warn('TODO: hit server /api/auth/google/start with redirect', redirectUri);
}

export async function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
