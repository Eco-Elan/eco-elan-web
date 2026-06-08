import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Icon } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import { SERVICES, ADDONS, PROPERTY_SIZES } from "../../data/content";
import { computeTotal } from "../../data/pricing";
import { stripePromise, ecoAppearance } from "../../lib/stripe";
import { Row } from "./Row";
import type { BookingData } from "./types";

type StepPaymentProps = {
  data: BookingData;
  back: () => void;
  onPaid: (total: number, paymentIntentId: string) => void;
};

const errorBox: CSSProperties = {
  marginTop: 16,
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 12,
  background: "#FCEDED",
  border: "1px solid #F3C9C9",
  color: "#A03434",
  fontSize: 14,
  fontWeight: 600,
};

/* ── Presentational chrome (identical across loading / error / live states) ──
   Keeps the designed card shell, heading, trust row, summary + total card in
   one place. Only the payment-method area and the Pay button vary by state. */
function PayShell({
  data,
  total,
  processing,
  onBack,
  backDisabled,
  paymentArea,
  payButton,
}: {
  data: BookingData;
  total: number;
  processing: boolean;
  onBack: () => void;
  backDisabled: boolean;
  paymentArea: ReactNode;
  payButton: ReactNode;
}) {
  const svc = SERVICES.find((s) => s.id === data.service) ?? SERVICES[0];
  const sz = PROPERTY_SIZES.find((p) => p.id === data.size) ?? PROPERTY_SIZES[1];
  const dateStr = data.date
    ? data.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  return (
    <section>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .pay-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,0.4); border-top-color: #fff; animation: spin .7s linear infinite; }
        .pay-load-spinner { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--eco-line); border-top-color: var(--eco-green); animation: spin .8s linear infinite; }
        .pay-disabled { opacity: .55; pointer-events: none; filter: grayscale(.15); }
        @media (max-width:720px){ .pay-grid{ grid-template-columns:1fr !important; } }
      `}</style>
      <div className="container-x" style={{ maxWidth: 980 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span className="eyebrow">Step 5 · Checkout</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginTop: 10 }}>Payment</h2>
            <p style={{ color: "var(--eco-muted)", marginTop: 10 }}>
              Securely complete your booking — a 100% plant-based clean is on the way.
            </p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 18, alignItems: "start" }} className="pay-grid">
          {/* ===== Main: Payment details ===== */}
          <Reveal>
            <div className={`card ${processing ? "pay-disabled" : ""}`} style={{ padding: 26 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <Icon name="credit-card" size={20} style={{ color: "var(--eco-green)" }} />
                <div style={{ fontWeight: 700, fontSize: 17 }}>Payment details</div>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--eco-muted)", fontWeight: 600 }}>
                  <Icon name="lock" size={13} /> Secure
                </span>
              </div>

              {paymentArea}

              {/* Trust row */}
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--eco-muted)", fontWeight: 600 }}>
                  <Icon name="lock" size={14} style={{ color: "var(--eco-green)" }} /> Encrypted &amp; secure · Powered by Stripe
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--eco-muted)" }}>
                  <Icon name="leaf" size={14} style={{ color: "var(--eco-green)" }} /> Every booking funds plant-based, non-toxic products.
                </span>
              </div>
            </div>
          </Reveal>

          {/* ===== Sidebar: order summary + total ===== */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Reveal delay={80}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                  <Icon name="sparkles" size={20} style={{ color: "var(--eco-green)" }} />
                  <div style={{ fontWeight: 700, fontSize: 17 }}>Order summary</div>
                </div>
                <Row label="Service" value={svc.name} />
                <Row label="Property size" value={sz.label} />
                {data.addons.map((id) => {
                  const a = ADDONS.find((x) => x.id === id);
                  return a ? <Row key={id} label={a.name} value={`+$${a.price}`} /> : null;
                })}
                <Row label="Date & time" value={`${dateStr}${data.time ? " · " + data.time : ""}`} />
                <Row label="Address" value={data.address ? `${data.address}, ${data.city}` : "—"} />
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div style={{ background: "linear-gradient(180deg, var(--eco-green), var(--eco-green-dark))", color: "#fff", borderRadius: 22, padding: 28, position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Total Amount</div>
                    <div style={{ fontSize: 44, fontWeight: 800, marginTop: 4 }}>${total}</div>
                  </div>
                  <Icon name="leaf" size={42} stroke={1.4} style={{ color: "rgba(255,255,255,0.3)" }} />
                </div>
                <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  You won't be charged until you confirm. No hidden fees.
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <button className="btn btn-ghost" onClick={onBack} disabled={backDisabled} style={backDisabled ? { opacity: 0.5 } : undefined}>
            <Icon name="arrow-left" size={16} /> Back
          </button>
          {payButton}
        </div>
      </div>
    </section>
  );
}

/* ── Live payment form (inside <Elements>, has access to Stripe context) ── */
function PaymentForm({ data, total, back, onPaid }: StepPaymentProps & { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [walletReady, setWalletReady] = useState(false);
  const processing = status === "processing";

  const confirm = async () => {
    if (!stripe || !elements) return;
    setStatus("processing");
    setErrorMsg(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: window.location.href },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message ?? "Your card was declined. Please try a different payment method.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaid(total, paymentIntent.id);
    } else {
      // requires_action / processing is handled by Stripe's own UI; reset so the
      // customer can retry if they dismissed an authentication step.
      setStatus("idle");
    }
  };

  const paymentArea = (
    <>
      {/* Apple Pay / Google Pay — renders only where a wallet is available. */}
      <div style={{ marginTop: 18 }}>
        <ExpressCheckoutElement
          onReady={({ availablePaymentMethods }) => setWalletReady(!!availablePaymentMethods)}
          onConfirm={confirm}
        />
      </div>

      {walletReady && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0 18px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--eco-line)" }} />
          <span style={{ fontSize: 12, color: "var(--eco-muted)", fontWeight: 600 }}>Or pay with card</span>
          <div style={{ flex: 1, height: 1, background: "var(--eco-line)" }} />
        </div>
      )}

      <div style={{ marginTop: walletReady ? 0 : 14 }}>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {status === "error" && (
        <div role="alert" style={errorBox}>
          <Icon name="x-circle" size={18} /> {errorMsg}
        </div>
      )}
    </>
  );

  const payButton = (
    <button
      className="btn btn-primary"
      onClick={confirm}
      disabled={processing || !stripe}
      style={{ fontSize: 16, padding: "16px 30px", minWidth: 190, justifyContent: "center" }}
    >
      {processing ? (
        <>
          <span className="pay-spinner" /> Processing…
        </>
      ) : (
        <>
          <Icon name="lock" size={16} />
          {`Pay $${total}`}
        </>
      )}
    </button>
  );

  return (
    <PayShell
      data={data}
      total={total}
      processing={processing}
      onBack={back}
      backDisabled={processing}
      paymentArea={paymentArea}
      payButton={payButton}
    />
  );
}

/* ── Step entry: creates the PaymentIntent, then mounts <Elements> ── */
export function StepPayment({ data, back, onPaid }: StepPaymentProps) {
  const total = computeTotal(data);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: data.service,
        size: data.size,
        addons: data.addons,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        address: data.address,
        city: data.city,
        postal: data.postal,
        date: data.date ? data.date.toISOString() : null,
        time: data.time,
        notes: data.notes,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("intent failed");
        return r.json();
      })
      .then((j: { clientSecret: string }) => {
        if (!cancelled) setClientSecret(j.clientSecret);
      })
      .catch(() => {
        if (!cancelled) setInitError(true);
      });
    return () => {
      cancelled = true;
    };
    // The PaymentIntent is created once from the data snapshot at mount (and on
    // explicit retry); we intentionally don't re-create it on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const disabledPay = (
    <button className="btn btn-primary" disabled style={{ fontSize: 16, padding: "16px 30px", minWidth: 190, justifyContent: "center", opacity: 0.6 }}>
      <Icon name="lock" size={16} />
      {`Pay $${total}`}
    </button>
  );

  // Missing publishable key (env not set) — surface clearly rather than a blank element.
  if (!stripePromise) {
    return (
      <PayShell
        data={data}
        total={total}
        processing={false}
        onBack={back}
        backDisabled={false}
        payButton={disabledPay}
        paymentArea={
          <div role="alert" style={{ ...errorBox, marginTop: 18 }}>
            <Icon name="x-circle" size={18} /> Payment isn't configured yet (missing Stripe publishable key).
          </div>
        }
      />
    );
  }

  if (initError) {
    return (
      <PayShell
        data={data}
        total={total}
        processing={false}
        onBack={back}
        backDisabled={false}
        payButton={
          <button
            className="btn btn-primary"
            onClick={() => {
              setInitError(false);
              setClientSecret(null);
              setReloadKey((k) => k + 1);
            }}
            style={{ fontSize: 16, padding: "16px 30px", minWidth: 190, justifyContent: "center" }}
          >
            <Icon name="arrow-right" size={16} /> Try again
          </button>
        }
        paymentArea={
          <div role="alert" style={{ ...errorBox, marginTop: 18 }}>
            <Icon name="x-circle" size={18} /> We couldn't start secure checkout. Please try again.
          </div>
        }
      />
    );
  }

  if (!clientSecret) {
    return (
      <PayShell
        data={data}
        total={total}
        processing={false}
        onBack={back}
        backDisabled={false}
        payButton={disabledPay}
        paymentArea={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "34px 0" }}>
            <span className="pay-load-spinner" />
            <span style={{ fontSize: 14, color: "var(--eco-muted)", fontWeight: 600 }}>Preparing secure checkout…</span>
          </div>
        }
      />
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: ecoAppearance }}>
      <PaymentForm data={data} total={total} back={back} onPaid={onPaid} />
    </Elements>
  );
}
