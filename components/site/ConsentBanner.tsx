"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "infeara-consent";
const EVENT = "infeara-consent-change";

type Decision = "granted" | "essential" | null;

export function ConsentBanner() {
  const pathname = usePathname();
  const [decision, setDecision] = useState<Decision>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "granted" || stored === "essential") setDecision(stored);
    setReady(true);
  }, []);

  function choose(next: Exclude<Decision, null>) {
    window.localStorage.setItem(STORAGE_KEY, next);
    setDecision(next);
    window.dispatchEvent(new Event(EVENT));
  }

  // The CMS is staff-only and loads no analytics, so consent does not apply.
  if (pathname.startsWith("/admin")) return null;
  if (!ready || decision) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory/10 bg-navy/97 px-4 py-5 md:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[46rem]">
          <h2 id="consent-title" className="font-heading text-sm font-semibold text-ivory">
            Analytics cookies are optional
          </h2>
          <p id="consent-description" className="mt-2 text-[0.82rem] leading-relaxed text-ivory/65">
            The site works without them. If you allow analytics, we use Google Analytics to understand
            which pages are useful. Nothing is loaded before you choose. Read the{" "}
            <Link href="/legal/cookies" className="underline decoration-ivory/30 underline-offset-4 hover:text-ivory">
              cookie policy
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="rounded-full border border-ivory/30 px-5 py-2.5 font-heading text-[0.82rem] text-ivory transition-colors hover:bg-ivory/10"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-full bg-coral px-5 py-2.5 font-heading text-[0.82rem] font-semibold text-navy transition-colors hover:bg-[color-mix(in_oklab,var(--color-coral)_88%,white)]"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </div>
  );
}
