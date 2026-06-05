"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import { CheckCircle, AlertCircle, RefreshCw, Building2, ChevronDown } from "lucide-react";

interface PaymentsSectionProps {
  t: any;
  storeId?: string;
}

export function PaymentsSection({ t, storeId }: PaymentsSectionProps) {
  const [bankCode,       setBankCode]       = useState("");
  const [bankName,       setBankName]       = useState("");
  const [accountNumber,  setAccountNumber]  = useState("");
  const [verifiedName,   setVerifiedName]   = useState("");
  const [isVerifying,    setIsVerifying]    = useState(false);
  const [verifyError,    setVerifyError]    = useState("");
  const [whatsapp,       setWhatsapp]       = useState("");
  const [whatsappSaved,  setWhatsappSaved]  = useState(false);

  const inp = {
    width:"100%", padding:"11px 14px", borderRadius:11,
    border:`1px solid ${t.border}`,
    background:"rgba(255,255,255,0.05)",
    color:t.text, fontSize:13, fontFamily:"inherit", outline:"none",
  };

  // Load banks
  const { data: banks = [] } = useQuery<any[]>({
    queryKey: ["ng-banks"],
    queryFn: () => api.get("/banks").then(r => r.data.data),
    staleTime: Infinity,
  });

  // Load current bank info
  const { data: bankInfo } = useQuery<any>({
    queryKey: ["bank-info", storeId],
    queryFn: () => api.get(`/banks/${storeId}`).then(r => r.data.data),
    enabled: !!storeId,
  });

  // Verify account name automatically when 10 digits entered
  useEffect(() => {
    if (accountNumber.length === 10 && bankCode) {
      setVerifyError("");
      setVerifiedName("");
      setIsVerifying(true);
      api.post("/banks/verify", { accountNumber, bankCode })
        .then(r => { setVerifiedName(r.data.data.accountName); })
        .catch(e => { setVerifyError(e.response?.data?.error || "Could not verify account"); })
        .finally(() => setIsVerifying(false));
    } else {
      setVerifiedName("");
      setVerifyError("");
    }
  }, [accountNumber, bankCode]);

  const connectMut = useMutation({
    mutationFn: () => api.post(`/banks/${storeId}/connect`, {
      bankCode, bankName, accountNumber, accountName: verifiedName,
    }),
    onSuccess: (r) => {
      toast.success(r.data.message || "Bank account connected!");
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Connection failed"),
  });

  const saveWhatsappMut = useMutation({
    mutationFn: () => api.put(`/stores/${storeId}`, { whatsappPhone: whatsapp }),
    onSuccess: () => { setWhatsappSaved(true); setTimeout(() => setWhatsappSaved(false), 3000); },
    onError: () => toast.error("Save failed"),
  });

  const isConnected = bankInfo?.paystackConnected;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontSize:14, fontWeight:800, color:t.text, margin:"0 0 4px", letterSpacing:"-0.02em" }}>
          Payment Settings
        </h2>
        <p style={{ fontSize:12, color:t.muted, margin:0 }}>
          Connect your bank account to receive 98% of every sale directly. DropOS keeps 2% as platform fee.
        </p>
      </div>

      {/* How it works — simple visual */}
      <div style={{ padding:16, borderRadius:14, background:"rgba(16,185,129,0.04)", border:"1px solid rgba(16,185,129,0.12)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:0, justifyContent:"center", flexWrap:"wrap", gap:8 }}>
          {[
            { label:"Customer pays", sub:"e.g. ₦10,000", color:"rgba(255,255,255,0.7)", bg:"rgba(255,255,255,0.06)" },
            { label:"→", sub:"", color:"rgba(255,255,255,0.3)", bg:"transparent" },
            { label:"You get", sub:"₦9,800 (98%)", color:"#10B981", bg:"rgba(16,185,129,0.1)" },
            { label:"+", sub:"", color:"rgba(255,255,255,0.3)", bg:"transparent" },
            { label:"DropOS fee", sub:"₦200 (2%)", color:"#8B5CF6", bg:"rgba(107,53,232,0.1)" },
          ].map((item, i) => item.label === "→" || item.label === "+" ? (
            <span key={i} style={{ fontSize:16, color:item.color, fontWeight:700 }}>{item.label}</span>
          ) : (
            <div key={i} style={{ padding:"8px 14px", borderRadius:10, background:item.bg, textAlign:"center" }}>
              <p style={{ fontSize:12, fontWeight:700, color:item.color, margin:0 }}>{item.label}</p>
              {item.sub && <p style={{ fontSize:11, color:item.color, margin:0, opacity:0.8 }}>{item.sub}</p>}
            </div>
          ))}
        </div>
        <p style={{ fontSize:11, color:"rgba(16,185,129,0.7)", textAlign:"center", margin:"10px 0 0", fontWeight:600 }}>
          Money goes directly to your bank account. No Paystack account needed.
        </p>
      </div>

      {/* Current status */}
      {isConnected && bankInfo && (
        <div style={{ padding:14, borderRadius:12, background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)", display:"flex", alignItems:"center", gap:12 }}>
          <CheckCircle size={18} color="#10B981"/>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"#10B981", margin:0 }}>Bank account connected</p>
            <p style={{ fontSize:12, color:t.muted, margin:"2px 0 0" }}>
              {bankInfo.accountName} · {bankInfo.bankName} · {bankInfo.accountNumber}
            </p>
          </div>
          <button
            onClick={() => { setBankCode(""); setAccountNumber(""); setVerifiedName(""); }}
            style={{ marginLeft:"auto", fontSize:11, color:t.muted, background:"none", border:`1px solid ${t.border}`, borderRadius:8, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}>
            Update
          </button>
        </div>
      )}

      {/* Bank account form */}
      {!isConnected && (
        <div style={{ background:t.card, borderRadius:16, padding:20, border:`1px solid ${t.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <Building2 size={16} color="#8B5CF6"/>
            <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:0 }}>Connect your bank account</p>
          </div>

          {/* Bank selector */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Your bank</label>
            <div style={{ position:"relative" }}>
              <select value={bankCode}
                onChange={e => {
                  setBankCode(e.target.value);
                  setBankName(e.target.options[e.target.selectedIndex].text);
                }}
                style={{ ...inp, appearance:"none", paddingRight:36 }}>
                <option value="">Select your bank</option>
                {banks.map((b: any) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:t.muted, pointerEvents:"none" }}/>
            </div>
          </div>

          {/* Account number */}
          <div style={{ marginBottom:8 }}>
            <label style={{ fontSize:12, fontWeight:700, color:t.muted, display:"block", marginBottom:6 }}>Account number</label>
            <input
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit NUBAN"
              maxLength={10}
              style={inp}
            />
          </div>

          {/* Verification status */}
          {isVerifying && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:9, background:"rgba(107,53,232,0.06)", marginBottom:8 }}>
              <RefreshCw size={12} color="#8B5CF6" style={{ animation:"spin 0.7s linear infinite" }}/>
              <span style={{ fontSize:12, color:"#8B5CF6" }}>Verifying account…</span>
            </div>
          )}
          {verifiedName && !isVerifying && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:10, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", marginBottom:8 }}>
              <CheckCircle size={14} color="#10B981"/>
              <div>
                <p style={{ fontSize:12, color:t.muted, margin:0 }}>Account name</p>
                <p style={{ fontSize:14, fontWeight:800, color:"#10B981", margin:0, letterSpacing:"-0.01em" }}>{verifiedName}</p>
              </div>
            </div>
          )}
          {verifyError && !isVerifying && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:9, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", marginBottom:8 }}>
              <AlertCircle size={12} color="#EF4444"/>
              <span style={{ fontSize:12, color:"#EF4444" }}>{verifyError}</span>
            </div>
          )}

          <button
            onClick={() => connectMut.mutate()}
            disabled={!verifiedName || !bankCode || connectMut.isPending}
            style={{ width:"100%", padding:"12px 0", marginTop:8, borderRadius:12, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", opacity:(!verifiedName||!bankCode)?0.4:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 16px rgba(107,53,232,0.25)" }}>
            {connectMut.isPending
              ? <><RefreshCw size={14} style={{ animation:"spin 0.7s linear infinite" }}/> Connecting…</>
              : "Connect bank account"}
          </button>
        </div>
      )}

      {/* WhatsApp chat bubble */}
      <div style={{ background:t.card, borderRadius:16, padding:20, border:`1px solid ${t.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"rgba(37,211,102,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>WhatsApp Chat Button</p>
            <p style={{ fontSize:11, color:t.muted, margin:0 }}>Customers can message you directly from your store</p>
          </div>
        </div>
        <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
          placeholder="+2348012345678" style={inp}/>
        <p style={{ fontSize:11, color:t.muted, margin:"6px 0 12px" }}>Include country code (+234 for Nigeria)</p>
        <button onClick={() => saveWhatsappMut.mutate()}
          style={{ padding:"9px 18px", borderRadius:10, border:"none", cursor:"pointer", background:"rgba(37,211,102,0.15)", color:"#25D366", fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
          {whatsappSaved ? "✓ Saved" : "Save"}
        </button>
      </div>

      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
