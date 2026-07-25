"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink, Zap, ChevronRight, Rocket } from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

export default function GoLivePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;

  const C = {
    card:   isDark ? "rgba(255,255,255,0.04)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.15)" : "rgba(107,53,232,0.12)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
  };

  const { data: storeData } = useQuery({
    queryKey: ["go-live-store", storeId],
    queryFn:  () => api.get(`/stores/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const { data: productCount = 0 } = useQuery({
    queryKey: ["go-live-products", storeId],
    queryFn:  () => api.get(`/products/${storeId}?limit=1`).then(r => r.data.total || r.data.data?.total || 0),
    enabled:  !!storeId,
  });

  const store = storeData || user?.stores?.[0];
  const bankConnected = !!(storeData as any)?.paystackConnected || !!(storeData as any)?.bankName;

  const CHECKLIST = [
    {
      section: "🏪 Store Setup",
      items: [
        { title:"Store created",             done:!!storeId,        desc:"Your store has a URL on DropOS.",                                     href:"/dashboard/stores",      tag:"required"    },
        { title:"Store name & logo",         done:!!(store as any)?.logo, desc:"Brand your store. First impressions decide if customers stay.",  href:"/dashboard/customize",   tag:"required"    },
        { title:"At least 1 product added",  done:productCount>0,   desc:"Import from AliExpress or add manually.",                             href:"/dashboard/import",      tag:"required"    },
        { title:"Shipping zones configured", done:!!(store as any)?.shippingZones?.length, desc:"Define delivery areas and costs.",             href:"/dashboard/shipping",    tag:"required"    },
      ]
    },
    {
      section: "💳 Payments",
      items: [
        { title:"Bank account connected",    done:bankConnected,    desc:"98% of every sale goes directly to your bank. Enter your account number in Settings → Payments.", href:"/dashboard/settings", tag:"critical" },
        { title:"Paystack webhook set",      done:false,            desc:"In Paystack dashboard → Settings → API → Webhook URL:\nhttps://dropos-v2.onrender.com/api/payments/webhook/paystack", href:"https://dashboard.paystack.com/#/settings/developer", external:true, tag:"critical" },
      ]
    },
    {
      section: "🌐 Technical",
      items: [
        { title:"DNS wildcard in Vercel",    done:false,            desc:"Vercel dashboard → your project → Domains → add CNAME record: `*` → `cname.vercel-dns.com`. Enables yourstore.droposhq.com.", href:"https://vercel.com/dashboard", external:true, tag:"required" },
        { title:"Render paid tier ($7/mo)",  done:false,            desc:"Free tier sleeps after 15 mins — customers see a 60s blank screen. Upgrade to Starter to stay always-on.", href:"https://render.com", external:true, tag:"recommended" },
        { title:"Custom domain (optional)",  done:!!(store as any)?.customDomain, desc:"Buy yourbrand.com and connect it — DNS auto-configures.", href:"/dashboard/domains", tag:"optional" },
      ]
    },
    {
      section: "🚀 Launch",
      items: [
        { title:"Test a real order",         done:false,            desc:"Place a ₦100 test order through your own store end-to-end before telling customers.", href:`/store/${(store as any)?.slug}`, external:true, tag:"critical" },
        { title:"Share your store link",     done:false,            desc:"Post your store URL on WhatsApp, Instagram, and TikTok. Tell 10 people today.", href:`/store/${(store as any)?.slug}`, external:true, tag:"recommended" },
        { title:"Create first ad with KIRO", done:false,            desc:"KIRO writes TikTok/Instagram ads for any product in 15 seconds.", href:"/dashboard/ads", tag:"optional" },
      ]
    },
    {
      section: "⚙️ Env Vars on Render",
      items: [
        { title:"ANTHROPIC_API_KEY set",     done:false,            desc:"Required for KIRO AI, Ad Copy, and Start a Business. Get it at console.anthropic.com", href:"https://render.com/dashboard", external:true, tag:"critical" },
        { title:"RESEND_API_KEY set",        done:false,            desc:"Required for all emails (order confirmations, campaigns). Get it at resend.com", href:"https://render.com/dashboard", external:true, tag:"required" },
        { title:"PAYSTACK_SECRET_KEY set",   done:false,            desc:"Required for payments. Already in Render? Check it matches your live Paystack key.", href:"https://render.com/dashboard", external:true, tag:"critical" },
      ]
    }
  ];

  const allItems = CHECKLIST.flatMap(c => c.items);
  const critical = allItems.filter(i => i.tag === "critical" || i.tag === "required");
  const doneCount = critical.filter(i => i.done).length;
  const pct = Math.round((doneCount / critical.length) * 100);
  const isReady = doneCount === critical.length;

  const TAG: Record<string,{color:string;bg:string;label:string}> = {
    critical:    { color:"#EF4444", bg:"rgba(239,68,68,0.08)",   label:"Critical"    },
    required:    { color:V.amber,   bg:"rgba(245,158,11,0.08)",  label:"Required"    },
    recommended: { color:V.v400,    bg:"rgba(107,53,232,0.08)",  label:"Recommended" },
    optional:    { color:C.muted as string, bg:C.faint as string,         label:"Optional"    },
  };

  return (
    <div style={{ maxWidth:740, margin:"0 auto", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
        <div style={{ width:44, height:44, borderRadius:13, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Rocket size={20} color="#C4B5FD"/>
        </div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, color:C.text, margin:0, letterSpacing:"-0.03em" }}>Go Live Checklist</h1>
          <p style={{ fontSize:12, color:C.muted, margin:0 }}>Complete these before sending customers to your store</p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding:18, borderRadius:18, background:isReady?"rgba(16,185,129,0.05)":C.card, border:`1px solid ${isReady?"rgba(16,185,129,0.2)":C.border}`, marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <p style={{ fontSize:14, fontWeight:700, color:isReady?"#10B981":C.text, margin:0 }}>
            {isReady ? "🎉 Ready to launch!" : `${doneCount}/${critical.length} critical items complete`}
          </p>
          <span style={{ fontSize:18, fontWeight:900, color:isReady?"#10B981":V.v400 }}>{pct}%</span>
        </div>
        <div style={{ height:8, background:isDark?"rgba(255,255,255,0.06)":"rgba(19,13,46,0.06)", borderRadius:99 }}>
          <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }}
            style={{ height:"100%", borderRadius:99, background:isReady?"#10B981":"linear-gradient(90deg,#6B35E8,#8B5CF6)" }}/>
        </div>
        {isReady && (
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <a href={`/store/${(store as any)?.slug}`} target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:10, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700 }}>
              <ExternalLink size={13}/> View your store
            </a>
            <Link href="/kiro" style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:10, border:`1px solid ${C.border}`, background:C.card, color:C.text, textDecoration:"none", fontSize:13, fontWeight:600 }}>
              <Zap size={13} color={V.v400}/> Ask KIRO what's next
            </Link>
          </div>
        )}
      </div>

      {/* Sections */}
      {CHECKLIST.map((section, si) => (
        <motion.div key={section.section} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:si*0.06 }}
          style={{ marginBottom:20 }}>
          <p style={{ fontSize:12, fontWeight:800, color:C.muted, letterSpacing:"0.06em", margin:"0 0 10px" }}>
            {section.section}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {section.items.map((item, ii) => {
              const tag = TAG[item.tag] || TAG.optional;
              return (
                <div key={ii} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", borderRadius:14,
                  background:item.done?"rgba(16,185,129,0.03)":C.card,
                  border:`1px solid ${item.done?"rgba(16,185,129,0.15)":C.border}`,
                  opacity:item.done?0.75:1 }}>
                  <div style={{ flexShrink:0, marginTop:1 }}>
                    {item.done
                      ? <CheckCircle2 size={19} color="#10B981"/>
                      : <Circle size={19} color={C.muted as string}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                      <p style={{ fontSize:13, fontWeight:700, color:item.done?"#10B981":C.text, margin:0,
                        textDecoration:item.done?"line-through":"none" }}>{item.title}</p>
                      <span style={{ fontSize:10, fontWeight:700, color:tag.color, background:tag.bg,
                        padding:"2px 7px", borderRadius:99 }}>{tag.label}</span>
                    </div>
                    <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.65, whiteSpace:"pre-line" }}>{item.desc}</p>
                  </div>
                  {!item.done && (
                    (item as any).external
                      ? <a href={item.href} target="_blank" rel="noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:9,
                            background:`${V.v500}10`, border:`1px solid ${V.v500}25`, color:V.v400,
                            textDecoration:"none", fontSize:11, fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>
                          Open <ExternalLink size={10}/>
                        </a>
                      : <Link href={item.href}
                          style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:9,
                            background:`${V.v500}10`, border:`1px solid ${V.v500}25`, color:V.v400,
                            textDecoration:"none", fontSize:11, fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>
                          {item.action || "Go"} <ChevronRight size={10}/>
                        </Link>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
