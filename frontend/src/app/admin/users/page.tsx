"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { Search, Trash2, ChevronLeft, ChevronRight, Users, UserCheck, Ban, Crown, Filter } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)", faint:"rgba(255,255,255,0.02)" };

const STATUS_COLOR: Record<string,string> = { ACTIVE:V.green, PENDING_VERIFICATION:V.amber, SUSPENDED:V.red, BANNED:V.red };
const PLAN_COLOR:   Record<string,string> = { FREE:"rgba(255,255,255,0.3)", GROWTH:V.v400, PRO:"#F59E0B", ENTERPRISE:"#10B981" };

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan]     = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, status, plan],
    queryFn:  () => adminAPI.getUsers({ page, limit:20, search, status, plan }).then(r => r.data),
    keepPreviousData: true,
  });

  const deleteMut = useMutation({
    mutationFn: (id:string) => adminAPI.deleteUser(id),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({queryKey:["admin-users"]}); },
    onError: () => toast.error("Delete failed"),
  });

  const suspendMut = useMutation({
    mutationFn: ({id,status}:{id:string;status:string}) => adminAPI.updateUser(id,{status}),
    onSuccess: () => { toast.success("User updated"); qc.invalidateQueries({queryKey:["admin-users"]}); },
  });

  const users = data?.data || [];
  const meta  = data?.meta || { total:0, page:1, pages:1 };

  return (
    <div>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Users</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>{meta.total?.toLocaleString()||0} total users</p>
      </motion.div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200, display:"flex", alignItems:"center", gap:8, padding:"9px 14px", borderRadius:12, background:t.card, border:`1px solid ${t.border}` }}>
          <Search size={14} style={{ color:t.muted, flexShrink:0 }}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by name or email..."
            style={{ flex:1, background:"transparent", border:"none", outline:"none", color:t.text, fontSize:13, fontFamily:"inherit" }}/>
        </div>
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}
          style={{ padding:"9px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.card, color:t.muted, fontSize:13, outline:"none", cursor:"pointer", fontFamily:"inherit" }}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_VERIFICATION">Pending</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
        </select>
        <select value={plan} onChange={e=>{setPlan(e.target.value);setPage(1);}}
          style={{ padding:"9px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.card, color:t.muted, fontSize:13, outline:"none", cursor:"pointer", fontFamily:"inherit" }}>
          <option value="">All Plans</option>
          <option value="FREE">Free</option>
          <option value="GROWTH">Growth</option>
          <option value="PRO">Pro</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ borderRadius:16, overflow:"hidden", background:t.card, border:`1px solid ${t.border}` }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1fr 1fr 100px", gap:12, padding:"10px 16px", borderBottom:`1px solid ${t.border}` }}>
          {["User","Email","Plan","Status","Actions"].map(h => (
            <p key={h} style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted, margin:0 }}>{h}</p>
          ))}
        </div>
        {isLoading ? (
          <div style={{ textAlign:"center", padding:"40px", color:t.muted }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px" }}>
            <Users size={28} style={{ color:t.muted, margin:"0 auto 10px" }}/>
            <p style={{ color:t.muted, fontSize:13, margin:0 }}>No users found</p>
          </div>
        ) : users.map((u:any, i:number) => {
          const statusColor = STATUS_COLOR[u.status] || V.amber;
          const planColor   = PLAN_COLOR[u.subscription?.plan || "FREE"];
          return (
            <motion.div key={u.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
              style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1fr 1fr 100px", gap:12, alignItems:"center", padding:"12px 16px", borderBottom:`1px solid ${t.border}`, background:i%2===0?"transparent":t.faint }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {u.name?.charAt(0)||"U"}
                </div>
                <div style={{ minWidth:0 }}>
                  <Link href={`/admin/users/${u.id}`} style={{ fontSize:13, fontWeight:700, color:t.text, textDecoration:"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{u.name}</Link>
                  <p style={{ fontSize:11, color:t.muted, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p style={{ fontSize:12, color:t.muted, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
              <span style={{ fontSize:11, fontWeight:700, color:planColor, background:`${planColor}18`, padding:"3px 10px", borderRadius:99, width:"fit-content" }}>
                {u.subscription?.plan || "FREE"}
              </span>
              <span style={{ fontSize:11, fontWeight:700, color:statusColor, background:`${statusColor}15`, padding:"3px 10px", borderRadius:99, width:"fit-content" }}>
                {u.status?.replace("_"," ")||"ACTIVE"}
              </span>
              <div style={{ display:"flex", gap:4 }}>
                <button onClick={()=>suspendMut.mutate({id:u.id,status:u.status==="ACTIVE"?"SUSPENDED":"ACTIVE"})}
                  style={{ width:28, height:28, borderRadius:8, border:"none", background:u.status==="ACTIVE"?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                  title={u.status==="ACTIVE"?"Suspend":"Activate"}>
                  {u.status==="ACTIVE"?<Ban size={12} color={V.red}/>:<UserCheck size={12} color={V.green}/>}
                </button>
                <button onClick={()=>{if(confirm("Delete user?")){deleteMut.mutate(u.id);}}}
                  style={{ width:28, height:28, borderRadius:8, border:"none", background:"rgba(239,68,68,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Trash2 size={12} color={V.red}/>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {meta.pages > 1 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:16 }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{ width:32, height:32, borderRadius:10, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:page===1?0.3:1 }}>
            <ChevronLeft size={14} color={t.muted}/>
          </button>
          <span style={{ fontSize:13, color:t.muted }}>Page {page} of {meta.pages}</span>
          <button onClick={()=>setPage(p=>Math.min(meta.pages,p+1))} disabled={page===meta.pages}
            style={{ width:32, height:32, borderRadius:10, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:page===meta.pages?0.3:1 }}>
            <ChevronRight size={14} color={t.muted}/>
          </button>
        </div>
      )}
    </div>
  );
}
