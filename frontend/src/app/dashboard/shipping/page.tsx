"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Truck, Plus, X, Check, Loader2, Package, Zap } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

const CARRIERS = [
  { id:"gig",       name:"GIG Logistics",    logo:"🚚", popular:true  },
  { id:"dhl",       name:"DHL Express",      logo:"✈️", popular:false },
  { id:"aramex",    name:"Aramex",           logo:"📦", popular:false },
  { id:"kwik",      name:"Kwik",             logo:"⚡", popular:false },
  { id:"standard",  name:"Standard Delivery",logo:"📮", popular:false },
];

const NG_STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT Abuja"];

export default function ShippingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
    input: isDark?"rgba(255,255,255,0.05)":"#F0EDFF",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [testOrigin, setTestOrigin] = useState("Lagos");
  const [testDest, setTestDest] = useState("Abuja");
  const [testWeight, setTestWeight] = useState(1);
  const [testValue, setTestValue] = useState(25000);
  const [rates, setRates] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState({
    name:"", zone:"nationwide", shippingRate:1500, freeThreshold:15000,
    estimatedDays:"2-4 days", countries:["Nigeria"],
  });

  const { data: zones } = useQuery({
    queryKey: ["shipping-zones", storeId],
    queryFn: () => api.get(`/shipping/${storeId}`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const createMut = useMutation({
    mutationFn: () => api.post(`/shipping/${storeId}`, { ...form, storeId }),
    onSuccess: () => { toast.success("Shipping zone added!"); qc.invalidateQueries({queryKey:["shipping-zones"]}); setShowAdd(false); setForm({name:"",zone:"nationwide",shippingRate:1500,freeThreshold:15000,estimatedDays:"2-4 days",countries:["Nigeria"]}); },
    onError: (e:any) => toast.error(e.response?.data?.message||"Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id:string) => api.delete(`/shipping/${storeId}/${id}`),
    onSuccess: () => { toast.success("Zone removed"); qc.invalidateQueries({queryKey:["shipping-zones"]}); },
  });

  const testRates = async () => {
    setTesting(true);
    try {
      const r = await api.post("/shipping/rates", { origin:testOrigin, destination:testDest, weightKg:testWeight, valueNGN:testValue, storeId });
      setRates(r.data.data || []);
    } catch { toast.error("Rate check failed"); }
    setTesting(false);
  };

  const fmt = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);
  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const };

  const PRESET_ZONES = [
    { name:"Lagos Delivery", zone:"lagos", shippingRate:800, freeThreshold:15000, estimatedDays:"Same day - 1 day" },
    { name:"Southwest Nigeria", zone:"southwest", shippingRate:1500, freeThreshold:25000, estimatedDays:"1-2 days" },
    { name:"Nationwide Nigeria", zone:"nationwide", shippingRate:2500, freeThreshold:50000, estimatedDays:"2-4 days" },
    { name:"International", zone:"international", shippingRate:8000, freeThreshold:0, estimatedDays:"7-14 days" },
  ];

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Shipping</h1>
        <p style={{ fontSize:13, color:t.muted, margin:0 }}>Configure delivery zones with DHL, GIG, Kwik and more</p>
      </motion.div>

      {/* Quick presets */}
      {(!zones || zones.length === 0) && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{ marginBottom:20, padding:18, borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
          <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 12px" }}>Quick Setup — Add common zones</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:8 }}>
            {PRESET_ZONES.map(p => (
              <button key={p.name} onClick={()=>{
                api.post(`/shipping/${storeId}`, { ...p, countries:["Nigeria"], storeId })
                  .then(()=>{ toast.success(`${p.name} added`); qc.invalidateQueries({queryKey:["shipping-zones"]}); })
                  .catch(()=>toast.error("Failed"));
              }}
                style={{ padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 2px" }}>{p.name}</p>
                <p style={{ fontSize:11, color:t.muted, margin:0 }}>{fmt(p.shippingRate)} · {p.estimatedDays}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Existing zones */}
      {zones && zones.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {zones.map((z:any, i:number) => (
            <motion.div key={z.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              style={{ display:"flex", alignItems:"center", gap:14, padding:16, borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${V.v400}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Truck size={16} color={V.v400}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 3px" }}>{z.name}</p>
                <p style={{ fontSize:12, color:t.muted, margin:0 }}>
                  {fmt(z.shippingRate)} · {z.estimatedDays}
                  {z.freeThreshold ? ` · Free over ${fmt(z.freeThreshold)}` : ""}
                </p>
              </div>
              <button onClick={()=>deleteMut.mutate(z.id)}
                style={{ width:30, height:30, borderRadius:8, border:"none", background:"rgba(239,68,68,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <X size={13} color="#EF4444"/>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <button onClick={()=>setShowAdd(!showAdd)}
        style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:12, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700, marginBottom:24 }}>
        <Plus size={14}/> Add Custom Zone
      </button>

      {/* Add zone form */}
      {showAdd && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{ padding:20, borderRadius:16, background:t.card, border:`1px solid ${t.border}`, marginBottom:24 }}>
          <p style={{ fontSize:14, fontWeight:800, color:t.text, margin:"0 0 16px" }}>Custom Shipping Zone</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6 }}>Zone Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Lagos mainland" style={inp}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6 }}>Shipping Rate (₦)</label>
              <input type="number" value={form.shippingRate} onChange={e=>setForm(f=>({...f,shippingRate:Number(e.target.value)}))} style={inp}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6 }}>Free Shipping Over (₦)</label>
              <input type="number" value={form.freeThreshold} onChange={e=>setForm(f=>({...f,freeThreshold:Number(e.target.value)}))} placeholder="0 = never free" style={inp}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6 }}>Estimated Days</label>
              <select value={form.estimatedDays} onChange={e=>setForm(f=>({...f,estimatedDays:e.target.value}))} style={inp}>
                <option value="Same day">Same day</option>
                <option value="1-2 days">1-2 days</option>
                <option value="2-4 days">2-4 days</option>
                <option value="3-5 days">3-5 days</option>
                <option value="5-7 days">5-7 days</option>
                <option value="7-14 days">7-14 days</option>
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowAdd(false)} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", cursor:"pointer", color:t.muted, fontSize:13, fontWeight:600, fontFamily:"inherit" }}>Cancel</button>
            <button onClick={()=>createMut.mutate()} disabled={!form.name||createMut.isPending}
              style={{ flex:2, padding:"9px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:!form.name?0.6:1 }}>
              {createMut.isPending?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<Check size={13}/>} Save Zone
            </button>
          </div>
        </motion.div>
      )}

      {/* Rate calculator */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
        style={{ padding:20, borderRadius:16, background:t.card, border:`1px solid ${t.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <Zap size={14} color={V.v400}/>
          <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:0 }}>Carrier Rate Calculator</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10, marginBottom:14 }}>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:5 }}>From</label>
            <select value={testOrigin} onChange={e=>setTestOrigin(e.target.value)} style={inp}>
              {NG_STATES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:5 }}>To</label>
            <select value={testDest} onChange={e=>setTestDest(e.target.value)} style={inp}>
              {NG_STATES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:5 }}>Weight (kg)</label>
            <input type="number" step="0.1" value={testWeight} onChange={e=>setTestWeight(Number(e.target.value))} style={inp}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:5 }}>Order Value (₦)</label>
            <input type="number" value={testValue} onChange={e=>setTestValue(Number(e.target.value))} style={inp}/>
          </div>
        </div>
        <button onClick={testRates} disabled={testing}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:12, background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", marginBottom:rates.length?16:0 }}>
          {testing?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<Truck size={13}/>}
          {testing?"Checking rates...":"Get Carrier Rates"}
        </button>

        {rates.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {rates.map((r,i) => (
              <motion.div key={r.carrier} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, background:r.price===0?"rgba(16,185,129,0.06)":t.faint, border:`1px solid ${r.price===0?"rgba(16,185,129,0.2)":t.border}` }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{r.logo}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 2px" }}>{r.carrier}</p>
                  <p style={{ fontSize:11, color:t.muted, margin:0 }}>{r.service} · {r.estimatedDays}</p>
                </div>
                <p style={{ fontSize:16, fontWeight:900, color:r.price===0?V.green:t.text, flexShrink:0 }}>
                  {r.price===0?"FREE":fmt(r.price)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
