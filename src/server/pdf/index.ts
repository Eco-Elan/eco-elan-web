/**
 * Server-side PDF rendering for quotation / invoice / receipt documents
 * (@react-pdf/renderer). Matches the design-system documents: the real Eco Elan
 * logo and the Plus Jakarta Sans typeface, both embedded as base64 (see
 * assets.ts) so there is no network fetch or file-tracing in the serverless
 * bundle. Imported by api/admin/send-document.ts and the Stripe webhook.
 * Numbers come from the shared math in src/data/admin.ts.
 *
 * Plain `.ts` (React.createElement, no JSX) on purpose: Vercel's bundler
 * resolves a `.js` import specifier to a sibling `.ts` source but NOT to `.tsx`,
 * so a `.tsx` module here would be dropped from the deployed function.
 */
import { createElement as h, type ComponentProps, type ReactNode } from "react";
import { Document, Page, View, Text, Image, Svg, Path, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import { type Order, money, invMath, quoteTotal, quoteId, invId, rctId } from "../../data/admin.js";
import { LOGO_PNG, LOGO_ASPECT, PJS_400, PJS_600, PJS_700, PJS_800 } from "./assets.js";

const FONT = "Plus Jakarta Sans";
Font.register({
  family: FONT,
  fonts: [
    { src: PJS_400, fontWeight: 400 },
    { src: PJS_600, fontWeight: 600 },
    { src: PJS_700, fontWeight: 700 },
    { src: PJS_800, fontWeight: 800 },
  ],
});
// Don't break long service descriptions across hyphenated fragments.
Font.registerHyphenationCallback((word) => [word]);

const C = {
  green: "#2E7355",
  ink: "#11271B",
  muted: "#6B7B72",
  soft: "#46554C",
  line: "#E2E7DD",
  cream: "#EFF1E8",
  white: "#FFFFFF",
};

const s = StyleSheet.create({
  page: { paddingTop: 46, paddingHorizontal: 50, paddingBottom: 72, fontSize: 11, color: C.ink, fontFamily: FONT, fontWeight: 400 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },

  tagline: { fontSize: 8, color: C.green, letterSpacing: 1.4, marginTop: 4, fontWeight: 600 },
  bizName: { fontSize: 11, fontWeight: 700, color: C.ink },
  bizLine: { fontSize: 9, color: C.soft, marginTop: 2 },
  bizLink: { fontSize: 9, color: C.green, fontWeight: 600, marginTop: 2 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 26 },
  docTitle: { fontSize: 34, fontWeight: 800, letterSpacing: -0.6, color: C.green },
  titleRule: { flex: 1, height: 3, backgroundColor: C.green, borderRadius: 2 },
  paidPill: { backgroundColor: C.green, color: C.white, fontSize: 10, fontWeight: 800, letterSpacing: 1.4, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 5 },

  cols: { flexDirection: "row", justifyContent: "space-between", gap: 30, marginTop: 24 },
  colLabel: { fontSize: 8.5, fontWeight: 700, letterSpacing: 1.2, color: C.green, marginBottom: 7 },
  partyName: { fontSize: 12, fontWeight: 700, color: C.ink },
  partyLine: { fontSize: 10.5, color: C.soft, marginTop: 3, lineHeight: 1.6 },

  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5, minWidth: 200 },
  metaLabel: { color: C.muted, fontSize: 10 },
  metaVal: { fontWeight: 700, fontSize: 10, textAlign: "right" },

  thead: { flexDirection: "row", backgroundColor: C.green, color: C.white, marginTop: 22, borderRadius: 5 },
  th: { fontSize: 8.5, fontWeight: 700, letterSpacing: 0.6, paddingVertical: 8, paddingHorizontal: 12 },
  trow: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.line, alignItems: "flex-start" },
  td: { paddingVertical: 10, paddingHorizontal: 12, fontSize: 10.5 },
  cDesc: { flex: 1 },
  cUnit: { width: 84, textAlign: "right" },
  cQty: { width: 50, textAlign: "center" },
  cAmt: { width: 92, textAlign: "right" },
  itemTitle: { fontWeight: 700, color: C.ink },
  itemDetail: { color: C.muted, fontSize: 9, marginTop: 2 },

  totalsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 30, marginTop: 22 },
  bigLabel: { fontSize: 8.5, fontWeight: 700, letterSpacing: 1.2, color: C.muted },
  bigAmount: { fontSize: 34, fontWeight: 800, letterSpacing: -0.6, color: C.green, marginTop: 4 },
  totalsBox: { width: 250 },
  tLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 2, fontSize: 10.5 },
  tLineBorder: { borderTopWidth: 1, borderColor: C.line },
  tTotal: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 13, marginTop: 8, backgroundColor: C.green, borderRadius: 6 },

  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.cream, borderTopWidth: 3, borderColor: C.green, paddingVertical: 16, paddingHorizontal: 50, flexDirection: "row", alignItems: "center", gap: 13 },
  footerTitle: { fontWeight: 800, fontSize: 11, letterSpacing: 0.4, color: C.ink },
  footerSub: { fontSize: 9, color: C.soft, marginTop: 2 },

  // Quotation keeps the eyebrow tagline + notes; shared bits below.
  sub: { fontSize: 9.5, color: C.muted, marginTop: 5 },
  k: { color: C.muted },
  notesLabel: { fontSize: 8.5, color: C.muted, fontWeight: 700, letterSpacing: 1, marginTop: 18, marginBottom: 4 },
  notes: { color: C.soft, lineHeight: 1.5 },
});

type St = NonNullable<ComponentProps<typeof View>["style"]>;
const T = (style: St, ...children: ReactNode[]) => h(Text, { style }, ...children);
const Box = (style: St, ...children: ReactNode[]) => h(View, { style }, ...children);

function Logo(height = 48) {
  return h(View, null, h(Image, { src: LOGO_PNG, style: { height, width: height * LOGO_ASPECT } }), T(s.tagline, "CLEANING SERVICES"));
}

function BusinessBlock() {
  return h(
    View,
    { style: { alignItems: "flex-end" } },
    T(s.bizName, "Eco Elan Cleaning Services"),
    T(s.bizLine, "Serving Toronto & the GTA"),
    T(s.bizLine, "+1 (437) 265-4977"),
    T(s.bizLine, "info@eco-elan.com"),
    T(s.bizLink, "eco-elan.com")
  );
}

function LeafMark() {
  return h(
    Svg,
    { width: 22, height: 22, viewBox: "0 0 24 24" },
    h(Path, { d: "M11 20A7 7 0 0 1 4 13V5a7 7 0 0 1 7 7v8Z", stroke: C.green, strokeWidth: 1.8, fill: "none" }),
    h(Path, { d: "M11 13c1.5-4.5 5-7 9-7-.5 5-3 8.5-7 9.5", stroke: C.green, strokeWidth: 1.8, fill: "none" })
  );
}

function DocFooter(title: string, sub: string) {
  return h(View, { style: s.footer, fixed: true }, h(LeafMark), h(View, { style: { flex: 1 } }, T(s.footerTitle, title), T(s.footerSub, sub)));
}

function Meta(rows: [string, string][]) {
  return h(
    View,
    null,
    rows.map(([k, v]) => h(View, { key: k, style: s.metaRow }, T(s.metaLabel, k), T(s.metaVal, v)))
  );
}

/** Shared green table header + item rows (invoice / receipt style). */
function ItemsTable(order: Order, opts: { withQtyUnit: boolean }) {
  const head = opts.withQtyUnit
    ? h(View, { style: s.thead }, T([s.th, s.cDesc], "DESCRIPTION"), T([s.th, s.cUnit], "UNIT COST"), T([s.th, s.cQty], "QTY"), T([s.th, s.cAmt], "AMOUNT"))
    : h(View, { style: s.thead }, T([s.th, s.cDesc], "DESCRIPTION"), T([s.th, s.cAmt], "AMOUNT"));
  const rows = order.invoice.items.map((it, i) => {
    const ext = Number(it.unit || 0) * Number(it.qty || 0);
    const descCell = h(View, { style: [s.td, s.cDesc] }, T(s.itemTitle, it.desc), it.detail ? T(s.itemDetail, it.detail) : null);
    return opts.withQtyUnit
      ? h(View, { key: i, style: s.trow }, descCell, T([s.td, s.cUnit], money(it.unit)), T([s.td, s.cQty], String(it.qty)), T([s.td, s.cAmt], money(ext)))
      : h(View, { key: i, style: s.trow }, descCell, T([s.td, s.cAmt], money(ext)));
  });
  return h(View, null, head, ...rows);
}

/** Shared totals block (subtotal / discount / HST / total). */
function Totals(order: Order, totalLabel: string, bigLabel: string) {
  const m = invMath(order);
  return h(
    View,
    { style: s.totalsRow },
    h(View, { style: { alignSelf: "flex-end" } }, T(s.bigLabel, bigLabel), T(s.bigAmount, money(m.total))),
    h(
      View,
      { style: s.totalsBox },
      h(View, { style: s.tLine }, T(s.k, "Subtotal"), T({ fontWeight: 600 }, money(m.subtotal))),
      m.discount > 0 ? h(View, { style: [s.tLine, s.tLineBorder] }, T(s.k, order.invoice.discountLabel || "Discount"), T({ fontWeight: 600, color: C.green }, "-" + money(m.discount))) : null,
      order.invoice.hst ? h(View, { style: [s.tLine, s.tLineBorder] }, T(s.k, "HST (13%)"), T({ fontWeight: 600 }, money(m.hst))) : null,
      h(View, { style: s.tTotal }, T({ color: C.white, fontWeight: 700, letterSpacing: 0.3 }, totalLabel), T({ color: C.white, fontWeight: 800 }, money(m.total)))
    )
  );
}

function ReceiptDoc(order: Order) {
  const paidOn = order.payment.paidOn ?? "—";
  const method = order.payment.method ?? "Card · Stripe";
  return h(
    Document,
    null,
    h(
      Page,
      { size: "A4", style: s.page },
      Box(s.rowBetween, Logo(50), BusinessBlock()),

      h(View, { style: s.titleRow }, T(s.docTitle, "RECEIPT"), h(View, { style: s.titleRule }), T(s.paidPill, "PAID")),

      h(
        View,
        { style: s.cols },
        h(View, { style: { flex: 1 } }, T(s.colLabel, "BILLED TO"), T(s.partyName, order.client.name), T(s.partyLine, order.client.address), T(s.partyLine, order.client.email)),
        Meta([
          ["Receipt No.", rctId(order)],
          ["Invoice No.", invId(order)],
          ["Date Paid", paidOn],
          ["Method", method],
        ])
      ),

      ItemsTable(order, { withQtyUnit: true }),
      Totals(order, "TOTAL PAID", "Amount Paid (CAD)"),

      DocFooter("THANK YOU FOR YOUR PAYMENT", "Your payment has been received in full — we appreciate your business.")
    )
  );
}

function InvoiceDoc(order: Order) {
  return h(
    Document,
    null,
    h(
      Page,
      { size: "A4", style: s.page },
      Box(s.rowBetween, Logo(48), BusinessBlock()),

      h(View, { style: s.titleRow }, T(s.docTitle, "INVOICE"), h(View, { style: s.titleRule })),

      h(
        View,
        { style: s.cols },
        h(View, { style: { flex: 1 } }, T(s.colLabel, "BILL TO"), T(s.partyName, order.client.name), T(s.partyLine, order.client.address), T(s.partyLine, order.client.email)),
        Meta([
          ["Invoice No.", invId(order)],
          ["Date of Issue", order.invoice.issued],
          ["Due Date", order.invoice.due],
        ])
      ),

      ItemsTable(order, { withQtyUnit: true }),
      Totals(order, "TOTAL", "Amount Due (CAD)"),

      DocFooter("THANK YOU FOR YOUR BUSINESS", "A healthier space, cleaned with 100% plant-based products.")
    )
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
      Box(s.rowBetween, h(View, null, Logo(48), T(s.sub, "Eco-Friendly Cleaning for a Healthier Space")), BusinessBlock()),

      h(View, { style: s.titleRow }, T(s.docTitle, "QUOTATION"), h(View, { style: s.titleRule })),

      h(
        View,
        { style: s.cols },
        h(View, { style: { flex: 1 } }, T(s.colLabel, "PREPARED FOR"), T(s.partyName, order.client.name), T(s.partyLine, order.client.contact), T(s.partyLine, order.client.phone), T(s.partyLine, order.client.email), T(s.partyLine, order.client.address)),
        Meta([
          ["Quote No.", quoteId(order)],
          ["Date Issued", order.quote.issued],
          ["Valid Until", order.quote.valid],
          ["Prepared By", "Eco Elan Team"],
        ])
      ),

      h(View, { style: s.thead }, T([s.th, s.cDesc], "SCOPE OF WORK & PRICING"), T([s.th, s.cAmt], "AMOUNT")),
      order.quote.items.map((it, i) =>
        h(View, { key: i, style: s.trow }, h(View, { style: [s.td, s.cDesc] }, T(s.itemTitle, it.desc), it.detail ? T(s.itemDetail, it.detail) : null), T([s.td, s.cAmt], money(it.amount)))
      ),
      h(View, { style: s.tTotal }, T({ color: C.white, fontWeight: 700, letterSpacing: 0.3 }, "TOTAL QUOTED PRICE"), T({ color: C.white, fontWeight: 800 }, money(total))),

      order.quote.notes ? Box({}, T(s.notesLabel, "NOTES / SPECIAL PRICING CONDITIONS"), T(s.notes, order.quote.notes)) : null,

      DocFooter("THANK YOU", "We appreciate the opportunity to provide eco-friendly, reliable cleaning for your space.")
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
