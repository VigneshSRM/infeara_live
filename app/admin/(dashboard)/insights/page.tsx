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
import { fetchListPage } from "@/lib/admin/list-query";
import { isFiltered, parseListParams, type RawParams } from "@/lib/admin/list-params";
import { canEdit, requireStaff } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

const PATH = "/admin/insights";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function InsightsListPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw);

  const { rows, window, error } = await fetchListPage<Row>({
    table: "insights",
    columns: "id,slug,title,category,status,published_at,updated_at",
    params,
    searchColumns: ["title", "slug", "category", "excerpt"],
    // Newest first, with drafts (no date yet) at the top where the work in progress is.
    order: [
      { column: "published_at", ascending: false, nullsFirst: true },
      { column: "updated_at", ascending: false },
    ],
  });

  if (isMissingSchema(error)) return <SchemaNotice table="insights" />;

  const now = Date.now();
  const columns: Column<Row>[] = [
    {
      header: "Guide",
      className: "",
      cell: (row) => (
        <>
          <Link href={`${PATH}/${row.id}`} className="font-heading text-navy underline-offset-4 hover:underline">
            {row.title}
          </Link>
          <span className="block font-mono text-[0.74rem] text-charcoal/60">{row.slug}</span>
        </>
      ),
    },
    { header: "Category", cell: (row) => row.category },
    {
      header: "Status",
      className: "",
      cell: (row) => (
        <StatusBadge
          status={row.status}
          scheduled={row.status === "published" && Boolean(row.published_at && new Date(row.published_at).getTime() > now)}
        />
      ),
    },
    { header: "Published", className: "whitespace-nowrap text-charcoal/70", cell: (row) => istLabel(row.published_at) },
    { header: "Updated", className: "whitespace-nowrap text-charcoal/70", cell: (row) => istLabel(row.updated_at) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Technical resources"
        title="Insights"
        description="In-depth guides shown at /insights. New URLs work without a deploy."
        actions={
          canEdit(user) ? (
            <Link href={`${PATH}/new`} className="admin-btn admin-btn-primary">
              New guide
            </Link>
          ) : null
        }
      />

      <Flash saved={one(raw.saved)} deleted={one(raw.deleted)} error={one(raw.error)} />

      <ListToolbar action={PATH} params={params} label="Search guides" placeholder="Title, slug, category or text" />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Insights"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No guides yet. Create one, or run the seed to import the initial resources."
      />

      <Pager basePath={PATH} params={params} window={window} noun="guides" />
    </>
  );
}
