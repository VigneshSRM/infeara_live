"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "./errors";
import { str } from "./forms";

const ROLES = ["super_admin", "editor", "seo_manager", "pending"] as const;
type Role = (typeof ROLES)[number];

function asRole(value: string): Role | null {
  return (ROLES as readonly string[]).includes(value) ? (value as Role) : null;
}

export async function updateUserRole(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = str(formData, "id");
  const role = asRole(str(formData, "role"));

  if (!id) redirect("/admin/users?error=Missing%20user%20id.");
  if (!role) redirect("/admin/users?error=Unknown%20role.");

  const supabase = await createClient();

  if (id === actor.id && role !== "super_admin") {
    redirect("/admin/users?error=You%20cannot%20remove%20your%20own%20super%20admin%20role.");
  }

  if (role !== "super_admin") {
    // Never allow the last super admin to be demoted, or the CMS becomes
    // unreachable for everyone.
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    const current = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
    if (current.data?.role === "super_admin" && (count ?? 0) <= 1) {
      redirect("/admin/users?error=At%20least%20one%20super%20admin%20must%20remain.");
    }
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) redirect(`/admin/users?error=${encodeURIComponent(friendlyError(error))}`);

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

/**
 * Invite flow. Requires the service-role key *and* working SMTP: Supabase sends
 * the invitation, so without a mail provider the link never arrives.
 */
export async function inviteUser(formData: FormData) {
  await requireSuperAdmin();
  const email = str(formData, "email").toLowerCase();
  const role = asRole(str(formData, "role")) ?? "editor";
  const name = str(formData, "full_name");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/admin/users?error=Enter%20a%20valid%20email%20address.");
  }
  if (!hasServiceRole) {
    redirect(
      "/admin/users?error=Invitations%20need%20SUPABASE_SERVICE_ROLE_KEY%20and%20a%20configured%20mail%20provider.",
    );
  }
  if (role === "pending") {
    redirect("/admin/users?error=Choose%20a%20working%20role%20for%20an%20invitation.");
  }

  const admin = createAdminClient();
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  const invited = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name || undefined },
    redirectTo: `${siteUrl}/admin/accept-invite`,
  });

  if (invited.error) {
    redirect(`/admin/users?error=${encodeURIComponent(invited.error.message)}`);
  }

  if (invited.data.user) {
    await admin.from("profiles").update({ role, full_name: name || null }).eq("id", invited.data.user.id);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?invited=1");
}
