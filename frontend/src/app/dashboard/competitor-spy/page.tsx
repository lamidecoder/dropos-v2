"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { useKiroStream } from "../../../hooks/useKiroStream";
import { Search, Globe, TrendingUp, StopCircle, Copy, Check, Zap } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

const QUICK_SPIES = [
  { label:"Jumia Nigeria",   prompt:"Analyse Jumia Nigeria right now. What are their top selling categories? What products are flying off the shelf? What prices are they using? How can I compete or undercut them as a dropshipper?" },
  { label:"Konga Nigeria",   prompt:"Analyse Konga Nigeria's current catalogue and strategy. What are they doing well? What gaps exist that a dropshipping store can fill? What products are trending on their platform?" },
  { label:"AliExpress top",  prompt:"What are the top trending products on AliExpress Nigeria category right now? Which ones have the best dropshipping margin? Which are being heavily bought by Nigerian resellers currently?" },
  { label:"Jiji sellers",    prompt:"What products are the most successful Jiji.ng sellers in Nigeria listing right now? What prices are they using? What can I learn from their product listings and descriptions?" },
];

export default function CompetitorSpyPage() {
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
  const [copied, setCopied] = useState(false);

  const analyse = (prompt?: string) => {
    if (loading) { stop(); return; }
    clear();
    const msg = prompt || (url
      ? `Analyze this competitor store or product URL and give me complete intelligence I can use to win: ${url}. Cover: 1) What they sell and price range 2) Their strengths 3) Their weaknesses 4) Products I should add to compete 5) How to take their customers 6) Exact ad copy angle to beat them.`
      : "");
    if (!msg) { toast.error("Enter a URL or pick a quick spy"); return; }
    run(msg);
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth:860, margin:"0 auto" }}>
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Competitor Spy</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>KIRO analyses any competitor or marketplace and tells you exactly how to beat them</p>
      </motion.div>

      {/* Quick spies */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
        {QUICK_SPIES.map(q => (
          <button key={q.label} onClick={() => { clear(); run(q.prompt); }}
            style={{ padding:"7px 16px", borderRadius:99, border:`1px solid ${t.border}`, background:t.card, color:t.text, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
            <Globe size={11} color={V.v400}/> {q.label}
          </button>
        ))}
      </div>

      {/* URL input */}
      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:14, border:`1px solid ${t.border}`, background:t.input }}>
          <Search size={14} style={{ color:t.muted, flexShrink:0 }}/>
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key==="Enter" && analyse()}
            placeholder="Paste competitor URL (e.g. jumia.com.ng/product/...)"
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:t.text, fontFamily:"inherit" }}/>
        </div>
        <button onClick={() => analyse()} disabled={!url && !loading}
          style={{ padding:"11px 24px", borderRadius:14, border:"none", background:loading?"rgba(239,68,68,0.1)":`linear-gradient(135deg,${V.v500},#3D1C8A)`, color:loading?"#F87171":"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit" }}>
          {loading ? <><StopCircle size={13}/> Stop</> : <><TrendingUp size={13}/> Spy</>}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {(text || loading) && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            style={{ padding:24, borderRadius:20, background:t.card, border:`1px solid ${t.border}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Zap size={13} color="#fff" fill="#fff"/>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:t.text }}>Competitor Intelligence</span>
              </div>
              {text && (
                <button onClick={copy} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", color:t.muted, fontSize:11, fontWeight:700 }}>
                  {copied ? <Check size={11}/> : <Copy size={11}/>} {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            {loading && !text ? (
              <div style={{ display:"flex", alignItems:"center", gap:8, color:t.muted }}>
                <span style={{ display:"flex", gap:3 }}>
                  {[0,1,2].map(i => (
                    <motion.span key={i} style={{ width:5, height:5, borderRadius:"50%", background:V.v400, display:"block" }}
                      animate={{ y:[0,-4,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }}/>
                  ))}
                </span>
                <span style={{ fontSize:13 }}>KIRO is researching...</span>
              </div>
            ) : (
              <p style={{ fontSize:13, lineHeight:1.8, color:t.muted, whiteSpace:"pre-wrap", margin:0 }}>
                {text}{loading && <motion.span animate={{ opacity:[1,0] }} transition={{ duration:0.5, repeat:Infinity }}>▋</motion.span>}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p style={{ fontSize:13, color:"#F87171", marginTop:12 }}>⚠️ {error}</p>}
    </div>
  );
}
