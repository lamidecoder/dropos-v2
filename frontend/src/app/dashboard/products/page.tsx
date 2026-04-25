"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Package, Plus, Search, Edit2, Trash2, Zap, Upload, X, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const V = { v500: "#6B35E8", v400: "#8B5CF6", v300: "#A78BFA", cyan: "#06B6D4" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)" },
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  ACTIVE:   { color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  DRAFT:    { color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  ARCHIVED: { color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
}

function ProductModal({ storeId, product, onClose, t, isDark }: any) {
  const qc = useQueryClient();
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || "", description: product?.description || "",
    price: product?.price?.toString() || "", comparePrice: product?.comparePrice?.toString() || "",
    inventory: product?.inventory?.toString() || "0", category: product?.category || "",
    status: product?.status || "ACTIVE",
  });

  const inp = { padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", color: t.text, fontSize: 13, outline: "none", width: "100%", fontFamily: "inherit" } as any;

  const mut = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, description: form.description, price: parseFloat(form.price), comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null, inventory: parseInt(form.inventory), category: form.category, status: form.status };
      if (isEdit) return api.put(`/products/${storeId}/${product.id}`, payload);
      return api.post(`/products/${storeId}`, payload);
    },
    onSuccess: () => { toast.success(isEdit ? "Product updated" : "Product created"); qc.invalidateQueries({ queryKey: ["products"] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: isDark ? "#181230" : "#fff", border: `1px solid ${t.border}`, maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${t.border}` }}>
          {/* Drag handle on mobile */}
          <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full" style={{ background: t.border }} />
          <h2 className="font-black text-base" style={{ color: t.text }}>{isEdit ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} style={{ color: t.muted }}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: t.muted }}>Product Name *</label>
            <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Hair Bundle" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: t.muted }}>Description</label>
            <textarea style={{ ...inp, resize: "none" } as any} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your product..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: t.muted }}>Price (₦) *</label>
              <input style={inp} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="25000" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: t.muted }}>Compare At (₦)</label>
              <input style={inp} type="number" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} placeholder="35000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: t.muted }}>Stock</label>
              <input style={inp} type="number" value={form.inventory} onChange={e => setForm(f => ({ ...f, inventory: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: t.muted }}>Category</label>
              <input style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Beauty" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: t.muted }}>Status</label>
            <select style={{ ...inp, cursor: "pointer" } as any} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="ACTIVE">Active - visible in store</option>
              <option value="DRAFT">Draft - hidden from store</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: `1px solid ${t.border}` }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ border: `1px solid ${t.border}`, color: t.muted }}>Cancel</button>
          <button onClick={() => mut.mutate()} disabled={!form.name || !form.price || mut.isPending}
            className="flex-[2] py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            {mut.isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProductsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? T.dark : T.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();

  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", storeId],
    queryFn: () => api.get(`/products/${storeId}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${storeId}/${id}`),
    onSuccess: () => { toast.success("Product deleted"); qc.invalidateQueries({ queryKey: ["products"] }); },
  });

  const products: any[] = data || [];
  const filtered = products.filter(p =>
    (!search || p.name?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === "All" ? true : filter === "Active" ? p.status === "ACTIVE" : filter === "Draft" ? p.status === "DRAFT" : p.inventory === 0)
  );

  const openAdd  = () => { setEditing(null); setShowModal(true); };
  const openEdit = (p: any) => { setEditing(p); setShowModal(true); };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: t.text }}>Products</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: t.muted }}>{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/dashboard/import">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ border: `1px solid ${t.border}`, color: t.muted }}>
              <Upload size={12} /> <span className="hidden sm:inline">Import</span>
            </button>
          </Link>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
            <Plus size={14} /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </motion.div>

      {/* Filters + search */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <Search size={12} style={{ color: t.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="bg-transparent border-none outline-none text-xs w-28 sm:w-40"
            style={{ color: t.text, fontFamily: "inherit" }} />
        </div>
        {["All", "Active", "Draft", "Out of Stock"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{ background: filter === f ? V.v500 : t.card, color: filter === f ? "#fff" : t.muted, border: `1px solid ${filter === f ? V.v500 : t.border}` }}>
            {f}
          </button>
        ))}
      </div>

      {/* Products - card grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: t.card }}>
              <div className="aspect-square" style={{ background: t.faint }} />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded-full w-3/4" style={{ background: t.faint }} />
                <div className="h-3 rounded-full w-1/2" style={{ background: t.faint }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
          style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <Package size={40} style={{ color: t.muted, opacity: 0.3, marginBottom: 16 }} />
          <h3 className="font-bold text-sm mb-2" style={{ color: t.text }}>{search ? "No products found" : "No products yet"}</h3>
          <p className="text-xs mb-5" style={{ color: t.muted, maxWidth: 280, lineHeight: 1.6 }}>
            {search ? "Try a different search" : "Add your first product or use KIRO to import products from AliExpress in seconds."}
          </p>
          <div className="flex gap-2">
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
              <Plus size={12} /> Add Product
            </button>
            <Link href="/dashboard/kiro">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold" style={{ border: `1px solid ${t.border}`, color: t.muted }}>
                <Zap size={12} /> Ask KIRO
              </button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((p, i) => {
            const st = STATUS_COLORS[p.status] || STATUS_COLORS.DRAFT;
            const img = p.images?.[0];
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="group rounded-2xl overflow-hidden flex flex-col"
                style={{ background: t.card, border: `1px solid ${t.border}` }}>
                {/* Image */}
                <div className="relative aspect-square overflow-hidden" style={{ background: t.faint }}>
                  {img
                    ? <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={28} style={{ color: t.muted, opacity: 0.4 }} /></div>
                  }
                  {/* Actions overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteMut.mutate(p.id)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: "rgba(239,68,68,0.5)" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{p.status}</span>
                </div>
                {/* Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-xs font-semibold line-clamp-2 flex-1 mb-2" style={{ color: t.text }}>{p.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black" style={{ color: t.text }}>{fmt(p.price)}</p>
                    <p className="text-[10px]" style={{ color: p.inventory === 0 ? "#EF4444" : t.muted }}>
                      {p.inventory === 0 ? "Out" : `${p.inventory} left`}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <ProductModal storeId={storeId} product={editing} onClose={() => { setShowModal(false); setEditing(null); }} t={t} isDark={isDark} />}
      </AnimatePresence>
    </div>
  );
}
