import Link from "next/link";
import { formatPostDate } from "@/lib/content/blogs";

/**
 * The line under the title of a guide or a blog post: when it was published, who wrote it and how
 * long it takes to read. Every article on this site is written by the company, so the byline is
 * the company, and it links to the About page that says who that is.
 */
export function ArticleByline({ publishedAt, minutes }: { publishedAt: string; minutes: number }) {
  return (
    <p className="mt-6 font-heading text-[0.78rem] text-ivory/70">
      <time dateTime={publishedAt}>{formatPostDate(publishedAt)}</time>
      <span aria-hidden="true"> · </span>
      <span>
        By{" "}
        <Link
          href="/about"
          rel="author"
          className="underline decoration-ivory/30 underline-offset-4 transition-colors hover:decoration-ivory"
        >
          Infeara Technologies
        </Link>
      </span>
      <span aria-hidden="true"> · </span>
      {minutes} min read
    </p>
  );
}
