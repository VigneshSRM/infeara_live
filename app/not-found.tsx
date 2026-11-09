import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const links = [
  { label: "Services", href: "/services", description: "Managed IT, security, infrastructure, cloud and more." },
  { label: "Technical resources", href: "/insights", description: "Practical guides for operating business IT." },
  { label: "Contact", href: "/contact", description: "Tell us what you are running and what needs to change." },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero-surface">

          <div className="shell relative z-10 flex min-h-[70svh] flex-col justify-center py-24">
            <p className="eyebrow text-ivory/80">404</p>
            <h1 className="mt-4 max-w-[20ch] font-display text-[clamp(2.2rem,4.4vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.03em] text-ivory">
              That page is not on the map.
            </h1>
            <p className="mt-6 max-w-[38rem] text-[1rem] leading-relaxed text-ivory/68">
              The address may have changed when this site was rebuilt. The pages below are the usual
              routes back into the site.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-ivory/15 p-5 transition-colors hover:border-coral/60 hover:bg-ivory/5"
                >
                  <p className="font-heading text-[0.95rem] font-medium text-ivory">{item.label}</p>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-ivory/70">{item.description}</p>
                  <span
                    aria-hidden="true"
                    className="mt-4 inline-block text-coral transition-colors duration-100 group-hover:text-coral"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>

            <Link href="/" className="btn-primary mt-10 w-fit text-sm">
              Back to the homepage
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
