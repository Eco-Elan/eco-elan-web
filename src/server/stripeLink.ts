import Stripe from "stripe";
import type { Order } from "../data/admin.js";
import { invId, rctId, invoiceAmountCents, invMath } from "../data/admin.js";
import { updateOrderDoc } from "./supabaseAdmin.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const BASE = process.env.PUBLIC_BASE_URL ?? "https://www.eco-elan.com";

/**
 * Create a real, reusable Stripe Payment Link for an order's invoice total
 * (server-recomputed — never trusts the client) and persist its URL/id on the
 * order. Shared by `api/admin/payment-link` (explicit "Generate link") and
 * `api/admin/send-document` (auto-generate when sending an invoice), so both
 * produce identical links. The customer pays on Stripe's hosted page;
 * api/stripe-webhook.ts marks the order paid + emails the receipt.
 *
 * Returns the updated order (with payment.stripeUrl/stripeLinkId set).
 */
export async function createPaymentLink(order: Order): Promise<Order> {
  const amount = invoiceAmountCents(order);
  if (!Number.isFinite(amount) || amount < 50) {
    throw new Error("Invoice total is too small to charge");
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
    // Back to the customer pay page, which flips to the paid/thank-you state.
    after_completion: { type: "redirect", redirect: { url: `${BASE}/pay/${order.id}?paid=1` } },
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

  return updated;
}

/**
 * Ensure an order has a payment link: if one already exists, return the order
 * unchanged; otherwise create one. Used when sending an invoice so the email
 * always includes a working "Pay invoice online" button.
 */
export async function ensurePaymentLink(order: Order): Promise<Order> {
  if (order.payment.stripeUrl) return order;
  return createPaymentLink(order);
}
