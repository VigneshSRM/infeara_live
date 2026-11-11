"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { prepareWhitePaperUpload } from "@/lib/admin/resource-actions";
import { DOCUMENTS_BUCKET, MAX_PAPER_BYTES, documentUrl, formatFileSize } from "@/lib/content/white-papers";
import { SUPABASE_URL } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/browser";

export type AttachedPdf = { path: string; name: string; size: number | null };

/**
 * Attaches a PDF to a white paper.
 *
 * The file goes from the browser straight to Supabase Storage, not through a server action,
 * because a server action's request body is capped at 1 MB by default and a PDF is often larger.
 * The server decides whether this person may upload and what the file's path will be
 * (prepareWhitePaperUpload); this component sends the bytes and keeps the path in hidden fields,
 * which the save action reads. Saving then checks the file really arrived.
 */
export function PdfUploader({ initial, disabled = false }: { initial: AttachedPdf | null; disabled?: boolean }) {
  const [file, setFile] = useState<AttachedPdf | null>(initial);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const busy = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  // A file that is still on its way has no path yet, so saving now would save the paper without
  // it. Hold the form until the upload finishes.
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const onSubmit = (event: Event) => {
      if (!busy.current) return;
      event.preventDefault();
      setMessage("The PDF is still uploading. Save again when it has finished.");
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);

  /** A file uploaded in this session and never saved: tidy it away when it is replaced or removed. */
  async function discardUnsaved(current: AttachedPdf | null) {
    if (!current || current.path === initial?.path) return;
    try {
      await createClient().storage.from(DOCUMENTS_BUCKET).remove([current.path]);
    } catch {
      /* an orphaned file costs a little storage and nothing else */
    }
  }

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;

    setMessage(null);
    if (!/\.pdf$/i.test(chosen.name) || (chosen.type && chosen.type !== "application/pdf")) {
      setMessage("Choose a PDF file.");
      return;
    }
    if (chosen.size <= 0) {
      setMessage("That file is empty.");
      return;
    }
    if (chosen.size > MAX_PAPER_BYTES) {
      setMessage(`That PDF is ${formatFileSize(chosen.size)}. The limit is ${formatFileSize(MAX_PAPER_BYTES)}.`);
      return;
    }

    busy.current = true;
    setUploading(true);
    try {
      const prepared = await prepareWhitePaperUpload({ name: chosen.name, size: chosen.size, type: chosen.type });
      if (!prepared.ok) {
        setMessage(prepared.error);
        return;
      }

      // Some systems report no type for a .pdf; the bucket accepts PDFs only, so say what it is.
      const body = chosen.type === "application/pdf" ? chosen : new File([chosen], chosen.name, { type: "application/pdf" });
      const { error } = await createClient()
        .storage.from(DOCUMENTS_BUCKET)
        .uploadToSignedUrl(prepared.path, prepared.token, body, { contentType: "application/pdf" });
      if (error) {
        setMessage("The upload did not complete. Check your connection and try again.");
        return;
      }

      const previous = file;
      setFile({ path: prepared.path, name: chosen.name, size: chosen.size });
      void discardUnsaved(previous);
    } catch {
      setMessage("The upload did not complete. Check your connection and try again.");
    } finally {
      busy.current = false;
      setUploading(false);
    }
  }

  function remove() {
    void discardUnsaved(file);
    setFile(null);
    setMessage(null);
  }

  const size = formatFileSize(file?.size);

  return (
    <div>
      <input type="hidden" name="file_path" value={file?.path ?? ""} />
      <input type="hidden" name="file_name" value={file?.name ?? ""} />
      <input type="hidden" name="file_size_bytes" value={file?.size ?? ""} />

      <span className="admin-label">PDF file</span>

      {file ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy/10 bg-ivory/60 px-3 py-2.5">
          <p className="min-w-0 text-[0.86rem] text-charcoal/80">
            <span className="break-all font-mono text-[0.82rem]">{file.name}</span>
            {size ? <span className="text-charcoal/60"> · {size}</span> : null}
            {file.path !== initial?.path ? (
              <span className="ml-2 rounded-sm bg-coral/20 px-2 py-0.5 font-heading text-[0.62rem] uppercase tracking-[0.1em] text-coral-ink">
                Not saved yet
              </span>
            ) : null}
          </p>
          <p className="flex items-center gap-4 text-[0.78rem]">
            <a
              href={documentUrl(SUPABASE_URL, file.path)}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-blue"
            >
              Open ↗
            </a>
            {!disabled ? (
              <button type="button" onClick={remove} className="text-coral-ink underline underline-offset-4">
                Remove
              </button>
            ) : null}
          </p>
        </div>
      ) : (
        <p className="text-[0.84rem] text-charcoal/65">No PDF attached.</p>
      )}

      {!disabled ? (
        <div className="mt-3">
          <label className="admin-btn admin-btn-ghost cursor-pointer">
            <span>{uploading ? "Uploading…" : file ? "Replace the PDF" : "Choose a PDF"}</span>
            <input
              ref={input}
              type="file"
              accept="application/pdf,.pdf"
              onChange={choose}
              disabled={uploading}
              className="sr-only"
              aria-label="PDF file"
            />
          </label>
          <p className="mt-1 text-[0.74rem] leading-relaxed text-charcoal/60">
            PDF only, up to {formatFileSize(MAX_PAPER_BYTES)}. It is uploaded as soon as you choose it and attached when
            you save the paper.
          </p>
        </div>
      ) : null}

      {uploading ? (
        <p role="status" className="mt-2 text-[0.82rem] text-charcoal/70">
          Uploading the PDF. Please wait before saving…
        </p>
      ) : null}
      {message ? (
        <p role="alert" className="mt-2 text-[0.82rem] text-coral-ink">
          {message}
        </p>
      ) : null}
    </div>
  );
}
