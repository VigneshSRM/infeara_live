// Unit tests for the rule that decides who the CMS lets in (lib/auth/access.ts).
//
//   npm run test:unit
//
// The module is plain TypeScript with no imports, so it is compiled in memory with the
// project's own TypeScript and loaded from a data: URL. No build, no server, no Supabase,
// and it does not depend on the Node version being able to run .ts files.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../lib/auth/access.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { resolveStaffAccess, isStaffRole } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const user = { id: "u-1", email: "person@example.com" };
const profile = (role, extra = {}) => ({ email: "person@example.com", full_name: "Person", role, ...extra });

test("nobody signed in is anonymous", () => {
  assert.deepEqual(resolveStaffAccess({ user: null, profile: null, error: null }), { status: "anonymous" });
});

test("each working role is let in, with the profile's identity", () => {
  for (const role of ["super_admin", "editor", "seo_manager"]) {
    assert.deepEqual(resolveStaffAccess({ user, profile: profile(role), error: null }), {
      status: "staff",
      user: { id: "u-1", email: "person@example.com", name: "Person", role },
    });
  }
});

test("a staff member whose profile has no email falls back to the sign-in email", () => {
  const access = resolveStaffAccess({ user, profile: profile("editor", { email: null }), error: null });
  assert.equal(access.status, "staff");
  assert.equal(access.user.email, "person@example.com");
});

test("a pending account is signed in but has no role", () => {
  assert.deepEqual(resolveStaffAccess({ user, profile: profile("pending"), error: null }), {
    status: "no_role",
    email: "person@example.com",
  });
});

test("no visible profile row is also no role (row-level security hides a pending row from its owner)", () => {
  assert.deepEqual(resolveStaffAccess({ user, profile: null, error: null }), {
    status: "no_role",
    email: "person@example.com",
  });
});

test("an unknown role string is never let in", () => {
  for (const role of ["admin", "owner", "Super_Admin", "", "service_role"]) {
    assert.equal(resolveStaffAccess({ user, profile: profile(role), error: null }).status, "no_role", role);
  }
});

test("a refused read is reported as a permission problem, not as 'no profile'", () => {
  const byCode = resolveStaffAccess({
    user,
    profile: null,
    error: { code: "42501", message: "permission denied for table profiles" },
  });
  assert.deepEqual(byCode, { status: "lookup_failed", email: "person@example.com", cause: "permission" });

  const byMessage = resolveStaffAccess({
    user,
    profile: null,
    error: { message: "Permission denied for function is_staff" },
  });
  assert.equal(byMessage.status, "lookup_failed");
  assert.equal(byMessage.cause, "permission");
});

test("any other failed read is reported as unavailable", () => {
  for (const error of [
    { code: "PGRST205", message: "Could not find the table 'public.profiles' in the schema cache" },
    { code: "PGRST301", message: "JWT expired" },
    { code: "XX000", message: "internal error" },
    { message: "fetch failed" },
    {},
  ]) {
    const access = resolveStaffAccess({ user, profile: null, error });
    assert.equal(access.status, "lookup_failed", JSON.stringify(error));
    assert.equal(access.cause, "unavailable", JSON.stringify(error));
  }
});

test("a failed read wins over a profile that arrived with it", () => {
  const access = resolveStaffAccess({ user, profile: profile("super_admin"), error: { code: "XX000" } });
  assert.equal(access.status, "lookup_failed");
});

test("a signed-in account with no email still gets an outcome", () => {
  const noEmail = { id: "u-2", email: null };
  assert.deepEqual(resolveStaffAccess({ user: noEmail, profile: null, error: null }), { status: "no_role", email: "" });
  assert.deepEqual(resolveStaffAccess({ user: noEmail, profile: null, error: { code: "42501" } }), {
    status: "lookup_failed",
    email: "",
    cause: "permission",
  });
});

test("the failure outcomes never carry the database's wording", () => {
  const access = resolveStaffAccess({
    user,
    profile: null,
    error: { code: "42501", message: "permission denied for table profiles" },
  });
  assert.deepEqual(Object.keys(access).sort(), ["cause", "email", "status"]);
});

test("isStaffRole accepts exactly the three working roles", () => {
  assert.equal(isStaffRole("super_admin"), true);
  assert.equal(isStaffRole("editor"), true);
  assert.equal(isStaffRole("seo_manager"), true);
  assert.equal(isStaffRole("pending"), false);
  assert.equal(isStaffRole("anything"), false);
});
