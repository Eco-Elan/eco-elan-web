# Change History

A running log of changes made to this repo, written so a future Claude (or
designer) can pick up context without re-deriving it. Newest entry on top.

---

## 2026-06-08 — Embedded Stripe payment step + contact form (pass 2)

Wired the handoff payment mockup (`ecoelan-handoff(2).zip`) into the real booking
flow and made the contact form actually send. The mockup was the source of truth
for layout/copy; only the placeholder card fields + mock wallet buttons were
replaced with real Stripe elements. Build + lint green; API files typecheck
clean under strict mode. **Locked decisions:** NO tax (total = `svc.price *
size.mult + addons`); **full charge** of the total (per the "Total paid" design);
Stripe **test mode**; host = **Vercel**.

### Booking is now a 5-step wizard
Service → Schedule → Details → Confirm → **Payment** → receipt. "Confirm Booking"
became **"Continue to Payment"** (advances, does not finish). After Stripe
confirms, `BookingConfirmed` renders the paid-receipt screen.

### Files added
- `src/data/pricing.ts` — **single source of truth** for the total. `computeTotal()`
  / `computeAmountCents()` (CAD cents). Imported by BOTH the app and the API so
  the displayed and charged amounts can't drift. No tax.
- `src/lib/stripe.ts` — `stripePromise` singleton + `ecoAppearance` (Stripe
  Appearance API themed to `--eco-green #2E7355`, 12px radius, focus ring
  `rgba(46,115,85,.12)`).
- `src/pages/booking/StepPayment.tsx` — creates a PaymentIntent via the API, then
  mounts `<Elements>` with `<PaymentElement>` (replaces the hand-drawn card
  fields) + `<ExpressCheckoutElement>` (replaces the mock Apple/Google Pay
  buttons; the express row + "Or pay with card" divider **collapse** when no
  wallet is available). States: loading → idle → processing (spinner + disabled)
  → inline error. `PayShell` holds the designed chrome (card shell, heading,
  trust row, summary, total) so it's identical across states.
- `api/create-payment-intent.ts` — POST; recomputes total server-side from
  `pricing.ts` (never trusts the client), CAD PaymentIntent in cents, sets
  `receipt_email` so Stripe emails the customer's receipt. Returns
  `{ clientSecret, paymentIntentId }`.
- `api/stripe-webhook.ts` — verifies signature (raw body; `bodyParser` disabled),
  treats `payment_intent.succeeded` as source of truth. **SEAM** left for a
  future business-notification email (clearly marked).
- `api/contact.ts` — POST; emails the submission to `info@eco-elan.com` via Resend
  + a visitor auto-reply.
- `.env.example` — documents all keys.
- `src/vite-env.d.ts` — types `VITE_STRIPE_PUBLISHABLE_KEY`.

### Files changed
- `src/pages/booking/types.ts` — added `paymentStatus?` + `paymentIntentId?`.
- `src/pages/booking/StepConfirm.tsx` — `confirm(total)` → `next()`, button copy,
  uses `computeTotal`.
- `src/pages/booking/BookingConfirmed.tsx` — now the **paid receipt** (real
  PaymentIntent id replaces the old `Math.random()` ref — this also cleared the
  earlier `react-hooks/purity` lint error; itemized base/size/add-ons; "receipt
  emailed to {email}").
- `src/pages/BookingPage.tsx` — 5th step wired; `onPaid(total, piId)` stores
  payment fields then shows the receipt.
- `src/pages/ContactPage.tsx` — controlled form → POSTs `/api/contact`; sending +
  inline error states; visuals unchanged.
- `vercel.json` — catch-all now excludes `/api` (`/((?!api/).*)`) so functions
  aren't shadowed by the SPA fallback.
- `.gitignore` — ignores `.env` / `.env.*` (keeps `.env.example`).
- `eslint.config.js` — Node-globals override for `api/**/*.ts`.
- `package.json` — added `@stripe/stripe-js`, `@stripe/react-stripe-js`, `stripe`,
  `resend`, and dev `@vercel/node`.

### Env / DNS the owner must set (NOT in repo)
- Vercel env vars: `VITE_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`,
  `CONTACT_TO_EMAIL`.
- Stripe Dashboard → webhook endpoint `/api/stripe-webhook` (event
  `payment_intent.succeeded`) → copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
- Resend: verify the `eco-elan.com` sending domain (DNS records) so
  `CONTACT_FROM_EMAIL` can send.
- Apple Pay needs the domain registered in Stripe + HTTPS; the express row hides
  itself until a wallet is available.

### Notes / open items
- Local `vite` dev does NOT run `/api`. Use `vercel dev` (or deploy a preview) to
  exercise payment + contact end-to-end. Test card `4242 4242 4242 4242`.
- Copy inconsistency carried over from the mockup: StepConfirm still reads
  "Payment collected only after the clean is done", but checkout now charges
  up front. Left as-designed per the handoff — flag for a copy review.

---

## 2026-06-08 — SEO + accessibility audit fixes (pass 1)

Source: a site audit of eco-elan.com (June 8, 2026). Implemented the technical
"quick wins" that needed no business decisions or new image assets. Build
(`tsc -b && vite build`) passes; `robots.txt` + `sitemap.xml` land in `dist/`.

### Done

| Audit ID | Issue | Fix | Files |
|----------|-------|-----|-------|
| C1 | Inner pages 404 on direct load (SPA had no host fallback) | Added Vercel catch-all rewrite `/(.*)` → `/index.html` | `vercel.json` (new) |
| C2 | "Why Eco Elan" stat counters stuck at `0` | Hardened the IntersectionObserver: threshold `0.4`→`0.1`, added `rootMargin: "0px 0px -10% 0px"`, and a **1.6s fallback timeout** that snaps to the final value if the observer never fires | `src/components/Counter.tsx` |
| C3 | Five `<h1>` on homepage (one per rotating hero scene) | Page now has **one** visually-hidden `<h1>` ("Toronto's Eco-Friendly Plant-Based Cleaning Service"). The five scene headlines are now `<div className="hero-h1" role="heading" aria-level={2}>` — pixel-identical | `src/pages/HomePage.tsx` |
| C4 | No `robots.txt` / `sitemap.xml` | Added both to `public/` (sitemap lists all 7 routes) | `public/robots.txt`, `public/sitemap.xml` (new) |
| H2 | No Open Graph / Twitter card tags | Added OG + Twitter meta | `index.html` |
| H3 | No structured data | Added `HouseCleaningService` JSON-LD. **No `aggregateRating`** on purpose — real reviews aren't verified yet (see H1) | `index.html` |
| H4 | No canonical tag | Added `<link rel="canonical" href="https://www.eco-elan.com/">` | `index.html` |
| H5 | Nav/footer links were `href="#"` + onClick (not crawlable, no middle-click) | Header nav and footer Quick Links / Services are now real `<a href>` built with `pathFor()` (keeps the `nav.ts` abstraction; `onClick` still does SPA nav). Footer "Sitemap" → `/sitemap.xml` | `src/components/Header.tsx`, `src/components/Footer.tsx` |

### Design / convention notes for whoever continues this

- **Navigation abstraction is intentional.** Per `CLAUDE.md`, never import
  `useNavigate`/`<Link>` directly. Use `useGo()`, `pathFor(route, params)`,
  `useCurrentRoute()` from `src/lib/nav.ts`. The H5 fix builds `href` with
  `pathFor()` and keeps `onClick={(e) => { e.preventDefault(); go(...) }}` so
  links are both crawlable AND scroll-to-top SPA navigations.
- **Single-h1 pattern:** the visually-hidden `<h1>` lives inside the `Hero`
  `<section>` in `HomePage.tsx`. If you add more headings, keep it the only
  `<h1>`; rotating/visual headings should stay `role="heading" aria-level={2}`.
- **Counter fallback:** the 1.6s timer in `Counter.tsx` guarantees no `0` is
  ever shown. Don't lower it below the animation duration (1400ms) or the
  count-up will get cut off when the fallback fires.
- **og:image is a placeholder.** Currently points at the existing
  `safer_for_pets.jpg` so link previews work. Replace with a dedicated
  **1200×630** `og-image.jpg` in `public/assets/` and update the 2 `og:image`/
  `twitter:image` URLs in `index.html`.

### Not done — needs business input or assets

- **H1 — Fake testimonials.** Avatars still load AI faces from `randomuser.me`
  (`src/data/content.ts:88-92`) with placeholder copy. Needs real Google
  reviews + self-hosted avatars (content/legal decision). When real reviews
  exist, also add `aggregateRating` to the JSON-LD in `index.html`.
- **H6 — Dead legal/social links.** Footer Privacy / Terms / Accessibility and
  the social icons are still `href="#"`. Needs real route pages + profile URLs.
- **M1 — Oversized hero image.** `public/assets/healthier_air.jpg` is ~9.3 MB
  (5760×3840). Resize to ~1600–1920px wide, convert to AVIF/WebP.
- **M5 — SSG / pre-rendering.** Larger architectural effort, deferred.

### Pre-existing issues (NOT introduced by this pass)

`npm run lint` reports 2 errors in `src/pages/booking/BookingConfirmed.tsx`
(`Math.random` called during render; set-state-in-effect). These predate this
work and were left untouched.
