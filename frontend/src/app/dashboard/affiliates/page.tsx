"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import {
  Plus, Users, Link2, DollarSign, TrendingUp, Copy, Trash2,
  ToggleLeft, ToggleRight, X, ExternalLink, Gift, BarChart2,
  CheckCircle, Clock, AlertCircle, Send,
} from "lucide-react";

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    ACTIVE:    { bg: "rgba(16,185,129,0.1)",  color: "#10B981", label: "Active"    },
    PENDING:   { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", label: "Pending"   },
    PAUSED:    { bg: "rgba(107,114,128,0.1)", color: "#6B7280", label: "Paused"    },
    SUSPENDED: { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", label: "Suspended" },
  };
  const c = cfg[status] || cfg.PENDING;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />{c.label}
    </span>
  );
}

// ── Affiliate row ─────────────────────────────────────────────────────────────
function AffiliateRow({ a, storeId, baseUrl, onSelect }: {
  a: any; storeId: string; baseUrl: string; onSelect: (a: any) => void;
}) {
  const qc    = useQueryClient();
  const link  = `${baseUrl}?ref=${a.code}`;

  const toggleMut = useMutation({
    mutationFn: () => api.patch(`/affiliates/${storeId}/${a.id}/status`, {
      status: a.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["affiliates"] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => api.delete(`/affiliates/${storeId}/${a.id}`),
    onSuccess: () => { toast.success("Affiliate removed"); qc.invalidateQueries({ queryKey: ["affiliates"] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const pendingBalance = (a.totalEarned || 0) - (a.totalPaid || 0);

  return (
    <div className="p-4 rounded-2xl transition-all hover:-translate-y-0.5 cursor-pointer"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      onClick={() => onSelect(a)}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-[var(--text-primary)] flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)" }}>
            {a.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{a.name}</div>
            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{a.email}</div>
          </div>
        </div>
        <StatusBadge status={a.status} />
      </div>

      {/* Code */}
      <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        <Link2 size={12} style={{ color: "var(--accent)" }} />
        <code className="text-xs font-bold flex-1 truncate" style={{ color: "var(--accent)" }}>
          {a.code}
        </code>
        <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(link); toast.success("Link copied!"); }}
          className="p-1 rounded transition-colors" style={{ color: "var(--text-tertiary)" }}>
          <Copy size={11} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: "Clicks",  value: a.totalClicks || 0,  color: "var(--text-secondary)" },
          { label: "Orders",  value: a.totalOrders || 0,  color: "#10B981"               },
          { label: "Earned",  value: `$${(a.totalEarned || 0).toFixed(0)}`,   color: "var(--accent)"   },
          { label: "Pending", value: `$${pendingBalance.toFixed(0)}`, color: pendingBalance > 0 ? "#F59E0B" : "var(--text-tertiary)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center p-1.5 rounded-lg"
            style={{ background: "var(--bg-secondary)" }}>
            <div className="text-sm font-black" style={{ color }}>{value}</div>
            <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Commission */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          Commission: <strong style={{ color: "var(--text-primary)" }}>
            {a.commissionFlat ? `$${a.commissionFlat}/sale` : `${a.commissionPct}%`}
          </strong>
        </span>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => toggleMut.mutate()}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: a.status === "ACTIVE" ? "#10B981" : "var(--text-tertiary)", background: a.status === "ACTIVE" ? "rgba(16,185,129,0.08)" : "var(--bg-secondary)" }}>
            {a.status === "ACTIVE" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => deleteMut.mutate()}
            className="p-1.5 rounded-lg transition-all"
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

// ── Affiliate detail panel ────────────────────────────────────────────────────
function AffiliateDetail({ a, storeId, onClose }: { a: any; storeId: string; onClose: () => void }) {
  const qc  = useQueryClient();
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("PayPal");

  const { data: stats } = useQuery({
    queryKey: ["affiliate-stats", a.id],
    queryFn:  () => api.get(`/affiliates/${storeId}/${a.id}/stats`).then(r => r.data.data),
  });

  const payoutMut = useMutation({
    mutationFn: () => api.post(`/affiliates/${storeId}/${a.id}/payout`, { amount: payAmount, method: payMethod }),
    onSuccess:  () => { toast.success("Payout recorded!"); qc.invalidateQueries({ queryKey: ["affiliates", "affiliate-stats"] }); setPayAmount(""); },
    onError:    (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const pendingBalance = (a.totalEarned || 0) - (a.totalPaid || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4"
      style={{ background: "var(--bg-overlay)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md h-[calc(100vh-32px)] overflow-y-auto rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-[var(--text-primary)]"
              style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)" }}>
              {a.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{a.name}</div>
              <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{a.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: "var(--text-tertiary)" }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Key stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Earned",   value: `$${(a.totalEarned || 0).toFixed(2)}`, color: "var(--accent)"  },
              { label: "Total Paid",     value: `$${(a.totalPaid   || 0).toFixed(2)}`, color: "#10B981"        },
              { label: "Pending Payout", value: `$${pendingBalance.toFixed(2)}`,        color: pendingBalance > 0 ? "#F59E0B" : "var(--text-tertiary)" },
              { label: "Conversion Rate",value: stats ? `${stats.conversionRate}%` : "—", color: "#3B82F6"     },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="text-lg font-black" style={{ color }}>{value}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Payout section */}
          {pendingBalance > 0 && (
            <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#F59E0B" }}>
                <DollarSign size={14} /> Record Payout
              </div>
              <div className="flex gap-2">
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  placeholder={`Max $${pendingBalance.toFixed(2)}`}
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                  className="rounded-lg px-2 py-2 text-sm outline-none"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                  <option>Store Credit</option>
                  <option>Crypto</option>
                </select>
              </div>
              <button onClick={() => payoutMut.mutate()} disabled={!payAmount || payoutMut.isPending}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "#10B981" }}>
                <Send size={13} /> {payoutMut.isPending ? "Processing…" : "Mark as Paid"}
              </button>
            </div>
          )}

          {/* Referral link */}
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: "var(--text-secondary)" }}>Referral Link</div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <Link2 size={12} style={{ color: "var(--accent)" }} />
              <code className="text-[11px] flex-1 truncate" style={{ color: "var(--accent)" }}>
                ?ref={a.code}
              </code>
              <button onClick={() => { navigator.clipboard.writeText(`?ref=${a.code}`); toast.success("Copied!"); }}
                className="p-1 rounded" style={{ color: "var(--text-tertiary)" }}>
                <Copy size={11} />
              </button>
            </div>
          </div>

          {/* Recent conversions */}
          <div>
            <div className="text-xs font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
              Recent Conversions ({stats?.conversions?.length || 0})
            </div>
            {!stats?.conversions?.length ? (
              <div className="text-center py-6" style={{ color: "var(--text-tertiary)" }}>
                <Gift size={24} className="mx-auto mb-2 opacity-40" />
                <div className="text-xs">No conversions yet</div>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.conversions.slice(0, 8).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{ background: "var(--bg-secondary)" }}>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        Order ${c.orderValue.toFixed(2)}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold" style={{ color: "#10B981" }}>
                        +${c.commission.toFixed(2)}
                      </div>
                      <div className="text-[10px]" style={{
                        color: c.status === "PAID" ? "#10B981" : c.status === "APPROVED" ? "#3B82F6" : "#F59E0B"
                      }}>{c.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AffiliatesPage() {
  const qc      = useQueryClient();
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const storeSlug = user?.stores?.[0]?.slug || "";
  const baseUrl = typeof window !== "undefined"
    ? `${window.location.origin}/store/${storeSlug}`
    : `/store/${storeSlug}`;

  const [modal, setModal]       = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", email: "", commissionPct: 10, commissionFlat: "",
    payoutMethod: "PayPal", notes: "", code: "",
  });

  const { data: affiliates = [], isLoading } = useQuery({
    queryKey: ["affiliates", storeId],
    queryFn:  () => api.get(`/affiliates/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post(`/affiliates/${storeId}`, d),
    onSuccess:  () => {
      toast.success("Affiliate added!");
      qc.invalidateQueries({ queryKey: ["affiliates"] });
      setModal(false);
      setForm({ name: "", email: "", commissionPct: 10, commissionFlat: "", payoutMethod: "PayPal", notes: "", code: "" });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  // Aggregate stats
  const totalEarned  = affiliates.reduce((s: number, a: any) => s + (a.totalEarned || 0), 0);
  const totalPaid    = affiliates.reduce((s: number, a: any) => s + (a.totalPaid   || 0), 0);
  const totalOrders  = affiliates.reduce((s: number, a: any) => s + (a.totalOrders || 0), 0);
  const totalClicks  = affiliates.reduce((s: number, a: any) => s + (a.totalClicks || 0), 0);

  const inp = { background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              Affiliates & Referrals
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              Grow sales through referral partners — track clicks, conversions, and commissions
            </p>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] hover:opacity-90"
            style={{ background: "#10B981", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
            <Plus size={15} /> Add Affiliate
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Affiliates", value: affiliates.length,          icon: Users,       color: "#7C3AED" },
            { label: "Total Clicks",     value: totalClicks.toLocaleString(), icon: TrendingUp, color: "#3B82F6" },
            { label: "Orders via Refs",  value: totalOrders,                  icon: BarChart2,  color: "#10B981" },
            { label: "Commissions Due",  value: `$${(totalEarned - totalPaid).toFixed(0)}`, icon: DollarSign, color: "#F59E0B" },
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

        {/* Affiliate grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="rounded-2xl h-52 skeleton" />)}
          </div>
        ) : affiliates.length === 0 ? (
          <div className="rounded-2xl p-16 text-center"
            style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
            <Users size={36} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
            <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>No affiliates yet</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Invite partners to promote your store and earn commissions on every sale.
            </p>
            <button onClick={() => setModal(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)]"
              style={{ background: "#10B981" }}>
              + Add First Affiliate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {affiliates.map((a: any) => (
              <AffiliateRow key={a.id} a={a} storeId={storeId!} baseUrl={baseUrl} onSelect={setSelected} />
            ))}
          </div>
        )}

        {/* ── Create modal ──────────────────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "var(--bg-overlay)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="text-base font-black" style={{ color: "var(--text-primary)" }}>Add Affiliate</h2>
                <button onClick={() => setModal(false)} style={{ color: "var(--text-tertiary)" }}>
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@email.com"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inp} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Commission % <span style={{ color: "var(--text-tertiary)" }}>(default)</span>
                    </label>
                    <input type="number" min={1} max={100}
                      value={form.commissionPct} onChange={e => setForm(f => ({ ...f, commissionPct: Number(e.target.value) }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Flat $ / sale <span style={{ color: "var(--text-tertiary)" }}>(overrides %)</span>
                    </label>
                    <input type="number" min={0}
                      value={form.commissionFlat} onChange={e => setForm(f => ({ ...f, commissionFlat: e.target.value }))}
                      placeholder="Optional"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inp} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Custom code <span style={{ color: "var(--text-tertiary)" }}>(auto-gen if blank)</span>
                    </label>
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. JANE20"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-mono" style={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Payout method</label>
                    <select value={form.payoutMethod} onChange={e => setForm(f => ({ ...f, payoutMethod: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inp}>
                      <option>PayPal</option>
                      <option>Bank Transfer</option>
                      <option>Store Credit</option>
                      <option>Crypto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Internal notes..."
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none" style={inp} />
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => createMut.mutate(form)} disabled={!form.name || !form.email || createMut.isPending}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#10B981", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
                    {createMut.isPending ? "Adding…" : "Add Affiliate"}
                  </button>
                  <button onClick={() => setModal(false)}
                    className="px-5 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <AffiliateDetail a={selected} storeId={storeId!} onClose={() => setSelected(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
