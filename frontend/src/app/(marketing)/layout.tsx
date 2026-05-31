"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

// Unified color system matching auth + dashboard + landing page
const C = {
  bg:     "#F4F2FB",
  navy:   "#130D2E",
  purple: "#6B35E8",
  muted:  "rgba(19,13,46,0.5)",
  border: "rgba(107,53,232,0.1)",
};

const NAV_LINKS = [
  { href: "/features",     label: "Features"     },
  { href: "/pricing",      label: "Pricing"      },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about",        label: "About"        },
];

const FOOTER = [
  {
    title: "Product",
    links: [
      ["Features",     "/features"     ],
      ["How it Works", "/how-it-works" ],
      ["Pricing",      "/pricing"      ],
      ["Security",     "/security"     ],
    ],
  },
  {
    title: "Company",
    links: [
      ["About",   "/about"   ],
      ["Contact", "/contact" ],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy" ],
      ["Terms of Use",   "/terms"   ],
      ["Cookie Policy",  "/cookies" ],
    ],
  },
];

function Logo() {
  return (
    <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
      <div style={{
        width:32, height:32, borderRadius:9,
        background:"linear-gradient(145deg,#2D1B69,#0D0625)",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 4px 12px rgba(45,27,105,0.3)",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
        </svg>
      </div>
      <span style={{ fontSize:16, fontWeight:800, color:C.navy, letterSpacing:"-0.02em" }}>
        Drop<span style={{ color:C.purple }}>OS</span>
      </span>
    </Link>
  );
}

function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        height:64, display:"flex", alignItems:"center",
        padding:"0 24px",
        background: scrolled ? "rgba(244,242,251,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition:"all 0.25s ease",
      }}>
        <Logo />

        {/* Desktop links */}
        <nav style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }} className="mkt-nav">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              style={{
                fontSize:13, fontWeight:500, textDecoration:"none", padding:"7px 14px", borderRadius:9,
                color: pathname === l.href ? C.navy : C.muted,
                background: pathname === l.href ? "rgba(107,53,232,0.06)" : "transparent",
                transition:"all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color=C.navy; e.currentTarget.style.background="rgba(107,53,232,0.06)"; }}
              onMouseLeave={e => {
                e.currentTarget.style.color = pathname===l.href ? C.navy : C.muted;
                e.currentTarget.style.background = pathname===l.href ? "rgba(107,53,232,0.06)" : "transparent";
              }}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }} className="mkt-cta">
          <Link href="/auth/login" style={{ fontSize:13, fontWeight:600, color:C.muted, textDecoration:"none", padding:"8px 14px", borderRadius:8, transition:"color 0.15s" }}>
            Sign in
          </Link>
          <Link href="/auth/register" style={{
            display:"flex", alignItems:"center", gap:6,
            fontSize:13, fontWeight:700, color:"#fff", textDecoration:"none",
            padding:"9px 18px", borderRadius:10,
            background:C.navy,
            boxShadow:"0 4px 14px rgba(19,13,46,0.18)",
          }}>
            Start free <ArrowRight size={13}/>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="mkt-burger"
          style={{ display:"none", background:"none", border:"none", cursor:"pointer", color:C.navy, padding:4, marginLeft:"auto" }}>
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            style={{
              position:"fixed", top:64, left:0, right:0, zIndex:99,
              background:"rgba(244,242,251,0.98)", backdropFilter:"blur(20px)",
              borderBottom:`1px solid ${C.border}`, padding:"16px 24px 24px",
              display:"flex", flexDirection:"column", gap:4,
            }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                style={{ fontSize:15, fontWeight:600, color:C.navy, textDecoration:"none", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
                {l.label}
              </Link>
            ))}
            <Link href="/auth/register" onClick={() => setOpen(false)}
              style={{ marginTop:12, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"14px 0", borderRadius:12, background:C.navy, color:"#fff", textDecoration:"none", fontSize:15, fontWeight:700 }}>
              Start free <ArrowRight size={14}/>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(max-width:768px){ .mkt-nav,.mkt-cta{display:none!important;} .mkt-burger{display:flex!important;} }
      `}</style>
    </>
  );
}

function Footer() {
  return (
    <footer style={{ background:"#fff", borderTop:`1px solid ${C.border}`, paddingTop:56, paddingBottom:32, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }} className="footer-grid">
          {/* Brand */}
          <div>
            <Logo />
            <p style={{ fontSize:13, color:C.muted, marginTop:14, lineHeight:1.65, maxWidth:240 }}>
              The AI-powered commerce platform. Launch your store in 60 seconds.
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:16 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#10B981" }}/>
              <span style={{ fontSize:11, color:"rgba(19,13,46,0.4)", fontWeight:500 }}>All systems operational</span>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER.map(col => (
            <div key={col.title}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:C.muted, textTransform:"uppercase", marginBottom:16 }}>
                {col.title}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href}
                    style={{ fontSize:13, color:C.muted, textDecoration:"none", fontWeight:500, transition:"color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color=C.navy}
                    onMouseLeave={e => e.currentTarget.style.color=C.muted}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <p style={{ fontSize:12, color:C.muted }}>© 2026 DropOS. All rights reserved.</p>
          <p style={{ fontSize:12, color:C.muted }}>Built for merchants who move fast 🚀</p>
        </div>
      </div>

      <style>{`@media(max-width:768px){ .footer-grid{grid-template-columns:1fr 1fr!important; gap:32px!important;} }`}</style>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
        *{box-sizing:border-box;}
      `}</style>
      <Nav />
      <main style={{ paddingTop:64 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
