import { sql } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  googleUserId: text('google_user_id').notNull().unique(),
  email: text('email').notNull(),
  expoPushToken: text('expo_push_token'),
  stripeCustomerId: text('stripe_customer_id'),
  currentLat: doublePrecision('current_lat'),
  currentLng: doublePrecision('current_lng'),
  currentLocUpdatedAt: timestamp('current_loc_updated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const oauthTokens = pgTable('oauth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  scope: text('scope'),
});

// Add a unique constraint on (userId, sourceEventId) so onConflictDoNothing
// works correctly when calendar-sync runs every 5 minutes.
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sourceEventId: text('source_event_id').notNull(),
  title: text('title').notNull(),
  locationText: text('location_text'),
  destinationLat: doublePrecision('destination_lat'),
  destinationLng: doublePrecision('destination_lng'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  requiredArrivalAt: timestamp('required_arrival_at', { withTimezone: true }).notNull(),
  walkingEtaSeconds: integer('walking_eta_seconds'),
  departureAt: timestamp('departure_at', { withTimezone: true }),
  notifiedAt: timestamp('notified_at', { withTimezone: true }),
  status: text('status').notNull().default('pending'),
  source: text('source').notNull().default('google_calendar'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationFeeCents: integer('cancellation_fee_cents'),
  cancellationReason: text('cancellation_reason'),
  rollCallSeenAt: timestamp('roll_call_seen_at', { withTimezone: true }),
  rawJson: jsonb('raw_json'),
});

export const arrivals = pgTable('arrivals', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  arrivedAt: timestamp('arrived_at', { withTimezone: true }).notNull(),
  arrivalLat: doublePrecision('arrival_lat').notNull(),
  arrivalLng: doublePrecision('arrival_lng').notNull(),
  wasOnTime: boolean('was_on_time').notNull(),
  penaltyChargeId: uuid('penalty_charge_id'),
});

export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripePmId: text('stripe_pm_id').notNull(),
  type: text('type').notNull(),
  last4: text('last4'),
  status: text('status').notNull().default('active'),
  removalRequestedAt: timestamp('removal_requested_at', { withTimezone: true }),
  removableAt: timestamp('removable_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const charges = pgTable('charges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  arrivalId: uuid('arrival_id').references(() => arrivals.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id),
  stripeChargeId: text('stripe_charge_id'),
  amountCents: integer('amount_cents').notNull(),
  kind: text('kind').notNull().default('late_arrival'),
  status: text('status').notNull().default('pending'),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Per-user memory of "when this person says X, they mean Y." First time we
// resolve a fuzzy term like "gym" we ask the user to confirm; once they do,
// we remember it forever. This is the Apple-Significant-Locations equivalent.
export const userLocationAliases = pgTable('user_location_aliases', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  normalizedPhrase: text('normalized_phrase').notNull(),
  resolvedLocationText: text('resolved_location_text').notNull(),
  resolvedLat: doublePrecision('resolved_lat').notNull(),
  resolvedLng: doublePrecision('resolved_lng').notNull(),
  confirmedByUser: boolean('confirmed_by_user').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Signed pre-commit consent rows. Captured when the user first attaches a
// payment method. Surfaced inside Stripe payment_intent.metadata on every
// off-session charge, so we have evidence to defend any chargeback.
export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  consentVersion: text('consent_version').notNull(),
  consentText: text('consent_text').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  signedAt: timestamp('signed_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lockupLog = pgTable('lockup_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  paymentMethodId: uuid('payment_method_id').notNull().references(() => paymentMethods.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  executesAt: timestamp('executes_at', { withTimezone: true }).notNull(),
  executedAt: timestamp('executed_at', { withTimezone: true }),
});

export const pgSetup = sql`
  create extension if not exists "uuid-ossp";
`;
