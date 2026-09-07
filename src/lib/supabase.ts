import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { hasSupabaseConfig } from './env';

/**
 * The single Supabase client for the app.
 * Typed against our Database schema (src/types/database.ts).
 *
 * We construct it lazily and tolerate a missing config so the app can render a
 * setup screen instead of a white crash during first-time setup.
 */
let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('[COSMOS] Supabase is not configured. See .env.example.');
  }
  client = createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'cosmos.auth',
    },
    realtime: {
      params: { eventsPerSecond: 8 },
    },
  });
  return client;
}

export { hasSupabaseConfig };
