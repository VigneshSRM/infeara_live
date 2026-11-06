import { Card, PageHeader } from "./PageHeader";

export function SchemaNotice({ table }: { table?: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title="The database schema is not in place"
        description="This screen queries a table that does not exist yet."
      />
      <Card className="mt-6 space-y-3 text-[0.9rem] leading-relaxed text-charcoal/80">
        <p>
          Run the migration and seed in the Supabase SQL editor, in this order:
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>supabase/migrations/20261106090000_cms_schema.sql</li>
          <li>supabase/seed.sql</li>
        </ol>
        {table ? (
          <p className="text-[0.84rem] text-charcoal/65">
            Missing relation: <code className="rounded bg-navy/5 px-1.5 py-0.5">{table}</code>
          </p>
        ) : null}
      </Card>
    </>
  );
}
