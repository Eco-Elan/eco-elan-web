import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client (public anon key — safe to expose). Used only for
// staff auth (magic-link sign-in) on the /ee-admin console; all data access
// goes through the /api/admin/* functions, never directly from the browser.
// Null when env isn't configured, so the console can show a clear message.
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null;
