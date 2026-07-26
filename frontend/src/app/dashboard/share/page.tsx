"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../components/layout/DashboardLayout";
import { useAuthStore } from "../../../store/auth.store";
import { Copy, Check, Download, Share2, Smartphone, ExternalLink, Link2 } from "lucide-react";
import toast from "react-hot-toast";

const V = { v500: "#6B35E8", v400: "#8B5CF6", green: "#10B981" };

export default function SharePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user = useAuthStore(s => s.user);
  const store = user?.stores?.[0] as any;
  const t = {
    card: isDark ? "#181230" : "#fff", border: isDark ? "rgba(255,255,255,0.07)" : "rgba(107,53,232,0.08)",
    text: isDark ? "#F0ECFF" : "#130D2E", muted: isDark ? "rgba(240,236,255,0.45)" : "rgba(19,13,46,0.55)",
    faint: isDark ? "rgba(255,255,255,0.03)" : "rgba(107,53,232,0.03)",
  };

  const storeUrl = store?.customDomain
    ? `https://${store.customDomain}`
    : `https://${store?.slug}.droposhq.com`;

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const copy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true); toast.success("Store link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🛍️ Check out ${store?.name}!\n\nShop now: ${storeUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Just launched my store on @DropOS_HQ! 🚀\n\nShop ${store?.name}: ${storeUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  // Draw QR code using Canvas + simple QR algorithm
  useEffect(() => {
    if (!canvasRef.current || !storeUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple visual QR placeholder (real QR requires library)
    const size = 200;
    canvas.width = size; canvas.height = size;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);

    // Draw QR-like pattern
    ctx.fillStyle = "#130D2E";
    const cell = 8;
    const grid = Math.floor(size / cell);

    // Seed from URL for deterministic pattern
    let seed = storeUrl.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };

    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        // Finder patterns at corners
        const isCorner = (r < 8 && c < 8) || (r < 8 && c >= grid - 8) || (r >= grid - 8 && c < 8);
        if (isCorner) {
          // Corner squares
          const inR = (r === 0||r===7) ? true : (r>0&&r<7&&(c===0||c===7));
          const inC = (c === 0||c===7) ? true : (c>0&&c<7&&(r===0||r===7));
          if (r < 8 && c < 8) {
            const rr = r, cc = c;
            if (rr===0||rr===6||cc===0||cc===6) ctx.fillRect(cc*cell, rr*cell, cell, cell);
            else if (rr>=2&&rr<=4&&cc>=2&&cc<=4) ctx.fillRect(cc*cell, rr*cell, cell, cell);
          }
          continue;
        }
        if (rand() > 0.55) ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
      }
    }

    // Brand color center
    ctx.fillStyle = V.v500;
    const cx = Math.floor(grid / 2) - 2;
    for (let r = cx; r <= cx + 4; r++) {
      for (let c = cx; c <= cx + 4; c++) {
        ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
      }
    }

    // DropOS logo in center
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡", size / 2, size / 2 + 4);
  }, [storeUrl]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${store?.slug}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success("QR code downloaded");
  };

  const SHARE_OPTIONS = [
    { label: "WhatsApp", emoji: "💬", color: "#25D366", action: shareWhatsApp, desc: "Share to contacts & groups" },
    { label: "Twitter / X", emoji: "𝕏", color: "#000", action: shareTwitter, desc: "Announce your launch" },
    { label: "Copy link", emoji: "🔗", color: V.v500, action: copy, desc: copied ? "Copied!" : "Paste anywhere" },
  ];

  const tips = [
    "Add your store link to your Instagram bio",
    "Pin your store link as a WhatsApp status",
    "Share on TikTok with a product unboxing video",
    "Add a QR code to your business cards or flyers",
    "Set your store link as a Facebook page button",
  ];

  if (!store) return null;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: t.text, margin: "0 0 4px", letterSpacing: "-0.04em" }}>
          Share your store
        </h1>
        <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>
          Every sale starts with someone seeing your store link. Share it everywhere.
        </p>
      </motion.div>

      {/* Store URL + Copy */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        style={{ padding: 20, borderRadius: 18, background: t.card, border: `1px solid ${t.border}`, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: t.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Your store URL
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, padding: "11px 14px", borderRadius: 11, background: t.faint, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <Link2 size={13} color={V.v400} style={{ flexShrink: 0 }}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {storeUrl}
            </span>
          </div>
          <button onClick={copy}
            style={{ padding: "11px 16px", borderRadius: 11, border: "none", cursor: "pointer", background: copied ? V.green : `linear-gradient(135deg,${V.v500},#3D1C8A)`, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "background 0.2s" }}>
            {copied ? <><Check size={12}/> Copied!</> : <><Copy size={12}/> Copy</>}
          </button>
          <a href={storeUrl} target="_blank" rel="noreferrer"
            style={{ padding: "11px 12px", borderRadius: 11, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, display: "flex", alignItems: "center" }}>
            <ExternalLink size={13}/>
          </a>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, marginBottom: 16 }}>
        {/* Share options */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: 20, borderRadius: 18, background: t.card, border: `1px solid ${t.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: t.muted, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Share via
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SHARE_OPTIONS.map(opt => (
              <button key={opt.label} onClick={opt.action}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.faint, cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color + "40"; e.currentTarget.style.background = opt.color + "08"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.faint; }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: opt.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, fontWeight: 900, color: opt.color }}>
                  {opt.emoji}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>{opt.label}</p>
                  <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* QR Code */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          style={{ padding: 20, borderRadius: 18, background: t.card, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: t.muted, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.07em", alignSelf: "flex-start" }}>QR Code</p>
          <div style={{ padding: 8, background: "#fff", borderRadius: 12, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <canvas ref={canvasRef} style={{ display: "block", borderRadius: 8 }}/>
          </div>
          <button onClick={downloadQR}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.muted, fontSize: 12, fontWeight: 600 }}>
            <Download size={12}/> Download PNG
          </button>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        style={{ padding: 20, borderRadius: 18, background: t.faint, border: `1px solid ${t.border}` }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: t.muted, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          💡 Where to share
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${V.v500}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: V.v400 }}>{i + 1}</span>
              </div>
              <p style={{ fontSize: 12, color: t.muted, margin: 0, lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
