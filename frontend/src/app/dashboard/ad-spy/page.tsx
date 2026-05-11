"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Eye, Zap, Loader2, TrendingUp, DollarSign, Target } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B" };

const PLATFORMS = [
  { id:"tiktok",    label:"TikTok",    emoji:"🎵", color:"#FF0050" },
  { id:"instagram", label:"Instagram", emoji:"📸", color:"#E1306C" },
  { id:"facebook",  label:"Facebook",  emoji:"👥", color:"#1877F2" },
  { id:"twitter",   label:"Twitter/X", emoji:"🐦", color:"#1DA1F2" },
];

export default function AdSpyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [result, setResult] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const analyse = async () => {
    if (!niche || loading) return;
    setLoading(true); setResult(null);
    try {
      const plat = PLATFORMS.find(p => p.id === platform);
      const r = await api.post("/kai/smart-chat", {
        message: `You are an expert dropshipping ad spy analyst. For the niche "${niche}" on ${plat?.label}, give me:

1. **Top 5 winning ad angles** currently working in this niche
2. **Best hooks** (first 3 seconds) that stop the scroll
3. **Winning product types** in this niche right now
4. **Ad copy frameworks** that convert best
5. **Targeting suggestions** (age, interests, behaviours)
6. **Estimated CPM and CPC** benchmarks for Nigerian audience

Be specific with examples. Format clearly with sections.`,
        storeId,
      });
      setResult(r.data?.data?.reply || r.data?.reply || "Analysis complete");
    } catch { toast.error("KIRO offline — add ANTHROPIC_API_KEY to Render env"); }
    setLoading(false);
  };

  const inp = {
    flex: 1, padding: "11px 16px", borderRadius: 12,
    border: `1px solid ${t.border}`, background: isDark ? "rgba(255,255,255,0.05)" : "#F5F3FF",
    color: t.text, fontSize: 13, outline: "none", fontFamily: "inherit",
  } as const;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Ad Spy</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>KIRO reverse-engineers winning ads in any niche for you</p>
      </motion.div>

      {/* Platform picker */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setPlatform(p.id)}
            style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:12,border:`1px solid ${platform===p.id?p.color+"60":t.border}`,background:platform===p.id?p.color+"12":"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:platform===p.id?p.color:t.muted}}>
            <span>{p.emoji}</span> {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <input value={niche} onChange={e=>setNiche(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyse()}
          placeholder="Enter niche (e.g. hair extensions, smart watches, skincare)"
          style={inp}/>
        <button onClick={analyse} disabled={!niche||loading}
          style={{padding:"11px 22px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:niche&&!loading?"pointer":"not-allowed",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8,flexShrink:0,opacity:!niche||loading?0.6:1}}>
          {loading ? <Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> : <Eye size={14}/>}
          {loading ? "Spying..." : "Spy"}
        </button>
      </div>

      {/* Info cards when empty */}
      {!result && !loading && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[
            {emoji:"🎯",title:"Winning angles",desc:"See what message converts in your niche right now"},
            {emoji:"✍️",title:"Copy frameworks",desc:"Get the exact hooks and CTAs that work"},
            {emoji:"💰",title:"Budget benchmarks",desc:"Know what to spend before your first ad"},
          ].map((c,i) => (
            <div key={i} style={{padding:16,borderRadius:14,background:t.faint,border:`1px solid ${t.border}`,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>{c.emoji}</div>
              <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 4px"}}>{c.title}</p>
              <p style={{fontSize:12,color:t.muted,margin:0,lineHeight:1.4}}>{c.desc}</p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{padding:"60px 20px",textAlign:"center",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}>
          <Loader2 size={28} style={{color:V.v400,margin:"0 auto 12px",animation:"spin 1s linear infinite"}}/>
          <p style={{fontSize:13,color:t.muted,margin:0}}>KIRO is analysing winning ads in the {niche} niche...</p>
        </div>
      )}

      {result && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
          style={{padding:20,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <div style={{width:28,height:28,borderRadius:8,background:"rgba(107,53,232,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Zap size={13} color={V.v400}/>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:t.text}}>Ad Intelligence — {niche} on {PLATFORMS.find(p=>p.id===platform)?.label}</span>
          </div>
          <p style={{fontSize:13,lineHeight:1.8,color:t.muted,whiteSpace:"pre-wrap",margin:0}}>{result}</p>
          <button onClick={analyse} style={{marginTop:16,display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,border:`1px solid ${t.border}`,background:t.faint,cursor:"pointer",color:t.muted,fontSize:12,fontWeight:600}}>
            <Loader2 size={11}/> Refresh analysis
          </button>
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
