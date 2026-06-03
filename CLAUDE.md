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

**Eco Elan** is a static marketing + booking site for a Toronto eco-cleaning service. React 19 + TypeScript + Vite, routed with React Router v7. No backend — the booking wizard is fully frontend and fires no API calls.

### Data layer

All site content (services, pricing, plans, testimonials, FAQs, image URLs) lives in `src/data/content.ts` as typed exported constants. This is the single source of truth for copy and pricing. When updating services, prices, or plans, edit only this file.

Pricing formula used in `StepConfirm`:
```
total = Math.round(service.price * propertySize.mult + addonsTotal)
```

### Navigation

Never import `useNavigate` or `<Link>` directly. Use the abstractions in `src/lib/nav.ts`:
- `useGo()` — navigates and scrolls to top
- `pathFor(route, params)` — builds typed URLs
- `useCurrentRoute()` — returns the active `RouteName`

All valid routes are the `RouteName` union type defined there.

### Booking wizard

`BookingPage` owns all state (`BookingData`) and orchestrates the 4-step flow: Service → Schedule → Details → Confirm. Each step receives `data`, `setData`, `next`, and optionally `back`. The page accepts a `?service=<id>` query param to pre-select a service. After confirm, it renders `BookingConfirmed` instead of the wizard.

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

### Shared components

- `Icon` — custom inline SVG set. Always use `<Icon name="...">` (typed `IconName`) rather than importing external icon libraries.
- `Img` — lazy-loading `<img>` wrapper with `objectFit: cover`.
- `Logo`, `Header`, `Footer`, `ChatFab` — global layout, always rendered by `App`.
- `PageHero`, `MarqueeStrip`, `FaqSection`, `FinalCTA`, `Counter` — reusable page-level sections.
