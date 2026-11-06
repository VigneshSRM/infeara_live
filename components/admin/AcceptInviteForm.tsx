"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

/**
 * Landing page for a Supabase invitation link.
 *
 * Supabase redirects here with the session in the URL fragment. The browser
 * client picks it up (detectSessionInUrl), then the invited user sets a
 * password. The page is listed as public in proxy.ts so the fragment is not
 * lost in a server redirect.
 */
export function AcceptInviteForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session?.user) {
        setEmail(data.session.user.email ?? null);
        setReady(true);
      } else {
        // The fragment may still be processing; listen once more.
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setEmail(session.user.email ?? null);
            setReady(true);
          }
        });
        setTimeout(() => {
          if (!cancelled) setReady(true);
        }, 2500);
        return () => sub.subscription.unsubscribe();
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 12) {
      setError("Use at least 12 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setPending(false);
      setError(updateError.message);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[26rem] flex-col justify-center px-5 py-12">
      <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-blue">Invitation</p>
      <h1 className="mt-3 font-display text-[2rem] font-medium leading-tight tracking-[-0.02em] text-navy">
        Set your password
      </h1>
      <p className="mt-2 text-[0.88rem] leading-relaxed text-charcoal/75">
        {email
          ? `Choose a password for ${email}. You will use it to sign in from now on.`
          : "Open this page from the invitation email so we can verify the link."}
      </p>

      {error ? (
        <p role="alert" className="mt-5 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.84rem] text-coral-ink">
          {error}
        </p>
      ) : null}

      {ready && !email ? (
        <p role="alert" className="mt-5 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.84rem] text-coral-ink">
          This invitation link is invalid or has expired. Ask a super admin to send a new one.
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="admin-label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            disabled={!email || pending}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            disabled={!email || pending}
            className="admin-input"
          />
        </div>
        <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={!email || pending}>
          {pending ? "Saving…" : "Set password and sign in"}
        </button>
      </form>

      <p className="mt-6 text-[0.78rem] text-charcoal/70">
        <Link href="/admin/login" className="underline underline-offset-4 hover:text-navy">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
