"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { Plus, Trash2, Edit2, Globe, X, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const schema = z.object({
  name:          z.string().min(2, "Zone name required"),
  countries:     z.string().min(2, "At least one country required"),
  shippingRate:  z.coerce.number().min(0),
  freeThreshold: z.coerce.number().min(0).optional(),
  estimatedDays: z.string().optional(),
});

const POPULAR_COUNTRIES = [
  "Nigeria","Ghana","Kenya","South Africa","Egypt",
  "United States","United Kingdom","Canada","Australia",
  "Germany","France","India","UAE","Singapore",
];

export default function ShippingPage() {
  
  
  const qc   = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["shipping-zones", storeId],
    queryFn:  () => api.get(`/shipping/${storeId}`).then((r) => r.data.data),
    enabled:  !!storeId,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    values: editing ? {
      ...editing,
      countries: Array.isArray(editing.countries) ? editing.countries.join(", ") : editing.countries,
    } : undefined,
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post(`/shipping/${storeId}`, {
      ...d, countries: d.countries.split(",").map((c: string) => c.trim()).filter(Boolean),
    }),
    onSuccess: () => { toast.success("Shipping zone created"); qc.invalidateQueries({ queryKey: ["shipping-zones"] }); closeModal(); },
    onError:   (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: (d: any) => api.put(`/shipping/${storeId}/${editing.id}`, {
      ...d, countries: d.countries.split(",").map((c: string) => c.trim()).filter(Boolean),
    }),
    onSuccess: () => { toast.success("Zone updated"); qc.invalidateQueries({ queryKey: ["shipping-zones"] }); closeModal(); },
    onError:   () => toast.error("Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/shipping/${storeId}/${id}`),
    onSuccess:  () => { toast.success("Zone deleted"); qc.invalidateQueries({ queryKey: ["shipping-zones"] },
    onError: (e: any) => toast.error(e.response?.data?.message || "Operation failed")); },
  });

  const openCreate = () => { setEditing(null); reset({}); setModal(true); };
  const openEdit   = (z: any) => { setEditing(z); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset({}); };

  const countriesVal = watch("countries") || "";
  const addCountry = (c: string) => {
    const existing = countriesVal.split(",").map((x: string) => x.trim()).filter(Boolean);
    if (!existing.includes(c)) setValue("countries", [...existing, c].join(", "));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Shipping Zones</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Set delivery rates for different regions</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold [color:var(--text-primary)] shadow-lg "
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Plus size={16} /> Add Zone
          </button>
        </div>

        {/* Tip */}
        <div className={`flex items-start gap-3 p-4 rounded-2xl border [background:var(--accent-dim)] [border-color:var(--accent)]/20`}>
          <Truck size={16} className="[color:var(--accent)] flex-shrink-0 mt-0.5" />
          <p className={`text-sm text-violet-300`}>
            Zones are matched in order — the first matching zone for a customer's country will be used. Set a free shipping threshold to encourage larger orders.
          </p>
        </div>

        {/* Zones */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className={`rounded-2xl border p-5 animate-pulse ${card}`}>
                <div className={`h-5 w-40 rounded mb-3 ${"[background:var(--bg-card)]"}`} />
                <div className={`h-3 w-64 rounded ${"[background:var(--bg-card)]"}`} />
              </div>
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className={`rounded-3xl border-2 border-dashed [border-color:var(--accent)]/20 p-16 text-center bg-base`}>
            <Globe size={48} className="mx-auto mb-4 [color:var(--accent)] opacity-40" />
            <h2 className={`text-xl font-black mb-2 ${tx}`}>No shipping zones</h2>
            <p className={`text-sm mb-5 ${sub}`}>Add zones to control where you ship and how much it costs</p>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Plus size={14} /> Add First Zone
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone: any, i: number) => (
              <div key={zone.id} className={`rounded-2xl border p-5 ${card}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black [background:var(--bg-card)] text-secondary`}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 className={`font-black text-base ${tx}`}>{zone.name}</h3>
                      <p className={`text-xs mt-0.5 ${sub}`}>
                        {Array.isArray(zone.countries) ? zone.countries.join(", ") : zone.countries}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(zone)}
                      className={`p-2 rounded-lg ${"[color:var(--accent)] hover:[background:var(--accent-dim)]"}`}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => { if (confirm("Delete zone?")) deleteMut.mutate(zone.id); }}
                      className={`p-2 rounded-lg ${"text-red-400 hover:bg-red-400/10"}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <div className={`px-3 py-2 rounded-xl text-sm font-bold ${"[background:var(--bg-card)]"}`}>
                    <span className={sub}>Rate: </span>
                    <span className={tx}>{zone.shippingRate === 0 ? "FREE" : `$${zone.shippingRate}`}</span>
                  </div>
                  {zone.freeThreshold > 0 && (
                    <div className={`px-3 py-2 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-500`}>
                      Free over ${zone.freeThreshold}
                    </div>
                  )}
                  {zone.estimatedDays && (
                    <div className={`px-3 py-2 rounded-xl text-sm ${"[background:var(--bg-card)]"}`}>
                      <span className={sub}>Delivery: </span>
                      <span className={tx}>{zone.estimatedDays}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl ${"bg-secondary [border-color:var(--border)]"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]`}>
              <h2 className={`font-black text-lg ${tx}`}>{editing ? "Edit Zone" : "Add Shipping Zone"}</h2>
              <button onClick={closeModal} className={`p-2 rounded-xl ${"hover:[background:var(--bg-secondary)]"}`}>
                <X size={16} className={sub} />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => editing ? updateMut.mutate(d) : createMut.mutate(d))}
              className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Zone Name *</label>
                <input {...register("name")} placeholder="e.g. West Africa, Europe, Worldwide"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Countries (comma separated) *</label>
                <textarea {...register("countries")} rows={2}
                  placeholder="Nigeria, Ghana, Kenya"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 resize-none transition-all ${inp}`} />
                {errors.countries && <p className="text-xs text-red-400 mt-1">{errors.countries.message}</p>}
                {/* Quick add */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_COUNTRIES.filter(c => !countriesVal.includes(c)).slice(0, 8).map((c) => (
                    <button key={c} type="button" onClick={() => addCountry(c)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all [background:var(--bg-card)] text-secondary hover:[background:var(--accent-dim)] hover:[color:var(--accent)]`}>
                      + {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Shipping Rate ($)</label>
                  <input {...register("shippingRate")} type="number" step="0.01" placeholder="0 = Free"
                    className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Free Over ($)</label>
                  <input {...register("freeThreshold")} type="number" step="0.01" placeholder="e.g. 50"
                    className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${sub}`}>Estimated Delivery</label>
                <input {...register("estimatedDays")} placeholder="e.g. 3–5 business days"
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border-2 outline-none focus:border-violet-500 transition-all ${inp}`} />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                  className="flex-1 py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {createMut.isPending || updateMut.isPending ? "Saving…" : editing ? "Save Changes" : "Create Zone"}
                </button>
                <button type="button" onClick={closeModal}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold border-2 ${"[border-color:var(--border)] text-secondary"}`}>
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
