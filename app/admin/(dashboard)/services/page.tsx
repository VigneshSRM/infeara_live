import Link from "next/link";
import { CoreServiceNotice } from "@/components/admin/CoreServiceNotice";
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
import { countListRows, fetchListPage } from "@/lib/admin/list-query";
import { isFiltered, parseListParams, type RawParams } from "@/lib/admin/list-params";
import { coreServiceGaps, type CoreServiceGap, type CoreServiceRow } from "@/lib/content/core-services";
import { coreServiceSlugs } from "@/lib/content/service-taxonomy";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PATH = "/admin/services";

type Row = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  sort_order: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Which of the six core services visitors cannot see. This reads the six rows itself, with no
 * search, status or page applied: the list below may show only a few services, and judging the
 * six by that few would report the rest as missing.
 */
async function loadCoreGaps(): Promise<CoreServiceGap[]> {
  const supabase = await createClient();
  const [core, total] = await Promise.all([
    supabase.from("services").select("id,slug,status,published_at").in("slug", [...coreServiceSlugs]),
    countListRows({ table: "services", params: { q: "", status: "all", page: 1, extra: {} }, searchColumns: [] }),
  ]);
  // Only for a table that has rows: a failed read, or an empty table (the empty state below already
  // says to run the seed), would otherwise flag all six.
  if (core.error || !total) return [];
  return coreServiceGaps(coreServiceSlugs, (core.data ?? []) as CoreServiceRow[], Date.now());
}

export default async function ServicesListPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireStaff();
  const raw = await searchParams;
  const params = parseListParams(raw);

  const [{ rows, window, error }, gaps] = await Promise.all([
    fetchListPage<Row>({
      table: "services",
      columns: "id,slug,name,short_name,sort_order,status,published_at,updated_at",
      params,
      searchColumns: ["name", "short_name", "slug", "tagline"],
      order: [{ column: "sort_order" }, { column: "slug" }],
    }),
    loadCoreGaps(),
  ]);

  if (isMissingSchema(error)) return <SchemaNotice table="services" />;

  const editable = canEdit(user);
  const now = Date.now();

  const columns: Column<Row>[] = [
    { header: "Order", cell: (row) => row.sort_order },
    {
      header: "Practice",
      className: "",
      cell: (row) => (
        <>
          <Link href={`${PATH}/${row.id}`} className="font-heading text-navy underline-offset-4 hover:underline">
            {row.name}
          </Link>
          {row.short_name !== row.name ? (
            <span className="block text-[0.76rem] text-charcoal/60">{row.short_name}</span>
          ) : null}
        </>
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
        title="Practices"
        description="The nine service pages. Order controls the sequence on the homepage and the services index."
        actions={
          editable ? (
            <Link href={`${PATH}/new`} className="admin-btn admin-btn-primary">
              New practice
            </Link>
          ) : null
        }
      />

      <Flash saved={one(raw.saved)} deleted={one(raw.deleted)} error={one(raw.error)} />

      <CoreServiceNotice gaps={gaps} />

      <ListToolbar action={PATH} params={params} label="Search practices" placeholder="Name, slug or tagline" />

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Practices"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No practices yet. Run the seed to import the existing pages, or create one."
      />

      <Pager basePath={PATH} params={params} window={window} noun="practices" />
    </>
  );
}
