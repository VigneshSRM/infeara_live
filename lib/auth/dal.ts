import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveStaffAccess, type StaffAccess, type StaffRole, type StaffUser } from "./access";

export type { StaffAccess, StaffRole, StaffUser };

/**
 * The single place that turns a Supabase session into a staff identity.
 *
 * A session alone is not enough: the profile must exist and its role must be
 * one of the three working roles. Public signups land in `pending` and are
 * not admitted. The outcome says *why* someone is not admitted, so the sign-in
 * page can tell a signed-in person what is wrong instead of showing the form
 * again with no explanation.
 */
export const getStaffAccess = cache(async (): Promise<StaffAccess> => {
  if (!isSupabaseConfigured) return { status: "anonymous" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const access = resolveStaffAccess({ user, profile, error });

  if (access.status === "lookup_failed") {
    // The page shows fixed copy. The database's own wording stays in the log.
    console.error("[auth] staff profile lookup failed:", error?.code ?? "no code", error?.message ?? "");
  }

  return access;
});

/** The admitted staff member, or null for anyone who is not let in. */
export async function getStaffUser(): Promise<StaffUser | null> {
  const access = await getStaffAccess();
  return access.status === "staff" ? access.user : null;
}

export async function requireStaff(): Promise<StaffUser> {
  const user = await getStaffUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireEditor(): Promise<StaffUser> {
  const user = await requireStaff();
  if (user.role === "seo_manager") redirect("/admin?denied=editor");
  return user;
}

export async function requireSuperAdmin(): Promise<StaffUser> {
  const user = await requireStaff();
  if (user.role !== "super_admin") redirect("/admin?denied=super_admin");
  return user;
}

export function canEdit(user: StaffUser) {
  return user.role === "super_admin" || user.role === "editor";
}

export function canManageUsers(user: StaffUser) {
  return user.role === "super_admin";
}
