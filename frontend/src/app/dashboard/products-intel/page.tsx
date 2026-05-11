"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Link2, Zap, Loader2, Plus, Globe } from "lucide-react";
import toast from "react-hot-toast";
const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };
export default function ProductsIntelPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = { card:isDark?"#181230":"#fff", border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)", text:isDark?"#F0ECFF":"#130D2E", muted:isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)", faint:isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)" };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const analyse = async () => {
    if (!url||loading) return;
    setLoading(true); setResult(null);
    try {
      const r = await api.post("/kai/smart-chat", { message: `Analyse this product URL and give me a complete dropshipping intelligence report: ${url}. Include: 1) Estimated supplier cost 2) Recommended selling price in Nigeria 3) Target customer profile 4) Best platforms to sell (TikTok/Instagram/etc) 5) Key selling points 6) Potential issues/risks. Format with clear sections.`, storeId });
      setResult({ analysis: r.data?.data?.reply||r.data?.reply||"Analysis complete", url });
    } catch { toast.error("KIRO offline"); }
    setLoading(false);
  };
  const importProduct = async () => {
    try {
      await api.post(`/products/intel/import/${storeId}`, { url });
      toast.success("Product import started! Check your products page.");
    } catch { toast.error("Import failed"); }
  };
  return (
    <div style={{maxWidth:800,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Product Intelligence</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>Paste any AliExpress, CJ, or Zendrop URL — KIRO analyses and imports it</p>
      </motion.div>
      <div style={{display:"flex",gap:10,marginBottom:result?20:0}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderRadius:14,background:t.card,border:`1px solid ${t.border}`}}>
          <Link2 size={15} style={{color:t.muted,flexShrink:0}}/>
          <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyse()} placeholder="https://aliexpress.com/item/..." style={{flex:1,background:"transparent",border:"none",outline:"none",color:t.text,fontSize:13,fontFamily:"inherit"}}/>
        </div>
        <button onClick={analyse} disabled={!url||loading} style={{padding:"11px 20px",borderRadius:14,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:url&&!loading?"pointer":"not-allowed",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8,flexShrink:0,opacity:!url||loading?0.6:1}}>
          {loading?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Zap size={14}/>}
          {loading?"Analysing...":"Analyse"}
        </button>
      </div>
      {!result&&!loading&&(
        <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {["AliExpress","CJ Dropshipping","Zendrop"].map((s,i)=>(
            <div key={i} style={{padding:"12px 14px",borderRadius:12,background:t.faint,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:8}}>
              <Globe size={13} color={V.v400}/><span style={{fontSize:12,fontWeight:600,color:t.muted}}>{s}</span>
            </div>
          ))}
        </div>
      )}
      {loading&&<div style={{marginTop:20,padding:"60px 20px",textAlign:"center",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}><Loader2 size={28} style={{color:V.v400,margin:"0 auto 12px",animation:"spin 1s linear infinite"}}/><p style={{fontSize:13,color:t.muted,margin:0}}>KIRO is analysing the product...</p></div>}
      {result&&(
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{marginTop:20}}>
          <div style={{padding:20,borderRadius:16,background:t.card,border:`1px solid ${t.border}`,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:8,background:"rgba(107,53,232,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={13} color={V.v400}/></div><span style={{fontSize:13,fontWeight:700,color:t.text}}>Product Analysis</span></div>
              <button onClick={importProduct} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",color:"#fff",fontSize:12,fontWeight:700}}>
                <Plus size={12}/> Import to Store
              </button>
            </div>
            <p style={{fontSize:13,lineHeight:1.75,color:t.muted,whiteSpace:"pre-wrap",margin:0}}>{result.analysis}</p>
          </div>
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
