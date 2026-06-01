"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { CreditCard, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { PageHeader, FilterBar, SearchInput, SelectFilter, DataTable, Badge, Pagination, StatGrid, StatCard } from "../../../components/admin/AdminTable";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };

function fmtNGN(n: number) { return `₦${Number(n||0).toLocaleString()}`; }

export default function AdminPaymentsPage() {
  const [page, setPage]       = useState(1);
  const [gateway, setGateway] = useState("");
  const [status, setStatus]   = useState("");

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-payments", page, gateway, status],
    queryFn: () => adminAPI.get("/admin/payments", { params:{ page, limit:25, gateway, status } }).then((r:any) => r.data),
  });
  const { data: stats } = useQuery<any>({
    queryKey: ["admin-overview"],
    queryFn: () => adminAPI.getStats().then((r:any) => r.data.data),
  });

  const payments = data?.data || [];
  const meta     = data?.pagination || { total:0, pages:1 };
  const s = stats;

  const STATUS_C:  Record<string,string> = { SUCCESS:"#10B981", PENDING:"#F59E0B", FAILED:"#EF4444", REFUNDED:"rgba(255,255,255,0.4)" };
  const STATUS_BG: Record<string,string> = { SUCCESS:"rgba(16,185,129,0.1)", PENDING:"rgba(245,158,11,0.1)", FAILED:"rgba(239,68,68,0.1)", REFUNDED:"rgba(255,255,255,0.05)" };

  const rows = payments.map((p: any) => ({
    ref:     <span style={{ fontSize:12, fontFamily:"monospace", color:"#A78BFA", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{p.reference}</span>,
    store:   <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{p.order?.store?.name||"—"}</span>,
    amount:  <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.9)" }}>{fmtNGN(p.amount)}</span>,
    fee:     <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{fmtNGN(p.platformFee||0)}</span>,
    gateway: <Badge label={p.gateway||"—"} color={p.gateway==="PAYSTACK"?V.amber:V.accent} bg={p.gateway==="PAYSTACK"?"rgba(245,158,11,0.1)":"rgba(107,53,232,0.1)"}/>,
    status:  <Badge label={p.status} color={STATUS_C[p.status]||V.amber} bg={STATUS_BG[p.status]||"rgba(245,158,11,0.1)"}/>,
    date:    <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{new Date(p.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short"})}</span>,
  }));

  return (
    <div>
      <PageHeader title="Payments" sub={`${(meta.total||0).toLocaleString()} transactions on the platform`}/>

      <StatGrid cols={4}>
        <StatCard label="Total revenue"   value={fmtNGN(s?.revenue?.total||0)}          color={V.green}  icon={TrendingUp}/>
        <StatCard label="Platform fees"   value={fmtNGN(s?.fees?.total||0)}              color={V.accent} icon={CreditCard}/>
        <StatCard label="This month"      value={fmtNGN(s?.revenue?.thisMonth||0)}       color={V.cyan}   icon={CheckCircle}/>
        <StatCard label="Failed payments" value={(s?.failedPayments||0).toLocaleString()} color={V.red}   icon={AlertCircle}/>
      </StatGrid>

      <FilterBar>
        <SelectFilter value={gateway} onChange={v => { setGateway(v); setPage(1); }} options={[
          { value:"", label:"All gateways" },
          { value:"PAYSTACK", label:"Paystack" },
          { value:"STRIPE", label:"Stripe" },
        ]}/>
        <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={[
          { value:"", label:"All status" },
          { value:"SUCCESS", label:"Success" },
          { value:"PENDING", label:"Pending" },
          { value:"FAILED", label:"Failed" },
          { value:"REFUNDED", label:"Refunded" },
        ]}/>
      </FilterBar>

      <DataTable
        loading={isLoading}
        cols={[
          { key:"ref",     label:"Reference",  width:"1.8fr" },
          { key:"store",   label:"Store",       width:"1fr",   hide:"sm" },
          { key:"amount",  label:"Amount",      width:"100px" },
          { key:"fee",     label:"Fee",         width:"80px",  hide:"md" },
          { key:"gateway", label:"Gateway",     width:"90px",  hide:"sm" },
          { key:"status",  label:"Status",      width:"90px"  },
          { key:"date",    label:"Date",        width:"80px",  hide:"md" },
        ]}
        rows={rows}
        empty="No payments found"
      />
      <Pagination page={page} pages={meta.pages||1} total={meta.total||0} onPage={setPage}/>
    </div>
  );
}
