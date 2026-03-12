"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import toast from "react-hot-toast";
import {
  Plus, Tag, Zap, BarChart2, Repeat2, Clock, Layers, Package,
  Trash2, ToggleLeft, ToggleRight, X, ChevronRight, TrendingUp,
  Gift, Timer, Star, AlertCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type DiscountType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "BOGO" | "TIERED" | "FLASH_SALE" | "BUNDLE";
type ValueType    = "PERCENTAGE" | "FIXED_AMOUNT" | "NEW_PRICE" | "FREE";

interface TierRow { minQty: number; discount: number; }

interface DiscountForm {
  name:           string;
  description:    string;
  type:           DiscountType;
  valueType:      ValueType;
  value:          number;
  maxDiscount:    number;
  minOrderValue:  number;
  minQuantity:    number;
  isAutomatic:    boolean;
  stackable:      boolean;
  priority:       number;
  freeShipping:   boolean;
  firstOrderOnly: boolean;
  maxUses:        number;
  maxUsesPerCustomer: number;
  bogoRequiredQty: number;
  bogoGetQty:      number;
  bogoPctOff:      number;
  flashSaleStartsAt: string;
  flashSaleEndsAt:   string;
  startsAt:        string;
  expiresAt:       string;
}

// ── Discount type config ─────────────────────────────────────────────────────
const TYPES: { type: DiscountType; label: string; icon: any; desc: string; color: string }[] = [
  { type: "PERCENTAGE",    icon: Tag,      label: "Percentage Off",  desc: "% off order or products",        color: "#7C3AED" },
  { type: "FIXED",         icon: Tag,      label: "Fixed Amount",    desc: "$ fixed discount",                color: "#3B82F6" },
  { type: "BOGO",          icon: Gift,     label: "Buy X Get Y",     desc: "Buy X items, get Y free/off",    color: "#10B981" },
  { type: "TIERED",        icon: Layers,   label: "Volume Tiers",    desc: "More items = bigger discount",   color: "#F59E0B" },
  { type: "FLASH_SALE",    icon: Timer,    label: "Flash Sale",      desc: "Time-limited deep discount",     color: "#EF4444" },
  { type: "FREE_SHIPPING", icon: Package,  label: "Free Shipping",   desc: "Free shipping on qualifying orders", color: "#06B6D4" },
  { type: "BUNDLE",        icon: Repeat2,  label: "Bundle Deal",     desc: "Spend X, get Y",                 color: "#8B5CF6" },
];

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = {
    ACTIVE:    { bg: "rgba(16,185,129,0.1)",  color: "#10B981", dot: "#10B981", label: "Active"    },
    PAUSED:    { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", dot: "#F59E0B", label: "Paused"    },
    EXPIRED:   { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", dot: "#EF4444", label: "Expired"   },
    SCHEDULED: { bg: "rgba(59,130,246,0.1)",  color: "#3B82F6", dot: "#3B82F6", label: "Scheduled" },
  }[status] || { bg: "var(--bg-secondary)", color: "var(--text-tertiary)", dot: "var(--text-tertiary)", label: status };

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ── Flash countdown ───────────────────────────────────────────────────────────
function FlashCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold"
      style={{ color: "var(--error)" }}>
      <Timer size={10} /> {remaining}
    </span>
  );
}

// ── Discount card ────────────────────────────────────────────────────────────
function DiscountCard({ d, storeId, onDelete }: { d: any; storeId: string; onDelete: (id: string) => void }) {
  const qc       = useQueryClient();
  const typeConf = TYPES.find(t => t.type === d.type) || TYPES[0];
  const Icon     = typeConf.icon;

  const toggleMut = useMutation({
    mutationFn: () => api.patch(`/discounts/${storeId}/${d.id}/toggle`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["discounts"] }),
  });

  const isActive  = d.status === "ACTIVE";
  const usedPct   = d.maxUses ? Math.min((d.usedCount / d.maxUses) * 100, 100) : 0;

  return (
    <div className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: typeConf.color + "18", border: `1px solid ${typeConf.color}30` }}>
            <Icon size={15} style={{ color: typeConf.color }} />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{d.name}</div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{typeConf.label}</div>
          </div>
        </div>
        <StatusBadge status={d.status} />
      </div>

      {/* Value display */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-lg font-black" style={{ color: typeConf.color }}>
          {d.type === "FREE_SHIPPING" ? "Free Shipping"
            : d.type === "BOGO" ? `Buy ${d.bogoRequiredQty} Get ${d.bogoGetQty}`
            : d.type === "TIERED" ? `Up to ${Math.max(...((d.tiers || []) as any[]).map((t: any) => t.discount || 0))}% off`
            : d.valueType === "PERCENTAGE" ? `${d.value}% off`
            : `$${d.value} off`}
        </span>
        {d.minOrderValue > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}>
            Min ${d.minOrderValue}
          </span>
        )}
        {d.isAutomatic && (
          <span className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
            Automatic
          </span>
        )}
        {d.flashSaleEndsAt && new Date(d.flashSaleEndsAt) > new Date() && (
          <FlashCountdown endsAt={d.flashSaleEndsAt} />
        )}
      </div>

      {/* Tiered preview */}
      {d.type === "TIERED" && d.tiers && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {(d.tiers as TierRow[]).map((t, i) => (
            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
              style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              {t.minQty}+ → {t.discount}% off
            </span>
          ))}
        </div>
      )}

      {/* Usage bar */}
      {d.maxUses && (
        <div className="mb-3">
          <div className="flex justify-between text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            <span>{d.usedCount} uses</span>
            <span>{d.maxUses} max</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--bg-secondary)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: usedPct + "%", background: usedPct > 80 ? "#EF4444" : typeConf.color }} />
          </div>
        </div>
      )}

      {/* Dates */}
      {(d.startsAt || d.expiresAt) && (
        <div className="text-[11px] mb-3" style={{ color: "var(--text-tertiary)" }}>
          {d.startsAt && <span>Starts: {new Date(d.startsAt).toLocaleDateString()} · </span>}
          {d.expiresAt && <span>Expires: {new Date(d.expiresAt).toLocaleDateString()}</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {d._count?.usages || d.usedCount || 0} uses · ${((d._count?.usages || 0) * 0).toFixed(0)} saved
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => toggleMut.mutate()}
            className="p-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1"
            style={{ color: isActive ? "var(--success)" : "var(--text-tertiary)", background: isActive ? "rgba(16,185,129,0.08)" : "var(--bg-secondary)" }}>
            {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {isActive ? "On" : "Off"}
          </button>
          <button onClick={() => onDelete(d.id)}
            className="p-2 rounded-lg transition-all"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--error)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tiered editor ─────────────────────────────────────────────────────────────
function TierEditor({ tiers, onChange }: { tiers: TierRow[]; onChange: (t: TierRow[]) => void }) {
  const add = () => onChange([...tiers, { minQty: tiers.length > 0 ? tiers[tiers.length-1].minQty + 3 : 2, discount: 10 }]);
  const del = (i: number) => onChange(tiers.filter((_, idx) => idx !== i));
  const set = (i: number, k: keyof TierRow, v: number) => {
    const next = [...tiers]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };

  return (
    <div className="space-y-2">
      {tiers.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-tertiary)", width: 60 }}>Buy {i === 0 ? "≥" : "≥"}</span>
          <input type="number" value={t.minQty} min={1}
            onChange={e => set(i, "minQty", Number(e.target.value))}
            className="w-20 rounded-lg px-2 py-1.5 text-xs outline-none"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>items →</span>
          <input type="number" value={t.discount} min={1} max={100}
            onChange={e => set(i, "discount", Number(e.target.value))}
            className="w-20 rounded-lg px-2 py-1.5 text-xs outline-none"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>% off</span>
          <button onClick={() => del(i)} className="p-1 rounded" style={{ color: "var(--text-tertiary)" }}>
            <X size={12} />
          </button>
        </div>
      ))}
      <button onClick={add}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
        style={{ color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
        <Plus size={11} /> Add Tier
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DiscountsPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const [modal, setModal]       = useState(false);
  const [selType, setSelType]   = useState<DiscountType | null>(null);
  const [tiers, setTiers]       = useState<TierRow[]>([{ minQty: 2, discount: 10 }, { minQty: 5, discount: 20 }]);
  const [filter, setFilter]     = useState<string>("ALL");

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ["discounts", storeId],
    queryFn:  () => api.get(`/discounts/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post(`/discounts/${storeId}`, d),
    onSuccess:  () => {
      toast.success("Discount created!");
      qc.invalidateQueries({ queryKey: ["discounts"] },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"));
      setModal(false); setSelType(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to create discount"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/discounts/${storeId}/${id}`),
    onSuccess:  () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["discounts"] },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")); },
  });

  // Form state
  const [form, setForm] = useState<Partial<DiscountForm>>({
    type: "PERCENTAGE", valueType: "PERCENTAGE", value: 10,
    isAutomatic: true, stackable: false, priority: 0,
    bogoRequiredQty: 2, bogoGetQty: 1, bogoPctOff: 100,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.type) return toast.error("Name and type required");
    const payload = {
      ...form,
      tiers: form.type === "TIERED" ? tiers : undefined,
    };
    createMut.mutate(payload);
  };

  const filtered = discounts.filter((d: any) =>
    filter === "ALL" ? true : d.status === filter || d.type === filter
  );

  const typeConf = selType ? TYPES.find(t => t.type === selType) : null;

  // Stats
  const totalActive = discounts.filter((d: any) => d.status === "ACTIVE").length;
  const flashSales  = discounts.filter((d: any) => d.type === "FLASH_SALE" && d.status === "ACTIVE").length;
  const autoDiscount = discounts.filter((d: any) => d.isAutomatic).length;

  const inp = { background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Discount Engine</h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              BOGO, flash sales, volume tiers, automatic discounts — all in one place
            </p>
          </div>
          <button onClick={() => { setModal(true); setSelType(null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] transition-all hover:opacity-90"
            style={{ background: "#10B981", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
            <Plus size={15} /> New Discount
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Discounts", value: totalActive,   icon: Tag,      color: "#7C3AED" },
            { label: "Flash Sales Live", value: flashSales,    icon: Timer,    color: "#EF4444" },
            { label: "Auto Discounts",   value: autoDiscount,  icon: Zap,      color: "#10B981" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: color + "18", border: `1px solid ${color}30` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div>
                  <div className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{value}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "ACTIVE", "PAUSED", "BOGO", "TIERED", "FLASH_SALE", "FREE_SHIPPING"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
              style={{
                background: filter === f ? "var(--accent-dim)" : "var(--bg-secondary)",
                color:      filter === f ? "var(--accent)"     : "var(--text-secondary)",
                border:     `1px solid ${filter === f ? "var(--accent-border)" : "var(--border)"}`,
              }}>
              {f.toLowerCase().replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Discount grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl h-40 skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center"
            style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
            <Tag size={36} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
            <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>No discounts yet</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Create your first discount to drive more sales.
            </p>
            <button onClick={() => setModal(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)]"
              style={{ background: "#10B981" }}>
              + Create Discount
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d: any) => (
              <DiscountCard key={d.id} d={d} storeId={storeId!} onDelete={id => deleteMut.mutate(id)} />
            ))}
          </div>
        )}

        {/* ── Create modal ──────────────────────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "var(--bg-overlay)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>

              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
                  {selType ? `Create ${typeConf?.label}` : "Choose Discount Type"}
                </h2>
                <button onClick={() => { setModal(false); setSelType(null); }}
                  className="p-2 rounded-lg" style={{ color: "var(--text-tertiary)" }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                {/* Type picker */}
                {!selType ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TYPES.map(t => (
                      <button key={t.type} onClick={() => { setSelType(t.type); set("type", t.type); }}
                        className="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-all hover:-translate-y-0.5"
                        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = t.color + "60"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: t.color + "18", border: `1px solid ${t.color}30` }}>
                          <t.icon size={16} style={{ color: t.color }} />
                        </div>
                        <div>
                          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t.label}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{t.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Back */}
                    <button onClick={() => setSelType(null)}
                      className="flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: "var(--accent)" }}>
                      ← Choose different type
                    </button>

                    {/* Basic info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Discount Name *</label>
                        <input value={form.name || ""} onChange={e => set("name", e.target.value)}
                          placeholder="e.g. Summer Sale 20% Off"
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                          style={inp} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Priority (higher = first)</label>
                        <input type="number" value={form.priority || 0} onChange={e => set("priority", Number(e.target.value))}
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                          style={inp} />
                      </div>
                    </div>

                    {/* Type-specific fields */}
                    {(selType === "PERCENTAGE" || selType === "BUNDLE") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Discount %</label>
                          <input type="number" min={1} max={100} value={form.value || 10}
                            onChange={e => set("value", Number(e.target.value))}
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all" style={inp} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Max $ off (optional)</label>
                          <input type="number" min={0} value={form.maxDiscount || ""} placeholder="No cap"
                            onChange={e => set("maxDiscount", Number(e.target.value))}
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all" style={inp} />
                        </div>
                      </div>
                    )}

                    {selType === "FIXED" && (
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Fixed Amount Off ($)</label>
                        <input type="number" min={1} value={form.value || 10}
                          onChange={e => set("value", Number(e.target.value))}
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all" style={inp} />
                      </div>
                    )}

                    {selType === "BOGO" && (
                      <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>BOGO Configuration</div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Buy (qty)</label>
                            <input type="number" min={1} value={form.bogoRequiredQty || 2}
                              onChange={e => set("bogoRequiredQty", Number(e.target.value))}
                              className="w-full rounded-lg px-2 py-2 text-sm outline-none" style={inp} />
                          </div>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Get (qty)</label>
                            <input type="number" min={1} value={form.bogoGetQty || 1}
                              onChange={e => set("bogoGetQty", Number(e.target.value))}
                              className="w-full rounded-lg px-2 py-2 text-sm outline-none" style={inp} />
                          </div>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>% off free item</label>
                            <input type="number" min={1} max={100} value={form.bogoPctOff || 100}
                              onChange={e => set("bogoPctOff", Number(e.target.value))}
                              className="w-full rounded-lg px-2 py-2 text-sm outline-none" style={inp} />
                          </div>
                        </div>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          Customer buys {form.bogoRequiredQty || 2}, gets {form.bogoGetQty || 1} at {form.bogoPctOff || 100}% off
                        </p>
                      </div>
                    )}

                    {selType === "TIERED" && (
                      <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div className="text-xs font-bold mb-3" style={{ color: "var(--text-secondary)" }}>Volume Tiers</div>
                        <TierEditor tiers={tiers} onChange={setTiers} />
                      </div>
                    )}

                    {selType === "FLASH_SALE" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Discount %</label>
                          <input type="number" min={1} max={100} value={form.value || 30}
                            onChange={e => set("value", Number(e.target.value))}
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inp} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Starts</label>
                          <input type="datetime-local" value={form.flashSaleStartsAt || ""}
                            onChange={e => set("flashSaleStartsAt", e.target.value)}
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inp} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Ends *</label>
                          <input type="datetime-local" value={form.flashSaleEndsAt || ""}
                            onChange={e => set("flashSaleEndsAt", e.target.value)}
                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inp} />
                        </div>
                      </div>
                    )}

                    {/* Conditions */}
                    <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="text-xs font-bold mb-3" style={{ color: "var(--text-secondary)" }}>Conditions</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Min order value ($)</label>
                          <input type="number" min={0} value={form.minOrderValue || ""} placeholder="None"
                            onChange={e => set("minOrderValue", Number(e.target.value))}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inp} />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Max total uses</label>
                          <input type="number" min={0} value={form.maxUses || ""} placeholder="Unlimited"
                            onChange={e => set("maxUses", Number(e.target.value))}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inp} />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Valid from</label>
                          <input type="date" value={form.startsAt || ""}
                            onChange={e => set("startsAt", e.target.value)}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inp} />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Expires</label>
                          <input type="date" value={form.expiresAt || ""}
                            onChange={e => set("expiresAt", e.target.value)}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inp} />
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="flex flex-wrap gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      {[
                        { key: "isAutomatic",   label: "Automatic (no code)" },
                        { key: "stackable",      label: "Stackable" },
                        { key: "freeShipping",   label: "Includes free shipping" },
                        { key: "firstOrderOnly", label: "First order only" },
                      ].map(({ key, label }) => (
                        <button key={key} onClick={() => set(key, !form[key as keyof DiscountForm])}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: form[key as keyof DiscountForm] ? "var(--accent-dim)" : "var(--bg-secondary)",
                            color:      form[key as keyof DiscountForm] ? "var(--accent)"     : "var(--text-secondary)",
                            border:     `1px solid ${form[key as keyof DiscountForm] ? "var(--accent-border)" : "var(--border)"}`,
                          }}>
                          <div className="w-3.5 h-3.5 rounded flex items-center justify-center"
                            style={{ background: form[key as keyof DiscountForm] ? "var(--accent)" : "var(--bg-card)", border: `1px solid ${form[key as keyof DiscountForm] ? "var(--accent)" : "var(--border)"}` }}>
                            {form[key as keyof DiscountForm] && <span className="text-[var(--text-primary)] text-[8px]">✓</span>}
                          </div>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSubmit} disabled={createMut.isPending}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] hover:opacity-90 disabled:opacity-60 transition-all"
                        style={{ background: "#10B981", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
                        {createMut.isPending ? "Creating…" : "Create Discount"}
                      </button>
                      <button onClick={() => { setModal(false); setSelType(null); }}
                        className="px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
