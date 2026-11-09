import { NextResponse } from "next/server";
import { isUuid } from "@/lib/admin/lead-chat";
import { loadThread } from "@/lib/admin/lead-notes";
import { getStaffAccess } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

/**
 * The thread for one lead, as JSON, for the chat's refresh. The browser asks every
 * few seconds, so a message sent by a colleague appears without a reload.
 *
 * It lives under /admin so the proxy keeps the session fresh for it, and it checks
 * the session itself too: a signed-out caller gets a 401 the chat understands, never
 * the sign-in page's HTML. A plain GET with a fixed shape and no side effects.
 */

const headers = { "Cache-Control": "no-store, max-age=0" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const access = await getStaffAccess();
  if (access.status !== "staff") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }
  if (!isUuid(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers });
  }

  const supabase = await createClient();
  const thread = await loadThread(supabase, id);
  if (!thread.ok) {
    return NextResponse.json(
      { error: thread.reason },
      { status: thread.reason === "missing_schema" ? 409 : 502, headers },
    );
  }

  return NextResponse.json({ notes: thread.notes, truncated: thread.truncated }, { headers });
}
