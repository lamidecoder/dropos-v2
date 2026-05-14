"use client";
import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api, uploadAPI } from "../../../lib/api";
import { useCurrency } from "../../../lib/currency";
import {
  Package, Plus, Search, Edit2, Trash2, X, Loader2, Upload,
  ImageIcon, Star, ChevronDown, Zap, Filter, Check, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", v300:"#A78BFA", green:"#10B981", amber:"#F59E0B", red:"#EF4444" };

// ── Image Uploader (inline, fully styled) ─────────────────────────────────────
function ImageUploader({ images, onChange, maxImages=8, t, isDark }: any) {
  const [uploading, setUploading] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, maxImages - images.length);
    if (!arr.length) return;
    setErr("");
    for (const file of arr) {
      if (!file.type.startsWith("image/")) { setErr("Only images allowed"); continue; }
      if (file.size > 10 * 1024 * 1024) { setErr("Max 10MB per image"); continue; }
      setUploading(p => [...p, file.name]);
      try {
        const res = await uploadAPI.image(file);
        onChange([...images, res.data.data.url]);
      } catch {
        setErr("Upload failed — check Cloudinary is configured");
      } finally {
        setUploading(p => p.filter(n => n !== file.name));
      }
    }
  }, [images, maxImages, onChange]);

  const isUp = uploading.length > 0;

  return (
    <div>
      {/* Existing images grid */}
      {images.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:10 }}>
          {images.map((url: string, i: number) => (
            <div key={url} style={{ position:"relative", aspectRatio:"1", borderRadius:12, overflow:"hidden", background:t.faint }}>
              <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              {i===0 && (
                <div style={{ position:"absolute", top:6, left:6, background:V.v500, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>MAIN</div>
              )}
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", opacity:0, transition:"opacity 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
                onMouseEnter={e=>(e.currentTarget.style.opacity="1")} onMouseLeave={e=>(e.currentTarget.style.opacity="0")}>
                {i!==0 && (
                  <button onClick={()=>{const a=[...images];a.splice(i,1);a.unshift(url);onChange(a);}}
                    style={{ width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}
                    title="Set as main">
                    <Star size={12} color="#fff"/>
                  </button>
                )}
                <button onClick={()=>onChange(images.filter((_:string,j:number)=>j!==i))}
                  style={{ width:28,height:28,borderRadius:8,background:"rgba(239,68,68,0.8)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <X size={12} color="#fff"/>
                </button>
              </div>
            </div>
          ))}
          {images.length < maxImages && (
            <button onClick={()=>ref.current?.click()} type="button"
              style={{ aspectRatio:"1",borderRadius:12,border:`2px dashed ${drag?V.v400:t.border}`,background:t.faint,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,color:t.muted,transition:"all 0.15s" }}
              onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);upload(e.dataTransfer.files)}}>
              {isUp?<Loader2 size={16} style={{animation:"spin 0.8s linear infinite",color:V.v400}}/>:<><Upload size={14}/><span style={{fontSize:10,fontWeight:700}}>Add</span></>}
            </button>
          )}
        </div>
      )}

      {/* Drop zone (empty state) */}
      {images.length === 0 && (
        <div
          onClick={()=>ref.current?.click()}
          onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);upload(e.dataTransfer.files)}}
          style={{ padding:"32px 20px",borderRadius:16,border:`2px dashed ${drag?V.v400:t.border}`,background:drag?`${V.v400}08`:t.faint,cursor:"pointer",textAlign:"center",transition:"all 0.2s" }}>
          {isUp ? (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
              <Loader2 size={28} style={{ color:V.v400,animation:"spin 0.8s linear infinite" }}/>
              <p style={{ fontSize:13,color:t.muted,margin:0 }}>Uploading {uploading.length} image{uploading.length>1?"s":""}…</p>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
              <div style={{ width:52,height:52,borderRadius:16,background:`${V.v400}15`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <ImageIcon size={22} color={V.v400}/>
              </div>
              <div>
                <p style={{ fontSize:14,fontWeight:700,color:t.text,margin:"0 0 4px" }}>
                  Drop images here or <span style={{ color:V.v400 }}>browse</span>
                </p>
                <p style={{ fontSize:12,color:t.muted,margin:0 }}>
                  JPEG, PNG, WebP · Max 10MB · Up to {maxImages} images
                </p>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,cursor:"pointer" }}>
                <Upload size={13} color="#fff"/>
                <span style={{ fontSize:13,fontWeight:700,color:"#fff" }}>Choose Photos</span>
              </div>
            </div>
          )}
        </div>
      )}

      {err && (
        <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",marginTop:8 }}>
          <AlertCircle size={13} color={V.red} style={{ flexShrink:0 }}/>
          <p style={{ fontSize:12,color:V.red,margin:0 }}>{err}</p>
          <button onClick={()=>setErr("")} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:V.red,display:"flex" }}><X size={12}/></button>
        </div>
      )}

      <p style={{ fontSize:11,color:t.muted,marginTop:6 }}>
        {images.length}/{maxImages} images · First image is the main display image
      </p>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display:"none" }}
        onChange={e=>{if(e.target.files)upload(e.target.files);e.target.value="";}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({ storeId, product, onClose, t, isDark }: any) {
  const { fmt } = useCurrency();
  const qc = useQueryClient();
  const isEdit = !!product?.id;

  const [form, setForm] = useState({
    name:          product?.name          || "",
    description:   product?.description   || "",
    price:         product?.price?.toString()         || "",
    comparePrice:  product?.comparePrice?.toString()  || "",
    costPrice:     product?.costPrice?.toString()     || "",
    inventory:     product?.inventory?.toString()     || "0",
    category:      product?.category      || "",
    status:        product?.status        || "ACTIVE",
    images:        product?.images        || [] as string[],
    sku:           product?.sku           || "",
    weight:        product?.weight?.toString()        || "",
  });

  const mut = useMutation({
    mutationFn: () => {
      const payload = {
        name:        form.name,
        description: form.description,
        price:       parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        costPrice:   form.costPrice ? parseFloat(form.costPrice) : null,
        inventory:   parseInt(form.inventory),
        category:    form.category,
        status:      form.status,
        images:      form.images,
        sku:         form.sku,
        weight:      form.weight ? parseFloat(form.weight) : null,
      };
      return isEdit
        ? api.put(`/products/${storeId}/${product.id}`, payload)
        : api.post(`/products/${storeId}`, payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Product updated!" : "Product created!");
      qc.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to save"),
  });

  const inp = {
    width:"100%", padding:"10px 14px", borderRadius:12,
    border:`1px solid ${t.border}`, background:isDark?"rgba(255,255,255,0.05)":"#F5F3FF",
    color:t.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const,
  };

  const label = (txt: string) => (
    <label style={{ display:"block", fontSize:11, fontWeight:700, color:t.muted, marginBottom:6, textTransform:"uppercase" as const, letterSpacing:"0.08em" }}>
      {txt}
    </label>
  );

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 16px",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",overflowY:"auto" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <motion.div initial={{opacity:0,scale:0.96,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96}}
        style={{ width:"100%",maxWidth:680,borderRadius:20,overflow:"hidden",background:isDark?"#0F0B1E":"#fff",border:`1px solid ${t.border}`,marginTop:20 }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:`1px solid ${t.border}` }}>
          <div>
            <h3 style={{ fontSize:16,fontWeight:900,color:t.text,margin:"0 0 2px" }}>
              {isEdit ? "Edit Product" : "Add New Product"}
            </h3>
            <p style={{ fontSize:12,color:t.muted,margin:0 }}>
              {isEdit ? "Update product details" : "Fill in the details to add a product to your store"}
            </p>
          </div>
          <button onClick={onClose} style={{ border:"none",background:t.faint,cursor:"pointer",color:t.muted,width:32,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <X size={16}/>
          </button>
        </div>

        <div style={{ padding:"24px",maxHeight:"80vh",overflowY:"auto" }}>
          {/* Images */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:10,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>
              Product Images *
            </label>
            <ImageUploader
              images={form.images}
              onChange={(imgs: string[]) => setForm(f=>({...f, images:imgs}))}
              t={t} isDark={isDark}
            />
          </div>

          {/* Name + Category */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
            <div>
              {label("Product Name *")}
              <input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Premium Hair Bundle 18 inch"/>
            </div>
            <div>
              {label("Category")}
              <input style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="e.g. Hair, Electronics, Beauty"/>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom:14 }}>
            {label("Description")}
            <textarea style={{...inp,resize:"none",display:"block"}} rows={3}
              value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              placeholder="Describe your product — what it is, who it's for, why they need it..."/>
          </div>

          {/* Pricing */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14 }}>
            <div>
              {label("Selling Price *")}
              <input style={inp} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="25000"/>
            </div>
            <div>
              {label("Compare Price")}
              <input style={inp} type="number" value={form.comparePrice} onChange={e=>setForm(f=>({...f,comparePrice:e.target.value}))} placeholder="35000"/>
              <p style={{ fontSize:10,color:t.muted,margin:"4px 0 0" }}>Shows as crossed-out price</p>
            </div>
            <div>
              {label("Cost Price")}
              <input style={inp} type="number" value={form.costPrice} onChange={e=>setForm(f=>({...f,costPrice:e.target.value}))} placeholder="12000"/>
              <p style={{ fontSize:10,color:t.muted,margin:"4px 0 0" }}>For profit tracking only</p>
            </div>
          </div>

          {/* Inventory + SKU + Weight */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14 }}>
            <div>
              {label("Stock Quantity")}
              <input style={inp} type="number" value={form.inventory} onChange={e=>setForm(f=>({...f,inventory:e.target.value}))} placeholder="100"/>
            </div>
            <div>
              {label("SKU")}
              <input style={inp} value={form.sku} onChange={e=>setForm(f=>({...f,sku:e.target.value}))} placeholder="PROD-001"/>
            </div>
            <div>
              {label("Weight (kg)")}
              <input style={inp} type="number" step="0.1" value={form.weight} onChange={e=>setForm(f=>({...f,weight:e.target.value}))} placeholder="0.5"/>
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom:20 }}>
            {label("Status")}
            <select style={{...inp,cursor:"pointer"}} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              <option value="ACTIVE">Active — Visible on your store</option>
              <option value="DRAFT">Draft — Hidden from customers</option>
              <option value="ARCHIVED">Archived — No longer available</option>
            </select>
          </div>

          {/* Profit preview */}
          {form.price && form.costPrice && (
            <div style={{ padding:"12px 14px",borderRadius:12,background:`${V.green}08`,border:`1px solid ${V.green}25`,marginBottom:20,display:"flex",gap:16,flexWrap:"wrap" }}>
              {[
                { label:"Selling Price", val: parseFloat(form.price) },
                { label:"Cost Price",    val: parseFloat(form.costPrice) },
                { label:"Profit",        val: parseFloat(form.price)-parseFloat(form.costPrice) },
                { label:"Margin",        val: null },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize:10,color:t.muted,margin:"0 0 2px",textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>{item.label}</p>
                  <p style={{ fontSize:14,fontWeight:800,color:item.label==="Profit"?V.green:t.text,margin:0 }}>
                    {item.label==="Margin"
                      ? `${Math.round((parseFloat(form.price)-parseFloat(form.costPrice))/parseFloat(form.price)*100)}%`
                      : fmt(item.val!, true)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"16px 24px",borderTop:`1px solid ${t.border}`,display:"flex",gap:10,alignItems:"center" }}>
          <button onClick={onClose} style={{ padding:"10px 20px",borderRadius:12,border:`1px solid ${t.border}`,background:"transparent",cursor:"pointer",color:t.muted,fontSize:13,fontWeight:600,fontFamily:"inherit" }}>
            Cancel
          </button>
          <div style={{ flex:1 }}/>
          {isEdit && (
            <p style={{ fontSize:11,color:t.muted }}>Last updated: {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "—"}</p>
          )}
          <button onClick={()=>mut.mutate()} disabled={!form.name||!form.price||mut.isPending}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 24px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,cursor:!form.name||!form.price?"not-allowed":"pointer",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"inherit",opacity:!form.name||!form.price?0.5:1 }}>
            {mut.isPending?<Loader2 size={14} style={{animation:"spin 0.8s linear infinite"}}/>:<Check size={14}/>}
            {mut.isPending?"Saving…":isEdit?"Save Changes":"Add Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Products Page ────────────────────────────────────────────────────────
const STATUSES = ["ALL","ACTIVE","DRAFT","ARCHIVED"];

export default function ProductsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card:   isDark?"#181230":"#fff",
    border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text:   isDark?"#F0ECFF":"#130D2E",
    muted:  isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint:  isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const { fmt, symbol, code } = useCurrency();
  const qc = useQueryClient();

  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<any>(null);

  const { data, isLoading } = useQuery<any>({
    queryKey: ["products", storeId, status],
    queryFn: () => api.get(`/products/${storeId}`, { params: { status: status==="ALL"?undefined:status, limit:100 } }).then(r => r.data.data),
    enabled: !!storeId,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${storeId}/${id}`),
    onSuccess: () => { toast.success("Product deleted"); qc.invalidateQueries({ queryKey:["products"] }); },
  });

  const products = (data?.products || data || []).filter((p: any) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) =>
    s==="ACTIVE"?"#10B981" : s==="DRAFT"?"#F59E0B" : "#EF4444";

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px" }}>Products</h1>
          <p style={{ fontSize:13,color:t.muted,margin:0 }}>
            {products.length} product{products.length!==1?"s":""} · Prices in {code} {symbol}
          </p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>{setEditing(null);setShowModal(true);}}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"inherit" }}>
            <Plus size={15}/> Add Product
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:200,display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:12,background:t.faint,border:`1px solid ${t.border}` }}>
          <Search size={14} style={{ color:t.muted,flexShrink:0 }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"
            style={{ flex:1,background:"transparent",border:"none",outline:"none",color:t.text,fontSize:13,fontFamily:"inherit" }}/>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={()=>setStatus(s)}
              style={{ padding:"7px 14px",borderRadius:10,border:`1px solid ${status===s?"rgba(107,53,232,0.4)":t.border}`,background:status===s?"rgba(107,53,232,0.08)":"transparent",cursor:"pointer",fontSize:12,fontWeight:600,color:status===s?V.v400:t.muted,fontFamily:"inherit" }}>
              {s.charAt(0)+s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div style={{ textAlign:"center",padding:"80px 0",color:t.muted }}>
          <Loader2 size={28} style={{ margin:"0 auto 12px",animation:"spin 0.8s linear infinite",color:V.v400 }}/>
          <p>Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{ textAlign:"center",padding:"80px 20px",borderRadius:20,background:t.faint,border:`1px solid ${t.border}` }}>
          <Package size={48} style={{ color:t.muted,margin:"0 auto 16px" }}/>
          <h3 style={{ fontSize:18,fontWeight:800,color:t.text,margin:"0 0 8px" }}>No products yet</h3>
          <p style={{ fontSize:14,color:t.muted,margin:"0 0 20px",maxWidth:360,marginLeft:"auto",marginRight:"auto",lineHeight:1.6 }}>
            Add your first product and it'll appear here. You can upload photos, set prices, and track inventory.
          </p>
          <button onClick={()=>{setEditing(null);setShowModal(true);}}
            style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,background:`linear-gradient(135deg,${V.v500},#3D1C8A)`,border:"none",cursor:"pointer",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"inherit" }}>
            <Plus size={15}/> Add Your First Product
          </button>
        </motion.div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14 }}>
          {products.map((p: any, i: number) => {
            const img = p.images?.[0];
            const profit = p.costPrice ? p.price - p.costPrice : null;
            const margin = profit && p.price ? Math.round(profit/p.price*100) : null;
            return (
              <motion.div key={p.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                style={{ borderRadius:16,overflow:"hidden",background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",transition:"box-shadow 0.2s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.boxShadow="0 8px 24px rgba(107,53,232,0.12)"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.boxShadow="none"}>

                {/* Image */}
                <div style={{ aspectRatio:"1",background:t.faint,position:"relative",overflow:"hidden" }}>
                  {img
                    ? <img src={img} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s" }}
                        onMouseEnter={e=>(e.target as HTMLImageElement).style.transform="scale(1.05)"}
                        onMouseLeave={e=>(e.target as HTMLImageElement).style.transform="scale(1)"}/>
                    : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <Package size={28} style={{ color:t.muted }}/>
                      </div>
                  }
                  {/* Status badge */}
                  <div style={{ position:"absolute",top:8,left:8,background:statusColor(p.status),color:"#fff",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:99 }}>
                    {p.status}
                  </div>
                  {/* Image count */}
                  {p.images?.length > 1 && (
                    <div style={{ position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99 }}>
                      +{p.images.length-1}
                    </div>
                  )}
                </div>

                <div style={{ padding:"12px 14px" }}>
                  <p style={{ fontSize:13,color:t.muted,margin:"0 0 3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.category||"—"}</p>
                  <p style={{ fontSize:14,fontWeight:700,color:t.text,margin:"0 0 8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>

                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                    <div>
                      <p style={{ fontSize:16,fontWeight:900,color:t.text,margin:0,letterSpacing:"-0.03em" }}>{fmt(p.price,true)}</p>
                      {p.comparePrice && <p style={{ fontSize:11,color:t.muted,textDecoration:"line-through",margin:0 }}>{fmt(p.comparePrice,true)}</p>}
                    </div>
                    {margin !== null && (
                      <span style={{ fontSize:10,fontWeight:700,color:V.green,background:"rgba(16,185,129,0.1)",padding:"2px 8px",borderRadius:99 }}>
                        {margin}% margin
                      </span>
                    )}
                  </div>

                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <span style={{ fontSize:11,color:t.muted }}>
                      {(p.inventory??p.stockQuantity??0).toLocaleString()} in stock
                    </span>
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={()=>{setEditing(p);setShowModal(true);}}
                        style={{ width:28,height:28,borderRadius:8,border:`1px solid ${t.border}`,background:t.faint,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <Edit2 size={12} style={{ color:t.muted }}/>
                      </button>
                      <button onClick={()=>{if(confirm("Delete this product?"))deleteMut.mutate(p.id);}}
                        style={{ width:28,height:28,borderRadius:8,border:"none",background:"rgba(239,68,68,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <Trash2 size={12} color={V.red}/>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ProductModal
            storeId={storeId}
            product={editing}
            onClose={()=>{setShowModal(false);setEditing(null);}}
            t={t}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
