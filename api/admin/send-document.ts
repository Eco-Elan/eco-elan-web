import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { requireAdmin, AuthError } from "../../src/server/adminAuth.js";
import { getOrderById, updateOrderDoc } from "../../src/server/supabaseAdmin.js";
import { renderQuotationPdf, renderInvoicePdf } from "../../src/server/pdf/index.js";
import { quoteId, invId } from "../../src/data/admin.js";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Eco Elan <noreply@eco-elan.com>";
const BASE = process.env.PUBLIC_BASE_URL ?? "https://www.eco-elan.com";

const esc = (x: unknown) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * POST /api/admin/send-document  { orderId, docType: 'quote'|'invoice', to, subject, body }
 * Renders the document PDF, emails it (Resend) with the admin-composed message,
 * and flips the document's status to 'sent'.
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
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — cannot send document");
    return res.status(500).json({ error: "Email service is not configured" });
  }

  try {
    const reqBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    const { orderId, docType } = reqBody;
    const isQuote = docType === "quote";
    if (!orderId || (docType !== "quote" && docType !== "invoice")) {
      return res.status(400).json({ error: "orderId and a valid docType are required" });
    }

    const order = await getOrderById(String(orderId));
    if (!order) return res.status(404).json({ error: "Order not found" });

    const pdf = isQuote ? await renderQuotationPdf(order) : await renderInvoicePdf(order);
    const filename = (isQuote ? quoteId(order) : invId(order)) + ".pdf";
    const to = String(reqBody.to || order.client.email);
    const subject = String(reqBody.subject || (isQuote ? `Your Eco Elan quotation ${quoteId(order)}` : `Invoice ${invId(order)} from Eco Elan`));
    const bodyText = String(reqBody.body || "Please find your document attached.\n\n— Eco Elan Cleaning Services");

    // For invoices with a generated payment link, include a prominent button to
    // the customer pay page (/pay/:id) so the email isn't just a PDF — the
    // customer can pay online and gets a receipt automatically.
    const payBlock =
      !isQuote && order.payment.stripeUrl
        ? `<div style="margin:22px 0">
             <a href="${BASE}/pay/${order.id}" style="display:inline-block;background:#2E7355;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:10px">Pay invoice online</a>
             <div style="color:#6B7B72;font-size:12px;margin-top:8px">Secure payment · your receipt is emailed automatically.</div>
           </div>`
        : "";

    const html = `
      <div style="font-family:system-ui,sans-serif;color:#0F1A14;line-height:1.55">
        <p style="white-space:pre-wrap">${esc(bodyText)}</p>
        ${payBlock}
        <p style="color:#6B7B72;font-size:13px;margin-top:18px">Eco Elan Cleaning Services · Toronto &amp; the GTA · info@eco-elan.com</p>
      </div>`;

    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: "info@eco-elan.com",
      subject,
      html,
      text: bodyText,
      attachments: [{ filename, content: pdf }],
    });
    if (error) {
      console.error("send-document email failed", error);
      return res.status(502).json({ error: "Email could not be sent" });
    }

    // Flip the relevant document's status to "sent".
    const updated = await updateOrderDoc(order.id!, {
      client: order.client,
      quote: isQuote ? { ...order.quote, status: "sent" } : order.quote,
      invoice: isQuote ? order.invoice : { ...order.invoice, status: "sent" },
      payment: order.payment,
    });

    return res.status(200).json({ order: updated });
  } catch (err) {
    console.error("admin/send-document error", err);
    // Temporary: surface the real reason (e.g. a PDF-render failure) to the
    // client so we can diagnose the production crash.
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return res.status(500).json({ error: "Could not send document", detail });
  }
}
