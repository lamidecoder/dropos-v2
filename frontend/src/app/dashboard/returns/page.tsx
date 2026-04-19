"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { RotateCcw, Eye, X } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  APPROVED:  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  REJECTED:  "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  RECEIVED:  "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  REFUNDED:  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
};

export default function ReturnsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [selected, setSelected] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const tx = "[color:var(--text-primary)]";
  const sub = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";

  const { data, isLoading } = useQuery({
    queryKey: ["returns", storeId],
    queryFn: () => api.get(`/ops/returns/${storeId}`).then(r => r.data),
    enabled: !!storeId,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: any) => api.patch(`/ops/returns/${storeId}/${id}`, { status, adminNote }),
    onSuccess: () => { toast.success("Return updated"); qc.invalidateQueries({ queryKey: ["returns"] }); setSelected(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const returns = data?.data || [];

  return (
    
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Returns & RMA</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{returns.filter((r: any) => r.status === "REQUESTED").length} pending returns</p>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {isLoading ? <div className="py-16 text-center text-secondary">Loading…</div>
          : returns.length === 0 ? (
            <div className="py-16 text-center">
              <RotateCcw size={36} className="mx-auto mb-3 opacity-20" />
              <p className={`text-sm ${sub}`}>No return requests yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b border-inherit text-xs ${sub}`}>
                  {["Order", "Customer", "Reason", "Date", "Status", ""].map(h => (
                    <th key={h} className="text-left font-semibold px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map((r: any) => (
                  <tr key={r.id} className="border-b [border-color:var(--border)]/50 hover:[background:var(--bg-secondary)]/40">
                    <td className="px-5 py-4 font-mono text-xs font-bold [color:var(--accent)]">{r.order?.orderNumber}</td>
                    <td className="px-5 py-4"><div className={`font-semibold text-sm ${tx}`}>{r.order?.customerName}</div><div className={`text-xs ${sub}`}>{r.customerEmail}</div></td>
                    <td className={`px-5 py-4 text-xs ${sub}`}>{r.reason}</td>
                    <td className={`px-5 py-4 text-xs ${sub}`}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] || ""}`}>{r.status}</span></td>
                    <td className="px-5 py-4">
                      <button onClick={() => { setSelected(r); setNewStatus(r.status); setAdminNote(""); }}
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg rounded-3xl border shadow-2xl [background:var(--bg-secondary)] [border-color:var(--border)]">
            <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
              <h2 className={`font-black text-lg ${tx}`}>Return Request</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:[background:var(--bg-card)]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`rounded-xl border p-3 [border-color:var(--border)]`}>
                <p className={`text-xs ${sub} mb-1`}>Reason</p>
                <p className={`text-sm ${tx}`}>{selected.reason}</p>
                {selected.description && <p className={`text-xs ${sub} mt-1`}>{selected.description}</p>}
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-2`}>Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {["APPROVED","REJECTED","RECEIVED","REFUNDED"].map(s => (
                    <button key={s} onClick={() => setNewStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newStatus === s ? "text-[var(--text-primary)]" : `${sub}`}`}
                      style={newStatus === s ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Admin Note</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                  className={`w-full rounded-xl px-3 py-2 text-sm border outline-none resize-none [background:var(--bg-card)] [border-color:var(--border)] ${tx}`}
                  placeholder="Note to customer…" />
              </div>
              <button onClick={() => updateMut.mutate({ id: selected.id, status: newStatus })}
                disabled={updateMut.isPending || newStatus === selected.status}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                {updateMut.isPending ? "Updating…" : "Update Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    
  );
}
