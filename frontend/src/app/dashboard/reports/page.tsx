"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { api } from "../../../lib/api";
import { Download, FileText, BarChart2, Users, ShoppingCart, Package, Loader2, Check, Zap } from "lucide-react";
import toast from "react-hot-toast";

const V={v500:"#6B35E8",v400:"#8B5CF6",v300:"#A78BFA",green:"#10B981"};
const TM={dark:{card:"#181230",border:"rgba(255,255,255,0.06)",text:"#fff",muted:"rgba(255,255,255,0.38)",faint:"rgba(255,255,255,0.04)"},light:{card:"#fff",border:"rgba(15,5,32,0.07)",text:"#0D0918",muted:"rgba(13,9,24,0.45)",faint:"rgba(15,5,32,0.03)"}};

const REPORTS = [
  {id:"revenue",     icon:BarChart2,   label:"Revenue Report",     desc:"Total sales, refunds, net revenue by period",    color:V.v400},
  {id:"orders",      icon:ShoppingCart,label:"Orders Report",       desc:"All orders with status, items, and fulfillment",  color:"#06B6D4"},
  {id:"customers",   icon:Users,       label:"Customers Report",    desc:"Customer list with LTV, order history, location", color:V.green},
  {id:"products",    icon:Package,     label:"Products Report",     desc:"Stock levels, sales velocity, dead stock",         color:"#F59E0B"},
  {id:"inventory",   icon:Package,     label:"Inventory Export",    desc:"Current stock for all products and variants",      color:"#EC4899"},
  {id:"tax",         icon:FileText,    label:"Tax & VAT Report",    desc:"Tax collected by country/period for filing",       color:"#EF4444"},
];

export default function ReportsPage(){
  const{theme}=useTheme();const isDark=theme==="dark";const t=isDark?TM.dark:TM.light;
  const storeId=useAuthStore(s=>s.user?.stores?.[0]?.id);
  const[period,setPeriod]=useState("30");
  const[format,setFormat]=useState<"csv"|"xlsx">("csv");
  const[done,setDone]=useState<string[]>([]);

  const exportMut=useMutation({
    mutationFn:async(reportId:string)=>{
      const r=await api.get(`/reports/${storeId}/${reportId}?period=${period}&format=${format}`,{responseType:"blob"});
      const url=URL.createObjectURL(r.data);
      const a=document.createElement("a");
      a.href=url;a.download=`dropos-${reportId}-${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();URL.revokeObjectURL(url);
      return reportId;
    },
    onSuccess:(id)=>{toast.success("Export downloaded!");setDone(d=>[...d,id]);setTimeout(()=>setDone(d=>d.filter(x=>x!==id)),3000);},
    onError:()=>toast.error("Backend offline — enable Render to export"),
  });

  return(<div className="max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-start justify-between gap-4 mb-6">
      <div><h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{color:t.text}}>Reports</h1>
      <p className="text-xs sm:text-sm mt-1" style={{color:t.muted}}>Export your store data for analysis, tax filing, or accounting</p></div>
    </motion.div>

    {/* Options */}
    <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{color:t.muted}}>Period</p>
        <select value={period} onChange={e=>setPeriod(e.target.value)} className="px-3 py-2 rounded-xl text-xs outline-none cursor-pointer" style={{background:t.faint,border:`1px solid ${t.border}`,color:t.text,fontFamily:"inherit"}}>
          <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">This year</option><option value="all">All time</option>
        </select>
      </div>
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{color:t.muted}}>Format</p>
        <div className="flex gap-1">
          {(["csv","xlsx"] as const).map(f=>(
            <button key={f} onClick={()=>setFormat(f)} className="px-3 py-2 rounded-xl text-xs font-bold uppercase" style={{background:format===f?V.v500:t.faint,color:format===f?"#fff":t.muted,border:`1px solid ${format===f?V.v500:t.border}`,cursor:"pointer"}}>{f}</button>
          ))}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 text-xs" style={{color:t.muted}}>
        <Zap size={11} color={V.v400}/><span style={{color:V.v300}}>KIRO can analyse any exported report</span>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-3">
      {REPORTS.map((report,i)=>{
        const loading=exportMut.isPending&&exportMut.variables===report.id;
        const downloaded=done.includes(report.id);
        return(
          <motion.div key={report.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="flex items-center gap-4 p-4 rounded-2xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${report.color}15`}}>
              <report.icon size={16} style={{color:report.color}}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{color:t.text}}>{report.label}</p>
              <p className="text-xs" style={{color:t.muted}}>{report.desc}</p>
            </div>
            <button onClick={()=>exportMut.mutate(report.id)} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0"
              style={{background:downloaded?"rgba(16,185,129,0.1)":t.faint,color:downloaded?V.green:t.muted,border:`1px solid ${downloaded?"rgba(16,185,129,0.3)":t.border}`,cursor:"pointer"}}>
              {loading?<Loader2 size={12} className="animate-spin"/>:downloaded?<Check size={12}/>:<Download size={12}/>}
              {loading?"Exporting...":downloaded?"Downloaded":"Export"}
            </button>
          </motion.div>
        );
      })}
    </div>
  </div>);
}