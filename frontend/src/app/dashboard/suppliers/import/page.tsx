"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Link2, Search, ChevronRight, Package, ArrowLeft, Check,
  Image as ImageIcon, Tag, DollarSign, TrendingUp, Globe,
  Loader2, AlertCircle, ExternalLink, Trash2, Plus, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

type Step = "url" | "preview" | "saved";

interface ScrapedProduct {
  title:         string;
  description:   string;
  images:        string[];
  price:         number;
  comparePrice?: number;
  currency:      string;
  category?:     string;
  sku?:          string;
  variants:      any[];
  shippingDays?: number;
  processingDays?: number;
  stockStatus:   string;
  sourceUrl:     string;
  supplierName?: string;
}

const POPULAR_SOURCES = [
  { name: "AliExpress",  icon: "🛒", placeholder: "https://www.aliexpress.com/item/..." },
  { name: "Alibaba",     icon: "🏭", placeholder: "https://www.alibaba.com/product-detail/..." },
  { name: "DHgate",      icon: "📦", placeholder: "https://www.dhgate.com/product/..." },
  { name: "Amazon",      icon: "📫", placeholder: "https://www.amazon.com/dp/..." },
  { name: "Temu",        icon: "🎯", placeholder: "https://www.temu.com/..." },
  { name: "Any URL",     icon: "🌐", placeholder: "https://..." },
];

export default function ImportPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";

  const [step,        setStep]        = useState<Step>("url");
  const [url,         setUrl]         = useState("");
  const [scraped,     setScraped]     = useState<ScrapedProduct | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [savedProduct, setSavedProduct] = useState<any>(null);

  // Editable product fields
  const [name,         setName]        = useState("");
  const [description,  setDescription] = useState("");
  const [price,        setPrice]       = useState(""); // selling price
  const [costPrice,    setCostPrice]   = useState(""); // what we pay supplier
  const [category,     setCategory]    = useState("");
  const [inventory,    setInventory]   = useState("50");
  const [status,       setStatus]      = useState<"ACTIVE"|"DRAFT">("DRAFT");
  const [supplierId,   setSupplierId]  = useState("");
  const [images,       setImages]      = useState<string[]>([]);

  // Suppliers for linking
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", storeId],
    queryFn:  () => api.get(`/suppliers/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  // Scrape mutation
  const scrapeMut = useMutation({
    mutationFn: (u: string) => api.post(`/suppliers/${storeId}/import/url`, { url: u }),
    onSuccess: (res) => {
      const p: ScrapedProduct = res.data.data;
      setScraped(p);
      setName(p.title);
      setDescription(p.description || "");
      setCostPrice(p.price ? p.price.toFixed(2) : "");
      // Auto-suggest 2.5x markup
      const suggested = p.price ? (p.price * 2.5).toFixed(2) : "";
      setPrice(suggested);
      setCategory(p.category || "");
      setImages(p.images.slice(0, 6));
      setSelectedImg(0);
      setStep("preview");
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "Could not fetch product. Try a different URL.");
    },
  });

  // Save mutation
  const saveMut = useMutation({
    mutationFn: () => api.post(`/suppliers/${storeId}/import/save`, {
      supplierId:       supplierId || undefined,
      name,
      description,
      price:            parseFloat(price) || 0,
      comparePrice:     scraped?.comparePrice,
      costPrice:        parseFloat(costPrice) || undefined,
      images,
      category:         category || undefined,
      inventory:        parseInt(inventory) || 50,
      status,
      supplierUrl:      scraped?.sourceUrl,
      supplierSku:      scraped?.sku,
      supplierPrice:    parseFloat(costPrice) || undefined,
      supplierCurrency: scraped?.currency || "USD",
      processingDays:   scraped?.processingDays,
      shippingDays:     scraped?.shippingDays,
    }),
    onSuccess: (res) => {
      setSavedProduct(res.data.data);
      setStep("saved");
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added to your store!");
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "Failed to save product");
    },
  });

  const margin = () => {
    const p = parseFloat(price);
    const c = parseFloat(costPrice);
    if (!p || !c || p <= 0) return null;
    return (((p - c) / p) * 100).toFixed(0);
  };
  const profit = () => {
    const p = parseFloat(price);
    const c = parseFloat(costPrice);
    if (!p || !c) return null;
    return (p - c).toFixed(2);
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (selectedImg >= next.length) setSelectedImg(Math.max(0, next.length - 1));
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/suppliers"
            className="w-9 h-9 rounded-xl flex items-center justify-center border [border-color:var(--border)] hover:[background:var(--bg-secondary)] transition-all">
            <ArrowLeft size={15} className={sub} />
          </Link>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Import Product</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Paste a supplier URL to import any product instantly</p>
          </div>
        </div>

        {/* ── STEP 1: URL INPUT ── */}
        {step === "url" && (
          <div className="space-y-6">
            {/* URL input */}
            <div className={`rounded-2xl border p-6 ${card}`}>
              <h2 className={`font-black mb-1 ${tx}`}>Product URL</h2>
              <p className={`text-sm mb-5 ${sub}`}>Paste any product URL — AliExpress, Alibaba, Amazon, DHgate, Temu, or any store.</p>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Globe size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${sub}`} />
                  <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && url && scrapeMut.mutate(url)}
                    placeholder="https://www.aliexpress.com/item/1234567890.html"
                    className={`${inp} pl-9`}
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => scrapeMut.mutate(url)}
                  disabled={!url || scrapeMut.isPending}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold [color:var(--text-primary)] flex items-center gap-2 disabled:opacity-50 transition-all hover:opacity-90 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                >
                  {scrapeMut.isPending
                    ? <><Loader2 size={14} className="animate-spin" /> Fetching…</>
                    : <><Search size={14} /> Fetch Product</>}
                </button>
              </div>

              {scrapeMut.isError && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle size={14} />
                  {(scrapeMut.error as any)?.response?.data?.message || "Could not fetch product. Try copying the URL directly from your browser."}
                </div>
              )}
            </div>

            {/* Popular sources */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-4 ${sub}`}>POPULAR SOURCES</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {POPULAR_SOURCES.map(s => (
                  <div key={s.name}
                    className="flex items-center gap-3 p-3 rounded-xl border [border-color:var(--border)] bg-[var(--bg-card)]">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <p className={`text-xs font-bold ${tx}`}>{s.name}</p>
                      <p className={`text-[10px] truncate ${sub}`} style={{ maxWidth: 120 }}>{s.placeholder.slice(0, 28)}…</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-3 ${sub}`}>💡 TIPS</h3>
              <ul className="space-y-2">
                {[
                  "Copy the URL directly from your browser address bar",
                  "For AliExpress, use the product detail page URL (not search results)",
                  "Product images, title, price, and description are auto-imported",
                  "You set your own selling price — we suggest a 2.5× markup",
                ].map((tip, i) => (
                  <li key={i} className={`flex items-start gap-2 text-xs ${sub}`}>
                    <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── STEP 2: PREVIEW & EDIT ── */}
        {step === "preview" && scraped && (
          <div className="space-y-5">
            {/* Source badge */}
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                <Check size={11} /> Fetched from {scraped.supplierName || "supplier"}
              </span>
              <a href={scraped.sourceUrl} target="_blank" rel="noopener"
                className={`flex items-center gap-1 text-xs ${sub} hover:text-secondary`}>
                <ExternalLink size={11} /> View original
              </a>
              <button onClick={() => { setStep("url"); setScraped(null); }}
                className={`flex items-center gap-1 text-xs ${sub} hover:text-secondary ml-auto`}>
                <RefreshCw size={11} /> Try different URL
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

              {/* LEFT: Images */}
              <div className="lg:col-span-2 space-y-3">
                <div className={`rounded-2xl border overflow-hidden aspect-square ${card}`}>
                  {images[selectedImg] ? (
                    <img src={images[selectedImg]} alt={name}
                      className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={40} className="text-tertiary" />
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative group">
                        <button onClick={() => setSelectedImg(i)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImg === i ? "border-violet-500" : "[border-color:var(--border)]"
                          }`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                        <button onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 [color:var(--text-primary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Supplier info */}
                {(scraped.shippingDays || scraped.processingDays) && (
                  <div className={`rounded-xl border p-3 text-xs space-y-1 ${card}`}>
                    {scraped.processingDays && (
                      <div className="flex justify-between">
                        <span className={sub}>Processing time</span>
                        <span className={tx}>{scraped.processingDays} days</span>
                      </div>
                    )}
                    {scraped.shippingDays && (
                      <div className="flex justify-between">
                        <span className={sub}>Shipping estimate</span>
                        <span className={tx}>{scraped.shippingDays} days</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT: Edit form */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${sub}`}>PRODUCT NAME</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={inp} />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${sub}`}>DESCRIPTION</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    rows={3} className={`${inp} resize-none`} />
                </div>

                {/* Pricing */}
                <div className={`rounded-xl border p-4 space-y-3 ${card}`}>
                  <h3 className={`text-xs font-black ${sub}`}>PRICING</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${sub}`}>
                        COST PRICE ({scraped.currency})
                      </label>
                      <div className="relative">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${sub}`}>
                          {scraped.currency === "USD" ? "$" : scraped.currency}
                        </span>
                        <input type="number" step="0.01" value={costPrice}
                          onChange={e => setCostPrice(e.target.value)}
                          className={`${inp} pl-7`} />
                      </div>
                      <p className={`text-[10px] mt-1 ${sub}`}>What you pay the supplier</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 text-emerald-400`}>
                        YOUR SELLING PRICE
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400">$</span>
                        <input type="number" step="0.01" value={price}
                          onChange={e => setPrice(e.target.value)}
                          className={`${inp} pl-7 border-emerald-500/30 focus:border-emerald-500`} />
                      </div>
                      <p className={`text-[10px] mt-1 ${sub}`}>What customers pay</p>
                    </div>
                  </div>

                  {/* Margin display */}
                  {margin() !== null && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <div>
                        <span className="text-sm font-black text-emerald-400">{margin()}% margin</span>
                        <span className={`text-xs ml-2 ${sub}`}>+${profit()} profit per sale</span>
                      </div>
                    </div>
                  )}

                  {/* Quick markup buttons */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${sub}`}>Quick markup:</span>
                    {[2, 2.5, 3, 4].map(mult => (
                      <button key={mult} onClick={() => setPrice((parseFloat(costPrice || "0") * mult).toFixed(2))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${sub} [border-color:var(--border)] hover:[background:var(--bg-card)] hover:text-secondary`}>
                        {mult}×
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & inventory */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${sub}`}>CATEGORY</label>
                    <input value={category} onChange={e => setCategory(e.target.value)}
                      placeholder="e.g. Electronics" className={inp} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${sub}`}>STARTING INVENTORY</label>
                    <input type="number" value={inventory} onChange={e => setInventory(e.target.value)}
                      className={inp} />
                  </div>
                </div>

                {/* Link to supplier */}
                {suppliers.length > 0 && (
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${sub}`}>LINK TO SUPPLIER (optional)</label>
                    <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                      className={`${inp} cursor-pointer`}>
                      <option value="">— No supplier link —</option>
                      {suppliers.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <p className={`text-[10px] mt-1 ${sub}`}>Link enables auto-fulfillment and cost tracking</p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${sub}`}>PUBLISH STATUS</label>
                  <div className="flex gap-2">
                    {(["DRAFT","ACTIVE"] as const).map(s => (
                      <button key={s} onClick={() => setStatus(s)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          status === s
                            ? s === "ACTIVE"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-violet-500 bg-violet-500/10 text-violet-400"
                            : "[border-color:var(--border)] text-secondary"
                        }`}>
                        {s === "ACTIVE" ? "🟢 Publish Now" : "📝 Save as Draft"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <button onClick={() => saveMut.mutate()}
                  disabled={saveMut.isPending || !name || !price}
                  className="w-full py-4 rounded-2xl text-sm font-black [color:var(--text-primary)] flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}>
                  {saveMut.isPending
                    ? <><Loader2 size={16} className="animate-spin" /> Adding to Store…</>
                    : <><Plus size={16} /> Add to Store</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === "saved" && savedProduct && (
          <div className={`rounded-2xl border p-12 text-center ${card}`}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h2 className={`text-2xl font-black mb-2 ${tx}`}>Product Added!</h2>
            <p className={`text-sm mb-2 ${sub}`}>
              <strong className="[color:var(--text-primary)]">{savedProduct.name}</strong> has been added to your store.
            </p>
            {savedProduct.status === "DRAFT" && (
              <p className={`text-xs mb-8 ${sub}`}>
                It's saved as a Draft — visit your Products page to publish it.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button onClick={() => { setStep("url"); setUrl(""); setScraped(null); }}
                className="px-6 py-3 rounded-xl text-sm font-bold border [border-color:var(--border)] text-primary hover:[background:var(--bg-secondary)] transition-all">
                Import Another Product
              </button>
              <Link href="/dashboard/products"
                className="px-6 py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] transition-all hover:opacity-90 text-center"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                View All Products →
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
