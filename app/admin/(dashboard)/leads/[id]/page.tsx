import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { SelectField, TextareaField } from "@/components/admin/Field";
import { PageHeader } from "@/components/admin/PageHeader";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { deleteLead, updateLead } from "@/lib/admin/lead-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
];

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  topic: string | null;
  message: string;
  source_page: string | null;
  status: "new" | "contacted" | "qualified" | "closed" | "spam";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await requireStaff();
  const { id } = await params;
  const flash = await searchParams;

  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();

  if (isMissingSchema(error)) return <SchemaNotice table="leads" />;
  if (!data) notFound();

  const lead = data as Lead;
  const editable = canEdit(user);

  return (
    <>
      <PageHeader
        eyebrow="Lead"
        title={lead.name}
        description={`${lead.company ?? "No organisation"} · received ${istLabel(lead.created_at)}`}
        actions={
          <>
            <Link href="/admin/leads" className="admin-btn admin-btn-ghost">
              All leads
            </Link>
            <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Infeara enquiry — ${lead.topic ?? "General"}`)}`} className="admin-btn admin-btn-primary">
              Reply by email
            </a>
          </>
        }
      />

      <Flash saved={flash.saved} error={flash.error} />

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink">
          {error.message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="admin-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg text-navy">Enquiry</h2>
            <StatusBadge status={lead.status} />
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Detail label="Name" value={lead.name} />
            <Detail label="Email" value={lead.email} href={`mailto:${lead.email}`} />
            <Detail label="Company" value={lead.company ?? "—"} />
            <Detail label="Phone" value={lead.phone ?? "—"} href={lead.phone ? `tel:${lead.phone}` : undefined} />
            <Detail label="Topic" value={lead.topic ?? "General"} />
            <Detail label="Source page" value={lead.source_page ?? "—"} />
          </dl>

          <div className="mt-5 border-t border-navy/10 pt-4">
            <p className="admin-label">Message</p>
            <p className="whitespace-pre-line text-[0.9rem] leading-relaxed text-charcoal">{lead.message}</p>
          </div>
        </section>

        <section className="space-y-6">
          <form action={updateLead} className="admin-card space-y-4 p-5">
            <h2 className="font-display text-lg text-navy">Triage</h2>
            <input type="hidden" name="id" value={lead.id} />
            <SelectField name="status" label="Status" defaultValue={lead.status} options={STATUS_OPTIONS} />
            <TextareaField
              name="notes"
              label="Internal notes"
              defaultValue={lead.notes}
              rows={6}
              hint="Only staff can read this."
            />
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="admin-btn admin-btn-primary">
                Save
              </button>
              <span className="text-[0.74rem] text-charcoal/60">Updated {istLabel(lead.updated_at)}</span>
            </div>
          </form>

          {editable ? (
            <form action={deleteLead} className="admin-card p-5">
              <input type="hidden" name="id" value={lead.id} />
              <p className="text-[0.8rem] leading-relaxed text-charcoal/65">
                Deleting removes the enquiry and its notes permanently. Spam is usually better marked as spam.
              </p>
              <div className="mt-3">
                <ConfirmButton message={`Delete the enquiry from ${lead.name}?`}>
                  Delete lead
                </ConfirmButton>
              </div>
            </form>
          ) : null}
        </section>
      </div>
    </>
  );
}

function Detail({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="admin-label mb-1">{label}</dt>
      <dd className="text-[0.9rem] text-charcoal">
        {href ? (
          <a href={href} className="text-blue underline underline-offset-4">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
