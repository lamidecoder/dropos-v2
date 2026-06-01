"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { motion } from "framer-motion";
import { Search, Store, ExternalLink, Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };
const t = { border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };

export default function AdminStoresPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-stores", page, search],
    queryFn: () => adminAPI.get("/admin/stores", { params:{ page, limit:20, search } }).then((r:any) => r.data),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => adminAPI.patch(`/admin/stores/${id}`, data),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey:["admin-stores"] }); },
  });

  const stores = data?.data || []; const meta = data?.pagination || { total:0, pages:1 };

  return (
    <div>
      <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.04em" }}>Stores</h1>
        <p style={{ fontSize:13, color:t.muted }}>{meta.total?.toLocaleString()||0} stores on the platform</p>
      </motion.div>

      <div style={{ position:"relative", marginBottom:14 }}>
        <Search size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:t.muted }}/>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or slug..."
          style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:10, border:`1px solid ${t.border}`, background:"rgba(255,255,255,0.04)", color:t.text, fontSize:13, fontFamily:"inherit", outline:"none" }}/>
      </div>

      <div style={{ borderRadius:16, border:`1px solid ${t.border}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.02)" }}>
              {["Store","Owner","Plan","Products","Orders","Status",""].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", borderBottom:`1px solid ${t.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:t.muted }}>Loading...</td></tr>
            ) : stores.map((s: any, i: number) => (
              <tr key={s.id} style={{ borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:`${s.primaryColor||V.accent}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Store size={12} color={s.primaryColor||V.accent}/>
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>{s.name}</p>
                      <p style={{ fontSize:10, color:t.muted, margin:0 }}>/{s.slug}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <p style={{ fontSize:12, color:t.text, margin:0 }}>{s.owner?.name}</p>
                  <p style={{ fontSize:10, color:t.muted, margin:0 }}>{s.owner?.email}</p>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, background:"rgba(107,53,232,0.1)", color:V.accent }}>{s.owner?.plan||"FREE"}</span>
                </td>
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:700, color:t.text }}>{s._count?.products||0}</td>
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:700, color:t.text }}>{s._count?.orders||0}</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:s.status==="SUSPENDED"?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)", color:s.status==="SUSPENDED"?V.red:V.green }}>
                    {s.status||"ACTIVE"}
                  </span>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <a href={`/store/${s.slug}`} target="_blank" rel="noreferrer"
                      style={{ padding:"4px 7px", borderRadius:6, background:"rgba(255,255,255,0.05)", border:`1px solid ${t.border}`, color:t.muted, textDecoration:"none", display:"flex", alignItems:"center" }}>
                      <ExternalLink size={11}/>
                    </a>
                    <button onClick={() => updateMut.mutate({ id:s.id, data:{ status:s.status==="SUSPENDED"?"ACTIVE":"SUSPENDED" } })}
                      style={{ padding:"4px 7px", borderRadius:6, background:s.status==="SUSPENDED"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.07)", border:`1px solid ${s.status==="SUSPENDED"?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.15)"}`, color:s.status==="SUSPENDED"?V.green:V.red, cursor:"pointer", display:"flex", alignItems:"center" }}>
                      {s.status==="SUSPENDED" ? <CheckCircle size={11}/> : <Ban size={11}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize:12, color:t.muted, marginTop:10 }}>{meta.total} total stores · Page {page} of {meta.pages}</p>
    </div>
  );
}
