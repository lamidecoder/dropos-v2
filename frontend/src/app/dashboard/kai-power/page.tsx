"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { useKiroStream } from "../../../hooks/useKiroStream";
import { Zap, StopCircle, Copy, Check, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

const POWERS = [
  { id:"audit",     emoji:"🔍", label:"Full Store Audit",        time:"~45s", prompt:"Do a complete audit of my store right now. Check: products (are there enough? well-described?), pricing (am I pricing right for Nigeria?), inventory (any risks?), recent orders (any patterns?), and what's missing. Give me the top 5 specific actions to take TODAY, in order of impact. Be brutally honest." },
  { id:"growth",    emoji:"🎯", label:"30-Day Growth Plan",       time:"~60s", prompt:"Create a detailed 30-day growth plan for my DropOS store in Nigeria. Week 1: quick wins. Week 2: product expansion. Week 3: marketing push. Week 4: consolidation. Include specific daily tasks, platforms, content ideas, and how to get from my current revenue to 3x it. Be specific to Nigeria — mention Nairaland, Nigerian TikTok, WhatsApp groups, Jumia competition." },
  { id:"products",  emoji:"📦", label:"Product Recommendations",  time:"~45s", prompt:"Based on my current store data and what's trending in Nigeria RIGHT NOW, recommend the 10 best products I should add. For each one: name, estimated supplier cost (aliexpress/CJ), recommended selling price in Nigeria, target audience, best platform to advertise. Prioritise products with strong WhatsApp and Instagram potential." },
  { id:"pricing",   emoji:"💰", label:"Pricing Optimiser",        time:"~30s", prompt:"Look at every product in my store and tell me if I'm pricing them right for the Nigerian market. For each product: is the price too high, too low, or right? What should it be? Also identify which products I should bundle together to increase average order value. Use Nigerian buyer psychology." },
  { id:"marketing", emoji:"📣", label:"Marketing Playbook",       time:"~60s", prompt:"Write a complete marketing playbook for my store targeting Nigerian buyers. Include: which platforms (TikTok, Instagram, WhatsApp, Facebook — rank them for my niche), what type of content works, posting schedule, ad budget breakdown, and give me 5 ready-to-use ad copy templates I can post today." },
  { id:"recovery",  emoji:"🔄", label:"Revenue Recovery Scan",    time:"~45s", prompt:"Find every money leak in my store and tell me exactly how to plug each one. Check: abandoned carts (if any), customers who haven't returned, underpriced products, products with zero sales, unfulfilled orders hurting trust, and missed upsell opportunities. Give me the exact fix for each leak with estimated revenue impact." },
  { id:"nigeria",   emoji:"🇳🇬", label:"Nigeria Market Brief",     time:"~40s", prompt:"Give me a Nigerian ecommerce market brief for this week. What's selling on Jumia and Konga? What's trending on Nigerian TikTok and Instagram? What products are going viral in Lagos? What upcoming events (holidays, payday, school resumption) should I prepare stock for? Give me the intel my competitors don't have." },
  { id:"forecast",  emoji:"📈", label:"Revenue Forecast",          time:"~30s", prompt:"Based on my current store data — products, orders, and trends — forecast my revenue for the next 30 days. Give me: realistic target, optimistic target (if I execute well), what assumptions you're making, and the 3 things I need to do to hit the optimistic number. Be specific with the numbers." },
  { id:"competitor",emoji:"🕵️", label:"Competitive Intelligence", time:"~50s", prompt:"Give me a competitive intelligence report for Nigerian dropshippers in my niche. Who are my likely competitors? What are they doing right? What are their weaknesses? What's my differentiation strategy? How do I take their customers? Give me 3 specific tactics to outmanoeuvre them this month." },
];

function ResultPanel({ text, loading, label, onCopy, t }: any) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text && !loading) return null;

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      style={{ padding:24, borderRadius:20, background:"linear-gradient(135deg,rgba(107,53,232,0.06),rgba(107,53,232,0.02))", border:"1px solid rgba(107,53,232,0.2)", position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Zap size={13} color="#fff" fill="#fff"/>
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:"#F0ECFF" }}>{label}</span>
        </div>
        {text && (
          <button onClick={copy} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, border:"1px solid rgba(107,53,232,0.3)", background:"rgba(107,53,232,0.1)", cursor:"pointer", color:V.v300, fontSize:11, fontWeight:700 }}>
            {copied ? <Check size={11}/> : <Copy size={11}/>}
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      {loading && !text && (
        <div style={{ display:"flex", alignItems:"center", gap:8, color:"rgba(240,236,255,0.5)" }}>
          <span style={{ display:"flex", gap:3 }}>
            {[0,1,2].map(i => (
              <motion.span key={i} style={{ width:5, height:5, borderRadius:"50%", background:V.v400, display:"block" }}
                animate={{ y:[0,-4,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }}/>
            ))}
          </span>
          <span style={{ fontSize:13 }}>KIRO is analysing your store...</span>
        </div>
      )}
      {text && (
        <p style={{ fontSize:13, lineHeight:1.8, color:"rgba(240,236,255,0.75)", whiteSpace:"pre-wrap", margin:0 }}>
          {text}{loading && <motion.span animate={{ opacity:[1,0] }} transition={{ duration:0.5, repeat:Infinity }}>▋</motion.span>}
        </p>
      )}
    </motion.div>
  );
}

export default function KiroPowerPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:  isDark?"#181230":"#fff",
    border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text:  isDark?"#F0ECFF":"#130D2E",
    muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id || "");
  const { text, loading, error, run, stop, clear } = useKiroStream(storeId);
  const [activeId, setActiveId] = useState<string | null>(null);

  const execute = (power: typeof POWERS[0]) => {
    if (loading) { stop(); return; }
    setActiveId(power.id);
    clear();
    run(power.prompt);
  };

  return (
    <div style={{ maxWidth:1040, margin:"0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:99, background:"rgba(107,53,232,0.1)", border:"1px solid rgba(107,53,232,0.2)", marginBottom:14 }}>
          <Zap size={12} color={V.v400}/>
          <span style={{ fontSize:12, fontWeight:700, color:V.v300 }}>KIRO Deep Analysis</span>
        </div>
        <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 6px" }}>KIRO Power Mode</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>Full-depth AI analysis — each gives you real, store-specific intelligence you can act on immediately</p>
      </motion.div>

      {/* Power grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12, marginBottom:24 }}>
        {POWERS.map((p, i) => {
          const isActive = activeId === p.id;
          return (
            <motion.div key={p.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
              onClick={() => execute(p)}
              style={{ padding:18, borderRadius:16, background:isActive?`rgba(107,53,232,0.08)`:t.card,
                border:`1px solid ${isActive?"rgba(107,53,232,0.35)":t.border}`,
                cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform="translateY(0)"}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <span style={{ fontSize:26 }}>{p.emoji}</span>
                <span style={{ fontSize:10, color:t.muted, background:t.faint, padding:"2px 8px", borderRadius:99, border:`1px solid ${t.border}` }}>{p.time}</span>
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:isActive?V.v400:t.text, margin:"0 0 5px" }}>{p.label}</p>
              <p style={{ fontSize:11, color:t.muted, margin:"0 0 10px", lineHeight:1.4 }}>{p.prompt.slice(0,60)}...</p>
              <div style={{ display:"flex", alignItems:"center", gap:4, color:isActive&&loading?V.v400:V.v400 }}>
                {isActive && loading
                  ? <><span style={{ fontSize:11, color:V.v400, fontWeight:600 }}>Running...</span>
                      <StopCircle size={11} color={V.v400}/></>
                  : <><span style={{ fontSize:11, color:V.v400, fontWeight:600 }}>Run</span>
                      <ChevronRight size={11} color={V.v400}/></>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Result */}
      <AnimatePresence>
        {(text || (loading && activeId)) && (
          <ResultPanel
            text={text}
            loading={loading}
            label={POWERS.find(p => p.id === activeId)?.label || "Analysis"}
            t={t}
          />
        )}
      </AnimatePresence>

      {error && (
        <div style={{ padding:14, borderRadius:12, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", marginTop:16 }}>
          <p style={{ fontSize:13, color:"#F87171", margin:0 }}>⚠️ {error} — make sure ANTHROPIC_API_KEY is set on Render</p>
        </div>
      )}
    </div>
  );
}
