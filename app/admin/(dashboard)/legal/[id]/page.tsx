import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { Panel, PublishFields, ReadOnlyField, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { Repeater } from "@/components/admin/Repeater";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { deleteLegal, saveLegal } from "@/lib/admin/content-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LegalRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  updated_label: string;
  intro: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  seo_title: string;
  seo_description: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

const blank: LegalRow = {
  id: "",
  slug: "",
  title: "",
  description: "",
  updated_label: "",
  intro: "",
  sections: [],
  seo_title: "",
  seo_description: "",
  status: "draft",
  published_at: null,
};

export default async function LegalEditorPage({
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
      .from("legal_documents")
      .select(
        "id,slug,title,description,updated_label,intro,sections,seo_title,seo_description,status,published_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (isMissingSchema(error)) return <SchemaNotice table="legal_documents" />;
    if (!data) notFound();
    row = data as LegalRow;
  }

  const editable = canEdit(user);

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={isNew ? "New legal document" : row.title}
        description={isNew ? "Create a document at /legal/slug." : `Editing /legal/${row.slug}`}
        actions={
          <>
            <Link href="/admin/legal" className="admin-btn admin-btn-ghost">
              All documents
            </Link>
            {!isNew && row.status === "published" ? (
              <Link
                href={`/legal/${row.slug}`}
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
        <EntityForm action={saveLegal} submitLabel={isNew ? "Create document" : "Save changes"}>
          <input type="hidden" name="id" value={isNew ? "" : row.id} />
          {!isNew ? <input type="hidden" name="slug" value={row.slug} /> : null}

          {editable ? (
            <>
              <Panel title="Document" columns={2}>
                <TextField name="title" label="Title" defaultValue={row.title} required />
                {isNew ? (
                  <TextField name="slug" label="Slug" defaultValue={row.slug} hint="Locked after creation." />
                ) : (
                  <ReadOnlyField label="Slug" value={`/legal/${row.slug}`} hint="Locked after creation." />
                )}
                <TextField
                  name="updated_label"
                  label="Updated label"
                  defaultValue={row.updated_label}
                  hint="Shown as “Last updated”. e.g. 5 November 2026."
                />
                <TextField name="description" label="Short description" defaultValue={row.description} />
                <TextareaField
                  name="intro"
                  label="Intro"
                  defaultValue={row.intro}
                  rows={4}
                  required
                  className="sm:col-span-2"
                />
              </Panel>

              <Panel title="Sections" description="Each section becomes a heading with paragraphs and an optional bullet list.">
                <Repeater
                  name="sections"
                  label="Sections"
                  addLabel="Add section"
                  initial={row.sections.map((section) => ({
                    heading: section.heading,
                    paragraphs: section.paragraphs.join("\n\n"),
                    bullets: (section.bullets ?? []).join("\n"),
                  }))}
                  fields={[
                    { name: "heading", label: "Heading", type: "text" },
                    { name: "paragraphs", label: "Paragraphs", type: "lines" },
                    { name: "bullets", label: "Bullets (optional)", type: "lines" },
                  ]}
                />
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
          <form action={deleteLegal} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="slug" value={row.slug} />
            <ConfirmButton message={`Delete “${row.title}”? This cannot be undone.`}>
              Delete document
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
