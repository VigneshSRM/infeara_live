import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/accept-invite"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const isLogin = PUBLIC_ADMIN_PATHS.includes(pathname);

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
