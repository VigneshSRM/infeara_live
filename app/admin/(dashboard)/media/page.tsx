import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { PageHeader } from "@/components/admin/PageHeader";
import { SchemaNotice } from "@/components/admin/SchemaNotice";
import { deleteMedia, updateMedia, uploadMedia } from "@/lib/admin/media-actions";
import { isMissingSchema } from "@/lib/admin/errors";
import { istLabel } from "@/lib/admin/forms";
import { canEdit, requireStaff } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MediaRow = {
  id: string;
  bucket_path: string;
  alt: string;
  caption: string | null;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

const kb = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string; saved?: string; deleted?: string; error?: string }>;
}) {
  const user = await requireStaff();
  const flash = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media")
    .select("id,bucket_path,alt,caption,mime_type,size_bytes,created_at")
    .order("created_at", { ascending: false });

  if (isMissingSchema(error)) return <SchemaNotice table="media" />;

  const rows = (data ?? []) as MediaRow[];
  const editable = canEdit(user);
  const urlFor = (path: string) => supabase.storage.from("media").getPublicUrl(path).data.publicUrl;

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Media"
        description="Images published to the public site. Every image needs descriptive alt text before it can be used."
      />

      <Flash saved={flash.saved ?? flash.uploaded} deleted={flash.deleted} error={flash.error} />

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.85rem] text-coral-ink">
          {error.message}
        </p>
      ) : null}

      {editable ? (
        <form
          action={uploadMedia}
          encType="multipart/form-data"
          className="admin-card mt-6 grid gap-4 p-5 sm:grid-cols-2"
        >
          <h2 className="font-display text-lg text-navy sm:col-span-2">Upload an image</h2>
          <div>
            <label className="admin-label" htmlFor="file">
              File
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              required
              className="admin-input file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-1.5 file:font-heading file:text-[0.76rem] file:text-ivory"
            />
            <p className="mt-1 text-[0.74rem] text-charcoal/60">JPEG, PNG, WebP, AVIF or SVG. Maximum 10MB.</p>
          </div>
          <div>
            <label className="admin-label" htmlFor="alt">
              Alt text
            </label>
            <input id="alt" name="alt" required className="admin-input" placeholder="Describe what the image shows" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="caption">
              Caption (optional)
            </label>
            <input id="caption" name="caption" className="admin-input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="admin-btn admin-btn-primary">
              Upload
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-8">
        {rows.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <li key={row.id} className="admin-card overflow-hidden">
                <div className="flex h-40 items-center justify-center border-b border-navy/8 bg-ivory/50 p-3">
                  {/* Plain img: admin previews come from the public storage host. */}
                  <img
                    src={urlFor(row.bucket_path)}
                    alt={row.alt}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-3 p-4">
                  <p className="truncate font-mono text-[0.72rem] text-charcoal/60">{row.bucket_path}</p>
                  <p className="text-[0.72rem] text-charcoal/55">
                    {row.mime_type.replace("image/", "").toUpperCase()} · {kb(row.size_bytes)} ·{" "}
                    {istLabel(row.created_at)}
                  </p>

                  {editable ? (
                    <form action={updateMedia} className="space-y-2">
                      <input type="hidden" name="id" value={row.id} />
                      <div>
                        <label className="admin-label" htmlFor={`alt-${row.id}`}>
                          Alt text
                        </label>
                        <input id={`alt-${row.id}`} name="alt" defaultValue={row.alt} required className="admin-input" />
                      </div>
                      <div>
                        <label className="admin-label" htmlFor={`caption-${row.id}`}>
                          Caption
                        </label>
                        <input
                          id={`caption-${row.id}`}
                          name="caption"
                          defaultValue={row.caption ?? ""}
                          className="admin-input"
                        />
                      </div>
                      <button type="submit" className="admin-btn admin-btn-ghost !px-3 !py-1 !text-[0.74rem]">
                        Save details
                      </button>
                    </form>
                  ) : (
                    <div>
                      <p className="text-[0.8rem] leading-relaxed text-charcoal">{row.alt}</p>
                      {row.caption ? (
                        <p className="mt-1 text-[0.76rem] text-charcoal/60">{row.caption}</p>
                      ) : null}
                    </div>
                  )}

                  {editable ? (
                    <form action={deleteMedia} className="border-t border-navy/8 pt-3">
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="bucket_path" value={row.bucket_path} />
                      <ConfirmButton
                        message={`Delete ${row.bucket_path}? Pages that reference it will show a broken image.`}
                        className="admin-btn admin-btn-danger !px-3 !py-1 !text-[0.74rem]"
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="admin-card px-6 py-10 text-center">
            <p className="text-[0.88rem] text-charcoal/70">
              No media yet. Upload the first image above once the migration is applied.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
