import { cache } from "react";
import { listSubservices } from "./index";
import { buildNav, type NavItem } from "./nav-model";
import { nav } from "./site";

export type { NavItem } from "./nav-model";

/**
 * The header menu for this request. Sub-services come from the database (or the built-in copy
 * while the database is not set up, exactly as the pages themselves do), so the menu and the
 * pages it links to always agree. Wrapped in `cache` so the header, rendered once per page,
 * reads the table once.
 */
export const getNav = cache(async (): Promise<readonly NavItem[]> => buildNav(nav, await listSubservices()));
