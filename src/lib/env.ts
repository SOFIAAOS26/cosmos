/**
 * Environment access with a friendly, fail-fast check.
 * Secrets live in `.env` (see .env.example) — never hardcoded.
 */

function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value || typeof value !== 'string') {
    throw new Error(
      `[COSMOS] Missing environment variable ${String(name)}. ` +
        `Copy .env.example to .env and fill in your Supabase values.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY'),
  defaultTimezone:
    import.meta.env.VITE_DEFAULT_TIMEZONE ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'UTC',
} as const;

/** True when Supabase env is present — lets the UI show a setup hint instead of crashing. */
export function hasSupabaseConfig(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
