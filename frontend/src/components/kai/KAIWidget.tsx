"use client";
// ============================================================
// Public KAI Widget
// Path: frontend/src/components/kai/KAIWidget.tsx
//
// Works EVERYWHERE — landing page, store pages, any route.
// If user is logged in: full KAI experience
// If not logged in: shows login/signup popup on first message
// ============================================================
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence }     from "framer-motion";
import { useAuthStore }                from "@/store/auth.store";
import { MessageCircle, X, Send, Loader2, User, Lock } from "lucide-react";
import Link from "next/link";

interface Message {
  id:      string;
  role:    "user" | "assistant";
  content: string;
}

// ── Auth Gate Modal ───────────────────────────────────────────
function AuthGate({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-50"
      style={{ background: "rgba(7,7,14,0.97)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-4"
        style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
        K
      </div>

      <h3 className="text-lg font-bold text-white mb-2">Meet KAI</h3>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
        Your AI business partner. Sign up free to start chatting.
      </p>

      <div className="w-full space-y-2">
        <Link href="/auth/register" onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "#7c3aed", color: "#fff" }}>
          <User size={14} />
          Create Free Account
        </Link>
        <Link href="/auth/login" onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
          <Lock size={14} />
          Sign In
        </Link>
      </div>

      <button onClick={onClose} className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
        Maybe later
      </button>
    </motion.div>
  );
}

// ── Mini KAI Widget ───────────────────────────────────────────
export function KAIWidget() {
  const { user, accessToken } = useAuthStore();
  const isLoggedIn  = !!user;

  const [isOpen, setIsOpen]         = useState(false);
  const [showAuth, setShowAuth]     = useState(false);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [streaming, setStreaming]   = useState(false);
  const [unread, setUnread]         = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show unread badge if KAI sent a proactive message
  useEffect(() => {
    if (isLoggedIn && !isOpen) {
      // Show "I noticed something" after 30s for engaged users
      const timer = setTimeout(() => {
        if (!isOpen && messages.length === 0) setUnread(1);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnread(0);
    // Show welcome message if first time
    if (messages.length === 0 && isLoggedIn) {
      setMessages([{
        id:      "welcome",
        role:    "assistant",
        content: `Hi ${user?.name?.split(" ")[0] || "there"} 👋 I'm KAI — your business partner. What can I help with today?`,
      }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    // Gate: require login to chat
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }

    const userMsg: Message = {
      id:      `u-${Date.now()}`,
      role:    "user",
      content: input.trim(),
    };
    const kaiMsg: Message = {
      id:      `k-${Date.now()}`,
      role:    "assistant",
      content: "",
    };

    setMessages(m => [...m, userMsg, kaiMsg]);
    setInput("");
    setStreaming(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const storeId  = user?.stores?.[0]?.id || "";
      const baseURL  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const res = await fetch(`${baseURL}/kai/smart-chat`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body:   JSON.stringify({ message: userMsg.content, storeId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("KAI unavailable");

      const reader  = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n").filter(l => l.startsWith("data: "))) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.token) {
              full += parsed.token;
              setMessages(m => {
                const updated = [...m];
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: full };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages(m => {
          const updated = [...m];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: "I ran into an issue. Please try again.",
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              onClick={handleOpen}
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", damping: 20 }}>
              <MessageCircle size={22} color="#fff" />
              {unread > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: "#f87171", fontSize: "10px", fontWeight: 700 }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {unread}
                </motion.div>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute bottom-0 right-0 w-80 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                height:     "460px",
                background: "#07070e",
                border:     "1px solid rgba(255,255,255,0.1)",
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1,   y: 0 }}
              exit={  { opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2">
                  <motion.div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}
                    animate={{ boxShadow: streaming ? ["0 0 0 #7c3aed20","0 0 12px #7c3aed60","0 0 0 #7c3aed20"] : [] }}
                    transition={{ duration: 1.5, repeat: Infinity }}>
                    K
                  </motion.div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-none">KIRO</p>
                    <p style={{ color: streaming ? "#a78bfa" : "#34d399", fontSize: "9px" }}>
                      {streaming ? "Thinking..." : "Online"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  <X size={15} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                style={{ height: "calc(460px - 112px)" }}>
                {messages.length === 0 && !isLoggedIn && (
                  <div className="text-center pt-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold mx-auto mb-3"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>K</div>
                    <p className="text-sm font-medium text-white mb-1">Hi! I'm KAI</p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Your AI business partner. Sign up to get started.
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="px-3 py-2 rounded-2xl max-w-64 text-sm leading-relaxed"
                      style={{
                        background: msg.role === "user"
                          ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                          : "rgba(255,255,255,0.07)",
                        borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        color: msg.role === "user" ? "#fff" : "rgba(255,255,255,0.85)",
                        fontSize: "13px",
                      }}>
                      {msg.content || (
                        <div className="flex gap-1 py-0.5">
                          {[0,1,2].map(i => (
                            <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#7c3aed" }}
                              animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Auth gate overlay */}
              <AnimatePresence>
                {showAuth && <AuthGate onClose={() => setShowAuth(false)} />}
              </AnimatePresence>

              {/* Input */}
              <div className="px-3 pb-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder={isLoggedIn ? "Ask KIRO anything..." : "Sign up to chat with KAI..."}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={streaming}
                    className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
                    style={{ background: input.trim() ? "#7c3aed" : "transparent" }}>
                    {streaming
                      ? <Loader2 size={13} className="animate-spin" style={{ color: "#7c3aed" }} />
                      : <Send size={13} style={{ color: input.trim() ? "#fff" : "rgba(255,255,255,0.3)" }} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
