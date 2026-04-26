"use client";
import{useState}from"react";
import{useQuery,useMutation,useQueryClient}from"@tanstack/react-query";
import{motion,AnimatePresence}from"framer-motion";
import{useTheme}from"../../../components/layout/DashboardLayout";
import{useAuthStore}from"../../../store/auth.store";
import{api}from"../../../lib/api";
import toast from"react-hot-toast";
import Link from"next/link";
import{Star,MessageSquare,ThumbsUp,Search}from"lucide-react";
const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",cyan:"#06B6D4",green:"#10B981",amber:"#F59E0B",red:"#EF4444",fuchsia:"#C026D3"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};
const inp=(t,err)=>({padding:"10px 14px",borderRadius:10,border:`1px solid ${err?"rgba(239,68,68,0.5)":t.border}`,background:"rgba(255,255,255,0.04)",color:t.text,fontSize:13,outline:"none",width:"100%",fontFamily:"inherit"});

function Stars({rating,size=13}){return(<div className="flex gap-0.5">{[1,2,3,4,5].map(i=>(<Star key={i} size={size} style={{color:i<=rating?"#F59E0B":"rgba(245,158,11,0.2)",fill:i<=rating?"#F59E0B":"none"}}/>))}</div>);}
export default function ReviewsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);const qc=useQueryClient();
  const[search,setSearch]=useState("");const[filter,setFilter]=useState("all");
  const{data,isLoading}=useQuery({queryKey:["reviews",storeId,filter],queryFn:()=>api.get(`/reviews/${storeId}?filter=${filter}`).then(r=>r.data.data),enabled:!!storeId});
  const replyMut=useMutation({mutationFn:({id,reply})=>api.patch(`/reviews/${storeId}/${id}`,{reply}),onSuccess:()=>{toast.success("Reply sent");qc.invalidateQueries({queryKey:["reviews"]});}});
  const reviews=data||[];
  const avg=reviews.length>0?(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1):"0.0";
  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6"><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Reviews</h1><p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Customer feedback for your products</p></motion.div>
    <div className="grid grid-cols-3 gap-3 mb-5">{[{l:"Avg Rating",v:avg,c:V.amber,i:Star},{l:"5-Star",v:reviews.filter(r=>r.rating===5).length,c:V.green,i:ThumbsUp},{l:"Need Reply",v:reviews.filter(r=>!r.reply).length,c:V.v400,i:MessageSquare}].map(s=>(<div key={s.l} className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}><div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{background:`${s.c}15`}}><s.i size={14} style={{color:s.c,fill:s.i===Star?s.c:"none"}}/></div><p className="text-xl font-black mb-0.5" style={{color:t.text}}>{s.v}</p><p className="text-xs" style={{color:t.muted}}>{s.l}</p></div>))}</div>
    <div className="flex items-center gap-2 mb-4 overflow-x-auto" style={{scrollbarWidth:"none"}}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{background:t.card,border:`1px solid ${t.border}`}}><Search size={12} style={{color:t.muted}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reviews..." className="bg-transparent border-none outline-none text-xs flex-1" style={{color:t.text,fontFamily:"inherit"}}/></div>
      {["all","5","4","3","unread"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0" style={{background:filter===f?V.v500:t.card,color:filter===f?"#fff":t.muted,border:`1px solid ${filter===f?V.v500:t.border}`}}>{f==="all"?"All":f==="unread"?"Unread":`${f} stars`}</button>))}
    </div>
    {reviews.length===0?(
      <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center" style={{background:t.card,border:`1px solid ${t.border}`}}><Star size={36} style={{color:V.amber,fill:V.amber,opacity:0.3,marginBottom:14}}/><p className="font-bold text-sm mb-2" style={{color:t.text}}>No reviews yet</p><p className="text-xs" style={{color:t.muted}}>Customer reviews appear here after they purchase from your store.</p></div>
    ):(
      <div className="space-y-3">{reviews.filter(r=>!search||r.customerName?.toLowerCase().includes(search.toLowerCase())||r.comment?.toLowerCase().includes(search.toLowerCase())).map((r,i)=>(<motion.div key={r.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="p-5 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="flex items-start justify-between mb-2"><div><p className="font-semibold text-sm" style={{color:t.text}}>{r.customerName||"Customer"}</p><div className="flex items-center gap-2 mt-1"><Stars rating={r.rating}/><span className="text-xs" style={{color:t.muted}}>{new Date(r.createdAt).toLocaleDateString("en",{day:"numeric",month:"short"})}</span></div></div>{!r.approved&&<span className="text-xs px-2.5 py-1 rounded-full" style={{background:"rgba(245,158,11,0.1)",color:V.amber}}>Pending</span>}</div>
        {r.comment&&<p className="text-sm leading-relaxed mb-3" style={{color:t.muted}}>{r.comment}</p>}
        {r.reply?(<div className="p-3 rounded-xl" style={{background:t.faint,border:`1px solid ${t.border}`}}><p className="text-xs font-bold mb-1" style={{color:V.v400}}>Your reply</p><p className="text-xs" style={{color:t.muted}}>{r.reply}</p></div>):(<div className="flex gap-2"><input style={{...inp(t),flex:1,fontSize:12}} placeholder="Write a reply..." id={`reply-${r.id}`}/><button onClick={()=>replyMut.mutate({id:r.id,reply:(document.getElementById(`reply-${r.id}`) as HTMLInputElement)?.value||""})} className="px-3 py-2 rounded-xl text-xs font-semibold" style={{border:`1px solid ${t.border}`,color:V.v300}}>Reply</button></div>)}
      </motion.div>))}</div>
    )}
  </div>);
}