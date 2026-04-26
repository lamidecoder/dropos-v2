"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Zap, Settings, CreditCard, Truck, Tag, Gift, Bell, Store,
  TrendingUp, Image, FileText, Globe, ArrowRight, Command,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",        href: "/dashboard",                    icon: LayoutDashboard,  group: "Pages"    },
  { label: "KIRO",             href: "/dashboard/kiro",               icon: Zap,              group: "Pages"    },
  { label: "Products",         href: "/dashboard/products",           icon: Package,          group: "Pages"    },
  { label: "Orders",           href: "/dashboard/orders",             icon: ShoppingCart,     group: "Pages"    },
  { label: "Customers",        href: "/dashboard/customers",          icon: Users,            group: "Pages"    },
  { label: "Analytics",        href: "/dashboard/analytics",          icon: BarChart2,        group: "Pages"    },
  { label: "Image Studio",     href: "/dashboard/image-studio",       icon: Image,            group: "Pages"    },
  { label: "Inventory",        href: "/dashboard/inventory",          icon: Package,          group: "Pages"    },
  { label: "Shipping",         href: "/dashboard/shipping",           icon: Truck,            group: "Pages"    },
  { label: "Coupons",          href: "/dashboard/coupons",            icon: Tag,              group: "Pages"    },
  { label: "Flash Sales",      href: "/dashboard/flash-sales",        icon: TrendingUp,       group: "Pages"    },
  { label: "Gift Cards",       href: "/dashboard/gift-cards",         icon: Gift,             group: "Pages"    },
  { label: "Emails",           href: "/dashboard/emails",             icon: FileText,         group: "Pages"    },
  { label: "Broadcasts",       href: "/dashboard/broadcasts",         icon: Bell,             group: "Pages"    },
  { label: "Stores",           href: "/dashboard/stores",             icon: Store,            group: "Pages"    },
  { label: "Billing",          href: "/dashboard/billing",            icon: CreditCard,       group: "Pages"    },
  { label: "Settings",         href: "/dashboard/settings",           icon: Settings,         group: "Pages"    },
  { label: "Customize Store",  href: "/dashboard/customize",          icon: Globe,            group: "Pages"    },
  { label: "Top Products",     href: "/dashboard/top-products",       icon: TrendingUp,       group: "Pages"    },
  { label: "Affiliates",       href: "/dashboard/affiliates",         icon: Users,            group: "Pages"    },
  // KIRO quick prompts
  { label: "Ask KIRO: Sales today",           href: "/dashboard/kiro?q=What+are+my+sales+today%3F",           icon: Zap, group: "Ask KIRO" },
  { label: "Ask KIRO: Write TikTok script",   href: "/dashboard/kiro?q=Write+a+TikTok+script+for+my+best+product", icon: Zap, group: "Ask KIRO" },
  { label: "Ask KIRO: Trending products",     href: "/dashboard/kiro?q=What+products+are+trending+right+now%3F", icon: Zap, group: "Ask KIRO" },
  { label: "Ask KIRO: Revenue forecast",      href: "/dashboard/kiro?q=Forecast+my+revenue+for+next+30+days",  icon: Zap, group: "Ask KIRO" },
  { label: "Ask KIRO: Improve my store",      href: "/dashboard/kiro?q=How+can+I+improve+my+store+score%3F",   icon: Zap, group: "Ask KIRO" },
];

export default function CommandPalette() {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const [sel,   setSel]   = useState(0);
  const router  = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setSel(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = query.trim()
    ? NAV_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS.slice(0, 12);

  const groups = filtered.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const flat = Object.values(groups).flat();

  const navigate = useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  }, [router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, flat.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && flat[sel]) navigate(flat[sel].href);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, sel, flat, navigate]);

  return (
    <>
      {/* Trigger hint */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
        <Search size={11} />
        <span>Search</span>
        <div className="flex items-center gap-0.5 ml-1">
          <kbd style={{ fontSize: 9, padding: "1px 4px", borderRadius: 4, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", fontFamily: "system-ui" }}>⌘</kbd>
          <kbd style={{ fontSize: 9, padding: "1px 4px", borderRadius: 4, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", fontFamily: "system-ui" }}>K</kbd>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[9998]" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed z-[9999] w-full max-w-lg left-1/2 -translate-x-1/2"
              style={{ top: "15vh" }}>

              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#181230", border: "1px solid rgba(107,53,232,0.3)" }}>
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <Search size={16} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSel(0); }}
                    placeholder="Search pages, or ask KIRO..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/25"
                    style={{ fontFamily: "inherit" }}
                  />
                  <kbd onClick={() => setOpen(false)}
                    style={{ fontSize: 10, padding: "2px 6px", borderRadius: 5, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)", cursor: "pointer" }}>
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div style={{ maxHeight: "min(60vh, 400px)", overflowY: "auto", scrollbarWidth: "none" }}>
                  {Object.entries(groups).map(([group, items]) => (
                    <div key={group}>
                      <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
                        {group}
                      </p>
                      {items.map((item, i) => {
                        const globalIdx = flat.indexOf(item);
                        const Icon = item.icon;
                        const isActive = sel === globalIdx;
                        return (
                          <button key={item.href} onClick={() => navigate(item.href)}
                            onMouseEnter={() => setSel(globalIdx)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                            style={{ background: isActive ? "rgba(107,53,232,0.15)" : "transparent", borderLeft: isActive ? "2px solid #8B5CF6" : "2px solid transparent" }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isActive ? "rgba(107,53,232,0.2)" : "rgba(255,255,255,0.05)" }}>
                              <Icon size={13} style={{ color: isActive ? "#A78BFA" : "rgba(255,255,255,0.4)" }} />
                            </div>
                            <span className="text-sm font-medium" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.65)" }}>
                              {item.label}
                            </span>
                            {isActive && <ArrowRight size={12} style={{ color: "#8B5CF6", marginLeft: "auto" }} />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No results for "{query}"</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([k, l]) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <kbd style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)", fontFamily: "system-ui" }}>{k}</kbd>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
