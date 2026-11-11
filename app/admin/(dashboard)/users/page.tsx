import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { ListError, ResourceTable, type Column } from "@/components/admin/ResourceTable";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { countListRows, fetchListPage } from "@/lib/admin/list-query";
import { isFiltered, listQueryString, parseListParams, type RawParams } from "@/lib/admin/list-params";
import { createStaffAccount, inviteUser, updateUserRole } from "@/lib/admin/user-actions";
import { ROLE_FILTER, USERS_PATH as PATH, USER_ROLES as ROLES, USER_ROLE_HELP as ROLE_HELP, WAITING_HREF } from "@/lib/admin/user-roles";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { hasServiceRole } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function UsersPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const actor = await requireSuperAdmin();
  const raw = await searchParams;
  // The role is this list's status, so it has no status dropdown of its own.
  const params = parseListParams(raw, [ROLE_FILTER], []);

  const [{ rows, window, error }, waiting] = await Promise.all([
    fetchListPage<Profile>({
      table: "profiles",
      columns: "id,email,full_name,role,created_at",
      params,
      searchColumns: ["full_name", "email"],
      extraColumns: { role: "role" },
      // Staff first, most access first (the database sorts a role by the order it declares them),
      // then the accounts waiting for a role. Oldest first within a role.
      order: [{ column: "role" }, { column: "created_at" }],
    }),
    // Everyone waiting for access, whatever the search or filter: the notice below is about them.
    countListRows({
      table: "profiles",
      params: { q: "", status: "all", page: 1, extra: { role: "pending" } },
      searchColumns: [],
      extraColumns: { role: "role" },
    }),
  ]);

  if (isMissingSchema(error)) return <SchemaNotice table="profiles" />;

  // The view the role buttons are on, so a change brings you back to it and not to page 1.
  const returnQuery = listQueryString(params);
  const showingWaiting = params.extra.role === "pending";

  const columns: Column<Profile>[] = [
    {
      header: "Person",
      className: "align-top",
      cell: (row) => (
        <>
          <p className="font-heading text-navy">{row.full_name ?? row.email}</p>
          {row.full_name ? <p className="text-[0.76rem] text-charcoal/60">{row.email}</p> : null}
          {row.id === actor.id ? (
            <span className="mt-1 inline-block rounded-sm bg-blue/10 px-2 py-0.5 font-heading text-[0.62rem] uppercase tracking-[0.1em] text-blue">
              You
            </span>
          ) : null}
        </>
      ),
    },
    {
      header: "Role",
      className: "align-top",
      cell: (row) => (
        <>
          <p className="text-charcoal">{ROLES.find((role) => role.value === row.role)?.label ?? row.role}</p>
          <p className="mt-0.5 max-w-[20rem] text-[0.74rem] leading-relaxed text-charcoal/60">{ROLE_HELP[row.role]}</p>
        </>
      ),
    },
    { header: "Added", className: "whitespace-nowrap align-top text-charcoal/70", cell: (row) => istLabel(row.created_at) },
    {
      header: "Change role",
      className: "align-top",
      cell: (row) => (
        <form action={updateUserRole} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="return_query" value={returnQuery} />
          <label className="sr-only" htmlFor={`role-${row.id}`}>
            Role for {row.email}
          </label>
          {row.role === "pending" ? (
            <>
              <select id={`role-${row.id}`} name="role" defaultValue="editor" className="admin-select !w-auto !py-1 !text-[0.8rem]">
                {ROLES.filter((role) => role.value !== "pending").map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="admin-btn admin-btn-primary !px-3 !py-1 !text-[0.74rem]">
                Admit
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </form>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Access"
        title="Users and roles"
        description="Three working roles, enforced by the database. A public signup always lands in pending."
      />

      <Flash saved={one(raw.saved) ?? (one(raw.invited) || one(raw.created) ? "created" : undefined)} error={one(raw.error)} />

      {waiting && !showingWaiting ? (
        <p className="mt-4 rounded-md border border-blue/25 bg-blue/8 px-4 py-3 text-[0.85rem] text-blue">
          {waiting} {waiting === 1 ? "account is" : "accounts are"} waiting for access and cannot read or change anything until
          you give {waiting === 1 ? "it" : "them"} a role.{" "}
          <Link href={WAITING_HREF} className="font-heading underline underline-offset-4">
            Show {waiting === 1 ? "it" : "them"}
          </Link>
        </p>
      ) : null}

      <ListToolbar
        action={PATH}
        params={params}
        label="Search users"
        placeholder="Name or email"
        extras={[ROLE_FILTER]}
        statuses={[]}
        showStatus={false}
      />

      {showingWaiting ? (
        <p className="mt-4 text-[0.82rem] text-charcoal/65">
          These accounts exist but cannot read or change anything until you give them a role.
        </p>
      ) : null}

      {error ? <ListError /> : null}

      <ResourceTable
        caption="Users and roles"
        rows={rows}
        columns={columns}
        filtered={isFiltered(params)}
        clearHref={PATH}
        emptyMessage="No staff accounts yet. Promote your own profile with the SQL below."
      />

      <Pager basePath={PATH} params={params} window={window} noun="accounts" />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="admin-card p-5">
          <h2 className="font-display text-lg text-navy">Add a colleague</h2>
          {hasServiceRole ? (
            <>
              <form action={createStaffAccount} className="mt-4 space-y-3">
                <div>
                  <label className="admin-label" htmlFor="new-email">
                    Email
                  </label>
                  <input id="new-email" name="email" type="email" required className="admin-input" />
                </div>
                <div>
                  <label className="admin-label" htmlFor="new-name">
                    Full name
                  </label>
                  <input id="new-name" name="full_name" className="admin-input" />
                </div>
                <div>
                  <label className="admin-label" htmlFor="new-role">
                    Role
                  </label>
                  <select id="new-role" name="role" defaultValue="editor" className="admin-select">
                    {ROLES.filter((role) => role.value !== "pending").map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-label" htmlFor="new-password">
                    Temporary password
                  </label>
                  <input
                    id="new-password"
                    name="password"
                    type="text"
                    minLength={12}
                    required
                    autoComplete="new-password"
                    className="admin-input font-mono"
                  />
                  <p className="mt-1 text-[0.74rem] leading-relaxed text-charcoal/60">
                    At least 12 characters. Share it with the person over a channel you trust; they can change it
                    after signing in.
                  </p>
                </div>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Create account
                </button>
              </form>

              <details className="mt-4 border-t border-navy/10 pt-4">
                <summary className="cursor-pointer font-heading text-[0.8rem] text-charcoal/75">
                  Send an invitation instead
                </summary>
                <form action={inviteUser} className="mt-3 space-y-3">
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
                  <button type="submit" className="admin-btn admin-btn-ghost">
                    Send invitation
                  </button>
                  <p className="text-[0.74rem] leading-relaxed text-charcoal/60">
                    Needs a configured mail provider in Supabase. Without one, use the temporary-password form
                    above.
                  </p>
                </form>
              </details>
            </>
          ) : (
            <div className="mt-3 space-y-3 text-[0.82rem] leading-relaxed text-charcoal/75">
              <p>
                Account creation is disabled because{" "}
                <code className="rounded bg-navy/5 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> is not set for
                this environment.
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
