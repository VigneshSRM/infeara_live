import Link from "next/link";
import { Fragment } from "react";
import { parseBlogBlocks, type BlogInline } from "@/lib/content/blogs";

// The theme maps navy, charcoal and blue to one colour, so a link cannot be told from the text
// around it by colour. The underline is what marks it, and it must stay.
const linkClass =
  "font-medium text-blue underline decoration-blue/50 underline-offset-[3px] hover:decoration-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

function Inline({ nodes }: { nodes: BlogInline[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === "bold") {
          return (
            <strong key={index} className="font-semibold text-navy">
              {node.text}
            </strong>
          );
        }

        if (node.type === "link") {
          return node.external ? (
            <a key={index} href={node.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {node.text}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link key={index} href={node.href} className={linkClass}>
              {node.text}
            </Link>
          );
        }

        return <Fragment key={index}>{node.text}</Fragment>;
      })}
    </>
  );
}

/**
 * The paragraphs of one section of a post. Text, links, bullets and sub-headings come from the
 * conventions parsed in lib/content/blogs.ts ("Text in a paragraph"); everything is built as
 * elements, so nothing an editor types is ever inserted as HTML.
 */
export function BlogBody({ paragraphs }: { paragraphs: string[] }) {
  const blocks = parseBlogBlocks(paragraphs);

  return (
    <div className="mt-4 space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "subheading") {
          return (
            <h3
              key={index}
              className="border-t border-navy/10 pt-6 font-heading text-[1.05rem] font-semibold leading-[1.3] text-navy"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={index}
              className="list-disc space-y-2 pl-5 text-[1rem] leading-[1.7] text-charcoal/80 marker:text-blue"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inline nodes={item} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-[1rem] leading-[1.75] text-charcoal/80">
            <Inline nodes={block.inline} />
          </p>
        );
      })}
    </div>
  );
}
