"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { Plus, Copy, Trash2, Tag, X, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const schema = z.object({
  code:          z.string().min(3).max(20).toUpperCase(),
  type:          z.enum(["PERCENTAGE", "FIXED"]),
  value:         z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxUses:       z.coerce.number().int().min(1).optional(),
  expiresAt:     z.string().optional(),
});

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CouponsPage() {
  
  
  const qc   = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [modal, setModal] = useState(false);
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";
  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons", storeId],
    queryFn:  () => api.get(`/coupons/${storeId}`).then((r) => r.data.data),
    enabled:  !!storeId,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: "PERCENTAGE" as const, minOrderValue: 0 },
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post(`/coupons/${storeId}`, d),
    onSuccess: () => { toast.success("Coupon created!"); qc.invalidateQueries({ queryKey: ["coupons"] }); setModal(false); reset(); },
    onError:   (e: any) => toast.error(e.response?.data?.message || "Failed to create coupon"),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) => api.patch(`/coupons/${storeId}/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${storeId}/${id}`),
    onSuccess: () => { toast.success("Coupon deleted"); qc.invalidateQueries({ queryKey: ["coupons"] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const typeVal = watch("type");

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Coupons</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>{coupons.length} coupon{coupons.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold [color:var(--text-primary)] shadow-lg "
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Plus size={16} /> Create Coupon
          </button>
        </div>

        {/* Coupon list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className={`rounded-2xl border p-5 animate-pulse ${card}`}>
                <div className={`h-5 w-32 rounded mb-2 ${"[background:var(--bg-card)]"}`} />
                <div className={`h-3 w-48 rounded ${"[background:var(--bg-card)]"}`} />
              </div>
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className={`rounded-3xl border-2 border-dashed [border-color:var(--accent)]/20 p-16 text-center bg-base`}>
            <Tag size={48} className="mx-auto mb-4 [color:var(--accent)] opacity-40" />
            <h2 className={`text-xl font-black mb-2 ${tx}`}>No coupons yet</h2>
            <p className={`text-sm mb-5 ${sub}`}>Create discount codes to reward your customers</p>
            <button onClick={() => setModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Plus size={14} /> Create Your First Coupon
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c: any) => {
              const expired  = c.expiresAt && new Date(c.expiresAt) < new Date();
              const maxedOut = c.maxUses && c.usedCount >= c.maxUses;
              const active   = c.isActive && !expired && !maxedOut;

              return (
                <div key={c.id} className={`rounded-2xl border p-5 flex items-center gap-5 ${card}`}>
                  {/* Code */}
                  <div className={`px-4 py-3 rounded-xl font-mono font-black text-lg tracking-widest flex-shrink-0 ${
                    active
                      ? "[background:var(--accent-dim)] [color:var(--accent)] border [border-color:var(--accent)]/20"
                      : "[background:var(--bg-card)] text-secondary"
                  }`}>
                    {c.code}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-lg font-black ${tx}`}>
                        {c.type === "PERCENTAGE" ? `${c.value}% off` : `$${c.value} off`}
                      </span>
                      {c.minOrderValue > 0 && (
                        <span className={`text-xs ${sub}`}>· Min order ${c.minOrderValue}</span>
                      )}
                      {expired && <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Expired</span>}
                      {maxedOut && <span className="text-xs font-bold text-secondary bg-slate-500/10 px-2 py-0.5 rounded-full">Used up</span>}
                    </div>
                    <div className={`text-xs mt-1 ${sub}`}>
                      {c.usedCount || 0} uses
                      {c.maxUses ? ` / ${c.maxUses} max` : " (unlimited)"}
                      {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}` : ""}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied!"); }}
                      className={`p-2 rounded-lg transition-all text-secondary hover:[background:var(--bg-card)]`}>
                      <Copy size={14} />
                    </button>
                    <button onClick={() => toggleMut.mutate(c.id)}
                      className={`p-2 rounded-lg transition-all ${c.isActive ? "text-emerald-500" : "text-secondary"}`}>
                      {c.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => { if (confirm("Delete this coupon?")) deleteMut.mutate(c.id); }}
                      className={`p-2 rounded-lg transition-all text-red-400 hover:bg-red-100 dark:bg-red-900/30`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl ${"bg-secondary [border-color:var(--border)]"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]`}>
              <h2 className={`font-black text-lg ${tx}`}>Create Coupon</h2>
              <button onClick={() => setModal(false)} className={`p-2 rounded-xl ${"hover:[background:var(--bg-secondary)]"}`}>
                <X size={16} className={sub} />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Coupon Code *</label>
                <div className="flex gap-2">
                  <input {...register("code")}
                    style={{ textTransform: "uppercase" }}
                    placeholder="e.g. SAVE20"
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all font-mono tracking-widest ${inp}`} />
                  <button type="button" onClick={() => setValue("code", randomCode())}
                    className={`p-2.5 rounded-xl border-2 transition-all [border-color:var(--border-strong)] text-secondary hover:[background:var(--bg-secondary)]`}>
                    <RefreshCw size={14} />
                  </button>
                </div>
                {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code.message}</p>}
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Type</label>
                  <select {...register("type")} className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 ${inp}`}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>
                    {typeVal === "PERCENTAGE" ? "Discount %" : "Amount ($)"}
                  </label>
                  <input {...register("value")} type="number" step="0.01"
                    placeholder={typeVal === "PERCENTAGE" ? "20" : "10.00"}
                    className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
                  {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value.message}</p>}
                </div>
              </div>

              {/* Min order + max uses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Min Order ($)</label>
                  <input {...register("minOrderValue")} type="number" step="0.01" placeholder="0"
                    className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Max Uses</label>
                  <input {...register("maxUses")} type="number" placeholder="Unlimited"
                    className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Expiry Date</label>
                <input {...register("expiresAt")} type="date"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={createMut.isPending}
                  className="flex-1 py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {createMut.isPending ? "Creating…" : "Create Coupon"}
                </button>
                <button type="button" onClick={() => setModal(false)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold border-2 ${"[border-color:var(--border)] text-secondary"}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}