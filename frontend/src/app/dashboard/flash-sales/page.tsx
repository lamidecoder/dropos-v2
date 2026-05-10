"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Flame, Plus, Clock, X, Loader2, Tag, Zap } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6" };

function Countdown({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setLeft("Ended"); return; }
      const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
      setLeft(`${h}h ${m}m ${s}s`);
    };
    tick(); const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return <span>{left}</span>;
}

export default function FlashSalesPage() {
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
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name:"", discountPct:20, bannerText:"", hours:24 });

  const { data: sales } = useQuery({
    queryKey: ["flash-sales", storeId],
    queryFn:  () => api.get(`/stores/${storeId}/flash-sales`).then(r => r.data.data || []),
    enabled:  !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => {
      const now = new Date();
      const endsAt = new Date(now.getTime() + form.hours * 3600000);
      return api.post(`/stores/${storeId}/flash-sales`, { ...form, startsAt: now, endsAt });
    },
    onSuccess: () => { toast.success("Flash sale started!"); qc.invalidateQueries({queryKey:["flash-sales"]}); setShow(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const endMut = useMutation({
    mutationFn: (id: string) => api.delete(`/stores/${storeId}/flash-sales/${id}`),
    onSuccess: () => { toast.success("Sale ended"); qc.invalidateQueries({queryKey:["flash-sales"]}); },
  });

  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit" } as const;
  const now = new Date();
  const active = sales?.filter((s: any) => new Date(s.endsAt) > now) || [];
  const past   = sales?.filter((s: any) => new Date(s.endsAt) <= now) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>Flash Sales</h1>
          <p className="text-sm" style={{color:t.muted}}>{active.length} active · {past.length} past</p>
        </div>
        <button onClick={() => setShow(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{background:"linear-gradient(135deg,#EF4444,#DC2626)",border:"none",cursor:"pointer"}}>
          <Flame size={15}/> Start Flash Sale
        </button>
      </motion.div>

      {/* Active */}
      {active.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:"#EF4444"}}>Live Now</p>
          <div className="space-y-3">
            {active.map((s: any, i: number) => (
              <motion.div key={s.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{background:t.card,border:"1px solid rgba(239,68,68,0.25)"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:"rgba(239,68,68,0.1)"}}>
                  <Flame size={18} color="#EF4444"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{color:t.text}}>{s.name || "Flash Sale"}</p>
                  <p className="text-xs mt-0.5" style={{color:t.muted}}>
                    {s.discountPct}% off · Ends in <strong style={{color:"#EF4444"}}><Countdown endsAt={s.endsAt}/></strong>
                  </p>
                </div>
                <button onClick={() => endMut.mutate(s.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{border:"1px solid rgba(239,68,68,0.3)",color:"#EF4444",background:"transparent",cursor:"pointer"}}>
                  End Sale
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!active.length && !past.length && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          className="text-center py-20 rounded-2xl" style={{background:t.faint,border:`1px solid ${t.border}`}}>
          <Flame size={40} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p className="font-bold text-base mb-2" style={{color:t.text}}>No flash sales yet</p>
          <p className="text-sm mb-6" style={{color:t.muted}}>Create a time-limited sale to boost revenue instantly</p>
          <button onClick={() => setShow(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{background:"linear-gradient(135deg,#EF4444,#DC2626)",border:"none",cursor:"pointer"}}>
            <Flame size={14}/> Start Flash Sale
          </button>
        </motion.div>
      )}

      {/* Past sales */}
      {past.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:t.muted}}>Past Sales</p>
          <div className="space-y-2">
            {past.slice(0,5).map((s: any, i: number) => (
              <div key={s.id} className="flex items-center gap-4 p-3.5 rounded-xl" style={{background:t.faint,border:`1px solid ${t.border}`}}>
                <Tag size={14} style={{color:t.muted,flexShrink:0}}/>
                <p className="text-sm flex-1" style={{color:t.muted}}>{s.name || "Flash Sale"} · {s.discountPct}% off</p>
                <p className="text-xs" style={{color:t.muted}}>{new Date(s.endsAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)"}}>
            <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{background:isDark?"#181230":"#fff",border:`1px solid ${t.border}`}}>
              <div className="flex items-center justify-between p-5" style={{borderBottom:`1px solid ${t.border}`}}>
                <h3 className="font-black text-base" style={{color:t.text}}>New Flash Sale</h3>
                <button onClick={() => setShow(false)} style={{border:"none",background:"none",cursor:"pointer",color:t.muted}}><X size={18}/></button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Sale Name</label>
                  <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                    placeholder="Summer Flash Sale" style={inp}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Discount %</label>
                    <input type="number" value={form.discountPct} min={1} max={90}
                      onChange={e => setForm(f=>({...f,discountPct:Number(e.target.value)}))} style={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Duration (hours)</label>
                    <input type="number" value={form.hours} min={1} max={72}
                      onChange={e => setForm(f=>({...f,hours:Number(e.target.value)}))} style={inp}/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Banner Text (optional)</label>
                  <input value={form.bannerText} onChange={e => setForm(f=>({...f,bannerText:e.target.value}))}
                    placeholder="24-hour sale! Don't miss out" style={inp}/>
                </div>
              </div>
              <div className="p-5 flex gap-3" style={{borderTop:`1px solid ${t.border}`}}>
                <button onClick={() => setShow(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{border:`1px solid ${t.border}`,background:"transparent",cursor:"pointer",color:t.muted}}>Cancel</button>
                <button onClick={() => createMut.mutate()} disabled={createMut.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{background:"linear-gradient(135deg,#EF4444,#DC2626)",border:"none",cursor:"pointer"}}>
                  {createMut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Flame size={13}/>}
                  Start Sale
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
