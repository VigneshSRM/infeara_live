import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";

type Payload = {
  name?: unknown;
  email?: unknown;
  organisation?: unknown;
  phone?: unknown;
  interest?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Best-effort in-process rate limit. Serverless instances do not share memory,
 * so this slows a single abusive client rather than guaranteeing a global cap.
 * The real defence is the honeypot plus the narrow insert-only RLS policy.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(key: string) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) {
      for (const [candidate, value] of hits) {
        if (value.reset < now) hits.delete(candidate);
      }
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  let payload: Payload;

  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Honeypot: a filled hidden field is treated as a bot. Return success so it
  // does not learn which control caught it.
  if (clean(payload.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  if (rateLimited(clientKey(request))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 200);
  const organisation = clean(payload.organisation, 160);
  const phone = clean(payload.phone, 40);
  const interest = clean(payload.interest, 120);
  const message = clean(payload.message, 5000);

  if (name.length < 2 || !emailPattern.test(email) || message.length < 20 || payload.consent !== true) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 422 });
  }

  const supabase = getPublicClient();

  if (!supabase) {
    console.warn("Supabase is not configured; contact form delivery is unavailable.");
    return NextResponse.json({ error: "form_unconfigured" }, { status: 503 });
  }

  const referer = request.headers.get("referer");
  let sourcePage: string | null = null;
  if (referer) {
    try {
      sourcePage = new URL(referer).pathname;
    } catch {
      sourcePage = null;
    }
  }

  const { error } = await supabase.from("leads").insert({
    name,
    email,
    company: organisation || null,
    phone: phone || null,
    topic: interest || null,
    message,
    source_page: sourcePage,
  } as never);

  if (error) {
    console.error("[contact] lead insert failed:", error.message);
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
