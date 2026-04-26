"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { useCreditsStore } from "../../../store/credits.store";
import { Video, Film, Sparkles, Download, Loader2, Zap, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };
const TM = {
  dark:  { card:"#181230", border:"rgba(255,255,255,0.06)", text:"#fff", muted:"rgba(255,255,255,0.38)", faint:"rgba(255,255,255,0.04)" },
  light: { card:"#fff",    border:"rgba(15,5,32,0.07)",    text:"#0D0918", muted:"rgba(13,9,24,0.45)", faint:"rgba(15,5,32,0.03)" },
};

const TEMPLATES = [
  { id:"product_showcase", label:"Product Showcase", emoji:"📦", desc:"10-sec product hero",    credits:20 },
  { id:"flash_sale",       label:"Flash Sale",       emoji:"⚡", desc:"Countdown + urgency",    credits:20 },
  { id:"brand_story",      label:"Brand Story",      emoji:"🌟", desc:"30-sec introduction",    credits:50 },
  { id:"new_arrival",      label:"New Arrival",      emoji:"🔥", desc:"Hype product launch",    credits:20 },
  { id:"testimonial",      label:"Review Card",      emoji:"⭐", desc:"Customer review anim",   credits:20 },
  { id:"tiktok_script",    label:"TikTok Script",    emoji:"📱", desc:"KIRO writes the script", credits:3  },
];

const MODES = [
  { id:"fast",    label:"Fast",    time:"15s", credits:20  },
  { id:"hd",      label:"HD",      time:"45s", credits:50  },
  { id:"premium", label:"Premium", time:"2m",  credits:100 },
];

export default function ContentStudioPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? TM.dark : TM.light;
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const { balance, deduct } = useCreditsStore();
  const [template, setTemplate]     = useState("product_showcase");
  const [mode, setMode]             = useState("fast");
  const [productName, setProductName] = useState("");
  const [hook, setHook]             = useState("");
  const [result, setResult]         = useState<{ url:string; type:"video"|"script" } | null>(null);

  const isTiktok  = template === "tiktok_script";
  const credits   = isTiktok ? 3 : MODES.find(m => m.id === mode)!.credits;
  const canAfford = balance >= credits;

  const genMut = useMutation({
    mutationFn: async () => {
      if (!canAfford) throw new Error("credits");
      deduct(credits);
      if (isTiktok) {
        const prompt = `Write a viral TikTok script for: ${productName}. Hook: ${hook || "surprise the viewer"}. 30-60 seconds. Nigerian market.`;
        const res = await api.post("/kai/smart-chat", { message: prompt, storeId });
        return { url: res.data.data?.reply || res.data.reply || "", type: "script" as const };
      }
      const res = await api.post("/super/video/generate", { template, mode, productName, hook, storeId });
      return { url: res.data.data?.url || res.data.url || "", type: "video" as const };
    },
    onSuccess: (r) => { setResult(r); toast.success(isTiktok ? "Script written!" : "Video generated!"); },
    onError:   (e: any) => {
      if (e.message === "credits") { toast.error("Not enough credits"); return; }
      if (isTiktok) toast.error("Backend offline");
      else toast("Add KLING_API_KEY to Render to enable video generation", { icon:"⚙️", duration:6000 });
    },
  });

  const inp = { width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:t.faint, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit" } as const;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Content Studio</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(107,53,232,0.12)",color:V.v300,border:"1px solid rgba(107,53,232,0.2)"}}>Kling AI</span>
          </div>
          <p className="text-xs sm:text-sm" style={{color:t.muted}}>Generate product videos and TikTok scripts with AI</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0" style={{background:"rgba(107,53,232,0.08)",border:"1px solid rgba(107,53,232,0.2)"}}>
          <Zap size={12} color={V.v400}/><span className="text-xs font-bold" style={{color:V.v300}}>{balance.toLocaleString()} credits</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:t.muted}}>Content Type</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map(tpl => (
                <button key={tpl.id} onClick={() => setTemplate(tpl.id)}
                  className="flex flex-col items-start gap-1.5 p-3 rounded-xl text-left"
                  style={{background:template===tpl.id?"rgba(107,53,232,0.12)":t.faint,border:`1px solid ${template===tpl.id?"rgba(107,53,232,0.3)":t.border}`,cursor:"pointer"}}>
                  <span className="text-xl">{tpl.emoji}</span>
                  <p className="text-xs font-bold" style={{color:template===tpl.id?V.v300:t.text}}>{tpl.label}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(107,53,232,0.1)",color:V.v400}}>{tpl.credits} cr</span>
                </button>
              ))}
            </div>
          </div>

          {!isTiktok && (
            <div className="p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:t.muted}}>Quality</p>
              <div className="grid grid-cols-3 gap-2">
                {MODES.map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)}
                    className="p-3 rounded-xl text-left"
                    style={{background:mode===m.id?"rgba(107,53,232,0.12)":t.faint,border:`1px solid ${mode===m.id?"rgba(107,53,232,0.3)":t.border}`,cursor:"pointer"}}>
                    <p className="text-xs font-black mb-1" style={{color:mode===m.id?V.v300:t.text}}>{m.label}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{color:t.muted}}>{m.time}</span>
                      <span className="text-[10px] font-bold" style={{color:V.v400}}>{m.credits} cr</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl space-y-3" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{color:t.muted}}>Product Details</p>
            <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="Product name (e.g. Brazilian Hair Bundle)" style={inp}/>
            <input value={hook} onChange={e => setHook(e.target.value)} placeholder="Hook / angle (e.g. This wig survived Lagos rain)" style={inp}/>
          </div>

          {!canAfford && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)"}}>
              <AlertTriangle size={14} color="#EF4444"/>
              <p className="text-xs flex-1" style={{color:"#EF4444"}}>Need {credits} credits. You have {balance}.</p>
              <Link href="/dashboard/billing" className="text-xs font-bold" style={{color:"#EF4444"}}>Top up</Link>
            </div>
          )}

          <button onClick={() => genMut.mutate()} disabled={!productName||genMut.isPending||!canAfford}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
            style={{background:productName&&canAfford?`linear-gradient(135deg,${V.v500},#3D1C8A)`:t.faint}}>
            {genMut.isPending ? <><Loader2 size={15} className="animate-spin"/>Generating...</>
              : isTiktok ? <><Sparkles size={15}/>Write Script (3 credits)</>
              : <><Film size={15}/>Generate Video ({credits} credits)</>}
          </button>
        </div>

        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.border}`,minHeight:360}}>
          <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:`1px solid ${t.border}`}}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{color:t.muted}}>Preview</p>
            {result?.type === "video" && result.url && (
              <a href={result.url} download target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"rgba(107,53,232,0.12)",color:V.v300}}>
                <Download size={11}/>Download
              </a>
            )}
          </div>
          <div className="flex items-center justify-center p-6" style={{minHeight:300}}>
            <AnimatePresence mode="wait">
              {genMut.isPending && (
                <motion.div key="loading" className="text-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:"linear"}}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:`linear-gradient(135deg,${V.v500},#3D1C8A)`}}>
                    {isTiktok ? <Sparkles size={28} color="white"/> : <Film size={28} color="white"/>}
                  </motion.div>
                  <p className="font-bold text-sm mb-1" style={{color:t.text}}>{isTiktok ? "Writing script..." : "Rendering video..."}</p>
                  <p className="text-xs" style={{color:t.muted}}>This takes {isTiktok ? "5-10" : "30-120"} seconds</p>
                </motion.div>
              )}
              {!genMut.isPending && result && (
                <motion.div key="result" className="w-full" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}>
                  {result.type === "video" && result.url
                    ? <video src={result.url} controls className="w-full rounded-xl" style={{maxHeight:280,background:"#000"}}/>
                    : <div className="p-4 rounded-xl text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto" style={{background:t.faint,border:`1px solid ${t.border}`,color:t.text,maxHeight:320}}>{result.url}</div>
                  }
                </motion.div>
              )}
              {!genMut.isPending && !result && (
                <motion.div key="empty" className="text-center" initial={{opacity:0}} animate={{opacity:1}}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:t.faint}}>
                    <Video size={28} style={{color:t.muted}}/>
                  </div>
                  <p className="text-sm font-medium mb-2" style={{color:t.muted}}>Your content appears here</p>
                  <p className="text-xs" style={{color:t.muted,opacity:0.6}}>Pick a template, fill in your product, and click generate.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
