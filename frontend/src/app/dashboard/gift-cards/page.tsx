"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Gift, Plus, X, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

export default function GiftCardsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [modal, setModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["gift-cards", storeId],
    queryFn: () => api.get(`/gift-cards/${storeId}`).then(r => r.data),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post(`/gift-cards/${storeId}`, d),
    onSuccess: () => { toast.success("Gift card created!"); qc.invalidateQueries({ queryKey: ["gift-cards"] });
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")) setModal(false); reset(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => api.patch(`/gift-cards/${storeId}/${id}/deactivate`, {}),
    onSuccess: () => { toast.success("Gift card deactivated"); qc.invalidateQueries({ queryKey: ["gift-cards"] }); },
  });

  const giftCards = data?.data || [];
  const tx = "[color:var(--text-primary)]";
  const sub = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalBalance = giftCards.filter((g: any) => g.isActive).reduce((sum: number, g: any) => sum + g.balance, 0);
  const totalIssued = giftCards.reduce((sum: number, g: any) => sum + g.initialAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Gift Cards</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>{giftCards.length} cards issued · ${totalBalance.toFixed(2)} outstanding balance</p>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)]"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Plus size={14} /> Create Gift Card
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Issued", val: `$${totalIssued.toFixed(2)}` },
            { label: "Outstanding Balance", val: `$${totalBalance.toFixed(2)}` },
            { label: "Redeemed", val: `$${(totalIssued - totalBalance).toFixed(2)}` },
          ].map(({ label, val }) => (
            <div key={label} className={`rounded-2xl border p-4 ${card}`}>
              <p className={`text-xs font-semibold ${sub} mb-1`}>{label}</p>
              <p className={`text-xl font-black [color:var(--accent)]`}>{val}</p>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-16 text-center text-secondary">Loading…</div>
          ) : giftCards.length === 0 ? (
            <div className={`rounded-3xl border p-16 text-center ${card}`}>
              <Gift size={40} className="mx-auto mb-3 opacity-20" />
              <p className={`text-sm ${sub}`}>No gift cards yet. Create one to delight your customers.</p>
            </div>
          ) : giftCards.map((gc: any) => (
            <div key={gc.id} className={`rounded-2xl border p-4 ${card} flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#c9a84c,#f0c040)" }}>
                <Gift size={18} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-mono text-sm font-bold tracking-widest ${tx}`}>{gc.code}</span>
                  <button onClick={() => copyCode(gc.code)} className={`p-1 rounded [color:var(--accent)]`}>
                    {copied === gc.code ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <p className={`text-xs ${sub}`}>
                  {gc.assignedTo || "Unassigned"} · Issued ${gc.initialAmount.toFixed(2)}
                  {gc.expiresAt && ` · Expires ${new Date(gc.expiresAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black ${tx}`}>${gc.balance.toFixed(2)}</p>
                <p className={`text-xs ${sub}`}>remaining</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${gc.isActive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                {gc.isActive ? "Active" : "Inactive"}
              </span>
              {gc.isActive && (
                <button onClick={() => deactivateMut.mutate(gc.id)} className={`text-xs ${sub} hover:text-red-600 dark:text-red-400 transition-colors`}>Deactivate</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl border shadow-2xl [background:var(--bg-secondary)] [border-color:var(--border)]">
            <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
              <h2 className={`font-black text-lg ${tx}`}>Create Gift Card</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:[background:var(--bg-card)]"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Amount ($)</label>
                <input {...register("amount", { valueAsNumber: true })} type="number" step="0.01" min="1"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`} placeholder="50.00" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Send to (email, optional)</label>
                <input {...register("assignedTo")} type="email"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`} placeholder="customer@email.com" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Expiry Date (optional)</label>
                <input {...register("expiresAt")} type="datetime-local"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`} />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Personal Note (optional)</label>
                <textarea {...register("note")} rows={2}
                  className={`w-full rounded-xl px-3 py-2 text-sm border outline-none resize-none ${inp}`}
                  placeholder="Happy birthday! 🎂" />
              </div>
              <button type="submit" disabled={createMut.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                {createMut.isPending ? "Creating…" : "Create Gift Card"}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
