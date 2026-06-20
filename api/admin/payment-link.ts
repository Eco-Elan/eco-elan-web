import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin, AuthError } from "../../src/server/adminAuth.js";
import { getOrderById } from "../../src/server/supabaseAdmin.js";
import { createPaymentLink } from "../../src/server/stripeLink.js";

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

    // Always (re)generate a fresh link from the explicit "Generate link" action.
    const updated = await createPaymentLink(order);

    return res.status(200).json({ order: updated, url: updated.payment.stripeUrl });
  } catch (err) {
    console.error("admin/payment-link error", err);
    // Temporary: surface the real reason (usually a Stripe API error) so we can
    // diagnose the production failure.
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return res.status(500).json({ error: "Could not create payment link", detail });
  }
}
