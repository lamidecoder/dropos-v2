"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Tag, Plus, Copy, Check, Trash2, ToggleLeft, ToggleRight, Zap, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

function generateCode() {
  return Math.random().toString(36).slice(2,8).toUpperCase();
}

function CouponModal({ onClose, storeId, t, isDark }: any) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    code: generateCode(), type: "PERCENTAGE", value: 10,
    minOrder: "", maxUses: "", expiresAt: "", description: "",
  });
  const [writing, setWriting] = useState(false);

  const createMut = useMutation({
    mutationFn: () => api.post(`/coupons/${storeId}`, {
      ...form, value: Number(form.value),
      minOrder:  form.minOrder  ? Number(form.minOrder)  : undefined,
      maxUses:   form.maxUses   ? Number(form.maxUses)   : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
    }),
    onSuccess: () => {
      toast.success("Coupon created!");
      qc.invalidateQueries({ queryKey: ["coupons"] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to create"),
  });

  const aiGenerate = async () => {
    setWriting(true);
    try {
      const r = await api.post("/kai/smart-chat", {
        message: `Generate a creative coupon code and description for a ${form.type === "PERCENTAGE" ? form.value + "% off" : "₦" + form.value + " off"} discount. Return JSON only: {"code": "CODE123", "description": "Short description"}`,
        storeId,
      });
      const text = r.data?.data?.reply || r.data?.reply || "";
      const match = text.match(/\{[^}]+\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setForm(f => ({ ...f, code: parsed.code || f.code, description: parsed.description || f.description }));
        toast.success("KIRO generated your coupon");
      }
    } catch { toast.error("KIRO offline"); }
    finally { setWriting(false); }
  };

  const inp = {
    width:"100%", padding:"10px 14px", borderRadius:12,
    border:`1px solid ${t.border}`, background:isDark?"rgba(255,255,255,0.05)":"#F5F3FF",
    color:t.text, fontSize:13, outline:"none", fontFamily:"inherit",
  } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}>
      <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`,boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div className="flex items-center justify-between p-5" style={{borderBottom:`1px solid ${t.border}`}}>
          <h3 className="font-black text-base" style={{color:t.text}}>New Coupon</h3>
          <button onClick={onClose} style={{border:"none",background:"none",cursor:"pointer",color:t.muted}}><X size={18}/></button>
        </div>
        <div className="p-5 space-y-3">
          {/* Code */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Coupon Code</label>
            <div className="flex gap-2">
              <input value={form.code} onChange={e => setForm(f=>({...f,code:e.target.value.toUpperCase()}))}
                style={{...inp,flex:1,textTransform:"uppercase",fontFamily:"monospace",fontWeight:700}}/>
              <button onClick={aiGenerate} disabled={writing}
                className="px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold text-white"
                style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",flexShrink:0}}>
                {writing ? <Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/> : <Zap size={11}/>}
                AI
              </button>
            </div>
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Type</label>
              <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}
                style={{...inp}}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>
                {form.type === "PERCENTAGE" ? "Discount %" : "Amount (₦)"}
              </label>
              <input type="number" value={form.value} onChange={e => setForm(f=>({...f,value:e.target.value as any}))}
                style={inp}/>
            </div>
          </div>

          {/* Min order + Max uses */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Min Order (₦)</label>
              <input type="number" value={form.minOrder} placeholder="No minimum"
                onChange={e => setForm(f=>({...f,minOrder:e.target.value}))} style={inp}/>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Max Uses</label>
              <input type="number" value={form.maxUses} placeholder="Unlimited"
                onChange={e => setForm(f=>({...f,maxUses:e.target.value}))} style={inp}/>
            </div>
          </div>

          {/* Expires */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Expires At (optional)</label>
            <input type="datetime-local" value={form.expiresAt}
              onChange={e => setForm(f=>({...f,expiresAt:e.target.value}))} style={inp}/>
          </div>
        </div>

        <div className="p-5 flex gap-3" style={{borderTop:`1px solid ${t.border}`}}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{border:`1px solid ${t.border}`,background:"transparent",cursor:"pointer",color:t.muted}}>
            Cancel
          </button>
          <button onClick={() => createMut.mutate()} disabled={!form.code||createMut.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer"}}>
            {createMut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Plus size={13}/>}
            Create Coupon
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CouponsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
  };

  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string|null>(null);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["coupons", storeId],
    queryFn:  () => api.get(`/coupons/${storeId}`).then(r => r.data.data || []),
    enabled:  !!storeId,
  });

  const toggleMut = useMutation({
    mutationFn: (c: any) => api.patch(`/coupons/${storeId}/${c.id}`, { isActive: !c.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${storeId}/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["coupons"] }); },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>Coupons</h1>
          <p className="text-sm" style={{color:t.muted}}>{coupons?.length || 0} active discount codes</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer"}}>
          <Plus size={15}/> New Coupon
        </button>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-20" style={{color:t.muted}}>Loading...</div>
      ) : !coupons?.length ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          className="text-center py-20 rounded-2xl" style={{background:t.faint,border:`1px solid ${t.border}`}}>
          <Tag size={40} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p className="font-bold text-base mb-2" style={{color:t.text}}>No coupons yet</p>
          <p className="text-sm mb-6" style={{color:t.muted}}>Create your first discount code to boost sales</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer"}}>
            <Plus size={14}/> Create Coupon
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              {/* Code */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black font-mono tracking-wide" style={{color:t.text}}>{c.code}</span>
                  <button onClick={() => copyCode(c.code)}
                    style={{border:"none",background:"none",cursor:"pointer",color:t.muted,padding:2}}>
                    {copied===c.code ? <Check size={13} color="#10B981"/> : <Copy size={13}/>}
                  </button>
                </div>
                <p className="text-xs mt-0.5" style={{color:t.muted}}>
                  {c.type === "PERCENTAGE" ? `${c.value}% off` : c.type === "FIXED" ? `₦${c.value} off` : "Free shipping"}
                  {c.minOrder ? ` · min ₦${c.minOrder}` : ""}
                </p>
              </div>

              {/* Stats */}
              <div className="flex-1 flex items-center gap-6 min-w-0">
                <div className="text-center">
                  <p className="text-sm font-bold" style={{color:t.text}}>{c.usedCount || 0}</p>
                  <p className="text-xs" style={{color:t.muted}}>Used</p>
                </div>
                {c.maxUses && (
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{color:t.text}}>{c.maxUses}</p>
                    <p className="text-xs" style={{color:t.muted}}>Max</p>
                  </div>
                )}
                {c.expiresAt && (
                  <div className="text-center hidden sm:block">
                    <p className="text-xs font-semibold" style={{color:new Date(c.expiresAt)<new Date()?"#EF4444":t.text}}>
                      {new Date(c.expiresAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs" style={{color:t.muted}}>Expires</p>
                  </div>
                )}
              </div>

              {/* Status + Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{color:c.isActive?"#10B981":"#6B7280",background:c.isActive?"rgba(16,185,129,0.1)":"rgba(107,114,128,0.1)"}}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
                <button onClick={() => toggleMut.mutate(c)}
                  style={{border:"none",background:"none",cursor:"pointer",color:c.isActive?V.v400:t.muted}}>
                  {c.isActive ? <ToggleRight size={22}/> : <ToggleLeft size={22}/>}
                </button>
                <button onClick={() => deleteMut.mutate(c.id)}
                  style={{border:"none",background:"none",cursor:"pointer",color:"#EF4444",opacity:0.6}}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <CouponModal onClose={() => setShowModal(false)} storeId={storeId} t={t} isDark={isDark}/>}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
