"use client";
import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Package, ShoppingCart, ShoppingBag, Users,
  BarChart2, Settings, Bell, LogOut, TrendingUp, Store,
  Tag, Truck, Download, Eye, CreditCard, Key,
  Flame, Globe, RefreshCw, RotateCcw, Repeat,
  Gift, MessageSquare, Mail, Activity,
  FileText, Webhook, LifeBuoy, ChevronRight, Menu, X,
  Star, Sun, Moon, Video, Image, Bot,
  Sparkles, Wallet, AlertCircle, Check, Info,
  Radio, Upload, Paintbrush, Percent, BarChart,
  Target, Clock, Layers, Shield, Copy, PlayCircle,
  Database, Users2, TrendingDown, Cpu,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import CreditWallet from "../ui/CreditWallet";
import KIROPulse from "../ui/KIROPulse";
import CommandPalette from "../ui/CommandPalette";
import PushNotificationPrompt from "../ui/PushNotificationPrompt";
import MilestoneCelebration from "../ui/MilestoneCelebration";
import { useNavLevel } from "../ui/NavLevel";

// ── CONTEXTS ──────────────────────────────────────────────────────────────────
const ThemeContext = createContext<{ theme: "dark" | "light"; toggle: () => void }>({ theme: "dark", toggle: () => {} });
export function useTheme() { return useContext(ThemeContext); }

type ToastType = "success" | "error" | "info" | "warning";
interface Toast { id: string; type: ToastType; message: string; }
const ToastContext = createContext<{ show: (msg: string, type?: ToastType) => void }>({ show: () => {} });
export function useToast() { return useContext(ToastContext); }

interface ConfirmOptions { title: string; message: string; confirmText?: string; cancelText?: string; variant?: "danger" | "warning" | "default"; }
const ConfirmContext = createContext<{ confirm: (opts: ConfirmOptions) => Promise<boolean> }>({ confirm: async () => false });
export function useConfirm() { return useContext(ConfirmContext); }

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg:         "#06040D",
    surface:    "#0D0918",
    card:       "#181230",
    border:     "rgba(255,255,255,0.07)",
    text:       "#F0ECFF",
    textMuted:  "rgba(240,236,255,0.55)",
    textFaint:  "rgba(240,236,255,0.32)",
    navHover:   "rgba(255,255,255,0.04)",
    sidebarBg:  "#0D0918",
    headerBg:   "rgba(6,4,13,0.94)",
  },
  light: {
    bg:         "#F0EEFF",
    surface:    "#FFFFFF",
    card:       "#FFFFFF",
    border:     "rgba(100,70,200,0.10)",
    text:       "#130D2E",
    textMuted:  "rgba(19,13,46,0.60)",
    textFaint:  "rgba(19,13,46,0.38)",
    navHover:   "rgba(107,53,232,0.05)",
    sidebarBg:  "#FFFFFF",
    headerBg:   "rgba(240,238,255,0.94)",
  },
};
const V = {
  v900: "#1A0D3D", v700: "#3D1C8A", v500: "#6B35E8",
  v400: "#8B5CF6", v300: "#A78BFA", v200: "#C4B5FD",
};

// ── COMPLETE NAV  -  all 83 pages covered ───────────────────────────────────────
const OWNER_NAV = [
  // Always-visible top links
  { id: "top", label: null, alwaysOpen: true, items: [
    { href: "/dashboard/kiro",  icon: Zap,            label: "KIRO",     ai: true },
    { href: "/dashboard",       icon: LayoutDashboard, label: "Overview", exact: true },
  ]},

  // Store management
  { id: "store", label: "Store", items: [
    { href: "/dashboard/stores",              icon: Store,       label: "My Stores"          },
    { href: "/dashboard/products",            icon: Package,     label: "Products"           },
    { href: "/dashboard/orders",              icon: ShoppingCart,label: "Orders"             },
    { href: "/dashboard/customers",           icon: Users,       label: "Customers"          },
    { href: "/dashboard/inventory",           icon: BarChart2,   label: "Inventory"          },
    { href: "/dashboard/import",              icon: Download,    label: "Import Products"    },
    { href: "/dashboard/bulk-import",         icon: Upload,      label: "Bulk Import"        },
    { href: "/dashboard/suppliers",           icon: Truck,       label: "Suppliers"          },
    { href: "/dashboard/supplier-assignment", icon: Users2,      label: "Supplier Assign"    },
    { href: "/dashboard/customize",           icon: Paintbrush,  label: "Customize Store"    },
    { href: "/dashboard/currency",            icon: Globe,       label: "Currency"           },
  ]},

  // Sales & fulfilment
  { id: "sales", label: "Sales", items: [
    { href: "/dashboard/shipping",      icon: Truck,       label: "Shipping"       },
    { href: "/dashboard/fulfillment",   icon: Package,     label: "Fulfilment"     },
    { href: "/dashboard/autopilot",     icon: Bot,         label: "Auto-Pilot"     },
    { href: "/dashboard/discounts",     icon: Percent,     label: "Discounts"      },
    { href: "/dashboard/refunds",       icon: RefreshCw,   label: "Refunds"        },
    { href: "/dashboard/returns",       icon: RotateCcw,   label: "Returns"        },
    { href: "/dashboard/subscriptions", icon: Repeat,      label: "Subscriptions"  },
  ]},

  // Marketing
  { id: "marketing", label: "Marketing", items: [
    { href: "/dashboard/coupons",         icon: Tag,           label: "Coupons"         },
    { href: "/dashboard/flash-sales",     icon: Flame,         label: "Flash Sales"     },
    { href: "/dashboard/gift-cards",      icon: Gift,          label: "Gift Cards"      },
    { href: "/dashboard/bundle-builder",  icon: ShoppingBag,   label: "Bundle Builder"  },
    { href: "/dashboard/loyalty",         icon: Star,          label: "Loyalty"         },
    { href: "/dashboard/referral",        icon: Users,         label: "Referral"        },
    { href: "/dashboard/affiliates",      icon: Users2,        label: "Affiliates"      },
    { href: "/dashboard/emails",          icon: Mail,          label: "Email Campaigns" },
    { href: "/dashboard/broadcasts",      icon: Radio,         label: "Broadcasts"      },
    { href: "/dashboard/comeback",        icon: RotateCcw,     label: "Win-Back"        },
    { href: "/dashboard/abandoned-carts", icon: ShoppingCart,  label: "Abandoned Carts" },
    { href: "/dashboard/reviews",         icon: Star,          label: "Reviews"         },
    { href: "/dashboard/funnel",          icon: Target,        label: "Funnel"          },
  ]},

  // Studio  -  AI content creation
  { id: "studio", label: "Studio", items: [
    { href: "/dashboard/content-studio", icon: Video,      label: "Content Studio", badge: "AI" },
    { href: "/dashboard/image-studio",   icon: Image,      label: "Image Studio",   badge: "AI" },
    { href: "/dashboard/tiktok-scripts", icon: PlayCircle, label: "TikTok Scripts", badge: "AI" },
  ]},

  // Intelligence & analytics
  { id: "intelligence", label: "Intelligence", items: [
    { href: "/dashboard/analytics",      icon: Activity,     label: "Analytics"       },
    { href: "/dashboard/top-products",   icon: TrendingUp,   label: "Daily Top 10"   },
    { href: "/dashboard/competitor-spy", icon: Eye,          label: "Competitor Spy"  },
    { href: "/dashboard/products-intel", icon: Cpu,          label: "Products Intel"  },
    { href: "/dashboard/ad-spy",         icon: Eye,          label: "Ad Spy"          },
    { href: "/dashboard/forecast",       icon: TrendingUp,   label: "Forecast"        },
    { href: "/dashboard/profit-rules",   icon: Target,       label: "Profit Rules"    },
    { href: "/dashboard/price-sync",     icon: RefreshCw,    label: "Price Sync"      },
    { href: "/dashboard/grader",         icon: BarChart,     label: "Store Grader"    },
    { href: "/dashboard/kai-power",      icon: Zap,          label: "KIRO Power",     badge: "AI" },
    { href: "/dashboard/reports",        icon: FileText,     label: "Reports"         },
  ]},

  // Tools
  { id: "tools", label: "Tools", items: [
    { href: "/dashboard/chat",   icon: MessageSquare, label: "Live Chat"  },
    { href: "/dashboard/replay", icon: PlayCircle,    label: "Replay"     },
    { href: "/dashboard/backup", icon: Database,      label: "Backup"     },
  ]},

  // Developers
  { id: "developers", label: "Developers", items: [
    { href: "/dashboard/api-keys", icon: Key,     label: "API Keys"  },
    { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks"  },
  ]},

  // Account
  { id: "account", label: "Account", items: [
    { href: "/dashboard/billing",       icon: CreditCard, label: "Billing"       },
    { href: "/dashboard/notifications", icon: Bell,       label: "Notifications" },
    { href: "/dashboard/support",       icon: LifeBuoy,   label: "Support"       },
    { href: "/dashboard/settings",      icon: Settings,   label: "Settings"      },
  ]},
];

const BOTTOM_NAV = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Home",     exact: true },
  { href: "/dashboard/products", icon: Package,         label: "Products"             },
  { href: "/dashboard/kiro",     icon: Zap,             label: "KIRO",     ai: true   },
  { href: "/dashboard/orders",   icon: ShoppingCart,    label: "Orders"               },
  { href: "/dashboard/settings", icon: Settings,        label: "More"                 },
];

// ── NAV ITEM ──────────────────────────────────────────────────────────────────
function NavItem({ item, isActive, t, onClick }: { item: any; isActive: boolean; t: typeof T.dark; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} onClick={onClick} style={{ display: "block", marginBottom: 1, textDecoration: "none" }}>
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 9,
        padding: "7px 10px", borderRadius: 10,
        border: `1px solid ${isActive ? "rgba(107,53,232,0.2)" : "transparent"}`,
        background: isActive ? "rgba(107,53,232,0.1)" : "transparent",
        cursor: "pointer", transition: "background 0.12s, border-color 0.12s",
      }}>
        {isActive && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 16, borderRadius: 99, background: item.ai ? V.v300 : V.v500 }} />}
        <div style={{
          width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: isActive ? "rgba(107,53,232,0.2)" : "transparent",
          transition: "background 0.12s",
        }}>
          <Icon size={13} color={isActive ? (item.ai ? V.v300 : V.v400) : t.textMuted} />
        </div>
        <span style={{
          fontSize: 12.5, flex: 1, lineHeight: 1,
          color: isActive ? (item.ai ? V.v200 : t.text) : t.textMuted,
          fontWeight: isActive ? 650 : 450,
          letterSpacing: "-0.01em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {item.label}
        </span>
        {(item.ai || item.badge) && (
          <span style={{
            fontSize: 7.5, fontWeight: 700, letterSpacing: "0.08em",
            padding: "2px 5px", borderRadius: 99, flexShrink: 0,
            background: item.ai ? "rgba(107,53,232,0.2)" : "rgba(16,185,129,0.15)",
            color: item.ai ? V.v300 : "#10B981",
            border: `1px solid ${item.ai ? "rgba(107,53,232,0.3)" : "rgba(16,185,129,0.25)"}`,
          }}>
            {item.badge || "AI"}
          </span>
        )}
      </div>
    </Link>
  );
}

// ── NAV GROUP ─────────────────────────────────────────────────────────────────
function NavGroup({ group, pathname, t, onNavClick }: { group: any; pathname: string; t: typeof T.dark; onNavClick?: () => void }) {
  const isActive = (item: any) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/dashboard");
  const hasActive = group.items.some(isActive);
  const [open, setOpen] = useState(hasActive || !!group.alwaysOpen);

  // Open group when navigating to one of its items
  useEffect(() => { if (hasActive && !open) setOpen(true); }, [pathname]);

  if (group.alwaysOpen) return (
    <div style={{ marginBottom: 12 }}>
      {group.items.map((item: any) => <NavItem key={item.href} item={item} isActive={isActive(item)} t={t} onClick={onNavClick} />)}
    </div>
  );

  return (
    <div style={{ marginBottom: 2 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 3px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: hasActive ? t.text : t.textFaint }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", flex: 1, textAlign: "left", fontFamily: "system-ui" }}>
          {group.label}
        </span>
        <ChevronRight size={10} style={{ transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ paddingBottom: 4 }}>
          {group.items.map((item: any) => <NavItem key={item.href} item={item} isActive={isActive(item)} t={t} onClick={onNavClick} />)}
        </div>
      )}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ t, pathname, plan, user, onNavClick, onLogout, theme }: any) {
  const { level, label: navLabel, productCount, orderCount } = useNavLevel();

  // Progressive nav: filter groups based on user level
  const VISIBLE_AT: Record<string, number> = {
    "top":          0,
    "store":        0,
    "sales":        1,  // unlock after first product
    "marketing":    2,  // unlock after first order
    "studio":       2,  // unlock after first order
    "intelligence": 3,  // unlock after 10 orders
    "tools":        3,
    "developers":   3,
    "account":      0,
  };

  const visibleNav = OWNER_NAV.filter(g => (VISIBLE_AT[g.id] ?? 0) <= level);
  const lockedCount = OWNER_NAV.filter(g => (VISIBLE_AT[g.id] ?? 0) > level).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.sidebarBg }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 14px", flexShrink: 0, borderBottom: `1px solid ${t.border}`, minHeight: 60 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(145deg,${V.v500},${V.v900})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(107,53,232,0.35)", flexShrink: 0 }}>
          <Zap size={14} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em", color: t.text }}>
            Drop<span style={{ color: V.v400 }}>OS</span>
          </div>
          <div style={{ fontSize: 9.5, color: t.textFaint, marginTop: 1, letterSpacing: "0.04em" }}>Commerce Platform</div>
        </div>
      </div>

      {/* Scrollable nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 6px", scrollbarWidth: "none" }}>
        {visibleNav.map(group => (
          <NavGroup key={group.id} group={group} pathname={pathname} t={t} onNavClick={onNavClick} />
        ))}

        {/* Locked groups hint */}
        {lockedCount > 0 && level < 4 && (
          <div style={{ margin:"8px 4px 4px", padding:"10px 12px", borderRadius:12, background:"rgba(107,53,232,0.04)", border:"1px solid rgba(107,53,232,0.1)", textAlign:"center" }}>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", lineHeight:1.5 }}>
              More features unlock as you grow.
            </p>
            <p style={{ fontSize:10, color:V.v300, marginTop:2, fontWeight:600 }}>
              {navLabel}
            </p>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{ flexShrink: 0, padding: "6px 6px 8px", borderTop: `1px solid ${t.border}` }}>
        <KIROPulse t={t} />
        <div style={{ marginBottom: 6 }}><CreditWallet /></div>

        {/* Plan badge */}
        <Link href="/dashboard/billing" onClick={onNavClick} style={{ textDecoration: "none", display: "block", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 11, background: plan === "FREE" ? "rgba(107,53,232,0.07)" : "rgba(16,185,129,0.07)", border: `1px solid ${plan === "FREE" ? "rgba(107,53,232,0.15)" : "rgba(16,185,129,0.2)"}` }}>
            <Wallet size={12} color={plan === "FREE" ? V.v400 : "#10B981"} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: plan === "FREE" ? V.v300 : "#10B981" }}>{plan} Plan</div>
              {plan === "FREE" && <div style={{ fontSize: 10, color: t.textFaint }}>Upgrade to unlock all</div>}
            </div>
            {plan === "FREE" && <Sparkles size={11} color={V.v400} />}
          </div>
        </Link>

        {/* User */}
        <div onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 11, cursor: "pointer", transition: "background 0.12s" }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(145deg,${V.v500},${V.v900})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 10, color: t.textFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || ""}</div>
          </div>
          <LogOut size={12} color={t.textFaint} />
        </div>
      </div>
    </div>
  );
}

// ── MAIN LAYOUT ───────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname  = usePathname();
  const router    = useRouter();

  const [theme,         setTheme]         = useState<"dark"|"light">("dark");
  const [toasts,        setToasts]        = useState<Toast[]>([]);
  const [confirmState,  setConfirmState]  = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const t    = theme === "dark" ? T.dark : T.light;
  const plan = user?.subscription?.plan || "FREE";

  // Persist theme
  useEffect(() => {
    const saved = localStorage.getItem("dropos-theme") as "dark"|"light"|null;
    if (saved) setTheme(saved);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dropos-theme", next);
  };

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, type, message }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4000);
  };

  const confirm = (opts: ConfirmOptions): Promise<boolean> =>
    new Promise(resolve => setConfirmState({ opts, resolve }));

  const handleLogout = async () => {
    const ok = await confirm({ title: "Sign out?", message: "You will need to sign in again.", confirmText: "Sign out", cancelText: "Stay", variant: "warning" });
    if (ok) { logout(); router.push("/login"); }
  };

  const isBottomActive = (item: any) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
    <ToastContext.Provider value={{ show: showToast }}>
    <ConfirmContext.Provider value={{ confirm }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .hide-scroll { scrollbar-width: none; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .thin-scroll::-webkit-scrollbar { width: 3px; }
        .thin-scroll::-webkit-scrollbar-thumb { border-radius: 99px; background: ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(107,53,232,0.12)"}; }
        @keyframes kglow { 0%,100%{box-shadow:0 4px 16px rgba(107,53,232,0.3)} 50%{box-shadow:0 4px 28px rgba(107,53,232,0.6)} }
        .kpulse { animation: kglow 2.5s ease-in-out infinite; }
        /* Responsive */
        @media (max-width:767px){
          .ds-sidebar { display:none!important; }
          .ds-bottom  { display:flex!important; }
          .ds-main    { padding-bottom:72px!important; }
          .ds-header  { padding:0 12px!important; }
        }
        @media (min-width:768px){
          .ds-sidebar { display:flex!important; flex-direction:column; }
          .ds-bottom  { display:none!important; }
          .ds-menu-btn{ display:none!important; }
        }
        /* Light mode overrides for better contrast */
        .light-input { background:#F5F3FF!important; border-color:rgba(107,53,232,0.12)!important; }
        .light-card  { background:#FFFFFF!important; box-shadow:0 1px 4px rgba(107,53,232,0.06)!important; }
        /* Table responsiveness */
        .table-wrap  { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        /* Chart height fix */
        .recharts-responsive-container { width:100%!important; }
        /* Prevent text size adjust on mobile */
        * { -webkit-text-size-adjust:100%; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", width:"100vw", overflow:"hidden", background:t.bg, color:t.text, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="ds-sidebar" style={{ width:228, minWidth:228, height:"100%", background:t.sidebarBg, borderRight:`1px solid ${t.border}`, flexShrink:0, zIndex:10, display:"none" }}>
          <Sidebar t={t} pathname={pathname} plan={plan} user={user} theme={theme} onLogout={handleLogout} />
        </aside>

        {/* ── MOBILE SIDEBAR OVERLAY ── */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}
                onClick={() => setMobileNavOpen(false)}
                style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)" }}
              />
              <motion.div initial={{ x:"-100%" }} animate={{ x:0 }} exit={{ x:"-100%" }} transition={{ type:"spring", stiffness:320, damping:34 }}
                style={{ position:"fixed", left:0, top:0, bottom:0, width:260, zIndex:50, boxShadow:"8px 0 40px rgba(0,0,0,0.35)" }}>
                <Sidebar t={t} pathname={pathname} plan={plan} user={user} theme={theme} onLogout={handleLogout} onNavClick={() => setMobileNavOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100%" }}>

          {/* HEADER */}
          <header className="ds-header" style={{ flexShrink:0, display:"flex", alignItems:"center", gap:8, height:56, padding:"0 16px", borderBottom:`1px solid ${t.border}`, background:t.headerBg, backdropFilter:"blur(20px)", zIndex:20 }}>

            {/* Hamburger  -  mobile only */}
            <button className="ds-menu-btn" onClick={() => setMobileNavOpen(true)}
              style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", background:t.navHover, flexShrink:0 }}>
              <Menu size={16} color={t.textMuted} />
            </button>

            {/* Page title */}
            <div style={{ flex:1, minWidth:0, overflow:"hidden" }}>
              <h1 style={{ fontSize:14, fontWeight:700, color:t.text, margin:0, letterSpacing:"-0.02em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {getPageTitle(pathname)}
              </h1>
            </div>

            {/* Command palette  -  desktop */}
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <CommandPalette />

              {/* Theme toggle */}
              <button onClick={toggleTheme}
                style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${t.border}`, cursor:"pointer", background:t.navHover }}>
                {theme === "dark" ? <Moon size={14} color={t.textMuted} /> : <Sun size={14} color={t.textMuted} />}
              </button>

              {/* Notifications */}
              <Link href="/dashboard/notifications" style={{ textDecoration:"none" }}>
                <button style={{ position:"relative", width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${t.border}`, cursor:"pointer", background:t.navHover }}>
                  <Bell size={14} color={t.textMuted} />
                  <span style={{ position:"absolute", top:8, right:8, width:6, height:6, borderRadius:"50%", background:V.v400, border:`1.5px solid ${t.bg}` }} />
                </button>
              </Link>

              {/* KIRO header shortcut  -  desktop */}
              <Link href="/dashboard/kiro" className="ds-kiro-btn" style={{ textDecoration:"none" }}>
                <div className="kpulse" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:11, background:`linear-gradient(135deg,${V.v500},${V.v700})`, color:"#fff", cursor:"pointer" }}>
                  <Zap size={13} color="white" />
                  <span style={{ fontSize:12, fontWeight:700, letterSpacing:"-0.01em" }}>KIRO</span>
                </div>
              </Link>
            </div>
          </header>

          {/* PAGE CONTENT  -  no AnimatePresence (causes freeze on refresh) */}
          <main className="thin-scroll ds-main" style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"20px 16px 24px" }}>
            {children}
          </main>

          {/* MOBILE BOTTOM NAV */}
          <nav className="ds-bottom" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:30, background:t.sidebarBg, borderTop:`1px solid ${t.border}`, padding:`8px 4px calc(8px + env(safe-area-inset-bottom,0px))`, justifyContent:"space-around", backdropFilter:"blur(24px)" }}>
            {BOTTOM_NAV.map(item => {
              const active = isBottomActive(item);
              const Icon   = item.icon;
              return (
                <Link key={item.href} href={item.href} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flex:1, padding:"4px 0", textDecoration:"none" }}>
                  <div style={{ width:40, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:active?(item.ai?"rgba(107,53,232,0.2)":"rgba(107,53,232,0.1)"):"transparent", position:"relative" }}>
                    {item.ai && active && <div style={{ position:"absolute", inset:0, borderRadius:10, boxShadow:"0 0 12px rgba(107,53,232,0.5)" }}/>}
                    <Icon size={17} color={active?(item.ai?V.v300:V.v400):t.textMuted} />
                  </div>
                  <span style={{ fontSize:9.5, fontWeight:active?700:400, color:active?(item.ai?V.v300:V.v400):t.textMuted, letterSpacing:"-0.01em" }}>
                    {item.label}
                  </span>
                  {active && <div style={{ position:"absolute", top:0, width:20, height:2, borderRadius:99, background:item.ai?V.v300:V.v400 }}/>}
                </Link>
              );
            })}
          </nav>

        </div>
      </div>

      {/* TOASTS */}
      <div style={{ position:"fixed", bottom:88, right:16, zIndex:9990, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none", maxWidth:"calc(100vw - 32px)" }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id} initial={{ opacity:0, y:16, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, x:20 }} transition={{ type:"spring", stiffness:400, damping:30 }}
              style={{ pointerEvents:"auto", display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:14, boxShadow:"0 8px 32px rgba(0,0,0,0.2)", minWidth:220, maxWidth:320, background:theme==="dark"?"#181230":"#fff", border:`1px solid ${t.border}` }}>
              {toast.type === "success" && <Check size={14} color="#10B981" />}
              {toast.type === "error"   && <AlertCircle size={14} color="#EF4444" />}
              {toast.type === "info"    && <Info size={14} color={V.v400} />}
              {toast.type === "warning" && <AlertCircle size={14} color="#F59E0B" />}
              <span style={{ flex:1, fontSize:13, fontWeight:500, color:t.text, lineHeight:1.4 }}>{toast.message}</span>
              <button onClick={() => setToasts(ts => ts.filter(x => x.id !== toast.id))} style={{ opacity:0.4, border:"none", background:"none", cursor:"pointer", color:t.text, flexShrink:0 }}><X size={12}/></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <PushNotificationPrompt />
      <MilestoneCelebration />

      {/* CONFIRM DIALOG */}
      <AnimatePresence>
        {confirmState && (
          <div style={{ position:"fixed", inset:0, zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)" }}
              onClick={() => { confirmState.resolve(false); setConfirmState(null); }}
            />
            <motion.div initial={{ opacity:0, scale:0.94, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94 }} transition={{ type:"spring", stiffness:400, damping:32 }}
              style={{ position:"relative", zIndex:10, width:"100%", maxWidth:360, borderRadius:20, padding:24, background:theme==="dark"?"#181230":"#fff", border:`1px solid ${t.border}`, boxShadow:"0 24px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:20 }}>
                <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:confirmState.opts.variant==="danger"?"rgba(239,68,68,0.1)":confirmState.opts.variant==="warning"?"rgba(245,158,11,0.1)":"rgba(107,53,232,0.1)" }}>
                  <AlertCircle size={17} color={confirmState.opts.variant==="danger"?"#EF4444":confirmState.opts.variant==="warning"?"#F59E0B":V.v400} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:t.text, marginBottom:6 }}>{confirmState.opts.title}</div>
                  <div style={{ fontSize:13, lineHeight:1.5, color:t.textMuted }}>{confirmState.opts.message}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={() => { confirmState.resolve(false); setConfirmState(null); }}
                  style={{ padding:"10px 18px", borderRadius:10, border:"none", fontSize:13, fontWeight:500, cursor:"pointer", background:theme==="dark"?"rgba(255,255,255,0.07)":"#F3F4F6", color:t.textMuted }}>
                  {confirmState.opts.cancelText || "Cancel"}
                </button>
                <button onClick={() => { confirmState.resolve(true); setConfirmState(null); }}
                  style={{ padding:"10px 18px", borderRadius:10, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", color:"#fff", background:confirmState.opts.variant==="danger"?"#EF4444":confirmState.opts.variant==="warning"?"#F59E0B":V.v500 }}>
                  {confirmState.opts.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </ConfirmContext.Provider>
    </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}

// ── PAGE TITLE HELPER ─────────────────────────────────────────────────────────
function getPageTitle(pathname: string): string {
  const MAP: Record<string, string> = {
    "/dashboard":                    "Overview",
    "/dashboard/kiro":               "KIRO",
    "/dashboard/stores":             "My Stores",
    "/dashboard/products":           "Products",
    "/dashboard/orders":             "Orders",
    "/dashboard/customers":          "Customers",
    "/dashboard/inventory":          "Inventory",
    "/dashboard/import":             "Import Products",
    "/dashboard/bulk-import":        "Bulk Import",
    "/dashboard/suppliers":          "Suppliers",
    "/dashboard/supplier-assignment":"Supplier Assignment",
    "/dashboard/customize":          "Customize Store",
    "/dashboard/currency":           "Currency",
    "/dashboard/shipping":           "Shipping",
    "/dashboard/fulfillment":        "Fulfilment",
    "/dashboard/autopilot":          "Auto-Pilot",
    "/dashboard/discounts":          "Discounts",
    "/dashboard/refunds":            "Refunds",
    "/dashboard/returns":            "Returns",
    "/dashboard/subscriptions":      "Subscriptions",
    "/dashboard/coupons":            "Coupons",
    "/dashboard/flash-sales":        "Flash Sales",
    "/dashboard/gift-cards":         "Gift Cards",
    "/dashboard/bundle-builder":     "Bundle Builder",
    "/dashboard/loyalty":            "Loyalty Programme",
    "/dashboard/referral":           "Referral Programme",
    "/dashboard/affiliates":         "Affiliates",
    "/dashboard/emails":             "Email Campaigns",
    "/dashboard/broadcasts":         "Broadcasts",
    "/dashboard/comeback":           "Win-Back Campaigns",
    "/dashboard/abandoned-carts":    "Abandoned Carts",
    "/dashboard/reviews":            "Reviews",
    "/dashboard/funnel":             "Funnel",
    "/dashboard/content-studio":     "Content Studio",
    "/dashboard/image-studio":       "Image Studio",
    "/dashboard/tiktok-scripts":     "TikTok Scripts",
    "/dashboard/analytics":          "Analytics",
    "/dashboard/top-products":       "Daily Top 10",
    "/dashboard/competitor-spy":     "Competitor Spy",
    "/dashboard/products-intel":     "Products Intel",
    "/dashboard/ad-spy":             "Ad Spy",
    "/dashboard/forecast":           "Revenue Forecast",
    "/dashboard/profit-rules":       "Profit Rules",
    "/dashboard/price-sync":         "Price Sync",
    "/dashboard/grader":             "Store Grader",
    "/dashboard/kai-power":          "KIRO Power",
    "/dashboard/reports":            "Reports",
    "/dashboard/chat":               "Live Chat",
    "/dashboard/replay":             "Session Replay",
    "/dashboard/backup":             "Backup",
    "/dashboard/api-keys":           "API Keys",
    "/dashboard/webhooks":           "Webhooks",
    "/dashboard/billing":            "Billing",
    "/dashboard/notifications":      "Notifications",
    "/dashboard/support":            "Support",
    "/dashboard/settings":           "Settings",
    "/dashboard/overview":           "Overview",
  };
  return MAP[pathname] || "Dashboard";
}
