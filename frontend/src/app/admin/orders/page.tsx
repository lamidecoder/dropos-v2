"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };
const t = { border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };

const STATUS_COLOR: Record<string,string> = { PENDING:V.amber, PROCESSING:V.cyan, SHIPPED:V.accent, DELIVERED:V.green, CANCELLED:V.red, REFUNDED:"rgba(255,255,255,0.3)" };

function fmtNGN(n: number) { return `₦${Number(n||0).toLocaleString()}`; }

export default function AdminOrdersPage() {
  const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-orders", page, search, status],
    queryFn: () => adminAPI.get("/admin/orders", { params:{ page, limit:25, search, status } }).then((r:any) => r.data),
  });

  const orders = data?.data || []; const meta = data?.pagination || { total:0, pages:1 };

  return (
    <div>
      <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.04em" }}>All Orders</h1>
        <p style={{ fontSize:13, color:t.muted }}>{meta.total?.toLocaleString()||0} orders across all stores</p>
      </motion.div>

      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:t.muted }}/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by order # or email..."
            style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:10, border:`1px solid ${t.border}`, background:"rgba(255,255,255,0.04)", color:t.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          style={{ padding:"9px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:"rgba(255,255,255,0.04)", color:t.text, fontSize:13, fontFamily:"inherit", outline:"none" }}>
          <option value="">All statuses</option>
          {["PENDING","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ borderRadius:16, border:`1px solid ${t.border}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.02)" }}>
              {["Order #","Store","Customer","Total","Status","Date"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", borderBottom:`1px solid ${t.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:t.muted }}>Loading...</td></tr>
            : orders.length === 0 ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:t.muted }}>No orders</td></tr>
            : orders.map((o: any) => (
              <tr key={o.id} style={{ borderBottom:`1px solid rgba(255,255,255,0.03)` }}>
                <td style={{ padding:"11px 14px" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#A78BFA", fontFamily:"monospace" }}>#{o.orderNumber}</span>
                </td>
                <td style={{ padding:"11px 14px", fontSize:12, color:t.text }}>{o.store?.name||"—"}</td>
                <td style={{ padding:"11px 14px" }}>
                  <p style={{ fontSize:12, color:t.text, margin:0 }}>{o.customerName||"—"}</p>
                  <p style={{ fontSize:10, color:t.muted, margin:0 }}>{o.customerEmail}</p>
                </td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700, color:t.text }}>{fmtNGN(o.total)}</td>
                <td style={{ padding:"11px 14px" }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:99, background:`${STATUS_COLOR[o.status]||V.amber}12`, color:STATUS_COLOR[o.status]||V.amber }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding:"11px 14px", fontSize:11, color:t.muted }}>
                  {new Date(o.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
        <span style={{ fontSize:12, color:t.muted }}>Page {page} of {meta.pages}</span>
        <div style={{ display:"flex", gap:6 }}>
          {page > 1 && <button onClick={() => setPage(p=>p-1)} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${t.border}`, background:"transparent", color:t.muted, cursor:"pointer", fontSize:12 }}>Prev</button>}
          {page < meta.pages && <button onClick={() => setPage(p=>p+1)} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${t.border}`, background:"transparent", color:t.muted, cursor:"pointer", fontSize:12 }}>Next</button>}
        </div>
      </div>
    </div>
  );
}
