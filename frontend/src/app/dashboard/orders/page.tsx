"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderAPI, api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import DashboardLayout from "../../../components/layout/DashboardLayout";

import { Search, ShoppingCart, ChevronLeft, ChevronRight, Eye, X, Package, Truck, Download, Zap, CheckSquare, Square, ListChecks } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"] as const;

const statusColor: Record<string, string> = {
  PENDING:    "bg-amber-100 dark:bg-amber-900/40 [color:var(--accent)]",
  PROCESSING: "bg-violet-100 dark:bg-violet-900/40 [color:var(--accent)]",
  SHIPPED:    "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  DELIVERED:  "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400",
  COMPLETED:  "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
  CANCELLED:  "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
  REFUNDED:   "[background:var(--bg-card)] text-secondary",
};

export default function OrdersPage() {
  
  
  const qc   = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const storeId = user?.stores?.[0]?.id;
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";
  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";

  const [page,   setPage]     = useState(1);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["orders", storeId, page, search, status],
    queryFn:  () => orderAPI.getAll(storeId!, { page, limit: 15, search, status }).then((r) => r.data),
    enabled:  !!storeId,
  });

  const { data: orderDetail } = useQuery({
    queryKey: ["order-detail", storeId, selected?.id],
    queryFn:  () => orderAPI.getOne(storeId!, selected.id).then((r) => r.data.data),
    enabled:  !!selected,
  });

  const fulfillMut = useMutation({
    mutationFn: (orderId: string) => api.post(`/suppliers/${storeId}/fulfill/${orderId}`, {}),
    onSuccess: (res) => {
      const results = res.data.data as any[];
      const sent = results.filter(r => r.success).length;
      const fail = results.filter(r => !r.success).length;
      if (sent > 0) toast.success(`Forwarded to ${sent} supplier${sent > 1 ? "s" : ""}`);
      if (fail > 0) toast.error(`${fail} supplier(s) failed — check supplier settings`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Fulfillment failed"),
  });

  const bulkUpdateMut = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      Promise.all(ids.map(id => orderAPI.updateStatus(storeId!, id, { status }))),
    onSuccess: () => {
      toast.success(`${checkedIds.size} orders updated`);
      setCheckedIds(new Set()); setBulkStatus("");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("Bulk update failed"),
  });

  const updateStatus = useMutation({
    mutationFn: (d: any) => orderAPI.updateStatus(storeId!, selected.id, d),
    onSuccess: () => {
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order-detail", storeId, selected?.id] });
      setSelected(null);
    },
    onError: () => toast.error("Update failed"),
  });

  const orders     = data?.data || [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Orders</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{pagination?.total || 0} total orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-sm flex-1 min-w-[220px] ${"[background:var(--bg-secondary)] [border-color:var(--border)]"}`}>
            <Search size={14} className={sub} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search orders, email, name…" className="bg-transparent outline-none flex-1 text-sm" />
            {search && <button onClick={() => setSearch("")}><X size={12} className={sub} /></button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {[["", "All"], ["PENDING", "Pending"], ["PROCESSING", "Processing"], ["SHIPPED", "Shipped"], ["COMPLETED", "Completed"], ["CANCELLED", "Cancelled"]].map(([v, l]) => (
              <button key={v} onClick={() => { setStatus(v); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                  ${status === v ? "[color:var(--text-primary)]" : `${sub} ${"hover:[background:var(--bg-secondary)]"}`}`}
                style={status === v ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {l}
              </button>
            ))}
          </div>
        </div>


        {/* Bulk action bar */}
        {checkedIds.size > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-2xl border" style={{ background: "var(--accent-dim)", borderColor: "var(--accent)" }}>
            <ListChecks size={16} style={{ color: "var(--accent)" }} />
            <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{checkedIds.size} selected</span>
            <div className="flex-1" />
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
              className="rounded-xl px-3 py-1.5 text-xs border outline-none [background:var(--bg-card)] [border-color:var(--border)] [color:var(--text-primary)]">
              <option value="">Set status…</option>
              {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button onClick={() => { if (bulkStatus) bulkUpdateMut.mutate({ ids: [...checkedIds], status: bulkStatus }); }}
              disabled={!bulkStatus || bulkUpdateMut.isPending}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}>
              {bulkUpdateMut.isPending ? "Updating…" : "Apply"}
            </button>
            <button onClick={() => setCheckedIds(new Set())} className="text-xs" style={{ color: "var(--text-tertiary)" }}>Clear</button>
          </div>
        )}

        {/* Table */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b border-inherit text-xs ${sub}`}>
                {["", "Order", "Customer", "Total", "Items", "Gateway", "Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className={`border-b [border-color:var(--border)]/50`}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className={`h-3 rounded animate-pulse ${"[background:var(--bg-card)]"}`} style={{ width: `${40 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((o: any) => (
                    <tr key={o.id}
                      className={`border-b transition-colors cursor-pointer [border-color:var(--border)]/50 hover:[background:var(--bg-secondary)]/40 ${checkedIds.has(o.id) ? "[background:var(--accent-dim)]" : ""}`}>
                      <td className="px-3 py-4" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setCheckedIds(prev => { const n = new Set(prev); n.has(o.id) ? n.delete(o.id) : n.add(o.id); return n; })}>
                          {checkedIds.has(o.id)
                            ? <CheckSquare size={15} style={{ color: "var(--accent)" }} />
                            : <Square size={15} style={{ color: "var(--text-tertiary)" }} />}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-bold [color:var(--accent)]">{o.orderNumber}</td>
                      <td className="px-5 py-4">
                        <div className={`font-semibold text-sm ${tx}`}>{o.customerName}</div>
                        <div className={`text-xs ${sub}`}>{o.customerEmail}</div>
                      </td>
                      <td className={`px-5 py-4 font-bold ${tx}`}>${o.total?.toFixed(2)}</td>
                      <td className={`px-5 py-4 text-xs font-semibold ${sub}`}>{o.items?.length || 0} items</td>
                      <td className={`px-5 py-4 text-xs ${sub}`}>{o.payment?.gateway || "—"}</td>
                      <td className={`px-5 py-4 text-xs ${sub}`}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[o.status] || "[background:var(--bg-card)] text-secondary"}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelected(o); setNewStatus(o.status); setTracking(o.trackingNumber || ""); }}
                            className={`p-1.5 rounded-lg ${"[color:var(--accent)] hover:[background:var(--accent-dim)]"}`}>
                            <Eye size={14} />
                          </button>
                          <a href={`${process.env.NEXT_PUBLIC_API_URL}/invoices/${o.id}`} target="_blank" rel="noreferrer"
                            className={`p-1.5 rounded-lg text-secondary hover:[background:var(--bg-card)]`}
                            title="Download Invoice">
                            <Download size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!isLoading && !orders.length && (
                <tr>
                  <td colSpan={8} className={`py-16 text-center ${sub}`}>
                    <ShoppingCart size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No orders yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className={`text-sm ${sub}`}>
              Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className={`p-2 rounded-xl border disabled:opacity-40 [border-color:var(--border)] hover:[background:var(--bg-secondary)]`}>
                <ChevronLeft size={16} className={sub} />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className={`p-2 rounded-xl border disabled:opacity-40 [border-color:var(--border)] hover:[background:var(--bg-secondary)]`}>
                <ChevronRight size={16} className={sub} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl max-h-[90vh] flex flex-col animate-fade ${"bg-secondary [border-color:var(--border)]"}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]`}>
              <div>
                <h2 className={`font-black text-lg ${tx}`}>{selected.orderNumber}</h2>
                <p className={`text-xs ${sub}`}>{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className={`p-2 rounded-xl ${"hover:[background:var(--bg-secondary)]"}`}>
                <X size={16} className={sub} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Customer */}
              <div className={`rounded-xl border p-4 [background:var(--bg-secondary)] [border-color:var(--border)]`}>
                <div className={`text-xs font-semibold ${sub} mb-2`}>Customer</div>
                <div className={`font-bold ${tx}`}>{selected.customerName}</div>
                <div className={`text-sm ${sub}`}>{selected.customerEmail}</div>
                {selected.customerPhone && <div className={`text-sm ${sub}`}>{selected.customerPhone}</div>}
              </div>

              {/* Items */}
              <div>
                <div className={`text-xs font-semibold ${sub} mb-2`}>Order Items</div>
                <div className="space-y-2">
                  {(orderDetail?.items || selected.items || []).map((item: any) => (
                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${"[border-color:var(--border)]"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${"[background:var(--bg-card)]"}`}>
                          <Package size={14} className={sub} />
                        </div>
                        <div>
                          <div className={`font-semibold text-sm ${tx}`}>{item.name}</div>
                          <div className={`text-xs ${sub}`}>×{item.quantity} @ ${item.price?.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${tx}`}>${item.total?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className={`rounded-xl border p-4 space-y-2 ${"[border-color:var(--border)]"}`}>
                {[
                  { l: "Subtotal",   v: `$${(selected.subtotal || 0).toFixed(2)}` },
                  { l: "Shipping",   v: `$${(selected.shippingCost || 0).toFixed(2)}` },
                  { l: "Tax",        v: `$${(selected.taxAmount || 0).toFixed(2)}` },
                ].map(({ l, v }) => (
                  <div key={l} className={`flex justify-between text-sm ${sub}`}>
                    <span>{l}</span><span>{v}</span>
                  </div>
                ))}
                <div className={`flex justify-between font-black text-base border-t pt-2 ${"[border-color:var(--border)]"} ${tx}`}>
                  <span>Total</span>
                  <span>${selected.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Update Status */}
              <div className={`rounded-xl border p-4 [background:var(--bg-secondary)] [border-color:var(--border)]`}>
                <div className={`text-xs font-semibold ${sub} mb-3`}>Update Status</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {STATUS_FLOW.map((s) => (
                    <button key={s} onClick={() => setNewStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${newStatus === s ? "[color:var(--text-primary)]" : `${sub} {hover:[background:var(--bg-card)]}`}`}
                      style={newStatus === s ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                      {s}
                    </button>
                  ))}
                  <button onClick={() => setNewStatus("CANCELLED")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${newStatus === "CANCELLED" ? "bg-red-600 text-[var(--text-primary)]" : `text-red-600 dark:text-red-400 {hover:bg-red-100 dark:bg-red-900/30}`}`}>
                    CANCEL
                  </button>
                </div>

                {(newStatus === "SHIPPED" || newStatus === "DELIVERED") && (
                  <div className="mb-3">
                    <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Tracking Number</label>
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${inp}`}>
                      <Truck size={13} className={sub} />
                      <input value={tracking} onChange={(e) => setTracking(e.target.value)}
                        placeholder="e.g. 1Z999AA10123456784"
                        className="bg-transparent outline-none flex-1 text-sm" />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => updateStatus.mutate({ status: newStatus, trackingNumber: tracking || undefined })}
                  disabled={newStatus === selected.status || updateStatus.isPending}
                  className="w-full py-2.5 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {updateStatus.isPending ? "Updating…" : "Update Order Status"}
                </button>

                {/* Manual Fulfill button */}
                <button
                  onClick={() => fulfillMut.mutate(selected.id)}
                  disabled={fulfillMut.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border [border-color:var(--border)] text-secondary hover:[background:var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-all mt-2">
                  {fulfillMut.isPending
                    ? <><Package size={13} className="animate-pulse" /> Sending to Supplier…</>
                    : <><Zap size={13} /> Forward to Supplier</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
