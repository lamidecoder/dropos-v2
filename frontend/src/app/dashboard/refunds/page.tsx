"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RefreshCw, Eye, X, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  APPROVED:  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  REJECTED:  "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  PROCESSED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

const REASON_LABELS: Record<string, string> = {
  DAMAGED: "Item Damaged", NOT_RECEIVED: "Not Received", WRONG_ITEM: "Wrong Item",
  NOT_AS_DESCRIBED: "Not as Described", CHANGED_MIND: "Changed Mind", OTHER: "Other",
};

export default function RefundsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [selected, setSelected] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["refunds", storeId],
    queryFn: () => api.get(`/refunds/${storeId}`).then(r => r.data),
    enabled: !!storeId,
  });

  const processMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/refunds/${storeId}/${id}/process`, { status, adminNote }),
    onSuccess: () => {
      toast.success("Refund updated");
      qc.invalidateQueries({ queryKey: ["refunds"] });
      setSelected(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const refunds = data?.data || [];
  const tx = "[color:var(--text-primary)]";
  const sub = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";

  const stats = {
    total: refunds.length,
    pending: refunds.filter((r: any) => r.status === "PENDING").length,
    totalValue: refunds.reduce((sum: number, r: any) => sum + r.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Refunds</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{stats.pending} pending review · ${stats.totalValue.toFixed(2)} total requested</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Requests", val: stats.total, icon: RefreshCw, color: "var(--accent)" },
            { label: "Pending Review", val: stats.pending, icon: Clock, color: "#f59e0b" },
            { label: "Total Requested", val: `$${stats.totalValue.toFixed(2)}`, icon: DollarSign, color: "#10b981" },
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color }} />
                <span className={`text-xs font-semibold ${sub}`}>{label}</span>
              </div>
              <div className={`text-2xl font-black ${tx}`}>{val}</div>
            </div>
          ))}
        </div>

        {/* Refunds list */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {isLoading ? (
            <div className="py-16 text-center text-secondary">Loading refunds…</div>
          ) : refunds.length === 0 ? (
            <div className="py-16 text-center">
              <RefreshCw size={36} className="mx-auto mb-3 opacity-20" />
              <p className={`text-sm ${sub}`}>No refund requests yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b border-inherit text-xs ${sub}`}>
                  {["Order", "Customer", "Amount", "Reason", "Date", "Status", ""].map(h => (
                    <th key={h} className="text-left font-semibold px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {refunds.map((r: any) => (
                  <tr key={r.id} className="border-b [border-color:var(--border)]/50 hover:[background:var(--bg-secondary)]/40">
                    <td className="px-5 py-4 font-mono text-xs font-bold [color:var(--accent)]">{r.order?.orderNumber}</td>
                    <td className="px-5 py-4">
                      <div className={`font-semibold text-sm ${tx}`}>{r.order?.customerName}</div>
                      <div className={`text-xs ${sub}`}>{r.order?.customerEmail}</div>
                    </td>
                    <td className={`px-5 py-4 font-bold ${tx}`}>${r.amount.toFixed(2)}</td>
                    <td className={`px-5 py-4 text-xs ${sub}`}>{REASON_LABELS[r.reason] || r.reason}</td>
                    <td className={`px-5 py-4 text-xs ${sub}`}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] || ""}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => { setSelected(r); setAdminNote(""); }}
                        className="p-1.5 rounded-lg [color:var(--accent)] hover:[background:var(--accent-dim)]">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg rounded-3xl border shadow-2xl [background:var(--bg-secondary)] [border-color:var(--border)]">
            <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
              <h2 className={`font-black text-lg ${tx}`}>Refund Request</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:[background:var(--bg-secondary)]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`rounded-xl border p-4 [background:var(--bg-card)] [border-color:var(--border)]`}>
                <p className={`text-xs font-semibold ${sub} mb-1`}>Order</p>
                <p className={`font-bold ${tx}`}>{selected.order?.orderNumber}</p>
                <p className={`text-sm ${sub}`}>{selected.order?.customerName} · {selected.order?.customerEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl border p-3 [border-color:var(--border)]`}>
                  <p className={`text-xs ${sub}`}>Refund Amount</p>
                  <p className={`text-xl font-black [color:var(--accent)]`}>${selected.amount.toFixed(2)}</p>
                </div>
                <div className={`rounded-xl border p-3 [border-color:var(--border)]`}>
                  <p className={`text-xs ${sub}`}>Reason</p>
                  <p className={`text-sm font-semibold ${tx}`}>{REASON_LABELS[selected.reason]}</p>
                </div>
              </div>

              {selected.description && (
                <div className={`rounded-xl border p-3 [border-color:var(--border)]`}>
                  <p className={`text-xs ${sub} mb-1`}>Customer Note</p>
                  <p className={`text-sm ${tx}`}>{selected.description}</p>
                </div>
              )}

              {selected.status === "PENDING" && (
                <>
                  <div>
                    <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Admin Note (optional)</label>
                    <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                      className={`w-full rounded-xl px-3 py-2 text-sm outline-none resize-none [background:var(--bg-card)] [border:1px_solid_var(--border)] ${tx}`}
                      placeholder="Reason for approval/rejection…" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => processMut.mutate({ id: selected.id, status: "APPROVED" })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)]"
                      style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                      <CheckCircle size={14} /> Approve Refund
                    </button>
                    <button onClick={() => processMut.mutate({ id: selected.id, status: "REJECTED" })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)]"
                      style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </>
              )}
              {selected.status !== "PENDING" && (
                <div className={`rounded-xl p-3 ${STATUS_COLORS[selected.status]}`}>
                  <p className="text-sm font-bold">Status: {selected.status}</p>
                  {selected.adminNote && <p className="text-xs mt-1 opacity-80">{selected.adminNote}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
