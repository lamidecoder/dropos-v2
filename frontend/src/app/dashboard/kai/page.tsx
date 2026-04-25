"use client";
﻿"use client";
// Path: frontend/src/app/dashboard/kai/page.tsx

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import {
  Zap, Send, Paperclip, Mic, MoreHorizontal,
  ChevronRight, Sparkles, TrendingUp, Package,
  ShoppingCart, BarChart2, Trash2, Copy, RefreshCw,
  MessageSquare, Clock, Star, ChevronDown,
} from "lucide-react";

const V = { v900: "#1A0D3D", v700: "#3D1C8A", v600: "#5428C8", v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA", v200: "#C4B5FD", fuchsia: "#C026D3", cyan: "#06B6D4" };

const T = {
  dark:  { bg: "#06040D", surface: "#0D0918", card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.12)" },
  light: { bg: "#F4F2FF", surface: "#fff",    card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(13,9,24,0.08)" },
};

const SUGGESTIONS = [
  { icon: TrendingUp,   label: "Analyse my store performance" },
  { icon: Package,      label: "Find winning products to sell" },
  { icon: ShoppingCart, label: "Help me recover abandoned carts" },
  { icon: BarChart2,    label: "Generate a sales forecast" },
  { icon: Sparkles,     label: "Write product descriptions" },
  { icon: TrendingUp,   label: "Suggest pricing strategy" },
];

const HISTORY = [
  { id: "1", title: "Product research for sneakers", time: "2h ago" },
  { id: "2", title: "Store SEO optimisation tips",   time: "Yesterday" },
  { id: "3", title: "Supplier comparison analysis",  time: "2 days ago" },
];

interface Message {
  id: string;
  role: "user" | "kiro";
  content: string;
  time: string;
}

export default function KIROPage() {
  const { theme } = useTheme();
  const t = theme === "dark" ? T.dark : T.light;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setTimeout(() => {
      const kiroMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "kiro",
        content: "I'm analysing your store data now. Give me a moment to pull together the insights you need. Once the Anthropic API key is fully connected, I'll be able to give you detailed, real-time analysis of your store performance, product trends, and actionable recommendations.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, kiroMsg]);
      setLoading(false);
    }, 1500);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px - 56px)", gap: 16, maxWidth: 1400, margin: "0 auto" }}>

      {/* History Sidebar */}
      <motion.aside
        animate={{ width: showHistory ? 260 : 0, opacity: showHistory ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ overflow: "hidden", flexShrink: 0 }}
      >
        <div style={{ width: 260, height: "100%", borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.text, letterSpacing: "-0.01em" }}>Conversation History</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {HISTORY.map(h => (
              <div key={h.id} style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 2, transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = t.faint)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div style={{ fontSize: 12, fontWeight: 500, color: t.text, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: t.muted }}>
                  <Clock size={9} />{h.time}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${t.border}` }}>
            <button style={{ width: "100%", padding: "8px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 12, color: t.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Trash2 size={11} /> Clear all history
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: 16, background: t.card, border: `1px solid ${t.border}`, overflow: "hidden", minWidth: 0 }}>

        {/* Chat header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(145deg, ${V.v500}, ${V.v900})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px rgba(107,53,232,0.35)` }}>
            <Zap size={15} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>KIRO</div>
            <div style={{ fontSize: 11, color: V.v400, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
              Online · Your AI co-pilot
            </div>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} style={{ padding: "7px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: showHistory ? "rgba(107,53,232,0.12)" : "transparent", cursor: "pointer", fontSize: 12, color: showHistory ? V.v400 : t.muted, display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={12} /> History
          </button>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MoreHorizontal size={14} color={t.muted} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

          {isEmpty && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px" }}>
              {/* KIRO mark */}
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(145deg, ${V.v500}, ${V.v900})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: `0 8px 32px rgba(107,53,232,0.4)` }}>
                <Zap size={28} color="white" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text, marginBottom: 8 }}>
                What can I help you with?
              </h2>
              <p style={{ fontSize: 14, color: t.muted, marginBottom: 32, maxWidth: 420, lineHeight: 1.6 }}>
                I'm KIRO - your AI commerce co-pilot. Ask me anything about your store, products, orders, or strategy.
              </p>

              {/* Suggestions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, width: "100%", maxWidth: 600 }}>
                {SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setInput(s.label)}
                      style={{ padding: "12px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.faint, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                      whileHover={{ scale: 1.02, borderColor: `rgba(107,53,232,0.3)` }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Icon size={14} color={V.v400} style={{ marginBottom: 6 }} />
                      <div style={{ fontSize: 11.5, fontWeight: 500, color: t.text, lineHeight: 1.4 }}>{s.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              style={{ display: "flex", gap: 12, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>

              {/* Avatar */}
              <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                background: msg.role === "kiro" ? `linear-gradient(145deg, ${V.v500}, ${V.v900})` : theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,5,32,0.08)",
                color: msg.role === "kiro" ? "white" : t.text,
              }}>
                {msg.role === "kiro" ? <Zap size={13} color="white" /> : "O"}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  fontSize: 14, lineHeight: 1.6, color: msg.role === "user" ? "#fff" : t.text,
                  background: msg.role === "user" ? `linear-gradient(135deg, ${V.v500}, ${V.v700})` : theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(15,5,32,0.04)",
                  border: msg.role === "user" ? "none" : `1px solid ${t.border}`,
                  boxShadow: msg.role === "user" ? `0 4px 16px rgba(107,53,232,0.3)` : "none",
                }}>
                  {msg.content}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: t.muted }}>{msg.time}</span>
                  {msg.role === "kiro" && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ padding: "2px 6px", borderRadius: 6, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 10, color: t.muted, display: "flex", alignItems: "center", gap: 3 }}>
                        <Copy size={9} /> Copy
                      </button>
                      <button style={{ padding: "2px 6px", borderRadius: 6, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", fontSize: 10, color: t.muted, display: "flex", alignItems: "center", gap: 3 }}>
                        <RefreshCw size={9} /> Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(145deg, ${V.v500}, ${V.v900})` }}>
                <Zap size={13} color="white" />
              </div>
              <div style={{ padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(15,5,32,0.04)", border: `1px solid ${t.border}`, display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    style={{ width: 7, height: 7, borderRadius: "50%", background: V.v400 }} />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, padding: "16px 20px", borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", padding: "12px 14px", borderRadius: 16, border: `1px solid ${input ? "rgba(107,53,232,0.4)" : t.border}`, background: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,5,32,0.03)", transition: "border-color 0.2s" }}>
            <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Paperclip size={14} color={t.muted} />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKey}
              placeholder="Ask KIRO anything about your store..."
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 14, color: t.text, lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif", maxHeight: 160 }}
            />

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mic size={14} color={t.muted} />
              </button>
              <button onClick={handleSend} disabled={!input.trim() || loading}
                style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", background: input.trim() ? `linear-gradient(135deg, ${V.v500}, ${V.v700})` : theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.06)", transition: "all 0.15s", boxShadow: input.trim() ? `0 4px 12px rgba(107,53,232,0.35)` : "none" }}>
                <Send size={14} color={input.trim() ? "white" : t.muted} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10, gap: 4 }}>
            <Zap size={10} color={V.v400} />
            <span style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 8, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              KIRO by DropOS · AI Commerce Intelligence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
