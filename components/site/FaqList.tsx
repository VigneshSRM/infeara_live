import type { Faq } from "@/lib/content/types";

export function FaqList({ items, idPrefix = "faq" }: { items: Faq[]; idPrefix?: string }) {
  return (
    <div className="divide-y divide-navy/10 border-y border-navy/10">
      {items.map((item, index) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
            <h3 className="font-heading text-[1rem] font-medium leading-snug text-navy">
              {item.question}
            </h3>
            <span
              aria-hidden="true"
              className="mt-0.5 shrink-0 font-display text-lg leading-none text-blue transition-transform duration-300 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p id={`${idPrefix}-${index}`} className="mt-3 max-w-[46rem] text-[0.94rem] leading-relaxed text-charcoal/75">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export function faqSchema(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
