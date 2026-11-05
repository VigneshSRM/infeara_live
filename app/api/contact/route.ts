import { NextResponse } from "next/server";

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

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 200);
  const organisation = clean(payload.organisation, 160);
  const phone = clean(payload.phone, 40);
  const interest = clean(payload.interest, 120);
  const message = clean(payload.message, 5000);

  if (name.length < 2 || !emailPattern.test(email) || message.length < 20 || payload.consent !== true) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 422 });
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (!webhook) {
    // Transport is configured with the backend slice. Until then the form
    // fails honestly and directs the visitor to email instead.
    console.warn("CONTACT_WEBHOOK_URL is not configured; contact form delivery is unavailable.");
    return NextResponse.json({ error: "form_unconfigured" }, { status: 503 });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CONTACT_WEBHOOK_SECRET
          ? { Authorization: `Bearer ${process.env.CONTACT_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify({
        source: "infeara.com/contact",
        receivedAt: new Date().toISOString(),
        name,
        email,
        organisation,
        phone,
        interest,
        message,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
}
