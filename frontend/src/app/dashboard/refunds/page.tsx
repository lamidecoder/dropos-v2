"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { RefreshCw, Check, X, AlertCircle, DollarSign, Clock } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

const STATUS_CONFIG: Record<string,any> = {
  PENDING:   {label:"Pending",   color:V.amber, bg:"rgba(245,158,11,0.1)"},
  APPROVED:  {label:"Approved",  color:V.green, bg:"rgba(16,185,129,0.1)"},
  REJECTED:  {label:"Rejected",  color:V.red,   bg:"rgba(239,68,68,0.1)"},
  PROCESSED: {label:"Processed", color:V.v400,  bg:"rgba(107,53,232,0.1)"},
};

function fmt(n: number) { return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0); }

export default function RefundsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [tab, setTab] = useState("PENDING");

  const { data, isLoading } = useQuery({
    queryKey: ["refunds", storeId, tab],
    queryFn: () => api.get(`/refunds/${storeId}?status=${tab}`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const actionMut = useMutation({
    mutationFn: ({id, action}: {id:string;action:string}) =>
      api.patch(`/refunds/${storeId}/${id}`, { status: action }),
    onSuccess: (_, vars) => {
      toast.success(vars.action === "APPROVED" ? "Refund approved" : "Refund rejected");
      qc.invalidateQueries({queryKey:["refunds"]});
    },
    onError: () => toast.error("Action failed"),
  });

  const refunds = data || [];
  const totalAmt = refunds.reduce((a:number,r:any) => a+(r.amount||0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>Refunds</h1>
          <p className="text-sm" style={{color:t.muted}}>{refunds.length} {tab.toLowerCase()} · {fmt(totalAmt)} total</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {["PENDING","APPROVED","REJECTED","PROCESSED"].map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setTab(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{background:tab===s?cfg.bg:"transparent",color:tab===s?cfg.color:t.muted,border:`1px solid ${tab===s?cfg.color+"40":t.border}`,cursor:"pointer"}}>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="text-center py-20" style={{color:t.muted}}>Loading...</div>
      ) : refunds.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{background:t.faint,border:`1px solid ${t.border}`}}>
          <RefreshCw size={36} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p className="font-bold text-base mb-1" style={{color:t.text}}>No {tab.toLowerCase()} refunds</p>
          <p className="text-sm" style={{color:t.muted}}>Refund requests from customers appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {refunds.map((r:any, i:number) => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.PENDING;
            return (
              <motion.div key={r.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${cfg.color}15`}}>
                  <RefreshCw size={16} style={{color:cfg.color}}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{color:t.text}}>Order #{r.orderNumber || r.orderId?.slice(-8)}</p>
                  <p className="text-xs mt-0.5" style={{color:t.muted}}>
                    {r.reason || "Customer requested refund"} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{color:t.text}}>{fmt(r.amount)}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{color:cfg.color,background:cfg.bg}}>{cfg.label}</span>
                </div>
                {r.status === "PENDING" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => actionMut.mutate({id:r.id,action:"APPROVED"})}
                      style={{width:32,height:32,borderRadius:10,border:"none",background:"rgba(16,185,129,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Check size={14} color={V.green}/>
                    </button>
                    <button onClick={() => actionMut.mutate({id:r.id,action:"REJECTED"})}
                      style={{width:32,height:32,borderRadius:10,border:"none",background:"rgba(239,68,68,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <X size={14} color={V.red}/>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
