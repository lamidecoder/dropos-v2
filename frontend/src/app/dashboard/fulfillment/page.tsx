"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Package, Truck, Check, Clock, Zap, RefreshCw, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };

const STATUS: Record<string,any> = {
  UNFULFILLED: { label:"Unfulfilled", color:V.amber, bg:"rgba(245,158,11,0.1)",  icon:Clock   },
  PROCESSING:  { label:"Processing",  color:V.cyan,  bg:"rgba(6,182,212,0.1)",  icon:RefreshCw },
  SHIPPED:     { label:"Shipped",     color:V.green, bg:"rgba(16,185,129,0.1)", icon:Truck   },
  DELIVERED:   { label:"Delivered",   color:V.v400,  bg:"rgba(107,53,232,0.1)", icon:Check   },
  FAILED:      { label:"Failed",      color:V.red,   bg:"rgba(239,68,68,0.1)",  icon:AlertTriangle },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
}

export default function FulfillmentPage() {
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
  const [tab, setTab] = useState("UNFULFILLED");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["fulfillment", storeId, tab],
    queryFn:  async () => {
      const r = await api.get(`/fulfillment/status/${storeId}?status=${tab}`);
      const d = r.data?.data;
      return Array.isArray(d) ? d : [];
    },
    enabled:  !!storeId,
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ["fulfillment-stats", storeId],
    queryFn:  () => api.get(`/analytics/${storeId}?period=30`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const fulfillMut = useMutation({
    mutationFn: (orderId: string) => api.post(`/fulfillment/${orderId}/fulfill`, { storeId }),
    onSuccess: () => { toast.success("Order fulfilled!"); qc.invalidateQueries({queryKey:["fulfillment"]}); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Fulfillment failed"),
  });

  const orders = Array.isArray(data) ? data : [];
  const pending    = orders.filter((o: any) => o.fulfillmentStatus === "UNFULFILLED").length;
  const processing = orders.filter((o: any) => o.fulfillmentStatus === "PROCESSING").length;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{ color:t.text }}>Fulfilment</h1>
          <p className="text-sm" style={{ color:t.muted }}>
            {pending > 0 && <span style={{ color:V.amber }}>{pending} need attention · </span>}
            KIRO auto-fulfils with connected suppliers
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", color:t.muted }}>
            <RefreshCw size={12}/> Refresh
          </button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background:"rgba(107,53,232,0.08)", border:"1px solid rgba(107,53,232,0.2)", color:V.v400 }}>
            <Zap size={12}/> KIRO Auto-Pilot {processing > 0 ? "Active" : "Ready"}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label:"Pending",    value:pending,                                     color:V.amber },
          { label:"Processing", value:processing,                                  color:V.cyan  },
          { label:"Shipped Today",value:stats?.shippedToday || 0,                  color:V.green },
          { label:"Avg Ship Time",value:`${stats?.avgShipDays || 2}d`,             color:V.v400  },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="p-4 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
            <p className="text-2xl font-black mb-0.5" style={{ color:s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color:t.muted }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {Object.entries(STATUS).map(([id, cfg]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background:tab===id?cfg.bg:"transparent", color:tab===id?cfg.color:t.muted, border:`1px solid ${tab===id?cfg.color+"40":t.border}`, cursor:"pointer" }}>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="text-center py-16" style={{ color:t.muted }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
          <Package size={36} style={{ color:t.muted, margin:"0 auto 12px" }}/>
          <p className="font-bold text-base mb-2" style={{ color:t.text }}>No {tab.toLowerCase()} orders</p>
          <p className="text-sm" style={{ color:t.muted }}>
            {tab === "UNFULFILLED" ? "All orders are fulfilled. Great work!" : `No ${tab.toLowerCase()} orders right now.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any, i: number) => {
            const cfg = STATUS[order.fulfillmentStatus || "UNFULFILLED"] || STATUS["UNFULFILLED"];
            const Icon = cfg.icon;
            return (
              <motion.div key={order.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                className="flex items-center gap-4 p-4 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:cfg.bg }}>
                  <Icon size={16} style={{ color:cfg.color }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold" style={{ color:t.text }}>#{order.orderNumber || order.id?.slice(-8)}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color:cfg.color, background:cfg.bg }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color:t.muted }}>
                    {order.customerName || order.customer?.name || "Customer"} · {fmt(order.total)}
                    {order.trackingNumber && ` · ${order.trackingNumber}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noreferrer"
                      style={{ width:32, height:32, borderRadius:10, border:`1px solid ${t.border}`, background:t.faint, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                      <ExternalLink size={13} style={{ color:t.muted }}/>
                    </a>
                  )}
                  {(order.fulfillmentStatus === "UNFULFILLED" || !order.fulfillmentStatus) && (
                    <button onClick={() => fulfillMut.mutate(order.id)}
                      disabled={fulfillMut.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                      style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer" }}>
                      {fulfillMut.isPending ? <Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/> : <Zap size={11}/>}
                      Fulfil
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
