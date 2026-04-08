"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Package, ShoppingCart,
  BarChart2, Settings, Bell, LogOut, TrendingUp,
  Tag, Truck, Palette, Users, Download, Eye,
  CreditCard, Key, Flame, ChevronRight, Menu, X,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";
import { notificationAPI } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";

const NAV = [
  {
    items: [
      { href: "/dashboard/kai",      icon: Zap,             label: "KAI",       ai: true },
      { href: "/dashboard",          icon: LayoutDashboard, label: "Overview",  exact: true },
    ],
  },
  {
    group: "Store",
    items: [
      { href: "/dashboard/products",  icon: Package,      label: "Products"    },
      { href: "/dashboard/orders",    icon: ShoppingCart, label: "Orders"      },
      { href: "/dashboard/customers", icon: Users,        label: "Customers"   },
      { href: "/dashboard/import",    icon: Download,     label: "Import"      },
      { href: "/dashboard/customize", icon: Palette,      label: "Store Design"},
      { href: "/dashboard/suppliers", icon: Truck,        label: "Suppliers"   },
    ],
  },
  {
    group: "Grow",
    items: [
      { href: "/dashboard/analytics",   icon: BarChart2,  label: "Analytics"   },
      { href: "/dashboard/top-products",icon: TrendingUp, label: "Top Products"},
      { href: "/dashboard/ad-spy",      icon: Eye,        label: "Ad Spy"      },
      { href: "/dashboard/coupons",     icon: Tag,        label: "Discounts"   },
      { href: "/dashboard/flash-sales", icon: Flame,      label: "Flash Sales" },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/dashboard/billing",   icon: CreditCard,   label: "Billing"     },
      { href: "/dashboard/settings",  icon: Settings,     label: "Settings"    },
      { href: "/dashboard/api-keys",  icon: Key,          label: "API Keys"    },
    ],
  },
];

const PLAN: Record<string, { color: string; glow: string }> = {
  FREE:     { color: "#6b7280",   glow: "rgba(107,114,128,0.3)"  },
  STARTER:  { color: "#60a5fa",   glow: "rgba(96,165,250,0.3)"   },
  GROWTH:   { color: "#34d399",   glow: "rgba(52,211,153,0.3)"   },
  PRO:      { color: "#a78bfa",   glow: "rgba(167,139,250,0.3)"  },
  ADVANCED: { color: "#f59e0b",   glow: "rgba(245,158,11,0.3)"   },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout   = useLogout();
  const [mob, setMob] = useState(false);

  const { data: nc } = useQuery({
    queryKey: ["nc"],
    queryFn:  async () => { const r = await notificationAPI.getCount(); return r.data.data?.count || 0; },
    refetchInterval: 60000,
  });

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || (pathname.startsWith(href) && href !== "/dashboard");

  const plan = user?.subscription?.plan || "FREE";
  const planStyle = PLAN[plan] || PLAN.FREE;

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full select-none">

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4c1d95)", boxShadow: "0 0 24px rgba(124,58,237,0.5)" }}>
            <Zap size={17} fill="#fff" color="#fff" />
          </div>
          <span className="font-black text-[17px] tracking-tight">
            <span className="text-white">Drop</span><span style={{ color: "#a78bfa" }}>OS</span>
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl"
            style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)" }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4" style={{ scrollbarWidth: "none" }}>
        {NAV.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-5" : ""}>
            {section.group && (
              <p className="px-3 mb-2 font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.2)", fontSize: "9.5px", letterSpacing: "0.14em" }}>
                {section.group}
              </p>
            )}
            {section.items.map(item => {
              const isActive = active(item.href, (item as any).exact);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <motion.div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 relative overflow-hidden"
                    style={{
                      background: isActive
                        ? (item as any).ai ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.07)"
                        : "transparent",
                      border: isActive
                        ? (item as any).ai ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.07)"
                        : "1px solid transparent",
                    }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}>

                    {/* Icon */}
                    <div className="w-[30px] h-[30px] rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isActive ? (item as any).ai ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)" }}>
                      <Icon size={14}
                        style={{ color: isActive ? (item as any).ai ? "#a78bfa" : "#fff" : "rgba(255,255,255,0.4)" }} />
                    </div>

                    {/* Label */}
                    <span className="text-sm flex-1"
                      style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: isActive ? 500 : 400 }}>
                      {item.label}
                    </span>

                    {/* AI tag */}
                    {(item as any).ai && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(124,58,237,0.25)", color: "#a78bfa", fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em" }}>
                        AI
                      </span>
                    )}

                    {/* Active glow */}
                    {isActive && (item as any).ai && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at left, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-2">
        {/* Notifications */}
        <Link href="/dashboard/notifications" onClick={onClose}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl relative"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-[30px] h-[30px] rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <Bell size={14} style={{ color: "rgba(255,255,255,0.45)" }} />
              {(nc || 0) > 0 && (
                <div className="absolute top-2.5 left-[38px] w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "#f87171", fontSize: "9px", color: "#fff", fontWeight: 700 }}>
                  {(nc || 0) > 9 ? "9+" : nc}
                </div>
              )}
            </div>
            <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>Notifications</span>
          </div>
        </Link>

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-[30px] h-[30px] rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate leading-tight">{user?.name}</p>
            <span className="text-xs" style={{ color: planStyle.color, fontSize: "10px" }}>{plan}</span>
          </div>
          <button onClick={() => { logout(); onClose?.(); }}
            className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.25)" }}>
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#07070e" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 h-full"
        style={{ background: "#0b0b18", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mob && (
          <>
            <motion.div className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(0,0,0,0.7)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMob(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-64 md:hidden"
              style={{ background: "#0b0b18", borderRight: "1px solid rgba(255,255,255,0.06)" }}
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}>
              <Sidebar onClose={() => setMob(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden flex-shrink-0"
          style={{ background: "#0b0b18", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setMob(true)}>
            <Menu size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
          <span className="font-black text-base">
            <span className="text-white">Drop</span><span style={{ color: "#a78bfa" }}>OS</span>
          </span>
          <Link href="/dashboard/notifications">
            <div className="relative">
              <Bell size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
              {(nc || 0) > 0 && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ background: "#f87171", fontSize: "8px", color: "#fff", fontWeight: 700 }}>
                  {nc}
                </div>
              )}
            </div>
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
