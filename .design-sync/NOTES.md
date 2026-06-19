# design-sync notes — Eco Elan

Repo-specific gotchas for future syncs. One bullet per quirk.

## Repo shape
- This is a **marketing/booking app**, not a published component library. `package.json` (`nuueco`, private) has no `main`/`module`/`exports`, and `dist/` is a built *website*, not a component bundle.
- Sync is deliberately **scoped to 4 reusable primitives**: `Icon`, `Img`, `Reveal`, `Counter`. The page-coupled sections (`Header`, `Footer`, `ChatFab`, `PageHero`, `FinalCTA`, `MarqueeStrip`, `FaqSection`) are intentionally excluded — they depend on the router (`src/lib/nav.ts`) and `src/data/content.ts` and aren't reusable DS material.
- Because there's no dist entry, we use a **scoped custom entry** (`.design-sync/eco-ds-entry.ts`) instead of synth-entry mode. Synth-entry would `export *` every src file and pull the Stripe/router/content code into the bundle. Keep the entry's exports in lockstep with `cfg.componentSrcMap`.
- The real design-language value is `src/styles.css` (tokens `--eco-*`, classes `.btn`/`.btn-primary`/`.btn-ghost`/`.eyebrow`/`.container-x`, `.reveal`/`.in`). That ships via `cfg.cssEntry`.
- IGNORE `design-system/eco-elan/MASTER.md` — per CLAUDE.md it's a stale generated spec (cyan `--color-*`) that does NOT match the implementation. `src/styles.css` is the only source of truth.

## Logo — dropped (do not re-add without changing app code)
- `Logo` (`src/components/Logo.tsx`) renders `<img src="/assets/logo.svg">` (a site-absolute path). It renders as a broken-image glyph in the preview, and any generated design using it would 404 the asset — it's non-portable by construction.
- To make it syncable, the component itself would need to accept a `src` prop or inline the SVG. That's an app-source change, out of scope for the sync. If desired later, change the component first, then add `Logo` back to BOTH `eco-ds-entry.ts` and `cfg.componentSrcMap`.

## Render warnings — triaged as benign (known list)
- `[RENDER_THIN] components/general/Icon/Icon.html` — Icon cells are SVG-only with no text nodes, so the "no text / paints nothing" heuristic fires. The icons DO paint (visible green strokes, ~25KB screenshot). Benign — expected for an icon set.
- `[FONT_MISSING] "Plus Jakarta Sans"` — the brand font loads at runtime via a Google Fonts `<link>` in `index.html`, not a shipped `@font-face`. Suppressed honestly via `cfg.runtimeFontPrefixes: ["Plus Jakarta Sans"]`. Cards render in `system-ui` fallback (clean). The conventions header tells the design agent the brand font + how it loads.

## Component fidelity caveats
- `Img` needs a real `src`; the preview uses a deterministic offline `data:image/svg+xml` gradient tile so the card renders without a network fetch. `Img.Rounded` is wider than a grid cell → `cfg.overrides.Img.cardMode = "column"`.
- `Counter` animates 0→`to` via `requestAnimationFrame` on IntersectionObserver. A capture catches a mid-animation frame (nondeterministic), so the previews pass `duration={1}` to settle on the final value deterministically. The live site uses the default ~1400ms ease.
- `Reveal` starts at opacity 0 and adds `.in` on intersection; in a static card it lands fully visible. Renders fine.

## Re-sync risks
- Captures via system Chrome using `DS_CHROMIUM_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"` (the playwright chromium download stalled in this environment). If Chrome moves/updates, repoint that env var, or `npx playwright install chromium`.
- If a primitive's source changes, re-run the build (deterministic). To add a primitive, add it to BOTH `.design-sync/eco-ds-entry.ts` and `cfg.componentSrcMap`.
- `Counter` previews depend on the `duration` prop existing. If that prop is removed/renamed upstream, the cards revert to mid-animation captures.
