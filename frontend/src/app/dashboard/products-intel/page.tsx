"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { useKiroStream } from "../../../hooks/useKiroStream";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { Link2, Package, Zap, StopCircle, Plus, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981" };

export default function ProductsIntelPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:  isDark?"#181230":"#fff", border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text:  isDark?"#F0ECFF":"#130D2E", muted:isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    input: isDark?"rgba(255,255,255,0.05)":"#F0EDFF",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id || "");
  const { text, loading, error, run, stop, clear } = useKiroStream(storeId);
  const [url, setUrl] = useState("");
  const qc = useQueryClient();

  const importMut = useMutation({
    mutationFn: (data: { url:string, storeId:string }) =>
      api.post("/intel/bulk-import", data).then(r => r.data.data),
    onSuccess: (data) => {
      toast.success(`${data.products?.length || 0} products found — review and import`);
    },
    onError: (e:any) => toast.error(e.response?.data?.message || "Import failed"),
  });

  const analyse = () => {
    if (!url) { toast.error("Enter a product URL"); return; }
    if (loading) { stop(); return; }
    clear();
    run(`Analyse this product URL and give me a complete dropshipping intelligence report: ${url}

Include:
1. Product name and what it actually is
2. Estimated supplier cost (AliExpress/CJ Dropshipping)
3. Recommended selling price in Nigeria (₦) — consider market, competition, margin
4. Target customer profile — who in Nigeria buys this?
5. Best platforms: TikTok, Instagram, WhatsApp, or Facebook? Why?
6. Key selling points for Nigerian buyers specifically
7. Potential issues or risks
8. Ready-to-use product description for my store
9. Instagram/TikTok caption for this product

End with a clear GO or NO-GO recommendation.`);
  };

  const TRENDING = [
    { name:"Maxi Dress Set",        price:"₦8,500",  margin:"60%", hot:true  },
    { name:"Wireless Earbuds",      price:"₦12,000", margin:"45%", hot:true  },
    { name:"Hair Growth Oil",       price:"₦6,500",  margin:"70%", hot:true  },
    { name:"Men Native Set",        price:"₦15,000", margin:"55%", hot:false },
    { name:"Air Fryer 3.5L",        price:"₦28,000", margin:"40%", hot:false },
    { name:"Posture Corrector",     price:"₦9,000",  margin:"65%", hot:true  },
  ];

  return (
    <div style={{ maxWidth:860, margin:"0 auto" }}>
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Product Intelligence</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>Paste any product URL — KIRO gives you pricing, margin, and a ready-to-post listing</p>
      </motion.div>

      {/* URL input */}
      <div style={{ display:"flex", gap:10, marginBottom:28 }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:14, border:`1px solid ${t.border}`, background:t.input }}>
          <Link2 size={14} style={{ color:t.muted, flexShrink:0 }}/>
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key==="Enter" && analyse()}
            placeholder="Paste AliExpress, Amazon, Shein, or any product URL..."
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:t.text, fontFamily:"inherit" }}/>
        </div>
        <button onClick={analyse}
          style={{ padding:"11px 22px", borderRadius:14, border:"none", background:loading?"rgba(239,68,68,0.1)":`linear-gradient(135deg,${V.v500},#3D1C8A)`, color:loading?"#F87171":"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit" }}>
          {loading ? <><StopCircle size={13}/> Stop</> : <><Zap size={13}/> Analyse</>}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {(text || loading) && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            style={{ padding:24, borderRadius:20, background:t.card, border:`1px solid ${t.border}`, marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <Zap size={14} color={V.v400} fill={V.v400}/>
              <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Product Intelligence Report</span>
            </div>
            {loading && !text ? (
              <div style={{ display:"flex", alignItems:"center", gap:8, color:t.muted }}>
                <span style={{ display:"flex", gap:3 }}>
                  {[0,1,2].map(i => (
                    <motion.span key={i} style={{ width:5, height:5, borderRadius:"50%", background:V.v400, display:"block" }}
                      animate={{ y:[0,-4,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }}/>
                  ))}
                </span>
                <span style={{ fontSize:13 }}>Researching product...</span>
              </div>
            ) : (
              <p style={{ fontSize:13, lineHeight:1.8, color:t.muted, whiteSpace:"pre-wrap", margin:0 }}>
                {text}{loading && <motion.span animate={{ opacity:[1,0] }} transition={{ duration:0.5, repeat:Infinity }}>▋</motion.span>}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trending now */}
      <div>
        <p style={{ fontSize:12, fontWeight:700, color:t.muted, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 14px" }}>🔥 Trending in Nigeria Right Now</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
          {TRENDING.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
              style={{ padding:14, borderRadius:14, background:t.card, border:`1px solid ${p.hot?"rgba(239,68,68,0.2)":t.border}`, cursor:"pointer" }}
              onClick={() => { setUrl(`Analyse this: ${p.name} for Nigerian dropshipping market`); }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <Package size={14} style={{ color:t.muted }}/>
                {p.hot && <span style={{ fontSize:9, fontWeight:700, color:"#EF4444", background:"rgba(239,68,68,0.1)", padding:"2px 6px", borderRadius:99 }}>🔥 HOT</span>}
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 3px" }}>{p.name}</p>
              <p style={{ fontSize:12, color:t.muted, margin:0 }}>{p.price} · {p.margin} margin</p>
            </motion.div>
          ))}
        </div>
      </div>
      {error && <p style={{ fontSize:13, color:"#F87171", marginTop:12 }}>⚠️ {error}</p>}
    </div>
  );
}
