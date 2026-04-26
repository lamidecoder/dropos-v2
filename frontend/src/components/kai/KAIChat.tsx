"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import { useAuthStore }                             from "../../store/auth.store";
import { api }                                      from "../../lib/api";
import {
  Send, Sparkles, Copy, Check, ThumbsUp, RotateCcw,
  Loader2, Plus, X, Zap, BarChart2, ShoppingCart,
  Package, TrendingUp, Image, Paperclip, Mic,
} from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id:          string;
  role:        "user" | "KIRO";
  content:     string;
  timestamp:   Date;
  isStreaming?: boolean;
  actions?:    Array<{ label: string; action: string; payload?: any }>;
  dataCard?:   any;
  type?:       "text" | "action_result" | "error";
}

const QUICK_CHIPS = [
  { icon: "📊", label: "Sales today",           prompt: "What are my sales today?" },
  { icon: "📦", label: "Unfulfilled orders",     prompt: "Show me orders that need fulfillment" },
  { icon: "🔥", label: "Trending products",      prompt: "What products are trending right now in Nigeria?" },
  { icon: "✍️",  label: "TikTok script",          prompt: "Write a TikTok script for my best-selling product" },
  { icon: "💰", label: "Protect margins",        prompt: "Alert me if any product margin drops below 30%" },
  { icon: "📈", label: "Revenue forecast",       prompt: "Forecast my revenue for the next 30 days" },
  { icon: "🎯", label: "Improve store score",   prompt: "How can I improve my store health score?" },
  { icon: "🔍", label: "Find better supplier",   prompt: "Find me a better supplier for my top products" },
];

function KIROAvatar({ size = 32 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: "linear-gradient(145deg,#6B35E8,#1A0D3D)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 12px rgba(107,53,232,0.4)" }}>
      <Zap size={size * 0.45} color="white" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 14, width: "fit-content" }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B5CF6" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity }} />
      ))}
    </div>
  );
}

function ActionButtons({ actions, onAction }: { actions: Array<{ label: string; action: string; payload?: any }>; onAction: (a: any) => void }) {
  if (!actions?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {actions.map((a, i) => (
        <button key={i} onClick={() => onAction(a)}
          style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(107,53,232,0.35)", background: "rgba(107,53,232,0.1)", color: "#A78BFA", transition: "all 0.15s" }}>
          {a.label}
        </button>
      ))}
    </div>
  );
}

function MessageBubble({ msg, onAction, onCopy }: { msg: Message; onAction: (a: any) => void; onCopy: (t: string) => void }) {
  const isKIRO = msg.role === "KIRO";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy(msg.id);
  };

  if (isKIRO) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 10, alignItems: "flex-start", maxWidth: "100%" }}>
        <KIROAvatar size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {msg.isStreaming && msg.content === "" ? <TypingIndicator /> : (
            <div>
              {/* Render markdown-ish content cleanly */}
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.88)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {msg.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return <p key={i} style={{ fontWeight: 800, fontSize: 15, color: "#fff", margin: "12px 0 4px" }}>{line.slice(3)}</p>;
                  if (line.startsWith("# ")) return <p key={i} style={{ fontWeight: 900, fontSize: 16, color: "#fff", margin: "14px 0 6px" }}>{line.slice(2)}</p>;
                  if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{ fontWeight: 700, color: "#fff" }}>{line.slice(2, -2)}</p>;
                  if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} style={{ paddingLeft: 16, position: "relative", color: "rgba(255,255,255,0.75)" }}><span style={{ position: "absolute", left: 4, color: "#8B5CF6" }}>•</span>{line.slice(2)}</p>;
                  if (/^\d+\./.test(line)) return <p key={i} style={{ paddingLeft: 20, color: "rgba(255,255,255,0.75)" }}>{line}</p>;
                  if (line === "") return <br key={i} />;
                  return <span key={i}>{line}{i < msg.content.split("\n").length - 1 ? "\n" : ""}</span>;
                })}
                {msg.isStreaming && <motion.span animate={{ opacity: [0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ display: "inline-block", width: 2, height: 14, background: "#8B5CF6", marginLeft: 2, verticalAlign: "middle" }} />}
              </div>
              {!msg.isStreaming && msg.content && (
                <button onClick={handleCopy} style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}>
                  {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                </button>
              )}
              {!msg.isStreaming && msg.actions && <ActionButtons actions={msg.actions} onAction={onAction} />}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: "18px 18px 4px 18px", background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", fontSize: 14, lineHeight: 1.6, color: "#fff", wordBreak: "break-word" }}>
        {msg.content}
      </div>
    </motion.div>
  );
}

interface KIROChatProps {
  className?:        string;
  storeId?:          string;
  initialMessage?:   string;
  compact?:          boolean;
}

export default function KIROChat({ className, storeId: propStoreId, initialMessage, compact }: KIROChatProps) {
  const { user }           = useAuthStore();
  const effectiveStoreId   = propStoreId || user?.stores?.[0]?.id || "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState(initialMessage || "");
  const [loading,  setLoading]  = useState(false);
  const [sessionId, setSessionId] = useState("");
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialMessage) { setInput(initialMessage); inputRef.current?.focus(); }
  }, [initialMessage]);

  // ── Execute KIRO action ────────────────────────────────────
  const executeAction = useCallback(async (action: { action: string; payload?: any; label: string }) => {
    const confirmMsg: Message = {
      id: Date.now().toString(), role: "user",
      content: `Execute: ${action.label}`, timestamp: new Date(),
    };
    const resultPlaceholder: Message = {
      id: (Date.now() + 1).toString(), role: "KIRO",
      content: "", timestamp: new Date(), isStreaming: true,
    };
    setMessages(prev => [...prev, confirmMsg, resultPlaceholder]);
    setLoading(true);

    try {
      const res = await api.post("/kai/action", {
        storeId: effectiveStoreId,
        actions: [{
          id:       Date.now().toString(),
          type:     action.action,
          payload:  action.payload || {},
          approved: true,
        }],
      });
      const results = res.data?.data || [];
      const result  = results[0]?.result
        ? JSON.stringify(results[0].result).slice(0, 200)
        : results[0]?.error || "Done.";
      setMessages(prev => prev.map(m =>
        m.id === resultPlaceholder.id ? { ...m, content: result, isStreaming: false } : m
      ));
      toast.success(`KIRO: ${action.label} complete`);
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === resultPlaceholder.id ? { ...m, content: "I could not complete that action - the backend may be offline.", isStreaming: false } : m
      ));
    } finally {
      setLoading(false);
    }
  }, [effectiveStoreId]);

  // ── Send message with real SSE streaming ──────────────────
  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(), role: "user",
      content: text, timestamp: new Date(),
    };
    const kiroPlaceholder: Message = {
      id: (Date.now() + 1).toString(), role: "KIRO",
      content: "", timestamp: new Date(), isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, kiroPlaceholder]);
    setLoading(true);

    try {
      abortRef.current = new AbortController();

      // Try real SSE streaming first
      const streamRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api"}/kai/smart-chat`,
        {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${useAuthStore.getState().accessToken || ""}`,
            "Accept":        "text/event-stream",
          },
          body:   JSON.stringify({ message: text, storeId: effectiveStoreId, sessionId: sessionId || undefined }),
          signal: abortRef.current.signal,
        }
      );

      if (streamRes.ok && streamRes.headers.get("content-type")?.includes("text/event-stream")) {
        // Real SSE streaming
        const reader  = streamRes.body!.getReader();
        const decoder = new TextDecoder();
        let fullText  = "";
        let actions: any[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                setMessages(prev => prev.map(m =>
                  m.id === kiroPlaceholder.id ? { ...m, content: fullText, isStreaming: false, actions } : m
                ));
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "text_delta" && parsed.delta) {
                  fullText += parsed.delta;
                  setMessages(prev => prev.map(m =>
                    m.id === kiroPlaceholder.id ? { ...m, content: fullText, isStreaming: true } : m
                  ));
                  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                } else if (parsed.type === "actions") {
                  actions = parsed.actions || [];
                } else if (parsed.session_id && !sessionId) {
                  setSessionId(parsed.session_id);
                }
              } catch (_) {
                // Non-JSON line, skip
              }
            }
          }
        }
      } else {
        // Fallback: non-streaming endpoint
        const res = await api.post("/kai/smart-chat", {
          message: text, storeId: effectiveStoreId, sessionId: sessionId || undefined,
        });
        const { reply, session_id, actions = [] } = res.data.data || res.data;
        if (session_id && !sessionId) setSessionId(session_id);

        // Animate word-by-word for non-streaming fallback
        const words = (reply || "I am here. How can I help?").split(" ");
        let displayed = "";
        for (let i = 0; i < words.length; i++) {
          await new Promise(r => setTimeout(r, 15 + Math.random() * 8));
          displayed += (i === 0 ? "" : " ") + words[i];
          setMessages(prev => prev.map(m =>
            m.id === kiroPlaceholder.id ? { ...m, content: displayed, isStreaming: true } : m
          ));
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        setMessages(prev => prev.map(m =>
          m.id === kiroPlaceholder.id ? { ...m, content: reply || "I am here. How can I help?", isStreaming: false, actions } : m
        ));
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages(prev => prev.map(m =>
        m.id === kiroPlaceholder.id ? { ...m, content: "Something went wrong. Please check your connection and try again.", isStreaming: false } : m
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
      style={{ background: "#0a0a14", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <KIROAvatar size={30} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>KIRO</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <motion.div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Your AI business partner</p>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="hide-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {isEmpty ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px 16px" }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(145deg,#6B35E8,#1A0D3D)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 32px rgba(107,53,232,0.4)" }}>
              <Zap size={28} color="white" />
            </motion.div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: "-0.03em" }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} 👋
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 24, maxWidth: 300, lineHeight: 1.6 }}>
              I am KIRO. I run your store, find winning products, write your ads, and grow your revenue. What do you need?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 380 }}>
              {QUICK_CHIPS.map(chip => (
                <button key={chip.label} onClick={() => send(chip.prompt)}
                  style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(107,53,232,0.4)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                  <span style={{ fontSize: 16, display: "block", marginBottom: 2 }}>{chip.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} onAction={executeAction} onCopy={() => {}} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "8px 8px 8px 14px", transition: "border-color 0.15s" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask KIRO anything about your store..."
            rows={1}
            disabled={loading}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, lineHeight: 1.6, resize: "none", maxHeight: 120, fontFamily: "inherit" }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <motion.button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            whileTap={{ scale: 0.92 }}
            style={{ width: 34, height: 34, borderRadius: 10, border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: input.trim() && !loading ? "linear-gradient(135deg,#6B35E8,#3D1C8A)" : "rgba(255,255,255,0.06)", transition: "all 0.15s" }}>
            {loading
              ? <Loader2 size={15} color="rgba(255,255,255,0.5)" style={{ animation: "spin 1s linear infinite" }} />
              : <Send size={14} color={input.trim() ? "white" : "rgba(255,255,255,0.25)"} />
            }
          </motion.button>
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", textAlign: "center", marginTop: 8 }}>
          KIRO can make mistakes. Always verify important decisions.
        </p>
      </div>
    </div>
  );
}
