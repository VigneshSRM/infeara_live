"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/dal";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "./errors";
import { str } from "./forms";
import { listHrefFromQuery } from "./list-params";
import { ROLE_FILTER, USERS_PATH } from "./user-roles";

const ROLES = ["super_admin", "editor", "seo_manager", "pending"] as const;
type Role = (typeof ROLES)[number];

function asRole(value: string): Role | null {
  return (ROLES as readonly string[]).includes(value) ? (value as Role) : null;
}

export async function updateUserRole(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = str(formData, "id");
  const role = asRole(str(formData, "role"));

  // The list the button was on: its search, role filter and page. The form carries them as a query
  // string, and it is rebuilt from the known names and values only, so the browser goes back to
  // the same view and never anywhere else.
  const list = listHrefFromQuery(USERS_PATH, str(formData, "return_query"), [ROLE_FILTER], []);
  const back = (flash: string) => `${list}${list.includes("?") ? "&" : "?"}${flash}`;

  if (!id) redirect(back("error=Missing%20user%20id."));
  if (!role) redirect(back("error=Unknown%20role."));

  const supabase = await createClient();

  if (id === actor.id && role !== "super_admin") {
    redirect(back("error=You%20cannot%20remove%20your%20own%20super%20admin%20role."));
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
      redirect(back("error=At%20least%20one%20super%20admin%20must%20remain."));
    }
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) redirect(back(`error=${encodeURIComponent(friendlyError(error))}`));

  revalidatePath("/admin/users");
  redirect(back("saved=1"));
}

/**
 * Create a confirmed staff account directly. This is the path that works
 * without an SMTP provider: the super admin sets a temporary password and
 * hands it over out of band. The auth trigger creates the profile as
 * `pending`, then this action sets the chosen role.
 */
export async function createStaffAccount(formData: FormData) {
  await requireSuperAdmin();
  const email = str(formData, "email").toLowerCase();
  const role = asRole(str(formData, "role")) ?? "editor";
  const name = str(formData, "full_name");
  const password = str(formData, "password");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/admin/users?error=Enter%20a%20valid%20email%20address.");
  }
  if (role === "pending") {
    redirect("/admin/users?error=Choose%20a%20working%20role.");
  }
  if (password.length < 12) {
    redirect("/admin/users?error=Use%20a%20password%20of%20at%20least%2012%20characters.");
  }
  if (!hasServiceRole) {
    redirect("/admin/users?error=SUPABASE_SERVICE_ROLE_KEY%20is%20not%20set%2C%20so%20accounts%20cannot%20be%20created%20from%20the%20CMS.");
  }

  const admin = createAdminClient();
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || undefined },
  });

  if (created.error) {
    redirect(`/admin/users?error=${encodeURIComponent(created.error.message)}`);
  }

  const user = created.data.user;
  if (user) {
    const { error } = await admin.from("profiles").upsert(
      { id: user.id, email, full_name: name || null, role },
      { onConflict: "id" },
    );
    if (error) {
      redirect(`/admin/users?error=${encodeURIComponent(friendlyError(error))}`);
    }
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
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
