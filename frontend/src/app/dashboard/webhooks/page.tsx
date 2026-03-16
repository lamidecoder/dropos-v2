"use client";
// Webhooks Page
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Webhook, Plus, Trash2, X, Play, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const EVENTS = ["order.created","order.paid","order.shipped","order.completed","order.cancelled","order.refunded","product.created","product.updated","customer.created","review.submitted"];

export default function WebhooksPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [modal, setModal] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["order.created","order.paid"]);
  const tx = "[color:var(--text-primary)]";
  const sub = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";

  const { data } = useQuery({
    queryKey: ["webhooks", storeId],
    queryFn: () => api.get(`/webhooks/${storeId}`).then(r => r.data),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/webhooks/${storeId}`, { url, events }),
    onSuccess: () => { toast.success("Webhook created!"); qc.invalidateQueries({ queryKey: ["webhooks"] }); setModal(false); setUrl(""); setEvents(["order.created","order.paid"]); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/webhooks/${storeId}/${id}`),
    onSuccess: () => { toast.success("Webhook deleted"); qc.invalidateQueries({ queryKey: ["webhooks"] });
  });

  const testMut = useMutation({
    mutationFn: (id: string) => api.post(`/webhooks/${storeId}/${id}/test`, {}),
    onSuccess: (res) => {
      if (res.data.success) toast.success(`Test delivered! Status: ${res.data.data?.statusCode}`);
      else toast.error(`Delivery failed: ${res.data.message}`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const webhooks = data?.data || [];
  const toggleEvent = (e: string) => setEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Webhooks</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Send real-time events to Zapier, Make, or your own backend.</p>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)]"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Plus size={14} /> Add Endpoint
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.length === 0 ? (
            <div className={`rounded-3xl border p-16 text-center ${card}`}>
              <Webhook size={40} className="mx-auto mb-3 opacity-20" />
              <p className={`text-sm ${sub}`}>No webhooks yet. Add an endpoint to start receiving events.</p>
            </div>
          ) : webhooks.map((wh: any) => (
            <div key={wh.id} className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${wh.isActive ? "[background:rgba(124,58,237,0.15)]" : "[background:var(--bg-card)]"}`}>
                  <Webhook size={14} className={wh.isActive ? "[color:var(--accent)]" : sub} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-mono text-xs font-semibold ${tx} truncate`}>{wh.url}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {wh.events.map((e: string) => (
                      <span key={e} className={`text-[9px] px-1.5 py-0.5 rounded [background:var(--bg-card)] [color:var(--accent)] font-semibold`}>{e}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => testMut.mutate(wh.id)} disabled={testMut.isPending}
                    title="Send test event" className={`p-2 rounded-lg [color:var(--accent)] hover:[background:var(--accent-dim)]`}>
                    <Play size={13} />
                  </button>
                  <button onClick={() => { if (confirm("Delete webhook?")) deleteMut.mutate(wh.id); }}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100/80 dark:bg-red-900/20">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {/* Recent deliveries */}
              {wh.deliveries?.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {wh.deliveries.slice(0,5).map((d: any, i: number) => (
                    <div key={i} title={`${d.event} — ${d.success ? "✓" : "✗"} ${d.statusCode || ""}`}
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${d.success ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                      {d.success ? <CheckCircle size={10} className="text-emerald-700 dark:text-emerald-400" /> : <XCircle size={10} className="text-red-600 dark:text-red-400" />}
                    </div>
                  ))}
                  <span className={`text-xs ${sub} ml-1`}>Recent deliveries</span>
                </div>
              )}
              {wh.failCount > 2 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">⚠️ {wh.failCount} consecutive failures — check your endpoint</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl border shadow-2xl max-h-[90vh] overflow-y-auto [background:var(--bg-secondary)] [border-color:var(--border)]">
            <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
              <h2 className={`font-black text-lg ${tx}`}>Add Webhook Endpoint</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:[background:var(--bg-card)]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Endpoint URL</label>
                <input value={url} onChange={e => setUrl(e.target.value)} type="url"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none font-mono [background:var(--bg-card)] [border-color:var(--border)] ${tx}`}
                  placeholder="https://your-server.com/webhook" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-2`}>Events to Subscribe</label>
                <div className="space-y-1.5">
                  {EVENTS.map(e => (
                    <label key={e} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-violet-500" checked={events.includes(e)} onChange={() => toggleEvent(e)} />
                      <span className={`text-xs font-mono ${tx}`}>{e}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-3 [background:rgba(201,168,76,0.05)] [border:1px_solid_rgba(201,168,76,0.15)]">
                <p className={`text-xs ${sub}`}>A signing secret will be generated. Use it to verify webhook authenticity via <code className="font-mono">HMAC-SHA256</code>.</p>
              </div>
              <button onClick={() => createMut.mutate()} disabled={!url || events.length === 0 || createMut.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                {createMut.isPending ? "Creating…" : "Create Webhook"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
