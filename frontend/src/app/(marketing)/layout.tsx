"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, ArrowRight } from "lucide-react";

const NAV = [
  { href: "/features",      label: "Features"    },
  { href: "/how-it-works",  label: "How it Works"},
  { href: "/pricing",       label: "Pricing"     },
  { href: "/about",         label: "About"       },
  { href: "/contact",       label: "Contact"     },
];

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      ["Features",       "/features"     ],
      ["How it Works",   "/how-it-works" ],
      ["Pricing",        "/pricing"      ],
      ["For Creators",   "/features#studio"],
      ["Security",       "/security"     ],
    ],
  },
  {
    title: "Company",
    links: [
      ["About",          "/about"        ],
      ["Contact",        "/contact"      ],
      ["Referral",       "/auth/register"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"      ],
      ["Terms of Use",   "/terms"        ],
      ["Cookie Policy",  "/cookies"      ],
    ],
  },
];

function Nav() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open,    setOpen]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const pill = "px-4 py-2 rounded-xl text-sm font-medium transition-all";

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 transition-all duration-300 ${scrolled ? "rounded-2xl shadow-lg" : ""}`}
        style={scrolled ? { background: "var(--topbar-bg)", backdropFilter: "blur(20px)", border: "1px solid var(--border)" } : {}}>
        <div className="flex items-center h-14 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 4px 12px rgba(107,53,232,0.3)" }}>
              <Zap size={15} color="white" />
            </div>
            <span className="font-black text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>
              Drop<span style={{ color: "#8B5CF6" }}>OS</span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV.map(l => (
              <Link key={l.href} href={l.href} className={pill}
                style={{
                  color:      pathname === l.href ? "#8B5CF6" : "var(--nav-text)",
                  background: pathname === l.href ? "rgba(107,53,232,0.08)" : "transparent",
                  fontWeight: pathname === l.href ? 600 : 500,
                }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Link href="/auth/login" className="text-sm font-medium px-3 py-2 rounded-xl transition-colors" style={{ color: "var(--text-secondary)" }}>
              Sign in
            </Link>
            <Link href="/auth/register">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)", boxShadow: "0 4px 14px rgba(107,53,232,0.35)" }}>
                Start free <ArrowRight size={13} />
              </button>
            </Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setOpen(o => !o)} className="md:hidden ml-auto p-2 rounded-xl"
            style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="md:hidden mx-4 mt-2 rounded-2xl p-4 space-y-1"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            {NAV.map(l => (
              <Link key={l.href} href={l.href} className="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  color:      pathname === l.href ? "#8B5CF6" : "var(--nav-text)",
                  background: pathname === l.href ? "rgba(107,53,232,0.08)" : "transparent",
                }}>
                {l.label}
              </Link>
            ))}
            <div className="pt-3 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
              <Link href="/auth/login" className="block px-4 py-3 rounded-xl text-sm font-medium text-center" style={{ color: "var(--text-secondary)" }}>Sign in</Link>
              <Link href="/auth/register" className="block px-4 py-3 rounded-xl text-sm font-bold text-white text-center"
                style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                Start free →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6B35E8,#3D1C8A)" }}>
                <Zap size={13} color="white" />
              </div>
              <span className="font-black text-base" style={{ color: "var(--text-primary)" }}>Drop<span style={{ color: "#8B5CF6" }}>OS</span></span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)", maxWidth: 200 }}>
              The AI-native commerce platform. Launch your store in 60 seconds.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: "pulse 2s infinite" }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>All systems operational</span>
            </div>
          </div>

          {/* Columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm transition-colors hover:text-[#8B5CF6]" style={{ color: "var(--text-secondary)" }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>© 2026 DropOS. All rights reserved.</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Built for entrepreneurs who move fast 🚀</p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Nav />
      <main style={{ paddingTop: "88px" }}>{children}</main>
      <Footer />
    </div>
  );
}
