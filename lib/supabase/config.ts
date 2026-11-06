export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Accepts either a legacy anon key or a publishable key (sb_publishable_…).
// Both are safe in the browser; row-level security is what protects the data.
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
