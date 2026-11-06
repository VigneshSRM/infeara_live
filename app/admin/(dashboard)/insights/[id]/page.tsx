import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { Panel, PublishFields, ReadOnlyField, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { Repeater } from "@/components/admin/Repeater";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { deleteInsight, saveInsight } from "@/lib/admin/content-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type InsightRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  reading_minutes: number;
  published_at: string | null;
  body: { heading: string; paragraphs: string[] }[];
  seo_title: string;
  seo_description: string;
  status: "draft" | "published" | "archived";
};

const blank: InsightRow = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  category: "Insight",
  reading_minutes: 5,
  published_at: null,
  body: [],
  seo_title: "",
  seo_description: "",
  status: "draft",
};

export default async function InsightEditorPage({
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
      .from("insights")
      .select(
        "id,slug,title,excerpt,category,reading_minutes,published_at,body,seo_title,seo_description,status",
      )
      .eq("id", id)
      .maybeSingle();

    if (isMissingSchema(error)) return <SchemaNotice table="insights" />;
    if (!data) notFound();
    row = data as InsightRow;
  }

  const editable = canEdit(user);

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title={isNew ? "New article" : row.title}
        description={isNew ? "Write an article. The slug becomes /insights/slug." : `Editing /insights/${row.slug}`}
        actions={
          <>
            <Link href="/admin/insights" className="admin-btn admin-btn-ghost">
              All articles
            </Link>
            {!isNew && row.status === "published" ? (
              <Link
                href={`/insights/${row.slug}`}
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
        <EntityForm action={saveInsight} submitLabel={isNew ? "Create article" : "Save changes"}>
          <input type="hidden" name="id" value={isNew ? "" : row.id} />
          {!isNew ? <input type="hidden" name="slug" value={row.slug} /> : null}

          {editable ? (
            <>
              <Panel title="Article" columns={2}>
                <TextField name="title" label="Title" defaultValue={row.title} required className="sm:col-span-2" />
                {isNew ? (
                  <TextField name="slug" label="Slug" defaultValue={row.slug} hint="Locked after creation." />
                ) : (
                  <ReadOnlyField label="Slug" value={`/insights/${row.slug}`} hint="Locked after creation." />
                )}
                <TextField name="category" label="Category" defaultValue={row.category} />
                <TextField name="reading_minutes" type="number" label="Reading minutes" defaultValue={row.reading_minutes} />
                <TextareaField
                  name="excerpt"
                  label="Excerpt"
                  defaultValue={row.excerpt}
                  rows={3}
                  required
                  hint="Used on cards and as the summary."
                  className="sm:col-span-2"
                />
              </Panel>

              <Panel title="Body" description="One block per heading. Paragraphs are split on blank lines or newlines.">
                <Repeater
                  name="body"
                  label="Sections"
                  addLabel="Add section"
                  initial={row.body.map((section) => ({
                    heading: section.heading,
                    paragraphs: section.paragraphs.join("\n\n"),
                  }))}
                  fields={[
                    { name: "heading", label: "Heading", type: "text" },
                    { name: "paragraphs", label: "Paragraphs", type: "lines" },
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
          <form action={deleteInsight} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="slug" value={row.slug} />
            <ConfirmButton message={`Delete “${row.title}”? This cannot be undone.`}>
              Delete article
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
