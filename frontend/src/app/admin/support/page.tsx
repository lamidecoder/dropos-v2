"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportAPI } from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { CheckCircle, MessageSquare, ChevronDown, X } from "lucide-react";
import toast from "react-hot-toast";

const priorityColor: Record<string, string> = {
  LOW: "bg-slate-700 text-[var(--text-secondary)]", MEDIUM: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
  HIGH: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400", URGENT: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
};
const statusColor: Record<string, string> = {
  OPEN: "bg-violet-100 dark:bg-violet-900/40 text-amber-700 dark:text-amber-400", IN_PROGRESS: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  RESOLVED: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400", CLOSED: "bg-slate-700 text-[var(--text-tertiary)]",
};

export default function AdminSupportPage() {
  
  
  const qc   = useQueryClient();
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const inp  = "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";

  const [expand, setExpand] = useState<string | null>(null);
  const [reply, setReply]   = useState("");
  const [filter, setFilter] = useState("OPEN");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tickets", filter],
    queryFn:  () => supportAPI.getAll({ status: filter || undefined }).then((r) => r.data.data),
  });

  const resolveMut = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg: string }) =>
      supportAPI.update(id, { status: "RESOLVED", message: msg }),
    onSuccess: () => { toast.success("Ticket resolved"); qc.invalidateQueries({ queryKey: ["admin-tickets"] }); setExpand(null); setReply(""); },
    onError:   () => toast.error("Failed to resolve"),
  });

  const replyMut = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg: string }) =>
      supportAPI.update(id, { status: "IN_PROGRESS", message: msg }),
    onSuccess: () => { toast.success("Reply sent"); qc.invalidateQueries({ queryKey: ["admin-tickets"] }); setReply(""); },
    onError:   () => toast.error("Failed to send reply"),
  });

  const tickets = data || [];

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Support Tickets</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{tickets.length} {filter.toLowerCase()} tickets</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {[["OPEN", "Open"], ["IN_PROGRESS", "In Progress"], ["RESOLVED", "Resolved"], ["", "All"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${filter === v ? "text-[var(--text-primary)]" : `${sub} ${"hover:bg-[var(--bg-card)]"}`}`}
              style={filter === v ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
              {l}
            </button>
          ))}
        </div>

        {/* Tickets */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-2xl border p-5 animate-pulse ${card}`}>
                <div className={`h-4 w-64 rounded mb-2 ${"bg-[var(--bg-card)]"}`} />
                <div className={`h-3 w-40 rounded ${"bg-[var(--bg-card)]"}`} />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className={`text-center py-12 ${sub}`}>
            <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
            <p>No {filter.toLowerCase()} tickets</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t: any) => (
              <div key={t.id} className={`rounded-2xl border overflow-hidden ${card}`}>
                <button className="w-full text-left p-5" onClick={() => setExpand(expand === t.id ? null : t.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className={`font-bold ${tx}`}>{t.subject}</div>
                      <div className={`text-xs mt-1 ${sub}`}>
                        From <strong className={"text-[var(--text-secondary)]"}>{t.user?.name}</strong>
                        {" "}({t.user?.email}) · {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityColor[t.priority]}`}>{t.priority}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[t.status]}`}>{t.status.replace("_", " ")}</span>
                      <ChevronDown size={14} className={`${sub} transition-transform ${expand === t.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>

                {expand === t.id && (
                  <div className={`px-5 pb-5 border-t border-[var(--border)]/50`}>
                    <div className={`mt-4 rounded-xl p-4 border text-sm bg-[#08080f] border-[var(--border)]`}>
                      <div className={`text-xs font-semibold ${sub} mb-1`}>Message</div>
                      <p className={tx}>{t.message}</p>
                    </div>

                    {t.adminReply && (
                      <div className="mt-3 rounded-xl p-4 border border-violet-500/20 text-sm"
                        style={{ background: "rgba(124,58,237,.08)" }}>
                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                          <CheckCircle size={11} /> Previous Reply
                        </div>
                        <p className={tx}>{t.adminReply}</p>
                      </div>
                    )}

                    {t.status !== "RESOLVED" && (
                      <div className="mt-4 space-y-3">
                        <textarea value={reply} onChange={(e) => setReply(e.target.value)}
                          rows={3} placeholder="Write your reply…"
                          className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 resize-none transition-all ${inp}`} />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { if (reply.trim()) replyMut.mutate({ id: t.id, msg: reply }); }}
                            disabled={!reply.trim() || replyMut.isPending}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all
                              border-violet-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-400/10 disabled:opacity-40`}>
                            <MessageSquare size={12} /> Send Reply
                          </button>
                          <button
                            onClick={() => resolveMut.mutate({ id: t.id, msg: reply || "Your issue has been resolved. Please reach out if you need further assistance." })}
                            disabled={resolveMut.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-[var(--text-primary)] hover:bg-emerald-500 disabled:opacity-60">
                            <CheckCircle size={12} /> Mark Resolved
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
