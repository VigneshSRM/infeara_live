// The text of /llms.txt: a short, plain description of the site for AI assistants and the tools
// that feed them (the format is described at https://llmstxt.org). Import-free, so the unit tests
// can load it as it is; app/llms.txt/route.ts gathers the pages and calls it.
//
// It says what the company is, where it is and what it does, then lists the pages worth reading
// with a line about each. It repeats only what the site itself says: no email address or phone
// number (the site publishes neither), no client names and no claims the pages do not make.

export type LlmsLink = { title: string; url: string; description?: string };
export type LlmsSection = { title: string; links: readonly LlmsLink[] };

export type LlmsInput = {
  name: string;
  /** One or two sentences: what the company does and for whom. */
  summary: string;
  /** Plain paragraphs under the summary: where it is, how it works, how to reach it. */
  details: readonly string[];
  sections: readonly LlmsSection[];
};

/** Collapses whitespace and cuts a description to one line of a sensible length. */
export function oneLine(text: string, max = 220): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).replace(/[\s,;:.-]+$/, "")}…`;
}

// A title goes inside [ ] and a link inside ( ), so those characters would end them early.
const linkText = (text: string) => oneLine(text, 120).replace(/[[\]]/g, "");
const linkUrl = (url: string) => url.replace(/\s/g, "%20").replace(/\)/g, "%29");

export function buildLlmsTxt(input: LlmsInput): string {
  const lines: string[] = [`# ${input.name}`, "", `> ${oneLine(input.summary, 400)}`, ""];

  for (const paragraph of input.details) lines.push(oneLine(paragraph, 600), "");

  for (const section of input.sections) {
    if (!section.links.length) continue;
    lines.push(`## ${section.title}`, "");
    for (const link of section.links) {
      const description = link.description ? `: ${oneLine(link.description)}` : "";
      lines.push(`- [${linkText(link.title)}](${linkUrl(link.url)})${description}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}
