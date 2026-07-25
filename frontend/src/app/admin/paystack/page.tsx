"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../../../lib/api";
import { CreditCard, Check, ExternalLink, RefreshCw } from "lucide-react";

const fmt = (n:number) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n||0);

export default function AdminPaystackPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-paystack"],
    queryFn: () => api.get("/admin/paystack-subaccounts").then(r => r.data.data || []),
  });

  const subaccounts = data || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Paystack Subaccounts</h1>
          <p className="text-sm text-gray-500">{subaccounts.length} merchant bank accounts connected · All receiving 98% of sales</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm">
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Platform balance info */}
      <div className="p-5 rounded-2xl border mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <p className="text-sm font-bold mb-1">DropOS collects 2% from every transaction</p>
        <p className="text-xs text-gray-500">This settles daily to your Paystack account. Check Paystack dashboard for balance.</p>
        <a href="https://dashboard.paystack.com" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-purple-600">
          Open Paystack Dashboard <ExternalLink size={11}/>
        </a>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              {["Merchant","Bank","Account","Sub Code","Status"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({length:5}).map((_,i)=>(
              <tr key={i} className="border-b animate-pulse">
                {Array.from({length:5}).map((_,j)=>(
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-white/10 rounded"/></td>
                ))}
              </tr>
            )) : subaccounts.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                No subaccounts yet. Merchants appear here after connecting their bank account.
              </td></tr>
            ) : subaccounts.map((s:any) => (
              <motion.tr key={s.id} initial={{opacity:0}} animate={{opacity:1}}
                className="border-b hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-semibold">{s.store?.name || s.businessName}</p>
                  <p className="text-xs text-gray-400">{s.store?.owner?.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.bankName}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.accountNumber}</td>
                <td className="px-4 py-3 font-mono text-xs text-purple-600">{s.paystackSubCode}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <Check size={11}/> Active
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
