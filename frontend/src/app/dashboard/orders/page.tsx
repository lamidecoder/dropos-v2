"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import {
  ShoppingCart, Search, Filter, Download, Zap,
  Package, Truck, Check, X, Clock, RefreshCw,
  ChevronDown, Eye, ArrowUpRight, MoreHorizontal,
  User, MapPin, Phone, Mail, Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

const V = { v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA", cyan: "#06B6D4" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)", row: "rgba(255,255,255,0.02)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)", row: "rgba(15,5,32,0.015)" },
};

const STATUS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:   { label: "Pending",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  PAID:      { label: "Paid",      color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: Check },
  SHIPPED:   { label: "Shipped",   color: "#06B6D4", bg: "rgba(6,182,212,0.12)",   icon: Truck },
  DELIVERED: { label: "Delivered", color: V.v400,    bg: "rgba(107,53,232,0.12)",  icon: Package },
  CANCELLED: { label: "Cancelled", color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: X },
  REFUNDED:  { label: "Refunded",  color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: RefreshCw },
};

const TABS = ["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled"];

function fmt(n: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS[status] || STATUS.PENDING;
  const Icon = cfg.icon;
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={10} />
      {cfg.label}
    </div>
  );
}

// ── Order Detail Drawer ───────────────────────────────────────────────────────
function OrderDrawer({ order, onClose, t, isDark }: { order: any; onClose: () => void; t: any; isDark: boolean }) {
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber || "");

  const updateMut = useMutation({
    mutationFn: () => api.put(`/orders/${order.storeId}/${order.id}`, { status: newStatus, trackingNumber: tracking }),
    onSuccess: () => { toast.success("Order updated"); qc.invalidateQueries({ queryKey: ["orders"] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Update failed"),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28 }}
        className="h-full w-full max-w-md overflow-y-auto"
        style={{ background: isDark ? "#181230" : "#fff", borderLeft: `1px solid ${t.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${t.border}` }}>
          <div>
            <h2 className="font-bold text-sm" style={{ color: t.text }}>Order #{order.id?.slice(-8)?.toUpperCase()}</h2>
            <p className="text-xs mt-0.5" style={{ color: t.muted }}>{new Date(order.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <button onClick={onClose} style={{ color: t.muted }}><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status */}
          <div className="rounded-2xl p-4" style={{ background: t.faint, border: `1px solid ${t.border}` }}>
            <p className="text-xs font-semibold mb-3" style={{ color: t.muted }}>Order Status</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button key={key} onClick={() => setNewStatus(key)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all"
                    style={{ background: newStatus === key ? cfg.bg : "transparent", border: `1px solid ${newStatus === key ? cfg.color : t.border}` }}>
                    <Icon size={13} style={{ color: newStatus === key ? cfg.color : t.muted }} />
                    <span className="text-[10px] font-semibold" style={{ color: newStatus === key ? cfg.color : t.muted }}>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tracking */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: t.muted }}>Tracking Number</label>
            <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="e.g. GIG-12345678"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: t.faint, border: `1px solid ${t.border}`, color: t.text, fontFamily: "inherit" }} />
          </div>

          {/* Customer */}
          <div className="rounded-2xl p-4" style={{ background: t.faint, border: `1px solid ${t.border}` }}>
            <p className="text-xs font-semibold mb-3" style={{ color: t.muted }}>Customer</p>
            <div className="space-y-2">
              {[
                { icon: User,    val: order.customerName || order.customer?.name },
                { icon: Mail,    val: order.customerEmail || order.customer?.email },
                { icon: Phone,   val: order.customerPhone || order.customer?.phone },
                { icon: MapPin,  val: order.shippingAddress?.address || order.deliveryAddress },
              ].filter(i => i.val).map(({ icon: Icon, val }) => (
                <div key={val} className="flex items-center gap-2">
                  <Icon size={12} style={{ color: t.muted, flexShrink: 0 }} />
                  <span className="text-xs truncate" style={{ color: t.text }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="rounded-2xl p-4" style={{ background: t.faint, border: `1px solid ${t.border}` }}>
            <p className="text-xs font-semibold mb-3" style={{ color: t.muted }}>Items</p>
            <div className="space-y-2">
              {(order.items || order.orderItems || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
                    {item.product?.images?.[0]
                      ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      : <Package size={12} style={{ color: t.muted, margin: "auto" }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: t.text }}>{item.product?.name || item.name || "Product"}</p>
                    <p className="text-xs" style={{ color: t.muted }}>Qty: {item.quantity} · {fmt(item.price)}</p>
                  </div>
                  <p className="text-xs font-bold" style={{ color: t.text }}>{fmt((item.price || 0) * (item.quantity || 1))}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
              <span className="text-xs font-semibold" style={{ color: t.muted }}>Total</span>
              <span className="text-sm font-black" style={{ color: "#10B981" }}>{fmt(order.total || order.totalAmount)}</span>
            </div>
          </div>

          {/* Save */}
          <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)` }}>
            {updateMut.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? T.dark : T.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", storeId, activeTab],
    queryFn: () => api.get(`/orders/${storeId}${activeTab !== "All" ? `?status=${activeTab.toUpperCase()}` : ""}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const orders: any[] = data?.orders || data || [];
  const filtered = orders.filter(o =>
    !search ||
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    (o.customerName || o.customer?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.customerEmail || o.customer?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Orders",  value: orders.length,                                                    color: V.v400 },
    { label: "Pending",       value: orders.filter((o: any) => o.status === "PENDING").length,          color: "#F59E0B" },
    { label: "Shipped",       value: orders.filter((o: any) => o.status === "SHIPPED").length,          color: V.cyan },
    { label: "Revenue",       value: fmt(orders.reduce((a: number, o: any) => a + (o.total || o.totalAmount || 0), 0)), color: "#10B981" },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Orders</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ border: `1px solid ${t.border}`, color: t.muted, background: t.card }}>
            <Download size={12} /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(107,53,232,0.1)", color: V.v300, border: "1px solid rgba(107,53,232,0.2)" }}>
            <Zap size={12} /> KIRO Auto-fulfil
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
            <p className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold" style={{ color: t.text }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: t.card, border: `1px solid ${t.border}` }}>

        {/* Tabs + toolbar */}
        <div style={{ borderBottom: `1px solid ${t.border}` }}>
          <div className="flex items-center px-4 gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="py-3.5 px-3 text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={{ borderBottom: `2px solid ${activeTab === tab ? V.v500 : "transparent"}`, color: activeTab === tab ? t.text : t.muted }}>
                {tab}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-2 py-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: t.faint, border: `1px solid ${t.border}` }}>
                <Search size={12} style={{ color: t.muted }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
                  className="bg-transparent border-none outline-none text-xs w-36"
                  style={{ color: t.text, fontFamily: "inherit" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden md:grid px-4 py-2.5" style={{ gridTemplateColumns: "1fr 160px 90px 110px 110px 60px", borderBottom: `1px solid ${t.border}` }}>
          {["Customer", "Date", "Items", "Status", "Total", ""].map((h, i) => (
            <div key={i} className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.muted, fontFamily: "'Syncopate', sans-serif" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: t.border }}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 px-4 flex items-center gap-3 animate-pulse">
                <div className="h-3 rounded-full w-1/4" style={{ background: t.faint }} />
                <div className="h-3 rounded-full w-1/6" style={{ background: t.faint }} />
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="hidden md:grid items-center px-4 py-3 cursor-pointer transition-all hover:opacity-80"
                style={{ gridTemplateColumns: "1fr 160px 90px 110px 110px 60px" }}
                onClick={() => setSelectedOrder(order)}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: t.text }}>{order.customerName || order.customer?.name || "Customer"}</p>
                  <p className="text-xs mt-0.5" style={{ color: t.muted }}>#{order.id?.slice(-8)?.toUpperCase()}</p>
                </div>
                <p className="text-xs" style={{ color: t.muted }}>
                  {new Date(order.createdAt).toLocaleDateString("en", { day: "numeric", month: "short" })}
                </p>
                <p className="text-xs font-semibold" style={{ color: t.text }}>
                  {(order.items || order.orderItems || []).length} item{(order.items || order.orderItems || []).length !== 1 ? "s" : ""}
                </p>
                <StatusBadge status={order.status} />
                <p className="text-sm font-bold" style={{ color: "#10B981" }}>{fmt(order.total || order.totalAmount)}</p>
                <button className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:opacity-70"
                  style={{ background: t.faint, border: `1px solid ${t.border}` }}>
                  <Eye size={11} style={{ color: t.muted }} />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                <ShoppingCart size={24} color={V.cyan} />
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ color: t.text }}>
                {search ? "No orders found" : "No orders yet"}
              </h3>
              <p className="text-xs mb-5" style={{ color: t.muted, maxWidth: 300, lineHeight: 1.6 }}>
                {search ? "Try a different search" : "Once customers start buying, all orders appear here. KIRO can help you get your first sale."}
              </p>
              {!search && (
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)` }}>
                  <Zap size={12} /> Ask KIRO to get first sales
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Order detail drawer */}
      <AnimatePresence>
        {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} t={t} isDark={isDark} />}
      </AnimatePresence>
    </div>
  );
}
