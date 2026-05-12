"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/auth.store";
import {
  LayoutDashboard, Users, CreditCard, BarChart2, Settings,
  AlertCircle, List, Clock, Zap, LogOut, Menu, X, ChevronRight,
  Globe, Shield, Bell
} from "lucide-react";

const V = { v500:"#6B35E8", v700:"#3D1C8A", v400:"#8B5CF6", v300:"#A78BFA" };

const NAV = [
  { href:"/admin",           icon:LayoutDashboard, label:"Overview",   exact:true },
  { href:"/admin/users",     icon:Users,           label:"Users"              },
  { href:"/admin/payments",  icon:CreditCard,      label:"Payments"           },
  { href:"/admin/analytics", icon:BarChart2,       label:"Analytics"          },
  { href:"/admin/waitlist",  icon:List,            label:"Waitlist"           },
  { href:"/admin/support",   icon:Bell,            label:"Support"            },
  { href:"/admin/audit-logs",icon:Shield,          label:"Audit Logs"         },
  { href:"/admin/error-logs",icon:AlertCircle,     label:"Error Logs"         },
  { href:"/admin/settings",  icon:Settings,        label:"Settings"           },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, logout } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();
  const [open,   setOpen]   = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "SUPER_ADMIN") { router.replace("/dashboard"); }
  }, [user, isHydrated]);

  if (!isHydrated || !user || user.role !== "SUPER_ADMIN") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#07050F" }}>
        <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid rgba(107,53,232,0.2)", borderTopColor:V.v500, animation:"spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const isActive = (nav: any) => nav.exact ? pathname === nav.href : pathname.startsWith(nav.href);

  const SidebarContent = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"20px 0" }}>
      {/* Logo */}
      <div style={{ padding:"0 16px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/admin" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Zap size={16} color="#fff" fill="#fff"/>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:900, color:"#fff", margin:0, letterSpacing:"-0.03em" }}>DropOS</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0, fontWeight:600 }}>ADMIN PANEL</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"16px 8px", overflowY:"auto" }}>
        {NAV.map(n => {
          const active = isActive(n);
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} onClick={()=>setOpen(false)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:12, marginBottom:2, textDecoration:"none", background:active?`rgba(107,53,232,0.12)`:"transparent", border:`1px solid ${active?"rgba(107,53,232,0.25)":"transparent"}`, transition:"all 0.15s" }}>
              <Icon size={15} color={active?V.v300:"rgba(255,255,255,0.4)"}/>
              <span style={{ fontSize:13, fontWeight:600, color:active?"#fff":"rgba(255,255,255,0.5)" }}>{n.label}</span>
              {active && <ChevronRight size={12} color={V.v300} style={{ marginLeft:"auto" }}/>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding:"16px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>
            {user.name?.charAt(0)||"A"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.8)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Super Admin</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <Link href="/dashboard" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", textDecoration:"none", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)" }}>
            <Globe size={11}/> Store
          </Link>
          <button onClick={()=>{logout();router.push("/auth/login");}} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px", borderRadius:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", cursor:"pointer", fontSize:11, fontWeight:600, color:"rgba(239,68,68,0.7)", fontFamily:"inherit" }}>
            <LogOut size={11}/> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#07050F", fontFamily:"system-ui,sans-serif", display:"flex" }}>
      {/* Desktop sidebar */}
      <aside style={{ width:220, flexShrink:0, background:"rgba(255,255,255,0.02)", borderRight:"1px solid rgba(255,255,255,0.06)", height:"100vh", position:"sticky", top:0, display:"flex", flexDirection:"column" }} className="hidden lg:flex">
        <SidebarContent/>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position:"fixed", inset:0, zIndex:40, display:"flex" }}>
          <div onClick={()=>setOpen(false)} style={{ flex:1, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)" }}/>
          <div style={{ width:220, background:"#0d0a1a", borderLeft:"1px solid rgba(255,255,255,0.06)", height:"100%", display:"flex", flexDirection:"column" }}>
            <SidebarContent/>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Mobile top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"sticky", top:0, background:"rgba(7,5,15,0.9)", backdropFilter:"blur(10px)", zIndex:30 }} className="lg:hidden">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${V.v500},${V.v700})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={13} color="#fff" fill="#fff"/>
            </div>
            <span style={{ fontSize:14, fontWeight:900, color:"#fff" }}>DropOS Admin</span>
          </div>
          <button onClick={()=>setOpen(o=>!o)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", padding:4 }}>
            {open?<X size={20}/>:<Menu size={20}/>}
          </button>
        </div>

        {/* Page content */}
        <main style={{ flex:1, padding:"clamp(16px,3vw,28px)", overflowY:"auto" }}>
      
      <style>{`
        :root {
          --bg-base: #07050F;
          --bg-card: rgba(255,255,255,0.03);
          --bg-card-hover: rgba(255,255,255,0.05);
          --border: rgba(255,255,255,0.07);
          --text-primary: rgba(255,255,255,0.9);
          --text-secondary: rgba(255,255,255,0.6);
          --text-tertiary: rgba(255,255,255,0.35);
          --accent: #6B35E8;
          --accent-light: rgba(107,53,232,0.15);
          --green: #10B981;
          --amber: #F59E0B;
          --red: #EF4444;
        }
      `}</style>
          {children}
        </main>
      </div>

      <style>{`
        .lg\\:flex { display: flex !important; }
        .lg\\:hidden { display: none !important; }
        .hidden { display: none !important; }
        @media(min-width:1024px) {
          .lg\\:flex { display: flex !important; }
          .lg\\:hidden { display: none !important; }
          .hidden { display: flex !important; }
        }
        @media(max-width:1023px) {
          .lg\\:flex { display: none !important; }
          .lg\\:hidden { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
