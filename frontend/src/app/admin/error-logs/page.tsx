"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { CheckCircle } from "lucide-react";
import { PageHeader, DataTable, Pagination, FilterBar, SelectFilter } from "../../../components/admin/AdminTable";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

export default function AdminErrorLogsPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [resolved, setResolved] = useState("");

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-errors", page, resolved],
    queryFn: () => adminAPI.get("/admin/error-logs", { params:{ page, limit:25, resolved } }).then((r:any) => r.data),
  });

  const resolveMut = useMutation({
    mutationFn: (id:string) => adminAPI.patch(`/admin/error-logs/${id}/resolve`, {}),
    onSuccess: () => { toast.success("Resolved"); qc.invalidateQueries({ queryKey:["admin-errors"] }); },
  });

  const logs = data?.data || [];
  const meta = data?.pagination || { total:0, pages:1 };

  const rows = logs.map((l: any) => ({
    level: (
      <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:99, background:l.level==="ERROR"?"rgba(239,68,68,0.12)":"rgba(245,158,11,0.1)", color:l.level==="ERROR"?V.red:V.amber }}>
        {l.level||"ERROR"}
      </span>
    ),
    message: <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{l.message}</span>,
    path:    <span style={{ fontSize:11, fontFamily:"monospace", color:"rgba(255,255,255,0.4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{l.path||"—"}</span>,
    date:    <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>{new Date(l.createdAt).toLocaleString("en-NG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>,
    action: !l.resolved && (
      <button onClick={() => resolveMut.mutate(l.id)}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, border:"1px solid rgba(16,185,129,0.2)", background:"rgba(16,185,129,0.08)", color:V.green, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit" }}>
        <CheckCircle size={11}/> Resolve
      </button>
    ),
  }));

  return (
    <div>
      <PageHeader title="Error Logs" sub={`${(meta.total||0).toLocaleString()} total errors`}/>

      <FilterBar>
        <SelectFilter value={resolved} onChange={v => { setResolved(v); setPage(1); }} options={[
          { value:"", label:"All errors" },
          { value:"false", label:"Unresolved" },
          { value:"true", label:"Resolved" },
        ]}/>
      </FilterBar>

      <DataTable
        loading={isLoading}
        cols={[
          { key:"level",   label:"Level",   width:"80px"  },
          { key:"message", label:"Message", width:"2fr"   },
          { key:"path",    label:"Path",    width:"1fr",  hide:"md" },
          { key:"date",    label:"When",    width:"120px", hide:"sm" },
          { key:"action",  label:"",        width:"100px" },
        ]}
        rows={rows}
        empty="No error logs"
      />
      <Pagination page={page} pages={meta.pages||1} total={meta.total||0} onPage={setPage}/>
    </div>
  );
}
