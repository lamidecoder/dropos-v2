"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Flag, RefreshCw } from "lucide-react";

const V = { accent:"#6B35E8", green:"#10B981" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };

const FLAG_DEFS = [
  { key:"kiro_enabled",          label:"KIRO AI",                  desc:"Enable/disable KIRO AI across all dashboards" },
  { key:"store_generator",       label:"AI Store Generator",        desc:"Merchants can generate store identity with KIRO" },
  { key:"virtual_accounts",      label:"Virtual Bank Accounts",     desc:"Paystack DVA feature (requires CAC + verified account)" },
  { key:"delivery_booking",      label:"Delivery Booking",          desc:"GIG Logistics + Kwik rider booking" },
  { key:"affiliate_program",     label:"Affiliate Programme",       desc:"20% referral commissions for Pro users" },
  { key:"tiktok_shop_sync",      label:"TikTok Shop Sync",          desc:"Auto-sync products to TikTok Shop" },
  { key:"competitor_spy",        label:"Competitor Spy",            desc:"AI-powered competitor product research" },
  { key:"beta_templates",        label:"Beta Templates",            desc:"Show experimental store templates to all users" },
  { key:"maintenance_mode",      label:"Maintenance Mode",          desc:"Show maintenance banner on all merchant storefronts" },
  { key:"new_user_registration", label:"New Registrations",         desc:"Allow new users to sign up (disable to pause growth)" },
];

export default function AdminFlagsPage() {
  const qc = useQueryClient();

  const { data:flags={}, isLoading } = useQuery<any>({
    queryKey: ["admin-flags"],
    queryFn: () => adminAPI.get("/admin/feature-flags").then((r:any) => r.data.data || {}),
  });

  const updateMut = useMutation({
    mutationFn: ({ flag, enabled }: any) => adminAPI.patch("/admin/feature-flags", { flag, enabled }),
    onSuccess: (_, vars) => {
      toast.success(`${vars.flag} ${vars.enabled ? "enabled" : "disabled"}`);
      qc.invalidateQueries({ queryKey:["admin-flags"] });
    },
    onError: () => toast.error("Update failed"),
  });

  return (
    <div style={{ maxWidth:680 }}>
      <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.04em" }}>Feature Flags</h1>
        <p style={{ fontSize:13, color:t.muted }}>Turn features on/off across the entire platform instantly</p>
      </motion.div>

      <div style={{ background:t.card, borderRadius:20, border:`1px solid ${t.border}`, overflow:"hidden" }}>
        {FLAG_DEFS.map((flag, i) => {
          const enabled = flags[flag.key] === true || flags[flag.key] === "true";
          return (
            <motion.div key={flag.key} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
              style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", borderBottom:i<FLAG_DEFS.length-1?`1px solid rgba(255,255,255,0.04)`:"none" }}>
              <div style={{ width:34, height:34, borderRadius:10, background:enabled?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.2s" }}>
                <Flag size={14} color={enabled?V.green:"rgba(255,255,255,0.25)"}/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>{flag.label}</p>
                <p style={{ fontSize:11, color:t.muted, margin:"2px 0 0", lineHeight:1.4 }}>{flag.desc}</p>
              </div>
              {updateMut.isPending ? (
                <RefreshCw size={14} color={t.muted} style={{ animation:"spin 0.7s linear infinite", flexShrink:0 }}/>
              ) : (
                <button onClick={() => updateMut.mutate({ flag:flag.key, enabled:!enabled })}
                  style={{ width:48, height:26, borderRadius:13, border:"none", cursor:"pointer", background:enabled?V.accent:"rgba(255,255,255,0.1)", position:"relative", transition:"background 0.2s", padding:0, flexShrink:0 }}>
                  <div style={{ position:"absolute", top:3, left:enabled?25:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
