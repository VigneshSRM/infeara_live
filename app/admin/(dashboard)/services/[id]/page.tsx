import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { Panel, PublishFields, ReadOnlyField, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { Repeater } from "@/components/admin/Repeater";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { saveService, deleteService } from "@/lib/admin/content-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ServiceRow = {
  id: string;
  slug: string;
  sort_order: number;
  name: string;
  short_name: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title: string; body: string }[];
  outcomes: string[];
  faqs: { question: string; answer: string }[];
  related: string[];
  figure: { seed?: number; label?: string; caption?: string } | null;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

const blank: ServiceRow = {
  id: "",
  slug: "",
  sort_order: 0,
  name: "",
  short_name: "",
  tagline: "",
  summary: "",
  intro: "",
  deliverables: [],
  outcomes: [],
  faqs: [],
  related: [],
  figure: { seed: 1, label: "", caption: "" },
  seo_title: "",
  seo_description: "",
  status: "draft",
  published_at: null,
};

export default async function ServiceEditorPage({
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

  let row = blank;
  if (!isNew) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select(
        "id,slug,sort_order,name,short_name,tagline,summary,intro,deliverables,outcomes,faqs,related,figure,seo_title,seo_description,status,published_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (isMissingSchema(error)) return <SchemaNotice table="services" />;
    if (!data) notFound();
    row = data as ServiceRow;
  }

  const editable = canEdit(user);

  return (
    <>
      <PageHeader
        eyebrow="Practices"
        title={isNew ? "New practice" : row.name}
        description={
          isNew
            ? "Create a service page. The slug becomes the public URL and cannot change later."
            : `Editing /services/${row.slug}`
        }
        actions={
          <>
            <Link href="/admin/services" className="admin-btn admin-btn-ghost">
              All practices
            </Link>
            {!isNew && row.status === "published" ? (
              <Link
                href={`/services/${row.slug}`}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-ghost"
              >
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
        <EntityForm
          action={saveService}
          submitLabel={isNew ? "Create practice" : "Save changes"}
          secondary={
            !isNew && editable ? (
              <span className="ml-auto text-[0.78rem] text-charcoal/60">
                Slug is permanent once created.
              </span>
            ) : null
          }
        >
          <input type="hidden" name="id" value={isNew ? "" : row.id} />
          {!isNew ? <input type="hidden" name="slug" value={row.slug} /> : null}

          {editable ? (
            <>
              <Panel title="Identity" description="How the practice is named and summarised across the site." columns={2}>
                <TextField name="name" label="Name" defaultValue={row.name} required />
                <TextField
                  name="short_name"
                  label="Short name"
                  defaultValue={row.short_name}
                  hint="Used in cards and navigation."
                />
                {isNew ? (
                  <TextField
                    name="slug"
                    label="Slug"
                    defaultValue={row.slug}
                    hint="Lowercase words separated by hyphens."
                    className="sm:col-span-2"
                  />
                ) : (
                  <ReadOnlyField
                    label="Slug"
                    value={`/services/${row.slug}`}
                    hint="Locked after creation."
                    className="sm:col-span-2"
                  />
                )}
                <TextField name="tagline" label="Tagline" defaultValue={row.tagline} className="sm:col-span-2" />
                <TextareaField name="summary" label="Summary" defaultValue={row.summary} rows={3} required className="sm:col-span-2" />
                <TextareaField name="intro" label="Intro" defaultValue={row.intro} rows={5} className="sm:col-span-2" />
                <TextField name="sort_order" type="number" label="Order" defaultValue={row.sort_order} />
              </Panel>

              <Panel title="Deliverables" description="What the practice actually does, one card per item.">
                <Repeater
                  name="deliverables"
                  label="Deliverables"
                  addLabel="Add deliverable"
                  initial={row.deliverables.map((item) => ({ title: item.title, body: item.body }))}
                  fields={[
                    { name: "title", label: "Title", type: "text" },
                    { name: "body", label: "Body", type: "textarea" },
                  ]}
                />
              </Panel>

              <Panel title="Outcomes and FAQs" columns={2}>
                <TextareaField
                  name="outcomes"
                  label="Outcomes"
                  defaultValue={row.outcomes.join("\n")}
                  rows={6}
                  hint="One per line."
                />
                <TextareaField
                  name="related"
                  label="Related practice slugs"
                  defaultValue={row.related.join("\n")}
                  rows={6}
                  hint="One slug per line. Must exist in Practices."
                />
                <div className="sm:col-span-2">
                  <Repeater
                    name="faqs"
                    label="FAQs"
                    addLabel="Add FAQ"
                    initial={row.faqs.map((item) => ({ question: item.question, answer: item.answer }))}
                    fields={[
                      { name: "question", label: "Question", type: "text" },
                      { name: "answer", label: "Answer", type: "textarea" },
                    ]}
                  />
                </div>
              </Panel>

              <Panel title="Figure" description="The generated schematic that accompanies the page." columns={2}>
                <TextField name="figure_seed" type="number" label="Seed" defaultValue={row.figure?.seed ?? 1} />
                <TextField name="figure_label" label="Label" defaultValue={row.figure?.label ?? ""} />
                <TextField name="figure_caption" label="Caption" defaultValue={row.figure?.caption ?? ""} className="sm:col-span-2" />
              </Panel>
            </>
          ) : null}

          <Panel
            title="Search engine listing"
            description={
              editable
                ? "Overrides the page title and meta description."
                : "Your role can edit these two fields only."
            }
          >
            <TextField name="seo_title" label="SEO title" defaultValue={row.seo_title} />
            <TextareaField
              name="seo_description"
              label="Meta description"
              defaultValue={row.seo_description}
              rows={3}
              hint="Aim for 120–155 characters."
            />
          </Panel>

          {editable ? (
            <Panel title="Publishing">
              <PublishFields
                status={row.status}
                publishedAt={toIstInput(row.published_at)}
              />
            </Panel>
          ) : null}
        </EntityForm>

        {!isNew && editable ? (
          <form action={deleteService} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="slug" value={row.slug} />
            <ConfirmButton message={`Delete “${row.name}”? This removes the page and cannot be undone.`}>
              Delete practice
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
