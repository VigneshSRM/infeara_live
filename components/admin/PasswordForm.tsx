"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function PasswordForm() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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

    setStatus("saving");
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setStatus("idle");
      setError(updateError.message);
      return;
    }

    formElement.reset();
    setStatus("saved");
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      {error ? (
        <p role="alert" className="rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.84rem] text-coral-ink">
          {error}
        </p>
      ) : null}

      {status === "saved" ? (
        <p role="status" className="rounded-md border border-blue/25 bg-blue/8 px-4 py-3 text-[0.84rem] text-blue">
          Password changed. Use it the next time you sign in.
        </p>
      ) : null}

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
          className="admin-input"
        />
      </div>
      <div>
        <label className="admin-label" htmlFor="confirm">
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="admin-input"
        />
      </div>
      <button type="submit" className="admin-btn admin-btn-primary" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
