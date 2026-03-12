"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Globe, Search, Package, CheckCircle, Loader2, Plus, Minus,
  ChevronLeft, ChevronRight, ExternalLink, TrendingUp,
  Truck, Clock, AlertCircle, X, ShoppingBag, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const MARKUP_PRESETS = [
  { label: "2×",   multiplier: 2.0 },
  { label: "2.5×", multiplier: 2.5 },
  { label: "3×",   multiplier: 3.0 },
  { label: "4×",   multiplier: 4.0 },
  { label: "5×",   multiplier: 5.0 },
];

export default function ImportPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";

  const [url,         setUrl]         = useState("");
  const [scraped,     setScraped]     = useState<any>(null);
  const [imgIdx,      setImgIdx]      = useState(0);
  const [selectedImgs,setSelectedImgs]= useState<Set<number>>(new Set([0]));
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [price,       setPrice]       = useState(0);
  const [comparePrice,setComparePrice]= useState(0);
  const [inventory,   setInventory]   = useState(50);
  const [category,    setCategory]    = useState("");
  const [status,      setStatus]      = useState<"ACTIVE"|"DRAFT">("DRAFT");
  const [supplierId,  setSupplierId]  = useState("");
  const [markup,      setMarkup]      = useState(3.0);
  const [batchMode,   setBatchMode]   = useState(false);
  const [batchUrls,   setBatchUrls]   = useState("");
  const [batchResults,setBatchResults]= useState<any[]>([]);

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", storeId],
    queryFn:  () => api.get(`/suppliers/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const scrapeMut = useMutation({
    mutationFn: (u: string) => api.post(`/suppliers/${storeId}/import/url`, { url: u }).then(r => r.data.data),
    onSuccess: (data) => {
      setScraped(data);
      setName(data.title);
      setDescription(data.description || "");
      setImgIdx(0);
      setSelectedImgs(new Set(Array.from({ length: Math.min(data.images.length, 4) }, (_, i) => i)));
      const cost = data.price || 0;
      setPrice(parseFloat((cost * markup).toFixed(2)));
      setComparePrice(parseFloat((cost * markup * 1.3).toFixed(2)));
      setCategory(data.category || "");
      toast.success(`Scraped from ${data.supplierName ?? "supplier"}`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Could not scrape that URL"),
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const images = scraped?.images?.filter((_: any, i: number) => selectedImgs.has(i)) ?? [];
      return api.post(`/suppliers/${storeId}/import/save`, {
        supplierId: supplierId || undefined,
        name, description, price,
        comparePrice: comparePrice > price ? comparePrice : undefined,
        costPrice:        scraped?.price,
        images, category: category || undefined, inventory, status,
        supplierUrl:      scraped?.sourceUrl,
        supplierSku:      scraped?.sku,
        supplierPrice:    scraped?.price,
        supplierCurrency: scraped?.currency ?? "USD",
        processingDays:   scraped?.processingDays,
        shippingDays:     scraped?.shippingDays,
      });
    },
    onSuccess: () => {
      toast.success(`"${name}" added!`);
      qc.invalidateQueries({ queryKey: ["products"] });
      setScraped(null); setUrl("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Save failed"),
  });

  const batchMut = useMutation({
    mutationFn: () => {
      const urls = batchUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http")).slice(0, 10);
      return api.post(`/suppliers/${storeId}/import/url/batch`, { urls }).then(r => r.data.data);
    },
    onSuccess: (data: any[]) => {
      setBatchResults(data);
      toast.success(`Scraped ${data.filter(d => d.success).length}/${data.length} products`);
    },
    onError: () => toast.error("Batch scrape failed"),
  });

  const batchSaveMut = useMutation({
    mutationFn: async (items: any[]) => {
      let ok = 0;
      for (const item of items) {
        if (!item.success || !item.data) continue;
        const d = item.data;
        const cost = d.price || 0;
        try {
          await api.post(`/suppliers/${storeId}/import/save`, {
            supplierId: supplierId || undefined,
            name: d.title, description: d.description || "",
            price: parseFloat((cost * markup).toFixed(2)),
            comparePrice: parseFloat((cost * markup * 1.3).toFixed(2)),
            costPrice: cost, images: d.images.slice(0, 4),
            category: d.category || undefined, inventory: 50, status: "DRAFT",
            supplierUrl: d.sourceUrl, supplierSku: d.sku, supplierPrice: cost,
            supplierCurrency: d.currency ?? "USD",
          });
          ok++;
        } catch {}
      }
      return ok;
    },
    onSuccess: (ok) => {
      toast.success(`Imported ${ok} products as drafts`);
      qc.invalidateQueries({ queryKey: ["products"] });
      setBatchResults([]); setBatchUrls("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const applyMarkup = (m: number) => {
    setMarkup(m);
    if (scraped?.price) {
      setPrice(parseFloat((scraped.price * m).toFixed(2)));
      setComparePrice(parseFloat((scraped.price * m * 1.3).toFixed(2)));
    }
  };

  const margin = scraped?.price > 0
    ? Math.round(((price - scraped.price) / price) * 100)
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Import Products</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Paste any supplier URL — AliExpress, Alibaba, DHgate, and more</p>
          </div>
          <button onClick={() => { setBatchMode(b => !b); setScraped(null); setBatchResults([]); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              batchMode ? "border-violet-500 bg-violet-500/10 text-violet-300" : "[border-color:var(--border)] text-secondary hover:[background:var(--bg-secondary)]"
            }`}>
            <Package size={14} /> {batchMode ? "Single Import" : "Batch Import (up to 10)"}
          </button>
        </div>

        {!batchMode ? (
          <>
            {/* Single URL Input */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2.5 rounded-xl border px-4 py-3 [background:var(--bg-secondary)] [border-color:var(--border)] focus-within:border-violet-500 transition-all">
                  <Globe size={15} className={sub} />
                  <input value={url} onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && url && scrapeMut.mutate(url)}
                    placeholder="https://www.aliexpress.com/item/…  or any product URL"
                    className="flex-1 bg-transparent outline-none text-sm [color:var(--text-primary)] placeholder-[var(--text-disabled)]" />
                  {url && <button onClick={() => { setUrl(""); setScraped(null); }}><X size={13} className={sub} /></button>}
                </div>
                <button onClick={() => url && scrapeMut.mutate(url)}
                  disabled={!url || scrapeMut.isPending}
                  className="px-6 py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-40 transition-all hover:opacity-90 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {scrapeMut.isPending ? <><Loader2 size={14} className="animate-spin" /> Scraping…</> : <><Search size={14} /> Import</>}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`text-xs ${sub}`}>Works with:</span>
                {["AliExpress 🛒","Alibaba 🏭","DHgate 📦","Amazon 📫","SHEIN 👗","Temu 🛍️","Any og: site 🌐"].map(s => (
                  <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full [background:var(--bg-secondary)] border [border-color:var(--border)] ${sub}`}>{s}</span>
                ))}
              </div>
            </div>

            {/* Scraped product editor */}
            {scraped && (
              <div className={`rounded-2xl border ${card} overflow-hidden`}>
                <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-400" />
                    <span className={`font-black text-sm ${tx}`}>Edit & Import</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      from {scraped.supplierName}
                    </span>
                  </div>
                  <a href={scraped.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 text-xs ${sub} hover:text-[var(--text-primary)] transition-colors`}>
                    <ExternalLink size={11} /> Original
                  </a>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Images */}
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-2xl overflow-hidden [background:var(--bg-secondary)]">
                      {scraped.images[imgIdx]
                        ? <img src={scraped.images[imgIdx]} alt="" className="w-full h-full object-contain" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={40} className={sub} /></div>}
                      {scraped.images.length > 1 && <>
                        <button onClick={() => setImgIdx(i => Math.max(0, i-1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                          <ChevronLeft size={14} className="[color:var(--text-primary)]" />
                        </button>
                        <button onClick={() => setImgIdx(i => Math.min(scraped.images.length-1, i+1))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                          <ChevronRight size={14} className="[color:var(--text-primary)]" />
                        </button>
                      </>}
                    </div>

                    {scraped.images.length > 1 && (
                      <div>
                        <p className={`text-[10px] mb-2 ${sub}`}>Click to select images to import ({selectedImgs.size} selected)</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {scraped.images.map((img: string, i: number) => (
                            <div key={i} className="relative cursor-pointer"
                              onClick={() => {
                                setImgIdx(i);
                                setSelectedImgs(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
                              }}>
                              <img src={img} alt="" className={`w-12 h-12 rounded-lg object-cover border-2 transition-all ${imgIdx === i ? "border-violet-500" : "border-transparent"}`} />
                              {selectedImgs.has(i) && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                                  <CheckCircle size={9} className="[color:var(--text-primary)]" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {scraped.stockStatus && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scraped.stockStatus === "IN_STOCK" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {scraped.stockStatus.replace("_"," ")}
                        </span>
                      )}
                      {scraped.shippingDays && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border [border-color:var(--border)] ${sub}`}><Truck size={8} className="inline mr-0.5" />{scraped.shippingDays}d ship</span>}
                      {scraped.processingDays && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border [border-color:var(--border)] ${sub}`}><Clock size={8} className="inline mr-0.5" />{scraped.processingDays}d process</span>}
                      {scraped.sku && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border [border-color:var(--border)] ${sub}`}>SKU: {scraped.sku}</span>}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Product Name</label>
                      <input value={name} onChange={e => setName(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2.5 text-sm border ${inp}`} />
                    </div>

                    {/* Pricing */}
                    <div>
                      <label className={`block text-xs font-bold mb-2 ${sub}`}>Pricing & Markup</label>
                      <div className={`flex items-center justify-between p-3 rounded-xl mb-3 bg-[var(--bg-card)] border [border-color:var(--border)]`}>
                        <span className={`text-xs ${sub}`}>Supplier cost</span>
                        <span className={`text-sm font-black ${tx}`}>{scraped.currency === "USD" ? "$" : scraped.currency}{scraped.price?.toFixed(2) ?? "—"}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {MARKUP_PRESETS.map(({ label, multiplier }) => (
                          <button key={label} onClick={() => applyMarkup(multiplier)}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${markup === multiplier ? "border-violet-500 bg-violet-500/10 text-violet-300" : "[border-color:var(--border)] text-secondary hover:[border-color:var(--border-strong)]"}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Sale Price ($)</label>
                          <input type="number" step="0.01" min="0" value={price}
                            onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                            className={`w-full rounded-xl px-3 py-2.5 text-sm border ${inp}`} />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Compare At ($)</label>
                          <input type="number" step="0.01" min="0" value={comparePrice}
                            onChange={e => setComparePrice(parseFloat(e.target.value) || 0)}
                            className={`w-full rounded-xl px-3 py-2.5 text-sm border ${inp}`} />
                        </div>
                      </div>
                      {margin !== null && (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${margin >= 60 ? "text-emerald-400" : margin >= 40 ? "[color:var(--accent)]" : "text-red-400"}`}>
                          <TrendingUp size={11} /> {margin}% margin {margin >= 60 ? "· Excellent 🎯" : margin >= 40 ? "· Good" : "· Low — consider raising price"}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Category</label>
                        <input value={category} onChange={e => setCategory(e.target.value)}
                          className={`w-full rounded-xl px-3 py-2.5 text-sm border ${inp}`} placeholder="Electronics" />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Initial Stock</label>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setInventory(i => Math.max(0, i - 10))}
                            className={`w-9 h-9 rounded-xl border [border-color:var(--border)] flex items-center justify-center ${sub} hover:[background:var(--bg-secondary)]`}>
                            <Minus size={12} />
                          </button>
                          <input type="number" value={inventory} onChange={e => setInventory(parseInt(e.target.value) || 0)}
                            className={`flex-1 rounded-xl px-2 py-2 text-sm border text-center ${inp}`} />
                          <button onClick={() => setInventory(i => i + 10)}
                            className={`w-9 h-9 rounded-xl border [border-color:var(--border)] flex items-center justify-center ${sub} hover:[background:var(--bg-secondary)]`}>
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Link to Supplier</label>
                      <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2.5 text-sm border ${inp}`}>
                        <option value="">— None —</option>
                        {(suppliers as any[]).map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      {(["DRAFT","ACTIVE"] as const).map(s => (
                        <button key={s} onClick={() => setStatus(s)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${status === s
                            ? s === "ACTIVE" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-amber-500 bg-amber-500/10 [color:var(--accent)]"
                            : "[border-color:var(--border)] text-secondary"}`}>
                          {s === "ACTIVE" ? "✅ Publish" : "📝 Draft"}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Description</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)}
                        rows={3} className={`w-full rounded-xl px-3 py-2.5 text-sm border resize-none ${inp}`} />
                    </div>

                    <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !name || price <= 0}
                      className="w-full py-3.5 rounded-xl font-black [color:var(--text-primary)] text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}>
                      {saveMut.isPending ? <><Loader2 size={15} className="animate-spin" /> Adding…</> : <><ShoppingBag size={15} /> Add to Store</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!scraped && !scrapeMut.isPending && (
              <div className={`rounded-2xl border p-16 text-center ${card}`}>
                <div className="text-5xl mb-4">🔗</div>
                <h3 className={`font-black text-lg mb-2 ${tx}`}>Paste any product URL above</h3>
                <p className={`text-sm ${sub} max-w-sm mx-auto`}>We'll extract the title, images, and price. Set your markup and add to your store with one click.</p>
              </div>
            )}
          </>
        ) : (
          /* Batch mode */
          <div className="space-y-5">
            <div className={`rounded-2xl border p-5 ${card}`}>
              <label className={`block text-sm font-bold mb-3 ${tx}`}>Paste URLs — one per line (max 10)</label>
              <textarea value={batchUrls} onChange={e => setBatchUrls(e.target.value)} rows={8}
                className={`w-full rounded-xl px-4 py-3 text-sm border resize-none font-mono ${inp}`}
                placeholder={`https://www.aliexpress.com/item/…\nhttps://www.aliexpress.com/item/…\nhttps://www.dhgate.com/product/…`} />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${sub}`}>Markup:</span>
                  <div className="flex gap-1.5">
                    {MARKUP_PRESETS.map(({ label, multiplier }) => (
                      <button key={label} onClick={() => setMarkup(multiplier)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${markup === multiplier ? "border-violet-500 bg-violet-500/10 text-violet-300" : "[border-color:var(--border)] text-secondary"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => batchMut.mutate()} disabled={!batchUrls.trim() || batchMut.isPending}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-40 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {batchMut.isPending ? <><Loader2 size={13} className="animate-spin" /> Scraping…</> : <><Search size={13} /> Scrape All</>}
                </button>
              </div>
            </div>

            {batchResults.length > 0 && (
              <div className={`rounded-2xl border ${card} overflow-hidden`}>
                <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
                  <span className={`font-black text-sm ${tx}`}>
                    {batchResults.filter(r => r.success).length}/{batchResults.length} scraped
                  </span>
                  <button onClick={() => batchSaveMut.mutate(batchResults)} disabled={batchSaveMut.isPending}
                    className="px-4 py-2 rounded-xl text-xs font-bold [color:var(--text-primary)] disabled:opacity-40 flex items-center gap-1.5"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                    {batchSaveMut.isPending ? <><Loader2 size={12} className="animate-spin" /> Importing…</> : <>Import All as Draft</>}
                  </button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {batchResults.map((r, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      {r.success && r.data?.images?.[0]
                        ? <img src={r.data.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        : <div className="w-12 h-12 rounded-xl [background:var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                            {r.success ? <Package size={18} className={sub} /> : <AlertCircle size={18} className="text-red-400" />}
                          </div>}
                      <div className="flex-1 min-w-0">
                        {r.success
                          ? <>
                              <p className={`text-sm font-bold truncate ${tx}`}>{r.data.title}</p>
                              <p className={`text-xs ${sub}`}>
                                Cost: ${r.data.price?.toFixed(2) ?? "—"} · Sale: ${(r.data.price * markup).toFixed(2)}
                                {r.data.price > 0 && <span className="ml-1.5 text-emerald-400">{Math.round(((r.data.price*markup-r.data.price)/(r.data.price*markup))*100)}% margin</span>}
                              </p>
                            </>
                          : <><p className="text-sm font-bold text-red-400">Failed</p><p className={`text-xs truncate ${sub}`}>{r.url}</p></>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${r.success ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {r.success ? "Ready" : "Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
