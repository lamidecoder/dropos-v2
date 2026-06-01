"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/auth.store";
import {
  LayoutDashboard, Users, Store, ShoppingCart, CreditCard,
  BarChart2, Settings, AlertCircle, Shield, Bell, LogOut,
  Menu, X, Zap, Globe, Megaphone, Flag, ChevronRight,
} from "lucide-react";

const V = { bg:"#0A0714", card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)", text:"rgba(255,255,255,0.9)", muted:"rgba(255,255,255,0.4)", accent:"#6B35E8" };

const NAV = [
  { section: null, items: [
    { href:"/admin",           icon:LayoutDashboard, label:"Overview",    exact:true },
  ]},
  { section:"PLATFORM", items: [
    { href:"/admin/users",     icon:Users,           label:"Users"       },
    { href:"/admin/stores",    icon:Store,           label:"Stores"      },
    { href:"/admin/orders",    icon:ShoppingCart,    label:"Orders"      },
    { href:"/admin/payments",  icon:CreditCard,      label:"Payments"    },
  ]},
  { section:"INSIGHTS", items: [
    { href:"/admin/analytics", icon:BarChart2,       label:"Analytics"   },
    { href:"/admin/audit-logs",icon:Shield,          label:"Audit Logs"  },
    { href:"/admin/error-logs",icon:AlertCircle,     label:"Error Logs"  },
  ]},
  { section:"TOOLS", items: [
    { href:"/admin/broadcast", icon:Megaphone,       label:"Broadcast"   },
    { href:"/admin/flags",     icon:Flag,            label:"Feature Flags"},
    { href:"/admin/support",   icon:Bell,            label:"Support"     },
    { href:"/admin/settings",  icon:Settings,        label:"Settings"    },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, logout } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "SUPER_ADMIN") router.replace("/dashboard");
  }, [user, isHydrated]);

  if (!isHydrated || !user || user.role !== "SUPER_ADMIN") return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:V.bg }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:`3px solid rgba(107,53,232,0.15)`, borderTopColor:V.accent, animation:"spin 0.7s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isActive = (n: any) => n.exact ? pathname === n.href : pathname.startsWith(n.href);

  const Sidebar = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>
      {/* Logo */}
      <div style={{ padding:"20px 16px 16px", borderBottom:`1px solid ${V.border}` }}>
        <Link href="/admin" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(145deg,#2D1B69,#0D0625)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/></svg>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:900, color:"#fff", margin:0, letterSpacing:"-0.03em" }}>Drop<span style={{ color:V.accent }}>OS</span></p>
            <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:0, fontWeight:700, letterSpacing:"0.1em" }}>SUPER ADMIN</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 8px" }}>
        {NAV.map((group, gi) => (
          <div key={gi} style={{ marginBottom:8 }}>
            {group.section && (
              <p style={{ fontSize:9, fontWeight:800, letterSpacing:"0.12em", color:"rgba(255,255,255,0.2)", textTransform:"uppercase", padding:"6px 10px 3px", margin:0 }}>
                {group.section}
              </p>
            )}
            {group.items.map(n => {
              const active = isActive(n);
              const Icon   = n.icon;
              return (
                <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                  style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:10, marginBottom:1, textDecoration:"none", background:active?"rgba(107,53,232,0.12)":"transparent", border:`1px solid ${active?"rgba(107,53,232,0.2)":"transparent"}`, transition:"all 0.12s" }}>
                  <Icon size={14} color={active?"#A78BFA":"rgba(255,255,255,0.35)"}/>
                  <span style={{ fontSize:13, fontWeight:active?700:500, color:active?"#fff":"rgba(255,255,255,0.5)", flex:1 }}>{n.label}</span>
                  {active && <ChevronRight size={11} color="rgba(167,139,250,0.6)"/>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:"12px 10px", borderTop:`1px solid ${V.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px", borderRadius:10, background:"rgba(255,255,255,0.03)", marginBottom:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(145deg,#2D1B69,#6B35E8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff", flexShrink:0 }}>
            {user.name?.charAt(0)||"A"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.8)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>Super Admin</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <Link href="/dashboard" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4, padding:"6px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:`1px solid ${V.border}`, textDecoration:"none", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)" }}>
            <Globe size={10}/> Store
          </Link>
          <button onClick={() => { logout(); router.push("/auth/login"); }}
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4, padding:"6px", borderRadius:8, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.12)", cursor:"pointer", fontSize:11, fontWeight:600, color:"rgba(239,68,68,0.7)", fontFamily:"inherit" }}>
            <LogOut size={10}/> Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:V.bg, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; }
        :root { --accent:#6B35E8; --green:#10B981; --amber:#F59E0B; --red:#EF4444; --cyan:#06B6D4; }
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(min-width:1024px){ .adm-sidebar{display:flex!important} .adm-topbar{display:none!important} }
        @media(max-width:1023px){ .adm-sidebar{display:none!important} .adm-topbar{display:flex!important} }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="adm-sidebar" style={{ width:210, flexShrink:0, background:"rgba(255,255,255,0.015)", borderRight:`1px solid ${V.border}`, height:"100vh", position:"sticky", top:0, flexDirection:"column" }}>
        <Sidebar/>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex" }}>
          <div onClick={() => setMobileOpen(false)} style={{ flex:1, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}/>
          <div style={{ width:220, background:"#0d0a1a", borderLeft:`1px solid ${V.border}`, height:"100%", display:"flex", flexDirection:"column" }}>
            <Sidebar/>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Mobile topbar */}
        <div className="adm-topbar" style={{ alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:`1px solid ${V.border}`, position:"sticky", top:0, background:"rgba(10,7,20,0.95)", backdropFilter:"blur(10px)", zIndex:30 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(145deg,#2D1B69,#0D0625)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/></svg>
            </div>
            <span style={{ fontSize:14, fontWeight:900, color:"#fff" }}>Admin</span>
          </div>
          <button onClick={() => setMobileOpen(o => !o)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", padding:4 }}>
            {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>

        {/* Content */}
        <main style={{ flex:1, padding:"clamp(16px,2.5vw,28px)", overflowY:"auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
