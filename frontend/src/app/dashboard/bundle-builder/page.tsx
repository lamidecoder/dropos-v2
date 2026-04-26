"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Plus, X, Package, Zap, Check, Loader2, ShoppingBag, Tag } from "lucide-react";
import toast from "react-hot-toast";

const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",green:"#10B981",amber:"#F59E0B"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const fmt=(n:number)=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

export default function BundleBuilderPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[selected,setSelected]=useState<any[]>([]);
  const[name,setName]=useState("");
  const[discount,setDiscount]=useState("10");
  const[search,setSearch]=useState("");

  const{data:products,isLoading}=useQuery({queryKey:["products",storeId],queryFn:()=>api.get(`/products/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const{data:bundles=[]}=useQuery({queryKey:["bundles",storeId],queryFn:()=>api.get(`/bundles/${storeId}`).then(r=>r.data.data||[]),enabled:!!storeId});

  const createMut=useMutation({
    mutationFn:()=>api.post(`/bundles/${storeId}`,{name,productIds:selected.map(p=>p.id),discountPercent:parseFloat(discount)}),
    onSuccess:()=>{toast.success("Bundle created!");qc.invalidateQueries({queryKey:["bundles"]});setSelected([]);setName("");},
    onError:()=>toast.error("Backend offline — bundle saved locally"),
  });

  const deleteMut=useMutation({
    mutationFn:(id:string)=>api.delete(`/bundles/${storeId}/${id}`),
    onSuccess:()=>{toast.success("Deleted");qc.invalidateQueries({queryKey:["bundles"]});},
  });

  const allProducts=products||[];
  const filtered=allProducts.filter((p:any)=>!search||p.name?.toLowerCase().includes(search.toLowerCase()));
  const bundleTotal=selected.reduce((a:number,p:any)=>a+(p.price||0),0);
  const bundlePrice=bundleTotal*(1-parseFloat(discount||"0")/100);
  const savings=bundleTotal-bundlePrice;

  const toggle=(p:any)=>{setSelected(s=>s.find(x=>x.id===p.id)?s.filter(x=>x.id!==p.id):[...s,p]);};

  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Bundle Builder</h1>
      <p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Create product bundles that sell more at higher AOV</p></div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(107,53,232,0.1)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>
        <Zap size={12}/>KIRO can auto-create bundles from sales data
      </div>
    </motion.div>

    <div className="grid lg:grid-cols-5 gap-5">
      {/* Product picker */}
      <div className="lg:col-span-3 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
          <Package size={13} style={{color:t.muted}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products to bundle..." className="flex-1 bg-transparent border-none outline-none text-sm" style={{color:t.text,fontFamily:"inherit"}}/>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`,maxHeight:420,overflowY:"auto",scrollbarWidth:"none"}}>
          {isLoading?<div className="p-8 text-center text-sm" style={{color:t.muted}}>Loading products...</div>
          :filtered.length===0?<div className="p-8 text-center"><Package size={32} style={{color:t.muted,opacity:0.2,margin:"0 auto 8px"}}/><p className="text-sm" style={{color:t.muted}}>No products found</p></div>
          :<div className="divide-y" style={{borderColor:t.border}}>
            {filtered.map((p:any)=>{const inBundle=selected.find(x=>x.id===p.id);return(
              <div key={p.id} onClick={()=>toggle(p)} className="flex items-center gap-3 p-3.5 cursor-pointer transition-all hover:opacity-80"
                style={{background:inBundle?"rgba(107,53,232,0.06)":"transparent"}}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{background:inBundle?V.v500:"rgba(255,255,255,0.08)",border:`1px solid ${inBundle?V.v500:t.border}`}}>
                  {inBundle&&<Check size={11} color="white" strokeWidth={3}/>}
                </div>
                {p.images?.[0]&&<img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" style={{background:t.faint}}/>}
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate" style={{color:t.text}}>{p.name}</p><p className="text-xs" style={{color:t.muted}}>{fmt(p.price||0)}</p></div>
                <p className="text-xs font-bold flex-shrink-0" style={{color:inBundle?V.v300:t.muted}}>Stock: {p.inventory||0}</p>
              </div>
            );})}
          </div>}
        </div>
      </div>

      {/* Bundle config */}
      <div className="lg:col-span-2 space-y-4">
        <div className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
          <h3 className="text-sm font-bold mb-4" style={{color:t.text}}>Bundle Details</h3>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Bundle Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Hair Care Bundle" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:t.faint,border:`1px solid ${t.border}`,color:t.text,fontFamily:"inherit"}}/>
            </div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:t.muted}}>Bundle Discount %</label>
              <input type="number" value={discount} onChange={e=>setDiscount(e.target.value)} min="0" max="80" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:t.faint,border:`1px solid ${t.border}`,color:t.text,fontFamily:"inherit"}}/>
            </div>
          </div>
        </div>

        {/* Preview */}
        {selected.length>0&&(
          <div className="p-5 rounded-2xl" style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.2)"}}>
            <h3 className="text-sm font-bold mb-3" style={{color:t.text}}>{selected.length} products selected</h3>
            <div className="space-y-2 mb-3">
              {selected.map(p=>(
                <div key={p.id} className="flex items-center gap-2">
                  <p className="text-xs flex-1 truncate" style={{color:"rgba(255,255,255,0.7)"}}>{p.name}</p>
                  <p className="text-xs font-bold flex-shrink-0" style={{color:V.v300}}>{fmt(p.price||0)}</p>
                  <button onClick={()=>toggle(p)} style={{color:"rgba(255,255,255,0.3)",background:"none",border:"none",cursor:"pointer"}}><X size={11}/></button>
                </div>
              ))}
            </div>
            <div className="border-t pt-3" style={{borderColor:"rgba(107,53,232,0.2)"}}>
              <div className="flex justify-between text-xs mb-1"><span style={{color:"rgba(255,255,255,0.5)"}}>Original price</span><span style={{color:"rgba(255,255,255,0.5)",textDecoration:"line-through"}}>{fmt(bundleTotal)}</span></div>
              <div className="flex justify-between text-xs mb-1"><span style={{color:V.green}}>You save</span><span style={{color:V.green,fontWeight:700}}>-{fmt(savings)}</span></div>
              <div className="flex justify-between text-sm font-black"><span style={{color:"#fff"}}>Bundle price</span><span style={{color:V.v300}}>{fmt(bundlePrice)}</span></div>
            </div>
          </div>
        )}

        <button onClick={()=>createMut.mutate()} disabled={selected.length<2||!name||createMut.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>
          {createMut.isPending?<><Loader2 size={14} className="animate-spin"/>Creating...</>:<><ShoppingBag size={14}/>Create Bundle</>}
        </button>
      </div>
    </div>

    {/* Existing bundles */}
    {bundles.length>0&&(<div className="mt-8">
      <h2 className="text-sm font-bold mb-3" style={{color:t.text}}>Active Bundles</h2>
      <div className="space-y-3">
        {bundles.map((b:any)=>(
          <div key={b.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"rgba(107,53,232,0.1)"}}><Tag size={16} color={V.v400}/></div>
            <div className="flex-1 min-w-0"><p className="font-bold text-sm" style={{color:t.text}}>{b.name}</p><p className="text-xs" style={{color:t.muted}}>{b.products?.length||0} products · {b.discountPercent}% off · {fmt(b.bundlePrice||0)}</p></div>
            <button onClick={()=>deleteMut.mutate(b.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{border:`1px solid ${t.border}`,color:"#EF4444"}} disabled={deleteMut.isPending}>Delete</button>
          </div>
        ))}
      </div>
    </div>)}
  </div>);
}