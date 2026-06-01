"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { PageHeader } from "../../../components/admin/AdminTable";
import { motion } from "framer-motion";
import { Save, Globe, DollarSign, Bell, Shield, Percent } from "lucide-react";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)", input:"rgba(255,255,255,0.05)" };
const inp = { width:"100%", padding:"10px 14px", borderRadius:11, border:`1px solid rgba(255,255,255,0.09)`, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.9)", fontSize:13, fontFamily:"inherit", outline:"none" };

export default function AdminSettingsPage() {
  const { data: raw } = useQuery<any>({
    queryKey: ["admin-settings"],
    queryFn: () => adminAPI.getSettings().then((r:any) => r.data.data),
  });

  const [form, setForm] = useState({
    platformName:         "DropOS",
    platformFeePercent:   "2",
    supportEmail:         "support@droposhq.com",
    maintenanceMode:      false,
    registrationEnabled:  true,
    defaultPlan:          "FREE",
    maxStoresPerUser:     "5",
    maxProductsPerStore:  "1000",
  });

  useEffect(() => {
    if (!raw) return;
    const map: any = {};
    (Array.isArray(raw) ? raw : []).forEach((s: any) => { map[s.key] = s.value; });
    setForm(prev => ({
      ...prev,
      platformName:         map.platformName         || prev.platformName,
      platformFeePercent:   map.platformFeePercent   || prev.platformFeePercent,
      supportEmail:         map.supportEmail         || prev.supportEmail,
      maintenanceMode:      map.maintenanceMode      === "true",
      registrationEnabled:  map.registrationEnabled  !== "false",
      defaultPlan:          map.defaultPlan          || prev.defaultPlan,
      maxStoresPerUser:     map.maxStoresPerUser     || prev.maxStoresPerUser,
      maxProductsPerStore:  map.maxProductsPerStore  || prev.maxProductsPerStore,
    }));
  }, [raw]);

  const saveMut = useMutation({
    mutationFn: () => adminAPI.updateSettings(form),
    onSuccess: () => toast.success("Settings saved"),
    onError:   () => toast.error("Save failed"),
  });

  const Field = ({ label, desc, children }: any) => (
    <div style={{ paddingBottom:18, marginBottom:18, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:t.muted, marginBottom:4 }}>{label}</label>
      {desc && <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)", margin:"0 0 8px", lineHeight:1.4 }}>{desc}</p>}
      {children}
    </div>
  );

  const Toggle = ({ val, onChange, label, desc }: any) => (
    <Field label={label} desc={desc}>
      <button onClick={() => onChange(!val)}
        style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", background:val?V.accent:"rgba(255,255,255,0.1)", position:"relative", padding:0, transition:"background 0.2s" }}>
        <div style={{ position:"absolute", top:3, left:val?23:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
      </button>
      <span style={{ marginLeft:10, fontSize:13, color:val?V.green:t.muted, fontWeight:600 }}>{val?"On":"Off"}</span>
    </Field>
  );

  const sections = [
    { icon:Globe, color:V.accent, title:"Platform", fields: (
      <>
        <Field label="Platform name"><input value={form.platformName} onChange={e=>setForm(f=>({...f,platformName:e.target.value}))} style={inp}/></Field>
        <Field label="Support email"><input type="email" value={form.supportEmail} onChange={e=>setForm(f=>({...f,supportEmail:e.target.value}))} style={inp}/></Field>
      </>
    )},
    { icon:Percent, color:V.amber, title:"Billing", fields: (
      <>
        <Field label="Transaction fee (%)" desc="Percentage DropOS takes from each order on Free plan">
          <input type="number" value={form.platformFeePercent} onChange={e=>setForm(f=>({...f,platformFeePercent:e.target.value}))} min="0" max="100" style={inp}/>
        </Field>
        <Field label="Default plan for new users">
          <select value={form.defaultPlan} onChange={e=>setForm(f=>({...f,defaultPlan:e.target.value}))} style={{ ...inp }}>
            <option value="FREE">Free</option><option value="GROWTH">Growth</option><option value="PRO">Pro</option>
          </select>
        </Field>
      </>
    )},
    { icon:Shield, color:V.red, title:"Limits", fields: (
      <>
        <Field label="Max stores per user"><input type="number" value={form.maxStoresPerUser} onChange={e=>setForm(f=>({...f,maxStoresPerUser:e.target.value}))} style={inp}/></Field>
        <Field label="Max products per store"><input type="number" value={form.maxProductsPerStore} onChange={e=>setForm(f=>({...f,maxProductsPerStore:e.target.value}))} style={inp}/></Field>
      </>
    )},
    { icon:Bell, color:V.green, title:"Status", fields: (
      <>
        <Toggle val={form.maintenanceMode} onChange={(v:boolean)=>setForm(f=>({...f,maintenanceMode:v}))} label="Maintenance mode" desc="Shows maintenance banner on all storefronts"/>
        <Toggle val={form.registrationEnabled} onChange={(v:boolean)=>setForm(f=>({...f,registrationEnabled:v}))} label="New registrations" desc="Allow new users to sign up"/>
      </>
    )},
  ];

  return (
    <div style={{ maxWidth:640 }}>
      <PageHeader title="Platform Settings" sub="Core configuration for the DropOS platform"
        action={
          <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, border:"none", cursor:"pointer", background:V.accent, color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
            <Save size={13}/> {saveMut.isPending?"Saving...":"Save settings"}
          </button>
        }/>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {sections.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <motion.div key={sec.title} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              style={{ background:t.card, borderRadius:18, padding:"22px 24px", border:`1px solid ${t.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:14, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                <div style={{ width:32, height:32, borderRadius:9, background:`${sec.color}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={14} color={sec.color}/>
                </div>
                <p style={{ fontSize:13, fontWeight:800, color:t.text, margin:0 }}>{sec.title}</p>
              </div>
              {sec.fields}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
