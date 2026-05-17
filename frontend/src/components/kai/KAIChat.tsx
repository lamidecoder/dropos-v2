"use client";
import { URLImporter, SkillsPanel, GoalsPanel, PulsePanel } from "./KIROPanels";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { api, uploadAPI } from "../../lib/api";
import {
  Send, Paperclip, X, Loader2, Copy, Check, ChevronDown,
  Image, FileText, Zap, RefreshCw, Trash2
} from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };
const BASE = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  imageUrl?: string;
  fileName?: string;
  actions?: any[];
  timestamp?: string;
}

interface KIROChatProps {
  className?: string;
  storeId?: string;
  initialMessage?: string;
  compact?: boolean;
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

// ── Human-readable action descriptions (mirrors kai.actions.ts) ───────────────
function getActionDesc(type: string, payload: any, symbol = "₦") {
  const fmt = (n: number) => `${symbol}${(n||0).toLocaleString()}`;
  const map: Record<string, {title:string; summary:string; icon:string; cta:string}> = {
    add_product:           { icon:"📦", cta:"Add to Store",   title:"New Product",          summary:`Add "${payload?.name}" at ${fmt(payload?.price)}` },
    bulk_add_products:     { icon:"📥", cta:"Import All",     title:"Bulk Import",           summary:`Import ${payload?.products?.length || 0} products` },
    update_price:          { icon:"💰", cta:"Update Price",   title:"Price Change",          summary:`Change price to ${fmt(payload?.price)}` },
    update_stock:          { icon:"📦", cta:"Update Stock",   title:"Stock Update",          summary:`Set inventory to ${payload?.quantity} units` },
    archive_product:       { icon:"🔒", cta:"Hide Product",   title:"Hide from Store",       summary:"Remove this product from your public store" },
    set_product_status:    { icon:payload?.status==="ACTIVE"?"✅":"📴", cta:payload?.status==="ACTIVE"?"Activate":"Archive", title:payload?.status==="ACTIVE"?"Activate Product":"Archive Product", summary:payload?.status==="ACTIVE"?"Make product visible to customers":"Hide product from customers" },
    create_coupon:         { icon:"🎟️", cta:"Create Code",   title:"Discount Code",         summary:`Create code "${payload?.code}" — ${payload?.discount||payload?.discountValue}% off` },
    fulfill_order:         { icon:"🚚", cta:"Fulfill Order",  title:"Fulfill Order",         summary:"Mark as fulfilled and notify customer" },
    update_order_status:   { icon:"📋", cta:"Update Status", title:"Order Update",          summary:`Set status to ${(payload?.status||"").toLowerCase()}` },
    create_flash_sale:     { icon:"⚡", cta:"Launch Sale",   title:"Flash Sale",            summary:`${payload?.discountPercent}% off on ${payload?.productIds?.length||0} products` },
    update_store_description:{ icon:"✏️",cta:"Update",       title:"Store Description",     summary:"Update your public store description" },
    update_product_image:      { icon:"📷",cta:"Add Image",      title:"Add Product Image",      summary:`Add image to ${payload?.productId ? "product" : ""}` },
    update_product:            { icon:"✏️",cta:"Update Product", title:"Update Product",         summary:"Apply changes to this product" },
    import_from_url:           { icon:"🌐",cta:"Import Product",  title:"Import from URL",          summary:`Import product from ${payload?.url?.slice(0,40) || "URL"}...` },
    get_analytics:         { icon:"📈", cta:"Run Report",    title:"Analytics Report",      summary:"Pull your latest store performance data" },
    export_orders:         { icon:"📤", cta:"Export",        title:"Export Orders",         summary:"Download your order history" },
  };
  return map[type] || { icon:"⚡", cta:"Execute", title:type.replace(/_/g," ").replace(/\w/g,c=>c.toUpperCase()), summary:"Execute this action" };
}

function ActionCard({ action, onApprove, onDismiss, t, isDark }: any) {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const desc = getActionDesc(action.type, action.payload);

  const approve = async () => {
    setLoading(true);
    await onApprove(action);
    setDone(true);
    setLoading(false);
  };

  if (done) return null; // Remove card after approval — result shown in chat

  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
      style={{ marginTop:12, borderRadius:16, overflow:"hidden",
        border: `1px solid ${isDark?"rgba(107,53,232,0.25)":"rgba(107,53,232,0.15)"}`,
        background: isDark?"rgba(107,53,232,0.06)":"rgba(107,53,232,0.03)" }}>
      {/* Header */}
      <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${isDark?"rgba(107,53,232,0.12)":"rgba(107,53,232,0.08)"}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{desc.icon}</span>
          <div>
            <p style={{ fontSize:12, fontWeight:800, color:V.v400, margin:0, letterSpacing:"-0.01em" }}>{desc.title}</p>
            <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.4, marginTop:2 }}>{desc.summary}</p>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div style={{ padding:"10px 14px", display:"flex", gap:8, alignItems:"center" }}>
        <button onClick={approve} disabled={loading}
          style={{ padding:"8px 18px", borderRadius:10, border:"none",
            background:loading?"rgba(107,53,232,0.4)":`linear-gradient(135deg,${V.v500},#3D1C8A)`,
            color:"#fff", fontSize:12, fontWeight:700, cursor:loading?"not-allowed":"pointer",
            fontFamily:"inherit", display:"flex", alignItems:"center", gap:6, flexShrink:0,
            boxShadow:loading?"none":"0 2px 8px rgba(107,53,232,0.3)" }}>
          {loading
            ? <><Loader2 size={11} style={{animation:"spin 0.8s linear infinite"}}/> Working...</>
            : <><Check size={11}/> {desc.cta}</>}
        </button>
        <button onClick={()=>onDismiss(action)}
          style={{ padding:"8px 14px", borderRadius:10, border:`1px solid ${t.border}`,
            background:"transparent", color:t.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          Dismiss
        </button>
        <p style={{ fontSize:11, color:t.muted, margin:"0 0 0 auto", fontStyle:"italic" }}>Review before confirming</p>
      </div>
    </motion.div>
  );
}


// Strip KIRO internal formatting from user-visible text
function cleanKIROContent(text: string): string {
  return text
    .replace(/KIRO_ACTION[:\s]+\{[\s\S]*?\}(?=\n|$)/g, "")   // strip action blocks
    .replace(/━+/g, "")                                           // strip divider chars
    .replace(/^[-=]{3,}\s*$/gm, "")                              // strip --- === lines
    .replace(/\n{3,}/g, "\n\n")                                  // collapse 3+ newlines
    .trim();
}

function MessageBubble({ msg, onApprove, onDismiss, t, isDark, onRate, onRegenerate }: any) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      style={{ display:"flex", flexDirection: isUser?"row-reverse":"row", gap:10, alignItems:"flex-start", marginBottom:16 }}>

      {/* Avatar */}
      {!isUser && (
        <div style={{ width:30, height:30, borderRadius:10, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 4px 12px ${V.v500}40` }}>
          <Zap size={13} color="#fff" fill="#fff"/>
        </div>
      )}

      <div style={{ maxWidth:"82%", minWidth:40 }}>
        {/* Image attachment */}
        {msg.imageUrl && (
          <img src={msg.imageUrl} alt="attachment"
            style={{ maxWidth:"100%", maxHeight:200, borderRadius:12, marginBottom:6, objectFit:"cover", display:"block" }}/>
        )}
        {msg.fileName && !msg.imageUrl && (
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:8, background:isDark?"rgba(255,255,255,0.06)":"#f5f3ff", marginBottom:6, fontSize:11, color:t.muted }}>
            <FileText size={12}/> {msg.fileName}
          </div>
        )}

        {/* Message bubble */}
        <div style={{
          padding: isUser?"10px 14px":"2px 0",
          borderRadius: isUser?"16px 16px 4px 16px":"0",
          background: isUser?`linear-gradient(135deg,${V.v500},#3D1C8A)`:"transparent",
          color: isUser?"#fff":t.text,
          fontSize: 14,
          lineHeight: 1.65,
          position:"relative",
        }}>
          {msg.isStreaming && !msg.content ? (
            <span style={{ display:"flex", alignItems:"center", gap:8, color:t.muted }}>
              <span style={{ display:"flex", gap:3 }}>
                {[0,1,2].map(i => (
                  <motion.span key={i} style={{ width:6, height:6, borderRadius:"50%", background:V.v400, display:"block" }}
                    animate={{ y:[0,-4,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }}/>
                ))}
              </span>
              <span style={{ fontSize:13 }}>KIRO is thinking</span>
            </span>
          ) : msg.isStreaming && msg.content ? (
            <p style={{ margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
              {cleanKIROContent(msg.content || "")}
              <motion.span animate={{ opacity:[1,0] }} transition={{ duration:0.5, repeat:Infinity }}>▋</motion.span>
            </p>
          ) : (
            <p style={{ margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{cleanKIROContent(msg.content || "")}</p>
          )}

          {/* Action cards */}
          {msg.actions?.map((action: any, i: number) => (
            <ActionCard key={i} action={action} onApprove={onApprove} onDismiss={onDismiss} t={t} isDark={isDark}/>
          ))}

          {/* Copy button */}
          {!isUser && !msg.isStreaming && msg.content && (
            <button onClick={copy}
              style={{ position:"absolute", top:0, right:-28, width:22, height:22, borderRadius:6, border:`1px solid ${t.border}`, background:t.card, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:0.5 }}>
              {copied ? <Check size={11} color={V.v400}/> : <Copy size={11} color={t.muted}/>}
            </button>
          )}
        </div>

        {msg.timestamp && !msg.isStreaming && (
          <p style={{ fontSize:10, color:t.muted, margin:"3px 0 0", textAlign:isUser?"right":"left" }}>
            {new Date(msg.timestamp).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function KIROChat({ storeId: propStoreId, initialMessage, compact, conversationId: initConvId, onConversationCreated }: KIROChatProps) {
  const { user } = useAuthStore();
  const token  = useAuthStore(s => s.accessToken);
  const storeId = propStoreId || user?.stores?.[0]?.id || "";

  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState(initialMessage || "");
  const [greeting,    setGreeting]    = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTab,   setActiveTab]   = useState<"chat"|"import"|"skills"|"goals"|"pulse">("chat");
  const [pulseCount,  setPulseCount]  = useState(0);

  // Load pulse alert count
  useEffect(() => {
    if (!storeId) return;
    const BASE = (process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api");
    const token = useAuthStore.getState().accessToken;
    fetch(`${BASE}/kai/pulse?storeId=${storeId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(d => setPulseCount((d.data || []).filter((a: any) => !a.read).length))
      .catch(() => {});
  }, [storeId]);
  const recogRef = useRef<any>(null);

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { recogRef.current?.stop(); setIsListening(false); return; }
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: any) => {
      const t2 = Array.from(e.results).map((r2: any) => r2[0].transcript).join("");
      setInput(t2);
    };
    r.onend = () => setIsListening(false);
    r.start();
    recogRef.current = r;
    setIsListening(true);
  };
  const [loading,     setLoading]     = useState(false);
  const [convId,      setConvId]      = useState(initConvId || "");
  const [attachment,  setAttachment]  = useState<{url?:string; cloudUrl?:string; base64?:string; type?:string; name?:string}|null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [histLoaded,  setHistLoaded]  = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef  = useRef<AbortController|null>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  // Theme detection
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const t = {
    bg:    isDark?"#07050F":"#F4F2FB",
    card:  isDark?"#181230":"#fff",
    border:isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text:  isDark?"#F0ECFF":"#130D2E",
    muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    input: isDark?"rgba(255,255,255,0.05)":"#fff",
  };

  // ── Load conversation history on mount ──────────────────────────────────────
  useEffect(() => {
    if (!storeId || histLoaded) return;
    setHistLoaded(true);

    // If we have a specific conversationId, load it
    if (convId) {
      api.get(`/kai/conversation/${convId}`)
        .then(r => {
          const conv = r.data?.data;
          if (conv?.messages?.length) {
            setMessages(conv.messages.map((m: any) => ({
              id:        m.id,
              role:      m.role,
              content:   m.content,
              timestamp: m.createdAt,
            })));
          }
        })
        .catch(() => {});
    } else {
      // Load the most recent conversation for this store
      api.get(`/kai/conversations?storeId=${storeId}`)
        .then(r => {
          const convs = r.data?.data || [];
          if (convs.length > 0) {
            const latest = convs[0];
            setConvId(latest.id);
            if (latest.messages?.length) {
              setMessages(latest.messages.map((m: any) => ({
                id:        m.id,
                role:      m.role,
                content:   m.content,
                timestamp: m.createdAt,
              })));
            } else {
              // Load full conversation
              api.get(`/kai/conversation/${latest.id}`)
                .then(r2 => {
                  const msgs = r2.data?.data?.messages || [];
                  setMessages(msgs.map((m: any) => ({
                    id: m.id, role: m.role, content: m.content, timestamp: m.createdAt,
                  })));
                })
                .catch(() => {});
            }
          }
        })
        .catch(() => {});
    }
  }, [storeId, convId, histLoaded]);

  useEffect(() => {
    // Use requestAnimationFrame for smooth scroll during streaming
    const el = bottomRef.current;
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "end" }));
  }, [messages]);

  // ── File upload ──────────────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPDF   = file.type === "application/pdf";
    const isCSV   = file.type === "text/csv" || file.name.endsWith(".csv");

    if (!isImage && !isPDF && !isCSV) {
      toast.error("Only images, PDFs, and CSV files are supported");
      return;
    }

    setUploading(true);
    try {
      if (isImage) {
        // Read as data URI locally — no network roundtrip, works offline
        // The base64 is sent directly to KIRO for vision analysis
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Could not read file"));
          reader.readAsDataURL(file);
        });
        setAttachment({ url: dataUrl, type:"image", name:file.name });
      } else {
        // Read as base64 for PDF/CSV
        const base64 = await new Promise<string>((res,rej) => {
          const r = new FileReader();
          r.onload  = () => res((r.result as string).split(",")[1]);
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        setAttachment({ base64, type: isPDF?"pdf":"csv", name:file.name });
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Execute approved action ──────────────────────────────────────────────────
  const handleRate = (msgId: string, positive: boolean) => {
    // Rate limiting feedback - could send to analytics
    console.log("Message rated:", msgId, positive ? "👍" : "👎");
  };

  const handleRegenerate = async (msgId: string) => {
    // Find the user message before this one and resend it
    const msgIdx = messages.findIndex(m => m.id === msgId);
    if (msgIdx < 1) return;
    const prevUserMsg = messages.slice(0, msgIdx).reverse().find(m => m.role === "user");
    if (prevUserMsg) {
      // Remove the assistant message and regenerate
      setMessages(p => p.filter((_, i) => i < msgIdx));
      await send(prevUserMsg.content);
    }
  };

  const handleApprove = async (action: any) => {
    try {
      const res = await api.post("/kai/action", {
        storeId, conversationId: convId,
        actions: [{ ...action, approved: true }],
      });
      const result = (res.data?.data || res.data?.results)?.[0];
      // Use human-readable messages from the server
      const resultMsg: Message = {
        id:        `action-${Date.now()}`,
        role:      "assistant",
        content:   result?.success
          ? (result?.message || `Done. ${action.type.replace(/_/g," ")} completed.`)
          : (result?.error   || "Something didn't go as expected. Let me check what went wrong and try again."),
        timestamp: new Date().toISOString(),
      };
      setMessages(p => [...p, resultMsg]);
    } catch(e:any) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  const handleDismiss = (action: any) => {
    setMessages(p => p.map(m => ({
      ...m,
      actions: m.actions?.filter(a => a !== action),
    })));
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async (msg: string) => {
    if (!msg.trim() || loading) return;
    setInput("");
    const syntheticEvent = { target: { value: msg } } as any;
    // Directly call the send logic with the provided message
    const text = msg.trim();
    if (!storeId) { toast.error("No store connected"); return; }

    // Build user message
    const userMsg: Message = {
      id:        `u-${Date.now()}`,
      role:      "user",
      content:   text,
      timestamp: new Date().toISOString(),
    };
    setMessages(p => [...p, userMsg]);

    const kiroMsg: Message = {
      id:          `k-${Date.now()}`,
      role:        "assistant",
      content:     "",
      isStreaming: true,
      timestamp:   new Date().toISOString(),
    };
    setMessages(p => [...p, kiroMsg]);
    setLoading(true);

    // Start KIRO (same as send but with provided text)
    const convId = initConvId || "";
    const BASE = (process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api");
    const token = useAuthStore.getState().accessToken;
    const body: any = { message: text, storeId, sessionId: convId || undefined };

    try {
      const streamRes = await fetch(`${BASE}/kai/smart-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), Accept: "text/event-stream" },
        body: JSON.stringify(body),
        signal: abortRef.current?.signal,
      });

      if (!streamRes.ok) {
        const err = await streamRes.json().catch(()=>({message:`Error ${streamRes.status}`}));
        throw new Error(err.message || `Server error ${streamRes.status}`);
      }

      const isStream = streamRes.headers.get("content-type")?.includes("text/event-stream");
      let full = "";
      if (isStream) {
        const reader = streamRes.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.token) { full += parsed.token; setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, content: cleanKIROContent(full) } : m)); }
              if (parsed.conversationId && !convId) { setConvId(parsed.conversationId); onConversationCreated?.(parsed.conversationId); }
              if (parsed.actions?.length) { setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, actions:parsed.actions } : m)); }
              if (parsed.done) {
                const raw2 = parsed.cleanResponse || "";
                const fc = raw2 ? cleanKIROContent(raw2) : undefined;
                const fa = parsed.actions || [];
                setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, isStreaming:false, ...(fc?{content:fc}:{}), ...(fa.length?{actions:fa}:{}) } : m));
              }
              if (parsed.error) throw new Error(parsed.message || "KIRO error");
            } catch(e:any) { if (e.message && !e.message.includes("JSON")) throw e; }
          }
        }
      }
      setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, isStreaming:false, content:cleanKIROContent(full)||m.content } : m));
    } catch(e:any) {
      if (e.name === "AbortError") {
        setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, content:"Cancelled.", isStreaming:false } : m));
      } else {
        setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, content:e.message||"Something went wrong.", isStreaming:false } : m));
      }
    } finally { setLoading(false); }
  };

  const send = async (overrideMsg?: string) => {
    const text = (overrideMsg || input).trim();
    if (!text && !attachment) return;
    if (loading || !storeId) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const displayText = text || (attachment ? "📎 " + (attachment.name || "Image") : "");
    const userMsg: Message = {
      id:        `u-${Date.now()}`,
      role:      "user",
      content:   displayText,
      imageUrl:  attachment?.url,
      fileName:  !attachment?.url ? attachment?.name : undefined,
      timestamp: new Date().toISOString(),
    };
    const kiroMsg: Message = {
      id:          `k-${Date.now()}`,
      role:        "assistant",
      content:     "",
      isStreaming: true,
      timestamp:   new Date().toISOString(),
    };

    setMessages(p => [...p, userMsg, kiroMsg]);
    setInput("");
    setAttachment(null);
    setLoading(true);

    try {
      // Build message - if only image, add a default prompt
      const finalMessage = text || (attachment ? "Please analyse this image and help me use it in my store." : "");
      
      const body: any = { message: finalMessage, storeId, sessionId: convId || undefined };
      
      if (attachment?.url) {
        if (attachment.url.startsWith("data:image/")) {
          // Extract base64 from data URI for KIRO vision
          const parts  = attachment.url.split(",");
          const mime   = parts[0].split(":")[1]?.split(";")[0] || "image/jpeg";
          body.imageBase64      = parts[1];
          body.imageMediaType   = mime;
          body.imageUrl         = attachment.url; // for display
        } else {
          // Cloudinary URL - send as URL reference
          body.imageUrl         = attachment.url;
          body.message          = finalMessage + `\n\n[Image: ${attachment.url}]`;
        }
      }
      if (attachment?.base64) {
        body.fileBase64  = attachment.base64;
        body.fileType    = attachment.type;
      }
      if (attachment?.name)   body.fileName    = attachment.name;

      const streamRes = await fetch(`${BASE}/kai/smart-chat`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept":        "text/event-stream",
        },
        body:   JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!streamRes.ok) {
        const err = await streamRes.json().catch(()=>({message:`Error ${streamRes.status}`}));
        throw new Error(err.message || `Server error ${streamRes.status}`);
      }

      const isStream = streamRes.headers.get("content-type")?.includes("text/event-stream");

      if (isStream) {
        const reader  = streamRes.body!.getReader();
        const decoder = new TextDecoder();
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream:true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw) continue;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.token) {
                full += parsed.token;
                setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, content:full } : m));
              }
              if (parsed.conversationId && !convId) {
                setConvId(parsed.conversationId);
                onConversationCreated?.(parsed.conversationId);
              }
              if (parsed.actions?.length) {
                setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, actions:parsed.actions } : m));
              }
              if (parsed.done) {
                // Use clean response — strip KIRO_ACTION + ugly divider lines
                const rawContent = parsed.cleanResponse || "";
                const finalContent = rawContent
                  .replace(/━+/g, "")
                  .replace(/^-{3,}\s*$/gm, "")
                  .replace(/^={3,}\s*$/gm, "")
                  .replace(/\n{3,}/g, "\n\n")
                  .trim() || undefined;
                const finalActions = parsed.actions || [];
                setMessages(p => p.map(m => m.id === kiroMsg.id ? {
                  ...m,
                  isStreaming: false,
                  ...(finalContent ? { content: finalContent } : {}),
                  ...(finalActions.length ? { actions: finalActions } : {}),
                } : m));
              }
              if (parsed.error) {
                throw new Error(parsed.message || "KIRO error");
              }
            } catch(e: any) {
              if (e.message && !e.message.includes("JSON")) throw e;
            }
          }
        }

        setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, isStreaming:false, content:full||m.content } : m));

      } else {
        // Non-streaming fallback
        const data = await streamRes.json();
        const reply = data.data?.message || data.message || "No response";
        if (data.data?.conversationId && !convId) {
          setConvId(data.data.conversationId);
          onConversationCreated?.(data.data.conversationId);
        }
        setMessages(p => p.map(m => m.id === kiroMsg.id ? {
          ...m, content:reply, isStreaming:false,
          actions: data.data?.actions || [],
        } : m));
      }

    } catch(e: any) {
      if (e.name === "AbortError") {
        setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, content:"Cancelled.", isStreaming:false } : m));
      } else {
        const errMsg = e.message || "Something went wrong. Check your connection.";
        setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, content:errMsg, isStreaming:false } : m));
      }
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setMessages([]); setConvId(""); setHistLoaded(false); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative", fontFamily:"system-ui,sans-serif" }}>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:compact?"12px":"16px 20px" }}>
        {messages.length === 0 && (
          <div style={{ padding:"32px 20px 20px" }}>
            {/* KIRO greeting */}
            <div style={{ display:"flex", gap:12, marginBottom:20 }}>
              <div style={{ width:36, height:36, borderRadius:12, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Zap size={16} color="#fff" fill="#fff"/>
              </div>
              <div style={{ background:isDark?"rgba(107,53,232,0.08)":"#F4F1FF", borderRadius:"4px 16px 16px 16px", padding:"12px 16px", maxWidth:"85%" }}>
                <p style={{ fontSize:14, color:t.text, margin:"0 0 6px", lineHeight:1.6, fontWeight:500 }}>
                  {greeting?.contextLine || "What are we working on today?"}
                </p>
                {greeting?.storeContext?.pendingOrders > 0 && (
                  <p style={{ fontSize:13, color:"#EF4444", margin:"4px 0 0", fontWeight:600 }}>
                    ⚠️ {greeting.storeContext.pendingOrders} order{greeting.storeContext.pendingOrders > 1 ? "s" : ""} pending — needs attention.
                  </p>
                )}
              </div>
            </div>
            {/* Quick action suggestions */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingLeft:48 }}>
              {(greeting?.quickActions?.length ? greeting.quickActions.map((a: any) => a.prompt) : [
                "What should I focus on today?",
                "What products are trending in Nigeria?",
                "Write me an Instagram caption",
                "Show my pending orders",
              ]).map((prompt: string) => (
                <button key={prompt} onClick={() => sendMessage(prompt)}
                  style={{ padding:"6px 14px", borderRadius:99, border:`1px solid ${t.border}`, background:t.card, color:t.text, fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                  {prompt.length > 38 ? prompt.slice(0,38) + "…" : prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} onApprove={handleApprove} onDismiss={handleDismiss} t={t} isDark={isDark}/>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div style={{ padding:"8px 16px 0", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", borderRadius:10, background:`${V.v400}12`, border:`1px solid ${V.v400}30`, flex:1 }}>
            {attachment.type==="image" ? <Image size={13} color={V.v400}/> : <FileText size={13} color={V.v400}/>}
            <span style={{ fontSize:12, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{attachment.name}</span>
            {attachment.url && <img src={attachment.url} alt="" style={{ width:28, height:28, borderRadius:6, objectFit:"cover", flexShrink:0 }}/>}
          </div>
          <button onClick={() => setAttachment(null)} style={{ width:26, height:26, borderRadius:8, border:"none", background:"rgba(239,68,68,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={12} color="#EF4444"/>
          </button>
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding:compact?"8px":"12px 16px", borderTop:`1px solid ${t.border}`, background:t.card }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-end", padding:"10px 12px", borderRadius:16, border:`1.5px solid ${loading?V.v400:t.border}`, background:t.input, transition:"border-color 0.2s" }}>
          {/* Attach button */}
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ width:30, height:30, borderRadius:8, border:`1px solid ${t.border}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity:uploading?0.5:1 }}>
            {uploading ? <Loader2 size={14} color={t.muted} style={{animation:"spin 0.8s linear infinite"}}/> : <Paperclip size={14} color={t.muted}/>}
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask KIRO anything..."
            rows={1}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", resize:"none", fontSize:14, color:t.text, fontFamily:"inherit", lineHeight:1.5, maxHeight:120, overflow:"auto", paddingTop:2 }}
            onInput={e => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />

          {/* Send / Stop */}
          <button onClick={handleVoice} title="Voice input"
            style={{ padding:"0 10px", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", color:isListening?"#7C3AED":t.muted, cursor:"pointer", fontSize:16, height:44, flexShrink:0 }}>
            🎙
          </button>
          <button onClick={() => loading ? abortRef.current?.abort() : send()}
            disabled={!loading && !input.trim() && !attachment}
            style={{ width:34, height:34, borderRadius:10, border:"none", background: loading?"rgba(239,68,68,0.1)": (input.trim()||attachment)?`linear-gradient(135deg,${V.v500},#3D1C8A)`:"rgba(0,0,0,0.05)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s", opacity:(!loading && !input.trim() && !attachment)?0.4:1 }}>
            {loading
              ? <X size={14} color="#EF4444"/>
              : <Send size={14} color={(input.trim()||attachment)?"#fff":t.muted}/>}
          </button>
        </div>

        <p style={{ fontSize:10, color:t.muted, textAlign:"center", marginTop:6, marginBottom:0 }}>
          KIRO can make mistakes. Always verify important business decisions.
        </p>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*,.pdf,.csv,.xlsx"
        style={{ display:"none" }}
        onChange={e => { if(e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value=""; }}/>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
