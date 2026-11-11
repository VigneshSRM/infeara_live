import Link from "next/link";
import { serviceLinkLabel } from "@/lib/content/case-studies";

/** The services a case study touched, as small links. The caller passes only slugs that exist. */
export function CaseStudyServiceLinks({ slugs }: { slugs: string[] }) {
  if (slugs.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {slugs.map((slug) => (
        <Link
          key={slug}
          href={`/services/${slug}`}
          className="rounded-sm border border-navy/15 px-4 py-1.5 font-heading text-[0.76rem] text-navy transition-colors hover:border-blue/50 hover:text-blue"
        >
          {serviceLinkLabel(slug)}
        </Link>
      ))}
    </div>
  );
}
