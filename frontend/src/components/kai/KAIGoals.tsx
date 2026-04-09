"use client";
// ============================================================
// KAI — Goals Panel
// Path: frontend/src/components/kai/KAIGoals.tsx
// ============================================================
import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useKaiStore } from "@/store/kai.store";
import { useKai } from "@/hooks/useKai";

const STATUS_CONFIG = {
  active:   { color: "#a78bfa", label: "Active" },
  achieved: { color: "#34d399", label: "Achieved" },
  behind:   { color: "#f87171", label: "Behind" },
  abandoned: { color: "rgba(255,255,255,0.3)", label: "Abandoned" },
};

export function KAIGoals() {
  const { goals, setActiveTab } = useKaiStore();
  const { sendMessage, createGoal } = useKai();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", targetValue: "", unit: "NGN", deadline: "" });

  const handleCreate = async () => {
    if (!form.title || !form.targetValue || !form.deadline) return;
    await createGoal.mutateAsync({
      title: form.title,
      targetValue: Number(form.targetValue),
      unit: form.unit,
      deadline: form.deadline,
    });
    setForm({ title: "", targetValue: "", unit: "NGN", deadline: "" });
    setShowForm(false);
  };

  const askKaiAboutGoal = (goal: any) => {
    setActiveTab("chat");
    sendMessage(`Tell me exactly what I need to do to achieve my goal: "${goal.title}" by ${new Date(goal.deadline).toLocaleDateString()}`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div className="flex items-center gap-2">
            <Target size={14} style={{ color: "#34d399" }} />
            <h2 className="text-sm font-semibold text-white">Goals</h2>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>KAI tracks and pushes toward your targets</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
          <Plus size={11} />New goal
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {showForm && (
          <motion.div className="rounded-xl p-3 space-y-2"
            style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-medium" style={{ color: "#34d399" }}>Set a new goal</p>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Make ₦500,000 by June"
              className="w-full bg-transparent outline-none border-b py-1 text-sm"
              style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.1)", fontSize: "13px" }} />
            <div className="flex gap-2">
              <input value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))}
                placeholder="Target (e.g. 500000)" type="number"
                className="flex-1 bg-transparent outline-none border-b py-1 text-sm"
                style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.1)", fontSize: "13px" }} />
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="bg-transparent outline-none border-b py-1 text-sm"
                style={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.1)", fontSize: "12px" }}>
                <option value="NGN" style={{ background: "#0d0d1a" }}>₦ NGN</option>
                <option value="orders" style={{ background: "#0d0d1a" }}>Orders</option>
                <option value="customers" style={{ background: "#0d0d1a" }}>Customers</option>
              </select>
            </div>
            <input value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              type="date" className="w-full bg-transparent outline-none border-b py-1 text-sm"
              style={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.1)", fontSize: "12px" }} />
            <div className="flex gap-2">
              <button onClick={handleCreate}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "#34d399", color: "#000" }}>
                Set goal
              </button>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}>Cancel</button>
            </div>
          </motion.div>
        )}

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Target size={32} className="mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>No goals set</p>
            <p className="text-xs mt-1 text-center max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
              Tell KAI what you want to achieve and it will track your progress and push you to hit it.
            </p>
          </div>
        ) : (
          goals.map((goal: any) => {
            const pct    = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const config = STATUS_CONFIG[goal.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
            const sym    = goal.unit === "NGN" ? "₦" : "";
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div key={goal.id} className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>
                    {goal.title}
                  </p>
                  <span className="text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0"
                    style={{ background: `${config.color}18`, color: config.color, fontSize: "10px" }}>
                    {config.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative h-1.5 rounded-full mb-2"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ background: config.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>
                    {sym}{goal.currentValue.toLocaleString()} / {sym}{goal.targetValue.toLocaleString()} {goal.unit !== "NGN" ? goal.unit : ""}
                  </span>
                  <span style={{ color: pct >= 100 ? "#34d399" : "rgba(255,255,255,0.4)" }}>
                    {pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <Clock size={10} />
                    {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                  </div>
                  {goal.status === "active" && (
                    <button onClick={() => askKaiAboutGoal(goal)}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", fontSize: "11px" }}>
                      Ask KIRO →
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
