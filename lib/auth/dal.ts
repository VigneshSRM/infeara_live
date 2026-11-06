import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type StaffRole = "super_admin" | "editor" | "seo_manager";

export type StaffUser = {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
};

/**
 * The single place that turns a Supabase session into a staff identity.
 *
 * A session alone is not enough: the profile must exist and its role must be
 * one of the three working roles. Public signups land in `pending` and are
 * treated as anonymous here.
 */
export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  if (profile.role !== "super_admin" && profile.role !== "editor" && profile.role !== "seo_manager") {
    return null;
  }

  return {
    id: user.id,
    email: profile.email ?? user.email ?? "",
    name: profile.full_name,
    role: profile.role,
  };
});

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
