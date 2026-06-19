import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { money } from "../data/admin";

/**
 * Public customer payment page (/pay/:id). Shows the invoice amount and a
 * "Pay now" button that sends the customer to the Stripe-hosted Payment Link.
 * Stripe redirects back here with ?paid=1 on success, where the page flips to a
 * paid / thank-you state (the webhook marks the order paid + emails the receipt
 * out of band). No auth — the order id is the unguessable capability, and the
 * API (/api/pay-info) only exposes the amount, status and pay URL.
 */

const GREEN = "#2E7355";
const INK = "#11271B";

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#EEF1E8",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  color: INK,
  padding: 24,
};
const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 440,
  background: "#fff",
  border: "1px solid #E2E7DD",
  borderRadius: 20,
  padding: 34,
  boxShadow: "0 24px 70px rgba(16,42,30,.14)",
  textAlign: "center",
};
const muted: React.CSSProperties = { color: "#6B7B72", fontSize: 13.5, lineHeight: 1.6 };

type Info = {
  ok: true;
  invoiceId: string;
  name: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid";
  receiptSent: boolean;
  payUrl: string | null;
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={wrap}>
      <div style={card}>
        <img src="/assets/logo.svg" alt="Eco Elan" style={{ height: 52, marginBottom: 6 }} />
        <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: GREEN, fontWeight: 700, marginBottom: 22 }}>
          Cleaning Services
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        border: "2px solid rgba(255,255,255,.5)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "ee-pay-spin .7s linear infinite",
        verticalAlign: "-2px",
        marginRight: 8,
      }}
    />
  );
}

export default function PayPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const justPaid = params.get("paid") === "1";

  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const pollRef = useRef<number>(0);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/pay-info?id=${encodeURIComponent(id)}`);
      if (r.status === 404) {
        setError("We couldn't find this invoice. Please check the link, or contact us.");
        return null;
      }
      if (!r.ok) throw new Error();
      const j = (await r.json()) as Info;
      setInfo(j);
      setError(null);
      return j;
    } catch {
      setError("Something went wrong loading your invoice. Please try again.");
      return null;
    }
  }, [id]);

  useEffect(() => {
    // Wrapped in a nested async fn so the state-setting load() isn't invoked
    // synchronously in the effect body (react-hooks/set-state-in-effect).
    void (async () => {
      await load();
    })();
  }, [load]);

  // If we just returned from Stripe (?paid=1) but the webhook hasn't flipped the
  // order to paid yet, poll a few times so the receipt-sent confirmation appears.
  useEffect(() => {
    if (!justPaid) return;
    const tick = async () => {
      const j = await load();
      pollRef.current += 1;
      if (j && (j.status === "paid" || pollRef.current >= 6)) return;
      window.setTimeout(tick, 2500);
    };
    const t = window.setTimeout(tick, 2500);
    return () => window.clearTimeout(t);
  }, [justPaid, load]);

  const payNow = () => {
    if (!info?.payUrl) return;
    setRedirecting(true);
    window.location.href = info.payUrl;
  };

  const styleTag = <style>{`@keyframes ee-pay-spin{to{transform:rotate(360deg)}}@keyframes ee-pay-pop{0%{transform:scale(.7);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>;

  if (error) {
    return (
      <Shell>
        {styleTag}
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Invoice unavailable</div>
        <div style={muted}>{error}</div>
        <div style={{ ...muted, marginTop: 16 }}>
          <a href="mailto:info@eco-elan.com" style={{ color: GREEN, fontWeight: 700, textDecoration: "none" }}>
            info@eco-elan.com
          </a>
        </div>
      </Shell>
    );
  }

  if (!info) {
    return (
      <Shell>
        {styleTag}
        <div style={muted}>Loading your invoice…</div>
      </Shell>
    );
  }

  const firstName = info.name.trim().split(/\s+/)[0] || "there";
  const paid = info.status === "paid" || justPaid;

  if (paid) {
    return (
      <Shell>
        {styleTag}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#E6F0E9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            animation: "ee-pay-pop .35s ease",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-.01em" }}>Payment received</div>
        <div style={{ ...muted, marginTop: 8 }}>
          Thank you, {firstName}! Your payment of <strong style={{ color: INK }}>{money(info.amount)} {info.currency}</strong> for invoice{" "}
          <strong style={{ color: INK }}>{info.invoiceId}</strong> has been received.
        </div>
        <div
          style={{
            marginTop: 18,
            background: "#F6F8F2",
            border: "1px solid #E2E7DD",
            borderRadius: 12,
            padding: "13px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textAlign: "left",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 7 9-7" />
          </svg>
          <span style={{ fontSize: 12.5, color: "#46554C", lineHeight: 1.5 }}>
            {info.receiptSent ? "A receipt has been emailed to you." : "Your receipt is on its way to your inbox."}
          </span>
        </div>
        <div style={{ ...muted, marginTop: 20, fontSize: 12 }}>You can safely close this page.</div>
      </Shell>
    );
  }

  return (
    <Shell>
      {styleTag}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#9AA79E" }}>
        Invoice {info.invoiceId}
      </div>
      <div style={{ ...muted, marginTop: 10, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7B72" }}>
        Amount due
      </div>
      <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-.02em", color: GREEN, lineHeight: 1.05, marginTop: 4 }}>
        {money(info.amount)}
      </div>
      <div style={{ ...muted, marginTop: 2, fontSize: 12 }}>{info.currency}</div>

      {info.name && <div style={{ ...muted, marginTop: 16 }}>Billed to {info.name}</div>}

      {info.payUrl ? (
        <button
          onClick={payNow}
          disabled={redirecting}
          style={{
            marginTop: 22,
            width: "100%",
            background: GREEN,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: 15,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            opacity: redirecting ? 0.7 : 1,
            boxShadow: "0 10px 24px rgba(46,115,85,.24)",
          }}
        >
          {redirecting ? <Spinner /> : null}
          {redirecting ? "Redirecting…" : `Pay ${money(info.amount)} now`}
        </button>
      ) : (
        <div style={{ marginTop: 22, background: "#FBEEDD", border: "1px solid #F0DCC2", borderRadius: 12, padding: "13px 16px", fontSize: 12.5, color: "#8A5A1E", lineHeight: 1.5 }}>
          This invoice isn't ready for online payment yet. Please contact us at{" "}
          <a href="mailto:info@eco-elan.com" style={{ color: "#8A5A1E", fontWeight: 700 }}>
            info@eco-elan.com
          </a>
          .
        </div>
      )}

      <div style={{ ...muted, marginTop: 14, fontSize: 11.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9AA79E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secure payment via Stripe · a receipt is emailed automatically
      </div>
    </Shell>
  );
}
