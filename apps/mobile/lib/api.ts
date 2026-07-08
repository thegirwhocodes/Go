import type { ClassEvent, LocationAlias, PaymentMethod } from '@class-on-time/shared';
import { getAuthHeaders } from './auth';
import { apiBaseUrl } from './config';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = await getAuthHeaders();
  const headers = {
    ...auth,
    ...(init?.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  async getUpcomingEvents(): Promise<ClassEvent[]> {
    return request<ClassEvent[]>('/api/events/upcoming').catch(() => []);
  },
  async pushLocation(lat: number, lng: number, expoPushToken?: string | null) {
    return request<{ ok: true }>('/api/me/location', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lat, lng, expoPushToken: expoPushToken ?? undefined }),
    });
  },
  async updatePushToken(expoPushToken: string) {
    return request<{ ok: true }>('/api/me/push-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expoPushToken }),
    });
  },
  async reportArrival(args: { eventId: string; lat: number; lng: number }) {
    return request<{ ok: true; onTime: boolean }>('/api/arrivals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...args, arrivedAt: new Date().toISOString() }),
    });
  },
  async getMe(): Promise<{
    user: { id: string; email: string };
    paymentMethods: PaymentMethod[];
    paymentLocked: boolean;
  }> {
    return request('/api/me');
  },
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return request('/api/payment-methods');
  },
  async removePaymentMethod(paymentMethodId: string) {
    return request<{ ok: true; removableAt: string }>('/api/payment-methods', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentMethodId }),
    });
  },
  async createSetupIntent(): Promise<{
    setupIntentId: string;
    clientSecret: string;
    customerId: string;
    consentVersion: string;
    consentText: string;
  }> {
    return request('/api/payment/setup-intent', { method: 'POST' });
  },
  async syncPaymentMethod(setupIntentId: string) {
    return request<{ ok: true }>('/api/payment-methods/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ setupIntentId }),
    });
  },
  async getLocationAliases(): Promise<LocationAlias[]> {
    return request('/api/location-aliases');
  },
  async confirmLocationAlias(aliasId: string, confirmedByUser: boolean) {
    return request<{ ok: true }>('/api/location-aliases', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ aliasId, confirmedByUser }),
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
  const auth = await getAuthHeaders();
  const res = await fetch(`${apiBaseUrl}/api/events/confirm`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth },
    body: JSON.stringify({ eventId, transcript }),
  });
  return res.json();
}
