/**
 * Server-only Supabase access for the admin console. Uses the SERVICE-ROLE key
 * (bypasses RLS) and must only be imported by /api/admin/* functions and the
 * Stripe webhook — never by browser code. Callers are responsible for
 * authorizing the request first (see adminAuth.ts).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  type Order,
  type Client,
  type Quote,
  type Invoice,
  type Payment,
  invMath,
  seedOrders,
} from "../data/admin.js";

const url = process.env.SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const adminDb: SupabaseClient = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type OrderRow = {
  id: string;
  seq_num: number;
  client: Client;
  quote: Quote;
  invoice: Invoice;
  payment: Payment;
};

type OrderDoc = { client: Client; quote: Quote; invoice: Invoice; payment: Payment };

const seq = (n: number) => String(n).padStart(3, "0");

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    seq: seq(row.seq_num),
    client: row.client,
    quote: row.quote,
    invoice: row.invoice,
    payment: row.payment,
  };
}

/** Columns derived from the document so the dashboard can query cheaply. */
function summary(doc: OrderDoc) {
  return {
    payment_status: doc.payment?.status ?? "unpaid",
    total_amount: Math.round(invMath(doc as Order).total * 100) / 100,
  };
}

/** Insert the demo orders once, when the table is empty. */
async function ensureSeeded(): Promise<void> {
  const { count, error } = await adminDb.from("orders").select("id", { count: "exact", head: true });
  if (error) throw error;
  if (count && count > 0) return;
  const rows = Object.values(seedOrders())
    .sort((a, b) => a.seq.localeCompare(b.seq))
    .map((o) => {
      const doc: OrderDoc = { client: o.client, quote: o.quote, invoice: o.invoice, payment: o.payment };
      return { ...doc, ...summary(doc) };
    });
  const { error: insErr } = await adminDb.from("orders").insert(rows);
  if (insErr) throw insErr;
}

/** All orders as a { seq -> Order } map, seeding on first call. */
export async function listOrdersMap(): Promise<Record<string, Order>> {
  await ensureSeeded();
  const { data, error } = await adminDb
    .from("orders")
    .select("id, seq_num, client, quote, invoice, payment")
    .order("seq_num", { ascending: true });
  if (error) throw error;
  const map: Record<string, Order> = {};
  for (const row of (data ?? []) as OrderRow[]) {
    const o = rowToOrder(row);
    map[o.seq] = o;
  }
  return map;
}

/** Create a blank order; returns the new Order (with its seq + id). */
export async function createOrder(): Promise<Order> {
  const blank: OrderDoc = {
    client: { name: "New client", company: "", contact: "", phone: "", email: "", address: "" },
    quote: { status: "draft", issued: today(), valid: plusDays(30), notes: "", items: [] },
    invoice: { status: "draft", issued: today(), due: plusDays(14), discountLabel: "Discount", discount: 0, hst: true, items: [], fromQuote: true },
    payment: { status: "unpaid", linkGenerated: false, amount: null, paidOn: null, receiptSent: false, method: null },
  };
  const { data, error } = await adminDb
    .from("orders")
    .insert({ ...blank, ...summary(blank) })
    .select("id, seq_num, client, quote, invoice, payment")
    .single();
  if (error) throw error;
  return rowToOrder(data as OrderRow);
}

/** Overwrite an order's documents (the console sends the whole doc on edit). */
export async function updateOrderDoc(id: string, doc: OrderDoc): Promise<Order> {
  const { data, error } = await adminDb
    .from("orders")
    .update({ client: doc.client, quote: doc.quote, invoice: doc.invoice, payment: doc.payment, ...summary(doc) })
    .eq("id", id)
    .select("id, seq_num, client, quote, invoice, payment")
    .single();
  if (error) throw error;
  return rowToOrder(data as OrderRow);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await adminDb
    .from("orders")
    .select("id, seq_num, client, quote, invoice, payment")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as OrderRow) : null;
}

/** Mark an order paid (called from the Stripe webhook). */
export async function markOrderPaid(
  id: string,
  info: { method?: string; paidOn?: string; receiptSent?: boolean }
): Promise<Order | null> {
  const order = await getOrderById(id);
  if (!order) return null;
  const payment: Payment = {
    ...order.payment,
    status: "paid",
    method: info.method ?? order.payment.method ?? "Card · Stripe",
    paidOn: info.paidOn ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    receiptSent: info.receiptSent ?? order.payment.receiptSent,
  };
  return updateOrderDoc(id, { client: order.client, quote: order.quote, invoice: order.invoice, payment });
}

function today(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function plusDays(d: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
