"use client";

// src/app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: 80, height: 80, borderRadius: 20,
          background: "linear-gradient(135deg,#7C3AED,#8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24, boxShadow: "0 8px 32px rgba(124,58,237,0.3)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.5px" }}>
        You're offline
      </h1>
      <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 32, maxWidth: 320, lineHeight: 1.6 }}>
        No internet connection. Your recent pages are still available - go back and browse what's been cached.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/dashboard"
          style={{
            padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: "#10B981", color: "white", textDecoration: "none",
            boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
          }}>
          Go to Dashboard
        </a>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: "transparent", color: "#94A3B8",
            border: "1px solid #1F2937", cursor: "pointer",
          }}>
          Try again
        </button>
      </div>

      <p style={{ marginTop: 40, fontSize: 12, color: "#4B5563" }}>
        DropOS • Offline mode
      </p>
    </div>
  );
}
