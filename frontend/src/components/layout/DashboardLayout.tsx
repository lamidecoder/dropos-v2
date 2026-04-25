"use client";
import { useState, useEffect, createContext, useContext, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Package, ShoppingCart, Users,
  BarChart2, Settings, Bell, LogOut, TrendingUp, Store,
  Tag, Truck, Palette, Download, Eye, CreditCard, Key,
  Flame, Globe, Layers, RefreshCw, RotateCcw, Repeat,
  Gift, MessageSquare, Mail, Activity, TrendingDown,
  FileText, Webhook, LifeBuoy, ChevronRight, Menu, X,
  Percent, Star, Shield, Sun, Moon, Search,
  Sparkles, Wallet, AlertCircle, Check, Info,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

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

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg: "#06040D", surface: "#0D0918", card: "#181230",
    border: "rgba(255,255,255,0.06)", borderHi: "rgba(255,255,255,0.12)",
    text: "#fff", textMuted: "rgba(255,255,255,0.38)", textFaint: "rgba(255,255,255,0.18)",
    navHover: "rgba(255,255,255,0.04)", headerBg: "rgba(6,4,13,0.92)",
    sidebarBg: "#0D0918",
  },
  light: {
    bg: "#F4F2FF", surface: "#fff", card: "#fff",
    border: "rgba(15,5,32,0.07)", borderHi: "rgba(15,5,32,0.12)",
    text: "#0D0918", textMuted: "rgba(13,9,24,0.45)", textFaint: "rgba(13,9,24,0.22)",
    navHover: "rgba(15,5,32,0.04)", headerBg: "rgba(244,242,255,0.92)",
    sidebarBg: "#fff",
  },
};
const V = {
  v900: "#1A0D3D", v700: "#3D1C8A", v500: "#6B35E8",
  v400: "#8B5CF6", v300: "#A78BFA", v200: "#C4B5FD",
  fuchsia: "#C026D3", cyan: "#06B6D4",
};

// ── NAV DATA ──────────────────────────────────────────────────────────────────
const OWNER_NAV = [
  { id: "top", label: null, alwaysOpen: true, items: [
    { href: "/dashboard/kiro",  icon: Zap,            label: "KIRO",    ai: true },
    { href: "/dashboard",      icon: LayoutDashboard, label: "Overview", exact: true },
  ]},
  { id: "store", label: "Store", items: [
    { href: "/dashboard/stores",    icon: Store,        label: "My Stores"   },
    { href: "/dashboard/products",  icon: Package,      label: "Products"    },
    { href: "/dashboard/orders",    icon: ShoppingCart, label: "Orders"      },
    { href: "/dashboard/customers", icon: Users,        label: "Customers"   },
    { href: "/dashboard/inventory", icon: BarChart2,    label: "Inventory"   },
    { href: "/dashboard/import",    icon: Download,     label: "Import"      },
    { href: "/dashboard/suppliers", icon: Truck,        label: "Suppliers"   },
    { href: "/dashboard/currency",  icon: Globe,        label: "Currency"    },
  ]},
  { id: "sales", label: "Sales", items: [
    { href: "/dashboard/shipping",      icon: Truck,     label: "Shipping"      },
    { href: "/dashboard/refunds",       icon: RefreshCw, label: "Refunds"       },
    { href: "/dashboard/returns",       icon: RotateCcw, label: "Returns"       },
    { href: "/dashboard/subscriptions", icon: Repeat,    label: "Subscriptions" },
  ]},
  { id: "marketing", label: "Marketing", items: [
    { href: "/dashboard/coupons",         icon: Tag,           label: "Coupons"         },
    { href: "/dashboard/flash-sales",     icon: Flame,         label: "Flash Sales"     },
    { href: "/dashboard/gift-cards",      icon: Gift,          label: "Gift Cards"      },
    { href: "/dashboard/affiliates",      icon: Star,          label: "Affiliates"      },
    { href: "/dashboard/reviews",         icon: MessageSquare, label: "Reviews"         },
    { href: "/dashboard/emails",          icon: Mail,          label: "Emails"          },
    { href: "/dashboard/abandoned-carts", icon: ShoppingCart,  label: "Abandoned Carts" },
  ]},
  { id: "intelligence", label: "Intelligence", items: [
    { href: "/dashboard/analytics",    icon: Activity,     label: "Analytics"    },
    { href: "/dashboard/top-products", icon: TrendingUp,   label: "Daily Top 10" },
    { href: "/dashboard/ad-spy",       icon: Eye,          label: "Ad Spy"       },
    { href: "/dashboard/reports",      icon: FileText,     label: "Reports"      },
  ]},
  { id: "developers", label: "Developers", items: [
    { href: "/dashboard/api-keys", icon: Key,     label: "API Keys" },
    { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
  ]},
  { id: "account", label: "Account", items: [
    { href: "/dashboard/billing",       icon: CreditCard, label: "Billing"       },
    { href: "/dashboard/notifications", icon: Bell,       label: "Notifications" },
    { href: "/dashboard/support",       icon: LifeBuoy,   label: "Support"       },
    { href: "/dashboard/settings",      icon: Settings,   label: "Settings"      },
  ]},
];

// Bottom nav items for mobile (most used)
const BOTTOM_NAV = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Home",     exact: true },
  { href: "/dashboard/products", icon: Package,         label: "Products"  },
  { href: "/dashboard/kiro",      icon: Zap,             label: "KIRO",     ai: true },
  { href: "/dashboard/orders",   icon: ShoppingCart,    label: "Orders"    },
  { href: "/dashboard/settings", icon: Settings,        label: "More"      },
];

// ── NAV ITEM ──────────────────────────────────────────────────────────────────
function NavItem({ item, isActive, t, onClick }: { item: any; isActive: boolean; t: typeof T.dark; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} onClick={onClick} style={{ display: "block", marginBottom: 1 }}>
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", borderRadius: 11,
        border: `1px solid ${isActive ? (item.ai ? "rgba(107,53,232,0.25)" : "rgba(107,53,232,0.15)") : "transparent"}`,
        background: isActive ? (item.ai ? "rgba(107,53,232,0.12)" : "rgba(107,53,232,0.08)") : "transparent",
        cursor: "pointer", transition: "all 0.15s",
      }}>
        {isActive && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 99, background: item.ai ? V.v300 : V.v500 }} />}
        <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isActive ? (item.ai ? "rgba(107,53,232,0.25)" : "rgba(107,53,232,0.18)") : "transparent" }}>
          <Icon size={13} color={isActive ? (item.ai ? V.v300 : V.v400) : t.textMuted} />
        </div>
        <span style={{ fontSize: 12.5, flex: 1, color: isActive ? (item.ai ? V.v200 : "#fff") : t.textMuted, fontWeight: isActive ? 600 : 400, letterSpacing: "-0.01em" }}>
          {item.label}
        </span>
        {item.ai && <span style={{ fontFamily: "'Syncopate',sans-serif", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 6px", borderRadius: 99, background: "rgba(107,53,232,0.2)", color: V.v300, border: "1px solid rgba(107,53,232,0.3)", flexShrink: 0 }}>AI</span>}
        {item.badge && !item.ai && <span style={{ fontFamily: "'Syncopate',sans-serif", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 6px", borderRadius: 99, background: "rgba(245,158,11,0.12)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)", flexShrink: 0 }}>{item.badge}</span>}
      </div>
    </Link>
  );
}

// ── NAV GROUP ─────────────────────────────────────────────────────────────────
function NavGroup({ group, pathname, t, onNavClick }: { group: any; pathname: string; t: typeof T.dark; onNavClick?: () => void }) {
  const isActive = (item: any) => item.exact ? pathname === item.href : pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/admin");
  const hasActive = group.items.some(isActive);
  const [open, setOpen] = useState(hasActive || !!group.alwaysOpen);

  if (group.alwaysOpen) return (
    <div style={{ marginBottom: 16 }}>
      {group.items.map((item: any) => <NavItem key={item.href} item={item} isActive={isActive(item)} t={t} onClick={onNavClick} />)}
    </div>
  );

  return (
    <div style={{ marginBottom: 4 }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 4px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: hasActive ? t.textMuted : t.textFaint, marginBottom: 2 }}>
        <span style={{ fontFamily: "'Syncopate',sans-serif", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", flex: 1, textAlign: "left" }}>{group.label}</span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }}><ChevronRight size={10} /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
            {group.items.map((item: any) => <NavItem key={item.href} item={item} isActive={isActive(item)} t={t} onClick={onNavClick} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SIDEBAR CONTENTS ─────────────────────────────────────────────────────────
function SidebarContents({ t, nav, pathname, plan, user, onNavClick, onLogout, theme }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: t.sidebarBg }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 16px", flexShrink: 0, borderBottom: `1px solid ${t.border}`, minHeight: 64 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(145deg, ${V.v500}, ${V.v900})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(107,53,232,0.3)" }}>
          <Zap size={15} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div><span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", color: t.text }}>Drop</span><span style={{ fontFamily: "'Syncopate',sans-serif", fontWeight: 700, fontSize: 16, color: V.v400, letterSpacing: "-0.01em" }}>OS</span></div>
          <div style={{ fontSize: 10, color: t.textFaint, marginTop: 2 }}>Commerce Platform</div>
        </div>
      </div>

      {/* Nav */}
      <div className="hide-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {nav.map((group: any) => <NavGroup key={group.id} group={group} pathname={pathname} t={t} onNavClick={onNavClick} />)}
      </div>

      {/* Bottom */}
      <div style={{ flexShrink: 0, padding: 8, borderTop: `1px solid ${t.border}` }}>
        <Link href="/dashboard/billing" onClick={onNavClick}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, marginBottom: 6, cursor: "pointer", background: "rgba(107,53,232,0.08)", border: "1px solid rgba(107,53,232,0.18)" }}>
            <Wallet size={12} color={V.v400} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: V.v300 }}>{plan} Plan</div>
              {plan === "FREE" && <div style={{ fontSize: 10, color: t.textMuted }}>Upgrade to unlock all</div>}
            </div>
            {plan === "FREE" && <Sparkles size={11} color={V.v400} />}
          </div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, cursor: "pointer" }} onClick={onLogout}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(145deg, ${V.v500}, ${V.v900})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 10, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || ""}</div>
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
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const t = theme === "dark" ? T.dark : T.light;
  const nav = OWNER_NAV;
  const plan = user?.subscription?.plan || "FREE";

  useEffect(() => {
    const saved = localStorage.getItem("dropos-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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

  const confirm = (opts: ConfirmOptions): Promise<boolean> => new Promise(resolve => setConfirmState({ opts, resolve }));

  const handleLogout = async () => {
    const ok = await confirm({ title: "Sign out of DropOS?", message: "You'll need to sign in again to access your dashboard.", confirmText: "Sign out", cancelText: "Stay", variant: "warning" });
    if (ok) { logout(); router.push("/login"); }
  };

  const isBottomActive = (item: any) => item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
      <ToastContext.Provider value={{ show: showToast }}>
        <ConfirmContext.Provider value={{ confirm }}>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Syncopate:wght@400;700&display=swap');
            *, *::before, *::after { box-sizing: border-box; }
            html, body { height: 100%; margin: 0; padding: 0; }
            body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; }
            .syn { font-family: 'Syncopate', sans-serif !important; }
            .hide-scroll { scrollbar-width: none; }
            .hide-scroll::-webkit-scrollbar { display: none; }
            .thin-scroll::-webkit-scrollbar { width: 3px; }
            .thin-scroll::-webkit-scrollbar-thumb { border-radius: 99px; background: ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,5,32,0.1)"}; }
            @keyframes kiro-glow { 0%,100%{box-shadow:0 4px 18px rgba(107,53,232,0.35)} 50%{box-shadow:0 4px 28px rgba(107,53,232,0.65)} }
            .kiro-pulse { animation: kiro-glow 2.5s ease-in-out infinite; }
            @media (max-width: 767px) {
              .desktop-sidebar { display: none !important; }
              .mobile-bottom-nav { display: flex !important; }
              .main-content { padding-bottom: 80px !important; }
              .header-search { display: none !important; }
            }
            @media (min-width: 768px) {
              .desktop-sidebar { display: flex !important; }
              .mobile-bottom-nav { display: none !important; }
              .mobile-menu-btn { display: none !important; }
            }
            /* Global dashboard page responsiveness */
            .dash-page { width: 100%; max-width: 100%; overflow-x: hidden; }
            .dash-page h1 { font-size: clamp(18px, 4vw, 22px) !important; }
            @media (max-width: 640px) {
              /* Tables that can't collapse - make them scroll */
              .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
              /* Stat grids - 2 cols max on mobile */
              .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
              /* Page padding */
              .dash-content { padding: 16px 12px !important; }
            }
          `}</style>

          <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: t.bg, color: t.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside className="desktop-sidebar" style={{ width: 236, minWidth: 236, height: "100%", flexDirection: "column", background: t.sidebarBg, borderRight: `1px solid ${t.border}`, flexShrink: 0, zIndex: 10, display: "none" }}>
              <SidebarContents t={t} nav={nav} pathname={pathname} plan={plan} user={user} theme={theme} onLogout={handleLogout} />
            </aside>

            {/* ── MOBILE SIDEBAR OVERLAY ── */}
            <AnimatePresence>
              {mobileNavOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setMobileNavOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                  />
                  {/* Drawer */}
                  <motion.div
                    initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 32 }}
                    style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 280, zIndex: 50, boxShadow: "8px 0 40px rgba(0,0,0,0.4)" }}>
                    <SidebarContents t={t} nav={nav} pathname={pathname} plan={plan} user={user} theme={theme} onLogout={handleLogout} onNavClick={() => setMobileNavOpen(false)} />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ── MAIN AREA ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

              {/* ── HEADER ── */}
              <header style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", background: t.headerBg, backdropFilter: "blur(24px)", borderBottom: `1px solid ${t.border}`, zIndex: 20 }}>
                {/* Mobile hamburger */}
                <button
                  className="mobile-menu-btn"
                  onClick={() => setMobileNavOpen(true)}
                  style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(15,5,32,0.04)", flexShrink: 0 }}>
                  <Menu size={16} color={t.textMuted} />
                </button>

                {/* Logo - mobile only */}
                <div className="mobile-menu-btn" style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(145deg, ${V.v500}, ${V.v900})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={11} color="white" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Drop<span style={{ fontFamily: "'Syncopate',sans-serif", color: V.v400 }}>OS</span></span>
                </div>

                {/* Search - desktop */}
                <div className="header-search" style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 12, flex: 1, maxWidth: 280, cursor: "pointer", background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,5,32,0.04)", border: `1px solid ${t.border}` }}>
                  <Search size={13} color={t.textMuted} />
                  <span style={{ fontSize: 13, flex: 1, color: t.textMuted }}>Search anything...</span>
                  <span style={{ fontFamily: "'Syncopate',sans-serif", fontSize: 9, padding: "2px 6px", borderRadius: 6, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,5,32,0.06)", color: t.textMuted }}>⌘K</span>
                </div>

                <div style={{ flex: 1 }} />

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {/* Theme toggle */}
                  <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(15,5,32,0.04)" }}>
                    {theme === "dark" ? <Moon size={15} color={t.textMuted} /> : <Sun size={15} color={t.textMuted} />}
                  </button>

                  {/* Bell */}
                  <Link href="/dashboard/notifications">
                    <button style={{ position: "relative", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(15,5,32,0.04)" }}>
                      <Bell size={15} color={t.textMuted} />
                      <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: V.v400, border: `1.5px solid ${t.bg}` }} />
                    </button>
                  </Link>

                  {/* KIRO - desktop only */}
                  <Link href="/dashboard/kiro" className="header-search">
                    <div className="kiro-pulse" style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 12, cursor: "pointer", background: `linear-gradient(135deg, ${V.v500}, ${V.v700})`, color: "#fff" }}>
                      <Zap size={13} color="white" />
                      <span style={{ fontFamily: "'Syncopate',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>KIRO</span>
                    </div>
                  </Link>
                </div>
              </header>

              {/* ── PAGE CONTENT ── */}
              <main className="thin-scroll main-content" style={{ flex: 1, overflowY: "auto", padding: "16px 12px", paddingBottom: 20 }}>
                <AnimatePresence mode="wait">
                  <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>

              {/* ── MOBILE BOTTOM NAV ── */}
              <nav className="mobile-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30, background: t.sidebarBg, borderTop: `1px solid ${t.border}`, padding: "8px 4px calc(8px + env(safe-area-inset-bottom))", justifyContent: "space-around", backdropFilter: "blur(24px)" }}>
                {BOTTOM_NAV.map(item => {
                  const active = isBottomActive(item);
                  const Icon = item.icon;
                  const isKiro = item.ai;
                  return (
                    <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, padding: "4px 0", textDecoration: "none", position: "relative" }}>
                      <motion.div
                        whileTap={{ scale: 0.85 }}
                        style={{
                          width: 40, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                          background: active ? (isKiro ? "rgba(107,53,232,0.2)" : "rgba(107,53,232,0.12)") : "transparent",
                          position: "relative",
                        }}>
                        {isKiro && active && (
                          <div style={{ position: "absolute", inset: 0, borderRadius: 12, boxShadow: "0 0 12px rgba(107,53,232,0.5)" }} />
                        )}
                        <Icon size={18} color={active ? (isKiro ? V.v300 : V.v400) : t.textMuted} />
                      </motion.div>
                      <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? (isKiro ? V.v300 : V.v400) : t.textMuted, letterSpacing: "-0.02em" }}>
                        {item.label}
                      </span>
                      {active && (
                        <motion.div layoutId="bottom-indicator" style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: 20, height: 2, borderRadius: 99, background: isKiro ? V.v300 : V.v400 }} />
                      )}
                    </Link>
                  );
                })}
              </nav>

            </div>
          </div>

          {/* ── TOASTS ── */}
          <div style={{ position: "fixed", bottom: 88, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none", maxWidth: "calc(100vw - 32px)" }}>
            <AnimatePresence>
              {toasts.map(toast => (
                <motion.div key={toast.id} initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", minWidth: 240, background: theme === "dark" ? "#181230" : "#fff", border: `1px solid ${t.border}` }}>
                  {toast.type === "success" && <Check size={14} color="#10B981" />}
                  {toast.type === "error"   && <AlertCircle size={14} color="#EF4444" />}
                  {toast.type === "info"    && <Info size={14} color={V.v400} />}
                  {toast.type === "warning" && <AlertCircle size={14} color="#F59E0B" />}
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: t.text }}>{toast.message}</span>
                  <button onClick={() => setToasts(ts => ts.filter(x => x.id !== toast.id))} style={{ opacity: 0.4, border: "none", background: "none", cursor: "pointer", color: t.text }}><X size={12} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── CONFIRM DIALOG ── */}
          <AnimatePresence>
            {confirmState && (
              <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => { confirmState.resolve(false); setConfirmState(null); }} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380, borderRadius: 20, padding: 24, background: theme === "dark" ? "#181230" : "#fff", border: `1px solid ${t.border}`, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: confirmState.opts.variant === "danger" ? "rgba(239,68,68,0.1)" : confirmState.opts.variant === "warning" ? "rgba(245,158,11,0.1)" : "rgba(107,53,232,0.1)" }}>
                      <AlertCircle size={17} color={confirmState.opts.variant === "danger" ? "#EF4444" : confirmState.opts.variant === "warning" ? "#F59E0B" : V.v400} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 6, letterSpacing: "-0.02em" }}>{confirmState.opts.title}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: t.textMuted }}>{confirmState.opts.message}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => { confirmState.resolve(false); setConfirmState(null); }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", background: theme === "dark" ? "rgba(255,255,255,0.06)" : "#F3F4F6", color: t.textMuted }}>
                      {confirmState.opts.cancelText || "Cancel"}
                    </button>
                    <button onClick={() => { confirmState.resolve(true); setConfirmState(null); }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: confirmState.opts.variant === "danger" ? "#EF4444" : confirmState.opts.variant === "warning" ? "#F59E0B" : V.v500, color: "#fff" }}>
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
