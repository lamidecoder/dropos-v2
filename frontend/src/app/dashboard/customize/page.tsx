"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Palette, Type, Layout, Share2, Eye, Check, ChevronRight,
  Upload, Store, Zap, Globe, Instagram, MessageCircle,
  ExternalLink, Sparkles, AlignLeft, Bell, Tag, Image as ImageIcon,
  ToggleLeft, ToggleRight, Lock, ArrowRight, RefreshCw,
} from "lucide-react";

const V = { v400:"#6B35E8", v300:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

const TEMPLATES = [
  { id:"aurora",    name:"Aurora",    niche:"Fashion",     color:"#7C3AED", dark:false },
  { id:"obsidian",  name:"Obsidian",  niche:"Luxury",      color:"#1A1A2E", dark:true  },
  { id:"verdant",   name:"Verdant",   niche:"Beauty",      color:"#059669", dark:false },
  { id:"atelier",   name:"Atelier",   niche:"Art",         color:"#78350F", dark:false },
  { id:"voltage",   name:"Voltage",   niche:"Electronics", color:"#EF4444", dark:true  },
  { id:"prism",     name:"Prism",     niche:"General",     color:"#7C3AED", dark:true  },
  { id:"ember",     name:"Ember",     niche:"Streetwear",  color:"#DC2626", dark:true  },
  { id:"nexus",     name:"Nexus",     niche:"Tech",        color:"#0EA5E9", dark:true  },
  { id:"velvet",    name:"Velvet",    niche:"Lingerie",    color:"#BE185D", dark:true  },
  { id:"glow",      name:"Glow",      niche:"Skincare",    color:"#F472B6", dark:false },
  { id:"terra",     name:"Terra",     niche:"Organic",     color:"#65A30D", dark:false },
  { id:"ionic",     name:"Ionic",     niche:"Sports",      color:"#3B82F6", dark:true  },
  { id:"artisan",   name:"Artisan",   niche:"Crafts",      color:"#92400E", dark:false },
  { id:"apex",      name:"Apex",      niche:"Fitness",     color:"#111827", dark:true  },
  { id:"sage",      name:"Sage",      niche:"Wellness",    color:"#4D7C0F", dark:false },
  { id:"diamond",   name:"Diamond",   niche:"Jewelry",     color:"#1D4ED8", dark:false },
  { id:"nova",      name:"Nova",      niche:"Cosmetics",   color:"#9D174D", dark:true  },
  { id:"dusk",      name:"Dusk",      niche:"Lifestyle",   color:"#6D28D9", dark:true  },
  { id:"kids",      name:"Kids",      niche:"Children",    color:"#F97316", dark:false },
  { id:"luxe",      name:"Luxe",      niche:"Premium",     color:"#78350F", dark:true  },
  { id:"muse",      name:"Muse",      niche:"Accessories", color:"#BE123C", dark:false },
  { id:"pearl",     name:"Pearl",     niche:"Bridal",      color:"#6B7280", dark:false },
  { id:"chrome",    name:"Chrome",    niche:"Gadgets",     color:"#374151", dark:true  },
  { id:"bound",     name:"Bound",     niche:"Books",       color:"#1E3A5F", dark:false },
  { id:"onyx",      name:"Onyx",      niche:"Watches",     color:"#18181B", dark:true  },
  { id:"blaze",     name:"Blaze",     niche:"Shoes",       color:"#B91C1C", dark:true  },
  { id:"flora",     name:"Flora",     niche:"Plants",      color:"#15803D", dark:false },
  { id:"street",    name:"Street",    niche:"Urban",       color:"#111827", dark:true  },
  { id:"kodiak",    name:"Kodiak",    niche:"Outdoors",    color:"#78350F", dark:false },
];

const FONTS = [
  { id:"DM Sans",        label:"DM Sans",       preview:"Modern & clean"   },
  { id:"Plus Jakarta Sans", label:"Jakarta Sans", preview:"Friendly & fresh" },
  { id:"Fraunces",       label:"Fraunces",       preview:"Elegant & serif"  },
  { id:"Syne",           label:"Syne",           preview:"Bold & geometric"  },
  { id:"Space Grotesk",  label:"Space Grotesk",  preview:"Technical & sharp" },
];

type Section = "template" | "branding" | "content" | "social" | "seo";

export default function CustomizePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    bg:     isDark ? "#06040D" : "#F4F2FB",
    card:   isDark ? "rgba(255,255,255,0.03)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.1)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
    input:  isDark ? "rgba(255,255,255,0.05)" : "#fff",
  };

  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const qc      = useQueryClient();
  const [section, setSection] = useState<Section>("template");

  const { data: store } = useQuery({
    queryKey: ["store-detail", storeId],
    queryFn:  () => api.get(`/stores/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  // Form state — synced from store
  const [form, setForm] = useState({
    templateId:      "",
    primaryColor:    "#6B35E8",
    accentColor:     "#8B5CF6",
    fontFamily:      "DM Sans",
    tagline:         "",
    description:     "",
    announcement:    "",
    announcementOn:  false,
    freeShippingMin: "",
    whatsappPhone:   "",
    whatsappEnabled: false,
    instagram:       "",
    tiktok:          "",
    facebook:        "",
    twitter:         "",
    metaTitle:       "",
    metaDescription: "",
  });

  useEffect(() => {
    if (!store) return;
    setForm({
      templateId:      store.templateId || store.theme || "",
      primaryColor:    store.primaryColor || "#6B35E8",
      accentColor:     store.accentColor  || "#8B5CF6",
      fontFamily:      store.fontFamily   || "DM Sans",
      tagline:         store.tagline      || "",
      description:     store.description  || "",
      announcement:    store.announcement || "",
      announcementOn:  !!store.announcement,
      freeShippingMin: store.freeShippingMin ? String(store.freeShippingMin) : "",
      whatsappPhone:   store.whatsappPhone   || "",
      whatsappEnabled: !!store.whatsappEnabled,
      instagram:       store.instagram  || "",
      tiktok:          store.tiktok     || "",
      facebook:        store.facebook   || "",
      twitter:         store.twitter    || "",
      metaTitle:       store.metaTitle       || "",
      metaDescription: store.metaDescription || "",
    });
  }, [store]);

  const saveMut = useMutation({
    mutationFn: (data: any) => api.put(`/stores/${storeId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-detail", storeId] });
      toast.success("Saved!");
    },
    onError: () => toast.error("Save failed — try again"),
  });

  const save = () => {
    saveMut.mutate({
      theme:          form.templateId,
      templateId:     form.templateId,
      primaryColor:   form.primaryColor,
      accentColor:    form.accentColor,
      fontFamily:     form.fontFamily,
      tagline:        form.tagline,
      description:    form.description,
      announcement:   form.announcementOn ? form.announcement : "",
      freeShippingMin: form.freeShippingMin ? Number(form.freeShippingMin) : null,
      whatsappPhone:  form.whatsappPhone,
      whatsappEnabled: form.whatsappEnabled,
      instagram:      form.instagram,
      tiktok:         form.tiktok,
      facebook:       form.facebook,
      twitter:        form.twitter,
      metaTitle:      form.metaTitle,
      metaDescription: form.metaDescription,
    });
  };

  const storeUrl = storeId && store
    ? (store.customDomain ? `https://${store.customDomain}` : `https://droposhq.com/store/${store.slug}`)
    : "#";

  const SECTIONS = [
    { id:"template",  label:"Template",  icon:Layout        },
    { id:"branding",  label:"Branding",  icon:Palette       },
    { id:"content",   label:"Content",   icon:AlignLeft     },
    { id:"social",    label:"Social",    icon:Share2        },
    { id:"seo",       label:"SEO",       icon:Globe         },
  ];

  const Input = ({ label, value, onChange, placeholder, prefix }: any) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:t.text, marginBottom:6 }}>{label}</label>
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        {prefix && <span style={{ position:"absolute", left:14, fontSize:13, color:t.muted }}>{prefix}</span>}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width:"100%", padding:`11px 14px 11px ${prefix?"36px":"14px"}`, borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"inherit", outline:"none", transition:"border-color 0.15s" }}
          onFocus={e => e.target.style.borderColor=V.v400}
          onBlur={e => e.target.style.borderColor=(isDark?"rgba(107,53,232,0.12)":"rgba(107,53,232,0.1)")}
        />
      </div>
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }: any) => (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:`1px solid ${t.border}` }}>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:13, fontWeight:600, color:t.text, margin:0 }}>{label}</p>
        {desc && <p style={{ fontSize:11, color:t.muted, margin:"2px 0 0" }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", background:value?V.v400:"rgba(19,13,46,0.12)", position:"relative", transition:"background 0.2s", padding:0, flexShrink:0 }}>
        <div style={{ position:"absolute", top:3, left:value?23:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.15)" }}/>
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.03em" }}>
            Customize Store
          </h1>
          <p style={{ fontSize:13, color:t.muted, margin:0 }}>Templates, colors, fonts, content, and more</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <a href={storeUrl} target="_blank" rel="noreferrer"
            style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", borderRadius:10, border:`1px solid ${t.border}`, background:t.card, color:t.muted, textDecoration:"none", fontSize:13, fontWeight:600 }}>
            <Eye size={13}/> Preview
          </a>
          <button onClick={save} disabled={saveMut.isPending}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", background:V.v400, color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
            {saveMut.isPending ? <><RefreshCw size={13} style={{ animation:"spin 0.7s linear infinite" }}/> Saving…</> : <><Check size={13}/> Save changes</>}
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          </button>
        </div>
      </motion.div>

      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:16 }} className="cust-grid">
        {/* Sidebar nav */}
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id as Section)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", background:active?`${V.v400}10`:t.card, transition:"all 0.15s", border:`1px solid ${active?`${V.v400}30`:t.border}` as any }}>
                <Icon size={15} color={active?V.v400:t.muted as string}/>
                <span style={{ fontSize:13, fontWeight:active?700:500, color:active?V.v400:t.text }}>{s.label}</span>
              </button>
            );
          })}

          {/* KIRO generate */}
          <div style={{ marginTop:12, padding:14, borderRadius:14, background:"linear-gradient(135deg,#2D1B69,#1A0B4A)", border:"1px solid rgba(167,139,250,0.2)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
              <Sparkles size={13} color="#C4B5FD"/>
              <span style={{ fontSize:11, fontWeight:800, color:"#C4B5FD", letterSpacing:"0.05em" }}>KIRO</span>
            </div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", margin:"0 0 10px", lineHeight:1.5 }}>
              Describe your business, KIRO designs your store.
            </p>
            <Link href="/kiro" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"8px 0", borderRadius:9, background:"rgba(255,255,255,0.1)", color:"#fff", textDecoration:"none", fontSize:12, fontWeight:700 }}>
              <Zap size={11}/> Try it
            </Link>
          </div>
        </div>

        {/* Main panel */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>

              {/* ── TEMPLATE ── */}
              {section === "template" && (
                <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
                  <h2 style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 6px" }}>Choose Template</h2>
                  <p style={{ fontSize:13, color:t.muted, margin:"0 0 20px" }}>
                    Pick the design that fits your brand. You can change this anytime.
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
                    {TEMPLATES.map(tmpl => {
                      const active = form.templateId === tmpl.id;
                      return (
                        <motion.div key={tmpl.id} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                          onClick={() => setForm(f => ({ ...f, templateId:tmpl.id }))}
                          style={{ borderRadius:14, overflow:"hidden", cursor:"pointer", border:`2px solid ${active?V.v400:t.border}`, transition:"border-color 0.15s", position:"relative" }}>
                          {/* Color preview */}
                          <div style={{ height:70, background:tmpl.dark?`linear-gradient(135deg,${tmpl.color},#000)`:`linear-gradient(135deg,${tmpl.color}20,#fff)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ width:32, height:32, borderRadius:8, background:tmpl.color, opacity:0.9 }}/>
                          </div>
                          <div style={{ padding:"10px 10px 12px", background:t.card }}>
                            <p style={{ fontSize:12, fontWeight:700, color:t.text, margin:"0 0 2px" }}>{tmpl.name}</p>
                            <span style={{ fontSize:10, color:t.muted }}>{tmpl.niche}</span>
                          </div>
                          {active && (
                            <div style={{ position:"absolute", top:8, right:8, width:20, height:20, borderRadius:"50%", background:V.v400, display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <Check size={11} color="#fff" strokeWidth={3}/>
                            </div>
                          )}
                          {tmpl.dark && (
                            <div style={{ position:"absolute", top:8, left:8, fontSize:9, fontWeight:700, color:"#fff", background:"rgba(0,0,0,0.5)", padding:"2px 6px", borderRadius:4 }}>DARK</div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── BRANDING ── */}
              {section === "branding" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
                    <h2 style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 18px" }}>Colors & Fonts</h2>
                    
                    {/* Color pickers */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
                      {[
                        { label:"Brand color", key:"primaryColor", desc:"Buttons, links, accents" },
                        { label:"Accent color", key:"accentColor",  desc:"Highlights and badges" },
                      ].map(({ label, key, desc }) => (
                        <div key={key}>
                          <label style={{ fontSize:12, fontWeight:700, color:t.text, display:"block", marginBottom:6 }}>{label}</label>
                          <p style={{ fontSize:11, color:t.muted, margin:"0 0 8px" }}>{desc}</p>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <input type="color" value={(form as any)[key]}
                              onChange={e => setForm(f => ({ ...f, [key]:e.target.value }))}
                              style={{ width:44, height:44, borderRadius:10, border:`1px solid ${t.border}`, cursor:"pointer", padding:4, background:"none" }}
                            />
                            <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]:e.target.value }))}
                              style={{ flex:1, padding:"10px 12px", borderRadius:10, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"monospace", outline:"none" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fonts */}
                    <label style={{ fontSize:12, fontWeight:700, color:t.text, display:"block", marginBottom:10 }}>Store font</label>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {FONTS.map(f => (
                        <div key={f.id} onClick={() => setForm(fm => ({ ...fm, fontFamily:f.id }))}
                          style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, cursor:"pointer", border:`1px solid ${form.fontFamily===f.id?V.v400:t.border}`, background:form.fontFamily===f.id?`${V.v400}06`:t.card, transition:"all 0.15s" }}>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:15, fontFamily:`'${f.id}',sans-serif`, color:t.text, margin:"0 0 2px", fontWeight:600 }}>{f.label}</p>
                            <p style={{ fontSize:11, color:t.muted, margin:0 }}>{f.preview}</p>
                          </div>
                          {form.fontFamily===f.id && <Check size={14} color={V.v400}/>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── CONTENT ── */}
              {section === "content" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
                    <h2 style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 18px" }}>Store Content</h2>

                    <Input label="Store tagline" value={form.tagline} onChange={(v:string) => setForm(f=>({...f,tagline:v}))}
                      placeholder="e.g. Premium fashion, fast delivery" />

                    <div style={{ marginBottom:16 }}>
                      <label style={{ display:"block", fontSize:12, fontWeight:700, color:t.text, marginBottom:6 }}>Store description</label>
                      <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                        placeholder="Describe what your store sells in 1-2 sentences..."
                        rows={3}
                        style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical" }}
                        onFocus={e => e.target.style.borderColor=V.v400}
                        onBlur={e => e.target.style.borderColor=(isDark?"rgba(107,53,232,0.12)":"rgba(107,53,232,0.1)")}
                      />
                    </div>
                  </div>

                  <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
                    <h2 style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 4px" }}>Announcement Bar</h2>
                    <p style={{ fontSize:12, color:t.muted, margin:"0 0 16px" }}>
                      Shows a message at the top of your store — flash sales, free shipping info, etc.
                    </p>

                    <Toggle label="Show announcement bar" value={form.announcementOn}
                      onChange={(v:boolean) => setForm(f=>({...f,announcementOn:v}))} />

                    {form.announcementOn && (
                      <div style={{ marginTop:14 }}>
                        <Input label="Announcement text" value={form.announcement}
                          onChange={(v:string) => setForm(f=>({...f,announcement:v}))}
                          placeholder="e.g. 🔥 Flash sale — 30% off everything this weekend!" />
                      </div>
                    )}
                  </div>

                  <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
                    <h2 style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 4px" }}>Free Shipping</h2>
                    <p style={{ fontSize:12, color:t.muted, margin:"0 0 16px" }}>
                      Show a free shipping progress bar in the cart when set.
                    </p>
                    <Input label="Free shipping minimum (₦)" value={form.freeShippingMin}
                      onChange={(v:string) => setForm(f=>({...f,freeShippingMin:v}))}
                      prefix="₦" placeholder="e.g. 10000" />
                  </div>

                  <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
                    <h2 style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 4px" }}>WhatsApp Chat</h2>
                    <p style={{ fontSize:12, color:t.muted, margin:"0 0 16px" }}>
                      Show a WhatsApp chat button on your store so customers can message you directly.
                    </p>
                    <Toggle label="WhatsApp chat bubble" desc="Customers tap to start a WhatsApp conversation"
                      value={form.whatsappEnabled} onChange={(v:boolean) => setForm(f=>({...f,whatsappEnabled:v}))} />
                    {form.whatsappEnabled && (
                      <div style={{ marginTop:14 }}>
                        <Input label="Your WhatsApp number" value={form.whatsappPhone}
                          onChange={(v:string) => setForm(f=>({...f,whatsappPhone:v}))}
                          placeholder="+2348012345678" prefix="📱" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SOCIAL ── */}
              {section === "social" && (
                <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
                  <h2 style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 6px" }}>Social Links</h2>
                  <p style={{ fontSize:13, color:t.muted, margin:"0 0 20px" }}>
                    These appear in your store footer and help customers find you on social media.
                  </p>
                  {[
                    { key:"instagram", label:"Instagram", placeholder:"@yourusername or full URL", icon:"📸" },
                    { key:"tiktok",   label:"TikTok",    placeholder:"@yourusername or full URL", icon:"🎬" },
                    { key:"facebook", label:"Facebook",  placeholder:"Page URL or username",       icon:"📘" },
                    { key:"twitter",  label:"X (Twitter)", placeholder:"@yourusername",            icon:"🐦" },
                  ].map(s => (
                    <Input key={s.key} label={s.label} prefix={s.icon}
                      value={(form as any)[s.key]}
                      onChange={(v:string) => setForm(f => ({ ...f, [s.key]:v }))}
                      placeholder={s.placeholder} />
                  ))}
                </div>
              )}

              {/* ── SEO ── */}
              {section === "seo" && (
                <div style={{ background:t.card, borderRadius:20, padding:24, border:`1px solid ${t.border}` }}>
                  <h2 style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 6px" }}>Search Engine Settings</h2>
                  <p style={{ fontSize:13, color:t.muted, margin:"0 0 20px" }}>
                    Control how your store appears in Google search results.
                  </p>
                  <Input label="Page title (shown in Google)" value={form.metaTitle}
                    onChange={(v:string) => setForm(f=>({...f,metaTitle:v}))}
                    placeholder={store?.name ? `${store.name} — Official Store` : "My Store — Shop Now"} />
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block", fontSize:12, fontWeight:700, color:t.text, marginBottom:6 }}>
                      Meta description
                    </label>
                    <p style={{ fontSize:11, color:t.muted, margin:"0 0 8px" }}>Shown under your store name in Google. Keep it under 160 characters.</p>
                    <textarea value={form.metaDescription} onChange={e => setForm(f=>({...f,metaDescription:e.target.value}))}
                      placeholder="e.g. Shop the latest fashion, beauty, and electronics. Fast delivery across Nigeria."
                      rows={3}
                      style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical" }}
                    />
                    <p style={{ fontSize:11, color: form.metaDescription.length > 160 ? V.red : t.muted, textAlign:"right", marginTop:4 }}>
                      {form.metaDescription.length}/160
                    </p>
                  </div>

                  {/* Preview */}
                  <div style={{ padding:16, borderRadius:14, background:t.faint, border:`1px solid ${t.border}` }}>
                    <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Google Preview</p>
                    <p style={{ fontSize:16, color:"#1a0dab", margin:"0 0 2px", fontWeight:400, fontFamily:"arial,sans-serif" }}>
                      {form.metaTitle || (store?.name ? `${store.name} — Official Store` : "Your Store")}
                    </p>
                    <p style={{ fontSize:13, color:"#006621", margin:"0 0 4px", fontFamily:"arial,sans-serif" }}>
                      {storeUrl}
                    </p>
                    <p style={{ fontSize:13, color:"#545454", margin:0, fontFamily:"arial,sans-serif", lineHeight:1.5 }}>
                      {form.metaDescription || "Add a meta description to tell Google what your store is about."}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Save button at bottom */}
          <div style={{ marginTop:16, display:"flex", justifyContent:"flex-end" }}>
            <button onClick={save} disabled={saveMut.isPending}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:12, border:"none", cursor:"pointer", background:V.v400, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit" }}>
              {saveMut.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){ .cust-grid{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
}
