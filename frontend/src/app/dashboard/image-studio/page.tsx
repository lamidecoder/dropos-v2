"use client";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { useCreditsStore, CREDIT_COSTS } from "../../../store/credits.store";
import { Upload, Wand2, Download, Copy, Loader2, X, Check, Zap, Image as ImageIcon, AlertTriangle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

// Before/after examples from Unsplash
const TOOL_EXAMPLES = {
  remove_bg:   {
    before: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
    after:  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&sat=-100",
    label:  "Clean white background"
  },
  lifestyle:   {
    before: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&h=200&fit=crop",
    after:  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    label:  "Product in real setting"
  },
  enhance:     {
    before: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop&blur=2",
    after:  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop",
    label:  "Sharp professional quality"
  },
  ad_creative: {
    before: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop",
    after:  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop&bri=30",
    label:  "Ready-to-post ad"
  },
};

const TOOLS = [
  { id:"remove_bg",   icon:"✂️", label:"Remove Background", desc:"Perfect white or transparent BG", credits:5  },
  { id:"lifestyle",   icon:"🌟", label:"Lifestyle Scene",   desc:"Product in a real-world setting",  credits:15 },
  { id:"enhance",     icon:"✨", label:"Enhance Photo",     desc:"Sharpen and improve lighting",      credits:5  },
  { id:"ad_creative", icon:"📣", label:"Ad Creative",       desc:"Social-ready ad with text",         credits:10 },
];

const BACKGROUNDS = [
  { id:"studio",   emoji:"⬜", label:"Studio"    },
  { id:"bedroom",  emoji:"🛏️", label:"Bedroom"  },
  { id:"kitchen",  emoji:"🍳", label:"Kitchen"   },
  { id:"outdoor",  emoji:"🌿", label:"Outdoor"   },
  { id:"luxury",   emoji:"✨", label:"Luxury"    },
  { id:"flat_lay", emoji:"📐", label:"Flat Lay"  },
];

export default function ImageStudioPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark ? "#0F0C1E" : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(107,53,232,0.1)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.04)",
  };
  const storeId  = useAuthStore(s => s.user?.stores?.[0]?.id);
  const { balance, deduct } = useCreditsStore();

  const [tool,        setTool]        = useState("remove_bg");
  const [imageUrl,    setImageUrl]    = useState("");
  const [bgStyle,     setBgStyle]     = useState("studio");
  const [productName, setProductName] = useState("");
  const [result,      setResult]      = useState<string|null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [showBefore,  setShowBefore]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedTool = TOOLS.find(t => t.id === tool)!;
  const canAfford    = balance >= selectedTool.credits;
  const example      = TOOL_EXAMPLES[tool as keyof typeof TOOL_EXAMPLES];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "dropos_products");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method:"POST", body:fd });
      const data = await res.json();
      if (data.secure_url) { setImageUrl(data.secure_url); setResult(null); }
      else toast.error("Upload failed");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const processMut = useMutation({
    mutationFn: async () => {
      if (!canAfford) throw new Error("credits");
      deduct(selectedTool.credits);
      const endpoint = tool === "remove_bg" ? "/super/images/remove-bg"
        : tool === "lifestyle" ? "/super/images/lifestyle"
        : tool === "enhance"   ? "/super/images/enhance"
        : "/super/images/ad-creative";
      const body = { imageUrl, storeId, backgroundStyle: bgStyle, productName };
      const r = await api.post(endpoint, body);
      return r.data.data?.url || r.data.url;
    },
    onSuccess: (url) => { setResult(url); toast.success("Image ready!"); },
    onError: (e:any) => {
      if (e.message === "credits") { toast.error("Not enough credits"); return; }
      toast("Add FAL_AI_KEY to Render to enable AI generation", { icon:"⚙️", duration:6000 });
    },
  });

  const inp = { width:"100%", padding:"11px 14px", borderRadius:12, border:`1px solid ${t.border}`, background:t.faint, color:t.text, fontSize:13, outline:"none", fontFamily:"inherit" } as const;

  return (
    <div style={{ maxWidth:1000, margin:"0 auto" }}>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.8px", color:t.text }}>Image Studio</h1>
            <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:99, background:"rgba(107,53,232,0.12)", color:V.v300, border:"1px solid rgba(107,53,232,0.2)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Fal.ai</span>
          </div>
          <p style={{ fontSize:13, color:t.muted }}>Professional product photos without a photographer</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:12, background:"rgba(107,53,232,0.08)", border:"1px solid rgba(107,53,232,0.18)" }}>
          <Zap size={13} color={V.v400}/><span style={{ fontSize:13, fontWeight:700, color:V.v300 }}>{balance.toLocaleString()} credits</span>
        </div>
      </motion.div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16, alignItems:"start" }}>

        {/* LEFT - Controls */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Tool picker with visual examples */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.06}}
            style={{ borderRadius:18, border:`1px solid ${t.border}`, background:t.card, overflow:"hidden" }}>
            <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${t.border}` }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted }}>Choose Tool</p>
            </div>
            <div style={{ padding:"8px" }}>
              {TOOLS.map(tl => {
                const isActive = tool === tl.id;
                return (
                  <button key={tl.id} onClick={() => { setTool(tl.id); setResult(null); }}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, border:`1px solid ${isActive?"rgba(107,53,232,0.3)":"transparent"}`, background:isActive?"rgba(107,53,232,0.1)":"transparent", cursor:"pointer", marginBottom:4, transition:"all 0.15s" }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{tl.icon}</span>
                    <div style={{ flex:1, textAlign:"left" }}>
                      <p style={{ fontSize:12, fontWeight:700, color:isActive?"#C4B5FD":t.text }}>{tl.label}</p>
                      <p style={{ fontSize:10, color:t.muted }}>{tl.desc}</p>
                    </div>
                    <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:99, background:"rgba(107,53,232,0.1)", color:V.v400 }}>{tl.credits}cr</span>
                    {isActive && <Check size={12} color={V.v400}/>}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Background picker for lifestyle */}
          {tool === "lifestyle" && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              style={{ borderRadius:18, border:`1px solid ${t.border}`, background:t.card, padding:16 }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted, marginBottom:12 }}>Background</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {BACKGROUNDS.map(bg => (
                  <button key={bg.id} onClick={() => setBgStyle(bg.id)}
                    style={{ padding:"10px 6px", borderRadius:10, border:`1px solid ${bgStyle===bg.id?"rgba(107,53,232,0.4)":t.border}`, background:bgStyle===bg.id?"rgba(107,53,232,0.12)":t.faint, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:18 }}>{bg.emoji}</span>
                    <span style={{ fontSize:9, fontWeight:600, color:bgStyle===bg.id?V.v300:t.muted }}>{bg.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Product name for ad creative */}
          {tool === "ad_creative" && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              style={{ borderRadius:18, border:`1px solid ${t.border}`, background:t.card, padding:16 }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted, marginBottom:10 }}>Ad Text</p>
              <input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="Product name for the ad" style={inp}/>
            </motion.div>
          )}

          {/* Generate button */}
          {!canAfford && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:12, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={13} color="#EF4444"/>
              <p style={{ fontSize:12, color:"#EF4444", flex:1 }}>Need {selectedTool.credits} credits</p>
              <Link href="/dashboard/billing" style={{ fontSize:12, fontWeight:700, color:"#EF4444" }}>Top up</Link>
            </div>
          )}
          <motion.button whileTap={{scale:0.97}} onClick={() => processMut.mutate()}
            disabled={!imageUrl || processMut.isPending || !canAfford}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px", borderRadius:14, border:"none", cursor:imageUrl&&canAfford?"pointer":"not-allowed", fontFamily:"inherit", fontSize:13, fontWeight:800, color:"#fff", background:imageUrl&&canAfford?"linear-gradient(135deg,#6B35E8,#3D1C8A)":"rgba(255,255,255,0.06)", opacity:(!imageUrl||!canAfford)&&!processMut.isPending?0.5:1, transition:"all 0.15s" }}>
            {processMut.isPending ? <><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> Processing...</> : <><Wand2 size={14}/> Generate ({selectedTool.credits} credits)</>}
          </motion.button>
        </div>

        {/* RIGHT - Upload + Result */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Upload area */}
          {!imageUrl ? (
            <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.08}}
              onClick={() => fileRef.current?.click()}
              style={{ borderRadius:18, border:`2px dashed ${t.border}`, background:t.faint, padding:32, display:"flex", flexDirection:"column", alignItems:"center", gap:12, cursor:"pointer", transition:"all 0.2s", minHeight:200 }}>
              {uploading
                ? <Loader2 size={32} style={{color:V.v400,animation:"spin 1s linear infinite"}}/>
                : <Upload size={32} style={{color:t.muted}}/>}
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:15, fontWeight:700, color:t.text, marginBottom:4 }}>{uploading?"Uploading...":"Upload your product photo"}</p>
                <p style={{ fontSize:12, color:t.muted }}>JPG or PNG, max 10MB</p>
              </div>
              {/* Example images grid */}
              {!uploading && (
                <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap", justifyContent:"center" }}>
                  {["photo-1523275335684-37898b6baf30","photo-1491553895911-0055eca6402d","photo-1584308666744-24d5c474f2ae"].map(id => (
                    <img key={id} src={`https://images.unsplash.com/${id}?w=60&h=60&fit=crop`} alt="example"
                      style={{ width:52, height:52, borderRadius:10, objectFit:"cover", opacity:0.5, border:`1px solid ${t.border}` }}
                      onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                  ))}
                  <div style={{ width:52, height:52, borderRadius:10, background:"rgba(107,53,232,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:V.v400, fontWeight:700 }}>+more</div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}
              style={{ borderRadius:18, border:`1px solid ${t.border}`, background:t.card, overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:`1px solid ${t.border}` }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted }}>Your Photo</p>
                <button onClick={() => { setImageUrl(""); setResult(null); }} style={{ width:28, height:28, borderRadius:"50%", border:"none", background:"rgba(239,68,68,0.1)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={13} color="#EF4444"/>
                </button>
              </div>
              <div style={{ padding:12 }}>
                <img src={imageUrl} alt="uploaded" style={{ width:"100%", maxHeight:200, objectFit:"contain", borderRadius:12, background:t.faint }}/>
              </div>
            </motion.div>
          )}

          {/* Result */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.14}}
            style={{ borderRadius:18, border:`1px solid ${t.border}`, background:t.card, overflow:"hidden", minHeight:240 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:`1px solid ${t.border}` }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.muted }}>Result</p>
              {result && (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", fontSize:11, fontWeight:600, color:copied?"#10B981":t.muted }}>
                    {copied?<Check size={10}/>:<Copy size={10}/>} {copied?"Copied":"Copy URL"}
                  </button>
                  <a href={result} download target="_blank"
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, background:"rgba(107,53,232,0.1)", color:V.v300, textDecoration:"none", fontSize:11, fontWeight:600 }}>
                    <Download size={10}/> Download
                  </a>
                </div>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:20, minHeight:200 }}>
              <AnimatePresence mode="wait">
                {processMut.isPending && (
                  <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{textAlign:"center"}}>
                    <motion.div animate={{rotate:360}} transition={{duration:1.5,repeat:Infinity,ease:"linear"}}
                      style={{width:52,height:52,borderRadius:16,background:"linear-gradient(135deg,#6B35E8,#3D1C8A)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                      <Wand2 size={24} color="white"/>
                    </motion.div>
                    <p style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:4}}>Processing your image...</p>
                    <p style={{fontSize:11,color:t.muted}}>15-30 seconds</p>
                  </motion.div>
                )}
                {!processMut.isPending && result && (
                  <motion.div key="result" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} style={{width:"100%"}}>
                    <img src={result} alt="generated" style={{width:"100%",maxHeight:300,objectFit:"contain",borderRadius:12,background:tool==="remove_bg"?"repeating-conic-gradient(rgba(255,255,255,0.05) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px":t.faint}}/>
                  </motion.div>
                )}
                {!processMut.isPending && !result && (
                  <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} style={{textAlign:"center"}}>
                    <div style={{fontSize:40,marginBottom:12}}>{selectedTool.icon}</div>
                    <p style={{fontSize:13,color:t.muted}}>{selectedTool.label}</p>
                    <p style={{fontSize:11,color:t.muted,opacity:0.6,marginTop:4}}>Upload a photo to begin</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Before/after examples */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            style={{borderRadius:18,border:`1px solid ${t.border}`,background:t.card,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 8px",borderBottom:`1px solid ${t.border}`}}>
              <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:t.muted}}>Example Results</p>
            </div>
            <div style={{padding:12,display:"flex",gap:10,alignItems:"center",justifyContent:"center"}}>
              <div style={{textAlign:"center"}}>
                <img src={example.before} alt="before" style={{width:90,height:90,objectFit:"cover",borderRadius:10,border:`1px solid ${t.border}`}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                <p style={{fontSize:9,color:t.muted,marginTop:4}}>Before</p>
              </div>
              <span style={{fontSize:18,color:V.v400}}>→</span>
              <div style={{textAlign:"center"}}>
                <img src={example.after} alt="after" style={{width:90,height:90,objectFit:"cover",borderRadius:10,border:`1px solid rgba(107,53,232,0.3)`}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                <p style={{fontSize:9,color:t.muted,marginTop:4}}>After</p>
              </div>
              <div style={{flex:1,paddingLeft:8}}>
                <p style={{fontSize:11,fontWeight:700,color:t.text,marginBottom:4}}>{selectedTool.label}</p>
                <p style={{fontSize:10,color:t.muted,lineHeight:1.5}}>{example.label}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleUpload}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
