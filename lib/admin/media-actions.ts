"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "./errors";
import { str } from "./forms";

const BUCKET = "media";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]);

function safeName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "upload";
}

export async function uploadMedia(formData: FormData) {
  await requireEditor();
  const file = formData.get("file");
  const alt = str(formData, "alt");
  const caption = str(formData, "caption");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/media?error=Choose%20a%20file%20to%20upload.");
  }
  if (!alt) {
    redirect("/admin/media?error=Alt%20text%20is%20required%20for%20every%20image.");
  }
  if (!ALLOWED.has(file.type)) {
    redirect("/admin/media?error=Unsupported%20file%20type.%20Use%20JPEG%2C%20PNG%2C%20WebP%2C%20AVIF%20or%20SVG.");
  }
  if (file.size > MAX_BYTES) {
    redirect("/admin/media?error=Files%20must%20be%20under%2010MB.");
  }

  const supabase = await createClient();
  const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${safeName(file.name)}`;

  const upload = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (upload.error) {
    redirect(`/admin/media?error=${encodeURIComponent(friendlyError(upload.error))}`);
  }

  const { error } = await supabase.from("media").insert({
    bucket_path: path,
    alt,
    caption: caption || null,
    mime_type: file.type,
    size_bytes: file.size,
  });

  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    redirect(`/admin/media?error=${encodeURIComponent(friendlyError(error))}`);
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?uploaded=1");
}

export async function updateMedia(formData: FormData) {
  await requireEditor();
  const id = str(formData, "id");
  const alt = str(formData, "alt");
  if (!id) redirect("/admin/media?error=Missing%20media%20id.");
  if (!alt) redirect("/admin/media?error=Alt%20text%20is%20required.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("media")
    .update({ alt, caption: str(formData, "caption") || null })
    .eq("id", id);

  if (error) redirect(`/admin/media?error=${encodeURIComponent(friendlyError(error))}`);

  revalidatePath("/admin/media");
  redirect("/admin/media?saved=1");
}

export async function deleteMedia(formData: FormData) {
  await requireEditor();
  const id = str(formData, "id");
  const path = str(formData, "bucket_path");
  if (!id || !path) redirect("/admin/media?error=Missing%20media%20reference.");

  const supabase = await createClient();
  const removal = await supabase.storage.from(BUCKET).remove([path]);
  if (removal.error) {
    redirect(`/admin/media?error=${encodeURIComponent(friendlyError(removal.error))}`);
  }

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) redirect(`/admin/media?error=${encodeURIComponent(friendlyError(error))}`);

  revalidatePath("/admin/media");
  redirect("/admin/media?deleted=1");
}
