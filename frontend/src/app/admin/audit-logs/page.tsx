"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { Shield } from "lucide-react";
import { PageHeader, DataTable, Pagination, FilterBar, SelectFilter, SearchInput } from "../../../components/admin/AdminTable";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

const ACTION_C: Record<string,string> = {
  CREATE:"#10B981", UPDATE:"#6B35E8", DELETE:"#EF4444",
  LOGIN:"rgba(255,255,255,0.5)", PLAN_CHANGE:"#F59E0B",
};

export default function AdminAuditLogsPage() {
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-audit", page, search],
    queryFn: () => adminAPI.get("/admin/audit-logs", { params:{ page, limit:25, search } }).then((r:any) => r.data),
  });

  const logs = data?.data || [];
  const meta = data?.pagination || { total:0, pages:1 };

  const rows = logs.map((l: any) => ({
    action: (
      <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99, background:`${ACTION_C[l.action]||V.accent}14`, color:ACTION_C[l.action]||V.accent }}>
        {l.action}
      </span>
    ),
    user:     <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{l.user?.name||l.user?.email||"System"}</span>,
    resource: <span style={{ fontSize:12, fontFamily:"monospace", color:"rgba(255,255,255,0.5)" }}>{l.resource}</span>,
    detail:   <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{JSON.stringify(l.details||{}).slice(0,60)}</span>,
    date:     <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>{new Date(l.createdAt).toLocaleString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>,
  }));

  return (
    <div>
      <PageHeader title="Audit Logs" sub={`${(meta.total||0).toLocaleString()} actions recorded`}/>

      <FilterBar>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search logs..."/>
      </FilterBar>

      <DataTable
        loading={isLoading}
        cols={[
          { key:"action",   label:"Action",   width:"100px" },
          { key:"user",     label:"User",     width:"1fr",   hide:"sm" },
          { key:"resource", label:"Resource", width:"100px" },
          { key:"detail",   label:"Details",  width:"2fr",   hide:"md" },
          { key:"date",     label:"When",     width:"130px"  },
        ]}
        rows={rows}
        empty="No audit logs"
      />
      <Pagination page={page} pages={meta.pages||1} total={meta.total||0} onPage={setPage}/>
    </div>
  );
}
