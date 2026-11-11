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
import { isFiltered, listHref, parseListParams, type ExtraFilterSpec, type RawParams } from "@/lib/admin/list-params";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { parentBySlug, subservicePath, subserviceParents } from "@/lib/content/subservice-model";

export const dynamic = "force-dynamic";

const PATH = "/admin/subservices";

const EXTRAS: ExtraFilterSpec[] = [
  {
    name: "parent",
    label: "Service",
    options: subserviceParents.map((parent) => ({ value: parent.slug, label: parent.name })),
  },
];

type Row = {
  id: string;
  parent_slug: string;
  slug: string;
  name: string;
  sort_order: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function SubservicesListPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw, EXTRAS);

  const { rows, window, error } = await fetchListPage<Row>({
    table: "sub_services",
    columns: "id,parent_slug,slug,name,sort_order,status,published_at,updated_at",
    params,
    searchColumns: ["name", "slug", "tagline", "summary"],
    extraColumns: { parent: "parent_slug" },
    order: [{ column: "parent_slug" }, { column: "sort_order" }, { column: "name" }],
  });

  if (isMissingSchema(error)) return <ResourceSchemaNotice module="Sub-services" table="sub_services" />;

  const now = Date.now();
  const newHref = params.extra.parent ? `${PATH}/new?parent=${params.extra.parent}` : `${PATH}/new`;

  const columns: Column<Row>[] = [
    { header: "Order", cell: (row) => row.sort_order },
    {
      header: "Sub-service",
      className: "",
      cell: (row) => (
        <>
          <Link href={`${PATH}/${row.id}`} className="font-heading text-navy underline-offset-4 hover:underline">
            {row.name}
          </Link>
          <span className="block font-mono text-[0.74rem] text-charcoal/60">{subservicePath(row.parent_slug, row.slug)}</span>
        </>
      ),
    },
    {
      header: "Service",
      cell: (row) => (
        <Link
          href={listHref(PATH, params, { page: 1, extra: { ...params.extra, parent: row.parent_slug } })}
          className="underline-offset-4 hover:underline"
        >
          {parentBySlug(row.parent_slug)?.name ?? row.parent_slug}
        </Link>
      ),
    },
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
        eyebrow="Services"
        title="Sub-services"
        description="The pages under Cybersecurity, Cloud & Datacenter, AI Automations and Application Development. Order sets the sequence on the service page."
        actions={
          canEdit(user) ? (
            <Link href={newHref} className="admin-btn admin-btn-primary">
              New sub-service
            </Link>
          ) : null
        }
      />

      <Flash saved={one(raw.saved)} deleted={one(raw.deleted)} error={one(raw.error)} />

      <ListToolbar
        action={PATH}
        params={params}
        label="Search sub-services"
        placeholder="Name, slug or summary"
        extras={EXTRAS}
      />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Sub-services"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No sub-services yet. Create the first one."
      />

      <Pager basePath={PATH} params={params} window={window} noun="sub-services" />
    </>
  );
}
