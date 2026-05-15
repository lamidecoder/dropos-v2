"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { api } from "../../lib/api";
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

function ActionCard({ action, onApprove, onDismiss, t }: any) {
  const [loading, setLoading] = useState(false);
  const label: Record<string,string> = {
    add_product: "➕ Add Product to Store",
    update_price: "💰 Update Price",
    create_coupon: "🎟 Create Coupon",
    update_stock: "📦 Update Stock",
    create_discount: "🏷 Create Discount",
    update_order_status: "🚚 Update Order",
    update_shipping: "🌍 Update Shipping",
  };

  return (
    <div style={{ padding:"12px 14px", borderRadius:12, background:"rgba(107,53,232,0.06)", border:"1px solid rgba(107,53,232,0.2)", marginTop:8 }}>
      <p style={{ fontSize:12, fontWeight:700, color:V.v400, margin:"0 0 6px" }}>
        {label[action.type] || `🤖 ${action.type}`}
      </p>
      <pre style={{ fontSize:11, color:t.muted, margin:"0 0 10px", whiteSpace:"pre-wrap", lineHeight:1.5, fontFamily:"monospace" }}>
        {JSON.stringify(action.payload, null, 2)}
      </pre>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={async ()=>{ setLoading(true); await onApprove(action); setLoading(false); }}
          disabled={loading}
          style={{ padding:"6px 14px", borderRadius:8, border:"none", background:V.v500, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
          {loading?<Loader2 size={11} style={{animation:"spin 0.8s linear infinite"}}/>:<Check size={11}/>} Approve
        </button>
        <button onClick={()=>onDismiss(action)}
          style={{ padding:"6px 12px", borderRadius:8, border:"1px solid rgba(0,0,0,0.1)", background:"transparent", color:t.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onApprove, onDismiss, t, isDark }: any) {
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
          {msg.isStreaming ? (
            <span style={{ display:"flex", alignItems:"center", gap:6, color:t.muted }}>
              <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1, repeat:Infinity }}>⚡</motion.span>
              KIRO is thinking...
            </span>
          ) : (
            <p style={{ margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{msg.content}</p>
          )}

          {/* Action cards */}
          {msg.actions?.map((action: any, i: number) => (
            <ActionCard key={i} action={action} onApprove={onApprove} onDismiss={onDismiss} t={t}/>
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
  const [loading,     setLoading]     = useState(false);
  const [convId,      setConvId]      = useState(initConvId || "");
  const [attachment,  setAttachment]  = useState<{url?:string; base64?:string; type?:string; name?:string}|null>(null);
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
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
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
        // Upload to Cloudinary
        const form = new FormData();
        form.append("image", file);
        const res = await api.post("/upload/image", form, { headers:{"Content-Type":"multipart/form-data"} });
        const url = res.data?.data?.url;
        setAttachment({ url, type:"image", name:file.name });
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
  const handleApprove = async (action: any) => {
    try {
      const res = await api.post("/kai/action", {
        storeId, conversationId: convId,
        actions: [{ ...action, approved: true }],
      });
      const result = res.data?.results?.[0];
      const resultMsg: Message = {
        id:        `action-${Date.now()}`,
        role:      "assistant",
        content:   result?.success
          ? `Done ✅ — ${action.type} executed successfully.`
          : `Failed ❌ — ${result?.error || "Something went wrong"}`,
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
  const send = async () => {
    const text = input.trim();
    if (!text && !attachment) return;
    if (loading || !storeId) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const userMsg: Message = {
      id:        `u-${Date.now()}`,
      role:      "user",
      content:   text,
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
      const body: any = { message: text, storeId, sessionId: convId || undefined };
      if (attachment?.url)    body.imageUrl    = attachment.url;
      if (attachment?.base64) body.fileBase64  = attachment.base64;
      if (attachment?.type)   body.fileType    = attachment.type;
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
                setMessages(p => p.map(m => m.id === kiroMsg.id ? { ...m, isStreaming:false } : m));
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
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:`0 8px 24px ${V.v500}40` }}>
              <Zap size={22} color="#fff" fill="#fff"/>
            </div>
            <p style={{ fontSize:16, fontWeight:800, color:t.text, margin:"0 0 8px", letterSpacing:"-0.03em" }}>Your AI business partner</p>
            <p style={{ fontSize:13, color:t.muted, margin:"0 0 24px", lineHeight:1.6 }}>
              Ask me anything — sales, products, orders, marketing, pricing.<br/>I can also add products, create coupons, and update your store directly.
            </p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
              {["What are my sales today?","Add a new product","What's trending in Nigeria?","Write me an Instagram caption"].map(s => (
                <button key={s} onClick={() => setInput(s)}
                  style={{ padding:"6px 14px", borderRadius:99, border:`1px solid ${t.border}`, background:t.card, color:t.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                  {s}
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
            placeholder="Ask KIRO anything... (Shift+Enter for new line)"
            rows={1}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", resize:"none", fontSize:14, color:t.text, fontFamily:"inherit", lineHeight:1.5, maxHeight:120, overflow:"auto", paddingTop:2 }}
            onInput={e => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />

          {/* Send / Stop */}
          <button onClick={loading ? () => abortRef.current?.abort() : send}
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
