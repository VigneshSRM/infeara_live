import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { PageHeader } from "@/components/admin/PageHeader";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
];

type Row = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  topic: string | null;
  message: string;
  status: "new" | "contacted" | "qualified" | "closed" | "spam";
  created_at: string;
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; deleted?: string; error?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;
  const filter = FILTERS.some((item) => item.value && item.value === params.status)
    ? (params.status as string)
    : "";

  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select("id,name,email,company,topic,message,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter) query = query.eq("status", filter);

  const { data, error } = await query;
  if (isMissingSchema(error)) return <SchemaNotice table="leads" />;

  const rows = (data ?? []) as Row[];

  return (
    <>
      <PageHeader
        eyebrow="Demand"
        title="Leads"
        description="Enquiries from the contact form. Status and notes are internal; nothing here is published."
      />

      <Flash deleted={params.deleted} error={params.error} />

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink">
          {error.message}
        </p>
      ) : null}

      <nav aria-label="Filter by status" className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Link
            key={item.value || "all"}
            href={item.value ? `/admin/leads?status=${item.value}` : "/admin/leads"}
            aria-current={filter === item.value ? "page" : undefined}
            className={`rounded-full border px-3 py-1 font-heading text-[0.74rem] transition-colors ${
              filter === item.value
                ? "border-navy bg-navy text-ivory"
                : "border-navy/15 text-charcoal/75 hover:border-navy/35 hover:text-navy"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="admin-card mt-4 overflow-hidden">
        {rows.length ? (
          <table className="w-full text-left text-[0.86rem]">
            <thead className="border-b border-navy/10 bg-ivory/50">
              <tr className="font-heading text-[0.68rem] uppercase tracking-[0.14em] text-charcoal/60">
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Topic</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/8">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ivory/40">
                  <td className="whitespace-nowrap px-4 py-3 text-charcoal/70">{istLabel(row.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${row.id}`}
                      className="font-heading text-navy underline-offset-4 hover:underline"
                    >
                      {row.name}
                    </Link>
                    <span className="block text-[0.76rem] text-charcoal/60">
                      {row.company ? `${row.company} · ` : ""}
                      {row.email}
                    </span>
                  </td>
                  <td className="max-w-[22rem] px-4 py-3 text-charcoal/70">
                    <span className="block text-[0.78rem] text-charcoal/60">{row.topic ?? "General"}</span>
                    <span className="line-clamp-1">{row.message}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-10 text-center text-[0.86rem] text-charcoal/70">
            {filter ? "No leads with that status." : "No enquiries yet."}
          </p>
        )}
      </div>
    </>
  );
}
