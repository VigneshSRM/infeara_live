import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireStaff } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireStaff();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav user={user} />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto w-full max-w-[74rem]">{children}</div>
      </main>
    </div>
  );
}
