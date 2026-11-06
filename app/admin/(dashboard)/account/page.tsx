import { PageHeader } from "@/components/admin/PageHeader";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { requireStaff } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

const ROLE_LABEL = {
  super_admin: "Super admin",
  editor: "Editor",
  seo_manager: "SEO manager",
} as const;

export default async function AccountPage() {
  const user = await requireStaff();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Your account"
        description="Change the password you use to sign in to the CMS."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="admin-card p-5">
          <h2 className="font-display text-lg text-navy">Profile</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="admin-label mb-1">Email</dt>
              <dd className="text-[0.9rem] text-charcoal">{user.email}</dd>
            </div>
            <div>
              <dt className="admin-label mb-1">Name</dt>
              <dd className="text-[0.9rem] text-charcoal">{user.name ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="admin-label mb-1">Role</dt>
              <dd className="text-[0.9rem] text-charcoal">{ROLE_LABEL[user.role]}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.8rem] leading-relaxed text-charcoal/65">
            Name and role are managed by a super admin. Ask them if something is wrong.
          </p>
        </section>

        <section className="admin-card p-5">
          <h2 className="font-display text-lg text-navy">Change password</h2>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-charcoal/65">
            Password-reset email may not be configured, so this is the reliable way to rotate a password.
          </p>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
