import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrderById } from "../src/server/supabaseAdmin.js";
import { invId, invMath } from "../src/data/admin.js";

/**
 * GET /api/pay-info?id=<orderId>  — PUBLIC (no admin auth).
 * Returns the minimal, safe fields the customer pay page (/pay/:id) needs:
 * the invoice number, amount, paid/unpaid status, and the Stripe pay URL. The
 * order id is an unguessable uuid, so it acts as the capability — but we still
 * expose only these few fields, never the full order/PII or any quote/admin data.
 * The amount is recomputed server-side (never trusted from the client).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const order = await getOrderById(id);
    if (!order) return res.status(404).json({ error: "Not found" });

    const amount = Math.round(invMath(order).total * 100) / 100;
    return res.status(200).json({
      ok: true,
      invoiceId: invId(order),
      name: order.client.name || "",
      amount,
      currency: "CAD",
      status: order.payment.status === "paid" ? "paid" : "unpaid",
      receiptSent: !!order.payment.receiptSent,
      payUrl: order.payment.stripeUrl ?? null,
    });
  } catch (err) {
    console.error("pay-info error", err);
    return res.status(500).json({ error: "Could not load payment details" });
  }
}
