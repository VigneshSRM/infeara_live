import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { Panel, PublishFields, ReadOnlyField, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { deleteIndustry, saveIndustry } from "@/lib/admin/content-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type IndustryRow = {
  id: string;
  slug: string;
  sort_order: number;
  name: string;
  tagline: string;
  summary: string;
  challenges: string[];
  capabilities: string[];
  services: string[];
  figure: { seed?: number; label?: string; caption?: string } | null;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

const blank: IndustryRow = {
  id: "",
  slug: "",
  sort_order: 0,
  name: "",
  tagline: "",
  summary: "",
  challenges: [],
  capabilities: [],
  services: [],
  figure: { seed: 1, label: "", caption: "" },
  seo_title: "",
  seo_description: "",
  status: "draft",
  published_at: null,
};

export default async function IndustryEditorPage({
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
      .from("industries")
      .select(
        "id,slug,sort_order,name,tagline,summary,challenges,capabilities,services,figure,seo_title,seo_description,status,published_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (isMissingSchema(error)) return <SchemaNotice table="industries" />;
    if (!data) notFound();
    row = data as IndustryRow;
  }

  const editable = canEdit(user);

  return (
    <>
      <PageHeader
        eyebrow="Sectors"
        title={isNew ? "New sector" : row.name}
        description={isNew ? "Create a sector page." : `Editing /industries/${row.slug}`}
        actions={
          <>
            <Link href="/admin/industries" className="admin-btn admin-btn-ghost">
              All sectors
            </Link>
            {!isNew && row.status === "published" ? (
              <Link
                href={`/industries/${row.slug}`}
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
        <EntityForm action={saveIndustry} submitLabel={isNew ? "Create sector" : "Save changes"}>
          <input type="hidden" name="id" value={isNew ? "" : row.id} />
          {!isNew ? <input type="hidden" name="slug" value={row.slug} /> : null}

          {editable ? (
            <>
              <Panel title="Identity" columns={2}>
                <TextField name="name" label="Name" defaultValue={row.name} required />
                {isNew ? (
                  <TextField
                    name="slug"
                    label="Slug"
                    defaultValue={row.slug}
                    hint="Lowercase words separated by hyphens."
                  />
                ) : (
                  <ReadOnlyField
                    label="Slug"
                    value={`/industries/${row.slug}`}
                    hint="Locked after creation."
                  />
                )}
                <TextField name="tagline" label="Tagline" defaultValue={row.tagline} className="sm:col-span-2" />
                <TextareaField name="summary" label="Summary" defaultValue={row.summary} rows={3} required className="sm:col-span-2" />
                <TextField name="sort_order" type="number" label="Order" defaultValue={row.sort_order} />
              </Panel>

              <Panel title="Challenges and capabilities" columns={2}>
                <TextareaField
                  name="challenges"
                  label="Challenges"
                  defaultValue={row.challenges.join("\n")}
                  rows={6}
                  hint="One per line."
                />
                <TextareaField
                  name="capabilities"
                  label="Capabilities"
                  defaultValue={row.capabilities.join("\n")}
                  rows={6}
                  hint="One per line."
                />
                <TextareaField
                  name="services"
                  label="Related practice slugs"
                  defaultValue={row.services.join("\n")}
                  rows={4}
                  hint="One slug per line, in display order."
                  className="sm:col-span-2"
                />
              </Panel>

              <Panel title="Figure" columns={2}>
                <TextField name="figure_seed" type="number" label="Seed" defaultValue={row.figure?.seed ?? 1} />
                <TextField name="figure_label" label="Label" defaultValue={row.figure?.label ?? ""} />
                <TextField name="figure_caption" label="Caption" defaultValue={row.figure?.caption ?? ""} className="sm:col-span-2" />
              </Panel>
            </>
          ) : null}

          <Panel
            title="Search engine listing"
            description={editable ? undefined : "Your role can edit these two fields only."}
          >
            <TextField name="seo_title" label="SEO title" defaultValue={row.seo_title} />
            <TextareaField
              name="seo_description"
              label="Meta description"
              defaultValue={row.seo_description}
              rows={3}
            />
          </Panel>

          {editable ? (
            <Panel title="Publishing">
              <PublishFields status={row.status} publishedAt={toIstInput(row.published_at)} />
            </Panel>
          ) : null}
        </EntityForm>

        {!isNew && editable ? (
          <form action={deleteIndustry} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="slug" value={row.slug} />
            <ConfirmButton message={`Delete “${row.name}”? This cannot be undone.`}>
              Delete sector
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
