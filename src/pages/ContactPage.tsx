import { useState, type ChangeEvent, type FormEvent } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/PageHero";
import { SERVICES, AREAS } from "../data/content";

type ContactItem = { i: IconName; t: string; v: string; href?: string };

const items: ContactItem[] = [
  { i: "phone", t: "Phone", v: "+1 (437) 265-4977", href: "tel:+14372654977" },
  { i: "mail", t: "Email", v: "info@eco-elan.com", href: "mailto:info@eco-elan.com" },
  { i: "clock", t: "Service Hours", v: "Mon–Sat · 8am–6pm · Sunday Closed" },
  {
    i: "map-pin",
    t: "Service Area",
    v: "Toronto & GTA — Toronto, Mississauga, Brampton, Etobicoke, North York, Scarborough, Vaughan and more",
  },
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [postalChecked, setPostalChecked] = useState(false);
  const [postal, setPostal] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: SERVICES[0]?.id ?? "standard",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const setField = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const serviceName = SERVICES.find((s) => s.id === form.service)?.name ?? form.service;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service: serviceName }),
      });
      if (!res.ok) throw new Error("send failed");
      setSubmitted(true);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero
        title="Get in touch."
        accent="We're here to help."
        subtitle="Have questions or need a custom quote? Reach out — a real human responds within minutes during business hours."
        bgImage="/assets/contact_hero.jpg"
        imgPos="70% center"
        strongScrim
      />

      <section>
        <div className="container-x">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 56 }} className="contact-grid">
            <Reveal>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", marginBottom: 24 }}>Get in touch</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {items.map((c) => (
                  <div key={c.t} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "var(--eco-cream-2)",
                        color: "var(--eco-green)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={c.i} size={18} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--eco-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                        }}
                      >
                        {c.t}
                      </div>
                      {c.href ? (
                        <a
                          href={c.href}
                          className="contact-link"
                          style={{
                            fontWeight: 600,
                            marginTop: 4,
                            fontSize: 15,
                            color: "var(--eco-ink)",
                            textDecoration: "none",
                            display: "inline-block",
                            transition: "color .2s",
                          }}
                        >
                          {c.v}
                        </a>
                      ) : (
                        <div style={{ fontWeight: 600, marginTop: 4, fontSize: 15 }}>{c.v}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32, padding: 22, background: "var(--eco-cream-2)", borderRadius: 18 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Why contact us?</div>
                {[
                  "Free quotes within 24 hours",
                  "No-obligation consultations",
                  "Custom cleaning plans",
                  "Flexible scheduling options",
                ].map((b) => (
                  <div key={b} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, fontSize: 14 }}>
                    <Icon name="check-circle" size={16} style={{ color: "var(--eco-green)" }} /> {b}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 24, marginBottom: 6 }}>Send us a message</h3>
                <p style={{ color: "var(--eco-muted)", fontSize: 14, marginBottom: 24 }}>
                  Fill out the form below — we'll get back to you shortly.
                </p>

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "rgba(109,200,144,0.2)",
                        color: "var(--eco-green)",
                        display: "grid",
                        placeItems: "center",
                        margin: "0 auto 18px",
                      }}
                    >
                      <Icon name="check-circle" size={36} />
                    </div>
                    <h3 style={{ fontSize: 22, marginBottom: 8 }}>Message sent!</h3>
                    <p style={{ color: "var(--eco-muted)" }}>We'll get back to you within minutes during business hours.</p>
                  </div>
                ) : (
                  <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label className="label">Full Name *</label>
                      <input className="input" placeholder="John Doe" required value={form.name} onChange={setField("name")} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label className="label">Email *</label>
                        <input className="input" type="email" placeholder="john@example.com" required value={form.email} onChange={setField("email")} />
                      </div>
                      <div>
                        <label className="label">Phone</label>
                        <input className="input" type="tel" placeholder="(416) 555-0123" value={form.phone} onChange={setField("phone")} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Service Interested In</label>
                      <select className="select" value={form.service} onChange={setField("service")}>
                        {SERVICES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Message</label>
                      <textarea className="textarea" rows={4} placeholder="Tell us about your cleaning needs…" required value={form.message} onChange={setField("message")} />
                    </div>
                    {status === "error" && (
                      <div
                        role="alert"
                        style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", borderRadius: 12, background: "#FCEDED", border: "1px solid #F3C9C9", color: "#A03434", fontSize: 14, fontWeight: 600 }}
                      >
                        <Icon name="x-circle" size={18} /> Something went wrong — please try again or email us directly.
                      </div>
                    )}
                    <button className="btn btn-primary" type="submit" disabled={status === "sending"} style={{ alignSelf: "flex-start", opacity: status === "sending" ? 0.6 : 1 }}>
                      {status === "sending" ? "Sending…" : "Send Message"} <Icon name="send" size={16} />
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
        <style>{`@media (max-width: 980px){.contact-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      <section style={{ background: "var(--eco-cream-2)" }}>
        <div className="container-x">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span className="eyebrow">Coverage</span>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", marginTop: 14 }}>Serving the entire GTA</h2>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
                maxWidth: 900,
                margin: "0 auto 30px",
              }}
            >
              {AREAS.map((a) => (
                <span key={a} className="chip">
                  {a}
                </span>
              ))}
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 22,
                padding: 24,
                maxWidth: 520,
                margin: "0 auto",
                textAlign: "center",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Check your postal code</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  className="input"
                  value={postal}
                  onChange={(e) => {
                    setPostal(e.target.value);
                    setPostalChecked(false);
                  }}
                  placeholder="Enter postal code (e.g. M5V)"
                />
                <button className="btn btn-primary" onClick={() => setPostalChecked(true)}>
                  Check Area
                </button>
              </div>
              {postalChecked && postal.length > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 16px",
                    background: "rgba(109,200,144,0.18)",
                    color: "var(--eco-green-dark)",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  <Icon name="check-circle" size={16} style={{ verticalAlign: "-3px", color: "var(--eco-green)" }} /> Yes — we serve {postal.toUpperCase()}! Available 7 days a week.
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
