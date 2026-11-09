/**
 * Decides what a signed-in visitor is allowed to see, from two facts: who the
 * auth server says they are, and what the `profiles` lookup returned.
 *
 * Pure on purpose (no Next, no Supabase) so the rules can be tested on their
 * own and the sign-in page and the dashboard guard cannot disagree about who
 * gets in. `lib/auth/dal.ts` does the fetching and calls this.
 */

export type StaffRole = "super_admin" | "editor" | "seo_manager";

export type StaffUser = {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
};

/** Why a profile that should have been readable could not be read. */
export type LookupFailure = "permission" | "unavailable";

export type StaffAccess =
  /** Nobody is signed in, or Supabase is not configured here. */
  | { status: "anonymous" }
  /** Signed in, and the profile carries one of the three working roles. */
  | { status: "staff"; user: StaffUser }
  /**
   * Signed in, but the account has no staff role: no profile row, or `pending`.
   * Row-level security hides a pending profile from its owner, so the two look
   * identical from here and are reported as one outcome.
   */
  | { status: "no_role"; email: string }
  /** Signed in, but the profile lookup itself failed. */
  | { status: "lookup_failed"; email: string; cause: LookupFailure };

export type ProfileRow = {
  email: string | null;
  full_name: string | null;
  role: string;
};

export type LookupError = {
  code?: string | null;
  message?: string | null;
};

const STAFF_ROLES: readonly string[] = ["super_admin", "editor", "seo_manager"];

export function isStaffRole(role: string): role is StaffRole {
  return STAFF_ROLES.includes(role);
}

/**
 * Postgres reports a missing table grant as 42501 ("permission denied for
 * table profiles"). Anything else (project paused, table missing, network)
 * is reported as the generic "unavailable".
 */
function lookupFailure(error: LookupError): LookupFailure {
  if (error.code === "42501" || /permission denied/i.test(error.message ?? "")) return "permission";
  return "unavailable";
}

export function resolveStaffAccess(input: {
  user: { id: string; email?: string | null } | null;
  profile: ProfileRow | null;
  error: LookupError | null;
}): StaffAccess {
  const { user, profile, error } = input;
  if (!user) return { status: "anonymous" };

  // A failed lookup is not "no profile": treating it that way is what used to
  // send a signed-in person back to the sign-in page with no explanation.
  if (error) {
    return { status: "lookup_failed", email: user.email ?? "", cause: lookupFailure(error) };
  }

  if (!profile || !isStaffRole(profile.role)) {
    return { status: "no_role", email: user.email ?? profile?.email ?? "" };
  }

  return {
    status: "staff",
    user: {
      id: user.id,
      email: profile.email ?? user.email ?? "",
      name: profile.full_name,
      role: profile.role,
    },
  };
}
