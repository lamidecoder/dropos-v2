"use client";
// KIRO Side Panels — Skills, Goals, Pulse, URL Importer
// Accessible as tabs at the bottom of KAIChat

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const V = { v400:"#9B6FFE", v500:"#7C3AED" };

// ── URL Importer Panel ───────────────────────────────────────────────────────
export function URLImporter({ storeId, onImported, t, isDark }: any) {
  const [url,      setUrl]      = useState("");
  const [result,   setResult]   = useState<any>(null);
  const [loading,  setLoading]  = useState(false);
  const [price,    setPrice]    = useState("");

  const scrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/kai/scrape-url", { url: url.trim(), storeId });
      const p = res.data.data;
      setResult(p);
      setPrice(String(p.suggestedLocalPrice || ""));
    } catch(e: any) {
      toast.error(e.response?.data?.message || "Couldn't fetch that URL. Try a direct product page link.");
    } finally {
      setLoading(false);
    }
  };

  const importProduct = async () => {
    if (!result) return;
    setLoading(true);
    try {
      await api.post("/kai/action", {
        storeId,
        actions: [{ type:"import_from_url", approved:true, payload: { url: url.trim() } }],
      });
      toast.success(`"${result.name}" added to your store!`);
      setUrl(""); setResult(null);
      onImported?.();
    } catch(e: any) {
      toast.error("Import failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    "AliExpress","Temu","Amazon","Jumia","Konga","Shein",
    "TikTok Shop","1688","DHgate","Alibaba","eBay","Etsy","Walmart","Any store"
  ];

  return (
    <div style={{ padding:"16px" }}>
      <p style={{ fontSize:13, fontWeight:800, color:t.text, margin:"0 0 4px", letterSpacing:"-0.01em" }}>Import from any website</p>
      <p style={{ fontSize:11, color:t.muted, margin:"0 0 12px" }}>
        Works with: {platforms.slice(0,6).join(", ")} + any product URL
      </p>

      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input
          value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && scrape()}
          placeholder="Paste product URL here..."
          style={{ flex:1, padding:"10px 14px", borderRadius:10, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.12)"}`, background:isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)", color:t.text, fontSize:13, outline:"none", fontFamily:"inherit" }}
        />
        <button onClick={scrape} disabled={loading || !url.trim()}
          style={{ padding:"10px 18px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, color:"#fff", fontSize:13, fontWeight:700, cursor:loading||!url.trim()?"not-allowed":"pointer", fontFamily:"inherit", flexShrink:0, opacity:loading||!url.trim()?0.5:1 }}>
          {loading ? "Fetching..." : "🌐 Fetch"}
        </button>
      </div>

      {result && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
          style={{ borderRadius:12, border:`1px solid ${isDark?"rgba(107,53,232,0.3)":"rgba(107,53,232,0.15)"}`, overflow:"hidden" }}>
          {/* Product preview */}
          <div style={{ display:"flex", gap:12, padding:"12px" }}>
            {result.images?.[0] && (
              <img src={result.images[0]} alt="" style={{ width:72, height:72, objectFit:"cover", borderRadius:8, flexShrink:0 }} onError={(e)=>(e.currentTarget.style.display="none")}/>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{result.name}</p>
              <p style={{ fontSize:11, color:t.muted, margin:"0 0 6px" }}>via {result.platformDetected} · {result.category}</p>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:11, color:t.muted }}>Supplier: {result.currencySymbol}{Math.round((result.originalPriceUSD||0) * (result.suggestedLocalPrice / (result.suggestedLocalPrice/1.5 || 1))).toLocaleString()}</span>
                <span style={{ fontSize:12, fontWeight:800, color:V.v400 }}>Sell: {result.currencySymbol}{result.suggestedLocalPrice?.toLocaleString()}</span>
                <span style={{ fontSize:11, color:"#10b981" }}>~{result.marginPct}% margin</span>
              </div>
            </div>
          </div>

          {/* Bullet points */}
          {result.bulletPoints?.length > 0 && (
            <div style={{ padding:"0 12px 8px", display:"flex", flexWrap:"wrap", gap:6 }}>
              {result.bulletPoints.slice(0,3).map((bp: string, i: number) => (
                <span key={i} style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)", color:t.muted }}>
                  ✓ {bp.slice(0,40)}
                </span>
              ))}
            </div>
          )}

          {/* Price override + import */}
          <div style={{ padding:"10px 12px 12px", borderTop:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`, display:"flex", gap:8, alignItems:"center" }}>
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Selling price"
              style={{ width:130, padding:"8px 12px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.12)"}`, background:"transparent", color:t.text, fontSize:12, outline:"none", fontFamily:"inherit" }}
            />
            <button onClick={importProduct} disabled={loading}
              style={{ flex:1, padding:"8px 16px", borderRadius:8, border:"none", background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              {loading ? "Importing..." : "Add to Store"}
            </button>
            <button onClick={() => setResult(null)}
              style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.12)"}`, background:"transparent", color:t.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Skills Panel ─────────────────────────────────────────────────────────────
const DEFAULT_SKILLS = [
  { id:"s1", name:"Sales Summary",    icon:"📊", prompt:"Give me a complete summary of my sales this week with actionable insights." },
  { id:"s2", name:"Flash Sale",       icon:"⚡", prompt:"Help me set up a flash sale for tonight on my best products." },
  { id:"s3", name:"TikTok Script",    icon:"🎵", prompt:"Write a TikTok script for my best-selling product that Nigerian buyers would stop scrolling for." },
  { id:"s4", name:"WhatsApp Blast",   icon:"💬", prompt:"Write a WhatsApp broadcast message I can send to my customers today to drive sales." },
  { id:"s5", name:"Restock Alert",    icon:"📦", prompt:"Which of my products need restocking urgently? Show me the risks and what to order." },
  { id:"s6", name:"Morning Brief",    icon:"☀️", prompt:"Give me my full morning business brief — what happened overnight, what's urgent, what's the opportunity today." },
  { id:"s7", name:"Product Research", icon:"🔍", prompt:"What trending products should I add to my store this week for the Nigerian market?" },
  { id:"s8", name:"Grow My Store",    icon:"🚀", prompt:"Give me a 5-step growth plan specific to my store data right now." },
];

export function SkillsPanel({ storeId, onSend, t, isDark }: any) {
  const [skills, setSkills]   = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name,    setName]    = useState("");
  const [prompt,  setPrompt]  = useState("");
  const [icon,    setIcon]    = useState("⚡");
  const ICONS = ["⚡","📊","🔍","🚀","💡","📱","🎯","💰","📦","🔥"];

  useEffect(() => {
    api.get(`/kai/skills?storeId=${storeId}`)
      .then(r => setSkills(r.data.data || []))
      .catch(() => {});
  }, [storeId]);

  const allSkills = [...DEFAULT_SKILLS, ...skills.filter((s: any) => !s.isGlobal)];

  const useSkill = async (skill: any) => {
    if (skill.id?.startsWith("s")) {
      onSend(skill.prompt);
      return;
    }
    try {
      await api.post(`/kai/skills/${skill.id}/use`);
    } catch {}
    onSend(skill.prompt);
  };

  const addSkill = async () => {
    if (!name.trim() || !prompt.trim()) return;
    try {
      const r = await api.post("/kai/skills", { storeId, name, prompt, icon, description: prompt.slice(0, 60) });
      setSkills(p => [...p, r.data.data]);
      setName(""); setPrompt(""); setIcon("⚡"); setShowAdd(false);
      toast.success("Skill saved!");
    } catch {}
  };

  const deleteSkill = async (id: string) => {
    try {
      await api.delete(`/kai/skills/${id}`);
      setSkills(p => p.filter((s: any) => s.id !== id));
    } catch {}
  };

  return (
    <div style={{ padding:"12px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:800, color:t.text, margin:0 }}>KIRO Skills</p>
          <p style={{ fontSize:11, color:t.muted, margin:"2px 0 0" }}>One-tap prompts for your most common tasks</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${V.v500}`, background:"transparent", color:V.v400, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          + New
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            style={{ marginBottom:12, borderRadius:10, padding:12, background:isDark?"rgba(107,53,232,0.08)":"rgba(107,53,232,0.04)", border:`1px solid rgba(107,53,232,0.2)` }}>
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)}
                  style={{ width:28, height:28, borderRadius:6, border:`1px solid ${icon===ic?V.v500:"rgba(255,255,255,0.1)"}`, background:icon===ic?"rgba(107,53,232,0.3)":"transparent", cursor:"pointer", fontSize:14 }}>
                  {ic}
                </button>
              ))}
            </div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Skill name"
              style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, background:"transparent", color:t.text, fontSize:12, outline:"none", fontFamily:"inherit", marginBottom:6, boxSizing:"border-box" }}
            />
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="The prompt that runs when you tap this..." rows={2}
              style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, background:"transparent", color:t.text, fontSize:12, outline:"none", fontFamily:"inherit", resize:"none", marginBottom:8, boxSizing:"border-box" }}
            />
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addSkill} style={{ flex:1, padding:"7px", borderRadius:8, border:"none", background:V.v500, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Save</button>
              <button onClick={() => setShowAdd(false)} style={{ padding:"7px 12px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, background:"transparent", color:t.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {allSkills.map((sk: any) => (
          <div key={sk.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)", border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"}`, cursor:"pointer" }}
            onClick={() => useSkill(sk)}>
            <span style={{ fontSize:18, flexShrink:0 }}>{sk.icon || "⚡"}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sk.name}</p>
              <p style={{ fontSize:11, color:t.muted, margin:"1px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sk.prompt?.slice(0,55)}...</p>
            </div>
            {!sk.id?.startsWith("s") && (
              <button onClick={e => { e.stopPropagation(); deleteSkill(sk.id); }}
                style={{ padding:"3px 8px", borderRadius:6, border:"none", background:"transparent", color:"#ef4444", fontSize:11, cursor:"pointer", flexShrink:0 }}>
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Goals Panel ──────────────────────────────────────────────────────────────
export function GoalsPanel({ storeId, t, isDark, onSend }: any) {
  const [goals,   setGoals]   = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title,   setTitle]   = useState("");
  const [target,  setTarget]  = useState("");
  const [unit,    setUnit]    = useState("NGN");
  const [deadline,setDeadline]= useState("");

  useEffect(() => {
    api.get(`/kai/goals?storeId=${storeId}`)
      .then(r => setGoals(r.data.data || []))
      .catch(() => {});
  }, [storeId]);

  const addGoal = async () => {
    if (!title || !target || !deadline) { toast.error("Fill in all fields"); return; }
    try {
      const r = await api.post("/kai/goals", { storeId, title, targetValue: Number(target), unit, deadline });
      setGoals(p => [...p, r.data.data]);
      setTitle(""); setTarget(""); setDeadline(""); setShowAdd(false);
      toast.success("Goal set!");
    } catch {}
  };

  const sym = unit === "NGN" ? "₦" : unit === "GBP" ? "£" : "$";

  return (
    <div style={{ padding:"12px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:800, color:t.text, margin:0 }}>Goals</p>
          <p style={{ fontSize:11, color:t.muted, margin:"2px 0 0" }}>KIRO tracks and pushes you toward every target</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ padding:"6px 12px", borderRadius:8, border:"1px solid #10b981", background:"transparent", color:"#10b981", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          + New Goal
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            style={{ marginBottom:12, borderRadius:10, padding:12, background:isDark?"rgba(16,185,129,0.06)":"rgba(16,185,129,0.04)", border:"1px solid rgba(16,185,129,0.2)" }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Make ₦500,000 by end of month"
              style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, background:"transparent", color:t.text, fontSize:12, outline:"none", fontFamily:"inherit", marginBottom:6, boxSizing:"border-box" }}
            />
            <div style={{ display:"flex", gap:6, marginBottom:6 }}>
              <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Target number" type="number"
                style={{ flex:1, padding:"8px 10px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, background:"transparent", color:t.text, fontSize:12, outline:"none", fontFamily:"inherit" }}
              />
              <select value={unit} onChange={e => setUnit(e.target.value)}
                style={{ padding:"8px 10px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, background:isDark?"#1a1a2e":"#fff", color:t.text, fontSize:12, outline:"none", fontFamily:"inherit" }}>
                <option value="NGN">₦ NGN</option>
                <option value="USD">$ USD</option>
                <option value="GBP">£ GBP</option>
                <option value="orders">Orders</option>
                <option value="customers">Customers</option>
              </select>
            </div>
            <input value={deadline} onChange={e => setDeadline(e.target.value)} type="date"
              style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, background:"transparent", color:t.muted, fontSize:12, outline:"none", fontFamily:"inherit", marginBottom:8, boxSizing:"border-box" }}
            />
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addGoal} style={{ flex:1, padding:"7px", borderRadius:8, border:"none", background:"#10b981", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Set Goal</button>
              <button onClick={() => setShowAdd(false)} style={{ padding:"7px 12px", borderRadius:8, border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`, background:"transparent", color:t.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {goals.length === 0 && !showAdd && (
        <div style={{ textAlign:"center", padding:"32px 16px", color:t.muted }}>
          <p style={{ fontSize:32, margin:"0 0 8px" }}>🎯</p>
          <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 4px" }}>No goals yet</p>
          <p style={{ fontSize:11, color:t.muted }}>Set a revenue target and KIRO will track your progress and push you to hit it.</p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {goals.map((g: any) => {
          const pct = Math.min(100, Math.round(((g.currentValue||0) / g.targetValue) * 100));
          const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
          const statusColor = g.status === "achieved" ? "#10b981" : g.status === "behind" ? "#ef4444" : V.v400;
          return (
            <div key={g.id} style={{ padding:"12px", borderRadius:10, background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)", border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0, flex:1, paddingRight:8 }}>{g.title}</p>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:`${statusColor}20`, color:statusColor, flexShrink:0 }}>{g.status}</span>
              </div>
              <div style={{ height:4, borderRadius:2, background:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)", marginBottom:6, overflow:"hidden" }}>
                <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1}} style={{ height:"100%", background:statusColor, borderRadius:2 }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:t.muted }}>
                <span>{sym}{(g.currentValue||0).toLocaleString()} / {sym}{g.targetValue.toLocaleString()}</span>
                <span>{pct}% · {daysLeft > 0 ? `${daysLeft} days left` : "deadline passed"}</span>
              </div>
              <button onClick={() => onSend?.(`What do I need to do right now to hit my goal: "${g.title}"?`)}
                style={{ marginTop:8, width:"100%", padding:"6px", borderRadius:8, border:`1px solid ${statusColor}40`, background:`${statusColor}10`, color:statusColor, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                Ask KIRO how to hit this →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Pulse Panel (proactive alerts) ───────────────────────────────────────────
export function PulsePanel({ storeId, t, isDark, onSend }: any) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/kai/pulse?storeId=${storeId}`)
      .then(r => setAlerts(r.data.data || []))
      .catch(() => {});
  }, [storeId]);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/kai/pulse/${id}/read`);
      setAlerts(p => p.map((a: any) => a.id === id ? { ...a, read: true } : a));
    } catch {}
  };

  const severityColor: any = {
    critical:    "#ef4444",
    warning:     "#f59e0b",
    opportunity: "#10b981",
    info:        V.v400,
  };
  const severityIcon: any = {
    critical:    "🚨",
    warning:     "⚠️",
    opportunity: "✨",
    info:        "ℹ️",
  };

  const unread = alerts.filter((a: any) => !a.read);

  return (
    <div style={{ padding:"12px 16px" }}>
      <p style={{ fontSize:13, fontWeight:800, color:t.text, margin:"0 0 2px" }}>KIRO Pulse</p>
      <p style={{ fontSize:11, color:t.muted, margin:"0 0 12px" }}>
        {unread.length > 0 ? `${unread.length} alert${unread.length > 1 ? "s" : ""} need your attention` : "Your store is being monitored 24/7"}
      </p>

      {alerts.length === 0 && (
        <div style={{ textAlign:"center", padding:"32px 16px" }}>
          <p style={{ fontSize:32, margin:"0 0 8px" }}>💚</p>
          <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 4px" }}>All clear</p>
          <p style={{ fontSize:11, color:t.muted }}>KIRO is monitoring your store. Alerts will appear here when something needs your attention.</p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {alerts.map((a: any) => {
          const color = severityColor[a.severity] || V.v400;
          return (
            <motion.div key={a.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
              style={{ padding:"12px", borderRadius:10, background:a.read?(isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.01)"):(isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)"), border:`1px solid ${a.read?"transparent":`${color}30`}`, opacity:a.read?0.6:1 }}>
              <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{severityIcon[a.severity]}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 4px" }}>{a.title}</p>
                  <p style={{ fontSize:11, color:t.muted, margin:0, lineHeight:1.5 }}>{a.message}</p>
                  {a.suggestedPrompt && !a.read && (
                    <button onClick={() => { onSend?.(a.suggestedPrompt); markRead(a.id); }}
                      style={{ marginTop:8, padding:"5px 12px", borderRadius:7, border:`1px solid ${color}40`, background:`${color}15`, color, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                      {a.actionable ? "Ask KIRO about this →" : "View →"}
                    </button>
                  )}
                </div>
                {!a.read && (
                  <button onClick={() => markRead(a.id)}
                    style={{ padding:"3px 8px", borderRadius:6, border:"none", background:"transparent", color:t.muted, fontSize:11, cursor:"pointer", flexShrink:0 }}>
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


// ── Memory Panel ──────────────────────────────────────────────────────────────
export function MemoryPanel({ storeId, t, isDark }: any) {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/kai/memories?storeId=${storeId}`)
      .then(r => setMemories(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  const deleteMemory = async (key: string) => {
    try {
      await api.delete(`/kai/memory/${key}`);
      setMemories(p => p.filter((m: any) => m.key !== key));
      toast.success("Memory deleted");
    } catch {}
  };

  if (loading) return <div style={{ padding:24, textAlign:"center", fontSize:12, color:t.muted }}>Loading memories...</div>;

  return (
    <div style={{ padding:"12px 16px" }}>
      <p style={{ fontSize:13, fontWeight:800, color:t.text, margin:"0 0 2px" }}>What KIRO Knows</p>
      <p style={{ fontSize:11, color:t.muted, margin:"0 0 12px" }}>Tap × to delete a memory and KIRO will forget it.</p>
      {memories.length === 0 && (
        <div style={{ textAlign:"center", padding:24 }}>
          <p style={{ fontSize:13, color:t.muted }}>No memories yet. The more you chat, the more KIRO remembers about your business.</p>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {memories.map((m: any) => (
          <div key={m.key} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"10px 12px", borderRadius:10, background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)", border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)"}` }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:11, fontWeight:700, color:isDark?"rgba(200,190,255,0.5)":"rgba(107,53,232,0.6)", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:"0.08em" }}>{m.category || "Memory"}</p>
              <p style={{ fontSize:12, color:t.text, margin:0, lineHeight:1.5 }}>{typeof m.value === "string" ? m.value : JSON.stringify(m.value)}</p>
            </div>
            <button onClick={() => deleteMemory(m.key)}
              style={{ padding:"3px 8px", borderRadius:6, border:"none", background:"transparent", color:"#ef4444", fontSize:12, cursor:"pointer", flexShrink:0 }}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
