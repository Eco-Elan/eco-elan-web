/* eslint-disable react-refresh/only-export-components -- server-only module (no Fast Refresh); exports render fns alongside react-pdf doc components. */
/**
 * Server-side PDF rendering for quotation / invoice / receipt documents
 * (@react-pdf/renderer). Uses the built-in Helvetica + brand colors and draws
 * the letterhead as styled text (no external image fetch) so it never fails in
 * a serverless function. Imported by api/admin/send-document.ts and the Stripe
 * webhook. Numbers come from the shared math in src/data/admin.ts.
 */
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

function Letterhead() {
  return (
    <View>
      <Text style={s.brand}>ECO ELAN</Text>
      <Text style={s.tagline}>CLEANING SERVICES</Text>
    </View>
  );
}

function Contact() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10, paddingVertical: 6, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: C.line }}>
      {["+1 (437) 265-4977", "info@eco-elan.com", "Toronto & the GTA", "Fully Insured & Bonded"].map((t) => (
        <Text key={t} style={{ color: C.green, fontSize: 9, fontFamily: "Helvetica-Bold", marginRight: 18 }}>
          {t}
        </Text>
      ))}
    </View>
  );
}

function Footer({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerTitle}>{title}</Text>
      <Text style={s.footerSub}>{sub}</Text>
    </View>
  );
}

function Meta({ rows }: { rows: [string, string][] }) {
  return (
    <View style={s.metaGrid}>
      {rows.map(([k, v]) => (
        <View key={k} style={s.metaRow}>
          <Text style={s.metaLabel}>{k}</Text>
          <Text style={s.metaVal}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

function QuotationDoc({ order }: { order: Order }) {
  const total = quoteTotal(order);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.rowBetween}>
          <View>
            <Letterhead />
            <Text style={s.sub}>Eco-Friendly Cleaning for a Healthier Space</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.docTitle}>QUOTATION</Text>
            <Meta
              rows={[
                ["Quote Number", quoteId(order)],
                ["Date Issued", order.quote.issued],
                ["Valid Until", order.quote.valid],
                ["Prepared By", "Eco Elan Team"],
              ]}
            />
          </View>
        </View>
        <Contact />

        <Text style={s.bandHead}>CLIENT INFORMATION</Text>
        <View style={s.bandBox}>
          <View style={s.kv}><Text style={s.k}>Client / Company:</Text><Text style={s.v}>{order.client.name}</Text></View>
          <View style={s.kv}><Text style={s.k}>Contact:</Text><Text style={s.v}>{order.client.contact}</Text></View>
          <View style={s.kv}><Text style={s.k}>Phone:</Text><Text style={s.v}>{order.client.phone}</Text></View>
          <View style={s.kv}><Text style={s.k}>Email:</Text><Text style={s.v}>{order.client.email}</Text></View>
          <View style={s.kv}><Text style={s.k}>Service Address:</Text><Text style={s.v}>{order.client.address}</Text></View>
        </View>

        <View style={s.thead}>
          <Text style={s.cDesc}>SCOPE OF WORK & PRICING</Text>
          <Text style={s.cNum}>AMOUNT</Text>
        </View>
        {order.quote.items.map((it, i) => (
          <View key={i} style={s.trow}>
            <View style={s.cDesc}>
              <Text style={s.itemTitle}>{it.desc}</Text>
              {it.detail ? <Text style={s.itemDetail}>{it.detail}</Text> : null}
            </View>
            <Text style={s.cNum}>{money(it.amount)}</Text>
          </View>
        ))}
        <View style={s.grandTotal}>
          <Text>TOTAL QUOTED PRICE</Text>
          <Text>{money(total)}</Text>
        </View>

        {order.quote.notes ? (
          <View>
            <Text style={s.notesLabel}>NOTES / SPECIAL PRICING CONDITIONS</Text>
            <Text style={s.notes}>{order.quote.notes}</Text>
          </View>
        ) : null}

        <Footer title="THANK YOU" sub="We appreciate the opportunity to provide eco-friendly, reliable cleaning for your space." />
      </Page>
    </Document>
  );
}

function InvoiceDoc({ order }: { order: Order }) {
  const m = invMath(order);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.rowBetween}>
          <Letterhead />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.ink }}>Eco Elan Cleaning Services</Text>
            <Text style={{ fontSize: 9, color: C.soft, marginTop: 2 }}>Serving Toronto & the GTA</Text>
            <Text style={{ fontSize: 9, color: C.soft }}>+1 (437) 265-4977</Text>
            <Text style={{ fontSize: 9, color: C.soft }}>info@eco-elan.com</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 22 }}>
          <Text style={s.docTitle}>INVOICE</Text>
          <View style={{ flex: 1, height: 3, backgroundColor: C.green, marginLeft: 14, borderRadius: 2 }} />
        </View>

        <View style={[s.rowBetween, { marginTop: 18 }]}>
          <View>
            <Text style={{ fontSize: 8, color: C.green, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginBottom: 4 }}>BILL TO</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{order.client.name}</Text>
            <Text style={{ color: C.soft, marginTop: 2 }}>{order.client.address}</Text>
            <Text style={{ color: C.soft }}>{order.client.email}</Text>
          </View>
          <Meta
            rows={[
              ["Invoice No.", invId(order)],
              ["Date of Issue", order.invoice.issued],
              ["Due Date", order.invoice.due],
            ]}
          />
        </View>

        <View style={s.thead}>
          <Text style={s.cDesc}>DESCRIPTION</Text>
          <Text style={s.cNum}>UNIT</Text>
          <Text style={s.cQty}>QTY</Text>
          <Text style={s.cNum}>AMOUNT</Text>
        </View>
        {order.invoice.items.map((it, i) => (
          <View key={i} style={s.trow}>
            <View style={s.cDesc}>
              <Text style={s.itemTitle}>{it.desc}</Text>
              {it.detail ? <Text style={s.itemDetail}>{it.detail}</Text> : null}
            </View>
            <Text style={s.cNum}>{money(it.unit)}</Text>
            <Text style={s.cQty}>{String(it.qty)}</Text>
            <Text style={s.cNum}>{money(Number(it.unit || 0) * Number(it.qty || 0))}</Text>
          </View>
        ))}

        <View style={s.totalsBox}>
          <View style={s.totalRow}><Text style={s.k}>Subtotal</Text><Text>{money(m.subtotal)}</Text></View>
          {m.discount > 0 ? (
            <View style={s.totalRow}><Text style={s.k}>{order.invoice.discountLabel}</Text><Text style={{ color: C.green }}>{"-" + money(m.discount)}</Text></View>
          ) : null}
          {order.invoice.hst ? (
            <View style={s.totalRow}><Text style={s.k}>HST (13%)</Text><Text>{money(m.hst)}</Text></View>
          ) : null}
          <View style={s.grandTotal}><Text>TOTAL</Text><Text>{money(m.total)}</Text></View>
        </View>

        <Footer title="THANK YOU FOR YOUR BUSINESS" sub="A healthier space, cleaned with 100% plant-based products." />
      </Page>
    </Document>
  );
}

function ReceiptDoc({ order }: { order: Order }) {
  const m = invMath(order);
  const paid = order.payment.amount != null ? Number(order.payment.amount) : m.total;
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.rowBetween}>
          <Letterhead />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.docTitle}>RECEIPT</Text>
            <Meta
              rows={[
                ["Receipt No.", rctId(order)],
                ["Invoice No.", invId(order)],
                ["Paid On", order.payment.paidOn ?? "—"],
                ["Method", order.payment.method ?? "Card · Stripe"],
              ]}
            />
          </View>
        </View>
        <Contact />

        <View style={{ marginTop: 16 }}>
          <Text style={s.paidStamp}>PAID</Text>
        </View>

        <Text style={s.bandHead}>BILLED TO</Text>
        <View style={s.bandBox}>
          <View style={s.kv}><Text style={s.k}>Client:</Text><Text style={s.v}>{order.client.name}</Text></View>
          <View style={s.kv}><Text style={s.k}>Email:</Text><Text style={s.v}>{order.client.email}</Text></View>
          <View style={s.kv}><Text style={s.k}>Address:</Text><Text style={s.v}>{order.client.address}</Text></View>
        </View>

        <View style={s.thead}>
          <Text style={s.cDesc}>DESCRIPTION</Text>
          <Text style={s.cNum}>AMOUNT</Text>
        </View>
        {order.invoice.items.map((it, i) => (
          <View key={i} style={s.trow}>
            <View style={s.cDesc}>
              <Text style={s.itemTitle}>{it.desc}{Number(it.qty) > 1 ? "  x" + it.qty : ""}</Text>
              {it.detail ? <Text style={s.itemDetail}>{it.detail}</Text> : null}
            </View>
            <Text style={s.cNum}>{money(Number(it.unit || 0) * Number(it.qty || 0))}</Text>
          </View>
        ))}
        <View style={s.grandTotal}>
          <Text>TOTAL PAID (CAD)</Text>
          <Text>{money(paid)}</Text>
        </View>

        <Footer title="THANK YOU FOR YOUR PAYMENT" sub="A healthier space, cleaned with 100% plant-based products." />
      </Page>
    </Document>
  );
}

export function renderQuotationPdf(order: Order): Promise<Buffer> {
  return renderToBuffer(<QuotationDoc order={order} />);
}
export function renderInvoicePdf(order: Order): Promise<Buffer> {
  return renderToBuffer(<InvoiceDoc order={order} />);
}
export function renderReceiptPdf(order: Order): Promise<Buffer> {
  return renderToBuffer(<ReceiptDoc order={order} />);
}
