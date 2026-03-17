"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportAPI } from "../../../lib/api";
import DashboardLayout from "../../../components/layout/DashboardLayout";

import { Plus, LifeBuoy, X, ChevronDown, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const schema = z.object({
  subject:  z.string().min(5, "Subject must be at least 5 characters"),
  message:  z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

const priorityColor: Record<string, string> = {
  LOW:    "[background:var(--bg-card)] text-secondary",
  MEDIUM: "bg-amber-100 dark:bg-amber-900/40 [color:var(--accent)]",
  HIGH:   "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400",
  URGENT: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
};

const statusColor: Record<string, string> = {
  OPEN:        "bg-violet-100 dark:bg-violet-900/40 [color:var(--accent)]",
  IN_PROGRESS: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  RESOLVED:    "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
  CLOSED:      "[background:var(--bg-card)] text-secondary",
};

export default function SupportPage() {
  
  
  const qc   = useQueryClient();
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";
  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";

  const [modal, setModal]    = useState(false);
  const [expand, setExpand]  = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn:  () => supportAPI.getAll().then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM" as const },
  });

  const createMut = useMutation({
    mutationFn: (d: any) => supportAPI.create(d),
    onSuccess:  () => { toast.success("Ticket submitted!"); qc.invalidateQueries({ queryKey: ["support-tickets"] }); setModal(false); reset(); },
    onError:    () => toast.error("Failed to submit ticket"),
  });

  const tickets = data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Support</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Submit and track your support requests</p>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold [color:var(--text-primary)] shadow-lg "
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Plus size={16} /> New Ticket
          </button>
        </div>

        {/* Tickets */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-2xl border p-5 animate-pulse ${card}`}>
                <div className={`h-4 w-48 rounded mb-2 ${"[background:var(--bg-card)]"}`} />
                <div className={`h-3 w-32 rounded ${"[background:var(--bg-card)]"}`} />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className={`rounded-3xl border border-dashed [border-color:var(--accent)]/20 p-16 text-center bg-base`}>
            <LifeBuoy size={48} className="mx-auto mb-4 [color:var(--accent)] opacity-40" />
            <h2 className={`text-xl font-black mb-2 ${tx}`}>No support tickets yet</h2>
            <p className={`text-sm ${sub} mb-5`}>Have an issue? We're here to help.</p>
            <button onClick={() => setModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Plus size={14} /> Submit Ticket
            </button>
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
                        #{t.id.slice(0, 8)} · {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityColor[t.priority] || ""}`}>
                        {t.priority}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[t.status] || ""}`}>
                        {t.status.replace("_", " ")}
                      </span>
                      <ChevronDown size={14} className={`${sub} transition-transform ${expand === t.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>

                {expand === t.id && (
                  <div className={`px-5 pb-5 border-t [border-color:var(--border)]/50`}>
                    <div className={`mt-4 text-sm rounded-xl p-4 bg-base [border-color:var(--border)] border`}>
                      <div className={`text-xs font-semibold ${sub} mb-2`}>Your message</div>
                      <p className={`text-sm ${tx}`}>{t.message}</p>
                    </div>

                    {t.adminReply && (
                      <div className="mt-3 text-sm rounded-xl p-4 border [border-color:var(--accent)]/20"
                        style={{ background: "rgba(124,58,237,.08)" }}>
                        <div className="text-xs font-semibold [color:var(--accent)] mb-2 flex items-center gap-1.5">
                          <CheckCircle size={11} /> Admin Response
                        </div>
                        <p className={`text-sm ${tx}`}>{t.adminReply}</p>
                      </div>
                    )}

                    {!t.adminReply && (
                      <p className={`mt-3 text-xs ${sub} italic`}>Awaiting response from our team…</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New ticket modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl animate-fade ${"bg-secondary [border-color:var(--border)]"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]`}>
              <h2 className={`font-black text-lg ${tx}`}>New Support Ticket</h2>
              <button onClick={() => setModal(false)} className={`p-2 rounded-xl ${"hover:[background:var(--bg-secondary)]"}`}>
                <X size={16} className={sub} />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>Subject</label>
                <input {...register("subject")} placeholder="Brief description of the issue"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 transition-all ${inp}`} />
                {errors.subject && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>Priority</label>
                <select {...register("priority")} className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 ${inp}`}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>Message</label>
                <textarea {...register("message")} rows={5}
                  placeholder="Describe your issue in detail…"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 resize-none transition-all ${inp}`} />
                {errors.message && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.message.message}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={createMut.isPending}
                  className="flex-1 py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {createMut.isPending ? "Submitting…" : "Submit Ticket"}
                </button>
                <button type="button" onClick={() => setModal(false)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold border ${"[border-color:var(--border)] text-secondary"}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
