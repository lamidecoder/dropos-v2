"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Radio, Send, Users, Mail, MessageSquare, Zap, Loader2, Check, X, ChevronRight, Clock } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

const CHANNELS = [
  { id:"email",     icon:"📧", label:"Email",     desc:"Send to all customers with email"  },
  { id:"whatsapp",  icon:"📱", label:"WhatsApp",  desc:"WhatsApp broadcast message"        },
  { id:"push",      icon:"🔔", label:"Push",      desc:"In-app push notification"          },
];

const TEMPLATES = [
  { id:"flash_sale",   label:"Flash Sale",    emoji:"⚡", body:"🔥 FLASH SALE - {discount}% OFF everything in my store for the next {hours} hours only!\n\nShop now: {store_url}\n\nOffer ends {end_time}" },
  { id:"new_arrival",  label:"New Arrival",   emoji:"✨", body:"✨ New drop just landed!\n\n{product_name} is now available in my store.\n\n👉 {store_url}\n\nLimited stock - don't miss out!" },
  { id:"restock",      label:"Back in Stock", emoji:"📦", body:"📦 Great news! {product_name} is back in stock.\n\nGet yours before it sells out again:\n{store_url}" },
  { id:"winback",      label:"Win-Back",      emoji:"💝", body:"Hey {customer_name}, we miss you! 👋\n\nHere's {discount}% off your next order as a thank you for being a loyal customer.\n\nUse code: {code}\n{store_url}" },
  { id:"custom",       label:"Custom",        emoji:"✍️", body:""  },
];

function BroadcastCard({ b, t }: any) {
  const statusColor = b.status === "sent" ? "#10B981" : b.status === "pending" ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background:"rgba(107,53,232,0.1)" }}>
        {b.channel === "email" ? "📧" : b.channel === "whatsapp" ? "📱" : "🔔"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color:t.text }}>{b.subject || b.message?.slice(0,40) + "..."}</p>
        <p className="text-xs mt-0.5" style={{ color:t.muted }}>
          {b.recipients} recipients · {new Date(b.createdAt).toLocaleDateString()}
        </p>
      </div>
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ color:statusColor, background:`${statusColor}18` }}>
        {b.status}
      </span>
    </div>
  );
}

export default function BroadcastsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
    input:  isDark ? "rgba(255,255,255,0.05)" : "#F5F3FF",
  };

  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();

  const [channel,  setChannel]  = useState("email");
  const [template, setTemplate] = useState("custom");
  const [subject,  setSubject]  = useState("");
  const [body,     setBody]     = useState("");
  const [segment,  setSegment]  = useState("all");
  const [preview,  setPreview]  = useState(false);

  // Load history
  const { data: history } = useQuery({
    queryKey: ["broadcasts", storeId],
    queryFn:  () => api.get(`/stores/${storeId}/broadcasts`).then(r => r.data.data || []),
    enabled:  !!storeId,
  });

  // Customer count
  const { data: stats } = useQuery({
    queryKey: ["broadcast-stats", storeId],
    queryFn:  () => api.get(`/customers/${storeId}/stats`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  // AI write message
  const writeMut = useMutation({
    mutationFn: () => api.post("/kai/smart-chat", {
      message: `Write a ${TEMPLATES.find(t=>t.id===template)?.label || "marketing"} broadcast message for my store. Channel: ${channel}. Keep it short, punchy and conversational. Return only the message text.`,
      storeId,
    }),
    onSuccess: (r) => {
      const msg = r.data?.data?.reply || r.data?.reply || "";
      setBody(msg);
      toast.success("KIRO wrote your message");
    },
    onError: () => toast.error("KIRO is offline - write manually"),
  });

  // Send broadcast
  const sendMut = useMutation({
    mutationFn: () => api.post(`/stores/${storeId}/broadcasts`, {
      channel, subject, message: body, segment, templateId: template,
    }),
    onSuccess: () => {
      toast.success("Broadcast queued for sending!");
      setBody(""); setSubject("");
      qc.invalidateQueries({ queryKey: ["broadcasts"] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Send failed"),
  });

  const tpl = TEMPLATES.find(t => t.id === template);
  const recipientCount = segment === "all" ? (stats?.totalCustomers || 0)
    : segment === "active" ? (stats?.activeCustomers || 0)
    : segment === "vip"    ? (stats?.vipCustomers    || 0)
    : (stats?.totalCustomers || 0);

  const inp = {
    width:"100%", padding:"11px 14px", borderRadius:12,
    border:`1px solid ${t.border}`, background:t.input,
    color:t.text, fontSize:13, outline:"none", fontFamily:"inherit",
  } as const;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{color:t.text}}>Broadcasts</h1>
          <p className="text-sm" style={{color:t.muted}}>Reach your customers across email, WhatsApp, and push</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{background:"rgba(107,53,232,0.08)",border:"1px solid rgba(107,53,232,0.15)"}}>
          <Users size={14} color={V.v400}/>
          <span className="text-sm font-bold" style={{color:V.v300}}>{recipientCount.toLocaleString()} recipients</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Composer */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.06}}
          className="lg:col-span-3 rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`}}>
          <div className="p-5" style={{borderBottom:`1px solid ${t.border}`}}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:t.muted}}>New Broadcast</p>

            {/* Channel */}
            <div className="flex gap-2 mb-4">
              {CHANNELS.map(c => (
                <button key={c.id} onClick={() => setChannel(c.id)}
                  className="flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all"
                  style={{border:`1px solid ${channel===c.id?"rgba(107,53,232,0.4)":t.border}`,background:channel===c.id?"rgba(107,53,232,0.1)":t.faint,cursor:"pointer"}}>
                  <span className="text-lg">{c.icon}</span>
                  <span className="text-xs font-semibold" style={{color:channel===c.id?V.v300:t.muted}}>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Template */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {TEMPLATES.map(tp => (
                <button key={tp.id} onClick={() => { setTemplate(tp.id); if(tp.body) setBody(tp.body); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{border:`1px solid ${template===tp.id?"rgba(107,53,232,0.4)":t.border}`,background:template===tp.id?"rgba(107,53,232,0.1)":t.faint,cursor:"pointer",color:template===tp.id?V.v300:t.muted}}>
                  {tp.emoji} {tp.label}
                </button>
              ))}
            </div>

            {/* Segment */}
            <div className="flex gap-2 mb-4">
              {[["all","All customers"],["active","Active (30d)"],["vip","VIP"]].map(([id,label]) => (
                <button key={id} onClick={() => setSegment(id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{border:`1px solid ${segment===id?"rgba(107,53,232,0.4)":t.border}`,background:segment===id?"rgba(107,53,232,0.1)":t.faint,cursor:"pointer",color:segment===id?V.v300:t.muted}}>
                  {label}
                </button>
              ))}
            </div>

            {channel === "email" && (
              <input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Email subject line..." style={{...inp, marginBottom:10}}/>
            )}

            <div className="relative">
              <textarea value={body} onChange={e => setBody(e.target.value)}
                placeholder="Write your message... or let KIRO write it for you"
                rows={6} style={{...inp, resize:"none", display:"block"}}/>
              <button onClick={() => writeMut.mutate()} disabled={writeMut.isPending}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,color:"#fff",border:"none",cursor:"pointer",opacity:writeMut.isPending?0.7:1}}>
                {writeMut.isPending ? <Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/> : <Zap size={11}/>}
                {writeMut.isPending ? "Writing..." : "KIRO"}
              </button>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between gap-3">
            <p className="text-xs" style={{color:t.muted}}>
              Sending to <strong style={{color:t.text}}>{recipientCount.toLocaleString()}</strong> {segment} customers
            </p>
            <button onClick={() => sendMut.mutate()} disabled={!body || sendMut.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:body&&!sendMut.isPending?"pointer":"not-allowed",opacity:!body||sendMut.isPending?0.6:1}}>
              {sendMut.isPending ? <Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> : <Send size={14}/>}
              {sendMut.isPending ? "Sending..." : "Send Broadcast"}
            </button>
          </div>
        </motion.div>

        {/* History */}
        <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
          className="lg:col-span-2 flex flex-col gap-3">
          {/* Stats */}
          {[
            {emoji:"📨", label:"Total sent",   value: stats?.totalBroadcasts || 0 },
            {emoji:"👁️", label:"Avg open rate", value: `${stats?.avgOpenRate || 0}%` },
            {emoji:"🛒", label:"Conversions",   value: stats?.broadcastConversions || 0 },
          ].map((s,i) => (
            <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.06}}
              className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="text-lg font-black" style={{color:t.text,letterSpacing:"-0.5px"}}>{s.value.toLocaleString()}</p>
                <p className="text-xs" style={{color:t.muted}}>{s.label}</p>
              </div>
            </motion.div>
          ))}

          {/* History */}
          <div className="rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`,flex:1}}>
            <div className="px-4 py-3" style={{borderBottom:`1px solid ${t.border}`}}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{color:t.muted}}>Recent Broadcasts</p>
            </div>
            <div className="p-3 space-y-2">
              {history?.length ? history.slice(0,5).map((b: any, i: number) => (
                <BroadcastCard key={b.id || i} b={b} t={t}/>
              )) : (
                <div className="text-center py-8">
                  <Radio size={28} style={{color:t.muted,margin:"0 auto 8px"}}/>
                  <p className="text-xs" style={{color:t.muted}}>No broadcasts yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
