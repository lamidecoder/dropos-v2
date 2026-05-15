"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight:"100vh", background:"#07050F", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Plus Jakarta Sans',system-ui", padding:"20px" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:600, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(107,53,232,0.12),transparent 70%)", filter:"blur(60px)" }}/>
      </div>
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6}} style={{ textAlign:"center", position:"relative", zIndex:1, maxWidth:480 }}>
        {/* KIRO Icon */}
        <div style={{ width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 16px 40px rgba(107,53,232,0.4)" }}>
          <span style={{ fontSize:32 }}>⚡</span>
        </div>
        <p style={{ fontSize:12, fontWeight:700, color:"#8B5CF6", letterSpacing:"0.15em", margin:"0 0 12px", textTransform:"uppercase" }}>KIRO · Page Not Found</p>
        <h1 style={{ fontSize:"clamp(40px,8vw,72px)", fontWeight:900, color:"#fff", letterSpacing:"-0.05em", margin:"0 0 16px", lineHeight:1 }}>404</h1>
        <p style={{ fontSize:"clamp(15px,2vw,18px)", color:"rgba(255,255,255,0.5)", lineHeight:1.7, margin:"0 0 32px" }}>
          This page doesn't exist. KIRO searched the entire platform and found nothing here.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/dashboard" style={{ padding:"12px 28px", borderRadius:14, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", fontSize:14, fontWeight:700, textDecoration:"none", boxShadow:"0 8px 24px rgba(107,53,232,0.35)" }}>
            Back to Dashboard →
          </Link>
          <Link href="/dashboard/kiro" style={{ padding:"12px 28px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:600, textDecoration:"none" }}>
            Ask KIRO
          </Link>
        </div>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:40 }}>DropOS · droposhq.com</p>
      </motion.div>
    </div>
  );
}
