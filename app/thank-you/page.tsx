import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Thank you",
  description: "Your enquiry has been received by Infeara Technologies.",
  path: "/thank-you",
  noIndex: true,
});

export default function ThankYouPage() {
  return (
    <PageFrame>
      <section className="bg-ivory py-28 md:py-36">
        <div className="shell max-w-[44rem]">
          <p className="eyebrow text-blue">Received</p>
          <h1 className="mt-4 font-display text-[clamp(2.1rem,4vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-navy">
            Thank you — your request is with us.
          </h1>
          <p className="mt-6 text-[1rem] leading-relaxed text-charcoal/75">
            We will reply using the email address you provided, normally within one business day. If the
            matter is urgent, submit an update through the contact form with the impact and timing.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className="btn-solid text-sm">
              Back to the homepage
            </Link>
            <Link href="/contact" className="btn-outline text-sm">
              Contact form
            </Link>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
