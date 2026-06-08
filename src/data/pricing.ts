import { SERVICES, ADDONS, PROPERTY_SIZES } from "./content.js";

/**
 * Single source of truth for the booking price.
 *
 * Imported by BOTH the React app (StepConfirm / StepPayment / the receipt) and
 * the serverless functions in /api, so the amount the client shows and the
 * amount Stripe charges can never drift apart. The server still recomputes the
 * total from this module and never trusts a client-supplied number.
 *
 * Formula (locked): svc.price * size.mult + add-ons. NO tax is applied.
 */
export type PricingInput = {
  service: string;
  size: string;
  addons: string[];
};

export function computeTotal(input: PricingInput): number {
  const svc = SERVICES.find((s) => s.id === input.service) ?? SERVICES[0];
  const sz = PROPERTY_SIZES.find((p) => p.id === input.size) ?? PROPERTY_SIZES[1];
  const addonsTotal = (input.addons ?? []).reduce(
    (sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0),
    0
  );
  return Math.round(svc.price * sz.mult + addonsTotal);
}

/** Total in the minor unit Stripe expects (CAD cents). */
export function computeAmountCents(input: PricingInput): number {
  return computeTotal(input) * 100;
}
