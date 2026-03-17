"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { useMutation } from "@tanstack/react-query";
import {
  Sparkles, Zap, Copy, Check, RefreshCw, ChevronDown,
  Tag, Target, BookOpen, Hash,
} from "lucide-react";
import toast from "react-hot-toast";

interface AIResult {
  headline:         string;
  shortDescription: string;
  fullDescription:  string;
  bulletPoints:     string[];
  seoTitle:         string;
  seoDescription:   string;
  tags:             string[];
}

interface Props {
  productName?: string;
  imageUrl?:    string;
  onApply:      (result: AIResult) => void;
}

const TONES = [
  { key: "professional", label: "Professional",  emoji: "💼" },
  { key: "casual",       label: "Casual",        emoji: "😊" },
  { key: "luxury",       label: "Luxury",        emoji: "✨" },
  { key: "energetic",    label: "Energetic",     emoji: "⚡" },
  { key: "minimalist",   label: "Minimalist",    emoji: "◻️" },
];

const AUDIENCES = ["General", "Men", "Women", "Kids", "Professionals", "Athletes", "Seniors", "Gen Z"];

export function AIDescriptionGenerator({ productName: initName = "", imageUrl, onApply }: Props) {
  const [open, setOpen]           = useState(false);
  const [name, setName]           = useState(initName);
  const [keywords, setKeywords]   = useState("");
  const [category, setCategory]   = useState("");
  const [tone, setTone]           = useState("professional");
  const [audience, setAudience]   = useState("General");
  const [result, setResult]       = useState<AIResult | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);

  const genMut = useMutation({
    mutationFn: () => api.post("/ai/product-description", {
      productName:    name || productName,
      keywords:       keywords.split(",").map(k => k.trim()).filter(Boolean),
      tone, category,
      imageUrl,
      targetAudience: audience !== "General" ? audience : undefined,
    }),
    onSuccess: (r) => setResult(r.data.data),
    onError:   (e: any) => toast.error(e.response?.data?.message || "AI generation failed"),
  });

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const inp = { background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
        style={{
          background:  "linear-gradient(135deg,#7C3AED,#8B5CF6)",
          color:       "#fff",
          boxShadow:   "0 4px 16px rgba(124,58,237,0.3)",
        }}>
        <Sparkles size={14} /> AI Generate Description
      </button>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--accent-border)", background: "var(--bg-card)", boxShadow: "var(--shadow-md)" }}>
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(139,92,246,0.05))", borderBottom: "1px solid var(--accent-border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)" }}>
            <Sparkles size={13} color="white" />
          </div>
          <span className="text-sm font-black" style={{ color: "var(--accent)" }}>AI Description Generator</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>BETA</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
          ✕ Close
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Product name
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Wireless Noise Cancelling Headphones"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all" style={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Category
            </label>
            <input value={category} onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Electronics, Fashion, Home"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all" style={inp} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Keywords <span style={{ color: "var(--text-tertiary)" }}>(comma-separated)</span>
          </label>
          <input value={keywords} onChange={e => setKeywords(e.target.value)}
            placeholder="e.g. bluetooth, 40hr battery, foldable, premium"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all" style={inp} />
        </div>

        {/* Tone selector */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Tone</label>
          <div className="flex gap-2 flex-wrap">
            {TONES.map(t => (
              <button key={t.key} onClick={() => setTone(t.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: tone === t.key ? "linear-gradient(135deg,#7C3AED,#8B5CF6)" : "var(--bg-secondary)",
                  color:      tone === t.key ? "#fff" : "var(--text-secondary)",
                  border:     `1px solid ${tone === t.key ? "transparent" : "var(--border)"}`,
                  boxShadow:  tone === t.key ? "0 2px 8px rgba(124,58,237,0.25)" : "none",
                }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Target Audience</label>
          <div className="flex gap-1.5 flex-wrap">
            {AUDIENCES.map(a => (
              <button key={a} onClick={() => setAudience(a)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: audience === a ? "var(--accent-dim)"  : "var(--bg-secondary)",
                  color:      audience === a ? "var(--accent)"      : "var(--text-tertiary)",
                  border:     `1px solid ${audience === a ? "var(--accent-border)" : "var(--border)"}`,
                }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button onClick={() => genMut.mutate()} disabled={!name.trim() || genMut.isPending}
          className="w-full py-3 rounded-xl text-sm font-black text-[var(--text-primary)] disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
          style={{
            background: "linear-gradient(135deg,#7C3AED,#8B5CF6)",
            boxShadow:  "0 4px 20px rgba(124,58,237,0.35)",
          }}>
          {genMut.isPending
            ? <><RefreshCw size={14} className="animate-spin" /> Generating with AI…</>
            : <><Sparkles size={14} /> {result ? "Regenerate" : "Generate Description"}</>}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>✨ AI Generated Content</span>
              <button onClick={() => { onApply(result); toast.success("Applied to product!"); setOpen(false); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-primary)]"
                style={{ background: "#10B981", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}>
                <Check size={12} /> Apply All to Product
              </button>
            </div>

            {/* Headline */}
            <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Headline</span>
                <button onClick={() => copy(result.headline, "headline")} className="p-1 rounded" style={{ color: "var(--text-tertiary)" }}>
                  {copied === "headline" ? <Check size={11} style={{ color: "#10B981" }} /> : <Copy size={11} />}
                </button>
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{result.headline}</p>
            </div>

            {/* Short description */}
            <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Short Description</span>
                <button onClick={() => copy(result.shortDescription, "short")} className="p-1 rounded" style={{ color: "var(--text-tertiary)" }}>
                  {copied === "short" ? <Check size={11} style={{ color: "#10B981" }} /> : <Copy size={11} />}
                </button>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{result.shortDescription}</p>
            </div>

            {/* Full description */}
            <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Full Description</span>
                <button onClick={() => copy(result.fullDescription, "full")} className="p-1 rounded" style={{ color: "var(--text-tertiary)" }}>
                  {copied === "full" ? <Check size={11} style={{ color: "#10B981" }} /> : <Copy size={11} />}
                </button>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {result.fullDescription}
              </p>
            </div>

            {/* Bullet points */}
            <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Key Benefits</span>
                <button onClick={() => copy(result.bulletPoints.map(b => "• " + b).join("\n"), "bullets")} className="p-1 rounded" style={{ color: "var(--text-tertiary)" }}>
                  {copied === "bullets" ? <Check size={11} style={{ color: "#10B981" }} /> : <Copy size={11} />}
                </button>
              </div>
              <ul className="space-y-1">
                {result.bulletPoints.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--accent)" }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* SEO */}
            <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--text-tertiary)" }}>SEO</span>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Title: </span>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{result.seoTitle}</span>
                </div>
                <div>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Meta: </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{result.seoDescription}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--text-tertiary)" }}>Suggested Tags</span>
              <div className="flex gap-1.5 flex-wrap">
                {result.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
