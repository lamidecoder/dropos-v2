"use client";
﻿"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import {
  Download, Package, Users, ShoppingCart, BarChart2,
  Archive, RefreshCw, CheckCircle, Clock, AlertCircle,
  FileText, Database, Shield, ChevronRight, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const tx   = "[color:var(--text-primary)]";
const sub  = "text-secondary";
const card = "[background:var(--bg-secondary)] [border-color:var(--border)]";

type ExportType = "orders" | "products" | "customers";

const EXPORTS: { type: ExportType; label: string; desc: string; icon: typeof Package; color: string }[] = [
  { type: "orders",    label: "Orders",    icon: ShoppingCart, desc: "All orders with line items, status, customer info", color: "#7c3aed" },
  { type: "products",  label: "Products",  icon: Package,      desc: "Product catalog with images, prices, inventory",    color: "#0ea5e9" },
  { type: "customers", label: "Customers", icon: Users,        desc: "Customer list with contact info and order history", color: "#10b981" },
];

export default function BackupPage() {
  const user    = useAuthStore(s => s.user);
  const storeId = user?.stores?.[0]?.id;
  const [downloading, setDownloading] = useState<ExportType | null>(null);

  const { data: stats , isLoading } = useQuery({
    queryKey: ["store-stats", storeId],
    queryFn:  () => api.get(`/analytics/${storeId}?period=30d`).then(r => r.data.data),
    enabled:  !!storeId,
  });

  const handleExport = async (type: ExportType) => {
    if (!storeId) return;
    setDownloading(type);
    try {
      const res = await api.get(`/ops/export/${storeId}?type=${type}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${type}-export-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} exported successfully`);
    } catch {
      toast.error("Export failed");
    } finally {
      setDownloading(null);
    }
  };

  const handleFullBackup = async () => {
    if (!storeId) return;
    setDownloading("orders"); // use as loading indicator
    try {
      // Export all three sequentially
      for (const type of ["orders", "products", "customers"] as ExportType[]) {
        const res = await api.get(`/ops/export/${storeId}?type=${type}`, { responseType: "blob" });
        const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
        const a   = document.createElement("a");
        a.href     = url;
        a.download = `${type}-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        await new Promise(r => setTimeout(r, 400));
      }
      toast.success("Full backup downloaded (3 CSV files)");
    } catch {
      toast.error("Backup failed");
    } finally {
      setDownloading(null);
    }
  };

  return (
    
      <div className="space-y-6 max-w-3xl mx-auto">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${tx}`}>Backup & Export</h1>
          <p className={`text-sm mt-1 ${sub}`}>Download your store data as CSV files anytime</p>
        </div>

        {/* Store snapshot */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Database size={16} className="text-[var(--text-primary)]" />
            </div>
            <div>
              <p className={`font-bold ${tx}`}>{user?.stores?.[0]?.name || "Your Store"}</p>
              <p className={`text-xs ${sub}`}>Data snapshot</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle size={10} /> Up to date
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Orders",    value: stats?.totalOrders   ?? "-", icon: ShoppingCart },
              { label: "Total Products",  value: stats?.totalProducts ?? "-", icon: Package      },
              { label: "Total Customers", value: stats?.totalCustomers ?? "-", icon: Users        },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="[background:var(--bg-card)] rounded-xl p-3 text-center">
                <p className={`text-2xl font-black ${tx}`}>{value}</p>
                <p className={`text-xs ${sub} mt-0.5`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Full backup CTA */}
        <div className="rounded-2xl p-5 border"
          style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.08),rgba(168,85,247,0.05))", borderColor: "rgba(124,58,237,0.2)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-black text-base ${tx}`}>Full Store Backup</h3>
              <p className={`text-sm ${sub} mt-0.5`}>Download all 3 data files at once - orders, products, customers</p>
            </div>
            <button onClick={handleFullBackup} disabled={!!downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-primary)] disabled:opacity-50 flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
              {downloading ? "Exporting…" : "Backup All"}
            </button>
          </div>
        </div>

        {/* Individual exports */}
        <div>
          <h2 className={`text-sm font-black ${sub} uppercase tracking-wider mb-3`}>Export by Type</h2>
          <div className="space-y-2">
            {EXPORTS.map(({ type, label, desc, icon: Icon, color }) => (
              <div key={type} className={`rounded-2xl border p-4 ${card} flex items-center gap-4`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${tx}`}>{label} <span className={`font-normal text-xs ${sub}`}>CSV</span></p>
                  <p className={`text-xs ${sub} mt-0.5`}>{desc}</p>
                </div>
                <button onClick={() => handleExport(type)} disabled={!!downloading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 border transition-all hover:[background:var(--bg-card)]"
                  style={{ color, borderColor: `${color}30` }}>
                  {downloading === type ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  {downloading === type ? "Exporting…" : "Export"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* What's included */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <h3 className={`font-bold text-sm ${tx} mb-4 flex items-center gap-2`}>
            <FileText size={14} className="[color:var(--accent)]" /> What's included in each export
          </h3>
          <div className="space-y-3">
            {[
              { label: "Orders CSV",    fields: ["Order number", "Date", "Customer name & email", "Items", "Subtotal", "Shipping", "Total", "Status", "Tracking number"] },
              { label: "Products CSV",  fields: ["Product name", "SKU", "Price", "Compare price", "Category", "Status", "Inventory", "Images", "Description"] },
              { label: "Customers CSV", fields: ["Name", "Email", "Phone", "Total orders", "Total spent", "First order date", "Last order date"] },
            ].map(({ label, fields }) => (
              <div key={label}>
                <p className={`text-xs font-bold ${sub} mb-1.5`}>{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {fields.map(f => (
                    <span key={f} className="text-[11px] px-2 py-0.5 rounded-full [background:var(--bg-card)] [color:var(--text-secondary)]">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={`rounded-xl border p-4 ${card} flex items-start gap-3`}>
          <Shield size={14} className="text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className={`text-xs ${sub}`}>
            Exports contain only your store's data. Files are generated fresh on each download.
            We recommend backing up monthly or before making major changes.
          </p>
        </div>
      </div>
    
  );
}
