"use client";
﻿"use client";
// ============================================================
// Visual Store Editor — Perfect UX
// Path: frontend/src/app/dashboard/customize/page.tsx
//
// LEFT:   Settings panel — clean, grouped
// CENTER: Live preview iframe — click to select section
// RIGHT:  KIRO chat — talk to your theme
// TOP:    Template picker, device toggle, undo/redo, save
// ============================================================
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import { useQuery, useMutation }                    from "@tanstack/react-query";
import { api }         from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Save, Eye,
  Palette, Type, Layout, Settings, Sparkles, Send, Check,
  ChevronDown, ChevronRight, GripVertical, Plus, Trash2,
  ToggleLeft, ToggleRight, Globe, X, Loader2, Layers,
  RefreshCw, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────
type Device = "desktop" | "tablet" | "mobile";
type Panel  = "sections" | "colors" | "fonts" | "layout" | "custom";

const DEVICE_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "390px" };
const DEVICE_ICONS  = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

const TEMPLATES = [
  { id: "Classic",     label: "Classic",       preview: "#f5f5f5" },
  { id: "Lagos Noir",  label: "Lagos Noir",    preview: "#0a0a0a" },
  { id: "Bold",        label: "Bold",          preview: "#7c3aed" },
  { id: "Glow",        label: "Glow",          preview: "#f06292" },
  { id: "Runway",      label: "Runway",        preview: "#1a1a1a" },
  { id: "Boutique",    label: "Boutique",      preview: "#f8f0eb" },
  { id: "Cozy",        label: "Cozy",          preview: "#c4956a" },
  { id: "Circuit",     label: "Circuit",       preview: "#0f3460" },
  { id: "Suya",        label: "Suya",          preview: "#c0392b" },
  { id: "Minimal Pro", label: "Minimal Pro",   preview: "#ffffff" },
  { id: "Neon Tokyo",  label: "Neon Tokyo",    preview: "#0d0221" },
  { id: "Afro Vibe",   label: "Afro Vibe",     preview: "#2d5a27" },
];

const GOOGLE_FONTS = [
  "Playfair Display", "Cormorant Garamond", "Libre Baskerville",
  "Abril Fatface", "Josefin Sans", "Raleway",
  "Bebas Neue", "DM Sans", "Nunito", "Lato", "Montserrat", "Poppins",
];

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  hero:              { label: "Hero Banner",       icon: "🖼️" },
  featured_products: { label: "Featured Products", icon: "⭐" },
  announcement:      { label: "Announcement Bar",  icon: "📢" },
  trust_badges:      { label: "Trust Badges",      icon: "🛡️" },
  new_arrivals:      { label: "New Arrivals",      icon: "✨" },
  testimonials:      { label: "Testimonials",      icon: "💬" },
  newsletter:        { label: "Newsletter",        icon: "📧" },
};

// ── Colour Swatch ─────────────────────────────────────────────
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
          {value}
        </span>
        <div className="relative">
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
          <div className="w-7 h-7 rounded-lg border-2 cursor-pointer transition-transform hover:scale-110"
            style={{ background: value, borderColor: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
    </div>
  );
}

// ── Toggle Switch ─────────────────────────────────────────────
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <button onClick={() => onChange(!value)}
        className="w-10 h-5 rounded-full relative transition-colors"
        style={{ background: value ? "#7c3aed" : "rgba(255,255,255,0.1)" }}>
        <motion.div className="absolute w-4 h-4 rounded-full bg-white top-0.5"
          animate={{ left: value ? "22px" : "2px" }} transition={{ type: "spring", damping: 25, stiffness: 400 }} />
      </button>
    </div>
  );
}

// ── Section Row ───────────────────────────────────────────────
function SectionRow({ section, onToggle, isActive, onClick }: any) {
  const meta = SECTION_LABELS[section.type] || { label: section.type, icon: "📄" };
  return (
    <motion.div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer group transition-all"
      style={{ background: isActive ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)", border: isActive ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.05)" }}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}>
      <GripVertical size={12} style={{ color: "rgba(255,255,255,0.2)", cursor: "grab" }} />
      <span className="text-base">{meta.icon}</span>
      <span className="flex-1 text-xs font-medium" style={{ color: section.enabled ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}>
        {meta.label}
      </span>
      <button onClick={e => { e.stopPropagation(); onToggle(section.id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity">
        {section.enabled
          ? <ToggleRight size={16} style={{ color: "#7c3aed" }} />
          : <ToggleLeft  size={16} style={{ color: "rgba(255,255,255,0.3)" }} />}
      </button>
    </motion.div>
  );
}

// ── KAI Theme Chat ────────────────────────────────────────────
function KAIThemePanel({ storeId, settings, onApply }: { storeId: string; settings: any; onApply: (changes: any, explanation: string) => void }) {
  const [input, setInput]     = useState("");
  const [history, setHistory] = useState<Array<{ role: "user" | "KIRO"; text: string }>>([
    { role: "KIRO", text: "Tell me how to change your store. Say things like 'make it darker', 'use a serif font', 'make the buttons rounder', or 'change accent to gold'." }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setHistory(h => [...h, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await api.post(`/theme/${storeId}/kai`, { instruction: msg, current: settings });
      const { changes, explanation } = res.data.data;
      onApply(changes, explanation);
      setHistory(h => [...h, { role: "KIRO", text: explanation }]);
    } catch {
      setHistory(h => [...h, { role: "KIRO", text: "I couldn't apply that. Try something like 'make the background darker' or 'change the accent colour to gold'." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <motion.div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}
            animate={{ boxShadow: ["0 0 0px #7c3aed20","0 0 10px #7c3aed50","0 0 0px #7c3aed20"] }}
            transition={{ duration: 2.5, repeat: Infinity }}>K</motion.div>
          <div>
            <p className="text-xs font-semibold text-white">Talk to Your Theme</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>KAI edits your store design</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {history.map((h, i) => (
          <div key={i} className={`flex ${h.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="px-3 py-2 rounded-xl max-w-[85%] text-xs leading-relaxed"
              style={{
                background:   h.role === "user" ? "linear-gradient(135deg, #7c3aed, #5b21b6)" : "rgba(255,255,255,0.06)",
                color:        h.role === "user" ? "#fff" : "rgba(255,255,255,0.75)",
                borderRadius: h.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
              }}>{h.text}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#7c3aed" }}
                    animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {["Make it darker", "Gold accent", "Round buttons", "Serif heading", "Minimal layout"].map(s => (
          <button key={s} onClick={() => { setInput(s); }}
            className="px-2 py-1 rounded-lg text-xs transition-all"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="e.g. 'Make the background black'"
            className="flex-1 bg-transparent outline-none"
            style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }} />
          <button onClick={send} disabled={!input.trim() || loading}
            className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: input.trim() ? "#7c3aed" : "transparent" }}>
            {loading ? <Loader2 size={11} className="animate-spin" style={{ color: "#7c3aed" }} />
              : <Send size={11} style={{ color: input.trim() ? "#fff" : "rgba(255,255,255,0.3)" }} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN EDITOR ───────────────────────────────────────────────
export default function CustomizePage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const storeSlug = user?.stores?.[0]?.slug || "";

  const [device, setDevice]           = useState<Device>("desktop");
  const [activePanel, setActivePanel] = useState<Panel>("sections");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showKAI, setShowKAI]         = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDirty, setIsDirty]         = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [savedBadge, setSavedBadge]   = useState(false);

  // Undo/redo history
  const [history, setHistory]   = useState<any[]>([]);
  const [histIdx, setHistIdx]   = useState(-1);
  const [settings, setSettings] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load theme
  const { isLoading } = useQuery({
    queryKey: ["theme", storeId],
    queryFn:  async () => { const r = await api.get(`/theme/${storeId}`); return r.data.data; },
    enabled:  !!storeId,
    onSuccess: (data: any) => {
      setSettings(data);
      setHistory([data]);
      setHistIdx(0);
    },
  });

  // Update settings with undo history
  const updateSettings = useCallback((patch: any) => {
    setSettings((prev: any) => {
      const next = deepMerge(prev, patch);
      // Add to history (truncate future if branching)
      setHistory(h => {
        const trimmed = h.slice(0, histIdx + 1);
        const newHistory = [...trimmed, next].slice(-30); // max 30 states
        setHistIdx(newHistory.length - 1);
        return newHistory;
      });
      setIsDirty(true);
      // Push to iframe for live preview
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({ type: "THEME_UPDATE", settings: next }, "*");
      }, 50);
      return next;
    });
  }, [histIdx]);

  const undo = () => {
    if (histIdx <= 0) return;
    const prev = history[histIdx - 1];
    setHistIdx(i => i - 1);
    setSettings(prev);
    iframeRef.current?.contentWindow?.postMessage({ type: "THEME_UPDATE", settings: prev }, "*");
    setIsDirty(true);
  };

  const redo = () => {
    if (histIdx >= history.length - 1) return;
    const next = history[histIdx + 1];
    setHistIdx(i => i + 1);
    setSettings(next);
    iframeRef.current?.contentWindow?.postMessage({ type: "THEME_UPDATE", settings: next }, "*");
    setIsDirty(true);
  };

  const save = async () => {
    if (!settings || isSaving) return;
    setIsSaving(true);
    try {
      await api.patch(`/theme/${storeId}`, { settings });
      setIsDirty(false);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
      toast.success("Theme saved!");
    } catch { toast.error("Save failed"); }
    finally { setIsSaving(false); }
  };

  const handleKAIApply = (changes: any, explanation: string) => {
    updateSettings(changes);
    toast.success(explanation, { icon: "✨", duration: 3000 });
  };

  const toggleSection = (id: string) => {
    if (!settings?.sections) return;
    const sections = settings.sections.map((s: any) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    updateSettings({ sections });
  };

  const panelTabs = [
    { id: "sections", icon: Layers,   label: "Sections" },
    { id: "colors",   icon: Palette,  label: "Colors"   },
    { id: "fonts",    icon: Type,     label: "Fonts"    },
    { id: "layout",   icon: Layout,   label: "Layout"   },
    { id: "custom",   icon: Settings, label: "Custom"   },
  ] as const;

  if (isLoading || !settings) {
    return (
      
        <div className="flex items-center justify-center h-full" style={{ background: "#07070e" }}>
          <div className="text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
              <Layers size={28} style={{ color: "#7c3aed" }} />
            </motion.div>
            <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>Loading your store editor...</p>
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="flex flex-col h-full overflow-hidden" style={{ background: "#09090f" }}>

        {/* ── TOP BAR ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{ background: "#0d0d18", borderBottom: "1px solid rgba(255,255,255,0.07)", height: "52px" }}>

          {/* Left: Template + Undo/Redo */}
          <div className="flex items-center gap-2">
            {/* Template picker */}
            <div className="relative">
              <button onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                <div className="w-3 h-3 rounded-sm" style={{ background: settings.colors?.primary }} />
                {settings.template}
                <ChevronDown size={11} />
              </button>

              <AnimatePresence>
                {showTemplates && (
                  <motion.div className="absolute top-9 left-0 z-50 w-72 rounded-2xl overflow-hidden shadow-2xl p-3"
                    style={{ background: "#0d0d18", border: "1px solid rgba(255,255,255,0.1)" }}
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}>
                    <p className="text-xs mb-3 px-1" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Choose Template</p>
                    <div className="grid grid-cols-4 gap-2">
                      {TEMPLATES.map(t => (
                        <button key={t.id}
                          onClick={() => { updateSettings({ template: t.id }); setShowTemplates(false); }}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                          style={{ background: settings.template === t.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)", border: settings.template === t.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="w-8 h-6 rounded-md" style={{ background: t.preview }} />
                          <p style={{ color: settings.template === t.id ? "#a78bfa" : "rgba(255,255,255,0.5)", fontSize: "9px", textAlign: "center", lineHeight: "1.2" }}>{t.label}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />

            <button onClick={undo} disabled={histIdx <= 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
              style={{ color: histIdx <= 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)" }}
              title="Undo">
              <Undo2 size={14} />
            </button>
            <button onClick={redo} disabled={histIdx >= history.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
              style={{ color: histIdx >= history.length - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)" }}
              title="Redo">
              <Redo2 size={14} />
            </button>
          </div>

          {/* Center: Device toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
            {(["desktop","tablet","mobile"] as Device[]).map(d => {
              const Icon = DEVICE_ICONS[d];
              return (
                <button key={d} onClick={() => setDevice(d)}
                  className="w-8 h-7 flex items-center justify-center rounded-lg transition-all"
                  style={{ background: device === d ? "rgba(124,58,237,0.3)" : "transparent", color: device === d ? "#a78bfa" : "rgba(255,255,255,0.35)" }}>
                  <Icon size={14} />
                </button>
              );
            })}
          </div>

          {/* Right: KAI toggle, Preview, Save */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowKAI(!showKAI)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: showKAI ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border: showKAI ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.08)", color: showKAI ? "#a78bfa" : "rgba(255,255,255,0.5)" }}>
              <Sparkles size={11} />
              KAI
            </button>

            <a href={`https://${storeSlug}.droposHQ.com`} target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              <ExternalLink size={11} />
              Preview
            </a>

            <button onClick={save} disabled={!isDirty || isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: isDirty ? "#7c3aed" : "rgba(255,255,255,0.05)", color: isDirty ? "#fff" : "rgba(255,255,255,0.3)", boxShadow: isDirty ? "0 4px 16px rgba(124,58,237,0.3)" : "none" }}>
              <AnimatePresence mode="wait">
                {savedBadge ? (
                  <motion.span key="saved" className="flex items-center gap-1.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Check size={11} />Saved
                  </motion.span>
                ) : isSaving ? (
                  <motion.span key="saving" className="flex items-center gap-1.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 size={11} className="animate-spin" />Saving
                  </motion.span>
                ) : (
                  <motion.span key="save" className="flex items-center gap-1.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Save size={11} />Save
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ── MAIN LAYOUT ─────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* LEFT PANEL — Settings */}
          <div className="w-64 flex-shrink-0 flex flex-col" style={{ background: "#0d0d18", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

            {/* Panel tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {panelTabs.map(tab => (
                <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-all"
                  style={{
                    color:        activePanel === tab.id ? "#a78bfa" : "rgba(255,255,255,0.3)",
                    borderBottom: activePanel === tab.id ? "2px solid #7c3aed" : "2px solid transparent",
                    fontSize:     "9px",
                  }}>
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto px-3 py-3">

              {/* SECTIONS */}
              {activePanel === "sections" && (
                <div className="space-y-1.5">
                  <p className="text-xs mb-3 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Page Sections
                  </p>
                  {(settings.sections || []).map((section: any) => (
                    <SectionRow key={section.id} section={section}
                      isActive={activeSection === section.id}
                      onToggle={toggleSection}
                      onClick={() => setActiveSection(activeSection === section.id ? null : section.id)} />
                  ))}
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs mt-2 transition-all"
                    style={{ border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}>
                    <Plus size={12} />Add section
                  </button>
                </div>
              )}

              {/* COLORS */}
              {activePanel === "colors" && settings.colors && (
                <div>
                  <p className="text-xs mb-3 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Colour Scheme</p>
                  <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    {Object.entries(settings.colors).map(([key, val]) => (
                      <ColorInput key={key}
                        label={key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                        value={val as string}
                        onChange={v => updateSettings({ colors: { ...settings.colors, [key]: v } })} />
                    ))}
                  </div>

                  <p className="text-xs mt-5 mb-3 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Presets</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: "Noir",     colors: { primary:"#000", accent:"#d4af37", background:"#0a0a0a", text:"#f5f5f5" } },
                      { name: "Luxury",   colors: { primary:"#1a1a2e", accent:"#c9a84c", background:"#faf8f3", text:"#1a1a1a" } },
                      { name: "Fresh",    colors: { primary:"#1b4332", accent:"#40916c", background:"#ffffff", text:"#1b4332" } },
                      { name: "Vibrant",  colors: { primary:"#7c3aed", accent:"#f59e0b", background:"#ffffff", text:"#111827" } },
                      { name: "Rose",     colors: { primary:"#881337", accent:"#f43f5e", background:"#fff1f2", text:"#1c1917" } },
                      { name: "Ocean",    colors: { primary:"#0c4a6e", accent:"#38bdf8", background:"#f0f9ff", text:"#0c4a6e" } },
                      { name: "Clay",     colors: { primary:"#292524", accent:"#c4956a", background:"#fafaf9", text:"#292524" } },
                      { name: "Night",    colors: { primary:"#1e1e2e", accent:"#cba6f7", background:"#181825", text:"#cdd6f4" } },
                    ].map(p => (
                      <button key={p.name}
                        onClick={() => updateSettings({ colors: { ...settings.colors, ...p.colors } })}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex w-full h-3 rounded-md overflow-hidden">
                          <div className="flex-1" style={{ background: p.colors.primary }} />
                          <div className="flex-1" style={{ background: p.colors.accent }} />
                          <div className="flex-1" style={{ background: p.colors.background }} />
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px" }}>{p.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FONTS */}
              {activePanel === "fonts" && settings.fonts && (
                <div>
                  <p className="text-xs mb-3 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Typography</p>

                  {(["heading", "body"] as const).map(type => (
                    <div key={type} className="mb-4">
                      <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.45)", textTransform: "capitalize" }}>{type} Font</label>
                      <div className="space-y-1">
                        {GOOGLE_FONTS.map(font => (
                          <button key={font} onClick={() => updateSettings({ fonts: { ...settings.fonts, [type]: font } })}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-all"
                            style={{
                              background:  settings.fonts[type] === font ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.02)",
                              border:      settings.fonts[type] === font ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
                              color:       settings.fonts[type] === font ? "#a78bfa" : "rgba(255,255,255,0.55)",
                              fontFamily:  font,
                              fontSize:    "13px",
                            }}>
                            {font}
                            {settings.fonts[type] === font && <Check size={11} style={{ color: "#a78bfa" }} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* LAYOUT */}
              {activePanel === "layout" && settings.layout && (
                <div className="space-y-4">
                  <p className="text-xs mb-1 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Layout Options</p>

                  {[
                    { key: "headerStyle",   label: "Header Style",    opts: ["minimal","centered","fullwidth"] },
                    { key: "heroStyle",     label: "Hero Style",      opts: ["fullscreen","split","contained"] },
                    { key: "roundness",     label: "Button Shape",    opts: ["sharp","soft","round"] },
                    { key: "productGrid",   label: "Product Columns", opts: [2,3,4] },
                    { key: "footerColumns", label: "Footer Columns",  opts: [2,3,4] },
                  ].map(item => (
                    <div key={item.key}>
                      <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.45)" }}>{item.label}</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {item.opts.map(opt => (
                          <button key={String(opt)}
                            onClick={() => updateSettings({ layout: { ...settings.layout, [item.key]: opt } })}
                            className="px-3 py-1.5 rounded-lg text-xs capitalize transition-all"
                            style={{
                              background:  settings.layout[item.key] === opt ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                              border:      settings.layout[item.key] === opt ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                              color:       settings.layout[item.key] === opt ? "#a78bfa" : "rgba(255,255,255,0.5)",
                            }}>
                            {String(opt)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CUSTOM */}
              {activePanel === "custom" && settings.custom && (
                <div>
                  <p className="text-xs mb-3 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Store Features</p>
                  <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    {[
                      { key: "showReviews",      label: "Customer Reviews" },
                      { key: "showTrustBadges",  label: "Trust Badges" },
                      { key: "showLiveSales",    label: "Live Sale Notifications" },
                      { key: "showStockCounter", label: "Stock Counter" },
                    ].map(item => (
                      <Toggle key={item.key} label={item.label}
                        value={settings.custom[item.key]}
                        onChange={v => updateSettings({ custom: { ...settings.custom, [item.key]: v } })} />
                    ))}
                  </div>

                  <p className="text-xs mt-5 mb-3 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Announcement Bar</p>
                  <input value={settings.custom.announcementBar || ""}
                    onChange={e => updateSettings({ custom: { ...settings.custom, announcementBar: e.target.value } })}
                    placeholder="e.g. Free delivery above ₦25,000"
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }} />

                  <p className="text-xs mt-5 mb-3 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Social Links</p>
                  {(["instagram","tiktok","whatsapp","twitter"] as const).map(platform => (
                    <div key={platform} className="mb-2">
                      <label className="text-xs mb-1 block capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>{platform}</label>
                      <input value={settings.custom.socialLinks?.[platform] || ""}
                        onChange={e => updateSettings({ custom: { ...settings.custom, socialLinks: { ...settings.custom.socialLinks, [platform]: e.target.value } } })}
                        placeholder={`@${platform}handle`}
                        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unsaved indicator */}
            <AnimatePresence>
              {isDirty && (
                <motion.div className="px-3 pb-3 flex-shrink-0"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#fbbf24" }} />
                    <span style={{ color: "#fbbf24" }}>Unsaved changes</span>
                    <button onClick={save} className="ml-auto text-xs font-medium" style={{ color: "#fbbf24" }}>Save now</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CENTER — Live Preview */}
          <div className="flex-1 flex flex-col min-w-0" style={{ background: "#111116" }}>
            {/* Preview container */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", height: "100%", transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }}>

                {/* Device frame for mobile/tablet */}
                {device !== "desktop" && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                    style={{ border: "2px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)" }} />
                )}

                <iframe
                  ref={iframeRef}
                  src={`https://${storeSlug}.droposHQ.com?preview=true&editor=true`}
                  className="w-full h-full"
                  style={{ border: "none", background: settings.colors?.background || "#fff" }}
                  title="Store Preview"
                />

                {/* Loading overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ background: settings.colors?.background || "#fff", opacity: 0, transition: "opacity 0.3s" }}>
                </div>
              </motion.div>
            </div>

            {/* Bottom status bar */}
            <div className="flex items-center justify-center gap-4 py-2 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                {device === "desktop" ? "Desktop view" : device === "tablet" ? "Tablet — 768px" : "Mobile — 390px"}
              </p>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Click elements in preview to edit
              </p>
            </div>
          </div>

          {/* RIGHT — KIRO chat */}
          <AnimatePresence>
            {showKAI && (
              <motion.div className="w-64 flex-shrink-0"
                style={{ background: "#0d0d18" }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 256, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}>
                <KAIThemePanel storeId={storeId} settings={settings} onApply={handleKAIApply} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    
  );
}

// ── Deep merge utility ────────────────────────────────────────
function deepMerge(target: any, source: any): any {
  if (!source) return target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
