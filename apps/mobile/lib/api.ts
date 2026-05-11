import Constants from 'expo-constants';
import type { ClassEvent } from '@class-on-time/shared';

const baseUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.apiUrl ??
  'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, init);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  async getUpcomingEvents(): Promise<ClassEvent[]> {
    // TODO: real auth — for now pretend the server filters by signed-in user.
    return request<ClassEvent[]>('/api/events/upcoming').catch(() => []);
  },
  async pushLocation(userId: string, lat: number, lng: number) {
    return request<{ ok: true }>('/api/me/location', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, lat, lng }),
    });
  },
  async reportArrival(args: { userId: string; eventId: string; lat: number; lng: number }) {
    return request<{ ok: true; onTime: boolean }>('/api/arrivals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...args, arrivedAt: new Date().toISOString() }),
    });
  },
};

export async function confirmEvent(
  eventId: string,
  transcript: string,
): Promise<{
  ok: boolean;
  action?: 'confirmed' | 'cancelled';
  feeCents?: number;
  reason?: string;
}> {
  const res = await fetch(`${baseUrl}/api/events/confirm`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ eventId, transcript }),
  });
  return res.json();
}
