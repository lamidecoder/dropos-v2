"use client";
// Path: frontend/src/app/dashboard/customize/page.tsx
// Visual template picker — full dedicated page

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { TEMPLATES, TemplateConfig } from "../../../components/store/templates/registry";
import { Check, ExternalLink, Lock, Zap, ChevronRight, X, Eye, Palette } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";
const V = { v500:"#6B35E8", v400:"#8B5CF6" };

const PREVIEW_IMAGES: Record<string,string> = {
  aurora:   "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=640&h=400&fit=crop",
  obsidian: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=400&fit=crop",
  verdant:  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=640&h=400&fit=crop",
  atelier:  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=640&h=400&fit=crop",
  voltage:  "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=640&h=400&fit=crop",
  ember:    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=640&h=400&fit=crop",
  nexus:    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=640&h=400&fit=crop",
  prism:    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=640&h=400&fit=crop",
  velvet:   "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=640&h=400&fit=crop",
  street:   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=400&fit=crop",
  glow:     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=640&h=400&fit=crop",
  terra:    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=640&h=400&fit=crop",
  ionic:    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=640&h=400&fit=crop",
  artisan:  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=640&h=400&fit=crop",
  apex:     "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&h=400&fit=crop",
  sage:     "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=640&h=400&fit=crop",
  diamond:  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=640&h=400&fit=crop",
  kodiak:   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=400&fit=crop",
  nova:     "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=640&h=400&fit=crop",
  dusk:     "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=640&h=400&fit=crop",
  kids:     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=400&fit=crop",
};

const TIER_COLORS: Record<string,string> = {
  free:     "#10B981",
  pro:      "#8B5CF6",
  advanced: "#F59E0B",
};

export default function CustomizePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const tk = {
    bg:     isDark ? "#06040D" : "#F4F2FB",
    card:   isDark ? "#16122A" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
  };

  const storeId = user?.stores?.[0]?.id;
  const storeSlug = user?.stores?.[0]?.slug;
  const userPlan = user?.subscription?.plan?.toLowerCase() || "free";

  const { data: store } = useQuery({
    queryKey: ["store-detail", storeId],
    queryFn:  () => api.get(`/stores/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const [activeTheme,   setActiveTheme]   = useState(store?.theme || store?.templateId || "aurora");
  const [activeColor,   setActiveColor]   = useState(store?.brandColor || "#6B35E8");
  const [previewOpen,   setPreviewOpen]   = useState<TemplateConfig|null>(null);
  const [filterTier,    setFilterTier]    = useState<string>("all");
  const [filterNiche,   setFilterNiche]   = useState<string>("all");
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);

  useEffect(() => {
    if (store) {
      setActiveTheme(store.theme || store.templateId || "aurora");
      setActiveColor(store.brandColor || "#6B35E8");
    }
  }, [store]);

  const planCanUse = (tier: string) => {
    if (tier === "free") return true;
    if (tier === "pro" && ["pro","growth","advanced"].includes(userPlan)) return true;
    if (tier === "advanced" && ["advanced","pro"].includes(userPlan)) return true;
    return false;
  };

  async function applyTheme(templateId: string) {
    if (!storeId) return;
    setSaving(true);
    try {
      await api.put(`/stores/${storeId}`, { theme: templateId, brandColor: activeColor });
      setActiveTheme(templateId);
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["store-detail", storeId] });
      toast.success(`Template applied!`);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to apply template");
    } finally {
      setSaving(false);
    }
  }

  async function saveColor() {
    if (!storeId) return;
    try {
      await api.put(`/stores/${storeId}`, { brandColor: activeColor, theme: activeTheme });
      toast.success("Brand color saved!");
      qc.invalidateQueries({ queryKey: ["store-detail", storeId] });
    } catch {
      toast.error("Failed to save");
    }
  }

  const niches = ["all", ...new Set(TEMPLATES.map(t => t.niche).filter(Boolean))];
  const filtered = TEMPLATES.filter(t => {
    if (filterTier !== "all" && t.tier !== filterTier) return false;
    if (filterNiche !== "all" && t.niche !== filterNiche) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: tk.text, margin: "0 0 4px" }}>
            Customize Store
          </h1>
          <p style={{ fontSize: 13, color: tk.muted, margin: 0 }}>
            Choose a template, pick your brand color, then preview and apply.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {storeSlug && (
            <a href={`//${storeSlug}.${ROOT_DOMAIN}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${tk.border}`, color: tk.muted, fontSize: 13, fontWeight: 600, textDecoration: "none", background: tk.faint }}>
              <ExternalLink size={13}/> Preview Store
            </a>
          )}
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>

        {/* Left — Template grid */}
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: tk.muted, fontWeight: 600, marginRight: 4 }}>Filter:</span>
            {["all","free","pro","advanced"].map(t => (
              <button key={t} onClick={() => setFilterTier(t)}
                style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${filterTier===t?V.v400:tk.border}`, background: filterTier===t?`${V.v400}15`:"transparent", color: filterTier===t?V.v400:tk.muted, fontFamily: "inherit", transition: "all 0.15s" }}>
                {t === "all" ? "All" : t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: tk.border, margin: "0 4px" }}/>
            {niches.slice(0,6).map(n => (
              <button key={n} onClick={() => setFilterNiche(n)}
                style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${filterNiche===n?V.v400:tk.border}`, background: filterNiche===n?`${V.v400}15`:"transparent", color: filterNiche===n?V.v400:tk.muted, fontFamily: "inherit", transition: "all 0.15s" }}>
                {n === "all" ? "All Niches" : n}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {filtered.map((t, i) => {
              const isActive  = activeTheme === t.id;
              const canUse    = planCanUse(t.tier);
              const img       = PREVIEW_IMAGES[t.id] || PREVIEW_IMAGES.aurora;
              return (
                <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ borderRadius: 16, overflow: "hidden", border: `2px solid ${isActive ? V.v400 : tk.border}`, background: tk.card, cursor: canUse ? "pointer" : "default", position: "relative", transition: "all 0.2s", boxShadow: isActive ? `0 0 0 4px ${V.v400}20` : "none" }}
                  whileHover={canUse ? { scale: 1.02, y: -2 } : {}}
                  onClick={() => canUse && setPreviewOpen(t)}>

                  {/* Thumbnail */}
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#f0f0f0" }}>
                    <img src={img} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: !canUse ? "grayscale(1) brightness(0.6)" : "none", transition: "transform 0.4s" }}/>
                    {/* Overlay on hover */}
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                      className="template-hover-overlay">
                      {canUse && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={e => { e.stopPropagation(); setPreviewOpen(t); }}
                            style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, opacity: 0, transition: "opacity 0.2s" }}
                            className="preview-btn">
                            <Eye size={12}/> Preview
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Active badge */}
                    {isActive && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: V.v400, borderRadius: 99, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                        <Check size={10} color="#fff"/>
                        <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>Active</span>
                      </div>
                    )}
                    {/* Lock */}
                    {!canUse && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
                        <Lock size={20} color="#fff" style={{ marginBottom: 6 }}/>
                        <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {t.tier.charAt(0).toUpperCase()+t.tier.slice(1)} Plan
                        </span>
                        <Link href="/dashboard/billing" onClick={e => e.stopPropagation()}
                          style={{ marginTop: 8, padding: "5px 14px", borderRadius: 99, background: V.v400, color: "#fff", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                          Upgrade →
                        </Link>
                      </div>
                    )}
                    {/* Tier badge */}
                    <div style={{ position: "absolute", top: 10, right: 10, background: TIER_COLORS[t.tier] || "#888", borderRadius: 99, padding: "3px 8px" }}>
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.tier}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: tk.text, margin: 0 }}>{t.name}</p>
                      <span style={{ fontSize: 10, color: tk.muted, background: tk.faint, border: `1px solid ${tk.border}`, borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap" }}>
                        {t.niche}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: tk.muted, margin: "0 0 12px", lineHeight: 1.5 }}>{t.description?.slice(0,80)}…</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      {canUse && !isActive && (
                        <button onClick={e => { e.stopPropagation(); applyTheme(t.id); }}
                          style={{ flex: 1, padding: "8px 0", borderRadius: 8, background: `linear-gradient(135deg,${V.v500},${V.v400})`, border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                          Apply Template
                        </button>
                      )}
                      {isActive && (
                        <div style={{ flex: 1, padding: "8px 0", borderRadius: 8, background: `${V.v400}12`, border: `1px solid ${V.v400}30`, color: V.v400, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                          ✓ Currently Active
                        </div>
                      )}
                      {canUse && (
                        <button onClick={e => { e.stopPropagation(); setPreviewOpen(t); }}
                          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${tk.border}`, background: "transparent", color: tk.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                          <Eye size={11}/> Preview
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right — Brand panel */}
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{ borderRadius: 18, background: tk.card, border: `1px solid ${tk.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${tk.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Palette size={14} color={V.v400}/>
                <span style={{ fontSize: 13, fontWeight: 800, color: tk.text }}>Brand Settings</span>
              </div>
            </div>

            <div style={{ padding: "18px" }}>
              {/* Active template display */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: tk.muted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Active Template</p>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: `${V.v400}10`, border: `1px solid ${V.v400}20`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: V.v400, margin: 0 }}>
                      {TEMPLATES.find(t => t.id === activeTheme)?.name || activeTheme}
                    </p>
                    <p style={{ fontSize: 11, color: tk.muted, margin: 0 }}>
                      {TEMPLATES.find(t => t.id === activeTheme)?.niche}
                    </p>
                  </div>
                  <div style={{ fontSize: 20 }}>{TEMPLATES.find(t => t.id === activeTheme)?.preview || "🎨"}</div>
                </div>
              </div>

              {/* Color picker */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: tk.muted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Brand Color</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)}
                    style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${tk.border}`, cursor: "pointer", padding: 2, background: "transparent" }}/>
                  <input type="text" value={activeColor} onChange={e => setActiveColor(e.target.value)}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${tk.border}`, background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", color: tk.text, fontSize: 13, outline: "none", fontFamily: "inherit" }}/>
                </div>
                {/* Preset colors */}
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {["#6B35E8","#E8547A","#C4782A","#00D4FF","#39FF14","#D4AF37","#8B5E3C","#BF5AF2","#FF3B00","#5B7B5C"].map(c => (
                    <button key={c} onClick={() => setActiveColor(c)}
                      style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: `2px solid ${activeColor === c ? tk.text : "transparent"}`, cursor: "pointer", transition: "transform 0.15s" }}/>
                  ))}
                </div>
                <button onClick={saveColor}
                  style={{ width: "100%", marginTop: 12, padding: "10px 0", borderRadius: 10, background: `linear-gradient(135deg,${V.v500},${V.v400})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Save Brand Color
                </button>
              </div>

              {/* Quick links */}
              <div style={{ borderTop: `1px solid ${tk.border}`, paddingTop: 16 }}>
                <p style={{ fontSize: 11, color: tk.muted, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Store Links</p>
                {[
                  { label: "Domain Settings", href: "/dashboard/domains", icon: "🌐" },
                  { label: "View Live Store", href: `//${storeSlug}.${ROOT_DOMAIN}`, icon: "↗", external: true },
                  { label: "Manage Products", href: "/dashboard/products", icon: "📦" },
                ].map(l => (
                  <a key={l.label} href={l.href} target={l.external?"_blank":undefined} rel={l.external?"noopener noreferrer":undefined}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 9, border: `1px solid ${tk.border}`, background: "transparent", marginBottom: 6, textDecoration: "none", color: tk.text, fontSize: 13, fontWeight: 500, transition: "background 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background=tk.faint)}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{l.icon}</span>{l.label}
                    </span>
                    <ChevronRight size={12} color={tk.muted}/>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column", backdropFilter: "blur(8px)" }}>
            {/* Modal nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: isDark ? "#0F0A1E" : "#fff", borderBottom: `1px solid ${tk.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22 }}>{previewOpen.preview}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: tk.text, margin: 0 }}>{previewOpen.name}</p>
                  <p style={{ fontSize: 12, color: tk.muted, margin: 0 }}>{previewOpen.niche} · {previewOpen.mood}</p>
                </div>
                <div style={{ background: TIER_COLORS[previewOpen.tier], borderRadius: 99, padding: "3px 10px" }}>
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{previewOpen.tier}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {planCanUse(previewOpen.tier) && activeTheme !== previewOpen.id && (
                  <button onClick={() => { applyTheme(previewOpen.id); setPreviewOpen(null); }}
                    style={{ padding: "9px 20px", borderRadius: 10, background: `linear-gradient(135deg,${V.v500},${V.v400})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={13}/> Apply This Template
                  </button>
                )}
                {activeTheme === previewOpen.id && (
                  <div style={{ padding: "9px 20px", borderRadius: 10, background: `${V.v400}15`, color: V.v400, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <Check size={13}/> Active
                  </div>
                )}
                <button onClick={() => setPreviewOpen(null)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${tk.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: tk.muted }}>
                  <X size={16}/>
                </button>
              </div>
            </div>

            {/* Preview image / iframe */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ width: "100%", maxWidth: 1100, height: "100%", borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.4)", background: "#f0f0f0" }}>
                {/* Show preview image for now — iframe would need real store URL */}
                <img src={PREVIEW_IMAGES[previewOpen.id] || PREVIEW_IMAGES.aurora} alt={previewOpen.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "10px 0 16px" }}>
              Apply this template to see it live on your store →{" "}
              {storeSlug && <a href={`//${storeSlug}.${ROOT_DOMAIN}`} target="_blank" rel="noopener noreferrer" style={{ color: V.v400, textDecoration: "none" }}>{storeSlug}.{ROOT_DOMAIN}</a>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .template-hover-overlay:hover { background: rgba(0,0,0,0.3) !important; }
        .template-hover-overlay:hover .preview-btn { opacity: 1 !important; }
        @media(max-width:900px){
          [style*="grid-template-columns: 1fr 280px"] { grid-template-columns: 1fr !important; }
          [style*="position: sticky"] { position: relative !important; }
        }
      `}</style>
    </div>
  );
}
