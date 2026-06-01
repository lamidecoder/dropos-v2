"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { PageHeader } from "../../../components/admin/AdminTable";
import { motion } from "framer-motion";
import { Flag, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const V = { accent:"#6B35E8", green:"#10B981" };
const t = { card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)" };

const FLAGS = [
  { key:"kiro_enabled",         label:"KIRO AI",                  desc:"Enable/disable KIRO AI for all merchants" },
  { key:"store_generator",      label:"AI Store Generator",        desc:"Merchants can use KIRO to auto-generate store identity" },
  { key:"virtual_accounts",     label:"Virtual Bank Accounts",     desc:"Paystack DVA feature — requires CAC + verified business" },
  { key:"delivery_booking",     label:"Delivery Booking",          desc:"GIG Logistics + Kwik rider booking from dashboard" },
  { key:"affiliate_program",    label:"Affiliate Programme",       desc:"20% referral commissions for Pro plan users" },
  { key:"tiktok_shop_sync",     label:"TikTok Shop Sync",          desc:"Auto-sync products to TikTok Shop" },
  { key:"competitor_spy",       label:"Competitor Spy",            desc:"AI competitor product research tool" },
  { key:"maintenance_mode",     label:"Maintenance Mode",          desc:"Show maintenance banner on all storefronts" },
  { key:"new_user_registration",label:"New Registrations",         desc:"Allow new merchants to sign up" },
];

export default function AdminFlagsPage() {
  const qc = useQueryClient();
  const { data:flags={}, isLoading } = useQuery<any>({
    queryKey: ["admin-flags"],
    queryFn: () => adminAPI.get("/admin/feature-flags").then((r:any) => r.data.data||{}),
  });
  const updateMut = useMutation({
    mutationFn: ({ flag, enabled }:any) => adminAPI.patch("/admin/feature-flags", { flag, enabled }),
    onSuccess: (_,vars) => { toast.success(`${vars.flag} ${vars.enabled?"enabled":"disabled"}`); qc.invalidateQueries({ queryKey:["admin-flags"] }); },
  });

  return (
    <div style={{ maxWidth:640 }}>
      <PageHeader title="Feature Flags" sub="Toggle features on/off across the entire platform"/>
      <div style={{ background:t.card, borderRadius:18, border:`1px solid ${t.border}`, overflow:"hidden" }}>
        {FLAGS.map((flag, i) => {
          const on = flags[flag.key]===true||flags[flag.key]==="true";
          return (
            <motion.div key={flag.key} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 20px", borderBottom:i<FLAGS.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
              <div style={{ width:32, height:32, borderRadius:9, background:on?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.2s" }}>
                <Flag size={13} color={on?V.green:"rgba(255,255,255,0.25)"}/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>{flag.label}</p>
                <p style={{ fontSize:11, color:t.muted, margin:"2px 0 0", lineHeight:1.4 }}>{flag.desc}</p>
              </div>
              {isLoading || updateMut.isPending ? (
                <RefreshCw size={13} color={t.muted} style={{ animation:"spin 0.7s linear infinite", flexShrink:0 }}/>
              ) : (
                <button onClick={() => updateMut.mutate({ flag:flag.key, enabled:!on })}
                  style={{ width:46, height:24, borderRadius:12, border:"none", cursor:"pointer", background:on?V.accent:"rgba(255,255,255,0.1)", position:"relative", padding:0, flexShrink:0, transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:3, left:on?25:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
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
