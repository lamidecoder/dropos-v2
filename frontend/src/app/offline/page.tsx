"use client";
export default function OfflinePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#07050F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(145deg,#6B35E8,#1A0D3D)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(107,53,232,0.4)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8, letterSpacing: "-1px" }}>You're offline</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 28 }}>
          No internet connection. KIRO is waiting for you to reconnect.
        </p>
        <button onClick={() => window.location.reload()}
          style={{ padding: "12px 28px", borderRadius: 14, background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(107,53,232,0.4)" }}>
          Try again
        </button>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 20 }}>
          Your store data is safe. We'll sync when you're back online.
        </p>
      </div>
    </div>
  );
}
