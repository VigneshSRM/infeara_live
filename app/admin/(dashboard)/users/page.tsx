import { Flash } from "@/components/admin/Flash";
import { PageHeader } from "@/components/admin/PageHeader";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { inviteUser, updateUserRole } from "@/lib/admin/user-actions";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { hasServiceRole } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ROLES = [
  { value: "super_admin", label: "Super admin" },
  { value: "editor", label: "Editor" },
  { value: "seo_manager", label: "SEO manager" },
  { value: "pending", label: "No access (pending)" },
];

const ROLE_HELP: Record<string, string> = {
  super_admin: "Everything, including users and deletions.",
  editor: "Create, edit, publish and delete content.",
  seo_manager: "Edit SEO titles, meta descriptions and publish dates only.",
  pending: "Signed up but has no access. Set a role to admit them.",
};

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; invited?: string; error?: string }>;
}) {
  const actor = await requireSuperAdmin();
  const flash = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at")
    .order("role")
    .order("created_at");

  if (isMissingSchema(error)) return <SchemaNotice table="profiles" />;

  const rows = (data ?? []) as Profile[];
  const staff = rows.filter((row) => row.role !== "pending");
  const pending = rows.filter((row) => row.role === "pending");

  return (
    <>
      <PageHeader
        eyebrow="Access"
        title="Users and roles"
        description="Three working roles, enforced by the database. A public signup always lands in pending."
      />

      <Flash saved={flash.saved ?? (flash.invited ? "created" : undefined)} error={flash.error} />

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink">
          {error.message}
        </p>
      ) : null}

      <div className="admin-card mt-6 overflow-hidden">
        <table className="w-full text-left text-[0.86rem]">
          <thead className="border-b border-navy/10 bg-ivory/50">
            <tr className="font-heading text-[0.68rem] uppercase tracking-[0.14em] text-charcoal/60">
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Change role</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/8">
            {staff.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-heading text-navy">{row.full_name ?? row.email}</p>
                  {row.full_name ? <p className="text-[0.76rem] text-charcoal/60">{row.email}</p> : null}
                  {row.id === actor.id ? (
                    <span className="mt-1 inline-block rounded-full bg-blue/10 px-2 py-0.5 font-heading text-[0.62rem] uppercase tracking-[0.1em] text-blue">
                      You
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="text-charcoal">{ROLES.find((role) => role.value === row.role)?.label ?? row.role}</p>
                  <p className="mt-0.5 max-w-[20rem] text-[0.74rem] leading-relaxed text-charcoal/60">
                    {ROLE_HELP[row.role]}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-charcoal/70">{istLabel(row.created_at)}</td>
                <td className="px-4 py-3">
                  <form action={updateUserRole} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <label className="sr-only" htmlFor={`role-${row.id}`}>
                      Role for {row.email}
                    </label>
                    <select id={`role-${row.id}`} name="role" defaultValue={row.role} className="admin-select !w-auto !py-1 !text-[0.8rem]">
                      {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="admin-btn admin-btn-ghost !px-3 !py-1 !text-[0.74rem]">
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!staff.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[0.86rem] text-charcoal/70">
                  No staff accounts yet. Promote your own profile with the SQL below.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {pending.length ? (
        <section className="mt-8">
          <h2 className="font-display text-xl text-navy">Waiting for access</h2>
          <p className="mt-1 text-[0.82rem] text-charcoal/65">
            These accounts exist but cannot read or change anything until you give them a role.
          </p>
          <ul className="admin-card mt-3 divide-y divide-navy/8">
            {pending.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-heading text-[0.88rem] text-navy">{row.email}</p>
                  <p className="text-[0.74rem] text-charcoal/60">Signed up {istLabel(row.created_at)}</p>
                </div>
                <form action={updateUserRole} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={row.id} />
                  <label className="sr-only" htmlFor={`pending-role-${row.id}`}>
                    Role for {row.email}
                  </label>
                  <select
                    id={`pending-role-${row.id}`}
                    name="role"
                    defaultValue="editor"
                    className="admin-select !w-auto !py-1 !text-[0.8rem]"
                  >
                    {ROLES.filter((role) => role.value !== "pending").map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="admin-btn admin-btn-primary !px-3 !py-1 !text-[0.74rem]">
                    Admit
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="admin-card p-5">
          <h2 className="font-display text-lg text-navy">Add a colleague</h2>
          {hasServiceRole ? (
            <form action={inviteUser} className="mt-4 space-y-3">
              <div>
                <label className="admin-label" htmlFor="invite-email">
                  Email
                </label>
                <input id="invite-email" name="email" type="email" required className="admin-input" />
              </div>
              <div>
                <label className="admin-label" htmlFor="invite-name">
                  Full name
                </label>
                <input id="invite-name" name="full_name" className="admin-input" />
              </div>
              <div>
                <label className="admin-label" htmlFor="invite-role">
                  Role
                </label>
                <select id="invite-role" name="role" defaultValue="editor" className="admin-select">
                  {ROLES.filter((role) => role.value !== "pending").map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Send invitation
              </button>
              <p className="text-[0.74rem] leading-relaxed text-charcoal/60">
                Requires a configured mail provider in Supabase, not the built-in rate-limited sender.
              </p>
            </form>
          ) : (
            <div className="mt-3 space-y-3 text-[0.82rem] leading-relaxed text-charcoal/75">
              <p>
                Invitations are disabled because <code className="rounded bg-navy/5 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
                is not set for this environment.
              </p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  Create the user in Supabase under <strong>Authentication → Users</strong>.
                </li>
                <li>They confirm the email, then appear here as pending.</li>
                <li>Give them a role in this screen.</li>
              </ol>
              <p className="text-[0.78rem] text-charcoal/60">
                Add the secret key and a mail provider to enable one-click invitations.
              </p>
            </div>
          )}
        </div>

        <div className="admin-card p-5">
          <h2 className="font-display text-lg text-navy">First super admin</h2>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-charcoal/75">
            Accounts are never created with a role. Promote your own profile once in the SQL editor:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-navy p-4 text-[0.78rem] leading-relaxed text-ivory">
{`update public.profiles
set role = 'super_admin'
where email = 'you@infeara.com';`}
          </pre>
          <p className="mt-3 text-[0.78rem] leading-relaxed text-charcoal/60">
            The last super admin cannot be demoted, and nobody can remove their own super admin role.
          </p>
        </div>
      </section>
    </>
  );
}
