"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../../../lib/api";
import { Zap, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

const FLAGS = [
  { key:"kiro_ai",         label:"KIRO AI Chat",           desc:"Enable KIRO chat for all merchants" },
  { key:"ad_studio",       label:"Ad Studio",              desc:"AI-generated ad copy for all plans" },
  { key:"domain_purchase", label:"Domain Purchase",        desc:"Merchants can buy domains in-app" },
  { key:"start_business",  label:"Start a Business",       desc:"AI zero-to-business generator" },
  { key:"cj_fulfillment",  label:"CJ Auto-Fulfillment",    desc:"Automatic CJDropshipping fulfillment" },
  { key:"email_campaigns", label:"Email Campaigns",        desc:"Merchant email campaign feature" },
  { key:"flash_sales",     label:"Flash Sales",            desc:"Time-limited sales feature" },
  { key:"referral",        label:"Referral Program",       desc:"Merchant referral and commission" },
  { key:"store_grader",    label:"Store Grader",           desc:"AI store health scoring" },
];

export default function AdminFlagsPage() {
  const qc = useQueryClient();
  const { data: flags = {}, isLoading } = useQuery({
    queryKey: ["admin-flags"],
    queryFn: () => api.get("/admin/feature-flags").then(r => r.data.data || {}),
  });

  const toggleMut = useMutation({
    mutationFn: ({ flag, enabled }: { flag:string; enabled:boolean }) =>
      api.post("/admin/feature-flags", { flag, enabled }),
    onSuccess: () => { toast.success("Flag updated"); qc.invalidateQueries({ queryKey:["admin-flags"] }); },
    onError: () => toast.error("Update failed"),
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">Feature Flags</h1>
        <p className="text-sm text-gray-500">Toggle platform features on or off for all merchants</p>
      </div>

      <div className="flex flex-col gap-3">
        {FLAGS.map((f, i) => {
          const enabled = !!(flags as any)[f.key];
          return (
            <motion.div key={f.key} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className="flex items-center gap-4 p-4 rounded-2xl border bg-white dark:bg-white/5"
              style={{ borderColor: enabled ? "rgba(16,185,129,0.2)" : undefined }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${enabled?"bg-green-50":"bg-gray-50 dark:bg-white/10"}`}>
                <Zap size={16} className={enabled?"text-green-500":"text-gray-400"}/>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{f.label}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
              <button onClick={() => toggleMut.mutate({ flag:f.key, enabled:!enabled })}
                disabled={toggleMut.isPending}
                className="flex-shrink-0 transition-opacity" style={{ opacity:toggleMut.isPending?0.5:1 }}>
                {enabled
                  ? <ToggleRight size={32} className="text-green-500"/>
                  : <ToggleLeft size={32} className="text-gray-300"/>}
              </button>
            </motion.div>
          );
        })}
      </div>
      {isLoading && <p className="text-center text-sm text-gray-400 mt-8">Loading flags…</p>}
    </div>
  );
}
