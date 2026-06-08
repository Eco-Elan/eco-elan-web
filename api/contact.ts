import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

// FROM must be on a domain verified in Resend (e.g. eco-elan.com). TO is the
// inbox that receives enquiries.
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Eco Elan <noreply@eco-elan.com>";
const TO = process.env.CONTACT_TO_EMAIL ?? "info@eco-elan.com";

const esc = (s: string) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * POST /api/contact
 * Emails a contact-form submission to info@eco-elan.com via Resend, and sends
 * the visitor a brief auto-reply.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Startup guard: a missing key would otherwise surface as a silent 401 from
  // Resend. Fail loud and clear instead.
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — cannot send contact email");
    return res.status(500).json({ error: "Email service is not configured" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
    const { name, email, phone, service, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message are required." });
    }

    const rows = [
      ["Name", name],
      ["Email", email],
      ["Phone", phone || "—"],
      ["Service", service || "—"],
    ]
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6B7B72;font-weight:600">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`)
      .join("");

    // Main enquiry → the business inbox. resend.emails.send() does NOT throw on
    // API errors; it resolves to { data, error }. Inspect `error` explicitly so
    // a failed send becomes a real 502, not a false success.
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: String(email),
      subject: `New contact enquiry — ${name}`,
      html: `
        <div style="font-family:system-ui,sans-serif;color:#0F1A14">
          <h2 style="color:#2E7355">New contact form submission</h2>
          <table style="border-collapse:collapse;margin-bottom:16px">${rows}</table>
          <div style="color:#6B7B72;font-weight:600;margin-bottom:4px">Message</div>
          <p style="white-space:pre-wrap;line-height:1.5">${esc(message)}</p>
        </div>`,
    });

    if (error) {
      console.error("contact enquiry email failed", error);
      return res.status(502).json({ error: "Email could not be sent" });
    }
    console.log("contact enquiry email sent", data?.id);

    // Brief auto-reply to the visitor (best-effort — log but never fail the
    // request if this one errors or bounces).
    try {
      const { data: replyData, error: replyError } = await resend.emails.send({
        from: FROM,
        to: String(email),
        subject: "We received your message — Eco Elan",
        html: `
          <div style="font-family:system-ui,sans-serif;color:#0F1A14">
            <p>Hi ${esc(name)},</p>
            <p>Thanks for reaching out to Eco Elan! We've received your message and a real human will get back to you within minutes during business hours (Mon–Sat, 8am–6pm).</p>
            <p style="color:#6B7B72">— The Eco Elan Team</p>
          </div>`,
      });
      if (replyError) console.error("contact auto-reply failed", replyError);
      else console.log("contact auto-reply sent", replyData?.id);
    } catch (autoErr) {
      console.error("contact auto-reply threw", autoErr);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact error", err);
    return res.status(500).json({ error: "Could not send your message" });
  }
}
