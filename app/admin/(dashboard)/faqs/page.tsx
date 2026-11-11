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

const PATH = "/admin/faqs";

type Row = {
  id: string;
  title: string;
  sort_order: number;
  items: { question: string; answer: string }[];
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function FaqGroupsListPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw);

  const { rows, window, error } = await fetchListPage<Row>({
    table: "faq_groups",
    columns: "id,title,sort_order,items,status,published_at,updated_at",
    params,
    // The questions themselves sit inside one JSON column, which the database cannot search for
    // part of a word, so the search covers the group's title and its introduction.
    searchColumns: ["title", "intro"],
    order: [{ column: "sort_order" }],
  });

  if (isMissingSchema(error)) return <SchemaNotice table="faq_groups" />;

  const editable = canEdit(user);
  const now = Date.now();

  const columns: Column<Row>[] = [
    { header: "Order", cell: (row) => row.sort_order },
    {
      header: "Group",
      className: "",
      cell: (row) => (
        <Link href={`${PATH}/${row.id}`} className="font-heading text-navy underline-offset-4 hover:underline">
          {row.title}
        </Link>
      ),
    },
    { header: "Questions", cell: (row) => row.items?.length ?? 0 },
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
        title="FAQ groups"
        description="The /faq page, in groups. The homepage draws a short selection from the first four groups."
        actions={
          editable ? (
            <Link href={`${PATH}/new`} className="admin-btn admin-btn-primary">
              New group
            </Link>
          ) : null
        }
      />

      <Flash saved={one(raw.saved)} deleted={one(raw.deleted)} error={one(raw.error)} />

      <ListToolbar action={PATH} params={params} label="Search FAQ groups" placeholder="Group title or introduction" />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="FAQ groups"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No groups yet. Run the seed to import the five published groups."
      />

      <Pager basePath={PATH} params={params} window={window} noun="groups" />
    </>
  );
}
