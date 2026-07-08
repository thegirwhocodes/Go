// Constants and types shared between apps/mobile and apps/server.
// Keep this package dependency-free so Expo can consume it without bundler hacks.

export const EARLY_ARRIVAL_WINDOW_MS = 30 * 60 * 1000;
export const PENALTY_AMOUNT_CENTS = 100_00;
export const CANCELLATION_FEE_CENTS = 25_00;
export const LATE_CANCEL_THRESHOLD_MS = 2 * 60 * 60 * 1000;
export const PAYMENT_REMOVAL_LOCKUP_MS = 7 * 24 * 60 * 60 * 1000;
export const SAME_LOCATION_RADIUS_METERS = 100;
export const ARRIVAL_GEOFENCE_RADIUS_METERS = 50;

export type EventStatus =
  | 'pending'
  | 'notified'
  | 'arrived_on_time'
  | 'arrived_late'
  | 'no_show'
  | 'cancelled';

export type EventSource = 'google_calendar' | 'imessage' | 'gmail';

// Returns the fee for cancelling an event `nowMs` before its required arrival.
// > 2h: $25 cancellation fee. < 2h: $100 — too close to call, no escape.
export function cancellationFeeCents(
  nowMs: number,
  requiredArrivalAtMs: number,
): number {
  if (nowMs >= requiredArrivalAtMs) return PENALTY_AMOUNT_CENTS;
  const msUntilRequired = requiredArrivalAtMs - nowMs;
  return msUntilRequired >= LATE_CANCEL_THRESHOLD_MS
    ? CANCELLATION_FEE_CENTS
    : PENALTY_AMOUNT_CENTS;
}

export type PaymentMethodKind = 'apple_pay' | 'us_bank_account';

export type PaymentMethodStatus = 'active' | 'pending_removal';

export interface ClassEvent {
  id: string;
  userId: string;
  sourceEventId: string;
  title: string;
  locationText: string | null;
  destinationLat: number | null;
  destinationLng: number | null;
  startsAt: string;
  endsAt: string;
  requiredArrivalAt: string;
  walkingEtaSeconds: number | null;
  departureAt: string | null;
  notifiedAt: string | null;
  status: EventStatus;
}

export interface Arrival {
  id: string;
  eventId: string;
  arrivedAt: string;
  arrivalLat: number;
  arrivalLng: number;
  wasOnTime: boolean;
  penaltyChargeId: string | null;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  stripePmId: string;
  type: PaymentMethodKind;
  last4: string | null;
  status: PaymentMethodStatus;
  removalRequestedAt: string | null;
  removableAt: string | null;
}

export interface LocationAlias {
  id: string;
  userId: string;
  normalizedPhrase: string;
  resolvedLocationText: string;
  resolvedLat: number;
  resolvedLng: number;
  confirmedByUser: boolean;
  createdAt: string;
}

export function computeRequiredArrival(eventStartsAt: Date): Date {
  return new Date(eventStartsAt.getTime() - EARLY_ARRIVAL_WINDOW_MS);
}

export function isOnTime(arrivedAt: Date, requiredArrivalAt: Date): boolean {
  return arrivedAt.getTime() <= requiredArrivalAt.getTime();
}
