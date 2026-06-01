"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { ShoppingCart, DollarSign, CheckCircle, Clock } from "lucide-react";
import { PageHeader, FilterBar, SearchInput, SelectFilter, DataTable, Badge, Pagination, StatGrid, StatCard } from "../../../components/admin/AdminTable";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };
const STATUS_C: Record<string,string> = { PENDING:V.amber, PROCESSING:V.cyan, SHIPPED:V.accent, DELIVERED:V.green, CANCELLED:V.red, REFUNDED:"rgba(255,255,255,0.35)" };

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-orders", page, search, status],
    queryFn: () => adminAPI.get("/admin/orders", { params:{ page, limit:25, search, status } }).then((r:any) => r.data),
  });
  const { data: stats } = useQuery<any>({
    queryKey: ["admin-overview"], queryFn: () => adminAPI.getStats().then((r:any) => r.data.data),
  });

  const orders = data?.data || [];
  const meta   = data?.pagination || { total:0, pages:1 };
  const s      = stats;

  const rows = orders.map((o: any) => ({
    order:    <span style={{ fontSize:12, fontFamily:"monospace", fontWeight:700, color:"#A78BFA" }}>#{o.orderNumber}</span>,
    store:    <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{o.store?.name||"—"}</span>,
    customer: <div><p style={{ fontSize:12, color:"rgba(255,255,255,0.8)", margin:0 }}>{o.customerName||"—"}</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{o.customerEmail}</p></div>,
    total:    <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.9)" }}>₦{Number(o.total||0).toLocaleString()}</span>,
    status:   <Badge label={o.status} color={STATUS_C[o.status]||V.amber} bg={`${STATUS_C[o.status]||V.amber}14`}/>,
    date:     <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>{new Date(o.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short"})}</span>,
  }));

  return (
    <div>
      <PageHeader title="Orders" sub={`${(meta.total||0).toLocaleString()} orders across all stores`}/>
      <StatGrid cols={4}>
        <StatCard label="Total orders"     value={(s?.orders?.total||0).toLocaleString()} color={V.accent} icon={ShoppingCart}/>
        <StatCard label="Total revenue"    value={`₦${((s?.revenue?.total||0)/1000).toFixed(0)}k`} color={V.green} icon={DollarSign}/>
        <StatCard label="Delivered"        value={(s?.orders?.delivered||0).toLocaleString()} color={V.green} icon={CheckCircle}/>
        <StatCard label="Pending"          value={(s?.orders?.pending||0).toLocaleString()} color={V.amber} icon={Clock}/>
      </StatGrid>
      <FilterBar>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by order # or email..."/>
        <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={[
          { value:"", label:"All status" },
          ...["PENDING","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"].map(s=>({ value:s, label:s }))
        ]}/>
      </FilterBar>
      <DataTable loading={isLoading}
        cols={[
          { key:"order",    label:"Order",    width:"100px"         },
          { key:"store",    label:"Store",    width:"1fr",  hide:"sm" },
          { key:"customer", label:"Customer", width:"1.5fr"         },
          { key:"total",    label:"Total",    width:"100px"         },
          { key:"status",   label:"Status",   width:"110px"         },
          { key:"date",     label:"Date",     width:"80px", hide:"md" },
        ]} rows={rows} empty="No orders found"/>
      <Pagination page={page} pages={meta.pages||1} total={meta.total||0} onPage={setPage}/>
    </div>
  );
}
