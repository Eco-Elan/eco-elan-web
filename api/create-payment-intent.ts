import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { computeAmountCents, computeTotal } from "../src/data/pricing.js";

// Server-only secret. Test mode key (sk_test_…) during development.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

/**
 * POST /api/create-payment-intent
 * Body: booking payload (service, size, addons, contact fields).
 * Recomputes the charge from the SHARED pricing module — never trusts a
 * client-supplied total — and creates a CAD PaymentIntent (amount in cents).
 * The customer email is stored in metadata; the branded receipt is sent from
 * api/stripe-webhook.ts on payment_intent.succeeded (no Stripe receipt_email).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    const { service, size, addons, email, name, phone, address, city, postal, date, time, notes } = body;

    const cleanAddons: string[] = Array.isArray(addons) ? addons : [];
    const amount = computeAmountCents({ service, size, addons: cleanAddons });

    // Our smallest realistic total is ~$40; guard against junk payloads.
    if (!Number.isFinite(amount) || amount < 50) {
      return res.status(400).json({ error: "Invalid booking amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "cad",
      // No receipt_email: the branded receipt from api/stripe-webhook.ts is the
      // single customer-facing receipt. We still keep the email in metadata
      // (customer_email) so the webhook knows where to send it.
      automatic_payment_methods: { enabled: true },
      description: `Eco Elan — ${service ?? "cleaning"} clean`,
      metadata: {
        service: String(service ?? ""),
        size: String(size ?? ""),
        addons: cleanAddons.join(","),
        total_cad: String(computeTotal({ service, size, addons: cleanAddons })),
        customer_name: String(name ?? "").slice(0, 200),
        customer_email: String(email ?? ""),
        customer_phone: String(phone ?? ""),
        address: [address, city, postal].filter(Boolean).join(", ").slice(0, 400),
        date: String(date ?? ""),
        time: String(time ?? ""),
        notes: String(notes ?? "").slice(0, 450),
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("create-payment-intent error", err);
    return res.status(500).json({ error: "Could not start checkout" });
  }
}
