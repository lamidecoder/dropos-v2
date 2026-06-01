import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24, background:"#F4F2FB", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <div style={{ width:64, height:64, borderRadius:18, background:"linear-gradient(145deg,#2D1B69,#0D0625)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/></svg>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:80, fontWeight:900, color:"#130D2E", margin:"0 0 8px", letterSpacing:"-0.06em", lineHeight:1, opacity:0.08 }}>404</p>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#130D2E", margin:"-40px 0 10px", letterSpacing:"-0.03em" }}>Page not found</h1>
        <p style={{ fontSize:15, color:"rgba(19,13,46,0.5)", margin:"0 0 28px" }}>This page doesn't exist or was moved.</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/dashboard" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"11px 22px", borderRadius:12, background:"#130D2E", color:"#fff", textDecoration:"none", fontSize:14, fontWeight:700 }}>
            Go to dashboard
          </Link>
          <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"11px 22px", borderRadius:12, background:"transparent", color:"rgba(19,13,46,0.5)", textDecoration:"none", fontSize:14, fontWeight:600, border:"1px solid rgba(19,13,46,0.1)" }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
