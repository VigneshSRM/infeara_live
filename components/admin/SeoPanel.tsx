import { SEO_DESCRIPTION_HINT, SEO_TITLE_HINT } from "@/lib/seo/limits";
import { Panel, TextField, TextareaField } from "./Field";

/** The search-listing fields every module has. SEO managers can edit these two and nothing else. */
export function SeoPanel({
  seoTitle,
  seoDescription,
  editable,
  fallbackNote,
}: {
  seoTitle: string;
  seoDescription: string;
  editable: boolean;
  /** What the page shows when a field is left empty, e.g. "the title". */
  fallbackNote: string;
}) {
  return (
    <Panel
      title="Search engine listing"
      description={
        editable
          ? `Overrides the page title and meta description. Left empty, the page uses ${fallbackNote}.`
          : "Your role can edit these two fields only."
      }
    >
      <TextField name="seo_title" label="SEO title" defaultValue={seoTitle} hint={SEO_TITLE_HINT} />
      <TextareaField
        name="seo_description"
        label="Meta description"
        defaultValue={seoDescription}
        rows={3}
        hint={SEO_DESCRIPTION_HINT}
      />
    </Panel>
  );
}
