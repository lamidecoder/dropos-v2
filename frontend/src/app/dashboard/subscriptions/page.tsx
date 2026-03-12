"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RefreshCw, Pause, X } from "lucide-react";
import toast from "react-hot-toast";

const INTERVAL_LABELS: Record<string, string> = { weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly" };
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  PAUSED: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

export default function SubscriptionsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["product-subs", storeId],
    queryFn: () => api.get(`/product-subscriptions/${storeId}`).then(r => r.data),
    enabled: !!storeId,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: any) => api.patch(`/product-subscriptions/${storeId}/${id}`, { status }),
    onSuccess: () => { toast.success("Subscription updated"); qc.invalidateQueries({ queryKey: ["product-subs"] }); },
    onError: () => toast.error("Failed"),
  });

  const subs = data?.data || [];
  const stats = data?.stats || { total: 0, active: 0, mrr: 0 };
  const tx = "[color:var(--text-primary)]";
  const sub = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Product Subscriptions</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>Recurring orders — predictable revenue on autopilot.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Subscribers", val: stats.total },
            { label: "Active", val: stats.active },
            { label: "Monthly Recurring", val: `$${stats.mrr.toFixed(2)}` },
          ].map(({ label, val }) => (
            <div key={label} className={`rounded-2xl border p-4 ${card}`}>
              <p className={`text-xs font-semibold ${sub} mb-1`}>{label}</p>
              <p className={`text-xl font-black [color:var(--accent)]`}>{val}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {isLoading ? <div className="py-16 text-center text-secondary">Loading…</div>
          : subs.length === 0 ? (
            <div className="py-16 text-center">
              <RefreshCw size={36} className="mx-auto mb-3 opacity-20" />
              <p className={`text-sm ${sub}`}>No product subscriptions yet.</p>
              <p className={`text-xs ${sub} mt-1`}>Enable subscribe & save on products to start recurring revenue.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b border-inherit text-xs ${sub}`}>
                  {["Customer", "Product", "Price", "Interval", "Next Billing", "Status", ""].map(h => (
                    <th key={h} className="text-left font-semibold px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s: any) => (
                  <tr key={s.id} className="border-b [border-color:var(--border)]/50">
                    <td className={`px-5 py-4 text-sm ${tx}`}>{s.customerEmail}</td>
                    <td className={`px-5 py-4 text-sm font-semibold ${tx}`}>{s.productId}</td>
                    <td className={`px-5 py-4 font-bold ${tx}`}>${s.price.toFixed(2)}</td>
                    <td className={`px-5 py-4 text-xs ${sub}`}>{INTERVAL_LABELS[s.interval]}</td>
                    <td className={`px-5 py-4 text-xs ${sub}`}>{new Date(s.nextBillingAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status] || ""}`}>{s.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {s.status === "ACTIVE" && (
                        <button onClick={() => updateMut.mutate({ id: s.id, status: "PAUSED" })}
                          title="Pause" className="p-1.5 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100/80 dark:bg-amber-900/20">
                          <Pause size={13} />
                        </button>
                      )}
                      {s.status === "PAUSED" && (
                        <button onClick={() => updateMut.mutate({ id: s.id, status: "ACTIVE" })}
                          title="Resume" className="p-1.5 rounded-lg [color:var(--accent)] hover:[background:var(--accent-dim)]">
                          <RefreshCw size={13} />
                        </button>
                      )}
                      {s.status !== "CANCELLED" && (
                        <button onClick={() => { if (confirm("Cancel this subscription?")) updateMut.mutate({ id: s.id, status: "CANCELLED" }); }}
                          title="Cancel" className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100/80 dark:bg-red-900/20 ml-1">
                          <X size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
