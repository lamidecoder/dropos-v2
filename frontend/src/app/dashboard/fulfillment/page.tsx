"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Package,Truck,Check,Clock,Zap}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

const fmt=n=>new Intl.NumberFormat("en",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
export default function FulfillmentPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[tracking,setTracking]=useState({});
  const{data,isLoading}=useQuery({queryKey:["fulfillment",storeId],queryFn:()=>api.get(`/orders/${storeId}?status=PAID`).then(r=>r.data.data?.orders||r.data.data||[]),enabled:!!storeId,refetchInterval:60000});
  const fulfil=useMutation({mutationFn:({orderId,tn})=>api.put(`/orders/${storeId}/${orderId}`,{status:"SHIPPED",trackingNumber:tn}),onSuccess:(_,{orderId})=>{toast.success("Marked as shipped");qc.invalidateQueries({queryKey:["fulfillment"]});setTracking(p=>{const n={...p};delete n[orderId];return n;});},onError:(e)=>toast.error(e.response?.data?.message||"Backend offline")});
  const orders=data||[];
  return(<div className="max-w-5xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Fulfillment Queue</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>{orders.length} paid order{orders.length!==1?"s":""} waiting to ship</p></div>
      <Link href="/dashboard/kiro"><div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"rgba(107,53,232,0.1)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}><Zap size={12}/>KIRO auto-fulfils</div></Link>
    </motion.div>
    {orders.length===0?(<motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)"}}><Check size={24} color={V.green}/></div>
      <h3 className="font-bold text-sm mb-2" style={{color:t.text}}>All caught up</h3>
      <p className="text-xs" style={{color:t.muted}}>No paid orders waiting to ship</p>
    </motion.div>):(
      <div className="space-y-3">{orders.map((order,i)=>(<motion.div key={order.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="p-4 sm:p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div><p className="text-sm font-bold" style={{color:t.text}}>{order.customerName||order.customer?.name||"Customer"}</p><p className="text-xs mt-0.5" style={{color:t.muted}}>#{order.id?.slice(-8)?.toUpperCase()} · {(order.items||[]).length} items · {fmt(order.total||order.totalAmount)}</p></div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0" style={{background:"rgba(245,158,11,0.12)",color:V.amber}}>Awaiting ship</span>
        </div>
        <div className="space-y-2 mb-4">{(order.items||order.orderItems||[]).slice(0,3).map((item,j)=>(<div key={j} className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{background:t.faint}}>{item.product?.images?.[0]?<img src={item.product.images[0]} alt="" className="w-full h-full object-cover"/>:<Package size={12} style={{color:t.muted}}/>}</div><p className="text-xs truncate flex-1" style={{color:t.text}}>{item.product?.name||item.name||"Product"}</p><p className="text-xs flex-shrink-0" style={{color:t.muted}}>x{item.quantity}</p></div>))}</div>
        <div className="flex gap-2">
          <input style={{...inp(t),flex:1}} value={tracking[order.id]||""} onChange={e=>setTracking(p=>({...p,[order.id]:e.target.value}))} placeholder="Tracking number (optional)"/>
          <button onClick={()=>fulfil.mutate({orderId:order.id,tn:tracking[order.id]||""})} disabled={fulfil.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white flex-shrink-0 disabled:opacity-50" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}><Truck size={13}/>Mark Shipped</button>
        </div>
      </motion.div>))}</div>
    )}
  </div>);
}