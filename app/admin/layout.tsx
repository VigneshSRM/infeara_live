import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Infeara CMS", template: "%s · Infeara CMS" },
  description: "Content operations for www.infeara.com",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-ivory text-charcoal">{children}</div>;
}
