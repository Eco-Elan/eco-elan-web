import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { Resend } from "resend";
import { SERVICES, ADDONS, PROPERTY_SIZES } from "../src/data/content.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const resend = new Resend(process.env.RESEND_API_KEY ?? "");

// FROM must be on a domain verified in Resend (e.g. eco-elan.com).
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Eco Elan <noreply@eco-elan.com>";

// Served from /public. Note: email clients (esp. Gmail's image proxy) cache by
// URL, so when the logo art changes, give it a fresh filename rather than
// overwriting the old path — otherwise the stale cached image keeps showing.
const LOGO_URL = "https://www.eco-elan.com/assets/receipt-logo.png";

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

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One label/value line in the compact receipt (table-row, inline styles). */
function line(label: string, value: string, opts: { strong?: boolean; total?: boolean } = {}) {
  const valColor = opts.total ? "#2E7355" : "#0F1A14";
  const valSize = opts.total ? "20px" : "14px";
  const valWeight = opts.strong || opts.total ? "700" : "600";
  const border = opts.total ? "border-top:2px solid #E2E7DD;" : "border-bottom:1px solid #E2E7DD;";
  const pad = opts.total ? "12px 0 4px" : "9px 0";
  return `
    <tr>
      <td style="padding:${pad};${border}font-size:${opts.total ? "15px" : "13px"};color:#6B7B72;${opts.total ? "font-weight:700;" : ""}">${esc(label)}</td>
      <td style="padding:${pad};${border}font-size:${valSize};color:${valColor};font-weight:${valWeight};text-align:right;white-space:nowrap;">${esc(value)}</td>
    </tr>`;
}

/** Build the branded HTML receipt from a succeeded PaymentIntent. */
function buildReceiptHtml(pi: Stripe.PaymentIntent): string {
  const m = pi.metadata ?? {};
  const svc = SERVICES.find((s) => s.id === m.service);
  const sz = PROPERTY_SIZES.find((p) => p.id === m.size);
  const addonIds = (m.addons ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const serviceName = svc?.name ?? m.service ?? "Eco clean";
  const total = (pi.amount ?? 0) / 100;
  const currency = (pi.currency ?? "cad").toUpperCase();

  const dateStr = m.date
    ? new Date(m.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";
  const dateTime = `${dateStr}${m.time ? " at " + m.time : ""}`;
  const address = m.address || "—";

  // Itemized lines mirror the on-page receipt: base = round(price * mult), then add-ons.
  const itemRows: string[] = [];
  if (svc && sz) {
    const base = Math.round(svc.price * sz.mult);
    itemRows.push(line(`Base price · ${svc.name.replace(" Cleaning", "")}`, `$${base}`));
  }
  for (const id of addonIds) {
    const a = ADDONS.find((x) => x.id === id);
    if (a) itemRows.push(line(`Add-on · ${a.name}`, `+$${a.price}`));
  }

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F8F9F4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9F4;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E2E7DD;">

          <!-- Header band -->
          <tr>
            <td bgcolor="#2E7355" style="background-color:#2E7355;background-image:linear-gradient(180deg,#2E7355,#11271B);padding:40px 32px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td align="center" valign="middle" bgcolor="#ffffff" style="background-color:#ffffff;border-radius:16px;padding:16px 22px;text-align:center;">
                    <img src="${LOGO_URL}" width="150" alt="Eco Elan" style="display:block;width:150px;height:auto;border:0;outline:none;" />
                  </td>
                </tr>
              </table>
              <h1 style="margin:18px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.2;color:#ffffff;">Payment successful!</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:rgba(255,255,255,0.85);">Thank you — your booking is paid and your eco-friendly clean is on the way.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;font-family:Arial,Helvetica,sans-serif;">

              <!-- Payment reference chip -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
                <tr>
                  <td align="center" bgcolor="#EFF1E8" style="background-color:#EFF1E8;border:1px solid #E2E7DD;border-radius:12px;padding:14px;">
                    <div style="font-size:10px;font-weight:700;color:#6B7B72;text-transform:uppercase;letter-spacing:0.16em;margin-bottom:5px;">Payment Reference</div>
                    <div style="font-size:16px;font-weight:700;color:#11271B;font-family:Consolas,Menlo,monospace;word-break:break-all;">#${esc(pi.id)}</div>
                  </td>
                </tr>
              </table>

              <div style="font-weight:700;color:#0F1A14;font-size:15px;margin-bottom:6px;">Receipt</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${line("Service", serviceName)}
                ${line("Date & time", dateTime)}
                ${line("Address", address)}
              </table>

              <div style="font-size:11px;font-weight:700;color:#6B7B72;text-transform:uppercase;letter-spacing:0.12em;margin:18px 0 2px;">Itemized</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemRows.join("")}
                ${line("Total paid", `$${total} ${currency}`, { total: true })}
              </table>

              <!-- Footer -->
              <p style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#6B7B72;text-align:center;">
                Eco Elan · Toronto &amp; GTA, Ontario<br/>
                <a href="mailto:info@eco-elan.com" style="color:#2E7355;text-decoration:none;">info@eco-elan.com</a> · +1 (437) 265-4977
              </p>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * POST /api/stripe-webhook
 * Verifies the Stripe signature and treats `payment_intent.succeeded` as the
 * authoritative signal that a booking was paid, then sends the single branded
 * customer receipt via Resend. Stripe's own receipt is disabled (no
 * receipt_email on the intent) so the customer gets exactly one receipt.
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

    // Branded customer receipt. A failed email must NEVER throw or return
    // non-200 — that would make Stripe retry the whole webhook. Log loudly and
    // continue to the 200 below.
    const recipient = pi.receipt_email || pi.metadata?.customer_email;
    if (!recipient) {
      console.warn("No recipient for receipt email (pi", pi.id, ") — skipping");
    } else if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set — cannot send receipt email for", pi.id);
    } else {
      try {
        const { data, error } = await resend.emails.send({
          from: FROM,
          to: recipient,
          subject: "Your Eco Elan receipt — booking paid",
          html: buildReceiptHtml(pi),
        });
        if (error) console.error("receipt email failed for", pi.id, error);
        else console.log("receipt email sent for", pi.id, data?.id);
      } catch (mailErr) {
        console.error("receipt email threw for", pi.id, mailErr);
      }
    }
  }

  return res.status(200).json({ received: true });
}
