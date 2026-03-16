"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ShoppingCart, Mail, TrendingUp, RefreshCw, Trash2,
  CheckCircle, Clock, Send, ChevronLeft, ChevronRight,
  AlertTriangle, Zap, Package
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const currency = (amount: number, sym = "$") =>
  `${sym}${amount.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AbandonedCartsPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const [page,      setPage]      = useState(1);
  const [filter,    setFilter]    = useState<"all" | "pending" | "recovered">("all");
  const [expandRow, setExpandRow] = useState<string | null>(null);

  const recovered = filter === "all" ? undefined : filter === "recovered" ? "true" : "false";

  const { data, isLoading } = useQuery({
    queryKey: ["abandoned-carts", storeId, page, filter],
    queryFn:  () => api.get(`/abandoned-carts/${storeId}`, { params: { page, limit: 15, recovered } }).then(r => r.data),
    enabled:  !!storeId,
    refetchInterval: 30_000,
  });

  const carts      = data?.data || [];
  const pagination = data?.pagination;
  const stats      = data?.stats || { totalAbandoned: 0, totalRecovered: 0, recoveryRate: 0, recoveredRevenue: 0 };

  const resendMut = useMutation({
    mutationFn: (cartId: string) => api.post(`/abandoned-carts/${storeId}/resend/${cartId}`),
    onSuccess:  () => { toast.success("Recovery email sent"); qc.invalidateQueries({ queryKey: ["abandoned-carts"] }); },
    onError:    (e: any) => toast.error(e.response?.data?.message || "Send failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (cartId: string) => api.delete(`/abandoned-carts/${storeId}/${cartId}`),
    onSuccess:  () => { toast.success("Cart removed"); qc.invalidateQueries({ queryKey: ["abandoned-carts"] }); },
    onError:    () => toast.error("Delete failed"),
  });

  const triggerRemindersMut = useMutation({
    mutationFn: () => api.post("/abandoned-carts/send-reminders"),
    onSuccess:  (res) => {
      const { sent, failed } = res.data;
      toast.success(`${sent} reminder${sent !== 1 ? "s" : ""} sent${failed > 0 ? `, ${failed} failed` : ""}`);
      qc.invalidateQueries({ queryKey: ["abandoned-carts"] });
    },
    onError: () => toast.error("Reminder trigger failed"),
  });

  const STAT_CARDS = [
    {
      icon:  ShoppingCart,
      label: "Total Abandoned",
      value: stats.totalAbandoned.toLocaleString(),
      sub:   "carts not completed",
      color: "#ef4444",
      bg:    "rgba(239,68,68,0.08)",
    },
    {
      icon:  CheckCircle,
      label: "Recovered",
      value: stats.totalRecovered.toLocaleString(),
      sub:   "carts completed",
      color: "#10b981",
      bg:    "rgba(16,185,129,0.08)",
    },
    {
      icon:  TrendingUp,
      label: "Recovery Rate",
      value: `${stats.recoveryRate}%`,
      sub:   "of abandoned → purchase",
      color: "var(--accent)",
      bg:    "rgba(201,168,76,0.08)",
    },
    {
      icon:  Zap,
      label: "Revenue Recovered",
      value: currency(stats.recoveredRevenue),
      sub:   "from email campaigns",
      color: "#a78bfa",
      bg:    
    },


  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Abandoned Carts</h1>
            <p className="text-secondary text-sm mt-1">
              Track shoppers who added items but didn't complete checkout
            </p>
          </div>
          <button
            onClick={() => triggerRemindersMut.mutate()}
            disabled={triggerRemindersMut.isPending || !storeId}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-black disabled:opacity-50 shadow-lg flex-shrink-0" style={{ boxShadow: "var(--shadow-md)" }"
            style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-light))" }}>
            {triggerRemindersMut.isPending
              ? <><RefreshCw size={13} className="animate-spin" /> Sending…</>
              : <><Send size={13} /> Send Reminders</>}
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="rounded-2xl p-4"
              style={{ background: bg, border: `1px solid ${color}20` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <span className="text-secondary text-[11px] font-semibold">{label}</span>
              </div>
              <div className="text-2xl font-black [color:var(--text-primary)] leading-none mb-1">{value}</div>
              <div className="text-tertiary text-[11px]">{sub}</div>
            </div>
          ))}
        </div>

        {/* How it works info box */}
        {stats.totalAbandoned === 0 && (
          <div className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(201,168,76,0.1)" }}>
              <AlertTriangle size={16} className="[color:var(--accent)]" />
            </div>
            <div>
              <h3 className="[color:var(--accent)] font-bold text-sm mb-1">No abandoned carts yet</h3>
              <p className="text-secondary text-xs leading-relaxed">
                When shoppers add items to their cart but don't check out, they'll appear here.
                An exit intent popup captures their email, and an automatic recovery email
                is sent 1 hour later. You can also click "Send Reminders" to trigger emails manually.
              </p>
            </div>
          </div>
        )}

        {/* Filter tabs + table */}
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {(["all", "pending", "recovered"] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                style={filter === f
                  ? { background: "linear-gradient(135deg,var(--accent),var(--accent-light))", color: "black" }
                  : { background: "var(--bg-secondary)", color: "var(--text-tertiary)", border: "1px solid var(--border0.07)" }}>
                {f}
              </button>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--bg-card)" }}>
                  {["Customer", "Items", "Cart Value", "Status", "Sent", "Abandoned", ""].map(h => (
                    <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest px-4 py-3 text-tertiary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b" style={{ borderColor: "var(--bg-secondary)" }}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3.5">
                            <div className="h-3 rounded-full animate-pulse [background:var(--bg-secondary)]" style={{ width: `${40 + (i*j*7) % 40}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : carts.map((cart: any) => {
                      const items = cart.items as any[];
                      const isExpanded = expandRow === cart.id;

                      return (
                        <>
                          <tr key={cart.id}
                            className="border-b group cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
                            style={{ borderColor: "var(--bg-secondary)" }}
                            onClick={() => setExpandRow(isExpanded ? null : cart.id)}>

                            {/* Customer */}
                            <td className="px-4 py-3.5">
                              <div className="[color:var(--text-primary)] font-semibold text-xs">{cart.name || "Anonymous"}</div>
                              <div className="text-secondary text-[11px] mt-0.5">{cart.email}</div>
                            </td>

                            {/* Items */}
                            <td className="px-4 py-3.5">
                              <div className="flex -space-x-1.5">
                                {items.slice(0, 3).map((item: any, i: number) => (
                                  <div key={i}
                                    className="w-7 h-7 rounded-lg overflow-hidden ring-2 flex-shrink-0"
                                    style={{ ringColor: "var(--bg-secondary)", background: "var(--bg-secondary)", zIndex: 3 - i }}>
                                    {item.image
                                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      : <div className="w-full h-full flex items-center justify-center"><Package size={10} className="text-secondary" /></div>}
                                  </div>
                                ))}
                                {items.length > 3 && (
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-secondary"
                                    style={{ background: "var(--bg-card)" }}>+{items.length - 3}</div>
                                )}
                              </div>
                              <div className="text-tertiary text-[10px] mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</div>
                            </td>

                            {/* Value */}
                            <td className="px-4 py-3.5">
                              <span className="[color:var(--text-primary)] font-black text-sm">{currency(cart.total)}</span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              {cart.recovered
                                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-400/10 text-emerald-400">
                                    <CheckCircle size={9} /> Recovered
                                  </span>
                                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-400/10 text-red-400">
                                    <Clock size={9} /> Abandoned
                                  </span>}
                            </td>

                            {/* Email sent */}
                            <td className="px-4 py-3.5">
                              {cart.emailSent
                                ? <span className="text-emerald-400/70 text-[11px] flex items-center gap-1">
                                    <Mail size={11} /> Sent ×{cart.reminderCount}
                                  </span>
                                : <span className="text-tertiary text-[11px]">Not sent</span>}
                            </td>

                            {/* Time */}
                            <td className="px-4 py-3.5 text-tertiary text-[11px]">
                              {formatDistanceToNow(new Date(cart.createdAt), { addSuffix: true })}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={e => e.stopPropagation()}>
                                {!cart.recovered && (
                                  <button
                                    onClick={() => resendMut.mutate(cart.id)}
                                    disabled={resendMut.isPending}
                                    title="Send recovery email"
                                    className="p-1.5 rounded-lg transition-colors [color:var(--accent)] hover:[background:var(--accent-dim)]">
                                    <Send size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={() => { if (confirm("Remove this abandoned cart?")) deleteMut.mutate(cart.id); }}
                                  title="Delete"
                                  className="p-1.5 rounded-lg transition-colors text-red-400 hover:bg-red-400/10">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded row — item details */}
                          {isExpanded && (
                            <tr key={`${cart.id}-expand`} className="border-b"
                              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
                              <td colSpan={7} className="px-4 py-3">
                                <div className="space-y-2">
                                  <div className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-2">Cart Contents</div>
                                  {items.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                                        style={{ background: "var(--bg-card)" }}>
                                        {item.image
                                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                          : <div className="w-full h-full flex items-center justify-center"><Package size={11} className="text-tertiary" /></div>}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-primary text-xs font-semibold truncate">{item.name}</div>
                                        {item.variantLabel && <div className="text-tertiary text-[10px]">{item.variantLabel}</div>}
                                      </div>
                                      <div className="text-secondary text-xs">×{item.quantity}</div>
                                      <div className="[color:var(--accent)] font-bold text-xs">{currency(item.price * item.quantity)}</div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                }
                {!isLoading && !carts.length && (
                  <tr><td colSpan={7} className="py-14 text-center">
                    <ShoppingCart size={32} className="mx-auto mb-3 text-tertiary" />
                    <p className="text-tertiary text-sm">No abandoned carts found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-tertiary text-xs">
                {((page-1)*15)+1}–{Math.min(page*15, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="p-2 rounded-xl border [border-color:var(--border)] text-secondary hover:[background:var(--bg-secondary)] disabled:opacity-30 transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage(p => Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}
                  className="p-2 rounded-xl border [border-color:var(--border)] text-secondary hover:[background:var(--bg-secondary)] disabled:opacity-30 transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Setup guide */}
        <div className="rounded-2xl p-5"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <h3 className="[color:var(--text-primary)] font-bold text-sm mb-3">How Abandoned Cart Recovery Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "1", icon: ShoppingCart, color: "#ef4444", title: "Shopper adds items",     desc: "A customer builds a cart but hesitates before checkout." },
              { step: "2", icon: Mail,         color: "var(--accent)", title: "Exit intent popup",      desc: "When they move to leave, a popup captures their email and offers a discount." },
              { step: "3", icon: Zap,          color: "#10b981", title: "Recovery email sent",    desc: "1 hour later, a personalized email with their cart is sent automatically." },
            ].map(({ step, icon: Icon, color, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                  style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
                  {step}
                </div>
                <div>
                  <div className="text-primary text-xs font-bold mb-0.5">{title}</div>
                  <div className="text-secondary text-[11px] leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-[11px] text-tertiary"
            style={{ borderColor: "var(--bg-card)" }}>
            <AlertTriangle size={11} className="[color:var(--accent)]/50 flex-shrink-0" />
            To automate reminder sending, add a cron job: <code className="[color:var(--accent)]/60 font-mono ml-1">POST /api/abandoned-carts/send-reminders</code> every hour.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
