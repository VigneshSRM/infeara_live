"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing");
  }
  if (!isSupabaseConfigured) {
    redirect("/admin/login?error=config");
  }

  let failure: string | null = null;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) failure = error.message;
  } catch {
    failure = "config";
  }

  if (failure) {
    redirect(`/admin/login?error=${encodeURIComponent(failure === "config" ? "config" : "invalid")}`);
  }

  redirect("/admin");
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Nothing to clear if the client could not be created.
  }
  redirect("/admin/login");
}
