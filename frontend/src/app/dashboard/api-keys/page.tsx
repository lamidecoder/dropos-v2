"use client";
// API Keys Page
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { Key, Plus, Trash2, Copy, Check, X, Shield, Zap } from "lucide-react";
import toast from "react-hot-toast";

const PERMISSIONS = [
  "orders:read","orders:write","products:read","products:write",
  "customers:read","analytics:read","webhooks:write",
];

export default function ApiKeysPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [modal, setModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<string[]>(["orders:read"]);
  const tx = "[color:var(--text-primary)]";
  const sub = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";

  const { data } = useQuery({
    queryKey: ["api-keys", storeId],
    queryFn: () => api.get(`/api-keys/${storeId}`).then(r => r.data),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/api-keys/${storeId}`, { name, permissions: perms }),
    onSuccess: (res) => {
      setNewKey(res.data.data.key);
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      setModal(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const revokeMut = useMutation({
    mutationFn: (keyId: string) => api.delete(`/api-keys/${storeId}/${keyId}`),
    onSuccess: () => { toast.success("Key revoked"); qc.invalidateQueries({ queryKey: ["api-keys"] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed"),
  });

  const keys = data?.data || [];
  const copyKey = () => { navigator.clipboard.writeText(newKey!); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const togglePerm = (p: string) => setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
      <>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>API Keys</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Connect DropOS to your tools and custom apps. Max 10 keys.</p>
          </div>
          <button onClick={() => { setModal(true); setName(""); setPerms(["orders:read"]); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)]"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Plus size={14} /> New Key
          </button>
        </div>

        {/* New key reveal */}
        {newKey && (
          <div className="rounded-2xl border p-5" style={{ background: "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-emerald-400" />
              <p className="text-sm font-bold text-emerald-400">Your new API key - copy it now, it won't be shown again.</p>
            </div>
            <div className="flex items-center gap-3">
              <code className={`flex-1 text-xs font-mono p-3 rounded-xl [background:var(--bg-card)] ${tx} break-all`}>{newKey}</code>
              <button onClick={copyKey} className="p-2 rounded-xl [color:var(--accent)] hover:[background:var(--accent-dim)]">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <button onClick={() => setNewKey(null)} className={`text-xs ${sub} mt-2 hover:text-red-400`}>I've saved it, dismiss</button>
          </div>
        )}

        {/* Keys list */}
        <div className="space-y-3">
          {keys.length === 0 ? (
            <div className={`rounded-3xl border p-16 text-center ${card}`}>
              <Key size={40} className="mx-auto mb-3 opacity-20" />
              <p className={`text-sm ${sub}`}>No API keys yet. Create one to start integrating.</p>
            </div>
          ) : keys.map((k: any) => (
            <div key={k.id} className={`rounded-2xl border p-4 ${card} flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-xl [background:var(--bg-card)] flex items-center justify-center">
                <Key size={16} className={sub} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-sm ${tx}`}>{k.name}</div>
                <div className={`text-xs font-mono ${sub}`}>{k.keyPrefix}••••••••</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {k.permissions.map((p: string) => (
                    <span key={p} className="text-[9px] px-1.5 py-0.5 rounded [background:var(--bg-card)] [color:var(--accent)] font-semibold">{p}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${sub}`}>
                  {k.lastUsedAt ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "Never used"}
                </div>
                <div className={`text-xs ${k.isActive ? "text-emerald-400" : "text-red-400"} font-semibold`}>{k.isActive ? "Active" : "Revoked"}</div>
              </div>
              {k.isActive && (
                <button onClick={() => { if (confirm("Revoke this key?")) revokeMut.mutate(k.id); }}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-100 dark:bg-red-900/20 transition-all">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Docs callout */}
        <div className={`rounded-2xl border p-5 ${card} flex items-start gap-4`}>
          <Zap size={18} style={{ color: "var(--accent)" }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-bold ${tx} mb-1`}>Using the API</p>
            <p className={`text-xs ${sub} mb-2`}>Pass your key in the <code className="font-mono text-xs px-1 py-0.5 rounded [background:var(--bg-card)]">X-API-Key</code> header. Base URL: <code className="font-mono text-xs">https://api.dropos.io/v1</code></p>
            <p className={`text-xs ${sub}`}>Verify webhook signatures using <code className="font-mono text-xs">HMAC-SHA256</code> and the signing secret shown at creation.</p>
          </div>
        </div>
      </div>

      {/* Create modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl border shadow-2xl [background:var(--bg-secondary)] [border-color:var(--border)]">
            <div className="flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]">
              <h2 className={`font-black text-lg ${tx}`}>Create API Key</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:[background:var(--bg-card)]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-1.5`}>Key Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none [background:var(--bg-card)] [border-color:var(--border)] ${tx}`}
                  placeholder="e.g. Zapier Integration" />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${sub} mb-2`}>Permissions</label>
                <div className="flex flex-wrap gap-2">
                  {PERMISSIONS.map(p => (
                    <button key={p} onClick={() => togglePerm(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${perms.includes(p) ? "text-[var(--text-primary)] border-transparent" : `${sub} [border-color:var(--border)]`}`}
                      style={perms.includes(p) ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => createMut.mutate()} disabled={!name || perms.length === 0 || createMut.isPending}
                className="w-full py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                {createMut.isPending ? "Creating…" : "Generate API Key"}
              </button>
            </div>
          </div>
        </div>
      )}
    
    
      </>
  );
}
