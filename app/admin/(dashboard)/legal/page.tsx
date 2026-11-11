import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { ListError, ResourceTable, type Column } from "@/components/admin/ResourceTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { fetchListPage } from "@/lib/admin/list-query";
import { isFiltered, parseListParams, type RawParams } from "@/lib/admin/list-params";

export const dynamic = "force-dynamic";

const PATH = "/admin/legal";

type Row = {
  id: string;
  slug: string;
  title: string;
  updated_label: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function LegalListPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw);

  const { rows, window, error } = await fetchListPage<Row>({
    table: "legal_documents",
    columns: "id,slug,title,updated_label,status,published_at,updated_at",
    params,
    searchColumns: ["title", "slug", "updated_label", "description"],
    order: [{ column: "title" }],
  });

  if (isMissingSchema(error)) return <SchemaNotice table="legal_documents" />;

  const editable = canEdit(user);
  const now = Date.now();

  const columns: Column<Row>[] = [
    {
      header: "Document",
      className: "",
      cell: (row) => (
        <Link href={`${PATH}/${row.id}`} className="font-heading text-navy underline-offset-4 hover:underline">
          {row.title}
        </Link>
      ),
    },
    { header: "Slug", className: "font-mono text-[0.76rem] text-charcoal/60", cell: (row) => row.slug },
    { header: "Label", cell: (row) => row.updated_label },
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
    { header: "Updated", className: "whitespace-nowrap text-charcoal/70", cell: (row) => istLabel(row.updated_at) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Legal documents"
        description="Privacy, terms and the security statement. Changes here are public immediately when published."
        actions={
          editable ? (
            <Link href={`${PATH}/new`} className="admin-btn admin-btn-primary">
              New document
            </Link>
          ) : null
        }
      />

      <Flash saved={one(raw.saved)} deleted={one(raw.deleted)} error={one(raw.error)} />

      <ListToolbar action={PATH} params={params} label="Search legal documents" placeholder="Title, slug or label" />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Legal documents"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No documents yet. Run the seed to import the published set."
      />

      <Pager basePath={PATH} params={params} window={window} noun="documents" />
    </>
  );
}
