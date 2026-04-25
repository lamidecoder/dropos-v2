"use client";
﻿"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import {
  Truck, Plus, X, Trash2, ChevronUp, ChevronDown,
  CheckCircle, AlertCircle, Package, Search, ArrowRightLeft,
  Star, ToggleLeft, ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";

const tx   = "[color:var(--text-primary)]";
const sub  = "text-secondary";
const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
const inp  = "[background:var(--bg-card)] [border-color:var(--border)] [color:var(--text-primary)] border rounded-xl px-3 py-2.5 text-sm outline-none w-full focus:[border-color:var(--accent)] transition-colors";

const STOCK_COLORS: Record<string, string> = {
  IN_STOCK:    "text-emerald-400",
  LOW_STOCK:   "text-amber-400",
  OUT_OF_STOCK:"text-red-400",
};

export default function SupplierAssignmentPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const qc      = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchProd, setSearchProd]   = useState("");
  const [assignForm, setAssignForm]   = useState({
    supplierId: "", supplierSku: "", supplierPrice: "", supplierUrl: "", priority: "1", notes: "",
  });
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data: productsData } = useQuery({
    queryKey: ["products", storeId, searchProd],
    queryFn:  () => api.get(`/products/${storeId}?limit=50&search=${searchProd}`).then(r => r.data),
    enabled:  !!storeId,
  });

  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers", storeId],
    queryFn:  () => api.get(`/suppliers/${storeId}`).then(r => r.data),
    enabled:  !!storeId,
  });

  const { data: assignmentsData, refetch: refetchAssignments } = useQuery({
    queryKey: ["supplier-assignments", selectedProduct?.id],
    queryFn:  () => api.get(`/suppliers/${storeId}/products/${selectedProduct.id}/suppliers`).then(r => r.data),
    enabled:  !!storeId && !!selectedProduct?.id,
  });

  const assignMut = useMutation({
    mutationFn: (d: any) => api.post(`/suppliers/${storeId}/products/${selectedProduct.id}/suppliers`, d),
    onSuccess: () => {
      toast.success("Supplier assigned");
      qc.invalidateQueries({ queryKey: ["supplier-assignments", selectedProduct?.id] });
      setShowAssignModal(false);
      setAssignForm({ supplierId: "", supplierSku: "", supplierPrice: "", supplierUrl: "", priority: "1", notes: "" });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to assign"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/suppliers/${storeId}/supplier-products/${id}`, data),
    onSuccess: () => { toast.success("Updated"); refetchAssignments(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${storeId}/supplier-products/${id}`),
    onSuccess: () => { toast.success("Supplier removed"); refetchAssignments(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const products    = productsData?.data || [];
  const suppliers   = suppliersData?.data || [];
  const assignments: any[] = (assignmentsData?.data || []).sort((a: any, b: any) => a.priority - b.priority);

  const movePriority = (item: any, direction: "up" | "down") => {
    const newPriority = direction === "up" ? item.priority - 1 : item.priority + 1;
    updateMut.mutate({ id: item.id, data: { priority: Math.max(1, newPriority) } });
  };

  return (
    
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Supplier Assignment</h1>
          <p className={`text-sm mt-1 ${sub}`}>Assign multiple suppliers per product with fallback priority ordering</p>
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* Product list */}
          <div className="col-span-2 space-y-3">
            <div className={`rounded-2xl border ${card} overflow-hidden`}>
              <div className="p-3 border-b [border-color:var(--border)]">
                <div className="relative">
                  <Search size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${sub}`} />
                  <input value={searchProd} onChange={e => setSearchProd(e.target.value)}
                    className={inp + " !pl-8 !py-2 text-xs"} placeholder="Search products…" />
                </div>
              </div>
              <div className="max-h-[480px] overflow-y-auto divide-y [divide-color:var(--border)]">
                {products.length === 0 && (
                  <div className={`p-8 text-center text-xs ${sub}`}>No products found</div>
                )}
                {products.map((p: any) => (
                  <button key={p.id} onClick={() => setSelectedProduct(p)}
                    className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:[background:var(--bg-card)] ${selectedProduct?.id === p.id ? "[background:var(--bg-card)] [border-left:2px_solid_var(--accent)]" : ""}`}>
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 [background:var(--bg-card)] flex items-center justify-center">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <Package size={14} className={sub} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${tx}`}>{p.name}</p>
                      <p className={`text-[10px] ${sub}`}>${p.price.toFixed(2)}</p>
                    </div>
                    {selectedProduct?.id === p.id && <CheckCircle size={12} className="text-[var(--accent)] flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Supplier assignments */}
          <div className="col-span-3 space-y-3">
            {!selectedProduct ? (
              <div className={`rounded-2xl border ${card} p-16 text-center`}>
                <ArrowRightLeft size={32} className="mx-auto mb-3 opacity-20" />
                <p className={`text-sm font-bold ${tx}`}>Select a product</p>
                <p className={`text-xs ${sub} mt-1`}>Choose a product to manage its suppliers and fallback order</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-black text-sm ${tx}`}>{selectedProduct.name}</p>
                    <p className={`text-xs ${sub}`}>{assignments.length} supplier{assignments.length !== 1 ? "s" : ""} assigned</p>
                  </div>
                  <button onClick={() => setShowAssignModal(true)} disabled={suppliers.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-primary)] disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                    <Plus size={12} /> Assign Supplier
                  </button>
                </div>

                {/* Priority tip */}
                {assignments.length > 1 && (
                  <div className={`rounded-xl p-3 flex items-center gap-2 text-xs ${sub}`}
                    style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <Star size={12} className="[color:var(--accent)]" />
                    Priority 1 is used first. When out of stock, DropOS falls back to priority 2, then 3, etc.
                  </div>
                )}

                {assignments.length === 0 ? (
                  <div className={`rounded-2xl border ${card} p-12 text-center`}>
                    <Truck size={28} className="mx-auto mb-3 opacity-20" />
                    <p className={`text-sm font-bold ${tx} mb-1`}>No suppliers yet</p>
                    <p className={`text-xs ${sub}`}>Assign at least one supplier to fulfill orders</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignments.map((a: any, idx: number) => (
                      <div key={a.id} className={`rounded-2xl border p-4 ${card} transition-all`}>
                        <div className="flex items-start gap-3">
                          {/* Priority badge + controls */}
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-primary)] text-xs font-black"
                              style={{ background: idx === 0 ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "var(--bg-card)", color: idx === 0 ? "white" : "var(--text-secondary)" }}>
                              {a.priority}
                            </div>
                            <button onClick={() => movePriority(a, "up")} disabled={idx === 0}
                              className={`p-0.5 rounded ${sub} hover:[color:var(--text-primary)] disabled:opacity-20`}>
                              <ChevronUp size={12} />
                            </button>
                            <button onClick={() => movePriority(a, "down")} disabled={idx === assignments.length - 1}
                              className={`p-0.5 rounded ${sub} hover:[color:var(--text-primary)] disabled:opacity-20`}>
                              <ChevronDown size={12} />
                            </button>
                          </div>

                          {/* Supplier info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-bold text-sm ${tx}`}>{a.supplier?.name}</p>
                              {idx === 0 && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-[var(--text-primary)]" style={{ background: "#7c3aed" }}>Primary</span>}
                              {a.stockStatus && (
                                <span className={`text-[10px] font-semibold ${STOCK_COLORS[a.stockStatus] || sub}`}>
                                  {a.stockStatus.replace("_", " ")}
                                </span>
                              )}
                            </div>
                            <div className={`flex flex-wrap gap-3 text-xs ${sub}`}>
                              {a.supplierSku   && <span>SKU: <span className={`font-mono ${tx}`}>{a.supplierSku}</span></span>}
                              {a.supplierPrice && <span>Cost: <span className="font-bold text-emerald-400">${a.supplierPrice}</span></span>}
                              {a.processingDays && <span>{a.processingDays}d processing</span>}
                              {a.shippingDays   && <span>{a.shippingDays}d shipping</span>}
                            </div>
                            {a.notes && <p className={`text-xs ${sub} mt-1 italic`}>{a.notes}</p>}
                          </div>

                          {/* Toggle active + delete */}
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateMut.mutate({ id: a.id, data: { isActive: !a.isActive } })}
                              className={`transition-colors text-sm ${a.isActive ? "text-emerald-400" : sub}`}
                              title={a.isActive ? "Active - click to disable" : "Inactive - click to enable"}>
                              {a.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            </button>
                            <button onClick={() => { if (confirm("Remove supplier?")) removeMut.mutate(a.id); }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 dark:bg-red-900/20 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Assign modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="rounded-3xl p-6 w-full max-w-md [background:var(--bg-primary)] border [border-color:var(--border)] shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className={`font-black ${tx}`}>Assign Supplier</h3>
                <button onClick={() => setShowAssignModal(false)} className="p-1.5 rounded-lg hover:[background:var(--bg-card)]">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Supplier *</label>
                  <select value={assignForm.supplierId} onChange={e => setAssignForm(f => ({ ...f, supplierId: e.target.value }))}
                    className={inp}>
                    <option value="">Select supplier…</option>
                    {suppliers.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Supplier SKU</label>
                    <input value={assignForm.supplierSku} onChange={e => setAssignForm(f => ({ ...f, supplierSku: e.target.value }))}
                      className={inp} placeholder="ALI-12345" />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Cost Price ($)</label>
                    <input type="number" step="0.01" value={assignForm.supplierPrice} onChange={e => setAssignForm(f => ({ ...f, supplierPrice: e.target.value }))}
                      className={inp} placeholder="12.50" />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Priority</label>
                  <input type="number" min="1" value={assignForm.priority} onChange={e => setAssignForm(f => ({ ...f, priority: e.target.value }))}
                    className={inp} placeholder="1" />
                  <p className={`text-xs ${sub} mt-1`}>1 = primary (used first), 2+ = fallback</p>
                </div>
                <div>
                  <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Supplier URL</label>
                  <input value={assignForm.supplierUrl} onChange={e => setAssignForm(f => ({ ...f, supplierUrl: e.target.value }))}
                    className={inp} placeholder="https://aliexpress.com/item/…" />
                </div>
                <div>
                  <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Notes (optional)</label>
                  <input value={assignForm.notes} onChange={e => setAssignForm(f => ({ ...f, notes: e.target.value }))}
                    className={inp} placeholder="Fast ship, use for electronics only…" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => assignMut.mutate({
                  supplierId:    assignForm.supplierId,
                  supplierSku:   assignForm.supplierSku || undefined,
                  supplierPrice: assignForm.supplierPrice ? Number(assignForm.supplierPrice) : undefined,
                  supplierUrl:   assignForm.supplierUrl || undefined,
                  priority:      Number(assignForm.priority) || 1,
                  notes:         assignForm.notes || undefined,
                })} disabled={!assignForm.supplierId || assignMut.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {assignMut.isPending ? "Assigning…" : "Assign Supplier"}
                </button>
                <button onClick={() => setShowAssignModal(false)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold border ${card} ${sub}`}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
}
