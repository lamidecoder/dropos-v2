"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Package, AlertTriangle, TrendingDown, Search, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

export default function InventoryPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    row: isDark?"rgba(255,255,255,0.02)":"rgba(107,53,232,0.015)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<{id:string,stock:number}|null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", storeId],
    queryFn: () => api.get(`/products/${storeId}?limit=100`).then(r => r.data.data?.products || r.data.data || []),
    enabled: !!storeId,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, stock }: {id:string;stock:number}) =>
      api.patch(`/products/${storeId}/${id}`, { inventory: stock }),
    onSuccess: () => { toast.success("Stock updated"); qc.invalidateQueries({queryKey:["inventory"]}); setEditing(null); },
    onError: () => toast.error("Update failed"),
  });

  const products = (data || []).filter((p: any) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const stock = p.inventory ?? p.stockQuantity ?? 0;
    if (filter === "low")      return matchSearch && stock > 0 && stock <= 10;
    if (filter === "out")      return matchSearch && stock === 0;
    if (filter === "in_stock") return matchSearch && stock > 10;
    return matchSearch;
  });

  const low   = (data||[]).filter((p:any) => { const s=p.inventory??p.stockQuantity??0; return s>0&&s<=10; }).length;
  const out   = (data||[]).filter((p:any) => (p.inventory??p.stockQuantity??0)===0).length;
  const total = (data||[]).length;

  const stockColor = (s: number) => s === 0 ? V.red : s <= 10 ? V.amber : V.green;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>Inventory</h1>
          <p className="text-sm" style={{color:t.muted}}>{total} products · {low} low · {out} out of stock</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {label:"Total Products", value:total,   color:V.v400, icon:Package,       id:"all"},
          {label:"Low Stock",      value:low,     color:V.amber,icon:TrendingDown,  id:"low"},
          {label:"Out of Stock",   value:out,     color:V.red,  icon:AlertTriangle, id:"out"},
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            onClick={() => setFilter(filter===s.id?"all":s.id)}
            className="p-4 rounded-2xl transition-all" style={{cursor:"pointer",background:filter===s.id?`${s.color}12`:t.card,border:`1px solid ${filter===s.id?s.color+"40":t.border}`}}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{background:`${s.color}15`}}>
              <s.icon size={14} style={{color:s.color}}/>
            </div>
            <p className="text-xl font-black mb-0.5" style={{color:t.text}}>{s.value}</p>
            <p className="text-xs" style={{color:t.muted}}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4" style={{background:t.faint,border:`1px solid ${t.border}`}}>
        <Search size={14} style={{color:t.muted,flexShrink:0}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
          style={{flex:1,background:"transparent",border:"none",outline:"none",color:t.text,fontSize:13,fontFamily:"inherit"}}/>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{color:t.muted,borderBottom:`1px solid ${t.border}`}}>
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Stock</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Action</div>
        </div>
        {isLoading ? (
          <div className="text-center py-12" style={{color:t.muted}}>Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12" style={{color:t.muted}}>No products found</div>
        ) : products.map((p:any, i:number) => {
          const stock = p.inventory ?? p.stockQuantity ?? 0;
          const color = stockColor(stock);
          const isEditing = editing?.id === p.id;
          return (
            <motion.div key={p.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
              className="grid grid-cols-12 gap-3 items-center px-4 py-3"
              style={{borderBottom:i<products.length-1?`1px solid ${t.border}`:"none",background:i%2===0?t.row:"transparent"}}>
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" style={{border:`1px solid ${t.border}`}}
                    onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                ) : (
                  <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center" style={{background:t.faint,border:`1px solid ${t.border}`}}>
                    <Package size={14} style={{color:t.muted}}/>
                  </div>
                )}
                <p className="text-sm font-medium truncate" style={{color:t.text}}>{p.name}</p>
              </div>
              <div className="col-span-2 text-center">
                {isEditing ? (
                  <input type="number" value={(editing as any)?.stock ?? 0} min={0}
                    onChange={e => setEditing({id:p.id,stock:Number(e.target.value)})}
                    className="w-16 text-center rounded-lg py-1 text-sm font-bold"
                    style={{background:t.faint,border:`1px solid ${V.v400}`,color:t.text,outline:"none"}}/>
                ) : (
                  <span className="text-sm font-bold" style={{color}}>{stock}</span>
                )}
              </div>
              <div className="col-span-2 flex justify-center">
                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{color,background:`${color}15`}}>
                  {stock===0?"Out of Stock":stock<=10?"Low Stock":"In Stock"}
                </span>
              </div>
              <div className="col-span-2 flex justify-center gap-1">
                {isEditing ? (
                  <>
                    <button onClick={() => updateMut.mutate({id:p.id,stock:(editing as any).stock})}
                      style={{width:28,height:28,borderRadius:8,border:"none",background:"rgba(16,185,129,0.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Check size={13} color={V.green}/>
                    </button>
                    <button onClick={() => setEditing(null)}
                      style={{width:28,height:28,borderRadius:8,border:"none",background:"rgba(239,68,68,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <X size={13} color={V.red}/>
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing({id:p.id,stock})}
                    style={{width:28,height:28,borderRadius:8,border:`1px solid ${t.border}`,background:t.faint,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Edit2 size={12} style={{color:t.muted}}/>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
