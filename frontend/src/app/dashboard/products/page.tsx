"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ImageUploader from "@/components/ui/ImageUploader";
import Link from "next/link";
import {
  Plus, Search, Edit2, Trash2, Package, X, Layers,
  ChevronLeft, ChevronRight, ImageIcon, Upload
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const schema = z.object({
  name:         z.string().min(2),
  price:        z.coerce.number().positive(),
  comparePrice: z.coerce.number().optional(),
  inventory:    z.coerce.number().int().min(0).default(0),
  category:     z.string().optional(),
  description:  z.string().optional(),
  status:       z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
  sku:          z.string().optional(),
  images:       z.array(z.string()).default([]),
});
type ProductForm = z.infer<typeof schema>;

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  ACTIVE:       { bg: "rgba(16,185,129,0.1)",  color: "#10b981" },
  DRAFT:        { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24" },
  OUT_OF_STOCK: { bg: "rgba(239,68,68,0.1)",   color: "#ef4444" },
  ARCHIVED:     { bg: "var(--bg-card)", color: "var(--text-tertiary)" },
};

const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";

export default function ProductsPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("");
  const [modal,   setModal]   = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", storeId, page, search, status],
    queryFn:  () => productAPI.getAll(storeId!, { page, limit: 15, search, status }).then(r => r.data),
    enabled:  !!storeId,
  });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(schema),
    values:   editing ? { ...editing, images: editing.images || [] } : { status: "DRAFT", images: [] },
  });

  const createMut = useMutation({
    mutationFn: (d: ProductForm) => productAPI.create(storeId!, d),
    onSuccess: () => { toast.success("Product created"); qc.invalidateQueries({ queryKey: ["products"] }); setModal(null); reset(); },
    onError:   (e: any) => toast.error(e.response?.data?.message || "Create failed"),
  });

  const updateMut = useMutation({
    mutationFn: (d: ProductForm) => productAPI.update(storeId!, editing.id, d),
    onSuccess: () => { toast.success("Product updated"); qc.invalidateQueries({ queryKey: ["products"] }); setModal(null); },
    onError:   (e: any) => toast.error(e.response?.data?.message || "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => productAPI.delete(storeId!, id),
    onSuccess: () => { toast.success("Product deleted"); qc.invalidateQueries({ queryKey: ["products"] }); },
    onError:   () => toast.error("Delete failed"),
  });

  const products   = data?.data || [];
  const pagination = data?.pagination;

  if (!storeId) return (
    <DashboardLayout>
      <div className="text-center py-20 text-secondary">Create a store first to manage products.</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Products</h1>
            <p className="text-secondary text-sm mt-0.5">{pagination?.total || 0} products in your store</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/products/import"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{ color: "rgba(201,168,76,0.7)", border: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.05)" }}>
              <Upload size={13} /> Import CSV
            </Link>
            <button
              onClick={() => { setEditing(null); reset({ status: "DRAFT", images: [] }); setModal("create"); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-black shadow-lg "
              style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-light))" }}>
              <Plus size={14} /> Add Product
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border flex-1 min-w-[200px]"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <Search size={13} className="text-tertiary flex-shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products…" className="bg-transparent outline-none flex-1 text-sm [color:var(--text-primary)] placeholder-[var(--text-disabled)] 25" />
            {search && <button onClick={() => setSearch("")}><X size={11} className="text-tertiary" /></button>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[["", "All"], ["ACTIVE", "Active"], ["DRAFT", "Draft"], ["ARCHIVED", "Archived"]].map(([v, l]) => (
              <button key={v} onClick={() => { setStatus(v); setPage(1); }}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={status === v
                  ? { background: "linear-gradient(135deg,var(--accent),var(--accent-light))", color: "black" }
                  : { background: "var(--bg-secondary)", color: "var(--text-tertiary)", border: "1px solid var(--border0.07)" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--bg-card)" }}>
                {["Product", "SKU", "Price", "Margin", "Stock", "Category", "Status", ""].map(h => (
                  <th key={h} className="text-left text-[11px] font-black uppercase tracking-widest px-5 py-3.5 text-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: "var(--bg-secondary)" }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 rounded-full animate-pulse [background:var(--bg-card)]" style={{ width: `${40 + (i+j) * 7 % 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : products.map((p: any) => {
                    const st = STATUS_BADGE[p.status] || STATUS_BADGE.DRAFT;
                    return (
                      <tr key={p.id} className="border-b group hover:bg-[var(--bg-card)] transition-colors" style={{ borderColor: "var(--bg-secondary)" }}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--bg-card)" }}>
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={13} className="text-tertiary" /></div>}
                            </div>
                            <div>
                              <div className="[color:var(--text-primary)] font-semibold text-xs leading-tight">{p.name}</div>
                              {p.description && <div className="text-tertiary text-[11px] truncate max-w-[140px] mt-0.5">{p.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-secondary">{p.sku || "—"}</td>
                        <td className="px-5 py-3.5 font-black [color:var(--text-primary)] text-xs">
                          ${p.price?.toFixed(2)}
                          {p.comparePrice && <span className="line-through text-[11px] text-tertiary ml-1.5">${p.comparePrice.toFixed(2)}</span>}
                        </td>
                        <td className="px-4 py-3.5 text-sm">
                          {p.costPrice && p.price ? (() => {
                            const m = ((p.price - p.costPrice) / p.price * 100);
                            return (
                              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${m >= 50 ? "bg-emerald-400/10 text-emerald-400" : m >= 25 ? "[background:var(--accent-dim)] [color:var(--accent)]" : "bg-red-400/10 text-red-400"}`}>
                                {m.toFixed(0)}%
                              </span>
                            );
                          })() : <span className="text-tertiary">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold ${p.inventory === 0 ? "text-red-400" : p.inventory < 10 ? "[color:var(--accent)]" : "text-secondary"}`}>
                            {p.inventory}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-secondary text-xs">{p.category || "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold"
                            style={{ background: st.bg, color: st.color }}>
                            <span className="w-1 h-1 rounded-full bg-current" />
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditing(p); setModal("edit"); }}
                              className="p-1.5 rounded-lg [color:var(--accent)] hover:[background:var(--accent-dim)] transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <Link href={`/dashboard/products/${p.id}/variants`}
                              className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-100 dark:bg-violet-900/20 transition-colors" title="Manage Variants">
                              <Layers size={13} />
                            </Link>
                            <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMut.mutate(p.id); }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
              {!isLoading && !products.length && (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Package size={36} className="mx-auto mb-3 text-tertiary" />
                  <p className="text-tertiary text-sm">No products yet</p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <button onClick={() => setModal("create")} className="text-xs font-bold [color:var(--accent)] hover:[color:var(--accent)]">+ Add manually</button>
                    <span className="text-tertiary text-xs">or</span>
                    <Link href="/dashboard/products/import" className="text-xs font-bold [color:var(--accent)] hover:[color:var(--accent)]">Import CSV</Link>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-tertiary text-xs">
              {((page-1)*15)+1}–{Math.min(page*15, pagination.total)} of {pagination.total} products
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="p-2 rounded-xl border [border-color:var(--border)] text-secondary hover:[background:var(--bg-secondary)] disabled:opacity-30 transition-all">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}
                className="p-2 rounded-xl border [border-color:var(--border)] text-secondary hover:[background:var(--bg-secondary)] disabled:opacity-30 transition-all">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-2xl rounded-3xl max-h-[90vh] flex flex-col"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--bg-card)" }}>
              <h2 className="font-black text-lg [color:var(--text-primary)]">{modal === "create" ? "Add Product" : "Edit Product"}</h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-xl text-secondary hover:[background:var(--bg-secondary)] transition-colors">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit(d => modal === "create" ? createMut.mutate(d) : updateMut.mutate(d))}
              className="overflow-y-auto flex-1 p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-2">Product Images</label>
                <Controller name="images" control={control}
                  render={({ field }) => <ImageUploader images={field.value || []} onChange={field.onChange} maxImages={8} />} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Name *</label>
                  <input {...register("name")} placeholder="e.g. Wireless Earbuds Pro" className={inp} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Price *</label>
                  <input {...register("price")} type="number" step="0.01" placeholder="0.00" className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Compare Price</label>
                  <input {...register("comparePrice")} type="number" step="0.01" placeholder="Original price" className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Inventory</label>
                  <input {...register("inventory")} type="number" placeholder="0" className={inp} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">SKU</label>
                  <input {...register("sku")} placeholder="WE-PRO-001" className={inp} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Category</label>
                  <input {...register("category")} placeholder="Electronics, Clothing, Home…" className={inp} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Description</label>
                <textarea {...register("description")} rows={3} placeholder="Describe your product…"
                  className={`${inp} resize-none`} />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-1.5">Status</label>
                <select {...register("status")} className={inp}>
                  <option value="DRAFT">Draft — not visible</option>
                  <option value="ACTIVE">Active — live in store</option>
                  <option value="ARCHIVED">Archived — hidden</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                  className="flex-1 py-3 rounded-xl text-sm font-black text-black disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-light))" }}>
                  {createMut.isPending || updateMut.isPending ? "Saving…" : modal === "create" ? "Create Product" : "Save Changes"}
                </button>
                <button type="button" onClick={() => setModal(null)}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-secondary border [border-color:var(--border)] hover:[background:var(--bg-secondary)] transition-all">
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
