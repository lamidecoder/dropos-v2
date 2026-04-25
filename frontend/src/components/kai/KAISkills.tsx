"use client";
// ============================================================
// KAI - Skills Panel (Saved Prompts)
// Path: frontend/src/components/kai/KAISkills.tsx
// ============================================================
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Zap, Globe } from "lucide-react";
import { useKaiStore } from "@/store/kai.store";
import { useKai } from "@/hooks/useKai";

export function KAISkills() {
  const { skills, globalSkills, setActiveTab } = useKaiStore();
  const { sendMessage, createSkill, deleteSkill } = useKai();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", prompt: "", icon: "⚡", description: "" });

  const handleUseSkill = (prompt: string) => {
    setActiveTab("chat");
    sendMessage(prompt);
  };

  const handleCreate = async () => {
    if (!form.name || !form.prompt) return;
    await createSkill.mutateAsync(form);
    setForm({ name: "", prompt: "", icon: "⚡", description: "" });
    setShowForm(false);
  };

  const ICONS = ["⚡", "📊", "🔍", "🚀", "💡", "📱", "🎯", "💰", "📦", "🔥"];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <h2 className="text-sm font-semibold text-white">KAI Skills</h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>One-tap prompts for repeated tasks</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
          <Plus size={11} />New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Create form */}
        {showForm && (
          <motion.div className="rounded-xl p-3 space-y-2"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex gap-2">
              <div className="flex gap-1 flex-wrap">
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className="w-7 h-7 rounded-lg text-sm transition-all"
                    style={{ background: form.icon === ic ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)", border: form.icon === ic ? "1px solid rgba(124,58,237,0.5)" : "1px solid transparent" }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Skill name..." className="w-full bg-transparent outline-none border-b py-1 text-sm"
              style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.1)", fontSize: "13px" }} />
            <textarea value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
              placeholder="The prompt that runs when you tap this skill..."
              rows={3} className="w-full bg-transparent outline-none resize-none text-sm"
              style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }} />
            <div className="flex gap-2">
              <button onClick={handleCreate}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "#7c3aed", color: "#fff" }}>
                Save skill
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* My Skills */}
        {skills.length > 0 && (
          <div>
            <p className="text-xs mb-2 px-1" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              My Skills
            </p>
            <div className="space-y-1.5">
              {skills.map((skill: any) => (
                <SkillCard key={skill.id} skill={skill} onUse={() => handleUseSkill(skill.prompt)}
                  onDelete={() => deleteSkill.mutate(skill.id)} canDelete />
              ))}
            </div>
          </div>
        )}

        {/* Global Skills */}
        {globalSkills.length > 0 && (
          <div>
            <p className="text-xs mb-2 px-1 flex items-center gap-1.5 mt-3"
              style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <Globe size={10} />DropOS Skills
            </p>
            <div className="space-y-1.5">
              {globalSkills.map((skill: any) => (
                <SkillCard key={skill.id} skill={skill} onUse={() => handleUseSkill(skill.prompt)} />
              ))}
            </div>
          </div>
        )}

        {skills.length === 0 && globalSkills.length === 0 && (
          <div className="text-center py-8">
            <Zap size={28} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No skills yet. Create one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillCard({ skill, onUse, onDelete, canDelete }: any) {
  return (
    <motion.div className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      whileHover={{ background: "rgba(124,58,237,0.1)", borderColor: "rgba(124,58,237,0.2)" }}
      onClick={onUse}
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-lg flex-shrink-0">{skill.icon || "⚡"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
          {skill.name}
        </p>
        {skill.description && (
          <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
            {skill.description}
          </p>
        )}
      </div>
      {canDelete && (
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded transition-all"
          style={{ color: "#f87171" }}>
          <Trash2 size={11} />
        </button>
      )}
    </motion.div>
  );
}
