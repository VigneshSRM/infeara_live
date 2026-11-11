import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { FigureSeedField } from "@/components/admin/FigureSeedField";
import { Panel, PublishFields, ReadOnlyField, SelectField, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { Repeater } from "@/components/admin/Repeater";
import { ResourceSchemaNotice } from "@/components/admin/ResourceSchemaNotice";
import { SeoPanel } from "@/components/admin/SeoPanel";
import { deleteSubservice, saveSubservice } from "@/lib/admin/resource-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { tableIsMissing } from "@/lib/admin/list-query";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { isSubserviceParent, parentBySlug, subservicePath, subserviceParents } from "@/lib/content/subservice-model";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COLUMNS =
  "id,parent_slug,slug,sort_order,name,tagline,summary,intro,deliverables,outcomes,faqs,infographic,figure,seo_title,seo_description,status,published_at";

type Row = {
  id: string;
  parent_slug: string;
  slug: string;
  sort_order: number;
  name: string;
  tagline: string;
  summary: string;
  intro: string;
  deliverables: { title?: string; body?: string }[] | null;
  outcomes: string[] | null;
  faqs: { question?: string; answer?: string }[] | null;
  infographic: { title?: string; steps?: { title?: string; description?: string }[]; image?: string } | null;
  figure: { seed?: number; label?: string; caption?: string } | null;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

const blank: Row = {
  id: "",
  parent_slug: "cybersecurity",
  slug: "",
  sort_order: 0,
  name: "",
  tagline: "",
  summary: "",
  intro: "",
  deliverables: [],
  outcomes: [],
  faqs: [],
  infographic: null,
  figure: { seed: 1, label: "", caption: "" },
  seo_title: "",
  seo_description: "",
  status: "draft",
  published_at: null,
};

export default async function SubserviceEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; parent?: string }>;
}) {
  const user = await requireStaff();
  const { id } = await params;
  const { error: actionError, parent: requestedParent } = await searchParams;
  const isNew = id === "new";

  let row = blank;
  if (isNew) {
    if (await tableIsMissing("sub_services")) return <ResourceSchemaNotice module="Sub-services" table="sub_services" />;
    if (requestedParent && isSubserviceParent(requestedParent)) row = { ...blank, parent_slug: requestedParent };
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase.from("sub_services").select(COLUMNS).eq("id", id).maybeSingle();

    if (isMissingSchema(error)) return <ResourceSchemaNotice module="Sub-services" table="sub_services" />;
    if (!data) notFound();
    row = data as Row;
  }

  const editable = canEdit(user);
  const parent = parentBySlug(row.parent_slug);
  const path = subservicePath(row.parent_slug, row.slug);
  const image = row.infographic?.image ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Sub-services"
        title={isNew ? "New sub-service" : row.name}
        description={
          isNew
            ? "Create a page under one of the four services. The service and slug become its address and cannot change later."
            : `Editing ${path}`
        }
        actions={
          <>
            <Link href="/admin/subservices" className="admin-btn admin-btn-ghost">
              All sub-services
            </Link>
            {!isNew && row.status === "published" ? (
              <Link href={path} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost">
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
        <EntityForm action={saveSubservice} submitLabel={isNew ? "Create sub-service" : "Save changes"}>
          <input type="hidden" name="id" value={isNew ? "" : row.id} />
          {!isNew ? <input type="hidden" name="parent_slug" value={row.parent_slug} /> : null}
          {!isNew ? <input type="hidden" name="slug" value={row.slug} /> : null}

          {editable ? (
            <>
              <Panel title="Identity" description="How the sub-service is named and summarised across the site." columns={2}>
                <TextField name="name" label="Name" defaultValue={row.name} required />
                <TextField name="tagline" label="Tagline" defaultValue={row.tagline} />
                {isNew ? (
                  <>
                    <SelectField
                      name="parent_slug"
                      label="Service"
                      defaultValue={row.parent_slug}
                      options={subserviceParents.map((item) => ({ value: item.slug, label: item.name }))}
                      hint="Locked after creation."
                    />
                    <TextField
                      name="slug"
                      label="Slug"
                      defaultValue={row.slug}
                      hint="Lowercase words separated by hyphens. Locked after creation."
                      required
                    />
                  </>
                ) : (
                  <ReadOnlyField
                    label="Address"
                    value={path}
                    hint={`Under ${parent?.name ?? row.parent_slug}. Locked after creation.`}
                    className="sm:col-span-2"
                  />
                )}
                <TextareaField
                  name="summary"
                  label="Summary"
                  defaultValue={row.summary}
                  rows={3}
                  required
                  hint="Shown on cards and under the heading."
                  className="sm:col-span-2"
                />
                <TextareaField name="intro" label="Intro" defaultValue={row.intro} rows={5} className="sm:col-span-2" />
                <TextField
                  name="sort_order"
                  type="number"
                  label="Order"
                  defaultValue={row.sort_order}
                  hint="Lower numbers come first on the service page."
                />
              </Panel>

              <Panel title="Deliverables" description="What the service actually delivers, one card per item.">
                <Repeater
                  name="deliverables"
                  label="Deliverables"
                  addLabel="Add deliverable"
                  initial={(row.deliverables ?? []).map((item) => ({ title: item.title ?? "", body: item.body ?? "" }))}
                  fields={[
                    { name: "title", label: "Title", type: "text" },
                    { name: "body", label: "Body", type: "textarea" },
                  ]}
                />
              </Panel>

              <Panel title="Outcomes and FAQs">
                <TextareaField
                  name="outcomes"
                  label="Expected outcomes"
                  defaultValue={(row.outcomes ?? []).join("\n")}
                  rows={6}
                  hint="One per line."
                />
                <Repeater
                  name="faqs"
                  label="FAQs"
                  addLabel="Add FAQ"
                  hint="A question needs an answer to be shown."
                  initial={(row.faqs ?? []).map((item) => ({ question: item.question ?? "", answer: item.answer ?? "" }))}
                  fields={[
                    { name: "question", label: "Question", type: "text" },
                    { name: "answer", label: "Answer", type: "textarea" },
                  ]}
                />
              </Panel>

              <Panel
                title="How it works"
                description={
                  parent?.layout === "security"
                    ? "Cybersecurity pages do not show a diagram, so this section is not used there."
                    : "The four-step diagram near the foot of the page. Leave it empty to hide the section."
                }
                columns={2}
              >
                <TextField
                  name="infographic_title"
                  label="Diagram title"
                  defaultValue={row.infographic?.title ?? ""}
                  className="sm:col-span-2"
                />
                {image ? (
                  <div className="sm:col-span-2">
                    <input type="hidden" name="infographic_image" value={image} />
                    <label className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-charcoal/80">
                      <input type="checkbox" name="keep_image" defaultChecked className="mt-1" />
                      <span>
                        Show the drawn diagram <code className="rounded bg-navy/5 px-1.5 py-0.5">{image}</code> on the
                        page. Untick it to list the steps below instead.
                      </span>
                    </label>
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <Repeater
                    name="infographic_steps"
                    label="Steps"
                    addLabel="Add step"
                    hint="Used for the page's alt text, and as the list itself when there is no drawn diagram."
                    initial={(row.infographic?.steps ?? []).map((step) => ({
                      title: step.title ?? "",
                      description: step.description ?? "",
                    }))}
                    fields={[
                      { name: "title", label: "Step", type: "text" },
                      { name: "description", label: "Description", type: "textarea" },
                    ]}
                  />
                </div>
              </Panel>

              <Panel title="Picture" description="The photograph on the hub card and at the top of the page." columns={2}>
                <FigureSeedField defaultValue={row.figure?.seed ?? 1} />
                <TextField name="figure_label" label="Label" defaultValue={row.figure?.label ?? ""} />
                <TextField name="figure_caption" label="Caption" defaultValue={row.figure?.caption ?? ""} />
              </Panel>
            </>
          ) : null}

          <SeoPanel
            seoTitle={row.seo_title}
            seoDescription={row.seo_description}
            editable={editable}
            fallbackNote="the name and summary"
          />

          {editable ? (
            <Panel title="Publishing">
              <PublishFields status={row.status} publishedAt={toIstInput(row.published_at)} />
            </Panel>
          ) : null}
        </EntityForm>

        {!isNew && editable ? (
          <form action={deleteSubservice} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="parent_slug" value={row.parent_slug} />
            <input type="hidden" name="slug" value={row.slug} />
            <ConfirmButton message={`Delete “${row.name}”? This removes the page and cannot be undone.`}>
              Delete sub-service
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
