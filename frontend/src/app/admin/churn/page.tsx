"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../../../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown, Users, AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminChurnPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-churn"],
    queryFn: () => api.get("/admin/churn").then(r => r.data.data),
    refetchInterval: 60_000,
  });

  const stats = [
    { label:"Churned (30d)",  value:data?.churned || 0,        color:"#EF4444", icon:TrendingDown },
    { label:"At Risk",        value:data?.atRisk  || 0,        color:"#F59E0B", icon:AlertTriangle },
    { label:"Churn Rate",     value:`${data?.churnRate || 0}%`,color:"#8B5CF6", icon:Users        },
  ];

  const suggestions = [
    "Send win-back email to churned merchants with 2-month free Growth offer",
    "Reach out personally to 'at risk' merchants who haven't logged in 14+ days",
    "Add a cancellation flow that offers a discount before they leave",
    "Survey churned merchants — ask why they left in 1 question",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Churn Analysis</h1>
          <p className="text-sm text-gray-500">Monitor merchant retention and at-risk accounts</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm">
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="p-5 rounded-2xl border bg-white dark:bg-white/5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background:`${s.color}15` }}>
              <s.icon size={16} style={{ color:s.color }}/>
            </div>
            <p className="text-2xl font-black mb-0.5" style={{ color:s.color }}>{isLoading?"—":s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {data?.monthlyChurn?.length > 0 && (
        <div className="rounded-2xl border bg-white dark:bg-white/5 p-5 mb-6">
          <p className="font-bold text-sm mb-4">Monthly Churn (last 6 months)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.monthlyChurn}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
              <XAxis dataKey="month" tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:10, border:"1px solid #e5e7eb", fontSize:12 }}/>
              <Bar dataKey="churned" fill="#EF4444" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations */}
      <div className="rounded-2xl border bg-white dark:bg-white/5 p-5">
        <p className="font-bold text-sm mb-4">💡 Recommended actions</p>
        <div className="flex flex-col gap-3">
          {suggestions.map((s,i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10">
              <span className="text-purple-600 font-bold text-sm flex-shrink-0">{i+1}.</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
