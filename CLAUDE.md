# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # preview production build
```

There is no test suite.

## Architecture

**Eco Elan** is a marketing + booking site for a Toronto eco-cleaning service. React 19 + TypeScript + Vite, routed with React Router v7. The frontend is static, but it's backed by **Vercel serverless functions in `/api`** that handle Stripe payments and Resend transactional email. Deploys to Vercel.

### Data layer

All site content (services, pricing, plans, testimonials, FAQs, image URLs) lives in `src/data/content.ts` as typed exported constants. This is the single source of truth for copy and pricing. When updating services, prices, or plans, edit only this file.

**Pricing lives in `src/data/pricing.ts`** — `computeTotal()` and `computeAmountCents()` (CAD cents for Stripe). This is the single pricing source of truth, imported by BOTH the React app (`StepConfirm`, `StepPayment`, the receipt) and the serverless `/api` functions, so the amount shown to the client and the amount Stripe charges can never drift. The server always recomputes from this module and never trusts a client-supplied total.
```
total = Math.round(service.price * propertySize.mult + addonsTotal)   // no tax applied
```

### Navigation

Never import `useNavigate` or `<Link>` directly. Use the abstractions in `src/lib/nav.ts`:
- `useGo()` — navigates and scrolls to top
- `pathFor(route, params)` — builds typed URLs
- `useCurrentRoute()` — returns the active `RouteName`

All valid routes are the `RouteName` union type defined there. Routes are declared in `App.tsx`; the catch-all `*` route renders `HomePage` (there is no 404 page). `App` also prefetches each page's hero image during browser idle time (`usePrefetchImages`).

### Backend (`/api` serverless functions)

Vercel serverless functions (Node, `@vercel/node`). They import shared app modules (`src/data/pricing.ts`, `src/data/content.ts`) using **`.js` extensions** — required for `nodenext`/ESM resolution at runtime even though the source files are `.ts`. `vercel.json` rewrites everything except `/api/*` to `index.html` (SPA fallback).

- `POST /api/create-payment-intent` — recomputes the charge from `src/data/pricing.ts`, creates a CAD Stripe `PaymentIntent` (`automatic_payment_methods`), and stashes booking details in `metadata`. Deliberately sets **no `receipt_email`** so Stripe's own receipt is suppressed.
- `POST /api/stripe-webhook` — verifies the Stripe signature (needs the **raw body**, so `bodyParser` is disabled via `export const config`). On `payment_intent.succeeded` it sends the single branded HTML receipt via Resend. Email failures are logged but never throw/non-200 (a non-200 makes Stripe retry the whole webhook).
- `POST /api/contact` — emails the contact-form submission to the business inbox via Resend and sends the visitor a brief auto-reply.

Required env vars (see `.env.example`): `VITE_STRIPE_PUBLISHABLE_KEY` (client, build-time), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (must be a Resend-verified domain), `CONTACT_TO_EMAIL`. Use Stripe **test** keys in development. Stripe is initialized client-side in `src/lib/stripe.ts` (`stripePromise` is `null` when the publishable key is missing; `ecoAppearance` themes the embedded Elements to the design tokens).

Note: email clients (Gmail's image proxy) cache logo images by URL, so when the receipt logo art changes, give it a **fresh filename** rather than overwriting the old path — otherwise the stale cached image keeps showing.

### Admin console (`/ee-admin`)

A staff-only console for quotations, invoices and payment links, rendered **without** the marketing chrome (`App.tsx` routes `/ee-admin` outside the `MarketingShell`). `src/pages/EeAdminPage.tsx` is the (class-component) UI; `src/pages/ee-admin/AuthGate.tsx` wraps it with **Supabase magic-link auth** and supplies an `authFetch` that attaches the access token to every call.

- **Data** lives in **Supabase Postgres** (`supabase/schema.sql` — one `orders` row per order, documents as JSONB). The console never touches the DB directly; it goes through `/api/admin/*`.
- **Shared domain** (types, `SERVICE_CATALOG`, `seedOrders`, `money`, `invMath`, `quoteTotal`, doc IDs) is in **`src/data/admin.ts`** — isomorphic, imported by both the console and the API (same pattern as `pricing.ts`). HST is 13%.
- **Quote ↔ invoice linking**: an invoice's `fromQuote` flag (default `true` on new orders) makes its line items auto-mirror the quotation's (`quoteItemsToInvItems`: a quote `amount` → invoice `unit`, `qty 1`). Editing any invoice line in the console sets `fromQuote=false` (unlink); the "Sync from quotation" button re-links. The reverse "Pull from invoice" copies invoice items into the quote (`invItemsToQuoteItems`). Invoice-level discount/HST edits do **not** unlink. Seed/existing orders have `fromQuote` undefined (treated as unlinked) so their hand-tuned invoices are preserved.
- **Server-only** modules are in **`src/server/`** (excluded from `tsconfig.app.json`; typechecked via `tsconfig.api.json` — run `npx tsc -p tsconfig.api.json`): `supabaseAdmin.ts` (service-role client + row↔Order mapping + data access), `adminAuth.ts` (`requireAdmin` = verify Supabase JWT + `ADMIN_EMAILS` allowlist — **the real authz boundary**; the client gate is UX), and `pdf/index.ts` (`@react-pdf/renderer` quotation/invoice/receipt PDFs — plain `.ts`/`createElement`, **not** `.tsx`: Vercel's bundler won't resolve a `.js` import to a `.tsx` source, so a `.tsx` module would be dropped from the deployed function).
- **Endpoints** (all call `requireAdmin` first): `GET/POST/PATCH /api/admin/orders`, `POST /api/admin/send-document` (renders + emails the PDF, marks doc `sent`; the invoice email includes a "Pay invoice online" button to the pay page when a link exists), `POST /api/admin/payment-link` (real Stripe **Payment Link** for the invoice total, server-recomputed). The Stripe webhook now also handles `checkout.session.completed` (metadata `type:"invoice"`) → mark paid + email the receipt PDF.
- **Customer payment page** `/pay/:id` (`src/pages/PayPage.tsx`, routed outside `MarketingShell`): a public, branded page showing the invoice amount + a "Pay now" button that sends the customer to the Stripe Payment Link. Stripe's `after_completion` redirects back to `/pay/:id?paid=1`, where the page flips to a paid / thank-you / "receipt emailed" state (polling `pay-info` to catch the webhook). Backed by **`GET /api/pay-info?id=<orderId>`** — **public, no `requireAdmin`** (the order uuid is the capability); it returns only `{ invoiceId, name, amount, status, receiptSent, payUrl }` (amount recomputed server-side), never quote/admin/PII data. The admin console's "Copy link" / "Open payment page" point at this `/pay/:id` URL (what the customer sees), not the raw Stripe URL.

Admin env vars (see `.env.example`): `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (client auth), `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` (server, never exposed), `ADMIN_EMAILS` (comma-separated allowlist), `PUBLIC_BASE_URL`. The webhook must be subscribed to **both** `payment_intent.succeeded` (bookings) and `checkout.session.completed` (admin invoices).

### Booking wizard

`BookingPage` owns all state (`BookingData`) and orchestrates the 5-step flow: Service → Schedule → Details → Confirm → Payment. Each step receives `data`, `setData`, `next`, and optionally `back`. The page accepts a `?service=<id>` query param to pre-select a service. `StepPayment` creates the `PaymentIntent` on mount and mounts Stripe `<Elements>` (PaymentElement + ExpressCheckoutElement for Apple/Google Pay); on `payment_intent.succeeded` it calls `onPaid`, after which `BookingPage` renders `BookingConfirmed` instead of the wizard.

### Animations

`<Reveal delay={ms}>` wraps any content for scroll-triggered fade-in. It uses an `IntersectionObserver` (12% threshold) that adds the CSS class `in` once, then unobserves. The `.reveal` + `.in` styles live in `styles.css`. Use `delay` (ms) to stagger sibling reveals.

The `motion` package (Motion/Framer Motion v12) is installed for more complex animations when needed.

### Styling conventions

- Global CSS only — no CSS modules, no Tailwind. All tokens are CSS custom properties in `src/styles.css`.
- Key tokens: `--eco-green`, `--eco-green-dark`, `--eco-muted`, `--eco-ink`, `--eco-cream`, `--eco-accent`
- Layout: `.container-x` (max 1240px, centered, 24px horizontal padding)
- Buttons: `className="btn btn-primary"` or `className="btn btn-ghost"`
- Section labels: `.eyebrow` (uppercase, tracked, green)
- Inline styles are used alongside global classes throughout — this is intentional, not a mistake.
- Ignore `design-system/eco-elan/MASTER.md` for token values. It is a generated spec describing a cyan `--color-*` palette that does **not** match the implementation. `src/styles.css` (`--eco-green`, etc.) is the only source of truth for the live design.

### Shared components

- `Icon` — custom inline SVG set. Always use `<Icon name="...">` (typed `IconName`) rather than importing external icon libraries.
- `Img` — lazy-loading `<img>` wrapper with `objectFit: cover`.
- `Logo`, `Header`, `Footer`, `ChatFab` — global layout, always rendered by `App`.
- `PageHero`, `MarqueeStrip`, `FaqSection`, `FinalCTA`, `Counter` — reusable page-level sections.
