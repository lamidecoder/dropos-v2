"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, ArrowRight } from "lucide-react";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

const navLinks = [
  { href: "/",          label: "Home"      },
  { href: "/features",  label: "Features"  },
  { href: "/pricing",   label: "Pricing"   },
  { href: "/about",     label: "About"     },
  { href: "/changelog", label: "Changelog" },
  { href: "/contact",   label: "Contact"   },
];

function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className="mx-auto max-w-7xl px-6 transition-all duration-500"
        style={scrolled ? {
          backdropFilter: "blur(20px)",
          background: "var(--topbar-bg)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
        } : {}}>

        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <span className="font-black text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>Drop<span style={{ color: "var(--accent)" }}>OS</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color:      pathname === l.href ? "var(--accent)"    : "var(--nav-text)",
                  background: pathname === l.href ? "var(--accent-dim)": "transparent",
                  fontWeight: pathname === l.href ? 600 : 500,
                }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle compact />
            <Link href="/auth/login" className="text-sm font-medium transition-colors" style={{ color: "var(--text-secondary)" }}>
              Sign in
            </Link>
            <Link href="/auth/register"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-primary)] transition-all" style={{ background: "#10B981", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
              Start free <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden transition-colors" style={{ color: "var(--text-secondary)" }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mx-4 mt-2 rounded-2xl p-4 space-y-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
          >
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  color:      pathname === l.href ? "var(--accent)"    : "var(--nav-text)",
                  background: pathname === l.href ? "var(--accent-dim)": "transparent",
                  fontWeight: pathname === l.href ? 600 : 500,
                }}>
                {l.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
              <Link href="/auth/login" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Sign in</Link>
              <Link href="/auth/register" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-bold text-[var(--text-primary)] text-center" style={{ background: "#10B981" }}>Start free →</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)" }}>
                <Zap size={14} color="white" fill="white" />
              </div>
              <span className="font-black" style={{ color: "var(--text-primary)" }}>Drop<span style={{ color: "var(--accent)" }}>OS</span></span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-tertiary)" }}>
              The complete dropshipping platform. Launch your store, sell worldwide, scale fast.
            </p>
          </div>
          {[
            { title: "Product",  links: [["Features","/features"],["Pricing","/pricing"],["Changelog","/changelog"],["Roadmap","#"]] },
            { title: "Company",  links: [["About","/about"],["Contact","/contact"],["Blog","#"],["Careers","#"]] },
            { title: "Legal",    links: [["Privacy","#"],["Terms","#"],["Cookies","#"],["Security","#"]] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-tertiary)" }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>© {new Date().getFullYear()} DropOS. All rights reserved.</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Built for entrepreneurs who move fast.</p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
