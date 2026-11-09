import type { Checklist } from "@/lib/analytics/ga4";
import type { Problem } from "@/lib/analytics/ga4-core";

/**
 * What staff see until the Overview is connected to Google Analytics, or when
 * Google refuses a request. Everything shown is either fixed wording or a value
 * that is safe to show: the public tracking id and the service account's address
 * (which is exactly what has to be pasted into Google Analytics). No secret and no
 * text from Google's own error messages ever reaches this component.
 */

type Item = { ok: boolean; title: string; detail: string };

function itemsFor(checklist: Checklist): Item[] {
  const tracking: Item = checklist.trackingId
    ? {
        ok: true,
        title: `Tracking is built into the website (${checklist.trackingId})`,
        detail:
          "Visitors who press “Allow analytics” are sent to Google. This id is read when the site is built, so changing it needs a new deployment.",
      }
    : {
        ok: false,
        title: "Tracking id missing from this build",
        detail:
          "Add NEXT_PUBLIC_GA4_ID (the G-… Measurement ID) in Vercel for Production, then redeploy. Without it nothing is sent to Google.",
      };

  const property: Item =
    checklist.propertyId === "ok"
      ? { ok: true, title: "Property ID is set (GA4_PROPERTY_ID)", detail: "The numeric id of the property to report on." }
      : checklist.propertyId === "measurement_id"
        ? {
            ok: false,
            title: "GA4_PROPERTY_ID holds the G-… tracking id",
            detail:
              "Reports need the other number: Google Analytics › Admin › Property details › Property ID. It is digits only, for example 412345678.",
          }
        : checklist.propertyId === "invalid"
          ? {
              ok: false,
              title: "GA4_PROPERTY_ID is not a number",
              detail: "Use only the digits from Google Analytics › Admin › Property details › Property ID.",
            }
          : {
              ok: false,
              title: "GA4_PROPERTY_ID is not set",
              detail: "Add the numeric Property ID from Google Analytics › Admin › Property details.",
            };

  const keyDetail: Record<Exclude<Checklist["key"], "ok" | "missing">, string> = {
    invalid_json: "The value is not valid JSON. Paste the whole contents of the downloaded key file, braces included.",
    wrong_type: "This is not a service account key. In Google Cloud, create a key of type JSON on a service account.",
    missing_fields: "The JSON is missing client_email or private_key. Download a fresh key and paste the whole file.",
  };
  const key: Item =
    checklist.key === "ok"
      ? {
          ok: true,
          title: "Service account key is set (GA4_SERVICE_ACCOUNT_JSON)",
          detail: checklist.serviceEmail
            ? `Signed in to Google as ${checklist.serviceEmail}. That address must be a Viewer on the property.`
            : "The key file was read.",
        }
      : checklist.key === "missing"
        ? {
            ok: false,
            title: "GA4_SERVICE_ACCOUNT_JSON is not set",
            detail: "Paste the contents of a service account JSON key. Mark it Sensitive in Vercel.",
          }
        : { ok: false, title: "GA4_SERVICE_ACCOUNT_JSON cannot be read", detail: keyDetail[checklist.key] };

  return [tracking, property, key];
}

function Checks({ checklist }: { checklist: Checklist }) {
  return (
    <ul className="space-y-2.5">
      {itemsFor(checklist).map((item) => (
        <li key={item.title} className="flex gap-3">
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[0.65rem] font-bold ${
              item.ok ? "bg-blue text-ivory" : "border border-coral bg-coral/15 text-coral-ink"
            }`}
          >
            {item.ok ? (
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M2 6.4 4.8 9 10 3.2" />
              </svg>
            ) : (
              "!"
            )}
          </span>
          <div className="min-w-0">
            <p className="font-heading text-[0.84rem] text-navy">
              {item.title}
              <span className="sr-only">{item.ok ? " — done" : " — needs attention"}</span>
            </p>
            <p className="mt-0.5 text-[0.78rem] leading-relaxed text-charcoal/70">{item.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const code = "rounded bg-navy/5 px-1.5 py-0.5 text-[0.78rem]";

export function AnalyticsSetup({ checklist }: { checklist: Checklist }) {
  return (
    <div className="admin-card p-5">
      <p className="font-heading text-[0.95rem] text-navy">Connect Google Analytics to see visitor numbers here</p>
      <p className="mt-1 max-w-[46rem] text-[0.84rem] leading-relaxed text-charcoal/75">
        The website already reports to Google Analytics. To read those numbers back into this page, the CMS needs
        read-only access to the property. It is a one-time setup and no fake numbers are shown until it is done.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-heading text-[0.68rem] uppercase tracking-[0.16em] text-charcoal/65">Where things stand</h3>
          <div className="mt-3">
            <Checks checklist={checklist} />
          </div>
        </div>

        <div>
          <h3 className="font-heading text-[0.68rem] uppercase tracking-[0.16em] text-charcoal/65">How to finish</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[0.82rem] leading-relaxed text-charcoal/80">
            <li>
              In <strong>Google Cloud</strong> › APIs &amp; Services › Library, enable{" "}
              <strong>Google Analytics Data API</strong>.
            </li>
            <li>
              In IAM &amp; Admin › <strong>Service accounts</strong>, create one (no roles needed), then Keys › Add key ›{" "}
              <strong>JSON</strong>. Copy the account’s email address.
            </li>
            <li>
              In <strong>Google Analytics</strong> › Admin › Property access management, add that email as a{" "}
              <strong>Viewer</strong>.
            </li>
            <li>
              In Admin › Property details, copy the numeric <strong>Property ID</strong>.
            </li>
            <li>
              In <strong>Vercel</strong> › Settings › Environment Variables, add <code className={code}>GA4_PROPERTY_ID</code>{" "}
              (the number) and <code className={code}>GA4_SERVICE_ACCOUNT_JSON</code> (the whole key file, Sensitive), then
              redeploy.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsProblem({ problem, checklist }: { problem: Problem; checklist: Checklist }) {
  return (
    <div role="alert" className="admin-card border-coral/50 p-5">
      <p className="font-heading text-[0.95rem] text-navy">{problem.title}</p>
      <p className="mt-1 max-w-[46rem] text-[0.84rem] leading-relaxed text-charcoal/80">{problem.detail}</p>
      <p className="mt-2 text-[0.74rem] text-charcoal/55">
        Reference: <span className="tabular-nums">{problem.reference}</span>
      </p>
      <div className="mt-5 border-t border-navy/10 pt-4">
        <Checks checklist={checklist} />
      </div>
    </div>
  );
}
