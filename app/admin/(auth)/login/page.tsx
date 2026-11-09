import { redirect } from "next/navigation";
import Link from "next/link";
import { signIn, signOut } from "@/lib/admin/auth-actions";
import { Logo } from "@/components/brand/Logo";
import { getStaffAccess, type StaffAccess } from "@/lib/auth/dal";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  missing: "Enter your email address and password.",
  invalid: "That email and password combination was not accepted.",
  config: "Supabase is not configured for this environment.",
};

/**
 * A signed-in account the CMS will not open for. The sign-in itself worked, so
 * the copy says what is missing rather than repeating the form with nothing
 * said. Fixed text only: nothing from the database or the URL is echoed.
 */
type Blocked = Extract<StaffAccess, { status: "no_role" | "lookup_failed" }>;

const blockedCopy = {
  no_role: {
    title: "You are signed in, but this account has no CMS role yet",
    body: "Your password worked, but only accounts with a staff role can open the CMS. A super admin can assign one under Users. Setting up the first super admin? The README has the steps.",
  },
  permission: {
    title: "You are signed in, but the database blocked the staff lookup",
    body: "Your password worked. Supabase answered \"permission denied\" when the CMS read its staff list, so table permissions are missing on this project. The README has the one-time step that adds them.",
  },
  unavailable: {
    title: "You are signed in, but the staff lookup did not complete",
    body: "Your password worked, but the CMS could not read its staff list. Try again in a moment. If it keeps happening, check that the Supabase project is running and the schema migration has been applied (see the README).",
  },
} as const;

function blockedReason(access: Blocked): keyof typeof blockedCopy {
  return access.status === "no_role" ? "no_role" : access.cause;
}

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  if (!isSupabaseConfigured) {
    return <LoginShell notice={messages.config} disabled />;
  }

  const access = await getStaffAccess();
  if (access.status === "staff") redirect("/admin");

  const { error } = await searchParams;
  return (
    <LoginShell
      notice={error ? (messages[error] ?? messages.invalid) : undefined}
      blocked={access.status === "no_role" || access.status === "lookup_failed" ? access : undefined}
    />
  );
}

function LoginShell({
  notice,
  blocked,
  disabled = false,
}: {
  notice?: string;
  blocked?: Blocked;
  disabled?: boolean;
}) {
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

          {blocked ? <BlockedNotice access={blocked} /> : null}

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
              <p className="mt-2 text-right text-[0.78rem]">
                <Link href="/admin/reset-password" className="text-charcoal/70 underline underline-offset-4 hover:text-navy">
                  Forgot password?
                </Link>
              </p>
            </div>
            <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={disabled}>
              Sign in
            </button>
          </form>

          <p className="mt-6 text-[0.78rem] leading-relaxed text-charcoal/70">
            If the reset email does not arrive, ask a super admin. If you have just been invited,
            confirm your email first, then sign in.
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

function BlockedNotice({ access }: { access: Blocked }) {
  const copy = blockedCopy[blockedReason(access)];
  return (
    <div className="mt-5 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.84rem] text-coral-ink">
      <div role="alert">
        <p className="font-medium">{copy.title}</p>
        <p className="mt-1.5 leading-relaxed">{copy.body}</p>
      </div>
      {access.email ? <p className="mt-2 text-[0.8rem] opacity-80">Signed in as {access.email}</p> : null}
      <form action={signOut} className="mt-3">
        <button type="submit" className="admin-btn admin-btn-ghost">
          Sign out
        </button>
      </form>
    </div>
  );
}
