"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[DropOS]", error); }, [error]);
  return (
    <html>
      <body style={{ margin:0, background:"#07050F", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui", padding:"20px" }}>
        <div style={{ textAlign:"center", maxWidth:440 }}>
          <div style={{ width:68, height:68, borderRadius:20, background:"linear-gradient(135deg,#7C3AED,#4C1D95)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:"0 12px 32px rgba(124,58,237,0.3)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/></svg>
          </div>
          <p style={{ fontSize:11, fontWeight:700, color:"#8B5CF6", letterSpacing:"0.15em", margin:"0 0 12px", textTransform:"uppercase" as const }}>DropOS · Something went wrong</p>
          <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:900, color:"#fff", letterSpacing:"-0.04em", margin:"0 0 12px", lineHeight:1.1 }}>Unexpected Error</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", lineHeight:1.7, margin:"0 0 28px" }}>Something went wrong loading this page. Try again or go back to the dashboard.</p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={reset} style={{ padding:"11px 24px", borderRadius:12, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", fontSize:13, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit" }}>Try Again</button>
            <button onClick={() => window.location.href="/dashboard"} style={{ padding:"11px 24px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>Dashboard</button>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.15)", marginTop:32 }}>DropOS · droposhq.com</p>
        </div>
      </body>
    </html>
  );
}
