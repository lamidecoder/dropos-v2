"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Layers, Plus, X, Loader2, Check, Package, Grid, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", red:"#EF4444", amber:"#F59E0B" };

function CollectionModal({ onClose, storeId, collection, t, isDark }: any) {
  const qc = useQueryClient();
  const [name, setName] = useState(collection?.name || "");
  const [desc, setDesc] = useState(collection?.description || "");
  const [emoji, setEmoji] = useState(collection?.emoji || "📦");
  const [selected, setSelected] = useState<string[]>(collection?.productIds || []);
  const isEdit = !!collection;

  const { data: products = [] } = useQuery({
    queryKey: ["products-for-collections", storeId],
    queryFn: () => api.get(`/products/${storeId}?limit=100`).then(r => r.data.data?.products || r.data.data || []),
  });

  const mut = useMutation({
    mutationFn: () => {
      const body = { name, description:desc, emoji, productIds:selected };
      return isEdit
        ? api.put(`/stores/${storeId}/collections/${collection.id}`, body)
        : api.post(`/stores/${storeId}/collections`, body);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Collection updated!" : "Collection created!");
      qc.invalidateQueries({ queryKey:["collections"] });
      onClose();
    },
    onError: (e:any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const EMOJIS = ["📦","👗","💄","👠","🏋️","📱","🏠","🌿","✨","🎁","👜","🧴"];

  const inp = { width:"100%", padding:"10px 14px", borderRadius:12, border:`1px solid ${t.border}`,
    background:isDark?"rgba(255,255,255,0.05)":"#F0EDFF", color:t.text, fontSize:13, outline:"none",
    fontFamily:"inherit" } as const;

  const toggle = (id:string) =>
    setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center",
      padding:16, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}}
        style={{ width:"100%", maxWidth:520, borderRadius:22, overflow:"hidden",
          background:isDark?"#181230":"#fff", border:`1px solid ${t.border}`, maxHeight:"88vh", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <p style={{ fontSize:15, fontWeight:800, color:t.text, margin:0 }}>
            {isEdit ? "Edit Collection" : "New Collection"}
          </p>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:t.muted }}><X size={16}/></button>
        </div>
        <div style={{ padding:22, overflowY:"auto", flex:1 }}>
          {/* Emoji picker */}
          <div style={{ marginBottom:14 }}>
            <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Icon</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  style={{ width:36, height:36, borderRadius:9, border:`2px solid ${emoji===e?V.v500:t.border}`,
                    background:emoji===e?`${V.v500}12`:"transparent", fontSize:18, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Name</p>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Summer Collection" style={inp}/>
          </div>
          <div style={{ marginBottom:18 }}>
            <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Description (optional)</p>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What's in this collection?" style={inp}/>
          </div>
          {/* Product picker */}
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:t.muted, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.07em" }}>
              Products ({selected.length} selected)
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:240, overflowY:"auto" }}>
              {(products as any[]).map((p:any) => {
                const isSelected = selected.includes(p.id);
                return (
                  <div key={p.id} onClick={() => toggle(p.id)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, cursor:"pointer",
                      border:`1px solid ${isSelected?V.v500:t.border}`,
                      background:isSelected?`${V.v500}08`:"transparent" }}>
                    <div style={{ width:28, height:28, borderRadius:7, overflow:"hidden", flexShrink:0, background:t.faint }}>
                      {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
                    </div>
                    <p style={{ flex:1, fontSize:13, fontWeight:600, color:t.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                    {isSelected && <Check size={13} color={V.v500}/>}
                  </div>
                );
              })}
              {(products as any[]).length === 0 && (
                <p style={{ fontSize:12, color:t.muted, textAlign:"center", padding:"20px 0" }}>Add products to your store first</p>
              )}
            </div>
          </div>
        </div>
        <div style={{ padding:"16px 22px", borderTop:`1px solid ${t.border}`, display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"11px 0", borderRadius:12, border:`1px solid ${t.border}`, background:"transparent", color:t.muted, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600 }}>Cancel</button>
          <button onClick={() => mut.mutate()} disabled={!name || mut.isPending}
            style={{ flex:2, padding:"11px 0", borderRadius:12, border:"none", cursor:"pointer",
              background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, color:"#fff", fontSize:13, fontWeight:700,
              fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:!name?0.5:1 }}>
            {mut.isPending ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Check size={13}/>}
            {mut.isPending ? "Saving…" : isEdit ? "Update Collection" : "Create Collection"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CollectionsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const qc = useQueryClient();

  const t = {
    card:   isDark?"#181230":"#fff",   border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text:   isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint:  isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };

  const [showModal, setShowModal] = useState(false);
  const [editCollection, setEditCollection] = useState<any>(null);

  const { data: collections = [], isLoading } = useQuery({
    queryKey:  ["collections", storeId],
    queryFn:   () => api.get(`/stores/${storeId}/collections`).then(r => r.data.data || []),
    enabled:   !!storeId,
  });

  const deleteMut = useMutation({
    mutationFn: (id:string) => api.delete(`/stores/${storeId}/collections/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({queryKey:["collections"]}); },
  });

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.04em", color:t.text, margin:"0 0 4px" }}>Collections</h1>
          <p style={{ fontSize:13, color:t.muted, margin:0 }}>Group products into curated collections that appear on your storefront</p>
        </div>
        <button onClick={() => { setEditCollection(null); setShowModal(true); }}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", borderRadius:12,
            background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer",
            color:"#fff", fontSize:13, fontWeight:700 }}>
          <Plus size={14}/> New Collection
        </button>
      </motion.div>

      {isLoading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
          {Array.from({length:3}).map((_,i) => (
            <div key={i} style={{ height:140, borderRadius:18, background:t.faint, animation:"pulse 1.5s ease-in-out infinite" }}/>
          ))}
        </div>
      ) : (collections as any[]).length === 0 ? (
        <div style={{ textAlign:"center", padding:"64px 24px", borderRadius:20, background:t.faint, border:`1px solid ${t.border}` }}>
          <Layers size={40} style={{ color:t.muted, margin:"0 auto 14px", display:"block" }}/>
          <p style={{ fontSize:16, fontWeight:700, color:t.text, margin:"0 0 6px" }}>No collections yet</p>
          <p style={{ fontSize:13, color:t.muted, margin:"0 0 20px" }}>
            Group your products into collections like "Summer Picks", "Under ₦5,000", or "Best Sellers" to help customers discover products.
          </p>
          <button onClick={() => setShowModal(true)}
            style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12,
              background:`linear-gradient(135deg,${V.v500},#3D1C8A)`, border:"none", cursor:"pointer",
              color:"#fff", fontSize:13, fontWeight:700 }}>
            <Plus size={13}/> Create your first collection
          </button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
          {(collections as any[]).map((c:any, i:number) => (
            <motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
              style={{ padding:20, borderRadius:18, background:t.card, border:`1px solid ${t.border}` }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:28 }}>{c.emoji || "📦"}</div>
                <div style={{ display:"flex", gap:4 }}>
                  <button onClick={() => { setEditCollection(c); setShowModal(true); }}
                    style={{ width:28, height:28, borderRadius:7, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Edit2 size={11} color={t.muted as string}/>
                  </button>
                  <button onClick={() => deleteMut.mutate(c.id)}
                    style={{ width:28, height:28, borderRadius:7, border:`1px solid ${t.border}`, background:t.faint, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Trash2 size={11} color={V.red}/>
                  </button>
                </div>
              </div>
              <p style={{ fontSize:15, fontWeight:800, color:t.text, margin:"0 0 4px" }}>{c.name}</p>
              {c.description && <p style={{ fontSize:12, color:t.muted, margin:"0 0 12px", lineHeight:1.5 }}>{c.description}</p>}
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:20, height:20, borderRadius:6, background:`${V.v400}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Package size={10} color={V.v400}/>
                </div>
                <span style={{ fontSize:12, color:t.muted, fontWeight:600 }}>
                  {c.productIds?.length || c._count?.products || 0} products
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <CollectionModal
            onClose={() => { setShowModal(false); setEditCollection(null); }}
            storeId={storeId} collection={editCollection} t={t} isDark={isDark}/>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
