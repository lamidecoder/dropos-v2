"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { motion } from "framer-motion";
import { Users, UserCheck, Ban, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { PageHeader, FilterBar, SearchInput, SelectFilter, DataTable, Badge, Pagination, StatGrid, StatCard } from "../../../components/admin/AdminTable";

const V = { accent:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };
const STATUS_BG: Record<string,string> = { ACTIVE:"rgba(16,185,129,0.1)", PENDING_VERIFICATION:"rgba(245,158,11,0.1)", SUSPENDED:"rgba(239,68,68,0.1)", BANNED:"rgba(239,68,68,0.15)" };
const STATUS_C:  Record<string,string> = { ACTIVE:V.green, PENDING_VERIFICATION:V.amber, SUSPENDED:V.red, BANNED:V.red };
const PLAN_BG:   Record<string,string> = { FREE:"rgba(255,255,255,0.07)", GROWTH:"rgba(107,53,232,0.12)", PRO:"rgba(245,158,11,0.1)", ENTERPRISE:"rgba(16,185,129,0.1)" };
const PLAN_C:    Record<string,string> = { FREE:"rgba(255,255,255,0.4)", GROWTH:V.accent, PRO:V.amber, ENTERPRISE:V.green };

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan]     = useState("");

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-users", page, search, status, plan],
    queryFn:  () => adminAPI.getUsers({ page, limit:20, search, status, plan }).then((r:any) => r.data),
    placeholderData: (prev:any) => prev,
  });

  const { data: statsData } = useQuery<any>({
    queryKey: ["admin-overview"],
    queryFn:  () => adminAPI.getStats().then((r:any) => r.data.data),
  });

  const deleteMut  = useMutation({
    mutationFn: (id:string) => adminAPI.deleteUser(id),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey:["admin-users"] }); },
    onError:   () => toast.error("Delete failed"),
  });
  const suspendMut = useMutation({
    mutationFn: ({id,s}:{id:string;s:string}) => s==="SUSPENDED" ? adminAPI.unbanUser(id) : adminAPI.banUser(id),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey:["admin-users"] }); },
  });

  const users = data?.data || [];
  const meta  = data?.meta || data?.pagination || { total:0, page:1, pages:1 };
  const s     = statsData;

  const rows = users.map((u: any) => ({
    user: (
      <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0 }}>
        <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,#2D1B69,#6B35E8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0 }}>
          {u.name?.charAt(0)||"U"}
        </div>
        <div style={{ minWidth:0 }}>
          <Link href={`/admin/users/${u.id}`} style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.9)", textDecoration:"none", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {u.name}
          </Link>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
        </div>
      </div>
    ),
    plan:   <Badge label={u.plan||"FREE"} color={PLAN_C[u.plan]||PLAN_C.FREE} bg={PLAN_BG[u.plan]||PLAN_BG.FREE}/>,
    status: <Badge label={u.status||"ACTIVE"} color={STATUS_C[u.status]||V.green} bg={STATUS_BG[u.status]||STATUS_BG.ACTIVE}/>,
    stores: <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>{u._count?.stores||0}</span>,
    joined: <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{new Date(u.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"2-digit"})}</span>,
    actions: (
      <div style={{ display:"flex", gap:5 }}>
        <Link href={`/admin/users/${u.id}`}
          style={{ padding:"5px 8px", borderRadius:7, background:"rgba(107,53,232,0.1)", border:"1px solid rgba(107,53,232,0.2)", color:"#A78BFA", textDecoration:"none", display:"flex", alignItems:"center" }}>
          <ExternalLink size={11}/>
        </Link>
        <button onClick={() => suspendMut.mutate({ id:u.id, s:u.status })}
          style={{ padding:"5px 8px", borderRadius:7, background:u.status==="SUSPENDED"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.07)", border:`1px solid ${u.status==="SUSPENDED"?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.12)"}`, color:u.status==="SUSPENDED"?V.green:V.red, cursor:"pointer", display:"flex", alignItems:"center" }}>
          {u.status==="SUSPENDED" ? <UserCheck size={11}/> : <Ban size={11}/>}
        </button>
        <button onClick={() => { if(confirm(`Delete ${u.name}?`)) deleteMut.mutate(u.id); }}
          style={{ padding:"5px 8px", borderRadius:7, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.1)", color:V.red, cursor:"pointer", display:"flex", alignItems:"center" }}>
          <Trash2 size={11}/>
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <PageHeader title="Users" sub={`${(meta.total||0).toLocaleString()} merchants on the platform`}/>

      <StatGrid cols={4}>
        <StatCard label="Total users"    value={(s?.users?.total||0).toLocaleString()}     color={V.accent}  icon={Users}/>
        <StatCard label="Active"         value={(s?.users?.active||0).toLocaleString()}    color={V.green}   icon={UserCheck}/>
        <StatCard label="Suspended"      value={(s?.users?.suspended||0).toLocaleString()} color={V.red}     icon={Ban}/>
        <StatCard label="This month"     value={`+${s?.users?.newThisMonth||0}`}           color={V.cyan}    icon={Users}/>
      </StatGrid>

      <FilterBar>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or email..."/>
        <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={[
          { value:"", label:"All status" },
          { value:"ACTIVE", label:"Active" },
          { value:"PENDING_VERIFICATION", label:"Pending" },
          { value:"SUSPENDED", label:"Suspended" },
          { value:"BANNED", label:"Banned" },
        ]}/>
        <SelectFilter value={plan} onChange={v => { setPlan(v); setPage(1); }} options={[
          { value:"", label:"All plans" },
          { value:"FREE", label:"Free" },
          { value:"GROWTH", label:"Growth" },
          { value:"PRO", label:"Pro" },
          { value:"ENTERPRISE", label:"Enterprise" },
        ]}/>
      </FilterBar>

      <DataTable
        loading={isLoading}
        cols={[
          { key:"user",    label:"User",    width:"2fr"    },
          { key:"plan",    label:"Plan",    width:"100px"  },
          { key:"status",  label:"Status",  width:"120px"  },
          { key:"stores",  label:"Stores",  width:"70px",  hide:"sm" },
          { key:"joined",  label:"Joined",  width:"90px",  hide:"md" },
          { key:"actions", label:"",        width:"110px"  },
        ]}
        rows={rows}
        empty="No users found"
      />

      <Pagination page={page} pages={meta.pages||1} total={meta.total||0} onPage={setPage}/>
    </div>
  );
}
