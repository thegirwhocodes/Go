import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;

// Uses postgres.js because we're targeting Supabase Postgres (raw wire
// protocol). If we later swap to Neon, switch to drizzle-orm/neon-http with
// @neondatabase/serverless. Supabase recommends the Transaction Pooler URL
// (port 6543) for serverless runtimes like Vercel Functions.
export function getDb() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const client = postgres(url, { prepare: false });
  cached = drizzle(client, { schema });
  return cached;
}

export * as schema from './schema';
export type Database = ReturnType<typeof getDb>;
