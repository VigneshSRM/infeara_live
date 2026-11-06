import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { Panel, PublishFields, TextField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { Repeater } from "@/components/admin/Repeater";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { deleteFaqGroup, saveFaqGroup } from "@/lib/admin/content-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { toIstInput } from "@/lib/admin/forms";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type FaqGroupRow = {
  id: string;
  title: string;
  intro: string;
  sort_order: number;
  items: { question: string; answer: string }[];
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

const blank: FaqGroupRow = {
  id: "",
  title: "",
  intro: "",
  sort_order: 0,
  items: [],
  status: "draft",
  published_at: null,
};

export default async function FaqGroupEditorPage({
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
  const editable = canEdit(user);

  if (!editable) {
    return (
      <>
        <PageHeader
          eyebrow="FAQs"
          title="Editor access required"
          description="SEO managers cannot change FAQ content."
        />
        <Link href="/admin/faqs" className="admin-btn admin-btn-ghost mt-6">
          Back to FAQ groups
        </Link>
      </>
    );
  }

  let row = blank;
  if (!isNew) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faq_groups")
      .select("id,title,intro,sort_order,items,status,published_at")
      .eq("id", id)
      .maybeSingle();

    if (isMissingSchema(error)) return <SchemaNotice table="faq_groups" />;
    if (!data) notFound();
    row = data as FaqGroupRow;
  }

  return (
    <>
      <PageHeader
        eyebrow="FAQs"
        title={isNew ? "New FAQ group" : row.title}
        description={isNew ? "Group related questions under one heading." : "Editing a published FAQ group."}
        actions={
          <Link href="/admin/faqs" className="admin-btn admin-btn-ghost">
            All groups
          </Link>
        }
      />

      {actionError ? (
        <p role="alert" className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink">
          {actionError}
        </p>
      ) : null}

      <div className="mt-6">
        <EntityForm action={saveFaqGroup} submitLabel={isNew ? "Create group" : "Save changes"}>
          <input type="hidden" name="id" value={isNew ? "" : row.id} />

          <Panel title="Group" columns={2}>
            <TextField name="title" label="Title" defaultValue={row.title} required />
            <TextField name="sort_order" type="number" label="Order" defaultValue={row.sort_order} />
            <TextareaField name="intro" label="Intro" defaultValue={row.intro} rows={2} className="sm:col-span-2" />
          </Panel>

          <Panel title="Questions">
            <Repeater
              name="items"
              label="Questions"
              addLabel="Add question"
              initial={row.items.map((item) => ({ question: item.question, answer: item.answer }))}
              fields={[
                { name: "question", label: "Question", type: "text" },
                { name: "answer", label: "Answer", type: "textarea" },
              ]}
            />
          </Panel>

          <Panel title="Publishing">
            <PublishFields status={row.status} publishedAt={toIstInput(row.published_at)} />
          </Panel>
        </EntityForm>

        {!isNew ? (
          <form action={deleteFaqGroup} className="mt-6 border-t border-navy/10 pt-5">
            <input type="hidden" name="id" value={row.id} />
            <ConfirmButton message={`Delete “${row.title}”? This cannot be undone.`}>
              Delete group
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </>
  );
}
