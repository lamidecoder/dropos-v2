"use client";
// Path: frontend/src/components/layout/DashboardLayout.tsx
// World-class dashboard — light default, dark mode, app-like feel
// Dribbble / Awwwards quality

import { useState, useEffect, createContext, useContext, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Package, ShoppingCart, Users,
  BarChart2, Settings, Bell, LogOut, TrendingUp, Store,
  Tag, Truck, Palette, Download, Eye, CreditCard, Key,
  Flame, Globe, Layers, RefreshCw, RotateCcw, Repeat,
  Gift, MessageSquare, Mail, Archive, Activity, TrendingDown,
  FileText, Webhook, LifeBuoy, ChevronRight, Menu, X,
  MessageCircle, Percent, Star, Shield, Sun, Moon,
  Search, Command, ChevronDown, Sparkles, Wallet,
  AlertCircle, Check, Info, Zap as ZapIcon, ExternalLink,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

// ── THEME CONTEXT ─────────────────────────────────────────────
const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export function useTheme() { return useContext(ThemeContext); }

// ── NAV STRUCTURE ─────────────────────────────────────────────
const OWNER_NAV = [
  {
    id: "top", label: null, alwaysOpen: true,
    items: [
      { href: "/dashboard/kai", icon: Zap, label: "KIRO", ai: true, desc: "Your AI co-pilot" },
      { href: "/dashboard",     icon: LayoutDashboard, label: "Overview", exact: true },
    ],
  },
  {
    id: "store", label: "Store",
    items: [
      { href: "/dashboard/stores",              icon: Store,          label: "My Stores"           },
      { href: "/dashboard/products",            icon: Package,        label: "Products"            },
      { href: "/dashboard/orders",              icon: ShoppingCart,   label: "Orders"              },
      { href: "/dashboard/customers",           icon: Users,          label: "Customers"           },
      { href: "/dashboard/inventory",           icon: BarChart2,      label: "Inventory"           },
      { href: "/dashboard/import",              icon: Download,       label: "Import Product"      },
      { href: "/dashboard/customize",           icon: Palette,        label: "Store Design"        },
      { href: "/dashboard/editor",              icon: Layers,         label: "Store Editor", badge: "PRO" },
      { href: "/dashboard/suppliers",           icon: Truck,          label: "Suppliers"           },
      { href: "/dashboard/currency",            icon: Globe,          label: "Currency"            },
    ],
  },
  {
    id: "sales", label: "Sales",
    items: [
      { href: "/dashboard/shipping",      icon: Truck,      label: "Shipping"      },
      { href: "/dashboard/refunds",       icon: RefreshCw,  label: "Refunds"       },
      { href: "/dashboard/returns",       icon: RotateCcw,  label: "Returns"       },
      { href: "/dashboard/subscriptions", icon: Repeat,     label: "Subscriptions" },
    ],
  },
  {
    id: "marketing", label: "Marketing",
    items: [
      { href: "/dashboard/coupons",         icon: Tag,           label: "Coupons"         },
      { href: "/dashboard/discounts",       icon: Percent,       label: "Discounts"       },
      { href: "/dashboard/flash-sales",     icon: Flame,         label: "Flash Sales"     },
      { href: "/dashboard/gift-cards",      icon: Gift,          label: "Gift Cards"      },
      { href: "/dashboard/affiliates",      icon: Star,          label: "Affiliates"      },
      { href: "/dashboard/reviews",         icon: MessageSquare, label: "Reviews"         },
      { href: "/dashboard/emails",          icon: Mail,          label: "Emails"          },
      { href: "/dashboard/abandoned-carts", icon: ShoppingCart,  label: "Abandoned Carts" },
    ],
  },
  {
    id: "intelligence", label: "Intelligence",
    items: [
      { href: "/dashboard/analytics",    icon: Activity,     label: "Analytics"    },
      { href: "/dashboard/top-products", icon: TrendingUp,   label: "Daily Top 10" },
      { href: "/dashboard/ad-spy",       icon: Eye,          label: "Ad Spy"       },
      { href: "/dashboard/funnel",       icon: TrendingDown, label: "Funnel"       },
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
      { href: "/admin/waitlist", icon: Mail,       label: "Waitlist"   },
    ],
  },
  {
    id: "system", label: "System",
    items: [
      { href: "/admin/error-logs", icon: Shield,   label: "Error Logs" },
      { href: "/admin/audit-logs", icon: Shield,   label: "Audit Logs" },
      { href: "/admin/settings",   icon: Settings, label: "Settings"   },
    ],
  },
];

// ── TOAST SYSTEM ─────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";
interface Toast { id: string; type: ToastType; message: string; }

const ToastContext = createContext<{
  show: (message: string, type?: ToastType) => void;
}>({ show: () => {} });

export function useToast() { return useContext(ToastContext); }

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto"
          >
            <div className="toast-item flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium"
              data-type={t.type}>
              {t.type === "success" && <Check size={15} className="text-emerald-500 flex-shrink-0" />}
              {t.type === "error"   && <AlertCircle size={15} className="text-red-500 flex-shrink-0" />}
              {t.type === "info"    && <Info size={15} className="text-blue-500 flex-shrink-0" />}
              {t.type === "warning" && <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />}
              <span className="toast-text">{t.message}</span>
              <button onClick={() => remove(t.id)} className="ml-2 opacity-40 hover:opacity-100 transition-opacity">
                <X size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── CONFIRM DIALOG ────────────────────────────────────────────
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
}

const ConfirmContext = createContext<{
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}>({ confirm: async () => false });

export function useConfirm() { return useContext(ConfirmContext); }

function ConfirmDialog({ opts, onConfirm, onCancel, theme }: {
  opts: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
  theme: "light" | "dark";
}) {
  const isLight = theme === "light";
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-md rounded-3xl p-6 shadow-2xl"
        style={{ background: isLight ? "#fff" : "#1A1330" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: opts.variant === "danger" ? "rgba(239,68,68,0.1)" :
                          opts.variant === "warning" ? "rgba(245,158,11,0.1)" :
                          "rgba(124,58,237,0.1)"
            }}>
            <AlertCircle size={18} style={{
              color: opts.variant === "danger" ? "#ef4444" :
                     opts.variant === "warning" ? "#f59e0b" : "#7C3AED"
            }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1" style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
              {opts.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: isLight ? "#6B7280" : "#8B7AA8" }}>
              {opts.message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: isLight ? "#F3F4F6" : "rgba(255,255,255,0.06)",
              color: isLight ? "#374151" : "#8B7AA8",
            }}
          >
            {opts.cancelText || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{
              background: opts.variant === "danger" ? "#ef4444" :
                          opts.variant === "warning" ? "#f59e0b" : "#7C3AED",
              color: "#fff",
            }}
          >
            {opts.confirmText || "Confirm"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── SIDEBAR NAV ITEM ──────────────────────────────────────────
function NavItem({
  item, isActive, collapsed, theme
}: {
  item: any; isActive: boolean; collapsed: boolean; theme: "light" | "dark";
}) {
  const Icon = item.icon;
  const isLight = theme === "light";

  return (
    <Link href={item.href}>
      <div
        className="group relative flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-200"
        style={{
          padding: collapsed ? "9px 10px" : "9px 10px",
          background: isActive
            ? item.ai
              ? isLight ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.2)"
              : isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.08)"
            : "transparent",
          border: isActive
            ? item.ai
              ? `1px solid rgba(124,58,237,${isLight ? 0.2 : 0.3})`
              : `1px solid ${isLight ? "rgba(15,5,32,0.08)" : "rgba(255,255,255,0.08)"}`
            : "1px solid transparent",
        }}
      >
        {/* Active indicator */}
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
            style={{ background: item.ai ? "#7C3AED" : isLight ? "#0F0520" : "#fff" }}
          />
        )}

        {/* Icon */}
        <div
          className="w-[28px] h-[28px] rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: isActive
              ? item.ai
                ? "rgba(124,58,237,0.2)"
                : isLight ? "rgba(15,5,32,0.08)" : "rgba(255,255,255,0.12)"
              : isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.05)",
          }}
        >
          <Icon
            size={13}
            style={{
              color: isActive
                ? item.ai ? "#7C3AED" : isLight ? "#0F0520" : "#fff"
                : isLight ? "rgba(15,5,32,0.35)" : "rgba(255,255,255,0.4)",
            }}
          />
        </div>

        {/* Label */}
        {!collapsed && (
          <>
            <span
              className="text-[12.5px] flex-1 truncate"
              style={{
                color: isActive
                  ? item.ai ? "#7C3AED" : isLight ? "#0F0520" : "#fff"
                  : isLight ? "rgba(15,5,32,0.5)" : "rgba(255,255,255,0.52)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </span>

            {/* Badges */}
            {item.ai && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.15)", color: "#7C3AED" }}>
                AI
              </span>
            )}
            {item.badge && !item.ai && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(245,158,11,0.12)", color: "#d97706" }}>
                {item.badge}
              </span>
            )}
          </>
        )}

        {/* Collapsed tooltip */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap
            opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl"
            style={{
              background: isLight ? "#0F0520" : "#fff",
              color: isLight ? "#fff" : "#0F0520",
            }}>
            {item.label}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── NAV GROUP ─────────────────────────────────────────────────
function NavGroup({
  group, pathname, collapsed, theme
}: {
  group: any; pathname: string; collapsed: boolean; theme: "light" | "dark";
}) {
  const isActive = (item: any) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/admin");

  const groupActive = group.items.some(isActive);
  const [open, setOpen] = useState(groupActive || group.alwaysOpen);
  const isLight = theme === "light";

  if (group.alwaysOpen) {
    return (
      <div className="space-y-0.5 mb-4">
        {group.items.map((item: any) => (
          <NavItem key={item.href} item={item} isActive={isActive(item)} collapsed={collapsed} theme={theme} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-1">
      {!collapsed && (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl mb-0.5 transition-all"
          style={{ color: groupActive ? (isLight ? "rgba(15,5,32,0.6)" : "rgba(255,255,255,0.7)") : (isLight ? "rgba(15,5,32,0.28)" : "rgba(255,255,255,0.25)") }}
        >
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.13em] flex-1 text-left">
            {group.label}
          </span>
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={10} />
          </motion.div>
        </button>
      )}

      {collapsed && (
        <div className="border-t my-2" style={{ borderColor: isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.06)" }} />
      )}

      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden space-y-0.5"
          >
            {group.items.map((item: any) => (
              <NavItem key={item.href} item={item} isActive={isActive(item)} collapsed={collapsed} theme={theme} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN LAYOUT ───────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    opts: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  const isLight = theme === "light";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const nav = isAdmin ? ADMIN_NAV : OWNER_NAV;

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dropos-theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("dropos-theme", next);
  };

  // Toast system
  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const removeToast = (id: string) => setToasts(t => t.filter(x => x.id !== id));

  // Confirm system
  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({ opts, resolve });
    });
  };

  const handleConfirm = () => {
    confirmState?.resolve(true);
    setConfirmState(null);
  };

  const handleCancel = () => {
    confirmState?.resolve(false);
    setConfirmState(null);
  };

  // Logout with confirm
  const handleLogout = async () => {
    const ok = await confirm({
      title: "Sign out of DropOS?",
      message: "You'll need to sign in again to access your dashboard.",
      confirmText: "Sign out",
      cancelText: "Stay",
      variant: "warning",
    });
    if (ok) {
      logout();
      router.push("/login");
    }
  };

  // Plan info
  const plan = user?.subscription?.plan || "FREE";
  const planColors: Record<string, string> = {
    FREE: "#6b7280", GROWTH: "#7C3AED", PRO: "#f59e0b",
  };
  const planColor = planColors[plan] || "#6b7280";

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
      <ToastContext.Provider value={{ show: showToast }}>
        <ConfirmContext.Provider value={{ confirm }}>
          <div
            className="min-h-screen flex"
            style={{
              background: isLight ? "#F8F7FF" : "#0A0612",
              color: isLight ? "#0F0520" : "#F0EEFF",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {/* ── GOOGLE FONTS ── */}
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

              * { box-sizing: border-box; }

              body {
                font-family: 'DM Sans', sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }

              .sora { font-family: 'Sora', sans-serif; }

              ::-webkit-scrollbar { width: 4px; height: 4px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb {
                background: ${isLight ? "rgba(15,5,32,0.12)" : "rgba(255,255,255,0.1)"};
                border-radius: 99px;
              }

              .toast-item {
                background: ${isLight ? "#fff" : "#1A1330"};
                border: 1px solid ${isLight ? "rgba(15,5,32,0.08)" : "rgba(255,255,255,0.08)"};
                min-width: 280px;
              }

              .toast-text {
                color: ${isLight ? "#0F0520" : "#F0EEFF"};
              }

              .kiro-pulse {
                animation: kiro-glow 2.5s ease-in-out infinite;
              }

              @keyframes kiro-glow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); }
                50% { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
              }

              .nav-scroll::-webkit-scrollbar { width: 0; }
            `}</style>

            {/* ── MOBILE OVERLAY ── */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setMobileOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* ── SIDEBAR ── */}
            <motion.aside
              animate={{ width: sidebarWidth }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden"
              style={{
                background: isLight ? "#fff" : "#110D1E",
                borderRight: `1px solid ${isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.05)"}`,
                // Mobile: slide in
              }}
            >
              {/* Logo */}
              <div
                className="flex items-center gap-3 flex-shrink-0"
                style={{
                  padding: collapsed ? "20px 18px" : "20px 16px",
                  borderBottom: `1px solid ${isLight ? "rgba(15,5,32,0.05)" : "rgba(255,255,255,0.05)"}`,
                  minHeight: 64,
                }}
              >
                {/* Logo mark */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
                >
                  <ZapIcon size={14} className="text-white" />
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col min-w-0"
                    >
                      <span className="sora font-bold text-[15px] leading-none"
                        style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
                        DropOS
                      </span>
                      <span className="text-[10px] mt-0.5"
                        style={{ color: isLight ? "rgba(15,5,32,0.35)" : "rgba(255,255,255,0.3)" }}>
                        Commerce Platform
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!collapsed && (
                  <button
                    onClick={() => setCollapsed(true)}
                    className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.06)" }}
                  >
                    <ChevronRight size={12} style={{ color: isLight ? "rgba(15,5,32,0.4)" : "rgba(255,255,255,0.4)" }} />
                  </button>
                )}

                {collapsed && (
                  <button
                    onClick={() => setCollapsed(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70 mx-auto"
                    style={{ background: isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.06)" }}
                  >
                    <Menu size={12} style={{ color: isLight ? "rgba(15,5,32,0.4)" : "rgba(255,255,255,0.4)" }} />
                  </button>
                )}
              </div>

              {/* Nav */}
              <div className="flex-1 overflow-y-auto nav-scroll px-2 py-3">
                {nav.map(group => (
                  <NavGroup
                    key={group.id}
                    group={group}
                    pathname={pathname}
                    collapsed={collapsed}
                    theme={theme}
                  />
                ))}
              </div>

              {/* Bottom: User + Plan */}
              <div
                className="flex-shrink-0 p-2"
                style={{ borderTop: `1px solid ${isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.05)"}` }}
              >
                {/* Plan badge */}
                {!collapsed && (
                  <Link href="/dashboard/billing">
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2 cursor-pointer transition-all hover:opacity-80"
                      style={{ background: `${planColor}12`, border: `1px solid ${planColor}25` }}
                    >
                      <Wallet size={13} style={{ color: planColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold" style={{ color: planColor }}>
                          {plan} Plan
                        </div>
                        {plan === "FREE" && (
                          <div className="text-[10px]" style={{ color: isLight ? "rgba(15,5,32,0.4)" : "rgba(255,255,255,0.3)" }}>
                            Upgrade to unlock all features
                          </div>
                        )}
                      </div>
                      {plan === "FREE" && (
                        <Sparkles size={11} style={{ color: planColor }} />
                      )}
                    </div>
                  </Link>
                )}

                {/* User */}
                <div
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl group cursor-pointer transition-all"
                  style={{ background: isLight ? "transparent" : "transparent" }}
                  onClick={collapsed ? undefined : handleLogout}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                      color: "#fff",
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  {!collapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold truncate"
                          style={{ color: isLight ? "#0F0520" : "#F0EEFF" }}>
                          {user?.name || "User"}
                        </div>
                        <div className="text-[10px] truncate"
                          style={{ color: isLight ? "rgba(15,5,32,0.4)" : "rgba(255,255,255,0.3)" }}>
                          {user?.email || ""}
                        </div>
                      </div>
                      <LogOut
                        size={13}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        style={{ color: isLight ? "rgba(15,5,32,0.4)" : "rgba(255,255,255,0.4)" }}
                      />
                    </>
                  )}
                </div>
              </div>
            </motion.aside>

            {/* ── MAIN CONTENT ── */}
            <motion.div
              animate={{ marginLeft: sidebarWidth }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col min-w-0"
            >
              {/* ── TOP HEADER ── */}
              <header
                className="flex items-center gap-3 px-6 flex-shrink-0 sticky top-0 z-30"
                style={{
                  height: 64,
                  background: isLight ? "rgba(248,247,255,0.85)" : "rgba(10,6,18,0.85)",
                  backdropFilter: "blur(20px)",
                  borderBottom: `1px solid ${isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                {/* Mobile menu */}
                <button
                  className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.06)" }}
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu size={16} style={{ color: isLight ? "#0F0520" : "#F0EEFF" }} />
                </button>

                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all hover:opacity-80 flex-1 max-w-xs"
                  style={{
                    background: isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <Search size={13} style={{ color: isLight ? "rgba(15,5,32,0.35)" : "rgba(255,255,255,0.3)" }} />
                  <span className="text-sm flex-1"
                    style={{ color: isLight ? "rgba(15,5,32,0.3)" : "rgba(255,255,255,0.25)" }}>
                    Search anything...
                  </span>
                  <div
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px]"
                    style={{
                      background: isLight ? "rgba(15,5,32,0.06)" : "rgba(255,255,255,0.06)",
                      color: isLight ? "rgba(15,5,32,0.35)" : "rgba(255,255,255,0.25)",
                    }}
                  >
                    <Command size={9} /> K
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.06)" }}
                  >
                    {isLight
                      ? <Moon size={15} style={{ color: "rgba(15,5,32,0.5)" }} />
                      : <Sun size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
                    }
                  </button>

                  {/* Notifications */}
                  <button
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: isLight ? "rgba(15,5,32,0.04)" : "rgba(255,255,255,0.06)" }}
                  >
                    <Bell size={15} style={{ color: isLight ? "rgba(15,5,32,0.5)" : "rgba(255,255,255,0.5)" }} />
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ background: "#7C3AED" }}
                    />
                  </button>

                  {/* KIRO quick access */}
                  <Link href="/dashboard/kai">
                    <div
                      className="kiro-pulse flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer transition-all hover:opacity-90 active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                        color: "#fff",
                      }}
                    >
                      <Zap size={13} className="text-white" />
                      <span className="text-[12px] font-semibold sora hidden sm:block">KIRO</span>
                    </div>
                  </Link>
                </div>
              </header>

              {/* ── PAGE CONTENT ── */}
              <main className="flex-1 overflow-auto p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
            </motion.div>

            {/* ── TOAST CONTAINER ── */}
            <ToastContainer toasts={toasts} remove={removeToast} />

            {/* ── CONFIRM DIALOG ── */}
            <AnimatePresence>
              {confirmState && (
                <ConfirmDialog
                  opts={confirmState.opts}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  theme={theme}
                />
              )}
            </AnimatePresence>
          </div>
        </ConfirmContext.Provider>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}