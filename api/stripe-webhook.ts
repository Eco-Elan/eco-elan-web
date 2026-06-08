import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Stripe signature verification needs the raw, unparsed request body — disable
// Vercel's automatic JSON body parsing for this function.
export const config = { api: { bodyParser: false } };

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * POST /api/stripe-webhook
 * Verifies the Stripe signature and treats `payment_intent.succeeded` as the
 * authoritative signal that a booking was paid. Stripe sends the customer their
 * receipt automatically (receipt_email is set on the intent).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method not allowed");
  }

  const signature = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, signature as string, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.log("PaymentIntent succeeded", pi.id, pi.metadata);

    // ──────────────────────────────────────────────────────────────────────
    // SEAM: business notification email.
    // Stripe already emails the CUSTOMER their receipt. To also notify the Eco
    // Elan team of a new paid booking, send an internal email here using the
    // PaymentIntent metadata (service, size, addons, customer_*, date, time,
    // address, notes). Wire this to Resend (see api/contact.ts) when ready.
    // ──────────────────────────────────────────────────────────────────────
  }

  return res.status(200).json({ received: true });
}
