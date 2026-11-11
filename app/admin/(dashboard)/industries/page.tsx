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

const PATH = "/admin/industries";

type Row = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function IndustriesListPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw);

  const { rows, window, error } = await fetchListPage<Row>({
    table: "industries",
    columns: "id,slug,name,sort_order,status,published_at,updated_at",
    params,
    searchColumns: ["name", "slug", "tagline"],
    order: [{ column: "sort_order" }, { column: "slug" }],
  });

  if (isMissingSchema(error)) return <SchemaNotice table="industries" />;

  const editable = canEdit(user);
  const now = Date.now();

  const columns: Column<Row>[] = [
    { header: "Order", cell: (row) => row.sort_order },
    {
      header: "Sector",
      className: "",
      cell: (row) => (
        <Link href={`${PATH}/${row.id}`} className="font-heading text-navy underline-offset-4 hover:underline">
          {row.name}
        </Link>
      ),
    },
    { header: "Slug", className: "font-mono text-[0.76rem] text-charcoal/60", cell: (row) => row.slug },
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
        eyebrow="Content"
        title="Sectors"
        description="Where Infeara's practices apply. Each sector page links back to the relevant practices."
        actions={
          editable ? (
            <Link href={`${PATH}/new`} className="admin-btn admin-btn-primary">
              New sector
            </Link>
          ) : null
        }
      />

      <Flash saved={one(raw.saved)} deleted={one(raw.deleted)} error={one(raw.error)} />

      <ListToolbar action={PATH} params={params} label="Search sectors" placeholder="Name, slug or tagline" />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Sectors"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No sectors yet. Run the seed to import the existing pages, or create one."
      />

      <Pager basePath={PATH} params={params} window={window} noun="sectors" />
    </>
  );
}
