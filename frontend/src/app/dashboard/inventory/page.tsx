"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{BarChart2,AlertTriangle,Package,Search,Edit2,Check,X}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

export default function InventoryPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[search,setSearch]=useState("");const[filter,setFilter]=useState("all");const[editing,setEditing]=useState(null);const[editVal,setEditVal]=useState("");
  const{data,isLoading}=useQuery({queryKey:["inventory",storeId],queryFn:()=>api.get(`/products/${storeId}`).then(r=>r.data.data),enabled:!!storeId});
  const upd=useMutation({mutationFn:({id,inventory})=>api.patch(`/products/${storeId}/${id}`,{inventory}),onSuccess:()=>{toast.success("Stock updated");qc.invalidateQueries({queryKey:["inventory"]});setEditing(null);},onError:(e)=>toast.error(e.response?.data?.message||"Failed")});
  const products=data||[];
  const filtered=products.filter(p=>(!search||p.name?.toLowerCase().includes(search.toLowerCase()))&&(filter==="all"?true:filter==="low"?p.inventory>0&&p.inventory<=5:filter==="out"?p.inventory===0:p.inventory>5));
  const oos=products.filter(p=>p.inventory===0).length;const low=products.filter(p=>p.inventory>0&&p.inventory<=5).length;
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Inventory</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Manage stock levels across all products</p></motion.div>
    {oos>0&&<div className="flex items-center gap-3 p-4 rounded-2xl mb-4" style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)"}}><AlertTriangle size={15} color={V.red}/><p className="text-xs" style={{color:V.red}}><strong>{oos} product{oos!==1?"s":""}</strong> out of stock</p></div>}
    {low>0&&<div className="flex items-center gap-3 p-4 rounded-2xl mb-4" style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}><AlertTriangle size={15} color={V.amber}/><p className="text-xs" style={{color:V.amber}}><strong>{low} product{low!==1?"s":""}</strong> running low (5 or fewer units)</p></div>}
    <div className="flex items-center gap-2 mb-4 overflow-x-auto" style={{scrollbarWidth:"none"}}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0" style={{background:t.card,border:`1px solid ${t.border}`}}><Search size={12} style={{color:t.muted}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="bg-transparent border-none outline-none text-xs w-28" style={{color:t.text,fontFamily:"inherit"}}/></div>
      {["all","in-stock","low","out"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0" style={{background:filter===f?V.v500:t.card,color:filter===f?"#fff":t.muted,border:`1px solid ${filter===f?V.v500:t.border}`}}>{f==="in-stock"?"In Stock":f==="out"?"Out of Stock":f==="low"?"Low Stock":"All"}</button>))}
    </div>
    <div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div className="hidden sm:grid px-4 py-2.5" style={{gridTemplateColumns:"1fr 120px 100px 80px",borderBottom:`1px solid ${t.border}`}}>{["Product","Status","Stock",""].map((h,i)=>(<div key={i} style={{fontSize:10,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</div>))}</div>
      {isLoading?Array.from({length:5}).map((_,i)=><div key={i} className="h-14 animate-pulse mx-4 my-2 rounded-xl" style={{background:t.faint}}/>):filtered.length===0?(
        <div className="text-center py-16"><Package size={32} style={{color:t.muted,opacity:0.3,margin:"0 auto 12px"}}/><p className="text-sm" style={{color:t.muted}}>No products found</p></div>
      ):(<div className="divide-y" style={{borderColor:t.border}}>{filtered.map((p,i)=>{const oos=p.inventory===0;const low=p.inventory>0&&p.inventory<=5;const sc=oos?V.red:low?V.amber:V.green;const sl=oos?"Out of Stock":low?"Low Stock":"In Stock";return(<div key={p.id} className="grid sm:grid items-center px-4 py-3" style={{gridTemplateColumns:"1fr 120px 100px 80px"}}>
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{background:t.faint}}>{p.images?.[0]?<img src={p.images[0]} alt="" className="w-full h-full object-cover"/>:<Package size={12} style={{color:t.muted}}/>}</div><div><p className="text-sm font-semibold truncate" style={{color:t.text,maxWidth:200}}>{p.name}</p><p className="text-xs" style={{color:t.muted}}>{p.category||"Uncategorised"}</p></div></div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background:`${sc}15`,color:sc}}>{sl}</span>
        {editing===p.id?(<div className="flex items-center gap-1.5"><input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)} className="w-16 px-2 py-1 rounded-lg text-xs outline-none" style={{background:t.faint,border:`1px solid ${t.border}`,color:t.text,fontFamily:"inherit"}} autoFocus/><button onClick={()=>upd.mutate({id:p.id,inventory:parseInt(editVal)||0})} style={{color:V.green}}><Check size={13}/></button><button onClick={()=>setEditing(null)} style={{color:t.muted}}><X size={13}/></button></div>):(<span className="text-sm font-black" style={{color:oos?V.red:t.text}}>{p.inventory}</span>)}
        <button onClick={()=>{setEditing(p.id);setEditVal(p.inventory?.toString()||"0");}} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{border:`1px solid ${t.border}`,color:t.muted}}><Edit2 size={10}/>Edit</button>
      </div>);})}
      </div>)}
    </div>
  </div>);
}