"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";

const T = {
  bg:"#080811", s1:"#0F0E1C", s2:"#141325", s3:"#1A192E",
  accent:"#6D28D9", accentL:"#7C3AED", accentD:"#4C1D95",
  green:"#059669", amber:"#D97706", text:"#F8F7FF",
  t2:"rgba(248,247,255,0.65)", t3:"rgba(248,247,255,0.35)", t4:"rgba(248,247,255,0.18)",
  border:"rgba(255,255,255,0.055)", borderH:"rgba(255,255,255,0.1)",
};

// KIRO mark that breathes
function Mark({ size=64 }:{ size?:number }) {
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <motion.div animate={{ scale:[1,1.12,1], opacity:[0.25,0.5,0.25] }}
        transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut" }}
        style={{ position:"absolute", inset:-size*.28, borderRadius:"50%",
          background:`radial-gradient(circle, ${T.accentL}50 0%, transparent 65%)`,
          filter:`blur(${size*.25}px)`, pointerEvents:"none" }}/>
      <motion.div animate={{ scale:[1,1.04,1] }} transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }}
        style={{ width:"100%", height:"100%", borderRadius:size*.26,
          background:`linear-gradient(145deg, ${T.accentL}, ${T.accentD})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 0 0 1px rgba(109,40,217,0.4), 0 ${size*.15}px ${size*.7}px rgba(109,40,217,0.4)` }}>
        <svg width={size*.44} height={size*.44} viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8L21 10h-9L13 2z" fill="white" fillOpacity={.95}/>
        </svg>
      </motion.div>
    </div>
  );
}

function getGreeting(name:string) {
  const h = new Date().getHours();
  if (h<5)  return { line1:`Still up,`, line2:name+".", sub:"The serious ones build at night." };
  if (h<12) return { line1:`Good morning,`, line2:name+".", sub:"Let's make something happen today." };
  if (h<17) return { line1:`Good afternoon,`, line2:name+".", sub:"What are we working on?" };
  if (h<21) return { line1:`Good evening,`, line2:name+".", sub:"Strong close to the day." };
  return       { line1:`Late night,`, line2:name+".", sub:"Night owls build empires." };
}

interface P { storeId:string; onSend:(m:string)=>void; }

export function KIROWelcome({ storeId, onSend }:P) {
  const user  = useAuthStore(s=>s.user);
  const name  = user?.name?.split(" ")[0] || "there";
  const greet = getGreeting(name);
  const [ctx,     setCtx]     = useState<any>(null);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(()=>{
    if (!storeId) { setLoaded(true); return; }
    api.get(`/kai/greeting?storeId=${storeId}`)
      .then(r=>{ setCtx(r.data?.data); setLoaded(true); })
      .catch(()=>setLoaded(true));
  },[storeId]);

  const sym      = ctx?.storeContext?.currencySymbol || "₦";
  const rev      = ctx?.storeContext?.revenueToday   || 0;
  const pending  = ctx?.storeContext?.pendingOrders  || 0;
  const health   = ctx?.storeContext?.healthScore    || 0;
  const products = ctx?.storeContext?.totalProducts  || 0;

  const METRICS = [
    { label:"Revenue today",  value:rev>0?`${sym}${rev.toLocaleString()}`:sym+"0",     color:rev>0?T.green:T.t3,  glow:rev>0 },
    { label:"Pending orders", value:String(pending||"0"),                              color:pending>0?T.amber:T.t3, glow:pending>0 },
    { label:"Store health",   value:health>0?`${health}/100`:"—",                      color:health>60?T.green:health>30?T.amber:"#DC2626", glow:false },
    { label:"Products",       value:String(products||"0"),                             color:T.t2, glow:false },
  ];

  const QUICK = [
    { icon:"📊", label:"Store pulse",      sub:"Revenue · Orders · Health",     prompt:"Give me my full store summary — what's happened, what's urgent, what's the opportunity today." },
    { icon:"🔥", label:"Trending now",     sub:"Live market research",           prompt:"What products are trending right now in my market this week? Show me what\'s actually selling." },
    { icon:"🌐", label:"Import a product", sub:"Any URL, any store",             prompt:"I want to import a product. Paste me a link and I\'ll handle the rest." },
    { icon:"⚡", label:"Launch flash sale",sub:"Drive sales today",              prompt:"Help me set up a flash sale on my best-selling products right now." },
    { icon:"📣", label:"Write ad copy",    sub:"TikTok · WhatsApp · Instagram",  prompt:"Write powerful ad copy for my products. I need TikTok script, WhatsApp blast, and Instagram caption." },
    { icon:"🚀", label:"Grow my store",    sub:"Specific action plan",           prompt:"Give me a specific, realistic 5-step plan to grow my store revenue this month based on my current data." },
  ];

  return (
    <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 20px", overflowY:"auto", position:"relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`}</style>

      {/* Subtle bg glow */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        <motion.div animate={{ x:[0,20,-20,0], y:[0,-15,15,0] }} transition={{ duration:18, repeat:Infinity, ease:"easeInOut" }}
          style={{ position:"absolute", top:"-15%", left:"35%", width:"55vw", height:"55vw", borderRadius:"50%",
            background:`radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 65%)`, filter:"blur(50px)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:500, textAlign:"center" }}>

        {/* Mark */}
        <motion.div initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }}
          transition={{ type:"spring", stiffness:180, damping:18, delay:0 }}
          style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
          <Mark size={64}/>
        </motion.div>

        {/* Greeting */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12, duration:0.4 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:T.t3, margin:"0 0 4px", fontWeight:400 }}>
            {greet.line1}
          </p>
          <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:30, fontWeight:800, color:T.text, margin:"0 0 8px", letterSpacing:"-0.6px", lineHeight:1.1 }}>
            {greet.line2}
          </h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:T.t3, margin:"0 0 28px" }}>
            {greet.sub}
          </p>
        </motion.div>

        {/* Live metrics */}
        <AnimatePresence>
          {loaded&&(
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:28 }}>
              {METRICS.map((m,i)=>(
                <motion.div key={m.label} initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:0.25+i*0.06, type:"spring", stiffness:280, damping:22 }}
                  style={{ padding:"8px 14px", borderRadius:9, background:T.s2, border:`1px solid ${m.glow?m.color+"30":T.border}`,
                    boxShadow:m.glow?`0 0 12px ${m.color}18`:"none", display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ textAlign:"left" }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, color:m.color, margin:0, letterSpacing:"-0.2px" }}>{m.value}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:T.t3, margin:0, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:600 }}>{m.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
            {QUICK.map((q,i)=>(
              <motion.button key={q.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.45+i*0.05, type:"spring", stiffness:260, damping:22 }}
                whileHover={{ y:-2, transition:{ duration:0.15 } }} whileTap={{ scale:0.97 }}
                onClick={()=>onSend(q.prompt)}
                style={{ padding:"12px 10px", borderRadius:10, border:`1px solid ${T.border}`, background:T.s2, cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", textAlign:"left", display:"flex", flexDirection:"column", gap:4 }}
                onMouseEnter={e=>{(e.currentTarget.style.borderColor)=T.borderH;(e.currentTarget.style.background)=T.s3;}}
                onMouseLeave={e=>{(e.currentTarget.style.borderColor)=T.border;(e.currentTarget.style.background)=T.s2;}}>
                <span style={{ fontSize:17, lineHeight:1 }}>{q.icon}</span>
                <span style={{ fontSize:11, fontWeight:600, color:T.text, lineHeight:1.25 }}>{q.label}</span>
                <span style={{ fontSize:10, color:T.t3, lineHeight:1.3 }}>{q.sub}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Urgent alert */}
        <AnimatePresence>
          {loaded&&pending>0&&(
            <motion.button initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              transition={{ delay:0.7 }} whileHover={{ y:-1 }} whileTap={{ scale:0.98 }}
              onClick={()=>onSend(`Help me fulfill my ${pending} pending order${pending>1?"s":""} right now.`)}
              style={{ width:"100%", padding:"11px 16px", borderRadius:10, border:`1px solid rgba(217,119,6,0.3)`,
                background:"rgba(217,119,6,0.07)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
              <span style={{ fontSize:18, flexShrink:0 }}>📬</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:T.amber, margin:0 }}>
                  {pending} unfulfilled order{pending>1?"s":""} waiting
                </p>
                <p style={{ fontSize:11, color:"rgba(217,119,6,0.65)", margin:0 }}>Customers are waiting — tap to fulfill now</p>
              </div>
              <span style={{ fontSize:13, color:T.amber, flexShrink:0, opacity:0.7 }}>→</span>
            </motion.button>
          )}
        </AnimatePresence>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}
          style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:T.t4, margin:"14px 0 0" }}>
          Paste any product URL · Upload a file · Ask anything · ⌘K
        </motion.p>
      </div>
    </div>
  );
}
