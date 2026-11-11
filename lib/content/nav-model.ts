// The header menu is the static `nav` in site.ts with one change: under Cybersecurity, Cloud &
// Datacenter, AI Automations and Application Development it lists the sub-services that are
// published in the database (Admin → Sub-services), in their saved order. Adding, reordering,
// unpublishing or deleting one changes the menu with no code change, and a deleted page can no
// longer leave a dead link in the header of every page. Everything else in `nav` stays as written.
//
// This file deliberately has no imports, so tests and scripts can load it as it is.

export type NavItem = {
  label: string;
  href: string;
  overviewLabel?: string;
  children?: readonly NavItem[];
};

export type NavSubservice = { parentSlug: string; slug: string; name: string };

/** The four hub entries that list sub-services, by the parent slug their sub-services carry. */
export const NAV_HUB_PARENTS: Readonly<Record<string, string>> = {
  "/services/cybersecurity": "cybersecurity",
  "/services/cloud-datacenter": "cloud-datacenter",
  "/services/ai-automations": "ai-automations",
  "/services/application-development": "application-development",
};

/** The contact form's "What is this about?" groups, in the order the form has always shown them. */
const OPTION_GROUPS = [
  { parentSlug: "cybersecurity", label: "Cybersecurity sub-services" },
  { parentSlug: "cloud-datacenter", label: "Cloud & Datacenter sub-services" },
  { parentSlug: "ai-automations", label: "AI Automation sub-services" },
  { parentSlug: "application-development", label: "Application Development sub-services" },
] as const;

export type OptionGroup = { label: string; names: string[] };

/** The published sub-services as option groups; a group with none left is left out. */
export function subserviceOptionGroups(subservices: readonly NavSubservice[]): OptionGroup[] {
  return OPTION_GROUPS.map(({ parentSlug, label }) => ({
    label,
    names: subservices.filter((service) => service.parentSlug === parentSlug).map((service) => service.name),
  })).filter((group) => group.names.length > 0);
}

function withoutChildren(item: NavItem): NavItem {
  const { label, href, overviewLabel } = item;
  return overviewLabel ? { label, href, overviewLabel } : { label, href };
}

/**
 * `base` with each hub's children replaced by `subservices` (already in display order). A hub with
 * none left keeps its link and loses its dropdown, rather than showing an empty one.
 */
export function buildNav(base: readonly NavItem[], subservices: readonly NavSubservice[]): NavItem[] {
  return base.map((item) => {
    if (item.href !== "/services" || !item.children) return item;

    return {
      ...item,
      children: item.children.map((child) => {
        const parentSlug = NAV_HUB_PARENTS[child.href];
        if (!parentSlug) return child;

        // The same address subservicePath() gives; kept inline so this file needs no import.
        const own = subservices
          .filter((service) => service.parentSlug === parentSlug)
          .map((service) => ({ label: service.name, href: `/services/${service.parentSlug}/${service.slug}` }));

        return own.length > 0 ? { ...child, children: own } : withoutChildren(child);
      }),
    };
  });
}
