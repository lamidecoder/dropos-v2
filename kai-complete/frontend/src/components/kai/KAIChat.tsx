"use client";
// ============================================================
// KAI — Complete Chat Interface (10/10)
// Path: frontend/src/components/kai/KAIChat.tsx
// ============================================================
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Plus, Bell, Zap, Brain, Target } from "lucide-react";
import { useKaiStore } from "@/store/kai.store";
import { useKai } from "@/hooks/useKai";
import { KAIMessageBubble } from "@/components/kai/KAIMessage";
import { KAIInput } from "@/components/kai/KAIInput";
import { KAIPulse } from "@/components/kai/KAIPulse";
import { KAISkills } from "@/components/kai/KAISkills";
import { KAIMemory } from "@/components/kai/KAIMemory";
import { KAIGoals } from "@/components/kai/KAIGoals";

const TABS = [
  { id: "chat",   label: "Chat",    icon: null },
  { id: "pulse",  label: "Pulse",   icon: Bell },
  { id: "skills", label: "Skills",  icon: Zap },
  { id: "memory", label: "Memory",  icon: Brain },
  { id: "goals",  label: "Goals",   icon: Target },
] as const;

export function KAIChat() {
  const {
    messages, isStreaming, greeting, contextLine, quickActions,
    sidebarOpen, toggleSidebar, startNewConversation,
    activeTab, setActiveTab, unreadCount,
  } = useKaiStore();

  const { sendMessage } = useKai();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, activeTab]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full min-h-0" style={{ background: "#07070e" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: sidebarOpen ? "#a78bfa" : "rgba(255,255,255,0.45)" }}>
            <Menu size={17} />
          </button>
          <div className="flex items-center gap-2">
            <motion.div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}
              animate={{ boxShadow: ["0 0 0px #7c3aed20", "0 0 12px #7c3aed50", "0 0 0px #7c3aed20"] }}
              transition={{ duration: 2.5, repeat: Infinity }}>
              K
            </motion.div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">KAI</p>
              <p className="leading-none mt-0.5" style={{ color: isStreaming ? "#a78bfa" : "rgba(255,255,255,0.3)", fontSize: "10px" }}>
                {isStreaming ? "Thinking..." : "Online · Always learning"}
              </p>
            </div>
          </div>
        </div>
        <button onClick={startNewConversation}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
          <Plus size={11} />New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0 px-2 pt-2 gap-1"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-all"
            style={{
              color: activeTab === tab.id ? "#a78bfa" : "rgba(255,255,255,0.35)",
              background: activeTab === tab.id ? "rgba(124,58,237,0.1)" : "transparent",
              borderBottom: activeTab === tab.id ? "2px solid #7c3aed" : "2px solid transparent",
            }}>
            {tab.icon && <tab.icon size={11} />}
            {tab.label}
            {tab.id === "pulse" && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ background: "#f87171", fontSize: "9px" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "chat" && (
            <motion.div key="chat" className="flex flex-col h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <AnimatePresence>
                  {isEmpty && (
                    <motion.div className="flex flex-col items-center justify-center min-h-full py-8"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}>
                      <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-5"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}
                        animate={{ boxShadow: ["0 0 0px #7c3aed00", "0 0 40px #7c3aed40", "0 0 0px #7c3aed00"] }}
                        transition={{ duration: 3, repeat: Infinity }}>
                        K
                      </motion.div>
                      <motion.h2 className="text-2xl font-semibold text-white text-center mb-2"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {greeting}
                      </motion.h2>
                      <motion.p className="text-sm text-center mb-7 max-w-xs leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                        {contextLine}
                      </motion.p>
                      {quickActions.length > 0 && (
                        <motion.div className="flex flex-wrap justify-center gap-2 max-w-sm"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                          {quickActions.map((action: any, i: number) => (
                            <motion.button key={i} onClick={() => sendMessage(action.prompt)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", fontSize: "13px" }}
                              whileHover={{ background: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.3)", color: "#a78bfa" }}
                              whileTap={{ scale: 0.97 }}
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + i * 0.08 }}>
                              <span>{action.icon}</span><span>{action.label}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {messages.map((msg: any, i: number) => (
                  <KAIMessageBubble key={msg.id} message={msg}
                    isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"} />
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0">
                <KAIInput onSend={sendMessage} disabled={isStreaming} />
              </div>
            </motion.div>
          )}

          {activeTab === "pulse" && (
            <motion.div key="pulse" className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <KAIPulse />
            </motion.div>
          )}

          {activeTab === "skills" && (
            <motion.div key="skills" className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <KAISkills />
            </motion.div>
          )}

          {activeTab === "memory" && (
            <motion.div key="memory" className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <KAIMemory />
            </motion.div>
          )}

          {activeTab === "goals" && (
            <motion.div key="goals" className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <KAIGoals />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
