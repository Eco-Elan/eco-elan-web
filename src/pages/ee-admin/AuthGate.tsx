import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { EeAdminPage } from "../EeAdminPage";

/**
 * Auth wrapper for the /ee-admin console. Handles Supabase magic-link sign-in
 * and hands the console an `authFetch` that attaches a fresh access token to
 * every /api/admin/* call. NOTE: this is UX gating only — the real
 * authorization (token verify + ADMIN_EMAILS allowlist) lives in the API.
 */
const GREEN = "#2E7355";
const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#EEF1E8",
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  color: "#11271B",
  padding: 24,
};
const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 400,
  background: "#fff",
  border: "1px solid #E2E7DD",
  borderRadius: 18,
  padding: 32,
  boxShadow: "0 20px 60px rgba(16,42,30,.12)",
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #D8E0D4",
  borderRadius: 10,
  fontSize: 14,
  marginTop: 8,
  fontFamily: "inherit",
};
const btn: React.CSSProperties = {
  width: "100%",
  marginTop: 16,
  background: GREEN,
  color: "#fff",
  border: "none",
  borderRadius: 11,
  padding: 13,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img src="/assets/logo.svg" alt="Eco Elan" style={{ height: 48 }} />
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: GREEN, fontWeight: 700, marginTop: 8 }}>
            Admin Console
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  // Ready immediately when Supabase isn't configured (we show a config message);
  // otherwise becomes ready once the initial getSession() resolves.
  const [ready, setReady] = useState(!supabase);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const authFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    const { data } = await supabase!.auth.getSession();
    const token = data.session?.access_token ?? "";
    return fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers || {}), Authorization: `Bearer ${token}` },
    });
  }, []);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email) return;
    setSending(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/ee-admin" },
    });
    setSending(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  if (!supabase) {
    return (
      <Shell>
        <div style={{ fontSize: 14, color: "#B4564E", textAlign: "center" }}>
          Supabase isn't configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
        </div>
      </Shell>
    );
  }
  if (!ready) {
    return (
      <Shell>
        <div style={{ textAlign: "center", color: "#6B7B72", fontSize: 14 }}>Loading…</div>
      </Shell>
    );
  }
  if (session) {
    return <EeAdminPage authFetch={authFetch} userEmail={session.user.email ?? ""} onSignOut={() => supabase!.auth.signOut()} />;
  }

  return (
    <Shell>
      {sent ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Check your email</div>
          <div style={{ color: "#6B7B72", fontSize: 13.5, lineHeight: 1.6 }}>
            We sent a sign-in link to <strong>{email}</strong>. Open it on this device to enter the console.
          </div>
          <button style={{ ...btn, background: "#fff", color: GREEN, border: `1px solid ${GREEN}` }} onClick={() => setSent(false)}>
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={sendLink}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Staff sign-in</div>
          <div style={{ color: "#6B7B72", fontSize: 13, marginTop: 4, marginBottom: 12 }}>
            Enter your work email — we'll send a one-time sign-in link.
          </div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7B72" }}>Email</label>
          <input
            style={input}
            type="email"
            required
            placeholder="you@eco-elan.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <div style={{ color: "#B4564E", fontSize: 12.5, marginTop: 10 }}>{error}</div>}
          <button style={{ ...btn, opacity: sending ? 0.6 : 1 }} type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}
    </Shell>
  );
}
