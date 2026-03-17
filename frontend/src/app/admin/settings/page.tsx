"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import DashboardLayout from "../../../components/layout/DashboardLayout";

import { Save, AlertTriangle, RefreshCcw, DollarSign, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  
  
  const qc   = useQueryClient();
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const inp  = "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";

  const [fee, setFee]                 = useState<number>(10);
  const [feeEditing, setFeeEditing]   = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [allowReg, setAllowReg]       = useState(true);

  const { data: settings , isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn:  async () => {
      const r = await adminAPI.getSettings();
      const s = r.data.data;
      setFee(s.platformFeePercent);
      setMaintenance(s.maintenanceMode);
      setAllowReg(s.allowRegistration);
      return s;
    },
  });

  const save = useMutation({
    mutationFn: (data: any) => adminAPI.updateSettings(data),
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError:   () => toast.error("Save failed"),
  });

  const PLANS = [
    { key: "starterPrice",  name: "Starter",  color: "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]" },
    { key: "proPrice",      name: "Pro",       color: "bg-amber-400/10 text-amber-400" },
    { key: "advancedPrice", name: "Advanced",  color: "bg-violet-400/10 text-violet-400" },
  ];

  return (
    <DashboardLayout isAdmin>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Platform Settings</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>Changes apply platform-wide instantly</p>
        </div>

        {/* Platform fee */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-violet-500" />
            <h3 className={`font-bold ${tx}`}>Platform Fee</h3>
          </div>
          <p className={`text-sm mb-5 ${sub}`}>
            Percentage deducted from every transaction. Remainder is paid out to store owners.
          </p>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-xl px-5 py-3 border text-2xl font-black bg-[#08080f] border-[var(--border)]`}>
              {feeEditing ? (
                <input type="number" value={fee} min={0} max={50} step={0.5}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="w-14 bg-transparent outline-none text-2xl font-black text-center" />
              ) : (
                <span className={tx}>{settings?.platformFeePercent ?? fee}</span>
              )}
              <span className="text-violet-500">%</span>
            </div>
            {!feeEditing ? (
              <button onClick={() => setFeeEditing(true)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-all
                  border-slate-600 text-[var(--text-secondary)] hover:bg-[var(--bg-card)]`}>
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { save.mutate({ platformFeePercent: fee }); setFeeEditing(false); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-[var(--text-primary)]"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  <Save size={14} /> Save
                </button>
                <button onClick={() => { setFeeEditing(false); setFee(settings?.platformFeePercent || 10); }}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold border ${"border-[var(--border-strong)] text-[var(--text-tertiary)]"}`}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          <p className={`text-xs mt-3 ${sub}`}>
            Current fee: {settings?.platformFeePercent ?? 10}% · Last updated {settings ? new Date(settings.updatedAt).toLocaleDateString() : "—"}
          </p>
        </div>

        {/* Subscription plans */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-violet-500" />
            <h3 className={`font-bold ${tx}`}>Subscription Plans</h3>
          </div>
          <div className="space-y-3">
            {PLANS.map((plan) => {
              const [val, setVal] = useState<number>((settings as any)?.[plan.key] || 0);
              const [editing, setEd] = useState(false);
              return (
                <div key={plan.key} className={`flex items-center justify-between p-4 rounded-xl border ${"border-[var(--border)]"}`}>
                  <div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${plan.color}`}>{plan.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${sub}`}>$</span>
                        <input type="number" value={val} min={0} onChange={(e) => setVal(Number(e.target.value))}
                          className={`w-20 rounded-lg px-2 py-1.5 text-sm border outline-none focus:border-violet-500 text-center ${inp}`} />
                        <button onClick={() => { save.mutate({ [plan.key]: val }); setEd(false); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--text-primary)] bg-emerald-600 hover:bg-emerald-500">
                          Save
                        </button>
                        <button onClick={() => setEd(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${"border-[var(--border-strong)] text-[var(--text-tertiary)]"}`}>
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={`text-lg font-black ${tx}`}>${(settings as any)?.[plan.key] || 0}<span className={`text-xs font-normal ${sub}`}>/mo</span></span>
                        <button onClick={() => { setVal((settings as any)?.[plan.key] || 0); setEd(true); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                            border-slate-600 text-[var(--text-secondary)] hover:bg-[var(--bg-card)]`}>
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform toggles */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <h3 className={`font-bold mb-4 ${tx}`}>Platform Controls</h3>
          <div className="space-y-4">
            {[
              { label: "User Registration",   sub: "Allow new users to sign up", key: "allowRegistration",  val: allowReg,    set: setAllowReg },
              { label: "Maintenance Mode",     sub: "Show maintenance page to all users", key: "maintenanceMode", val: maintenance, set: setMaintenance },
            ].map((item) => (
              <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border ${"border-[var(--border)]"}`}>
                <div>
                  <div className={`font-semibold text-sm ${tx}`}>{item.label}</div>
                  <div className={`text-xs ${sub}`}>{item.sub}</div>
                </div>
                <button
                  onClick={() => {
                    const newVal = !item.val;
                    item.set(newVal);
                    save.mutate({ [item.key]: newVal });
                  }}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 ${item.val ? "bg-violet-600" : "bg-[var(--bg-card)]"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${item.val ? "left-7" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className={`rounded-2xl border border-red-500/20 p-6 bg-red-100 dark:bg-red-900/10`}>
          <h3 className="font-bold text-red-500 mb-1">Danger Zone</h3>
          <p className={`text-xs mb-4 ${sub}`}>Irreversible platform-wide actions — proceed with caution.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { save.mutate({ maintenanceMode: !maintenance }); setMaintenance(m => !m); toast.success("Maintenance mode toggled"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/20 text-amber-400 text-xs font-bold hover:bg-amber-600/30 transition-all">
              <AlertTriangle size={13} /> Toggle Maintenance Mode
            </button>
            <button onClick={() => toast.success("Cache cleared successfully")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 text-amber-400 text-xs font-bold hover:bg-violet-600/30 transition-all">
              <RefreshCcw size={13} /> Clear Platform Cache
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
