"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface StorePreloaderProps {
  brand?: string;
  storeName?: string;
  show: boolean;
  templateId?: string;
}

// Template-aware preloader configs
const CONFIGS: Record<string, { bg: string; text: string; style: "rings" | "bars" | "dots" | "morph" | "pulse" | "streak" }> = {
  aurora:   { bg: "#F8F7FF", text: "#130D2E", style: "rings"   },
  obsidian: { bg: "#07050F", text: "#F0ECFF", style: "morph"   },
  velvet:   { bg: "#0A0806", text: "#F5F0E8", style: "streak"  },
  street:   { bg: "#111",    text: "#F2F0EB", style: "bars"    },
  glow:     { bg: "#FFF0F8", text: "#1A1A2E", style: "pulse"   },
  terra:    { bg: "#FAF6F0", text: "#1A0F00", style: "rings"   },
  ionic:    { bg: "#050A14", text: "#E8F4FF", style: "bars"    },
  artisan:  { bg: "#FDF8F3", text: "#1A0F06", style: "dots"    },
  apex:     { bg: "#0A0A0A", text: "#F5F5F5", style: "bars"    },
  sage:     { bg: "#F8F6F1", text: "#1C2820", style: "dots"    },
  diamond:  { bg: "#080608", text: "#F0EAD6", style: "streak"  },
  kodiak:   { bg: "#EFEFEF", text: "#111",    style: "bars"    },
  nova:     { bg: "#080012", text: "#E8E0FF", style: "morph"   },
  dusk:     { bg: "#FDFAF5", text: "#1E1610", style: "pulse"   },
  kids:     { bg: "#FFFEF5", text: "#1A1A2E", style: "dots"    },
};

export function StorePreloader({ brand = "#6B35E8", storeName = "Store", show, templateId = "aurora" }: StorePreloaderProps) {
  const cfg = CONFIGS[templateId] || { bg: "#FAFAFA", text: "#111", style: "rings" as const };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: cfg.bg, overflow: "hidden",
          }}
        >
          <style>{`
            @keyframes pl-spin { to { transform: rotate(360deg) } }
            @keyframes pl-bar { 0%,100%{transform:scaleY(0.4);opacity:0.4} 50%{transform:scaleY(1);opacity:1} }
            @keyframes pl-dot { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-10px);opacity:1} }
            @keyframes pl-pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.15);opacity:1} }
            @keyframes pl-streak { 0%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }
            @keyframes pl-morph { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
          `}</style>

          {/* Ambient glow */}
          <div style={{
            position: "absolute", width: 320, height: 320, borderRadius: "50%",
            background: `radial-gradient(circle, ${brand}18 0%, transparent 70%)`,
            pointerEvents: "none",
            animation: "pl-pulse 3s ease-in-out infinite",
          }}/>

          {/* Logo + animation */}
          <div style={{ position: "relative", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>

            {cfg.style === "rings" && (
              <>
                <div style={{ position: "absolute", width: 88, height: 88, borderRadius: "50%", border: `2px solid ${brand}20`, borderTopColor: brand, animation: "pl-spin 1.2s linear infinite" }}/>
                <div style={{ position: "absolute", width: 108, height: 108, borderRadius: "50%", border: `1px solid ${brand}10`, borderBottomColor: `${brand}60`, animation: "pl-spin 2s linear infinite reverse" }}/>
              </>
            )}

            {cfg.style === "morph" && (
              <div style={{ position: "absolute", width: 100, height: 100, background: `linear-gradient(135deg, ${brand}40, ${brand}10)`, animation: "pl-morph 3s ease-in-out infinite", border: `1px solid ${brand}30` }}/>
            )}

            {cfg.style === "streak" && (
              <div style={{ position: "absolute", width: 120, height: 1, background: `linear-gradient(to right, transparent, ${brand}, transparent)`, animation: "pl-streak 1.4s ease-in-out infinite", overflow: "hidden" }}/>
            )}

            {cfg.style === "pulse" && (
              <>
                {[0,1,2].map(i => (
                  <div key={i} style={{ position: "absolute", width: 60 + i*28, height: 60 + i*28, borderRadius: "50%", border: `1px solid ${brand}${i===0?"60":i===1?"35":"15"}`, animation: `pl-pulse ${1.5+i*0.4}s ease-in-out ${i*0.2}s infinite` }}/>
                ))}
              </>
            )}

            {/* Center icon */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 60, height: 60, borderRadius: 16,
                background: `linear-gradient(135deg, ${brand}, ${brand}CC)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 32px ${brand}40`,
                position: "relative", zIndex: 1,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="white"/>
              </svg>
            </motion.div>
          </div>

          {/* Store name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 28, zIndex: 1 }}
          >
            <h2 style={{
              fontSize: "clamp(20px,4vw,30px)", fontWeight: 900,
              color: cfg.text, letterSpacing: "-0.04em",
              margin: "0 0 6px", fontFamily: "system-ui,sans-serif",
            }}>
              {storeName}
            </h2>
            <p style={{ fontSize: 11, color: brand, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, fontFamily: "system-ui,sans-serif" }}>
              Opening store
            </p>
          </motion.div>

          {/* Animation indicator */}
          {cfg.style === "bars" ? (
            <div style={{ display: "flex", gap: 5, alignItems: "center", height: 28 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{
                  width: 4, height: 28, borderRadius: 99,
                  background: brand,
                  animation: `pl-bar 0.8s ease-in-out ${i * 0.1}s infinite`,
                  transformOrigin: "center",
                }}/>
              ))}
            </div>
          ) : cfg.style === "dots" ? (
            <div style={{ display: "flex", gap: 8 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: brand, opacity: 0.4,
                  animation: `pl-dot 0.8s ease-in-out ${i * 0.15}s infinite`,
                }}/>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: brand, opacity: 0.4,
                  animation: `pl-dot 0.8s ease-in-out ${i * 0.15}s infinite`,
                }}/>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `${brand}12` }}>
            <motion.div
              initial={{ width: "0%", x: "-5%" }}
              animate={{ width: "105%" }}
              transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: "100%", background: `linear-gradient(to right, transparent, ${brand}, ${brand}CC, ${brand}40)` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function usePreloader(delay = 1800) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), delay);
    return () => clearTimeout(t);
  }, []);
  return show;
}
