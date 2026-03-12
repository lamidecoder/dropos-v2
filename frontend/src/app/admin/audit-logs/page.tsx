"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Shield, Search, ChevronLeft, ChevronRight, User, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  LOGIN:  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

export default function AuditLogsPage() {
  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, search],
    queryFn:  () => api.get("/admin/audit-logs", { params: { page, limit: 20, search } }).then(r => r.data),
  });

  const logs       = data?.data || [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Audit Logs</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>All admin and user actions across the platform</p>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-dim)" }}>
            <Shield size={18} style={{ color: "var(--accent)" }} />
          </div>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border text-sm max-w-md [background:var(--bg-secondary)] [border-color:var(--border)]`}>
          <Search size={14} className={sub} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search action or user…"
            className="bg-transparent outline-none flex-1 [color:var(--text-primary)]" />
        </div>

        {/* Table */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b border-inherit text-xs ${sub}`}>
                {["Time", "User", "Action", "Entity", "Details"].map(h => (
                  <th key={h} className="text-left font-semibold px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b [border-color:var(--border)]/50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 rounded animate-pulse [background:var(--bg-card)]" style={{ width: `${40 + (j * 11) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              )) : logs.map((log: any) => (
                <tr key={log.id} className="border-b [border-color:var(--border)] hover:[background:var(--bg-card)] transition-colors">
                  <td className={`px-5 py-4 text-xs ${sub}`}>
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                        {log.userEmail?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className={`text-xs ${tx}`}>{log.userEmail || "System"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${ACTION_COLORS[log.action] || "bg-[var(--bg-secondary)] [color:var(--text-secondary)]"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-xs ${sub}`}>{log.entity}</td>
                  <td className={`px-5 py-4 text-xs ${sub} max-w-xs truncate`}>
                    {typeof log.details === "string" ? log.details : JSON.stringify(log.details)?.slice(0, 80)}
                  </td>
                </tr>
              ))}
              {!isLoading && !logs.length && (
                <tr>
                  <td colSpan={5} className={`py-16 text-center ${sub}`}>
                    <Shield size={36} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No audit logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className={`text-sm ${sub}`}>Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl border disabled:opacity-40 [border-color:var(--border)] hover:[background:var(--bg-secondary)]">
                <ChevronLeft size={16} className={sub} />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="p-2 rounded-xl border disabled:opacity-40 [border-color:var(--border)] hover:[background:var(--bg-secondary)]">
                <ChevronRight size={16} className={sub} />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
