import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { PageHeader } from "@/components/admin/PageHeader";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  sort_order: number;
  items: { question: string; answer: string }[];
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

export default async function FaqGroupsListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const user = await requireStaff();
  const params = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faq_groups")
    .select("id,title,sort_order,items,status,published_at,updated_at")
    .order("sort_order");

  if (isMissingSchema(error)) return <SchemaNotice table="faq_groups" />;

  const rows = (data ?? []) as Row[];
  const editable = canEdit(user);
  const now = Date.now();

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="FAQ groups"
        description="The /faq page, in groups. The homepage draws a short selection from the first four groups."
        actions={
          editable ? (
            <Link href="/admin/faqs/new" className="admin-btn admin-btn-primary">
              New group
            </Link>
          ) : null
        }
      />

      <Flash saved={params.saved} deleted={params.deleted} error={params.error} />

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
                <th className="px-4 py-3 font-medium">Group</th>
                <th className="px-4 py-3 font-medium">Questions</th>
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
                      href={`/admin/faqs/${row.id}`}
                      className="font-heading text-navy underline-offset-4 hover:underline"
                    >
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">{row.items?.length ?? 0}</td>
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
            No groups yet. Run the seed to import the five published groups.
          </p>
        )}
      </div>
    </>
  );
}
