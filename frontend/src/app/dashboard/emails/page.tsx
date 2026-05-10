"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Mail, Send, Users, Zap, Plus, Eye, BarChart2, X, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B" };

const CAMPAIGN_TYPES = [
  { id:"welcome",    emoji:"👋", label:"Welcome Series",     desc:"Automated email when someone joins your store" },
  { id:"winback",    emoji:"💝", label:"Win-Back",           desc:"Re-engage customers who haven't bought in 30+ days" },
  { id:"abandoned",  emoji:"🛒", label:"Cart Recovery",      desc:"Recover abandoned checkout sessions" },
  { id:"newsletter", emoji:"📰", label:"Newsletter",         desc:"Regular updates to your entire list" },
  { id:"promo",      emoji:"🎉", label:"Promotional",        desc:"Announce sales, new arrivals, events" },
];

function CampaignCard({ c, t }: any) {
  const statusColor = c.status === "active" ? V.green : c.status === "sent" ? V.v400 : V.amber;
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
      <div className="text-2xl flex-shrink-0">{c.emoji || "📧"}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color:t.text }}>{c.name}</p>
        <p className="text-xs mt-0.5" style={{ color:t.muted }}>
          {c.recipients?.toLocaleString() || 0} recipients
          {c.openRate ? ` · ${c.openRate}% open rate` : ""}
          {c.sentAt ? ` · ${new Date(c.sentAt).toLocaleDateString()}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {c.openRate && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold" style={{ color:t.text }}>{c.openRate}%</p>
            <p className="text-xs" style={{ color:t.muted }}>opened</p>
          </div>
        )}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ color:statusColor, background:`${statusColor}18` }}>
          {c.status || "draft"}
        </span>
      </div>
    </div>
  );
}

function NewCampaignModal({ onClose, storeId, t, isDark }: any) {
  const qc = useQueryClient();
  const [type, setType]       = useState("newsletter");
  const [name, setName]       = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody]       = useState("");
  const [writing, setWriting] = useState(false);

  const createMut = useMutation({
    mutationFn: () => api.post(`/emails/${storeId}/campaigns`, { type, name, subject, body }),
    onSuccess: () => { toast.success("Campaign created!"); qc.invalidateQueries({queryKey:["email-campaigns"]}); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const writeWithKiro = async () => {
    setWriting(true);
    try {
      const tpl = CAMPAIGN_TYPES.find(t => t.id === type);
      const r = await api.post("/kai/smart-chat", {
        message: `Write a ${tpl?.label} email for my store. Subject line and body. Keep it warm, concise, and action-oriented. Return format: SUBJECT: [subject]\n\nBODY:\n[body]`,
        storeId,
      });
      const text = r.data?.data?.reply || r.data?.reply || "";
      const subMatch = text.match(/SUBJECT:\s*(.+)/);
      const bodyMatch = text.match(/BODY:\s*([\s\S]+)/);
      if (subMatch) setSubject(subMatch[1].trim());
      if (bodyMatch) setBody(bodyMatch[1].trim());
      toast.success("KIRO wrote your email");
    } catch { toast.error("KIRO offline"); }
    setWriting(false);
  };

  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:isDark?"rgba(255,255,255,0.05)":"#F5F3FF", color:t.text, fontSize:13, outline:"none", fontFamily:"inherit" } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background:isDark?"#181230":"#fff", border:`1px solid ${t.border}`, maxHeight:"90vh", overflowY:"auto" }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom:`1px solid ${t.border}` }}>
          <h3 className="font-black text-base" style={{ color:t.text }}>New Email Campaign</h3>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:t.muted }}><X size={18}/></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Type picker */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color:t.muted }}>Campaign Type</label>
            <div className="space-y-2">
              {CAMPAIGN_TYPES.map(ct => (
                <button key={ct.id} onClick={() => setType(ct.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{ border:`1px solid ${type===ct.id?"rgba(107,53,232,0.4)":t.border}`, background:type===ct.id?"rgba(107,53,232,0.08)":t.faint, cursor:"pointer" }}>
                  <span className="text-xl flex-shrink-0">{ct.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color:type===ct.id?V.v300:t.text }}>{ct.label}</p>
                    <p className="text-xs" style={{ color:t.muted }}>{ct.desc}</p>
                  </div>
                  {type === ct.id && <Check size={14} color={V.v400} className="flex-shrink-0"/>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color:t.muted }}>Campaign Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="May Newsletter" style={inp}/>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color:t.muted }}>Subject Line</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Something exciting is here..." style={inp}/>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold mb-1.5" style={{ color:t.muted }}>Email Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
              placeholder="Write your email content..." style={{...inp, resize:"none", display:"block"}}/>
            <button onClick={writeWithKiro} disabled={writing}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer", opacity:writing?0.7:1 }}>
              {writing ? <Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/> : <Zap size={11}/>}
              KIRO
            </button>
          </div>
        </div>
        <div className="p-5 flex gap-3" style={{ borderTop:`1px solid ${t.border}` }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ border:`1px solid ${t.border}`, background:"transparent", cursor:"pointer", color:t.muted }}>Cancel</button>
          <button onClick={() => createMut.mutate()} disabled={!name||!subject||createMut.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer", opacity:!name||!subject?0.6:1 }}>
            {createMut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Plus size={13}/>}
            Create Campaign
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function EmailsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [showNew, setShowNew] = useState(false);

  const { data: campaigns } = useQuery({
    queryKey: ["email-campaigns", storeId],
    queryFn: () => api.get(`/emails/${storeId}/campaigns`).then(r => r.data.data || []),
    enabled: !!storeId,
  });

  const { data: stats } = useQuery({
    queryKey: ["email-stats", storeId],
    queryFn: () => api.get(`/customers/${storeId}/stats`).then(r => r.data.data),
    enabled: !!storeId,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{ color:t.text }}>Email Campaigns</h1>
          <p className="text-sm" style={{ color:t.muted }}>{campaigns?.length || 0} campaigns · {stats?.totalCustomers || 0} subscribers</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer" }}>
          <Plus size={15}/> New Campaign
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:"Subscribers", value:(stats?.totalCustomers||0).toLocaleString(), icon:Users,    color:V.v400  },
          { label:"Avg Open Rate",value:"--",                                        icon:Eye,      color:V.green },
          { label:"Campaigns",    value:(campaigns?.length||0).toString(),            icon:BarChart2,color:V.amber },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="p-4 rounded-2xl" style={{ background:t.card, border:`1px solid ${t.border}` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background:`${s.color}15` }}>
              <s.icon size={14} style={{ color:s.color }}/>
            </div>
            <p className="text-xl font-black mb-0.5" style={{ color:t.text }}>{s.value}</p>
            <p className="text-xs" style={{ color:t.muted }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Campaign types info */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{ background:t.card, border:`1px solid ${t.border}` }}>
        <div className="px-5 py-4" style={{ borderBottom:`1px solid ${t.border}` }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color:t.muted }}>Automated Campaigns</p>
        </div>
        <div className="divide-y" style={{ borderColor:t.border }}>
          {CAMPAIGN_TYPES.slice(0,3).map((ct, i) => (
            <div key={ct.id} className="flex items-center gap-4 px-5 py-3.5">
              <span className="text-xl flex-shrink-0">{ct.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color:t.text }}>{ct.label}</p>
                <p className="text-xs" style={{ color:t.muted }}>{ct.desc}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background:"rgba(107,53,232,0.1)", color:V.v400 }}>
                Auto
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns list */}
      {!campaigns?.length ? (
        <div className="text-center py-16 rounded-2xl" style={{ background:t.faint, border:`1px solid ${t.border}` }}>
          <Mail size={36} style={{ color:t.muted, margin:"0 auto 12px" }}/>
          <p className="font-bold text-base mb-2" style={{ color:t.text }}>No campaigns yet</p>
          <p className="text-sm mb-6" style={{ color:t.muted }}>Create your first email campaign. KIRO writes the content.</p>
          <button onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer" }}>
            <Plus size={14}/> Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
              <CampaignCard c={c} t={t}/>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showNew && <NewCampaignModal onClose={() => setShowNew(false)} storeId={storeId} t={t} isDark={isDark}/>}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
