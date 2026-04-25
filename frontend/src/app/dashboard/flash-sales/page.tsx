"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Flame, Plus, Clock, Percent, Package, X, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500: "#6B35E8", v400: "#8B5CF6", red: "#EF4444", amber: "#F59E0B", green: "#10B981" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)" },
};

function FlashSaleModal({ storeId, onClose, t, isDark }: any) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", discount: "", startsAt: "", endsAt: "", products: "all" });
  const inp = { padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", color: t.text, fontSize: 13, outline: "none", width: "100%", fontFamily: "inherit" } as any;
  const mut = useMutation({
    mutationFn: () => api.post(`/flash-sales/${storeId}`, { name: form.name, discountPercent: parseFloat(form.discount), startsAt: form.startsAt, endsAt: form.endsAt }),
    onSuccess: () => { toast.success("Flash sale created!"); qc.invalidateQueries({ queryKey: ["flash-sales"] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: isDark ? "#181230" : "#fff", border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: t.text }}>New Flash Sale</h2>
          <button onClick={onClose} style={{ color: t.muted }}><X size={17} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label style={{ fontSize: 11, fontWeight: 600, color: t.muted, display: "block", marginBottom: 5 }}>Sale Name *</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Weekend Flash Sale" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: t.muted, display: "block", marginBottom: 5 }}>Discount % *</label><input style={inp} type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="e.g. 30" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontSize: 11, fontWeight: 600, color: t.muted, display: "block", marginBottom: 5 }}>Starts</label><input style={inp} type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: t.muted, display: "block", marginBottom: 5 }}>Ends</label><input style={inp} type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} /></div>
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: `1px solid ${t.border}` }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${t.border}`, color: t.muted, background: "transparent", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => mut.mutate()} disabled={!form.name || !form.discount || mut.isPending}
            style={{ flex: 2, padding: "10px", borderRadius: 11, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)`, color: "#fff", fontSize: 13, fontWeight: 700, opacity: (!form.name || !form.discount) ? 0.5 : 1 }}>
            {mut.isPending ? "Creating..." : "Launch Flash Sale 🔥"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function FlashSalesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? T.dark : T.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["flash-sales", storeId],
    queryFn: () => api.get(`/flash-sales/${storeId}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const sales: any[] = data || [];
  const active = sales.filter(s => s.active || new Date(s.endsAt) > new Date());

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Flash Sales</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Time-limited discounts that drive urgency and fast sales</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)` }}>
          <Plus size={14} /> New Flash Sale
        </button>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Active Sales", value: active.length, color: "#10B981", icon: Flame },
          { label: "Total Sales", value: sales.length, color: V.v400, icon: Package },
          { label: "Avg Discount", value: sales.length ? `${Math.round(sales.reduce((a, s) => a + (s.discountPercent || 0), 0) / sales.length)}%` : "0%", color: V.amber, icon: Percent },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}15` }}>
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black mb-0.5" style={{ color: t.text }}>{s.value}</p>
            <p className="text-xs" style={{ color: t.muted }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {sales.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Flame size={24} color={V.red} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 8 }}>No flash sales yet</h3>
          <p style={{ fontSize: 13, color: t.muted, maxWidth: 320, lineHeight: 1.6, marginBottom: 20 }}>Create time-limited discounts to create urgency and drive burst sales. Works great for weekends and holidays.</p>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)` }}>
            <Flame size={13} /> Launch First Flash Sale
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale, i) => {
            const isActive = sale.active || (new Date(sale.endsAt) > new Date() && new Date(sale.startsAt) <= new Date());
            const timeLeft = sale.endsAt ? Math.max(0, new Date(sale.endsAt).getTime() - Date.now()) : 0;
            const hoursLeft = Math.floor(timeLeft / 3600000);
            return (
              <motion.div key={sale.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${isActive ? "rgba(239,68,68,0.2)" : t.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isActive ? "rgba(239,68,68,0.1)" : t.faint }}>
                  <Flame size={18} color={isActive ? V.red : t.muted} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm" style={{ color: t.text }}>{sale.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: isActive ? "rgba(239,68,68,0.1)" : t.faint, color: isActive ? V.red : t.muted }}>{isActive ? "🔥 Live" : "Ended"}</span>
                  </div>
                  <p className="text-xs" style={{ color: t.muted }}>
                    {sale.discountPercent}% off · {isActive && hoursLeft > 0 ? `${hoursLeft}h left` : new Date(sale.endsAt).toLocaleDateString("en", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg" style={{ color: V.red }}>{sale.discountPercent}%</p>
                  <p className="text-xs" style={{ color: t.muted }}>discount</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <FlashSaleModal storeId={storeId} onClose={() => setShowModal(false)} t={t} isDark={isDark} />}
      </AnimatePresence>
    </div>
  );
}
