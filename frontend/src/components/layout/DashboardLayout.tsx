"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, BarChart2, Package, ShoppingCart, Users, Activity,
  LifeBuoy, Settings, Bell, Menu, LogOut, Shield, CreditCard,
  ChevronDown, Tag, Truck, Palette, FileText, Store, Mail,
  X, TrendingUp, Home, ChevronRight, Globe, Percent,
  Gift, RefreshCw, RotateCcw, Key, Webhook, TrendingDown,
  Flame, Lock, Repeat, Download, MessageCircle, Archive, Layers,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useLogout } from "../../hooks/useAuth";
import { Logo } from "../Logo";
import { notificationAPI } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { MobileBottomNav } from "./MobileBottomNav";
import { ThemeToggle } from "../ui/ThemeToggle";

const OWNER_NAV = [
  { group: "Overview", items: [
    { href: "/dashboard",           icon: Home,         label: "Dashboard"   },
  ]},
  { group: "Store", items: [
    { href: "/dashboard/stores",    icon: Store,        label: "My Stores"   },
    { href: "/dashboard/products",  icon: Package,      label: "Products"    },
    { href: "/dashboard/inventory", icon: BarChart2,    label: "Inventory"   },
    { href: "/dashboard/customize", icon: Palette,      label: "Customize"   },
    { href: "/dashboard/currency",  icon: Globe,        label: "Currency"    },
    { href: "/dashboard/suppliers",          icon: Truck,   label: "Suppliers"         },
    { href: "/dashboard/supplier-assignment", icon: Layers,  label: "Supplier Assignment" },
    { href: "/dashboard/import",    icon: Download,     label: "Import"      },
    { href: "/dashboard/chat",      icon: MessageCircle, label: "Chat & Contact" },
    { href: "/dashboard/backup",    icon: Archive,      label: "Backup & Export" },
  ]},
  { group: "Sales", items: [
    { href: "/dashboard/orders",       icon: ShoppingCart, label: "Orders"         },
    { href: "/dashboard/customers",    icon: Users,        label: "Customers"      },
    { href: "/dashboard/shipping",     icon: Truck,        label: "Shipping"       },
    { href: "/dashboard/refunds",      icon: RefreshCw,    label: "Refunds"        },
    { href: "/dashboard/returns",      icon: RotateCcw,    label: "Returns"        },
    { href: "/dashboard/subscriptions",icon: Repeat,       label: "Subscriptions"  },
  ]},
  { group: "Marketing", items: [
    { href: "/dashboard/coupons",         icon: Tag,         label: "Coupons"        },
    { href: "/dashboard/discounts",       icon: Percent,     label: "Discounts"      },
    { href: "/dashboard/flash-sales",     icon: Flame,       label: "Flash Sales"    },
    { href: "/dashboard/gift-cards",      icon: Gift,        label: "Gift Cards"     },
    { href: "/dashboard/affiliates",      icon: Users,       label: "Affiliates"     },
    { href: "/dashboard/reviews",         icon: FileText,    label: "Reviews"        },
    { href: "/dashboard/emails",          icon: Mail,        label: "Emails"         },
    { href: "/dashboard/notifications",   icon: Bell,        label: "Notifications"  },
    { href: "/dashboard/abandoned-carts", icon: ShoppingCart,label: "Abandoned Carts"},
  ]},
  { group: "Insights", items: [
    { href: "/dashboard/analytics",    icon: Activity,     label: "Analytics"      },
    { href: "/dashboard/funnel",       icon: TrendingDown, label: "Funnel & UTM"   },
    { href: "/dashboard/reports",      icon: TrendingUp,   label: "Reports"        },
  ]},
  { group: "Developers", items: [
    { href: "/dashboard/api-keys",     icon: Key,          label: "API Keys"       },
    { href: "/dashboard/webhooks",     icon: Webhook,      label: "Webhooks"       },
  ]},
  { group: "Account", items: [
    { href: "/dashboard/billing",      icon: CreditCard,   label: "Billing"        },
    { href: "/dashboard/support",      icon: LifeBuoy,     label: "Support"        },
    { href: "/dashboard/settings",     icon: Settings,     label: "Settings"       },
  ]},
];

const ADMIN_NAV = [
  { group: "Platform", items: [
    { href: "/admin",           icon: Home,     label: "Overview"  },
    { href: "/admin/analytics", icon: Activity, label: "Analytics" },
  ]},
  { group: "Management", items: [
    { href: "/admin/users",    icon: Users,      label: "All Users" },
    { href: "/admin/payments", icon: CreditCard, label: "Payments"  },
    { href: "/admin/support",  icon: LifeBuoy,   label: "Support"   },
  ]},
  { group: "System", items: [
    { href: "/admin/error-logs", icon: Shield,   label: "Error Logs" },
    { href: "/admin/audit-logs",  icon: Shield,   label: "Audit Logs" },
    { href: "/admin/settings",   icon: Settings, label: "Settings"   },
  ]},
];

function NavGroup({ group, items, pathname, collapsed }: {
  group: string; items: any[]; pathname: string; collapsed: boolean;
}) {
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(href));
  const isGroupActive = items.some(i => isActive(i.href));
  const [open, setOpen] = useState(isGroupActive);
  useEffect(() => { if (isGroupActive) setOpen(true); }, [pathname]);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-0.5 py-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} title={label}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
              style={{
                color:      active ? "var(--nav-active-text)" : "var(--nav-text)",
                background: active ? "var(--nav-active-bg)"   : "transparent",
                boxShadow:  active ? "var(--glow-accent)"     : "none",
              }}>
              <Icon size={15} />
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg">
        <span className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: isGroupActive ? "var(--accent)" : "var(--text-tertiary)" }}>
          {group}
        </span>
        <ChevronDown size={10}
          className={"transition-transform duration-200 " + (open ? "rotate-0" : "-rotate-90")}
          style={{ color: isGroupActive ? "var(--accent)" : "var(--text-tertiary)" }} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden">
            <div className="pb-1 space-y-0.5 pt-0.5">
              {items.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href}
                    className="flex items-center gap-2.5 px-3 py-[7px] rounded-xl text-[13px] transition-all border"
                    style={{
                      color:       active ? "var(--nav-active-text)"   : "var(--nav-text)",
                      background:  active ? "var(--nav-active-bg)"     : "transparent",
                      borderColor: active ? "var(--nav-active-border)" : "transparent",
                      fontWeight:  active ? 600 : 500,
                      boxShadow:   active ? "var(--glow-accent)"       : "none",
                    }}>
                    <Icon size={14} className="flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "var(--nav-active-text)" }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Props { children: React.ReactNode; isAdmin?: boolean; }

export default function DashboardLayout({ children, isAdmin = false }: Props) {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const user     = useAuthStore(s => s.user);
  const logout   = useLogout();
  const router   = useRouter();

  const { data: notifCount = 0 } = useQuery({
    queryKey: ["notif-count"],
    queryFn:  async () => { const r = await notificationAPI.getCount(); return r.data.data?.count || 0; },
    refetchInterval: 30000,
  });

  useEffect(() => { if (!user) router.push("/auth/login"); }, [user, router]);
  useEffect(() => setMobileOpen(false), [pathname]);

  const navGroups  = isAdmin ? ADMIN_NAV : OWNER_NAV;
  const plan       = user?.subscription?.plan || "STARTER";
  const planColor  = plan === "ADVANCED" ? "var(--warning)" : plan === "PRO" ? "var(--accent)" : "var(--text-tertiary)";
  const breadcrumb = pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "dashboard";

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--sidebar-border)" }}>
        {collapsed && !mobile
          ? <Logo variant="dark" size="sm" iconOnly />
          : <Logo variant="dark" size="sm" />
        }
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 rounded"
            style={{ color: "var(--text-tertiary)" }}>
            <X size={15} />
          </button>
        )}
        {!mobile && !collapsed && (
          <button onClick={() => setCollapsed(true)} className="ml-auto p-1 rounded transition-colors"
            style={{ color: "var(--text-tertiary)" }}>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Admin badge */}
      {isAdmin && (!collapsed || mobile) && (
        <div className="mx-3 mt-3 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
          style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
          <Shield size={11} style={{ color: "var(--accent)" }} />
          <span className="text-[10px] font-black tracking-wide" style={{ color: "var(--accent)" }}>SUPER ADMIN</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navGroups.map(g => (
          <NavGroup key={g.group} group={g.group} items={g.items}
            pathname={pathname} collapsed={collapsed && !mobile} />
        ))}
      </nav>

      {/* Bottom: theme toggle + user */}
      <div className="p-2 border-t flex-shrink-0 space-y-2"
        style={{ borderColor: "var(--sidebar-border)" }}>
        {/* Theme toggle */}
        {(!collapsed || mobile) ? (
          <div className="px-1">
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex justify-center">
            <ThemeToggle compact />
          </div>
        )}

        {/* User row */}
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-primary)] text-xs font-black flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)" }}>
              {user?.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold truncate leading-tight"
                style={{ color: "var(--text-primary)" }}>{user?.name}</div>
              <div className="text-[10px] font-bold truncate"
                style={{ color: planColor }}>{isAdmin ? "Admin" : plan}</div>
            </div>
            <button onClick={() => logout.mutate()} title="Sign out"
              className="p-1 rounded transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--error)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"}>
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button onClick={() => logout.mutate()}
            className="w-full flex justify-center p-2.5 rounded-xl transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--error)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"}>
            <LogOut size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "var(--bg-overlay)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden border-r"
            style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>
            <SidebarContent mobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside animate={{ width: collapsed ? 52 : 216 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col flex-shrink-0 border-r overflow-hidden"
        style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>
        <SidebarContent />
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b flex-shrink-0"
          style={{
            background:     "var(--topbar-bg)",
            backdropFilter: "blur(20px)",
            borderColor:    "var(--border)",
          }}>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg transition-all"
              style={{ color: "var(--text-tertiary)" }}>
              <Menu size={16} />
            </button>
            {collapsed && (
              <button onClick={() => setCollapsed(false)}
                className="hidden lg:flex p-2 rounded-lg transition-all"
                style={{ color: "var(--text-tertiary)" }}>
                <Menu size={16} />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px]"
              style={{ color: "var(--text-tertiary)" }}>
              <span>{isAdmin ? "Admin" : "Dashboard"}</span>
              {pathname.split("/").filter(Boolean).length > 1 && (
                <><ChevronRight size={10} />
                <span className="capitalize font-semibold"
                  style={{ color: "var(--text-secondary)" }}>{breadcrumb}</span></>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isAdmin && user?.stores?.[0] && (
              <Link href={"/store/" + user.stores[0].slug} target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{ color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-secondary)"; el.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-tertiary)"; }}>
                <Store size={11} /> View Store
              </Link>
            )}
            <Link href={isAdmin ? "/admin/support" : "/dashboard/notifications"}
              className="relative p-2 rounded-lg transition-all"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <Bell size={15} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent)", boxShadow: "var(--glow-accent)" }} />
              )}
            </Link>
            {isAdmin && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black"
                style={{ color: "var(--accent)", border: "1px solid var(--accent-border)", background: "var(--accent-dim)" }}>
                <Shield size={10} /> Admin
              </div>
            )}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-primary)] text-[11px] font-black cursor-pointer"
              style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
              {user?.name?.charAt(0) || "?"}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg-base)" }}>
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto p-5">
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
