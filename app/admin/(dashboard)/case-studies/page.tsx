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
import { isFiltered, parseListParams, type ExtraFilterSpec, type RawParams } from "@/lib/admin/list-params";
import { canEdit, requireStaff } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

const PATH = "/admin/case-studies";

const EXTRAS: ExtraFilterSpec[] = [
  {
    name: "kind",
    label: "Kind",
    options: [
      { value: "representative", label: "Representative" },
      { value: "client", label: "Named client" },
    ],
  },
];

type Row = {
  id: string;
  slug: string;
  title: string;
  sector: string;
  kind: "representative" | "client";
  client_name: string | null;
  client_approved: boolean;
  sort_order: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function CaseStudiesListPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw, EXTRAS);

  const { rows, window, error } = await fetchListPage<Row>({
    table: "case_studies",
    columns: "id,slug,title,sector,kind,client_name,client_approved,sort_order,status,published_at,updated_at",
    params,
    searchColumns: ["title", "slug", "sector", "client_name"],
    extraColumns: { kind: "kind" },
    order: [{ column: "sort_order" }, { column: "created_at" }],
  });

  if (isMissingSchema(error)) return <ResourceSchemaNotice module="Case studies" table="case_studies" />;

  const now = Date.now();
  const columns: Column<Row>[] = [
    { header: "Order", cell: (row) => row.sort_order },
    {
      header: "Case study",
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
    { header: "Sector", cell: (row) => row.sector },
    {
      header: "Kind",
      cell: (row) =>
        row.kind === "client" ? (
          <>
            {row.client_name}
            <span className="block text-[0.74rem] text-charcoal/60">
              {row.client_approved ? "Approval recorded" : "Awaiting approval"}
            </span>
          </>
        ) : (
          "Representative"
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
        eyebrow="Technical resources"
        title="Case studies"
        description="Shown at /case-studies. A representative entry names no client and carries no figures; a named client's study can be published only once the client's approval is recorded."
        actions={
          canEdit(user) ? (
            <Link href={`${PATH}/new`} className="admin-btn admin-btn-primary">
              New case study
            </Link>
          ) : null
        }
      />

      <Flash saved={one(raw.saved)} deleted={one(raw.deleted)} error={one(raw.error)} />

      <ListToolbar
        action={PATH}
        params={params}
        label="Search case studies"
        placeholder="Title, slug, sector or client"
        extras={EXTRAS}
      />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Case studies"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No case studies yet. Create the first one."
      />

      <Pager basePath={PATH} params={params} window={window} noun="case studies" />
    </>
  );
}
