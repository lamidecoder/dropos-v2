"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Zap, Brain, BarChart2, Package, ShoppingCart, MessageSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };
const POWERS = [
  { id:"audit",     icon:"🔍", label:"Full Store Audit",      prompt:"Do a full audit of my store. Check products, pricing, inventory, recent orders, and give me the top 5 things to fix today with specific actions." },
  { id:"strategy",  icon:"🎯", label:"30-Day Growth Plan",    prompt:"Create a detailed 30-day growth plan for my store. Include daily/weekly actions for marketing, product sourcing, pricing, and customer retention." },
  { id:"products",  icon:"📦", label:"Product Recommendations",prompt:"Based on my current store and Nigerian market trends, recommend 10 specific products I should add. Include estimated margins and sourcing links." },
  { id:"pricing",   icon:"💰", label:"Pricing Optimiser",     prompt:"Analyse my current product pricing and recommend optimal prices for each. Consider Nigerian market psychology and competitor pricing." },
  { id:"marketing", icon:"📣", label:"Marketing Playbook",    prompt:"Write a complete marketing playbook for my store: best platforms, content strategy, posting schedule, ad budget recommendations, and copy templates." },
  { id:"recovery",  icon:"🔄", label:"Revenue Recovery",      prompt:"Find every revenue leak in my store and tell me exactly how to fix it. Check abandoned carts, inactive customers, underpriced products, and missed opportunities." },
];
export default function KaiPowerPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = { card:isDark?"#181230":"#fff", border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)", text:isDark?"#F0ECFF":"#130D2E", muted:isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)", faint:isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)" };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [active, setActive] = useState<string|null>(null);
  const [result, setResult] = useState<{id:string,text:string}|null>(null);
  const [loading, setLoading] = useState(false);
  const run = async (power: typeof POWERS[0]) => {
    setActive(power.id); setLoading(true); setResult(null);
    try {
      const r = await api.post("/kai/smart-chat", { message: power.prompt, storeId });
      setResult({ id: power.id, text: r.data?.data?.reply||r.data?.reply||"Done" });
    } catch { toast.error("KIRO offline — add ANTHROPIC_API_KEY to Render"); }
    setLoading(false);
  };
  return (
    <div style={{maxWidth:1000,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:99,background:"rgba(107,53,232,0.1)",border:"1px solid rgba(107,53,232,0.2)",marginBottom:12}}>
          <Zap size={12} color={V.v400}/><span style={{fontSize:12,fontWeight:700,color:V.v300}}>KIRO Power Mode</span>
        </div>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Deep Intelligence</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>Full-depth KIRO analysis — each takes 30-60 seconds but gives you real business intelligence</p>
      </motion.div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:result?20:0}}>
        {POWERS.map((p,i)=>(
          <motion.div key={p.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            onClick={()=>!loading&&run(p)} style={{padding:18,borderRadius:16,background:active===p.id?`rgba(107,53,232,0.1)`:t.card,border:`1px solid ${active===p.id?"rgba(107,53,232,0.35)":t.border}`,cursor:loading?"not-allowed":"pointer",transition:"all 0.2s"}}>
            <div style={{fontSize:28,marginBottom:12}}>{p.icon}</div>
            <p style={{fontSize:13,fontWeight:700,color:active===p.id?V.v300:t.text,margin:"0 0 6px"}}>{p.label}</p>
            {active===p.id&&loading ? (
              <div style={{display:"flex",alignItems:"center",gap:6}}><Loader2 size={11} style={{color:V.v400,animation:"spin 1s linear infinite"}}/><span style={{fontSize:11,color:V.v400}}>Thinking...</span></div>
            ) : (
              <p style={{fontSize:11,color:t.muted,margin:0,lineHeight:1.4}}>{p.prompt.slice(0,60)}...</p>
            )}
          </motion.div>
        ))}
      </div>
      {result&&(
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{padding:20,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <div style={{width:28,height:28,borderRadius:8,background:"rgba(107,53,232,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={13} color={V.v400}/></div>
            <span style={{fontSize:13,fontWeight:700,color:t.text}}>{POWERS.find(p=>p.id===result.id)?.label}</span>
          </div>
          <p style={{fontSize:13,lineHeight:1.75,color:t.muted,whiteSpace:"pre-wrap",margin:0}}>{result.text}</p>
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
