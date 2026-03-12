"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Users, ChevronLeft, ChevronRight, X, ShoppingCart, DollarSign, Eye, Mail, Phone, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CustomersPage() {
  const user    = useAuthStore((s) => s.user);
  const storeId = user?.stores?.[0]?.id;
  const card  = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const tx    = "[color:var(--text-primary)]";
  const sub   = "text-secondary";
  const tRow  = "[border-color:var(--border)] hover:bg-[var(--bg-card)] cursor-pointer";

  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", storeId, page, search],
    queryFn:  () => api.get(`/customers/${storeId}`, { params: { page, limit: 15, search } }).then((r) => r.data),
    enabled:  !!storeId,
  });

  const { data: detailData } = useQuery({
    queryKey: ["customer-detail", storeId, selected?.id],
    queryFn:  () => api.get(`/customers/${storeId}/${selected.id}`).then(r => r.data.data),
    enabled:  !!storeId && !!selected?.id,
  });

  const customers  = data?.data || [];
  const pagination = data?.pagination;
  const detail     = detailData || selected;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Customers</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{pagination?.total || 0} total customers</p>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border text-sm max-w-md ${"[background:var(--bg-secondary)] [border-color:var(--border)]"}`}>
          <Search size={14} className={sub} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email…" className="bg-transparent outline-none flex-1 [color:var(--text-primary)]" />
          {search && <button onClick={() => setSearch("")}><X size={12} className={sub} /></button>}
        </div>

        {/* Table */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b border-inherit text-xs ${sub}`}>
                {["Customer", "Email", "Phone", "Orders", "Total Spent", "Joined", ""].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b [border-color:var(--border)]/50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 rounded animate-pulse [background:var(--bg-card)]" style={{ width: `${40 + (j * 7) % 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : customers.map((c: any) => (
                    <tr key={c.id} onClick={() => setSelected(c)} className={`border-b transition-colors ${tRow}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                            {c.name?.charAt(0)}
                          </div>
                          <span className={`font-semibold ${tx}`}>{c.name}</span>
                        </div>
                      </td>
                      <td className={`px-5 py-4 ${sub} text-xs`}>{c.email}</td>
                      <td className={`px-5 py-4 ${sub} text-xs`}>{c.phone || "—"}</td>
                      <td className={`px-5 py-4 font-semibold ${tx}`}>{c.totalOrders || 0}</td>
                      <td className="px-5 py-4 font-bold text-emerald-700 dark:text-emerald-400">
                        ${(c.totalSpent || 0).toFixed(2)}
                      </td>
                      <td className={`px-5 py-4 text-xs ${sub}`}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <button className="p-1.5 rounded-lg transition-all hover:[background:var(--bg-elevated)]" style={{ color: "var(--text-tertiary)" }}>
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
              {!isLoading && !customers.length && (
                <tr>
                  <td colSpan={7} className={`py-16 text-center ${sub}`}>
                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No customers yet — share your store to get started!</p>
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
              Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
            </p>
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

      {/* ── Customer Detail Slide-over ────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }} />
          <div onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md h-full overflow-y-auto shadow-2xl"
            style={{ background: "var(--bg-card)", borderLeft: "1px solid var(--border)" }}>

            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                    {detail?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{detail?.name}</div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Customer since {detail?.createdAt ? formatDistanceToNow(new Date(detail.createdAt), { addSuffix: true }) : "—"}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl transition-all hover:[background:var(--bg-secondary)]"
                  style={{ color: "var(--text-tertiary)" }}>
                  <X size={16} />
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { icon: ShoppingCart, label: "Orders",      value: detail?.totalOrders || 0,  color: "var(--accent)"    },
                  { icon: DollarSign,   label: "Total Spent",  value: `$${(detail?.totalSpent || 0).toFixed(2)}`, color: "#10b981" },
                  { icon: Calendar,     label: "Last Order",   value: detail?.orders?.[0] ? formatDistanceToNow(new Date(detail.orders[0].createdAt), { addSuffix: true }) : "—", color: "var(--text-secondary)" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="text-center p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                    <Icon size={14} className="mx-auto mb-1" style={{ color }} />
                    <div className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{value}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="p-6 border-b space-y-3" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Contact</div>
              {[
                { icon: Mail,  label: "Email", value: detail?.email },
                { icon: Phone, label: "Phone", value: detail?.phone || "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={13} style={{ color: "var(--text-tertiary)" }} />
                  <div>
                    <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{label}</div>
                    <div className="text-sm" style={{ color: "var(--text-primary)" }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <div className="p-6">
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Recent Orders</div>
              {detail?.orders?.length ? (
                <div className="space-y-2">
                  {detail.orders.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <div>
                        <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>#{o.orderNumber}</div>
                        <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">${o.total?.toFixed(2)}</div>
                        <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{o.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No orders yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
