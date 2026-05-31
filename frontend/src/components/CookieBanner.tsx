"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("dropos-cookie-consent");
      if (!consent) setShow(true);
    } catch { setShow(true); }
  }, []);

  const accept = (all: boolean) => {
    try {
      localStorage.setItem("dropos-cookie-consent", JSON.stringify({
        essential: true,
        analytics: all,
        marketing: all,
      }));
    } catch {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            zIndex: 9999, width: "min(520px, calc(100vw - 32px))",
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(107,53,232,0.12)",
            boxShadow: "0 8px 40px rgba(19,13,46,0.12), 0 2px 8px rgba(19,13,46,0.06)",
            padding: "20px 20px 16px",
            fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
          }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"rgba(107,53,232,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Cookie size={16} color="#6B35E8"/>
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#130D2E", margin:"0 0 4px" }}>
                We use cookies
              </p>
              <p style={{ fontSize:12.5, color:"rgba(19,13,46,0.55)", margin:0, lineHeight:1.55 }}>
                Essential cookies keep the platform working. We also use optional analytics cookies to improve DropOS.{" "}
                <Link href="/cookies" style={{ color:"#6B35E8", fontWeight:600, textDecoration:"none" }}>
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={() => accept(true)}
              style={{ flex:1, minWidth:140, padding:"10px 0", borderRadius:10, border:"none", cursor:"pointer", background:"#130D2E", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
              Accept all
            </button>
            <button onClick={() => accept(false)}
              style={{ flex:1, minWidth:120, padding:"10px 0", borderRadius:10, border:"1px solid rgba(107,53,232,0.15)", cursor:"pointer", background:"transparent", color:"rgba(19,13,46,0.6)", fontSize:13, fontWeight:600, fontFamily:"inherit" }}>
              Essential only
            </button>
            <Link href="/cookies"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"10px 16px", borderRadius:10, border:"1px solid rgba(107,53,232,0.12)", color:"#6B35E8", fontSize:12, fontWeight:600, textDecoration:"none", whiteSpace:"nowrap" }}>
              Manage
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
