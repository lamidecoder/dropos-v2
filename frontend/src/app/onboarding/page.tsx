"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { storeAPI, productAPI } from "../../lib/api";
import { useAuthStore } from "../../store/auth.store";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Store, Package, ArrowRight, ArrowLeft,
  CheckCircle, Palette, Globe, Sparkles
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Store Info",  icon: Store },
  { id: 2, label: "Branding",    icon: Palette },
  { id: 3, label: "First Product", icon: Package },
  { id: 4, label: "Launch!",     icon: Sparkles },
];

const storeSchema = z.object({
  name:         z.string().min(2, "Store name required"),
  description:  z.string().optional(),
  currency:     z.string().default("USD"),
  country:      z.string().optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
});

const brandSchema = z.object({
  primaryColor: z.string().default("#7c3aed"),
  tagline:      z.string().optional(),
});

const productSchema = z.object({
  name:      z.string().min(2, "Product name required"),
  price:     z.coerce.number().positive("Price required"),
  inventory: z.coerce.number().int().min(0).default(10),
  category:  z.string().optional(),
});

export default function OnboardingPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState("#7c3aed");
  const [skipProduct, setSkipProduct] = useState(false);

  const tx  = "text-[var(--text-primary)]";
  const sub = "text-[var(--text-tertiary)]";
  const inp = "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)]";

  const { register: regStore, handleSubmit: subStore, formState: { errors: errStore } } = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: { currency: "USD" },
  });

  const { register: regBrand, handleSubmit: subBrand } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: { primaryColor: "#7c3aed" },
  });

  const { register: regProd, handleSubmit: subProd, formState: { errors: errProd } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { inventory: 10 },
  });

  const createStore = useMutation({
    mutationFn: (d: any) => storeAPI.create(d),
    onSuccess: (res) => {
      setStoreId(res.data.data.id);
      setStoreSlug(res.data.data.slug || res.data.data.domain?.split(".")[0]);
      setStep(2);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to create store"),
  });

  const updateBranding = useMutation({
    mutationFn: (d: any) => storeAPI.update(storeId!, d),
    onSuccess: () => setStep(3),
    onError: () => toast.error("Failed to save branding"),
  });

  const createProduct = useMutation({
    mutationFn: (d: any) => productAPI.create(storeId!, { ...d, status: "ACTIVE" }),
    onSuccess: () => setStep(4),
    onError: () => toast.error("Failed to add product"),
  });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className={`min-h-screen bg-slate-950`}>
      {/* Top bar */}
      <div className={`border-b px-6 py-4 flex items-center justify-between border-slate-800 bg-slate-900`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-primary)] font-black text-sm"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>⚡</div>
          <span className={`font-black ${tx}`}>DropOS Setup</span>
        </div>
        <span className={`text-sm ${sub}`}>Step {step} of {STEPS.length}</span>
      </div>

      {/* Progress */}
      <div className={`h-1 bg-slate-800`}>
        <div className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
      </div>

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done    = step > s.id;
            const current = step === s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    done    ? "text-[var(--text-primary)] shadow-md" :
                    current ? "text-[var(--text-primary)] shadow-lg" :
                    "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
                  }`}
                    style={(done || current) ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                    {done ? <CheckCircle size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-xs font-bold hidden sm:block ${current ? "text-violet-500" : sub}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-12 sm:w-20 mx-2 mb-5 ${done ? "bg-violet-500" : "bg-[var(--bg-card)]"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Store Info ── */}
        {step === 1 && (
          <div className={`rounded-3xl border p-8 shadow-xl bg-slate-900 border-slate-800`}>
            <div className="mb-6">
              <h2 className={`text-2xl font-black ${tx}`}>Name your store 🏪</h2>
              <p className={`text-sm mt-1 ${sub}`}>You can always change this later</p>
            </div>
            <form onSubmit={subStore((d) => createStore.mutate(d))} className="space-y-4">
              {[
                { name: "name" as const,        label: "Store Name *",   placeholder: "e.g. TechHub NG" },
                { name: "description" as const, label: "Description",    placeholder: "What do you sell?" },
                { name: "supportEmail" as const,label: "Support Email",  placeholder: "support@mystore.com" },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>{label}</label>
                  {name === "description" ? (
                    <textarea {...regStore(name)} rows={3} placeholder={placeholder}
                      className={`w-full rounded-xl px-4 py-3 text-sm border-2 outline-none focus:border-violet-500 resize-none transition-all ${inp}`} />
                  ) : (
                    <input {...regStore(name)} placeholder={placeholder}
                      className={`w-full rounded-xl px-4 py-3 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
                  )}
                  {errStore[name] && <p className="text-xs text-red-400 mt-1">{errStore[name]?.message}</p>}
                </div>
              ))}

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Currency</label>
                <select {...regStore("currency")}
                  className={`w-full rounded-xl px-4 py-3 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`}>
                  {["USD","EUR","GBP","NGN","KES","GHS","ZAR"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={createStore.isPending}
                className="w-full py-4 rounded-xl text-[var(--text-primary)] font-black flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 8px 24px rgba(124,58,237,.3)" }}>
                {createStore.isPending ? "Creating…" : <>Continue <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: Branding ── */}
        {step === 2 && (
          <div className={`rounded-3xl border p-8 shadow-xl bg-slate-900 border-slate-800`}>
            <div className="mb-6">
              <h2 className={`text-2xl font-black ${tx}`}>Brand your store 🎨</h2>
              <p className={`text-sm mt-1 ${sub}`}>Pick a color that represents your brand</p>
            </div>
            <form onSubmit={subBrand((d) => updateBranding.mutate({ ...d, primaryColor: brandColor }))} className="space-y-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-3 ${sub}`}>Brand Color</label>
                <div className="grid grid-cols-6 gap-3 mb-4">
                  {["#7c3aed","#2563eb","#dc2626","#059669","#d97706","#0891b2","#db2777","#4f46e5","#0d9488","#65a30d"].map((c) => (
                    <button key={c} type="button" onClick={() => setBrandColor(c)}
                      className={`w-10 h-10 rounded-xl transition-all hover:scale-110 ${brandColor === c ? "ring-2 ring-offset-2 ring-violet-500" : ""}`}
                      style={{ background: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border-2 border-slate-300 cursor-pointer p-1" />
                  <span className={`text-sm font-mono ${sub}`}>{brandColor}</span>
                  <div className="flex-1 h-10 rounded-xl shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}99)` }} />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Store Tagline</label>
                <input {...regBrand("tagline")} placeholder="e.g. Premium products, delivered fast"
                  className={`w-full rounded-xl px-4 py-3 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
              </div>

              {/* Preview */}
              <div className={`rounded-2xl overflow-hidden border border-slate-700`}>
                <div className="h-2" style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}99)` }} />
                <div className={`p-4 bg-slate-800`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-primary)] text-xs font-black"
                      style={{ background: brandColor }}>S</div>
                    <span className={`font-black text-sm ${tx}`}>Your Store</span>
                  </div>
                  <p className={`text-xs ${sub}`}>Store preview with your brand color</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border-2 border-slate-600 text-slate-400`}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" disabled={updateBranding.isPending}
                  className="flex-1 py-3 rounded-xl text-[var(--text-primary)] font-black flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {updateBranding.isPending ? "Saving…" : <>Continue <ArrowRight size={18} /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 3: First Product ── */}
        {step === 3 && (
          <div className={`rounded-3xl border p-8 shadow-xl bg-slate-900 border-slate-800`}>
            <div className="mb-6">
              <h2 className={`text-2xl font-black ${tx}`}>Add your first product 📦</h2>
              <p className={`text-sm mt-1 ${sub}`}>You can add more products and images from the dashboard</p>
            </div>
            <form onSubmit={subProd((d) => createProduct.mutate(d))} className="space-y-4">
              {[
                { name: "name" as const,     label: "Product Name *", placeholder: "e.g. Wireless Earbuds", type: "text" },
                { name: "price" as const,    label: "Price ($) *",    placeholder: "29.99",                  type: "number" },
                { name: "inventory" as const,label: "Stock Qty",      placeholder: "10",                     type: "number" },
                { name: "category" as const, label: "Category",       placeholder: "e.g. Electronics",       type: "text" },
              ].map(({ name, label, placeholder, type }) => (
                <div key={name}>
                  <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>{label}</label>
                  <input {...regProd(name)} type={type} step={type === "number" ? "0.01" : undefined} placeholder={placeholder}
                    className={`w-full rounded-xl px-4 py-3 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
                  {errProd[name] && <p className="text-xs text-red-400 mt-1">{errProd[name]?.message}</p>}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setSkipProduct(true); setStep(4); }}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold border-2 border-slate-600 text-slate-400`}>
                  Skip for now
                </button>
                <button type="submit" disabled={createProduct.isPending}
                  className="flex-1 py-3 rounded-xl text-[var(--text-primary)] font-black flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {createProduct.isPending ? "Adding…" : <>Add Product <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 4: Launch ── */}
        {step === 4 && (
          <div className={`rounded-3xl border p-10 shadow-xl text-center bg-slate-900 border-slate-800`}>
            <div className="text-6xl mb-6">🚀</div>
            <h2 className={`text-3xl font-black mb-3 ${tx}`}>Your store is ready!</h2>
            <p className={`mb-8 ${sub}`}>
              Your store is live and ready to accept orders. Share your store link to start selling.
            </p>

            {storeSlug && (
              <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 mb-6 bg-slate-800 border-slate-700`}>
                <Globe size={14} className="text-violet-500 flex-shrink-0" />
                <span className={`text-sm font-mono flex-1 truncate ${tx}`}>
                  localhost:3000/store/{storeSlug}
                </span>
                <button onClick={() => { navigator.clipboard.writeText(`http://localhost:3000/store/${storeSlug}`); toast.success("Copied!"); }}
                  className="text-xs font-bold text-violet-500 hover:text-violet-400 flex-shrink-0">
                  Copy
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {storeSlug && (
                <a href={`/store/${storeSlug}`} target="_blank"
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all border-slate-600 text-slate-300 hover:bg-slate-800`}>
                  <Globe size={15} /> View Store
                </a>
              )}
              <button onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-[var(--text-primary)] col-span-1"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                Go to Dashboard <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
