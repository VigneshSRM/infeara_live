import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Refreshes the auth session for an admin request and reports who is signed in.
 * Called from proxy.ts, which only matches /admin/*, so the public site never
 * pays for it.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return { response, user: null };
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() validates the JWT with the auth server and refreshes it when
  // needed. getSession() would trust the cookie and is not enough here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
