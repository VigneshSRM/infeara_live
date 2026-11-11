"use server";

// Server actions for the four resource modules: sub-services, blog posts, case studies and white
// papers. Same shape as content-actions.ts (authenticate, authorize, validate, write, revalidate,
// redirect) and the same division of labour: Row Level Security in the database has the last
// word on who may change what, and these checks exist so the person gets a clear message first.

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor, requireStaff } from "@/lib/auth/dal";
import { unsafeBlogLinks } from "@/lib/content/blogs";
import { isSubserviceParent, parentBySlug, subservicePath } from "@/lib/content/subservice-model";
import { DOCUMENTS_BUCKET, MAX_PAPER_BYTES, PAPER_PATH_PATTERN, safePdfName } from "@/lib/content/white-papers";
import { createClient } from "@/lib/supabase/server";
import { SAVE_FAILED, knownError } from "./errors";
import { SLUG_PATTERN, lines, linesField, num, optional, publishState, rows, str } from "./forms";
import {
  blogLinkProblem,
  blogProblem,
  buildInfographic,
  caseStudyProblem,
  cleanPictureNumber,
  cleanSortOrder,
  diagramImage,
  paperProblem,
  parseReadingMinutes,
  parseRelatedLinks,
} from "./resource-validation";
import type { ActionState } from "./types";

/**
 * What an editor is told when a write fails: plain wording for the cases they can fix, and for
 * anything else a fixed sentence, with the database's own message kept in the server log.
 */
function saveError(table: string, error: { code?: string; message?: string }): string {
  const known = knownError(error);
  if (known) return known;
  console.error(`[admin] ${table} change failed:`, error.code ?? "no code", error.message);
  return SAVE_FAILED;
}

/** "/" means the whole site: a sub-service sits in the header menu of every page. */
function refresh(paths: string[]) {
  for (const path of paths) {
    if (path === "/") revalidatePath("/", "layout");
    else revalidatePath(path);
  }
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

  if (error) return { error: saveError(table, error) };

  refresh(paths);
  return { ok: true };
}

const isSeo = (role: string) => role === "seo_manager";

const seoFields = (formData: FormData) => ({
  seo_title: str(formData, "seo_title"),
  seo_description: str(formData, "seo_description"),
});

/**
 * Status and publish time. A post or paper that is published without a date is dated now, so its
 * date on the site is the day it went live and does not move afterwards.
 */
function publishing(formData: FormData, stampWhenEmpty: boolean) {
  const state = publishState(formData);
  if (stampWhenEmpty && state.status === "published" && !state.published_at) {
    return { ...state, published_at: new Date().toISOString() };
  }
  return state;
}

function badSlug(slug: string): string | null {
  return slug && SLUG_PATTERN.test(slug) ? null : "Slug must be lowercase words separated by hyphens.";
}

// ── Sub-services ────────────────────────────────────────────────────────────

function subservicePaths(parent: string, slug: string): string[] {
  const paths = ["/", "/services", "/sitemap.xml"];
  const hub = isSubserviceParent(parent) ? parentBySlug(parent) : undefined;
  if (hub) {
    paths.push(hub.href);
    if (slug) paths.push(subservicePath(parent, slug));
  }
  return paths;
}

export async function saveSubservice(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const id = optional(formData, "id");
  const seoOnly = isSeo(user.role);
  const parent = str(formData, "parent_slug");
  const slug = str(formData, "slug");

  if (!id && seoOnly) return { error: "Your role cannot create sub-services." };

  if (seoOnly) {
    const result = await commit("sub_services", id, seoFields(formData), subservicePaths(parent, slug));
    if (result?.error) return result;
    redirect("/admin/subservices?saved=updated");
  }

  await requireEditor();

  if (!isSubserviceParent(parent)) return { error: "Choose which service this sub-service belongs to." };
  const slugProblem = badSlug(slug);
  if (slugProblem) return { error: slugProblem };
  if (!str(formData, "name") || !str(formData, "summary")) return { error: "Name and summary are required." };

  const infographic = buildInfographic({
    title: str(formData, "infographic_title"),
    steps: rows<{ title: string; description: string }>(formData, "infographic_steps"),
    image: diagramImage(formData.get("keep_image") === "on", str(formData, "infographic_image")),
  });

  const payload = {
    name: str(formData, "name"),
    tagline: str(formData, "tagline"),
    summary: str(formData, "summary"),
    intro: str(formData, "intro"),
    sort_order: cleanSortOrder(num(formData, "sort_order")),
    deliverables: rows<{ title: string; body: string }>(formData, "deliverables")
      .map((row) => ({ title: String(row.title ?? "").trim(), body: String(row.body ?? "").trim() }))
      .filter((row) => row.title),
    outcomes: linesField(formData, "outcomes"),
    faqs: rows<{ question: string; answer: string }>(formData, "faqs")
      .map((row) => ({ question: String(row.question ?? "").trim(), answer: String(row.answer ?? "").trim() }))
      .filter((row) => row.question && row.answer),
    infographic,
    figure: {
      seed: cleanPictureNumber(num(formData, "figure_seed", 1)),
      label: str(formData, "figure_label"),
      caption: str(formData, "figure_caption"),
    },
    ...seoFields(formData),
    ...publishing(formData, false),
  };

  const result = await commit(
    "sub_services",
    id,
    id ? payload : { ...payload, parent_slug: parent, slug },
    subservicePaths(parent, slug),
  );
  if (result?.error) return result;
  redirect(`/admin/subservices?saved=${id ? "updated" : "created"}`);
}

export async function deleteSubservice(formData: FormData): Promise<void> {
  await requireEditor();
  const id = str(formData, "id");
  if (!id) redirect(`/admin/subservices?error=${encodeURIComponent("Missing record id.")}`);

  const supabase = await createClient();
  const { error } = await supabase.from("sub_services").delete().eq("id", id);
  if (error) redirect(`/admin/subservices?error=${encodeURIComponent(saveError("sub_services", error))}`);

  refresh(subservicePaths(str(formData, "parent_slug"), str(formData, "slug")));
  redirect("/admin/subservices?deleted=1");
}

// ── Blog posts ──────────────────────────────────────────────────────────────

const blogPaths = (slug: string) => ["/blogs", `/blogs/${slug}`, "/sitemap.xml"];

export async function saveBlog(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const id = optional(formData, "id");
  const seoOnly = isSeo(user.role);
  const slug = str(formData, "slug");

  if (!id && seoOnly) return { error: "Your role cannot create blog posts." };

  if (seoOnly) {
    const result = await commit("blog_posts", id, seoFields(formData), blogPaths(slug));
    if (result?.error) return result;
    redirect("/admin/blogs?saved=updated");
  }

  await requireEditor();

  const slugProblem = badSlug(slug);
  if (slugProblem) return { error: slugProblem };
  if (!str(formData, "title") || !str(formData, "excerpt")) return { error: "Title and excerpt are required." };

  const minutes = parseReadingMinutes(str(formData, "reading_minutes"));
  if (!minutes.ok) return { error: minutes.error };

  const related = parseRelatedLinks(rows<{ label: string; href: string }>(formData, "related_services"));
  if (!related.ok) return { error: related.error };

  const body = rows<{ heading: string; paragraphs: string }>(formData, "body")
    .map((row) => ({ heading: String(row.heading ?? "").trim(), paragraphs: lines(String(row.paragraphs ?? "")) }))
    .filter((row) => row.heading);

  // [text](address) links are the one thing in a body that can point off the site, so an address
  // that is not http(s) or a path on this site is refused here rather than saved as plain text.
  const linkProblem = blogLinkProblem(unsafeBlogLinks(body.flatMap((section) => section.paragraphs)));
  if (linkProblem) return { error: linkProblem };

  const state = publishing(formData, true);
  const problem = blogProblem({ status: state.status, sections: body.length });
  if (problem) return { error: problem };

  const payload = {
    title: str(formData, "title"),
    excerpt: str(formData, "excerpt"),
    category: str(formData, "category") || "General",
    reading_minutes: minutes.value,
    figure_seed: cleanPictureNumber(num(formData, "figure_seed", 1)),
    body,
    related_services: related.value,
    ...seoFields(formData),
    ...state,
  };

  const result = await commit("blog_posts", id, id ? payload : { ...payload, slug }, blogPaths(slug));
  if (result?.error) return result;
  redirect(`/admin/blogs?saved=${id ? "updated" : "created"}`);
}

export async function deleteBlog(formData: FormData): Promise<void> {
  await requireEditor();
  const id = str(formData, "id");
  if (!id) redirect(`/admin/blogs?error=${encodeURIComponent("Missing record id.")}`);

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) redirect(`/admin/blogs?error=${encodeURIComponent(saveError("blog_posts", error))}`);

  refresh(blogPaths(str(formData, "slug")));
  redirect("/admin/blogs?deleted=1");
}

// ── Case studies ────────────────────────────────────────────────────────────

const caseStudyPaths = (slug: string) => ["/case-studies", `/case-studies/${slug}`, "/sitemap.xml"];

export async function saveCaseStudy(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const id = optional(formData, "id");
  const seoOnly = isSeo(user.role);
  const slug = str(formData, "slug");

  if (!id && seoOnly) return { error: "Your role cannot create case studies." };

  if (seoOnly) {
    const result = await commit("case_studies", id, seoFields(formData), caseStudyPaths(slug));
    if (result?.error) return result;
    redirect("/admin/case-studies?saved=updated");
  }

  await requireEditor();

  const slugProblem = badSlug(slug);
  if (slugProblem) return { error: slugProblem };
  if (!str(formData, "title") || !str(formData, "sector")) return { error: "Title and sector are required." };
  if (!str(formData, "situation") || !str(formData, "result")) return { error: "The situation and the change in state are required." };

  const kind = str(formData, "kind");
  const state = publishing(formData, false);
  const clientName = str(formData, "client_name");
  const approved = formData.get("client_approved") === "on";

  const problem = caseStudyProblem({ kind, clientName, approved, status: state.status });
  if (problem) return { error: problem };

  // A representative study never carries a client name or an approval, whatever the form held.
  const isClient = kind === "client";

  const payload = {
    title: str(formData, "title"),
    sector: str(formData, "sector"),
    kind,
    client_name: isClient ? clientName : null,
    client_approved: isClient ? approved : false,
    situation: str(formData, "situation"),
    work: linesField(formData, "work"),
    result: str(formData, "result"),
    services: [...new Set(formData.getAll("services").map(String).filter((value) => SLUG_PATTERN.test(value)))],
    sort_order: cleanSortOrder(num(formData, "sort_order")),
    ...seoFields(formData),
    ...state,
  };

  const result = await commit("case_studies", id, id ? payload : { ...payload, slug }, caseStudyPaths(slug));
  if (result?.error) return result;
  redirect(`/admin/case-studies?saved=${id ? "updated" : "created"}`);
}

export async function deleteCaseStudy(formData: FormData): Promise<void> {
  await requireEditor();
  const id = str(formData, "id");
  if (!id) redirect(`/admin/case-studies?error=${encodeURIComponent("Missing record id.")}`);

  const supabase = await createClient();
  const { error } = await supabase.from("case_studies").delete().eq("id", id);
  if (error) redirect(`/admin/case-studies?error=${encodeURIComponent(saveError("case_studies", error))}`);

  refresh(caseStudyPaths(str(formData, "slug")));
  redirect("/admin/case-studies?deleted=1");
}

// ── White papers ────────────────────────────────────────────────────────────

const paperPaths = (slug: string) => ["/white-papers", `/white-papers/${slug}`, "/sitemap.xml"];

/** Best effort: an orphaned file costs a little storage, so a failure here never blocks a save. */
async function removeStoredFile(path: string | null | undefined): Promise<void> {
  if (!path || !PAPER_PATH_PATTERN.test(path)) return;
  try {
    const supabase = await createClient();
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
  } catch (error) {
    console.error("[admin] could not remove a white-paper file:", (error as Error).message);
  }
}

export type PreparedUpload = { ok: true; path: string; token: string } | { ok: false; error: string };

/**
 * Step one of attaching a PDF. A PDF can be bigger than a server action may carry (Next.js caps the
 * request body at 1 MB by default), so the file goes from the browser straight to Storage. This
 * checks the person may upload, checks what they are about to send, and returns a one-off
 * signed address for that exact path. Nothing is stored yet; saving the paper stores the path.
 */
export async function prepareWhitePaperUpload(input: { name: string; size: number; type: string }): Promise<PreparedUpload> {
  await requireEditor();

  const name = String(input?.name ?? "");
  const size = Number(input?.size);
  const type = String(input?.type ?? "");

  if (!/\.pdf$/i.test(name) || (type && type !== "application/pdf")) return { ok: false, error: "Choose a PDF file." };
  if (!Number.isFinite(size) || size <= 0) return { ok: false, error: "That file is empty." };
  if (size > MAX_PAPER_BYTES) return { ok: false, error: "That PDF is larger than 25 MB. Compress it and try again." };

  const path = `papers/${randomUUID()}/${safePdfName(name)}`;
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).createSignedUploadUrl(path);

  if (error || !data?.token) {
    console.error("[admin] could not start a white-paper upload:", error?.message ?? "no token returned");
    return {
      ok: false,
      error:
        "The upload could not be started. If this is the first white paper, check that supabase/apply/05-resource-modules.sql has been run.",
    };
  }

  return { ok: true, path: data.path ?? path, token: data.token };
}

/** true / false, or null when the check itself could not be made. */
async function fileArrived(path: string): Promise<boolean | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).exists(path);
    if (error && !data) return false;
    return Boolean(data);
  } catch {
    return null;
  }
}

export async function saveWhitePaper(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStaff();
  const id = optional(formData, "id");
  const seoOnly = isSeo(user.role);
  const slug = str(formData, "slug");

  if (!id && seoOnly) return { error: "Your role cannot create white papers." };

  if (seoOnly) {
    const result = await commit("white_papers", id, seoFields(formData), paperPaths(slug));
    if (result?.error) return result;
    redirect("/admin/white-papers?saved=updated");
  }

  await requireEditor();

  const slugProblem = badSlug(slug);
  if (slugProblem) return { error: slugProblem };
  if (!str(formData, "title") || !str(formData, "summary")) return { error: "Title and summary are required." };

  const state = publishing(formData, true);
  const filePath = optional(formData, "file_path");
  const externalUrl = optional(formData, "external_url");

  if (filePath && !PAPER_PATH_PATTERN.test(filePath)) {
    return { error: "The uploaded file could not be recognised. Remove it and upload the PDF again." };
  }

  const problem = paperProblem({ status: state.status, filePath, externalUrl });
  if (problem) return { error: problem };

  const supabase = await createClient();

  let previousPath: string | null = null;
  if (id) {
    const { data } = await supabase.from("white_papers").select("file_path").eq("id", id).maybeSingle();
    previousPath = (data?.file_path as string | null | undefined) ?? null;
  }

  // Only a file that is new to this paper needs checking: one that was already attached has been.
  if (filePath && filePath !== previousPath) {
    const arrived = await fileArrived(filePath);
    if (arrived === null) return { error: "We could not check that the PDF arrived. Try saving again." };
    if (!arrived) return { error: "The PDF did not finish uploading. Choose the file again." };
  }

  const fileName = filePath ? str(formData, "file_name") || filePath.split("/").pop() || null : null;
  const size = Math.trunc(num(formData, "file_size_bytes", 0));

  const payload = {
    title: str(formData, "title"),
    summary: str(formData, "summary"),
    topic: str(formData, "topic") || "General",
    sort_order: cleanSortOrder(num(formData, "sort_order")),
    file_path: filePath,
    file_name: fileName,
    file_size_bytes: filePath && size > 0 ? size : null,
    external_url: externalUrl,
    ...seoFields(formData),
    ...state,
  };

  const result = await commit("white_papers", id, id ? payload : { ...payload, slug }, paperPaths(slug));
  if (result?.error) return result;

  // The paper no longer points at its old file, so the old file goes.
  if (previousPath && previousPath !== filePath) await removeStoredFile(previousPath);

  redirect(`/admin/white-papers?saved=${id ? "updated" : "created"}`);
}

export async function deleteWhitePaper(formData: FormData): Promise<void> {
  await requireEditor();
  const id = str(formData, "id");
  if (!id) redirect(`/admin/white-papers?error=${encodeURIComponent("Missing record id.")}`);

  const supabase = await createClient();
  const { data: current } = await supabase.from("white_papers").select("file_path").eq("id", id).maybeSingle();

  const { error } = await supabase.from("white_papers").delete().eq("id", id);
  if (error) redirect(`/admin/white-papers?error=${encodeURIComponent(saveError("white_papers", error))}`);

  await removeStoredFile(current?.file_path as string | null | undefined);
  refresh(paperPaths(str(formData, "slug")));
  redirect("/admin/white-papers?deleted=1");
}
