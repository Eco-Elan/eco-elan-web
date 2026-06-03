import { Fragment } from "react";
import { Icon } from "../../components/Icon";

export function StepBar({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div style={{ background: "var(--eco-cream-2)", padding: "26px 0", borderBottom: "1px solid var(--eco-line)" }}>
      <div className="container-x">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {steps.map((s, i) => (
            <Fragment key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
                  {i < step ? <Icon name="check" size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: i <= step ? "var(--eco-green-dark)" : "var(--eco-muted)" }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="step-bar-line"
                  style={{
                    width: 60,
                    height: 2,
                    background: i < step ? "var(--eco-green)" : "var(--eco-line)",
                    margin: "0 12px",
                    borderRadius: 1,
                    transition: "background .3s",
                  }}
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 720px){.step-bar-line{width:24px !important;margin:0 4px !important;}}`}</style>
    </div>
  );
}
