"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Key, Plus, Copy, Check, Trash2, Eye, EyeOff, AlertTriangle, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", red:"#EF4444" };

export default function ApiKeysPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
    input:  isDark ? "rgba(255,255,255,0.05)" : "#F5F3FF",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [name, setName]       = useState("");
  const [copied, setCopied]   = useState<string|null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [newKey, setNewKey]   = useState<string|null>(null);

  const { data } = useQuery({
    queryKey: ["api-keys", storeId],
    queryFn:  () => api.get(`/api-keys/${storeId}`).then(r => r.data.data || []),
    enabled:  !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/api-keys/${storeId}`, { name }),
    onSuccess: (r) => {
      const key = r.data.data?.key || r.data.key;
      if (key) setNewKey(key);
      toast.success("API key created!");
      qc.invalidateQueries({queryKey:["api-keys"]});
      setShowNew(false);
      setName("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/api-keys/${storeId}/${id}`),
    onSuccess: () => { toast.success("Key deleted"); qc.invalidateQueries({queryKey:["api-keys"]}); },
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const keys = data || [];
  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit" } as const;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{ color:t.text }}>API Keys</h1>
          <p className="text-sm" style={{ color:t.muted }}>Authenticate your integrations and custom apps</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer" }}>
          <Plus size={15}/> New Key
        </button>
      </motion.div>

      {/* New key revealed */}
      {newKey && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="mb-5 p-4 rounded-2xl" style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.3)" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} color={V.green}/>
            <p className="text-sm font-bold" style={{ color:V.green }}>Copy this key now — it won't be shown again</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono p-3 rounded-xl overflow-x-auto" style={{ background:"rgba(0,0,0,0.2)", color:"#10B981" }}>
              {newKey}
            </code>
            <button onClick={() => copy(newKey)}
              style={{ width:36, height:36, borderRadius:10, border:"none", background:"rgba(16,185,129,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {copied===newKey ? <Check size={14} color={V.green}/> : <Copy size={14} color={V.green}/>}
            </button>
            <button onClick={() => setNewKey(null)}
              style={{ width:36, height:36, borderRadius:10, border:"none", background:"rgba(239,68,68,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <X size={14} color={V.red}/>
            </button>
          </div>
        </motion.div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-2xl mb-5" style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)" }}>
        <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink:0, marginTop:1 }}/>
        <p className="text-xs leading-relaxed" style={{ color:"rgba(245,158,11,0.9)" }}>
          Keep your API keys secure. Never share them publicly or commit them to version control. Treat them like passwords.
        </p>
      </div>

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
          <Key size={36} style={{ color:t.muted, margin:"0 auto 12px" }}/>
          <p className="font-bold text-base mb-2" style={{ color:t.text }}>No API keys yet</p>
          <p className="text-sm mb-6" style={{ color:t.muted }}>Create a key to connect custom apps and integrations</p>
          <button onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer" }}>
            <Plus size={14}/> Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k: any, i: number) => {
            const isRevealed = revealed.has(k.id);
            const displayKey = isRevealed ? k.key : (k.key ? `${k.key.slice(0,12)}${"•".repeat(20)}` : "•".repeat(32));
            return (
              <motion.div key={k.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                className="p-4 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold" style={{ color:t.text }}>{k.name}</p>
                    <p className="text-xs" style={{ color:t.muted }}>
                      Created {new Date(k.createdAt).toLocaleDateString()}
                      {k.lastUsed && ` · Last used ${new Date(k.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleReveal(k.id)}
                      style={{ width:30, height:30, borderRadius:8, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {isRevealed ? <EyeOff size={12} style={{color:t.muted}}/> : <Eye size={12} style={{color:t.muted}}/>}
                    </button>
                    {k.key && (
                      <button onClick={() => copy(k.key)}
                        style={{ width:30, height:30, borderRadius:8, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {copied===k.key ? <Check size={12} color={V.green}/> : <Copy size={12} style={{color:t.muted}}/>}
                      </button>
                    )}
                    <button onClick={() => deleteMut.mutate(k.id)}
                      style={{ width:30, height:30, borderRadius:8, border:"none", background:"rgba(239,68,68,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Trash2 size={12} color={V.red}/>
                    </button>
                  </div>
                </div>
                <code className="text-xs font-mono" style={{ color:t.muted }}>{displayKey}</code>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New key modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}>
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background:isDark?"#181230":"#fff", border:`1px solid ${t.border}` }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom:`1px solid ${t.border}` }}>
              <h3 className="font-black text-base" style={{ color:t.text }}>New API Key</h3>
              <button onClick={() => setShowNew(false)} style={{ border:"none", background:"none", cursor:"pointer", color:t.muted }}><X size={18}/></button>
            </div>
            <div className="p-5">
              <label className="block text-xs font-semibold mb-1.5" style={{ color:t.muted }}>Key Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="My Integration"
                style={inp} onKeyDown={e => e.key === "Enter" && name && createMut.mutate()}/>
              <p className="text-xs mt-2" style={{ color:t.muted }}>Give it a descriptive name so you remember what it's for</p>
            </div>
            <div className="p-5 flex gap-3" style={{ borderTop:`1px solid ${t.border}` }}>
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border:`1px solid ${t.border}`, background:"transparent", cursor:"pointer", color:t.muted }}>Cancel</button>
              <button onClick={() => createMut.mutate()} disabled={!name||createMut.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer", opacity:!name?0.6:1 }}>
                {createMut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Key size={13}/>}
                Create Key
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
