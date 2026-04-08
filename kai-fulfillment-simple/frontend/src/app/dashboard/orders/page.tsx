"use client";
// ============================================================
// Orders + Fulfillment — The Simple Way
// Path: frontend/src/app/dashboard/orders/page.tsx
//
// What sellers actually need:
// 1. See unfulfilled orders clearly
// 2. One click to open supplier with product ready
// 3. Paste tracking number → KAI notifies customer
// 4. Done
// ============================================================
import { useState }                              from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence }               from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api }         from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import {
  Package, ExternalLink, CheckCircle,
  Clock, Search, Filter, ChevronDown,
  Truck, Copy, Check, MessageSquare, Loader2,
  AlertCircle, TrendingUp, ShoppingCart, Users,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "Pending" },
  PAID:       { bg: "rgba(96,165,250,0.12)",   color: "#60a5fa", label: "Paid — Needs Fulfillment" },
  PROCESSING: { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", label: "Processing" },
  SHIPPED:    { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "Shipped" },
  DELIVERED:  { bg: "rgba(52,211,153,0.2)",   color: "#34d399", label: "Delivered" },
  CANCELLED:  { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Cancelled" },
  REFUNDED:   { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Refunded" },
};

// Generate a smart supplier link with customer address pre-filled where possible
function getSupplierLink(product: any, order: any): string {
  const sourceUrl = product?.sourceUrl || "";

  // For AliExpress — deep link to product
  if (sourceUrl.includes("aliexpress")) return sourceUrl;

  // For CJDropshipping — deep link
  if (sourceUrl.includes("cjdropshipping")) return sourceUrl;

  // For any other URL — just open it
  if (sourceUrl.startsWith("http")) return sourceUrl;

  // Fallback — search AliExpress for the product
  const query = encodeURIComponent(product?.name || "");
  return `https://www.aliexpress.com/w/wholesale-${query}.html`;
}

export default function OrdersPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const qc      = useQueryClient();

  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [copied, setCopied]     = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", storeId, filter],
    queryFn:  async () => {
      const params = new URLSearchParams({ storeId });
      if (filter !== "all") params.append("status", filter);
      const r = await api.get(`/orders?${params}`);
      return r.data.data;
    },
    enabled:  !!storeId,
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ orderId, status, trackingNumber }: any) =>
      api.patch(`/orders/${orderId}`, { status, trackingNumber }),
    onSuccess: (_, { orderId, status, trackingNumber }) => {
      qc.invalidateQueries(["orders", storeId]);
      if (status === "SHIPPED") {
        toast.success("Order marked shipped — customer notified!");
        // KAI will pick this up and send WhatsApp/email to customer
      }
    },
  });

  const orders  = (data?.orders || data || []) as any[];
  const filtered = orders.filter((o: any) =>
    filter === "all" || o.status === filter
  ).filter((o: any) =>
    !search || o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    needsFulfillment: orders.filter(o => o.status === "PAID").length,
    shipped:          orders.filter(o => o.status === "SHIPPED").length,
    delivered:        orders.filter(o => o.status === "DELIVERED").length,
    totalToday:       orders.filter(o => {
      const d = new Date(o.createdAt);
      const t = new Date();
      return d.toDateString() === t.toDateString();
    }).length,
  };

  const locale  = user?.stores?.[0] as any;
  const sym     = "₦"; // TODO: get from store

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id.slice(-8).toUpperCase());
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen" style={{ background: "#07070e" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-white mb-0.5">Orders</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Manage and fulfill orders — or tell KAI "show my orders"
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Need fulfillment", value: stats.needsFulfillment, color: "#60a5fa", urgent: stats.needsFulfillment > 0 },
              { label: "Shipped",          value: stats.shipped,          color: "#a78bfa", urgent: false },
              { label: "Delivered",        value: stats.delivered,        color: "#34d399", urgent: false },
              { label: "Today",            value: stats.totalToday,       color: "#fbbf24", urgent: false },
            ].map(s => (
              <motion.div key={s.label}
                className="rounded-xl px-4 py-3"
                style={{ background: s.urgent && s.value > 0 ? `${s.color}12` : "rgba(255,255,255,0.03)", border: s.urgent && s.value > 0 ? `1px solid ${s.color}30` : "1px solid rgba(255,255,255,0.06)" }}
                animate={s.urgent && s.value > 0 ? { boxShadow: [`0 0 0px ${s.color}00`, `0 0 12px ${s.color}30`, `0 0 0px ${s.color}00`] } : {}}
                transition={{ duration: 2, repeat: Infinity }}>
                <p className="text-2xl font-black" style={{ color: s.value > 0 ? s.color : "rgba(255,255,255,0.3)" }}>{s.value}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filter + Search */}
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search orders or customers..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "rgba(255,255,255,0.7)" }} />
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              {["all","PAID","SHIPPED","DELIVERED"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs capitalize transition-all"
                  style={{
                    background: filter === f ? "rgba(124,58,237,0.3)" : "transparent",
                    color:      filter === f ? "#a78bfa" : "rgba(255,255,255,0.4)",
                  }}>
                  {f === "all" ? "All" : f === "PAID" ? "Need Fulfillment" : f.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="px-6 pb-8 space-y-2">
          {isLoading ? (
            [1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart size={36} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.08)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                {filter === "PAID" ? "No orders waiting for fulfillment 🎉" : "No orders yet"}
              </p>
            </div>
          ) : (
            filtered.map((order: any) => {
              const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
              const isExpanded  = expanded === order.id;
              const needsFulfillment = order.status === "PAID";
              const trackVal   = tracking[order.id] || "";

              return (
                <motion.div key={order.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: needsFulfillment ? "rgba(96,165,250,0.05)" : "rgba(255,255,255,0.03)",
                    border:     needsFulfillment ? "1px solid rgba(96,165,250,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  }}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>

                  {/* Order row */}
                  <div className="flex items-center gap-4 px-4 py-3 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}>

                    {/* Urgent indicator */}
                    {needsFulfillment && (
                      <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: "#60a5fa" }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }} />
                    )}

                    {/* Order ID */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-mono font-bold text-white">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <button onClick={e => { e.stopPropagation(); copyOrderId(order.id); }}
                          className="opacity-0 group-hover:opacity-100">
                          {copied === order.id ? <Check size={10} style={{ color: "#34d399" }} /> : <Copy size={10} style={{ color: "rgba(255,255,255,0.3)" }} />}
                        </button>
                      </div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{order.customer?.name || "Customer"}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""} · {order.customer?.city || ""}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">{sym}{Number(order.total || 0).toLocaleString()}</p>
                    </div>

                    {/* Status */}
                    <span className="px-2.5 py-1 rounded-full text-xs flex-shrink-0"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {statusStyle.label}
                    </span>

                    {/* Expand */}
                    <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        style={{ overflow: "hidden" }}>
                        <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>

                          {/* Items with supplier links */}
                          <div className="mt-3 mb-4 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Items</p>
                            {(order.items || []).map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.04)" }}>
                                {item.product?.images?.[0] && (
                                  <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white truncate">{item.product?.name}</p>
                                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    Qty: {item.quantity} · {sym}{Number(item.unitPrice || 0).toLocaleString()} each
                                  </p>
                                </div>
                                {/* THE KEY BUTTON — opens supplier with one click */}
                                <a
                                  href={getSupplierLink(item.product, order)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 transition-all"
                                  style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.25)", color: "#60a5fa" }}>
                                  <ExternalLink size={11} />
                                  Order from supplier
                                </a>
                              </div>
                            ))}
                          </div>

                          {/* Delivery address */}
                          <div className="mb-4 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>Deliver to</p>
                            <p className="text-sm text-white">{order.customer?.name}</p>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                              {[order.customer?.address, order.customer?.city, order.customer?.state].filter(Boolean).join(", ")}
                            </p>
                            {order.customer?.phone && (
                              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{order.customer.phone}</p>
                            )}
                          </div>

                          {/* Actions based on status */}
                          {order.status === "PAID" && (
                            <div className="space-y-2">
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                After ordering from supplier, paste the tracking number below:
                              </p>
                              <div className="flex gap-2">
                                <input value={trackVal}
                                  onChange={e => setTracking(t => ({ ...t, [order.id]: e.target.value }))}
                                  placeholder="Tracking number e.g. CJ123456789"
                                  className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }} />
                                <button
                                  onClick={() => updateMutation.mutate({
                                    orderId: order.id,
                                    status:  "SHIPPED",
                                    trackingNumber: trackVal || null,
                                  })}
                                  disabled={updateMutation.isLoading}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
                                  style={{ background: "#34d399", color: "#000" }}>
                                  {updateMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                                  Mark Shipped
                                </button>
                              </div>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                                KAI will automatically notify {order.customer?.name?.split(" ")[0]} via WhatsApp and email
                              </p>
                            </div>
                          )}

                          {order.status === "SHIPPED" && (
                            <div className="flex items-center justify-between">
                              {order.trackingNumber && (
                                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                  Tracking: <span className="font-mono text-white">{order.trackingNumber}</span>
                                </p>
                              )}
                              <button onClick={() => updateMutation.mutate({ orderId: order.id, status: "DELIVERED" })}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
                                style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                                <CheckCircle size={12} />Mark Delivered
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
