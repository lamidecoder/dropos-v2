"use client";
// Weekly Winning Products — /dashboard/winning-products
import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

const P = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA" };

type Tab = "winners" | "fb" | "tiktok" | "saturation";

export default function WinningProductsPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id || "";

  const [loading,   setLoading]   = useState(false);
  const [niche,     setNiche]     = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("winners");
  const [query,     setQuery]     = useState("");
  const [result,    setResult]    = useState("");
  const [satData,   setSatData]   = useState<any>(null);

  const spinner = (
    <motion.div animate={{ rotate:360 }} transition={{ duration:1.2, repeat:Infinity, ease:"linear" }}
      style={{ width:32, height:32, border:"3px solid rgba(107,53,232,0.2)", borderTopColor:P.v400, borderRadius:"50%", margin:"0 auto 12px" }}/>
  );

  const fetchWinners = async () => {
    setLoading(true); setResult("");
    try {
      const r = await api.get(`/kai/trending?storeId=${storeId}${niche?`&niche=${niche}`:""}`);
      setResult(r.data?.data?.trending || "No results returned.");
    } catch { toast.error("Search failed"); }
    finally { setLoading(false); }
  };

  const fetchAds = async (type: "fb" | "tiktok") => {
    if (!query.trim()) { toast.error("Enter a product name"); return; }
    setLoading(true); setResult("");
    try {
      const endpoint = type === "fb" ? "/kai/fb-ads" : "/kai/tiktok-spy";
      const r = await api.post(endpoint, { product: query.trim(), storeId });
      setResult(r.data?.data?.research || "No results.");
    } catch { toast.error("Search failed"); }
    finally { setLoading(false); }
  };

  const fetchSaturation = async () => {
    if (!query.trim()) { toast.error("Enter a product name"); return; }
    setLoading(true); setSatData(null);
    try {
      const r = await api.post("/kai/saturation", { product: query.trim(), storeId });
      setSatData(r.data?.data);
    } catch { toast.error("Check failed"); }
    finally { setLoading(false); }
  };

  const verdictColor = (v: string) =>
    v === "green" ? "#10b981" : v === "yellow" ? "#f59e0b" : "#ef4444";

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id:"winners",    icon:"🔥", label:"Trending Now" },
    { id:"fb",         icon:"📘", label:"Facebook Ads" },
    { id:"tiktok",     icon:"🎵", label:"TikTok Spy" },
    { id:"saturation", icon:"📊", label:"Saturation" },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 20px", fontFamily:"'Inter',-apple-system,sans-serif" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#F0ECFF", margin:"0 0 4px", letterSpacing:"-0.5px" }}>
            Product Intelligence
          </h1>
          <p style={{ fontSize:13, color:"rgba(200,190,255,0.5)", margin:0 }}>
            Trending products, ad spy, market saturation — powered by live web search.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto" }}>
          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(""); setSatData(null); }}
              style={{ padding:"8px 16px", borderRadius:12, border:`1px solid ${activeTab===tab.id?P.v400:"rgba(107,53,232,0.2)"}`, background:activeTab===tab.id?"rgba(107,53,232,0.15)":"rgba(107,53,232,0.05)", color:activeTab===tab.id?P.v300:"rgba(200,190,255,0.5)", fontSize:13, fontWeight:activeTab===tab.id?700:500, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6, flexShrink:0, transition:"all 0.15s" }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Trending */}
        {activeTab === "winners" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:16 }}>
              <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Optional niche (beauty, electronics, baby...)"
                style={{ flex:1, padding:"10px 14px", borderRadius:12, border:"1px solid rgba(107,53,232,0.2)", background:"rgba(107,53,232,0.06)", color:"#F0ECFF", fontSize:13, outline:"none", fontFamily:"inherit" }}/>
              <button onClick={fetchWinners} disabled={loading}
                style={{ padding:"10px 20px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${P.v500},#4C1D95)`, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0, opacity:loading?0.7:1 }}>
                {loading?"Searching...":"Find Winners"}
              </button>
            </div>
            {!result && !loading && <EmptyMsg icon="🔥" title="What's selling right now?" sub="KIRO searches TikTok, Jumia, and social media for today's trending products in your market." />}
            {loading && <LoadingMsg text="Searching the web for trending products..." spin={spinner}/>}
            {result && <ResultBox text={result}/>}
          </div>
        )}

        {/* Tab: FB Ads */}
        {activeTab === "fb" && (
          <div>
            <SearchBar value={query} onChange={setQuery} placeholder={`Product name (e.g. "hair extension")`}
              onSearch={() => fetchAds("fb")} loading={loading} btnLabel="Search Ads"/>
            {!result && !loading && <EmptyMsg icon="📘" title="See what ads are running" sub="Find what competitors are advertising right now and steal the best angles."/>}
            {loading && <LoadingMsg text="Scanning Facebook Ad Library..." spin={spinner}/>}
            {result && <ResultBox text={result}/>}
          </div>
        )}

        {/* Tab: TikTok */}
        {activeTab === "tiktok" && (
          <div>
            <SearchBar value={query} onChange={setQuery} placeholder={`Product name (e.g. "wireless earbuds")`}
              onSearch={() => fetchAds("tiktok")} loading={loading} btnLabel="Search TikTok"/>
            {!result && !loading && <EmptyMsg icon="🎵" title="Find viral TikTok hooks" sub="Find what content is going viral and get a winning script hook for your product."/>}
            {loading && <LoadingMsg text="Scanning TikTok trends..." spin={spinner}/>}
            {result && <ResultBox text={result}/>}
          </div>
        )}

        {/* Tab: Saturation */}
        {activeTab === "saturation" && (
          <div>
            <SearchBar value={query} onChange={setQuery} placeholder={`Product to check (e.g. "magnetic lashes Nigeria")`}
              onSearch={fetchSaturation} loading={loading} btnLabel="Check Market"/>
            {!satData && !loading && <EmptyMsg icon="📊" title="Is this market too crowded?" sub="KIRO counts sellers, ad spend, and competition to give you a saturation score 1-10."/>}
            {loading && <LoadingMsg text="Analysing market competition..." spin={spinner}/>}
            {satData && (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
                <div style={{ padding:24, borderRadius:16, background:`rgba(${satData.verdict==="green"?"16,185,129":satData.verdict==="yellow"?"245,158,11":"239,68,68"},0.08)`, border:`1px solid rgba(${satData.verdict==="green"?"16,185,129":satData.verdict==="yellow"?"245,158,11":"239,68,68"},0.25)`, marginBottom:12, textAlign:"center" }}>
                  <div style={{ fontSize:52, fontWeight:900, color:verdictColor(satData.verdict), letterSpacing:"-2px", marginBottom:4 }}>{satData.score}/10</div>
                  <div style={{ fontSize:14, fontWeight:700, color:verdictColor(satData.verdict) }}>{satData.label}</div>
                </div>
                {satData.reasons?.length > 0 && (
                  <div style={{ padding:"16px 20px", borderRadius:14, background:"rgba(107,53,232,0.06)", border:"1px solid rgba(107,53,232,0.15)", marginBottom:12 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:P.v300, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.08em" }}>What we found</p>
                    {satData.reasons.map((r: string, i: number) => (
                      <p key={i} style={{ fontSize:13, color:"rgba(200,190,255,0.75)", margin:"0 0 8px", lineHeight:1.6 }}>{i+1}. {r}</p>
                    ))}
                  </div>
                )}
                {satData.opportunity && (
                  <div style={{ padding:"14px 20px", borderRadius:14, background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.2)" }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"#10b981", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.08em" }}>The gap</p>
                    <p style={{ fontSize:13, color:"rgba(200,220,200,0.8)", margin:0, lineHeight:1.6 }}>{satData.opportunity}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function SearchBar({ value, onChange, placeholder, onSearch, loading, btnLabel }: any) {
  const P2 = { v500:"#6B35E8" };
  return (
    <div style={{ display:"flex", gap:10, marginBottom:16 }}>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onKeyDown={e => e.key==="Enter" && onSearch()}
        style={{ flex:1, padding:"10px 14px", borderRadius:12, border:"1px solid rgba(107,53,232,0.2)", background:"rgba(107,53,232,0.06)", color:"#F0ECFF", fontSize:13, outline:"none", fontFamily:"inherit" }}/>
      <button onClick={onSearch} disabled={loading||!value.trim()}
        style={{ padding:"10px 20px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${P2.v500},#4C1D95)`, color:"#fff", fontSize:13, fontWeight:700, cursor:loading||!value.trim()?"not-allowed":"pointer", fontFamily:"inherit", flexShrink:0, opacity:loading||!value.trim()?0.5:1 }}>
        {loading?"Searching...":btnLabel}
      </button>
    </div>
  );
}

function EmptyMsg({ icon, title, sub }: any) {
  return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <p style={{ fontSize:40, marginBottom:12, margin:"0 0 12px" }}>{icon}</p>
      <p style={{ fontSize:14, fontWeight:700, color:"#F0ECFF", marginBottom:6 }}>{title}</p>
      <p style={{ fontSize:13, color:"rgba(200,190,255,0.5)", maxWidth:360, margin:"0 auto" }}>{sub}</p>
    </div>
  );
}

function LoadingMsg({ text, spin }: any) {
  return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      {spin}
      <p style={{ fontSize:13, color:"rgba(200,190,255,0.5)" }}>{text}</p>
    </div>
  );
}

function ResultBox({ text }: { text: string }) {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
      style={{ padding:20, borderRadius:16, background:"rgba(107,53,232,0.06)", border:"1px solid rgba(107,53,232,0.2)", whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.85, color:"rgba(200,190,255,0.85)" }}>
      {text}
    </motion.div>
  );
}
