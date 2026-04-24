"use client";
// ============================================================
// KIRO chat — Premium UI, Smooth UX
// Path: frontend/src/components/kai/KAIChat.tsx
//
// Every detail matters:
// - Smooth streaming text animation
// - Beautiful message bubbles
// - Quick chips for common actions
// - Consent flow: SUGGEST → SHOW → EXPLAIN → ASK → WAIT → ACT
// - Typing indicator that feels alive
// - Empty state that makes seller want to talk to KAI
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import { useAuthStore }                             from "@/store/auth.store";
import { api }                                      from "@/lib/api";
import {
  Send, Sparkles, ChevronRight, Copy,
  Check, ThumbsUp, RotateCcw, Loader2,
  Mic, Plus, X, TrendingUp, Package,
  Zap, BarChart2, ShoppingCart,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────
interface Message {
  id:        string;
  role:      "user" | "KIRO";
  content:   string;
  timestamp: Date;
  isStreaming?: boolean;
  actions?:  Array<{ label: string; value: string }>;
  dataCard?: any;
}

// ── Quick suggestions by context ─────────────────────────────
const QUICK_CHIPS = [
  { icon: "📊", label: "My sales today",          prompt: "What are my sales today?" },
  { icon: "📦", label: "Unfulfilled orders",       prompt: "Show me orders that need fulfillment" },
  { icon: "🔥", label: "Trending products",        prompt: "What products are trending in my country right now?" },
  { icon: "✍️", label: "Write TikTok script",      prompt: "Write me a TikTok script for my best-selling product" },
  { icon: "🎯", label: "Winning ads",              prompt: "Show me winning ads for my niche" },
  { icon: "💰", label: "Protect margins",          prompt: "Alert me if any product margin drops below 30%" },
  { icon: "🔍", label: "Find supplier",            prompt: "Find me a better supplier for my products" },
  { icon: "📈", label: "Revenue forecast",         prompt: "Forecast my revenue for the next 30 days" },
];

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm self-start"
      style={{ background: "rgba(255,255,255,0.06)", maxWidth: "80px" }}>
      {[0,1,2].map(i => (
        <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#a78bfa" }}
          animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }} />
      ))}
    </div>
  );
}

// ── KAI Avatar ────────────────────────────────────────────────
function KAIAvatar({ size = 28 }: { size?: number }) {
  return (
    <motion.div
      className="rounded-xl flex items-center justify-center font-black text-white flex-shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(135deg,#7c3aed,#5b21b6)", fontSize: size * 0.4 }}
      animate={{ boxShadow: ["0 0 0px #7c3aed40","0 0 12px #7c3aed60","0 0 0px #7c3aed40"] }}
      transition={{ duration: 3, repeat: Infinity }}>
      K
    </motion.div>
  );
}

// ── Message Bubble ────────────────────────────────────────────
function MessageBubble({ msg, onCopy }: { msg: Message; onCopy: (text: string) => void }) {
  const isKai    = msg.role === "KIRO";
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyMsg = () => {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className={`flex gap-2.5 ${isKai ? "justify-start" : "justify-end"}`}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 350 }}>

      {isKai && <KAIAvatar size={26} />}

      <div className={`group max-w-[82%] ${isKai ? "" : "items-end flex flex-col"}`}>
        {/* Bubble */}
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background:   isKai ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
            color:        "rgba(255,255,255,0.88)",
            borderRadius: isKai ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
            boxShadow:    isKai ? "none" : "0 4px 16px rgba(124,58,237,0.3)",
          }}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
          {msg.isStreaming && (
            <motion.span className="inline-block w-0.5 h-3.5 rounded-full ml-0.5 align-middle"
              style={{ background: isKai ? "#a78bfa" : "rgba(255,255,255,0.6)" }}
              animate={{ opacity: [1,0,1] }}
              transition={{ duration: 0.8, repeat: Infinity }} />
          )}
        </div>

        {/* KAI action buttons */}
        {isKai && msg.actions && msg.actions.length > 0 && !msg.isStreaming && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.actions.map((action, i) => (
              <motion.button key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}>
                <ChevronRight size={10} />
                {action.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* Timestamp + micro actions */}
        <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isKai ? "" : "justify-end"}`}>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>
            {msg.timestamp.toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" })}
          </span>
          {isKai && (
              <button onClick={copyMsg} className="w-5 h-5 flex items-center justify-center rounded"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                {copied ? <Check size={10} /> : <Copy size={10} />}
              </button>
              <button onClick={() => setLiked(!liked)}
                style={{ color: liked ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
                <ThumbsUp size={10} />
              </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────
function KAIEmptyState({ onChip }: { onChip: (prompt: string) => void }) {
  const store = useAuthStore(s => s.user?.stores?.[0] as any);
  const name  = useAuthStore(s => s.user?.name?.split(" ")[0] || "there");

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      {/* KAI avatar large */}
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-5"
        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
        animate={{
          boxShadow: ["0 0 0px #7c3aed30","0 0 32px #7c3aed50","0 0 0px #7c3aed30"],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}>
        K
      </motion.div>

      <p className="text-lg font-semibold text-white mb-1">
        Hi {name}, I'm KAI 👋
      </p>
      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
        Your AI business partner. I know your store,<br />
        your orders, your products, and your market.
      </p>

      {/* Chips */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-2">
        {QUICK_CHIPS.slice(0,6).map((chip, i) => (
          <motion.button key={i}
            onClick={() => onChip(chip.prompt)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-left transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ background: "rgba(124,58,237,0.12)", borderColor: "rgba(124,58,237,0.25)", color: "#a78bfa" }}
            whileTap={{ scale: 0.97 }}>
            <span className="text-base flex-shrink-0">{chip.icon}</span>
            <span className="leading-tight">{chip.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── MAIN KIRO chat ─────────────────────────────────────────────
export default function KAIChat({ storeId, className }: { storeId?: string; className?: string }) {
  const user         = useAuthStore(s => s.user);
  const effectiveStoreId = storeId || user?.stores?.[0]?.id || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const send = useCallback(async (overrideInput?: string) => {
    const text = (overrideInput || input).trim();
    if (!text || loading) return;

    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const userMsg: Message = {
      id:        Date.now().toString(),
      role:      "user",
      content:   text,
      timestamp: new Date(),
    };

    const kaiPlaceholder: Message = {
      id:          (Date.now() + 1).toString(),
      role:        "KIRO",
      content:     "",
      timestamp:   new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, kaiPlaceholder]);
    setLoading(true);

    try {
      abortRef.current = new AbortController();

      const res = await api.post("/kai/chat", {
        message:   text,
        storeId:   effectiveStoreId,
        sessionId: sessionId || undefined,
      });

      const { reply, session_id, actions } = res.data.data || res.data;

      if (session_id && !sessionId) setSessionId(session_id);

      // Simulate smooth streaming
      let displayed = "";
      const words   = (reply || "I'm here! How can I help?").split(" ");

      for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 18 + Math.random() * 10));
        displayed += (i === 0 ? "" : " ") + words[i];
        setMessages(prev => prev.map(m =>
          m.id === kaiPlaceholder.id
            ? { ...m, content: displayed, isStreaming: true }
            : m
        ));
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      // Mark streaming done
      setMessages(prev => prev.map(m =>
        m.id === kaiPlaceholder.id
          ? { ...m, content: reply || "I'm here! How can I help?", isStreaming: false, actions }
          : m
      ));
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages(prev => prev.map(m =>
        m.id === kaiPlaceholder.id
          ? { ...m, content: "Something went wrong — please try again.", isStreaming: false }
          : m
      ));
    } finally {
      setLoading(false);
    }
  }, [input, loading, effectiveStoreId, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clear = () => { setMessages([]); setSessionId(""); };

  const isEmpty = messages.length === 0;

  return (
    <div className={`flex flex-col ${className || "h-full"}`}
      style={{ background: "#0a0a14" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <KAIAvatar size={30} />
          <div>
            <p className="text-sm font-semibold text-white">KIRO</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
              <p style={{ color: "#34d399", fontSize: "10px" }}>Active · Watching your store</p>
            </div>
          </div>
        </div>
        {!isEmpty && (
          <button onClick={clear}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-xs"
            style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)" }}>
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty ? (
          <KAIEmptyState onChip={(prompt) => send(prompt)} />
        ) : (
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg}
                onCopy={text => { navigator.clipboard.writeText(text); toast.success("Copied!"); }} />
            ))}
            {loading && messages[messages.length - 1]?.isStreaming === false && (
              <div className="flex gap-2.5 justify-start">
                <KAIAvatar size={26} />
                <TypingIndicator />
              </div>
            )}
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick chips (scrollable) ── */}
      {!isEmpty && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {QUICK_CHIPS.map((chip, i) => (
              <button key={i} onClick={() => send(chip.prompt)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs flex-shrink-0 transition-all"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                {chip.icon} {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="flex items-end gap-2 px-3.5 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask KIRO anything about your business..."
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none"
            style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", lineHeight: "1.5", maxHeight: "120px" }}
            disabled={loading}
          />
          <motion.button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: input.trim() ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.05)",
              boxShadow:  input.trim() ? "0 4px 12px rgba(124,58,237,0.4)" : "none",
            }}
            whileHover={input.trim() ? { scale: 1.05 } : {}}
            whileTap={input.trim() ? { scale: 0.95 } : {}}>
            {loading
              ? <Loader2 size={14} className="animate-spin" style={{ color: "#a78bfa" }} />
              : <Send size={14} style={{ color: input.trim() ? "#fff" : "rgba(255,255,255,0.25)" }} />
            }
          </motion.button>
        </div>
        <p className="text-center mt-1.5" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
