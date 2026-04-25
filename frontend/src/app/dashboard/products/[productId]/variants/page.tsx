"use client";
﻿"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, productAPI } from "../../../../../lib/api";
import { useAuthStore } from "../../../../../store/auth.store";
import {
  Plus, Trash2, Edit2, X, Save, ArrowLeft, Package,
  Tag, Layers, ChevronRight, AlertCircle, CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const tx  = "[color:var(--text-primary)]";
const sub = "text-secondary";
const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
const inp  = "[background:var(--bg-card)] [border-color:var(--border)] [color:var(--text-primary)] border rounded-xl px-3 py-2.5 text-sm outline-none w-full focus:[border-color:var(--accent)] transition-colors";

interface Variant {
  id: string;
  name: string;
  value: string;
  price: number | null;
  inventory: number;
  sku: string | null;
  image: string | null;
}

const BLANK = { name: "", value: "", price: "", inventory: "0", sku: "", image: "" };

// Group variants by their "name" field (Size, Color, etc.)
function groupVariants(variants: Variant[]) {
  return variants.reduce((acc: Record<string, Variant[]>, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});
}

export default function ProductVariantsPage() {
  const { storeId: storeParam, productId } = useParams<{ storeId: string; productId: string }>();
  const user    = useAuthStore(s => s.user);
  const storeId = storeParam || user?.stores?.[0]?.id;
  const qc      = useQueryClient();
  const router  = useRouter();

  const [creating, setCreating] = useState(false);
  const [editing,  setEditing]  = useState<Variant | null>(null);
  const [form,     setForm]     = useState(BLANK);
  // Quick-add many variants at once
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkName, setBulkName] = useState("Size");
  const [bulkValues, setBulkValues] = useState("XS,S,M,L,XL,XXL");

  const { data: product } = useQuery({
    queryKey: ["product", storeId, productId],
    queryFn:  () => productAPI.get(storeId!, productId!).then(r => r.data.data),
    enabled:  !!storeId && !!productId,
  });

  const { data: variantsData, isLoading } = useQuery({
    queryKey: ["variants", productId],
    queryFn:  () => api.get(`/products/${storeId}/${productId}/variants`).then(r => r.data),
    enabled:  !!storeId && !!productId,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post(`/products/${storeId}/${productId}/variants`, d),
    onSuccess: () => {
      toast.success("Variant added");
      qc.invalidateQueries({ queryKey: ["variants", productId] });
      setForm(BLANK);
      setCreating(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/products/${storeId}/${productId}/variants/${id}`, data),
    onSuccess: () => {
      toast.success("Variant updated");
      qc.invalidateQueries({ queryKey: ["variants", productId] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${storeId}/${productId}/variants/${id}`),
    onSuccess: () => {
      toast.success("Variant deleted");
      qc.invalidateQueries({ queryKey: ["variants", productId] });
    },
  });

  const bulkCreateMut = useMutation({
    mutationFn: async () => {
      const values = bulkValues.split(",").map(v => v.trim()).filter(Boolean);
      const promises = values.map(v =>
        api.post(`/products/${storeId}/${productId}/variants`, {
          name: bulkName, value: v, inventory: 0,
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Variants created!");
      qc.invalidateQueries({ queryKey: ["variants", productId] });
      setBulkMode(false);
    },
    onError: () => toast.error("Some variants failed to create"),
  });

  const variants: Variant[] = variantsData?.data || [];
  const grouped = groupVariants(variants);
  const totalStock = variants.reduce((s, v) => s + v.inventory, 0);

  const handleSave = () => {
    const payload = {
      name: form.name,
      value: form.value,
      price: form.price ? Number(form.price) : null,
      inventory: Number(form.inventory) || 0,
      sku: form.sku || null,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const startEdit = (v: Variant) => {
    setEditing(v);
    setForm({ name: v.name, value: v.value, price: v.price?.toString() || "", inventory: v.inventory.toString(), sku: v.sku || "", image: v.image || "" });
    setCreating(true);
  };

  return (
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => router.back()} className={`flex items-center gap-1 text-xs ${sub} mb-2 hover:[color:var(--accent)] transition-colors`}>
              <ArrowLeft size={12} /> Back to Products
            </button>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>
              Product Variants
            </h1>
            {product && (
              <p className={`text-sm mt-1 ${sub} flex items-center gap-1.5`}>
                <Package size={12} /> {product.name} · ${product.price}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setBulkMode(true); setCreating(false); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border ${card} ${sub} hover:[color:var(--text-primary)] transition-colors`}>
              <Layers size={14} /> Bulk Add
            </button>
            <button onClick={() => { setCreating(true); setBulkMode(false); setEditing(null); setForm(BLANK); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Plus size={14} /> Add Variant
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className={`rounded-2xl border p-4 ${card} flex gap-6`}>
          <div>
            <p className={`text-xs font-semibold ${sub}`}>Total Variants</p>
            <p className={`text-2xl font-black [color:var(--accent)]`}>{variants.length}</p>
          </div>
          <div className="w-px [background:var(--border)]" />
          <div>
            <p className={`text-xs font-semibold ${sub}`}>Total Stock</p>
            <p className={`text-2xl font-black ${tx}`}>{totalStock}</p>
          </div>
          <div className="w-px [background:var(--border)]" />
          <div>
            <p className={`text-xs font-semibold ${sub}`}>Option Groups</p>
            <p className={`text-2xl font-black ${tx}`}>{Object.keys(grouped).length}</p>
          </div>
          {variants.some(v => v.inventory === 0) && (
            <>
              <div className="w-px [background:var(--border)]" />
              <div>
                <p className={`text-xs font-semibold text-amber-500`}>Out of Stock</p>
                <p className="text-2xl font-black text-amber-400">{variants.filter(v => v.inventory === 0).length}</p>
              </div>
            </>
          )}
        </div>

        {/* Bulk add panel */}
        {bulkMode && (
          <div className={`rounded-2xl border p-5 ${card}`} style={{ borderColor: "rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.04)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${tx}`}>Bulk Add Variants</h3>
              <button onClick={() => setBulkMode(false)} className="p-1.5 rounded-lg hover:[background:var(--bg-card)]"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Option Name</label>
                <input value={bulkName} onChange={e => setBulkName(e.target.value)}
                  className={inp} placeholder="Size, Color, Material…" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Values (comma separated)</label>
                <input value={bulkValues} onChange={e => setBulkValues(e.target.value)}
                  className={inp} placeholder="XS, S, M, L, XL" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {bulkValues.split(",").map(v => v.trim()).filter(Boolean).map(v => (
                <span key={v} className="text-xs px-2 py-0.5 rounded-full font-semibold [background:rgba(124,58,237,0.1)] [color:var(--accent)]">{v}</span>
              ))}
            </div>
            <button onClick={() => bulkCreateMut.mutate()} disabled={!bulkName || !bulkValues || bulkCreateMut.isPending}
              className="px-5 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              {bulkCreateMut.isPending ? "Creating…" : `Create ${bulkValues.split(",").filter(v => v.trim()).length} Variants`}
            </button>
          </div>
        )}

        {/* Add/Edit form */}
        {creating && (
          <div className={`rounded-2xl border p-5 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${tx}`}>{editing ? "Edit Variant" : "New Variant"}</h3>
              <button onClick={() => { setCreating(false); setEditing(null); }} className="p-1.5 rounded-lg hover:[background:var(--bg-card)]"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Option Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inp} placeholder="Size, Color, Material…" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Value *</label>
                <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  className={inp} placeholder="Large, Red, Cotton…" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Price Override (optional)</label>
                <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className={inp} placeholder={`${product?.price || "0.00"}`} />
                <p className={`text-xs ${sub} mt-1`}>Leave blank to use product price</p>
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Stock Quantity *</label>
                <input type="number" min="0" value={form.inventory} onChange={e => setForm(f => ({ ...f, inventory: e.target.value }))}
                  className={inp} placeholder="0" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>SKU (optional)</label>
                <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  className={inp} placeholder="SHIRT-RED-L" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={!form.name || !form.value || createMut.isPending || updateMut.isPending}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                <Save size={14} /> {editing ? "Save Changes" : "Add Variant"}
              </button>
              <button onClick={() => { setCreating(false); setEditing(null); }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold border ${card} ${sub}`}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Variants grouped by option name */}
        {isLoading ? (
          <div className="py-16 text-center text-secondary">Loading variants…</div>
        ) : variants.length === 0 ? (
          <div className={`rounded-3xl border p-16 text-center ${card}`}>
            <Tag size={40} className="mx-auto mb-3 opacity-20" />
            <p className={`font-bold ${tx} mb-1`}>No variants yet</p>
            <p className={`text-sm ${sub} mb-5`}>Add Size, Color, or any option to let customers choose.</p>
            <button onClick={() => { setCreating(true); setBulkMode(false); setForm(BLANK); }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Plus size={14} className="inline mr-1.5" />Add First Variant
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([groupName, groupVariants]) => (
              <div key={groupName} className={`rounded-2xl border overflow-hidden ${card}`}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b [border-color:var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                      <Layers size={12} className="text-[var(--text-primary)]" />
                    </div>
                    <span className={`font-black text-sm ${tx}`}>{groupName}</span>
                    <span className={`text-xs ${sub}`}>({groupVariants.length} options)</span>
                  </div>
                  <span className={`text-xs ${sub}`}>
                    {groupVariants.reduce((s, v) => s + v.inventory, 0)} total stock
                  </span>
                </div>
                <div className="divide-y [divide-color:var(--border)]">
                  {groupVariants.map(v => (
                    <div key={v.id} className="flex items-center gap-4 px-5 py-3.5 hover:[background:var(--bg-card)] transition-colors group">
                      <div className="w-9 h-9 rounded-xl [background:var(--bg-card)] flex items-center justify-center flex-shrink-0">
                        <span className={`text-xs font-bold ${tx}`}>{v.value.slice(0,3).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${tx}`}>{v.value}</span>
                          {v.sku && <span className={`text-xs font-mono ${sub}`}>{v.sku}</span>}
                        </div>
                        <span className={`text-xs ${sub}`}>
                          {v.price != null ? `$${v.price.toFixed(2)}` : `$${product?.price?.toFixed(2)} (default)`}
                        </span>
                      </div>
                      {/* Stock badge */}
                      <div className={`text-center min-w-[60px]`}>
                        <div className={`text-sm font-black ${v.inventory === 0 ? "text-red-400" : v.inventory < 5 ? "text-amber-400" : tx}`}>
                          {v.inventory}
                        </div>
                        <div className={`text-[10px] font-semibold ${sub}`}>
                          {v.inventory === 0 ? "Out" : v.inventory < 5 ? "Low" : "In Stock"}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(v)}
                          className="p-2 rounded-xl [color:var(--accent)] hover:[background:var(--accent-dim)] transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => { if (confirm(`Delete "${v.value}"?`)) deleteMut.mutate(v.id); }}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-100 dark:bg-red-900/20 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tip */}
        {variants.length > 0 && (
          <div className={`rounded-2xl border p-4 ${card} flex items-start gap-3`}>
            <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className={`text-xs ${sub}`}>
              Variants are live on your storefront. Customers see option selectors on the product page.
              Price overrides apply only to specific variants - others use the base product price.
            </p>
          </div>
        )}
      </div>
  );
}
