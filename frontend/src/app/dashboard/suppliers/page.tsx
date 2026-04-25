"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Truck, Plus, Globe, Package, Check, X, ExternalLink, Zap, Star } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500: "#6B35E8", v400: "#8B5CF6", green: "#10B981", cyan: "#06B6D4" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)" },
};

const FEATURED = [
  { name: "AliExpress", logo: "🛒", desc: "200M+ products, worldwide shipping, 7-day delivery to Nigeria", shipping: "7-30 days", category: "General", color: "#FF4747" },
  { name: "CJDropshipping", logo: "📦", desc: "Fast fulfilment, Nigerian warehouse option, white-label packaging", shipping: "5-15 days", category: "General", color: "#06B6D4" },
  { name: "Printful", logo: "👕", desc: "Print-on-demand for fashion, merch, and custom products", shipping: "3-10 days", category: "Fashion", color: "#7C3AED" },
  { name: "Zendrop", logo: "⚡", desc: "Auto-fulfilment, US/EU suppliers, fast African shipping", shipping: "5-20 days", category: "General", color: "#F59E0B" },
];

export default function SuppliersPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? T.dark : T.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [connecting, setConnecting] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["suppliers", storeId],
    queryFn: () => api.get(`/suppliers/${storeId}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const connectMut = useMutation({
    mutationFn: (name: string) => api.post(`/suppliers/${storeId}/connect`, { name }),
    onSuccess: () => { toast.success("Supplier connected!"); setConnecting(null); },
    onError: () => toast.error("Backend offline - connect backend to link suppliers"),
  });

  const connected: any[] = data?.connected || [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Suppliers</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Connect dropshipping suppliers to auto-fulfil orders</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(107,53,232,0.1)", color: V.v400, border: "1px solid rgba(107,53,232,0.2)" }}>
          <Zap size={12} /> KIRO places orders automatically
        </div>
      </motion.div>

      {connected.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-sm mb-3" style={{ color: t.text }}>Connected</h2>
          <div className="space-y-2">
            {connected.map((s: any) => (
              <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: t.card, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="text-2xl">{FEATURED.find(f => f.name === s.name)?.logo || "📦"}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: t.text }}>{s.name}</p>
                  <p className="text-xs" style={{ color: V.green }}>Connected · Auto-fulfil active</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: V.green }}>✓ Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-bold text-sm mb-3" style={{ color: t.text }}>Available Suppliers</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {FEATURED.map((sup, i) => {
          const isConnected = connected.some((c: any) => c.name === sup.name);
          return (
            <motion.div key={sup.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl" style={{ background: t.card, border: `1px solid ${isConnected ? "rgba(16,185,129,0.2)" : t.border}` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{sup.logo}</div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: t.text }}>{sup.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: t.faint, color: t.muted }}>{sup.category}</span>
                  </div>
                </div>
                {isConnected && <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: V.green }}>Connected</span>}
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: t.muted }}>{sup.desc}</p>
              <div className="flex items-center gap-1 mb-4">
                <Truck size={11} style={{ color: t.muted }} />
                <span className="text-xs" style={{ color: t.muted }}>{sup.shipping}</span>
              </div>
              {!isConnected && (
                <button onClick={() => { setConnecting(sup.name); connectMut.mutate(sup.name); }}
                  disabled={connectMut.isPending && connecting === sup.name}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)`, color: "#fff" }}>
                  {connectMut.isPending && connecting === sup.name ? "Connecting..." : "Connect Supplier"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
