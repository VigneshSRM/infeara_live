import { redirect } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/admin/auth-actions";
import { Logo } from "@/components/brand/Logo";
import { getStaffUser } from "@/lib/auth/dal";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  missing: "Enter your email address and password.",
  invalid: "That email and password combination was not accepted.",
  config: "Supabase is not configured for this environment.",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  if (!isSupabaseConfigured) {
    return <LoginShell notice={messages.config} disabled />;
  }

  const staff = await getStaffUser();
  if (staff) redirect("/admin");

  const { error } = await searchParams;
  return <LoginShell notice={error ? (messages[error] ?? messages.invalid) : undefined} />;
}

function LoginShell({ notice, disabled = false }: { notice?: string; disabled?: boolean }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-navy p-12 text-ivory lg:flex lg:flex-col">
        <div className="relative">
          <Logo variant="light" preload className="h-12 md:h-14" sizes="280px" />
          <p className="mt-3 font-heading text-[10px] uppercase tracking-[0.24em] text-ivory/70">
            Content operations
          </p>
        </div>

        <div className="relative mt-auto max-w-[26rem]">
          <p className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.02em]">
            The site is the record. Everything published here is accountable.
          </p>
          <p className="mt-5 text-[0.92rem] leading-relaxed text-ivory/75">
            Three roles, a full audit trail, and scheduled publishing. Nothing goes live by accident.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[24rem]">
          <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-blue">Sign in</p>
          <h1 className="mt-4">
            <Logo variant="dark" preload className="h-10 md:h-12" sizes="300px" />
          </h1>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-charcoal/75">
            Staff access only. Accounts are created by a super admin.
          </p>

          {notice ? (
            <p
              role="alert"
              className="mt-5 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.84rem] text-coral-ink"
            >
              {notice}
            </p>
          ) : null}

          <form action={signIn} className="mt-6 space-y-4">
            <div>
              <label className="admin-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={disabled}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={disabled}
                className="admin-input"
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={disabled}>
              Sign in
            </button>
          </form>

          <p className="mt-6 text-[0.78rem] leading-relaxed text-charcoal/70">
            Password resets are handled by a super admin. If you have just been invited, confirm your
            email first, then sign in.
          </p>
          <p className="mt-3 text-[0.78rem] text-charcoal/70">
            <Link href="/" className="underline underline-offset-4 hover:text-navy">
              Back to the website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
