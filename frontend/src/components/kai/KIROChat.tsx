"use client";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
// ─────────────────────────────────────────────────────────────────────────────
// KIRO Chat — Complete Rebuild
import { URLImporter, SkillsPanel, GoalsPanel, PulsePanel, MemoryPanel } from "./KIROPanels";
// Premium commerce AI interface for DropOS
// Features: response navigation, edit messages, branch, follow-ups, rate limit
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { api, uploadAPI } from "../../lib/api";
import toast from "react-hot-toast";

type Tab = "chat"|"import"|"skills"|"goals"|"pulse"|"memory";
const BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
const P = { v600:"#5B21B6", v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", v200:"#C4B5FD", v100:"#EDE9FE" };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  imageUrl?: string;
  fileName?: string;
  actions?: any[];
  timestamp?: string;
  // Response variants (regenerated versions)
  variants?: string[];
  variantIdx?: number;
  // Follow-up suggestions
  followUps?: string[];
  bookmarked?: boolean;
}

interface KIROChatProps {
  storeId?: string;
  initialMessage?: string;
  conversationId?: string;
  className?: string;
  compact?: boolean;
  onConversationCreated?: (id: string) => void;
}

// ── Action descriptions ───────────────────────────────────────────────────────
function getActionDesc(type: string, payload: any) {
  const fmt = (n: number) => `₦${(n||0).toLocaleString()}`;
  const map: Record<string, any> = {
    add_product:            { icon:"📦", cta:"Add to Store",   title:"Add Product",        summary:`"${payload?.name}" at ${fmt(payload?.price)}` },
    bulk_add_products:      { icon:"📥", cta:"Import All",     title:"Bulk Import",        summary:`${payload?.products?.length||0} products` },
    update_price:           { icon:"💰", cta:"Update Price",   title:"Price Change",       summary:`→ ${fmt(payload?.price)}` },
    update_stock:           { icon:"📦", cta:"Update Stock",   title:"Stock Update",       summary:`${payload?.quantity} units` },
    archive_product:        { icon:"🔒", cta:"Hide Product",   title:"Archive Product",    summary:"Remove from public store" },
    set_product_status:     { icon:"✅", cta:"Update",         title:"Product Status",     summary:payload?.status },
    create_coupon:          { icon:"🎟", cta:"Create Code",    title:"Discount Code",      summary:`${payload?.code} — ${payload?.discount||payload?.discountValue}% off` },
    fulfill_order:          { icon:"🚚", cta:"Fulfill",        title:"Fulfill Order",      summary:"Mark fulfilled, notify customer" },
    update_order_status:    { icon:"📋", cta:"Update",         title:"Order Status",       summary:(payload?.status||"").toLowerCase() },
    create_flash_sale:      { icon:"⚡", cta:"Launch Sale",    title:"Flash Sale",         summary:`${payload?.discountPercent}% off` },
    update_store_description:{ icon:"✏️",cta:"Update",        title:"Store Description",  summary:"Update public store copy" },
    update_product_image:   { icon:"📷", cta:"Add Image",      title:"Product Image",      summary:"Upload image to product" },
    update_product:         { icon:"✏️", cta:"Save Changes",   title:"Update Product",     summary:"Apply edits" },
    process_refund:         { icon:"💸", cta:"Process Refund",  title:"Refund Order",       summary:payload?.amount ? `Refund ₦${Number(payload.amount).toLocaleString()}` : "Process refund" },
    send_email:             { icon:"📧", cta:"Send Email",      title:"Send Email",          summary:payload?.subject || "Email campaign" },
    send_whatsapp:          { icon:"💬", cta:"Send Message",    title:"WhatsApp Message",   summary:(payload?.message||"").slice(0,40) || "WhatsApp broadcast" },
    import_from_url:        { icon:"🌐", cta:"Import Product", title:"Import from URL",    summary:`From ${payload?.platform||"web"}` },
  };
  return map[type] || { icon:"⚡", cta:"Run", title:type.replace(/_/g," "), summary:"Execute action" };
}

// ── Clean KIRO response text ──────────────────────────────────────────────────
function stripKIROAction(text: string): string {
  // Remove KIRO_ACTION blocks with any nesting depth using a bracket counter
  let result = "";
  let i = 0;
  while (i < text.length) {
    const markerIdx = text.indexOf("KIRO_ACTION", i);
    if (markerIdx === -1) { result += text.slice(i); break; }
    result += text.slice(i, markerIdx);
    // Skip past "KIRO_ACTION" and optional :, spaces, newlines, code fences
    let j = markerIdx + 11;
    while (j < text.length && /[:\s`\n]/.test(text[j])) j++;
    if (j < text.length && (text[j] === "j" || text.slice(j,j+4) === "json")) {
      // skip "json" keyword if present
      while (j < text.length && text[j] !== "{") j++;
    }
    if (j < text.length && text[j] === "{") {
      // Count brackets to find the matching closing brace
      let depth = 0;
      while (j < text.length) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") { depth--; if (depth === 0) { j++; break; } }
        j++;
      }
      // Also skip trailing newline + optional ``` fence
      while (j < text.length && (text[j] === "\n" || text[j] === "`" || text[j] === " ")) j++;
    }
    i = j;
  }
  return result;
}

function clean(text: string): string {
  return stripKIROAction(text)
    .replace(/```json[\s\S]*?```/gi, "")          // remove any code blocks
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")            // **bold** → plain
    .replace(/\*([^*\n]+)\*/g, "$1")               // *italic* → plain
    .replace(/^\s*[\*\-]\s/gm, "")                // bullet → remove
    .replace(/#{1,6}\s/g, "")                       // headings → remove
    .replace(/━+/g, "").replace(/^[-=]{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── KIRO Avatar (animated) ────────────────────────────────────────────────────
function KIROAvatar({ size = 32, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <motion.div
      style={{ width:size, height:size, borderRadius:Math.round(size*0.3), background:`linear-gradient(135deg,${P.v500},${P.v600})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}
      animate={pulse ? { boxShadow:["0 0 0 0 rgba(107,53,232,0)", "0 0 0 6px rgba(107,53,232,0.2)", "0 0 0 0 rgba(107,53,232,0)"] } : {}}
      transition={{ duration:2, repeat:Infinity }}>
      <svg width={size*0.55} height={size*0.55} viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 8l4 1-2 9 5-6-4-1 4-9z" fill="white" fillOpacity={0.9}/>
      </svg>
    </motion.div>
  );
}


// ── Content renderer — handles markdown-lite, code blocks, tables, inline images ──
function renderContent(text: string): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <div key={i} style={{ margin:"10px 0", borderRadius:10, overflow:"hidden", border:"1px solid rgba(107,53,232,0.2)" }}>
          {lang && <div style={{ padding:"4px 12px", background:"rgba(107,53,232,0.15)", fontSize:11, color:P.v300, fontWeight:600 }}>{lang}</div>}
          <pre style={{ margin:0, padding:"12px 14px", background:"rgba(0,0,0,0.3)", overflowX:"auto", fontSize:12, lineHeight:1.6, color:"#e2e8f0", fontFamily:"'Fira Code','Monaco','Consolas',monospace" }}>
            {codeLines.join("\n")}
          </pre>
          <button onClick={() => navigator.clipboard.writeText(codeLines.join("\n"))}
            style={{ width:"100%", padding:"5px", background:"rgba(107,53,232,0.08)", border:"none", color:"rgba(200,190,255,0.4)", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
            Copy code
          </button>
        </div>
      );
      i++;
      continue;
    }

    // Table (starts with |)
    if (line.startsWith("|") && lines[i+1]?.match(/^\|[-| ]+\|$/)) {
      const headers = line.split("|").filter(Boolean).map(h => h.trim());
      i += 2; // skip separator row
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i].split("|").filter(Boolean).map(c => c.trim()));
        i++;
      }
      nodes.push(
        <div key={i} style={{ overflowX:"auto", margin:"10px 0" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr>{headers.map((h, j) => (
                <th key={j} style={{ padding:"8px 12px", textAlign:"left", borderBottom:"1px solid rgba(107,53,232,0.2)", color:P.v300, fontWeight:700, fontSize:12, whiteSpace:"nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom:"1px solid rgba(107,53,232,0.08)" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding:"7px 12px", color:"rgba(200,190,255,0.8)", fontSize:13 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Inline image ![alt](url)
    const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      nodes.push(
        <img key={i} src={imgMatch[2]} alt={imgMatch[1]}
          style={{ maxWidth:"100%", maxHeight:300, borderRadius:10, margin:"8px 0", display:"block", objectFit:"contain" }}/>
      );
      i++; continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      nodes.push(
        <div key={i} style={{ display:"flex", gap:8, margin:"3px 0" }}>
          <span style={{ color:P.v300, fontWeight:700, flexShrink:0, fontSize:13, minWidth:20 }}>{numMatch[1]}.</span>
          <span style={{ fontSize:14, lineHeight:1.65, color:"#F0ECFF" }}>{inlineFormat(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    // Regular paragraph / empty line
    if (line.trim() === "") {
      nodes.push(<div key={i} style={{ height:6 }}/>);
    } else {
      nodes.push(
        <p key={i} style={{ margin:"2px 0", fontSize:14, lineHeight:1.7, color:"#F0ECFF" }}>
          {inlineFormat(line)}
        </p>
      );
    }
    i++;
  }
  return <>{nodes}</>;
}

function inlineFormat(text: string): React.ReactNode {
  // Handle inline code `...`
  const parts = text.split(/(`[^`]+`)/g);
  return <>{parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`")) {
      return <code key={i} style={{ background:"rgba(107,53,232,0.15)", padding:"1px 5px", borderRadius:4, fontSize:12, fontFamily:"'Fira Code','Monaco',monospace", color:P.v300 }}>{p.slice(1,-1)}</code>;
    }
    return p;
  })}</>;
}

// ── Action Card ───────────────────────────────────────────────────────────────
function ActionCard({ action, onApprove, onDismiss }: any) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const desc = getActionDesc(action.type, action.payload);
  if (done) return null;
  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
      style={{ marginTop:10, borderRadius:14, overflow:"hidden", border:`1px solid rgba(107,53,232,0.25)`, background:"rgba(107,53,232,0.06)" }}>
      <div style={{ padding:"11px 14px", display:"flex", alignItems:"flex-start", gap:10 }}>
        <span style={{ fontSize:20, flexShrink:0, lineHeight:1 }}>{desc.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:12, fontWeight:700, color:P.v300, margin:0 }}>{desc.title}</p>
          <p style={{ fontSize:12, color:"rgba(200,190,255,0.6)", margin:"2px 0 0" }}>{desc.summary}</p>
        </div>
      </div>
      <div style={{ padding:"0 14px 12px", display:"flex", gap:8 }}>
        <button onClick={async()=>{setLoading(true);await onApprove(action);setDone(true);setLoading(false);}}
          disabled={loading}
          style={{ padding:"7px 18px", borderRadius:9, border:"none", background:`linear-gradient(135deg,${P.v500},${P.v600})`, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
          {loading ? <><span style={{width:10,height:10,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"block"}}/> Working</> : <>{desc.cta}</>}
        </button>
        <button onClick={()=>onDismiss(action)}
          style={{ padding:"7px 12px", borderRadius:9, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"rgba(200,190,255,0.5)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          Not now
        </button>
      </div>
    </motion.div>
  );
}

// ── Rate Limit Screen ─────────────────────────────────────────────────────────
function RateLimitScreen({ plan, onUpgrade }: { plan: string; onUpgrade: () => void }) {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d+1)%4), 500);
    return () => clearInterval(t);
  }, []);
  const dotStr = ".".repeat(dots);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", textAlign:"center" }}>
      <motion.div
        animate={{ rotate:[0,10,-10,0], scale:[1,1.05,1] }}
        transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
        style={{ fontSize:56, marginBottom:20 }}>
        🔥
      </motion.div>
      <p style={{ fontSize:20, fontWeight:800, color:"#F0ECFF", margin:"0 0 8px", letterSpacing:"-0.5px" }}>
        KIRO ran hot{dotStr}
      </p>
      <p style={{ fontSize:14, color:"rgba(200,190,255,0.6)", margin:"0 0 24px", maxWidth:280, lineHeight:1.6 }}>
        {plan === "FREE"
          ? "Free accounts get 5 KIRO sessions per month. You have hit your limit for now."
          : "You have hit your monthly KIRO message limit. Upgrade to keep going."}
      </p>
      {plan === "FREE" && (
        <div style={{ background:"rgba(107,53,232,0.12)", border:"1px solid rgba(107,53,232,0.3)", borderRadius:14, padding:"16px 20px", marginBottom:20, maxWidth:300 }}>
          <p style={{ fontSize:12, fontWeight:700, color:P.v300, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Growth Plan — ₦9,500/mo</p>
          <p style={{ fontSize:13, color:"rgba(200,190,255,0.7)", margin:0, lineHeight:1.5 }}>200 KIRO sessions · Unlimited products · All power tools</p>
        </div>
      )}
      <button onClick={onUpgrade}
        style={{ padding:"12px 28px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${P.v500},${P.v600})`, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 20px rgba(107,53,232,0.4)" }}>
        Unlock More Sessions
      </button>
      <p style={{ fontSize:11, color:"rgba(200,190,255,0.3)", margin:"16px 0 0" }}>Limit resets on the 1st of every month</p>
    </motion.div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, onApprove, onDismiss, onRegenerate, onEdit, onBookmark, onFollowUp, onBranch }: any) {
  const [showTools, setShowTools] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);
  const isUser = msg.role === "user";
  const content = clean(msg.content || "");
  const currentVariant = msg.variants?.[msg.variantIdx ?? 0] ?? content;

  const copy = () => {
    navigator.clipboard.writeText(clean(currentVariant));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(clean(currentVariant).slice(0,500))}`, "_blank");
  };

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
      style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", gap:10, alignItems:"flex-end", marginBottom:18, position:"relative" }}
      onMouseEnter={() => setShowTools(true)}
      onMouseLeave={() => setShowTools(false)}>

      {/* KIRO avatar */}
      {!isUser && <KIROAvatar size={30} pulse={!!msg.isStreaming}/>}

      <div style={{ maxWidth:"82%", minWidth:40 }}>

        {/* Image attachment */}
        {msg.imageUrl && (
          <img src={msg.imageUrl} alt="" style={{ maxWidth:"100%", maxHeight:180, borderRadius:12, marginBottom:6, objectFit:"cover", display:"block" }}/>
        )}
        {msg.fileName && !msg.imageUrl && (
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:8, background:"rgba(255,255,255,0.06)", marginBottom:6, fontSize:11, color:"rgba(200,190,255,0.5)" }}>
            📎 {msg.fileName}
          </div>
        )}

        {/* Main bubble */}
        <div style={{
          padding: isUser ? "10px 16px" : "2px 0",
          borderRadius: isUser ? "18px 18px 4px 18px" : "0",
          background: isUser ? `linear-gradient(135deg,${P.v500},${P.v600})` : "transparent",
          color: isUser ? "#fff" : "#F0ECFF",
          fontSize: 14,
          lineHeight: 1.7,
        }}>

          {/* Streaming */}
          {msg.isStreaming && !msg.content ? (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
              {[0,1,2].map(i => (
                <motion.span key={i}
                  style={{ width:7, height:7, borderRadius:"50%", background:P.v400, display:"block" }}
                  animate={{ y:[0,-5,0], opacity:[0.4,1,0.4] }}
                  transition={{ duration:0.7, repeat:Infinity, delay:i*0.15 }}/>
              ))}
              <span style={{ fontSize:12, color:"rgba(200,190,255,0.5)", marginLeft:4 }}>KIRO is thinking</span>
            </div>
          ) : editing && isUser ? (
            <div>
              <textarea value={editText} onChange={e=>setEditText(e.target.value)}
                style={{ width:"100%", padding:"8px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:14, fontFamily:"inherit", resize:"none", outline:"none", minHeight:60 }}
                autoFocus/>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <button onClick={() => { onEdit(msg.id, editText); setEditing(false); }}
                  style={{ padding:"5px 14px", borderRadius:8, border:"none", background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                  Resend
                </button>
                <button onClick={() => { setEditing(false); setEditText(msg.content); }}
                  style={{ padding:"5px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{ margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
              {msg.isStreaming
                ? <>{clean(msg.content||"")}<motion.span animate={{opacity:[1,0]}} transition={{duration:0.5,repeat:Infinity}}>▋</motion.span></>
                : renderContent(clean(currentVariant || msg.content || ""))}
            </p>
          )}

          {/* Action cards */}
          {!isUser && msg.actions?.map((action: any, i: number) => (
            <ActionCard key={i} action={action} onApprove={onApprove} onDismiss={onDismiss}/>
          ))}
        </div>

        {/* Response navigation (variants) */}
        {!isUser && !msg.isStreaming && (msg.variants?.length ?? 0) > 1 && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
            <button onClick={() => onRegenerate(msg.id, "prev")}
              disabled={(msg.variantIdx ?? 0) === 0}
              style={{ width:22, height:22, borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(200,190,255,0.5)", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", opacity:(msg.variantIdx??0)===0?0.3:1 }}>
              ‹
            </button>
            <span style={{ fontSize:11, color:"rgba(200,190,255,0.4)" }}>
              {(msg.variantIdx ?? 0) + 1} / {msg.variants.length}
            </span>
            <button onClick={() => onRegenerate(msg.id, "next")}
              disabled={(msg.variantIdx ?? 0) >= (msg.variants?.length||1) - 1}
              style={{ width:22, height:22, borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(200,190,255,0.5)", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", opacity:(msg.variantIdx??0)>=(msg.variants?.length||1)-1?0.3:1 }}>
              ›
            </button>
          </div>
        )}

        {/* Suggested follow-ups */}
        {!isUser && !msg.isStreaming && msg.followUps && msg.followUps.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
            {msg.followUps.map((fu: string, i: number) => (
              <button key={i} onClick={() => onFollowUp(fu)}
                style={{ padding:"5px 12px", borderRadius:99, border:"1px solid rgba(107,53,232,0.3)", background:"rgba(107,53,232,0.08)", color:P.v300, fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}
                onMouseEnter={e => { (e.target as any).style.background = "rgba(107,53,232,0.18)"; }}
                onMouseLeave={e => { (e.target as any).style.background = "rgba(107,53,232,0.08)"; }}>
                {fu}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {msg.timestamp && !msg.isStreaming && (
          <p style={{ fontSize:10, color:"rgba(200,190,255,0.25)", margin:"4px 0 0", textAlign:isUser?"right":"left" }}>
            {new Date(msg.timestamp).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})}
            {msg.bookmarked && " · ⭐"}
          </p>
        )}
      </div>

      {/* Message toolbar — appears on hover */}
      <AnimatePresence>
        {showTools && !msg.isStreaming && (
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
            style={{ position:"absolute", [isUser?"left":"right"]:-90, bottom:0, display:"flex", flexDirection:"column", gap:4, zIndex:10 }}>
            {[
              { icon:"📋", label:"Copy",      action: copy },
              ...(isUser ? [{ icon:"✏️", label:"Edit",      action:()=>setEditing(true) }] : []),
              ...(!isUser ? [
                { icon:"↻",  label:"Retry",      action:()=>onRegenerate(msg.id, "new") },
                { icon:"🔊", label:"Listen",     action:()=>{
                  const u = new SpeechSynthesisUtterance(clean(currentVariant||msg.content||"").slice(0,500));
                  u.lang="en-NG"; u.rate=1.05;
                  window.speechSynthesis.speak(u);
                }},
                { icon:"🌿", label:"Branch",     action:()=>onBranch(msg.id) },
                { icon:msg.bookmarked?"⭐":"☆", label:"Star", action:()=>onBookmark(msg.id) },
                { icon:"📤", label:"Share",      action:shareWA },
              ] : []),
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} title={btn.label}
                style={{ width:28, height:28, borderRadius:8, border:"1px solid rgba(107,53,232,0.2)", background:"rgba(15,10,30,0.9)", color:"rgba(200,190,255,0.7)", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
                {btn.icon === "↻" ? <span style={{fontSize:14}}>↻</span> : btn.icon}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Beautiful empty state ─────────────────────────────────────────────────────
function EmptyState({ greeting, contextLine, storeData, onSend }: any) {
  const QUICK = [
    { icon:"📊", label:"Store summary",       prompt:"Give me my full store summary — revenue, orders, what needs attention today." },
    { icon:"🔥", label:"What's trending now",  prompt:"What products are trending right now in Nigeria that I can add to my store?" },
    { icon:"⚡", label:"Launch flash sale",     prompt:"Help me set up a flash sale tonight on my best products." },
    { icon:"🌐", label:"Import a product",      prompt:"I want to import a product from AliExpress or Temu. How do I start?" },
    { icon:"📣", label:"WhatsApp broadcast",    prompt:"Write a WhatsApp broadcast message I can send to customers today to drive sales." },
    { icon:"🚀", label:"Grow my store",         prompt:"Give me a 5-step action plan to grow my store revenue this month." },
  ];

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}}
      style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 20px 20px", overflowY:"auto" }}>

      {/* Animated KIRO orb */}
      <div style={{ position:"relative", marginBottom:28 }}>
        <motion.div
          animate={{ scale:[1,1.06,1] }}
          transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
          style={{ width:72, height:72, borderRadius:22, background:`linear-gradient(135deg,${P.v500},${P.v600})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 40px rgba(107,53,232,0.45), 0 0 80px rgba(107,53,232,0.2)` }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14l9 0-1 8 10-12-9 0L13 2z" fill="white" fillOpacity={0.95}/>
          </svg>
        </motion.div>
        {/* Orbiting dot */}
        <motion.div
          animate={{ rotate:360 }}
          transition={{ duration:4, repeat:Infinity, ease:"linear" }}
          style={{ position:"absolute", inset:-10, borderRadius:"50%", border:"1px solid transparent" }}>
          <div style={{ position:"absolute", top:-3, left:"50%", width:8, height:8, borderRadius:"50%", background:P.v300, boxShadow:`0 0 8px ${P.v300}`, transform:"translateX(-50%)" }}/>
        </motion.div>
      </div>

      {/* Greeting */}
      <h2 style={{ fontSize:24, fontWeight:800, color:"#F0ECFF", margin:"0 0 6px", textAlign:"center", letterSpacing:"-0.5px" }}>
        {greeting || "Welcome back"}
      </h2>
      <p style={{ fontSize:14, color:"rgba(200,190,255,0.55)", margin:"0 0 6px", textAlign:"center" }}>
        {contextLine || "Your commerce intelligence is ready."}
      </p>

      {/* Live store pulse */}
      {storeData && (
        <div style={{ display:"flex", gap:10, margin:"16px 0 24px", flexWrap:"wrap", justifyContent:"center" }}>
          {[
            { label:"Today",   value:storeData.today || "₦0" },
            { label:"Orders",  value:storeData.orders || "0" },
            { label:"Health",  value:storeData.health || "--" },
          ].map(s => (
            <div key={s.label}
              style={{ padding:"8px 16px", borderRadius:12, background:"rgba(107,53,232,0.1)", border:"1px solid rgba(107,53,232,0.2)" }}>
              <p style={{ fontSize:10, color:"rgba(200,190,255,0.45)", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.1em" }}>{s.label}</p>
              <p style={{ fontSize:15, fontWeight:800, color:P.v300, margin:0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick action grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:8, width:"100%", maxWidth:380, marginBottom:16 }}>
        {QUICK.map(a => (
          <motion.button key={a.label} onClick={() => onSend(a.prompt)}
            whileHover={{ scale:1.02, background:"rgba(107,53,232,0.16)" }}
            whileTap={{ scale:0.97 }}
            style={{ padding:"12px 14px", borderRadius:14, border:"1px solid rgba(107,53,232,0.18)", background:"rgba(107,53,232,0.08)", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s" }}>
            <span style={{ fontSize:18, display:"block", marginBottom:4 }}>{a.icon}</span>
            <span style={{ fontSize:12, fontWeight:600, color:"rgba(200,190,255,0.8)", display:"block", lineHeight:1.3 }}>{a.label}</span>
          </motion.button>
        ))}
      </div>

      <p style={{ fontSize:11, color:"rgba(200,190,255,0.2)", textAlign:"center" }}>
        Paste a product URL · Upload an image · Ask anything
      </p>
    </motion.div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
function TabBar({ activeTab, setActiveTab, pulseCount }: any) {
  const TABS = [
    { id:"chat" as Tab,   icon:"💬", label:"Chat" },
    { id:"import" as Tab, icon:"🌐", label:"Import" },
    { id:"skills" as Tab, icon:"⚡", label:"Skills" },
    { id:"goals" as Tab,  icon:"🎯", label:"Goals" },
    { id:"pulse" as Tab,  icon:"🔔", label:"Pulse", badge:pulseCount },
    { id:"memory" as Tab, icon:"🧠", label:"Memory" },
  ];
  return (
    <div style={{ display:"flex", borderTop:"1px solid rgba(107,53,232,0.12)", background:"rgba(7,5,15,0.95)" }}>
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
          style={{ flex:1, padding:"8px 4px 10px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative",
            borderBottom:`2px solid ${activeTab===tab.id ? P.v400 : "transparent"}`,
            transition:"border-color 0.15s" }}>
          <span style={{ fontSize:16 }}>{tab.icon}</span>
          <span style={{ fontSize:9, fontWeight:600, color:activeTab===tab.id ? P.v300 : "rgba(200,190,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{tab.label}</span>
          {"badge" in tab && (tab as any).badge > 0 && (
            <span style={{ position:"absolute", top:6, right:"calc(50% - 16px)", minWidth:14, height:14, borderRadius:7, background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>
              {(tab as any).badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KIROChat({ storeId: propStoreId, initialMessage, conversationId: initConvId, onConversationCreated }: KIROChatProps) {
  const { user } = useAuthStore();
  const token  = useAuthStore(s => s.accessToken);
  const storeId = propStoreId || user?.stores?.[0]?.id || "";

  const [messages,    setMessages]  = useState<Message[]>([]);
  const [input,       setInput]     = useState(initialMessage || "");
  const [loading,     setLoading]   = useState(false);
  const [convId,      setConvId]    = useState(initConvId || "");
  const [greeting,    setGreeting]  = useState<any>(null);
  const [storeData,   setStoreData] = useState<any>(null);
  const [attachments,  setAttachments] = useState<any[]>([]);
  const [attachment,   setAttach]     = useState<any>(null); // kept for compat
  const [uploading,   setUploading] = useState(false);
  const [histLoaded,  setHistLoaded]= useState(false);
  const [rateLimit,   setRateLimit] = useState(false);
  const [activeTab,   setActiveTab] = useState<"chat"|"import"|"skills"|"goals"|"pulse">("chat");
  const [pulseCount,  setPulseCount]= useState(0);
  const [lastFailedMsg, setLastFailedMsg] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recogRef = useRef<any>(null);

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice not supported in this browser. Try Chrome."); return; }
    if (isListening) { recogRef.current?.stop(); setIsListening(false); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = "en-NG";
    r.onresult = (e: any) => {
      const t2 = Array.from(e.results).map((res: any) => res[0].transcript).join("");
      setInput(t2);
      if (inputRef.current) { inputRef.current.style.height = "auto"; inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 180) + "px"; }
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.start(); recogRef.current = r; setIsListening(true);
  };

  // Auto-retry last failed message on reconnect
  useConnectionStatus({
    onReconnect: () => {
      if (lastFailedMsg && !loading) {
        setLastFailedMsg(null);
        send(lastFailedMsg);
      }
    },
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef  = useRef<AbortController|null>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  // Load greeting + store data
  useEffect(() => {
    if (!storeId) return;
    api.get(`/kai/greeting?storeId=${storeId}`)
      .then(r => {
        setGreeting(r.data?.data);
        setStoreData({
          today:   r.data?.data?.revenueToday ? `₦${r.data.data.revenueToday.toLocaleString()}` : "₦0",
          orders:  r.data?.data?.pendingOrders || "0",
          health:  r.data?.data?.healthScore ? `${r.data.data.healthScore}/100` : "--",
        });
      }).catch(() => {});
    api.get(`/kai/pulse?storeId=${storeId}`)
      .then(r => setPulseCount((r.data?.data || []).filter((a: any) => !a.read).length))
      .catch(() => {});
  }, [storeId]);

  // Load conversation history ONLY when a specific conversationId is provided via props
  // New chats start clean
  useEffect(() => {
    if (!initConvId || histLoaded) return;  // only load if explicitly given a convId
    setHistLoaded(true);
    api.get(`/kai/conversation/${initConvId}`)
      .then(r => {
        const conv = r.data?.data;
        const msgs = (conv?.messages || []).map((m: any) => ({
          id: m.id, role: m.role, content: m.content,
          timestamp: m.createdAt, actions: m.actions || [],
        }));
        if (msgs.length) setMessages(msgs);
      }).catch(() => {});
  }, [initConvId, histLoaded]);

  // Generate follow-up suggestions for KIRO responses
  const generateFollowUps = useCallback((responseText: string, userQuery: string): string[] => {
    const t = (responseText + userQuery).toLowerCase();
    if (t.includes("sales") || t.includes("revenue"))
      return ["Show me which products drove this", "What should I do differently next week?", "Compare to last month"];
    if (t.includes("product") || t.includes("inventory"))
      return ["Price this for maximum profit", "Write a TikTok script for it", "What else should I add?"];
    if (t.includes("trend") || t.includes("sell"))
      return ["How do I source this?", "What margin can I expect?", "Who is buying this in Nigeria?"];
    if (t.includes("order") || t.includes("fulfill"))
      return ["Send a shipping update to the customer", "Show all pending orders", "Mark as fulfilled"];
    return ["Tell me more", "What should I do first?", "Give me a specific action plan"];
  }, []);

  // ── Core send function ────────────────────────────────────────────────────
  const send = useCallback(async (overrideMsg?: string) => {
    const text = (overrideMsg || input).trim();
    if ((!text && !attachment) || loading || !storeId) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`, role:"user", content: text || (attachment ? `📎 ${attachment.name||"Image"}` : ""),
      imageUrl: attachment?.url, fileName: !attachment?.url ? attachment?.name : undefined,
      timestamp: new Date().toISOString(),
    };
    const kiroId = `k-${Date.now()}`;
    const kiroMsg: Message = { id:kiroId, role:"assistant", content:"", isStreaming:true, timestamp:new Date().toISOString() };

    setMessages(p => [...p, userMsg, kiroMsg]);
    if (!overrideMsg) setInput("");
    setAttach(null);
    setLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const body: any = { message:text||"", storeId, conversationId:convId||undefined };
      if (attachment?.url?.startsWith("data:image/")) {
        const parts = attachment.url.split(",");
        body.imageBase64 = parts[1];
        body.imageMediaType = parts[0].split(":")[1]?.split(";")[0] || "image/jpeg";
        body.imageUrl = attachment.url;
      } else if (attachment?.url) {
        body.imageUrl = attachment.url;
      }
      if (attachment?.base64) { body.fileBase64 = attachment.base64; body.fileType = attachment.type; }
      if (attachment?.name) body.fileName = attachment.name;

      const res = await fetch(`${BASE}/kai/smart-chat`, {
        method:"POST",
        headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429 || errData?.code === "RATE_LIMIT") { setRateLimit(true); return; }
        throw new Error(errData?.message || "Request failed");
      }

      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let full = "";
      let newConvId = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream:true });
        for (const line of chunk.split("\n").filter(l => l.startsWith("data: "))) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.token) {
              full += parsed.token;
              setMessages(p => p.map(m => m.id === kiroId ? { ...m, content:full } : m));
            }
            if (parsed.conversationId && !convId) { newConvId = parsed.conversationId; }
            if (parsed.actions?.length) {
              setMessages(p => p.map(m => m.id === kiroId ? { ...m, actions:parsed.actions } : m));
            }
            if (parsed.done) {
              if (newConvId) { setConvId(newConvId); onConversationCreated?.(newConvId); }
              const followUps = generateFollowUps(full, text);
              setMessages(p => p.map(m => m.id === kiroId
                ? { ...m, isStreaming:false, variants:[clean(full)], variantIdx:0, followUps }
                : m
              ));
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      const errTxt = (err as any).message || "Something went wrong. Type your question again.";
      setLastFailedMsg(text);  // remember for auto-retry on reconnect
      setMessages(p => p.map(m => m.id === kiroId
        ? { ...m, isStreaming:false, content:`${errTxt.includes("fetch") || errTxt.includes("network") ? "Connection issue — check your internet and try again." : "I ran into an issue. Try again or ask something slightly different."}` }
        : m
      ));
    } finally {
      setLoading(false);
    }
  }, [input, attachment, loading, storeId, convId, token, generateFollowUps, onConversationCreated]);

  // ── Approve action ────────────────────────────────────────────────────────
  const handleApprove = async (action: any) => {
    try {
      const r = await api.post("/kai/action", { storeId, actions:[{ ...action, approved:true }] });
      const result = r.data?.results?.[0];
      if (result?.success) {
        toast.success(result.message || "Done!");
      } else {
        // Self-healing: if backend sent a corrected action, retry automatically
        if (result?.healedAction) {
          toast.loading("Retrying with auto-fix...", { id:"heal" });
          try {
            const r2 = await api.post("/kai/action", { storeId, actions:[{ ...result.healedAction, approved:true }] });
            const result2 = r2.data?.results?.[0];
            if (result2?.success) {
              toast.success(result2.message || "Fixed and done!", { id:"heal" });
              return;
            }
          } catch {}
          toast.error(result?.message || "Action failed even after auto-fix", { id:"heal" });
        } else {
          toast.error(result?.message || "Action failed");
        }
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed — check your connection");
    }
  };

  // ── Regenerate / navigate variants ───────────────────────────────────────
  const handleRegenerate = async (msgId: string, direction: "prev"|"next"|"new") => {
    const msgIdx = messages.findIndex(m => m.id === msgId);
    if (msgIdx < 0) return;
    const msg = messages[msgIdx];

    if (direction === "prev") {
      setMessages(p => p.map(m => m.id === msgId ? { ...m, variantIdx:Math.max(0,(m.variantIdx??0)-1) } : m));
      return;
    }
    if (direction === "next" && (msg.variantIdx??0) < (msg.variants?.length||1)-1) {
      setMessages(p => p.map(m => m.id === msgId ? { ...m, variantIdx:(m.variantIdx??0)+1 } : m));
      return;
    }

    // Generate new variant
    const prevUserMsg = messages.slice(0, msgIdx).reverse().find(m => m.role === "user");
    if (!prevUserMsg) return;

    setMessages(p => p.map(m => m.id === msgId ? { ...m, isStreaming:true, content:"" } : m));
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/kai/smart-chat`, {
        method:"POST",
        headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body: JSON.stringify({ message:prevUserMsg.content, storeId, conversationId:convId }),
      });
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream:true });
        for (const line of chunk.split("\n").filter(l => l.startsWith("data: "))) {
          try {
            const p2 = JSON.parse(line.slice(6));
            if (p2.token) {
              full += p2.token;
              setMessages(p => p.map(m => m.id === msgId ? { ...m, content:full } : m));
            }
          } catch {}
        }
      }
      setMessages(p => p.map(m => m.id === msgId ? {
        ...m, isStreaming:false,
        variants:[...(m.variants||[clean(m.content||"")]), clean(full)],
        variantIdx:(m.variants?.length||1),
      } : m));
    } catch {}
    finally { setLoading(false); }
  };

  // ── Edit user message ─────────────────────────────────────────────────────
  const handleEdit = (msgId: string, newText: string) => {
    const msgIdx = messages.findIndex(m => m.id === msgId);
    if (msgIdx < 0) return;
    // Remove all messages after this one, update this one, then resend
    const trimmed = messages.slice(0, msgIdx);
    setMessages(trimmed);
    send(newText);
  };

  // ── Branch conversation ───────────────────────────────────────────────────
  const handleBranch = (msgId: string) => {
    const msgIdx = messages.findIndex(m => m.id === msgId);
    if (msgIdx < 0) return;
    // Open new tab/window with same messages up to this point
    const branchData = encodeURIComponent(JSON.stringify(messages.slice(0, msgIdx+1)));
    toast.success("Branch saved — start a new chat from this point", { duration:3000 });
    // For now, copy the context up to this point
    const ctx = messages.slice(0, msgIdx+1).map(m => `${m.role === "user" ? "You" : "KIRO"}: ${m.content}`).join("\n\n");
    navigator.clipboard.writeText(ctx).catch(() => {});
  };

  // ── Bookmark ──────────────────────────────────────────────────────────────
  const handleBookmark = (msgId: string) => {
    setMessages(p => p.map(m => m.id === msgId ? { ...m, bookmarked:!m.bookmarked } : m));
    toast.success("Message starred");
  };

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) { toast.error("File too large — max 20MB"); return; }
    const isImage = file.type.startsWith("image/");
    const isPDF   = file.type === "application/pdf";
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((res,rej) => {
        const r = new FileReader(); r.onload=()=>res(r.result as string); r.onerror=rej; r.readAsDataURL(file);
      });
      const att = isImage
        ? { url:dataUrl, type:"image", name:file.name, size:file.size }
        : { url:dataUrl, base64:dataUrl.split(",")[1], type:isPDF?"pdf":"csv", name:file.name, size:file.size };
      setAttach(att);     // legacy compat
      setAttachments(p => [...p.slice(-2), att]); // keep last 3 attachments
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  // Drag-and-drop support
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files?.[0];
    if (file) handleFile(file);
  };

  // Generate image via Replicate/Together AI API through backend
  const generateImage = async (prompt: string) => {
    const kiroId = `k-${Date.now()}`;
    const kiroMsg: Message = { id:kiroId, role:"assistant", content:"Generating image...", isStreaming:true, timestamp:new Date().toISOString() };
    setMessages(p => [...p, kiroMsg]);
    setLoading(true);
    try {
      const r = await api.post("/kai/generate-image", { prompt, storeId });
      const imgUrl = r.data?.data?.url;
      if (imgUrl) {
        setMessages(p => p.map(m => m.id === kiroId
          ? { ...m, isStreaming:false, content:`Here's your image. You can use it for your product listing or marketing.\n\n![Generated](${imgUrl})`, imageUrl:imgUrl }
          : m
        ));
      } else {
        setMessages(p => p.map(m => m.id === kiroId ? { ...m, isStreaming:false, content:"Image generation failed. Make sure REPLICATE_API_TOKEN is set in your environment." } : m));
      }
    } catch {
      setMessages(p => p.map(m => m.id === kiroId ? { ...m, isStreaming:false, content:"Image generation isn't configured yet. Add REPLICATE_API_TOKEN to your Render environment." } : m));
    } finally { setLoading(false); }
  };

  // ── Panels (lazy import) ──────────────────────────────────────────────────
  const [PanelComponents, setPanelComponents] = useState<any>(null);
  useEffect(() => {
    import("./KIROPanels").then(m => setPanelComponents(m)).catch(() => {});
  }, []);

  const plan = user?.subscription?.plan || "FREE";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"#07050F", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif", position:"relative", overflow:"hidden" }}>

      {/* Ambient background glow */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:-200, left:"50%", transform:"translateX(-50%)", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(107,53,232,0.12) 0%,transparent 70%)" }}/>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(107,53,232,0.3); border-radius:2px; }
        textarea { scrollbar-width:thin; }
      `}</style>

      {rateLimit ? (
        <RateLimitScreen plan={plan} onUpgrade={() => window.open("/dashboard/settings/billing","_blank")}/>
      ) : (
        <>
          {/* Stop generation bar */}
          <AnimatePresence>
            {loading && messages.length > 0 && !messages[messages.length-1]?.content && (
              <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", padding:"8px 16px", background:"rgba(10,7,22,0.95)", borderBottom:"1px solid rgba(107,53,232,0.15)", backdropFilter:"blur(8px)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <motion.div style={{ display:"flex", gap:4 }}>
                    {[0,1,2].map(i => (
                      <motion.span key={i} style={{ width:5, height:5, borderRadius:"50%", background:P.v400, display:"block" }}
                        animate={{ y:[0,-5,0] }} transition={{ duration:0.7, repeat:Infinity, delay:i*0.15 }}/>
                    ))}
                  </motion.div>
                  <span style={{ fontSize:12, color:"rgba(200,190,255,0.6)" }}>KIRO is thinking</span>
                  <button onClick={() => abortRef.current?.abort()}
                    style={{ padding:"3px 12px", borderRadius:8, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.1)", color:"#ef4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", marginLeft:8 }}>
                    ⏹ Stop
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages area */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px 16px", position:"relative", zIndex:1 }}>
            {messages.length === 0 ? (
              <EmptyState
                greeting={greeting?.greeting}
                contextLine={greeting?.contextLine}
                storeData={storeData}
                onSend={send}/>
            ) : (
              messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onApprove={handleApprove}
                  onDismiss={(action: any) => setMessages(p => p.map(m => ({ ...m, actions:(m.actions||[]).filter(a => a !== action) })))}
                  onRegenerate={handleRegenerate}
                  onEdit={handleEdit}
                  onBookmark={handleBookmark}
                  onFollowUp={send}
                  onBranch={handleBranch}
                />
              ))
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Scroll to bottom button — appears when user scrolls up */}
          <AnimatePresence>
            {messages.length > 4 && (
              <motion.button initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.8}}
                onClick={() => bottomRef.current?.scrollIntoView({ behavior:"smooth" })}
                style={{ position:"absolute", bottom:280, right:16, width:32, height:32, borderRadius:"50%", border:"1px solid rgba(107,53,232,0.3)", background:"rgba(10,7,22,0.9)", color:P.v300, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, zIndex:5, backdropFilter:"blur(8px)", boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }}>
                ↓
              </motion.button>
            )}
          </AnimatePresence>

          {/* Panel content (Skills / Goals / Pulse / Import) */}
          <AnimatePresence>
            {activeTab !== "chat" && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:300,opacity:1}} exit={{height:0,opacity:0}}
                style={{ overflow:"hidden", borderTop:"1px solid rgba(107,53,232,0.12)", background:"rgba(10,7,22,0.97)", position:"relative", zIndex:2 }}>
                <div style={{ height:300, overflowY:"auto" }}>
                  {PanelComponents && (
                    <>
                      {activeTab==="import" && <PanelComponents.URLImporter storeId={storeId} t={{text:"#F0ECFF",muted:"rgba(200,190,255,0.5)",border:"rgba(107,53,232,0.2)"}} isDark onImported={() => setActiveTab("chat")}/>}
                      {activeTab==="skills" && <PanelComponents.SkillsPanel storeId={storeId} t={{text:"#F0ECFF",muted:"rgba(200,190,255,0.5)",border:"rgba(107,53,232,0.2)"}} isDark onSend={(p: string)=>{setActiveTab("chat");send(p);}}/>}
                      {activeTab==="goals"  && <PanelComponents.GoalsPanel  storeId={storeId} t={{text:"#F0ECFF",muted:"rgba(200,190,255,0.5)",border:"rgba(107,53,232,0.2)"}} isDark onSend={(p: string)=>{setActiveTab("chat");send(p);}}/>}
                      {activeTab==="pulse"  && <PanelComponents.PulsePanel  storeId={storeId} t={{text:"#F0ECFF",muted:"rgba(200,190,255,0.5)",border:"rgba(107,53,232,0.2)"}} isDark onSend={(p: string)=>{setActiveTab("chat");send(p);}}/> }
                      {(activeTab as string)==="memory" && PanelComponents.MemoryPanel && <PanelComponents.MemoryPanel storeId={storeId} t={{text:"#F0ECFF",muted:"rgba(200,190,255,0.5)",border:"rgba(107,53,232,0.2)"}} isDark/>}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab bar */}
          <div style={{ position:"relative", zIndex:2 }}>
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} pulseCount={pulseCount}/>
          </div>

          {/* Attachment preview */}
          <AnimatePresence>
            {attachment && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                style={{ borderTop:"1px solid rgba(107,53,232,0.12)", padding:"8px 16px", background:"rgba(10,7,22,0.95)", display:"flex", alignItems:"center", gap:10, zIndex:2 }}>
                {attachment.url ? <img src={attachment.url} alt="" style={{ width:40, height:40, borderRadius:8, objectFit:"cover" }}/> : <span style={{ fontSize:20 }}>📎</span>}
                <span style={{ fontSize:12, color:"rgba(200,190,255,0.6)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{attachment.name}</span>
                <button onClick={() => setAttach(null)}
                  style={{ width:22, height:22, borderRadius:6, border:"none", background:"rgba(255,255,255,0.08)", color:"rgba(200,190,255,0.5)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area — ChatGPT/Claude style */}
          <div style={{ borderTop:"1px solid rgba(107,53,232,0.08)", padding:"10px 14px 14px", background:"rgba(7,5,15,0.97)", position:"relative", zIndex:2 }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}>

            {/* Attachment chips */}
            <AnimatePresence>
              {attachment && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                  style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:8, background:"rgba(107,53,232,0.12)", border:"1px solid rgba(107,53,232,0.2)" }}>
                    <span style={{ fontSize:14 }}>{attachment.type === "image" ? "🖼" : attachment.type === "pdf" ? "📄" : "📊"}</span>
                    <span style={{ fontSize:12, color:"rgba(200,190,255,0.8)", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{attachment.name}</span>
                    {attachment.size && <span style={{ fontSize:10, color:"rgba(200,190,255,0.4)" }}>{Math.round(attachment.size/1024)}KB</span>}
                    <button onClick={() => { setAttach(null); setAttachments([]); }}
                      style={{ width:16, height:16, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.1)", color:"rgba(200,190,255,0.6)", cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>×</button>
                  </div>
                  {attachment.type === "image" && (
                    <img src={attachment.url} alt="" style={{ height:40, width:40, objectFit:"cover", borderRadius:8, border:"1px solid rgba(107,53,232,0.2)" }}/>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main input box */}
            <div style={{ borderRadius:16, border:`1px solid rgba(107,53,232,${loading?".35":".18"})`, background:"rgba(107,53,232,0.05)", transition:"border-color 0.2s, box-shadow 0.2s" }}
              onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(107,53,232,0.15)")}
              onBlur={e => (e.currentTarget.style.boxShadow = "none")}>

              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  // Auto-grow
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
                }}
                onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                onPaste={handlePaste}
                placeholder="Message KIRO... paste a URL, describe a product, ask anything"
                rows={1}
                style={{ width:"100%", background:"transparent", border:"none", outline:"none", color:"#F0ECFF", fontSize:14, fontFamily:"inherit", lineHeight:1.6, resize:"none", maxHeight:180, overflowY:"auto", padding:"12px 14px 4px", boxSizing:"border-box" }}
              />

              {/* Toolbar */}
              <div style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px 8px" }}>
                {/* Image upload */}
                <button onClick={() => { fileRef.current!.accept="image/*"; fileRef.current?.click(); }} disabled={uploading}
                  title="Upload image"
                  style={{ width:30, height:30, borderRadius:8, border:"none", background:"transparent", color:"rgba(200,190,255,0.4)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
                  🖼
                </button>
                {/* File upload */}
                <button onClick={() => { fileRef.current!.accept="image/*,.pdf,.csv,.xlsx"; fileRef.current?.click(); }} disabled={uploading}
                  title="Attach file (PDF, CSV)"
                  style={{ width:30, height:30, borderRadius:8, border:"none", background:"transparent", color:"rgba(200,190,255,0.4)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
                  {uploading
                    ? <span style={{ width:12, height:12, border:"2px solid rgba(107,53,232,0.4)", borderTopColor:P.v400, borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"block" }}/>
                    : "📎"}
                </button>
                {/* Voice */}
                <button onClick={handleVoice} title={isListening?"Stop recording":"Voice input"}
                  style={{ width:30, height:30, borderRadius:8, border:"none", background:isListening?"rgba(239,68,68,0.12)":"transparent", color:isListening?"#ef4444":"rgba(200,190,255,0.4)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
                  {isListening ? "⏹" : "🎙"}
                </button>
                {/* Generate image */}
                <button
                  onClick={() => { if (input.trim()) generateImage(input.trim()); else toast.error("Describe what to generate first"); }}
                  title="Generate AI image from description"
                  style={{ padding:"3px 10px", borderRadius:8, border:"1px solid rgba(107,53,232,0.2)", background:"transparent", color:P.v300, cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"inherit", flexShrink:0 }}>
                  ✨ Generate image
                </button>

                <div style={{ flex:1 }}/>

                {/* Character count */}
                {input.length > 200 && (
                  <span style={{ fontSize:10, color:"rgba(200,190,255,0.3)", marginRight:6 }}>{input.length}</span>
                )}

                {/* Send / Stop */}
                <motion.button
                  onClick={() => loading ? abortRef.current?.abort() : send()}
                  whileTap={{ scale:0.9 }}
                  style={{ width:32, height:32, borderRadius:10, border:"none", background: loading ? "rgba(239,68,68,0.15)" : (input.trim() || attachment) ? `linear-gradient(135deg,${P.v500},${P.v600})` : "rgba(107,53,232,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s", boxShadow: (input.trim()||attachment) && !loading ? "0 2px 12px rgba(107,53,232,0.4)" : "none" }}>
                  {loading
                    ? <span style={{ width:12, height:12, border:"2px solid rgba(239,68,68,0.4)", borderTopColor:"#ef4444", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"block" }}/>
                    : <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={(input.trim()||attachment)?"#fff":"rgba(200,190,255,0.25)"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </motion.button>
              </div>
            </div>

            <p style={{ fontSize:10, color:"rgba(200,190,255,0.15)", textAlign:"center", margin:"6px 0 0" }}>
              ⌘K to open KIRO anywhere
            </p>
          </div>
        </>
      )}

      <input ref={fileRef} type="file" accept="image/*,.pdf,.csv" style={{ display:"none" }}
        onChange={e => { if(e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value=""; }}/>
    </div>
  );
}
