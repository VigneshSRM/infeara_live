import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { ListError, ResourceTable, type Column } from "@/components/admin/ResourceTable";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { fetchListPage } from "@/lib/admin/list-query";
import { isFiltered, parseListParams, windowFilter, type ExtraFilterSpec, type RawParams } from "@/lib/admin/list-params";
import { requireStaff } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

const PATH = "/admin/audit";
const PAGE_SIZE = 40;

const TABLES = [
  "services",
  "sub_services",
  "industries",
  "insights",
  "blog_posts",
  "case_studies",
  "white_papers",
  "legal_documents",
  "faq_groups",
  "leads",
  "profiles",
  "media",
];

// Three dropdowns: what kind of record, what was done to it, and how long ago. The kind keeps the
// name `table` that the old filter buttons used, so a saved link to one still works.
const TABLE_FILTER: ExtraFilterSpec = {
  name: "table",
  label: "Record type",
  anyLabel: "All records",
  options: TABLES.map((name) => ({ value: name, label: name.replaceAll("_", " ") })),
};
const ACTION_FILTER: ExtraFilterSpec = {
  name: "action",
  label: "Action",
  anyLabel: "All actions",
  options: [
    { value: "insert", label: "Created" },
    { value: "update", label: "Updated" },
    { value: "delete", label: "Deleted" },
  ],
};
const WHEN_FILTER = windowFilter("when", "When", [1, 7, 30]);
const EXTRAS = [TABLE_FILTER, ACTION_FILTER, WHEN_FILTER];

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

export default async function AuditPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  await requireStaff();
  const raw = await searchParams;
  // The log has no status of its own: the action says what happened.
  const params = parseListParams(raw, EXTRAS, []);

  const { rows, window, error } = await fetchListPage<Entry>({
    table: "audit_log",
    columns: "id,actor_email,action,table_name,row_id,diff,created_at",
    params,
    pageSize: PAGE_SIZE,
    searchColumns: ["actor_email", "row_id"],
    extraColumns: { table: "table_name", action: "action" },
    windowColumns: { when: "created_at" },
    // Newest first, and the id keeps entries made in the same instant in the order they happened.
    order: [
      { column: "created_at", ascending: false },
      { column: "id", ascending: false },
    ],
  });

  if (isMissingSchema(error)) return <SchemaNotice table="audit_log" />;

  const columns: Column<Entry>[] = [
    { header: "When (IST)", className: "whitespace-nowrap text-charcoal/70", cell: (entry) => istLabel(entry.created_at) },
    { header: "Actor", className: "text-charcoal", cell: (entry) => entry.actor_email ?? "System" },
    {
      header: "Action",
      className: "",
      cell: (entry) => (
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
      ),
    },
    {
      header: "Record",
      className: "font-mono text-[0.74rem] text-charcoal/65",
      cell: (entry) => (
        <>
          {entry.table_name}
          {entry.row_id ? <span className="block truncate">{entry.row_id}</span> : null}
        </>
      ),
    },
    { header: "Detail", className: "max-w-[24rem] text-charcoal/75", cell: (entry) => summarise(entry) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Accountability"
        title="Audit log"
        description="Every create, update and delete on content and leads, with the actor and the changed fields. Written by the database, not the application."
      />

      <ListToolbar
        action={PATH}
        params={params}
        label="Search the audit log"
        placeholder="Who made the change, or a record id"
        extras={EXTRAS}
        statuses={[]}
        showStatus={false}
      />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Audit log"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No entries yet. Changes appear here as soon as they are made."
      />

      <Pager basePath={PATH} params={params} window={window} noun="entries" previousLabel="Newer" nextLabel="Older" />
    </>
  );
}
