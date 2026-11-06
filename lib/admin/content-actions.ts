"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "./errors";
import {
  SLUG_PATTERN,
  lines,
  linesField,
  num,
  optional,
  publishState,
  rows,
  str,
} from "./forms";
import type { ActionState } from "./types";

function refresh(paths: string[]) {
  for (const path of paths) revalidatePath(path);
}

async function commit(
  table: string,
  id: string | null,
  payload: Record<string, unknown>,
  paths: string[],
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from(table).update(payload).eq("id", id)
    : await supabase.from(table).insert(payload);

  if (error) return { error: friendlyError(error) };

  refresh(paths);
  return { ok: true };
}

async function remove(table: string, formData: FormData, paths: string[]): Promise<ActionState> {
  await requireEditor();
  const id = str(formData, "id");
  if (!id) return { error: "Missing record id." };

  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: friendlyError(error) };

  refresh(paths);
  return { ok: true };
}

const isSeo = (role: string) => role === "seo_manager";

// ── Services ────────────────────────────────────────────────────────────────

export async function saveService(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const id = optional(formData, "id");
  const seoOnly = isSeo(user.role);

  if (!id && seoOnly) return { error: "Your role cannot create practices." };

  const seo = {
    seo_title: str(formData, "seo_title"),
    seo_description: str(formData, "seo_description"),
  };

  if (seoOnly) {
    return commit("services", id, seo, ["/", "/services", `/services/${str(formData, "slug")}`]);
  }

  await requireEditor();

  const slug = str(formData, "slug");
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return { error: "Slug must be lowercase words separated by hyphens." };
  }
  if (!str(formData, "name") || !str(formData, "summary")) {
    return { error: "Name and summary are required." };
  }

  const state = publishState(formData);
  const payload = {
    name: str(formData, "name"),
    short_name: str(formData, "short_name") || str(formData, "name"),
    tagline: str(formData, "tagline"),
    summary: str(formData, "summary"),
    intro: str(formData, "intro"),
    sort_order: num(formData, "sort_order"),
    deliverables: rows<{ title: string; body: string }>(formData, "deliverables").filter(
      (row) => row.title,
    ),
    outcomes: linesField(formData, "outcomes"),
    faqs: rows<{ question: string; answer: string }>(formData, "faqs").filter((row) => row.question),
    related: linesField(formData, "related"),
    figure: {
      seed: num(formData, "figure_seed", 1),
      label: str(formData, "figure_label"),
      caption: str(formData, "figure_caption"),
    },
    ...seo,
    ...state,
  };

  const result = await commit("services", id, id ? payload : { ...payload, slug }, [
    "/",
    "/services",
    `/services/${slug}`,
  ]);
  if (result?.error) return result;
  redirect(`/admin/services?saved=${id ? "updated" : "created"}`);
}

export async function deleteService(formData: FormData): Promise<void> {
  const slug = str(formData, "slug");
  const result = await remove("services", formData, ["/", "/services", `/services/${slug}`]);
  if (result?.error) redirect(`/admin/services?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/services?deleted=1");
}

// ── Industries ──────────────────────────────────────────────────────────────

export async function saveIndustry(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const id = optional(formData, "id");
  const seoOnly = isSeo(user.role);

  if (!id && seoOnly) return { error: "Your role cannot create sectors." };

  const seo = {
    seo_title: str(formData, "seo_title"),
    seo_description: str(formData, "seo_description"),
  };

  if (seoOnly) {
    return commit("industries", id, seo, ["/", "/industries", `/industries/${str(formData, "slug")}`]);
  }

  await requireEditor();

  const slug = str(formData, "slug");
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return { error: "Slug must be lowercase words separated by hyphens." };
  }
  if (!str(formData, "name") || !str(formData, "summary")) {
    return { error: "Name and summary are required." };
  }

  const payload = {
    name: str(formData, "name"),
    tagline: str(formData, "tagline"),
    summary: str(formData, "summary"),
    challenges: linesField(formData, "challenges"),
    capabilities: linesField(formData, "capabilities"),
    services: linesField(formData, "services"),
    sort_order: num(formData, "sort_order"),
    figure: {
      seed: num(formData, "figure_seed", 1),
      label: str(formData, "figure_label"),
      caption: str(formData, "figure_caption"),
    },
    ...seo,
    ...publishState(formData),
  };

  const result = await commit("industries", id, id ? payload : { ...payload, slug }, [
    "/",
    "/industries",
    `/industries/${slug}`,
  ]);
  if (result?.error) return result;
  redirect(`/admin/industries?saved=${id ? "updated" : "created"}`);
}

export async function deleteIndustry(formData: FormData): Promise<void> {
  const slug = str(formData, "slug");
  const result = await remove("industries", formData, ["/", "/industries", `/industries/${slug}`]);
  if (result?.error) redirect(`/admin/industries?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/industries?deleted=1");
}

// ── Insights ────────────────────────────────────────────────────────────────

export async function saveInsight(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const id = optional(formData, "id");
  const seoOnly = isSeo(user.role);

  if (!id && seoOnly) return { error: "Your role cannot create articles." };

  const seo = {
    seo_title: str(formData, "seo_title"),
    seo_description: str(formData, "seo_description"),
  };

  if (seoOnly) {
    return commit("insights", id, seo, ["/", "/insights", `/insights/${str(formData, "slug")}`]);
  }

  await requireEditor();

  const slug = str(formData, "slug");
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return { error: "Slug must be lowercase words separated by hyphens." };
  }
  if (!str(formData, "title") || !str(formData, "excerpt")) {
    return { error: "Title and excerpt are required." };
  }

  const body = rows<{ heading: string; paragraphs: string }>(formData, "body")
    .filter((row) => row.heading)
    .map((row) => ({ heading: row.heading, paragraphs: lines(row.paragraphs ?? "") }));

  const payload = {
    title: str(formData, "title"),
    excerpt: str(formData, "excerpt"),
    category: str(formData, "category") || "Insight",
    reading_minutes: num(formData, "reading_minutes", 5),
    body,
    ...seo,
    ...publishState(formData),
  };

  const result = await commit("insights", id, id ? payload : { ...payload, slug }, [
    "/",
    "/insights",
    `/insights/${slug}`,
  ]);
  if (result?.error) return result;
  redirect(`/admin/insights?saved=${id ? "updated" : "created"}`);
}

export async function deleteInsight(formData: FormData): Promise<void> {
  const slug = str(formData, "slug");
  const result = await remove("insights", formData, ["/", "/insights", `/insights/${slug}`]);
  if (result?.error) redirect(`/admin/insights?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/insights?deleted=1");
}

// ── Legal ───────────────────────────────────────────────────────────────────

export async function saveLegal(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const id = optional(formData, "id");
  const seoOnly = isSeo(user.role);

  if (!id && seoOnly) return { error: "Your role cannot create legal documents." };

  const seo = {
    seo_title: str(formData, "seo_title"),
    seo_description: str(formData, "seo_description"),
  };

  if (seoOnly) {
    return commit("legal_documents", id, seo, ["/legal", `/legal/${str(formData, "slug")}`]);
  }

  await requireEditor();

  const slug = str(formData, "slug");
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return { error: "Slug must be lowercase words separated by hyphens." };
  }
  if (!str(formData, "title") || !str(formData, "intro")) {
    return { error: "Title and intro are required." };
  }

  const sections = rows<{ heading: string; paragraphs: string; bullets?: string }>(
    formData,
    "sections",
  )
    .filter((row) => row.heading)
    .map((row) => {
      const bullets = lines(row.bullets ?? "");
      return {
        heading: row.heading,
        paragraphs: lines(row.paragraphs ?? ""),
        ...(bullets.length ? { bullets } : {}),
      };
    });

  const payload = {
    title: str(formData, "title"),
    description: str(formData, "description"),
    updated_label: str(formData, "updated_label"),
    intro: str(formData, "intro"),
    sections,
    ...seo,
    ...publishState(formData),
  };

  const result = await commit("legal_documents", id, id ? payload : { ...payload, slug }, [
    `/legal/${slug}`,
  ]);
  if (result?.error) return result;
  redirect(`/admin/legal?saved=${id ? "updated" : "created"}`);
}

export async function deleteLegal(formData: FormData): Promise<void> {
  const slug = str(formData, "slug");
  const result = await remove("legal_documents", formData, [`/legal/${slug}`]);
  if (result?.error) redirect(`/admin/legal?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/legal?deleted=1");
}

// ── FAQ groups ──────────────────────────────────────────────────────────────

export async function saveFaqGroup(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireEditor();
  const id = optional(formData, "id");

  if (!str(formData, "title")) return { error: "A group needs a title." };

  const items = rows<{ question: string; answer: string }>(formData, "items").filter(
    (row) => row.question && row.answer,
  );

  const payload = {
    title: str(formData, "title"),
    intro: str(formData, "intro"),
    sort_order: num(formData, "sort_order"),
    items,
    ...publishState(formData),
  };

  const result = await commit("faq_groups", id, payload, ["/", "/faq"]);
  if (result?.error) return result;
  redirect(`/admin/faqs?saved=${id ? "updated" : "created"}`);
}

export async function deleteFaqGroup(formData: FormData): Promise<void> {
  const result = await remove("faq_groups", formData, ["/", "/faq"]);
  if (result?.error) redirect(`/admin/faqs?error=${encodeURIComponent(result.error)}`);
  redirect("/admin/faqs?deleted=1");
}
