"use client";
/**
 * KIROChat — DropOS Commerce AI
 * Fresh build. No legacy. Clean design system.
 *
 * DESIGN: "Warm Precision"
 * Light default: Linen #F7F6F3 → Ink #111827, Violet #7C3AED accent
 * Dark:          Obsidian #0D0D14 → Snow #F9F8FF, same accent
 * Font: Geist (display) + Inter (body) — loaded from CDN
 *
 * LAYOUT: Column flex, height:100%, minHeight:0 everywhere.
 * No absolute positioning in the main flow.
 * KIRO_ACTION: buffered server-side, stripped client-side.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { api, uploadAPI } from "../../lib/api";
import toast from "react-hot-toast";

// ── constants ──────────────────────────────────────────────────────────────────
const BASE   = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
const ACCENT = "#7C3AED";
const ACCENT_D = "#5B21B6";

// ── types ──────────────────────────────────────────────────────────────────────
type Mode = "light" | "dark";
interface Msg {
  id:         string;
  role:       "user" | "assistant";
  content:    string;
  streaming?: boolean;
  imageUrl?:  string;
  actions?:   Action[];
  ts?:        string;
  thumbs?:    "up" | "down";
}
interface Action {
  type:     string;
  payload:  Record<string,unknown>;
  approved?: boolean;
}

// ── theme tokens ───────────────────────────────────────────────────────────────
const T = {
  light: {
    bg:       "#F7F6F3",
    surface:  "#FFFFFF",
    elevated: "#F0EFE9",
    border:   "rgba(0,0,0,0.08)",
    borderFocus: ACCENT + "60",
    text:     "#111827",
    sub:      "#6B7280",
    muted:    "#9CA3AF",
    accent:   ACCENT,
    accentD:  ACCENT_D,
    accentBg: ACCENT + "12",
    userBg:   `linear-gradient(145deg, ${ACCENT}, ${ACCENT_D})`,
    userText: "#ffffff",
    shadow:   "0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)",
    shadowMd: "0 4px 24px rgba(0,0,0,0.10)",
    green:    "#059669",
    amber:    "#D97706",
    red:      "#DC2626",
    scrollbar: "rgba(0,0,0,0.12)",
  },
  dark: {
    bg:       "#0D0D14",
    surface:  "#13131F",
    elevated: "#1A1A2A",
    border:   "rgba(255,255,255,0.07)",
    borderFocus: ACCENT + "70",
    text:     "#F9F8FF",
    sub:      "#A0A0C0",
    muted:    "#606080",
    accent:   "#9061F9",
    accentD:  ACCENT,
    accentBg: ACCENT + "18",
    userBg:   `linear-gradient(145deg, ${ACCENT}, ${ACCENT_D})`,
    userText: "#ffffff",
    shadow:   "0 1px 4px rgba(0,0,0,0.4)",
    shadowMd: "0 4px 24px rgba(0,0,0,0.5)",
    green:    "#10B981",
    amber:    "#F59E0B",
    red:      "#F87171",
    scrollbar: "rgba(255,255,255,0.1)",
  },
};

// ── clean KIRO_ACTION from text ────────────────────────────────────────────────
function cleanText(raw: string): string {
  if (!raw) return "";
  let result = "";
  let i = 0;
  while (i < raw.length) {
    const markerIdx = raw.indexOf("KIRO_ACTION", i);
    if (markerIdx === -1) { result += raw.slice(i); break; }
    result += raw.slice(i, markerIdx);
    let j = markerIdx + 11;
    while (j < raw.length && /[\s:`]/.test(raw[j])) j++;
    if (j < raw.length && raw[j] === "{") {
      let depth = 0;
      while (j < raw.length) {
        if (raw[j] === "{") depth++;
        else if (raw[j] === "}") { depth--; if (depth === 0) { j++; break; } }
        j++;
      }
      while (j < raw.length && (raw[j] === "\n" || raw[j] === "`" || raw[j] === " ")) j++;
    }
    i = j;
  }
  return result
    .replace(/```json[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/^#{1,6}\s/gm, "")
    .replace(/━+/g, "").replace(/^[-=]{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n").trim();
}

// ── parse actions from text ────────────────────────────────────────────────────
function parseActions(text: string): Action[] {
  const actions: Action[] = [];
  const re = /KIRO_ACTION\s*:?\s*/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const start = text.indexOf("{", match.index + match[0].length);
    if (start === -1) continue;
    let depth = 0, j = start;
    while (j < text.length) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}") { depth--; if (depth === 0) { j++; break; } }
      j++;
    }
    try {
      const obj = JSON.parse(text.slice(start, j));
      if (obj.type) actions.push({ type: obj.type, payload: obj.payload || obj });
    } catch {}
  }
  return actions;
}

// ── action card labels ─────────────────────────────────────────────────────────
const ACTION_META: Record<string, { icon: string; label: string; cta: string }> = {
  add_product:           { icon:"📦", label:"Add product",         cta:"Add to store"    },
  import_from_url:       { icon:"🌐", label:"Import product",      cta:"Import"          },
  update_price:          { icon:"💰", label:"Update price",        cta:"Update"          },
  update_stock:          { icon:"📋", label:"Update stock",        cta:"Update"          },
  create_coupon:         { icon:"🎟", label:"Create coupon",       cta:"Create"          },
  create_coupon_v2:      { icon:"🎟", label:"Create coupon",       cta:"Create"          },
  fulfill_order:         { icon:"🚚", label:"Fulfill order",       cta:"Fulfill"         },
  update_order_status:   { icon:"📬", label:"Update order",        cta:"Update"          },
  create_flash_sale:     { icon:"⚡", label:"Flash sale",          cta:"Launch"          },
  archive_product:       { icon:"🔒", label:"Archive product",     cta:"Archive"         },
  delete_product:        { icon:"🗑", label:"Delete product",      cta:"Delete"          },
  duplicate_product:     { icon:"📋", label:"Duplicate product",   cta:"Duplicate"       },
  add_tracking:          { icon:"📦", label:"Add tracking",        cta:"Add"             },
  process_refund:        { icon:"💸", label:"Process refund",      cta:"Refund"          },
  send_email:            { icon:"📧", label:"Send email",          cta:"Send"            },
  send_whatsapp:         { icon:"💬", label:"Send WhatsApp",       cta:"Send"            },
  bulk_update_prices:    { icon:"💰", label:"Bulk price update",   cta:"Update all"      },
  update_store_description:{ icon:"✏️", label:"Update store",     cta:"Update"          },
  update_product:        { icon:"✏️", label:"Update product",      cta:"Save"            },
};

// ── Time greeting ──────────────────────────────────────────────────────────────
function getGreeting(name: string) {
  const h = new Date().getHours();
  const firstName = name.split(" ")[0];
  if (h < 5)  return `Still up, ${firstName}?`;
  if (h < 12) return `Good morning, ${firstName}.`;
  if (h < 17) return `Good afternoon, ${firstName}.`;
  if (h < 21) return `Good evening, ${firstName}.`;
  return `Late night, ${firstName}.`;
}

// ── KIRO Logo ──────────────────────────────────────────────────────────────────
function KIROLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.27),
      background: `linear-gradient(145deg, ${ACCENT}, ${ACCENT_D})`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      boxShadow: `0 2px 8px ${ACCENT}40`,
    }}>
      <svg width={size * 0.44} height={size * 0.44} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white" fillOpacity={0.95}/>
      </svg>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = ACCENT }: { size?: number; color?: string }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", border: `2px solid ${color}30`, borderTopColor: color, animation: "ks 0.7s linear infinite", flexShrink: 0 }}/>;
}

// ── Action card ────────────────────────────────────────────────────────────────
function ActionCard({ action, onApprove, onDismiss, t }: { action: Action; onApprove:(a:Action)=>void; onDismiss:(a:Action)=>void; t: typeof T.light }) {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const meta = ACTION_META[action.type] || { icon:"⚡", label: action.type.replace(/_/g," "), cta:"Run" };
  if (done) return null;

  const p = action.payload as any;
  const summary = p?.name || p?.url?.slice(0,35) || p?.code || p?.trackingNumber || p?.message?.slice(0,40) || p?.status || "";

  return (
    <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
      style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${t.border}`, background: t.surface, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: t.text, margin: 0 }}>{meta.label}</p>
          {summary && <p style={{ fontSize: 11, color: t.sub, margin: "2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{summary}</p>}
        </div>
      </div>
      <div style={{ padding: "0 14px 12px", display: "flex", gap: 8 }}>
        <button
          onClick={async () => { setLoading(true); await onApprove(action); setDone(true); setLoading(false); }}
          disabled={loading}
          style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: t.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          {loading ? <Spinner size={12} color="#fff"/> : meta.cta}
        </button>
        <button onClick={() => { onDismiss(action); setDone(true); }}
          style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.sub, fontSize: 12, cursor: "pointer" }}>
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────
function MsgBubble({ msg, onApprove, onDismiss, onRate, onRegen, t }: {
  msg: Msg; onApprove:(a:Action)=>void; onDismiss:(a:Action)=>void;
  onRate:(id:string,v:"up"|"down")=>void; onRegen:(id:string)=>void; t: typeof T.light;
}) {
  const [show, setShow] = useState(false);
  const isUser = msg.role === "user";
  const text   = cleanText(msg.content || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 8, alignItems: "flex-end", marginBottom: 20, position: "relative" }}>

      {!isUser && <KIROLogo size={26}/>}

      <div style={{ maxWidth: "80%", minWidth: 0 }}>
        {/* Image */}
        {msg.imageUrl && (
          <img src={msg.imageUrl} alt="" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, marginBottom: 6, display: "block", objectFit: "cover" }} onError={e=>(e.currentTarget.style.display="none")}/>
        )}

        {/* Text bubble */}
        <div style={{
          padding: isUser ? "10px 15px" : "0",
          borderRadius: isUser ? "18px 18px 4px 18px" : "0",
          background: isUser ? t.userBg : "transparent",
          color: isUser ? t.userText : t.text,
          fontSize: 14, lineHeight: 1.7,
          boxShadow: isUser ? `0 2px 10px ${ACCENT}30` : "none",
        }}>
          {msg.streaming && !msg.content ? (
            <div style={{ display:"flex", gap:4, alignItems:"center", padding:"3px 0" }}>
              {[0,1,2].map(i=>(
                <motion.div key={i} style={{ width:5, height:5, borderRadius:"50%", background: t.muted }}
                  animate={{ y:[0,-4,0], opacity:[0.4,1,0.4] }}
                  transition={{ duration:0.6, repeat:Infinity, delay:i*0.13 }}/>
              ))}
              <span style={{ fontSize:12, color: t.muted, marginLeft:6 }}>KIRO is thinking</span>
            </div>
          ) : (
            <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {text}
              {msg.streaming && <motion.span animate={{ opacity:[1,0] }} transition={{ duration:0.5, repeat:Infinity }} style={{ display:"inline-block", marginLeft:1 }}>▋</motion.span>}
            </span>
          )}

          {/* Action cards */}
          {!isUser && msg.actions?.map((a,i) => (
            <ActionCard key={i} action={a} onApprove={onApprove} onDismiss={onDismiss} t={t}/>
          ))}
        </div>

        {/* Toolbar */}
        <AnimatePresence>
          {show && !msg.streaming && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ display:"flex", gap:3, marginTop:5, padding:"0 2px" }}>
              {["📋","👍","👎","↻","🔊"].map((icon, i) => (
                <button key={i} title={["Copy","Helpful","Not helpful","Retry","Listen"][i]}
                  onClick={() => {
                    if (i===0) navigator.clipboard.writeText(text);
                    if (i===1) onRate(msg.id,"up");
                    if (i===2) onRate(msg.id,"down");
                    if (i===3) onRegen(msg.id);
                    if (i===4) { const u = new SpeechSynthesisUtterance(text.slice(0,500)); u.lang="en-NG"; window.speechSynthesis.speak(u); }
                  }}
                  style={{ width:24, height:24, borderRadius:6, border:`1px solid ${t.border}`, background: t.surface, color: t.sub, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {icon}
                </button>
              ))}
              {!isUser && (
                <button title="Share to WhatsApp"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text.slice(0,500))}`, "_blank")}
                  style={{ width:24, height:24, borderRadius:6, border:`1px solid ${t.border}`, background: t.surface, color:"#25D366", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  📤
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timestamp */}
        {msg.ts && !msg.streaming && (
          <p style={{ fontSize:10, color: t.muted, margin:"3px 0 0", textAlign: isUser?"right":"left" }}>
            {new Date(msg.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
            {msg.thumbs && (msg.thumbs==="up"?" · 👍":" · 👎")}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Welcome screen ─────────────────────────────────────────────────────────────
function Welcome({ name, storeData, onSend, t }: { name:string; storeData:any; onSend:(m:string)=>void; t: typeof T.light }) {
  const greeting = getGreeting(name || "there");
  const sym      = storeData?.currencySymbol || "₦";

  const QUICK = [
    { icon:"📊", title:"Store pulse",       sub:"Revenue · Health · What needs action",  prompt:"Give me my full store summary — revenue, orders, health score, and what I should focus on today." },
    { icon:"🔥", title:"Trending products", sub:"Live market research",                   prompt:"What products are trending right now in my market this week?" },
    { icon:"🌐", title:"Import product",    sub:"Any URL — AliExpress, Temu, Amazon",     prompt:"I want to import a product. Paste a link and I'll handle everything." },
    { icon:"⚡", title:"Flash sale",        sub:"Drive sales right now",                  prompt:"Help me set up a flash sale on my best products today." },
    { icon:"📣", title:"Write ad copy",     sub:"TikTok · WhatsApp · Instagram",          prompt:"Write high-converting ad copy for my top product across TikTok, WhatsApp, and Instagram." },
    { icon:"🚀", title:"Growth plan",       sub:"Specific 5-step plan",                   prompt:"Give me a specific 5-step plan to grow my store revenue this month based on my current data." },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 20px 20px", overflowY:"auto", minHeight:0 }}>

      {/* Orb */}
      <motion.div initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
        transition={{ type:"spring", stiffness:200, damping:18 }}
        style={{ marginBottom:22, position:"relative" }}>
        <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}>
          <KIROLogo size={64}/>
        </motion.div>
        <motion.div animate={{ rotate:360 }} transition={{ duration:7, repeat:Infinity, ease:"linear" }}
          style={{ position:"absolute", inset:-8, borderRadius:"50%", border:`1px dashed ${ACCENT}30` }}>
          <div style={{ position:"absolute", top:-3, left:"50%", width:7, height:7, borderRadius:"50%", background: ACCENT, boxShadow:`0 0 6px ${ACCENT}`, transform:"translateX(-50%)" }}/>
        </motion.div>
      </motion.div>

      {/* Greeting */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ textAlign:"center", marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color: t.text, margin:"0 0 5px", letterSpacing:"-0.4px" }}>
          {greeting}
        </h2>
        <p style={{ fontSize:13, color: t.sub, margin:0 }}>Your commerce AI is ready.</p>
      </motion.div>

      {/* Store metrics */}
      {storeData && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom:24 }}>
          {[
            { label:"Today", value: storeData.revenueToday > 0 ? `${sym}${storeData.revenueToday.toLocaleString()}` : `${sym}0`, alert: false },
            { label:"Pending", value: String(storeData.pendingOrders||0), alert: storeData.pendingOrders > 0 },
            { label:"Health",  value: storeData.healthScore ? `${storeData.healthScore}/100` : "–", alert: false },
          ].map(m => (
            <div key={m.label} style={{ padding:"7px 14px", borderRadius:9, background: t.surface, border:`1px solid ${m.alert ? t.amber+"40" : t.border}`, boxShadow: m.alert ? `0 0 10px ${t.amber}18` : "none" }}>
              <p style={{ fontSize:13, fontWeight:700, color: m.alert ? t.amber : t.accent, margin:0 }}>{m.value}</p>
              <p style={{ fontSize:9, color: t.muted, margin:0, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{m.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
        style={{ width:"100%", maxWidth:480 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
          {QUICK.map((q,i) => (
            <motion.button key={q.title}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22+i*0.05 }}
              whileHover={{ y:-2, transition:{ duration:0.12 } }} whileTap={{ scale:0.97 }}
              onClick={() => onSend(q.prompt)}
              style={{ padding:"11px 10px", borderRadius:11, border:`1px solid ${t.border}`, background: t.surface, cursor:"pointer", textAlign:"left", boxShadow: t.shadow }}>
              <span style={{ fontSize:17, display:"block", marginBottom:4 }}>{q.icon}</span>
              <span style={{ fontSize:11, fontWeight:600, color: t.text, display:"block", lineHeight:1.3 }}>{q.title}</span>
              <span style={{ fontSize:10, color: t.sub, display:"block", lineHeight:1.4, marginTop:1 }}>{q.sub}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Pending orders urgent card */}
      {storeData?.pendingOrders > 0 && (
        <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          whileHover={{ y:-1 }} whileTap={{ scale:0.98 }}
          onClick={() => onSend(`Help me fulfill my ${storeData.pendingOrders} pending orders right now.`)}
          style={{ width:"100%", maxWidth:480, padding:"10px 14px", borderRadius:10, border:`1px solid ${t.amber}35`, background:`${t.amber}0A`, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>📬</span>
          <div style={{ flex:1, textAlign:"left" }}>
            <p style={{ fontSize:13, fontWeight:600, color: t.amber, margin:0 }}>{storeData.pendingOrders} unfulfilled order{storeData.pendingOrders>1?"s":""}</p>
            <p style={{ fontSize:11, color:`${t.amber}90`, margin:0 }}>Customers are waiting — tap to act now</p>
          </div>
          <span style={{ color: t.amber, opacity:0.6 }}>→</span>
        </motion.button>
      )}

      <p style={{ fontSize:11, color: t.muted, margin:"14px 0 0", textAlign:"center" }}>
        Paste any product URL · Upload image or PDF · ⌘K
      </p>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface KIROChatProps {
  storeId?:               string;
  conversationId?:        string;
  briefMessage?:          string;
  className?:             string;
  onConversationCreated?: (id: string) => void;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function KIROChat({ storeId: propStoreId, conversationId: initConvId, onConversationCreated }: KIROChatProps) {
  const user    = useAuthStore(s => s.user);
  const token   = useAuthStore(s => s.accessToken);
  const storeId = propStoreId || user?.stores?.[0]?.id || "";

  // ── state ──────────────────────────────────────────────────────────────────
  const [mode,      setMode]      = useState<Mode>("light");
  const [messages,  setMessages]  = useState<Msg[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [convId,    setConvId]    = useState(initConvId || "");
  const [storeData, setStoreData] = useState<any>(null);
  const [attach,    setAttach]    = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceInterim, setVoiceInterim] = useState("");
  const [rateLimit, setRateLimit] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const recogRef  = useRef<any>(null);

  const t = T[mode];

  // ── sync mode from localStorage ────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("kiro-mode") as Mode | null;
    if (saved) setMode(saved);
    const handler = () => { const m = localStorage.getItem("kiro-mode") as Mode|null; if (m) setMode(m); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ── auto scroll ────────────────────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  // ── load store greeting ────────────────────────────────────────────────────
  useEffect(() => {
    if (!storeId) return;
    api.get(`/kai/greeting?storeId=${storeId}`)
      .then(r => setStoreData(r.data?.data?.storeContext || r.data?.data))
      .catch(() => {});
  }, [storeId]);

  // ── load conversation history ──────────────────────────────────────────────
  useEffect(() => {
    if (!initConvId) return;
    api.get(`/kai/conversation/${initConvId}`)
      .then(r => {
        const msgs = (r.data?.data?.messages || []).map((m: any) => ({
          id: m.id, role: m.role === "user" ? "user" : "assistant",
          content: m.content, ts: m.createdAt, actions: m.actions || [],
        }));
        if (msgs.length) setMessages(msgs);
      }).catch(() => {});
  }, [initConvId]);

  // ── voice ──────────────────────────────────────────────────────────────────
  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice works best in Chrome or Edge"); return; }
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      setVoiceInterim("");
      return;
    }
    const r = new SR();
    r.lang = "en-NG";
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e: any) => {
      let interim = "";
      let final   = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      // Show live interim in the bubble
      setVoiceInterim(interim);
      // Append final text to input
      if (final) setInput(prev => (prev ? prev + " " + final : final).trim());
    };
    r.onerror = (e: any) => {
      if (e.error !== "aborted") toast.error("Voice error — try again");
      setListening(false);
      setVoiceInterim("");
    };
    r.onend = () => { setListening(false); setVoiceInterim(""); };
    r.start();
    recogRef.current = r;
    setListening(true);
  };

  // ── file upload ────────────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) { toast.error("Max 20MB"); return; }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader(); r.onload=()=>res(r.result as string); r.onerror=rej; r.readAsDataURL(file);
      });
      const isImage = file.type.startsWith("image/");
      const isPDF   = file.type === "application/pdf";
      setAttach({ url: isImage ? dataUrl : undefined, base64: isPDF ? dataUrl.split(",")[1] : undefined, type: isImage ? "image" : isPDF ? "pdf" : "csv", name: file.name, size: file.size });
    } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  };

  // ── image generation ───────────────────────────────────────────────────────
  const generateImage = useCallback((prompt: string) => {
    const kid = `k${Date.now()}`;
    const clean = prompt.replace(/^(generate|create|make|draw)\s+(a[n]?\s+)?(image|photo|picture|visual)\s+(of\s+|for\s+)?/i,"").trim();
    const encoded = encodeURIComponent(`${clean}, product photography, clean background, professional, high quality`);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&seed=${Math.random()*9999|0}&nologo=true&model=flux`;
    setMessages(p => [...p, { id:kid, role:"assistant", content:`Generating image for "${clean}"…`, streaming:true, ts:new Date().toISOString() }]);
    const img = new Image();
    img.onload  = () => setMessages(p => p.map(m => m.id===kid ? { ...m, streaming:false, content:`Here's your image.`, imageUrl:url } : m));
    img.onerror = () => setMessages(p => p.map(m => m.id===kid ? { ...m, streaming:false, content:"Image generation unavailable. Try describing the product to me instead." } : m));
    img.src = url;
  }, []);

  // ── send ───────────────────────────────────────────────────────────────────
  const send = useCallback(async (override?: string) => {
    const text = (override || input).trim();
    if ((!text && !attach) || loading || !storeId) return;

    // Image gen intercept
    if (text && /^(generate|create|make|draw|show)\s+(a[n]?\s+)?(image|photo|picture|visual)/i.test(text) && !attach) {
      setMessages(p => [...p, { id:`u${Date.now()}`, role:"user", content:text, ts:new Date().toISOString() }]);
      if (!override) setInput("");
      generateImage(text);
      return;
    }

    const userMsg: Msg = { id:`u${Date.now()}`, role:"user", content: text || (attach ? `📎 ${attach.name}` : ""), imageUrl: attach?.type==="image" ? attach.url : undefined, ts:new Date().toISOString() };
    const kiroId = `k${Date.now()}`;
    const kiroMsg: Msg = { id:kiroId, role:"assistant", content:"", streaming:true, ts:new Date().toISOString() };

    setMessages(p => [...p, userMsg, kiroMsg]);
    if (!override) setInput("");
    setAttach(null);
    setLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const body: any = { message: text || "", storeId, conversationId: convId || undefined };
      if (attach?.type === "image" && attach.url?.startsWith("data:")) {
        body.imageBase64    = attach.url.split(",")[1];
        body.imageMediaType = attach.url.split(":")[1]?.split(";")[0] || "image/jpeg";
        body.imageUrl       = attach.url;
      } else if (attach?.url) body.imageUrl = attach.url;
      if (attach?.base64) { body.fileBase64 = attach.base64; body.fileType = attach.type; }
      if (attach?.name)   body.fileName = attach.name;

      const res = await fetch(`${BASE}/kai/smart-chat`, {
        method: "POST",
        headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        if (res.status === 429 || d?.code === "RATE_LIMIT") { setRateLimit(true); return; }
        throw new Error(d?.message || "Request failed");
      }

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let full = "";
      let newConvId = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value,{stream:true}).split("\n").filter(l=>l.startsWith("data: "))) {
          try {
            const p = JSON.parse(line.slice(6));
            if (p.token) { full += p.token; setMessages(m => m.map(x => x.id===kiroId ? {...x,content:full} : x)); }
            if (p.conversationId && !convId) newConvId = p.conversationId;
            if (p.actions?.length) setMessages(m => m.map(x => x.id===kiroId ? {...x, actions:[...(x.actions||[]),...p.actions].filter((a,i,arr)=>arr.findIndex(b=>b.type===a.type)===i)} : x));
            if (p.done) {
              if (newConvId) { setConvId(newConvId); onConversationCreated?.(newConvId); }
              // Parse any inline actions from text
              const inlineActions = parseActions(full);
              setMessages(m => m.map(x => x.id===kiroId ? {
                ...x, streaming:false,
                actions: [...(x.actions||[]), ...inlineActions].filter((a,i,arr)=>arr.findIndex(b=>b.type===a.type)===i),
              } : x));
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages(m => m.map(x => x.id===kiroId ? {...x, streaming:false, content:"Something went wrong. Check your connection and try again." } : x));
    } finally { setLoading(false); }
  }, [input, attach, loading, storeId, convId, token, generateImage, onConversationCreated]);

  // ── action handlers ────────────────────────────────────────────────────────
  const handleApprove = async (action: Action) => {
    try {
      const r = await api.post("/kai/action", { storeId, actions:[{...action,approved:true}] });
      const result = r.data?.results?.[0];
      if (result?.success) toast.success(result.message || "Done!");
      else if (result?.healedAction) {
        toast.loading("Auto-fixing…", {id:"heal"});
        const r2 = await api.post("/kai/action",{storeId,actions:[{...result.healedAction,approved:true}]});
        const r2res = r2.data?.results?.[0];
        if (r2res?.success) toast.success(r2res.message||"Fixed and done!",{id:"heal"});
        else toast.error(result?.message||"Action failed",{id:"heal"});
      } else toast.error(result?.message||"Action failed");
    } catch (e: any) { toast.error(e.response?.data?.message||"Failed"); }
  };

  const handleRate = (id: string, v: "up"|"down") => {
    setMessages(m => m.map(x => x.id===id ? {...x,thumbs:v} : x));
  };

  const handleRegen = async (id: string) => {
    const idx = messages.findIndex(m => m.id===id);
    if (idx < 1) return;
    const prev = messages.slice(0,idx).reverse().find(m=>m.role==="user");
    if (prev) { setMessages(m=>m.filter((_,i)=>i<idx)); send(prev.content); }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0, background: t.bg, fontFamily:"'Inter',system-ui,sans-serif", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes ks { to { transform: rotate(360deg); } }
        @keyframes voiceBar { 0%,100%{transform:scaleY(1);opacity:.5} 50%{transform:scaleY(2);opacity:1} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollbar}; border-radius: 2px; }
      `}</style>

      {/* Rate limit screen */}
      {rateLimit ? (
        <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔥</div>
          <h2 style={{ fontSize:20, fontWeight:700, color:t.text, margin:"0 0 8px" }}>You've hit your limit</h2>
          <p style={{ fontSize:14, color:t.sub, margin:"0 0 20px", maxWidth:280, lineHeight:1.6 }}>
            Free accounts get 5 KIRO sessions per month. Upgrade to keep going.
          </p>
          <button onClick={()=>window.open("/dashboard/billing","_blank")}
            style={{ padding:"11px 24px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${t.accent},${t.accentD})`, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            Unlock more sessions
          </button>
          <p style={{ fontSize:11, color:t.muted, margin:"12px 0 0" }}>Resets on the 1st of every month</p>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px 16px", minHeight:0, position:"relative" }}>
            {messages.length === 0 ? (
              <Welcome name={user?.name||"there"} storeData={storeData} onSend={send} t={t}/>
            ) : (
              messages.map(msg => (
                <MsgBubble key={msg.id} msg={msg} onApprove={handleApprove}
                  onDismiss={a=>setMessages(m=>m.map(x=>({...x,actions:(x.actions||[]).filter(b=>b!==a)})))}
                  onRate={handleRate} onRegen={handleRegen} t={t}/>
              ))
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Stop bar */}
          {loading && (
            <div style={{ padding:"8px 16px", borderTop:`1px solid ${t.border}`, background:t.surface, display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
              <Spinner size={14} color={t.accent}/>
              <span style={{ fontSize:12, color:t.sub, flex:1 }}>KIRO is thinking</span>
              <button onClick={()=>abortRef.current?.abort()}
                style={{ padding:"4px 12px", borderRadius:7, border:`1px solid ${t.border}`, background:"transparent", color:t.red, fontSize:12, cursor:"pointer" }}>
                ⏹ Stop
              </button>
            </div>
          )}

          {/* Attachment chip */}
          <AnimatePresence>
            {attach && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                style={{ padding:"6px 14px", borderTop:`1px solid ${t.border}`, background:t.surface, display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                {attach.type==="image" && attach.url && (
                  <img src={attach.url} alt="" style={{ width:32, height:32, borderRadius:6, objectFit:"cover" }}/>
                )}
                {attach.type!=="image" && <span style={{ fontSize:18 }}>{attach.type==="pdf"?"📄":"📊"}</span>}
                <span style={{ fontSize:12, color:t.sub, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{attach.name}</span>
                <button onClick={()=>setAttach(null)} style={{ width:20, height:20, borderRadius:"50%", border:"none", background:t.elevated, color:t.sub, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div style={{ padding:"10px 14px 14px", borderTop:`1px solid ${t.border}`, background:t.surface, flexShrink:0 }}>
            <div style={{ borderRadius:14, border:`1px solid ${t.border}`, background:t.bg, overflow:"hidden", boxShadow:t.shadow, transition:"border-color 0.15s, box-shadow 0.15s" }}
              onFocusCapture={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=t.accent;(e.currentTarget as HTMLDivElement).style.boxShadow=`0 0 0 3px ${t.accentBg}`;}}
              onBlurCapture={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=t.border;(e.currentTarget as HTMLDivElement).style.boxShadow=t.shadow;}}>

              <textarea ref={inputRef} value={input}
                onChange={e=>{ setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,160)+"px"; }}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
                onPaste={e=>{ const f=e.clipboardData.files?.[0]; if(f){handleFile(f);} }}
                placeholder="Message KIRO… paste a URL, describe a product, or ask anything"
                rows={1} style={{ width:"100%", background:"transparent", border:"none", outline:"none", color:t.text, fontSize:14, lineHeight:1.6, resize:"none", padding:"12px 14px 4px", maxHeight:160, overflowY:"auto" }}/>

              {/* Toolbar row */}
              <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px 8px" }}>
                {/* Image upload */}
                <button onClick={()=>{ fileRef.current!.accept="image/*"; fileRef.current?.click(); }} disabled={uploading} title="Upload image"
                  style={{ width:28, height:28, borderRadius:7, border:"none", background:"transparent", color:t.sub, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {uploading ? <Spinner size={12} color={t.accent}/> : "🖼"}
                </button>
                {/* File upload */}
                <button onClick={()=>{ fileRef.current!.accept="image/*,.pdf,.csv"; fileRef.current?.click(); }} disabled={uploading} title="Attach file"
                  style={{ width:28, height:28, borderRadius:7, border:"none", background:"transparent", color:t.sub, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  📎
                </button>
                {/* Voice — animated bars + live transcript */}
                <div style={{ position:"relative", display:"flex", alignItems:"center", gap:4 }}>
                  {listening && voiceInterim && (
                    <div style={{ position:"absolute", bottom:"calc(100% + 8px)", right:0, background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:"7px 12px", fontSize:12, color:t.text, whiteSpace:"nowrap", maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", boxShadow:t.shadow, zIndex:20, pointerEvents:"none" }}>
                      <span style={{ color:t.muted, fontSize:10, display:"block", marginBottom:2 }}>Listening…</span>
                      {voiceInterim}
                    </div>
                  )}
                  {listening && (
                    <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                      {[0,1,2,3,4].map(i => (
                        <div key={i} style={{ width:3, height:14, borderRadius:99, background:t.red, animation:`voiceBar 0.6s ease-in-out ${i*0.1}s infinite`, opacity:0.85 }}/>
                      ))}
                    </div>
                  )}
                  <button onClick={handleVoice} title={listening ? "Stop recording" : "Voice input"}
                    style={{ width:30, height:30, borderRadius:8, border:`1px solid ${listening ? t.red : t.border}`, background:listening ? `${t.red}15` : "transparent", color:listening ? t.red : t.sub, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 }}>
                    {listening
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    }
                  </button>
                </div>
                {/* Generate image */}
                <button onClick={()=>input.trim()?generateImage(input.trim()):toast.error("Describe what to generate")} title="Generate AI image"
                  style={{ padding:"3px 8px", borderRadius:6, border:`1px solid ${t.border}`, background:"transparent", color:t.accent, cursor:"pointer", fontSize:11, fontWeight:600 }}>
                  ✨ Image
                </button>

                <div style={{ flex:1 }}/>

                {input.length > 300 && (
                  <span style={{ fontSize:10, color:t.muted }}>{input.length}</span>
                )}

                {/* Send / stop */}
                <motion.button onClick={()=>loading?abortRef.current?.abort():send()} whileTap={{scale:0.9}}
                  style={{ width:32, height:32, borderRadius:9, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.18s",
                    background:loading?"rgba(220,38,38,0.12)":(input.trim()||attach)?`linear-gradient(135deg,${t.accent},${t.accentD})`:`${t.accent}18`,
                    boxShadow:(input.trim()||attach)&&!loading?`0 2px 10px ${t.accent}35`:"none" }}>
                  {loading
                    ? <Spinner size={12} color={t.red}/>
                    : <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={(input.trim()||attach)?"#fff":t.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </motion.button>
              </div>
            </div>

            <p style={{ fontSize:10, color:t.muted, textAlign:"center", margin:"6px 0 0" }}>
              KIRO · Built by Darkweb & DropOS
            </p>
          </div>
        </>
      )}

      <input ref={fileRef} type="file" accept="image/*,.pdf,.csv" style={{ display:"none" }}
        onChange={e=>{ if(e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value=""; }}/>
    </div>
  );
}
