"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Truck, Plus, X, Check, Loader2, Package } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

export default function ShippingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    input: isDark?"rgba(255,255,255,0.05)":"#F5F3FF",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", price:0, estimatedDays:3, zone:"nationwide" });

  const { data } = useQuery({
    queryKey: ["shipping", storeId],
    queryFn: () => api.get(`/shipping/${storeId}`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/shipping/${storeId}`, form),
    onSuccess: () => { toast.success("Shipping zone added"); qc.invalidateQueries({queryKey:["shipping"]}); setShowAdd(false); setForm({name:"",price:0,estimatedDays:3,zone:"nationwide"}); },
    onError: (e:any) => toast.error(e.response?.data?.message||"Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id:string) => api.delete(`/shipping/${storeId}/${id}`),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({queryKey:["shipping"]}); },
  });

  const zones = data || [];
  const fmt = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const };

  return (
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Shipping</h1>
          <p style={{fontSize:13,color:t.muted,margin:0}}>{zones.length} shipping zones configured</p>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700}}>
          <Plus size={14}/> Add Zone
        </button>
      </motion.div>

      {zones.length === 0 && !showAdd ? (
        <div style={{textAlign:"center",padding:"60px 20px",borderRadius:16,background:t.faint,border:`1px solid ${t.border}`}}>
          <Truck size={36} style={{color:t.muted,margin:"0 auto 12px"}}/>
          <p style={{fontWeight:700,fontSize:15,color:t.text,margin:"0 0 6px"}}>No shipping zones yet</p>
          <p style={{fontSize:13,color:t.muted,margin:"0 0 20px"}}>Add zones for Lagos, Abuja, nationwide, or international delivery.</p>
          <button onClick={()=>setShowAdd(true)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 20px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700}}>
            <Plus size={13}/> Add First Zone
          </button>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {zones.map((z:any,i:number)=>(
            <motion.div key={z.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              style={{display:"flex",alignItems:"center",gap:14,padding:16,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${V.v400}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Truck size={16} color={V.v400}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 3px"}}>{z.name}</p>
                <p style={{fontSize:12,color:t.muted,margin:0}}>{z.estimatedDays} days · {z.zone||"nationwide"}</p>
              </div>
              <p style={{fontSize:15,fontWeight:800,color:t.text,flexShrink:0}}>{z.price===0?"Free":fmt(z.price)}</p>
              <button onClick={()=>deleteMut.mutate(z.id)} style={{width:28,height:28,borderRadius:8,border:"none",background:"rgba(239,68,68,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <X size={13} color="#EF4444"/>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} style={{marginTop:16,padding:20,borderRadius:16,background:t.card,border:`1px solid ${t.border}`}}>
          <p style={{fontSize:14,fontWeight:800,color:t.text,margin:"0 0 16px"}}>New Shipping Zone</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:t.muted,marginBottom:6}}>Zone Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Lagos mainland" style={inp}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:t.muted,marginBottom:6}}>Price (₦)</label>
              <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:Number(e.target.value)}))} placeholder="1500" style={inp}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:t.muted,marginBottom:6}}>Est. Days</label>
              <input type="number" value={form.estimatedDays} onChange={e=>setForm(f=>({...f,estimatedDays:Number(e.target.value)}))} style={inp}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:t.muted,marginBottom:6}}>Coverage</label>
              <select value={form.zone} onChange={e=>setForm(f=>({...f,zone:e.target.value}))} style={inp}>
                <option value="lagos">Lagos only</option>
                <option value="abuja">Abuja only</option>
                <option value="southwest">South West</option>
                <option value="nationwide">Nationwide</option>
                <option value="international">International</option>
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"9px 0",borderRadius:10,border:`1px solid ${t.border}`,background:"transparent",cursor:"pointer",color:t.muted,fontSize:13,fontWeight:600}}>Cancel</button>
            <button onClick={()=>createMut.mutate()} disabled={!form.name||createMut.isPending} style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:!form.name?0.6:1}}>
              {createMut.isPending?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<Check size={13}/>} Save Zone
            </button>
          </div>
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
