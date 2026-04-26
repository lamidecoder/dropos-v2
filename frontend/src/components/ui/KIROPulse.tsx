"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Bell, TrendingUp, AlertTriangle, Package, ShoppingCart, ChevronRight } from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";
import Link from "next/link";

const ALERT_ICONS: Record<string, any> = {
  revenue:   TrendingUp,
  inventory: Package,
  order:     ShoppingCart,
  warning:   AlertTriangle,
  default:   Zap,
};

const ALERT_COLORS: Record<string, string> = {
  revenue:   "#10B981",
  inventory: "#F59E0B",
  order:     "#06B6D4",
  warning:   "#EF4444",
  default:   "#8B5CF6",
};

interface PulseAlert {
  id:      string;
  type:    string;
  title:   string;
  message: string;
  cta?:    { label: string; href: string };
  read:    boolean;
  createdAt: string;
}

export default function KIROPulse({ t }: { t: any }) {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const qc      = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const { data } = useQuery({
    queryKey:      ["kiro-pulse", storeId],
    queryFn:       () => api.get("/kai/pulse").then(r => r.data.data),
    enabled:       !!storeId,
    refetchInterval: 120000,
  });

  const readMut = useMutation({
    mutationFn: (id: string) => api.patch(`/kai/pulse/${id}/read`, {}),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["kiro-pulse"] }),
  });

  const alerts: PulseAlert[] = data || [];
  const unread = alerts.filter(a => !a.read).length;

  if (alerts.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
        style={{ background: "rgba(107,53,232,0.06)", border: "1px solid rgba(107,53,232,0.15)" }}>
        <div className="relative">
          <Zap size={16} color="#8B5CF6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        <span className="flex-1 text-xs font-semibold text-left" style={{ color: "#A78BFA" }}>
          KIRO Pulse {unread > 0 ? `— ${unread} new alert${unread > 1 ? "s" : ""}` : ""}
        </span>
        <ChevronRight size={12} style={{ color: "#8B5CF6", transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}>
            <div className="mt-2 space-y-2">
              {alerts.slice(0, 5).map(alert => {
                const Icon  = ALERT_ICONS[alert.type] || ALERT_ICONS.default;
                const color = ALERT_COLORS[alert.type] || ALERT_COLORS.default;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl"
                    style={{ background: alert.read ? t.faint : `${color}08`, border: `1px solid ${alert.read ? t.border : color + "25"}`, opacity: alert.read ? 0.6 : 1 }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold mb-0.5" style={{ color: t.text }}>{alert.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: t.muted }}>{alert.message}</p>
                      {alert.cta && (
                        <Link href={alert.cta.href}>
                          <span className="text-[10px] font-bold mt-1 inline-block" style={{ color }}>
                            {alert.cta.label} →
                          </span>
                        </Link>
                      )}
                    </div>
                    {!alert.read && (
                      <button
                        onClick={() => readMut.mutate(alert.id)}
                        style={{ color: t.muted, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                        <X size={11} />
                      </button>
                    )}
                  </motion.div>
                );
              })}
              {alerts.length > 5 && (
                <Link href="/dashboard/notifications">
                  <p className="text-xs text-center py-2 font-semibold" style={{ color: "#8B5CF6" }}>
                    See all {alerts.length} alerts →
                  </p>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
