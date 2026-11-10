import Link from "next/link";
import type { CoreServiceGap } from "@/lib/content/core-services";
import { serviceBySlug } from "@/lib/content/services";

const reasons: Record<CoreServiceGap["problem"], string> = {
  missing: "not in the database",
  draft: "saved as a draft",
  archived: "archived",
  scheduled: "dated for a later publish time",
};

/**
 * Says so when one of the six core services is hidden from visitors. Renders nothing when
 * all six are live. The wording is fixed: it never repeats a database message.
 */
export function CoreServiceNotice({ gaps }: { gaps: CoreServiceGap[] }) {
  if (!gaps.length) return null;
  const anyMissing = gaps.some((gap) => gap.problem === "missing");
  const anyHidden = gaps.some((gap) => gap.problem !== "missing");

  return (
    <section
      aria-labelledby="core-service-notice"
      className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] leading-relaxed text-coral-ink"
    >
      <h2 id="core-service-notice" className="font-heading text-[0.9rem]">
        {gaps.length === 1
          ? "One core service is not showing on the website"
          : `${gaps.length} core services are not showing on the website`}
      </h2>
      <p className="mt-1">
        The home page and the Services page list six core services. Visitors only see a service that is in
        the database and published, so these are hidden and their own pages say &ldquo;not found&rdquo;:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {gaps.map((gap) => {
          const name = serviceBySlug(gap.slug)?.name ?? gap.slug;
          return (
            <li key={gap.slug}>
              {gap.id ? (
                <Link href={`/admin/services/${gap.id}`} className="underline underline-offset-4">
                  {name}
                </Link>
              ) : (
                <strong className="font-medium">{name}</strong>
              )}{" "}
              <span className="font-mono text-[0.76rem]">{gap.slug}</span>: {reasons[gap.problem]}
            </li>
          );
        })}
      </ul>
      {anyHidden ? <p className="mt-2">To show a service that exists but is hidden, open it and set Status to Published.</p> : null}
      {anyMissing ? (
        <p className="mt-2">
          A service that is not in the database was never added to this project. For AI Automations and
          Application Development, run{" "}
          <code className="rounded bg-navy/5 px-1.5 py-0.5">supabase/apply/04-core-services.sql</code> once in
          the Supabase SQL editor and reload this page. For any other, use New practice and give it the slug
          shown.
        </p>
      ) : null}
    </section>
  );
}
