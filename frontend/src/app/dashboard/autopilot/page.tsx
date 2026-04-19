"use client";
// ============================================================
// Autopilot Dashboard
// Path: frontend/src/app/dashboard/autopilot/page.tsx
//
// Shows seller what's running on autopilot.
// Connect CJ once. Everything else handled.
// ============================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence }               from "framer-motion";
import { api }         from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import {
  Zap, Check, AlertCircle, ChevronRight,
  Eye, EyeOff, Loader2, ExternalLink,
  Package, Truck, RefreshCw, Star, DollarSign,
  Bell, Shield, Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const AUTOPILOT_TASKS = [
  { icon: Package,   label: "New orders auto-sent to supplier",  interval: "Every 15 min",  color: "#34d399", key: "fulfillment" },
  { icon: Truck,     label: "Tracking synced + customer notified",interval: "Every 2 hours", color: "#60a5fa", key: "tracking" },
  { icon: Bell,      label: "Store health monitoring",           interval: "Every 2 hours", color: "#a78bfa", key: "pulse" },
  { icon: DollarSign,label: "Supplier stock + price sync",       interval: "Every 6 hours", color: "#fbbf24", key: "stock" },
  { icon: Shield,    label: "Profit protection rules",           interval: "Every 6 hours", color: "#f97316", key: "rules" },
  { icon: Star,      label: "Review requests to customers",      interval: "Every hour",    color: "#ec4899", key: "reviews" },
  { icon: RefreshCw, label: "Market intelligence refresh",       interval: "Daily",         color: "#8b5cf6", key: "market" },
];

export default function AutopilotPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const qc      = useQueryClient();

  const [showCJForm, setShowCJForm]   = useState(false);
  const [cjEmail, setCJEmail]         = useState("");
  const [cjPass, setCJPass]           = useState("");
  const [showPass, setShowPass]       = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ["autopilot-status", storeId],
    queryFn:  async () => {
      const r = await api.get(`/fulfillment/status/${storeId}`);
      return r.data.data;
    },
    enabled:  !!storeId,
    refetchInterval: 30000,
  });

  const connectCJ = useMutation({
    mutationFn: async () => api.post("/fulfillment/connect/cj", { storeId, email: cjEmail, password: cjPass }),
    onSuccess: (r) => {
      if (r.data.success) {
        toast.success("CJDropshipping connected! Autopilot is now active.");
        qc.invalidateQueries(["autopilot-status", storeId]);
        setShowCJForm(false);
        setCJEmail("");
        setCJPass("");
      } else {
        toast.error(r.data.message);
      }
    },
    onError: () => toast.error("Connection failed — check credentials"),
  });

  const disconnectCJ = useMutation({
    mutationFn: async () => api.post("/fulfillment/disconnect", { storeId, provider: "cjdropshipping" }),
    onSuccess: () => {
      toast.success("CJ disconnected");
      qc.invalidateQueries(["autopilot-status", storeId]);
    },
  });

  const runNow = useMutation({
    mutationFn: async () => api.post("/fulfillment/fulfill-now", { storeId }),
    onSuccess: (r) => {
      const { fulfilled, failed, skipped } = r.data.data;
      if (fulfilled > 0) toast.success(`${fulfilled} orders fulfilled!`);
      else if (skipped > 0) toast("No new orders to fulfill", { icon: "ℹ️" });
      else toast("Nothing to fulfill right now", { icon: "✅" });
    },
  });

  const cjConnected = status?.cj?.connected;
  const isActive    = cjConnected;

  return (
    <>
    
      <div className="min-h-screen p-6" style={{ background: "#07070e" }}>
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-white">Store Autopilot</h1>
              {isActive && (
                <motion.div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}
                  animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
                  <span className="text-xs font-medium" style={{ color: "#34d399" }}>Running</span>
                </motion.div>
              )}
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Connect your supplier once — KAI handles everything automatically
            </p>
          </div>

          {/* What autopilot does */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>
              What runs automatically
            </p>
            <div className="space-y-3">
              {AUTOPILOT_TASKS.map((task, i) => (
                <motion.div key={task.key}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? `${task.color}15` : "rgba(255,255,255,0.05)" }}>
                    <task.icon size={14} style={{ color: isActive ? task.color : "rgba(255,255,255,0.25)" }} />
                  </div>
                  <p className="flex-1 text-sm" style={{ color: isActive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)" }}>
                    {task.label}
                  </p>
                  <span className="text-xs" style={{ color: isActive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)" }}>
                    {task.interval}
                  </span>
                  {isActive && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(52,211,153,0.15)" }}>
                      <Check size={9} style={{ color: "#34d399" }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* CJ Connection */}
          <div className="rounded-2xl overflow-hidden mb-4" style={{ border: `1px solid ${cjConnected ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.08)"}` }}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ background: cjConnected ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: cjConnected ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)", color: cjConnected ? "#34d399" : "rgba(255,255,255,0.4)" }}>
                  CJ
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">CJDropshipping</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Free · 400,000+ products · Ships worldwide · No monthly fee
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cjConnected
                  ? <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                      style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                      <Check size={10} />Connected
                    </span>
                  : <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                      Not connected
                    </span>
                }
              </div>
            </div>

            <div className="px-5 py-4">
              {cjConnected ? (
                <div>
                  <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                    ✅ Autopilot is active. New orders are automatically sent to CJDropshipping and customers receive tracking updates automatically.
                  </p>
                  <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Connected as: {status?.cj?.email}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => runNow.mutate()} disabled={runNow.isLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
                      style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                      {runNow.isLoading ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                      {runNow.isLoading ? "Running..." : "Fulfill Now"}
                    </button>
                    <button onClick={() => disconnectCJ.mutate()}
                      className="px-4 py-2 rounded-xl text-xs"
                      style={{ color: "rgba(255,255,255,0.3)" }}>
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {!showCJForm ? (
                    <div>
                      <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Connect your free CJDropshipping account to activate full autopilot. Orders will be fulfilled automatically — you just focus on getting customers.
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => setShowCJForm(true)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff" }}>
                          <Zap size={14} />Connect CJDropshipping
                        </button>
                        <a href="https://cjdropshipping.com/register.html" target="_blank"
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                          <ExternalLink size={12} />Create free account
                        </a>
                      </div>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="text-sm font-medium text-white mb-4">Enter your CJDropshipping credentials</p>
                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>CJ Email</label>
                          <input value={cjEmail} onChange={e => setCJEmail(e.target.value)}
                            placeholder="your@email.com"
                            type="email"
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }} />
                        </div>
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>CJ Password</label>
                          <div className="relative">
                            <input value={cjPass} onChange={e => setCJPass(e.target.value)}
                              placeholder="••••••••"
                              type={showPass ? "text" : "password"}
                              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-10"
                              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }} />
                            <button onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: "rgba(255,255,255,0.3)" }}>
                              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-4 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}>
                        <AlertCircle size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#60a5fa" }} />
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                          Your credentials are stored encrypted and only used to place orders on your behalf. DropOS never stores payment info.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button disabled={!cjEmail || !cjPass || connectCJ.isLoading}
                          onClick={() => connectCJ.mutate()}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: (cjEmail && cjPass) ? "#7c3aed" : "rgba(255,255,255,0.05)", color: (cjEmail && cjPass) ? "#fff" : "rgba(255,255,255,0.25)" }}>
                          {connectCJ.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          {connectCJ.isLoading ? "Connecting..." : "Connect & Activate"}
                        </button>
                        <button onClick={() => { setShowCJForm(false); setCJEmail(""); setCJPass(""); }}
                          className="px-4 py-2.5 rounded-xl text-sm"
                          style={{ color: "rgba(255,255,255,0.4)" }}>
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* What seller focuses on instead */}
          {cjConnected && (
            <motion.div className="rounded-2xl p-5"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-sm font-semibold text-white mb-3">
                🎯 Your only job now
              </p>
              <div className="space-y-2">
                {[
                  "Get customers — TikTok, Instagram, WhatsApp",
                  "Add winning products — KAI finds them daily",
                  "Set your prices and let profit rules protect them",
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <ChevronRight size={12} style={{ color: "#a78bfa" }} />
                    {task}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Everything else — fulfillment, tracking, stock sync, reviews — KAI handles it.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    
    </>
  );
}
