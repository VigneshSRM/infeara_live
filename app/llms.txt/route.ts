import {
  listBlogPosts,
  listCaseStudies,
  listIndustries,
  listInsights,
  listServices,
  listSubservices,
} from "@/lib/content";
import { company } from "@/lib/content/site";
import { subservicePath, subserviceParents } from "@/lib/content/subservice-model";
import { buildLlmsTxt, type LlmsLink } from "@/lib/seo/llms";
import { SITE_INDEXABLE, SITE_URL } from "@/lib/site";

// Rebuilt every five minutes, like the sitemap, so a service or post published in the admin is
// listed without a new deployment. (Must be a literal: Next reads it at build time.)
export const revalidate = 300;

const absolute = (path: string) => `${SITE_URL}${path}`;

export async function GET() {
  // A closed site (SITE_INDEXABLE=false, or a Vercel preview) advertises nothing, as with the sitemap.
  if (!SITE_INDEXABLE) return new Response("Not found", { status: 404 });

  const [services, subservices, insights, blogPosts, caseStudies, industries] = await Promise.all([
    listServices(),
    listSubservices(),
    listInsights(),
    listBlogPosts(),
    listCaseStudies(),
    listIndustries(),
  ]);

  const subserviceSections = subserviceParents.map((parent) => ({
    title: `${parent.name}: focused services`,
    links: subservices
      .filter((item) => item.parentSlug === parent.slug)
      .map<LlmsLink>((item) => ({
        title: item.name,
        url: absolute(subservicePath(item.parentSlug, item.slug)),
        description: item.summary,
      })),
  }));

  const body = buildLlmsTxt({
    name: company.name,
    summary: company.description,
    details: [
      `${company.name} is based in ${company.city}, ${company.region}, ${company.country}. Delivery is remote by default, with onsite attendance arranged where physical access is required. Hours: ${company.hours}.`,
      `Enquiries go through the contact form at ${absolute("/contact")}. Response targets are agreed in a written service schedule for each client; the support model is explained at ${absolute("/sla")}.`,
    ],
    sections: [
      {
        title: "Services",
        links: services.map((service) => ({
          title: service.name,
          url: absolute(`/services/${service.slug}`),
          description: service.summary,
        })),
      },
      ...subserviceSections,
      {
        title: "Guides and blog posts",
        links: [
          ...insights.map((insight) => ({
            title: insight.title,
            url: absolute(`/insights/${insight.slug}`),
            description: insight.excerpt,
          })),
          ...blogPosts.map((post) => ({
            title: post.title,
            url: absolute(`/blogs/${post.slug}`),
            description: post.excerpt,
          })),
        ],
      },
      {
        title: "Company",
        links: [
          { title: "About Infeara", url: absolute("/about"), description: "Who we are and what we do not claim." },
          { title: "Our approach", url: absolute("/approach"), description: "Assess, stabilise, operate, improve." },
          { title: "SLA and support model", url: absolute("/sla"), description: "How severity, escalation and reporting work." },
          { title: "Frequently asked questions", url: absolute("/faq") },
          { title: "Contact", url: absolute("/contact") },
        ],
      },
      {
        title: "Optional",
        links: [
          ...industries.map((industry) => ({
            title: industry.name,
            url: absolute(`/industries/${industry.slug}`),
            description: industry.summary,
          })),
          ...caseStudies.map((study) => ({
            title: study.title,
            url: absolute(`/case-studies/${study.slug}`),
            description: study.situation,
          })),
        ],
      },
    ],
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
