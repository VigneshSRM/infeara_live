import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Cookieless anon client for public content.
 *
 * Using this instead of the cookie-bound client keeps marketing pages static:
 * `cookies()` would opt every page into dynamic rendering. RLS still applies,
 * and the public read policies only expose published rows.
 */
let client: ReturnType<typeof createClient> | null = null;

export function getPublicClient() {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
