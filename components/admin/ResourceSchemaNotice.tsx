import { Card, PageHeader } from "./PageHeader";

/**
 * Shown on the sub-services, blogs, case studies and white papers screens while their tables do
 * not exist yet. The fix is one script, so the notice names it and says how to run it. It never
 * repeats a database message.
 */
export function ResourceSchemaNotice({ module, table }: { module: string; table: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title={`${module} need one setup step`}
        description="This screen reads a table that has not been created in the database yet."
      />
      <Card className="mt-6 space-y-3 text-[0.9rem] leading-relaxed text-charcoal/80">
        <p>
          Sub-services, blog posts, case studies and white papers are managed from one script. It creates their tables
          and the storage area for white-paper PDFs, and copies in what the website shows today so nothing disappears.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Open <code className="rounded bg-navy/5 px-1.5 py-0.5">supabase/apply/05-resource-modules.sql</code> in the
            repository on GitHub and copy all of it.
          </li>
          <li>
            In Supabase, open the SQL Editor, paste it into a new query, check that <strong>Role</strong> is{" "}
            <code className="rounded bg-navy/5 px-1.5 py-0.5">postgres</code>, and run it.
          </li>
          <li>Reload this page.</li>
        </ol>
        <p className="text-[0.84rem] text-charcoal/65">
          Safe to run twice: it never overwrites anything already there. Until it has run, the website keeps showing its
          built-in copy of this content. Missing table:{" "}
          <code className="rounded bg-navy/5 px-1.5 py-0.5">{table}</code>
        </p>
      </Card>
    </>
  );
}
