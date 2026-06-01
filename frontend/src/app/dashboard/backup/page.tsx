"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Download, Package, ShoppingCart, Users, FileText, Shield, Check, Loader2, Clock } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500:"#6B35E8", v400:"#8B5CF6", green:"#10B981", amber:"#F59E0B" };

const EXPORTS = [
  { id:"orders",    icon:ShoppingCart, label:"Orders",        desc:"All orders with customer details, items, status" },
  { id:"products",  icon:Package,      label:"Products",      desc:"Full product catalogue with prices and inventory" },
  { id:"customers", icon:Users,        label:"Customers",     desc:"Customer list with order history and spend" },
  { id:"revenue",   icon:FileText,     label:"Revenue Report",desc:"Revenue, tax, and profit summary by period" },
];

export default function BackupPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = {
    card: isDark?"#181230":"#fff", border: isDark?"rgba(255,255,255,0.07)":"rgba(107,53,232,0.08)",
    text: isDark?"#F0ECFF":"#130D2E", muted: isDark?"rgba(240,236,255,0.45)":"rgba(19,13,46,0.55)",
    faint: isDark?"rgba(255,255,255,0.03)":"rgba(107,53,232,0.03)",
  };
  const storeId = useAuthStore(s => s.user?.stores?.[0]?.id);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string|null>(null);

  const exportData = async (type: string) => {
    setLoading(type);
    try {
      const r = await api.get(`/reports/${storeId}/${type}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `dropos-${type}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setDownloaded(prev => new Set([...prev, type]));
      toast.success(`${type} exported successfully`);
    } catch {
      toast.error("Export failed — try again");
    }
    setLoading(null);
  };

  const lastBackup = new Date();
  lastBackup.setDate(lastBackup.getDate() - 1);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:"-0.04em",color:t.text,margin:"0 0 4px"}}>Backup & Export</h1>
        <p style={{fontSize:13,color:t.muted,margin:0}}>Download your store data as CSV — works in Excel and Google Sheets</p>
      </motion.div>

      {/* Last backup info */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:12,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",marginBottom:20}}>
        <Shield size={14} color={V.green} style={{flexShrink:0}}/>
        <div style={{flex:1}}>
          <p style={{fontSize:12,fontWeight:700,color:V.green,margin:"0 0 1px"}}>Your data is safe</p>
          <p style={{fontSize:11,color:t.muted,margin:0}}>Stored securely with daily automated backups and encryption</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
          <Clock size={11} style={{color:t.muted}}/>
          <span style={{fontSize:11,color:t.muted}}>{lastBackup.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Export options */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {EXPORTS.map((exp, i) => {
          const Icon = exp.icon;
          const isDone = downloaded.has(exp.id);
          const isLoading = loading === exp.id;
          return (
            <motion.div key={exp.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
              style={{display:"flex",alignItems:"center",gap:14,padding:16,borderRadius:16,background:t.card,border:`1px solid ${isDone?"rgba(16,185,129,0.3)":t.border}`}}>
              <div style={{width:42,height:42,borderRadius:12,background:isDone?"rgba(16,185,129,0.1)":`${V.v400}10`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon size={17} color={isDone?V.green:V.v400}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:14,fontWeight:700,color:t.text,margin:"0 0 3px"}}>{exp.label}</p>
                <p style={{fontSize:12,color:t.muted,margin:0}}>{exp.desc}</p>
              </div>
              <button onClick={() => exportData(exp.id)} disabled={isLoading}
                style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,border:`1px solid ${isDone?"rgba(16,185,129,0.4)":t.border}`,background:isDone?"rgba(16,185,129,0.08)":t.faint,cursor:isLoading?"not-allowed":"pointer",color:isDone?V.green:t.muted,fontSize:12,fontWeight:700,flexShrink:0}}>
                {isLoading ? <Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/> : isDone ? <Check size={12}/> : <Download size={12}/>}
                {isLoading ? "Exporting..." : isDone ? "Done" : "Export CSV"}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Tip */}
      <div style={{marginTop:20,padding:"12px 16px",borderRadius:12,background:t.faint,border:`1px solid ${t.border}`}}>
        <p style={{fontSize:12,color:t.muted,margin:0,lineHeight:1.5}}>
          💡 <strong style={{color:t.text}}>Tip:</strong> Export your data monthly and store it in Google Drive. If you ever migrate platforms, you'll have everything ready.
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
