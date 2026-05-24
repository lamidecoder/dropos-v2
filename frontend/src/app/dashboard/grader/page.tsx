"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Star, TrendingUp, Package, Users, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };
function GradeCircle({ score, label }: { score: number; label: string }) {
  const color = score>=80?V.green:score>=60?V.amber:V.red;
  const r=40,circ=2*Math.PI*r,offset=circ*(1-score/100);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:96,height:96}}>
        <svg viewBox="0 0 96 96" style={{transform:"rotate(-90deg)"}}>
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{transition:"stroke-dashoffset 1s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
          <p style={{fontSize:20,fontWeight:900,color,margin:0,letterSpacing:"-0.04em"}}>{score}</p>
          <p style={{fontSize:9,color:"rgba(240,236,255,0.25)",margin:0,fontWeight:600}}>/100</p>
        </div>
      </div>
      <p style={{fontSize:12,fontWeight:600,color:"rgba(240,236,255,0.5)",margin:0}}>{label}</p>
    </div>
  );
}
export default function GraderPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const T = {
    text:   isDark ? "#F0ECFF"                : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)"  : "rgba(19,13,46,0.5)",
    faint:  isDark ? "rgba(240,236,255,0.25)" : "rgba(19,13,46,0.3)",
    card:   isDark ? "#181230"                : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.09)",
    bg:     isDark ? "rgba(255,255,255,0.04)" : "rgba(107,53,232,0.04)",
  };
  const t = { card:isDark?T.card:"#fff", border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)", text:isDark?"#F0ECFF":"#130D2E", muted:isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)", faint:isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)" };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const { data: analytics } = useQuery({ queryKey:["grade",storeId], queryFn:()=>api.get(`/analytics/${storeId}?period=30`).then(r=>r.data.data), enabled:!!storeId });
  const stats = analytics?.stats||{};
  const grades = [
    { label:"Products", score:Math.min(100,((stats.products||0)/20)*100)||45, fix:"Add more products", href:"/dashboard/products", icon:Package },
    { label:"Sales",    score:Math.min(100,((stats.orders||0)/50)*100)||22,   fix:"Run a flash sale",  href:"/dashboard/flash-sales", icon:TrendingUp },
    { label:"Customers",score:Math.min(100,((stats.customers||0)/100)*100)||38,fix:"Send a broadcast", href:"/dashboard/broadcasts", icon:Users },
    { label:"KIRO Usage",score:72, fix:"Ask KIRO daily",  href:"/kiro", icon:Zap },
  ];
  const overall = Math.round(grades.reduce((a,g)=>a+g.score,0)/grades.length);
  const grade = overall>=80?"A":overall>=70?"B":overall>=60?"C":overall>=50?"D":"F";
  return (
    <div style={{maxWidth:800,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Store Grader</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>See exactly how healthy your store is and what to fix</p>
      </motion.div>
      <div style={{padding:28,borderRadius:20,background:`linear-gradient(135deg,#1a0d3c,#0d0520)`,border:"1px solid rgba(107,53,232,0.25)",marginBottom:20,display:"flex",alignItems:"center",gap:32,flexWrap:"wrap"}}>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:72,fontWeight:900,color:overall>=70?V.green:overall>=50?V.amber:V.red,margin:0,letterSpacing:"-0.06em",lineHeight:1}}>{grade}</p>
          <p style={{fontSize:13,color:T.muted,margin:"6px 0 0"}}>Overall Grade</p>
        </div>
        <div style={{display:"flex",gap:20,flexWrap:"wrap",flex:1,justifyContent:"center"}}>
          {grades.map(g=><GradeCircle key={g.label} score={Math.round(g.score)} label={g.label}/>)}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {grades.filter(g=>g.score<80).sort((a,b)=>a.score-b.score).map((g,i)=>(
          <motion.div key={g.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            style={{display:"flex",alignItems:"center",gap:14,padding:14,borderRadius:14,background:t.card,border:`1px solid ${t.border}`}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${g.score<50?V.red:V.amber}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <g.icon size={15} color={g.score<50?V.red:V.amber}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 2px"}}>{g.label} score: {Math.round(g.score)}/100</p>
              <p style={{fontSize:12,color:t.muted,margin:0}}>{g.fix}</p>
            </div>
            <Link href={g.href} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:10,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,textDecoration:"none",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>
              Fix it <ExternalLink size={11}/>
            </Link>
          </motion.div>
        ))}
        {grades.every(g=>g.score>=80)&&(
          <div style={{padding:"40px 20px",textAlign:"center",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}>
            <p style={{fontSize:24,marginBottom:8}}>🏆</p>
            <p style={{fontSize:15,fontWeight:700,color:t.text,margin:"0 0 4px"}}>Excellent store health!</p>
            <p style={{fontSize:13,color:t.muted,margin:0}}>All metrics are strong. Keep it up.</p>
          </div>
        )}
      </div>
    </div>
  );
}
