"use client";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { Zap, ArrowRight, MousePointer, Eye, Clock } from "lucide-react";
import Link from "next/link";
const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };
export default function ReplayPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = { card:isDark?"#181230":"#fff", border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)", text:isDark?"#F0ECFF":"#130D2E", muted:isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)", faint:isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)" };
  return (
    <div style={{maxWidth:800,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Session Replay</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>Watch exactly how customers navigate your store</p>
      </motion.div>
      <div style={{padding:40,borderRadius:20,background:t.card,border:`1px solid ${t.border}`,textAlign:"center",marginBottom:16}}>
        <div style={{width:64,height:64,borderRadius:20,background:"rgba(107,53,232,0.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>🎬</div>
        <h2 style={{fontSize:18,fontWeight:800,color:t.text,margin:"0 0 8px",letterSpacing:"-0.03em"}}>Coming in Phase 2</h2>
        <p style={{fontSize:13,color:t.muted,margin:"0 0 24px",maxWidth:400,marginLeft:"auto",marginRight:"auto",lineHeight:1.6}}>Session replay lets you watch real customer journeys — where they click, scroll, hesitate, and drop off. KIRO will automatically flag the moments that cost you sales.</p>
        <Link href="/dashboard/kiro" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,textDecoration:"none",color:"#fff",fontSize:13,fontWeight:700}}>
          <Zap size={13}/> Ask KIRO for analytics instead
        </Link>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[{icon:Eye,label:"Heatmaps",desc:"See where eyes and clicks go"},{icon:MousePointer,label:"Click tracking",desc:"Every tap mapped in real time"},{icon:Clock,label:"Session length",desc:"How long customers stay"}].map((f,i)=>(
          <div key={i} style={{padding:16,borderRadius:14,background:t.faint,border:`1px solid ${t.border}`}}>
            <div style={{width:32,height:32,borderRadius:10,background:"rgba(107,53,232,0.1)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}><f.icon size={14} color={V.v400}/></div>
            <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 4px"}}>{f.label}</p>
            <p style={{fontSize:12,color:t.muted,margin:0}}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
