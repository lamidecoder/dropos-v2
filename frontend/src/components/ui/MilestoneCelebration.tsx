"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";
import Link from "next/link";
import { Zap, ArrowRight, X } from "lucide-react";

interface Milestone {
  id:      string;
  type:    "first_sale" | "orders_10" | "revenue_100k" | "revenue_1m" | "first_product" | "store_complete";
  title:   string;
  message: string;
  cta?:    { label: string; href: string };
  seen:    boolean;
}

const MILESTONE_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  first_sale:      { emoji:"🎉", color:"#10B981", bg:"linear-gradient(135deg,#10B981,#059669)"  },
  orders_10:       { emoji:"🚀", color:"#8B5CF6", bg:"linear-gradient(135deg,#6B35E8,#3D1C8A)"  },
  revenue_100k:    { emoji:"💰", color:"#F59E0B", bg:"linear-gradient(135deg,#F59E0B,#D97706)"  },
  revenue_1m:      { emoji:"👑", color:"#EC4899", bg:"linear-gradient(135deg,#EC4899,#BE185D)"  },
  first_product:   { emoji:"📦", color:"#06B6D4", bg:"linear-gradient(135deg,#06B6D4,#0891B2)"  },
  store_complete:  { emoji:"🏪", color:"#8B5CF6", bg:"linear-gradient(135deg,#6B35E8,#3D1C8A)"  },
};

function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x:  Math.random() * 100,
    color: ["#8B5CF6","#10B981","#F59E0B","#EC4899","#06B6D4"][i % 5],
    delay: Math.random() * 0.5,
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));

  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {pieces.map(p => (
        <motion.div key={p.id}
          initial={{ x:`${p.x}%`, y:"-10%", rotate:p.rotation, opacity:1 }}
          animate={{ y:"110%", rotate:p.rotation + 360 * 2, opacity:[1,1,0] }}
          transition={{ duration:2.5 + Math.random(), delay:p.delay, ease:"easeIn" }}
          style={{ position:"absolute", width:p.size, height:p.size, borderRadius:2, background:p.color }}
        />
      ))}
    </div>
  );
}

export default function MilestoneCelebration() {
  const user     = useAuthStore(s => s.user);
  const storeId  = user?.stores?.[0]?.id;
  const [current, setCurrent] = useState<Milestone | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data } = useQuery({
    queryKey:      ["milestones", storeId],
    queryFn:       () => api.get(`/milestones/${storeId}`).then(r => r.data.data || []),
    enabled:       !!storeId,
    refetchInterval: 60000,
  });

  useEffect(() => {
    const milestones: Milestone[] = data || [];
    const unseen = milestones.find(m => !m.seen && !dismissed.includes(m.id));
    setCurrent(unseen || null);
  }, [data, dismissed]);

  const dismiss = async () => {
    if (!current) return;
    setDismissed(d => [...d, current.id]);
    setCurrent(null);
    try { await api.patch(`/milestones/${current.id}/seen`, {}); } catch {}
  };

  if (!current) return null;

  const config = MILESTONE_CONFIG[current.type] || MILESTONE_CONFIG.first_sale;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        style={{ position:"fixed", inset:0, zIndex:9995, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)" }}>

        <motion.div initial={{ opacity:0, scale:0.85, y:32 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:16 }}
          transition={{ type:"spring", stiffness:280, damping:26 }}
          style={{ position:"relative", width:"100%", maxWidth:400, borderRadius:28, overflow:"hidden", background:"#0D0918", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }}>

          <Confetti />

          {/* Header gradient */}
          <div style={{ height:6, background:config.bg }}/>

          <div style={{ padding:"32px 28px 28px", textAlign:"center", position:"relative", zIndex:1 }}>
            {/* Dismiss */}
            <button onClick={dismiss}
              style={{ position:"absolute", top:16, right:16, width:30, height:30, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.06)", cursor:"pointer", color:"rgba(255,255,255,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={14}/>
            </button>

            {/* Emoji */}
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:300, delay:0.2 }}
              style={{ fontSize:64, marginBottom:20, lineHeight:1, display:"block" }}>
              {config.emoji}
            </motion.div>

            {/* KIRO badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, background:"rgba(107,53,232,0.15)", border:"1px solid rgba(107,53,232,0.25)", marginBottom:16 }}>
              <Zap size={11} color="#A78BFA"/>
              <span style={{ fontSize:11, fontWeight:700, color:"#A78BFA" }}>KIRO</span>
            </div>

            <h2 style={{ fontSize:22, fontWeight:900, letterSpacing:"-1px", color:"#fff", marginBottom:10 }}>
              {current.title}
            </h2>
            <p style={{ fontSize:14, lineHeight:1.65, color:"rgba(255,255,255,0.55)", marginBottom:24 }}>
              {current.message}
            </p>

            {current.cta ? (
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <Link href={current.cta.href}>
                  <button onClick={dismiss} style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 22px", borderRadius:14, border:"none", background:config.bg, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                    {current.cta.label} <ArrowRight size={14}/>
                  </button>
                </Link>
                <button onClick={dismiss} style={{ padding:"11px 22px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:13, cursor:"pointer" }}>
                  Close
                </button>
              </div>
            ) : (
              <button onClick={dismiss} style={{ padding:"11px 28px", borderRadius:14, border:"none", background:config.bg, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Keep going
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
