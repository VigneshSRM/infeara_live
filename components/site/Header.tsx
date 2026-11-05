import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const links = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="shell flex items-center justify-between py-6">
        <Link href="/" aria-label="Infeara Technologies home" className="shrink-0">
          <Logo variant="light" priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-heading text-sm text-ivory/80 transition-colors hover:text-ivory"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/contact" className="btn-primary text-sm">
          Talk to an expert
        </Link>
      </div>
    </header>
  );
}
