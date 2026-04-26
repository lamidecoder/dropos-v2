"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Send, Zap, ArrowRight, Loader2, Store, TrendingUp, Package, Star, X, Check } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

interface Msg {
  id:   string;
  role: "user" | "KIRO";
  text: string;
  done?: boolean;
}

const STARTERS = [
  "I want to sell hair products",
  "I sell electronics and gadgets",
  "I want to start a fashion store",
  "I sell beauty and skincare",
  "Help me build a dropshipping store",
];

const DEMO_FLOW = [
  { role:"KIRO" as const, text:"Hey 👋 I'm KIRO — your AI business partner. What do you want to sell?" },
];

const FEATURES = [
  { emoji:"⚡", label:"60-second stores",  desc:"Type your niche. KIRO builds your store instantly." },
  { emoji:"🎯", label:"Winning products",  desc:"KIRO researches what sells before you import anything." },
  { emoji:"📣", label:"AI ad copy",        desc:"TikTok scripts, Instagram captions, WhatsApp messages — all written." },
  { emoji:"📊", label:"Plain English data",desc:"No charts. Just 'You made ₦84,000 today. Here's what to do next.'" },
];

function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode]       = useState<"login"|"register">("register");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const body = mode === "register" ? { name, email, password } : { email, password };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong"); return; }
      if (data.data?.accessToken) {
        localStorage.setItem("dropos-token", data.data.accessToken);
        onSuccess();
      }
    } catch { setError("Connection failed. Try again."); }
    finally { setLoading(false); }
  };

  const inp = { width:"100%", padding:"12px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        style={{ width:"100%", maxWidth:400, borderRadius:24, background:"#181230", border:"1px solid rgba(107,53,232,0.3)", overflow:"hidden" }}>
        <div style={{ padding:"24px 24px 0", textAlign:"center" }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <Zap size={18} color="white"/>
          </div>
          <h2 style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:6, letterSpacing:"-0.5px" }}>Save your progress</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:20 }}>Create your account to continue with KIRO. Takes 10 seconds.</p>
          {/* Mode toggle */}
          <div style={{ display:"flex", gap:4, padding:4, borderRadius:12, background:"rgba(255,255,255,0.05)", marginBottom:20 }}>
            {(["register","login"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"8px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:mode===m?"rgba(107,53,232,0.4)":"transparent", color:mode===m?"#fff":"rgba(255,255,255,0.4)", transition:"all 0.15s" }}>
                {m === "register" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding:"0 24px 24px", display:"flex", flexDirection:"column", gap:10 }}>
          {mode === "register" && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp}/>
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" style={inp}/>
          <input value={password} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" style={inp}
            onKeyDown={e => e.key === "Enter" && submit()}/>
          {error && <p style={{ fontSize:12, color:"#EF4444", textAlign:"center" }}>{error}</p>}
          <button onClick={submit} disabled={loading || !email || !password}
            style={{ padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:loading||!email||!password?0.6:1 }}>
            {loading ? <Loader2 size={16} style={{ animation:"spin 1s linear infinite" }}/> : <Zap size={16}/>}
            {loading ? "..." : mode === "register" ? "Continue →" : "Sign in →"}
          </button>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center" }}>
            Your conversation is saved automatically. No card needed.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function PublicKIROPage() {
  const [msgs,       setMsgs]       = useState<Msg[]>([...DEMO_FLOW.map((m,i) => ({ ...m, id:String(i), done:true }))]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showAuth,   setShowAuth]   = useState(false);
  const [authed,     setAuthed]     = useState(false);
  const [msgCount,   setMsgCount]   = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);
  useEffect(() => { if (localStorage.getItem("dropos-token")) setAuthed(true); }, []);

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const count = msgCount + 1;
    setMsgCount(count);

    // Show auth wall after 3 messages if not authed
    if (!authed && count >= 3) {
      setMsgs(p => [...p, { id:Date.now().toString(), role:"user", text:msg, done:true }]);
      setTimeout(() => setShowAuth(true), 400);
      return;
    }

    const uid = Date.now().toString();
    const kid = (Date.now() + 1).toString();
    setMsgs(p => [...p,
      { id:uid, role:"user", text:msg, done:true },
      { id:kid, role:"KIRO", text:"", done:false },
    ]);
    setLoading(true);

    try {
      const token = localStorage.getItem("dropos-token") || "";
      const res = await fetch(`${API}/kai/smart-chat`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body: JSON.stringify({ message:msg, public:true }),
      });
      const data = await res.json();
      const reply = data.data?.reply || data.reply || "I am here! Tell me what you want to sell and I will build your store right now.";
      // Animate word by word
      const words = reply.split(" ");
      let displayed = "";
      for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 12));
        displayed += (i === 0 ? "" : " ") + words[i];
        setMsgs(p => p.map(m => m.id === kid ? { ...m, text:displayed } : m));
        bottomRef.current?.scrollIntoView({ behavior:"smooth" });
      }
      setMsgs(p => p.map(m => m.id === kid ? { ...m, done:true } : m));
    } catch {
      setMsgs(p => p.map(m => m.id === kid ? { ...m, text:"I am ready to help — try again or create your free account to get started.", done:true } : m));
    } finally { setLoading(false); }
  }, [input, loading, msgCount, authed]);

  return (
    <div style={{ background:"#07050F", color:"#fff", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform:rotate(360deg); } }
        * { box-sizing:border-box; }
        .hide-scroll::-webkit-scrollbar { display:none; }
      `}</style>

      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:40, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(7,5,15,0.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:9, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Zap size={13} color="white"/>
          </div>
          <span style={{ fontWeight:900, color:"#fff", fontSize:16 }}>Drop<span style={{ color:"#8B5CF6" }}>OS</span></span>
        </Link>
        <div style={{ display:"flex", gap:8 }}>
          <Link href="/auth/login" style={{ textDecoration:"none" }}>
            <button style={{ padding:"8px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.6)", fontSize:13, cursor:"pointer", fontWeight:600 }}>Sign in</button>
          </Link>
          <Link href="/auth/register" style={{ textDecoration:"none" }}>
            <button style={{ padding:"8px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:700 }}>Start free</button>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 16px 100px", display:"flex", flexDirection:"column", gap:0 }}>
        {/* Hero text */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ textAlign:"center", padding:"24px 0 20px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:99, background:"rgba(107,53,232,0.12)", border:"1px solid rgba(107,53,232,0.25)", fontSize:11, fontWeight:700, color:"#A78BFA", marginBottom:14 }}>
            <motion.div style={{ width:6, height:6, borderRadius:"50%", background:"#10B981" }} animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.5, repeat:Infinity }}/>
            KIRO is online
          </div>
          <h1 style={{ fontSize:"clamp(28px,7vw,40px)", fontWeight:900, letterSpacing:"-2px", lineHeight:1.1, margin:"0 0 10px" }}>
            Your AI business<br/>partner.
          </h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", lineHeight:1.6, margin:0 }}>
            Tell KIRO what you sell. It builds your store, finds winning products, and writes your ads — right now.
          </p>
        </motion.div>

        {/* Chat */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:12 }}>
          {msgs.map(msg => (
            <motion.div key={msg.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-end" }}>
              {msg.role === "KIRO" && (
                <div style={{ width:28, height:28, borderRadius:9, background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Zap size={12} color="white"/>
                </div>
              )}
              <div style={{
                maxWidth:"82%", padding:"10px 14px", fontSize:14, lineHeight:1.6, wordBreak:"break-word",
                ...(msg.role === "user"
                  ? { background:"linear-gradient(135deg,#6B35E8,#3D1C8A)", color:"#fff", borderRadius:"18px 18px 4px 18px" }
                  : { background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.88)", borderRadius:"4px 18px 18px 18px", border:"1px solid rgba(255,255,255,0.06)" }
                )
              }}>
                {msg.text || (msg.role === "KIRO" && !msg.done ? (
                  <span style={{ display:"inline-flex", gap:3, alignItems:"center" }}>
                    {[0,1,2].map(i => (
                      <motion.span key={i} style={{ width:5, height:5, borderRadius:"50%", display:"inline-block", background:"#8B5CF6" }}
                        animate={{ scale:[1,1.4,1], opacity:[0.4,1,0.4] }} transition={{ duration:0.8, delay:i*0.15, repeat:Infinity }}/>
                    ))}
                  </span>
                ) : null)}
                {msg.role === "KIRO" && !msg.done && msg.text && (
                  <motion.span animate={{ opacity:[0,1] }} transition={{ duration:0.4, repeat:Infinity }} style={{ display:"inline-block", width:2, height:13, background:"#8B5CF6", marginLeft:2, verticalAlign:"middle" }}/>
                )}
              </div>
            </motion.div>
          ))}

          {/* Auth nudge after 2 messages */}
          {msgCount === 2 && !authed && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ padding:"10px 14px", borderRadius:14, background:"rgba(107,53,232,0.08)", border:"1px solid rgba(107,53,232,0.2)", fontSize:12, color:"rgba(255,255,255,0.5)", textAlign:"center" }}>
              Create a free account to save your conversation and build your store 👇
            </motion.div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Quick starters */}
        {msgs.length <= 2 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
            {STARTERS.map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ padding:"7px 14px", borderRadius:99, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.65)", fontSize:12, cursor:"pointer", fontWeight:500, transition:"all 0.15s" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Features */}
        {msgs.length <= 1 && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{ padding:"12px 14px", borderRadius:14, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{f.emoji}</div>
                <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.8)", marginBottom:3 }}>{f.label}</p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", lineHeight:1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed input */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"12px 16px 20px", background:"rgba(7,5,15,0.97)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"8px 8px 8px 14px" }}>
            <textarea
              ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Tell KIRO what you want to sell..." rows={1} disabled={loading}
              style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:14, lineHeight:1.6, resize:"none", maxHeight:100, fontFamily:"inherit" }}
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height="auto"; t.style.height=Math.min(t.scrollHeight,100)+"px"; }}
            />
            <motion.button onClick={() => send()} disabled={!input.trim() || loading} whileTap={{ scale:0.92 }}
              style={{ width:34, height:34, borderRadius:10, border:"none", cursor:input.trim()&&!loading?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:input.trim()&&!loading?"linear-gradient(135deg,#6B35E8,#3D1C8A)":"rgba(255,255,255,0.06)", transition:"all 0.15s" }}>
              {loading
                ? <Loader2 size={14} color="rgba(255,255,255,0.5)" style={{ animation:"spin 1s linear infinite" }}/>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim()?"white":"rgba(255,255,255,0.25)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              }
            </motion.button>
          </div>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.15)", textAlign:"center", marginTop:8 }}>
            Free to try · No credit card · Store live in 60 seconds
          </p>
        </div>
      </div>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => { setShowAuth(false); setAuthed(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
