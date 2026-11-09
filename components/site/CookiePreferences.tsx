"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "infeara-consent";

export function CookiePreferences() {
  const [decision, setDecision] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDecision(window.localStorage.getItem(STORAGE_KEY));
    setReady(true);
  }, []);

  function reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("infeara-consent-change"));
    setDecision(null);
  }

  if (!ready) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-navy/15 bg-ivory p-6">
      <p className="font-heading text-[10px] uppercase tracking-[0.18em] text-charcoal/75">Your current choice</p>
      <p className="mt-2 text-[0.95rem] font-medium text-navy">
        {decision === "granted"
          ? "Analytics allowed"
          : decision === "essential"
            ? "Essential only"
            : "No choice recorded yet"}
      </p>
      <p className="mt-2 text-[0.85rem] leading-relaxed text-charcoal/70">
        {decision === "granted"
          ? "Google Analytics is loaded on page views. You can withdraw this at any time."
          : decision === "essential"
            ? "Analytics is not loaded. Only your consent choice is stored locally."
            : "Analytics is not loaded until you choose. The banner will ask on your next visit."}
      </p>
      <button type="button" onClick={reset} className="btn-outline mt-5 text-sm">
        {decision ? "Change my choice" : "Show the consent banner"}
      </button>
    </div>
  );
}
