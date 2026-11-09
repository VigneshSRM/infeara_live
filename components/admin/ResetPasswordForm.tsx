"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const MIN_LENGTH = 12;

const LINK_FAILED =
  "This reset link is invalid or has expired, or it was opened in a different browser from the one that requested it. Request a new link below.";
const SESSION_EXPIRED = "Your reset session has expired. Request a new link below.";
const SEND_FAILED =
  "We could not send the email. Try again in a few minutes, or ask a super admin to reset your password.";
const TOO_MANY_REQUESTS = "Too many requests. Wait a minute, then try again.";

// Supabase error codes meaning the reset session itself is gone, as opposed to
// the new password being unacceptable.
const SESSION_GONE = new Set([
  "session_not_found",
  "session_expired",
  "bad_jwt",
  "refresh_token_not_found",
  "refresh_token_already_used",
]);

type Step = "checking" | "request" | "sent" | "update" | "done";

type LinkOutcome =
  | { kind: "none" } // opened directly, not from an email
  | { kind: "ready"; email: string | null } // the link produced a session
  | { kind: "failed" }; // a link, but Supabase would not accept it

/**
 * Turns the reset link the visitor arrived with into a session.
 *
 * Supabase can send the link back in three shapes:
 *
 *   ?code=…                        Default email template. The browser client
 *                                  exchanges it as soon as it is created, but
 *                                  only in the browser that requested the reset
 *                                  (the PKCE verifier lives in a cookie there).
 *   #token_hash=…&type=recovery    Custom template (see the README). Verified
 *                                  here, and works on any device.
 *   ?error=… / #error=…            Supabase rejected the link (expired or used).
 */
async function consumeResetLink(): Promise<LinkOutcome> {
  try {
    const url = new URL(window.location.href);
    const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
    const read = (name: string) => url.searchParams.get(name) ?? fragment.get(name);

    const tokenHash = read("token_hash");
    const hasCode = url.searchParams.has("code");
    const rejected = Boolean(read("error") || read("error_code") || read("error_description"));

    if (!tokenHash && !hasCode && !rejected) return { kind: "none" };
    if (rejected) return { kind: "failed" };

    // Creating the client is what triggers the ?code= exchange, so it waits
    // until we know there is a link to handle.
    const supabase = createClient();

    if (tokenHash) {
      // Only a recovery token belongs on this page; leave any other kind unused.
      if (read("type") !== "recovery") return { kind: "failed" };

      const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
      // The token is single use. Take it out of the address bar and history.
      window.history.replaceState(window.history.state, "", url.pathname);
      if (error) return { kind: "failed" };
    }

    // Resolves after the client has finished reading the URL.
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    return user ? { kind: "ready", email: user.email ?? null } : { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}

/**
 * The one password-reset page, because the emailed link lands back on it.
 *
 *   request  Enter an email address; Supabase mails a link to this page.
 *   update   Arrived from that link; choose a new password.
 *
 * It is listed as public in proxy.ts: the visitor has no session yet.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const link = useRef<Promise<LinkOutcome> | null>(null);

  const [step, setStep] = useState<Step>(isSupabaseConfigured ? "checking" : "request");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    // A reset token works once. React Strict Mode runs this effect twice in
    // development, so the second run has to reuse the first run's result.
    link.current ??= consumeResetLink();
    void link.current.then((outcome) => {
      if (!active) return;
      if (outcome.kind === "ready") {
        setEmail(outcome.email);
        setStep("update");
        return;
      }
      if (outcome.kind === "failed") setError(LINK_FAILED);
      setStep("request");
    });

    return () => {
      active = false;
    };
  }, []);

  async function requestLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!address) {
      setError("Enter the email address for your account.");
      return;
    }

    setPending(true);
    setError(null);

    const { error: requestError } = await createClient().auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setPending(false);

    if (requestError) {
      setError(requestError.status === 429 ? TOO_MANY_REQUESTS : SEND_FAILED);
      return;
    }

    // Supabase answers the same way whether or not the address has an account,
    // and so does this page.
    setEmail(address);
    setStep("sent");
  }

  async function saveNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
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
      if (
        updateError.name === "AuthSessionMissingError" ||
        updateError.status === 401 ||
        SESSION_GONE.has(updateError.code ?? "")
      ) {
        // The reset session ended while the form was open.
        setError(SESSION_EXPIRED);
        setStep("request");
      } else {
        setError(updateError.message);
      }
      return;
    }

    // Someone who knew the old password should not stay signed in elsewhere.
    // Best effort: the password has already been changed.
    try {
      await supabase.auth.signOut({ scope: "others" });
    } catch {
      // Nothing more to do.
    }

    setStep("done");
    router.replace("/admin");
    router.refresh();
  }

  const heading = {
    checking: "Reset your password",
    request: "Reset your password",
    sent: "Check your email",
    update: "Choose a new password",
    done: "Password updated",
  }[step];

  const description = {
    checking: null,
    request: "Enter the email address for your CMS account and we will email you a link to choose a new password.",
    sent: `If a CMS account exists for ${email}, we have sent it a link to choose a new password. It can take a few minutes to arrive. Check your spam folder, or ask a super admin for help.`,
    update: `${
      email ? `Choose a new password for ${email}.` : "Choose a new password."
    } You will use it to sign in from now on, and any other device signed in to the CMS will be signed out.`,
    done: "Signing you in…",
  }[step];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[26rem] flex-col justify-center px-5 py-12">
      <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-blue">Password reset</p>
      <h1 className="mt-3 font-display text-[2rem] font-medium leading-tight tracking-[-0.02em] text-navy">
        {heading}
      </h1>
      {description ? (
        <p role={step === "sent" ? "status" : undefined} className="mt-2 text-[0.88rem] leading-relaxed text-charcoal/75">
          {description}
        </p>
      ) : null}

      {!isSupabaseConfigured ? <Alert>Supabase is not configured for this environment.</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}

      <div aria-busy={step === "checking"}>
        {step === "request" ? (
          <form onSubmit={requestLink} className="mt-6 space-y-4">
            <div>
              <label className="admin-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                defaultValue={email ?? ""}
                required
                disabled={!isSupabaseConfigured || pending}
                className="admin-input"
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary w-full"
              disabled={!isSupabaseConfigured || pending}
            >
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : null}

        {step === "sent" ? (
          <button
            type="button"
            className="admin-btn admin-btn-ghost mt-6 w-full"
            onClick={() => {
              setError(null);
              setStep("request");
            }}
          >
            Use a different email
          </button>
        ) : null}

        {step === "update" ? (
          <form onSubmit={saveNewPassword} className="mt-6 space-y-4">
            <div>
              <label className="admin-label" htmlFor="password">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={MIN_LENGTH}
                required
                autoFocus
                disabled={pending}
                aria-describedby="password-hint"
                className="admin-input"
              />
              <p id="password-hint" className="mt-1.5 text-[0.76rem] text-charcoal/65">
                At least {MIN_LENGTH} characters.
              </p>
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
                minLength={MIN_LENGTH}
                required
                disabled={pending}
                className="admin-input"
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={pending}>
              {pending ? "Saving…" : "Set password and sign in"}
            </button>
          </form>
        ) : null}
      </div>

      <p className="mt-6 text-[0.78rem] text-charcoal/70">
        <Link href="/admin/login" className="underline underline-offset-4 hover:text-navy">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-5 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.84rem] text-coral-ink">
      {children}
    </p>
  );
}
