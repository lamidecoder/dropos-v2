"use client";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Upload, Download, Link, FileText, Check, X, AlertCircle, Zap } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500: "#6B35E8", v400: "#8B5CF6", green: "#10B981" };
const T = {
  dark:  { card: "#181230", border: "rgba(255,255,255,0.06)", text: "#fff", muted: "rgba(255,255,255,0.38)", faint: "rgba(255,255,255,0.04)" },
  light: { card: "#fff",    border: "rgba(15,5,32,0.07)",    text: "#0D0918", muted: "rgba(13,9,24,0.45)", faint: "rgba(15,5,32,0.03)" },
};

export default function ImportPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? T.dark : T.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [tab, setTab] = useState<"url" | "csv" | "aliexpress">("url");
  const [url, setUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const importUrlMut = useMutation({
    mutationFn: () => api.post(`/products/${storeId}/import-url`, { url }),
    onSuccess: () => { toast.success("Product imported!"); setUrl(""); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Import failed - backend offline"),
  });

  const importCsvMut = useMutation({
    mutationFn: (file: File) => { const fd = new FormData(); fd.append("file", file); return api.post(`/products/${storeId}/import-csv`, fd, { headers: { "Content-Type": "multipart/form-data" } }); },
    onSuccess: (r: any) => toast.success(`Imported ${r.data?.data?.count || 0} products`),
    onError: (e: any) => toast.error(e.response?.data?.message || "CSV import failed"),
  });

  const handleFile = (f: File) => { if (f) importCsvMut.mutate(f); };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: t.text }}>Import Products</h1>
        <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Add products in bulk from any source</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: t.faint, border: `1px solid ${t.border}`, width: "fit-content" }}>
        {[["url", "Product URL"], ["csv", "CSV Upload"], ["aliexpress", "AliExpress"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: tab === id ? t.card : "transparent", color: tab === id ? t.text : t.muted, boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            {label}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6" style={{ background: t.card, border: `1px solid ${t.border}` }}>
        {tab === "url" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link size={16} style={{ color: V.v400 }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Import from URL</h3>
            </div>
            <p style={{ fontSize: 13, color: t.muted, marginBottom: 16, lineHeight: 1.6 }}>Paste a product URL from AliExpress, Amazon, Jumia, or any online store. KIRO will extract the product details automatically.</p>
            <div className="flex gap-3">
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://aliexpress.com/item/..." className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: t.faint, border: `1px solid ${t.border}`, color: t.text, fontFamily: "inherit" }} />
              <button onClick={() => importUrlMut.mutate()} disabled={!url || importUrlMut.isPending}
                className="px-4 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)`, whiteSpace: "nowrap" }}>
                <Upload size={14} /> {importUrlMut.isPending ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        )}

        {tab === "csv" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: V.v400 }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Upload CSV</h3>
              </div>
              <button className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl" style={{ border: `1px solid ${t.border}`, color: t.muted }}>
                <Download size={11} /> Download Template
              </button>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center py-16 rounded-2xl cursor-pointer transition-all"
              style={{ border: `2px dashed ${dragOver ? V.v400 : t.border}`, background: dragOver ? "rgba(107,53,232,0.05)" : "transparent" }}>
              <Upload size={28} style={{ color: dragOver ? V.v400 : t.muted, marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 4 }}>Drop your CSV here</p>
              <p style={{ fontSize: 12, color: t.muted }}>or click to browse · max 10MB</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
            {importCsvMut.isPending && <p className="text-xs text-center mt-3" style={{ color: V.v400 }}>Importing products...</p>}
          </div>
        )}

        {tab === "aliexpress" && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(107,53,232,0.1)", border: "1px solid rgba(107,53,232,0.2)" }}>
              <Zap size={24} color={V.v400} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 8 }}>KIRO AliExpress Integration</h3>
            <p style={{ fontSize: 13, color: t.muted, maxWidth: 360, margin: "0 auto 20px", lineHeight: 1.6 }}>Tell KIRO what niche or product category you want to sell. KIRO searches AliExpress, finds winning products by margin, and imports them directly into your store.</p>
            <a href="/dashboard/kiro" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${V.v500}, #3D1C8A)` }}>
              <Zap size={13} /> Ask KIRO to find products
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
