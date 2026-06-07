"use client";
import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../../store/auth.store";
import { api, uploadAPI } from "../../../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ArrowLeft, Save, Trash2, Upload, X, Plus, Eye,
  Package, Tag, BarChart2, Globe, RefreshCw, ExternalLink, Image as ImageIcon,
} from "lucide-react";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

export default function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);

  const C = {
    card:   isDark ? "rgba(255,255,255,0.04)" : "#fff",
    text:   isDark ? "#F0ECFF" : "#130D2E",
    muted:  isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.5)",
    border: isDark ? "rgba(107,53,232,0.15)" : "rgba(107,53,232,0.12)",
    faint:  isDark ? "rgba(107,53,232,0.06)" : "rgba(107,53,232,0.04)",
    input:  isDark ? "rgba(255,255,255,0.06)" : "#fff",
    bg:     isDark ? "#08051A" : "#F4F2FB",
  };

  const inp: any = { width:"100%", padding:"11px 14px", borderRadius:11, border:`1px solid ${C.border}`, background:C.input, color:C.text, fontSize:13, fontFamily:"inherit", outline:"none" };

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api.get(`/products/${storeId}/${productId}`).then(r => r.data.data),
    enabled: !!storeId && !!productId,
  });

  const [form, setForm] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details"|"images"|"seo"|"variants">("details");
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync form when product loads
  if (productData && !form) {
    setForm({
      name: productData.name || "",
      price: productData.price || "",
      compareAtPrice: productData.compareAtPrice || "",
      costPrice: productData.costPrice || "",
      description: productData.description || "",
      category: productData.category || "",
      tags: (productData.tags || []).join(", "),
      sku: productData.sku || "",
      barcode: productData.barcode || "",
      weight: productData.weight || "",
      inventory: productData.inventory ?? "",
      trackInventory: productData.trackInventory ?? true,
      status: productData.status || "ACTIVE",
      metaTitle: productData.metaTitle || "",
      metaDescription: productData.metaDescription || "",
    });
    setImages(productData.images || []);
  }

  const saveMut = useMutation({
    mutationFn: () => api.put(`/products/${storeId}/${productId}`, {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      inventory: form.inventory !== "" ? Number(form.inventory) : undefined,
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      images,
    }),
    onSuccess: () => { toast.success("Product saved"); qc.invalidateQueries({ queryKey:["product", productId] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Save failed"),
  });

  const deleteMut = useMutation({
    mutationFn: () => api.delete(`/products/${storeId}/${productId}`),
    onSuccess: () => { toast.success("Product deleted"); router.push("/dashboard/products"); },
    onError: () => toast.error("Delete failed"),
  });

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData(); fd.append("image", file);
        const r = await uploadAPI.post("/upload/image", fd);
        setImages(prev => [...prev, r.data.url]);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    setUploading(false);
  }, []);

  if (isLoading || !form) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400 }}>
      <RefreshCw size={24} color={V.v400} style={{ animation:"spin 0.7s linear infinite" }}/>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  const TABS = [
    { id:"details",  label:"Details",  icon:Package },
    { id:"images",   label:"Images",   icon:ImageIcon },
    { id:"seo",      label:"SEO",      icon:Globe },
    { id:"variants", label:"Variants", icon:Tag },
  ];

  const margin = form.price && form.costPrice
    ? Math.round(((Number(form.price) - Number(form.costPrice)) / Number(form.price)) * 100)
    : null;

  return (
    <div style={{ maxWidth:900, margin:"0 auto", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/products" style={{ width:36, height:36, borderRadius:10, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:C.muted }}>
            <ArrowLeft size={16}/>
          </Link>
          <div>
            <h1 style={{ fontSize:18, fontWeight:900, color:C.text, margin:0, letterSpacing:"-0.03em" }}>
              {form.name || "Product"}
            </h1>
            <p style={{ fontSize:12, color:C.muted, margin:0 }}>
              {productData?.status === "ACTIVE" ? "✅ Live" : "⏸ Draft"} · ID: {productId?.slice(-8)}
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <a href={`/store/${useAuthStore.getState().user?.stores?.[0]?.slug}/product/${productId}`}
            target="_blank" rel="noreferrer"
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, border:`1px solid ${C.border}`, background:C.card, color:C.muted, textDecoration:"none", fontSize:13, fontWeight:600 }}>
            <Eye size={13}/> Preview
          </a>
          <button onClick={() => { if(confirm("Delete this product?")) deleteMut.mutate(); }}
            style={{ padding:"9px 14px", borderRadius:10, border:"1px solid rgba(239,68,68,0.2)", background:"rgba(239,68,68,0.06)", color:V.red, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
            <Trash2 size={13}/>
          </button>
          <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", boxShadow:"0 4px 16px rgba(107,53,232,0.25)" }}>
            {saveMut.isPending ? <RefreshCw size={13} style={{ animation:"spin 0.7s linear infinite" }}/> : <Save size={13}/>}
            {saveMut.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }} className="stats-row">
        {[
          { label:"Price",       value:form.price ? `₦${Number(form.price).toLocaleString()}` : "—" },
          { label:"Cost",        value:form.costPrice ? `₦${Number(form.costPrice).toLocaleString()}` : "—" },
          { label:"Margin",      value:margin !== null ? `${margin}%` : "—", color:margin && margin > 40 ? V.green : V.amber },
          { label:"Stock",       value:form.trackInventory ? (form.inventory || "0") : "∞" },
        ].map(s => (
          <div key={s.label} style={{ padding:"12px 16px", borderRadius:12, background:C.card, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:11, color:C.muted, margin:"0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize:16, fontWeight:800, color:s.color||C.text, margin:0, letterSpacing:"-0.03em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:20, background:C.faint, borderRadius:14, padding:4, border:`1px solid ${C.border}`, width:"fit-content" }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:11, border:"none", cursor:"pointer", fontSize:13, fontWeight:activeTab===tab.id?700:500, fontFamily:"inherit", background:activeTab===tab.id?C.card:"transparent", color:activeTab===tab.id?C.text:C.muted, boxShadow:activeTab===tab.id?"0 1px 4px rgba(0,0,0,0.08)":"none", transition:"all 0.15s" }}>
              <Icon size={13}/> {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }} className="edit-grid">
        {/* Main content */}
        <div>
          {activeTab === "details" && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              style={{ background:C.card, borderRadius:18, padding:24, border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Product name *</label>
                <input value={form.name} onChange={e => setForm((f:any) => ({...f, name:e.target.value}))} style={inp} placeholder="e.g. Blue Wireless Earbuds"/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm((f:any) => ({...f, description:e.target.value}))} rows={6}
                  placeholder="Describe the product — what it is, what makes it great, who it's for…"
                  style={{ ...inp, resize:"vertical" }}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Sell price (₦) *</label>
                  <input type="number" value={form.price} onChange={e => setForm((f:any) => ({...f, price:e.target.value}))} style={inp} placeholder="0"/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Compare price (₦)</label>
                  <input type="number" value={form.compareAtPrice} onChange={e => setForm((f:any) => ({...f, compareAtPrice:e.target.value}))} style={inp} placeholder="0"/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Cost price (₦)</label>
                  <input type="number" value={form.costPrice} onChange={e => setForm((f:any) => ({...f, costPrice:e.target.value}))} style={inp} placeholder="0"/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>SKU</label>
                  <input value={form.sku} onChange={e => setForm((f:any) => ({...f, sku:e.target.value}))} style={inp} placeholder="SKU-001"/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Barcode</label>
                  <input value={form.barcode} onChange={e => setForm((f:any) => ({...f, barcode:e.target.value}))} style={inp} placeholder="123456789"/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Category</label>
                  <input value={form.category} onChange={e => setForm((f:any) => ({...f, category:e.target.value}))} style={inp} placeholder="e.g. Electronics"/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Weight (kg)</label>
                  <input type="number" value={form.weight} onChange={e => setForm((f:any) => ({...f, weight:e.target.value}))} style={inp} placeholder="0.5"/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm((f:any) => ({...f, tags:e.target.value}))} style={inp} placeholder="earbuds, wireless, bluetooth"/>
              </div>
            </motion.div>
          )}

          {activeTab === "images" && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              style={{ background:C.card, borderRadius:18, padding:24, border:`1px solid ${C.border}` }}>
              <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:"0 0 16px" }}>Product images</p>
              {/* Upload area */}
              <div onClick={() => fileRef.current?.click()}
                style={{ padding:"32px 24px", borderRadius:14, border:`2px dashed ${uploading?"#8B5CF6":C.border}`, textAlign:"center", cursor:"pointer", marginBottom:16, background:uploading?`${V.v500}06`:C.faint, transition:"all 0.15s" }}>
                {uploading
                  ? <><RefreshCw size={24} color="#8B5CF6" style={{ margin:"0 auto 8px", animation:"spin 0.7s linear infinite", display:"block" }}/><p style={{ color:"#8B5CF6", margin:0, fontWeight:600, fontSize:13 }}>Uploading…</p></>
                  : <><Upload size={24} color={C.muted as string} style={{ margin:"0 auto 8px", display:"block" }}/><p style={{ color:C.text, margin:"0 0 4px", fontWeight:600, fontSize:13 }}>Click to upload or drag & drop</p><p style={{ color:C.muted, margin:0, fontSize:11 }}>JPG, PNG, WebP up to 10MB</p></>
                }
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:"none" }}
                  onChange={e => handleUpload(e.target.files)}/>
              </div>
              {/* Image grid */}
              {images.length > 0 ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position:"relative", aspectRatio:"1", borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}` }}>
                      <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      {i === 0 && <span style={{ position:"absolute", top:6, left:6, fontSize:9, fontWeight:700, background:"rgba(107,53,232,0.9)", color:"#fff", padding:"2px 6px", borderRadius:99 }}>MAIN</span>}
                      <button onClick={() => setImages(imgs => imgs.filter((_,j) => j!==i))}
                        style={{ position:"absolute", top:6, right:6, width:22, height:22, borderRadius:6, background:"rgba(0,0,0,0.6)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                        <X size={11}/>
                      </button>
                    </div>
                  ))}
                  <div onClick={() => fileRef.current?.click()}
                    style={{ aspectRatio:"1", borderRadius:12, border:`2px dashed ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", background:C.faint }}>
                    <Plus size={20} color={C.muted as string}/>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize:13, color:C.muted, textAlign:"center", margin:0 }}>No images yet. Upload one above.</p>
              )}
            </motion.div>
          )}

          {activeTab === "seo" && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              style={{ background:C.card, borderRadius:18, padding:24, border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ padding:14, borderRadius:12, background:C.faint, border:`1px solid ${C.border}` }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Google preview</p>
                <p style={{ fontSize:16, color:"#1a0dab", margin:"0 0 2px", fontWeight:500 }}>{form.metaTitle || form.name || "Product title"}</p>
                <p style={{ fontSize:13, color:"#006621", margin:"0 0 4px" }}>droposhq.com/store/…/product/{productId}</p>
                <p style={{ fontSize:13, color:"#545454", margin:0, lineHeight:1.5 }}>{form.metaDescription || form.description?.slice(0,160) || "Product description…"}</p>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Meta title</label>
                <input value={form.metaTitle} onChange={e => setForm((f:any) => ({...f, metaTitle:e.target.value}))} maxLength={60} style={inp} placeholder={form.name}/>
                <p style={{ fontSize:11, color:C.muted, margin:"4px 0 0", textAlign:"right" }}>{(form.metaTitle||"").length}/60</p>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:6 }}>Meta description</label>
                <textarea value={form.metaDescription} onChange={e => setForm((f:any) => ({...f, metaDescription:e.target.value}))} maxLength={160} rows={3}
                  style={{ ...inp, resize:"none" }} placeholder="Brief description for search engines…"/>
                <p style={{ fontSize:11, color:C.muted, margin:"4px 0 0", textAlign:"right" }}>{(form.metaDescription||"").length}/160</p>
              </div>
            </motion.div>
          )}

          {activeTab === "variants" && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              style={{ background:C.card, borderRadius:18, padding:24, border:`1px solid ${C.border}`, textAlign:"center" }}>
              <Tag size={32} color="#8B5CF6" style={{ margin:"0 auto 12px", display:"block" }}/>
              <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:"0 0 8px" }}>Variants</p>
              <p style={{ fontSize:13, color:C.muted, margin:"0 0 20px" }}>Manage sizes, colours, and options for this product</p>
              <Link href={`/dashboard/products/${productId}/variants`}
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"11px 22px", borderRadius:12, background:"linear-gradient(135deg,#2D1B69,#6B35E8)", color:"#fff", textDecoration:"none", fontSize:14, fontWeight:700 }}>
                Manage variants <ExternalLink size={13}/>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Status */}
          <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 10px" }}>Status</p>
            <select value={form.status} onChange={e => setForm((f:any) => ({...f, status:e.target.value}))}
              style={{ ...inp, width:"100%" }}>
              <option value="ACTIVE">✅ Active — visible in store</option>
              <option value="DRAFT">⏸ Draft — hidden from store</option>
              <option value="ARCHIVED">🗄 Archived</option>
            </select>
          </div>

          {/* Inventory */}
          <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 12px" }}>Inventory</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <input type="checkbox" id="track" checked={form.trackInventory}
                onChange={e => setForm((f:any) => ({...f, trackInventory:e.target.checked}))}
                style={{ accentColor:"#6B35E8", width:15, height:15 }}/>
              <label htmlFor="track" style={{ fontSize:13, color:C.text, cursor:"pointer" }}>Track inventory</label>
            </div>
            {form.trackInventory && (
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:C.muted, display:"block", marginBottom:5 }}>Stock quantity</label>
                <input type="number" value={form.inventory} onChange={e => setForm((f:any) => ({...f, inventory:e.target.value}))} style={inp} min="0" placeholder="0"/>
              </div>
            )}
          </div>

          {/* Margin calculator */}
          {margin !== null && (
            <div style={{ padding:16, borderRadius:14, background:margin > 40 ? "rgba(16,185,129,0.05)" : "rgba(245,158,11,0.05)", border:`1px solid ${margin > 40 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}` }}>
              <p style={{ fontSize:12, fontWeight:700, color:C.muted, margin:"0 0 8px" }}>Profit margin</p>
              <p style={{ fontSize:24, fontWeight:900, color:margin > 40 ? V.green : V.amber, margin:"0 0 4px", letterSpacing:"-0.04em" }}>{margin}%</p>
              <p style={{ fontSize:11, color:C.muted, margin:0 }}>
                ₦{(Number(form.price) - Number(form.costPrice)).toLocaleString()} profit per sale
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){ .edit-grid{grid-template-columns:1fr!important;} .stats-row{grid-template-columns:1fr 1fr!important;} }
      `}</style>
    </div>
  );
}
