// The four roles a CMS account can hold, in one place for the Users screen and the action behind
// its role buttons. A "use server" file cannot export a list, which is why this is not in
// user-actions.ts. No runtime imports, so tests can load it as it is.

import type { ExtraFilterSpec } from "./list-params";

export const USERS_PATH = "/admin/users";

/** Most access first: the Users list sorts by role in the order the database declares them. */
export const USER_ROLES = [
  { value: "super_admin", label: "Super admin" },
  { value: "editor", label: "Editor" },
  { value: "seo_manager", label: "SEO manager" },
  { value: "pending", label: "No access (pending)" },
] as const;

export const USER_ROLE_HELP: Record<string, string> = {
  super_admin: "Everything, including users and deletions.",
  editor: "Create, edit, publish and delete content.",
  seo_manager: "Edit SEO titles, meta descriptions and publish dates only.",
  pending: "Signed up but has no access. Set a role to admit them.",
};

/** The Users list's one dropdown filter. The list has no status of its own: the role is the status. */
export const ROLE_FILTER: ExtraFilterSpec = {
  name: "role",
  label: "Role",
  anyLabel: "All roles",
  options: USER_ROLES.map((role) => ({ value: role.value, label: role.label })),
};

/** Where the people waiting for access are listed. */
export const WAITING_HREF = `${USERS_PATH}?role=pending`;
