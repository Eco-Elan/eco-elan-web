/**
 * Shared admin-console domain model (isomorphic — imported by the browser
 * console AND the serverless /api/admin functions, same as src/data/pricing.ts).
 * Keeping the types, money math and document IDs here means the on-screen
 * preview and the server-computed charge can never drift apart.
 */

export type QuoteItem = { desc: string; detail: string; amount: number | string };
export type InvItem = { desc: string; detail: string; unit: number | string; qty: number | string };

export type Client = {
  name: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
};

export type Quote = { status: string; issued: string; valid: string; notes: string; items: QuoteItem[] };
export type Invoice = {
  status: string;
  issued: string;
  due: string;
  discountLabel: string;
  discount: number | string;
  hst: boolean;
  items: InvItem[];
};
export type Payment = {
  status: string;
  linkGenerated: boolean;
  amount: number | string | null;
  paidOn: string | null;
  receiptSent: boolean;
  method: string | null;
  /** Stripe Payment Link id + url, set once a real link is generated. */
  stripeLinkId?: string | null;
  stripeUrl?: string | null;
};

export type Order = {
  /** Supabase row uuid — present once the order is loaded from the DB. */
  id?: string;
  seq: string;
  client: Client;
  quote: Quote;
  invoice: Invoice;
  payment: Payment;
};

export type Orders = Record<string, Order>;

export const HST_RATE = 0.13;

export const SERVICE_CATALOG: { name: string; desc: string }[] = [
  { name: "Standard Eco Cleaning", desc: "Recurring maintenance clean with eco-safe, plant-based products." },
  { name: "Deep Eco Cleaning", desc: "Full-detail premium clean — buildup, baseboards, behind appliances." },
  { name: "Move-In / Move-Out", desc: "Top-to-bottom clean for empty homes — fridge, oven, cabinets, the works." },
  { name: "Airbnb Turnover", desc: "Fast, consistent turnover with linen swap available. Built for hosts." },
  { name: "Office / Commercial", desc: "Healthier workspaces with non-toxic products. Daily, weekly or custom." },
  { name: "Inside Fridge", desc: "Add-on — wipe & deodorize" },
  { name: "Inside Oven", desc: "Add-on — degrease & sanitize" },
  { name: "Windows (Interior)", desc: "Add-on — streak-free glass" },
  { name: "Inside Cabinets", desc: "Add-on — wipe inside & out" },
  { name: "Laundry", desc: "Add-on — wash, dry & fold" },
  { name: "Balcony Cleaning", desc: "Add-on — sweep & wipe down" },
];

export function money(n: number | string | null | undefined): string {
  const v = Number(n);
  return "$" + (isFinite(v) ? v : 0).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function invMath(o: Order) {
  const subtotal = o.invoice.items.reduce((s, it) => s + Number(it.unit || 0) * Number(it.qty || 0), 0);
  const discount = Number(o.invoice.discount || 0);
  const hst = o.invoice.hst ? (subtotal - discount) * HST_RATE : 0;
  const total = subtotal - discount + hst;
  return { subtotal, discount, hst, total };
}

export function quoteTotal(o: Order): number {
  return o.quote.items.reduce((s, it) => s + Number(it.amount || 0), 0);
}

/** Total in the minor unit Stripe expects (CAD cents), rounded. */
export function invoiceAmountCents(o: Order): number {
  return Math.round(invMath(o).total * 100);
}

export const quoteId = (o: Order) => "EE-QTE-" + o.seq;
export const invId = (o: Order) => "EE-INV-" + o.seq;
export const rctId = (o: Order) => "EE-RCT-" + o.seq;

/** Initial demo data — inserted once when the orders table is empty. */
export function seedOrders(): Orders {
  return {
    "001": {
      seq: "001",
      client: {
        name: "Maria Thompson",
        company: "",
        contact: "Maria Thompson",
        phone: "+1 (416) 555-0148",
        email: "maria.thompson@email.com",
        address: "48 Maple Crescent, Unit 12, Etobicoke, ON M9C 4Z1",
      },
      quote: {
        status: "draft",
        issued: "June 18, 2026",
        valid: "July 18, 2026",
        notes: "Bi-weekly recurring discount applied. Quote valid for 30 days.",
        items: [
          { desc: "Deep Eco Cleaning", detail: "Full-detail premium clean — plant-based products", amount: 200 },
          { desc: "Standard Eco Cleaning (bi-weekly ×2)", detail: "Recurring maintenance visits", amount: 220 },
          { desc: "Add-ons: Oven, Fridge, Interior Windows", detail: "Degrease, deodorize, streak-free glass", amount: 75 },
        ],
      },
      invoice: {
        status: "draft",
        issued: "June 18, 2026",
        due: "July 2, 2026",
        discountLabel: "Discount (Bi-weekly)",
        discount: 25,
        hst: true,
        items: [
          { desc: "Deep Eco Cleaning", detail: "Full-detail premium clean", unit: 200, qty: 1 },
          { desc: "Standard Eco Cleaning", detail: "Bi-weekly visits", unit: 110, qty: 2 },
          { desc: "Inside Oven", detail: "Add-on — degrease & sanitize", unit: 25, qty: 1 },
          { desc: "Inside Fridge", detail: "Add-on — wipe & deodorize", unit: 20, qty: 1 },
          { desc: "Interior Windows", detail: "Add-on — streak-free glass", unit: 10, qty: 3 },
        ],
      },
      payment: { status: "unpaid", linkGenerated: false, amount: null, paidOn: null, receiptSent: false, method: null },
    },
    "002": {
      seq: "002",
      client: {
        name: "James Reid",
        company: "",
        contact: "James Reid",
        phone: "+1 (647) 555-0192",
        email: "james.reid@email.com",
        address: "210 Yonge St, North York, ON M2N 5P9",
      },
      quote: {
        status: "sent",
        issued: "June 10, 2026",
        valid: "July 10, 2026",
        notes: "One-time deep clean, allergen-safe products.",
        items: [
          { desc: "Deep Eco Cleaning", detail: "Allergen-safe, plant-based", amount: 200 },
          { desc: "Inside Cabinets", detail: "Add-on", amount: 30 },
        ],
      },
      invoice: {
        status: "sent",
        issued: "June 11, 2026",
        due: "June 25, 2026",
        discountLabel: "Discount",
        discount: 0,
        hst: true,
        items: [
          { desc: "Deep Eco Cleaning", detail: "Allergen-safe deep clean", unit: 200, qty: 1 },
          { desc: "Inside Cabinets", detail: "Add-on", unit: 30, qty: 1 },
        ],
      },
      payment: {
        status: "paid",
        linkGenerated: true,
        amount: 259.9,
        paidOn: "June 12, 2026",
        receiptSent: true,
        method: "Card · Stripe",
      },
    },
    "003": {
      seq: "003",
      client: {
        name: "Elena Kowalski",
        company: "Kowalski Studio",
        contact: "Elena Kowalski",
        phone: "+1 (905) 555-0173",
        email: "elena.k@studio.com",
        address: "88 King St W, Downtown Toronto, ON M5X 1A4",
      },
      quote: {
        status: "sent",
        issued: "June 14, 2026",
        valid: "July 14, 2026",
        notes: "Move-out clean for studio unit.",
        items: [{ desc: "Move-In / Move-Out Clean", detail: "Top-to-bottom empty unit", amount: 240 }],
      },
      invoice: {
        status: "draft",
        issued: "June 18, 2026",
        due: "July 2, 2026",
        discountLabel: "Discount",
        discount: 0,
        hst: true,
        items: [{ desc: "Move-In / Move-Out Clean", detail: "Fridge, oven, cabinets, the works", unit: 240, qty: 1 }],
      },
      payment: { status: "unpaid", linkGenerated: false, amount: null, paidOn: null, receiptSent: false, method: null },
    },
    "004": {
      seq: "004",
      client: {
        name: "Marcus Tan",
        company: "GTA Stays",
        contact: "Marcus Tan",
        phone: "+1 (437) 555-0110",
        email: "marcus@gtastays.co",
        address: "5 Residences Way, Yorkville, Toronto, ON M5R 0B5",
      },
      quote: {
        status: "draft",
        issued: "June 18, 2026",
        valid: "July 18, 2026",
        notes: "Airbnb turnover, linen swap included.",
        items: [
          { desc: "Airbnb Turnover", detail: "Fast consistent turnover", amount: 120 },
          { desc: "Laundry / Linen swap", detail: "Add-on", amount: 25 },
        ],
      },
      invoice: {
        status: "draft",
        issued: "June 18, 2026",
        due: "July 2, 2026",
        discountLabel: "Discount",
        discount: 0,
        hst: true,
        items: [
          { desc: "Airbnb Turnover", detail: "Per-booking turnover", unit: 120, qty: 1 },
          { desc: "Laundry / Linen swap", detail: "Add-on", unit: 25, qty: 1 },
        ],
      },
      payment: { status: "unpaid", linkGenerated: false, amount: null, paidOn: null, receiptSent: false, method: null },
    },
  };
}
