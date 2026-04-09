"use client";
// ============================================================
// KAI Agent Chat — Dashboard In Chat
// Path: frontend/src/components/kai/KAIAgentChat.tsx
//
// EVERY dashboard action available through conversation.
// Multi-store aware. Approval cards before executing.
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import { useMutation, useQuery, useQueryClient }    from "@tanstack/react-query";
import { api }                                      from "@/lib/api";
import { useAuthStore }                             from "@/store/auth.store";
import { useKaiStore }                              from "@/store/kai.store";
import { KAIInput }                                 from "./KAIInput";
import {
  Check, X, Store, Package, ShoppingCart,
  TrendingUp, Tag, Zap, Settings, AlertTriangle,
  ChevronDown, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id:      string;
  role:    "user" | "assistant" | "system";
  content: string;
  type?:   "text" | "action_proposal" | "action_result" | "store_select" | "data_card";
  data?:   any;
}

// ── Store Selector ────────────────────────────────────────────
function StoreSelector({ stores, onSelect }: { stores: any[]; onSelect: (id: string) => void }) {
  return (
    <div className="my-2">
      <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
        You have {stores.length} stores. Which one are we working on?
      </p>
      <div className="space-y-2">
        {stores.map((s: any) => (
          <motion.button key={s.id} onClick={() => onSelect(s.id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            whileHover={{ background: "rgba(124,58,237,0.12)", borderColor: "rgba(124,58,237,0.25)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(124,58,237,0.15)" }}>
              <Store size={15} style={{ color: "#a78bfa" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{s.name}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                {s._count?.products || 0} products · {s._count?.orders || 0} orders ·
                <span className="ml-1" style={{ color: s.status === "ACTIVE" ? "#34d399" : "#fbbf24" }}>
                  {s.status === "ACTIVE" ? "Open" : "Closed"}
                </span>
              </p>
            </div>
            <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Action Proposal Card ──────────────────────────────────────
function ActionProposal({ proposal, data, onApprove, onReject, onEdit }: {
  proposal: any; data: any; onApprove: (editedData: any) => void;
  onReject: () => void; onEdit?: () => void;
}) {
  const [fields, setFields] = useState<Record<string, any>>(
    Object.fromEntries((proposal.fields || []).map((f: any) => [f.key, f.value]))
  );
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div className="my-2 rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${proposal.color}30`, background: `${proposal.color}08` }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(!expanded)}>
        <span className="text-xl">{proposal.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{proposal.title}</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{proposal.description}</p>
        </div>
        <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            style={{ overflow: "hidden" }}>

            {/* Warning */}
            {proposal.warning && (
              <div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
                <p className="text-xs" style={{ color: "#fbbf24" }}>{proposal.warning}</p>
              </div>
            )}

            {/* Editable fields */}
            {proposal.fields?.length > 0 && (
              <div className="px-4 pb-3 space-y-2.5">
                {proposal.fields.map((field: any) => (
                  <div key={field.key}>
                    <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {field.label}{field.required && " *"}
                    </label>
                    {field.type === "select" ? (
                      <select value={fields[field.key]}
                        onChange={e => setFields(f => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                        {field.options.map((o: string) => (
                          <option key={o} value={o} style={{ background: "#0d0d1a" }}>{o}</option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setFields(f => ({ ...f, [field.key]: !fields[field.key] }))}
                          className="w-9 h-5 rounded-full transition-colors relative"
                          style={{ background: fields[field.key] ? "#7c3aed" : "rgba(255,255,255,0.1)" }}>
                          <div className="absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all"
                            style={{ left: fields[field.key] ? "18px" : "2px" }} />
                        </button>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {fields[field.key] ? "Yes" : "No"}
                        </span>
                      </div>
                    ) : (
                      <input value={fields[field.key] ?? ""}
                        onChange={e => setFields(f => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 px-4 pb-4">
              <button onClick={() => onApprove(fields)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: proposal.color, color: "#000" }}>
                <Check size={14} />
                Confirm
              </button>
              <button onClick={onReject}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Data result card ──────────────────────────────────────────
function DataResult({ data, type }: { data: any; type: string }) {
  if (!data) return null;

  if (type === "list_products" && Array.isArray(data)) {
    return (
      <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        {data.slice(0, 8).map((p: any, i: number) => (
          <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 border-b"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.isActive ? "#34d399" : "#fbbf24" }} />
            <p className="flex-1 text-sm text-white truncate">{p.name}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>₦{Number(p.price).toLocaleString()}</p>
            <p className="text-xs w-12 text-right" style={{ color: p.stockQuantity < 5 ? "#f87171" : "rgba(255,255,255,0.4)" }}>
              {p.stockQuantity} units
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "get_sales_summary") {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[
          { label: "Today",        value: `₦${data.revenueToday?.toLocaleString()}`,     color: "#34d399" },
          { label: "This month",   value: `₦${data.revenueThisMonth?.toLocaleString()}`, color: "#a78bfa" },
          { label: "Orders today", value: data.ordersToday,                               color: "#60a5fa" },
          { label: "All time",     value: `₦${data.totalRevenue?.toLocaleString()}`,     color: "#fbbf24" },
        ].map(item => (
          <div key={item.label} className="rounded-xl px-3 py-2.5"
            style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{item.label}</p>
            <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "check_inventory") {
    return (
      <div className="mt-2 space-y-2">
        <div className="flex justify-between px-3 py-2 rounded-xl"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Out of stock</span>
          <span className="text-sm font-bold" style={{ color: "#f87171" }}>{data.outOfStock} products</span>
        </div>
        {data.lowStock?.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(251,191,36,0.15)" }}>
            {data.lowStock.map((p: any) => (
              <div key={p.name} className="flex justify-between px-3 py-2 border-b"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <span className="text-xs text-white truncate">{p.name}</span>
                <span className="text-xs font-medium" style={{ color: "#fbbf24" }}>{p.stockQuantity} left</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ── Main Agent Chat Component ─────────────────────────────────
export function KAIAgentChat() {
  const user      = useAuthStore(s => s.user);
  const { isStreaming, setIsStreaming, greeting, contextLine, quickActions, toggleSidebar, sidebarOpen } = useKaiStore();
  const qc        = useQueryClient();

  const [messages, setMessages]     = useState<Message[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>(() => user?.stores?.[0]?.id || "");
  const [convId, setConvId]         = useState<string | null>(null);
  const [pendingAction, setPending] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  // Auto-set store if only one
  useEffect(() => {
    if (user?.stores?.length === 1) setActiveStoreId(user.stores[0].id);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMsg = (msg: Message) => setMessages(m => [...m, msg]);
  const updateLast = (content: string) => setMessages(m => {
    const updated = [...m];
    if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
      updated[updated.length - 1] = { ...updated[updated.length - 1], content };
    }
    return updated;
  });

  // ── Send message ────────────────────────────────────────────
  const sendMessage = useCallback(async (content: string, imageBase64?: string, imageMediaType?: string) => {
    if (!content.trim() || isStreaming) return;

    addMsg({ id: `u-${Date.now()}`, role: "user", content });
    setIsStreaming(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const token   = useAuthStore.getState().accessToken;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const res = await fetch(`${baseURL}/kai/agent/chat`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message:    content.trim(),
          storeId:    activeStoreId,
          conversationId: convId,
          imageBase64,
          imageMediaType,
        }),
        signal: abortRef.current.signal,
      });

      const contentType = res.headers.get("content-type");

      // JSON response = action proposal or store select
      if (contentType?.includes("application/json")) {
        const json = await res.json();

        if (json.code === "SELECT_STORE") {
          addMsg({
            id:      `sys-${Date.now()}`,
            role:    "system",
            content: json.data.message,
            type:    "store_select",
            data:    { stores: json.data.stores },
          });
          return;
        }

        if (json.code === "ACTION_PROPOSAL") {
          const { proposal, action, extractedData, storeId: actionStore } = json.data;
          addMsg({
            id:      `kai-${Date.now()}`,
            role:    "assistant",
            content: `I can do that. Here's what will happen:`,
            type:    "action_proposal",
            data:    { proposal, action, extractedData, storeId: actionStore },
          });
          return;
        }
      }

      // SSE stream = conversation
      const kaiId = `kai-${Date.now()}`;
      addMsg({ id: kaiId, role: "assistant", content: "", type: "text" });

      const reader  = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let newConvId: string | null = null;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n").filter(l => l.startsWith("data: "))) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.token) { full += parsed.token; updateLast(full); }
            if (parsed.conversationId && !convId) newConvId = parsed.conversationId;
            if (parsed.done && newConvId) setConvId(newConvId);
          } catch {}
        }
      }

    } catch (err: any) {
      if (err.name !== "AbortError") {
        updateLast("I ran into an issue. Please try again.");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [activeStoreId, convId, isStreaming, setIsStreaming]);

  // ── Execute approved action ──────────────────────────────────
  const executeApproved = async (msgIndex: number, editedData: any) => {
    const msg = messages[msgIndex];
    if (!msg?.data) return;

    const { action, storeId } = msg.data;

    try {
      const res = await api.post("/kai/agent/execute", {
        action,
        data:    { ...editedData, conversationId: convId },
        storeId: storeId || activeStoreId,
        approved: true,
      });

      // Replace proposal with result
      setMessages(m => {
        const updated = [...m];
        updated[msgIndex] = {
          ...updated[msgIndex],
          type:    "action_result",
          content: `✅ Done — ${res.data.message}`,
          data:    { result: res.data.data, action, resultType: action },
        };
        return updated;
      });

      toast.success(res.data.message);
      qc.invalidateQueries(); // refresh all cached data

    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Action failed";
      setMessages(m => {
        const updated = [...m];
        updated[msgIndex] = { ...updated[msgIndex], type: "text", content: `I couldn't do that — ${errMsg}` };
        return updated;
      });
      toast.error(errMsg);
    }
  };

  const rejectAction = (msgIndex: number) => {
    setMessages(m => {
      const updated = [...m];
      updated[msgIndex] = { ...updated[msgIndex], type: "text", content: "No problem — cancelled." };
      return updated;
    });
  };

  const storedName = user?.stores?.find(s => s.id === activeStoreId)?.name;
  const isEmpty    = messages.length === 0;

  return (
    <div className="flex flex-col h-full min-h-0" style={{ background: "#07070e" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            ☰
          </button>
          <motion.div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}
            animate={{ boxShadow: ["0 0 0px #7c3aed20","0 0 12px #7c3aed50","0 0 0px #7c3aed20"] }}
            transition={{ duration: 2.5, repeat: Infinity }}>
            K
          </motion.div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">KIRO</p>
            <p className="leading-none mt-0.5" style={{ color: isStreaming ? "#a78bfa" : "#34d399", fontSize: "10px" }}>
              {isStreaming ? "Working..." : storedName ? `${storedName}` : "Online"}
            </p>
          </div>
        </div>

        {/* Store switcher */}
        {(user?.stores?.length || 0) > 1 && (
          <button
            onClick={() => addMsg({ id: `sys-${Date.now()}`, role: "system", content: "Switch store", type: "store_select", data: { stores: user?.stores } })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
            <Store size={11} />
            {storedName || "Select Store"}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 space-y-3">

        {/* Empty state */}
        {isEmpty && (
          <motion.div className="flex flex-col items-center justify-center min-h-full py-8 text-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}
              animate={{ boxShadow: ["0 0 0px #7c3aed00","0 0 40px #7c3aed40","0 0 0px #7c3aed00"] }}
              transition={{ duration: 3, repeat: Infinity }}>K</motion.div>

            <h2 className="text-2xl font-semibold text-white mb-2">{greeting}</h2>
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{contextLine}</p>
            <p className="text-xs mb-7 max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>
              Just tell me what you need — I can add products, update prices, check orders, create coupons, change your template, and everything else in your dashboard.
            </p>

            {/* Quick action chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-sm mb-5">
              {quickActions.map((a: any, i: number) => (
                <motion.button key={i} onClick={() => sendMessage(a.prompt)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", fontSize: "13px" }}
                  whileHover={{ background: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.3)", color: "#a78bfa" }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}>
                  {a.icon} {a.label}
                </motion.button>
              ))}
            </div>

            {/* Dashboard action shortcuts */}
            <div className="w-full max-w-xs">
              <p className="text-xs mb-2 text-center" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", letterSpacing: "0.1em" }}>
                OR SAY THINGS LIKE
              </p>
              <div className="space-y-1.5">
                {[
                  { icon: Package,    text: `"Add a product called Brazilian Hair at ₦35,000"` },
                  { icon: TrendingUp, text: `"Show me my sales summary"` },
                  { icon: ShoppingCart,text:`"Mark order #ABC123 as shipped"` },
                  { icon: Tag,        text: `"Create a 20% off coupon"` },
                  { icon: Zap,        text: `"Start a flash sale tonight"` },
                  { icon: Settings,   text: `"Switch to the Lagos Noir template"` },
                ].map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.text.replace(/"/g, ""))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={e => { (e.currentTarget as any).style.background = "rgba(124,58,237,0.08)"; (e.currentTarget as any).style.borderColor = "rgba(124,58,237,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as any).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as any).style.borderColor = "rgba(255,255,255,0.05)"; }}>
                    <s.icon size={11} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                    <span style={{ fontStyle: "italic" }}>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Message list */}
        {messages.map((msg, idx) => (
          <motion.div key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} ${msg.role === "system" ? "justify-center" : ""}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

            {/* User message */}
            {msg.role === "user" && (
              <div className="px-4 py-2.5 rounded-2xl max-w-[75%] text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)", color: "#fff", borderRadius: "18px 18px 4px 18px", lineHeight: "1.6" }}>
                {msg.content}
              </div>
            )}

            {/* KAI text message */}
            {msg.role === "assistant" && msg.type === "text" && (
              <div className="max-w-[80%]">
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", borderRadius: "18px 18px 18px 4px" }}>
                  {msg.content || (
                    <div className="flex gap-1.5 py-0.5">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: "#7c3aed" }}
                          animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action proposal */}
            {msg.role === "assistant" && msg.type === "action_proposal" && msg.data && (
              <div className="w-full max-w-sm">
                <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>{msg.content}</p>
                <ActionProposal
                  proposal={msg.data.proposal}
                  data={msg.data.extractedData}
                  onApprove={(editedData) => executeApproved(idx, editedData)}
                  onReject={() => rejectAction(idx)}
                />
              </div>
            )}

            {/* Action result */}
            {msg.role === "assistant" && msg.type === "action_result" && (
              <div className="w-full max-w-sm">
                <div className="flex items-center gap-2 text-sm mb-2" style={{ color: "#34d399" }}>
                  <Check size={14} />
                  {msg.content}
                </div>
                {msg.data?.result && (
                  <DataResult data={msg.data.result} type={msg.data.action} />
                )}
              </div>
            )}

            {/* Store selector */}
            {msg.role === "system" && msg.type === "store_select" && (
              <div className="w-full max-w-sm">
                <StoreSelector
                  stores={msg.data.stores}
                  onSelect={(id) => {
                    setActiveStoreId(id);
                    const storeName = user?.stores?.find(s => s.id === id)?.name;
                    // Remove the store select message and add confirmation
                    setMessages(m => m.filter((_, i) => i !== idx));
                    addMsg({
                      id:      `sys-${Date.now()}`,
                      role:    "assistant",
                      content: `Switched to ${storeName}. What do you need?`,
                      type:    "text",
                    });
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <KAIInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
