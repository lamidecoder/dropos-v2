"use client";
// ConnectionBanner — shows across all pages when offline/reconnecting
// Drop into DashboardLayout and public layout
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { useQueryClient } from "@tanstack/react-query";

export default function ConnectionBanner() {
  const qc = useQueryClient();
  const [justReconnected, setJustReconnected] = useState(false);

  const { state, downFor } = useConnectionStatus({
    onReconnect: () => {
      // Refresh ALL cached data the moment we come back online
      qc.invalidateQueries();
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3000);
    },
  });

  const visible = state !== "online" || justReconnected;

  const config = {
    offline:       { bg:"#1a0808", border:"#7f1d1d", dot:"#ef4444", text:"No internet connection",         sub: downFor > 10 ? `Down for ${downFor}s` : "Reconnecting when you're back online" },
    slow:          { bg:"#1a1408", border:"#78350f", dot:"#f59e0b", text:"Slow connection detected",       sub:"KIRO may respond slower than usual" },
    reconnecting:  { bg:"#0f1a1a", border:"#134e4a", dot:"#14b8a6", text:"Reconnecting...",                sub:"Refreshing your data" },
    online:        { bg:"#051a0d", border:"#14532d", dot:"#22c55e", text:"Back online",                    sub:"Everything is refreshed" },
  };

  const cfg = config[justReconnected ? "online" : state] || config.online;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y:-48, opacity:0 }}
          animate={{ y:0,   opacity:1 }}
          exit={{   y:-48, opacity:0 }}
          transition={{ type:"spring", damping:20, stiffness:300 }}
          style={{
            position:"fixed", top:0, left:0, right:0, zIndex:9999,
            display:"flex", alignItems:"center", gap:10,
            padding:"10px 20px",
            background: cfg.bg,
            borderBottom:`1px solid ${cfg.border}`,
            backdropFilter:"blur(10px)",
          }}>
          {/* Pulsing dot */}
          <motion.div
            style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, flexShrink:0 }}
            animate={state==="offline"?{opacity:[1,0.2,1]}:{}}
            transition={{duration:1,repeat:Infinity}}
          />
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#fff", marginRight:8 }}>{cfg.text}</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{cfg.sub}</span>
          </div>
          {state === "offline" && (
            <button
              onClick={() => window.location.reload()}
              style={{ padding:"4px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.7)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              Retry
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
