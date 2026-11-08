import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;
const TABLES = ["services", "industries", "insights", "legal_documents", "faq_groups", "leads", "profiles", "media"];

type Entry = {
  id: number;
  actor_email: string | null;
  action: "insert" | "update" | "delete" | string;
  table_name: string;
  row_id: string | null;
  diff: Record<string, unknown> | null;
  created_at: string;
};

const ACTION_LABEL: Record<string, string> = {
  insert: "created",
  update: "updated",
  delete: "deleted",
};

function summarise(entry: Entry) {
  const diff = entry.diff ?? {};
  if (entry.action === "update") {
    const keys = Object.keys(diff);
    if (!keys.length) return "no field changes recorded";
    return keys
      .slice(0, 4)
      .map((key) => key.replaceAll("_", " "))
      .join(", ") + (keys.length > 4 ? `, +${keys.length - 4} more` : "");
  }
  const label = (diff.name ?? diff.title ?? diff.email ?? diff.slug) as string | undefined;
  return label ? String(label) : entry.row_id ?? "";
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; page?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;
  const table = TABLES.includes(params.table ?? "") ? (params.table as string) : "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  let query = supabase
    .from("audit_log")
    .select("id,actor_email,action,table_name,row_id,diff,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (table) query = query.eq("table_name", table);

  const { data, error, count } = await query;
  if (isMissingSchema(error)) return <SchemaNotice table="audit_log" />;

  const rows = (data ?? []) as Entry[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        eyebrow="Accountability"
        title="Audit log"
        description="Every create, update and delete on content and leads, with the actor and the changed fields. Written by the database, not the application."
      />

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink">
          {error.message}
        </p>
      ) : null}

      <nav aria-label="Filter by table" className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/admin/audit"
          aria-current={!table ? "page" : undefined}
          className={`rounded-sm border px-3 py-1 font-heading text-[0.74rem] ${
            !table ? "border-navy bg-navy text-ivory" : "border-navy/15 text-charcoal/75 hover:border-navy/35"
          }`}
        >
          All
        </Link>
        {TABLES.map((name) => (
          <Link
            key={name}
            href={`/admin/audit?table=${name}`}
            aria-current={table === name ? "page" : undefined}
            className={`rounded-sm border px-3 py-1 font-heading text-[0.74rem] ${
              table === name
                ? "border-navy bg-navy text-ivory"
                : "border-navy/15 text-charcoal/75 hover:border-navy/35"
            }`}
          >
            {name.replaceAll("_", " ")}
          </Link>
        ))}
      </nav>

      <div className="admin-card mt-4 overflow-hidden">
        {rows.length ? (
          <table className="w-full text-left text-[0.84rem]">
            <thead className="border-b border-navy/10 bg-ivory/50">
              <tr className="font-heading text-[0.68rem] uppercase tracking-[0.14em] text-charcoal/60">
                <th className="px-4 py-3 font-medium">When (IST)</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Record</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/8">
              {rows.map((entry) => (
                <tr key={entry.id} className="hover:bg-ivory/40">
                  <td className="whitespace-nowrap px-4 py-3 text-charcoal/70">{istLabel(entry.created_at)}</td>
                  <td className="px-4 py-3 text-charcoal">{entry.actor_email ?? "System"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-0.5 font-heading text-[0.66rem] uppercase tracking-[0.1em] ${
                        entry.action === "delete"
                          ? "bg-coral-ink/10 text-coral-ink"
                          : entry.action === "insert"
                            ? "bg-blue/10 text-blue"
                            : "bg-charcoal/10 text-charcoal/75"
                      }`}
                    >
                      {ACTION_LABEL[entry.action] ?? entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.74rem] text-charcoal/65">
                    {entry.table_name}
                    {entry.row_id ? <span className="block truncate">{entry.row_id}</span> : null}
                  </td>
                  <td className="max-w-[24rem] px-4 py-3 text-charcoal/75">{summarise(entry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-10 text-center text-[0.86rem] text-charcoal/70">
            No entries yet. Changes appear here as soon as they are made.
          </p>
        )}
      </div>

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-[0.8rem] text-charcoal/70">
          <span>
            Page {page} of {pages} · {total} entries
          </span>
          <span className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/admin/audit?${table ? `table=${table}&` : ""}page=${page - 1}`}
                className="admin-btn admin-btn-ghost !px-3 !py-1 !text-[0.74rem]"
              >
                Newer
              </Link>
            ) : null}
            {page < pages ? (
              <Link
                href={`/admin/audit?${table ? `table=${table}&` : ""}page=${page + 1}`}
                className="admin-btn admin-btn-ghost !px-3 !py-1 !text-[0.74rem]"
              >
                Older
              </Link>
            ) : null}
          </span>
        </nav>
      ) : null}
    </>
  );
}
