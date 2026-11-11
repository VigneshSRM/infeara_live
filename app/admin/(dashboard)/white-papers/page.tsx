import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { ResourceSchemaNotice } from "@/components/admin/ResourceSchemaNotice";
import { ListError, ResourceTable, type Column } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { fetchListPage } from "@/lib/admin/list-query";
import { isFiltered, parseListParams, type RawParams } from "@/lib/admin/list-params";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { formatFileSize } from "@/lib/content/white-papers";

export const dynamic = "force-dynamic";

const PATH = "/admin/white-papers";

type Row = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  file_path: string | null;
  file_size_bytes: number | null;
  external_url: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function fileLabel(row: Row): string {
  if (row.file_path) {
    const size = formatFileSize(row.file_size_bytes);
    return size ? `PDF · ${size}` : "PDF";
  }
  return row.external_url ? "Link" : "No file";
}

export default async function WhitePapersListPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw);

  const { rows, window, error } = await fetchListPage<Row>({
    table: "white_papers",
    columns: "id,slug,title,topic,file_path,file_size_bytes,external_url,status,published_at,updated_at",
    params,
    searchColumns: ["title", "slug", "topic", "summary"],
    order: [
      { column: "sort_order" },
      { column: "published_at", ascending: false, nullsFirst: true },
      { column: "updated_at", ascending: false },
    ],
  });

  if (isMissingSchema(error)) return <ResourceSchemaNotice module="White papers" table="white_papers" />;

  const now = Date.now();
  const columns: Column<Row>[] = [
    {
      header: "Paper",
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
    { header: "Topic", cell: (row) => row.topic },
    { header: "File", className: "whitespace-nowrap text-charcoal/70", cell: fileLabel },
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
        title="White papers"
        description="PDFs shown at /white-papers. A published paper opens straight from its link, with no form in front of it."
        actions={
          canEdit(user) ? (
            <Link href={`${PATH}/new`} className="admin-btn admin-btn-primary">
              New white paper
            </Link>
          ) : null
        }
      />

      <Flash saved={one(raw.saved)} deleted={one(raw.deleted)} error={one(raw.error)} />

      <ListToolbar action={PATH} params={params} label="Search white papers" placeholder="Title, slug, topic or summary" />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="White papers"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No white papers yet. Upload the first one."
      />

      <Pager basePath={PATH} params={params} window={window} noun="white papers" />
    </>
  );
}
