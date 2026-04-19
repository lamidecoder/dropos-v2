"use client";
// ── Profit Protection Rules ───────────────────────────────────
// Path: frontend/src/app/dashboard/profit-rules/page.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Shield, Plus, Trash2, Play, Check, Zap } from "lucide-react";
import toast from "react-hot-toast";

const TRIGGERS = [
  { id: "margin_below",  label: "Margin drops below",  suffix: "%",  actionOptions: ["alert","auto_reprice","hide_product"] },
  { id: "out_of_stock",  label: "Product goes out of stock", suffix: "", actionOptions: ["alert","hide_product"] },
  { id: "price_rise",    label: "Supplier price rises above", suffix: "%", actionOptions: ["alert","auto_reprice"] },
  { id: "price_drop",    label: "Supplier price drops by", suffix: "%",  actionOptions: ["alert"] },
];
const ACTION_LABELS: Record<string,string> = {
  alert: "Alert me in KAI", auto_reprice: "Auto-adjust my price",
  hide_product: "Auto-hide product", auto_reorder: "Alert to reorder",
};

export function ProfitRulesPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";
  const qc      = useQueryClient();
  const [showAdd, setShowAdd]    = useState(false);
  const [newRule, setNewRule]    = useState({ name: "", trigger: "margin_below", threshold: 30, action: "alert" });
  const [runResult, setRunResult] = useState<any>(null);

  const { data: rules } = useQuery({
    queryKey: ["profit-rules", storeId],
    queryFn:  async () => { const r = await api.get(`/intel/profit-rules/${storeId}`); return r.data.data; },
    enabled: !!storeId,
  });

  const addMutation = useMutation({
    mutationFn: async () => api.post("/intel/profit-rules", { storeId, ...newRule }),
    onSuccess: () => { qc.invalidateQueries(["profit-rules", storeId]); setShowAdd(false); toast.success("Rule added!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/intel/profit-rules/${id}`),
    onSuccess: () => { qc.invalidateQueries(["profit-rules", storeId]); toast.success("Rule removed"); },
  });

  const runMutation = useMutation({
    mutationFn: async () => api.post(`/intel/profit-rules/${storeId}/run`),
    onSuccess: (r) => { setRunResult(r.data.data); toast.success(`Checked ${r.data.data?.triggered?.length || 0} issues found`); },
  });

  return (
    <>
    
      <div className="p-6 max-w-3xl" style={{ minHeight: "100vh", background: "#07070e" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white mb-0.5">Profit Protection</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Automatic rules that protect your margins 24/7 — or set rules via KIRO chat
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => runMutation.mutate()} disabled={runMutation.isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
              <Play size={11} />{runMutation.isLoading ? "Checking..." : "Run Check Now"}
            </button>
            <button onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ background: "#7c3aed", color: "#fff" }}>
              <Plus size={12} />Add Rule
            </button>
          </div>
        </div>

        {/* Add rule form */}
        {showAdd && (
          <motion.div className="rounded-2xl p-5 mb-5"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-white mb-4">New Protection Rule</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>Rule name</label>
                <input value={newRule.name} onChange={e => setNewRule(r => ({ ...r, name: e.target.value }))}
                  placeholder="e.g. Protect margins"
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>Threshold</label>
                <input type="number" value={newRule.threshold} onChange={e => setNewRule(r => ({ ...r, threshold: Number(e.target.value) }))}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>Trigger when...</label>
                <select value={newRule.trigger} onChange={e => setNewRule(r => ({ ...r, trigger: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                  {TRIGGERS.map(t => <option key={t.id} value={t.id} style={{ background: "#0d0d1a" }}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "rgba(255,255,255,0.45)" }}>Then...</label>
                <select value={newRule.action} onChange={e => setNewRule(r => ({ ...r, action: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                  {Object.entries(ACTION_LABELS).map(([k,v]) => <option key={k} value={k} style={{ background: "#0d0d1a" }}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => addMutation.mutate()} disabled={!newRule.name}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "#7c3aed", color: "#fff" }}>
                <Check size={13} />Save Rule
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Run result */}
        {runResult && runResult.triggered?.length > 0 && (
          <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <p className="text-sm font-medium" style={{ color: "#fbbf24" }}>⚠️ {runResult.triggered.length} issues found</p>
            {runResult.triggered.map((t: any, i: number) => (
              <p key={i} className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>• {t.message}</p>
            ))}
          </div>
        )}

        {/* Rules list */}
        {!(rules || []).length ? (
          <div className="text-center py-12">
            <Shield size={32} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No protection rules yet</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Or tell KAI: "Alert me if margin drops below 30%"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(rules || []).map((rule: any, i: number) => (
              <motion.div key={rule.id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Shield size={14} style={{ color: "#34d399" }} className="flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{rule.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    When {TRIGGERS.find(t => t.id === rule.trigger)?.label?.toLowerCase()} {rule.threshold}{TRIGGERS.find(t => t.id === rule.trigger)?.suffix} → {ACTION_LABELS[rule.action]}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ background: "#34d399" }} />
                <button onClick={() => deleteMutation.mutate(rule.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg"
                  style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    
    </>
  );
}

export default ProfitRulesPage;
