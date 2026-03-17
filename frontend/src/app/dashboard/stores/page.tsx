"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeAPI } from "../../../lib/api";
import DashboardLayout from "../../../components/layout/DashboardLayout";

import { Plus, Edit2, Trash2, Globe, Package, ShoppingCart, Users, X, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/auth.store";

const schema = z.object({
  name:         z.string().min(2, "Name too short"),
  description:  z.string().max(500).optional(),
  currency:     z.string().default("USD"),
  country:      z.string().optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
  supportPhone: z.string().optional(),
  taxRate:      z.coerce.number().min(0).max(100).default(0),
  primaryColor: z.string().default("#7c3aed"),
});
type StoreForm = z.infer<typeof schema>;

export default function StoresPage() {
  
  
  const qc   = useQueryClient();
  const { updateUser } = useAuthStore();
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";
  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";

  const [modal, setModal]   = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn:  () => storeAPI.getAll().then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StoreForm>({
    resolver: zodResolver(schema),
    values:   editing ? { ...editing } : { currency: "USD", primaryColor: "#7c3aed", taxRate: 0 },
  });

  const createMut = useMutation({
    mutationFn: (d: StoreForm) => storeAPI.create(d),
    onSuccess: (r) => {
      toast.success("Store created!");
      qc.invalidateQueries({ queryKey: ["stores"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      setModal(null);
      reset();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Create failed"),
  });

  const updateMut = useMutation({
    mutationFn: (d: StoreForm) => storeAPI.update(editing.id, d),
    onSuccess: () => {
      toast.success("Store updated!");
      qc.invalidateQueries({ queryKey: ["stores"] });
      setModal(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Update failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => storeAPI.delete(id),
    onSuccess: () => { toast.success("Store deleted"); qc.invalidateQueries({ queryKey: ["stores"] }); },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${tx}`}>My Stores</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>{stores.length} store{stores.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => { setEditing(null); reset({ currency: "USD", primaryColor: "#7c3aed", taxRate: 0 }); setModal("create"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold [color:var(--text-primary)] shadow-lg "
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Plus size={16} /> New Store
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className={`rounded-2xl border p-6 animate-pulse ${card}`}>
                <div className={`h-5 w-32 rounded mb-3 ${"[background:var(--bg-card)]"}`} />
                <div className={`h-3 w-24 rounded ${"[background:var(--bg-card)]"}`} />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className={`rounded-3xl border border-dashed [border-color:var(--accent)]/20 p-16 text-center bg-base`}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-lg "
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              🏪
            </div>
            <h2 className={`text-2xl font-black mb-2 ${tx}`}>Create your first store</h2>
            <p className={`text-sm mb-6 max-w-sm mx-auto ${sub}`}>
              Set up your dropshipping store and start selling products globally in minutes.
            </p>
            <button onClick={() => { setModal("create"); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] shadow-lg "
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Plus size={16} /> Create Store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store: any) => (
              <div key={store.id} className={`rounded-2xl border p-5 ${card}`}>
                {/* Store header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center [color:var(--text-primary)] text-lg font-black shadow-md"
                      style={{ background: store.primaryColor ? `linear-gradient(135deg,${store.primaryColor},${store.primaryColor}99)` : "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                      {store.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-black ${tx}`}>{store.name}</h3>
                      <div className={`flex items-center gap-1 text-xs ${sub}`}>
                        <Globe size={10} />
                        <span className="truncate max-w-[180px]">{store.customDomain || store.domain}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                      ${store.status === "ACTIVE" ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-red-400/10 text-red-400"}`}>
                      {store.status}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { icon: Package,      label: "Products",  val: store._count?.products  || 0 },
                    { icon: ShoppingCart, label: "Orders",    val: store._count?.orders    || 0 },
                    { icon: Users,        label: "Customers", val: store._count?.customers || 0 },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className={`rounded-xl p-3 text-center border bg-base [border-color:var(--border)]`}>
                      <div className={`text-base font-black ${tx}`}>{val}</div>
                      <div className={`text-xs ${sub}`}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {store.description && (
                  <p className={`text-xs mb-4 line-clamp-2 ${sub}`}>{store.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a href={`https://${store.domain}`} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all
                      [border-color:var(--border-strong)] text-secondary hover:[background:var(--bg-secondary)]`}>
                    <ExternalLink size={11} /> Visit
                  </a>
                  <button onClick={() => { setEditing(store); setModal("edit"); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all
                      [border-color:var(--accent)]/20 [color:var(--accent)] hover:[background:var(--accent-dim)]`}>
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${store.name}"? This removes all products and orders.`)) deleteMut.mutate(store.id); }}
                    className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all
                      border-red-500/20 text-red-400 hover:bg-red-500/10`}>
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)" }}>
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl max-h-[90vh] flex flex-col animate-fade ${"bg-secondary [border-color:var(--border)]"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b [border-color:var(--border)]`}>
              <h2 className={`font-black text-lg ${tx}`}>{modal === "create" ? "Create Store" : "Edit Store"}</h2>
              <button onClick={() => setModal(null)} className={`p-2 rounded-xl ${"hover:[background:var(--bg-secondary)]"}`}>
                <X size={16} className={sub} />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => modal === "create" ? createMut.mutate(d) : updateMut.mutate(d))}
              className="overflow-y-auto flex-1 p-6 space-y-4">
              {[
                { name: "name" as const,         label: "Store Name",          type: "text",   full: true },
                { name: "supportEmail" as const, label: "Support Email",        type: "email",  full: true },
                { name: "supportPhone" as const, label: "Support Phone",        type: "tel",    full: false },
                { name: "country" as const,      label: "Country",             type: "text",   full: false },
                { name: "taxRate" as const,      label: "Tax Rate (%)",         type: "number", full: false },
                { name: "primaryColor" as const, label: "Brand Color",          type: "color",  full: false },
              ].map(({ name, label, type, full }) => (
                <div key={name} className={full ? "" : "grid grid-cols-2 gap-4 col-span-2"}>
                  {!full ? (
                    <div className="col-span-1">
                      <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>{label}</label>
                      <input {...register(name)} type={type} step={type === "number" ? "0.01" : undefined}
                        className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 transition-all ${inp}
                          ${type === "color" ? "h-11 p-1.5 cursor-pointer" : ""}`} />
                      {errors[name] && <p className="text-xs text-red-400 mt-1">{errors[name]?.message}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>{label}</label>
                      <input {...register(name)} type={type}
                        className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 transition-all ${inp}`} />
                      {errors[name] && <p className="text-xs text-red-400 mt-1">{errors[name]?.message}</p>}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>Currency</label>
                <select {...register("currency")} className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 ${inp}`}>
                  {["USD", "EUR", "GBP", "NGN", "KES", "GHS", "ZAR"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>Description</label>
                <textarea {...register("description")} rows={3}
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none focus:border-violet-500 resize-none ${inp}`} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMut.isPending || updateMut.isPending}
                  className="flex-1 py-3 rounded-xl text-sm font-bold [color:var(--text-primary)] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  {createMut.isPending || updateMut.isPending ? "Saving…" : modal === "create" ? "Create Store" : "Save Changes"}
                </button>
                <button type="button" onClick={() => setModal(null)}
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
