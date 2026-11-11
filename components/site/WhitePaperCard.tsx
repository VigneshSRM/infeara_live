import Link from "next/link";
import { formatPostDate } from "@/lib/content/blogs";
import { formatFileSize, type WhitePaper } from "@/lib/content/white-papers";

/** The facts shown under a paper's summary: date and file size, whichever exist. */
export function paperFacts(paper: Pick<WhitePaper, "publishedAt" | "fileSizeBytes">) {
  const size = formatFileSize(paper.fileSizeBytes);
  return { date: paper.publishedAt, size: size ? `PDF, ${size}` : "" };
}

export function WhitePaperCard({ paper }: { paper: WhitePaper }) {
  const { date, size } = paperFacts(paper);

  return (
    <article className="flex h-full flex-col rounded-[var(--radius-card)] border border-navy/10 bg-ivory p-7">
      {paper.topic ? <p className="eyebrow text-blue">{paper.topic}</p> : null}
      <h3 className={`${paper.topic ? "mt-3" : ""} font-heading text-[1.1rem] font-semibold leading-snug text-navy`}>
        <Link href={`/white-papers/${paper.slug}`} className="transition-colors hover:text-blue">
          {paper.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-[0.9rem] leading-relaxed text-charcoal/70">{paper.summary}</p>

      {date || size ? (
        <p className="mt-5 font-heading text-[0.78rem] text-charcoal/70">
          {date ? <time dateTime={date}>{formatPostDate(date)}</time> : null}
          {date && size ? <span aria-hidden="true"> · </span> : null}
          {size}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {paper.fileUrl ? (
          <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-solid text-sm">
            Open the paper
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
        <Link href={`/white-papers/${paper.slug}`} className="btn-outline text-sm">
          Details
          <span className="sr-only"> of {paper.title}</span>
        </Link>
      </div>
    </article>
  );
}
