import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { Panel, PublishFields, ReadOnlyField, SelectField, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceSchemaNotice } from "@/components/admin/ResourceSchemaNotice";
import { SeoPanel } from "@/components/admin/SeoPanel";
import { deleteCaseStudy, saveCaseStudy } from "@/lib/admin/resource-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { tableIsMissing } from "@/lib/admin/list-query";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COLUMNS =
  "id,slug,title,sector,kind,client_name,client_approved,situation,work,result,services,sort_order,seo_title,seo_description,status,published_at";

type Row = {
  id: string;
  slug: string;
  title: string;
  sector: string;
  kind: "representative" | "client";
  client_name: string | null;
  client_approved: boolean;
  situation: string;
  work: string[] | null;
  result: string;
  services: string[] | null;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

const blank: Row = {
  id: "",
  slug: "",
  title: "",
  sector: "",
  kind: "representative",
  client_name: null,
  client_approved: false,
  situation: "",
  work: [],
  result: "",
  services: [],
  sort_order: 0,
  seo_title: "",
  seo_description: "",
  status: "draft",
  published_at: null,
};

export default async function CaseStudyEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireStaff();
  const { id } = await params;
  const { error: actionError } = await searchParams;
  const isNew = id === "new";
  const supabase = await createClient();

  let row = blank;
  if (isNew) {
    if (await tableIsMissing("case_studies")) return <ResourceSchemaNotice module="Case studies" table="case_studies" />;
  } else {
    const { data, error } = await supabase.from("case_studies").select(COLUMNS).eq("id", id).maybeSingle();

    if (isMissingSchema(error)) return <ResourceSchemaNotice module="Case studies" table="case_studies" />;
    if (!data) notFound();
    row = data as Row;
  }

  // The services a study can point at: whatever exists in the Services module.
  const { data: serviceRows } = await supabase.from("services").select("slug,short_name,sort_order").order("sort_order");
  const services = (serviceRows ?? []) as { slug: string; short_name: string }[];
  const chosen = new Set(row.services ?? []);

  const editable = canEdit(user);

  return (
    <>
      <PageHeader
        eyebrow="Case studies"
        title={isNew ? "New case study" : row.title}
        description={isNew ? "Describe an engagement. Its address will be /case-studies/slug." : `Editing /case-studies/${row.slug}`}
        actions={
          <>
            <Link href="/admin/case-studies" className="admin-btn admin-btn-ghost">
              All case studies
            </Link>
            {!isNew && row.status === "published" ? (
              <Link href={`/case-studies/${row.slug}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost">
                View page ↗
              </Link>
            ) : null}
          </>
        }
      />

      {actionError ? (
        <p role="alert" className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink">
          {actionError}
        </p>
      ) : null}

      <div className="mt-6">
        <EntityForm action={saveCaseStudy} submitLabel={isNew ? "Create case study" : "Save changes"}>
          <input type="hidden" name="id" value={isNew ? "" : row.id} />
          {!isNew ? <input type="hidden" name="slug" value={row.slug} /> : null}

          {editable ? (
            <>
              <Panel title="Study details" columns={2}>
                <TextField name="title" label="Title" defaultValue={row.title} required className="sm:col-span-2" />
                {isNew ? (
                  <TextField
                    name="slug"
                    label="Slug"
                    defaultValue={row.slug}
                    hint="Lowercase words separated by hyphens. Locked after creation."
                    required
                  />
                ) : (
                  <ReadOnlyField label="Slug" value={`/case-studies/${row.slug}`} hint="Locked after creation." />
                )}
                <TextField name="sector" label="Sector" defaultValue={row.sector} required hint="For example Healthcare or Manufacturing." />
                <TextField
                  name="sort_order"
                  type="number"
                  label="Order"
                  defaultValue={row.sort_order}
                  hint="Lower numbers come first on the case studies page."
                />
              </Panel>

              <Panel
                title="Who it is about"
                description="A representative study describes the shape of an engagement and names no client. A named client's study needs that client's approval before it can be published."
                columns={2}
              >
                <SelectField
                  name="kind"
                  label="Kind"
                  defaultValue={row.kind}
                  options={[
                    { value: "representative", label: "Representative (no client named)" },
                    { value: "client", label: "Named client" },
                  ]}
                  className="sm:col-span-2"
                />
                <TextField
                  name="client_name"
                  label="Client name"
                  defaultValue={row.client_name}
                  hint="Only for a named client. Ignored for a representative study."
                />
                <div className="flex items-end pb-2">
                  <label className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-charcoal/80">
                    <input type="checkbox" name="client_approved" defaultChecked={row.client_approved} className="mt-1" />
                    <span>The client has approved publishing this study, in writing.</span>
                  </label>
                </div>
              </Panel>

              <Panel
                title="The story"
                description="No percentages, time savings or availability figures unless the client has approved them."
              >
                <TextareaField name="situation" label="The situation" defaultValue={row.situation} rows={5} required />
                <TextareaField
                  name="work"
                  label="What we did"
                  defaultValue={(row.work ?? []).join("\n")}
                  rows={6}
                  hint="One step per line."
                />
                <TextareaField name="result" label="Change in state" defaultValue={row.result} rows={3} required />
              </Panel>

              <Panel title="Services involved" description="Shown as links under the study. Pick the service pages it relates to.">
                {services.length ? (
                  <fieldset className="grid gap-2 sm:grid-cols-2">
                    <legend className="sr-only">Services involved</legend>
                    {services.map((service) => (
                      <label key={service.slug} className="flex items-center gap-3 text-[0.88rem] text-charcoal/80">
                        <input type="checkbox" name="services" value={service.slug} defaultChecked={chosen.has(service.slug)} />
                        <span>{service.short_name}</span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <p className="text-[0.84rem] text-charcoal/65">No services found.</p>
                )}
              </Panel>
            </>
          ) : null}

          <SeoPanel
            seoTitle={row.seo_title}
            seoDescription={row.seo_description}
            editable={editable}
            fallbackNote="the title and the start of the situation"
          />

          {editable ? (
            <Panel title="Publishing">
              <PublishFields status={row.status} publishedAt={toIstInput(row.published_at)} />
            </Panel>
          ) : null}
        </EntityForm>

        {!isNew && editable ? (
          <form action={deleteCaseStudy} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="slug" value={row.slug} />
            <ConfirmButton message={`Delete “${row.title}”? This removes the case study and cannot be undone.`}>
              Delete case study
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
