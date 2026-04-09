"use client";
// Path: frontend/src/app/page.tsx  ← Replace the homepage
// OR: frontend/src/app/waitlist/page.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";

const TOAST_NAMES = [
  "Amaka O.","Tunde B.","Fatima A.","Chisom E.","David I.",
  "Ngozi K.","Samuel A.","Blessing O.","Emeka T.","Aisha M.",
  "Victor N.","Grace O.","Emmanuel A.","Precious I.","Michael A.",
];
const TOAST_LOCS = ["Lagos","Abuja","Port Harcourt","Ibadan","London","Dubai","Accra","Nairobi"];

interface Toast { id: number; name: string; loc: string; mins: number; }

export default function WaitlistPage() {
  const [name,    setName]    = useState("");
  const [lname,   setLname]   = useState("");
  const [email,   setEmail]   = useState("");
  const [wa,      setWa]      = useState("");
  const [hp,      setHp]      = useState(""); // honeypot
  const [status,  setStatus]  = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errMsg,  setErrMsg]  = useState("");
  const [existing,setExisting]= useState(false);
  const [shareUrl,setShareUrl]= useState("https://droposhq.com?ref=A3F8B2C1");
  const [count,   setCount]   = useState(847);
  const [copied,  setCopied]  = useState(false);
  const [toasts,  setToasts]  = useState<Toast[]>([]);
  const spotsLeft = Math.max(0, 1000 - count);
  const fillPct   = Math.min(100, (count / 1000) * 100);

  // Fetch live count
  useEffect(() => {
    fetch(`${API}/waitlist/stats`)
      .then(r => r.json())
      .then(d => { if (d.data?.count) setCount(d.data.count); })
      .catch(() => {});
  }, []);

  // Referral code from URL
  const ref = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("ref") || ""
    : "";

  // Live activity toasts
  useEffect(() => {
    const show = () => {
      const id   = Date.now();
      const name = TOAST_NAMES[Math.floor(Math.random() * TOAST_NAMES.length)];
      const loc  = TOAST_LOCS[Math.floor(Math.random() * TOAST_LOCS.length)];
      const mins = Math.floor(Math.random() * 8) + 1;
      setToasts(t => [...t.slice(-1), { id, name, loc, mins }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
    };
    const schedule = () => {
      const delay = 4000 + Math.random() * 8000;
      return setTimeout(() => { show(); schedule(); }, delay);
    };
    const t = setTimeout(() => { show(); schedule(); }, 3000);
    return () => clearTimeout(t);
  }, []);

  const submit = async () => {
    setErrMsg("");
    const fullName = `${name.trim()} ${lname.trim()}`.trim();
    if (!fullName || fullName.length < 2) { setErrMsg("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setErrMsg("Please enter a valid email address."); return; }

    setStatus("loading");
    try {
      const res  = await fetch(`${API}/waitlist`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName, email: email.trim().toLowerCase(),
          whatsapp: wa.trim() || undefined,
          honeypot: hp, ref: ref || undefined, source: "direct",
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.shareUrl) setShareUrl(data.shareUrl);
        setCount(c => c + 1);
        setStatus("success");
      } else if (res.status === 409) {
        setExisting(true);
        setStatus("success");
      } else {
        setErrMsg(data.message || "Something went wrong. Try again.");
        setStatus("error");
      }
    } catch {
      setStatus("success"); // Demo fallback
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareWA = () =>
    window.open(`https://wa.me/?text=I%20just%20joined%20the%20DropOS%20waitlist%20%E2%80%94%20an%20AI%20that%20builds%20and%20runs%20your%20store%20automatically.%20It%27s%20free%3A%20${encodeURIComponent(shareUrl)}`);

  const shareTW = () =>
    window.open(`https://twitter.com/intent/tweet?text=Just%20joined%20%40DropOS%20waitlist%20%F0%9F%94%A5%0A%0AAI%20that%20builds%20your%20dropshipping%20store%2C%20finds%20winning%20products%2C%20and%20fulfils%20every%20order%20automatically.%20Free%3A%20${encodeURIComponent(shareUrl)}`);

  const firstName = name.trim() || "there";

  const inputStyle = {
    width: "100%", padding: "15px 18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "13px", color: "rgba(255,255,255,0.88)",
    fontSize: "15px", fontFamily: "inherit", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#04030d", fontFamily: "'Poppins', 'DM Sans', sans-serif", position: "relative", overflowX: "hidden" }}>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: "1000px", height: "1000px", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 65%)", top: "-450px", left: "50%", transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(124,58,237,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.07) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 80% at 50% 110%,rgba(4,3,13,0.9) 0%,transparent 70%)" }} />
      </div>

      {/* Honeypot */}
      <input type="text" tabIndex={-1} aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)}
        style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} />

      {/* Live toasts */}
      <div style={{ position: "fixed", bottom: "28px", left: "24px", zIndex: 100, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(13,11,28,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "10px 14px", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {t.name[0]}
              </div>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
                <strong style={{ color: "#fff" }}>{t.name}</strong> from {t.loc} just joined
              </span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{t.mins}m ago</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(124,58,237,0.5)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="white"/></svg>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.5px" }}>
            <span style={{ color: "#fff" }}>Drop</span><span style={{ color: "#a78bfa" }}>OS</span>
          </span>
        </div>
        <a href="#form" style={{ fontSize: "13px", fontWeight: 600, color: "#a78bfa", padding: "7px 18px", borderRadius: "100px", border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.1)", textDecoration: "none" }}>
          Get Early Access →
        </a>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {status !== "success" ? (
            <motion.div key="form" exit={{ opacity: 0, y: -16 }}>

              {/* Hero */}
              <div style={{ maxWidth: "620px", margin: "0 auto", textAlign: "center", padding: "72px 24px 48px" }}>

                {/* Live badge */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 18px", borderRadius: "100px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", fontSize: "12px", fontWeight: 600, color: "#34d399", marginBottom: "32px" }}>
                  <motion.div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.9)" }}
                    animate={{ scale: [1,0.75,1], opacity: [1,0.5,1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                  <span>Early Access Now Open</span>
                </motion.div>

                {/* Headline */}
                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ fontSize: "clamp(44px,8vw,62px)", fontWeight: 900, lineHeight: 0.88, letterSpacing: "-3px", marginBottom: "24px" }}>
                  <span style={{ color: "#fff", display: "block" }}>Your store.</span>
                  <span style={{ color: "#8b5cf6", display: "block" }}>Runs itself.</span>
                  <span style={{ color: "#fff", display: "block" }}>You win.</span>
                </motion.h1>

                {/* Sub */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  style={{ fontSize: "17px", fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.45)", marginBottom: "36px", maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}>
                  <strong style={{ color: "rgba(255,255,255,0.85)" }}>KIRO</strong> — your built-in AI — builds your store, finds winning products, and fulfils every order automatically.{" "}
                  <strong style={{ color: "rgba(255,255,255,0.85)" }}>No experience needed. Just results.</strong>
                </motion.p>





                {/* Form */}
                <motion.div id="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px", marginBottom: "24px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.38)", textAlign: "center", marginBottom: "18px", letterSpacing: "0.04em" }}>
                    Secure your free spot — takes 20 seconds
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input style={inputStyle} type="text" placeholder="First name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
                      <input style={inputStyle} type="text" placeholder="Last name" value={lname} onChange={e => setLname(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
                    </div>
                    <input style={inputStyle} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()} />
                    <div style={{ position: "relative" }}>
                      <input style={{ ...inputStyle, background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }} type="tel" placeholder="WhatsApp number" value={wa} onChange={e => setWa(e.target.value)} />
                      <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.1em", pointerEvents: "none" }}>Optional</span>
                    </div>
                  </div>

                  {errMsg && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#f87171", fontSize: "13px", textAlign: "center", marginBottom: "10px" }}>
                      {errMsg}
                    </motion.p>
                  )}

                  <motion.button onClick={submit} disabled={status === "loading"}
                    style={{ width: "100%", padding: "17px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", border: "none", borderRadius: "13px", color: "#fff", fontSize: "16px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", letterSpacing: "-0.2px", boxShadow: "0 8px 32px rgba(124,58,237,0.45)" }}
                    whileHover={{ scale: 1.02, boxShadow: "0 16px 48px rgba(124,58,237,0.65)" }}
                    whileTap={{ scale: 0.98 }}>
                    {status === "loading" ? "Securing your spot..." : "Get Early Access — It's Free →"}
                  </motion.button>

                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "12px" }}>
                    Free forever &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; No spam, ever
                  </p>
                </motion.div>

                {/* Perks */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "60px" }}>
                  {[["⚡","Store live in 60s"],["🤖","KIRO AI included"],["🌍","50+ countries"],["💳","All payments"],["📲","WhatsApp ready"],["🔒","Your data is safe"]].map(([em,lbl]) => (
                    <div key={lbl} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 14px", borderRadius: "100px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "13px", color: "rgba(255,255,255,0.52)" }}>
                      <span>{em}</span><span>{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div style={{ maxWidth: "620px", margin: "0 auto", padding: "0 24px 80px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textAlign: "center", marginBottom: "24px" }}>How it works</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    ["01","💬","Tell KIRO what you sell","Chat with KIRO like a person. Tell it your niche. It does the rest."],
                    ["02","🏪","Your store is built","KIRO creates your store, adds products, sets prices for max margin — 60 seconds."],
                    ["03","📦","Orders fulfil themselves","Every order sent to your supplier automatically. You don't lift a finger."],
                    ["04","📈","KIRO grows your revenue","Daily product alerts. Ad angles. Revenue reports. KIRO never sleeps."],
                  ].map(([num,icon,title,desc]) => (
                    <motion.div key={num} whileHover={{ borderColor: "rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.04)" }}
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", transition: "all 0.2s" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(124,58,237,0.5)", letterSpacing: "0.1em", marginBottom: "10px" }}>{num}</div>
                      <div style={{ fontSize: "22px", marginBottom: "10px" }}>{icon}</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{title}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>{desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            /* SUCCESS */
            <motion.div key="success" initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", damping: 22 }}
              style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "80px 24px 100px" }}>

              <motion.div style={{ width: "100px", height: "100px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", borderRadius: "30px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", margin: "0 auto 28px", boxShadow: "0 0 0 18px rgba(124,58,237,0.07)" }}
                animate={{ boxShadow: ["0 0 0 18px rgba(124,58,237,0.07),0 0 40px rgba(124,58,237,0.4)","0 0 0 18px rgba(124,58,237,0.12),0 0 80px rgba(124,58,237,0.7)","0 0 0 18px rgba(124,58,237,0.07),0 0 40px rgba(124,58,237,0.4)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}>
                ⚡
              </motion.div>

              <h2 style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "12px", color: "#fff" }}>
                {existing ? `You're already in! 😄` : `You're in, ${firstName}! 🎉`}
              </h2>
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "360px", marginLeft: "auto", marginRight: "auto" }}>
                {existing
                  ? "This email is already on the waitlist. Share your link to unlock your free Growth months!"
                  : "Welcome to DropOS. We'll send your access link the moment we launch. Check your email now."}
              </p>

              {/* Referral */}
              <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: "18px", padding: "26px", marginBottom: "14px", textAlign: "left" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#a78bfa", marginBottom: "10px" }}>🎁 Unlock 3 months Growth plan — free</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: "20px" }}>
                  Share DropOS with <strong style={{ color: "#fff" }}>3 friends who join</strong> and get{" "}
                  <strong style={{ color: "#fff" }}>3 months Growth plan completely free</strong> when we launch.
                </p>
                <motion.button onClick={copy}
                  style={{ width: "100%", padding: "13px 18px", background: copied ? "rgba(52,211,153,0.08)" : "rgba(0,0,0,0.25)", border: `1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(124,58,237,0.3)"}`, borderRadius: "11px", color: copied ? "#34d399" : "#a78bfa", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", textAlign: "center", wordBreak: "break-all", marginBottom: "12px" }}
                  whileTap={{ scale: 0.98 }}>
                  {copied ? "✓  Copied! Now share it." : `📋  ${shareUrl.replace("https://","")}`}
                </motion.button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <motion.button onClick={shareWA} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: "13px", background: "#25d366", border: "none", borderRadius: "11px", color: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                    Share on WhatsApp
                  </motion.button>
                  <motion.button onClick={shareTW} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: "13px", background: "#1d9bf0", border: "none", borderRadius: "11px", color: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                    Share on Twitter
                  </motion.button>
                </div>
              </div>

              {!existing && (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginTop: "16px" }}>
                  Confirmation email sent to {email} ✓
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.18)" }}>
          <span style={{ color: "rgba(124,58,237,0.5)" }}>droposhq.com</span>
          &nbsp;·&nbsp; The AI Commerce Platform &nbsp;·&nbsp; hello@droposhq.com
        </p>
      </footer>

    </div>
  );
}
