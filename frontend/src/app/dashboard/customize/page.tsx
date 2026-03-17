"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeAPI } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import { TEMPLATES, getAvailableTemplates, type TemplateConfig } from "../../../components/store/templates/registry";
import {
  Save, Eye, Palette, Type, Layout, Globe, Lock,
  CheckCircle, Sparkles, ArrowRight, Layers
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// ── Constants ────────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  "var(--accent)","#7c3aed","#2563eb","#dc2626",
  "#059669","#0891b2","#db2777","#ea580c",
  "#6366f1","#0d9488","#65a30d","#0284c7",
];

const FONT_OPTIONS = [
  { value: "Inter",           label: "Inter",           sample: "Modern & friendly"    },
  { value: "Roboto",          label: "Roboto",          sample: "Neutral & versatile"  },
  { value: "Poppins",         label: "Poppins",         sample: "Geometric & playful"  },
  { value: "Playfair Display",label: "Playfair Display",sample: "Elegant & editorial"  },
  { value: "Space Grotesk",   label: "Space Grotesk",   sample: "Technical & sharp"    },
  { value: "Nunito",          label: "Nunito",          sample: "Soft & approachable"  },
];

// ── Shared input styles ──────────────────────────────────────────────────────
const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";

// ── Tier badge component ─────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    free:     { bg: "rgba(16,185,129,0.12)",  color: "#10b981" },
    pro:      { bg: "rgba(124,58,237,0.12)",  color: "#a78bfa" },
    advanced: { bg: "rgba(201,168,76,0.12)",  color: "var(--accent)" },
  };
  const s = styles[tier] || styles.free;
  return (
    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
      style={{ background: s.bg, color: s.color }}>
      {tier}
    </span>
  );
}

// ── Template card ────────────────────────────────────────────────────────────
function TemplateCard({
  template, selected, locked, onSelect
}: {
  template: TemplateConfig; selected: boolean; locked: boolean; onSelect: () => void;
}) {
  // Visual preview background per template
  const previews: Record<string, { bg: string; text: string; accent: string }> = {
    "classic":       { bg: "#ffffff",  text: "#1a1a2e", accent: "#7c3aed"  },
    "dark-luxe":     { bg: "var(--bg-base)",  text: "#ffffff", accent: "var(--accent)"  },
    "bold":          { bg: "#fafafa",  text: "#000000", accent: "#e11d48"  },
    "editorial":     { bg: "#f8f8f8",  text: "#111",    accent: "#1a1a2e"  },
    "neon":          { bg: "#050508",  text: "#ffffff", accent: "#a855f7"  },
    "boutique":      { bg: "#fdf8f5",  text: "#2d1a0e", accent: "#e879a0"  },
    "minimal-pro":   { bg: "#ffffff",  text: "#111111", accent: "#111111"  },
    "grid":          { bg: "#f8fafc",  text: "#0f172a", accent: "#0ea5e9"  },
    "magazine":      { bg: "#f8f8f8",  text: "#111",    accent: "#dc2626"  },
    "split":         { bg: "#ffffff",  text: "#1a1a2e", accent: "#1a1a2e"  },
    "glassmorphic":  { bg: "#302b63",  text: "#ffffff", accent: "#6366f1"  },
    "vintage":       { bg: "#fdf6ed",  text: "#2d1a0e", accent: "#8b6914"  },
    "ultra-dark":    { bg: "#030303",  text: "#ffffff", accent: "#f0f0f0"  },
    "runway":        { bg: "#000000",  text: "#ffffff", accent: "var(--accent)"  },
  };

  const p = previews[template.id] || previews["classic"];

  return (
    <button
      onClick={locked ? undefined : onSelect}
      className={`relative w-full rounded-2xl overflow-hidden text-left transition-all duration-200 group ${
        locked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-[1.02]"
      } ${selected ? "ring-2 [--tw-ring-color:var(--accent)] ring-offset-2 [ring-offset-color:var(--bg-base)]" : ""}`}
    >
      {/* Mini storefront preview */}
      <div className="h-32 relative overflow-hidden" style={{ background: p.bg }}>
        {/* Fake navbar */}
        <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-3 border-b"
          style={{ background: p.bg, borderColor: `${p.text}15` }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-sm" style={{ background: p.accent }} />
            <div className="h-1.5 w-12 rounded-full" style={{ background: `${p.text}30` }} />
          </div>
          <div className="h-4 w-10 rounded-md" style={{ background: p.accent, opacity: 0.9 }} />
        </div>

        {/* Fake hero */}
        <div className="absolute top-8 left-0 right-0 h-14 px-3 flex flex-col justify-center"
          style={{ background: `linear-gradient(135deg, ${p.accent}15, transparent)` }}>
          <div className="h-2 w-20 rounded-full mb-1.5" style={{ background: `${p.text}60` }} />
          <div className="h-1.5 w-14 rounded-full" style={{ background: `${p.text}25` }} />
        </div>

        {/* Fake product row */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{ border: `1px solid ${p.text}10` }}>
              <div className="h-7" style={{ background: `${p.accent}20` }} />
              <div className="h-4 p-1" style={{ background: p.bg }}>
                <div className="h-1 w-3/4 rounded-full" style={{ background: `${p.text}20` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Selected overlay */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)" }}>
            <div className="w-8 h-8 rounded-full [background:var(--accent-dim)] flex items-center justify-center shadow-lg">
              <CheckCircle size={16} className="text-black" />
            </div>
          </div>
        )}

        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[1px]"
            style={{ background: "rgba(8,8,15,0.7)" }}>
            <Lock size={14} className="text-secondary mb-1" />
            <span className="text-secondary text-[9px] font-bold uppercase tracking-wider">
              {template.tier === "pro" ? "Pro" : "Advanced"}
            </span>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="px-3 py-2.5 flex items-center justify-between"
        style={{ background: selected ? "rgba(201,168,76,0.08)" : "var(--bg-secondary)", borderTop: `1px solid ${selected ? "rgba(201,168,76,0.2)" : "var(--bg-card)"}` }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="[color:var(--text-primary)] text-xs font-bold">{template.name}</span>
            <TierBadge tier={template.tier} />
          </div>
          <p className="text-secondary text-[10px] mt-0.5 leading-tight">{template.description}</p>
        </div>
        {selected && <CheckCircle size={14} className="[color:var(--accent)] flex-shrink-0 ml-2" />}
      </div>
    </button>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
      style={{ background: on ? "linear-gradient(135deg,var(--accent),var(--accent-light))" : "var(--bg-secondary)" }}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CustomizePage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const plan    = user?.subscription?.plan || "STARTER";

  const [activeTab, setActiveTab] = useState<"templates" | "colors" | "typography" | "layout" | "seo">("templates");

  const { data: store } = useQuery({
    queryKey: ["store-detail", storeId],
    queryFn:  () => storeAPI.getOne(storeId!).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const [form, setForm] = useState({
    theme:           "classic",
    primaryColor:    "var(--accent)",
    secondaryColor:  "#7c3aed",
    fontFamily:      "Inter",
    borderRadius:    "rounded",
    tagline:         "",
    metaTitle:       "",
    metaDescription: "",
    showReviews:     true,
    showInventory:   true,
    productsPerRow:  4,
  });

  // Sync form from loaded store
  useEffect(() => {
    if (store) {
      setForm({
        theme:           store.theme           || "classic",
        primaryColor:    store.primaryColor    || "var(--accent)",
        secondaryColor:  store.secondaryColor  || "#7c3aed",
        fontFamily:      store.fontFamily      || "Inter",
        borderRadius:    store.borderRadius    || "rounded",
        tagline:         store.tagline         || "",
        metaTitle:       store.metaTitle       || "",
        metaDescription: store.metaDescription || "",
        showReviews:     store.showReviews     ?? true,
        showInventory:   store.showInventory   ?? true,
        productsPerRow:  store.productsPerRow  || 4,
      });
    }
  }, [store?.id]);

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const saveMut = useMutation({
    mutationFn: () => storeAPI.update(storeId!, form),
    onSuccess:  () => {
      toast.success("Changes saved!");
      qc.invalidateQueries({ queryKey: ["store-detail"] });
    },
    onError: () => toast.error("Save failed"),
  });

  const availableTemplates = getAvailableTemplates(plan);
  const availableIds       = new Set(availableTemplates.map(t => t.id));

  const TABS = [
    { id: "templates",  label: "Templates",  icon: Layers   },
    { id: "colors",     label: "Colors",     icon: Palette  },
    { id: "typography", label: "Fonts",      icon: Type     },
    { id: "layout",     label: "Layout",     icon: Layout   },
    { id: "seo",        label: "SEO",        icon: Globe    },
  ] as const;

  const upsellPlan = plan === "STARTER" ? "Pro" : "Advanced";

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Customize Store</h1>
            <p className="text-secondary text-sm mt-1">Template, colors, fonts and SEO for your storefront</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {store?.slug && (
              <Link href={`/store/${store.slug}`} target="_blank"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ color: "var(--text-tertiary)", border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                <Eye size={13} /> Preview
              </Link>
            )}
            <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !storeId}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-black transition-all disabled:opacity-50 shadow-lg "
              style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-light))" }}>
              <Save size={13} />
              {saveMut.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left panel */}
          <div className="lg:col-span-2 space-y-4">

            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 flex-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap justify-center ${
                    activeTab === id ? "text-black" : "text-secondary hover:text-secondary"
                  }`}
                  style={activeTab === id ? { background: "linear-gradient(135deg,var(--accent),var(--accent-light))" } : {}}>
                  <Icon size={12} /> <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* ── TEMPLATES TAB ── */}
            {activeTab === "templates" && (
              <div className="space-y-5">
                {/* Plan upsell banner if not Advanced */}
                {plan !== "ADVANCED" && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <Sparkles size={16} className="[color:var(--accent)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="[color:var(--accent)] text-xs font-bold">
                        Unlock {plan === "STARTER" ? "8 Pro + 4 Advanced" : "4 Advanced"} templates
                      </p>
                      <p className="text-secondary text-[11px] mt-0.5">
                        Upgrade to {upsellPlan} to access more stunning designs
                      </p>
                    </div>
                    <Link href="/dashboard/billing"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black text-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-light))" }}>
                      Upgrade <ArrowRight size={10} />
                    </Link>
                  </div>
                )}

                {/* Free templates */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400/70">Free</span>
                    <div className="flex-1 h-px" style={{ background: "var(--bg-card)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.filter(t => t.tier === "free").map(t => (
                      <TemplateCard key={t.id} template={t}
                        selected={form.theme === t.id}
                        locked={false}
                        onSelect={() => update("theme", t.id)} />
                    ))}
                  </div>
                </div>

                {/* Pro templates */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black tracking-widest uppercase text-violet-400/70">Pro</span>
                    <div className="flex-1 h-px" style={{ background: "var(--bg-card)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.filter(t => t.tier === "pro").map(t => (
                      <TemplateCard key={t.id} template={t}
                        selected={form.theme === t.id}
                        locked={!availableIds.has(t.id)}
                        onSelect={() => update("theme", t.id)} />
                    ))}
                  </div>
                </div>

                {/* Advanced templates */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black tracking-widest uppercase [color:var(--accent)]/70">Advanced</span>
                    <div className="flex-1 h-px" style={{ background: "var(--bg-card)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.filter(t => t.tier === "advanced").map(t => (
                      <TemplateCard key={t.id} template={t}
                        selected={form.theme === t.id}
                        locked={!availableIds.has(t.id)}
                        onSelect={() => update("theme", t.id)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── COLORS TAB ── */}
            {activeTab === "colors" && (
              <div className="rounded-2xl p-5 space-y-6" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-3">Primary Color</label>
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => update("primaryColor", c)}
                        className={`w-10 h-10 rounded-xl transition-all hover:scale-110 ${form.primaryColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#08080f] scale-110" : ""}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input type="color" value={form.primaryColor} onChange={e => update("primaryColor", e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                      <div className="w-10 h-10 rounded-xl border [border-color:var(--border)] cursor-pointer" style={{ background: form.primaryColor }} />
                    </div>
                    <input value={form.primaryColor} onChange={e => update("primaryColor", e.target.value)}
                      className={`${inp} flex-1 font-mono text-sm`} placeholder="var(--accent)" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-3">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input type="color" value={form.secondaryColor} onChange={e => update("secondaryColor", e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                      <div className="w-10 h-10 rounded-xl border [border-color:var(--border)] cursor-pointer" style={{ background: form.secondaryColor }} />
                    </div>
                    <input value={form.secondaryColor} onChange={e => update("secondaryColor", e.target.value)}
                      className={`${inp} flex-1 font-mono text-sm`} placeholder="#7c3aed" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-3">Button Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "rounded", label: "Rounded",  radius: "12px" },
                      { v: "pill",    label: "Pill",     radius: "999px" },
                      { v: "sharp",   label: "Sharp",    radius: "4px"   },
                    ].map(({ v, label, radius }) => {
                      const active = form.borderRadius === v;
                      return (
                        <button key={v} onClick={() => update("borderRadius", v)}
                          className="py-3 text-sm font-bold transition-all"
                          style={{
                            borderRadius: radius,
                            background: active ? form.primaryColor : "var(--bg-secondary)",
                            border:     `1px solid ${active ? form.primaryColor : "var(--border)"}`,
                            color:      active ? "black" : "var(--text-tertiary)",
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── TYPOGRAPHY TAB ── */}
            {activeTab === "typography" && (
              <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-4">Font Family</label>
                {FONT_OPTIONS.map(f => {
                  const active = form.fontFamily === f.value;
                  return (
                    <button key={f.value} onClick={() => update("fontFamily", f.value)}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all"
                      style={{
                        background: active ? "rgba(201,168,76,0.08)" : "var(--bg-secondary)",
                        border:     `1px solid ${active ? "rgba(201,168,76,0.25)" : "var(--bg-card)"}`,
                      }}>
                      <div>
                        <div className="[color:var(--text-primary)] font-bold text-sm" style={{ fontFamily: f.value }}>{f.label}</div>
                        <div className="text-secondary text-xs mt-0.5" style={{ fontFamily: f.value }}>{f.sample}</div>
                      </div>
                      {active && <CheckCircle size={16} className="[color:var(--accent)]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── LAYOUT TAB ── */}
            {activeTab === "layout" && (
              <div className="rounded-2xl p-5 space-y-6" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-3">Products Per Row</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map(n => {
                      const active = form.productsPerRow === n;
                      return (
                        <button key={n} onClick={() => update("productsPerRow", n)}
                          className="py-3 rounded-xl text-sm font-bold transition-all"
                          style={{
                            background: active ? "linear-gradient(135deg,var(--accent),var(--accent-light))" : "var(--bg-secondary)",
                            border:     `1px solid ${active ? "transparent" : "var(--border)"}`,
                            color:      active ? "black" : "var(--text-tertiary)",
                          }}>
                          {n} Columns
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-3">Display Options</label>
                  <div className="space-y-2">
                    {[
                      { key: "showReviews",   label: "Customer reviews",  desc: "Show star ratings on products"  },
                      { key: "showInventory", label: "Inventory count",   desc: "Show 'Only X left' warnings"    },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div>
                          <div className="[color:var(--text-primary)] text-sm font-semibold">{label}</div>
                          <div className="text-secondary text-xs mt-0.5">{desc}</div>
                        </div>
                        <Toggle on={(form as any)[key]} onToggle={() => update(key, !(form as any)[key])} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SEO TAB ── */}
            {activeTab === "seo" && (
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2">SEO & Meta</label>
                {[
                  { key: "tagline",         label: "Store Tagline",    placeholder: "Shown in hero section",                   multiline: false },
                  { key: "metaTitle",       label: "Meta Title",       placeholder: "My Store — Premium Products",             multiline: false },
                  { key: "metaDescription", label: "Meta Description", placeholder: "Discover amazing products at My Store…",  multiline: true  },
                ].map(({ key, label, placeholder, multiline }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-secondary mb-1.5">{label}</label>
                    {multiline ? (
                      <textarea value={(form as any)[key]} onChange={e => update(key, e.target.value)}
                        rows={3} placeholder={placeholder} className={`${inp} resize-none`} />
                    ) : (
                      <input value={(form as any)[key]} onChange={e => update(key, e.target.value)}
                        placeholder={placeholder} className={inp} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — live preview card */}
          <div>
            <div className="sticky top-20 rounded-2xl overflow-hidden"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: "var(--bg-card)" }}>
                <span className="text-secondary text-xs font-bold uppercase tracking-widest">Live Preview</span>
                <span className="text-tertiary text-[10px]">{form.theme}</span>
              </div>

              {/* Mini browser chrome */}
              <div className="p-4">
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {/* Browser bar */}
                  <div className="h-6 flex items-center px-3 gap-1.5" style={{ background: "var(--bg-secondary)" }}>
                    {["#ef4444","#f59e0b","#10b981"].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
                    <div className="flex-1 mx-2 h-3 rounded-full text-[8px] flex items-center px-2 text-tertiary font-mono"
                      style={{ background: "var(--bg-card)" }}>
                      dropos.io/store/{store?.slug || "my-store"}
                    </div>
                  </div>

                  {/* Preview content — adapts to current theme */}
                  <PreviewPane form={form} storeName={store?.name || "My Store"} />
                </div>
              </div>

              {/* Current template info */}
              <div className="px-4 pb-4">
                <div className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(201,168,76,0.12)" }}>
                    <Layers size={14} className="[color:var(--accent)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="[color:var(--text-primary)] text-xs font-bold capitalize">
                      {TEMPLATES.find(t => t.id === form.theme)?.name || "Classic"}
                    </div>
                    <div className="text-secondary text-[11px] mt-0.5 truncate">
                      {TEMPLATES.find(t => t.id === form.theme)?.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Live preview pane — renders a tiny storefront mockup ─────────────────────
function PreviewPane({ form, storeName }: { form: any; storeName: string }) {
  // Dark themes
  const isDark = ["dark-luxe", "neon", "ultra-dark", "runway", "glassmorphic"].includes(form.theme);
  const isWarm = ["boutique", "vintage"].includes(form.theme);
  const isBold = form.theme === "bold";

  const bg      = isDark ? "var(--bg-base)" : isWarm ? "#fdf8f5" : "#ffffff";
  const textCol = isDark ? "#ffffff"  : isWarm ? "#2d1a0e"  : "#111";
  const brand   = form.primaryColor;
  const radius  = form.borderRadius === "pill" ? "999px" : form.borderRadius === "sharp" ? "2px" : "8px";

  return (
    <div style={{ background: bg, fontFamily: form.fontFamily }}>
      {/* Mini nav */}
      <div className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: isDark ? "var(--border)" : "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-black text-black"
            style={{ background: brand }}>{storeName.charAt(0)}</div>
          <span className="font-black text-[10px]" style={{ color: textCol, fontFamily: form.fontFamily }}>{storeName}</span>
        </div>
        <div className="px-2 py-0.5 text-[8px] font-black text-black" style={{ background: brand, borderRadius: radius }}>Cart</div>
      </div>

      {/* Mini hero */}
      <div className="px-3 py-4" style={{ background: isDark ? `${brand}0d` : `${brand}0c` }}>
        {isBold && <div className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: brand }}>New Drop</div>}
        <div className="text-[11px] font-black leading-tight mb-1" style={{ color: isDark ? "#fff" : textCol, fontFamily: form.fontFamily }}>
          {form.tagline || storeName}
        </div>
        <div className="text-[9px] mb-2" style={{ color: isDark ? "var(--text-tertiary)" : "rgba(0,0,0,0.35)" }}>
          Discover our collection
        </div>
        <div className="inline-block px-2.5 py-1 text-[8px] font-black text-black"
          style={{ background: brand, borderRadius: radius }}>Shop Now</div>
      </div>

      {/* Mini product grid */}
      <div className={`grid gap-1.5 p-2.5 ${form.productsPerRow === 2 ? "grid-cols-2" : form.productsPerRow === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {Array.from({ length: form.productsPerRow }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden"
            style={{ background: isDark ? "var(--bg-secondary)" : "rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "var(--bg-card)" : "rgba(0,0,0,0.06)"}` }}>
            <div className="aspect-square" style={{ background: `${brand}18` }} />
            <div className="p-1.5">
              <div className="h-1.5 rounded-full w-3/4 mb-1" style={{ background: isDark ? "var(--border)" : "rgba(0,0,0,0.1)" }} />
              <div className="h-2 rounded-full w-1/2" style={{ background: `${brand}70` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
