"use client";
// Path: frontend/src/app/dashboard/kai/page.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Send, Loader2, RotateCcw, Copy, Check, ChevronRight, Zap, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Msg {
  id: string;
  role: "user" | "KIRO";
  text: string;
  streaming?: boolean;
}

const CHIPS = [
  { icon: "📊", label: "My sales today",            prompt: "What are my sales today?" },
  { icon: "🔥", label: "Trending products",          prompt: "What products are trending in Nigeria right now?" },
  { icon: "📦", label: "Unfulfilled orders",         prompt: "Show me orders that need fulfillment" },
  { icon: "✍️", label: "Write TikTok script",        prompt: "Write a TikTok script for my best-selling product" },
  { icon: "💰", label: "Protect my margins",         prompt: "Alert me if any product margin drops below 30%" },
  { icon: "🔍", label: "Find better supplier",       prompt: "Find me a better supplier for my products" },
  { icon: "📈", label: "Revenue forecast",           prompt: "Forecast my revenue for the next 30 days" },
  { icon: "🎯", label: "Winning ad angles",          prompt: "Give me winning ad angles for my niche" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
      style={{ background: "rgba(255,255,255,0.06)", width: "fit-content" }}>
      {[0,1,2].map(i => (
        <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa" }}
          animate={{ scale: [1,1.5,1], opacity: [0.4,1,0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  );
}

export default function KAIPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const name    = user?.name?.split(" ")[0] || "there";

  const [msgs, setMsgs]     = useState<Msg[]>([]);
  const [input, setInput]   = useState("");
  const [loading, setLoad]  = useState(false);
  const [noKey, setNoKey]   = useState(false);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    const userMsg: Msg = { id: Date.now().toString(), role: "user", text: msg };
    const kaiPlaceholder: Msg = { id: (Date.now()+1).toString(), role: "KIRO", text: "", streaming: true };
    setMsgs(prev => [...prev, userMsg, kaiPlaceholder]);
    setLoad(true);

    try {
      const res = await api.post("/kai/chat", { message: msg, storeId });
      const reply = res.data?.data?.reply || res.data?.reply || "I'm here! How can I help?";

      // Animate word by word
      const words = reply.split(" ");
      let built = "";
      for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 20 + Math.random() * 15));
        built += (i === 0 ? "" : " ") + words[i];
        const snap = built;
        setMsgs(prev => prev.map(m => m.id === kaiPlaceholder.id ? { ...m, text: snap } : m));
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      setMsgs(prev => prev.map(m => m.id === kaiPlaceholder.id ? { ...m, streaming: false } : m));
    } catch (err: any) {
      const isKeyError = err?.response?.status === 500 ||
        err?.response?.data?.message?.toLowerCase().includes("api") ||
        err?.response?.data?.message?.toLowerCase().includes("anthropic");

      if (isKeyError) setNoKey(true);

      setMsgs(prev => prev.map(m =>
        m.id === kaiPlaceholder.id
          ? { ...m, text: isKeyError
              ? "KAI needs an Anthropic API key to work. Add ANTHROPIC_API_KEY to backend/.env and restart the server."
              : "Something went wrong — please try again.",
            streaming: false }
          : m
      ));
    } finally {
      setLoad(false);
    }
  }, [input, loading, storeId]);

  const clear = () => { setMsgs([]); setNoKey(false); };

  const isEmpty = msgs.length === 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full" style={{ background: "#07070e", minHeight: "calc(100vh - 0px)" }}>

        {/* No API key banner */}
        <AnimatePresence>
          {noKey && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden flex-shrink-0">
              <div className="flex items-center gap-3 px-5 py-3"
                style={{ background: "rgba(251,191,36,0.08)", borderBottom: "1px solid rgba(251,191,36,0.2)" }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(251,191,36,0.2)" }}>
                  <span style={{ fontSize: "12px" }}>⚡</span>
                </div>
                <p className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                  KAI needs an <span style={{ color: "#fbbf24", fontWeight: 600 }}>ANTHROPIC_API_KEY</span> in{" "}
                  <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: "4px", fontSize: "12px" }}>
                    backend/.env
                  </code>{" "}
                  — get one at{" "}
                  <a href="https://console.anthropic.com" target="_blank"
                    className="underline" style={{ color: "#fbbf24" }}>
                    console.anthropic.com
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-white text-sm"
              style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
              animate={{ boxShadow: ["0 0 0px #7c3aed30","0 0 20px #7c3aed50","0 0 0px #7c3aed30"] }}
              transition={{ duration: 3, repeat: Infinity }}>
              K
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">KIRO</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
                <p style={{ color: "#34d399", fontSize: "11px" }}>
                  {noKey ? "Needs API key" : "Watching your store"}
                </p>
              </div>
            </div>
          </div>
          {!isEmpty && (
            <button onClick={clear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
              style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <RotateCcw size={11} /> New chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {isEmpty ? (
            /* Empty state */
            <motion.div className="flex flex-col items-center justify-center h-full text-center px-4 py-12"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div
                className="w-20 h-20 rounded-3xl flex items-center justify-center font-black text-white text-2xl mb-5"
                style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
                animate={{ boxShadow: ["0 0 0px #7c3aed20","0 0 40px #7c3aed50","0 0 0px #7c3aed20"], scale: [1,1.02,1] }}
                transition={{ duration: 3, repeat: Infinity }}>
                K
              </motion.div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Hey {name}! I'm KAI 👋
              </h2>
              <p className="text-sm mb-8 max-w-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                Your AI business partner. Ask me anything about your store, products, customers, or marketing.
              </p>
              {/* Chips grid */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {CHIPS.map((c, i) => (
                  <motion.button key={i} onClick={() => send(c.prompt)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-left text-sm transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ borderColor: "rgba(124,58,237,0.35)", color: "#a78bfa", backgroundColor: "rgba(124,58,237,0.08)" }}
                    whileTap={{ scale: 0.98 }}>
                    <span className="text-base flex-shrink-0">{c.icon}</span>
                    <span className="leading-tight text-xs">{c.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            msgs.map(m => (
              <motion.div key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 22 }}>

                {m.role === "KIRO" && (
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-white text-xs flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 0 12px rgba(124,58,237,0.4)" }}>
                    K
                  </div>
                )}

                <div className={`max-w-[78%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  {m.role === "KIRO" && !m.text && m.streaming ? (
                    <TypingDots />
                  ) : (
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background:   m.role === "user" ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.06)",
                        color:        "rgba(255,255,255,0.88)",
                        borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                        boxShadow:    m.role === "user" ? "0 4px 20px rgba(124,58,237,0.3)" : "none",
                      }}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {m.streaming && (
                        <motion.span className="inline-block w-0.5 h-3.5 rounded-full ml-0.5 align-middle"
                          style={{ background: "#a78bfa" }}
                          animate={{ opacity: [1,0,1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}

          {loading && msgs[msgs.length-1]?.streaming === false && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-white text-xs"
                style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>K</div>
              <TypingDots />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick chips — visible when chatting */}
        {!isEmpty && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CHIPS.slice(0,5).map((c, i) => (
                <button key={i} onClick={() => send(c.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs flex-shrink-0 whitespace-nowrap"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-5 flex-shrink-0">
          <div className="flex items-end gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <textarea ref={inputRef} value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask KIRO anything about your business..."
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent outline-none resize-none"
              style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", lineHeight: "1.5", maxHeight: "120px" }} />
            <motion.button onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: input.trim() ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.06)",
                boxShadow:  input.trim() ? "0 4px 16px rgba(124,58,237,0.4)" : "none",
              }}
              whileHover={input.trim() ? { scale: 1.05 } : {}}
              whileTap={input.trim() ? { scale: 0.95 } : {}}>
              {loading
                ? <Loader2 size={15} className="animate-spin" style={{ color: "#a78bfa" }} />
                : <Send size={15} style={{ color: input.trim() ? "#fff" : "rgba(255,255,255,0.25)" }} />
              }
            </motion.button>
          </div>
          <p className="text-center mt-1.5" style={{ color: "rgba(255,255,255,0.18)", fontSize: "10px" }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
