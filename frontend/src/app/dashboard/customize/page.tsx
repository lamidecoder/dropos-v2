"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { TEMPLATES, UNIQUE_TEMPLATES, INDUSTRY_GROUPS, getTemplatesByIndustry } from "../../../components/store/templates/registry";
import { Check, ExternalLink, Lock, Zap, X, Eye, Palette, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";
const V = { v500:"#6B35E8", v400:"#8B5CF6" };

// Curated Unsplash preview images per template
const PREVIEWS: Record<string,string> = {
  aurora:   "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=480&h=300&fit=crop&auto=format",
  obsidian: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=300&fit=crop&auto=format",
  velvet:   "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=480&h=300&fit=crop&auto=format",
  street:   "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=480&h=300&fit=crop&auto=format",
  glow:     "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=480&h=300&fit=crop&auto=format",
  terra:    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=480&h=300&fit=crop&auto=format",
  ionic:    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=480&h=300&fit=crop&auto=format",
  artisan:  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=480&h=300&fit=crop&auto=format",
  apex:     "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&h=300&fit=crop&auto=format",
  sage:     "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=480&h=300&fit=crop&auto=format",
  diamond:  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=480&h=300&fit=crop&auto=format",
  kodiak:   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=480&h=300&fit=crop&auto=format",
  nova:     "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=480&h=300&fit=crop&auto=format",
  dusk:     "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=480&h=300&fit=crop&auto=format",
  kids:     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=300&fit=crop&auto=format",
  atelier:  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=480&h=300&fit=crop&auto=format",
  verdant:  "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=480&h=300&fit=crop&auto=format",
  nexus:    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=480&h=300&fit=crop&auto=format",
  voltage:  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=480&h=300&fit=crop&auto=format",
  ember:    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=480&h=300&fit=crop&auto=format",
  prism:    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=480&h=300&fit=crop&auto=format",
  onyx:     "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=480&h=300&fit=crop&auto=format",
  blaze:    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=480&h=300&fit=crop&auto=format",
  flora:    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=480&h=300&fit=crop&auto=format",
  luxe:     "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=480&h=300&fit=crop&auto=format",
  muse:     "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=480&h=300&fit=crop&auto=format",
  pearl:    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=480&h=300&fit=crop&auto=format",
  chrome:   "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=480&h=300&fit=crop&auto=format",
  bound:    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=480&h=300&fit=crop&auto=format",
  haven:    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=480&h=300&fit=crop&auto=format",
};

const TIER_COLOR: Record<string,string> = { free:"#10B981", pro:"#8B5CF6", advanced:"#F59E0B" };

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

  const storeId   = user?.stores?.[0]?.id;
  const storeSlug = user?.stores?.[0]?.slug;
  const userPlan  = user?.subscription?.plan?.toLowerCase() || "free";

  const { data: store } = useQuery({
    queryKey: ["store-detail", storeId],
    queryFn:  () => api.get(`/stores/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const [activeIndustry, setActiveIndustry] = useState("all");
  const [activeTheme,    setActiveTheme]    = useState(store?.theme || "aurora");
  const [activeColor,    setActiveColor]    = useState(store?.brandColor || "#6B35E8");
  const [preview,        setPreview]        = useState<any>(null);
  const [saving,         setSaving]         = useState(false);

  useEffect(() => {
    if (store) {
      setActiveTheme(store.theme || store.templateId || "aurora");
      setActiveColor(store.brandColor || store.primaryColor || "#6B35E8");
    }
  }, [store]);

  const planCanUse = (tier: string) => {
    if (tier === "free") return true;
    if (tier === "pro" && ["pro","growth","advanced"].includes(userPlan)) return true;
    if (tier === "advanced" && ["advanced","pro"].includes(userPlan)) return true;
    return false;
  };

  async function applyTemplate(id: string) {
    if (!storeId) return;
    setSaving(true);
    try {
      await api.put(`/stores/${storeId}`, { theme: id, brandColor: activeColor });
      setActiveTheme(id);
      qc.invalidateQueries({ queryKey: ["store-detail", storeId] });
      toast.success("Template applied! ✨");
      setPreview(null);
    } catch { toast.error("Failed to apply"); }
    finally { setSaving(false); }
  }

  async function saveColor() {
    if (!storeId) return;
    try {
      await api.put(`/stores/${storeId}`, { brandColor: activeColor, theme: activeTheme });
      toast.success("Brand color saved!");
      qc.invalidateQueries({ queryKey: ["store-detail", storeId] });
    } catch { toast.error("Failed to save"); }
  }

  // Get templates filtered by industry (deduplicated)
  const seenIds = new Set<string>();
  const filtered = TEMPLATES.filter(t => {
    if (activeIndustry !== "all" && t.industry !== activeIndustry) return false;
    if (seenIds.has(t.id)) return false;
    seenIds.add(t.id);
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: tk.text, margin: "0 0 4px" }}>
            Store Templates
          </h1>
          <p style={{ fontSize: 13, color: tk.muted, margin: 0 }}>
            Choose a template built for your industry. Each one is production-ready and fully customizable.
          </p>
        </div>
        {storeSlug && (
          <a href={`https://${storeSlug}.${ROOT_DOMAIN}`} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${tk.border}`, color: tk.muted, fontSize: 13, fontWeight: 600, textDecoration: "none", background: tk.faint }}>
            <ExternalLink size={13}/> View Live Store
          </a>
        )}
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" }}>

        {/* Left — templates */}
        <div>
          {/* Industry filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            <button onClick={() => setActiveIndustry("all")}
              style={{ padding: "7px 14px", borderRadius: 99, border: `1px solid ${activeIndustry==="all"?V.v400:tk.border}`, background: activeIndustry==="all"?`${V.v400}15`:"transparent", color: activeIndustry==="all"?V.v400:tk.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              All Industries
            </button>
            {INDUSTRY_GROUPS.map(g => (
              <button key={g.key} onClick={() => setActiveIndustry(g.key)}
                style={{ padding: "7px 14px", borderRadius: 99, border: `1px solid ${activeIndustry===g.key?V.v400:tk.border}`, background: activeIndustry===g.key?`${V.v400}15`:"transparent", color: activeIndustry===g.key?V.v400:tk.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {g.label}
              </button>
            ))}
          </div>

          {/* Industry description */}
          {activeIndustry !== "all" && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: `${V.v400}08`, border: `1px solid ${V.v400}20`, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: tk.muted, margin: 0 }}>
                {INDUSTRY_GROUPS.find(g => g.key === activeIndustry)?.desc}
              </p>
            </div>
          )}

          {/* Template grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {filtered.map((t, i) => {
              const isActive   = activeTheme === t.id;
              const canUse     = planCanUse(t.tier);
              const img        = PREVIEWS[t.id] || PREVIEWS.aurora;
              return (
                <motion.div key={`${t.id}-${t.industry}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ borderRadius: 16, overflow: "hidden", border: `2px solid ${isActive ? V.v400 : tk.border}`, background: tk.card, cursor: canUse ? "pointer" : "default", transition: "all 0.2s", boxShadow: isActive ? `0 0 0 4px ${V.v400}20` : "none" }}
                  whileHover={canUse ? { scale: 1.02, y: -2 } : {}}
                  onClick={() => canUse && setPreview(t)}>

                  {/* Preview image */}
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#f0f0f0" }}>
                    <img src={img} alt={t.name} loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", filter: !canUse?"grayscale(1) brightness(0.6)":"none", transition: "transform 0.5s" }}/>

                    {/* Active badge */}
                    {isActive && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: V.v400, borderRadius: 99, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                        <Check size={9} color="#fff"/>
                        <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>Active</span>
                      </div>
                    )}

                    {/* Lock overlay */}
                    {!canUse && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)" }}>
                        <Lock size={18} color="#fff" style={{ marginBottom: 6 }}/>
                        <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.tier} Plan</span>
                        <Link href="/dashboard/billing" onClick={e => e.stopPropagation()}
                          style={{ marginTop: 8, padding: "4px 12px", borderRadius: 99, background: V.v400, color: "#fff", fontSize: 10, fontWeight: 700, textDecoration: "none" }}>
                          Upgrade
                        </Link>
                      </div>
                    )}

                    {/* Tier badge */}
                    <div style={{ position: "absolute", top: 10, right: 10, background: TIER_COLOR[t.tier], borderRadius: 99, padding: "2px 8px" }}>
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{t.tier}</span>
                    </div>

                    {/* Dark indicator */}
                    {t.dark && (
                      <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.6)", borderRadius: 99, padding: "2px 8px", backdropFilter: "blur(4px)" }}>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>🌙 Dark</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "12px 14px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: tk.text, margin: 0 }}>{t.name}</p>
                      <span style={{ fontSize: 10, color: tk.muted, background: tk.faint, border: `1px solid ${tk.border}`, borderRadius: 4, padding: "1px 6px" }}>{t.niche}</span>
                    </div>
                    <p style={{ fontSize: 11, color: tk.muted, margin: "0 0 10px", lineHeight: 1.5 }}>{t.description.slice(0, 72)}…</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      {canUse && !isActive && (
                        <button onClick={e => { e.stopPropagation(); applyTemplate(t.id); }}
                          style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: `linear-gradient(135deg,${V.v500},${V.v400})`, border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                          {saving ? "…" : "Apply"}
                        </button>
                      )}
                      {isActive && (
                        <div style={{ flex: 1, padding: "7px 0", borderRadius: 8, background: `${V.v400}12`, border: `1px solid ${V.v400}30`, color: V.v400, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                          ✓ Active
                        </div>
                      )}
                      {canUse && (
                        <button onClick={e => { e.stopPropagation(); setPreview(t); }}
                          style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${tk.border}`, background: "transparent", color: tk.muted, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                          <Eye size={11}/>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right — brand panel */}
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{ borderRadius: 18, background: tk.card, border: `1px solid ${tk.border}`, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${tk.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Palette size={14} color={V.v400}/>
                <span style={{ fontSize: 13, fontWeight: 800, color: tk.text }}>Brand Color</span>
              </div>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
                <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)}
                  style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${tk.border}`, cursor: "pointer", padding: 2, background: "transparent" }}/>
                <input type="text" value={activeColor} onChange={e => setActiveColor(e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${tk.border}`, background: isDark?"rgba(255,255,255,0.04)":"#f9fafb", color: tk.text, fontSize: 13, outline: "none", fontFamily: "inherit" }}/>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {["#6B35E8","#E8547A","#C4782A","#00D4FF","#39FF14","#D4AF37","#8B5E3C","#BF5AF2","#FF3B00","#3A7D44","#8B3A3A","#C0972E"].map(c => (
                  <button key={c} onClick={() => setActiveColor(c)}
                    style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: `2px solid ${activeColor===c?tk.text:"transparent"}`, cursor: "pointer" }}/>
                ))}
              </div>
              <button onClick={saveColor}
                style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: `linear-gradient(135deg,${V.v500},${V.v400})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Save Brand Color
              </button>
            </div>
          </div>

          {/* Active template */}
          <div style={{ borderRadius: 14, background: tk.card, border: `1px solid ${tk.border}`, padding: "14px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: tk.muted, fontWeight: 600, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Active Template</p>
            {(() => {
              const t = TEMPLATES.find(t => t.id === activeTheme);
              return t ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={PREVIEWS[t.id]||PREVIEWS.aurora} alt={t.name} style={{ width: 56, height: 36, objectFit: "cover", borderRadius: 6 }}/>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: V.v400, margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: tk.muted, margin: 0 }}>{t.niche}</p>
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {/* Quick links */}
          <div style={{ borderRadius: 14, background: tk.card, border: `1px solid ${tk.border}`, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, color: tk.muted, fontWeight: 600, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick Links</p>
            {[
              { label:"Domain Settings", href:"/dashboard/domains", icon:"🌐" },
              { label:"Manage Products", href:"/dashboard/products", icon:"📦" },
              { label:"View Analytics",  href:"/dashboard/analytics", icon:"📊" },
            ].map(l => (
              <Link key={l.label} href={l.href}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: tk.text, fontSize: 13, fontWeight: 500, marginBottom: 4, transition: "background 0.12s" }}
                onMouseEnter={e=>(e.currentTarget.style.background=tk.faint)}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span>{l.icon}</span>{l.label}</span>
                <ChevronRight size={12} color={tk.muted}/>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column", backdropFilter: "blur(8px)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: isDark?"#0F0A1E":"#fff", borderBottom: `1px solid ${tk.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={PREVIEWS[preview.id]||PREVIEWS.aurora} alt={preview.name} style={{ width: 48, height: 30, objectFit: "cover", borderRadius: 6 }}/>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: tk.text, margin: 0 }}>{preview.name}</p>
                  <p style={{ fontSize: 12, color: tk.muted, margin: 0 }}>{preview.niche} · {preview.mood}</p>
                </div>
                <div style={{ background: TIER_COLOR[preview.tier], borderRadius: 99, padding: "2px 10px" }}>
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{preview.tier}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {planCanUse(preview.tier) && activeTheme !== preview.id && (
                  <button onClick={() => applyTemplate(preview.id)}
                    style={{ padding: "9px 20px", borderRadius: 10, background: `linear-gradient(135deg,${V.v500},${V.v400})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={13}/> Apply Template
                  </button>
                )}
                <button onClick={() => setPreview(null)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${tk.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: tk.muted }}>
                  <X size={16}/>
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{ width: "100%", maxWidth: 900, borderRadius: 16, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)", background: "#f0f0f0" }}>
                <img src={PREVIEWS[preview.id]||PREVIEWS.aurora} alt={preview.name} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}/>
                <div style={{ padding: "20px 24px", background: isDark?"#16122A":"#fff" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: tk.text, margin: "0 0 8px" }}>{preview.name}</h3>
                  <p style={{ fontSize: 14, color: tk.muted, margin: 0, lineHeight: 1.6 }}>{preview.description}</p>
                </div>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "10px 0 16px", flexShrink: 0 }}>
              Apply to see it live on your store → {storeSlug && <a href={`//${storeSlug}.${ROOT_DOMAIN}`} target="_blank" rel="noopener noreferrer" style={{ color: V.v400, textDecoration: "none" }}>{storeSlug}.{ROOT_DOMAIN}</a>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media(max-width:900px){[style*="grid-template-columns: 1fr 260px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
