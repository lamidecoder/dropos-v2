"use client";
// Path: frontend/src/app/dashboard/domains/page.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Globe, Check, X, ExternalLink, Copy, AlertCircle, Search, Loader2, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

const ROOT_DOMAIN  = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";
const VERCEL_IP    = "76.76.21.21";
const VERCEL_CNAME = "cname.vercel-dns.com";
const V = { v500:"#6B35E8", v400:"#8B5CF6" };

export default function DomainsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const tk = {
    card:   isDark ? "#16122A" : "#fff",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint:  isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
    green:  "#10B981", amber: "#F59E0B", red: "#EF4444",
  };

  const storeId   = user?.stores?.[0]?.id;
  const storeSlug = user?.stores?.[0]?.slug;
  const freeSubdomain = `${storeSlug}.${ROOT_DOMAIN}`;

  const [customDomain, setCustomDomain]   = useState("");
  const [domainSearch, setDomainSearch]   = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching,    setSearching]      = useState(false);

  const { data: store } = useQuery({
    queryKey: ["store-domains", storeId],
    queryFn:  () => api.get(`/stores/${storeId}`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const addDomainMut = useMutation({
    mutationFn: (domain: string) => api.post(`/stores/${storeId}/custom-domain`, { domain }),
    onSuccess: () => {
      toast.success("Custom domain added! Configure your DNS records below.");
      qc.invalidateQueries({ queryKey: ["store-domains", storeId] });
      setCustomDomain("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to add domain"),
  });

  const removeDomainMut = useMutation({
    mutationFn: (domain: string) => api.delete(`/stores/${storeId}/custom-domain`, { data: { domain } }),
    onSuccess: () => {
      toast.success("Domain removed");
      qc.invalidateQueries({ queryKey: ["store-domains", storeId] });
    },
    onError: () => toast.error("Failed to remove domain"),
  });

  const verifyMut = useMutation({
    mutationFn: (domain: string) => api.post(`/stores/${storeId}/custom-domain/verify`, { domain }),
    onSuccess: (res) => {
      if (res.data.data?.verified) toast.success("Domain verified! ✅");
      else toast.error("DNS not propagated yet — try again in a few minutes.");
      qc.invalidateQueries({ queryKey: ["store-domains", storeId] });
    },
    onError: () => toast.error("Verification failed"),
  });

  async function searchDomains() {
    if (!domainSearch.trim()) return;
    setSearching(true);
    // Whogohost / Namecheap check — we show suggestions
    const base = domainSearch.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const tlds  = [".com", ".com.ng", ".ng", ".store", ".shop", ".co"];
    // Simulate check (in production, hit a domain availability API)
    await new Promise(r => setTimeout(r, 800));
    setSearchResults(tlds.map((tld, i) => ({
      domain:     `${base}${tld}`,
      available:  Math.random() > 0.3,
      price:      tld === ".com" ? "₦8,500/yr" : tld === ".com.ng" ? "₦12,000/yr" : tld === ".ng" ? "₦25,000/yr" : "₦6,500/yr",
      registrar:  "https://whogohost.com",
    })));
    setSearching(false);
  }

  const customDomains: string[] = store?.customDomains || (store?.customDomain ? [store.customDomain] : []);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: tk.text, margin: "0 0 4px" }}>Domains</h1>
        <p style={{ fontSize: 13, color: tk.muted, margin: 0 }}>Manage your store's web address.</p>
      </motion.div>

      {/* Free subdomain */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ borderRadius: 18, background: tk.card, border: `1px solid ${tk.border}`, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: tk.green }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: tk.green }}>Active — Free Subdomain</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: tk.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              {freeSubdomain}
            </p>
            <p style={{ fontSize: 12, color: tk.muted, margin: 0 }}>
              Included with every DropOS store. No setup required.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => copy(freeSubdomain)}
              style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${tk.border}`, background: "transparent", color: tk.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              <Copy size={12}/> Copy
            </button>
            <a href={`https://${freeSubdomain}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${tk.border}`, background: `${V.v400}10`, color: V.v400, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontWeight: 600 }}>
              <ExternalLink size={12}/> Visit
            </a>
          </div>
        </div>
      </motion.div>

      {/* Add custom domain */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ borderRadius: 18, background: tk.card, border: `1px solid ${tk.border}`, padding: "20px 24px", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: tk.text, margin: "0 0 4px" }}>Connect a Custom Domain</h3>
        <p style={{ fontSize: 13, color: tk.muted, margin: "0 0 16px" }}>Already own a domain? Connect it to your store.</p>

        <div style={{ display: "flex", gap: 10 }}>
          <input value={customDomain} onChange={e => setCustomDomain(e.target.value.toLowerCase())}
            placeholder="e.g. mymshop.com"
            onKeyDown={e => e.key === "Enter" && customDomain && addDomainMut.mutate(customDomain)}
            style={{ flex: 1, padding: "11px 14px", borderRadius: 11, border: `1px solid ${tk.border}`, background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", color: tk.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}/>
          <button onClick={() => customDomain && addDomainMut.mutate(customDomain)}
            disabled={addDomainMut.isPending || !customDomain}
            style={{ padding: "11px 20px", borderRadius: 11, background: `linear-gradient(135deg,${V.v500},${V.v400})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: addDomainMut.isPending||!customDomain ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: !customDomain ? 0.5 : 1 }}>
            {addDomainMut.isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }}/> : <Globe size={13}/>}
            Connect
          </button>
        </div>

        {/* Existing custom domains */}
        {customDomains.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {customDomains.map((domain: string) => {
              const isVerified = store?.verifiedDomains?.includes(domain);
              return (
                <div key={domain} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 11, background: tk.faint, border: `1px solid ${tk.border}`, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {isVerified
                      ? <CheckCircle size={16} color={tk.green}/>
                      : <Clock size={16} color={tk.amber}/>
                    }
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: tk.text, margin: 0 }}>{domain}</p>
                      <p style={{ fontSize: 11, color: isVerified ? tk.green : tk.amber, margin: 0 }}>
                        {isVerified ? "Active & verified" : "Pending DNS verification"}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!isVerified && (
                      <button onClick={() => verifyMut.mutate(domain)}
                        disabled={verifyMut.isPending}
                        style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${tk.amber}40`, background: `${tk.amber}10`, color: tk.amber, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Verify DNS
                      </button>
                    )}
                    <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${tk.border}`, background: "transparent", color: tk.muted, fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                      <ExternalLink size={11}/>
                    </a>
                    <button onClick={() => removeDomainMut.mutate(domain)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid rgba(239,68,68,0.2)`, background: "rgba(239,68,68,0.06)", color: tk.red, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      <X size={11}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* DNS instructions */}
      {customDomains.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ borderRadius: 18, background: isDark ? "#120820" : "#F5F3FF", border: `1px solid rgba(107,53,232,0.15)`, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <AlertCircle size={16} color={V.v400} style={{ flexShrink: 0, marginTop: 1 }}/>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: tk.text, margin: "0 0 4px" }}>Configure your DNS records</p>
              <p style={{ fontSize: 13, color: tk.muted, margin: 0 }}>Add these records at your domain registrar (Namecheap, GoDaddy, Whogohost, etc.)</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { type: "A", name: "@", value: VERCEL_IP, purpose: "Root domain (yourdomain.com)" },
              { type: "CNAME", name: "www", value: VERCEL_CNAME, purpose: "WWW version" },
            ].map(rec => (
              <div key={rec.type} style={{ borderRadius: 10, border: `1px solid ${tk.border}`, background: tk.card, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "60px 80px 1fr auto", gap: 0, fontSize: 12 }}>
                  {[
                    { label: "TYPE",    val: rec.type  },
                    { label: "NAME",    val: rec.name  },
                    { label: "VALUE",   val: rec.value },
                    { label: "",        val: "copy"    },
                  ].map((cell, ci) => (
                    <div key={ci} style={{ padding: "12px 14px", borderRight: ci < 3 ? `1px solid ${tk.border}` : "none" }}>
                      {ci === 0 && <p style={{ fontSize: 10, color: tk.muted, margin: "0 0 3px", fontWeight: 700, textTransform: "uppercase" }}>Type</p>}
                      {ci === 1 && <p style={{ fontSize: 10, color: tk.muted, margin: "0 0 3px", fontWeight: 700, textTransform: "uppercase" }}>Name</p>}
                      {ci === 2 && <p style={{ fontSize: 10, color: tk.muted, margin: "0 0 3px", fontWeight: 700, textTransform: "uppercase" }}>Value</p>}
                      {ci === 3 && <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                        <button onClick={() => copy(rec.value)} style={{ background: "none", border: "none", cursor: "pointer", color: V.v400, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>
                          <Copy size={11}/> Copy
                        </button>
                      </div>}
                      {ci < 3 && <p style={{ fontSize: 12, fontWeight: ci === 2 ? 500 : 700, color: tk.text, margin: 0, fontFamily: ci === 2 ? "monospace" : "inherit", wordBreak: "break-all" }}>{cell.val}</p>}
                    </div>
                  ))}
                </div>
                <div style={{ padding: "6px 14px 8px", borderTop: `1px solid ${tk.border}`, background: tk.faint }}>
                  <p style={{ fontSize: 11, color: tk.muted, margin: 0 }}>{rec.purpose} · DNS changes can take up to 48 hours</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Domain search / purchase */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ borderRadius: 18, background: tk.card, border: `1px solid ${tk.border}`, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: tk.text, margin: "0 0 4px" }}>Find a Domain</h3>
        <p style={{ fontSize: 13, color: tk.muted, margin: "0 0 16px" }}>Search for available domains and purchase through our partner registrars.</p>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 11, border: `1px solid ${tk.border}`, background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb" }}>
            <Search size={14} color={tk.muted}/>
            <input value={domainSearch} onChange={e => setDomainSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchDomains()}
              placeholder="Search for a domain name..." 
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: tk.text, fontFamily: "inherit" }}/>
          </div>
          <button onClick={searchDomains} disabled={searching || !domainSearch}
            style={{ padding: "11px 20px", borderRadius: 11, background: `linear-gradient(135deg,${V.v500},${V.v400})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: searching||!domainSearch ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: !domainSearch ? 0.5 : 1 }}>
            {searching ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }}/> : <Search size={13}/>}
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {searchResults.map(r => (
              <div key={r.domain} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 11, border: `1px solid ${r.available ? tk.green+"30" : tk.border}`, background: r.available ? `${tk.green}06` : tk.faint }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {r.available
                    ? <Check size={15} color={tk.green}/>
                    : <X size={15} color={tk.muted}/>
                  }
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: r.available ? tk.text : tk.muted, margin: 0 }}>{r.domain}</p>
                    <p style={{ fontSize: 11, color: r.available ? tk.green : tk.muted, margin: 0 }}>
                      {r.available ? "Available" : "Taken"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {r.available && <span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{r.price}</span>}
                  {r.available && (
                    <a href={`${r.registrar}/domain-registration?domain=${r.domain}`} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "7px 16px", borderRadius: 8, background: `linear-gradient(135deg,${V.v500},${V.v400})`, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                      Buy →
                    </a>
                  )}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: tk.muted, textAlign: "center", marginTop: 8 }}>
              Domains purchased through <strong>Whogohost</strong> — Nigeria's leading registrar.
              After purchase, add it above to connect to your store.
            </p>
          </div>
        )}
      </motion.div>

      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
