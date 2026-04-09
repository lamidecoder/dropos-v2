"use client";
// Path: frontend/src/components/layout/DashboardLayout.tsx
// All 37 nav items · Collapsible groups · Admin/User separation · Fixed logout

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Package, ShoppingCart, Users,
  BarChart2, Settings, Bell, LogOut, TrendingUp, Store,
  Tag, Truck, Palette, Download, Eye, CreditCard, Key,
  Flame, Globe, Layers, RefreshCw, RotateCcw, Repeat,
  Gift, MessageSquare, Mail, Archive, Activity, TrendingDown,
  FileText, Webhook, LifeBuoy, ChevronDown, Menu, X,
  MessageCircle, Percent, Star, Shield,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { notificationAPI } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";

// ── OWNER NAV — all 37 items ──────────────────────────────────
const OWNER_NAV = [
  {
    id: "top", label: null, alwaysOpen: true,
    items: [
      { href: "/dashboard/kai",      icon: Zap,             label: "KIRO",     ai: true },
      { href: "/dashboard",          icon: LayoutDashboard, label: "Overview", exact: true },
    ],
  },
  {
    id: "store", label: "Store",
    items: [
      { href: "/dashboard/stores",              icon: Store,         label: "My Stores"            },
      { href: "/dashboard/products",            icon: Package,       label: "Products"             },
      { href: "/dashboard/orders",              icon: ShoppingCart,  label: "Orders"               },
      { href: "/dashboard/customers",           icon: Users,         label: "Customers"            },
      { href: "/dashboard/inventory",           icon: BarChart2,     label: "Inventory"            },
      { href: "/dashboard/import",              icon: Download,      label: "Import Product"       },
      { href: "/dashboard/customize",           icon: Palette,       label: "Store Design"         },
      { href: "/dashboard/editor",              icon: Layers,        label: "Store Editor", special: true },
      { href: "/dashboard/suppliers",           icon: Truck,         label: "Suppliers"            },
      { href: "/dashboard/supplier-assignment", icon: Truck,         label: "Supplier Assignment"  },
      { href: "/dashboard/currency",            icon: Globe,         label: "Currency"             },
      { href: "/dashboard/chat",                icon: MessageCircle, label: "Chat & Contact"       },
      { href: "/dashboard/backup",              icon: Archive,       label: "Backup & Export"      },
    ],
  },
  {
    id: "sales", label: "Sales",
    items: [
      { href: "/dashboard/shipping",      icon: Truck,       label: "Shipping"      },
      { href: "/dashboard/refunds",       icon: RefreshCw,   label: "Refunds"       },
      { href: "/dashboard/returns",       icon: RotateCcw,   label: "Returns"       },
      { href: "/dashboard/subscriptions", icon: Repeat,      label: "Subscriptions" },
    ],
  },
  {
    id: "marketing", label: "Marketing",
    items: [
      { href: "/dashboard/coupons",         icon: Tag,          label: "Coupons"         },
      { href: "/dashboard/discounts",       icon: Percent,      label: "Discounts"       },
      { href: "/dashboard/flash-sales",     icon: Flame,        label: "Flash Sales"     },
      { href: "/dashboard/gift-cards",      icon: Gift,         label: "Gift Cards"      },
      { href: "/dashboard/group-buys",      icon: Users,        label: "Group Buying", special: true },
      { href: "/dashboard/affiliates",      icon: Star,         label: "Affiliates"      },
      { href: "/dashboard/reviews",         icon: MessageSquare,label: "Reviews"         },
      { href: "/dashboard/emails",          icon: Mail,         label: "Emails"          },
      { href: "/dashboard/abandoned-carts", icon: ShoppingCart, label: "Abandoned Carts" },
    ],
  },
  {
    id: "intelligence", label: "Intelligence",
    items: [
      { href: "/dashboard/analytics",    icon: Activity,     label: "Analytics"    },
      { href: "/dashboard/top-products", icon: TrendingUp,   label: "Daily Top 10" },
      { href: "/dashboard/ad-spy",       icon: Eye,          label: "Ad Spy"       },
      { href: "/dashboard/funnel",       icon: TrendingDown, label: "Funnel & UTM" },
      { href: "/dashboard/reports",      icon: FileText,     label: "Reports"      },
    ],
  },
  {
    id: "developers", label: "Developers",
    items: [
      { href: "/dashboard/api-keys", icon: Key,     label: "API Keys"  },
      { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks"  },
    ],
  },
  {
    id: "account", label: "Account",
    items: [
      { href: "/dashboard/billing",       icon: CreditCard, label: "Billing"       },
      { href: "/dashboard/notifications", icon: Bell,       label: "Notifications" },
      { href: "/dashboard/support",       icon: LifeBuoy,   label: "Support"       },
      { href: "/dashboard/settings",      icon: Settings,   label: "Settings"      },
    ],
  },
];

// ── ADMIN NAV — separate, different items ─────────────────────
const ADMIN_NAV = [
  {
    id: "top", label: null, alwaysOpen: true,
    items: [
      { href: "/admin",           icon: LayoutDashboard, label: "Overview",  exact: true },
      { href: "/admin/analytics", icon: Activity,        label: "Analytics"  },
    ],
  },
  {
    id: "management", label: "Management",
    items: [
      { href: "/admin/users",    icon: Users,      label: "All Users"  },
      { href: "/admin/payments", icon: CreditCard, label: "Payments"   },
      { href: "/admin/support",  icon: LifeBuoy,   label: "Support"    },
    ],
  },
  {
    id: "system", label: "System",
    items: [
      { href: "/admin/error-logs", icon: Shield,   label: "Error Logs"  },
      { href: "/admin/audit-logs", icon: Shield,   label: "Audit Logs"  },
      { href: "/admin/settings",   icon: Settings, label: "Settings"    },
    ],
  },
];

const PLAN_COLORS: Record<string, string> = {
  FREE: "#6b7280", STARTER: "#60a5fa", GROWTH: "#34d399",
  PRO: "#a78bfa",  ADVANCED: "#f59e0b",
};

// ── Nav item ──────────────────────────────────────────────────
function NavItem({ item, isActive }: { item: any; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href}>
      <div
        className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-xl cursor-pointer transition-all relative"
        style={{
          background: isActive ? item.ai ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.08)" : "transparent",
          border:     isActive ? item.ai ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
            style={{ background: item.ai ? "#a78bfa" : "rgba(255,255,255,0.5)" }} />
        )}
        <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: isActive ? item.ai ? "rgba(124,58,237,0.32)" : "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" }}>
          <Icon size={12} style={{ color: isActive ? item.ai ? "#a78bfa" : "#fff" : "rgba(255,255,255,0.4)" }} />
        </div>
        <span className="text-[12.5px] flex-1 truncate"
          style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.52)", fontWeight: isActive ? 500 : 400 }}>
          {item.label}
        </span>
        {item.ai && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(124,58,237,0.28)", color: "#a78bfa" }}>AI</span>
        )}
        {item.special && !item.ai && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>NEW</span>
        )}
      </div>
    </Link>
  );
}

// ── Collapsible group ─────────────────────────────────────────
function NavGroup({ group, pathname }: { group: any; pathname: string }) {
  const isActive = (item: any) =>
    item.exact ? pathname === item.href
      : pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/admin");

  const groupActive = group.items.some(isActive);
  const [open, setOpen] = useState(groupActive);
  const GroupIcon = group.icon;

  if (group.alwaysOpen) {
    return (
      <div className="space-y-0.5 mb-3">
        {group.items.map((item: any) => (
          <NavItem key={item.href} item={item} isActive={isActive(item)} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl mb-0.5 transition-all"
        style={{ color: groupActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.28)" }}>
        <span className="text-[10px] font-semibold uppercase tracking-widest flex-1 text-left"
          style={{ letterSpacing: "0.13em" }}>
          {group.label}
        </span>
        {!open && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
            {group.items.length}
          </span>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={10} style={{ color: "rgba(255,255,255,0.25)" }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}>
            <div className="space-y-0.5 pl-1 pb-1">
              {group.items.map((item: any) => (
                <NavItem key={item.href} item={item} isActive={isActive(item)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const user       = useAuthStore(s => s.user);
  const _logout    = useAuthStore(s => s.logout);
  const [mob, setMob] = useState(false);

  const logout = () => {
    _logout();
    if (typeof window !== "undefined") window.location.href = "/auth/login";
  };

  const isAdmin = user?.role === "SUPER_ADMIN";
  const navGroups = isAdmin ? ADMIN_NAV : OWNER_NAV;

  const { data: nc } = useQuery({
    queryKey: ["nc"],
    queryFn: async () => { const r = await notificationAPI.getCount(); return r.data.data?.count || 0; },
    refetchInterval: 60000,
  });

  const plan      = user?.subscription?.plan || "FREE";
  const planColor = PLAN_COLORS[plan] || PLAN_COLORS.FREE;

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-5 pb-3.5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={onClose}
          className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4c1d95)", boxShadow: "0 0 20px rgba(124,58,237,0.45)" }}>
            <Zap size={16} fill="white" color="white" />
          </div>
          <span className="font-black text-[16px]">
            <span className="text-white">Drop</span>
            <span style={{ color: "#a78bfa" }}>OS</span>
          </span>
        </Link>
        {isAdmin && (
          <span className="text-[9px] font-bold px-2 py-1 rounded-full"
            style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
            ADMIN
          </span>
        )}
        {onClose && (
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "none" }}>
        {navGroups.map(group => (
          <NavGroup key={group.id} group={group} pathname={pathname} />
        ))}
      </div>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2 space-y-1.5 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/dashboard/notifications" onClick={onClose}>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center relative"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <Bell size={12} style={{ color: "rgba(255,255,255,0.45)" }} />
              {(nc || 0) > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "#f87171", fontSize: "8px" }}>
                  {(nc || 0) > 9 ? "9+" : nc}
                </div>
              )}
            </div>
            <span className="text-[12.5px] flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>Notifications</span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white truncate leading-tight">{user?.name}</p>
            <p className="text-[10px]" style={{ color: planColor }}>{isAdmin ? "Super Admin" : plan}</p>
          </div>
          <button onClick={() => { logout(); onClose?.(); }}
            className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.25)" }}>
            <LogOut size={11} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#07070e" }}>
      <aside className="hidden md:flex flex-col w-[215px] flex-shrink-0 h-full"
        style={{ background: "#0b0b18", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <Sidebar />
      </aside>

      <AnimatePresence>
        {mob && (
          <>
            <motion.div className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMob(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-[215px] flex flex-col md:hidden"
              style={{ background: "#0b0b18", borderRight: "1px solid rgba(255,255,255,0.06)" }}
              initial={{ x: -215 }} animate={{ x: 0 }} exit={{ x: -215 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}>
              <Sidebar onClose={() => setMob(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 md:hidden flex-shrink-0"
          style={{ background: "#0b0b18", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setMob(true)}>
            <Menu size={19} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
          <span className="font-black text-[15px]">
            <span className="text-white">Drop</span>
            <span style={{ color: "#a78bfa" }}>OS</span>
          </span>
          <Link href="/dashboard/notifications">
            <div className="relative">
              <Bell size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
              {(nc || 0) > 0 && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "#f87171", fontSize: "8px" }}>{nc}</div>
              )}
            </div>
          </Link>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}