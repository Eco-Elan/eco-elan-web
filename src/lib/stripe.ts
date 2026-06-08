import { loadStripe, type Appearance } from "@stripe/stripe-js";

// loadStripe must be called once per page load — keep a module-level singleton.
const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
export const stripePromise = key ? loadStripe(key) : null;

// Theme Stripe's embedded elements to match the Eco Elan design tokens. The
// element renders inside an iframe so it can't read our CSS vars — values are
// inlined to mirror styles.css (--eco-green #2E7355, --eco-line #E2E7DD, etc.).
export const ecoAppearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2E7355",
    colorText: "#0F1A14",
    colorTextSecondary: "#6B7B72",
    colorDanger: "#A03434",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
    fontSizeBase: "15px",
  },
  rules: {
    ".Input": {
      border: "1px solid #E2E7DD",
      boxShadow: "none",
      padding: "14px 16px",
    },
    ".Input:focus": {
      border: "1px solid #2E7355",
      boxShadow: "0 0 0 3px rgba(46,115,85,0.12)",
    },
    ".Label": {
      fontWeight: "600",
      color: "#6B7B72",
    },
  },
};
