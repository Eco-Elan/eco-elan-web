import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin, AuthError } from "../../src/server/adminAuth.js";
import { listOrdersMap, createOrder, updateOrderDoc } from "../../src/server/supabaseAdmin.js";

/**
 * /api/admin/orders — the console's data layer (gated by requireAdmin).
 *   GET    → { orders: { [seq]: Order } }   (seeds the table on first call)
 *   POST   → { order }                        (create a blank order)
 *   PATCH  → { order }                        (overwrite one order's documents)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await requireAdmin(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    console.error("admin auth failed", err);
    return res.status(500).json({ error: "Authorization check failed" });
  }

  try {
    if (req.method === "GET") {
      const orders = await listOrdersMap();
      return res.status(200).json({ orders });
    }

    if (req.method === "POST") {
      const order = await createOrder();
      return res.status(200).json({ order });
    }

    if (req.method === "PATCH") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
      const { id, order } = body;
      if (!id || !order) return res.status(400).json({ error: "id and order are required" });
      const updated = await updateOrderDoc(String(id), {
        client: order.client,
        quote: order.quote,
        invoice: order.invoice,
        payment: order.payment,
      });
      return res.status(200).json({ order: updated });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("admin/orders error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
