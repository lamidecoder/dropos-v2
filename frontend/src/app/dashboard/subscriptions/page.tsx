"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Repeat, Users, DollarSign, TrendingUp, Check, X, Pause } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

function fmt(n: number) { return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0); }

const STATUS: Record<string,any> = {
  active:   {label:"Active",   color:V.green, bg:"rgba(16,185,129,0.1)"},
  paused:   {label:"Paused",   color:V.amber, bg:"rgba(245,158,11,0.1)"},
  cancelled:{label:"Cancelled",color:V.red,   bg:"rgba(239,68,68,0.1)"},
};

export default function SubscriptionsPage() {
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

  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions", storeId],
    queryFn:  () => api.get(`/product-subscriptions/${storeId}`).then(r => r.data.data || []),
    enabled:  !!storeId,
  });

  const actionMut = useMutation({
    mutationFn: ({id, status}: {id:string;status:string}) =>
      api.patch(`/product-subscriptions/${storeId}/${id}`, { status }),
    onSuccess: (_,v) => { toast.success(`Subscription ${v.status}`); qc.invalidateQueries({queryKey:["subscriptions"]}); },
  });

  const subs = data || [];
  const active = subs.filter((s:any) => s.status === "active");
  const mrr    = active.reduce((a:number, s:any) => a + (s.amount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{ color:t.text }}>Subscriptions</h1>
        <p className="text-sm" style={{ color:t.muted }}>Recurring orders from loyal customers</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:"Active Subs",  value:active.length,       color:V.green, icon:Users       },
          { label:"Monthly Revenue",value:fmt(mrr),           color:V.v400,  icon:DollarSign  },
          { label:"Total Subs",   value:subs.length,         color:V.amber, icon:Repeat      },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="p-4 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background:`${s.color}15` }}>
              <s.icon size={14} style={{ color:s.color }}/>
            </div>
            <p className="text-xl font-black mb-0.5" style={{ color:t.text }}>{s.value}</p>
            <p className="text-xs" style={{ color:t.muted }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16" style={{ color:t.muted }}>Loading...</div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
          <Repeat size={36} style={{ color:t.muted, margin:"0 auto 12px" }}/>
          <p className="font-bold text-base mb-2" style={{ color:t.text }}>No subscriptions yet</p>
          <p className="text-sm max-w-sm mx-auto" style={{ color:t.muted }}>
            When customers subscribe to recurring orders on your products, they appear here automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background:t.card, border:`1px solid ${t.border}` }}>
          <div className="grid grid-cols-12 px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color:t.muted, borderBottom:`1px solid ${t.border}` }}>
            <div className="col-span-4">Customer</div>
            <div className="col-span-3">Product</div>
            <div className="col-span-2 text-center">Amount</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
          {subs.map((s: any, i: number) => {
            const cfg = STATUS[s.status] || STATUS.active;
            return (
              <motion.div key={s.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
                className="grid grid-cols-12 items-center px-4 py-3"
                style={{ borderBottom:i<subs.length-1?`1px solid ${t.border}`:"none", background:i%2===0?"rgba(255,255,255,0.015)":"transparent" }}>
                <div className="col-span-4 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color:t.text }}>{s.customerName || s.customerEmail || "Customer"}</p>
                  <p className="text-xs" style={{ color:t.muted }}>Every {s.intervalDays || 30} days</p>
                </div>
                <div className="col-span-3 min-w-0">
                  <p className="text-sm truncate" style={{ color:t.muted }}>{s.productName || "Product"}</p>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-sm font-bold" style={{ color:t.text }}>{fmt(s.amount)}</p>
                </div>
                <div className="col-span-2 flex justify-center">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color:cfg.color, background:cfg.bg }}>{cfg.label}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  {s.status === "active" ? (
                    <button onClick={() => actionMut.mutate({id:s.id,status:"paused"})}
                      style={{ width:28, height:28, borderRadius:8, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Pause size={12} style={{ color:t.muted }}/>
                    </button>
                  ) : s.status === "paused" ? (
                    <button onClick={() => actionMut.mutate({id:s.id,status:"active"})}
                      style={{ width:28, height:28, borderRadius:8, border:"none", background:"rgba(16,185,129,0.15)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Check size={12} color={V.green}/>
                    </button>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
