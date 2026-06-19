// Scoped design-system entry for /design-sync.
//
// This repo is a marketing/booking app, not a published component library, so
// there is no dist/ entry to bundle. Rather than let synth-entry mode `export *`
// every src file (which would drag in the router/Stripe/content-coupled pages),
// this file re-exports ONLY the reusable primitives the sync is scoped to.
// Keep it in lockstep with cfg.componentSrcMap in config.json.
//
// Logo was intentionally dropped: it hardcodes `src="/assets/logo.svg"` (a
// site-absolute asset path), so it can't render portably in a generated design.
export { Icon } from "../src/components/Icon";
export { Img } from "../src/components/Img";
export { Reveal } from "../src/components/Reveal";
export { Counter } from "../src/components/Counter";
