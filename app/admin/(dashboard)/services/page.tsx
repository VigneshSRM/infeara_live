import Link from "next/link";
import { CoreServiceNotice } from "@/components/admin/CoreServiceNotice";
import { Flash } from "@/components/admin/Flash";
import { PageHeader } from "@/components/admin/PageHeader";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { canEdit } from "@/lib/auth/dal";
import { requireStaff } from "@/lib/auth/dal";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { coreServiceGaps } from "@/lib/content/core-services";
import { coreServiceSlugs } from "@/lib/content/service-taxonomy";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  sort_order: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

export default async function ServicesListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const user = await requireStaff();
  const params = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("id,slug,name,short_name,sort_order,status,published_at,updated_at")
    .order("sort_order");

  if (isMissingSchema(error)) return <SchemaNotice table="services" />;

  const rows = (data ?? []) as Row[];
  const editable = canEdit(user);
  const now = Date.now();
  // Only for a table that has rows: a failed read, or an empty table (the empty state below
  // already says to run the seed), would otherwise flag all six.
  const gaps = error || !rows.length ? [] : coreServiceGaps(coreServiceSlugs, rows, now);

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Practices"
        description="The nine service pages. Order controls the sequence on the homepage and the services index."
        actions={
          editable ? (
            <Link href="/admin/services/new" className="admin-btn admin-btn-primary">
              New practice
            </Link>
          ) : null
        }
      />

      <Flash saved={params.saved} deleted={params.deleted} error={params.error} />

      <CoreServiceNotice gaps={gaps} />

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink">
          {error.message}
        </p>
      ) : null}

      <div className="admin-card mt-6 overflow-hidden">
        {rows.length ? (
          <table className="w-full text-left text-[0.86rem]">
            <thead className="border-b border-navy/10 bg-ivory/50">
              <tr className="font-heading text-[0.68rem] uppercase tracking-[0.14em] text-charcoal/60">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Practice</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/8">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ivory/40">
                  <td className="px-4 py-3 text-charcoal/70">{row.sort_order}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/services/${row.id}`}
                      className="font-heading text-navy underline-offset-4 hover:underline"
                    >
                      {row.name}
                    </Link>
                    {row.short_name !== row.name ? (
                      <span className="block text-[0.76rem] text-charcoal/60">{row.short_name}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.76rem] text-charcoal/60">{row.slug}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={row.status}
                      scheduled={Boolean(row.published_at && new Date(row.published_at).getTime() > now)}
                    />
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">{istLabel(row.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-10 text-center text-[0.86rem] text-charcoal/70">
            No practices yet. Run the seed to import the existing pages, or create one.
          </p>
        )}
      </div>
    </>
  );
}
