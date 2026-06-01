"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader, FilterBar, SelectFilter, DataTable, Badge, Pagination, StatGrid, StatCard } from "../../../components/admin/AdminTable";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444", cyan:"#06B6D4" };

export default function AdminSupportPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState("OPEN");
  const [expanded, setExpanded] = useState<string|null>(null);

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-support", page, status],
    queryFn: () => adminAPI.get("/admin/support", { params:{ page, limit:20, status } }).then((r:any) => r.data),
  });

  const tickets = data?.data || [];
  const meta    = data?.pagination || { total:0, pages:1 };
  const counts  = data?.counts || { open:0, inProgress:0, resolved:0, total:0 };

  const rows = tickets.map((tk: any) => ({
    subject: (
      <div>
        <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.9)", margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tk.subject}</p>
        {expanded === tk.id && <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:"6px 0 0", lineHeight:1.5, whiteSpace:"normal" }}>{tk.message}</p>}
      </div>
    ),
    user:    <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)", whiteSpace:"nowrap" }}>{tk.user?.name||tk.user?.email||"—"}</span>,
    type:    <Badge label={tk.type||"GENERAL"} color={V.cyan} bg="rgba(6,182,212,0.1)"/>,
    status:  <Badge label={tk.status} color={tk.status==="RESOLVED"?V.green:tk.status==="IN_PROGRESS"?V.amber:V.accent} bg={tk.status==="RESOLVED"?"rgba(16,185,129,0.1)":tk.status==="IN_PROGRESS"?"rgba(245,158,11,0.1)":"rgba(107,53,232,0.1)"}/>,
    date:    <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{new Date(tk.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short"})}</span>,
    expand:  (
      <button onClick={() => setExpanded(expanded===tk.id?null:tk.id)}
        style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:4 }}>
        {expanded===tk.id ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
      </button>
    ),
  }));

  return (
    <div>
      <PageHeader title="Support" sub="Customer tickets and help requests"/>

      <StatGrid cols={4}>
        <StatCard label="Open"        value={counts.open||0}       color={V.red}    icon={AlertCircle}/>
        <StatCard label="In progress" value={counts.inProgress||0} color={V.amber}  icon={Clock}/>
        <StatCard label="Resolved"    value={counts.resolved||0}   color={V.green}  icon={CheckCircle2}/>
        <StatCard label="Total"       value={counts.total||0}       color={V.accent} icon={MessageSquare}/>
      </StatGrid>

      <FilterBar>
        <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={[
          { value:"OPEN",        label:"Open"        },
          { value:"IN_PROGRESS", label:"In Progress" },
          { value:"RESOLVED",    label:"Resolved"    },
          { value:"",            label:"All tickets" },
        ]}/>
      </FilterBar>

      <DataTable
        loading={isLoading}
        cols={[
          { key:"subject", label:"Subject", width:"2fr"          },
          { key:"user",    label:"User",    width:"1fr",  hide:"sm" },
          { key:"type",    label:"Type",    width:"100px",hide:"md" },
          { key:"status",  label:"Status",  width:"110px"          },
          { key:"date",    label:"Date",    width:"80px", hide:"sm" },
          { key:"expand",  label:"",        width:"40px"           },
        ]}
        rows={rows}
        empty="No tickets"
      />
      <Pagination page={page} pages={meta.pages||1} total={meta.total||0} onPage={setPage}/>
    </div>
  );
}
