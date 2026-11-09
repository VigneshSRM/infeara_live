"use client";

import Link from "next/link";
import { useState } from "react";
import { openRoles } from "@/lib/content/careers";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "mt-2 w-full border-0 border-b border-navy/20 bg-transparent px-0 py-3 text-[0.92rem] text-charcoal placeholder:text-charcoal/35 focus:border-blue focus:outline-none";

const labelClass = "font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75";

export function ApplicationForm({ defaultRole }: { defaultRole?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role") ?? "").trim();
    const link = String(data.get("link") ?? "").trim();
    const note = String(data.get("message") ?? "").trim();
    const consent = data.get("consent");
    const nextErrors: Record<string, string> = {};

    if (name.length < 2) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) nextErrors.email = "Please enter a valid email address.";
    if (note.length < 20) nextErrors.message = "Please add a little more detail (at least 20 characters).";
    if (!consent) nextErrors.consent = "Please confirm you understand how your details are used.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setError("");

    const message = link ? `${note}\n\nCV or portfolio: ${link}` : note;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          organisation: "",
          phone: String(data.get("phone") ?? "").trim(),
          interest: role ? `Careers — ${role}` : "Careers",
          message,
          consent: Boolean(consent),
          website: String(data.get("website") ?? ""),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "unavailable");
      }

      setStatus("success");
      form.reset();
    } catch {
      setError("We could not submit your application. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-blue/25 bg-white p-8">
        <p className="eyebrow text-blue">Application received</p>
        <h2 className="mt-4 font-display text-[1.7rem] font-medium tracking-[-0.02em] text-navy">
          Thank you — we have your details.
        </h2>
        <p className="mt-4 text-[0.94rem] leading-relaxed text-charcoal/75">
          A person reads every application, not a filter. If your experience matches an open role or a
          discipline we hire into, we will write back to the address you gave us.
        </p>
        <Link href="/careers" className="btn-outline mt-7 text-sm">
          Back to careers
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-7 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="app-name" className={labelClass}>
            Name <span className="text-coral-ink">*</span>
          </label>
          <input
            id="app-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "app-name-error" : undefined}
            className={inputClass}
          />
          {errors.name ? (
            <p id="app-name-error" className="mt-1.5 text-[0.78rem] text-coral-ink">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="app-email" className={labelClass}>
            Email <span className="text-coral-ink">*</span>
          </label>
          <input
            id="app-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "app-email-error" : undefined}
            className={inputClass}
          />
          {errors.email ? (
            <p id="app-email-error" className="mt-1.5 text-[0.78rem] text-coral-ink">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="app-phone" className={labelClass}>
            Phone
          </label>
          <input id="app-phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </div>

        <div>
          <label htmlFor="app-role" className={labelClass}>
            Role
          </label>
          <select id="app-role" name="role" defaultValue={defaultRole ?? ""} className={inputClass}>
            <option value="">Speculative application</option>
            {openRoles.map((role) => (
              <option key={role.slug} value={role.title}>
                {role.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="app-link" className={labelClass}>
          CV or portfolio link
        </label>
        <input
          id="app-link"
          name="link"
          type="url"
          inputMode="url"
          placeholder="https://"
          className={inputClass}
        />
        <p className="mt-1.5 text-[0.76rem] text-charcoal/60">
          A hosted CV, LinkedIn or portfolio page. We do not accept attachments through this form.
        </p>
      </div>

      <div className="mt-5">
        <label htmlFor="app-message" className={labelClass}>
          What have you operated, and what did you change? <span className="text-coral-ink">*</span>
        </label>
        <textarea
          id="app-message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "app-message-error" : undefined}
          className={`${inputClass} resize-y`}
          placeholder="The environment, your role in it, and one thing you fixed that stayed fixed."
        />
        {errors.message ? (
          <p id="app-message-error" className="mt-1.5 text-[0.78rem] text-coral-ink">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="app-website">Website</label>
        <input id="app-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 flex items-start gap-3">
        <input
          id="app-consent"
          name="consent"
          type="checkbox"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? "app-consent-error" : undefined}
          className="mt-1 h-4 w-4 shrink-0 rounded border-navy/25 accent-blue"
        />
        <label htmlFor="app-consent" className="text-[0.82rem] leading-relaxed text-charcoal/70">
          I understand that my details will be kept to assess this application, as described in the{" "}
          <Link href="/legal/privacy-policy" className="text-blue underline decoration-blue/30 underline-offset-4">
            privacy policy
          </Link>
          . <span className="text-coral-ink">*</span>
        </label>
      </div>
      {errors.consent ? (
        <p id="app-consent-error" className="mt-1.5 text-[0.78rem] text-coral-ink">
          {errors.consent}
        </p>
      ) : null}

      {status === "error" ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-[0.84rem] leading-relaxed text-charcoal/80"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-solid mt-7 w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send application"}
        {status !== "submitting" ? <span aria-hidden="true">→</span> : null}
      </button>

      <p className="mt-4 text-[0.76rem] leading-relaxed text-charcoal/75">
        Applications are read by the engineering team. We do not keep them on file beyond the process.
      </p>
    </form>
  );
}
