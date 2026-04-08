"use client";
// ============================================================
// Orders — Perfect UX, Every Supplier Type
// Path: frontend/src/app/dashboard/orders/page.tsx
// ============================================================
import { useState }                              from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence }               from "framer-motion";
import DashboardLayout                           from "@/components/layout/DashboardLayout";
import { api }                                   from "@/lib/api";
import { useAuthStore }                          from "@/store/auth.store";
import {
  detectSupplier, buildSupplierAction,
  getSupplierDisplayName, getSearchLinks, SUPPLIERS,
} from "@/lib/supplier";
import {
  Search, ChevronDown, Copy, Check, Truck,
  ExternalLink, MessageCircle, Phone, MapPin,
  User, X, Plus, Loader2, RefreshCw,
  CheckCircle2, AlertTriangle, Package,
  Instagram, Clock, Filter,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Status styles ─────────────────────────────────────────────
const S: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Pending",    color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  PAID:       { label: "New",        color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  PROCESSING: { label: "Processing", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  SHIPPED:    { label: "Shipped",    color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  DELIVERED:  { label: "Delivered",  color: "#34d399", bg: "rgba(52,211,153,0.18)" },
  CANCELLED:  { label: "Cancelled",  color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

// ── Supplier Action Button ────────────────────────────────────
function SupplierActionBtn({
  item, order, onDone,
}: { item: any; order: any; onDone: () => void }) {
  const [done, setDone]         = useState(false);
  const [showAdd, setShowAdd]   = useState(false);
  const [newUrl, setNewUrl]     = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving]     = useState(false);
  const qc                      = useQueryClient();
  const store = useAuthStore(s => s.user?.stores?.[0] as any);

  const config = detectSupplier(item.product?.sourceUrl, item.product?.metadata);
  const action = buildSupplierAction({
    config,
    sourceUrl:       item.product?.sourceUrl,
    metadata:        item.product?.metadata,
    productName:     item.product?.name || "",
    quantity:        item.quantity,
    orderId:         order.id,
    customerName:    order.customer?.name || "",
    customerAddress: order.customer?.address || "",
    customerCity:    order.customer?.city || "",
    customerPhone:   order.customer?.phone || "",
  });

  const saveSupplier = async () => {
    if (!newUrl && !newPhone) return;
    setSaving(true);
    try {
      await api.patch(`/products/${item.product.id}`, {
        sourceUrl: newUrl || item.product?.sourceUrl,
        metadata: {
          ...(item.product?.metadata || {}),
          supplierPhone: newPhone || undefined,
        },
      });
      toast.success("Supplier saved!");
      qc.invalidateQueries(["orders"]);
      setShowAdd(false);
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleClick = () => {
    if (config.type === "none") { setShowAdd(true); return; }
    if (action.url) window.open(action.url, "_blank");
    setTimeout(() => { setDone(true); onDone(); }, 800);
  };

  // Show add supplier form
  if (showAdd) return (
    <motion.div className="mt-2 p-3 rounded-xl space-y-2"
      style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
      <p className="text-xs font-semibold text-white">Add supplier for this product</p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        Paste a URL, WhatsApp link, Instagram, or enter a phone number
      </p>
      <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
        placeholder="URL or wa.me/2348... or @instagramhandle"
        className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
      <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
        placeholder="Or supplier phone: +2348012345678"
        className="w-full rounded-xl px-3 py-2.5 text-xs outline-none"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />

      {/* Search links */}
      <div>
        <p className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Or find on:</p>
        <div className="flex flex-wrap gap-1.5">
          {getSearchLinks(item.product?.name || "", store?.country).map((link) => (
            <a key={link.type} href={link.url} target="_blank"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
              style={{ background: link.bgColor, border: `1px solid ${link.color}25`, color: link.color }}>
              {link.emoji} {link.name}
            </a>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={saveSupplier} disabled={(!newUrl && !newPhone) || saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ background: "#7c3aed", color: "#fff" }}>
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
          Save Supplier
        </button>
        <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}>Cancel</button>
      </div>
    </motion.div>
  );

  // No supplier linked
  if (config.type === "none") return (
    <button onClick={() => setShowAdd(true)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs w-full mt-1 transition-all"
      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
      <AlertTriangle size={11} />
      <span className="flex-1 text-left">No supplier linked — tap to add</span>
      <Plus size={11} />
    </button>
  );

  // Show instruction for local/manual
  if (action.instruction) return (
    <div className="mt-1">
      <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
        style={{ background: config.bgColor, border: `1px solid ${config.color}25` }}>
        <span className="text-base flex-shrink-0">{config.emoji}</span>
        <p className="text-xs leading-relaxed flex-1" style={{ color: config.color }}>{action.instruction}</p>
      </div>
      <button onClick={() => { setDone(true); onDone(); }}
        className="mt-1.5 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
        style={{ background: done ? "rgba(52,211,153,0.12)" : config.bgColor, color: done ? "#34d399" : config.color }}>
        {done ? <><Check size={11} />Ordered</> : <><Check size={11} />Mark as Ordered</>}
      </button>
    </div>
  );

  // URL / WhatsApp / Instagram action
  return (
    <motion.button onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold w-full mt-1 transition-all"
      style={{
        background:  done ? "rgba(52,211,153,0.12)" : config.bgColor,
        border:      `1px solid ${done ? "rgba(52,211,153,0.25)" : config.color + "30"}`,
        color:       done ? "#34d399" : config.color,
      }}
      whileHover={!done ? { scale: 1.01 } : {}}
      whileTap={!done ? { scale: 0.98 } : {}}>
      {done ? (
        <><Check size={12} />Opened — mark as ordered if done</>
      ) : (
        <>
          <span className="text-sm">{config.emoji}</span>
          {config.actionType === "whatsapp"   ? <MessageCircle size={12} /> :
           config.actionType === "instagram"  ? <Instagram size={12} /> :
           <ExternalLink size={12} />}
          {config.actionLabel}
          {getSupplierDisplayName(config, item.product?.metadata) !== config.name &&
            <span className="opacity-60">— {getSupplierDisplayName(config, item.product?.metadata)}</span>
          }
        </>
      )}
    </motion.button>
  );
}

// ── Copy button ───────────────────────────────────────────────
function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setDone(true);
    if (label) toast.success(`${label} copied!`);
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <button onClick={copy}
      className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 transition-all"
      style={{ color: done ? "#34d399" : "rgba(255,255,255,0.25)" }}>
      {done ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function OrdersPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const qc      = useQueryClient();

  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [orderedItems, setOrderedItems] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch } = useQuery({
    queryKey:        ["orders", storeId, filter],
    queryFn:         async () => {
      const p = new URLSearchParams({ storeId, limit: "100" });
      if (filter !== "all") p.set("status", filter);
      const r = await api.get(`/orders?${p}`);
      return r.data.data?.orders || r.data.data || [];
    },
    enabled:         !!storeId,
    refetchInterval: 30000,
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, status, trackingNumber }: any) =>
      api.patch(`/orders/${id}`, { status, trackingNumber }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries(["orders"]);
      if (status === "SHIPPED")   toast.success("✅ Shipped — customer notified by KAI!");
      if (status === "DELIVERED") toast.success("📦 Delivered!");
    },
  });

  const orders   = (data || []) as any[];
  const filtered = orders.filter((o: any) =>
    (filter === "all" || o.status === filter) &&
    (!search ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.phone?.includes(search))
  );

  const counts = {
    all:        orders.length,
    new:        orders.filter((o: any) => o.status === "PAID").length,
    processing: orders.filter((o: any) => o.status === "PROCESSING").length,
    shipped:    orders.filter((o: any) => o.status === "SHIPPED").length,
    delivered:  orders.filter((o: any) => o.status === "DELIVERED").length,
  };

  const todayRevenue = orders.filter((o: any) => {
    const d = new Date(o.createdAt);
    return d.toDateString() === new Date().toDateString() &&
      ["PAID","PROCESSING","SHIPPED","DELIVERED"].includes(o.status);
  }).reduce((s: number, o: any) => s + Number(o.total || 0), 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full" style={{ background: "#07070e", minHeight: "100vh" }}>

        {/* ── TOP BAR ─────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0">

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[18px] font-semibold text-white tracking-tight">Orders</h1>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                Works with AliExpress, WhatsApp, Instagram, local markets — any supplier
              </p>
            </div>
            <button onClick={() => refetch()}
              className="w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <RefreshCw size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
          </div>

          {/* Stats */}
          {(counts.new > 0 || counts.shipped > 0 || todayRevenue > 0) && (
            <div className="flex gap-2 mb-4">
              {counts.new > 0 && (
                <motion.div className="flex-1 rounded-2xl px-4 py-3"
                  style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.2)" }}
                  animate={{ borderColor: ["rgba(96,165,250,0.2)","rgba(96,165,250,0.4)","rgba(96,165,250,0.2)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}>
                  <p className="text-xl font-black" style={{ color: "#60a5fa" }}>{counts.new}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Need fulfillment</p>
                </motion.div>
              )}
              {counts.shipped > 0 && (
                <div className="flex-1 rounded-2xl px-4 py-3" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)" }}>
                  <p className="text-xl font-black" style={{ color: "#34d399" }}>{counts.shipped}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>In transit</p>
                </div>
              )}
              <div className="flex-1 rounded-2xl px-4 py-3" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <p className="text-xl font-black" style={{ color: "#fbbf24" }}>
                  ₦{todayRevenue >= 1000 ? (todayRevenue/1000).toFixed(0)+"k" : todayRevenue}
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Today</p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Search size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Name, phone, or order ID..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "rgba(255,255,255,0.7)" }} />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {[
              { id: "all",        label: "All",        n: counts.all       },
              { id: "PAID",       label: "New",        n: counts.new,        urgent: true  },
              { id: "PROCESSING", label: "Processing", n: counts.processing               },
              { id: "SHIPPED",    label: "Shipped",    n: counts.shipped                  },
              { id: "DELIVERED",  label: "Delivered",  n: counts.delivered                },
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all"
                style={{
                  background: filter === tab.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                  border:     filter === tab.id ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  color:      filter === tab.id ? "#a78bfa" : "rgba(255,255,255,0.45)",
                }}>
                {tab.label}
                {tab.n > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full"
                    style={{
                      background: (tab as any).urgent && tab.n > 0 && filter !== tab.id ? "#60a5fa" : "rgba(255,255,255,0.1)",
                      color:      (tab as any).urgent && tab.n > 0 && filter !== tab.id ? "#fff" : "inherit",
                      fontSize:   "10px",
                    }}>
                    {tab.n}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── ORDERS LIST ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-2">
          {isLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-[72px] rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)", animationDelay: `${i*100}ms` }} />
            ))
          ) : !filtered.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                {filter === "PAID" ? "🎉" : "📭"}
              </div>
              <p className="text-sm font-medium text-white">
                {filter === "PAID" ? "You're all caught up!" : "No orders yet"}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                {filter === "PAID" ? "No pending orders right now" : "Orders appear here when customers buy"}
              </p>
            </div>
          ) : (
            filtered.map((order: any, i: number) => {
              const st      = S[order.status] || S.PENDING;
              const isOpen  = expanded === order.id;
              const isNew   = order.status === "PAID";
              const trackV  = tracking[order.id] || "";

              return (
                <motion.div key={order.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: isNew ? "rgba(96,165,250,0.04)" : "rgba(255,255,255,0.025)",
                    border:     isNew ? "1px solid rgba(96,165,250,0.18)" : "1px solid rgba(255,255,255,0.07)",
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.035 }}>

                  {/* ── Row ── */}
                  <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : order.id)}>

                    {/* New pulse */}
                    {isNew && (
                      <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: "#60a5fa" }}
                        animate={{ scale: [1,1.5,1], opacity: [1,0.4,1] }}
                        transition={{ duration: 1.8, repeat: Infinity }} />
                    )}

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: `${st.color}15`, color: st.color }}>
                      {order.customer?.name?.[0]?.toUpperCase() || "?"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {order.customer?.name || "Customer"}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        #{order.id.slice(-8).toUpperCase()} · {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short" })}
                      </p>
                    </div>

                    {/* Amount */}
                    <p className="text-sm font-bold text-white flex-shrink-0">
                      ₦{Number(order.total || 0).toLocaleString()}
                    </p>

                    {/* Status */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: st.bg }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                      <span className="text-xs font-medium" style={{ color: st.color }}>{st.label}</span>
                    </div>

                    {/* Chevron */}
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                    </motion.div>
                  </div>

                  {/* ── Expanded detail ── */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22,1,0.36,1] }}
                        style={{ overflow: "hidden" }}>

                        <div className="px-4 pb-4 pt-3 border-t space-y-4"
                          style={{ borderColor: "rgba(255,255,255,0.06)" }}>

                          {/* Delivery address */}
                          <div className="rounded-xl p-3.5 space-y-2"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2.5"
                              style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px" }}>
                              DELIVER TO
                            </p>
                            {[
                              { icon: <User size={11} />,   val: order.customer?.name,  label: "Name"    },
                              { icon: <MapPin size={11} />, val: [order.customer?.address, order.customer?.city, order.customer?.state].filter(Boolean).join(", "), label: "Address" },
                              { icon: <Phone size={11} />,  val: order.customer?.phone, label: "Phone"   },
                            ].filter(r => r.val).map(row => (
                              <div key={row.label} className="flex items-start gap-2">
                                <span className="mt-0.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{row.icon}</span>
                                <p className="flex-1 text-sm text-white leading-relaxed">{row.val}</p>
                                <CopyBtn text={row.val!} label={row.label} />
                              </div>
                            ))}
                          </div>

                          {/* Products + supplier actions */}
                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-widest"
                              style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px" }}>
                              ORDER FROM SUPPLIER
                            </p>
                            {(order.items || []).map((item: any) => {
                              const config = detectSupplier(item.product?.sourceUrl, item.product?.metadata);
                              return (
                                <div key={item.id} className="rounded-xl p-3"
                                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                  <div className="flex items-start gap-3">
                                    {/* Image */}
                                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0"
                                      style={{ background: "rgba(255,255,255,0.06)" }}>
                                      {item.product?.images?.[0]
                                        ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-xl">{config.emoji}</div>
                                      }
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-white truncate">{item.product?.name}</p>
                                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                          × {item.quantity}
                                        </span>
                                        {config.type !== "none" && (
                                          <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                                            style={{ background: config.bgColor, color: config.color }}>
                                            {config.emoji} {getSupplierDisplayName(config, item.product?.metadata)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {/* Action button — full width below */}
                                  {(order.status === "PAID" || order.status === "PROCESSING" || order.status === "PENDING") && (
                                    <SupplierActionBtn
                                      item={item} order={order}
                                      onDone={() => setOrderedItems(s => new Set([...s, item.id]))}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Tracking + ship action */}
                          {(order.status === "PAID" || order.status === "PROCESSING") && (
                            <div className="space-y-2 pt-1">
                              <p className="text-xs font-semibold uppercase tracking-widest"
                                style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px" }}>
                                AFTER ORDERING
                              </p>
                              <div className="flex gap-2">
                                <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
                                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                  <Truck size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
                                  <input value={trackV}
                                    onChange={e => setTracking(t => ({ ...t, [order.id]: e.target.value }))}
                                    placeholder="Tracking number (optional)"
                                    className="flex-1 bg-transparent outline-none text-sm"
                                    style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px" }}
                                    onClick={e => e.stopPropagation()} />
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); updateOrder.mutate({ id: order.id, status: "SHIPPED", trackingNumber: trackV || null }); }}
                                  disabled={updateOrder.isLoading}
                                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
                                  style={{ background: "linear-gradient(135deg,#34d399,#059669)", color: "#000", boxShadow: "0 4px 14px rgba(52,211,153,0.25)" }}>
                                  {updateOrder.isLoading ? <Loader2 size={13} className="animate-spin" /> : <Truck size={13} />}
                                  Ship
                                </button>
                              </div>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                                KAI will automatically send {order.customer?.name?.split(" ")[0] || "the customer"} their tracking via WhatsApp + email
                              </p>
                            </div>
                          )}

                          {/* Delivered action */}
                          {order.status === "SHIPPED" && (
                            <div className="flex items-center justify-between pt-1">
                              {order.trackingNumber && (
                                <div className="flex items-center gap-2">
                                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    Tracking: <span className="font-mono text-white">{order.trackingNumber}</span>
                                  </p>
                                  <CopyBtn text={order.trackingNumber} />
                                </div>
                              )}
                              <button onClick={e => { e.stopPropagation(); updateOrder.mutate({ id: order.id, status: "DELIVERED" }); }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ml-auto"
                                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                                <CheckCircle2 size={12} />Mark Delivered
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
