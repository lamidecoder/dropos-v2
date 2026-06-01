"use client";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Upload, Download, Link2, FileText, Check, AlertCircle,
  Zap, Package, RefreshCw, ExternalLink, Star, TrendingUp,
  ChevronRight, X,
} from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

const SUPPORTED = [
  { name:"AliExpress", icon:"🛒", color:"#FF6600", hint:"aliexpress.com/item/..." },
  { name:"Temu",       icon:"🏷️", color:"#FF6B00", hint:"temu.com/..." },
  { name:"Amazon",     icon:"📦", color:"#FF9900", hint:"amazon.com/dp/..." },
  { name:"Jumia",      icon:"🛍️", color:"#F68B1E", hint:"jumia.com.ng/..." },
  { name:"Shein",      icon:"👗", color:"#000",    hint:"shein.com/..." },
  { name:"Any site",   icon:"🌐", color:"#6B35E8", hint:"Any product URL" },
];

type Tab = "url" | "csv" | "bulk";

export default function ImportPage() {
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

  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc      = useQueryClient();
  const [tab, setTab]   = useState<Tab>("url");
  const [url, setUrl]   = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [bulkUrls, setBulkUrls] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const importUrlMut = useMutation({
    mutationFn: () => api.post(`/products/${storeId}/import-url`, { url }),
    onSuccess: (res) => {
      const product = res.data?.data;
      setResult(product);
      setUrl("");
      qc.invalidateQueries({ queryKey:["products"] });
      toast.success("Product imported successfully!");
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message || e.message || "Import failed";
      if (msg.includes("offline") || msg.includes("fetch")) {
        toast.error("Connection issue — backend is waking up, try again in 30 seconds");
      } else {
        toast.error(msg);
      }
    },
  });

  const importCsvMut = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.post(`/products/${storeId}/import-csv`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (r) => {
      const count = r.data?.data?.count || r.data?.count || 0;
      toast.success(`${count} products imported!`);
      qc.invalidateQueries({ queryKey:["products"] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "CSV import failed"),
  });

  const bulkMut = useMutation({
    mutationFn: () => {
      const urls = bulkUrls.split("\n").map(u => u.trim()).filter(Boolean);
      return api.post(`/products/${storeId}/import-bulk`, { urls });
    },
    onSuccess: (r) => {
      const { created, failed } = r.data?.data || { created:0, failed:0 };
      toast.success(`${created} imported${failed ? `, ${failed} failed` : ""}`);
      setBulkUrls("");
      qc.invalidateQueries({ queryKey:["products"] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Bulk import failed"),
  });

  const handleFile = (f: File) => {
    if (!f) return;
    if (!f.name.endsWith(".csv")) { toast.error("Please upload a CSV file"); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("File too large — max 10MB"); return; }
    importCsvMut.mutate(f);
  };

  const urlCount = bulkUrls.split("\n").filter(u => u.trim()).length;

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:900, color:t.text, margin:"0 0 4px", letterSpacing:"-0.03em" }}>
          Import Products
        </h1>
        <p style={{ fontSize:13, color:t.muted }}>
          Add products from any source — URL, CSV, or bulk import
        </p>
      </motion.div>

      {/* Supported platforms */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {SUPPORTED.map(s => (
          <div key={s.name} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:99, background:t.faint, border:`1px solid ${t.border}`, fontSize:11, color:t.muted, fontWeight:600 }}>
            <span>{s.icon}</span>{s.name}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:20, background:t.faint, borderRadius:14, padding:4, border:`1px solid ${t.border}`, width:"fit-content" }}>
        {([ ["url","🔗 Product URL"], ["csv","📄 CSV Upload"], ["bulk","⚡ Bulk Import"] ] as [Tab,string][]).map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setResult(null); }}
            style={{ padding:"8px 16px", borderRadius:11, border:"none", cursor:"pointer", fontSize:13, fontWeight:tab===id?700:500, fontFamily:"inherit", background:tab===id?t.card:"transparent", color:tab===id?t.text:t.muted, transition:"all 0.15s", boxShadow:tab===id?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}
          style={{ background:t.card, borderRadius:20, padding:28, border:`1px solid ${t.border}` }}>

          {/* URL IMPORT */}
          {tab === "url" && !result && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(107,53,232,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Link2 size={16} color={V.v400}/>
                </div>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:t.text, margin:0 }}>Import from URL</h3>
                  <p style={{ fontSize:12, color:t.muted, margin:0 }}>Paste any product link — KIRO extracts everything</p>
                </div>
              </div>

              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                <input
                  value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://aliexpress.com/item/... or any product URL"
                  onKeyDown={e => { if (e.key === "Enter" && url && !importUrlMut.isPending) importUrlMut.mutate(); }}
                  style={{ flex:1, padding:"12px 16px", borderRadius:12, border:`1px solid ${url?"rgba(107,53,232,0.3)":t.border}`, background:t.input, color:t.text, fontSize:14, fontFamily:"inherit", outline:"none", transition:"border-color 0.15s" }}
                />
                <button onClick={() => importUrlMut.mutate()} disabled={!url || importUrlMut.isPending || !storeId}
                  style={{ padding:"12px 20px", borderRadius:12, border:"none", cursor:(!url||importUrlMut.isPending)?"not-allowed":"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:14, fontWeight:700, fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", opacity:(!url||importUrlMut.isPending)?0.6:1, boxShadow:"0 4px 14px rgba(107,53,232,0.25)" }}>
                  {importUrlMut.isPending ? <><RefreshCw size={14} style={{ animation:"spin 0.7s linear infinite" }}/> Importing…</> : <><Upload size={14}/> Import</>}
                </button>
              </div>

              {importUrlMut.isPending && (
                <div style={{ padding:"14px 18px", borderRadius:12, background:"rgba(107,53,232,0.05)", border:"1px solid rgba(107,53,232,0.12)", display:"flex", gap:10 }}>
                  <Zap size={15} color={V.v400} style={{ flexShrink:0, marginTop:1 }}/>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:"0 0 2px" }}>KIRO is working…</p>
                    <p style={{ fontSize:12, color:t.muted, margin:0 }}>Fetching product data, writing description, setting price. Usually takes 10-20 seconds.</p>
                  </div>
                </div>
              )}

              {/* Example URLs */}
              <div style={{ marginTop:20 }}>
                <p style={{ fontSize:11, fontWeight:700, color:t.muted, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Try with an example</p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[
                    "https://www.aliexpress.com/item/1005006218931895.html",
                    "https://www.amazon.com/dp/B09G9FPHY6",
                  ].map(ex => (
                    <button key={ex} onClick={() => setUrl(ex)}
                      style={{ textAlign:"left", padding:"8px 12px", borderRadius:9, border:`1px solid ${t.border}`, background:"transparent", cursor:"pointer", fontSize:12, color:t.muted, fontFamily:"inherit", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", transition:"all 0.12s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${V.v500}08`; e.currentTarget.style.color = t.text; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.muted as string; }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS RESULT */}
          {tab === "url" && result && (
            <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(16,185,129,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Check size={18} color={V.green}/>
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, color:V.green, margin:0 }}>Product imported!</h3>
              </div>
              <div style={{ display:"flex", gap:16, padding:16, borderRadius:14, background:t.faint, border:`1px solid ${t.border}`, marginBottom:20 }}>
                {result.images?.[0] && (
                  <img src={result.images[0]} alt={result.name} style={{ width:80, height:80, objectFit:"cover", borderRadius:10, flexShrink:0 }}/>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:t.text, margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{result.name}</p>
                  <p style={{ fontSize:20, fontWeight:900, color:V.v400, margin:"0 0 6px" }}>₦{Number(result.price||0).toLocaleString()}</p>
                  <div style={{ display:"flex", gap:6 }}>
                    <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:"rgba(16,185,129,0.1)", color:V.green, fontWeight:700 }}>{result.category||"Uncategorised"}</span>
                    <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:t.faint, color:t.muted, fontWeight:600 }}>{result.stock||0} in stock</span>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <Link href={`/dashboard/products/${result.id}`}
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", borderRadius:12, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", textDecoration:"none", fontSize:13, fontWeight:700, boxShadow:"0 4px 14px rgba(107,53,232,0.2)" }}>
                  <ExternalLink size={13}/> Edit product
                </Link>
                <button onClick={() => setResult(null)}
                  style={{ flex:1, padding:"12px 0", borderRadius:12, border:`1px solid ${t.border}`, background:t.card, color:t.muted, fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>
                  Import another
                </button>
              </div>
            </motion.div>
          )}

          {/* CSV UPLOAD */}
          {tab === "csv" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(107,53,232,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <FileText size={16} color={V.v400}/>
                  </div>
                  <div>
                    <h3 style={{ fontSize:15, fontWeight:700, color:t.text, margin:0 }}>CSV Upload</h3>
                    <p style={{ fontSize:12, color:t.muted, margin:0 }}>Upload multiple products at once</p>
                  </div>
                </div>
                <a href="/csv-template.csv" download
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:t.faint, color:t.muted, textDecoration:"none", fontSize:12, fontWeight:600 }}>
                  <Download size={12}/> Template
                </a>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", borderRadius:16, cursor:"pointer", border:`2px dashed ${dragOver?V.v400:t.border}`, background:dragOver?`${V.v500}06`:"transparent", transition:"all 0.15s" }}>
                {importCsvMut.isPending ? (
                  <>
                    <RefreshCw size={28} color={V.v400} style={{ marginBottom:12, animation:"spin 0.7s linear infinite" }}/>
                    <p style={{ fontSize:14, fontWeight:600, color:t.text, margin:"0 0 4px" }}>Importing…</p>
                    <p style={{ fontSize:12, color:t.muted }}>Processing your products</p>
                  </>
                ) : (
                  <>
                    <Upload size={28} style={{ color:dragOver?V.v400:t.muted, marginBottom:12 }}/>
                    <p style={{ fontSize:14, fontWeight:600, color:t.text, margin:"0 0 4px" }}>
                      {dragOver ? "Drop to import" : "Drop CSV here or click to browse"}
                    </p>
                    <p style={{ fontSize:12, color:t.muted }}>Max 10MB · Columns: name, price, description, category, stock, images</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
              </div>

              <div style={{ marginTop:16, padding:"14px 18px", borderRadius:12, background:t.faint, border:`1px solid ${t.border}` }}>
                <p style={{ fontSize:12, fontWeight:700, color:t.text, margin:"0 0 6px" }}>CSV format</p>
                <code style={{ fontSize:11, color:t.muted, fontFamily:"monospace" }}>
                  name, price, description, category, stock, images<br/>
                  "iPhone Case", 5000, "Protective case", "Accessories", 100, "https://..."
                </code>
              </div>
            </div>
          )}

          {/* BULK URL IMPORT */}
          {tab === "bulk" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(107,53,232,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Zap size={16} color={V.v400}/>
                </div>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:t.text, margin:0 }}>Bulk URL Import</h3>
                  <p style={{ fontSize:12, color:t.muted, margin:0 }}>Import up to 20 products at once — one URL per line</p>
                </div>
              </div>

              <textarea
                value={bulkUrls} onChange={e => setBulkUrls(e.target.value)}
                placeholder={"https://aliexpress.com/item/123.html\nhttps://aliexpress.com/item/456.html\nhttps://temu.com/product/789.html"}
                rows={10}
                style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:`1px solid ${t.border}`, background:t.input, color:t.text, fontSize:13, fontFamily:"monospace", outline:"none", resize:"vertical", lineHeight:1.6 }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
                <span style={{ fontSize:12, color:t.muted }}>{urlCount} URL{urlCount!==1?"s":""} detected · max 20</span>
                <button onClick={() => bulkMut.mutate()} disabled={urlCount===0 || bulkMut.isPending || urlCount>20 || !storeId}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 22px", borderRadius:12, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", opacity:(urlCount===0||urlCount>20)?0.5:1, boxShadow:"0 4px 14px rgba(107,53,232,0.2)" }}>
                  {bulkMut.isPending ? <><RefreshCw size={13} style={{ animation:"spin 0.7s linear infinite" }}/> Importing…</> : <><Zap size={13}/> Import {urlCount>0?urlCount:""} products</>}
                </button>
              </div>
              {urlCount > 20 && (
                <p style={{ fontSize:12, color:V.red, marginTop:8 }}>⚠ Maximum 20 URLs per batch. Remove {urlCount-20} URLs.</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Info cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }} className="import-grid">
        <div style={{ padding:16, borderRadius:14, background:t.card, border:`1px solid ${t.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <Zap size={14} color={V.v400}/>
            <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>What KIRO does</p>
          </div>
          <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.6 }}>
            Rewrites product titles for clarity, enhances descriptions for your market, sets a profitable price, and grades the product A–F for dropshipping potential.
          </p>
        </div>
        <div style={{ padding:16, borderRadius:14, background:t.card, border:`1px solid ${t.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <TrendingUp size={14} color={V.green}/>
            <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:0 }}>Pro tip</p>
          </div>
          <p style={{ fontSize:12, color:t.muted, margin:0, lineHeight:1.6 }}>
            Use KIRO to find winning products first. Type <code style={{ background:t.faint, padding:"1px 5px", borderRadius:4 }}>/import</code> in KIRO chat and describe your niche.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:640px){ .import-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
}
