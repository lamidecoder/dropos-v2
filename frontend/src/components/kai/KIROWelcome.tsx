"use client";
// ─────────────────────────────────────────────────────────────────────────────
// KIRO Welcome Screen — the most important 3 seconds of the product
// 
// Design philosophy:
//  • "Orbital Command" — deep space, alive, premium
//  • Typography: Sora (loaded via @import) — rounded, modern, human
//  • Color psychology: Deep indigo (#060412) = focus + luxury
//    Violet (#7C3AED) = creativity + intelligence (purple = luxury per research)
//    Amber (#F59E0B) = urgency/action for critical metrics
//  • Gestalt principle: live store data grouped visually → instant comprehension
//  • Von Restorff effect: one glowing animated orb stands out, anchors attention
//  • Bento grid quick actions = modern, scannable, inviting
//  • Micro-interactions on every touch point = dopamine triggers (per research)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";

const C = {
  bg:      "#060412",
  panel:   "#0C0820",
  v800:    "#3B0764",
  v700:    "#4C1D95",
  v600:    "#5B21B6",
  v500:    "#7C3AED",
  v400:    "#8B5CF6",
  v300:    "#A78BFA",
  v200:    "#C4B5FD",
  v100:    "#EDE9FE",
  amber:   "#F59E0B",
  green:   "#10B981",
  text:    "#F0ECFF",
  muted:   "rgba(200,190,255,0.5)",
  faint:   "rgba(124,58,237,0.08)",
};

// Time-aware greeting
function getTimeGreeting(name: string): { greeting: string; emoji: string; sub: string } {
  const h = new Date().getHours();
  if (h < 5)  return { greeting: `Still up, ${name}?`,       emoji: "🌙", sub: "The hustle never sleeps." };
  if (h < 12) return { greeting: `Good morning, ${name}.`,   emoji: "☀️", sub: "Let's make today count." };
  if (h < 17) return { greeting: `Good afternoon, ${name}.`, emoji: "⚡", sub: "What are we building?" };
  if (h < 21) return { greeting: `Good evening, ${name}.`,   emoji: "🌆", sub: "End the day strong." };
  return        { greeting: `Late night, ${name}.`,           emoji: "🌙", sub: "Night owls build empires." };
}

// KIRO Orb — the living logo
export function KIROOrb({ size = 80 }: { size?: number }) {
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      {/* Outer glow pulse */}
      <motion.div
        animate={{ scale:[1,1.15,1], opacity:[0.3,0.6,0.3] }}
        transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
        style={{ position:"absolute", inset:-size*0.25, borderRadius:"50%", background:`radial-gradient(circle, ${C.v500}40, transparent 70%)`, pointerEvents:"none" }}
      />
      {/* Orbiting ring */}
      <motion.div
        animate={{ rotate:360 }}
        transition={{ duration:6, repeat:Infinity, ease:"linear" }}
        style={{ position:"absolute", inset:-4, borderRadius:"50%", border:"1px solid transparent" }}>
        <motion.div
          style={{ position:"absolute", top:-4, left:"50%", width:size*0.12, height:size*0.12, borderRadius:"50%",
            background:C.v300, boxShadow:`0 0 ${size*0.15}px ${C.v300}`, transform:"translateX(-50%)" }}
        />
      </motion.div>
      {/* Counter-rotating inner ring */}
      <motion.div
        animate={{ rotate:-360 }}
        transition={{ duration:9, repeat:Infinity, ease:"linear" }}
        style={{ position:"absolute", inset:2, borderRadius:"50%", border:`1px dashed rgba(167,139,250,0.2)` }}>
        <motion.div
          style={{ position:"absolute", bottom:-3, left:"50%", width:size*0.08, height:size*0.08, borderRadius:"50%",
            background:C.amber, boxShadow:`0 0 ${size*0.12}px ${C.amber}`, transform:"translateX(-50%)" }}
        />
      </motion.div>
      {/* Core orb */}
      <motion.div
        animate={{ scale:[1,1.04,1] }}
        transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
        style={{ width:"100%", height:"100%", borderRadius:"50%",
          background:`conic-gradient(from 0deg at 40% 40%, ${C.v600}, ${C.v400}, ${C.v800}, ${C.v500})`,
          boxShadow:`0 0 ${size*0.4}px ${C.v500}60, 0 0 ${size*0.2}px ${C.v400}40, inset 0 0 ${size*0.2}px rgba(255,255,255,0.1)`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={size*0.4} height={size*0.4} viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white" fillOpacity={0.95}/>
        </svg>
      </motion.div>
    </div>
  );
}

interface WelcomeProps {
  storeId: string;
  onSend: (msg: string) => void;
}

export function KIROWelcome({ storeId, onSend }: WelcomeProps) {
  const user     = useAuthStore(s => s.user);
  const name     = user?.name?.split(" ")[0] || "there";
  const tg       = getTimeGreeting(name);
  const [ctx, setCtx]     = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!storeId) { setLoaded(true); return; }
    api.get(`/kai/greeting?storeId=${storeId}`)
      .then(r => { setCtx(r.data?.data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [storeId]);

  const sym = ctx?.storeContext?.currencySymbol || "₦";
  const rev = ctx?.storeContext?.revenueToday || 0;
  const pending = ctx?.storeContext?.pendingOrders || 0;
  const health  = ctx?.storeContext?.healthScore || 0;
  const products= ctx?.storeContext?.totalProducts || 0;

  // Quick actions — contextual, beautiful, bento-style
  const QUICK = [
    { icon:"📊", label:"Store pulse",       sub:"Revenue · Orders · Health",  prompt:"Give me my full store summary — revenue, orders, what needs attention today.", color:C.v500 },
    { icon:"🔥", label:"What's trending",   sub:"Live market research",        prompt:"What products are trending right now in my market this week?", color:"#7C3AED" },
    { icon:"🌐", label:"Import a product",  sub:"Any website, any store",      prompt:"I want to import a product. How do I start?", color:"#6D28D9" },
    { icon:"⚡", label:"Flash sale",        sub:"Drive sales right now",       prompt:"Help me set up a flash sale on my best products today.", color:"#5B21B6" },
    { icon:"📣", label:"WhatsApp blast",    sub:"Send to all customers",       prompt:"Write a WhatsApp broadcast message to drive sales today.", color:"#4C1D95" },
    { icon:"🚀", label:"Grow my store",     sub:"5-step action plan",          prompt:"Give me a 5-step action plan to grow my store revenue this month.", color:"#3B0764" },
  ];

  const metrics = [
    { label:"Today's revenue", value: rev > 0 ? `${sym}${rev.toLocaleString()}` : `${sym}0`, icon:"💰", color: rev > 0 ? C.green : C.muted, glow: rev > 0 },
    { label:"Pending orders",  value: pending > 0 ? `${pending}` : "0",           icon:"📬", color: pending > 0 ? C.amber : C.muted, glow: pending > 0 },
    { label:"Store health",    value: health > 0 ? `${health}/100` : "--",         icon:"💚", color: health > 60 ? C.green : health > 30 ? C.amber : "#EF4444", glow: false },
    { label:"Products",        value: products > 0 ? `${products}` : "0",          icon:"📦", color: C.v300, glow: false },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px", overflowY:"auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      {/* Animated background mesh */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <motion.div animate={{ x:[0,30,-30,0], y:[0,-20,20,0] }} transition={{ duration:20, repeat:Infinity, ease:"easeInOut" }}
          style={{ position:"absolute", top:"-20%", left:"30%", width:"60vw", height:"60vw", borderRadius:"50%",
            background:`radial-gradient(circle, ${C.v800}30, transparent 65%)`, filter:"blur(40px)" }}/>
        <motion.div animate={{ x:[0,-40,40,0], y:[0,30,-30,0] }} transition={{ duration:25, repeat:Infinity, ease:"easeInOut", delay:5 }}
          style={{ position:"absolute", bottom:"-10%", right:"20%", width:"50vw", height:"50vw", borderRadius:"50%",
            background:`radial-gradient(circle, ${C.v600}20, transparent 65%)`, filter:"blur(60px)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:520, textAlign:"center" }}>

        {/* KIRO Orb */}
        <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}}
          transition={{type:"spring",stiffness:200,damping:20}} style={{marginBottom:28,display:"flex",justifyContent:"center"}}>
          <KIROOrb size={72}/>
        </motion.div>

        {/* Greeting */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15,duration:0.5}}>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:800, color:C.text, margin:"0 0 6px", letterSpacing:"-0.5px", lineHeight:1.2 }}>
            {tg.greeting}
          </h1>
          <p style={{ fontFamily:"'Sora',sans-serif", fontSize:14, color:C.muted, margin:"0 0 24px", fontWeight:400 }}>
            {tg.sub}
          </p>
        </motion.div>

        {/* Live metrics — float in staggered */}
        <AnimatePresence>
          {loaded && (
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.25,duration:0.4}}
              style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
              {metrics.map((m,i) => (
                <motion.div key={m.label} initial={{opacity:0,y:10,scale:0.95}} animate={{opacity:1,y:0,scale:1}}
                  transition={{delay:0.3+i*0.07,type:"spring",stiffness:300,damping:20}}
                  style={{ padding:"8px 14px", borderRadius:12, background:`rgba(124,58,237,0.08)`,
                    border:`1px solid ${m.glow ? m.color+"40" : "rgba(124,58,237,0.12)"}`,
                    boxShadow: m.glow ? `0 0 12px ${m.color}20` : "none", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{fontSize:14}}>{m.icon}</span>
                  <div style={{textAlign:"left"}}>
                    <p style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:700,color:m.color,margin:0,letterSpacing:"-0.2px"}}>{m.value}</p>
                    <p style={{fontFamily:"'Sora',sans-serif",fontSize:9,color:C.muted,margin:0,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>{m.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions — bento grid */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.4}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:20}}>
            {QUICK.map((q,i) => (
              <motion.button key={q.label}
                initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
                transition={{delay:0.55+i*0.06,type:"spring",stiffness:280,damping:22}}
                whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.96}}
                onClick={() => onSend(q.prompt)}
                style={{ padding:"12px 10px", borderRadius:14, border:"1px solid rgba(124,58,237,0.15)",
                  background:`rgba(124,58,237,0.06)`, cursor:"pointer", fontFamily:"'Sora',sans-serif",
                  textAlign:"left", display:"flex", flexDirection:"column", gap:4,
                  transition:"border-color 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e=>{(e.currentTarget.style.borderColor)="rgba(124,58,237,0.35)";(e.currentTarget.style.boxShadow)=`0 4px 20px rgba(124,58,237,0.15)`;}}
                onMouseLeave={e=>{(e.currentTarget.style.borderColor)="rgba(124,58,237,0.15)";(e.currentTarget.style.boxShadow)="none";}}>
                <span style={{fontSize:18,lineHeight:1}}>{q.icon}</span>
                <span style={{fontSize:11,fontWeight:700,color:C.text,lineHeight:1.25}}>{q.label}</span>
                <span style={{fontSize:10,color:C.muted,lineHeight:1.3,fontWeight:400}}>{q.sub}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Context-aware nudge */}
        <AnimatePresence>
          {loaded && pending > 0 && (
            <motion.button initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              transition={{delay:0.8}} whileHover={{scale:1.01}} whileTap={{scale:0.98}}
              onClick={() => onSend(`Help me fulfill my ${pending} pending order${pending>1?"s":""}`)}
              style={{ width:"100%", padding:"12px 16px", borderRadius:14, border:`1px solid ${C.amber}35`,
                background:`rgba(245,158,11,0.08)`, cursor:"pointer", fontFamily:"'Sora',sans-serif",
                display:"flex", alignItems:"center", gap:10, textAlign:"left",
                boxShadow:`0 0 20px rgba(245,158,11,0.1)` }}>
              <span style={{fontSize:20,flexShrink:0}}>📬</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:700,color:C.amber,margin:0}}>
                  {pending} unfulfilled order{pending>1?"s":""} waiting
                </p>
                <p style={{fontSize:11,color:"rgba(245,158,11,0.6)",margin:0}}>
                  Tap to fulfill now — customers are waiting
                </p>
              </div>
              <span style={{fontSize:14,color:C.amber,flexShrink:0}}>→</span>
            </motion.button>
          )}
        </AnimatePresence>

        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}}
          style={{fontFamily:"'Sora',sans-serif",fontSize:11,color:"rgba(200,190,255,0.2)",margin:"14px 0 0",letterSpacing:"0.03em"}}>
          Paste a URL · Upload an image · Ask anything · ⌘K
        </motion.p>
      </div>
    </div>
  );
}
