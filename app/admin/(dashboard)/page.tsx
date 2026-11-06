import Link from "next/link";
import { PageHeader, Card, EmptyState } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchema } from "@/lib/admin/errors";

export const dynamic = "force-dynamic";

const when = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function AdminOverview({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; welcome?: string }>;
}) {
  const user = await requireStaff();
  const { denied, welcome } = await searchParams;
  const supabase = await createClient();

  const [newLeads, leads, services, industries, insights, media, audit] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("leads")
      .select("id,name,email,company,topic,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("services").select("id,status"),
    supabase.from("industries").select("id,status"),
    supabase.from("insights").select("id,status,published_at"),
    supabase.from("media").select("id", { count: "exact", head: true }),
    supabase
      .from("audit_log")
      .select("id,actor_email,action,table_name,created_at")
      .order("created_at", { ascending: false })
      .limit(7),
  ]);

  const failure =
    [leads, services, industries, insights, media, audit].find((result) => result.error)?.error ??
    null;

  if (isMissingSchema(failure)) {
    return (
      <>
        <PageHeader
          eyebrow="Setup"
          title="Apply the database migration"
          description="The CMS is connected but the tables do not exist yet. This is a one-time step."
        />
        <Card className="mt-6 space-y-4 text-[0.9rem] leading-relaxed text-charcoal/80">
          <p>
            In the Supabase dashboard for this project, open <strong>SQL Editor</strong> and run:
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <code className="rounded bg-navy/5 px-1.5 py-0.5 text-[0.84rem]">
                supabase/migrations/20261106090000_cms_schema.sql
              </code>
            </li>
            <li>
              <code className="rounded bg-navy/5 px-1.5 py-0.5 text-[0.84rem]">supabase/seed.sql</code>
            </li>
          </ol>
          <p>
            Then create your user under <strong>Authentication → Users</strong>, and promote the profile:
          </p>
          <pre className="overflow-x-auto rounded-md bg-navy p-4 text-[0.8rem] text-ivory">
{`update public.profiles
set role = 'super_admin'
where email = 'you@infeara.com';`}
          </pre>
          <p>Reload this page afterwards.</p>
        </Card>
      </>
    );
  }

  const counts = {
    services: services.data?.length ?? 0,
    industries: industries.data?.length ?? 0,
    insights: insights.data?.length ?? 0,
    drafts: [services, industries, insights]
      .flatMap((result) => result.data ?? [])
      .filter((row) => row.status === "draft").length,
    media: media.count ?? 0,
    newLeads: newLeads.count ?? 0,
  };

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you${user.name ? `, ${user.name.split(" ")[0]}` : ""}.`}
        description="What needs attention, what changed recently, and where the site currently stands."
        actions={
          <Link href="/" className="admin-btn admin-btn-ghost" target="_blank" rel="noreferrer">
            View site ↗
          </Link>
        }
      />

      {denied ? (
        <p
          role="status"
          className="mt-5 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink"
        >
          {denied === "super_admin"
            ? "Only a super admin can manage users."
            : "Your role cannot create or delete content. You can still edit SEO fields."}
        </p>
      ) : null}

      {welcome ? (
        <p className="mt-5 rounded-md border border-blue/25 bg-blue/8 px-4 py-3 text-[0.85rem] text-blue">
          You are signed in. If this is your first visit, run the migration and seed.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New leads" value={counts.newLeads} href="/admin/leads" accent />
        <Stat label="Drafts" value={counts.drafts} href="/admin/services" />
        <Stat label="Published practices" value={counts.services} href="/admin/services" />
        <Stat label="Published insights" value={counts.insights} href="/admin/insights" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-xl tracking-[-0.01em] text-navy">Latest enquiries</h2>
            <Link href="/admin/leads" className="text-[0.8rem] text-blue underline underline-offset-4">
              All leads
            </Link>
          </div>

          <div className="mt-3 admin-card overflow-hidden">
            {leads.data?.length ? (
              <ul className="divide-y divide-navy/8">
                {leads.data.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-ivory/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-heading text-[0.86rem] text-navy">
                          {lead.name} · {lead.company ?? "No organisation"}
                        </p>
                        <p className="mt-0.5 truncate text-[0.78rem] text-charcoal/70">
                          {lead.topic ?? "General"} — {lead.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={lead.status} />
                        <span className="text-[0.72rem] text-charcoal/60">{when(lead.created_at)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-[0.85rem] text-charcoal/70">
                No enquiries yet. The contact form writes here once the migration is applied.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-xl tracking-[-0.01em] text-navy">Recent changes</h2>
            <Link href="/admin/audit" className="text-[0.8rem] text-blue underline underline-offset-4">
              Audit log
            </Link>
          </div>

          <div className="mt-3 admin-card p-4">
            {audit.data?.length ? (
              <ul className="space-y-3">
                {audit.data.map((entry) => (
                  <li key={entry.id} className="text-[0.8rem] leading-relaxed text-charcoal/80">
                    <span className="font-heading text-navy">{entry.actor_email ?? "System"}</span>{" "}
                    {entry.action === "insert" ? "created" : entry.action === "delete" ? "deleted" : "updated"}{" "}
                    <span className="font-heading text-navy">{entry.table_name}</span>
                    <span className="block text-[0.72rem] text-charcoal/60">{when(entry.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-[0.84rem] text-charcoal/70">No changes recorded yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/industries" className="admin-card px-4 py-4 hover:border-blue/40">
          <p className="font-heading text-[0.8rem] text-navy">Industries</p>
          <p className="mt-1 text-[0.78rem] text-charcoal/70">{counts.industries} in the database</p>
        </Link>
        <Link href="/admin/media" className="admin-card px-4 py-4 hover:border-blue/40">
          <p className="font-heading text-[0.8rem] text-navy">Media library</p>
          <p className="mt-1 text-[0.78rem] text-charcoal/70">{counts.media} files</p>
        </Link>
        <Link href="/admin/faqs" className="admin-card px-4 py-4 hover:border-blue/40">
          <p className="font-heading text-[0.8rem] text-navy">FAQs</p>
          <p className="mt-1 text-[0.78rem] text-charcoal/70">Five groups on the public page</p>
        </Link>
      </div>

      {!leads.data?.length && !counts.services ? (
        <div className="mt-8">
          <EmptyState title="Nothing published yet">
            Run the seed to bring the database to content parity with the frontend, then edit from here.
          </EmptyState>
        </div>
      ) : null}
    </>
  );
}

function Stat({
  label,
  value,
  href,
  accent = false,
}: {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`admin-card px-4 py-4 transition-colors hover:border-blue/40 ${accent ? "border-coral/40" : ""}`}
    >
      <p className="font-heading text-[0.68rem] uppercase tracking-[0.16em] text-charcoal/65">{label}</p>
      <p className={`mt-2 font-display text-3xl leading-none ${accent ? "text-coral-ink" : "text-navy"}`}>
        {value}
      </p>
    </Link>
  );
}
