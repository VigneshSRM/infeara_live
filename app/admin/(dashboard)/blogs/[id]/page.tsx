import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { FigureSeedField } from "@/components/admin/FigureSeedField";
import { Panel, PublishFields, ReadOnlyField, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { Repeater } from "@/components/admin/Repeater";
import { ResourceSchemaNotice } from "@/components/admin/ResourceSchemaNotice";
import { SeoPanel } from "@/components/admin/SeoPanel";
import { deleteBlog, saveBlog } from "@/lib/admin/resource-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { tableIsMissing } from "@/lib/admin/list-query";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COLUMNS =
  "id,slug,title,excerpt,category,reading_minutes,body,figure_seed,related_services,seo_title,seo_description,status,published_at";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  reading_minutes: number | null;
  body: { heading?: string; paragraphs?: string[] }[] | null;
  figure_seed: number;
  related_services: { label?: string; href?: string }[] | null;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

const blank: BlogRow = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  category: "General",
  reading_minutes: null,
  body: [],
  figure_seed: 1,
  related_services: [],
  seo_title: "",
  seo_description: "",
  status: "draft",
  published_at: null,
};

export default async function BlogEditorPage({
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
    if (await tableIsMissing("blog_posts")) return <ResourceSchemaNotice module="Blog posts" table="blog_posts" />;
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase.from("blog_posts").select(COLUMNS).eq("id", id).maybeSingle();

    if (isMissingSchema(error)) return <ResourceSchemaNotice module="Blog posts" table="blog_posts" />;
    if (!data) notFound();
    row = data as BlogRow;
  }

  const editable = canEdit(user);

  return (
    <>
      <PageHeader
        eyebrow="Blog posts"
        title={isNew ? "New post" : row.title}
        description={isNew ? "Write a post. Its address will be /blogs/slug." : `Editing /blogs/${row.slug}`}
        actions={
          <>
            <Link href="/admin/blogs" className="admin-btn admin-btn-ghost">
              All posts
            </Link>
            {!isNew && row.status === "published" ? (
              <Link href={`/blogs/${row.slug}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost">
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
        <EntityForm action={saveBlog} submitLabel={isNew ? "Create post" : "Save changes"}>
          <input type="hidden" name="id" value={isNew ? "" : row.id} />
          {!isNew ? <input type="hidden" name="slug" value={row.slug} /> : null}

          {editable ? (
            <>
              <Panel title="Post details" columns={2}>
                <TextField
                  name="title"
                  label="Title"
                  defaultValue={row.title}
                  hint="One page per topic: if a post on this subject already exists, update it instead of publishing another version of the same list."
                  required
                  className="sm:col-span-2"
                />
                {isNew ? (
                  <TextField
                    name="slug"
                    label="Slug"
                    defaultValue={row.slug}
                    hint="Lowercase words separated by hyphens. Locked after creation."
                    required
                  />
                ) : (
                  <ReadOnlyField label="Slug" value={`/blogs/${row.slug}`} hint="Locked after creation." />
                )}
                <TextField name="category" label="Category" defaultValue={row.category} />
                <TextField
                  name="reading_minutes"
                  type="number"
                  label="Reading minutes"
                  defaultValue={row.reading_minutes}
                  hint="Leave empty to work it out from the text."
                />
                <TextareaField
                  name="excerpt"
                  label="Excerpt"
                  defaultValue={row.excerpt}
                  rows={3}
                  required
                  hint="Shown on cards and under the title."
                  className="sm:col-span-2"
                />
              </Panel>

              <Panel title="Picture" description="The photograph beside the post and on its card." columns={2}>
                <FigureSeedField defaultValue={row.figure_seed} />
              </Panel>

              <Panel
                title="Body"
                description="One block per heading. Each line is a paragraph. Start a line with “- ” for a bullet or “### ” for a sub-heading, write [text](https://example.com) for a link (a path such as /contact for a page on this site) and **text** for bold."
              >
                <Repeater
                  name="body"
                  label="Sections"
                  addLabel="Add section"
                  initial={(row.body ?? []).map((section) => ({
                    heading: section.heading ?? "",
                    paragraphs: (section.paragraphs ?? []).join("\n\n"),
                  }))}
                  fields={[
                    { name: "heading", label: "Heading", type: "text" },
                    { name: "paragraphs", label: "Paragraphs", type: "lines" },
                  ]}
                />
              </Panel>

              <Panel
                title="Related services"
                description="Buttons at the end of the post. The first one is the main button."
              >
                <Repeater
                  name="related_services"
                  label="Links"
                  addLabel="Add link"
                  hint="Use a path on this site, such as /services/managed-it."
                  initial={(row.related_services ?? []).map((link) => ({ label: link.label ?? "", href: link.href ?? "" }))}
                  fields={[
                    { name: "label", label: "Button text", type: "text" },
                    { name: "href", label: "Link", type: "text", placeholder: "/services/…" },
                  ]}
                />
              </Panel>
            </>
          ) : null}

          <SeoPanel
            seoTitle={row.seo_title}
            seoDescription={row.seo_description}
            editable={editable}
            fallbackNote="the post's title and excerpt"
          />

          {editable ? (
            <Panel title="Publishing">
              <PublishFields status={row.status} publishedAt={toIstInput(row.published_at)} />
            </Panel>
          ) : null}
        </EntityForm>

        {!isNew && editable ? (
          <form action={deleteBlog} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="slug" value={row.slug} />
            <ConfirmButton message={`Delete “${row.title}”? This removes the post and cannot be undone.`}>
              Delete post
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
