"use client";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("DropOS error:", error); }, [error]);

  return (
    <html>
      <body style={{ margin:0, background:"#07050F", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui", padding:"20px" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:500, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(239,68,68,0.08),transparent 70%)", filter:"blur(60px)" }}/>
        </div>
        <div style={{ textAlign:"center", position:"relative", zIndex:1, maxWidth:480 }}>
          <div style={{ width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#EF4444,#B91C1C)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 16px 40px rgba(239,68,68,0.3)" }}>
            <span style={{ fontSize:32 }}>⚡</span>
          </div>
          <p style={{ fontSize:12, fontWeight:700, color:"#F87171", letterSpacing:"0.15em", margin:"0 0 12px", textTransform:"uppercase" as const }}>KIRO · Something went wrong</p>
          <h1 style={{ fontSize:"clamp(28px,6vw,48px)", fontWeight:900, color:"#fff", letterSpacing:"-0.04em", margin:"0 0 16px", lineHeight:1 }}>
            Unexpected Error
          </h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.7, margin:"0 0 32px" }}>
            KIRO encountered a problem loading this page. This has been logged automatically.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={reset} style={{ padding:"12px 28px", borderRadius:14, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", fontSize:14, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit", boxShadow:"0 8px 24px rgba(107,53,232,0.35)" }}>
              Try Again
            </button>
            <button onClick={() => window.location.href="/dashboard"} style={{ padding:"12px 28px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:600, background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>
              Dashboard
            </button>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.15)", marginTop:40 }}>DropOS · droposhq.com</p>
        </div>
      </body>
    </html>
  );
}
