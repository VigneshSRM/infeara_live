"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "./errors";
import { str } from "./forms";

const LEAD_STATUS = ["new", "contacted", "qualified", "closed", "spam"] as const;
type LeadStatus = (typeof LEAD_STATUS)[number];

function asStatus(value: string): LeadStatus {
  return (LEAD_STATUS as readonly string[]).includes(value) ? (value as LeadStatus) : "new";
}

export async function updateLead(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  if (!id) redirect("/admin/leads?error=Missing%20lead%20id.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: asStatus(str(formData, "status")), notes: str(formData, "notes") || null })
    .eq("id", id);

  if (error) redirect(`/admin/leads/${id}?error=${encodeURIComponent(friendlyError(error))}`);

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function deleteLead(formData: FormData) {
  await requireEditor();
  const id = str(formData, "id");
  if (!id) redirect("/admin/leads?error=Missing%20lead%20id.");

  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) redirect(`/admin/leads/${id}?error=${encodeURIComponent(friendlyError(error))}`);

  revalidatePath("/admin/leads");
  redirect("/admin/leads?deleted=1");
}
