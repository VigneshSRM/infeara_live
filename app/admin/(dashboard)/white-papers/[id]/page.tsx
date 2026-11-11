import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { Panel, PublishFields, ReadOnlyField, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { PdfUploader, type AttachedPdf } from "@/components/admin/PdfUploader";
import { ResourceSchemaNotice } from "@/components/admin/ResourceSchemaNotice";
import { SeoPanel } from "@/components/admin/SeoPanel";
import { deleteWhitePaper, saveWhitePaper } from "@/lib/admin/resource-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { tableIsMissing } from "@/lib/admin/list-query";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COLUMNS =
  "id,slug,title,summary,topic,file_path,file_name,file_size_bytes,external_url,sort_order,seo_title,seo_description,status,published_at";

type Row = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  topic: string;
  file_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  external_url: string | null;
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
  summary: "",
  topic: "General",
  file_path: null,
  file_name: null,
  file_size_bytes: null,
  external_url: null,
  sort_order: 0,
  seo_title: "",
  seo_description: "",
  status: "draft",
  published_at: null,
};

export default async function WhitePaperEditorPage({
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
  if (isNew) {
    if (await tableIsMissing("white_papers")) return <ResourceSchemaNotice module="White papers" table="white_papers" />;
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase.from("white_papers").select(COLUMNS).eq("id", id).maybeSingle();

    if (isMissingSchema(error)) return <ResourceSchemaNotice module="White papers" table="white_papers" />;
    if (!data) notFound();
    row = data as Row;
  }

  const editable = canEdit(user);
  const attached: AttachedPdf | null = row.file_path
    ? { path: row.file_path, name: row.file_name ?? row.file_path.split("/").pop() ?? "paper.pdf", size: row.file_size_bytes }
    : null;

  return (
    <>
      <PageHeader
        eyebrow="White papers"
        title={isNew ? "New white paper" : row.title}
        description={isNew ? "Add a paper. Its address will be /white-papers/slug." : `Editing /white-papers/${row.slug}`}
        actions={
          <>
            <Link href="/admin/white-papers" className="admin-btn admin-btn-ghost">
              All white papers
            </Link>
            {!isNew && row.status === "published" ? (
              <Link href={`/white-papers/${row.slug}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost">
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
        <EntityForm action={saveWhitePaper} submitLabel={isNew ? "Create white paper" : "Save changes"}>
          <input type="hidden" name="id" value={isNew ? "" : row.id} />
          {!isNew ? <input type="hidden" name="slug" value={row.slug} /> : null}

          {editable ? (
            <>
              <Panel title="Paper details" columns={2}>
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
                  <ReadOnlyField label="Slug" value={`/white-papers/${row.slug}`} hint="Locked after creation." />
                )}
                <TextField name="topic" label="Topic" defaultValue={row.topic} hint="Shown above the title, for example Recovery." />
                <TextareaField
                  name="summary"
                  label="Summary"
                  defaultValue={row.summary}
                  rows={4}
                  required
                  hint="What the paper covers, in a few sentences. Shown on the list and the paper's page."
                  className="sm:col-span-2"
                />
                <TextField
                  name="sort_order"
                  type="number"
                  label="Order"
                  defaultValue={row.sort_order}
                  hint="Lower numbers come first on the white papers page."
                />
              </Panel>

              <Panel
                title="The file"
                description="Readers open the paper straight from its link, with no form in front of it."
              >
                <PdfUploader initial={attached} />
                <TextField
                  name="external_url"
                  label="Or link to a file kept elsewhere"
                  defaultValue={row.external_url}
                  placeholder="https://"
                  hint="Used only when no PDF is attached. An uploaded PDF always wins."
                />
              </Panel>
            </>
          ) : null}

          <SeoPanel
            seoTitle={row.seo_title}
            seoDescription={row.seo_description}
            editable={editable}
            fallbackNote="the paper's title and summary"
          />

          {editable ? (
            <Panel title="Publishing">
              <PublishFields status={row.status} publishedAt={toIstInput(row.published_at)} />
            </Panel>
          ) : null}
        </EntityForm>

        {!isNew && editable ? (
          <form action={deleteWhitePaper} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="slug" value={row.slug} />
            <ConfirmButton message={`Delete “${row.title}”? This removes the paper and its PDF, and cannot be undone.`}>
              Delete white paper
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
