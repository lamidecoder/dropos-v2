"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { AlertTriangle, Package, TrendingDown, Plus, Minus, Search, X } from "lucide-react";
import toast from "react-hot-toast";

export default function InventoryPage() {
  
  
  const qc   = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"low"|"out">("all");
  const [adjustId,  setAdjustId]  = useState<string|null>(null);
  const [adjustQty, setAdjustQty] = useState(0);

  const tx   = "[color:var(--text-primary)]";
  const sub  = "text-secondary";
  const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";
  const inp  = "[background:var(--bg-secondary)] [border-color:var(--border)] [color:var(--text-primary)]";

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", storeId, search],
    queryFn:  () => productAPI.getAll(storeId!, { limit: 100, search }).then((r) => r.data),
    enabled:  !!storeId,
  });

  const adjustMut = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      productAPI.update(storeId!, id, { inventory: qty }),
    onSuccess: () => { toast.success("Stock updated"); qc.invalidateQueries({ queryKey: ["inventory"] }); setAdjustId(null); },
    onError:   () => toast.error("Update failed"),
  });

  const all      = data?.data || [];
  const products = all.filter((p: any) => {
    if (filter === "low") return p.inventory > 0 && p.inventory < 10;
    if (filter === "out") return p.inventory === 0;
    return true;
  });

  const outOfStock = all.filter((p: any) => p.inventory === 0).length;
  const lowStock   = all.filter((p: any) => p.inventory > 0 && p.inventory < 10).length;
  const totalUnits = all.reduce((s: number, p: any) => s + (p.inventory || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Inventory</h1>
          <p className={`text-sm mt-0.5 ${sub}`}>Track and manage your product stock levels</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Units",  value: totalUnits, icon: Package,       color: "[color:var(--accent)]", bg: "[background:var(--accent-dim)]" },
            { label: "Low Stock",    value: lowStock,   icon: TrendingDown,  color: "[color:var(--accent)]",  bg: "bg-amber-500/10"  },
            { label: "Out of Stock", value: outOfStock, icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-500/10"    },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-5 ${card}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}><Icon size={18} className={color} /></div>
              <div className={`text-2xl font-black ${tx}`}>{value}</div>
              <div className={`text-xs mt-0.5 ${sub}`}>{label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border flex-1 min-w-[200px] ${"[background:var(--bg-secondary)] [border-color:var(--border)]"}`}>
            <Search size={14} className={sub} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="bg-transparent outline-none flex-1 text-sm" />
            {search && <button onClick={() => setSearch("")}><X size={12} className={sub} /></button>}
          </div>
          <div className="flex gap-2">
            {(["all","low","out"] as const).map((v) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === v ? "[color:var(--text-primary)]" : `${sub} ${"hover:[background:var(--bg-secondary)]"}`}`}
                style={filter === v ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                {v === "all" ? "All" : v === "low" ? "Low Stock" : "Out of Stock"}
              </button>
            ))}
          </div>
        </div>

        {lowStock > 0 && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border" style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.2)" }`}>
            <AlertTriangle size={16} className="[color:var(--accent)] flex-shrink-0" />
            <p className={`text-sm [color:var(--accent)]`}>
              <strong>{lowStock} product{lowStock > 1 ? "s" : ""}</strong> running low. Reorder soon to avoid stockouts.
            </p>
            <button onClick={() => setFilter("low")} className="ml-auto text-xs font-bold [color:var(--accent)] flex-shrink-0">View</button>
          </div>
        )}

        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b border-inherit text-xs ${sub}`}>
                {["Product","SKU","In Stock","Status","Adjust"].map(h => (
                  <th key={h} className="text-left font-semibold px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({length:5}).map((_,i) => (
                <tr key={i} className={"border-b [border-color:var(--border)]"}>
                  {Array.from({length:5}).map((_,j) => <td key={j} className="px-5 py-4"><div className={"h-3 rounded animate-pulse [background:var(--bg-card)]"} style={{width:"60%"}} /></td>)}
                </tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={5} className={`py-12 text-center ${sub}`}>No products found</td></tr>
              ) : products.map((p: any) => {
                const isLow = p.inventory > 0 && p.inventory < 10;
                const isOut = p.inventory === 0;
                return (
                  <tr key={p.id} className={"border-b transition-colors [border-color:var(--border)] hover:bg-[var(--bg-card)]"}>
                    <td className="px-5 py-4">
                      <div className={`font-semibold ${tx}`}>{p.name}</div>
                      {p.category && <div className={`text-xs ${sub}`}>{p.category}</div>}
                    </td>
                    <td className={`px-5 py-4 font-mono text-xs ${sub}`}>{p.sku||"—"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-lg font-black ${isOut?"text-red-400":isLow?"[color:var(--accent)]":tx}`}>{p.inventory}</span>
                    </td>
                    <td className="px-5 py-4">
                      {isOut && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500">Out of Stock</span>}
                      {isLow && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 [color:var(--accent)]">Low Stock</span>}
                      {!isOut && !isLow && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">In Stock</span>}
                    </td>
                    <td className="px-5 py-4">
                      {adjustId === p.id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setAdjustQty(q => Math.max(0,q-1))} className={"w-7 h-7 rounded-lg border [border-color:var(--border)] flex items-center justify-center hover:[background:var(--bg-card)]"}><Minus size={12} className={sub}/></button>
                          <input type="number" value={adjustQty} min={0} onChange={(e) => setAdjustQty(Math.max(0,Number(e.target.value)))} className={`w-16 text-center rounded-lg px-2 py-1 text-sm border font-bold ${inp}`} />
                          <button onClick={() => setAdjustQty(q => q+1)} className={"w-7 h-7 rounded-lg border [border-color:var(--border)] flex items-center justify-center hover:[background:var(--bg-card)]"}><Plus size={12} className={sub}/></button>
                          <button onClick={() => adjustMut.mutate({id:p.id,qty:adjustQty})} disabled={adjustMut.isPending} className="px-3 py-1.5 rounded-lg text-xs font-bold [color:var(--text-primary)] disabled:opacity-60" style={{background:"linear-gradient(135deg,#7c3aed,#a855f7)"}}>Save</button>
                          <button onClick={() => setAdjustId(null)} className={`text-xs ${sub}`}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setAdjustId(p.id); setAdjustQty(p.inventory); }} className={"px-3 py-1.5 rounded-lg text-xs font-semibold border [border-color:var(--border)] text-secondary transition-all hover:[background:var(--bg-card)]"}>Adjust</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
