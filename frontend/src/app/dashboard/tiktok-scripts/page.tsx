"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Video, Zap, Copy, Check, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

const HOOKS = ["POV:", "Tell me why", "Wait for it...", "The secret nobody tells you about", "Stop scrolling if you", "This changed my life:", "I tried it so you don't have to"];
const STYLES = [
  { id:"viral",    label:"Viral Hook",   emoji:"🔥", desc:"Scroll-stopping opener" },
  { id:"tutorial", label:"Tutorial",     emoji:"📚", desc:"How to use it" },
  { id:"review",   label:"Review",       emoji:"⭐", desc:"Honest take" },
  { id:"unboxing", label:"Unboxing",     emoji:"📦", desc:"First reaction" },
  { id:"problem",  label:"Problem/Solution", emoji:"💡", desc:"Pain point story" },
];

export default function TikTokScriptsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    input: isDark?"rgba(255,255,255,0.05)":"#F5F3FF",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [style, setStyle] = useState("viral");
  const [product, setProduct] = useState("");
  const [scripts, setScripts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number|null>(null);

  const { data: products } = useQuery({
    queryKey: ["products-list", storeId],
    queryFn: () => api.get(`/products/${storeId}?limit=20`).then(r => r.data.data?.products || r.data.data || []),
    enabled: !!storeId,
  });

  const generate = async () => {
    if (!product || loading) return;
    setLoading(true);
    setScripts([]);
    try {
      const sel = STYLES.find(s => s.id === style);
      const r = await api.post("/kai/smart-chat", {
        message: `Write 3 different TikTok scripts for this product: "${product}". Style: ${sel?.label} (${sel?.desc}). Each script should be 15-30 seconds when spoken (about 60-80 words). Format each as:
SCRIPT 1:
[Hook line]
[Body - 3-4 sentences]
[CTA]

SCRIPT 2:
...

SCRIPT 3:
...`,
        storeId,
      });
      const reply = r.data?.data?.reply || r.data?.reply || "";
      const parts = reply.split(/SCRIPT \d+:/i).filter((s: string) => s.trim().length > 20);
      setScripts(parts.length >= 2 ? parts : [reply]);
      toast.success(`${parts.length || 1} scripts generated`);
    } catch { toast.error("KIRO offline — check API key"); }
    setLoading(false);
  };

  const copy = (i: number) => {
    navigator.clipboard.writeText(scripts[i]);
    setCopied(i); toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const };

  return (
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>TikTok Scripts</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>KIRO writes viral scripts for your products in seconds</p>
      </motion.div>

      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16,alignItems:"start"}}>
        {/* Controls */}
        <motion.div initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} style={{padding:18,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
          <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:t.muted,margin:"0 0 12px"}}>Product</p>
          <select value={product} onChange={e=>setProduct(e.target.value)} style={{...inp,marginBottom:16}}>
            <option value="">Select a product...</option>
            {(products||[]).map((p:any) => <option key={p.id} value={p.name}>{p.name}</option>)}
            <option value="custom">Enter manually ↓</option>
          </select>
          {(product==="custom"||!products?.length) && (
            <input value={product==="custom"?"":product} onChange={e=>setProduct(e.target.value)}
              placeholder="e.g. Brazilian Hair Bundle" style={{...inp,marginBottom:16}}/>
          )}

          <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:t.muted,margin:"0 0 10px"}}>Script Style</p>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
            {STYLES.map(s=>(
              <button key={s.id} onClick={()=>setStyle(s.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:`1px solid ${style===s.id?"rgba(107,53,232,0.4)":t.border}`,background:style===s.id?"rgba(107,53,232,0.08)":t.faint,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:16,flexShrink:0}}>{s.emoji}</span>
                <div>
                  <p style={{fontSize:12,fontWeight:700,color:style===s.id?V.v300:t.text,margin:0}}>{s.label}</p>
                  <p style={{fontSize:11,color:t.muted,margin:0}}>{s.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button onClick={generate} disabled={!product||product==="custom"||loading}
            style={{width:"100%",padding:"11px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,cursor:product&&!loading?"pointer":"not-allowed",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:!product||product==="custom"?0.5:1}}>
            {loading?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Zap size={14}/>}
            {loading?"Writing scripts...":"Generate Scripts"}
          </button>
        </motion.div>

        {/* Scripts */}
        <div>
          {scripts.length===0 && !loading && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              style={{padding:"60px 20px",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`,textAlign:"center"}}>
              <Video size={36} style={{color:t.muted,margin:"0 auto 12px"}}/>
              <p style={{fontWeight:700,fontSize:15,color:t.text,margin:"0 0 6px"}}>Select a product and hit Generate</p>
              <p style={{fontSize:13,color:t.muted,margin:0}}>KIRO will write 3 different TikTok scripts you can film today</p>
            </motion.div>
          )}
          {loading && (
            <div style={{padding:"60px 20px",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`,textAlign:"center"}}>
              <Loader2 size={28} style={{color:V.v400,margin:"0 auto 12px",animation:"spin 1s linear infinite"}}/>
              <p style={{fontSize:13,color:t.muted,margin:0}}>KIRO is writing your scripts...</p>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {scripts.map((s,i)=>(
              <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                style={{padding:18,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <span style={{fontSize:12,fontWeight:700,color:V.v400,background:"rgba(107,53,232,0.1)",padding:"3px 10px",borderRadius:99}}>Script {i+1}</span>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>generate()} style={{width:28,height:28,borderRadius:8,border:`1px solid ${t.border}`,background:t.faint,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <RefreshCw size={12} style={{color:t.muted}}/>
                    </button>
                    <button onClick={()=>copy(i)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${t.border}`,background:t.faint,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {copied===i?<Check size={12} color="#10B981"/>:<Copy size={12} style={{color:t.muted}}/>}
                    </button>
                  </div>
                </div>
                <p style={{fontSize:13,lineHeight:1.7,color:t.text,whiteSpace:"pre-wrap",margin:0}}>{s.trim()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
