"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  const isNetworkError = error.message?.includes("fetch") || error.message?.includes("network") || error.message?.includes("ECONNREFUSED");

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24, background:"#F4F2FB", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(145deg,#2D1B69,#0D0625)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/></svg>
      </div>
      <div style={{ textAlign:"center", maxWidth:420 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:"#130D2E", margin:"0 0 8px" }}>
          {isNetworkError ? "Connection issue" : "Something went wrong"}
        </h1>
        <p style={{ fontSize:14, color:"rgba(19,13,46,0.5)", margin:"0 0 24px", lineHeight:1.6 }}>
          {isNetworkError
            ? "We're having trouble connecting. This usually resolves itself in 30 seconds."
            : "An unexpected error occurred. Please try refreshing the page."}
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={reset}
            style={{ padding:"11px 22px", borderRadius:12, background:"#130D2E", color:"#fff", border:"none", cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:"inherit" }}>
            Try again
          </button>
          <Link href="/dashboard"
            style={{ padding:"11px 22px", borderRadius:12, background:"transparent", color:"rgba(19,13,46,0.5)", textDecoration:"none", fontSize:14, fontWeight:600, border:"1px solid rgba(19,13,46,0.1)" }}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
