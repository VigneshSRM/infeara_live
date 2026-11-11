import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { ListError, ResourceTable, type Column } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { loadNoteActivity } from "@/lib/admin/lead-notes";
import { countListRows, fetchListPage } from "@/lib/admin/list-query";
import {
  LEAD_STATUS_FILTERS,
  isFiltered,
  listHref,
  parseListParams,
  windowFilter,
  type RawParams,
} from "@/lib/admin/list-params";
import { formatAgo, formatCount } from "@/lib/analytics/format";
import { requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PATH = "/admin/leads";

// Enquiries are read by when they came in, so the second filter is a time window.
const RECEIVED = windowFilter("received", "Received", [1, 7, 30, 90]);
const SEARCH_COLUMNS = ["name", "email", "company", "phone", "topic", "message"] as const;
const WINDOW_COLUMNS = { received: "created_at" };

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

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function LeadsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw, [RECEIVED], LEAD_STATUS_FILTERS);
  const filters = { searchColumns: SEARCH_COLUMNS, windowColumns: WINDOW_COLUMNS };

  // The page of enquiries and the number on each status button come back together. The buttons count
  // what the search and the "Received" choice match, so their numbers agree with the list. A count
  // that fails just hides its number.
  const [{ rows, window, error }, ...statusCounts] = await Promise.all([
    fetchListPage<Row>({
      table: "leads",
      columns: "id,name,email,company,topic,message,status,created_at",
      params,
      ...filters,
      order: [
        { column: "created_at", ascending: false },
        { column: "id", ascending: false },
      ],
    }),
    ...LEAD_STATUS_FILTERS.map((option) =>
      countListRows({ table: "leads", params: { ...params, status: option.value, page: 1 }, ...filters }),
    ),
  ]);
  if (isMissingSchema(error)) return <SchemaNotice table="leads" />;

  const counts = new Map(LEAD_STATUS_FILTERS.map((option, index) => [option.value, statusCounts[index]]));

  // null when the notes table is not there yet: the list then simply has no Notes column.
  const supabase = await createClient();
  const activity = await loadNoteActivity(
    supabase,
    rows.map((row) => row.id),
  );
  const nowMs = Date.now();

  const columns: Column<Row>[] = [
    { header: "Received", className: "whitespace-nowrap text-charcoal/70", cell: (row) => istLabel(row.created_at) },
    {
      header: "From",
      className: "",
      cell: (row) => (
        <>
          <Link href={`${PATH}/${row.id}`} className="font-heading text-navy underline-offset-4 hover:underline">
            {row.name}
          </Link>
          <span className="block text-[0.76rem] text-charcoal/60">
            {row.company ? `${row.company} · ` : ""}
            {row.email}
          </span>
        </>
      ),
    },
    {
      header: "Topic",
      className: "max-w-[22rem] text-charcoal/70",
      cell: (row) => (
        <>
          <span className="block text-[0.78rem] text-charcoal/60">{row.topic ?? "General"}</span>
          <span className="line-clamp-1">{row.message}</span>
        </>
      ),
    },
    ...(activity
      ? [
          {
            header: "Notes",
            className: "whitespace-nowrap text-[0.78rem]",
            cell: (row: Row) => {
              const seen = activity.get(row.id);
              return seen ? (
                <Link href={`${PATH}/${row.id}#notes`} className="block">
                  <span className="font-heading text-navy">
                    {seen.count} {seen.count === 1 ? "note" : "notes"}
                  </span>
                  <span className="block text-[0.72rem] text-charcoal/60">
                    {seen.lastBy} · {formatAgo(Date.parse(seen.lastAt), nowMs)}
                  </span>
                </Link>
              ) : (
                <span className="text-charcoal/40" aria-label="No notes">
                  —
                </span>
              );
            },
          },
        ]
      : []),
    { header: "Status", className: "", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Demand"
        title="Leads"
        description="Enquiries from the contact form. Status and notes are internal; nothing here is published."
      />

      <Flash deleted={one(raw.deleted)} error={one(raw.error)} />

      <ListToolbar
        action={PATH}
        params={params}
        label="Search enquiries"
        placeholder="Name, email, phone, company or message"
        extras={[RECEIVED]}
        showStatus={false}
      />

      <nav aria-label="Filter by status" className="mt-5 flex flex-wrap gap-2">
        {LEAD_STATUS_FILTERS.map((item) => {
          const count = counts.get(item.value);
          const selected = params.status === item.value;
          return (
            <Link
              key={item.value}
              href={listHref(PATH, params, { status: item.value, page: 1 })}
              aria-current={selected ? "page" : undefined}
              className={`rounded-sm border px-3 py-1 font-heading text-[0.74rem] transition-colors ${
                selected
                  ? "border-navy bg-navy text-ivory"
                  : "border-navy/15 text-charcoal/75 hover:border-navy/35 hover:text-navy"
              }`}
            >
              {item.label}
              {count !== null && count !== undefined ? (
                <>
                  {/* A real space, so a screen reader says "All 7" and not "All7". */}{" "}
                  <span className={`tabular-nums ${selected ? "text-ivory/75" : "text-charcoal/55"}`}>{formatCount(count)}</span>
                </>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Enquiries"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No enquiries yet."
      />

      <Pager basePath={PATH} params={params} window={window} noun="enquiries" />
    </>
  );
}
