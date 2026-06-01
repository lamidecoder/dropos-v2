"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";

import { CheckCircle, AlertCircle, ChevronDown, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function ErrorLogsPage() {
  
  
  const qc   = useQueryClient();
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";
  const [page, setPage]   = useState(1);
  const [filter, setFilter] = useState("");
  const [expand, setExpand] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["error-logs", page, filter],
    queryFn:  () => adminAPI.getErrorLogs({ page, limit: 15, resolved: filter || undefined }).then((r) => r.data),
  });

  const resolveLog = useMutation({
    mutationFn: (id: string) => adminAPI.resolveError(id),
    onSuccess: () => { toast.success("Marked as resolved"); qc.invalidateQueries({ queryKey: ["error-logs"] }); },
    onError:   () => toast.error("Failed to resolve"),
  });

  const logs       = data?.data || [];
  const pagination = data?.pagination;

  return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Error Logs</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{pagination?.total || 0} total errors</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[["", "All"], ["false", "Unresolved"], ["true", "Resolved"]].map(([v, l]) => (
            <button key={v} onClick={() => { setFilter(v); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${filter === v ? "text-[var(--text-primary)]" : `${sub} ${"hover:bg-[var(--bg-card)]"}`}`}
              style={filter === v ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
              {l}
            </button>
          ))}
        </div>

        {/* Logs */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-2xl border p-5 animate-pulse ${card}`}>
                <div className={`h-4 w-64 rounded mb-2 ${"bg-[var(--bg-card)]"}`} />
                <div className={`h-3 w-40 rounded ${"bg-[var(--bg-card)]"}`} />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className={`text-center py-12 ${sub}`}>
            <Shield size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No error logs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log: any) => (
              <div key={log.id} className={`rounded-2xl border overflow-hidden ${card}`}>
                <button className="w-full text-left p-5" onClick={() => setExpand(expand === log.id ? null : log.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${log.resolved ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                        {log.resolved
                          ? <CheckCircle size={14} className="text-emerald-500" />
                          : <AlertCircle size={14} className="text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm truncate ${tx}`}>{log.message}</div>
                        <div className={`text-xs mt-0.5 ${sub}`}>
                          {log.method} {log.path} · Status {log.statusCode} ·{" "}
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!log.resolved && (
                        <button onClick={(e) => { e.stopPropagation(); resolveLog.mutate(log.id); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/30 transition-all">
                          Resolve
                        </button>
                      )}
                      <ChevronDown size={14} className={`${sub} transition-transform ${expand === log.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>

                {expand === log.id && log.stack && (
                  <div className={`px-5 pb-5 border-t border-[var(--border)]/50`}>
                    <div className={`mt-4 rounded-xl p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap bg-slate-950 text-[var(--text-secondary)]`}>
                      {log.stack}
                    </div>
                    {log.userId && (
                      <p className={`text-xs mt-2 ${sub}`}>User ID: {log.userId}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className={`text-sm ${sub}`}>{pagination.total} total</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className={`p-2 rounded-xl border disabled:opacity-40 border-[var(--border)] hover:bg-[var(--bg-card)]`}>
                <ChevronLeft size={16} className={sub} />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className={`p-2 rounded-xl border disabled:opacity-40 border-[var(--border)] hover:bg-[var(--bg-card)]`}>
                <ChevronRight size={16} className={sub} />
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
