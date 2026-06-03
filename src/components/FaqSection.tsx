import { useState } from "react";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { FAQS } from "../data/content";

export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section>
      <div className="container-x" style={{ maxWidth: 940 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow">Questions</span>
            <h2 style={{ fontSize: "clamp(34px, 4.5vw, 52px)", marginTop: 14 }}>Frequently asked questions</h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="card" style={{ padding: "8px 28px" }}>
            {FAQS.map((f, i) => (
              <div
                key={i}
                className={`faq-item ${open === i ? "open" : ""}`}
                style={{ borderBottom: i === FAQS.length - 1 ? "none" : "1px solid var(--eco-line)" }}
              >
                <div className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <Icon name="plus" size={22} className="faq-icon" />
                </div>
                <div className="faq-a">
                  <p style={{ margin: 0, paddingRight: 30 }}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
