import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasServiceRole = Boolean(SUPABASE_URL && SERVICE_KEY);

/**
 * Service-role client. Bypasses RLS, so it is only for provisioning work:
 * inviting a user, deleting an auth account, seeding. Never import this from
 * a page or an action that runs on behalf of a visitor.
 */
export function createAdminClient() {
  if (!hasServiceRole) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  return createSupabaseClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
