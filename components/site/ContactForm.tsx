"use client";

import Link from "next/link";
import { useState } from "react";
import { services } from "@/lib/content/services";
import { cybersecuritySubservices } from "@/lib/content/cybersecurity-subservices";
import { cloudSubservices } from "@/lib/content/cloud-subservices";
import { aiAutomationSubservices, applicationDevelopmentSubservices } from "@/lib/content/product-subservices";
import { coreServiceSlugs, infrastructureSubserviceSlugs } from "@/lib/content/service-taxonomy";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "mt-2 w-full border-0 border-b border-navy/20 bg-transparent px-0 py-3 text-[0.92rem] text-charcoal placeholder:text-charcoal/35 focus:border-blue focus:outline-none";

const labelClass = "font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75";
const servicesBySlug = new Map(services.map((service) => [service.slug, service]));
const serviceForSlug = (slug: string) => servicesBySlug.get(slug);
const standaloneCoreServiceSlugs = coreServiceSlugs.filter(
  (slug) => slug !== "it-infrastructure" && slug !== "cybersecurity",
);

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const consent = data.get("consent");
    const nextErrors: Record<string, string> = {};

    if (name.length < 2) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) nextErrors.email = "Please enter a valid email address.";
    if (message.length < 20) nextErrors.message = "Please add a little more detail (at least 20 characters).";
    if (!consent) nextErrors.consent = "Please confirm you understand how your details are used.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          organisation: String(data.get("organisation") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim(),
          interest: String(data.get("interest") ?? ""),
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
      setStatus("error");
      setError("We could not submit your enquiry. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-blue/25 bg-ivory p-8">
        <p className="eyebrow text-blue">Received</p>
        <h2 className="mt-4 font-display text-[1.7rem] font-medium tracking-[-0.02em] text-navy">
          Thank you — your request is with us.
        </h2>
        <p className="mt-4 text-[0.94rem] leading-relaxed text-charcoal/75">
          We will reply using the email address you provided, normally within one business day. If the
          matter is urgent, submit an update through the contact form with the impact and timing.
        </p>
        <Link href="/" className="btn-outline mt-7 text-sm">
          Back to the homepage
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name <span className="text-coral-ink">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
          />
          {errors.name ? (
            <p id="name-error" className="mt-1.5 text-[0.78rem] text-coral-ink">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="organisation" className={labelClass}>
            Organisation
          </label>
          <input id="organisation" name="organisation" type="text" autoComplete="organization" className={inputClass} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Work email <span className="text-coral-ink">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
          />
          {errors.email ? (
            <p id="email-error" className="mt-1.5 text-[0.78rem] text-coral-ink">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="interest" className={labelClass}>
          What is this about?
        </label>
        <select id="interest" name="interest" className={inputClass} defaultValue="">
          <option value="">General enquiry</option>
          <optgroup label="IT Infrastructure core service">
            {serviceForSlug("it-infrastructure") ? (
              <option value={serviceForSlug("it-infrastructure")!.name}>IT Infrastructure</option>
            ) : null}
          </optgroup>
          <optgroup label="IT Infrastructure sub-services">
            {infrastructureSubserviceSlugs.map((slug) => {
              const service = serviceForSlug(slug);
              return service ? (
                <option key={slug} value={service.name}>
                  {service.name}
                </option>
              ) : null;
            })}
          </optgroup>
          <optgroup label="Cybersecurity core service">
            {serviceForSlug("cybersecurity") ? (
              <option value={serviceForSlug("cybersecurity")!.name}>Cybersecurity</option>
            ) : null}
          </optgroup>
          <optgroup label="Cybersecurity sub-services">
            {cybersecuritySubservices.map((service) => (
              <option key={service.slug} value={service.name}>{service.name}</option>
            ))}
          </optgroup>
          <optgroup label="Cloud & Datacenter sub-services">
            {cloudSubservices.map((service) => (
              <option key={service.slug} value={service.name}>{service.name}</option>
            ))}
          </optgroup>
          <optgroup label="AI Automation sub-services">
            {aiAutomationSubservices.map((service) => (
              <option key={service.slug} value={service.name}>{service.name}</option>
            ))}
          </optgroup>
          <optgroup label="Application Development sub-services">
            {applicationDevelopmentSubservices.map((service) => (
              <option key={service.slug} value={service.name}>{service.name}</option>
            ))}
          </optgroup>
          <optgroup label="Other core services">
            {standaloneCoreServiceSlugs.map((slug) => {
              const service = serviceForSlug(slug);
              return service ? (
                <option key={slug} value={service.name}>
                  {service.name}
                </option>
              ) : null;
            })}
          </optgroup>
          <option value="Careers">Careers</option>
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="message" className={labelClass}>
          What are you running, and what needs to change? <span className="text-coral-ink">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${inputClass} resize-y`}
          placeholder="A short description of the estate, the problem and any deadline."
        />
        {errors.message ? (
          <p id="message-error" className="mt-1.5 text-[0.78rem] text-coral-ink">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 flex items-start gap-3">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          className="mt-1 h-4 w-4 shrink-0 rounded border-navy/25 accent-blue"
        />
        <label htmlFor="consent" className="text-[0.82rem] leading-relaxed text-charcoal/70">
          I understand that my details will be used to respond to this enquiry, as described in the{" "}
          <Link href="/legal/privacy-policy" className="text-blue underline decoration-blue/30 underline-offset-4">
            privacy policy
          </Link>
          . <span className="text-coral-ink">*</span>
        </label>
      </div>
      {errors.consent ? (
        <p id="consent-error" className="mt-1.5 text-[0.78rem] text-coral-ink">
          {errors.consent}
        </p>
      ) : null}

      {status === "error" ? (
        <p role="alert" className="mt-5 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-[0.84rem] leading-relaxed text-charcoal/80">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-solid mt-7 w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
        {status !== "submitting" ? <span aria-hidden="true">→</span> : null}
      </button>

      <p className="mt-4 text-[0.76rem] leading-relaxed text-charcoal/75">
        We use these details only to respond to your enquiry. No marketing list, no third-party sale.
      </p>
    </form>
  );
}
