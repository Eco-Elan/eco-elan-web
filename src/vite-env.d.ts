/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Stripe publishable (test) key — safe to expose to the browser. */
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
