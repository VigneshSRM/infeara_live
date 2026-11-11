"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/lib/admin/auth-actions";
import type { StaffUser } from "@/lib/auth/dal";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/subservices", label: "Sub-services" },
  { href: "/admin/industries", label: "Industries" },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/case-studies", label: "Case studies" },
  { href: "/admin/white-papers", label: "White papers" },
  { href: "/admin/legal", label: "Legal" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/audit", label: "Audit log" },
  { href: "/admin/users", label: "Users", superOnly: true },
];

const roleLabel = {
  super_admin: "Super admin",
  editor: "Editor",
  seo_manager: "SEO manager",
} as const;

export function AdminNav({ user }: { user: StaffUser }) {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col border-b border-navy/10 bg-navy text-ivory lg:min-h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="px-5 py-5 lg:py-7">
        <Link href="/admin" aria-label="Infeara CMS overview" className="inline-flex">
          <Logo variant="light" className="h-7" sizes="200px" />
        </Link>
        <p className="mt-2 font-heading text-[9px] uppercase tracking-[0.2em] text-ivory/60">
          Content operations
        </p>
      </div>

      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
        {items
          .filter((item) => !item.superOnly || user.role === "super_admin")
          .map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-md px-3 py-2 font-heading text-[0.82rem] transition-colors ${
                  active ? "bg-ivory/12 text-ivory" : "text-ivory/70 hover:bg-ivory/6 hover:text-ivory"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto border-t border-ivory/12 px-5 py-4">
        <p className="truncate font-heading text-[0.82rem] text-ivory">{user.name ?? user.email}</p>
        <p className="mt-0.5 text-[0.7rem] text-ivory/60">{roleLabel[user.role]}</p>
        <div className="mt-3 flex items-center gap-4">
          <Link
            href="/admin/account"
            className="font-heading text-[0.72rem] uppercase tracking-[0.14em] text-ivory/60 underline underline-offset-4 hover:text-ivory"
          >
            Account
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="font-heading text-[0.72rem] uppercase tracking-[0.14em] text-ivory/60 underline underline-offset-4 hover:text-ivory"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
