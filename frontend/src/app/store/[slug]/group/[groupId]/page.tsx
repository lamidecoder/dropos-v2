"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { publicApi } from "../../../../../lib/api";
import { ShoppingBag, Users, Clock, Check, Zap, ChevronRight, Loader2, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface PageProps { params: { slug: string; groupId: string } }

function useCountdown(endsAt: string) {
  const [t, setT] = useState({ d:0,h:0,m:0,s:0,expired:false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  require("react").useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setT({d:0,h:0,m:0,s:0,expired:true}); return; }
      setT({
        d: Math.floor(diff/86400000),
        h: Math.floor((diff%86400000)/3600000),
        m: Math.floor((diff%3600000)/60000),
        s: Math.floor((diff%60000)/1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return t;
}

function TimeUnit({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black text-white tabular-nums">{String(n).padStart(2,"0")}</div>
      <div className="text-[10px] uppercase tracking-widest mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{label}</div>
    </div>
  );
}

export default function GroupBuyPage({ params }: PageProps) {
  const { slug, groupId } = params;
  const [email, setEmail] = useState("");
  const [name,  setName]  = useState("");
  const [joined, setJoined] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["group-buy", groupId],
    queryFn:  () => publicApi.get(`/group-buy/public/${groupId}`).then(r => r.data.data),
    refetchInterval: 10000,
  });

  const joinMut = useMutation({
    mutationFn: () => publicApi.post(`/group-buy/${groupId}/join`, { email, name }),
    onSuccess:  () => { setJoined(true); toast.success("You're in! Pay when the group fills up."); },
    onError:    (e:any) => toast.error(e.response?.data?.message || "Failed to join"),
  });

  const countdown = useCountdown(data?.endsAt || new Date(Date.now() + 86400000).toISOString());

  const share = () => {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: data?.title, url }); }
    else { navigator.clipboard.writeText(url); toast.success("Link copied!"); }
  };

  const brand    = data?.store?.primaryColor || "#6B35E8";
  const filled   = data?.memberCount || 0;
  const required = data?.minMembers || 10;
  const pct      = Math.min(100, Math.round((filled / required) * 100));
  const price    = data?.groupPrice || 0;
  const original = data?.originalPrice || price * 1.3;
  const saved    = original - price;
  const fmt      = (n:number) => new Intl.NumberFormat("en", { style:"currency", currency: data?.store?.currency || "NGN", maximumFractionDigits:0 }).format(n);

  if (isLoading) {
    return (
      <div style={{minHeight:"100vh",background:"#07050F",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <motion.div animate={{rotate:360}} transition={{duration:1.5,repeat:Infinity,ease:"linear"}}
          style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${brand},#3D1C8A)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Zap size={18} color="white"/>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{minHeight:"100vh",background:"#07050F",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24,fontFamily:"system-ui"}}>
        <p style={{color:"rgba(255,255,255,0.5)",marginBottom:16}}>Group buy not found or has ended.</p>
        <Link href={`/store/${slug}`}><button style={{padding:"10px 24px",borderRadius:12,background:brand,color:"#fff",border:"none",cursor:"pointer",fontWeight:700}}>Browse Store</button></Link>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#07050F",fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",color:"#fff"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Store header */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link href={`/store/${slug}`} style={{textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>
          {data.store?.logo
            ? <img src={data.store.logo} alt="" style={{height:28,width:"auto"}}/>
            : <span style={{fontWeight:900,color:"#fff",fontSize:16}}>{data.store?.name}</span>
          }
        </Link>
        <button onClick={share} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:12,fontWeight:600}}>
          <Share2 size={12}/> Share
        </button>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"32px 20px"}}>
        {/* Product */}
        {data.product?.images?.[0] && (
          <img src={data.product.images[0]} alt={data.product.name}
            style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",borderRadius:20,marginBottom:24,border:"1px solid rgba(255,255,255,0.08)"}}/>
        )}

        {/* Badge */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
          <div style={{padding:"3px 10px",borderRadius:99,background:`${brand}20`,border:`1px solid ${brand}40`,fontSize:11,fontWeight:700,color:brand}}>
            Group Buy 🔥
          </div>
          {!countdown.expired && <div style={{padding:"3px 10px",borderRadius:99,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",fontSize:11,fontWeight:700,color:"#EF4444"}}>
            Limited time
          </div>}
        </div>

        <h1 style={{fontSize:26,fontWeight:900,letterSpacing:"-1px",marginBottom:8,lineHeight:1.2}}>{data.title || data.product?.name}</h1>
        {data.description && <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.6,marginBottom:20}}>{data.description}</p>}

        {/* Pricing */}
        <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:20}}>
          <span style={{fontSize:36,fontWeight:900,color:"#10B981"}}>{fmt(price)}</span>
          <span style={{fontSize:18,color:"rgba(255,255,255,0.3)",textDecoration:"line-through"}}>{fmt(original)}</span>
          <span style={{fontSize:13,fontWeight:700,color:"#10B981",background:"rgba(16,185,129,0.1)",padding:"2px 8px",borderRadius:6}}>Save {fmt(saved)}</span>
        </div>

        {/* Progress */}
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:16,marginBottom:20,border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <Users size={14} style={{color:brand}}/>
              <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{filled} joined</span>
            </div>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{required - filled} spots left</span>
          </div>
          <div style={{height:8,borderRadius:99,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:8}}>
            <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8}}
              style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${brand},${brand}cc)`}}/>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>
            {pct >= 100 ? "🎉 Group is full! Payment processing..." : `${pct}% filled — deal unlocks at ${required} members`}
          </div>
        </div>

        {/* Countdown */}
        {!countdown.expired && (
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:16,padding:16,marginBottom:20,border:"1px solid rgba(255,255,255,0.06)",textAlign:"center"}}>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>Deal expires in</p>
            <div style={{display:"flex",justifyContent:"center",gap:20}}>
              {countdown.d > 0 && <TimeUnit n={countdown.d} label="days"/>}
              <TimeUnit n={countdown.h} label="hrs"/>
              <TimeUnit n={countdown.m} label="min"/>
              <TimeUnit n={countdown.s} label="sec"/>
            </div>
          </div>
        )}

        {/* Join form */}
        <AnimatePresence mode="wait">
          {joined ? (
            <motion.div key="joined" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
              style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:20,padding:24,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>🎉</div>
              <h3 style={{fontSize:18,fontWeight:800,color:"#10B981",marginBottom:8}}>You're in!</h3>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>
                We'll email you at <strong style={{color:"#fff"}}>{email}</strong> when the group fills up and payment is collected automatically.
              </p>
            </motion.div>
          ) : pct >= 100 ? (
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:20,textAlign:"center"}}>
              <p style={{color:"#EF4444",fontWeight:700}}>This group is full</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>Check back for future group buys from this store.</p>
            </div>
          ) : countdown.expired ? (
            <div style={{background:"rgba(107,53,232,0.06)",border:"1px solid rgba(107,53,232,0.15)",borderRadius:20,padding:20,textAlign:"center"}}>
              <p style={{color:"#A78BFA",fontWeight:700}}>This group buy has ended</p>
            </div>
          ) : (
            <motion.div key="form" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
              <div style={{marginBottom:12}}>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"
                  style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",marginBottom:10,boxSizing:"border-box"}}/>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" type="email"
                  style={{width:"100%",padding:"12px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <button onClick={() => joinMut.mutate()} disabled={!name||!email||joinMut.isPending}
                style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${brand},${brand}88)`,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 8px 24px ${brand}40`,opacity:(!name||!email||joinMut.isPending)?0.6:1}}>
                {joinMut.isPending ? <Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/> : <ShoppingBag size={16}/>}
                {joinMut.isPending ? "Joining..." : `Join for ${fmt(price)}`}
              </button>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",textAlign:"center",marginTop:10,lineHeight:1.5}}>
                You only pay when the group fills up. Your card is not charged now.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Members list preview */}
        {data.members?.length > 0 && (
          <div style={{marginTop:24}}>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:8}}>People already in</p>
            <div style={{display:"flex",gap:-6}}>
              {data.members.slice(0,8).map((m:any, i:number) => (
                <div key={i} style={{width:28,height:28,borderRadius:"50%",background:`hsl(${(m.name?.charCodeAt(0)||65)*137%360},60%,50%)`,border:"2px solid #07050F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",marginLeft:i>0?-8:0}}>
                  {m.name?.[0]?.toUpperCase()||"?"}
                </div>
              ))}
              {filled > 8 && <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"2px solid #07050F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.5)",marginLeft:-8}}>+{filled-8}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
