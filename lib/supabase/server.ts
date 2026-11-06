import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Request-scoped Supabase client that reads and writes the auth cookies.
 *
 * Reads run with the signed-in user's JWT, so row-level security is the
 * authority on every query — the admin UI never uses a service key.
 */
export async function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the
          // session on every admin request, so this is expected and harmless.
        }
      },
    },
  });
}
