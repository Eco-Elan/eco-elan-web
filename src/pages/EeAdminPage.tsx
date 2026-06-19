import { Component, type CSSProperties, type ReactNode } from "react";
import type * as React from "react";
import {
  type Order,
  type Orders,
  type QuoteItem,
  type InvItem,
  SERVICE_CATALOG,
  money,
  invMath,
  quoteTotal,
  quoteItemsToInvItems,
  invItemsToQuoteItems,
  quoteId,
  invId,
  rctId,
} from "../data/admin";

/* ============================================================================
   Eco Elan — Admin Console (/ee-admin), production-wired.
   Data lives in Supabase and is read/written through the gated /api/admin/*
   endpoints (via the AuthGate's authFetch). Customers pay on a real Stripe
   Payment Link; documents are emailed as PDFs server-side. The visual design
   is unchanged from the original port.
   ========================================================================== */

const LOGO = "/assets/logo.svg";

function st(css: string): CSSProperties {
  const o: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    const val = decl.slice(i + 1).trim();
    const key = prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    o[key] = val;
  }
  return o as CSSProperties;
}

const ICONS: Record<string, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  quote: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  invoice: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 11v6M9.5 12.5h3.5a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3H14" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20" />
    </>
  ),
  collapse: <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>
  ),
};

function Ic({ n, s = 17, sw = 1.8, stroke = "currentColor", style }: { n: keyof typeof ICONS; s?: number; sw?: number; stroke?: string; style?: CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {ICONS[n]}
    </svg>
  );
}

type Modal = { docType: "quote" | "invoice"; to: string; subject: string; body: string; sending: boolean } | null;

type State = {
  tab: "dashboard" | "quotation" | "invoice" | "payment";
  activeSeq: string;
  orders: Orders;
  modal: Modal;
  toast: string | null;
  copied: boolean;
  openCombo: string | null;
  sidebarCollapsed: boolean;
  vw: number;
  loading: boolean;
  loadError: string | null;
  busy: boolean;
};

type Props = {
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
  userEmail: string;
  onSignOut: () => void;
};

const STYLE_BLOCK = `
  .ee-admin * { box-sizing: border-box; }
  .ee-admin input, .ee-admin textarea, .ee-admin button, .ee-admin select { font-family: inherit; }
  .ee-admin input:focus, .ee-admin textarea:focus { outline: none; border-color: #2E7355 !important; box-shadow: 0 0 0 3px rgba(46,115,85,.12); }
  .ee-admin textarea { resize: none; }
  .ee-admin ::placeholder { color: #A9B4A6; }
  @keyframes ee-spin { to { transform: rotate(360deg); } }
  @keyframes ee-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .ee-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
  .ee-scroll::-webkit-scrollbar-thumb { background: #CBD4C8; border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
  .ee-navscroll { scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; }
  .ee-navscroll::-webkit-scrollbar { display: none; height: 0; width: 0; }
  .ee-row:hover { background: #F8FAF5 !important; }
  .ee-opt:hover { background: #F2F6EE !important; }
`;

export class EeAdminPage extends Component<Props, State> {
  state: State = {
    tab: "dashboard",
    activeSeq: "",
    orders: {},
    modal: null,
    toast: null,
    copied: false,
    openCombo: null,
    sidebarCollapsed: false,
    vw: typeof window !== "undefined" ? window.innerWidth : 1280,
    loading: true,
    loadError: null,
    busy: false,
  };

  _toastT?: ReturnType<typeof setTimeout>;
  _copyT?: ReturnType<typeof setTimeout>;
  _saveT?: ReturnType<typeof setTimeout>;
  _rz?: number;
  _closeCombo?: (e: MouseEvent) => void;
  _onResize?: () => void;

  componentDidMount() {
    this._closeCombo = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (this.state.openCombo && !(t && t.closest && t.closest("[data-combo]"))) this.setState({ openCombo: null });
    };
    document.addEventListener("mousedown", this._closeCombo, true);
    this._onResize = () => {
      if (this._rz) cancelAnimationFrame(this._rz);
      this._rz = requestAnimationFrame(() => this.setState({ vw: window.innerWidth }));
    };
    window.addEventListener("resize", this._onResize);
    void this.loadOrders();
  }

  componentWillUnmount() {
    if (this._closeCombo) document.removeEventListener("mousedown", this._closeCombo, true);
    if (this._onResize) window.removeEventListener("resize", this._onResize);
  }

  // ---- data ----
  async loadOrders() {
    try {
      const r = await this.props.authFetch("/api/admin/orders");
      if (!r.ok) throw new Error(r.status === 403 ? "Your account isn't authorized for the admin console." : "Couldn't load orders (" + r.status + ")");
      const j = await r.json();
      const orders: Orders = j.orders ?? {};
      const first = Object.keys(orders).sort()[0] ?? "";
      this.setState({ orders, activeSeq: first, loading: false, loadError: null });
    } catch (e) {
      this.setState({ loading: false, loadError: (e as Error).message });
    }
  }

  queueSave(seq: string) {
    clearTimeout(this._saveT);
    this._saveT = setTimeout(() => void this.saveOrder(seq), 600);
  }
  async saveOrder(seq: string) {
    const o = this.state.orders[seq];
    if (!o?.id) return;
    try {
      const r = await this.props.authFetch("/api/admin/orders", {
        method: "PATCH",
        body: JSON.stringify({ id: o.id, order: { client: o.client, quote: o.quote, invoice: o.invoice, payment: o.payment } }),
      });
      if (!r.ok) throw new Error();
    } catch {
      this.showToast("Save failed — check your connection");
    }
  }

  /** Local mutation of the active order + debounced persist to the API. */
  mutate(fn: (active: Order, all: Orders) => void, cb?: () => void) {
    this.setState(
      (prev) => {
        const orders: Orders = JSON.parse(JSON.stringify(prev.orders));
        const active = orders[prev.activeSeq];
        fn(active, orders);
        // While the invoice is linked to the quotation, its line items mirror
        // the quote's after every edit. An edit that touches the invoice itself
        // sets fromQuote=false (below), so this won't clobber manual changes.
        if (active && active.invoice.fromQuote) {
          active.invoice.items = quoteItemsToInvItems(active.quote.items);
        }
        return { orders };
      },
      () => {
        this.queueSave(this.state.activeSeq);
        cb?.();
      }
    );
  }

  /** Re-link the invoice and copy the quotation's line items into it. */
  syncInvoiceFromQuote() {
    this.mutate(
      (o) => {
        o.invoice.fromQuote = true;
      },
      () => this.showToast("Invoice synced from quotation")
    );
  }

  /** Copy the invoice's line items back into the quotation (invoice-first flow). */
  buildQuoteFromInvoice() {
    this.mutate(
      (o) => {
        o.quote.items = invItemsToQuoteItems(o.invoice.items);
        o.invoice.fromQuote = false; // the invoice is now the source of truth
      },
      () => this.showToast("Quotation built from invoice")
    );
  }

  async createNewOrder() {
    if (this.state.busy) return;
    this.setState({ busy: true });
    try {
      const r = await this.props.authFetch("/api/admin/orders", { method: "POST" });
      if (!r.ok) throw new Error();
      const { order } = await r.json();
      this.setState((prev) => ({ orders: { ...prev.orders, [order.seq]: order }, activeSeq: order.seq, tab: "quotation", busy: false }));
      this.showToast("New order #" + order.seq + " created");
    } catch {
      this.setState({ busy: false });
      this.showToast("Could not create order");
    }
  }

  chip(status: string) {
    const map: Record<string, string> = {
      draft: "background:#F0EFE2;color:#8A7F2E;",
      sent: "background:#E6F0E9;color:#2E7355;",
      unpaid: "background:#FBEEDD;color:#B5792A;",
      paid: "background:#2E7355;color:#fff;",
      none: "background:#F1F1ED;color:#9AA79E;",
    };
    const base = "display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:capitalize;padding:4px 10px;border-radius:20px;";
    return base + (map[status] || map.none);
  }

  navTo(tab: State["tab"]) {
    this.setState({ tab, openCombo: null });
  }
  toggleSidebar() {
    this.setState((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
  }
  showToast(msg: string) {
    this.setState({ toast: msg });
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => this.setState({ toast: null }), 2800);
  }

  // ---- email document modal ----
  openSend(docType: "quote" | "invoice") {
    const o = this.state.orders[this.state.activeSeq];
    const isQuote = docType === "quote";
    const id = isQuote ? quoteId(o) : invId(o);
    const total = isQuote ? quoteTotal(o) : invMath(o).total;
    const subject = isQuote ? `Your Eco Elan quotation ${id}` : `Invoice ${id} from Eco Elan Cleaning Services`;
    const body = isQuote
      ? `Hi ${o.client.contact || o.client.name},\n\nThank you for considering Eco Elan. Please find your quotation ${id} attached, totalling ${money(
          total
        )}. It's valid for 30 days — just reply to accept and we'll get you booked.\n\nWarm regards,\nEco Elan Cleaning Services`
      : `Hi ${o.client.contact || o.client.name},\n\nPlease find invoice ${id} attached, with a balance of ${money(
          total
        )} due. You can pay securely online and we'll email your receipt automatically.\n\nThank you,\nEco Elan Cleaning Services`;
    this.setState({ modal: { docType, to: o.client.email, subject, body, sending: false } });
  }
  closeModal() {
    this.setState({ modal: null });
  }
  async confirmSend() {
    const m = this.state.modal;
    if (!m || m.sending) return;
    this.setState((p) => ({ modal: p.modal ? { ...p.modal, sending: true } : null }));
    const o = this.state.orders[this.state.activeSeq];
    await this.saveOrder(o.seq); // flush pending edits so the PDF reflects them
    try {
      const r = await this.props.authFetch("/api/admin/send-document", {
        method: "POST",
        body: JSON.stringify({ orderId: o.id, docType: m.docType, to: m.to, subject: m.subject, body: m.body }),
      });
      if (!r.ok) throw new Error();
      const { order } = await r.json();
      this.setState((prev) => ({ orders: order ? { ...prev.orders, [order.seq]: order } : prev.orders, modal: null }));
      this.showToast(`${m.docType === "quote" ? "Quotation" : "Invoice"} emailed to ${m.to}`);
    } catch {
      this.setState((p) => ({ modal: p.modal ? { ...p.modal, sending: false } : null }));
      this.showToast("Send failed — please try again");
    }
  }

  // ---- payment link (real Stripe) ----
  async generateLink() {
    const o = this.state.orders[this.state.activeSeq];
    if (!o?.id || this.state.busy) return;
    this.setState({ busy: true });
    await this.saveOrder(o.seq);
    try {
      const r = await this.props.authFetch("/api/admin/payment-link", { method: "POST", body: JSON.stringify({ orderId: o.id }) });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { detail?: string; error?: string };
        throw new Error(j.detail || j.error || "HTTP " + r.status);
      }
      const { order } = await r.json();
      this.setState((prev) => ({ orders: { ...prev.orders, [order.seq]: order }, busy: false, copied: false }));
      this.showToast("Stripe payment link generated");
    } catch (e) {
      this.setState({ busy: false });
      this.showToast("Link failed — " + (e as Error).message);
    }
  }
  /** Branded customer pay page URL (what the customer is sent), not the raw
   *  Stripe URL. Empty until a Stripe link has been generated for the order. */
  payPageUrl(): string {
    const o = this.state.orders[this.state.activeSeq];
    if (!o?.id || !o.payment.stripeUrl) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return origin + "/pay/" + o.id;
  }
  copyLink() {
    const url = this.payPageUrl();
    if (!url) return;
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    this.setState({ copied: true });
    clearTimeout(this._copyT);
    this._copyT = setTimeout(() => this.setState({ copied: false }), 1800);
  }
  openPayPage() {
    const url = this.payPageUrl();
    if (url) window.open(url, "_blank", "noopener");
    else this.showToast("Generate a payment link first");
  }
  emailLink() {
    this.openSend("invoice");
  }

  // ---- field editors ----
  editClient(key: keyof Order["client"], val: string) {
    this.mutate((o) => {
      o.client[key] = val;
    });
  }
  pickService(doc: "quote" | "invoice", i: number, val: string) {
    this.mutate((o) => {
      if (doc === "invoice") o.invoice.fromQuote = false;
      const item = o[doc].items[i];
      item.desc = val;
      const c = SERVICE_CATALOG.find((s) => s.name === val);
      if (c) item.detail = c.desc;
    });
  }
  setDetail(doc: "quote" | "invoice", i: number, val: string) {
    this.mutate((o) => {
      if (doc === "invoice") o.invoice.fromQuote = false;
      o[doc].items[i].detail = val;
    });
  }
  editQuoteItem(i: number, key: keyof QuoteItem, val: string) {
    this.mutate((o) => {
      o.quote.items[i][key] = val;
    });
  }
  addQuoteItem() {
    this.mutate((o) => {
      o.quote.items.push({ desc: "New line item", detail: "", amount: 0 });
    });
  }
  removeQuoteItem(i: number) {
    this.mutate((o) => {
      o.quote.items.splice(i, 1);
    });
  }
  editQuoteNotes(val: string) {
    this.mutate((o) => {
      o.quote.notes = val;
    });
  }
  editInvItem(i: number, key: keyof InvItem, val: string) {
    this.mutate((o) => {
      o.invoice.fromQuote = false;
      o.invoice.items[i][key] = val;
    });
  }
  addInvItem() {
    this.mutate((o) => {
      o.invoice.fromQuote = false;
      o.invoice.items.push({ desc: "New item", detail: "", unit: 0, qty: 1 });
    });
  }
  removeInvItem(i: number) {
    this.mutate((o) => {
      o.invoice.fromQuote = false;
      o.invoice.items.splice(i, 1);
    });
  }
  toggleHst() {
    this.mutate((o) => {
      o.invoice.hst = !o.invoice.hst;
    });
  }
  editDiscount(val: string) {
    this.mutate((o) => {
      o.invoice.discount = val.replace(/[^0-9.]/g, "");
    });
  }
  editDiscountLabel(val: string) {
    this.mutate((o) => {
      o.invoice.discountLabel = val;
    });
  }
  switchOrder(seq: string) {
    this.setState({ activeSeq: seq, openCombo: null });
  }

  combo(doc: "quote" | "invoice", i: number) {
    const S = this.state;
    const kN = doc + "-" + i + "-name";
    const kD = doc + "-" + i + "-detail";
    return {
      nameOpen: S.openCombo === kN,
      detailOpen: S.openCombo === kD,
      openName: () => this.setState({ openCombo: kN }),
      openDetail: () => this.setState({ openCombo: kD }),
      toggleName: (e: React.MouseEvent) => {
        e.preventDefault();
        this.setState((s) => ({ openCombo: s.openCombo === kN ? null : kN }));
      },
      toggleDetail: (e: React.MouseEvent) => {
        e.preventDefault();
        this.setState((s) => ({ openCombo: s.openCombo === kD ? null : kD }));
      },
      nameOptions: SERVICE_CATALOG.map((c) => ({
        label: c.name,
        pick: (e: React.MouseEvent) => {
          e.preventDefault();
          this.pickService(doc, i, c.name);
          this.setState({ openCombo: null });
        },
      })),
      detailOptions: SERVICE_CATALOG.map((c) => ({
        label: c.desc,
        pick: (e: React.MouseEvent) => {
          e.preventDefault();
          this.setDetail(doc, i, c.desc);
          this.setState({ openCombo: null });
        },
      })),
    };
  }

  renderLoader(msg: string) {
    return (
      <div className="ee-admin" style={st("min-height:100vh;display:flex;align-items:center;justify-content:center;background:#EEF1E8;font-family:'Plus Jakarta Sans',system-ui,sans-serif;")}>
        <style>{STYLE_BLOCK}</style>
        <div style={st("text-align:center;color:#6B7B72;font-size:14px;")}>
          <div style={st("width:34px;height:34px;border:3px solid #D8E0D4;border-top-color:#2E7355;border-radius:50%;animation:ee-spin .8s linear infinite;margin:0 auto 14px;")}></div>
          {msg}
        </div>
      </div>
    );
  }

  render() {
    const S = this.state;
    if (S.loading) return this.renderLoader("Loading console…");
    if (S.loadError) {
      return (
        <div className="ee-admin" style={st("min-height:100vh;display:flex;align-items:center;justify-content:center;background:#EEF1E8;font-family:'Plus Jakarta Sans',system-ui,sans-serif;padding:24px;")}>
          <style>{STYLE_BLOCK}</style>
          <div style={st("max-width:380px;text-align:center;background:#fff;border:1px solid #E2E7DD;border-radius:16px;padding:30px;")}>
            <div style={st("font-weight:700;font-size:16px;color:#11271B;")}>Couldn't load the console</div>
            <div style={st("color:#6B7B72;font-size:13.5px;margin-top:8px;line-height:1.6;")}>{S.loadError}</div>
            <button onClick={() => this.props.onSignOut()} style={st("margin-top:18px;background:#2E7355;color:#fff;border:none;border-radius:10px;padding:11px 16px;font-size:13px;font-weight:700;cursor:pointer;")}>
              Sign out
            </button>
          </div>
        </div>
      );
    }

    const o = S.orders[S.activeSeq];
    if (!o) return this.renderLoader("No orders yet…");

    const m = invMath(o);
    const qTotal = quoteTotal(o);

    const orderList = Object.values(S.orders).map((ord) => {
      const im = invMath(ord);
      const amt = ord.payment.amount != null ? Number(ord.payment.amount) : im.total;
      return {
        seq: ord.seq,
        name: ord.client.name,
        email: ord.client.email,
        quoteId: quoteId(ord),
        invId: invId(ord),
        rctId: ord.payment.status === "paid" ? rctId(ord) : "—",
        quoteStatus: ord.quote.status,
        invStatus: ord.invoice.status,
        payStatus: ord.payment.status,
        quoteChip: this.chip(ord.quote.status),
        invChip: this.chip(ord.invoice.status),
        payChip: this.chip(ord.payment.status),
        amountFmt: money(amt),
        open: () => this.setState({ activeSeq: ord.seq, tab: "quotation" }),
      };
    });
    const orderOptions = Object.values(S.orders).map((ord) => ({ seq: ord.seq, label: "#" + ord.seq + " · " + ord.client.name }));

    const W = S.vw || 1280;
    const mob = W < 820;
    const col = !mob && S.sidebarCollapsed;

    const navBase = mob
      ? "display:inline-flex;align-items:center;gap:7px;flex:none;text-align:left;border:none;border-radius:9px;padding:9px 12px;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap;"
      : col
      ? "display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:none;border-radius:10px;cursor:pointer;margin:0 auto 6px;"
      : "display:flex;align-items:center;gap:11px;width:100%;text-align:left;border:none;border-radius:10px;padding:11px 12px;font-size:13.5px;font-weight:600;cursor:pointer;margin-bottom:3px;";
    const navStyle: Record<string, string> = {};
    (["dashboard", "quotation", "invoice", "payment"] as const).forEach((t) => {
      navStyle[t] = navBase + (S.tab === t ? "background:#2E7355;color:#fff;" : "background:transparent;color:#9FBBA9;");
    });

    const previewScale = Math.min(0.72, (W - 24) / 816);
    const rs = {
      shell: mob ? "display:flex;flex-direction:column;height:100vh;width:100%;overflow:hidden;" : "display:flex;height:100vh;width:100%;overflow:hidden;",
      sidebar: mob
        ? "flex:none;background:#11271B;color:#fff;display:flex;flex-direction:row;align-items:center;gap:10px;padding:10px 14px;"
        : col
        ? "width:72px;flex:none;background:#11271B;color:#fff;display:flex;flex-direction:column;align-items:center;padding:20px 12px;transition:width .2s;"
        : "width:248px;flex:none;background:#11271B;color:#fff;display:flex;flex-direction:column;padding:22px 16px;transition:width .2s;",
      brandRow: mob
        ? "display:flex;align-items:center;gap:8px;padding:0;flex:none;"
        : col
        ? "display:flex;align-items:center;justify-content:center;padding:2px 0 20px;"
        : "display:flex;align-items:center;gap:11px;padding:4px 8px 22px;",
      logo: mob
        ? "height:34px;width:auto;display:block;filter:brightness(0) invert(1);flex:none;"
        : col
        ? "height:30px;width:auto;display:block;filter:brightness(0) invert(1);flex:none;"
        : "height:53px;width:auto;display:block;filter:brightness(0) invert(1);flex:none;",
      brandSub: mob || col ? "display:none;" : "border-left:1px solid #1E3A2A;padding-left:11px;",
      navLabel: col ? "display:none;" : "display:inline;",
      collapseBtn: mob
        ? "display:none;"
        : col
        ? "margin-top:auto;display:flex;align-items:center;justify-content:center;width:44px;height:44px;background:#0C1E14;border:1px solid #1E3A2A;color:#9FBBA9;border-radius:10px;cursor:pointer;"
        : "margin-top:12px;display:flex;align-items:center;gap:9px;width:100%;background:#0C1E14;border:1px solid #1E3A2A;color:#9FBBA9;border-radius:9px;padding:9px 12px;font-size:12px;font-weight:600;cursor:pointer;",
      collapseIcon: col ? "display:flex;transform:rotate(180deg);" : "display:flex;",
      wsLabel: mob || col ? "display:none;" : "font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#5E7A68;font-weight:700;padding:6px 10px 8px;",
      navWrap: mob ? "display:flex;flex-direction:row;gap:8px;overflow-x:auto;flex:1;" : "display:flex;flex-direction:column;",
      promo: mob || col ? "display:none;" : "margin-top:auto;background:#0C1E14;border:1px solid #1E3A2A;border-radius:12px;padding:14px;",
      account: mob || col ? "display:none;" : "margin-top:12px;display:flex;align-items:center;gap:8px;",
      mobCust: mob
        ? "flex:none;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9px;background:#2E7355;color:#fff;border:none;cursor:pointer;"
        : "display:none;",
      dashPad: mob ? "padding:18px 16px 48px;max-width:100%;" : "padding:34px 40px 60px;max-width:1180px;",
      dashHead: mob ? "display:flex;flex-direction:column;gap:14px;align-items:flex-start;margin-bottom:18px;" : "display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:26px;",
      dashCard: mob
        ? "background:#fff;border:1px solid #E2E7DD;border-radius:16px;overflow-x:auto;box-shadow:0 1px 3px rgba(16,42,30,.05);"
        : "background:#fff;border:1px solid #E2E7DD;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(16,42,30,.05);",
      tableInner: mob ? "min-width:680px;" : "",
      builderShell: mob ? "display:flex;flex-direction:column;height:auto;" : "display:flex;height:100vh;",
      editorPane: mob
        ? "width:100%;flex:none;border-bottom:1px solid #E2E7DD;background:#fff;padding:20px 16px 36px;"
        : "width:440px;flex:none;border-right:1px solid #E2E7DD;background:#fff;overflow-y:auto;padding:26px 26px 60px;",
      previewPane: mob ? "width:100%;flex:none;background:#E7EAE0;padding:18px 10px;display:flex;justify-content:center;" : "flex:1;overflow:auto;background:#E7EAE0;padding:34px;display:flex;justify-content:center;",
      previewScale: mob ? "flex:none;zoom:" + previewScale + ";" : "width:816px;flex:none;transform:scale(.72);transform-origin:top center;height:fit-content;",
      payPad: mob ? "padding:18px 16px 48px;max-width:100%;" : "padding:34px 40px 60px;max-width:760px;",
      payGrid: mob ? "display:grid;grid-template-columns:1fr;gap:16px;" : "display:grid;grid-template-columns:1fr 1fr;gap:18px;",
    };

    const clientH = {
      name: (e: React.ChangeEvent<HTMLInputElement>) => this.editClient("name", e.target.value),
      contact: (e: React.ChangeEvent<HTMLInputElement>) => this.editClient("contact", e.target.value),
      phone: (e: React.ChangeEvent<HTMLInputElement>) => this.editClient("phone", e.target.value),
      email: (e: React.ChangeEvent<HTMLInputElement>) => this.editClient("email", e.target.value),
      address: (e: React.ChangeEvent<HTMLInputElement>) => this.editClient("address", e.target.value),
    };

    const quoteRows = o.quote.items
      .map((it, i) => ({
        key: i,
        desc: it.desc,
        detail: it.detail,
        amount: it.amount,
        onDesc: (e: React.ChangeEvent<HTMLInputElement>) => this.pickService("quote", i, e.target.value),
        onDetail: (e: React.ChangeEvent<HTMLInputElement>) => this.editQuoteItem(i, "detail", e.target.value),
        onAmount: (e: React.ChangeEvent<HTMLInputElement>) => this.editQuoteItem(i, "amount", e.target.value.replace(/[^0-9.]/g, "")),
        remove: () => this.removeQuoteItem(i),
        ...this.combo("quote", i),
      }))
      .reverse();
    const quotePreviewRows = o.quote.items.map((it, i) => ({ key: i, desc: it.desc, detail: it.detail, amountFmt: money(it.amount) }));

    const invRows = o.invoice.items
      .map((it, i) => ({
        key: i,
        desc: it.desc,
        detail: it.detail,
        unit: it.unit,
        qty: it.qty,
        amountFmt: money(Number(it.unit || 0) * Number(it.qty || 0)),
        onDesc: (e: React.ChangeEvent<HTMLInputElement>) => this.pickService("invoice", i, e.target.value),
        onDetail: (e: React.ChangeEvent<HTMLInputElement>) => this.editInvItem(i, "detail", e.target.value),
        onUnit: (e: React.ChangeEvent<HTMLInputElement>) => this.editInvItem(i, "unit", e.target.value.replace(/[^0-9.]/g, "")),
        onQty: (e: React.ChangeEvent<HTMLInputElement>) => this.editInvItem(i, "qty", e.target.value.replace(/[^0-9]/g, "")),
        remove: () => this.removeInvItem(i),
        ...this.combo("invoice", i),
      }))
      .reverse();
    const invPreviewRows = o.invoice.items.map((it, i) => ({
      key: i,
      desc: it.desc,
      detail: it.detail,
      qty: it.qty,
      unitFmt: money(it.unit),
      amountFmt: money(Number(it.unit || 0) * Number(it.qty || 0)),
    }));

    const hstToggle = "width:38px;height:22px;border-radius:20px;flex:none;position:relative;transition:background .2s;background:" + (o.invoice.hst ? "#2E7355" : "#CBD4C8") + ";";
    const hstKnob = "position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;transform:translateX(" + (o.invoice.hst ? "16px" : "0") + ");";

    const v = {
      q: { name: o.client.name, contact: o.client.contact, phone: o.client.phone, email: o.client.email, address: o.client.address },
      stat: {
        open: Object.values(S.orders).filter((x) => x.payment.status !== "paid").length,
        paid: Object.values(S.orders).filter((x) => x.payment.status === "paid").length,
      },
      quoteId: quoteId(o),
      quoteIssued: o.quote.issued,
      quoteValid: o.quote.valid,
      quoteStatus: o.quote.status,
      quoteChip: this.chip(o.quote.status),
      quoteTotalFmt: money(qTotal),
      quoteNotes: o.quote.notes,
      invId: invId(o),
      invIssued: o.invoice.issued,
      invDue: o.invoice.due,
      invStatus: o.invoice.status,
      invChip: this.chip(o.invoice.status),
      invFromQuote: !!o.invoice.fromQuote,
      canPullFromInvoice: !o.invoice.fromQuote && o.invoice.items.length > 0,
      invSubtotalFmt: money(m.subtotal),
      invDiscount: o.invoice.discount,
      invDiscountLabel: o.invoice.discountLabel,
      invDiscountFmt: "−" + money(m.discount),
      hasDiscount: Number(o.invoice.discount || 0) > 0,
      hstOn: !!o.invoice.hst,
      invHstFmt: money(m.hst),
      invTotalFmt: money(m.total),
      rctId: rctId(o),
      payAmountFmt: money(m.total),
      linkGenerated: !!o.payment.linkGenerated && !!o.payment.stripeUrl,
      payUrl: this.payPageUrl(),
      copyLabel: S.copied ? "Copied ✓" : "Copy",
      modalOpen: !!S.modal,
      modalTitle: S.modal ? (S.modal.docType === "quote" ? "Send quotation" : "Send invoice") : "",
      modalTo: S.modal ? S.modal.to : "",
      modalSubject: S.modal ? S.modal.subject : "",
      modalBody: S.modal ? S.modal.body : "",
      modalAttach: (S.modal ? (S.modal.docType === "quote" ? quoteId(o) : invId(o)) : "") + ".pdf",
      modalSending: S.modal ? S.modal.sending : false,
      modalSendLabel: S.modal && S.modal.sending ? "Sending…" : "Send email",
      toastShow: !!S.toast,
      toast: S.toast,
    };

    const modalH = {
      to: (e: React.ChangeEvent<HTMLInputElement>) => this.setState((p) => ({ modal: p.modal ? { ...p.modal, to: e.target.value } : null })),
      subject: (e: React.ChangeEvent<HTMLInputElement>) => this.setState((p) => ({ modal: p.modal ? { ...p.modal, subject: e.target.value } : null })),
      body: (e: React.ChangeEvent<HTMLTextAreaElement>) => this.setState((p) => ({ modal: p.modal ? { ...p.modal, body: e.target.value } : null })),
    };

    const navItem = (tab: State["tab"], icon: keyof typeof ICONS, label: string) => (
      <button onClick={() => this.navTo(tab)} style={st(navStyle[tab])}>
        <Ic n={icon} s={17} />
        <span style={st(rs.navLabel)}>{label}</span>
      </button>
    );

    type ComboRow = {
      desc: string;
      detail: string;
      onDesc: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onDetail: (e: React.ChangeEvent<HTMLInputElement>) => void;
      openName: () => void;
      openDetail: () => void;
      toggleName: (e: React.MouseEvent) => void;
      toggleDetail: (e: React.MouseEvent) => void;
      nameOpen: boolean;
      detailOpen: boolean;
      nameOptions: { label: string; pick: (e: React.MouseEvent) => void }[];
      detailOptions: { label: string; pick: (e: React.MouseEvent) => void }[];
    };
    const ComboBox = (row: ComboRow) => ({
      name: (
        <div data-combo style={st("position:relative;flex:1;")}>
          <input value={row.desc} onChange={row.onDesc} onFocus={row.openName} placeholder="Select or type a service" style={st("width:100%;padding:8px 28px 8px 10px;border:1px solid #D8E0D4;border-radius:7px;font-size:12.5px;font-weight:600;color:#11271B;background:#fff;")} />
          <span onMouseDown={row.toggleName} style={st("position:absolute;right:6px;top:50%;transform:translateY(-50%);color:#9AA79E;cursor:pointer;display:flex;")}>
            <Ic n="chevronDown" s={14} sw={2.2} />
          </span>
          {row.nameOpen && (
            <div className="ee-scroll" style={st("position:absolute;z-index:40;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid #D8E0D4;border-radius:9px;box-shadow:0 14px 32px rgba(16,42,30,.18);max-height:230px;overflow:auto;padding:5px;")}>
              <div style={st("font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9AA79E;padding:6px 9px 5px;")}>Service categories</div>
              {row.nameOptions.map((opt, k) => (
                <div key={k} className="ee-opt" onMouseDown={opt.pick} style={st("padding:7px 9px;border-radius:6px;font-size:12px;font-weight:600;color:#11271B;cursor:pointer;")}>
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      detail: (
        <div data-combo style={st("position:relative;flex:1;")}>
          <input value={row.detail} onChange={row.onDetail} onFocus={row.openDetail} placeholder="Select or type a description" style={st("width:100%;padding:7px 28px 7px 10px;border:1px solid #D8E0D4;border-radius:7px;font-size:11.5px;color:#46554C;background:#fff;")} />
          <span onMouseDown={row.toggleDetail} style={st("position:absolute;right:6px;top:50%;transform:translateY(-50%);color:#9AA79E;cursor:pointer;display:flex;")}>
            <Ic n="chevronDown" s={13} sw={2.2} />
          </span>
          {row.detailOpen && (
            <div className="ee-scroll" style={st("position:absolute;z-index:40;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid #D8E0D4;border-radius:9px;box-shadow:0 14px 32px rgba(16,42,30,.18);max-height:230px;overflow:auto;padding:5px;")}>
              <div style={st("font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9AA79E;padding:6px 9px 5px;")}>Descriptions</div>
              {row.detailOptions.map((opt, k) => (
                <div key={k} className="ee-opt" onMouseDown={opt.pick} style={st("padding:7px 9px;border-radius:6px;font-size:11.5px;color:#46554C;cursor:pointer;line-height:1.4;")}>
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    });

    const orderSelect = (
      <select onChange={(e) => this.switchOrder(e.target.value)} value={S.activeSeq} style={st("width:100%;padding:10px 11px;border:1px solid #D8E0D4;border-radius:9px;font-size:13px;background:#fff;color:#11271B;cursor:pointer;")}>
        {orderOptions.map((op) => (
          <option key={op.seq} value={op.seq}>
            {op.label}
          </option>
        ))}
      </select>
    );

    return (
      <div className="ee-admin" style={st("font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#11271B;background:#EEF1E8;")}>
        <style>{STYLE_BLOCK}</style>

        <div style={st(rs.shell)}>
          {/* SIDEBAR */}
          <div style={st(rs.sidebar)}>
            <div style={st(rs.brandRow)}>
              <img src={LOGO} alt="Eco Elan" style={st(rs.logo)} />
              <div style={st(rs.brandSub)}>
                <div style={st("font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#7FA890;font-weight:600;")}>Admin Console</div>
              </div>
            </div>

            <div style={st(rs.wsLabel)}>Workspace</div>
            <div className="ee-navscroll" style={st(rs.navWrap)}>
              {navItem("dashboard", "dashboard", "Dashboard")}
              {navItem("quotation", "quote", "Quotations")}
              {navItem("invoice", "invoice", "Invoices")}
              {navItem("payment", "card", "Payment Links")}
            </div>

            <button onClick={() => this.toggleSidebar()} title="Collapse sidebar" style={st(rs.collapseBtn)}>
              <span style={st(rs.collapseIcon)}>
                <Ic n="collapse" s={16} sw={2} />
              </span>
              <span style={st(rs.navLabel)}>Collapse</span>
            </button>

            <button onClick={() => this.openPayPage()} title="Open customer payment page" style={st(rs.mobCust)}>
              <Ic n="eye" s={17} sw={2} />
            </button>

            <div style={st(rs.promo)}>
              <div style={st("font-size:11px;color:#9FBBA9;line-height:1.55;")}>Open the customer payment page for this order — the same page your customer sees.</div>
              <button onClick={() => this.openPayPage()} style={st("margin-top:11px;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:#2E7355;color:#fff;border:none;border-radius:9px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;")}>
                <Ic n="eye" s={14} sw={2} />
                View payment page
              </button>
            </div>

            <div style={st(rs.account)}>
              <div style={st("flex:1;min-width:0;")}>
                <div style={st("font-size:11px;color:#9FBBA9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}>{this.props.userEmail}</div>
              </div>
              <button onClick={() => this.props.onSignOut()} title="Sign out" style={st("flex:none;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:#0C1E14;border:1px solid #1E3A2A;color:#9FBBA9;cursor:pointer;")}>
                <Ic n="logout" s={15} sw={2} />
              </button>
            </div>
          </div>

          {/* MAIN */}
          <div className="ee-scroll" style={st("flex:1;overflow-y:auto;min-height:0;background:#EEF1E8;")}>
            {/* DASHBOARD */}
            {S.tab === "dashboard" && (
              <div style={st(rs.dashPad)}>
                <div style={st(rs.dashHead)}>
                  <div>
                    <h1 style={st("margin:0;font-size:26px;font-weight:800;letter-spacing:-.01em;")}>Documents</h1>
                    <div style={st("color:#6B7B72;font-size:13.5px;margin-top:4px;")}>Every commercial order, with its matched quotation, invoice &amp; receipt.</div>
                  </div>
                  <div style={st("display:flex;gap:18px;align-items:center;")}>
                    <div style={st("text-align:right;")}>
                      <div style={st("font-size:24px;font-weight:800;color:#2E7355;")}>{v.stat.open}</div>
                      <div style={st("font-size:11px;color:#6B7B72;font-weight:600;")}>Awaiting payment</div>
                    </div>
                    <div style={st("width:1px;height:34px;background:#DCE3D6;")}></div>
                    <div style={st("text-align:right;")}>
                      <div style={st("font-size:24px;font-weight:800;color:#11271B;")}>{v.stat.paid}</div>
                      <div style={st("font-size:11px;color:#6B7B72;font-weight:600;")}>Paid &amp; receipted</div>
                    </div>
                    <button onClick={() => this.createNewOrder()} disabled={S.busy} style={st("display:inline-flex;align-items:center;gap:6px;background:#2E7355;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;cursor:pointer;" + (S.busy ? "opacity:.6;" : ""))}>
                      <Ic n="plus" s={14} sw={2.4} />New order
                    </button>
                  </div>
                </div>

                <div style={st(rs.dashCard)}>
                  <div style={st(rs.tableInner)}>
                    <div style={st("display:grid;grid-template-columns:88px 1.4fr 1fr 1fr 1fr 120px;gap:14px;padding:14px 22px;background:#F6F8F2;border-bottom:1px solid #E2E7DD;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;")}>
                      <span>Order</span>
                      <span>Client</span>
                      <span>Quotation</span>
                      <span>Invoice</span>
                      <span>Payment</span>
                      <span style={st("text-align:right;")}>Amount</span>
                    </div>
                    {orderList.map((row) => (
                      <div key={row.seq} className="ee-row" onClick={row.open} style={st("display:grid;grid-template-columns:88px 1.4fr 1fr 1fr 1fr 120px;gap:14px;padding:16px 22px;border-bottom:1px solid #EEF1E8;align-items:center;cursor:pointer;")}>
                        <span style={st("font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:13px;color:#11271B;")}>{row.seq}</span>
                        <div>
                          <div style={st("font-weight:700;font-size:14px;")}>{row.name}</div>
                          <div style={st("font-size:11.5px;color:#6B7B72;")}>{row.email}</div>
                        </div>
                        <div>
                          <span style={st(row.quoteChip)}>{row.quoteStatus}</span>
                          <div style={st("font-family:ui-monospace,Menlo,monospace;font-size:10.5px;color:#9AA79E;margin-top:4px;")}>{row.quoteId}</div>
                        </div>
                        <div>
                          <span style={st(row.invChip)}>{row.invStatus}</span>
                          <div style={st("font-family:ui-monospace,Menlo,monospace;font-size:10.5px;color:#9AA79E;margin-top:4px;")}>{row.invId}</div>
                        </div>
                        <div>
                          <span style={st(row.payChip)}>{row.payStatus}</span>
                          <div style={st("font-family:ui-monospace,Menlo,monospace;font-size:10.5px;color:#9AA79E;margin-top:4px;")}>{row.rctId}</div>
                        </div>
                        <span style={st("text-align:right;font-weight:800;font-size:14px;color:#11271B;")}>{row.amountFmt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* QUOTATION BUILDER */}
            {S.tab === "quotation" && (
              <div style={st(rs.builderShell)}>
                <div className="ee-scroll" style={st(rs.editorPane)}>
                  <div style={st("display:flex;align-items:center;justify-content:space-between;gap:10px;")}>
                    <div>
                      <h2 style={st("margin:0;font-size:19px;font-weight:800;")}>Quotation</h2>
                      <div style={st("font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#2E7355;font-weight:700;margin-top:3px;")}>{v.quoteId}</div>
                    </div>
                    <span style={st(v.quoteChip)}>{v.quoteStatus}</span>
                  </div>

                  <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;margin:20px 0 7px;")}>Commercial order</label>
                  {orderSelect}

                  <div style={st("font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2E7355;margin:24px 0 12px;border-bottom:1px solid #E2E7DD;padding-bottom:8px;")}>Client information</div>
                  <div style={st("display:grid;gap:12px;")}>
                    <div>
                      <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin-bottom:5px;")}>Client / Company</label>
                      <input value={v.q.name} onChange={clientH.name} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:13px;color:#11271B;background:#fff;")} />
                    </div>
                    <div style={st("display:grid;grid-template-columns:1fr 1fr;gap:12px;")}>
                      <div>
                        <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin-bottom:5px;")}>Contact</label>
                        <input value={v.q.contact} onChange={clientH.contact} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:13px;color:#11271B;background:#fff;")} />
                      </div>
                      <div>
                        <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin-bottom:5px;")}>Phone</label>
                        <input value={v.q.phone} onChange={clientH.phone} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:13px;color:#11271B;background:#fff;")} />
                      </div>
                    </div>
                    <div>
                      <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin-bottom:5px;")}>Email</label>
                      <input value={v.q.email} onChange={clientH.email} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:13px;color:#11271B;background:#fff;")} />
                    </div>
                    <div>
                      <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin-bottom:5px;")}>Service address</label>
                      <input value={v.q.address} onChange={clientH.address} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:13px;color:#11271B;background:#fff;")} />
                    </div>
                  </div>

                  <div style={st("display:flex;align-items:center;justify-content:space-between;margin:24px 0 12px;border-bottom:1px solid #E2E7DD;padding-bottom:8px;")}>
                    <span style={st("font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2E7355;")}>Scope &amp; pricing</span>
                    <div style={st("display:flex;gap:8px;")}>
                      {v.canPullFromInvoice && (
                        <button onClick={() => this.buildQuoteFromInvoice()} title="Copy the invoice's line items into this quotation" style={st("display:inline-flex;align-items:center;gap:5px;background:#fff;color:#2E7355;border:1px solid #CFE0D4;border-radius:7px;padding:6px 10px;font-size:11.5px;font-weight:700;cursor:pointer;")}>
                          <Ic n="link" s={13} sw={2} />Pull from invoice
                        </button>
                      )}
                      <button onClick={() => this.addQuoteItem()} style={st("display:inline-flex;align-items:center;gap:5px;background:#ECF2EC;color:#2E7355;border:none;border-radius:7px;padding:6px 10px;font-size:11.5px;font-weight:700;cursor:pointer;")}>
                        <Ic n="plus" s={13} sw={2.4} />Add field
                      </button>
                    </div>
                  </div>
                  <div style={st("display:flex;flex-direction:column;gap:10px;")}>
                    {quoteRows.map((row) => {
                      const cb = ComboBox(row);
                      return (
                        <div key={row.key} style={st("border:1px solid #E2E7DD;border-radius:10px;padding:11px;background:#FAFBF7;")}>
                          <div style={st("display:flex;gap:8px;align-items:center;")}>
                            {cb.name}
                            <button onClick={row.remove} title="Remove" style={st("flex:none;width:30px;height:30px;border:1px solid #E6D2D2;background:#fff;color:#B4564E;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
                              <Ic n="trash" s={14} sw={2} />
                            </button>
                          </div>
                          <div style={st("display:flex;gap:8px;margin-top:8px;")}>
                            {cb.detail}
                            <div style={st("display:flex;align-items:center;border:1px solid #D8E0D4;border-radius:7px;background:#fff;padding-left:9px;width:108px;")}>
                              <span style={st("color:#9AA79E;font-size:12px;")}>$</span>
                              <input value={row.amount} onChange={row.onAmount} inputMode="decimal" style={st("width:100%;padding:7px 8px;border:none;font-size:12.5px;font-weight:700;color:#11271B;background:transparent;text-align:right;")} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin:18px 0 5px;")}>Notes / conditions</label>
                    <textarea onChange={(e) => this.editQuoteNotes(e.target.value)} value={v.quoteNotes} rows={2} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:12.5px;color:#46554C;background:#fff;line-height:1.5;")} />
                  </div>

                  <button onClick={() => this.openSend("quote")} style={st("margin-top:22px;width:100%;display:flex;align-items:center;justify-content:center;gap:9px;background:#2E7355;color:#fff;border:none;border-radius:11px;padding:14px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(46,115,85,.22);")}>
                    <Ic n="send" s={17} sw={1.9} />Send quotation to customer
                  </button>
                </div>

                <div className="ee-scroll" style={st(rs.previewPane)}>
                  <div style={st(rs.previewScale)}>
                    <div style={st("width:816px;background:#fff;color:#0F1A14;box-shadow:0 30px 80px rgba(16,42,30,.18);padding:36px 46px 0;display:flex;flex-direction:column;min-height:1056px;")}>
                      <div style={st("display:flex;justify-content:space-between;align-items:flex-start;gap:24px;")}>
                        <div>
                          <img src={LOGO} alt="Eco Elan" style={st("height:64px;display:block;margin:-8px 0 0 -6px;")} />
                          <div style={st("font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#2E7355;margin-top:2px;")}>Cleaning Services</div>
                          <div style={st("font-size:11.5px;color:#6B7B72;margin-top:5px;")}>Eco-Friendly Cleaning for a Healthier Space</div>
                        </div>
                        <div style={st("text-align:right;min-width:280px;")}>
                          <div style={st("font-size:40px;font-weight:800;letter-spacing:-.02em;color:#2E7355;line-height:.95;")}>QUOTATION</div>
                          <div style={st("margin-top:12px;display:inline-grid;grid-template-columns:auto auto;gap:5px 14px;text-align:left;font-size:11.5px;")}>
                            <span style={st("color:#6B7B72;")}>Quote Number</span>
                            <span style={st("font-weight:700;font-family:ui-monospace,Menlo,monospace;")}>{v.quoteId}</span>
                            <span style={st("color:#6B7B72;")}>Date Issued</span>
                            <span style={st("font-weight:600;")}>{v.quoteIssued}</span>
                            <span style={st("color:#6B7B72;")}>Valid Until</span>
                            <span style={st("font-weight:600;")}>{v.quoteValid}</span>
                            <span style={st("color:#6B7B72;")}>Prepared By</span>
                            <span style={st("font-weight:600;")}>Eco Elan Team</span>
                          </div>
                        </div>
                      </div>
                      <div style={st("display:flex;flex-wrap:wrap;gap:10px 26px;align-items:center;padding:7px 2px;margin-top:10px;border-top:1.5px solid #E2E7DD;border-bottom:1.5px solid #E2E7DD;color:#2E7355;font-size:11.5px;font-weight:600;")}>
                        <span>+1 (437) 265-4977</span>
                        <span>info@eco-elan.com</span>
                        <span>Toronto &amp; the GTA</span>
                        <span>Fully Insured &amp; Bonded</span>
                      </div>
                      <div style={st("margin-top:14px;")}>
                        <div style={st("background:#2E7355;color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:7px 12px;border-radius:8px 8px 0 0;")}>Client Information</div>
                        <div style={st("border:1px solid #E2E7DD;border-top:none;border-radius:0 0 8px 8px;padding:11px 14px;display:grid;grid-template-columns:1fr 1fr;gap:7px 22px;font-size:12px;")}>
                          <div><span style={st("color:#6B7B72;")}>Client / Company: </span><span style={st("font-weight:600;")}>{v.q.name}</span></div>
                          <div><span style={st("color:#6B7B72;")}>Contact: </span><span style={st("font-weight:600;")}>{v.q.contact}</span></div>
                          <div><span style={st("color:#6B7B72;")}>Phone: </span><span style={st("font-weight:600;")}>{v.q.phone}</span></div>
                          <div><span style={st("color:#6B7B72;")}>Email: </span><span style={st("font-weight:600;")}>{v.q.email}</span></div>
                          <div style={st("grid-column:1/3;")}><span style={st("color:#6B7B72;")}>Service Address: </span><span style={st("font-weight:600;")}>{v.q.address}</span></div>
                        </div>
                      </div>
                      <div style={st("margin-top:14px;")}>
                        <div style={st("background:#2E7355;color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:7px 12px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;")}>
                          <span>Scope of Work &amp; Pricing</span>
                          <span>Amount</span>
                        </div>
                        <div style={st("border:1px solid #E2E7DD;border-top:none;")}>
                          {quotePreviewRows.map((row) => (
                            <div key={row.key} style={st("display:flex;justify-content:space-between;gap:16px;padding:11px 14px;border-bottom:1px solid #EEF1E8;")}>
                              <div>
                                <div style={st("font-weight:700;font-size:12.5px;color:#11271B;")}>{row.desc}</div>
                                <div style={st("font-size:11px;color:#6B7B72;margin-top:2px;")}>{row.detail}</div>
                              </div>
                              <div style={st("font-weight:700;font-size:12.5px;white-space:nowrap;")}>{row.amountFmt}</div>
                            </div>
                          ))}
                          <div style={st("display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#2E7355;color:#fff;")}>
                            <span style={st("font-weight:700;font-size:12.5px;letter-spacing:.04em;")}>TOTAL QUOTED PRICE</span>
                            <span style={st("font-weight:800;font-size:16px;")}>{v.quoteTotalFmt}</span>
                          </div>
                        </div>
                      </div>
                      <div style={st("margin-top:14px;")}>
                        <div style={st("font-size:10.5px;color:#6B7B72;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;")}>Notes / Special Pricing Conditions</div>
                        <div style={st("font-size:12px;color:#46554C;line-height:1.6;")}>{v.quoteNotes}</div>
                      </div>
                      <div style={st("margin:auto -46px 0;background:#EFF1E8;border-top:3px solid #2E7355;padding:16px 46px;display:flex;align-items:center;gap:13px;")}>
                        <span style={st("color:#2E7355;flex:none;")}>
                          <Ic n="quote" s={24} stroke="#2E7355" />
                        </span>
                        <div>
                          <div style={st("font-weight:800;color:#11271B;font-size:13px;letter-spacing:.04em;")}>THANK YOU</div>
                          <div style={st("font-size:10.5px;color:#46554C;margin-top:3px;")}>We appreciate the opportunity to provide eco-friendly, reliable cleaning for your space.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INVOICE BUILDER */}
            {S.tab === "invoice" && (
              <div style={st(rs.builderShell)}>
                <div className="ee-scroll" style={st(rs.editorPane)}>
                  <div style={st("display:flex;align-items:center;justify-content:space-between;gap:10px;")}>
                    <div>
                      <h2 style={st("margin:0;font-size:19px;font-weight:800;")}>Invoice</h2>
                      <div style={st("font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#2E7355;font-weight:700;margin-top:3px;")}>{v.invId}</div>
                    </div>
                    <span style={st(v.invChip)}>{v.invStatus}</span>
                  </div>

                  <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;margin:20px 0 7px;")}>Commercial order</label>
                  {orderSelect}

                  <div style={st("font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2E7355;margin:24px 0 12px;border-bottom:1px solid #E2E7DD;padding-bottom:8px;")}>Bill to</div>
                  <div style={st("display:grid;gap:12px;")}>
                    <div>
                      <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin-bottom:5px;")}>Name</label>
                      <input value={v.q.name} onChange={clientH.name} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:13px;color:#11271B;background:#fff;")} />
                    </div>
                    <div>
                      <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin-bottom:5px;")}>Email</label>
                      <input value={v.q.email} onChange={clientH.email} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:13px;color:#11271B;background:#fff;")} />
                    </div>
                    <div>
                      <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B7B72;margin-bottom:5px;")}>Address</label>
                      <input value={v.q.address} onChange={clientH.address} style={st("width:100%;padding:9px 11px;border:1px solid #D8E0D4;border-radius:8px;font-size:13px;color:#11271B;background:#fff;")} />
                    </div>
                  </div>

                  <div style={st("display:flex;align-items:center;justify-content:space-between;margin:24px 0 12px;border-bottom:1px solid #E2E7DD;padding-bottom:8px;")}>
                    <span style={st("font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2E7355;")}>Line items</span>
                    <button onClick={() => this.addInvItem()} style={st("display:inline-flex;align-items:center;gap:5px;background:#ECF2EC;color:#2E7355;border:none;border-radius:7px;padding:6px 10px;font-size:11.5px;font-weight:700;cursor:pointer;")}>
                      <Ic n="plus" s={13} sw={2.4} />Add item
                    </button>
                  </div>
                  <div style={st("display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-2px 0 12px;")}>
                    {v.invFromQuote ? (
                      <span style={st("display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#2E7355;background:#ECF2EC;border-radius:7px;padding:6px 10px;line-height:1.3;")}>
                        <Ic n="link" s={13} sw={2} />Auto-filled from the quotation — editing a line unlinks it
                      </span>
                    ) : (
                      <>
                        <span style={st("font-size:11px;color:#9AA79E;")}>Independent of the quotation</span>
                        <button onClick={() => this.syncInvoiceFromQuote()} title="Replace these line items with the quotation's" style={st("display:inline-flex;align-items:center;gap:5px;background:#fff;color:#2E7355;border:1px solid #CFE0D4;border-radius:7px;padding:6px 10px;font-size:11.5px;font-weight:700;cursor:pointer;")}>
                          <Ic n="link" s={13} sw={2} />Sync from quotation
                        </button>
                      </>
                    )}
                  </div>
                  <div style={st("display:flex;flex-direction:column;gap:10px;")}>
                    {invRows.map((row) => {
                      const cb = ComboBox(row);
                      return (
                        <div key={row.key} style={st("border:1px solid #E2E7DD;border-radius:10px;padding:11px;background:#FAFBF7;")}>
                          <div style={st("display:flex;gap:8px;align-items:center;")}>
                            {cb.name}
                            <button onClick={row.remove} title="Remove" style={st("flex:none;width:30px;height:30px;border:1px solid #E6D2D2;background:#fff;color:#B4564E;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;")}>
                              <Ic n="trash" s={14} sw={2} />
                            </button>
                          </div>
                          <div style={st("position:relative;width:100%;margin-top:8px;")}>{cb.detail}</div>
                          <div style={st("display:flex;gap:8px;margin-top:8px;align-items:center;")}>
                            <div style={st("display:flex;align-items:center;border:1px solid #D8E0D4;border-radius:7px;background:#fff;padding-left:9px;flex:1;")}>
                              <span style={st("color:#9AA79E;font-size:12px;")}>$</span>
                              <input value={row.unit} onChange={row.onUnit} inputMode="decimal" placeholder="Unit" style={st("width:100%;padding:7px 8px;border:none;font-size:12.5px;font-weight:600;color:#11271B;background:transparent;text-align:right;")} />
                            </div>
                            <span style={st("color:#9AA79E;font-size:13px;")}>×</span>
                            <input value={row.qty} onChange={row.onQty} inputMode="numeric" placeholder="Qty" style={st("width:58px;padding:7px 8px;border:1px solid #D8E0D4;border-radius:7px;font-size:12.5px;font-weight:600;color:#11271B;background:#fff;text-align:center;")} />
                            <span style={st("margin-left:auto;font-weight:800;font-size:13px;color:#2E7355;white-space:nowrap;")}>{row.amountFmt}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={st("margin-top:18px;display:grid;gap:12px;background:#F6F8F2;border:1px solid #E2E7DD;border-radius:10px;padding:14px;")}>
                    <div style={st("display:flex;gap:10px;align-items:center;")}>
                      <input value={v.invDiscountLabel} onChange={(e) => this.editDiscountLabel(e.target.value)} placeholder="Discount label" style={st("flex:1;padding:8px 10px;border:1px solid #D8E0D4;border-radius:7px;font-size:12px;color:#46554C;background:#fff;")} />
                      <div style={st("display:flex;align-items:center;border:1px solid #D8E0D4;border-radius:7px;background:#fff;padding-left:9px;width:108px;")}>
                        <span style={st("color:#9AA79E;font-size:12px;")}>−$</span>
                        <input value={v.invDiscount} onChange={(e) => this.editDiscount(e.target.value)} inputMode="decimal" style={st("width:100%;padding:7px 8px;border:none;font-size:12.5px;font-weight:700;color:#11271B;background:transparent;text-align:right;")} />
                      </div>
                    </div>
                    <label style={st("display:flex;align-items:center;gap:9px;cursor:pointer;font-size:12.5px;font-weight:600;color:#11271B;")}>
                      <span onClick={() => this.toggleHst()} style={st(hstToggle)}>
                        <span style={st(hstKnob)}></span>
                      </span>
                      Apply HST (13%) — Ontario
                    </label>
                  </div>

                  <button onClick={() => this.openSend("invoice")} style={st("margin-top:20px;width:100%;display:flex;align-items:center;justify-content:center;gap:9px;background:#2E7355;color:#fff;border:none;border-radius:11px;padding:14px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(46,115,85,.22);")}>
                    <Ic n="send" s={17} sw={1.9} />Send invoice to customer
                  </button>
                </div>

                <div className="ee-scroll" style={st(rs.previewPane)}>
                  <div style={st(rs.previewScale)}>
                    <div style={st("width:816px;background:#fff;color:#0F1A14;box-shadow:0 30px 80px rgba(16,42,30,.18);padding:46px 50px 0;display:flex;flex-direction:column;min-height:1056px;")}>
                      <div style={st("display:flex;justify-content:space-between;align-items:flex-start;gap:24px;")}>
                        <div>
                          <img src={LOGO} alt="Eco Elan" style={st("height:70px;display:block;margin:-8px 0 0 -6px;")} />
                          <div style={st("font-size:10.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#2E7355;margin-top:2px;")}>Cleaning Services</div>
                        </div>
                        <div style={st("text-align:right;font-size:11.5px;color:#46554C;line-height:1.7;")}>
                          <div style={st("font-weight:700;color:#11271B;font-size:13px;")}>Eco Elan Cleaning Services</div>
                          <div>Serving Toronto &amp; the GTA</div>
                          <div>+1 (437) 265-4977</div>
                          <div>info@eco-elan.com</div>
                          <div style={st("color:#2E7355;font-weight:600;")}>eco-elan.com</div>
                        </div>
                      </div>
                      <div style={st("display:flex;align-items:baseline;gap:14px;margin-top:28px;")}>
                        <div style={st("font-size:38px;font-weight:800;letter-spacing:-.02em;color:#2E7355;line-height:1;")}>INVOICE</div>
                        <div style={st("flex:1;height:3px;background:#2E7355;border-radius:2px;")}></div>
                      </div>
                      <div style={st("display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:24px;")}>
                        <div>
                          <div style={st("font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2E7355;margin-bottom:8px;")}>Bill To</div>
                          <div style={st("font-size:13px;font-weight:700;color:#11271B;")}>{v.q.name}</div>
                          <div style={st("font-size:11.5px;color:#46554C;line-height:1.7;margin-top:3px;")}>
                            {v.q.address}
                            <br />
                            {v.q.email}
                          </div>
                        </div>
                        <div>
                          <div style={st("display:grid;grid-template-columns:auto 1fr;gap:7px 16px;font-size:11.5px;")}>
                            <span style={st("color:#6B7B72;")}>Invoice No.</span>
                            <span style={st("text-align:right;font-weight:700;font-family:ui-monospace,Menlo,monospace;")}>{v.invId}</span>
                            <span style={st("color:#6B7B72;")}>Date of Issue</span>
                            <span style={st("text-align:right;font-weight:600;")}>{v.invIssued}</span>
                            <span style={st("color:#6B7B72;")}>Due Date</span>
                            <span style={st("text-align:right;font-weight:600;")}>{v.invDue}</span>
                          </div>
                        </div>
                      </div>
                      <table style={st("width:100%;border-collapse:collapse;margin-top:24px;font-size:11.5px;")}>
                        <thead>
                          <tr style={st("background:#2E7355;color:#fff;")}>
                            <th style={st("text-align:left;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:10px;padding:9px 14px;border-radius:7px 0 0 7px;")}>Description</th>
                            <th style={st("text-align:right;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:10px;padding:9px 10px;width:90px;")}>Unit Cost</th>
                            <th style={st("text-align:center;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:10px;padding:9px 10px;width:54px;")}>Qty</th>
                            <th style={st("text-align:right;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:10px;padding:9px 14px;width:96px;border-radius:0 7px 7px 0;")}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invPreviewRows.map((row) => (
                            <tr key={row.key} style={st("border-bottom:1px solid #E2E7DD;")}>
                              <td style={st("padding:11px 14px;")}>
                                <div style={st("font-weight:700;color:#11271B;")}>{row.desc}</div>
                                <div style={st("color:#6B7B72;font-size:10.5px;margin-top:2px;")}>{row.detail}</div>
                              </td>
                              <td style={st("text-align:right;padding:11px 10px;")}>{row.unitFmt}</td>
                              <td style={st("text-align:center;padding:11px 10px;")}>{String(row.qty)}</td>
                              <td style={st("text-align:right;padding:11px 14px;font-weight:600;")}>{row.amountFmt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={st("display:flex;justify-content:space-between;align-items:flex-start;gap:30px;margin-top:22px;")}>
                        <div style={st("align-self:flex-end;")}>
                          <div style={st("font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6B7B72;")}>Amount Due (CAD)</div>
                          <div style={st("font-size:38px;font-weight:800;letter-spacing:-.02em;color:#2E7355;line-height:1;margin-top:4px;")}>{v.invTotalFmt}</div>
                        </div>
                        <div style={st("width:300px;")}>
                          <div style={st("display:flex;justify-content:space-between;padding:7px 2px;font-size:11.5px;")}>
                            <span style={st("color:#6B7B72;")}>Subtotal</span>
                            <span style={st("font-weight:600;")}>{v.invSubtotalFmt}</span>
                          </div>
                          {v.hasDiscount && (
                            <div style={st("display:flex;justify-content:space-between;padding:7px 2px;font-size:11.5px;border-top:1px solid #E2E7DD;")}>
                              <span style={st("color:#6B7B72;")}>{v.invDiscountLabel}</span>
                              <span style={st("font-weight:600;color:#2E7355;")}>{v.invDiscountFmt}</span>
                            </div>
                          )}
                          {v.hstOn && (
                            <div style={st("display:flex;justify-content:space-between;padding:7px 2px;font-size:11.5px;border-top:1px solid #E2E7DD;")}>
                              <span style={st("color:#6B7B72;")}>HST (13%)</span>
                              <span style={st("font-weight:600;")}>{v.invHstFmt}</span>
                            </div>
                          )}
                          <div style={st("display:flex;justify-content:space-between;padding:11px 14px;margin-top:8px;background:#2E7355;border-radius:7px;color:#fff;")}>
                            <span style={st("font-weight:700;letter-spacing:.03em;")}>TOTAL</span>
                            <span style={st("font-weight:800;")}>{v.invTotalFmt}</span>
                          </div>
                        </div>
                      </div>
                      <div style={st("margin:auto -50px 0;background:#EFF1E8;border-top:3px solid #2E7355;padding:16px 50px;display:flex;align-items:center;gap:13px;")}>
                        <span style={st("color:#2E7355;flex:none;")}>
                          <Ic n="invoice" s={24} stroke="#2E7355" />
                        </span>
                        <div style={st("flex:1;")}>
                          <div style={st("font-weight:800;color:#11271B;font-size:13px;letter-spacing:.04em;")}>THANK YOU FOR YOUR BUSINESS</div>
                          <div style={st("font-size:10.5px;color:#46554C;margin-top:2px;")}>A healthier space, cleaned with 100% plant-based products.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT LINKS */}
            {S.tab === "payment" && (
              <div style={st(rs.payPad)}>
                <h1 style={st("margin:0;font-size:26px;font-weight:800;letter-spacing:-.01em;")}>Payment links</h1>
                <div style={st("color:#6B7B72;font-size:13.5px;margin-top:4px;")}>Generate a Stripe link for an invoice. The customer pays on a branded page; a receipt is emailed automatically on confirmation.</div>

                <div style={st("background:#fff;border:1px solid #E2E7DD;border-radius:16px;padding:24px;margin-top:24px;box-shadow:0 1px 3px rgba(16,42,30,.05);")}>
                  <div style={st(rs.payGrid)}>
                    <div>
                      <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;margin-bottom:7px;")}>Commercial order</label>
                      {orderSelect}
                      <div style={st("font-size:11.5px;color:#6B7B72;margin-top:8px;")}>
                        Invoice <span style={st("font-family:ui-monospace,Menlo,monospace;color:#2E7355;font-weight:700;")}>{v.invId}</span> · Receipt will be <span style={st("font-family:ui-monospace,Menlo,monospace;color:#2E7355;font-weight:700;")}>{v.rctId}</span>
                      </div>
                    </div>
                    <div>
                      <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;margin-bottom:7px;")}>Amount payable (CAD)</label>
                      <div style={st("display:flex;align-items:center;border:1px solid #D8E0D4;border-radius:9px;background:#F6F8F2;padding:11px 12px;")}>
                        <span style={st("font-size:15px;font-weight:800;color:#11271B;")}>{v.payAmountFmt}</span>
                        <span style={st("margin-left:auto;font-size:11px;color:#9AA79E;")}>invoice total</span>
                      </div>
                    </div>
                  </div>
                  <div style={st("margin-top:18px;")}>
                    <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;margin-bottom:7px;")}>Customer email</label>
                    <input value={v.q.email} onChange={clientH.email} style={st("width:100%;padding:11px;border:1px solid #D8E0D4;border-radius:9px;font-size:13px;color:#11271B;background:#fff;")} />
                  </div>

                  <button onClick={() => this.generateLink()} disabled={S.busy} style={st("margin-top:20px;width:100%;display:flex;align-items:center;justify-content:center;gap:9px;background:#635BFF;color:#fff;border:none;border-radius:11px;padding:14px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(99,91,255,.24);" + (S.busy ? "opacity:.7;" : ""))}>
                    {S.busy ? <span style={st("width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:ee-spin .7s linear infinite;")}></span> : <Ic n="link" s={17} sw={1.9} />}
                    {v.linkGenerated ? "Regenerate Stripe payment link" : "Generate Stripe payment link"}
                  </button>
                </div>

                {v.linkGenerated && (
                  <div style={st("background:#fff;border:1px solid #E2E7DD;border-radius:16px;padding:22px;margin-top:18px;animation:ee-fade .3s ease;box-shadow:0 1px 3px rgba(16,42,30,.05);")}>
                    <div style={st("display:flex;align-items:center;gap:9px;color:#2E7355;font-weight:700;font-size:13px;")}>
                      <Ic n="check" s={17} sw={2.2} />Payment link ready
                    </div>
                    <div style={st("display:flex;gap:10px;margin-top:14px;align-items:center;")}>
                      <div style={st("flex:1;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;color:#46554C;background:#F6F8F2;border:1px solid #E2E7DD;border-radius:9px;padding:11px 13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{v.payUrl}</div>
                      <button onClick={() => this.copyLink()} style={st("flex:none;background:#11271B;color:#fff;border:none;border-radius:9px;padding:11px 16px;font-size:12.5px;font-weight:700;cursor:pointer;")}>{v.copyLabel}</button>
                    </div>
                    <div style={st("display:flex;gap:10px;margin-top:14px;")}>
                      <button onClick={() => this.emailLink()} style={st("flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:#ECF2EC;color:#2E7355;border:none;border-radius:9px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;")}>
                        <Ic n="mail" s={15} sw={1.9} />Email invoice to customer
                      </button>
                      <button onClick={() => this.openPayPage()} style={st("flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:#2E7355;color:#fff;border:none;border-radius:9px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;")}>
                        <Ic n="eye" s={15} sw={1.9} />Open payment page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* EMAIL COMPOSE MODAL */}
        {v.modalOpen && (
          <div onClick={() => this.closeModal()} style={st("position:fixed;inset:0;background:rgba(12,30,20,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;animation:ee-fade .2s ease;")}>
            <div onClick={(e) => e.stopPropagation()} style={st("background:#fff;border-radius:18px;width:100%;max-width:520px;overflow:hidden;box-shadow:0 40px 90px rgba(16,42,30,.35);")}>
              <div style={st("background:#2E7355;color:#fff;padding:18px 22px;display:flex;align-items:center;gap:10px;")}>
                <Ic n="mail" s={19} sw={1.9} />
                <div style={st("font-weight:700;font-size:15px;")}>{v.modalTitle}</div>
              </div>
              <div style={st("padding:22px;")}>
                <div style={st("margin-bottom:13px;")}>
                  <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;margin-bottom:6px;")}>To</label>
                  <input value={v.modalTo} onChange={modalH.to} style={st("width:100%;padding:10px 12px;border:1px solid #D8E0D4;border-radius:9px;font-size:13px;color:#11271B;background:#fff;")} />
                </div>
                <div style={st("margin-bottom:13px;")}>
                  <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;margin-bottom:6px;")}>Subject</label>
                  <input value={v.modalSubject} onChange={modalH.subject} style={st("width:100%;padding:10px 12px;border:1px solid #D8E0D4;border-radius:9px;font-size:13px;color:#11271B;background:#fff;")} />
                </div>
                <div>
                  <label style={st("display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6B7B72;margin-bottom:6px;")}>Message</label>
                  <textarea onChange={modalH.body} rows={5} value={v.modalBody} style={st("width:100%;padding:10px 12px;border:1px solid #D8E0D4;border-radius:9px;font-size:13px;color:#46554C;background:#fff;line-height:1.55;")} />
                </div>
                <div style={st("display:flex;align-items:center;gap:9px;margin-top:14px;background:#F6F8F2;border:1px solid #E2E7DD;border-radius:9px;padding:11px 13px;")}>
                  <Ic n="file" s={17} sw={1.8} stroke="#B4564E" />
                  <span style={st("font-size:12.5px;font-weight:600;color:#11271B;")}>{v.modalAttach}</span>
                  <span style={st("margin-left:auto;font-size:11px;color:#9AA79E;")}>PDF · attached</span>
                </div>
              </div>
              <div style={st("display:flex;gap:10px;padding:0 22px 22px;")}>
                <button onClick={() => this.closeModal()} style={st("flex:none;background:#fff;border:1px solid #D8E0D4;color:#46554C;border-radius:10px;padding:12px 18px;font-size:13px;font-weight:700;cursor:pointer;")}>Cancel</button>
                <button onClick={() => this.confirmSend()} style={st("flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:#2E7355;color:#fff;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;")}>
                  {v.modalSending && <span style={st("width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:ee-spin .7s linear infinite;")}></span>}
                  {v.modalSendLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {v.toastShow && (
          <div style={st("position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:#11271B;color:#fff;padding:13px 20px;border-radius:12px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px;box-shadow:0 16px 40px rgba(16,42,30,.4);z-index:60;animation:ee-fade .25s ease;")}>
            <Ic n="check" s={17} sw={2.2} stroke="#7FD8A8" />
            {v.toast}
          </div>
        )}
      </div>
    );
  }
}

export default EeAdminPage;
