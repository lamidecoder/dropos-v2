"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import {
  TrendingUp, TrendingDown, Package, AlertTriangle, Gift, 
  Calendar, Users, ShoppingCart, Sparkles, ArrowRight, ChevronRight, Zap
} from "lucide-react";

interface OpportunityFeedProps {
  storeId: string;
  isDark: boolean;
  onAction?: (action: string, data: any) => void;
}

const ICONS: Record<string, any> = {
  high_demand:      TrendingUp,
  price_decrease:   TrendingDown,
  low_stock:        Package,
  bundle:           Gift,
  abandoned_value:  ShoppingCart,
  win_back:         Users,
  fraud_risk:       AlertTriangle,
  seasonal:         Calendar,
  viral_product:    Sparkles,
  price_increase:   TrendingUp,
};

const COLORS: Record<string, { bg: string; color: string; bdr: string }> = {
  high:   { bg: "rgba(124,58,237,0.08)",  color: "#A78BFA", bdr: "rgba(124,58,237,0.2)" },
  medium: { bg: "rgba(96,165,250,0.08)",  color: "#60A5FA", bdr: "rgba(96,165,250,0.2)" },
  low:    { bg: "rgba(156,163,175,0.08)", color: "#9CA3AF", bdr: "rgba(156,163,175,0.2)" },
};

export function OpportunityFeed({ storeId, isDark, onAction }: OpportunityFeedProps) {
  const t = {
    card:   isDark ? "rgba(255,255,255,0.02)" : "rgba(15,5,32,0.02)",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
  };

  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: opps = [], isLoading } = useQuery({
    queryKey: ["opportunities", storeId],
    queryFn:  () => api.get(`/kai/opportunities?storeId=${storeId}`).then(r => r.data.data || []),
    enabled:  !!storeId,
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading || opps.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Zap size={14} style={{ color: "#A78BFA" }}/>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>
            KIRO Spotted {opps.length} Opportunit{opps.length === 1 ? "y" : "ies"}
          </h3>
        </div>
        <span style={{ fontSize: 11, color: t.muted }}>Updated 5 min ago</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opps.slice(0, 4).map((opp: any, i: number) => {
          const Icon = ICONS[opp.type] || Sparkles;
          const colors = COLORS[opp.severity] || COLORS.medium;
          const isOpen = expanded === i;

          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                borderRadius: 14,
                border: `1px solid ${colors.bdr}`,
                background: colors.bg,
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={() => setExpanded(isOpen ? null : i)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: `${colors.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={15} style={{ color: colors.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>{opp.title}</p>
                  {!isOpen && (
                    <p style={{ fontSize: 11, color: t.muted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {opp.message}
                    </p>
                  )}
                </div>
                <ChevronRight size={14} style={{ color: t.muted, transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}/>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}>
                    <div style={{ padding: "0 14px 14px 58px" }}>
                      <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginBottom: 12 }}>
                        {opp.message}
                      </p>
                      {opp.action && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onAction?.(opp.action, opp.data); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 14px", borderRadius: 10,
                            background: `linear-gradient(135deg, ${colors.color}, ${colors.color}cc)`,
                            color: "#fff", border: "none", cursor: "pointer",
                            fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                          }}>
                          {opp.action}
                          <ArrowRight size={11}/>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
