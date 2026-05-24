"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { Info, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6" };
const AMBER = "#F59E0B";

const CURRENCIES = [
  { code:"USD", symbol:"$",    name:"US Dollar",          flag:"🇺🇸" },
  { code:"EUR", symbol:"€",    name:"Euro",               flag:"🇪🇺" },
  { code:"GBP", symbol:"£",    name:"British Pound",      flag:"🇬🇧" },
  { code:"NGN", symbol:"₦",    name:"Nigerian Naira",     flag:"🇳🇬" },
  { code:"KES", symbol:"KSh",  name:"Kenyan Shilling",    flag:"🇰🇪" },
  { code:"GHS", symbol:"GH₵",  name:"Ghanaian Cedi",      flag:"🇬🇭" },
  { code:"ZAR", symbol:"R",    name:"South African Rand", flag:"🇿🇦" },
  { code:"CAD", symbol:"CA$",  name:"Canadian Dollar",    flag:"🇨🇦" },
  { code:"AUD", symbol:"A$",   name:"Australian Dollar",  flag:"🇦🇺" },
  { code:"JPY", symbol:"¥",    name:"Japanese Yen",       flag:"🇯🇵" },
  { code:"INR", symbol:"₹",    name:"Indian Rupee",       flag:"🇮🇳" },
  { code:"BRL", symbol:"R$",   name:"Brazilian Real",     flag:"🇧🇷" },
  { code:"AED", symbol:"د.إ",  name:"UAE Dirham",         flag:"🇦🇪" },
  { code:"SGD", symbol:"S$",   name:"Singapore Dollar",   flag:"🇸🇬" },
  { code:"EGP", symbol:"£",    name:"Egyptian Pound",     flag:"🇪🇬" },
  { code:"MAD", symbol:"MAD",  name:"Moroccan Dirham",    flag:"🇲🇦" },
];

export default function CurrencyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const qc = useQueryClient();
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);

  const t = {
    card:   isDark ? "#181230" : "#fff",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(107,53,232,0.09)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.5)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
    infoBg: isDark ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.07)",
    infoText: isDark ? "#C4B5FD" : "#5B21B6",
    infoBorder: isDark ? "rgba(124,58,237,0.25)" : "rgba(107,53,232,0.2)",
  };

  const { data: store } = useQuery({
    queryKey: ["store", storeId],
    queryFn:  () => api.get(`/stores/${storeId}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  const { data: ratesData, isLoading: ratesLoading, refetch } = useQuery({
    queryKey: ["currency-rates"],
    queryFn:  () => api.get("/currency/rates").then(r => r.data.data),
    staleTime: 60 * 60 * 1000,
  });

  const [base,       setBase]       = useState("NGN");
  const [autoDetect, setAutoDetect] = useState(true);
  const [supported,  setSupported]  = useState<string[]>(["NGN","USD","EUR","GBP"]);

  useEffect(() => {
    if (store) {
      setBase(store.currency || "NGN");
      setAutoDetect(store.autoDetectCurrency ?? true);
      setSupported(
        Array.isArray(store.supportedCurrencies) && store.supportedCurrencies.length > 0
          ? store.supportedCurrencies
          : [store.currency || "NGN"]
      );
    }
  }, [store]);

  const saveMut = useMutation({
    mutationFn: () => api.put(`/stores/${storeId}`, { currency: base, autoDetectCurrency: autoDetect, supportedCurrencies: supported }),
    onSuccess: () => { toast.success("Currency settings saved"); qc.invalidateQueries({ queryKey: ["store"] }); },
    onError: () => toast.error("Save failed"),
  });

  const toggleSupported = (code: string) => {
    if (code === base) return;
    setSupported(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const rates = ratesData?.rates ?? {};

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing:"-0.04em", color: t.text, margin:0 }}>Multi-Currency</h1>
          <p style={{ fontSize: 13, color: t.muted, margin:"4px 0 0" }}>Let customers browse prices in their local currency</p>
        </div>
        <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
          style={{ padding:"10px 24px", borderRadius:12, background:`linear-gradient(135deg,${AMBER},#D97706)`, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity: saveMut.isPending ? 0.6 : 1 }}>
          {saveMut.isPending ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* Info banner */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"14px 16px", borderRadius:14, background: t.infoBg, border:`1px solid ${t.infoBorder}`, marginBottom:20 }}>
        <Info size={14} color={t.infoText} style={{ flexShrink:0, marginTop:2 }}/>
        <p style={{ fontSize:13, color: t.infoText, margin:0, lineHeight:1.6 }}>
          Prices are automatically converted using live exchange rates (updated hourly). Your store still charges customers in the <strong>base currency</strong> at checkout. The currency picker on your storefront lets visitors see indicative prices in their currency.
        </p>
      </div>

      {/* Base currency */}
      <div style={{ borderRadius:18, background: t.card, border:`1px solid ${t.border}`, padding:"20px 22px", marginBottom:16 }}>
        <h2 style={{ fontSize:15, fontWeight:800, color: t.text, margin:"0 0 4px" }}>Store Base Currency</h2>
        <p style={{ fontSize:13, color: t.muted, margin:"0 0 18px" }}>This is the currency your products are priced in and what customers pay at checkout.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))", gap:8 }}>
          {["USD","EUR","GBP","NGN","KES","GHS","ZAR","CAD","AUD","JPY"].map(code => {
            const meta = CURRENCIES.find(c => c.code === code);
            const active = base === code;
            return (
              <button key={code} onClick={() => { setBase(code); if (!supported.includes(code)) setSupported(p => [code,...p]); }}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"12px 8px", borderRadius:12, border:`2px solid ${active ? AMBER : t.border}`, background: active ? `${AMBER}12` : t.faint, cursor:"pointer", transition:"all 0.15s" }}>
                <span style={{ fontSize:20 }}>{meta?.flag ?? "🌐"}</span>
                <span style={{ fontSize:11, fontWeight:800, color: active ? V.v500 : t.text }}>{code}</span>
                <span style={{ fontSize:10, color: t.muted }}>{meta?.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-detect */}
      <div style={{ borderRadius:18, background: t.card, border:`1px solid ${t.border}`, padding:"18px 22px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:800, color: t.text, margin:"0 0 4px" }}>Auto-Detect Visitor Currency</h2>
            <p style={{ fontSize:13, color: t.muted, margin:0 }}>Automatically show prices in the visitor's local currency based on their IP location.</p>
          </div>
          <button onClick={() => setAutoDetect(v => !v)} style={{ background:"none", border:"none", cursor:"pointer", flexShrink:0, color: autoDetect ? AMBER : t.muted }}>
            {autoDetect ? <ToggleRight size={40}/> : <ToggleLeft size={40}/>}
          </button>
        </div>
      </div>

      {/* Supported currencies */}
      <div style={{ borderRadius:18, background: t.card, border:`1px solid ${t.border}`, padding:"20px 22px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:800, color: t.text, margin:"0 0 4px" }}>Supported Display Currencies</h2>
            <p style={{ fontSize:13, color: t.muted, margin:0 }}>{supported.length} selected · Appear in the currency picker on your storefront.</p>
          </div>
          <button onClick={() => refetch()} disabled={ratesLoading}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", color: t.muted, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            <RefreshCw size={12} style={{ animation: ratesLoading ? "spin 1s linear infinite" : "none" }}/> Refresh Rates
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
          {CURRENCIES.map(c => {
            const isBase  = c.code === base;
            const active  = supported.includes(c.code);
            const rate    = rates[c.code];
            return (
              <button key={c.code} onClick={() => toggleSupported(c.code)} disabled={isBase}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, border:`1.5px solid ${active ? V.v400 : t.border}`, background: active ? `${V.v400}0D` : t.faint, cursor: isBase ? "default" : "pointer", transition:"all 0.15s", textAlign:"left" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{c.flag}</span>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color: active ? V.v400 : t.text }}>{c.code}</div>
                  <div style={{ fontSize:10, color: t.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {rate ? `1 ${base} = ${(rate / (rates[base] ?? 1)).toFixed(2)} ${c.symbol}` : c.symbol}
                  </div>
                </div>
                {isBase && <span style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color: AMBER, background:`${AMBER}18`, borderRadius:4, padding:"2px 5px", flexShrink:0 }}>BASE</span>}
                {!isBase && active && <div style={{ marginLeft:"auto", width:14, height:14, borderRadius:"50%", background: V.v400, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg></div>}
              </button>
            );
          })}
        </div>
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
