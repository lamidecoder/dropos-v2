"use client";
import { useEffect } from "react";

export default function SlugError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("Store slug error:", error); }, [error]);
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24, background:"#fafafa", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"#8B5CF6", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
        </svg>
      </div>
      <h1 style={{ fontSize:22, fontWeight:800, color:"#111", margin:0 }}>Store couldn't load</h1>
      <p style={{ color:"#888", fontSize:14, textAlign:"center", maxWidth:360, margin:0 }}>
        Something went wrong. Please try refreshing the page.
      </p>
      <button onClick={reset}
        style={{ padding:"10px 24px", borderRadius:10, background:"#8B5CF6", color:"#fff", border:"none", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit" }}>
        Try Again
      </button>
    </div>
  );
}
