/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Stripe publishable (test) key — safe to expose to the browser. */
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  /** Supabase project URL — safe to expose. */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anon (public) key — safe to expose; used for staff auth only. */
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
