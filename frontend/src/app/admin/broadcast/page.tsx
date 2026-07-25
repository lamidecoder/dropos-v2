"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../../../lib/api";
import { Radio, Send, Users, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminBroadcastPage() {
  const [title,   setTitle]   = useState("");
  const [message, setMessage] = useState("");
  const [type,    setType]    = useState("info");
  const [plan,    setPlan]    = useState("");
  const [sent,    setSent]    = useState(false);

  const broadcastMut = useMutation({
    mutationFn: () => api.post("/admin/broadcast", { title, message, type, targetPlan: plan || undefined }),
    onSuccess: (r) => {
      toast.success(`Sent to ${r.data?.data?.sent || "all"} merchants`);
      setSent(true);
      setTitle(""); setMessage(""); setPlan("");
      setTimeout(() => setSent(false), 4000);
    },
    onError: () => toast.error("Broadcast failed"),
  });

  const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none focus:border-purple-400 transition-colors";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Radio size={18} className="text-purple-600"/>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Broadcast Message</h1>
        </div>
        <p className="text-sm text-gray-500">Send an in-app notification to all merchants or a specific plan</p>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-white/5 p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className={inp} placeholder="e.g. New feature: TikTok Scripts"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">Message</label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} className={`${inp} resize-none`}
            placeholder="Write your message to merchants..."/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} className={inp}>
              <option value="info">ℹ️ Info</option>
              <option value="success">✅ Success</option>
              <option value="warning">⚠️ Warning</option>
              <option value="error">❌ Alert</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Target plan (optional)</label>
            <select value={plan} onChange={e=>setPlan(e.target.value)} className={inp}>
              <option value="">All merchants</option>
              <option value="FREE">Free only</option>
              <option value="GROWTH">Growth only</option>
              <option value="PRO">Pro only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => broadcastMut.mutate()} disabled={!title||!message||broadcastMut.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background:"linear-gradient(135deg,#2D1B69,#6B35E8)" }}>
            {broadcastMut.isPending ? <Loader2 size={14} className="animate-spin"/> : sent ? <Check size={14}/> : <Send size={14}/>}
            {broadcastMut.isPending ? "Sending…" : sent ? "Sent!" : "Broadcast"}
          </button>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Users size={11}/> Will send to all matching merchants
          </p>
        </div>
      </div>
    </div>
  );
}
