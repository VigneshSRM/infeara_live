import {
  getBlogPost,
  getCaseStudy,
  getIndustry,
  getInsight,
  getService,
  getSubservice,
} from "@/lib/content";
import { caseStudyLabel } from "@/lib/content/case-studies";
import { subserviceParents } from "@/lib/content/subservice-model";
import { renderCard, type CardContent } from "@/lib/seo/og-card";
import { cardTargetForSegments, type CardTarget } from "@/lib/seo/og-paths";

// The picture for a shared link to a service, a guide, a post, a case study or an industry page:
// /og/services/managed-it.png and so on (lib/seo/og-paths.ts lists them). It shows the page's own
// title, read from the same content the page shows, so an address that is not a published page
// has no picture and is a 404: this is not a way to print arbitrary text on the company's card.
//
// The route draws on request (it has a path parameter and no list of paths to build ahead), and the
// Cache-Control header below lets the CDN keep each picture, so a page is drawn about once an
// hour however often it is shared. A title changed in the admin reaches its picture within that hour.

type Props = { params: Promise<{ path: string[] }> };

const CACHE_CONTROL = "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400";
const PLACE = "Chennai, India";

async function contentFor(target: CardTarget): Promise<CardContent | null> {
  switch (target.kind) {
    case "service": {
      const service = await getService(target.slug);
      return service ? { eyebrow: `Services · ${PLACE}`, title: service.name } : null;
    }
    case "subservice": {
      const service = await getSubservice(target.parent, target.slug);
      const parent = subserviceParents.find((item) => item.slug === target.parent);
      return service ? { eyebrow: `${parent?.name ?? "Services"} · ${PLACE}`, title: service.name } : null;
    }
    case "insight": {
      const insight = await getInsight(target.slug);
      return insight ? { eyebrow: `${insight.category} guide`, title: insight.title } : null;
    }
    case "blog": {
      const post = await getBlogPost(target.slug);
      return post ? { eyebrow: `Blog · ${post.category}`, title: post.title } : null;
    }
    case "case-study": {
      const study = await getCaseStudy(target.slug);
      return study ? { eyebrow: caseStudyLabel(study), title: study.title } : null;
    }
    case "industry": {
      const industry = await getIndustry(target.slug);
      return industry ? { eyebrow: `Industries · ${PLACE}`, title: industry.name } : null;
    }
  }
}

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60", "Content-Type": "text/plain" } });

export async function GET(_request: Request, { params }: Props) {
  const { path } = await params;
  const target = cardTargetForSegments(path);
  if (!target) return notFound();

  const content = await contentFor(target);
  if (!content) return notFound();

  try {
    return renderCard(content, { "Cache-Control": CACHE_CONTROL });
  } catch (error) {
    // Say that it failed, not why: the reason can name files on the server.
    console.error("[og] could not draw the card for", path.join("/"), error instanceof Error ? error.name : "error");
    return new Response("The picture could not be drawn.", { status: 500 });
  }
}
