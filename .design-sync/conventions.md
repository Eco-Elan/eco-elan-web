# Eco Elan — design system conventions

Eco Elan is a warm, eco-premium brand for a Toronto plant-based cleaning service: deep greens, cream backgrounds, generous rounding, soft shadows. This kit ships **4 React primitives** plus a **token + utility-class** styling system. Build layout and visual styling with the tokens and classes below — the components are intentionally small.

## Setup
- No provider/wrapper is required. The components are standalone.
- Ensure the kit's `styles.css` is loaded — it defines the `--eco-*` tokens and all utility classes. Nothing renders on-brand without it.
- Brand font is **"Plus Jakarta Sans"** (weights 400–800), loaded at runtime via Google Fonts. Add to `<head>`:
  `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">`
  Then `font-family: "Plus Jakarta Sans", system-ui, sans-serif;`. Headings use `font-weight:700` and `letter-spacing:-0.02em`.

## Components (`window.EcoElan.*`)
- `Icon` — inline SVG set. `<Icon name="leaf" size={24} />`. Inherits `currentColor`, so recolor via `style={{color:"var(--eco-green)"}}` or a parent's color. `name` is a fixed union (leaf, sparkles, shield, check-circle, calendar, clock, star, droplet, wind, spray, phone, mail, map-pin, arrow-right, lock, credit-card, instagram, …). `stroke` sets stroke width.
- `Img` — lazy `<img>` wrapper, `object-fit:cover`, fills its parent. `<Img src={url} alt="…" radius={18} />`. Give it a sized container.
- `Reveal` — scroll-triggered fade/slide-in wrapper. `<Reveal delay={120}>…</Reveal>`. Stagger siblings with `delay` (ms).
- `Counter` — animated count-up. `<Counter to={4800} suffix="+" />`. `duration` (ms) controls the ease.

## Styling idiom — tokens + utility classes (NOT prop styling)
Do NOT pass color/spacing props to components. Style with CSS custom properties and the shipped classes.

**Color tokens:** `--eco-green` `#2E7355` (primary), `--eco-green-2` (hover), `--eco-green-dark` `#11271B`, `--eco-green-light`, `--eco-green-soft`, `--eco-navy`, `--eco-cream` `#F8F9F4` (page bg), `--eco-cream-2`, `--eco-ink` `#0F1A14` (text), `--eco-muted` `#6B7B72` (secondary text), `--eco-line` `#E2E7DD` (borders), `--eco-accent` `#EAC868` (gold).
**Shadows:** `--shadow-sm` `--shadow-md` `--shadow-lg` `--shadow-glow`.

**Utility / component classes:**
- `.container-x` — page width clamp (max 1240px, centered, 24px gutters).
- `.eyebrow` — small uppercase tracked green label above headings.
- `.btn` + a variant: `.btn-primary` (green fill), `.btn-ghost` (outline), `.btn-light` (white), `.btn-outline-light`, `.btn-accent`. Pill-shaped.
- `.card` — white rounded panel with border + soft shadow.
- `.chip` — small rounded tag. `.stat-num` — large stat number. `.svc-card` — service card.
- Form controls: `.input`, `.textarea`, `.select`, `.label`.

## Where the truth lives
Read the kit's `styles.css` for the full token + class list and exact values before styling. It is the only source of truth (ignore any `MASTER.md` — it's a stale spec that does not match this kit).

## Idiomatic snippet
```jsx
const { Icon, Reveal } = window.EcoElan;

<section className="container-x" style={{ padding: "64px 0" }}>
  <Reveal>
    <span className="eyebrow">Eco-friendly clean</span>
    <h2 style={{ color: "var(--eco-ink)", marginTop: 10 }}>Plant-based deep clean</h2>
    <p style={{ color: "var(--eco-muted)", maxWidth: 520 }}>
      Non-toxic products, spotless results — gentle on your home and the planet.
    </p>
    <div className="card" style={{ marginTop: 20, padding: 24, display: "inline-flex", gap: 10 }}>
      <Icon name="leaf" size={22} style={{ color: "var(--eco-green)" }} />
      <a className="btn btn-primary" href="#book">Book a clean</a>
    </div>
  </Reveal>
</section>
```
