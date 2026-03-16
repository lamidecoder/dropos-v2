"use client";
// Flash Sales Page
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Zap, Plus, X, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function FlashSalesPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", discountPct: 20, startsAt: "", endsAt: "", bannerText: "", productIds: "" });
  const tx = "[color:var(--text-primary)]";
  const sub = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp = "[background:var(--bg-card)] [border-color:var(--border)] [color:var(--text-primary)]";

  const { data } = useQuery({
    queryKey: ["flash-sales", storeId],
    queryFn: () => api.get(`/ops/flash-sales/${storeId}`).then(r => r.data),
    enabled: !!storeId,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products-all", storeId],
    queryFn: () => api.get(`/products/${storeId}?limit=100`).then(r => r.data),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post(`/ops/flash-sales/${storeId}`, d),
    onSuccess: () => { toast.success("Flash sale created!"); qc.invalidateQueries({ queryKey: ["flash-sales"] }); setModal(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/ops/flash-sales/${storeId}/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["flash-sales"] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const sales = data?.data || [];
  const products = productsData?.data || [];

  function isActive(sale: any) {
    const now = Date.now();
    return sale.isActive && new Date(sale.startsAt).getTime() <= now && new Date(sale.endsAt).getTime() >= now;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Flash Sales</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Time-limited discounts with countdown banners to drive urgency.</p>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)]"
            style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
            <Zap size={14} /> New Flash Sale
          </button>
        </div>

        <div className="space-y-3">
          {sales.length === 0 ? (
            <div className={`rounded-3xl border p-16 text-center ${card}`}>
              <Zap size={40} className="mx-auto mb-3 opacity-20 text-amber-700 dark:text-amber-400" />
              <p className={`text-sm ${sub}`}>No flash sales yet. Create one to boost conversions.</p>
            </div>
          ) : sales.map((s: any) => {
            const active = isActive(s);
            const endsAt = new Date(s.endsAt);
            const now = new Date();
            const minsLeft = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 60000));
            return (
              <div key={s.id} className={`rounded-2xl border p-4 ${card} flex items-center gap-4`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: active ? "linear-gradient(135deg,#f59e0b,#d97706)" : "var(--bg-card)" }}>
                  <Zap size={16} className={active ? "text-black" : sub} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm ${tx}`}>{s.name}</div>
                  <div className={`text-xs ${sub}`}>
                    {s.discountPct}% off · {s.productIds.length} product(s)
                    · {new Date(s.startsAt).toLocaleString()} → {new Date(s.endsAt).toLocaleString()}
                  </div>
                  {s.bannerText && <div className={`text-xs italic ${sub} mt-0.5`}>"{s.bannerText}"</div>}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : endsAt < now ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}>
                    {active ? (minsLeft < 60 ? `${minsLeft}m left` : "LIVE") : endsAt < now ? "Ended" : "Scheduled"}
                  </span>
                </div>
                <button onClick={() => deleteMut.mutate(s.id)} className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100/80 dark:bg-red-900/20">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl border shadow-2xl max-h-[90vh] overflow-y-auto [background:var(--bg-secondary)] [border-color:var(--border)]">
            <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
              <h2 className={`font-black text-lg ${tx}`}>Create Flash Sale</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:[background:var(--bg-card)]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Sale Name", key: "name", type: "text", placeholder: "e.g. Weekend Blowout 🔥" },
                { label: "Discount %", key: "discountPct", type: "number", placeholder: "20" },
                { label: "Starts At", key: "startsAt", type: "datetime-local" },
                { label: "Ends At", key: "endsAt", type: "datetime-local" },
                { label: "Banner Text (optional)", key: "bannerText", type: "text", placeholder: "Limited time — ends tonight!" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className={`block text-xs font-semibold ${sub} mb-1.5`}>{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`} placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-2`}>Apply to Products</label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {products.map((p: any) => (
                    <label key={p.id} className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer hover:[background:var(--bg-card)]`}>
                      <input type="checkbox" className="accent-violet-500"
                        checked={form.productIds.split(",").includes(p.id)}
                        onChange={e => {
                          const ids = form.productIds ? form.productIds.split(",").filter(Boolean) : [];
                          setForm(f => ({ ...f, productIds: e.target.checked ? [...ids, p.id].join(",") : ids.filter(i => i !== p.id).join(",") }));
                        }} />
                      <span className={`text-xs ${tx}`}>{p.name} <span className={sub}>· ${p.price}</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={() => {
                const productIds = form.productIds.split(",").filter(Boolean);
                if (!productIds.length) return toast.error("Select at least 1 product");
                createMut.mutate({ ...form, discountPct: Number(form.discountPct), productIds });
              }} disabled={createMut.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold text-black disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                {createMut.isPending ? "Creating…" : "Launch Flash Sale ⚡"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
