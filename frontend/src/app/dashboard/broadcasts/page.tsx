"use client";
﻿"use client";
// Path: frontend/src/app/dashboard/broadcasts/page.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Send, Sparkles, Users, Clock, CheckCircle, MessageSquare, Zap, Calendar, BarChart2, RefreshCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const SEGMENTS = [
  { id: "all",       label: "All Customers",   icon: Users,   desc: "Everyone who ever ordered" },
  { id: "repeat",    label: "Repeat Buyers",   icon: Zap,     desc: "Ordered more than once" },
  { id: "vip",       label: "VIP & Gold",      icon: Sparkles,desc: "Top tier loyalty customers" },
  { id: "recent_30", label: "Last 30 Days",    icon: Clock,   desc: "Ordered in past month" },
];

const TYPES = [
  { id: "flash_sale",  label: "⚡ Flash Sale",    color: "#fbbf24" },
  { id: "new_arrival", label: "✨ New Arrival",   color: "#60a5fa" },
  { id: "payday",      label: "💰 Payday Special",color: "#34d399" },
  { id: "win_back",    label: "💝 Win-Back",       color: "#f472b6" },
  { id: "custom",      label: "✏️ Custom",         color: "#a78bfa" },
];

const STATUS_COLOR: Record<string, string> = {
  sent: "#34d399", scheduled: "#60a5fa", draft: "#fbbf24", failed: "#f87171",
};

export default function BroadcastsPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const qc      = useQueryClient();

  const [segment, setSegment]   = useState("all");
  const [msgType, setMsgType]   = useState("flash_sale");
  const [message, setMessage]   = useState("");
  const [product, setProduct]   = useState("");
  const [discount, setDiscount] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [tab, setTab]           = useState<"compose" | "history">("compose");

  const { data: broadcasts } = useQuery({
    queryKey: ["broadcasts", storeId],
    queryFn: async () => { const r = await api.get(`/super/broadcasts?storeId=${storeId}`); return r.data.data; },
    enabled: !!storeId && tab === "history",
  });

  const { data: audience } = useQuery({
    queryKey: ["audience", storeId, segment],
    queryFn: async () => {
      const r = await api.get(`/super/broadcasts/audience?storeId=${storeId}&segment=${segment}`);
      return r.data.data;
    },
    enabled: !!storeId,
  });

  const generateMutation = useMutation({
    mutationFn: async () => api.post("/super/broadcasts/generate", { storeId, type: msgType, productName: product, discount }),
    onSuccess: (res) => setMessage(res.data.data.message),
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post("/super/broadcasts", { storeId, message, segment, scheduledAt: schedTime || undefined }),
    onSuccess: (res) => {
      const { data } = res.data;
      if (!schedTime) sendMutation.mutate(data.broadcast.id);
      else { toast.success(`Broadcast scheduled for ${new Date(schedTime).toLocaleString()}`); qc.invalidateQueries(["broadcasts", storeId]); }
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/super/broadcasts/${id}/send`),
    onSuccess: (res) => {
      const { sent, failed } = res.data.data;
      toast.success(`Sent to ${sent} customers! ${failed > 0 ? `(${failed} failed)` : ""}`);
      setMessage(""); setProduct(""); setDiscount("");
      qc.invalidateQueries(["broadcasts", storeId]);
    },
    onError: (err: any) => {
      if (err.response?.status === 503) {
        toast.error("Connect WhatsApp first in Settings → Integrations");
      } else {
        toast.error("Send failed — check WhatsApp setup");
      }
    },
  });

  return (
    
      <div className="h-full flex flex-col" style={{ background: "#07070e" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white mb-0.5">WhatsApp Broadcasts</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Reach your customers where they actually are
              </p>
            </div>
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              {(["compose","history"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-1.5 rounded-lg text-sm capitalize transition-all"
                  style={{ background: tab === t ? "rgba(124,58,237,0.3)" : "transparent", color: tab === t ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          <AnimatePresence mode="wait">

            {/* COMPOSE TAB */}
            {tab === "compose" && (
              <motion.div key="compose" className="grid grid-cols-3 gap-5 h-full"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                {/* Left — Settings */}
                <div className="space-y-4">
                  {/* Audience */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Audience</p>
                    <div className="space-y-1.5">
                      {SEGMENTS.map(s => (
                        <button key={s.id} onClick={() => setSegment(s.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{ background: segment === s.id ? "rgba(124,58,237,0.15)" : "transparent", border: segment === s.id ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent" }}>
                          <s.icon size={13} style={{ color: segment === s.id ? "#a78bfa" : "rgba(255,255,255,0.35)" }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: segment === s.id ? "#a78bfa" : "rgba(255,255,255,0.7)" }}>{s.label}</p>
                            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>{s.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {audience && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <Users size={12} style={{ color: "#34d399" }} />
                        <p className="text-xs" style={{ color: "#34d399" }}>{audience.count} customers will receive this</p>
                      </div>
                    )}
                  </div>

                  {/* Schedule */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Schedule (optional)</p>
                    <input type="datetime-local" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
                    <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                      Leave empty to send immediately
                    </p>
                  </div>
                </div>

                {/* Middle — Message */}
                <div className="space-y-4">
                  {/* Type */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Broadcast Type</p>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map(t => (
                        <button key={t.id} onClick={() => setMsgType(t.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs transition-all"
                          style={{
                            background: msgType === t.id ? `${t.color}20` : "rgba(255,255,255,0.04)",
                            border: msgType === t.id ? `1px solid ${t.color}40` : "1px solid rgba(255,255,255,0.06)",
                            color: msgType === t.id ? t.color : "rgba(255,255,255,0.5)",
                          }}>
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Context inputs */}
                    <div className="mt-3 space-y-2">
                      <input value={product} onChange={e => setProduct(e.target.value)}
                        placeholder="Product name (optional)"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }} />
                      <input value={discount} onChange={e => setDiscount(e.target.value)}
                        placeholder="Discount e.g. 20% off or ₦2,000 off"
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }} />
                    </div>

                    <button onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isLoading}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
                      <Sparkles size={13} />
                      {generateMutation.isLoading ? "KIRO is writing..." : "KAI Write for Me"}
                    </button>
                  </div>

                  {/* Message editor */}
                  <div className="rounded-2xl p-4 flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", minHeight: "200px" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Your Message</p>
                      <span className="text-xs" style={{ color: message.length > 900 ? "#f87171" : "rgba(255,255,255,0.25)" }}>{message.length}/1000</span>
                    </div>
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Type your message or use KAI to write it..."
                      className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.8)", minHeight: "140px" }} />
                  </div>
                </div>

                {/* Right — Preview + Send */}
                <div className="space-y-4">
                  {/* Phone preview */}
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Preview</p>
                    {/* Phone mockup */}
                    <div className="mx-auto w-52 rounded-3xl overflow-hidden"
                      style={{ background: "#1a1a2e", border: "2px solid rgba(255,255,255,0.12)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                      {/* Status bar */}
                      <div className="px-4 pt-3 pb-1 flex justify-between items-center">
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>9:41</span>
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => <div key={i} className="w-1 rounded-sm" style={{ height: `${(i+1)*3}px`, background: i < 3 ? "white" : "rgba(255,255,255,0.3)" }} />)}
                        </div>
                      </div>
                      {/* WhatsApp header */}
                      <div className="px-3 py-2 flex items-center gap-2" style={{ background: "#128C7E" }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(255,255,255,0.2)" }}>S</div>
                        <div>
                          <p style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}>{user?.stores?.[0]?.name || "Your Store"}</p>
                          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "9px" }}>Business Account</p>
                        </div>
                      </div>
                      {/* Chat area */}
                      <div className="p-3 min-h-24" style={{ background: "#0d1117" }}>
                        {message ? (
                          <div className="rounded-lg rounded-tl-sm p-2.5 max-w-full" style={{ background: "#262d34" }}>
                            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                              {message.slice(0, 200)}{message.length > 200 ? "..." : ""}
                            </p>
                            <p className="text-right mt-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px" }}>
                              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
                            </p>
                          </div>
                        ) : (
                          <p className="text-center mt-4" style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
                            Your message preview appears here
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Send button */}
                  <button
                    disabled={!message.trim() || createMutation.isLoading || sendMutation.isLoading}
                    onClick={() => createMutation.mutate()}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-semibold transition-all"
                    style={{
                      background: message.trim() ? "linear-gradient(135deg, #128C7E, #25D366)" : "rgba(255,255,255,0.05)",
                      color: message.trim() ? "#fff" : "rgba(255,255,255,0.25)",
                      boxShadow: message.trim() ? "0 8px 32px rgba(18,140,126,0.3)" : "none",
                    }}>
                    {createMutation.isLoading || sendMutation.isLoading
                      ? <RefreshCw size={16} className="animate-spin" />
                      : <Send size={16} />}
                    {schedTime ? "Schedule Broadcast" : "Send Now"}
                  </button>

                  {audience?.count === 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      <AlertCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>No customers in this segment yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* HISTORY TAB */}
            {tab === "history" && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {!broadcasts?.length ? (
                  <div className="text-center py-16">
                    <MessageSquare size={36} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No broadcasts sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {broadcasts.map((b: any) => (
                      <motion.div key={b.id} className="rounded-2xl p-4"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white leading-snug line-clamp-2">{b.message}</p>
                          </div>
                          <span className="ml-3 px-2 py-0.5 rounded-full text-xs flex-shrink-0 capitalize"
                            style={{ background: `${STATUS_COLOR[b.status] || "#888"}18`, color: STATUS_COLOR[b.status] || "#888" }}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                          <span className="flex items-center gap-1"><Users size={10} />{b.sentCount || b.recipientCount} recipients</span>
                          <span className="flex items-center gap-1"><Clock size={10} />{new Date(b.createdAt).toLocaleDateString()}</span>
                          {b.sentAt && <span className="flex items-center gap-1" style={{ color: "#34d399" }}><CheckCircle size={10} />Sent</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    
  );
}
