"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { Save, DollarSign, Package, Shield, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const qc  = useQueryClient();
  const card = "bg-[var(--bg-card)] border-[var(--border)]";
  const inp  = "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-primary)]";
  const tx   = "text-[var(--text-primary)]";
  const sub  = "text-[var(--text-tertiary)]";

  const [fee, setFee]                 = useState<number>(2);
  const [maintenance, setMaintenance] = useState(false);
  const [allowReg, setAllowReg]       = useState(true);
  const [feeEditing, setFeeEditing]   = useState(false);

  const PLANS = [
    { key: "freePrice",    name: "Free",   color: "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]", value: 0 },
    { key: "growthPrice",  name: "Growth", color: "bg-amber-400/10 text-amber-400",                       value: 9500 },
    { key: "proPrice",     name: "Pro",    color: "bg-violet-400/10 text-violet-400",                     value: 25000 },
  ];

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const r = await adminAPI.getSettings();
      const s = r.data.data;
      if (s.platformFeePercent !== undefined) setFee(s.platformFeePercent);
      if (s.maintenanceMode   !== undefined) setMaintenance(s.maintenanceMode);
      if (s.allowRegistration !== undefined) setAllowReg(s.allowRegistration);
      return s;
    },
  });

  const save = useMutation({
    mutationFn: (data: any) => adminAPI.updateSettings(data),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: () => toast.error("Save failed"),
  });

  const handleSave = () => {
    save.mutate({ platformFeePercent: fee, maintenanceMode: maintenance, allowRegistration: allowReg });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Platform Settings</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>Changes apply platform-wide instantly</p>
        </div>
        <button
          onClick={handleSave}
          disabled={save.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90"
          style={{ background: "var(--violet-500)" }}
        >
          <Save size={14} />
          {save.isPending ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* Platform fee */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-violet-500" />
          <h3 className={`font-bold ${tx}`}>Platform Fee</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${sub}`}>Transaction fee charged on all orders</p>
          </div>
          {feeEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                min={0}
                max={10}
                step={0.5}
                className={`w-20 px-3 py-1.5 rounded-lg text-sm border outline-none ${inp}`}
              />
              <span className={`text-sm ${sub}`}>%</span>
              <button
                onClick={() => setFeeEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "var(--violet-500)" }}
              >
                Done
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-lg font-black ${tx}`}>{fee}%</span>
              <button
                onClick={() => setFeeEditing(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-[var(--bg-secondary)] border-[var(--border)] ${sub}`}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Plan prices */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-violet-500" />
          <h3 className={`font-bold ${tx}`}>Subscription Plans</h3>
        </div>
        <div className="space-y-3">
          {PLANS.map((plan) => {
            const val = (settings as any)?.[plan.key] ?? plan.value;
            return (
              <div key={plan.key} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${plan.color}`}>{plan.name}</span>
                </div>
                <span className={`font-bold ${tx}`}>
                  {val === 0 ? "Free" : `₦${val.toLocaleString()}/mo`}
                </span>
              </div>
            );
          })}
        </div>
        <p className={`text-xs mt-3 ${sub}`}>Plan prices are managed in your Paystack dashboard.</p>
      </div>

      {/* Registration toggle */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-violet-500" />
          <h3 className={`font-bold ${tx}`}>User Registration</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${sub}`}>Allow new users to register</p>
          </div>
          <button
            onClick={() => setAllowReg(!allowReg)}
            className={`relative w-11 h-6 rounded-full transition-all ${allowReg ? "bg-violet-500" : "bg-[var(--bg-secondary)]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${allowReg ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Maintenance mode */}
      <div className={`rounded-2xl border p-6 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-violet-500" />
          <h3 className={`font-bold ${tx}`}>Maintenance Mode</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${sub}`}>Take the platform offline for maintenance</p>
            {maintenance && (
              <p className="text-xs mt-1 text-amber-400">⚠ Platform is currently in maintenance mode</p>
            )}
          </div>
          <button
            onClick={() => setMaintenance(!maintenance)}
            className={`relative w-11 h-6 rounded-full transition-all ${maintenance ? "bg-amber-500" : "bg-[var(--bg-secondary)]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${maintenance ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
