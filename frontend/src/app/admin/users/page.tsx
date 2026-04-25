"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";

import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, Flag, Filter, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  
  
  const qc   = useQueryClient();
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";
  const tRow = "border-[var(--border)] hover:bg-[var(--bg-card)]";

  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan,   setPlan]   = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, status, plan],
    queryFn:  () => adminAPI.getUsers({ page, limit: 15, search, status, plan }).then((r) => r.data),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError:   () => toast.error("Delete failed"),
  });

  const users = data?.data || [];
  const pagination = data?.pagination;
  const LIMIT = 15;

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>All Users</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>{pagination?.total || 0} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-2xl border p-4 flex flex-wrap gap-3 ${card}`}>
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-sm flex-1 min-w-[200px] bg-[#08080f] border-[var(--border)]`}>
            <Search size={14} className={sub} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email…"
              className="bg-transparent outline-none flex-1 text-sm" />
            {search && <button onClick={() => setSearch("")}><X size={12} className={sub} /></button>}
          </div>

          <div className="flex gap-2">
            {[["", "All Status"], ["ACTIVE", "Active"], ["SUSPENDED", "Suspended"], ["BANNED", "Banned"]].map(([v, l]) => (
              <button key={v} onClick={() => { setStatus(v); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                  ${status === v ? "text-[var(--text-primary)]" : `${sub} ${"hover:bg-[var(--bg-card)]"}`}`}
                style={status === v ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {l}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {[["", "All Plans"], ["STARTER", "Starter"], ["PRO", "Pro"], ["ADVANCED", "Advanced"]].map(([v, l]) => (
              <button key={v} onClick={() => { setPlan(v); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                  ${plan === v ? "text-[var(--text-primary)]" : `${sub} ${"hover:bg-[var(--bg-card)]"}`}`}
                style={plan === v ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b border-inherit text-xs ${sub}`}>
                {["User", "Location", "Plan", "Stores", "Revenue", "Flags", "Last Login", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={`border-b border-[var(--border)]/50`}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className={`h-3 rounded animate-pulse ${"bg-[var(--bg-card)]"}`} style={{ width: `${40 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.map((u: any) => (
                <tr key={u.id}
                  className={`border-b transition-colors ${tRow}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-primary)] text-sm font-black flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${tx}`}>{u.name}</div>
                        <div className={`text-xs ${sub}`}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-5 py-4 text-xs ${sub}`}>{u.city || u.country || "-"}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                      ${u.subscription?.plan === "ADVANCED" ? "bg-violet-400/10 text-violet-700 dark:text-violet-400"
                        : u.subscription?.plan === "PRO" ? "bg-amber-400/10 text-amber-700 dark:text-amber-400"
                        : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"}`}>
                      {u.subscription?.plan || "STARTER"}
                    </span>
                  </td>
                  <td className={`px-5 py-4 font-semibold text-center ${tx}`}>{u._count?.stores || 0}</td>
                  <td className={`px-5 py-4 font-bold text-emerald-700 dark:text-emerald-400`}>
                    ${(u.revenue?.total || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    {u.flags?.length > 0
                      ? <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400"><Flag size={11} />{u.flags.length}</span>
                      : <span className={`text-xs ${sub}`}>-</span>}
                  </td>
                  <td className={`px-5 py-4 text-xs ${sub}`}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${u.status === "ACTIVE" ? "bg-emerald-400/10 text-emerald-700 dark:text-emerald-400"
                        : u.status === "SUSPENDED" ? "bg-red-400/10 text-red-600 dark:text-red-400"
                        : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-500" : u.status === "SUSPENDED" ? "bg-red-500" : "bg-slate-400"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/users/${u.id}`}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          border-violet-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-400/10`}>
                        <Edit2 size={11} /> Manage
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${u.name}? This cannot be undone.`)) {
                            deleteUser.mutate(u.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-all ${"text-red-600 dark:text-red-400 hover:bg-red-400/10"}`}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !users.length && (
                <tr>
                  <td colSpan={9} className={`px-5 py-16 text-center ${sub}`}>
                    <Search size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className={`text-sm ${sub}`}>
              Showing {((page - 1) * LIMIT) + 1}-{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className={`p-2 rounded-xl border transition-all disabled:opacity-40
                  border-[var(--border)] text-[var(--text-tertiary)] hover:bg-[var(--bg-card)]`}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold border transition-all
                    ${page === p ? "text-[var(--text-primary)] border-transparent" : `border-[var(--border)] hover:bg-[var(--bg-card)] `}`}
                  style={page === p ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className={`p-2 rounded-xl border transition-all disabled:opacity-40
                  border-[var(--border)] text-[var(--text-tertiary)] hover:bg-[var(--bg-card)]`}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
