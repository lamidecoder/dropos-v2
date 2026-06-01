"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function StoreError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("Store error:", error); }, [error]);
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24, background:"#fafafa", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"#8B5CF6", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
        </svg>
      </div>
      <h1 style={{ fontSize:22, fontWeight:800, color:"#111", margin:0 }}>Something went wrong</h1>
      <p style={{ color:"#888", fontSize:14, textAlign:"center", maxWidth:360, margin:0 }}>
        The store couldn't load properly. Please try again.
      </p>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={reset}
          style={{ padding:"10px 24px", borderRadius:10, background:"#8B5CF6", color:"#fff", border:"none", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit" }}>
          Try Again
        </button>
        <Link href="/"
          style={{ padding:"10px 24px", borderRadius:10, background:"transparent", color:"#666", border:"1px solid #e5e7eb", textDecoration:"none", fontSize:14, fontWeight:600 }}>
          Home
        </Link>
      </div>
    </div>
  );
}
