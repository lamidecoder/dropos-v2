"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Plus, Edit2, Trash2, Globe, Mail, Package,
  Loader2, Link2, ToggleLeft, ToggleRight,
  ExternalLink, X, Zap, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const SUPPLIER_TYPES = [
  { value: "ALIEXPRESS", label: "AliExpress",  emoji: "🛍️" },
  { value: "MANUAL",     label: "Manual",      emoji: "✋" },
  { value: "WEBHOOK",    label: "Webhook API", emoji: "⚡" },
  { value: "CSV",        label: "CSV Import",  emoji: "📋" },
];

const FULFILLMENT_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Pending",   color: "[color:var(--accent)]  [background:var(--accent-dim)]" },
  SENT:      { label: "Sent",      color: "text-blue-400   bg-blue-400/10"  },
  CONFIRMED: { label: "Confirmed", color: "text-violet-400 bg-violet-400/10" },
  SHIPPED:   { label: "Shipped",   color: "text-teal-400   bg-teal-400/10"  },
  FAILED:    { label: "Failed",    color: "text-red-400    bg-red-400/10"   },
};

const emptyForm = {
  name: "", type: "ALIEXPRESS", websiteUrl: "", contactEmail: "",
  contactName: "", notes: "", autoFulfill: false,
  fulfillEmail: "", webhookUrl: "",
};

export default function SuppliersPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";

  const [modal,   setModal]   = useState<"create"|"edit"|null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form,    setForm]    = useState({ ...emptyForm });
  const [tab,     setTab]     = useState<"suppliers"|"linked"|"fulfillments">("suppliers");

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers", storeId],
    queryFn:  () => api.get(`/suppliers/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const { data: linkedProducts = [] } = useQuery({
    queryKey: ["supplier-products", storeId],
    queryFn:  () => api.get(`/suppliers/${storeId}/products/linked`).then(r => r.data.data),
    enabled:  !!storeId && tab === "linked",
  });

  const { data: fulfillments = [] } = useQuery({
    queryKey: ["fulfillments", storeId],
    queryFn:  () => api.get(`/suppliers/${storeId}/fulfillments`).then(r => r.data.data),
    enabled:  !!storeId && tab === "fulfillments",
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post(`/suppliers/${storeId}`, d),
    onSuccess:  () => { toast.success("Supplier added"); qc.invalidateQueries({ queryKey: ["suppliers"] }); setModal(null); },
    onError:    (e: any) => toast.error(e.response?.data?.message || "Failed to add supplier"),
  });

  const updateMut = useMutation({
    mutationFn: (d: any) => api.put(`/suppliers/${storeId}/${editing?.id}`, d),
    onSuccess:  () => { toast.success("Supplier updated"); qc.invalidateQueries({ queryKey: ["suppliers"] });
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")) setModal(null); },
    onError:    () => toast.error("Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${storeId}/${id}`),
    onSuccess:  () => { toast.success("Supplier removed"); qc.invalidateQueries({ queryKey: ["suppliers"] });
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")) },
    onError:    () => toast.error("Delete failed"),
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/suppliers/${storeId}/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  const openCreate = () => { setForm({ ...emptyForm }); setEditing(null); setModal("create"); };
  const openEdit   = (s: any) => {
    setForm({
      name: s.name, type: s.type, websiteUrl: s.websiteUrl || "",
      contactEmail: s.contactEmail || "", contactName: s.contactName || "",
      notes: s.notes || "", autoFulfill: s.autoFulfill,
      fulfillEmail: s.fulfillEmail || "", webhookUrl: s.webhookUrl || "",
    });
    setEditing(s);
    setModal("edit");
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error("Supplier name is required");
    modal === "create" ? createMut.mutate(form) : updateMut.mutate(form);
  };

  const f = (key: string) => (e: any) =>
    setForm(prev => ({ ...prev, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Suppliers</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Manage dropship suppliers and auto-fulfillment</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard/suppliers/import"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border [border-color:var(--border)] text-primary hover:[background:var(--bg-secondary)] transition-all">
              <Package size={14} /> Import Product
            </a>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              <Plus size={14} /> Add Supplier
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl [background:var(--bg-secondary)] border [border-color:var(--border)] w-fit">
          {(["suppliers","linked","fulfillments"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === t ? "[background:var(--bg-card)] text-[var(--text-primary)]" : "text-secondary hover:text-secondary"
              }`}>
              {t === "linked" ? "Linked Products" : t === "fulfillments" ? "Fulfillment Log" : "Suppliers"}
              {t === "suppliers" && suppliers.length > 0 && (
                <span className="ml-1.5 text-[10px] [background:var(--bg-card)] px-1.5 py-0.5 rounded-full">{suppliers.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Suppliers Tab */}
        {tab === "suppliers" && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3].map(i => <div key={i} className={`h-36 rounded-2xl border animate-pulse ${card}`} />)}
              </div>
            ) : suppliers.length === 0 ? (
              <div className={`rounded-2xl border p-16 text-center ${card}`}>
                <div className="text-5xl mb-4">🏭</div>
                <h3 className={`font-black text-lg mb-2 ${tx}`}>No suppliers yet</h3>
                <p className={`text-sm mb-6 max-w-sm mx-auto ${sub}`}>
                  Add your first supplier to start importing products and auto-fulfilling orders.
                </p>
                <button onClick={openCreate}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-black inline-flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                  <Plus size={14} /> Add Supplier
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suppliers.map((s: any) => {
                  const typeMeta = SUPPLIER_TYPES.find(t => t.value === s.type);
                  return (
                    <div key={s.id} className={`rounded-2xl border p-5 ${card}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl [background:var(--bg-card)]">
                            {typeMeta?.emoji ?? "📦"}
                          </div>
                          <div>
                            <h3 className={`font-black text-sm ${tx}`}>{s.name}</h3>
                            <span className={`text-[10px] font-bold ${sub}`}>{typeMeta?.label ?? s.type}</span>
                          </div>
                        </div>
                        <button onClick={() => toggleActiveMut.mutate({ id: s.id, isActive: !s.isActive })}
                          style={{ color: s.isActive ? "#10b981" : "var(--text-disabled)" }}>
                          {s.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        {s.contactEmail && (
                          <div className={`flex items-center gap-2 text-xs ${sub}`}>
                            <Mail size={11} /> {s.contactEmail}
                          </div>
                        )}
                        {s.websiteUrl && (
                          <div className={`flex items-center gap-2 text-xs ${sub}`}>
                            <Globe size={11} />
                            <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer"
                              className="hover:text-primary flex items-center gap-1">
                              {s.websiteUrl.replace(/^https?:\/\/(www\.)?/,"").slice(0,30)} <ExternalLink size={9} />
                            </a>
                          </div>
                        )}
                        {s.autoFulfill && (
                          <div className="flex items-center gap-2 text-xs [color:var(--accent)]">
                            <Zap size={11} /> Auto-fulfillment on
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${sub}`}>{s._count?.products ?? 0} products linked</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(s)}
                            className={`p-1.5 rounded-lg hover:[background:var(--bg-card)] transition-all ${sub} hover:text-[var(--text-primary)]`}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => { if(confirm("Remove supplier?")) deleteMut.mutate(s.id); }}
                            className={`p-1.5 rounded-lg hover:bg-red-500/10 transition-all ${sub} hover:text-red-400`}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Linked Products Tab */}
        {tab === "linked" && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            {linkedProducts.length === 0 ? (
              <div className="p-16 text-center">
                <Link2 size={32} className="mx-auto mb-3 text-tertiary" />
                <p className={`text-sm ${sub}`}>No products linked to suppliers yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b [border-color:var(--border)]">
                    {["Product","Supplier","Cost","Sell","Margin","Stock",""].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider ${sub}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linkedProducts.map((lp: any) => {
                    const margin = lp.product?.price && lp.supplierPrice
                      ? ((lp.product.price - lp.supplierPrice) / lp.product.price * 100).toFixed(0)
                      : null;
                    return (
                      <tr key={lp.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-card)]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {lp.product?.images?.[0]
                              ? <img src={lp.product.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover" />
                              : <div className="w-9 h-9 rounded-lg [background:var(--bg-card)] flex items-center justify-center"><Package size={13} className="text-tertiary" /></div>
                            }
                            <span className={`font-semibold text-xs ${tx} line-clamp-1 max-w-[140px]`}>{lp.product?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs text-violet-400 font-bold">{lp.supplier?.name}</span></td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold ${lp.supplierPrice ? tx : sub}`}>{lp.supplierPrice ? `$${lp.supplierPrice.toFixed(2)}` : "—"}</span></td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold ${tx}`}>${lp.product?.price?.toFixed(2)}</span></td>
                        <td className="px-4 py-3">
                          {margin !== null ? (
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${parseInt(margin) >= 50 ? "text-emerald-400 bg-emerald-400/10" : parseInt(margin) >= 20 ? "[color:var(--accent)] [background:var(--accent-dim)]" : "text-red-400 bg-red-400/10"}`}>{margin}%</span>
                          ) : <span className={sub}>—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lp.stockStatus === "IN_STOCK" ? "text-emerald-400 bg-emerald-400/10" : lp.stockStatus === "LOW_STOCK" ? "[color:var(--accent)] [background:var(--accent-dim)]" : "text-red-400 bg-red-400/10"}`}>
                            {lp.stockStatus?.replace("_"," ") ?? "Unknown"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {lp.supplierUrl && <a href={lp.supplierUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary"><ExternalLink size={13} /></a>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Fulfillment Log Tab */}
        {tab === "fulfillments" && (
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            {fulfillments.length === 0 ? (
              <div className="p-16 text-center">
                <Zap size={32} className="mx-auto mb-3 text-tertiary" />
                <p className={`text-sm ${sub}`}>No fulfillment events yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b [border-color:var(--border)]">
                    {["Order","Supplier","Method","Status","Sent At"].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider ${sub}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fulfillments.map((fu: any) => {
                    const st = FULFILLMENT_STATUS[fu.status] || FULFILLMENT_STATUS.PENDING;
                    return (
                      <tr key={fu.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-card)]">
                        <td className="px-4 py-3"><span className="text-xs font-bold text-violet-400">{fu.orderId?.slice(0,8)}…</span></td>
                        <td className="px-4 py-3"><span className={`text-xs ${tx}`}>{fu.supplier?.name}</span></td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full [background:var(--bg-card)] ${sub}`}>{fu.method || "MANUAL"}</span></td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span></td>
                        <td className="px-4 py-3"><span className={`text-xs ${sub}`}>{fu.sentAt ? new Date(fu.sentAt).toLocaleString() : "—"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-lg rounded-2xl border [border-color:var(--border)] overflow-hidden"
            style={{ background: "var(--bg-secondary)", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
              <h2 className={`font-black ${tx}`}>{modal === "create" ? "Add Supplier" : "Edit Supplier"}</h2>
              <button onClick={() => setModal(null)} className={sub}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 ${sub}`}>SUPPLIER TYPE</label>
                <div className="grid grid-cols-4 gap-2">
                  {SUPPLIER_TYPES.map(t => (
                    <button key={t.value} onClick={() => setForm(p => ({ ...p, type: t.value }))}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-[11px] font-bold"
                      style={{
                        borderColor: form.type === t.value ? "#f59e0b" : "var(--border)",
                        color:       form.type === t.value ? "#f59e0b" : "var(--text-tertiary)",
                        background:  form.type === t.value ? "rgba(245,158,11,0.06)" : "transparent",
                      }}>
                      <span className="text-lg">{t.emoji}</span>{t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${sub}`}>NAME *</label>
                <input value={form.name} onChange={f("name")} placeholder="My AliExpress Supplier" className={`border ${inp}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${sub}`}>WEBSITE</label>
                  <input value={form.websiteUrl} onChange={f("websiteUrl")} placeholder="https://aliexpress.com" className={`border ${inp}`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${sub}`}>CONTACT EMAIL</label>
                  <input value={form.contactEmail} onChange={f("contactEmail")} placeholder="supplier@email.com" className={`border ${inp}`} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border [border-color:var(--border)] bg-[var(--bg-card)]">
                <div>
                  <p className={`text-sm font-bold ${tx}`}>Auto-Fulfillment</p>
                  <p className={`text-xs mt-0.5 ${sub}`}>Notify supplier automatically when orders → Processing</p>
                </div>
                <button onClick={() => setForm(p => ({ ...p, autoFulfill: !p.autoFulfill }))}
                  style={{ color: form.autoFulfill ? "#f59e0b" : "var(--text-disabled)" }}>
                  {form.autoFulfill ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
              {form.autoFulfill && (
                <div className="space-y-3 p-4 rounded-xl border [border-color:var(--accent)]/20 [background:var(--accent-dim)]/5">
                  <p className="text-xs font-bold [color:var(--accent)]">FULFILLMENT METHOD</p>
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${sub}`}>SUPPLIER EMAIL</label>
                    <input value={form.fulfillEmail} onChange={f("fulfillEmail")} placeholder="orders@supplier.com" className={`border ${inp}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${sub}`}>WEBHOOK URL (optional)</label>
                    <input value={form.webhookUrl} onChange={f("webhookUrl")} placeholder="https://supplier.com/webhook" className={`border ${inp}`} />
                  </div>
                </div>
              )}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${sub}`}>NOTES</label>
                <textarea value={form.notes} onChange={f("notes")} rows={2} placeholder="Lead times, instructions…" className={`border ${inp} resize-none`} />
              </div>
            </div>
            <div className="px-6 py-4 border-t [border-color:var(--border)] flex gap-3">
              <button onClick={() => setModal(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border [border-color:var(--border)] ${sub}`}>Cancel</button>
              <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                {createMut.isPending || updateMut.isPending ? <Loader2 size={14} className="animate-spin inline" /> : modal === "create" ? "Add Supplier" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
