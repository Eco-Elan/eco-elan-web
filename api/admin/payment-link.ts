import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { requireAdmin, AuthError } from "../../src/server/adminAuth.js";
import { getOrderById, updateOrderDoc } from "../../src/server/supabaseAdmin.js";
import { invId, rctId, invoiceAmountCents, invMath } from "../../src/data/admin.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const BASE = process.env.PUBLIC_BASE_URL ?? "https://www.eco-elan.com";

/**
 * POST /api/admin/payment-link  { orderId }
 * Creates a real, reusable Stripe Payment Link for the invoice total (server
 * recomputes the amount — never trusts the client) and stores its URL on the
 * order. The customer pays on Stripe's hosted page; api/stripe-webhook.ts marks
 * the order paid + emails the receipt on `checkout.session.completed`.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await requireAdmin(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    console.error("admin auth failed", err);
    return res.status(500).json({ error: "Authorization check failed" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    const orderId = body.orderId ? String(body.orderId) : "";
    if (!orderId) return res.status(400).json({ error: "orderId is required" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const amount = invoiceAmountCents(order);
    if (!Number.isFinite(amount) || amount < 50) {
      return res.status(400).json({ error: "Invoice total is too small to charge" });
    }

    const invoiceId = invId(order);
    const receiptId = rctId(order);
    const meta = { type: "invoice", orderId: order.id ?? "", invoiceId, receiptId, customer_email: order.client.email };

    // Ad-hoc price (Payment Links require a Price object, unlike Checkout
    // Sessions). Payment Links don't expire, so the invoice stays payable.
    const price = await stripe.prices.create({
      currency: "cad",
      unit_amount: amount,
      product_data: { name: `Invoice ${invoiceId} — Eco Elan Cleaning` },
    });

    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: meta,
      payment_intent_data: { metadata: meta },
      after_completion: { type: "redirect", redirect: { url: `${BASE}/?paid=${invoiceId}` } },
    });

    const total = Math.round(invMath(order).total * 100) / 100;
    const updated = await updateOrderDoc(order.id!, {
      client: order.client,
      quote: order.quote,
      invoice: order.invoice,
      payment: {
        ...order.payment,
        linkGenerated: true,
        stripeLinkId: link.id,
        stripeUrl: link.url,
        amount: total,
        status: order.payment.status === "paid" ? "paid" : "unpaid",
      },
    });

    return res.status(200).json({ order: updated, url: link.url });
  } catch (err) {
    console.error("admin/payment-link error", err);
    return res.status(500).json({ error: "Could not create payment link" });
  }
}
