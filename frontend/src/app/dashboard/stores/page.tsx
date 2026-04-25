"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Store, Plus, ExternalLink, Edit2, Trash2, Globe, Zap, AlertCircle, Loader2, X, Check, Copy } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const V = { v500: "#6B35E8", v400: "#8B5CF6" };

function StoreModal({ store, onClose, t, isDark, onSuccess }: any) {
  const isEdit = !!store;
  const [form, setForm] = useState({
    name:        store?.name        || "",
    description: store?.description || "",
    slug:        store?.slug        || "",
    currency:    store?.currency    || "NGN",
    brandColor:  store?.brandColor  || "#6B35E8",
    theme:       store?.theme       || "classic",
  });

  const inp = { padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", color: t.text, fontSize: 13, outline: "none", width: "100%" } as any;

  const mut = useMutation({
    mutationFn: async () => {
      if (isEdit) return api.put(`/stores/${store.id}`, form);
      return api.post("/stores", form);
    },
    onSuccess: () => { toast.success(isEdit ? "Store updated" : "Store created!"); onSuccess(); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const THEMES = ["classic", "dark-luxe", "boutique", "minimal-pro", "bold", "neon"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: isDark ? "#181230" : "#fff", border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{isEdit ? "Edit Store" : "Create Store"}</h2>
          <button onClick={onClose} style={{ color: t.muted }}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.muted, display: "block", marginBottom: 6 }}>Store Name *</label>
            <input style={inp} value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: !isEdit ? e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") : f.slug })); }} placeholder="e.g. Amaka's Hair Store" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.muted, display: "block", marginBottom: 6 }}>Store URL Slug *</label>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <span style={{ padding: "10px 12px", borderRadius: "10px 0 0 10px", border: `1px solid ${t.border}`, borderRight: "none", background: isDark ? "rgba(255,255,255,0.02)" : "#f1f5f9", fontSize: 12, color: t.muted, whiteSpace: "nowrap" }}>droposhq.com/store/</span>
              <input style={{ ...inp, borderRadius: "0 10px 10px 0", borderLeft: "none" } as any} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} placeholder="my-store" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.muted, display: "block", marginBottom: 6 }}>Description</label>
            <textarea style={{ ...inp, resize: "none" } as any} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What do you sell?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.muted, display: "block", marginBottom: 6 }}>Currency</label>
              <select style={{ ...inp, cursor: "pointer" } as any} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="GHS">GHS (₵)</option>
                <option value="KES">KES (KSh)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.muted, display: "block", marginBottom: 6 }}>Brand Color</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="color" value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))}
                  style={{ width: 40, height: 38, borderRadius: 8, border: `1px solid ${t.border}`, background: "none", cursor: "pointer", padding: 2 }} />
                <input style={{ ...inp, flex: 1 } as any} value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} placeholder="#6B35E8" />
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.muted, display: "block", marginBottom: 8 }}>Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(th => (
                <button key={th} onClick={() => setForm(f => ({ ...f, theme: th }))} type="button"
                  style={{ padding: "8px 10px", borderRadius: 10, border: `1px solid ${form.theme === th ? V.v500 : t.border}`, background: form.theme === th ? `${V.v500}14` : "transparent", color: form.theme === th ? V.v400 : t.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                  {th.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: `1px solid ${t.border}` }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => mut.mutate()} disabled={mut.isPending || !form.name || !form.slug}
            style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${V.v500},#3D1C8A)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: (!form.name || !form.slug) ? 0.5 : 1 }}>
            {mut.isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={13} /> {isEdit ? "Save" : "Create Store"}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function StoresPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const qc = useQueryClient();
  const refreshUser = useAuthStore(s => s.refreshUser);

  const t = {
    card:   isDark ? "#181230"                : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.07)",
    text:   isDark ? "#fff"                   : "#0D0918",
    muted:  isDark ? "rgba(255,255,255,0.38)" : "rgba(13,9,24,0.45)",
  };

  const [modal, setModal] = useState<null | "create" | any>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-stores"],
    queryFn: () => api.get("/stores").then(r => r.data.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/stores/${id}`),
    onSuccess: () => { toast.success("Store deleted"); refetch(); },
    onError: () => toast.error("Failed to delete store"),
  });

  const stores: any[] = Array.isArray(data) ? data : [];

  const handleSuccess = () => { refetch(); refreshUser?.(); };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://droposhq.com/store/${slug}`);
    toast.success("Link copied!");
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>My Stores</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>{stores.length > 0 ? `${stores.length} store${stores.length !== 1 ? "s" : ""} active` : "Create your first store to start selling"}</p>
        </div>
        <button onClick={() => setModal("create")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${V.v500},#3D1C8A)`, color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 16px rgba(107,53,232,0.35)" }}>
          <Plus size={14} /> Create Store
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: 60, textAlign: "center" }}>
          <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto", color: V.v400, display: "block" }} />
          <p style={{ color: t.muted, fontSize: 13, marginTop: 12 }}>Loading stores…</p>
        </div>
      ) : error ? (
        <div style={{ padding: 60, textAlign: "center", borderRadius: 16, background: t.card, border: `1px solid ${t.border}` }}>
          <AlertCircle size={28} style={{ margin: "0 auto 10px", color: "#EF4444", display: "block" }} />
          <p style={{ color: t.text, fontWeight: 700 }}>Could not load stores</p>
          <p style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>Check your connection and try again</p>
        </div>
      ) : stores.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center", borderRadius: 16, background: t.card, border: `1px solid ${t.border}` }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Store size={32} color="#06B6D4" />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: t.text, marginBottom: 8 }}>No stores yet</h3>
          <p style={{ fontSize: 13, color: t.muted, marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
            Create your first store and you can start selling in under 60 seconds. KIRO will help you set it up.
          </p>
          <button onClick={() => setModal("create")}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${V.v500},#3D1C8A)`, color: "#fff", fontSize: 13, fontWeight: 700 }}>
            <Plus size={14} /> Create your first store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store: any, i: number) => (
            <motion.div key={store.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ borderRadius: 18, background: t.card, border: `1px solid ${t.border}`, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: `${store.brandColor || V.v500}18`, border: `1px solid ${store.brandColor || V.v500}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Store size={20} style={{ color: store.brandColor || V.v400 }} />
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => setModal(store)}
                      style={{ padding: 7, borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, cursor: "pointer", display: "flex" }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => { if (confirm(`Delete "${store.name}"? This cannot be undone.`)) deleteMut.mutate(store.id); }}
                      style={{ padding: 7, borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#EF4444", cursor: "pointer", display: "flex" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 4 }}>{store.name}</h3>
                {store.description && <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.5 }}>{store.description}</p>}
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2" style={{ padding: "12px 20px", gap: 12 }}>
                {[
                  { label: "Products", value: store._count?.products ?? store.productCount ?? "—" },
                  { label: "Orders", value: store._count?.orders ?? store.orderCount ?? "—" },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 11, color: t.muted }}>{s.label}</p>
                    <p style={{ fontSize: 18, fontWeight: 900, color: t.text }}>{s.value}</p>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div style={{ padding: "0 16px 16px", display: "flex", gap: 8 }}>
                <Link href={`/store/${store.slug}`} target="_blank"
                  className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                  style={{ border: `1px solid ${t.border}`, color: t.muted, background: "transparent" }}>
                  <ExternalLink size={12} /> View Store
                </Link>
                <button onClick={() => copyLink(store.slug)}
                  className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                  style={{ border: `1px solid ${store.brandColor || V.v500}40`, color: store.brandColor || V.v400, background: `${store.brandColor || V.v500}08` }}>
                  <Copy size={12} /> Copy Link
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <StoreModal
            store={modal === "create" ? null : modal}
            onClose={() => setModal(null)}
            t={t} isDark={isDark}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
