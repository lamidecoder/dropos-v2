"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Search, Zap, Loader2, Globe, TrendingUp, DollarSign, Package } from "lucide-react";
import toast from "react-hot-toast";
const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B" };
export default function CompetitorSpyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = { card:isDark?"#181230":"#fff", border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)", text:isDark?"#F0ECFF":"#130D2E", muted:isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)", faint:isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)", input:isDark?"rgba(255,255,255,0.05)":"#F0EDFF" };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const analyze = async () => {
    if (!url||loading) return;
    setLoading(true); setResult(null);
    try {
      const r = await api.post("/kai/smart-chat", { message: `Analyze this competitor store and give me actionable intelligence: ${url}. Cover: 1) What products they sell and estimated price range 2) What I should copy or do differently 3) Specific gaps I can exploit 4) Recommended products to add to compete. Be specific and actionable.`, storeId });
      setResult(r.data?.data?.reply||r.data?.reply||"Analysis complete");
    } catch { toast.error("KIRO offline"); }
    setLoading(false);
  };
  return (
    <div style={{maxWidth:800,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Competitor Spy</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>Paste any competitor URL — KIRO analyses and tells you exactly what to do</p>
      </motion.div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderRadius:14,background:t.card,border:`1px solid ${t.border}`}}>
          <Globe size={15} style={{color:t.muted,flexShrink:0}}/>
          <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyze()} placeholder="https://competitor-store.com" style={{flex:1,background:"transparent",border:"none",outline:"none",color:t.text,fontSize:13,fontFamily:"inherit"}}/>
        </div>
        <button onClick={analyze} disabled={!url||loading} style={{padding:"11px 22px",borderRadius:14,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:url&&!loading?"pointer":"not-allowed",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8,flexShrink:0,opacity:!url||loading?0.6:1}}>
          {loading?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Search size={14}/>}
          {loading?"Analysing...":"Analyse"}
        </button>
      </div>
      {!result&&!loading&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[{emoji:"📊",title:"Price gaps",desc:"Find where they overprice and undercut them"},{emoji:"🏆",title:"Top products",desc:"See what sells best on their store"},{emoji:"💡",title:"Strategy",desc:"Get a personalised action plan from KIRO"}].map((c,i)=>(
            <div key={i} style={{padding:16,borderRadius:14,background:t.faint,border:`1px solid ${t.border}`,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>{c.emoji}</div>
              <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 4px"}}>{c.title}</p>
              <p style={{fontSize:12,color:t.muted,margin:0,lineHeight:1.4}}>{c.desc}</p>
            </div>
          ))}
        </div>
      )}
      {loading&&<div style={{padding:"60px 20px",textAlign:"center",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}><Loader2 size={28} style={{color:V.v400,margin:"0 auto 12px",animation:"spin 1s linear infinite"}}/><p style={{fontSize:13,color:t.muted,margin:0}}>KIRO is analysing the store...</p></div>}
      {result&&(
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{padding:20,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <div style={{width:28,height:28,borderRadius:8,background:"rgba(107,53,232,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={13} color={V.v400}/></div>
            <span style={{fontSize:13,fontWeight:700,color:t.text}}>KIRO Intelligence Report</span>
          </div>
          <p style={{fontSize:13,lineHeight:1.75,color:t.muted,whiteSpace:"pre-wrap",margin:0}}>{result}</p>
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
