"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { Store, Package, ShoppingCart, Ban, CheckCircle, ExternalLink } from "lucide-react";
import { PageHeader, FilterBar, SearchInput, SelectFilter, DataTable, Badge, Pagination, StatGrid, StatCard } from "../../../components/admin/AdminTable";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };

export default function AdminStoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-stores", page, search, status],
    queryFn: () => adminAPI.get("/admin/stores", { params:{ page, limit:20, search, status } }).then((r:any) => r.data),
  });
  const { data: stats } = useQuery<any>({
    queryKey: ["admin-overview"], queryFn: () => adminAPI.getStats().then((r:any) => r.data.data),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => adminAPI.patch(`/admin/stores/${id}`, data),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey:["admin-stores"] }); },
  });

  const stores = data?.data || [];
  const meta   = data?.pagination || { total:0, pages:1 };
  const s      = stats;

  const rows = stores.map((st: any) => ({
    store: (
      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:`${st.primaryColor||V.accent}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Store size={13} color={st.primaryColor||V.accent}/>
        </div>
        <div style={{ minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.9)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{st.name}</p>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>/{st.slug}</p>
        </div>
      </div>
    ),
    owner:    <div><p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", margin:0 }}>{st.owner?.name}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{st.owner?.email}</p></div>,
    plan:     <Badge label={st.owner?.plan||"FREE"} color={V.accent} bg="rgba(107,53,232,0.1)"/>,
    products: <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>{st._count?.products||0}</span>,
    orders:   <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>{st._count?.orders||0}</span>,
    status:   <Badge label={st.status||"ACTIVE"} color={st.status==="SUSPENDED"?V.red:V.green} bg={st.status==="SUSPENDED"?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)"}/>,
    actions: (
      <div style={{ display:"flex", gap:5 }}>
        <a href={`/store/${st.slug}`} target="_blank" rel="noreferrer"
          style={{ padding:"4px 7px", borderRadius:6, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.4)", textDecoration:"none", display:"flex", alignItems:"center" }}>
          <ExternalLink size={11}/>
        </a>
        <button onClick={() => updateMut.mutate({ id:st.id, data:{ status:st.status==="SUSPENDED"?"ACTIVE":"SUSPENDED" } })}
          style={{ padding:"4px 7px", borderRadius:6, background:st.status==="SUSPENDED"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.07)", border:`1px solid ${st.status==="SUSPENDED"?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.12)"}`, color:st.status==="SUSPENDED"?V.green:V.red, cursor:"pointer", display:"flex", alignItems:"center" }}>
          {st.status==="SUSPENDED" ? <CheckCircle size={11}/> : <Ban size={11}/>}
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <PageHeader title="Stores" sub={`${(meta.total||0).toLocaleString()} stores on the platform`}/>
      <StatGrid cols={3}>
        <StatCard label="Total stores"  value={(s?.stores?.total||0).toLocaleString()}  color={V.accent} icon={Store}/>
        <StatCard label="Active"        value={(s?.stores?.active||0).toLocaleString()} color={V.green}  icon={CheckCircle}/>
        <StatCard label="Total orders"  value={(s?.orders?.total||0).toLocaleString()}  color={V.amber}  icon={ShoppingCart}/>
      </StatGrid>
      <FilterBar>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search stores..."/>
        <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={[
          { value:"", label:"All status" }, { value:"ACTIVE", label:"Active" }, { value:"SUSPENDED", label:"Suspended" },
        ]}/>
      </FilterBar>
      <DataTable loading={isLoading}
        cols={[
          { key:"store",    label:"Store",    width:"2fr"          },
          { key:"owner",    label:"Owner",    width:"1.5fr", hide:"sm" },
          { key:"plan",     label:"Plan",     width:"90px"         },
          { key:"products", label:"Products", width:"80px",  hide:"md" },
          { key:"orders",   label:"Orders",   width:"70px",  hide:"md" },
          { key:"status",   label:"Status",   width:"100px"        },
          { key:"actions",  label:"",         width:"80px"         },
        ]} rows={rows} empty="No stores found"/>
      <Pagination page={page} pages={meta.pages||1} total={meta.total||0} onPage={setPage}/>
    </div>
  );
}
