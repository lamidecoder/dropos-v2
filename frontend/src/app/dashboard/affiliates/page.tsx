"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Users2, Link2, Copy, Check, DollarSign, TrendingUp, Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B" };

export default function AffiliatesPage() {
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
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", commissionPct:10 });
  const [copied, setCopied] = useState<string|null>(null);

  const { data } = useQuery({
    queryKey: ["affiliates", storeId],
    queryFn:  () => api.get(`/affiliates/${storeId}`).then(r => r.data.data || []),
    enabled:  !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/affiliates/${storeId}`, form),
    onSuccess: () => { toast.success("Affiliate added!"); qc.invalidateQueries({queryKey:["affiliates"]}); setShowAdd(false); setForm({name:"",email:"",commissionPct:10}); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const affiliates = data || [];
  const totalSales = affiliates.reduce((a: number, af: any) => a + (af.totalSales || 0), 0);
  const totalPaid  = affiliates.reduce((a: number, af: any) => a + (af.totalPaid  || 0), 0);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(text); toast.success("Copied!"); setTimeout(() => setCopied(null), 2000); };
  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit" } as const;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>Affiliates</h1>
          <p className="text-sm" style={{color:t.muted}}>Let others promote your store and earn commission</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer"}}>
          <Plus size={15}/> Add Affiliate
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:"Total Affiliates", value:affiliates.length,  color:V.v400,  icon:Users2     },
          { label:"Total Sales",      value:`₦${totalSales.toLocaleString()}`, color:V.green, icon:TrendingUp },
          { label:"Commission Paid",  value:`₦${totalPaid.toLocaleString()}`,  color:V.amber, icon:DollarSign },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{background:`${s.color}15`}}>
              <s.icon size={14} style={{color:s.color}}/>
            </div>
            <p className="text-xl font-black mb-0.5" style={{color:t.text}}>{s.value}</p>
            <p className="text-xs" style={{color:t.muted}}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Affiliates list */}
      {affiliates.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{background:t.faint,border:`1px solid ${t.border}`}}>
          <Users2 size={40} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p className="font-bold text-base mb-2" style={{color:t.text}}>No affiliates yet</p>
          <p className="text-sm mb-6" style={{color:t.muted}}>Add people who can promote your store and earn commission on sales</p>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer"}}>
            <Plus size={14}/> Add First Affiliate
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {affiliates.map((af: any, i: number) => (
            <motion.div key={af.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white"
                style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>
                {af.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{color:t.text}}>{af.name}</p>
                <p className="text-xs" style={{color:t.muted}}>{af.email} · {af.commissionPct}% commission</p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-sm font-bold" style={{color:V.green}}>₦{(af.totalSales||0).toLocaleString()}</p>
                <p className="text-xs" style={{color:t.muted}}>sales</p>
              </div>
              <button onClick={() => copy(af.referralLink || `${window.location.origin}/store?ref=${af.code}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
                style={{border:`1px solid ${t.border}`,background:t.faint,cursor:"pointer",color:t.muted}}>
                {copied === af.referralLink ? <Check size={11} color={V.green}/> : <Copy size={11}/>}
                Copy Link
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}>
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`}}>
            <div className="flex items-center justify-between p-5" style={{borderBottom:`1px solid ${t.border}`}}>
              <h3 className="font-black text-base" style={{color:t.text}}>Add Affiliate</h3>
              <button onClick={() => setShowAdd(false)} style={{border:"none",background:"none",cursor:"pointer",color:t.muted}}><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Full Name</label>
                <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Affiliate name" style={inp}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="affiliate@email.com" style={inp}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Commission %</label>
                <input type="number" value={form.commissionPct} min={1} max={50}
                  onChange={e => setForm(f=>({...f,commissionPct:Number(e.target.value)}))} style={inp}/>
              </div>
            </div>
            <div className="p-5 flex gap-3" style={{borderTop:`1px solid ${t.border}`}}>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{border:`1px solid ${t.border}`,background:"transparent",cursor:"pointer",color:t.muted}}>Cancel</button>
              <button onClick={() => createMut.mutate()} disabled={!form.name||!form.email||createMut.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",opacity:!form.name||!form.email?0.6:1}}>
                {createMut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Plus size={13}/>}
                Add Affiliate
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
