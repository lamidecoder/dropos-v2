"use client";
import { useEffect } from "react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[DropOS Dashboard] Error:", error); }, [error]);

  return (
    <div style={{ minHeight:"calc(100vh - 60px)", display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", fontFamily:"'Plus Jakarta Sans',system-ui", padding:"40px 20px" }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#EF4444,#B91C1C)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:"0 8px 24px rgba(239,68,68,0.2)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
          </svg>
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:"#F87171", letterSpacing:"0.12em", margin:"0 0 8px", textTransform:"uppercase" as const }}>Page Error</p>
        <h2 style={{ fontSize:22, fontWeight:900, color:"#F0ECFF", letterSpacing:"-0.03em", margin:"0 0 10px" }}>Something went wrong</h2>
        <p style={{ fontSize:13, color:"rgba(240,236,255,0.4)", lineHeight:1.6, margin:"0 0 24px" }}>
          {error?.message || "This page encountered an unexpected error."}
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={reset}
            style={{ padding:"10px 22px", borderRadius:10, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", fontSize:13, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit" }}>
            Try Again
          </button>
          <button onClick={() => window.location.href="/dashboard"}
            style={{ padding:"10px 22px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", color:"rgba(240,236,255,0.5)", fontSize:13, fontWeight:600, background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>
            Overview
          </button>
        </div>
      </div>
    </div>
  );
}
