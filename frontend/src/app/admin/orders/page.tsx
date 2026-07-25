"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../../../lib/api";
import { ShoppingCart, Search, RefreshCw, Package, Check, X, Truck, Clock } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLOR: Record<string,string> = {
  PENDING:"#F59E0B", PAID:"#10B981", SHIPPED:"#06B6D4",
  DELIVERED:"#8B5CF6", CANCELLED:"#EF4444", REFUNDED:"#6B7280"
};
const fmt = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page,   setPage]   = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", search, status, page],
    queryFn:  () => api.get("/admin/orders", { params:{ search, status, page, limit:25 } }).then(r => r.data),
  });

  const orders = data?.data || [];
  const total  = data?.pagination?.total || 0;

  const inp = "px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">All Orders</h1>
          <p className="text-sm text-gray-500">{total.toLocaleString()} total orders across all stores</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm">
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white dark:bg-white/5 flex-1 min-w-48">
          <Search size={13} className="text-gray-400"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Search order #, email..." className="flex-1 outline-none bg-transparent text-sm"/>
        </div>
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className={inp}>
          <option value="">All statuses</option>
          {["PENDING","PAID","SHIPPED","DELIVERED","CANCELLED","REFUNDED"].map(s=>(
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              {["Order","Store","Customer","Total","Status","Date"].map(h=>(
                <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({length:8}).map((_,i)=>(
              <tr key={i} className="border-b animate-pulse">
                {Array.from({length:6}).map((_,j)=>(
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-white/10 rounded"/></td>
                ))}
              </tr>
            )) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No orders found</td></tr>
            ) : orders.map((o:any) => (
              <motion.tr key={o.id} initial={{opacity:0}} animate={{opacity:1}}
                className="border-b hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-xs">#{o.orderNumber || o.id?.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{o.store?.name || "—"}</td>
                <td className="px-4 py-3">{o.customerEmail}</td>
                <td className="px-4 py-3 font-bold">{fmt(o.total)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ color:STATUS_COLOR[o.status]||"#6B7280", background:`${STATUS_COLOR[o.status]||"#6B7280"}18` }}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(o.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {total > 25 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-500">
            <span>Page {page} · {total} total</span>
            <div className="flex gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 rounded border disabled:opacity-40">←</button>
              <button onClick={()=>setPage(p=>p+1)} disabled={page*25>=total} className="px-3 py-1 rounded border disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
