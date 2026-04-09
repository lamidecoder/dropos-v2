"use client";
// ============================================================
// KAI — Pulse Panel (Proactive Alerts)
// Path: frontend/src/components/kai/KAIPulse.tsx
// ============================================================
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Zap, TrendingDown, AlertTriangle, TrendingUp, CheckCircle, X } from "lucide-react";
import { useKaiStore } from "@/store/kai.store";
import { useKai } from "@/hooks/useKai";

const SEVERITY_CONFIG = {
  info:        { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.2)",  icon: Bell },
  warning:     { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)",  icon: AlertTriangle },
  critical:    { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)", icon: TrendingDown },
  opportunity: { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.2)",  icon: TrendingUp },
};

export function KAIPulse() {
  const { pulseAlerts, setActiveTab } = useKaiStore();
  const { markAlertRead, sendMessage } = useKai();

  const unread = pulseAlerts.filter(a => !a.read);
  const read   = pulseAlerts.filter(a => a.read).slice(0, 5);

  const handleAction = async (alert: any) => {
    await markAlertRead.mutateAsync(alert.id);
    if (alert.suggestedPrompt) {
      setActiveTab("chat");
      sendMessage(alert.suggestedPrompt);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#34d399" }} />
          <h2 className="text-sm font-semibold text-white">KAI Pulse</h2>
          <span className="text-xs px-1.5 py-0.5 rounded-full ml-auto" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
            24/7 monitoring
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          KAI monitors your store and alerts you before problems happen
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {unread.length === 0 && read.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle size={32} className="mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>All clear</p>
            <p className="text-xs mt-1 text-center max-w-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              KIRO is watching your store. You'll be notified when something needs attention.
            </p>
          </div>
        )}

        {unread.length > 0 && (
          <>
            <p className="text-xs font-medium px-1 mb-2" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              New alerts
            </p>
            {unread.map(alert => (
              <AlertCard key={alert.id} alert={alert} onAction={handleAction} onDismiss={() => markAlertRead.mutate(alert.id)} />
            ))}
          </>
        )}

        {read.length > 0 && (
          <>
            <p className="text-xs font-medium px-1 mt-4 mb-2" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Recent
            </p>
            {read.map(alert => (
              <AlertCard key={alert.id} alert={alert} dimmed />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, onAction, onDismiss, dimmed }: any) {
  const config = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
  const Icon   = config.icon;

  return (
    <motion.div
      className="rounded-xl p-3 relative"
      style={{
        background: dimmed ? "rgba(255,255,255,0.02)" : config.bg,
        border: `1px solid ${dimmed ? "rgba(255,255,255,0.05)" : config.border}`,
        opacity: dimmed ? 0.6 : 1,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: dimmed ? 0.6 : 1, y: 0 }}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: dimmed ? "rgba(255,255,255,0.05)" : config.bg }}>
          <Icon size={14} style={{ color: dimmed ? "rgba(255,255,255,0.3)" : config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight" style={{ color: dimmed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)", fontSize: "13px" }}>
            {alert.title}
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: dimmed ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.5)", fontSize: "12px" }}>
            {alert.message}
          </p>
          {!dimmed && alert.actionable && alert.suggestedPrompt && (
            <button
              onClick={() => onAction(alert)}
              className="mt-2 text-xs px-2.5 py-1.5 rounded-lg transition-all"
              style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
            >
              Ask KIRO about this →
            </button>
          )}
        </div>
        {!dimmed && onDismiss && (
          <button onClick={onDismiss} className="w-5 h-5 flex items-center justify-center rounded opacity-40 hover:opacity-70 transition-opacity flex-shrink-0">
            <X size={11} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
