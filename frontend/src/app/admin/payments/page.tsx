"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentAPI } from "../../../lib/api";
import DashboardLayout from "../../../components/layout/DashboardLayout";

import { CreditCard, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

const statusColor: Record<string, string> = {
  SUCCESS:  "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
  PENDING:  "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
  FAILED:   "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
  REFUNDED: "bg-slate-700 text-[var(--text-tertiary)]",
  DISPUTED: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400",
};

export default function AdminPaymentsPage() {
  
  
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";
  const tRow = "border-[var(--border)] hover:bg-[var(--bg-card)]";

  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState("");
  const [gateway, setGateway] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", page, status, gateway],
    queryFn:  () => paymentAPI.getAll({ page, limit: 15, status, gateway }).then((r) => r.data),
  });

  const payments   = data?.data || [];
  const pagination = data?.pagination;
  const totals     = data?.totals;

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Payments & Payouts</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>{pagination?.total || 0} total transactions</p>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { l: "Total Processed",  v: `$${(totals?.amount        || 284200).toLocaleString()}`, c: "text-emerald-700 dark:text-emerald-400" },
            { l: "Platform Fees",    v: `$${(totals?.platformFee   || 28420 ).toLocaleString()}`, c: "text-amber-700 dark:text-amber-400" },
            { l: "Store Payouts",    v: `$${(totals?.storeEarnings || 255780).toLocaleString()}`, c: tx },
          ].map(({ l, v, c }) => (
            <div key={l} className={`rounded-2xl border p-5 text-center ${card}`}>
              <div className={`text-2xl font-black ${c}`}>{v}</div>
              <div className={`text-xs mt-0.5 ${sub}`}>{l}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[["", "All Status"], ["SUCCESS", "Success"], ["PENDING", "Pending"], ["FAILED", "Failed"], ["REFUNDED", "Refunded"]].map(([v, l]) => (
            <button key={v} onClick={() => { setStatus(v); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${status === v ? "text-[var(--text-primary)]" : `${sub} ${"hover:bg-[var(--bg-card)]"}`}`}
              style={status === v ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
              {l}
            </button>
          ))}
          <div className={`h-6 w-px self-center bg-slate-700`} />
          {[["", "All Gateways"], ["STRIPE", "Stripe"], ["PAYSTACK", "Paystack"], ["FLUTTERWAVE", "Flutterwave"]].map(([v, l]) => (
            <button key={v} onClick={() => { setGateway(v); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${gateway === v ? "text-[var(--text-primary)]" : `${sub} ${"hover:bg-[var(--bg-card)]"}`}`}
              style={gateway === v ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
              {l}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b border-inherit text-xs ${sub}`}>
                {["Order", "Customer", "Store / Owner", "Amount", "Fee", "Payout", "Gateway", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left font-semibold px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className={`border-b border-[var(--border)]/50`}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className={`h-3 rounded animate-pulse ${"bg-[var(--bg-card)]"}`} style={{ width: `${40 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : payments.map((p: any) => (
                    <tr key={p.id} className={`border-b transition-colors ${tRow}`}>
                      <td className="px-4 py-4 font-mono text-xs font-bold text-violet-500">
                        {p.order?.orderNumber || "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className={`font-semibold text-xs ${tx}`}>{p.order?.customerName}</div>
                        <div className={`text-xs ${sub} truncate max-w-[140px]`}>{p.order?.customerEmail}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`font-semibold text-xs ${tx}`}>{p.store?.name}</div>
                        <div className={`text-xs ${sub}`}>{p.store?.owner?.name}</div>
                      </td>
                      <td className={`px-4 py-4 font-bold text-[var(--text-primary)]`}>
                        ${(p.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-red-600 dark:text-red-400">
                        -${(p.platformFee || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        ${(p.storeEarnings || 0).toFixed(2)}
                      </td>
                      <td className={`px-4 py-4 text-xs font-semibold ${sub}`}>{p.gateway}</td>
                      <td className={`px-4 py-4 text-xs ${sub}`}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${statusColor[p.status] || ""}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              {!isLoading && !payments.length && (
                <tr>
                  <td colSpan={9} className={`py-16 text-center ${sub}`}>
                    <CreditCard size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No payments found</p>
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
              Page {page} of {pagination.pages} · {pagination.total} total
            </p>
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
    </DashboardLayout>
  );
}
