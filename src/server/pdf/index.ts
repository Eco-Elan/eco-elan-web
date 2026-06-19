/**
 * Server-side PDF rendering for quotation / invoice / receipt documents
 * (@react-pdf/renderer). Uses the built-in Helvetica + brand colors and draws
 * the letterhead as styled text (no external image fetch) so it never fails in
 * a serverless function. Imported by api/admin/send-document.ts and the Stripe
 * webhook. Numbers come from the shared math in src/data/admin.ts.
 *
 * NOTE: this file is intentionally plain `.ts` (React.createElement, no JSX).
 * Vercel's serverless bundler resolves a `.js` import specifier to a sibling
 * `.ts` source but NOT to `.tsx`, so a `.tsx` module here is silently left out
 * of the deployed function and crashes at runtime ("Cannot find module
 * .../pdf/index.js"). Keeping it `.ts` makes it bundle like every other
 * src/server module.
 */
import { createElement as h, type ComponentProps, type ReactNode } from "react";
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { type Order, money, invMath, quoteTotal, quoteId, invId, rctId } from "../../data/admin.js";

const C = {
  green: "#2E7355",
  ink: "#11271B",
  muted: "#6B7B72",
  line: "#E2E7DD",
  cream: "#EFF1E8",
  soft: "#46554C",
  white: "#FFFFFF",
};

const s = StyleSheet.create({
  page: { paddingTop: 44, paddingHorizontal: 46, paddingBottom: 70, fontSize: 10, color: C.ink, fontFamily: "Helvetica" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.green, letterSpacing: 1 },
  tagline: { fontSize: 8, color: C.green, letterSpacing: 2, marginTop: 3, fontFamily: "Helvetica-Bold" },
  sub: { fontSize: 9, color: C.muted, marginTop: 4 },
  docTitle: { fontSize: 30, fontFamily: "Helvetica-Bold", color: C.green },
  metaGrid: { marginTop: 10 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 },
  metaLabel: { color: C.muted, fontSize: 9 },
  metaVal: { fontFamily: "Helvetica-Bold", fontSize: 9, marginLeft: 10, minWidth: 90, textAlign: "right" },
  bandHead: { backgroundColor: C.green, color: C.white, fontSize: 9, fontFamily: "Helvetica-Bold", letterSpacing: 1, padding: "6 10", marginTop: 16 },
  bandBox: { borderWidth: 1, borderColor: C.line, borderTopWidth: 0, padding: 10 },
  kv: { flexDirection: "row", marginBottom: 3 },
  k: { color: C.muted },
  v: { fontFamily: "Helvetica-Bold", marginLeft: 3 },
  thead: { flexDirection: "row", backgroundColor: C.green, color: C.white, padding: "6 10", fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginTop: 16 },
  trow: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.line, padding: "8 10" },
  cDesc: { flex: 1 },
  cNum: { width: 70, textAlign: "right" },
  cQty: { width: 40, textAlign: "center" },
  itemTitle: { fontFamily: "Helvetica-Bold" },
  itemDetail: { color: C.muted, fontSize: 8, marginTop: 1 },
  totalsBox: { marginTop: 18, marginLeft: "auto", width: 240 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, fontSize: 10 },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", backgroundColor: C.green, color: C.white, padding: "8 12", borderRadius: 4, marginTop: 6, fontFamily: "Helvetica-Bold" },
  notesLabel: { fontSize: 8, color: C.muted, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginTop: 18, marginBottom: 4 },
  notes: { color: C.soft, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.cream, borderTopWidth: 3, borderColor: C.green, paddingVertical: 14, paddingHorizontal: 46 },
  footerTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, letterSpacing: 1, color: C.ink },
  footerSub: { fontSize: 8, color: C.soft, marginTop: 2 },
  paidStamp: { alignSelf: "flex-start", backgroundColor: C.green, color: C.white, fontFamily: "Helvetica-Bold", fontSize: 10, letterSpacing: 1, padding: "5 12", borderRadius: 4 },
});

// Small element helpers to keep the createElement trees readable.
// Style type is derived from the View component's own props (a single Style or
// an array of them) so we don't need a direct dep on @react-pdf/types.
type St = NonNullable<ComponentProps<typeof View>["style"]>;
const T = (style: St, ...children: ReactNode[]) => h(Text, { style }, ...children);
const Box = (style: St, ...children: ReactNode[]) => h(View, { style }, ...children);
const kvRow = (k: string, v: string) => h(View, { style: s.kv }, T(s.k, k), T(s.v, v));

function Letterhead() {
  return h(View, null, T(s.brand, "ECO ELAN"), T(s.tagline, "CLEANING SERVICES"));
}

function Contact() {
  return h(
    View,
    { style: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, paddingVertical: 6, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: C.line } },
    ["+1 (437) 265-4977", "info@eco-elan.com", "Toronto & the GTA", "Fully Insured & Bonded"].map((t) =>
      h(Text, { key: t, style: { color: C.green, fontSize: 9, fontFamily: "Helvetica-Bold", marginRight: 18 } }, t)
    )
  );
}

function Footer(title: string, sub: string) {
  return h(View, { style: s.footer, fixed: true }, T(s.footerTitle, title), T(s.footerSub, sub));
}

function Meta(rows: [string, string][]) {
  return h(
    View,
    { style: s.metaGrid },
    rows.map(([k, v]) => h(View, { key: k, style: s.metaRow }, T(s.metaLabel, k), T(s.metaVal, v)))
  );
}

function QuotationDoc(order: Order) {
  const total = quoteTotal(order);
  return h(
    Document,
    null,
    h(
      Page,
      { size: "A4", style: s.page },
      Box(
        s.rowBetween,
        Box({}, Letterhead(), T(s.sub, "Eco-Friendly Cleaning for a Healthier Space")),
        Box(
          { alignItems: "flex-end" },
          T(s.docTitle, "QUOTATION"),
          Meta([
            ["Quote Number", quoteId(order)],
            ["Date Issued", order.quote.issued],
            ["Valid Until", order.quote.valid],
            ["Prepared By", "Eco Elan Team"],
          ])
        )
      ),
      Contact(),
      T(s.bandHead, "CLIENT INFORMATION"),
      Box(
        s.bandBox,
        kvRow("Client / Company:", order.client.name),
        kvRow("Contact:", order.client.contact),
        kvRow("Phone:", order.client.phone),
        kvRow("Email:", order.client.email),
        kvRow("Service Address:", order.client.address)
      ),
      Box(s.thead, T(s.cDesc, "SCOPE OF WORK & PRICING"), T(s.cNum, "AMOUNT")),
      order.quote.items.map((it, i) =>
        h(
          View,
          { key: i, style: s.trow },
          Box(s.cDesc, T(s.itemTitle, it.desc), it.detail ? T(s.itemDetail, it.detail) : null),
          T(s.cNum, money(it.amount))
        )
      ),
      Box(s.grandTotal, h(Text, null, "TOTAL QUOTED PRICE"), h(Text, null, money(total))),
      order.quote.notes
        ? Box({}, T(s.notesLabel, "NOTES / SPECIAL PRICING CONDITIONS"), T(s.notes, order.quote.notes))
        : null,
      Footer("THANK YOU", "We appreciate the opportunity to provide eco-friendly, reliable cleaning for your space.")
    )
  );
}

function InvoiceDoc(order: Order) {
  const m = invMath(order);
  return h(
    Document,
    null,
    h(
      Page,
      { size: "A4", style: s.page },
      Box(
        s.rowBetween,
        Letterhead(),
        Box(
          { alignItems: "flex-end" },
          T({ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.ink }, "Eco Elan Cleaning Services"),
          T({ fontSize: 9, color: C.soft, marginTop: 2 }, "Serving Toronto & the GTA"),
          T({ fontSize: 9, color: C.soft }, "+1 (437) 265-4977"),
          T({ fontSize: 9, color: C.soft }, "info@eco-elan.com")
        )
      ),
      Box(
        { flexDirection: "row", alignItems: "center", marginTop: 22 },
        T(s.docTitle, "INVOICE"),
        h(View, { style: { flex: 1, height: 3, backgroundColor: C.green, marginLeft: 14, borderRadius: 2 } })
      ),
      Box(
        [s.rowBetween, { marginTop: 18 }],
        Box(
          {},
          T({ fontSize: 8, color: C.green, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginBottom: 4 }, "BILL TO"),
          T({ fontFamily: "Helvetica-Bold" }, order.client.name),
          T({ color: C.soft, marginTop: 2 }, order.client.address),
          T({ color: C.soft }, order.client.email)
        ),
        Meta([
          ["Invoice No.", invId(order)],
          ["Date of Issue", order.invoice.issued],
          ["Due Date", order.invoice.due],
        ])
      ),
      Box(s.thead, T(s.cDesc, "DESCRIPTION"), T(s.cNum, "UNIT"), T(s.cQty, "QTY"), T(s.cNum, "AMOUNT")),
      order.invoice.items.map((it, i) =>
        h(
          View,
          { key: i, style: s.trow },
          Box(s.cDesc, T(s.itemTitle, it.desc), it.detail ? T(s.itemDetail, it.detail) : null),
          T(s.cNum, money(it.unit)),
          T(s.cQty, String(it.qty)),
          T(s.cNum, money(Number(it.unit || 0) * Number(it.qty || 0)))
        )
      ),
      Box(
        s.totalsBox,
        Box(s.totalRow, T(s.k, "Subtotal"), h(Text, null, money(m.subtotal))),
        m.discount > 0
          ? Box(s.totalRow, T(s.k, order.invoice.discountLabel), T({ color: C.green }, "-" + money(m.discount)))
          : null,
        order.invoice.hst ? Box(s.totalRow, T(s.k, "HST (13%)"), h(Text, null, money(m.hst))) : null,
        Box(s.grandTotal, h(Text, null, "TOTAL"), h(Text, null, money(m.total)))
      ),
      Footer("THANK YOU FOR YOUR BUSINESS", "A healthier space, cleaned with 100% plant-based products.")
    )
  );
}

function ReceiptDoc(order: Order) {
  const m = invMath(order);
  const paid = order.payment.amount != null ? Number(order.payment.amount) : m.total;
  return h(
    Document,
    null,
    h(
      Page,
      { size: "A4", style: s.page },
      Box(
        s.rowBetween,
        Letterhead(),
        Box(
          { alignItems: "flex-end" },
          T(s.docTitle, "RECEIPT"),
          Meta([
            ["Receipt No.", rctId(order)],
            ["Invoice No.", invId(order)],
            ["Paid On", order.payment.paidOn ?? "—"],
            ["Method", order.payment.method ?? "Card · Stripe"],
          ])
        )
      ),
      Contact(),
      Box({ marginTop: 16 }, T(s.paidStamp, "PAID")),
      T(s.bandHead, "BILLED TO"),
      Box(
        s.bandBox,
        kvRow("Client:", order.client.name),
        kvRow("Email:", order.client.email),
        kvRow("Address:", order.client.address)
      ),
      Box(s.thead, T(s.cDesc, "DESCRIPTION"), T(s.cNum, "AMOUNT")),
      order.invoice.items.map((it, i) =>
        h(
          View,
          { key: i, style: s.trow },
          Box(
            s.cDesc,
            T(s.itemTitle, it.desc + (Number(it.qty) > 1 ? "  x" + it.qty : "")),
            it.detail ? T(s.itemDetail, it.detail) : null
          ),
          T(s.cNum, money(Number(it.unit || 0) * Number(it.qty || 0)))
        )
      ),
      Box(s.grandTotal, h(Text, null, "TOTAL PAID (CAD)"), h(Text, null, money(paid))),
      Footer("THANK YOU FOR YOUR PAYMENT", "A healthier space, cleaned with 100% plant-based products.")
    )
  );
}

export function renderQuotationPdf(order: Order): Promise<Buffer> {
  return renderToBuffer(QuotationDoc(order));
}
export function renderInvoicePdf(order: Order): Promise<Buffer> {
  return renderToBuffer(InvoiceDoc(order));
}
export function renderReceiptPdf(order: Order): Promise<Buffer> {
  return renderToBuffer(ReceiptDoc(order));
}
